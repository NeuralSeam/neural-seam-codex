# Changelog

All notable changes to the Neural Seam bundle for the Codex CLI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The version of record is
`plugins/neural-seam/.codex-plugin/plugin.json`, and it is strict semver. Tags use the
`neural-seam-codex-v*` prefix.

## [0.3.0]

The bundle now sets up its own MCP connection, the skills that change things no longer run unless you
ask for them by name, and the PowerShell-only install step is gone.

### Added

- **The bundle registers the MCP server.** Installing it is now enough to give Codex the
  `neural-seam-runtime` connection; a project no longer needs MCP configuration of its own.
- **An invocation policy per skill.** The five skills that change something (`ns-connect`, `ns-clone`,
  `ns-doctor`, `ns-generate`, `ns-exec`) are no longer offered to the model on its own initiative, so
  it cannot decide by itself to clone a repository, generate a backlog or alter your configuration.
  You invoke them by name and they run as before. The six read-only skills stay discoverable, and all
  11 remain callable explicitly.
- **`COMPATIBILITY.md`**: the versions this bundle was tested against, what is known about the plugin
  format on each of them, and the procedure for re-checking it when Codex publishes a new release.
- **`README.pt-BR.md`**, a short Portuguese guide. The English `README.md` is canonical.
- **Governance and a check on every pull request**: `SECURITY.md`, `SUPPORT.md`, `PRIVACY.md`,
  `CONTRIBUTING.md`, `TRADEMARKS.md`, `.github/` templates, and `scripts/check-bundle.mjs` run by CI.

### Changed

- **Documentation is in English**, and so is the content the CLI loads.
- **The version is strict semver.** `0.2.0+codex.20260902` becomes `0.3.0`.
- **The skills present what the runtime returns** instead of keeping their own copy of the product's
  flow. A card is addressed by the identifier the runtime returns, never by its title, so renaming a
  card can no longer break a skill.
- **The README is written for someone installing the bundle.** Findings that are specific to a Codex
  version moved to `COMPATIBILITY.md`, and the root and plugin READMEs no longer duplicate each
  other.

### Removed

- **`prompts/` and `scripts/install-prompts.ps1`.** They offered a `/` menu entry this host does not
  support, and the script was the only documented way to install the bundle: PowerShell only, in a
  cross-platform product. The surface is the skills, invoked as `$neural-seam:ns-*`.

  **Upgrading from 0.2.0 leaves files behind.** That script copied 11 files into your Codex profile.
  They were never part of the plugin, so `codex plugin remove` does not touch them, and they keep
  offering stale `/prompts:ns-*` entries. Delete them:

  ```powershell
  Remove-Item "$HOME\.codex\prompts\ns-*.md"
  ```

  ```sh
  rm -f ~/.codex/prompts/ns-*.md
  ```

- **Hardcoded loopback addresses and ports** from `ns-connect`, `ns-create` and `ns-open`. The runtime
  reports the addresses it serves; the skills show what it returns.

### Fixed

- **What the documentation said about lifecycle hooks.** The plugin format does offer a hooks channel.
  This bundle still carries none, and the reason is now stated correctly: the `neural-seam` runtime
  already installs them into your configuration, and one integration with two owners means two places
  to turn it off.
- **Tool approval could read as something the bundle does.** It is not: an approval mode written into
  a plugin's MCP file is discarded by the CLI, so approving the runtime's tools stays a change you
  make in your own Codex configuration. The check script now fails if that setting reappears where it
  would have no effect.
- **Every skill carries its interface metadata.** `ns-help` was missing the file the other ten had.
- **What this repository says it contains.** The installed bundle is declarative Markdown, YAML and
  JSON; the repository also carries a JavaScript validation script used only by contributors and CI.

### Compatibility

| | Version |
| --- | --- |
| Codex CLI tested | **0.153.4** |
| Minimum Codex CLI proven | **0.146.0** |
| `neural-seam` runtime tested | **0.15.1** (published release) |
| Operating system tested | **Windows** |

Linux and macOS are untested rather than unsupported. Runtime releases older than 0.15.1 are not
claimed as compatible, because they were not tested. How these were verified, and what is known about
the plugin format on those versions: [COMPATIBILITY.md](./COMPATIBILITY.md).

Installing this bundle still does not replace `neural-seam login` or `neural-seam connect`: signing
in, the signed manifest, the project binding, tool approval and lifecycle hooks remain the runtime's
job.

## [0.2.0]

First published bundle, and the repository layout that makes it installable.

### Added

- The repository root became a **marketplace** (`.agents/plugins/marketplace.json`) with the plugin
  under `plugins/neural-seam/`. This host's install verb resolves a plugin against configured
  marketplaces, so a repository carrying only a plugin manifest at its root is not installable.
- `.codex-plugin/plugin.json` declaring `skills`, plus the 11 `$neural-seam:ns-*` skills: `ns-clone`,
  `ns-connect`, `ns-create`, `ns-doctor`, `ns-exec`, `ns-generate`, `ns-help`, `ns-list`, `ns-open`,
  `ns-start`, `ns-status`.
- Publication metadata for the marketplace entry.

### Changed

- **First run clones before binding.** `ns-start` routes to `ns-clone` when the project exists but its
  code is not in the folder, and stops until the session is reopened inside the cloned subdirectory -
  otherwise the manifest is written next to the code rather than with it.
- **A refusal from the runtime is shown, never swallowed.** When the runtime refuses to bind because
  the directory is not a clone of the project's repository, the skills present the refusal and follow
  it to the clone instead of carrying on as though the binding had happened.
