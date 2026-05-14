import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "course.config.json");
const buildDir = path.join(rootDir, "build");
const sourceRoots = ["slides", "examples"];
const tokenPattern = /\{\{([A-Z0-9_]+)\}\}/g;

const readJson = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const resolveConfig = (config) => {
  const resolved = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, String(value)])
  );

  for (let pass = 0; pass < 10; pass += 1) {
    let changed = false;

    for (const [key, value] of Object.entries(resolved)) {
      const next = value.replace(tokenPattern, (match, token) => {
        if (Object.hasOwn(resolved, token)) return resolved[token];
        return match;
      });

      if (next !== value) {
        resolved[key] = next;
        changed = true;
      }
    }

    if (!changed) return resolved;
  }

  throw new Error("Circular variable reference detected in course.config.json.");
};

const renderContent = (content, variables, sourcePath) =>
  content.replace(tokenPattern, (match, token) => {
    if (Object.hasOwn(variables, token)) return variables[token];
    console.warn(`[render] Unknown variable ${match} in ${sourcePath}`);
    return match;
  });

const collectMarkdownFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
};

const renderRoot = async (sourceRoot, variables) => {
  const sourceDir = path.join(rootDir, sourceRoot);

  try {
    await readdir(sourceDir);
  } catch {
    return [];
  }

  const markdownFiles = await collectMarkdownFiles(sourceDir);
  const renderedFiles = [];

  for (const sourcePath of markdownFiles) {
    const relativePath = path.relative(sourceDir, sourcePath);
    const targetPath = path.join(buildDir, sourceRoot, relativePath);
    const content = await readFile(sourcePath, "utf8");
    const rendered = renderContent(content, variables, sourcePath);

    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, rendered, "utf8");
    renderedFiles.push(path.relative(rootDir, targetPath));
  }

  return renderedFiles;
};

const main = async () => {
  const config = await readJson(configPath);
  const variables = resolveConfig(config);

  await rm(buildDir, { recursive: true, force: true });
  await mkdir(buildDir, { recursive: true });

  const renderedFiles = [];

  for (const sourceRoot of sourceRoots) {
    renderedFiles.push(...(await renderRoot(sourceRoot, variables)));
  }

  if (renderedFiles.length === 0) {
    throw new Error("No Markdown files found in slides/ or examples/.");
  }

  console.log(`[render] Rendered ${renderedFiles.length} file(s):`);
  for (const file of renderedFiles) {
    console.log(`[render] - ${file}`);
  }

  const assetsSource = path.join(rootDir, "assets");
  const assetsTarget = path.join(buildDir, "assets");
  try {
    await cp(assetsSource, assetsTarget, { recursive: true });
    console.log("[render] Copied assets/ → build/assets/");
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
};

main().catch((error) => {
  console.error(`[render] ${error.message}`);
  process.exitCode = 1;
});
