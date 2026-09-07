# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Report it privately through GitHub's private vulnerability reporting on this repository:
**Security > Report a vulnerability**
(<https://github.com/NeuralSeam/neural-seam-codex/security/advisories/new>).

If private reporting is unavailable to you, use the in-product support form at
<https://app.neuralseam.cloud> and mark the request as a security issue. Do not include working
exploit code or credentials in that form; say that you have them and we will arrange a private
channel.

Please include, as far as you can:

- what an attacker gains, and what access they need to start;
- the versions involved (this bundle's version, plus `codex --version` and `neural-seam version`);
- the smallest reproduction you have.

We aim to acknowledge a report within **5 business days** and to give you an assessment and a plan
within **15 business days**. Please give us reasonable time to ship a fix before disclosing publicly.
We will credit you in the release notes unless you ask us not to.

## Scope

The installed plugin bundle consists of **declarative Markdown, YAML and JSON**. It contains no
compiled code and executes nothing on its own. The repository also contains a JavaScript validation
script (`scripts/check-bundle.mjs`) used only by contributors and CI; it is not part of what gets
installed and never runs on a user's machine.

What the bundle does is wire your Codex CLI to software that runs on your machine, so the security
surface it owns is the wiring itself.

**In scope for this repository:**

- The MCP server registration in `plugins/neural-seam/.mcp.json`.
- The invocation policy in `plugins/neural-seam/skills/*/agents/openai.yaml`.
- Instructions in `plugins/neural-seam/skills/` that would lead an agent to leak secrets, weaken a
  permission boundary, or take a destructive action without the developer asking for it.
- `scripts/check-bundle.mjs` and the CI workflow, as contributor-facing code.
- Anything in this repository or its history that should not be public.

**Out of scope here, but still wanted:** vulnerabilities in the `neural-seam` runtime, the Neural Seam
backend, or the web applications. Report those through the same private channel; they will be routed
to the right component. Vulnerabilities in the Codex CLI itself belong to OpenAI.

## What this bundle can and cannot do

Worth knowing before assessing a report.

- The bundle **cannot approve its own tools**. This host gates MCP tool calls with an approval mode
  that lives in your own Codex configuration, and a value carried in a plugin's `.mcp.json` is
  discarded. Approving the runtime's tools is a change you make, in your own configuration.
- The bundle **holds no credentials**. It contains no tokens and no endpoints beyond the local
  `neural-seam` binary name. See [PRIVACY.md](./PRIVACY.md) for where credentials are kept.
- Everything the bundle references is the `neural-seam` binary resolved from your `PATH`. **A hostile
  binary earlier in your `PATH` would be invoked instead.** That is a property of `PATH` resolution;
  the mitigation is to install the runtime from the official installer and check `neural-seam
  version`.
- The bundle **ships no hooks**, so it runs nothing around your tool calls or your session. The format
  would allow it; this bundle does not use it. See below for why.

### Why this bundle ships no lifecycle hooks

Stated here because "the bundle has no hooks" is a security-relevant fact, and because the reason
matters when you assess a report.

**The Codex plugin format does offer a hooks channel.** A plugin may carry `hooks/hooks.json`, and the
CLI's documentation describes that path as well as a `hooks` field in the manifest. This bundle
declines to use it.

The reason is architectural, not technical. On this host the `neural-seam` runtime already installs
lifecycle hooks into your user configuration. Wiring the same integration from two places would give
you two things to audit and two places to disable, with one of them easy to miss. One owner is the
safer arrangement, and the runtime is the owner. This can be revisited; if it is, it will be in the
changelog.

The runtime's hooks additionally stay inert until you trust them. That is this host's own control, and
one that Neural Seam only ever reads, never writes.

That the format offers the channel is measured, not assumed. What was run, on which versions, and
what it showed is recorded in [COMPATIBILITY.md](./COMPATIBILITY.md#hooks), along with two questions
it deliberately leaves open. Neither of them changes what this bundle does, because it carries no
hooks either way.

**Measurement expires.** This host's behaviour is re-measured against each CLI release rather than
inherited. Versions we did not run and platforms we did not test are not covered.

## Release signing

Release tags are signed with SSH. Verify one yourself:

```sh
git clone https://github.com/NeuralSeam/neural-seam-codex
cd neural-seam-codex
git verify-tag <tag>
```

The public key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINj1X4nyMhJwo4xO+A/nJzBU/5XWq5A6WT+WIQMGy2aD
```

Fingerprint: `SHA256:j9LD61vbZM+BNx2s+solZAnxdu1kSWEbIP8KE/K+DuA` (ED25519).

To have `git` name the signer instead of only reporting a key, put it in an allowed-signers file:

```sh
echo 'caio.souza.s@gmail.com namespaces="git" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINj1X4nyMhJwo4xO+A/nJzBU/5XWq5A6WT+WIQMGy2aD' \
  >> ~/.config/git/allowed_signers
git config gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
git verify-tag <tag>
```

The key above is registered as a signing key on the account that publishes these tags, so GitHub's web
UI and API report a signed tag as verified. The local check with `git verify-tag` is still the
stronger one: it verifies against a key **you** placed in your allowed-signers file, rather than
against whatever the hosting platform currently associates with an account. Only the private key can
produce these signatures, and it is never published.

Published releases are listed on the
[releases page](https://github.com/NeuralSeam/neural-seam-codex/releases). Each one carries a tag of
the form `neural-seam-codex-v<version>`, and the check above works on any of them.

## Supported versions

Only the latest published version receives fixes. Versions are listed in
[CHANGELOG.md](./CHANGELOG.md). To update: `codex plugin remove neural-seam@neural-seam`, then
`codex plugin marketplace upgrade` and install again.
