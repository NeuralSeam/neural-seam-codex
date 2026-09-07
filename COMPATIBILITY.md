# Compatibility and verification

Maintainer-facing. This is where the version matrix, the measurements behind the claims in
[README.md](./README.md), and the procedure for re-checking them live. If you only want to install and
use the bundle, the README is the document you want.

## Why this document exists separately

The Codex plugin contract is still moving, and three authorities on it do not currently agree:

| Authority | What it is | How to consult it |
| --- | --- | --- |
| **The published documentation** | OpenAI's plugin documentation for the Codex CLI | <https://developers.openai.com/plugins/build/plugins> |
| **The CLI itself** | What `codex` actually loads at install and at startup | Install a plugin and observe `codex plugin list`, `codex mcp list` |
| **The bundled plugin-creator validator** | `scripts/validate_plugin.py`, materialised on disk under `<CODEX_HOME>/skills/.system/plugin-creator/` by the CLI's own `plugin-creator` system skill | Run it against a plugin directory |

Where they disagree, this bundle follows **the CLI**, and prefers a shape that the bundled validator
also accepts. Two things are worth being precise about:

- **The bundled plugin-creator validator is not the publication gate.** It ships inside the CLI as a
  helper for authoring plugins. It does not necessarily implement the same rules as the validator
  behind OpenAI's public plugin portal, and we have not tested that portal. Passing it is a useful
  signal, not a guarantee of acceptance; failing it is a reason to look closer, not proof of
  rejection. It should not be described as the publish validator.
- **Everything below is specific to the versions named.** Host behaviour is re-measured against each
  CLI release rather than inherited. A newer Codex release is untested, not unsupported, until
  somebody runs the procedure at the end of this file.

## Tested versions

| | Version | What was run |
| --- | --- | --- |
| Codex CLI, current | **0.153.4** | Full cycle: install, list, enable, disable, remove, reinstall, against an isolated `CODEX_HOME` |
| Codex CLI, oldest proven | **0.146.0** | The same plugin format measured on that release, with identical results |
| `neural-seam` runtime | **0.15.1** | The published release, downloaded and checksum verified. Every MCP operation the skills call was confirmed present in the tool list it serves |
| Operating system | **Windows** | Every measurement in this document |

Runtime releases older than 0.15.1 are not claimed as compatible: compatibility here means measured
against the release named, never inferred backwards from it.

## Method

Every measurement below was taken against a throwaway Codex home, so that nothing touches the
machine's real configuration and so that a result cannot be an artefact of state left by an earlier
test.

```sh
export CODEX_HOME=$(mktemp -d)
codex plugin marketplace add .
codex plugin add neural-seam@neural-seam
codex plugin list
codex mcp list
```

Two traps that invalidate a naive test, both found the hard way:

- **A `-c` override does not disable a plugin.** The enabled state is read from `config.toml` in the
  Codex home, and a command-line override does not reach it. Edit `config.toml` in the isolated home
  instead, and confirm the result with `codex plugin list`.
- **There is no enable or disable verb under `codex plugin`.** A report claiming to have exercised a
  disable and re-enable cycle through such a command describes a path that does not exist.

For the bundled validator, run the file the CLI materialised rather than a copy of it. It lives under
`skills/.system/plugin-creator/scripts/validate_plugin.py` inside the Codex home, and takes the plugin
directory as its argument.

## What the plugin format carries

Method: build a probe plugin declaring one channel at a time, install it into an isolated
`CODEX_HOME`, and observe what the CLI loads. Reproduced on 0.146.0 and 0.153.4 with identical
results.

| Channel | Result |
| --- | --- |
| `skills` | Loads, namespaced as `$<plugin>:<skill>` |
| `mcpServers` in the manifest, pointing at the bundle's MCP file | Loads. `codex mcp list` resolves the server, and it disappears when the plugin is disabled |
| `hooks` as a manifest field | Installs, but the bundled plugin-creator validator rejects the field |
| `hooks/hooks.json`, not named in the manifest | Installs, and the bundled plugin-creator validator accepts it |
| `prompts/`, `rules/` | No manifest key exists for either |
| `commands/` | Legacy. Migrated at install time into a `source-command-*` skill |

The manifest keys the bundled validator accepts: `id`, `name`, `version`, `description`, `skills`,
`apps`, `mcpServers`, `interface`, `author`, `homepage`, `repository`, `license`, `keywords`. Any
other key is refused, which is why `hooks` fails there despite appearing in the published
documentation.

## The shape of the MCP file

This is the sharpest disagreement between the three authorities, and it decides what this bundle
ships.

