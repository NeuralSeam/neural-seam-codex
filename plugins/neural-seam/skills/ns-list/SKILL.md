---
name: ns-list
description: "Neural Seam: lista as atividades/cards do projeto conectado, agrupadas por status, com o id pronto para colar. Aceita filtro opcional de status (BACKLOG, IN_PROGRESS, BLOCKED, DONE) e de kind (TECH, FEATURE, IMPROVE, BUG, VERIFY). Ative quando o dev perguntar o que ha para fazer, quiser ver os cards/backlog, ou pedir /ns-list."
---

# /ns-list

Skill gerenciada pelo Neural Seam. Lista os cards (atividades) do projeto conectado. Read-only.

O dev pode passar filtros junto do comando: um `status` (ex.: `BACKLOG`, `IN_PROGRESS`, `BLOCKED`,
`DONE`) e/ou um `kind` (`TECH`, `FEATURE`, `IMPROVE`, `BUG`, `VERIFY`).

## Acao a executar agora

1. Chame a tool `list_activities` do servidor MCP `neural-seam-runtime`. Se o dev passou filtros,
   repasse-os como `status` / `kind`.
2. Apresente os cards **agrupados por status** (a fazer / em progresso / bloqueado / concluido). Para
   cada card, mostre: o `id` (pronto para colar), o `kind`, o `title` e, se `is_blocked`, o
   `blocked_by`.
3. Feche indicando o proximo passo: **`/ns-exec <id>`** para implementar um card, ou `/ns-open` para
   inspecionar no dashboard.

Se `list_activities` retornar `error` (rede/auth) ou o projeto nao estiver conectado, oriente
`/ns-status`.
