---
name: ns-doctor
description: "Neural Seam: diagnoses and repairs the environment (sign in, language servers, project registration) with `neural-seam doctor --fix`, then checks the two things that fail quietly on this host: tool approval and hook trust. Activate when Neural Seam tools fail, when the MCP server does not show up, when hooks do not fire, on sign in or network errors, or when the developer asks for $neural-seam:ns-doctor."
---

# $neural-seam:ns-doctor

Skill managed by Neural Seam. Repairs the environment, then checks the two things that fail **quietly**
on this host: whether the runtime's tools are approved, and whether its hooks are trusted.

## Act now

1. Run `neural-seam doctor --fix` in the terminal and show the output. It repairs sign in, language
   servers and the project registration, then re-checks the result.
2. Make sure the binary is current: `neural-seam version`, and `neural-seam upgrade` if a newer release
   exists.
3. If the `neural-seam-runtime` server does not appear, check in this order:
   - `neural-seam version` answers, so the binary is on `PATH`;
   - the bundle is installed and enabled (`codex plugin list`);
   - the server is listed by `codex mcp list`.

   With this bundle installed the registration comes from the bundle itself, so no project needs its
   own MCP configuration.
4. **If the tools are listed but the first call is cancelled**, that is this host asking for approval,
   not the runtime failing. The bundle cannot approve tools on the developer's behalf. The approval
   setting for the `neural-seam-runtime` server lives in the developer's own Codex configuration, and
   `neural-seam doctor` reports whether it is set. Show what it reports and let the developer decide.
5. **If hooks do not fire**, they are written but not yet trusted. This host runs a hook only after the
   developer trusts it, and updating the runtime rewrites the hooks, which asks for that trust again.
   Neither state is a defect: it is how this host protects the developer, and Neural Seam only ever
   reads that setting, never writes it.
   - To grant it, open a Codex session and accept the hooks when prompted.
   - `neural-seam doctor` lists which lifecycle events are currently inert. Show that list.
6. Summarise what was fixed and what still needs the developer to act - especially pending hook trust,
   which is the usual reason behind "I installed it and nothing happens".
