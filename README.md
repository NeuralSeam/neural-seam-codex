# Neural Seam for the Codex CLI

Neural Seam host adapter for the **OpenAI Codex CLI**, shipped as a Codex **plugin**.

Installing it registers the `neural-seam-runtime` MCP server in your CLI and adds the 11
`$neural-seam:ns-*` skills. Every wire points at the `neural-seam` binary on your `PATH`.

> **Neural Seam does not provide a model and does not run inference.** It coordinates the work: your
> project's spec, glossary, backlog, cards and per-path conventions live in Neural Seam and are served
> to your agent through MCP. The model you talk to is the one your Codex CLI is already configured to
> use, billed by whoever provides it. Neural Seam never authenticates to a model provider on your
> behalf.

- **Product:** <https://neuralseam.cloud>
- **App:** <https://app.neuralseam.cloud>
- **Runtime:** [neural-seam-releases](https://github.com/NeuralSeam/neural-seam-releases#readme) - how
  to install the `neural-seam` binary this bundle wires to, and its user manual
- **License:** [MIT](./LICENSE); see [TRADEMARKS.md](./TRADEMARKS.md) for the name and logo
- **Portuguese:** [README.pt-BR.md](./README.pt-BR.md) (short guide; this file is canonical)

## What it does

- **Gets you set up.** `$neural-seam:ns-start` asks the runtime where you stand and walks you through
  the next step, so you do not have to know which command comes next.
- **Puts your project's own knowledge in context.** The MCP server answers with your backlog,
  conventions and state, instead of the agent reconstructing all of it from the file tree every
  session.
- **Gives you a work loop.** Generate a backlog, list cards, pick one, and render its implementation
  prompt for you to review and run.

## What it does not do

- **It does not install anything.** Not the `neural-seam` binary, not the CLI.
- **It does not sign you in and does not bind your project.** Those are product state, and they stay
  with `neural-seam login` and `neural-seam connect`.
- **It does not start work on its own.** Skills render prompts for you to review; you decide when
  something runs.
- **It does not hold product logic.** The rules of the product live in the runtime and the backend.
  This bundle presents what the runtime returns. See [CONTRIBUTING.md](./CONTRIBUTING.md).
- **It does not grant itself permissions.** See [Approving the tools](#approving-the-tools).

## Requirements

| You need | How to get it | Check |
| --- | --- | --- |
| Codex CLI | OpenAI's installer | `codex --version` |
| The `neural-seam` binary on `PATH` | [Neural Seam installer](https://github.com/NeuralSeam/neural-seam-releases#download-and-install) | `neural-seam version` |
| A Neural Seam account, signed in | `neural-seam login` (device flow) | `neural-seam doctor` |
| A project bound to this folder | `neural-seam connect <projectId>`, or the local dashboard | `$neural-seam:ns-status` |

## Install

Two steps, in this order. This host's install verb resolves a plugin against marketplaces you have
already configured, so the marketplace is registered first.

```sh
codex plugin marketplace add NeuralSeam/neural-seam-codex
codex plugin add neural-seam@neural-seam
codex plugin list
```

`codex plugin list` should show `neural-seam@neural-seam` as `installed, enabled`. A plugin that is
registered but **disabled** loads no skills at all, which is why the runtime treats that state as
absent and goes back to telling you to install it.

To update: `codex plugin marketplace upgrade`, then install again.

To remove it: `codex plugin remove neural-seam@neural-seam`. That takes the skills and the MCP
registration with it. The marketplace stays registered, so you can install again without adding it
back; `codex plugin marketplace remove neural-seam` drops that too.

### Upgrading from 0.2.0

**If you ran `install-prompts.ps1`, delete what it left behind.** That script copied 11 prompt files
into your Codex profile, and nothing removes them: they are not part of the plugin, so
`codex plugin remove` never touches them, and they will keep showing stale `/prompts:ns-*` entries in
your `/` menu.

```powershell
Remove-Item "$HOME\.codex\prompts\ns-*.md"
```

```sh
rm -f ~/.codex/prompts/ns-*.md
```

Nothing else needs undoing. From 0.3.0 the surface is the skills, and the bundle installs nothing
outside the plugin directory the CLI manages.

### Why the repository root is a marketplace

Worth knowing if the layout looks odd: this repository **is** the catalog, and the plugin lives inside
it at `plugins/neural-seam/`. The install verb takes a `<plugin>@<marketplace>` reference and resolves
it against configured marketplaces, so a repository carrying only a plugin manifest at its root would
have no way in.

### Approving the tools

This host asks before it lets a tool call through, and **the bundle cannot answer for you**. An
approval mode written into a plugin's MCP file is discarded by the CLI, so the setting lives in your
own Codex configuration.

If the runtime's tools are listed but the first call comes back cancelled, that is this prompt, not a
broken server. `neural-seam doctor` reports whether the approval is in place; `$neural-seam:ns-doctor`
walks through it.

### Check the install

Open `codex` in a project folder:

1. `codex plugin list` shows `neural-seam@neural-seam` as `installed, enabled`.
2. `codex mcp list` shows `neural-seam-runtime`.
3. `$neural-seam:ns-status` answers with the project state.

If the MCP server is missing, run `$neural-seam:ns-doctor`.

## First run

```
$neural-seam:ns-start
```

That is the whole answer to "what do I do now". It reads the state and moves one step: sign in, create
or pick a project, bind it, then stop. Run it again for the next step; re-running only does what is
still missing.

Once you are set up:

```
$neural-seam:ns-generate     # bootstrap the backlog
$neural-seam:ns-list         # pick a card
$neural-seam:ns-exec <id>    # render the implementation prompt for that card
```

The last two are the loop.

## Skills

This host invokes a plugin's skills as `$<plugin>:<skill>`, so `$neural-seam:` is part of the name.

| Skill | What it does | Offered on its own? |
| --- | --- | --- |
| `$neural-seam:ns-status` | Reports the state and the command that comes next. | yes |
| `$neural-seam:ns-start` | Guided: reads the state and advances one step. | yes |
| `$neural-seam:ns-create` | No project yet: shows the setup wizard link. | yes |
| `$neural-seam:ns-list [status] [kind]` | Lists cards, grouped by status. | yes |
| `$neural-seam:ns-open` | Shows the local dashboard link. | yes |
| `$neural-seam:ns-connect [<id>]` | Project already exists: binds it to this folder. | no |
| `$neural-seam:ns-clone <id>` | Clones the project's code only. Idempotent. | no |
| `$neural-seam:ns-doctor` | Repairs the environment: sign in, language servers, MCP registration. | no |
| `$neural-seam:ns-generate` | Bootstraps the backlog: generates the artefacts and creates the cards. | no |
| `$neural-seam:ns-exec <id>` | Renders the implementation prompt for a card. | no |
| `$neural-seam:ns-help` | Index of every skill above. | yes |

**"Offered on its own" is a deliberate setting, not an accident.** Every skill that writes - to disk,
to the backend, or to your environment - declares `allow_implicit_invocation: false`, so the model
cannot decide by itself to clone a repository, generate a backlog or repair your configuration. Those
five run when **you** name them. The read-only ones stay discoverable, because otherwise nothing could
offer you the way in.

All 11 are callable explicitly, whatever this column says.

## What the bundle wires

| Component | File | Effect |
| --- | --- | --- |
| MCP registration | `plugins/neural-seam/.mcp.json` | `neural-seam-runtime` via `neural-seam serve --project-from-cwd`. The server resolves the project from the working directory, so **one** registration serves every project. |
| Skills | `plugins/neural-seam/skills/ns-*/SKILL.md` | The 11 skills listed above. |
| Invocation policy and dependencies | `plugins/neural-seam/skills/ns-*/agents/openai.yaml` | Which skills may be offered implicitly, and the `neural-seam` binary and MCP server each one needs. |

### What it deliberately does not wire, and why

**Lifecycle hooks are not in this bundle, and that is a decision rather than a limit.** The plugin
format does offer a hooks channel. We leave it to the `neural-seam` runtime, which already installs
lifecycle hooks into your user configuration: two sources wiring one integration means two places to
turn it off, and one to forget. This can be revisited, and if it is, the changelog will say so.

**Tool approval is not in this bundle** either, and that one *is* a limit: the CLI discards an
approval mode written into a plugin's MCP file.

Both therefore stay with the `neural-seam` runtime, in your user configuration. This is why
**installing the bundle does not replace `neural-seam connect`**.

## Compatibility

Tested with **Codex CLI 0.153.4** and **Neural Seam runtime 0.15.1**, on **Windows**. Codex CLI
**0.146.0** is the oldest release proven to load this bundle.

Linux and macOS are untested rather than unsupported: nothing in this bundle is platform specific, but
we have not run the cycle there and will not claim it. Runtime releases older than 0.15.1 are not
claimed either, because they were not tested.

The Codex plugin contract is still evolving, so implementation-specific findings and the verification
procedure are documented in [COMPATIBILITY.md](./COMPATIBILITY.md).

## Verifying a release

Release tags are signed with SSH. To check one yourself:

```sh
git clone https://github.com/NeuralSeam/neural-seam-codex
cd neural-seam-codex
git verify-tag <tag>
```

`git verify-tag` reports a name rather than only a key once the public key is in an allowed-signers
file. The fingerprint and the line to paste are published under
[Release signing](./SECURITY.md#release-signing).

## Privacy and security

**The bundle itself collects nothing and sends nothing.** The installed plugin bundle consists of
declarative Markdown, YAML and JSON. The repository also contains a JavaScript validation script used
only by contributors and CI; it is never installed and never runs on your machine.

The `neural-seam` runtime it points at does move data, and not all of it is optional: signing in,
identifying your machine at sign in, and your project's coordination data are sent whether or not
telemetry is on. Telemetry itself is opt in and off by default. Your source code is read locally.

The full picture, including how to delete each store separately, is in [PRIVACY.md](./PRIVACY.md).
Vulnerability reporting and what this bundle can and cannot do: [SECURITY.md](./SECURITY.md).

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No `ns-*` skills | Plugin not installed, or disabled | `codex plugin list`, then install or enable it |
| `codex mcp list` does not show `neural-seam-runtime` | `neural-seam` not on `PATH`, or the plugin is disabled | `neural-seam version`; if that fails, reinstall the runtime and reopen `codex` |
| The tools are listed but the first call is cancelled | This host is asking for approval | See [Approving the tools](#approving-the-tools) |
| Nothing happens on session start | Lifecycle hooks are written by the runtime and stay inert until you trust them | Accept the hooks in a Codex session; `neural-seam doctor` lists which are inert |
| `$neural-seam:ns-status` says you are not signed in | Session expired, or replaced by a newer sign in | `neural-seam login` |
| Bound the project and the manifest landed in the wrong folder | You bound before reopening the session inside the cloned subdirectory | Reopen the session in the cloned folder, then bind again |
| Anything else | | `$neural-seam:ns-doctor` |

### Known limits of this host

Stated plainly, because these are limits of the CLI rather than gaps in the bundle:

- **A plugin cannot ship slash commands or prompts.** The skills are the surface, invoked as
  `$neural-seam:ns-*`. The script that earlier versions used to fake a `/` menu entry was removed in
  0.3.0; see [Upgrading from 0.2.0](#upgrading-from-020) if you ran it.
- **`codex doctor` does not count a plugin's MCP server.** It reports zero MCP servers even when
  `codex mcp list` resolves this one. Use `codex mcp list` to check.

## What we commit to

- Neural Seam never authenticates to a model provider, and holds no model provider credentials.
- Every model call is started by you. Nothing here submits work on its own.
- Signing in uses Neural Seam credentials, never your host or model provider account.
- This is an explicit extension. It does not bundle the `neural-seam` binary, and does not replace
  signing in or binding a project.
- Telemetry is opt in with a declared scope, and off by default.

## Contributing, support and security

- Questions and bugs: [SUPPORT.md](./SUPPORT.md)
- Changes, and how this bundle is kept thin: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Tested versions, and how they were verified: [COMPATIBILITY.md](./COMPATIBILITY.md)
- Vulnerability reports: [SECURITY.md](./SECURITY.md), please do not open a public issue
- Data handling: [PRIVACY.md](./PRIVACY.md)
- Name and logo: [TRADEMARKS.md](./TRADEMARKS.md)
- Release history: [CHANGELOG.md](./CHANGELOG.md)

## License

MIT, see [LICENSE](./LICENSE). The license covers the content of this repository. It does not grant
rights to the Neural Seam name or logo, see [TRADEMARKS.md](./TRADEMARKS.md).

Should the license ever change, **any version already published under MIT stays under MIT**. A licence
cannot be retracted from a release that was made under it, and we are stating that plainly rather than
leaving you to reason about it: what you already have, you keep, on the terms you received it.
