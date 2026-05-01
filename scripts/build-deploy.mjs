import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "course.config.json");
const sourceDir = path.join(rootDir, "build", "slides");
const assetsDir = path.join(rootDir, "assets");
const themeSource = path.join(rootDir, "themes", "coubiac.css");
const publicDir = path.join(rootDir, "public");

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

async function findMarkdownFiles(dir) {
  const found = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        found.push(fullPath);
      }
    }
  }
  await walk(dir);
  return found;
}

function extractTitle(content, baseName) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const titleLine = fmMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (titleLine) return titleLine[1].trim();
  }
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return baseName;
}

// Normalize ../../assets/ (or deeper) to ../assets/ for files flattened in __tmp__/.
// Single-level ../assets/ is already correct from __tmp__/ and is left unchanged.
function normalizeAssetPaths(content) {
  return content.replace(/(?:\.\.\/){2,}assets\//g, "../assets/");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIndexHtml(courseTitle, courseSubtitle, files) {
  const items = files
    .map(
      ({ htmlName, title }) =>
        `      <li><a href="${htmlName}">${escapeHtml(title)}</a></li>`
    )
    .join("\n");

  const subtitleLine = courseSubtitle
    ? `\n    <p class="subtitle">${escapeHtml(courseSubtitle)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(courseTitle)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: "Aptos", "Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif;
      max-width: 680px;
      margin: 56px auto;
      padding: 0 24px;
      color: #172033;
      background: #f7f9fc;
    }
    h1 { font-size: 1.7rem; font-weight: 720; margin: 0 0 6px; }
    .subtitle { color: #5e6a7d; margin: 0 0 32px; font-size: 0.94rem; }
    ul { list-style: none; padding: 0; margin: 0; }
    li {
      margin-bottom: 8px;
      padding: 11px 16px;
      background: #fff;
      border: 1px solid #d9e0ea;
      border-radius: 6px;
    }
    a { color: #1457b8; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${escapeHtml(courseTitle)}</h1>${subtitleLine}
  <ul>
${items}
  </ul>
</body>
</html>
`;
}

const main = async () => {
  // ── Lecture course.config.json ────────────────────────────────────────────
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    console.error("[deploy:build] Impossible de lire course.config.json.");
    process.exitCode = 1;
    return;
  }

  if (!config.COURSE_SLUG) {
    console.error("[deploy:build] COURSE_SLUG manquant dans course.config.json.");
    process.exitCode = 1;
    return;
  }

  const { COURSE_SLUG, COURSE_TITLE = COURSE_SLUG, COURSE_SUBTITLE } = config;
  const slugDir = path.join(publicDir, COURSE_SLUG);
  const tmpDir = path.join(slugDir, "__tmp__");
  const themeTarget = path.join(tmpDir, "coubiac.deploy.css");

  // ── Recherche des fichiers Markdown dans build/slides/ ────────────────────
  let mdFiles;
  try {
    mdFiles = await findMarkdownFiles(sourceDir);
  } catch {
    console.error(
      "[deploy:build] Dossier build/slides/ introuvable.\n" +
      "  Exécutez npm run render avant npm run deploy:build."
    );
    process.exitCode = 1;
    return;
  }

  if (mdFiles.length === 0) {
    console.error(
      "[deploy:build] Aucun fichier .md trouvé dans build/slides/.\n" +
      "  Ajoutez des fichiers Markdown dans slides/ puis exécutez npm run render."
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\n[deploy:build] ${mdFiles.length} fichier(s) → public/${COURSE_SLUG}/`);

  // ── Initialisation du dossier de sortie ───────────────────────────────────
  await mkdir(tmpDir, { recursive: true });

  // ── Copie des assets ──────────────────────────────────────────────────────
  await cp(assetsDir, path.join(slugDir, "assets"), { recursive: true });
  console.log("[deploy:build] assets/ copié");

  // ── Copie du thème (normalisation des chemins) ────────────────────────────
  const cssRaw = await readFile(themeSource, "utf8");
  await writeFile(themeTarget, normalizeAssetPaths(cssRaw));
  console.log("[deploy:build] thème copié");

  // ── Export HTML par fichier ───────────────────────────────────────────────
  const published = [];
  let hasError = false;

  for (const mdPath of mdFiles) {
    const baseName = path.basename(mdPath, ".md");
    const htmlName = `${baseName}.html`;
    const tmpMd = path.join(tmpDir, `${baseName}.md`);
    const htmlOut = path.join(slugDir, htmlName);

    const raw = await readFile(mdPath, "utf8");
    const title = extractTitle(raw, baseName);
    await writeFile(tmpMd, normalizeAssetPaths(raw));

    const result = spawnSync(
      npx,
      ["marp", tmpMd, "--theme", themeTarget, "--html", "--allow-local-files", "-o", htmlOut],
      { cwd: rootDir, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );

    if (result.status === 0 && result.error == null) {
      console.log(`  ✓ ${baseName}.md → ${htmlName} « ${title} »`);
      published.push({ htmlName, title });
    } else {
      const msg = (result.stderr || "").trim() || result.error?.message || "erreur inconnue";
      console.error(`  ✗ ${baseName}.md — ${msg}`);
      hasError = true;
    }
  }

  // ── Nettoyage du dossier temporaire ──────────────────────────────────────
  await rm(tmpDir, { recursive: true, force: true });

  if (hasError) {
    process.exitCode = 1;
    return;
  }

  // ── Génération de l'index ─────────────────────────────────────────────────
  const indexPath = path.join(slugDir, "index.html");
  await writeFile(indexPath, buildIndexHtml(COURSE_TITLE, COURSE_SUBTITLE, published));
  console.log("[deploy:build] index.html généré");

  console.log(
    `\n[deploy:build] Terminé — ${published.length} support(s) dans public/${COURSE_SLUG}/`
  );
};

main().catch((err) => {
  console.error(`[deploy:build] ${err.message}`);
  process.exitCode = 1;
});
