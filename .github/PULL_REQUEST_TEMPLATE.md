# What this changes

<!-- One or two sentences. What is different for someone who installs the bundle after this? -->

Closes #

## Why

<!--
If this rests on how the Codex CLI behaves, say how you know and on which `codex` version.
This bundle documents host behaviour as measured fact, and "it should work like X" is the one thing
reviewers cannot check for you.
-->

## Checklist

- [ ] `node scripts/check-bundle.mjs` passes.
- [ ] I installed it into a throwaway `CODEX_HOME` and checked `codex plugin list` and
      `codex mcp list`, if I touched a skill or the MCP registration.
- [ ] `CHANGELOG.md` has an entry, if the published content changed meaning.
- [ ] The manifest `version` is strict semver, and matches the changelog entry.
- [ ] No sentence anywhere in the repository was left false by this change.
- [ ] Nothing here hardcodes a port, URL, environment name or card title that the runtime reports.
- [ ] Every skill that writes declares `policy.allow_implicit_invocation: false`.
- [ ] The text reads for someone outside the team: no internal design document names, ticket paths or
      source symbols.

## Runtime lockstep

<!--
Delete this section if it does not apply.
Changes to plugin.json, .mcp.json or marketplace.json are part of a contract with the runtime's
Codex host adapter. Say which runtime version carries the matching change, or note that none is
needed.
-->