| Shape | The CLI loads it? | The bundled validator accepts it? |
| --- | --- | --- |
| `{"mcpServers": {...}}` | **Yes** | **Yes** |
| A direct server map, with the server name at the top level | Yes | No |
| `{"mcp_servers": {...}}` | **No, and silently** | No |

Read that table carefully, because the intuitive reading is wrong twice:

- The snake-case wrapper appears in the published documentation. It registers **nothing**, and it does
  so without an error, a warning or a log line. A bundle shipping that shape looks installed and is
  simply inert.
- The direct server map does load, so a quick manual test passes. It does not satisfy the bundled
  validator.

Only the camel-case wrapper satisfies both, and it is also the shape the CLI's own plugin scaffolder
writes. That is what this bundle ships, in `plugins/neural-seam/.mcp.json`, with the manifest's
`mcpServers` key pointing at that file.

**Do not change this on the strength of the documentation alone.** The check in
`scripts/check-bundle.mjs` fails the snake-case shape by name for exactly this reason.

### What a plugin's MCP file cannot carry

`default_tools_approval_mode` is discarded when a plugin declares it. The approval mode is read from
the developer's own `config.toml`, and nothing a plugin ships can set it. That is a limit of the host
rather than a decision of this bundle, and it is why approving the runtime's tools stays something the
developer does.

Where both a plugin and the developer's `config.toml` declare the same MCP server, there is no
duplicate and no error: **the `config.toml` entry wins.** The bundle's registration is therefore a
fallback for a machine that has not run `neural-seam connect`, not a replacement for it.

## Hooks

**The format offers a hooks channel, and the runtime supports hooks.** The published documentation
describes both `hooks/hooks.json` and a manifest `hooks` field. Measurement confirms the first
installs and validates, and shows the second is refused by the bundled validator.

**This bundle ships no hooks anyway, by architectural decision.** On this host the `neural-seam`
runtime already installs lifecycle hooks into the developer's own configuration. Wiring one
integration from two places would give a developer two things to audit and two places to disable, one
of which is easy to miss. The runtime owns that integration. This is revisitable, and if it is
revisited the changelog will say so.

Two things were **not** established, recorded rather than rounded off:

- **Whether a hook shipped inside a plugin is ever executed.** On this host a hook stays inert until
  it is trusted interactively, keyed by a hash of its content. Confirming execution needs an
  authenticated interactive session rather than an isolated install, so it was not confirmed here. It
  was not refuted either: an earlier measurement that reported no execution had granted no trust, so
  what it measured was the inert state rather than the channel.
- **What `plugin_hooks` being reported as removed in `codex features list` implies.** It points
  against execution. It is not the same statement as the two rows measured above, and we are not
  reconciling them by guessing.

Since this bundle carries no hooks, neither answer changes its behaviour, and neither is a claim it
makes.

## Platform coverage

| Platform | Status |
| --- | --- |
| **Windows** | Every measurement in this document was taken here |
| **Linux** | Untested by us. The bundle contains nothing platform specific and the runtime publishes Linux builds, but the cycle above has not been run there |
| **macOS** | Untested by us, on the same terms as Linux |

Untested is not unsupported. It means nobody has run the procedure, so nobody should claim the
result. The one platform-specific artefact this bundle ever shipped, a PowerShell install script, was
removed in 0.3.0.

## Re-validating against a new Codex release

Run this when the CLI publishes a release, and before tagging a release of this bundle. It is not in
CI: the CLI cannot be installed and authenticated reproducibly there.

1. Record `codex --version` and `neural-seam version`. Every claim below is version specific.
2. `node scripts/check-bundle.mjs` passes.
3. Against a fresh isolated `CODEX_HOME`, as under [Method](#method):
   - `codex plugin list` shows `neural-seam@neural-seam` as `installed, enabled`, at the version in
     the manifest.
   - `codex mcp list` resolves `neural-seam-runtime`.
   - `codex debug prompt-input` lists the six read-only skills and does **not** list the five that
     declare `allow_implicit_invocation: false`. All 11 stay callable explicitly.
   - Disable the plugin in `config.toml`, confirm the skills and the MCP server both disappear, then
     re-enable and confirm they come back.
   - `codex plugin remove neural-seam@neural-seam` leaves nothing behind.
4. Run the bundled plugin-creator validator against `plugins/neural-seam`.
5. Confirm the MCP operations the skills call are present in the tool list the **published** runtime
   serves. Never validate against a development build, and never document a behaviour that only a
   development build has.
6. Update the tables in this file, and the short compatibility statement in the README, with what you
   measured. If a result changed, say so in `CHANGELOG.md`.

If a step cannot be run, write down that it was not run. An untested claim recorded as untested is a
smaller problem than an assumed one recorded as measured.
