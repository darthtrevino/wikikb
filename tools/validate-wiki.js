#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "wiki-mirror";

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === ".git" ? [] : walk(full);
    return entry.isFile() && entry.name.endsWith(".md") ? [full] : [];
  });
}

function normalizeRel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function normalizeLink(raw) {
  const trimmed = raw.trim().replace(/^\/+/, "").replace(/\.md$/i, "");
  return `${trimmed}.md`;
}

function conceptKey(rel) {
  return path.basename(rel, ".md").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const files = walk(root);
const rels = new Set(files.map(normalizeRel));
const errors = [];
const warnings = [];

for (const required of ["Home.md", "_Index.md", "_Sidebar.md"]) {
  if (!rels.has(required)) errors.push(`Missing required wiki page: ${required}`);
}
if (![...rels].some((rel) => rel.startsWith("_index/"))) {
  errors.push("Missing _index/ sub-index pages");
}

const inbound = new Map([...rels].map((rel) => [rel, 0]));
for (const file of files) {
  const rel = normalizeRel(file);
  const body = fs.readFileSync(file, "utf8");
  for (const match of body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) {
    const target = normalizeLink(match[1]);
    if (rels.has(target)) inbound.set(target, (inbound.get(target) || 0) + 1);
    else errors.push(`Broken wikilink: ${rel} -> [[${match[1]}]]`);
  }
}

for (const [rel, count] of inbound.entries()) {
  if (count === 0 && !rel.startsWith("_") && rel !== "Home.md") {
    warnings.push(`Orphan page: ${rel}`);
  }
}

const conceptKeys = new Map();
for (const rel of rels) {
  if (!rel.startsWith("concepts/")) continue;
  const key = conceptKey(rel);
  if (!conceptKeys.has(key)) conceptKeys.set(key, []);
  conceptKeys.get(key).push(rel);
}
for (const matches of conceptKeys.values()) {
  if (matches.length > 1) errors.push(`Duplicate normalized concept slug: ${matches.join(", ")}`);
}

if (errors.length || warnings.length) {
  for (const warning of warnings) console.error(`warning: ${warning}`);
  for (const error of errors) console.error(`error: ${error}`);
}

console.log(`Wiki pages: ${files.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Errors: ${errors.length}`);

if (errors.length) process.exitCode = 1;
