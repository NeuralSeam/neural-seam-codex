---
name: ns-exec
description: "Neural Seam: prepara a implementacao de um card. Pede ao backend o job da atividade e renderiza o prompt do card para o dev revisar antes de executar (nunca auto-submete). Ative quando o dev quiser implementar/trabalhar num card pelo id, ou pedir /ns-exec."
---

# /ns-exec

Skill gerenciada pelo Neural Seam. Prepara a implementacao de um card: pede ao backend o job da
atividade e renderiza o **prompt** do `kind`. Compliance P2: o prompt e apresentado para o dev revisar -
**nada e auto-submetido**; a implementacao roda quando o dev confirmar.

O dev deve informar o `<activity_id>` do card junto do comando.

## Acao a executar agora

1. Se o `<activity_id>` nao vier, **nao erre por falta de id**: rode `/ns-list` primeiro e ajude o dev a
   escolher um card; pare ate ter o id.
2. Chame a tool `exec_activity` do servidor MCP `neural-seam-runtime` com `activity_id = <id>`. Ela
   retorna `activity_id`, `kind`, `job_id`, `prompt` e `status: "ready"`.
3. Apresente o `prompt` ao dev e aguarde a confirmacao. Quando confirmado, execute a implementacao
   seguindo o prompt (edite o codigo, rode a verificacao do app, faca commit conforme as regras do
   projeto).
4. Ao terminar, reporte o resultado e sugira `/ns-list` para ver o que sobrou (e, se fizer sentido, a
   tool `update_activity_status` para transicionar o card).

Se `exec_activity` retornar `error` (rede/auth) ou o projeto nao estiver conectado, oriente `/ns-status`.
