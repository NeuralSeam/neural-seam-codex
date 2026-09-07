#!/usr/bin/env node
// Static gate for this bundle. Nothing here compiles and no suite runs it, so without
// these checks the first thing to find a broken file is the Codex CLI, on a developer's
// machine, usually in silence.
//
// The manifest and .mcp.json rules mirror the bundled plugin-creator validator: the
// `validate_plugin.py` that the CLI's own `plugin-creator` system skill materialises inside
// CODEX_HOME. They were checked by running it against this bundle on codex-cli 0.153.4, and
// against probe plugins built to fail each rule. That validator is an authoring helper, not
// the gate behind OpenAI's public portal, and COMPATIBILITY.md says so where it matters.
//
// This is a copy of someone else's contract, so re-check it when the CLI releases. Where the
// validator and the published documentation disagree, the rules here follow the validator,
// because that is what actually gates publication. The disagreements are recorded in
// README.md under "What was measured about the plugin format".
//
// What is deliberately NOT here: any screening for identifiers belonging to the repository
// this content is authored in. That runs upstream, before content reaches this repository.
// A public check whose pattern list *is* the thing it hides publishes it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN_DIR = path.join(ROOT, "plugins", "neural-seam");
const MARKETPLACE = path.join(ROOT, ".agents", "plugins", "marketplace.json");
const MANIFEST = path.join(PLUGIN_DIR, ".codex-plugin", "plugin.json");
const MCP_FILE = path.join(PLUGIN_DIR, ".mcp.json");
const SKILLS_DIR = path.join(PLUGIN_DIR, "skills");

const errors = [];
const rel = p => path.relative(ROOT, p).split(path.sep).join("/");
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

// The validator's allowed_keys, verbatim. `hooks` is absent because the validator omits it,
// not because hooks are impossible: a plugin may carry `hooks/hooks.json`, which the
// validator accepts. Only the manifest *field* is rejected, and the published documentation
// says otherwise, so a contributor who copies the documented example is told what happens.
const MANIFEST_KEYS = new Set(["id", "name", "version", "description", "skills", "apps",
  "mcpServers", "interface", "author", "homepage", "repository", "license", "keywords"]);
const INTERFACE_KEYS = new Set(["displayName", "shortDescription", "longDescription",
  "developerName", "category", "capabilities", "websiteURL", "privacyPolicyURL",
  "termsOfServiceURL", "brandColor", "composerIcon", "logo", "logoDark", "screenshots",
  "defaultPrompt", "default_prompt"]);
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const IDENTIFIER = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

// Skills that write: to disk, to the backend, or to the developer's environment. Each must
// refuse implicit invocation, so the model cannot pick it up on its own. Read-only skills
// stay discoverable, otherwise nothing could offer the entry point.
const MUTATING_SKILLS = new Set(["ns-connect", "ns-clone", "ns-doctor", "ns-generate", "ns-exec"]);

