import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();

const SKIP_DIRS = new Set([
  ".git",
  ".ignore",
  ".next",
  ".vercel",
  "coverage",
  "dist",
  "node_modules",
]);

const SKIP_FILES = new Set([
  "package-lock.json",
  "tsconfig.tsbuildinfo",
]);

const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".prisma",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
]);

const SUSPICIOUS_PATTERNS = [
  {
    label: "replacement character",
    pattern: /\ufffd/,
  },
  {
    label: "mojibake emoji prefix",
    pattern: /\u00f0\u0178/,
  },
  {
    label: "mojibake punctuation",
    pattern: /\u00e2[\u0080-\u00bf\u0152\u0153\u20ac\u2018-\u201d\u2020-\u2026]/,
  },
  {
    label: "mojibake latin prefix",
    pattern: /\u00c3[\u0080-\u00bf]/,
  },
  {
    label: "mojibake latin-1 marker",
    pattern: /\u00c2[\u00a0-\u00bf]/,
  },
  {
    label: "mojibake variation selector",
    pattern: /\u00ef\u00b8[\u0080-\u00bf]?/,
  },
];

function shouldScanFile(path, name) {
  if (name.startsWith(".env")) return false;
  if (SKIP_FILES.has(name)) return false;
  return TEXT_EXTENSIONS.has(extname(name).toLowerCase());
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;

    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      yield* walk(path);
      continue;
    }

    if (stats.isFile() && shouldScanFile(path, entry)) {
      yield path;
    }
  }
}

const findings = [];

for (const file of walk(ROOT)) {
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const { label, pattern } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          file: relative(ROOT, file).replaceAll("\\", "/"),
          line: index + 1,
          label,
          preview: line.trim().slice(0, 160),
        });
        break;
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Suspicious text encoding artifacts found:");
  for (const finding of findings) {
    console.error(
      `- ${finding.file}:${finding.line} [${finding.label}] ${finding.preview}`,
    );
  }
  console.error(
    "\nFix mojibake before committing. Common examples include corrupted emoji, smart punctuation, and middot characters.",
  );
  process.exit(1);
}

console.log("Text encoding check passed.");
