import { access, copyFile, mkdir, readFile } from "node:fs/promises";
import { execSync, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "course.config.json");
const envPath = path.join(rootDir, ".deploy.local.env");
const workflowSource = path.join(rootDir, "docs", "github-actions", "deploy-azure-blob.yml");
const workflowDir = path.join(rootDir, ".github", "workflows");
const workflowTarget = path.join(workflowDir, "deploy-azure-blob.yml");

const REQUIRED_ENV_KEYS = [
  "AZURE_CLIENT_ID",
  "AZURE_TENANT_ID",
  "AZURE_SUBSCRIPTION_ID",
  "AZURE_STORAGE_ACCOUNT",
  "STATIC_WEBSITE_ENDPOINT",
  "AZURE_RESOURCE_GROUP",
  "AZURE_IDENTITY_NAME",
];

// Derive a unique, Azure-compatible federated credential name from owner/repo.
// Azure constraints: lowercase alphanumeric and hyphens, max 120 chars.
function makeFederatedCredentialName(ownerRepo) {
  return ownerRepo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function parseEnvFile(content) {
  const result = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return result;
}

function run(cmd, args, { input } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: rootDir,
    encoding: "utf8",
    input,
    stdio: ["pipe", "pipe", "pipe"],
  });
  return {
    ok: result.status === 0 && result.error == null,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
    notFound: result.error?.code === "ENOENT",
  };
}

