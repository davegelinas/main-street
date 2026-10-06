#!/usr/bin/env node
// Scaffold a new customer site from the pristine template.
// Usage: node scripts/new-site.mjs <target-dir> [--force] [--no-git]
//
// Copies template/ to <target-dir>, names the package after the directory,
// and initializes a git repo (unless --no-git). Refuses to touch a
// non-empty directory without --force. Plain-language errors throughout:
// the person running this may be an agency dev or a curious owner.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";

const toolkitRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = resolve(toolkitRoot, "template");

function fail(msg) {
  console.error(`\nCould not create the site: ${msg}\n`);
  process.exit(1);
}

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist") continue;
    const p = resolve(dir, entry.name);
    if (entry.isDirectory()) n += countFiles(p);
    else if (entry.isFile()) n += 1;
  }
  return n;
}

function isEmptyDir(dir) {
  if (!existsSync(dir)) return true;
  const entries = readdirSync(dir).filter((e) => e !== ".git");
  return entries.length === 0;
}

const args = process.argv.slice(2);
const targetArg = args.find((a) => !a.startsWith("--"));
const force = args.includes("--force");
const noGit = args.includes("--no-git");

if (!targetArg) {
  console.log("Usage: node scripts/new-site.mjs <target-dir> [--force] [--no-git]");
  console.log("\nCopies the pristine site template into <target-dir> and sets it up as a new project.");
  console.log("Your site lives NEXT TO the toolkit, not inside it. Example:");
  console.log("  node scripts/new-site.mjs ../acme-plumbing");
  console.log("Refuses to overwrite a non-empty directory unless you pass --force.");
  process.exit(0);
}

if (!existsSync(templateDir) || !statSync(templateDir).isDirectory()) {
  fail(`the template folder is missing (${templateDir}). This toolkit copy looks damaged. Re-download it.`);
}

const targetDir = resolve(process.cwd(), targetArg);

// The site must live next to the toolkit, never inside it. Nesting it here
// would mix the customer site into the toolkit repo and break the two-repo model.
if (targetDir === toolkitRoot || targetDir.startsWith(toolkitRoot + sep)) {
  fail(`"${targetArg}" is inside the toolkit folder. Your site needs its own folder next to the toolkit, not inside it, so it can become its own GitHub repo later and the toolkit stays pristine for the next site. Run this instead: node scripts/new-site.mjs ../${basename(targetDir)}`);
}

if (existsSync(targetDir) && !isEmptyDir(targetDir) && !force) {
  fail(`"${targetArg}" already exists and is not empty. Pick an empty folder, or re-run with --force to overwrite it.`);
}

try {
  mkdirSync(targetDir, { recursive: true });
} catch {
  fail(`could not create "${targetArg}". Check that the location is writable.`);
}

// Copy the template (never bring across a .git, node_modules, or dist).
const expected = countFiles(templateDir);
try {
  cpSync(templateDir, targetDir, {
    recursive: true,
    filter: (src) => {
      const base = basename(src);
      return base !== ".git" && base !== "node_modules" && base !== "dist";
    },
  });
} catch {
  fail(`the copy was interrupted partway. Delete "${targetArg}" and try again.`);
}

// Verify the copy landed completely.
const actual = countFiles(targetDir);
if (actual < expected) {
  fail(`only ${actual} of ${expected} files were copied. Delete "${targetArg}" and try again.`);
}

// Name the package after the directory (npm-safe).
const pkgPath = resolve(targetDir, "package.json");
try {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.name = basename(targetDir).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "") || "my-business-site";
  pkg.version = "1.0.0";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
} catch {
  fail(`the copy worked but package.json could not be updated in "${targetArg}". You can rename it by hand later.`);
}

// Initialize git unless asked not to (or already a repo).
let gitOk = false;
if (!noGit) {
  try {
    execSync("git init", { cwd: targetDir, stdio: "ignore" });
    execSync("git add -A", { cwd: targetDir, stdio: "ignore" });
    gitOk = true;
  } catch {
    console.log("\nNote: could not initialize a git repo here. You can run `git init` in the folder later.");
  }
}

console.log(`\nDone! Your new site is ready at ${targetDir}`);
console.log(`  ${actual} files copied and verified.`);
if (gitOk) {
  console.log("  Git repository initialized with everything staged.");
  // First commit needs a git identity; most new machines don't have one yet.
  try {
    execSync("git config user.name", { cwd: targetDir, stdio: "ignore" });
  } catch {
    console.log("\n  One-time git setup (so you can save versions of your site):");
    console.log('    git config user.name "Your Name"');
    console.log('    git config user.email "you@example.com"');
    console.log("  Then step 5 below can save your first version.");
  }
}
console.log("\nNext steps (each takes a few minutes):");
console.log("  1. cd " + targetArg);
console.log("  2. npm install        (downloads the build tools, one time only)");
console.log("  3. npm run setup      (the friendly wizard: your business details)");
console.log("  4. npm run dev        (see your site at http://localhost:5173)");
console.log("  5. git add -A && git commit -m \"First version of the site\"   (saves the wizard's answers)");
console.log("\nWhen it looks right, follow docs/setup-guide.md inside your new site");
console.log("(\"For helpers who prefer a terminal\"), in the owner's own accounts.");
console.log("\nThe golden rule: every change gets its own preview link first,");
console.log("you look at it on your phone, and only then say \"ship it\".\n");