function readJson(file) {
  if (!fs.existsSync(file)) { fail(rel(file), "missing"); return null; }
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { fail(rel(file), `invalid JSON: ${e.message}`); return null; }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------- manifest

const manifest = readJson(MANIFEST);
if (manifest) {
  const w = rel(MANIFEST);
  for (const key of Object.keys(manifest)) {
    if (MANIFEST_KEYS.has(key)) continue;
    const hint = key === "hooks"
      ? " -- the published documentation shows this field, but the bundled plugin-creator validator refuses it. A plugin that needs hooks carries hooks/hooks.json instead. This bundle ships none: the runtime owns them."
      : "";
    fail(w, `field \`${key}\` is not accepted by plugin validation${hint}`);
  }
  for (const key of ["name", "version", "description"]) {
    if (typeof manifest[key] !== "string" || !manifest[key].trim()) fail(w, `\`${key}\` must be a non-empty string`);
  }
  if (typeof manifest.name === "string" && !IDENTIFIER.test(manifest.name)) {
    fail(w, "`name` may only contain ASCII letters, digits, `.`, `_` and `-`");
  }
  if (typeof manifest.version === "string" && !SEMVER.test(manifest.version)) {
    fail(w, `\`version\` must be strict semver (got ${JSON.stringify(manifest.version)})`);
  }
  if (typeof manifest.author !== "object" || manifest.author === null) {
    fail(w, "`author` must be an object");
  } else {
    for (const key of Object.keys(manifest.author)) {
      if (!["name", "email", "url"].includes(key)) fail(w, `\`author.${key}\` is not accepted by plugin validation`);
    }
    if (!manifest.author.name?.trim()) fail(w, "`author.name` must be a non-empty string");
    if (manifest.author.url && !/^https:\/\/.+/.test(manifest.author.url)) fail(w, "`author.url` must be an absolute https URL");
  }
  if (manifest.skills !== undefined && manifest.skills.replace(/^\.\//, "").replace(/\/$/, "") !== "skills") {
    fail(w, "`skills` must resolve to `skills`");
  }
  if (typeof manifest.mcpServers === "string" && manifest.mcpServers.replace(/^\.\//, "") !== ".mcp.json") {
    fail(w, "`mcpServers` must resolve to `.mcp.json`");
  }

  const iface = manifest.interface;
  if (typeof iface !== "object" || iface === null) {
    fail(w, "`interface` must be an object");
  } else {
    for (const key of Object.keys(iface)) {
      if (!INTERFACE_KEYS.has(key)) fail(w, `\`interface.${key}\` is not accepted by plugin validation`);
    }
    for (const key of ["displayName", "shortDescription", "longDescription", "developerName", "category"]) {
      if (typeof iface[key] !== "string" || !iface[key].trim()) fail(w, `\`interface.${key}\` must be a non-empty string`);
    }
    if (!Array.isArray(iface.capabilities) || !iface.capabilities.every(c => typeof c === "string" && c.trim())) {
      fail(w, "`interface.capabilities` must be an array of non-empty strings");
    }
    for (const key of ["websiteURL", "privacyPolicyURL", "termsOfServiceURL"]) {
      if (iface[key] !== undefined && !/^https:\/\/.+/.test(iface[key])) fail(w, `\`interface.${key}\` must be an absolute https URL`);
    }
    if (iface.brandColor !== undefined && !HEX_COLOR.test(iface.brandColor)) fail(w, "`interface.brandColor` must be `#RRGGBB`");
    const prompts = iface.defaultPrompt ?? iface.default_prompt;
    if (!Array.isArray(prompts) || prompts.length === 0) {
      fail(w, "`interface.defaultPrompt` is required and must be a non-empty array");
    } else {
      // Entries past the third are dropped by the host and a long one is truncated, so a
      // manifest that relies on them ships a promise the UI does not keep.
      if (prompts.length > 3) fail(w, `\`interface.defaultPrompt\` has ${prompts.length} entries; only the first 3 are shown`);
      prompts.forEach((p, i) => {
        if (typeof p !== "string" || !p.trim()) fail(w, `\`interface.defaultPrompt[${i}]\` must be a non-empty string`);
        else if (p.length > 128) fail(w, `\`interface.defaultPrompt[${i}]\` is ${p.length} chars; the host truncates at 128`);
      });
    }
    for (const key of ["composerIcon", "logo", "logoDark"]) {
      if (iface[key] && !fs.existsSync(path.join(PLUGIN_DIR, iface[key]))) fail(w, `\`interface.${key}\` points to a missing file`);
    }
    for (const [i, s] of (iface.screenshots ?? []).entries()) {
      if (!fs.existsSync(path.join(PLUGIN_DIR, s))) fail(w, `\`interface.screenshots[${i}]\` points to a missing file`);
    }
  }
}

// ---------------------------------------------------------------- MCP registration

// The shape here is `{"mcpServers": {...}}`, and that is the only shape that both loads and
// passes publication. Measured on 0.153.4, all three candidates:
//
//   {"mcpServers": {...}}   loads, and the bundled validator accepts it   <- what we ship
//   {"<name>": {...}}       loads, but the bundled validator refuses it
//   {"mcp_servers": {...}}  does NOT load, silently, and is rejected too
//
// The last two both appear in the published documentation as the supported formats. The
// direct map costs publication; the snake_case wrapper registers nothing at all and reports
// no error while doing it, which is the worst of the three to ship by accident.
const mcp = readJson(MCP_FILE);
if (mcp) {
  const w = rel(MCP_FILE);
  for (const key of Object.keys(mcp)) {
    if (key === "mcp_servers") {
      fail(w, "top-level key `mcp_servers` registers no server on this host and reports no error. Use `mcpServers`");
    } else if (key !== "mcpServers") {
      fail(w, `field \`${key}\` is not accepted by plugin validation; servers belong under \`mcpServers\``);
    }
  }
  if (typeof mcp.mcpServers !== "object" || mcp.mcpServers === null) {
    fail(w, "`mcpServers` must be an object");
  } else {
    for (const [name, server] of Object.entries(mcp.mcpServers)) {
      if (typeof server !== "object" || server === null) { fail(w, `server \`${name}\` must be an object`); continue; }
      // Measured: the host discards this key from a plugin's .mcp.json. Shipping it would
      // read as "the bundle approves its own tools", which is exactly what it cannot do.
      if ("default_tools_approval_mode" in server) {
        fail(w, `server \`${name}\` declares \`default_tools_approval_mode\`, which this host discards from a plugin. Tool approval lives in the developer's own configuration`);
      }
    }
  }
}

// ---------------------------------------------------------------- marketplace

const market = readJson(MARKETPLACE);
if (market) {
  const w = rel(MARKETPLACE);
  if (!market.name?.trim()) fail(w, "`name` must be a non-empty string");
  else if (!/^[A-Za-z0-9_-]+$/.test(market.name)) fail(w, "`name` may only contain ASCII letters, digits, `_` and `-`");
  if (!Array.isArray(market.plugins) || market.plugins.length === 0) {
    fail(w, "`plugins` must be a non-empty array");
  } else {
    for (const [i, entry] of market.plugins.entries()) {
      const at = `plugins[${i}]`;
      if (!entry.name?.trim()) fail(w, `${at}.name must be a non-empty string`);
      if (entry.source?.source !== "local") fail(w, `${at}.source.source must be "local"`);
      if (!entry.source?.path) fail(w, `${at}.source.path is required`);
      else if (!fs.existsSync(path.join(ROOT, entry.source.path))) fail(w, `${at}.source.path points to a missing directory`);
      if (!["NOT_AVAILABLE", "AVAILABLE", "INSTALLED_BY_DEFAULT"].includes(entry.policy?.installation)) {
        fail(w, `${at}.policy.installation must be NOT_AVAILABLE, AVAILABLE or INSTALLED_BY_DEFAULT`);
      }
      if (!["ON_INSTALL", "ON_USE"].includes(entry.policy?.authentication)) {
        fail(w, `${at}.policy.authentication must be ON_INSTALL or ON_USE`);
      }
      if (!entry.category?.trim()) fail(w, `${at}.category is required`);
      // The runtime derives the install reference from `<plugin>@<marketplace>`, so a
      // rename on one side and not the other breaks detection in silence.
      if (manifest && entry.name && entry.name !== manifest.name) {
        fail(w, `${at}.name is "${entry.name}" but the manifest declares "${manifest.name}"`);
      }
    }
  }
}

// ---------------------------------------------------------------- skills

const skillDirs = fs.existsSync(SKILLS_DIR)
  ? fs.readdirSync(SKILLS_DIR, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith(".")).map(e => e.name)
  : [];
if (skillDirs.length === 0) fail(rel(SKILLS_DIR), "no skills found");

for (const name of skillDirs) {
  const skillMd = path.join(SKILLS_DIR, name, "SKILL.md");
  const w = rel(skillMd);
  if (!fs.existsSync(skillMd)) { fail(rel(path.join(SKILLS_DIR, name)), "missing SKILL.md"); continue; }
  const body = fs.readFileSync(skillMd, "utf8");
  if (!body.startsWith("---\n")) { fail(w, "must start with YAML frontmatter"); continue; }
  const end = body.indexOf("\n---", 4);
  if (end === -1) { fail(w, "frontmatter is not closed"); continue; }
  const front = body.slice(4, end);
  const field = key => {
    const m = front.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  };
  const declared = field("name");
  if (!declared) fail(w, "frontmatter `name` must be non-empty");
  else if (declared !== name) fail(w, `frontmatter \`name\` is "${declared}" but the directory is "${name}"`);
  if (!field("description")) fail(w, "frontmatter `description` must be non-empty");
  if (/^disable[-_]model[-_]invocation:\s*true/m.test(front)) fail(w, "`disable-model-invocation` must be false");

  const agentYaml = path.join(SKILLS_DIR, name, "agents", "openai.yaml");
  const hasAgent = fs.existsSync(agentYaml);
  if (hasAgent) {
    const y = fs.readFileSync(agentYaml, "utf8");
    const wy = rel(agentYaml);
    // Top-level mapping keys only: a line that starts in column 0 and reads `key:`.
    // Comments and blank lines are neither, and treating them as keys made this check
    // reject a perfectly valid file.
    for (const line of y.split("\n")) {
      if (!/^\S/.test(line) || line.startsWith("#")) continue;
      const key = line.match(/^([A-Za-z_][\w-]*)\s*:/)?.[1];
      if (!key) { fail(wy, `line is not a top-level mapping key: ${JSON.stringify(line.slice(0, 60))}`); continue; }
      if (!["interface", "policy", "dependencies"].includes(key)) fail(wy, `top-level key \`${key}\` is not accepted by plugin validation`);
    }
    for (const key of ["display_name", "short_description"]) {
      if (!new RegExp(`^\\s+${key}:\\s*\\S`, "m").test(y)) fail(wy, `\`interface.${key}\` must be non-empty`);
    }
    const implicit = y.match(/^\s+allow_implicit_invocation:\s*(\S+)/m)?.[1];
    if (implicit !== undefined && !["true", "false"].includes(implicit)) fail(wy, "`policy.allow_implicit_invocation` must be a boolean");
    for (const t of y.match(/^\s+- type:\s*"?([a-z]+)"?/gm) ?? []) {
      const kind = t.match(/type:\s*"?([a-z]+)"?/)[1];
      if (!["cli", "mcp"].includes(kind)) fail(wy, `dependency \`type: ${kind}\` is not one this host declares (expected cli or mcp)`);
    }
    if (MUTATING_SKILLS.has(name) && implicit !== "false") {
      fail(wy, `${name} writes, so it must declare \`policy.allow_implicit_invocation: false\``);
    }
    // The other half of the same decision. A read-only skill that quietly opts out of
    // implicit discovery removes the only way a developer is offered the entry point,
    // and nothing else in this repository would notice.
    if (!MUTATING_SKILLS.has(name) && implicit === "false") {
      fail(wy, `${name} does not write, so it should stay implicitly discoverable. Either drop \`allow_implicit_invocation: false\` or add ${name} to MUTATING_SKILLS with a reason`);
    }
  } else {
    // Every skill carries this file, so the documentation can say "one per skill" without
    // a footnote. It is also the only place the invocation policy can be declared.
    fail(rel(path.join(SKILLS_DIR, name)), "missing agents/openai.yaml; every skill declares its interface, and a writing skill declares its invocation policy there");
  }
}

// ---------------------------------------------------------------- content rules

// The manifest carries the version this host installs, and the changelog is what a reader
// trusts. Two sources, so they drift: a bumped manifest with no entry ships a version whose
// changes nobody wrote down, and an entry with no bump ships the previous plugin.
if (manifest?.version) {
  const changelog = fs.existsSync(path.join(ROOT, "CHANGELOG.md"))
    ? fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8") : "";
  const latest = changelog.match(/^##\s*\[([^\]]+)\]/m)?.[1];
  if (!latest) fail("CHANGELOG.md", "no `## [version]` entry found");
  else if (latest !== manifest.version) {
    fail("CHANGELOG.md", `newest entry is [${latest}] but the manifest declares ${manifest.version}`);
  }
}

const REQUIRED_FILES = ["LICENSE", "README.md", "README.pt-BR.md", "CHANGELOG.md",
  "COMPATIBILITY.md", "SECURITY.md", "SUPPORT.md", "PRIVACY.md", "CONTRIBUTING.md",
  "TRADEMARKS.md", ".github/CODEOWNERS"];
for (const f of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(ROOT, f))) fail(f, "required file is missing");
}

// The 0.2.0 cleanup command, in both shells. A reader pastes these, so a broken one is
// worse than none: it deletes the wrong thing or nothing at all.
//
// The PowerShell form has shipped broken once already. Its path contains `\n`, and a tool
// that expands escapes while writing the file turns that into a real newline, splitting the
// command across two lines and leaving `s-*.md` on its own. It renders as valid markdown,
// so nothing downstream notices.
for (const doc of ["README.md", "README.pt-BR.md"]) {
  const p = path.join(ROOT, doc);
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, "utf8").split("\n");
  const psLines = lines.filter(l => l.includes("Remove-Item"));
  if (psLines.length === 0) fail(doc, "the PowerShell cleanup command for 0.2.0 prompt files is missing");
  for (const line of psLines) {
    if (!/Remove-Item\s+"\$HOME\\\.codex\\prompts\\ns-\*\.md"/.test(line)) {
      fail(doc, `PowerShell cleanup command is malformed, most likely split across lines by an escape: ${JSON.stringify(line.slice(0, 80))}`);
    }
  }
  if (!lines.some(l => /rm -f ~\/\.codex\/prompts\/ns-\*\.md/.test(l))) {
    fail(doc, "the Unix cleanup command for 0.2.0 prompt files is missing");
  }
  // A lone `s-*.md` is the visible residue of the split above.
  if (lines.some(l => /^\s*s-\*\.md/.test(l))) fail(doc, "found a stray `s-*.md` line: a cleanup command was split by an unescaped backslash-n");
}

const textFiles = walk(ROOT).filter(p => /\.(md|json|ya?ml)$/.test(p) && !rel(p).startsWith("scripts/"));

for (const file of textFiles) {
  const text = fs.readFileSync(file, "utf8");
  const w = rel(file);
  text.split("\n").forEach((line, i) => {
    const at = `${w}:${i + 1}`;
    // The runtime reports every address it serves. A port written here is a guess that
    // goes stale silently, and it is the defect this bundle shipped before.
    if (/127\.0\.0\.1|\blocalhost\b|:70\d\d\b/.test(line)) fail(at, "hardcoded address or port; present what the runtime returns");
    // A card is addressed by the identifier the runtime returns. Its title is a string
    // this bundle does not own and the developer can rewrite at any time. Matches the
    // affirmative instruction only, so prose forbidding the practice still passes.
    if (/(titulo exato|exact title|title is exactly)|card (de titulo|titled|whose title)\s*[:"«]|(search|busque|procure|look up)[^.]{0,40}\btitle\b[^.]{0,20}"/i.test(line)) {
      fail(at, "looks like a card lookup by literal title; use the identifier the runtime returns");
    }
    // Literals belonging to another agent CLI. This bundle names no other host's surface.
    if (/\bagy plugin\b|\bclaude plugin\b|\/plugin marketplace add\b|\/neural-seam:ns-/.test(line)) fail(at, "names another host's command surface");
    if (/(ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY/.test(line)) {
      fail(at, "looks like a credential; this repository is public");
    }
    // Scanned by code point so this file never has to contain the broken bytes itself.
    if (/�/.test(line) || /Ã[-¿]/.test(line)) fail(at, "mojibake: re-save as UTF-8");
  });
  if (text.charCodeAt(0) === 0xfeff) fail(w, "starts with a byte order mark; save without BOM");
}

// Claims this repository used to make and no longer can. Each was true of an earlier reading
// of the host and is now contradicted by the CLI, by the tree, or by both. They are listed
// here because prose is where a refuted fact survives longest: nothing compiles it, and a
// reader has no way to tell a measured sentence from a remembered one.
const REFUTED_CLAIMS = [
  [/\b(a )?plugins? cannot ship (lifecycle )?hooks\b/i, "the format does offer a hooks channel; this bundle declines to use it"],
  [/hooks are not part of the plugin format/i, "the format does offer a hooks channel; this bundle declines to use it"],
  [/(publish )?validator rejects hooks\b/i, "the validator rejects the manifest `hooks` field specifically, not hooks/hooks.json"],
  [/a plugin hook never fires/i, "not established: hooks stay inert until trusted, so this needs an authenticated session"],
  [/\bmarkdown\s+and\s+JSON\b/i, "the installed bundle is Markdown, YAML and JSON, and the repository also carries a JavaScript validation script"],
  [/\bmarkdown\s*\/\s*json\b/i, "the installed bundle is Markdown, YAML and JSON, and the repository also carries a JavaScript validation script"],
  [/unknown_key/, "the signing key is registered; tags verify on GitHub"],
  [/any published release\b/i, "compatibility is claimed only for runtime versions actually tested"],
];
for (const file of textFiles) {
  const text = fs.readFileSync(file, "utf8");
  text.split("\n").forEach((line, i) => {
    for (const [pattern, why] of REFUTED_CLAIMS) {
      if (pattern.test(line)) fail(`${rel(file)}:${i + 1}`, `claim no longer holds -- ${why}`);
    }
  });
}

// Relative markdown links, and the anchors they point at. A broken link in a published
// README is the cheapest possible defect to prevent and the most embarrassing to ship.
const slug = h => h.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
for (const file of textFiles.filter(p => p.endsWith(".md"))) {
  const text = fs.readFileSync(file, "utf8");
  const w = rel(file);
  for (const m of text.matchAll(/\[[^\]]*\]\((\.[^)\s]+)\)/g)) {
    const [target, anchor] = m[1].split("#");
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) { fail(w, `link target does not exist: ${m[1]}`); continue; }
    if (anchor) {
      const headings = fs.readFileSync(resolved, "utf8").match(/^#{1,6}\s+(.+)$/gm) ?? [];
      if (!headings.some(h => slug(h.replace(/^#+\s+/, "")) === anchor)) fail(w, `link anchor not found: ${m[1]}`);
    }
  }
}

// ---------------------------------------------------------------- report

if (errors.length) {
  console.error(`check-bundle: ${errors.length} problem${errors.length === 1 ? "" : "s"}\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("check-bundle: ok");