function detectOwnerRepo() {
  try {
    const url = execSync("git remote get-url origin", {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    const match = url.match(/github\.com[:/]([^/]+\/[^/.]+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const main = async () => {
  // ── Lecture course.config.json ────────────────────────────────────────────
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    console.error("[setup:deploy] Impossible de lire course.config.json.");
    process.exitCode = 1;
    return;
  }

  if (!config.COURSE_SLUG) {
    console.error("[setup:deploy] COURSE_SLUG manquant dans course.config.json.");
    process.exitCode = 1;
    return;
  }

  const { COURSE_SLUG } = config;

  // ── Lecture .deploy.local.env ─────────────────────────────────────────────
  let env;
  try {
    env = parseEnvFile(await readFile(envPath, "utf8"));
  } catch {
    console.error(
      "[setup:deploy] Fichier .deploy.local.env introuvable.\n" +
      "  Créez ce fichier à la racine du dépôt (il est ignoré par git) :\n\n" +
      "  AZURE_CLIENT_ID=\n" +
      "  AZURE_TENANT_ID=\n" +
      "  AZURE_SUBSCRIPTION_ID=\n" +
      "  AZURE_STORAGE_ACCOUNT=\n" +
      "  STATIC_WEBSITE_ENDPOINT=\n" +
      "  AZURE_RESOURCE_GROUP=\n" +
      "  AZURE_IDENTITY_NAME=\n" +
      "  # GITHUB_BRANCH=main  (optionnel, 'main' par défaut)"
    );
    process.exitCode = 1;
    return;
  }

  const missingEnv = REQUIRED_ENV_KEYS.filter((k) => !env[k]);
  if (missingEnv.length > 0) {
    console.error(
      `[setup:deploy] Variables manquantes dans .deploy.local.env : ${missingEnv.join(", ")}`
    );
    process.exitCode = 1;
    return;
  }

  // ── Détection owner/repo ──────────────────────────────────────────────────
  const ownerRepo = detectOwnerRepo();
  if (!ownerRepo) {
    console.error(
      "[setup:deploy] Remote GitHub non détecté.\n" +
      "  Vérifiez que le dépôt a un remote 'origin' pointant vers GitHub."
    );
    process.exitCode = 1;
    return;
  }

  const branch = env.GITHUB_BRANCH || "main";
  const oidcSubject = `repo:${ownerRepo}:ref:refs/heads/${branch}`;

  console.log("");
  console.log(`[setup:deploy] Dépôt   : ${ownerRepo}`);
  console.log(`[setup:deploy] Branche : ${branch}`);
  console.log(`[setup:deploy] Slug    : ${COURSE_SLUG}`);
  console.log("[setup:deploy] Sources : tous les fichiers build/slides/*.md");
  console.log(`[setup:deploy] Subject : ${oidcSubject}`);

  // ── Vérification des outils requis ────────────────────────────────────────
  const ghCheck = run("gh", ["--version"]);
  if (ghCheck.notFound) {
    console.error(
      "\n[setup:deploy] 'gh' CLI introuvable. Installez GitHub CLI : https://cli.github.com"
    );
    process.exitCode = 1;
    return;
  }

  const ghAuth = run("gh", ["auth", "status"]);
  if (!ghAuth.ok) {
    console.error(
      "\n[setup:deploy] 'gh' CLI non authentifié. Exécutez : gh auth login"
    );
    process.exitCode = 1;
    return;
  }

  const azCheck = run("az", ["--version"]);
  if (azCheck.notFound) {
    console.error(
      "\n[setup:deploy] 'az' CLI introuvable. Installez Azure CLI : https://aka.ms/installazurecli"
    );
    process.exitCode = 1;
    return;
  }

  const azAccount = run("az", ["account", "show"]);
  if (!azAccount.ok) {
    console.error(
      "\n[setup:deploy] 'az' CLI non authentifié. Exécutez : az login"
    );
    process.exitCode = 1;
    return;
  }

  let hasError = false;

  // ── Copie du workflow ─────────────────────────────────────────────────────
  console.log("");
  try {
    await access(workflowTarget);
    console.log("[setup:deploy] Workflow : déjà présent (.github/workflows/deploy-azure-blob.yml)");
  } catch {
    try {
      await access(workflowSource);
    } catch {
      console.error(
        "[setup:deploy] Fichier source introuvable : docs/github-actions/deploy-azure-blob.yml"
      );
      process.exitCode = 1;
      return;
    }
    await mkdir(workflowDir, { recursive: true });
    await copyFile(workflowSource, workflowTarget);
    console.log("[setup:deploy] Workflow : copié → .github/workflows/deploy-azure-blob.yml");
  }

  // ── Secrets GitHub ────────────────────────────────────────────────────────
  console.log("");
  console.log("[setup:deploy] Secrets GitHub :");

  const secretKeys = [
    "AZURE_CLIENT_ID",
    "AZURE_TENANT_ID",
    "AZURE_SUBSCRIPTION_ID",
    "AZURE_STORAGE_ACCOUNT",
  ];

  for (const key of secretKeys) {
    const result = run("gh", ["secret", "set", key, "--repo", ownerRepo], { input: env[key] });
    if (result.ok) {
      console.log(`  ✓ ${key}`);
    } else {
      console.error(`  ✗ ${key} — ${result.stderr}`);
      hasError = true;
    }
  }

  // ── Variable GitHub ───────────────────────────────────────────────────────
  console.log("");
  console.log("[setup:deploy] Variables GitHub :");

  const varResult = run("gh", [
    "variable", "set", "STATIC_WEBSITE_ENDPOINT",
    "--body", env.STATIC_WEBSITE_ENDPOINT,
    "--repo", ownerRepo,
  ]);
  if (varResult.ok) {
    console.log("  ✓ STATIC_WEBSITE_ENDPOINT");
  } else {
    console.error(`  ✗ STATIC_WEBSITE_ENDPOINT — ${varResult.stderr}`);
    hasError = true;
  }

  // ── Federated credential Azure ────────────────────────────────────────────
  console.log("");
  console.log("[setup:deploy] Federated credential Azure :");

  const credName = makeFederatedCredentialName(ownerRepo);
  const azResult = run("az", [
    "identity", "federated-credential", "create",
    "--identity-name", env.AZURE_IDENTITY_NAME,
    "--resource-group", env.AZURE_RESOURCE_GROUP,
    "--name", credName,
    "--issuer", "https://token.actions.githubusercontent.com",
    "--subject", oidcSubject,
    "--audiences", "api://AzureADTokenExchange",
  ]);

  if (azResult.ok) {
    console.log(`  ✓ '${credName}' créée sur ${env.AZURE_IDENTITY_NAME}`);
  } else if (azResult.stderr.toLowerCase().includes("already exist")) {
    console.log(`  ~ '${credName}' déjà présente — ignorée`);
    console.log(`    Vérifiez que le subject configuré correspond bien à : ${oidcSubject}`);
  } else {
    console.error(`  ✗ az identity federated-credential create — ${azResult.stderr}`);
    hasError = true;
  }

  // ── Résumé ────────────────────────────────────────────────────────────────
  console.log("");
  if (hasError) {
    console.error("[setup:deploy] Configuration terminée avec des erreurs. Vérifiez les messages ci-dessus.");
    process.exitCode = 1;
    return;
  }

  const endpoint = env.STATIC_WEBSITE_ENDPOINT.replace(/\/$/, "");
  const siteUrl = `${endpoint}/${COURSE_SLUG}/`;

  console.log("[setup:deploy] Configuration terminée.");
  console.log(`  Dépôt    : https://github.com/${ownerRepo}`);
  console.log(`  Subject  : ${oidcSubject}`);
  console.log(`  URL site : ${siteUrl}`);
  console.log("");
  console.log(
    "[setup:deploy] Committez .github/workflows/deploy-azure-blob.yml puis poussez sur main."
  );
  console.log("");
};

main().catch((err) => {
  console.error(`[setup:deploy] ${err.message}`);
  process.exitCode = 1;
});
