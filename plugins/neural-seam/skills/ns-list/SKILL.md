---
name: ns-list
description: "Neural Seam: lists the connected project's cards, grouped by status, with the identifier ready to paste. Takes an optional status filter and kind filter. Activate when the developer asks what there is to do, wants to see the cards or the backlog, or asks for $neural-seam:ns-list."
---

# $neural-seam:ns-list

Skill managed by Neural Seam. Lists the cards of the connected project. Read-only.

The developer may pass a status filter and a kind filter along with the command.

## Act now

1. Call the `list_activities` tool of the `neural-seam-runtime` MCP server, passing along whichever
   filters the developer gave.
2. Present the cards **grouped by status**. For each one show the identifier ready to paste, its kind,
   its title, and what is blocking it when the response says it is blocked.
3. Use the values the response returns. Do not translate an identifier, and do not rename a status or a
   kind the runtime did not return - a value this file has never seen is shown as it came.
4. Close with the next step: `$neural-seam:ns-exec <id>` to implement a card, or
   `$neural-seam:ns-open` to inspect it in the dashboard.

If the call returns an `error`, or the project is not connected, point at `$neural-seam:ns-status`.
