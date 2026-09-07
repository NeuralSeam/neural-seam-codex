---
name: ns-generate
description: "Neural Seam: bootstraps the backlog of a project that is already connected. Generates the initial artefacts (spec, glossary, user stories, domain model, backlog) and creates the cards from them. Activate when the project is ready and work is waiting, when the developer wants to generate the initial backlog, or asks for $neural-seam:ns-generate."
---

# $neural-seam:ns-generate

Skill managed by Neural Seam. Bootstraps the backlog of a project that is already set up: it generates
the initial artefacts and turns the backlog into cards.

**Nothing is generated until the developer says so.** You present the prompt; they decide.

## Act now

1. Optionally confirm the state with `check_setup`. If the project is not ready, hand off to
   `$neural-seam:ns-start`.
2. Call the `next_job` tool. It returns the rendered generation `prompt` and the kind of work it
   covers. Present that prompt to the developer and **wait for their confirmation**. Generate nothing
   before it.
   - If the response says work is blocked by prerequisites, show what is blocking and stop.
3. Once the developer confirms, generate what the prompt asks for. **Follow the prompt the runtime
   returned** rather than a recipe in this file: it already carries what this project needs, including
   any extra instruction for a project that had code before it was connected. If it tells you to read
   the existing code first, read it first, and keep the backlog to the real gaps instead of proposing
   work that already exists.
4. Persist the result with the `save_insumos` tool and check what it returns.
5. Create a card per backlog item with the `create_activity` tool, and keep the identifier each one
   returns.
6. Summarise what was persisted and what was created. Close with `$neural-seam:ns-list` and
   `$neural-seam:ns-exec <id>`.

If a call returns an `error` (network or sign in), stop and point at `neural-seam login` or
`$neural-seam:ns-doctor`.

## Why this skill names a sequence

Most skills here call one tool. This one names several, and that is worth being honest about: the
runtime does not currently publish a single operation that takes a confirmed generation and both
persists it and opens the cards. Until it does, the order above lives here.

What that costs is a seam: a new step in the runtime's generation flow needs a matching edit here. What
it deliberately does **not** do is re-implement the flow. The tool names are a published contract, but
the shape of what they accept and return is not copied into this file, and no decision about what a
card should contain is made here. Read the prompt the runtime returns and follow it.
