import { access, copyFile, mkdir, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "course.config.json");
const sourcePath = path.join(rootDir, "docs", "github-actions", "deploy-azure-blob.yml");
const targetDir = path.join(rootDir, ".github", "workflows");
const targetPath = path.join(targetDir, "deploy-azure-blob.yml");

const main = async () => {
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    console.error("[init:deploy] Impossible de lire course.config.json.");
    process.exitCode = 1;
    return;
  }

  const missing = ["COURSE_SLUG", "DEPLOY_SOURCE"].filter((k) => !config[k]);
  if (missing.length > 0) {
    console.error(
      `[init:deploy] Champs manquants dans course.config.json : ${missing.join(", ")}`
    );
    process.exitCode = 1;
    return;
  }

  const { COURSE_SLUG, DEPLOY_SOURCE } = config;

  try {
    await access(sourcePath);
  } catch {
    console.error(
      "[init:deploy] Fichier source introuvable : docs/github-actions/deploy-azure-blob.yml"
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(targetDir, { recursive: true });
  await copyFile(sourcePath, targetPath);

  console.log("");
  console.log("[init:deploy] Workflow activé :");
  console.log("  Source  : docs/github-actions/deploy-azure-blob.yml");
  console.log("  Cible   : .github/workflows/deploy-azure-blob.yml");
  console.log(`  Slug    : ${COURSE_SLUG}`);
  console.log(`  Entrée  : build/${DEPLOY_SOURCE}`);

  console.log("");
  console.log("[init:deploy] Secrets GitHub à créer (Settings › Secrets and variables › Actions › Secrets) :");
  console.log("  AZURE_CLIENT_ID");
  console.log("  AZURE_TENANT_ID");
  console.log("  AZURE_SUBSCRIPTION_ID");
  console.log("  AZURE_STORAGE_ACCOUNT");

  console.log("");
  console.log("[init:deploy] Variable GitHub à créer (Settings › Secrets and variables › Actions › Variables) :");
  console.log("  STATIC_WEBSITE_ENDPOINT");

  try {
    const remoteUrl = execSync("git remote get-url origin", {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/.]+?)(?:\.git)?$/);
    if (match) {
      const ownerRepo = match[1];
      console.log("");
      console.log("[init:deploy] Subject OIDC pour la federated credential Azure :");
      console.log(`  repo:${ownerRepo}:ref:refs/heads/main`);
    }
  } catch {
    console.log("");
    console.log(
      "[init:deploy] Remote GitHub non détecté — configurez la federated credential Azure manuellement."
    );
  }

  console.log("");
  console.log(
    "[init:deploy] Committez .github/workflows/deploy-azure-blob.yml puis poussez sur main pour activer le déploiement."
  );
  console.log("");
};

main().catch((error) => {
  console.error(`[init:deploy] ${error.message}`);
  process.exitCode = 1;
});
