# Contributing

Thanks for looking. This repository is small and unusually constrained, so it is worth two minutes to
read what it is before proposing a change.

## What this repository is

A **host adapter**, shipped as a Codex CLI plugin. The repository root is a **marketplace**, and the
plugin lives inside it at `plugins/neural-seam/`. That layout is not decoration: this host's install
verb resolves a plugin against configured marketplaces, so a repository carrying only
`.codex-plugin/plugin.json` at its root has no way to be installed.

The installed plugin bundle is declarative content: Markdown, YAML and JSON. The repository also
contains a JavaScript validation script, `scripts/check-bundle.mjs`, which is used only by
contributors and CI and is never part of what gets installed.

Nothing in the bundle compiles, and no test suite runs against it. The first thing to discover a
broken file is otherwise the CLI, on a developer's machine, which is why that script exists and why CI
runs it on every pull request.

It is also deliberately **thin**. Product logic lives in the `neural-seam` runtime and the backend, not
here. A change that teaches this bundle a rule the runtime should own will be declined, however well it
is written, because the same rule would then have to be re-implemented for every other host.

## What belongs here, and what does not

**Yes:**

- Fixing a skill, a description or a documented fact that is wrong or out of date.
- Something that is genuinely specific to the Codex CLI: its invocation form, its manifest, its
  approval model, its marketplace layout.
- Documentation: clarity, accuracy, translation of the short Portuguese guide.

**No:**

- Hardcoded ports, URLs, environment names or card titles. The runtime reports these; read them from
  it. A card is addressed by the identifier the runtime returns, never by its title: a title is a
  string this bundle does not own and the developer can rewrite at will.
- Duplicating the product's flow. The runtime returns the state and a message written for the
  developer; present that. A table of states and transitions kept here is a second implementation,
  and it is the one nobody updates.
- Literals belonging to another agent CLI. This bundle names no other host's commands or marketplaces.
- Bundling the `neural-seam` binary, or anything that installs, replaces or works around
  `neural-seam login` / `connect`.
- Anything that makes the CLI look like it is doing something the developer did not start.

## Ground rules for content

- **Claims are measured, not assumed.** This bundle's documentation states host behaviour with the
  `codex` version it was measured on and how. If you assert what the CLI does, say how you know. "It
  should work like X" belongs in an issue, not in the README. The measurements themselves, and the
  procedure that produced them, live in [COMPATIBILITY.md](./COMPATIBILITY.md).
- **A comment or a sentence that a change made false is part of that change.** Fix it in the same
  commit.
- **Every skill needs well formed YAML frontmatter** with a non-empty `name` and `description`. The
  bundled plugin-creator validator rejects a skill without it, and the `description` is what decides
  when the skill activates, so write it for that.
- **Invocation policy is a decision, not a default.** A skill that writes - to disk, to the backend, or
  to the developer's environment - declares `policy.allow_implicit_invocation: false` in its
  `agents/openai.yaml`, so the model cannot pick it up on its own. Read-only skills stay implicitly
  discoverable; if they did not, nothing could offer the entry point. Declare each skill's real
  dependencies in the same file (`type: cli` for the binary, `type: mcp` for the server).
- **Write for someone outside the team.** No internal design document names, no internal ticket
  paths, no internal source symbols. That screening runs upstream, before content reaches this
  repository, and deliberately not here: a public check whose pattern list *is* the thing it hides
  publishes it. The checks in this repository are the ones that are safe to state out loud.
- **The manifest carries the version**, and it must be strict semver. The bundled plugin-creator
  validator enforces that, and it refuses any manifest field it does not know. `hooks` is one of
  those, which is worth knowing because the published documentation describes it as valid; a plugin
  that needs hooks carries them in `hooks/hooks.json` instead, which that validator accepts. Where
  the documentation, the CLI and that validator disagree, [COMPATIBILITY.md](./COMPATIBILITY.md)
  records which one this bundle follows and why.

## Making a change

1. Open an issue first for anything behavioural. For a typo or a broken link, just send the pull
   request.
2. Run the checks locally:

   ```sh
   node scripts/check-bundle.mjs
   ```

3. Test it for real when you have touched a skill or the MCP registration. Install from a local path
   into a throwaway Codex home so you do not disturb your own:

   ```sh
   CODEX_HOME=/tmp/codex-test codex plugin marketplace add .
   CODEX_HOME=/tmp/codex-test codex plugin add neural-seam@neural-seam
   CODEX_HOME=/tmp/codex-test codex plugin list
   CODEX_HOME=/tmp/codex-test codex mcp list
   ```

4. One logical change per commit, with a `type(scope): imperative subject` message
   (`fix(skills): ...`, `docs: ...`).
5. Add a `CHANGELOG.md` entry whenever the published content changes meaning. Say what changed and why,
   and include the evidence if the reason is a measurement.

## Review

Maintainers are listed in [.github/CODEOWNERS](./.github/CODEOWNERS). This bundle is kept in lockstep
with the `neural-seam` runtime's host adapter, so a change to its wiring may need a matching runtime
change before it can be merged. If that applies to your pull request, we will say so on the pull request
rather than leaving it open without explanation.

## How this bundle relates to the runtime

Useful when judging whether a change belongs here at all.

The split on this host is **not** the same as on the others, and it is not a matter of taste:

- **The bundle registers the MCP server.** The format supports it, so the bundle does it, and with the
  bundle installed a project needs no MCP configuration of its own.
- **The bundle does not install hooks, and cannot approve tools.** These are different kinds of
  "no". Hooks are a *decision*: the format offers the channel, and we leave it to the runtime so the
  integration has one owner rather than two. Tool approval is a *limit*: an approval mode written into
  a plugin's `.mcp.json` is discarded by the CLI, so it could not live here even if we wanted it to.
  Both therefore stay with the runtime, in your user configuration.

So installing the bundle does **not** replace `neural-seam connect`. Signing in, the signed manifest,
the project binding, the tool approval and the lifecycle hooks are all still the runtime's job.

## Before a release

Some of what this repository claims can only be checked by running the Codex CLI, and the CLI cannot be
installed and authenticated reproducibly in CI. Those checks are therefore **not** in CI, and they are
**mandatory before tagging**.

The procedure is kept in one place, next to the measurements it confirms:
[COMPATIBILITY.md](./COMPATIBILITY.md#re-validating-against-a-new-codex-release). Run it on a machine
with `codex` installed, record the versions, and update the tables there with what you measured.

Record the results in the changelog entry when a claim in the documentation depends on them.

By contributing, you agree that your contribution is licensed under the repository's
[MIT license](./LICENSE).
