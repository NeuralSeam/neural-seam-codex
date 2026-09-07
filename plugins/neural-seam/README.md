# The `neural-seam` plugin

This directory is the plugin itself. The repository root is the **marketplace** that distributes it,
and that is where the documentation lives:

- **[Read the README at the repository root](../../README.md)** - what this is, how to install it,
  the skills, compatibility and troubleshooting.
- **[README.pt-BR.md](../../README.pt-BR.md)** - short guide in Portuguese.
- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - what belongs in this bundle, and what does not.
- **[COMPATIBILITY.md](../../COMPATIBILITY.md)** - tested versions, and how the claims about this
  host were measured.

This file is a signpost on purpose. Two copies of the same instructions drift, and the copy nobody
opens is the one that goes stale.

## What is in here

| Path | What it is |
| --- | --- |
| `.codex-plugin/plugin.json` | The plugin manifest: identity, version and which components it declares. |
| `.mcp.json` | The `neural-seam-runtime` MCP server registration. |
| `skills/ns-*/SKILL.md` | The 11 `$neural-seam:ns-*` skills. |
| `skills/ns-*/agents/openai.yaml` | Per skill: whether it may be offered implicitly, and the binary and MCP server it needs. |

Run `node ../../scripts/check-bundle.mjs` from the repository root after editing any of them.
