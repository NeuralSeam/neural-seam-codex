---
name: ns-help
description: "Neural Seam: indice de todas as skills /ns-* e o fluxo tipico de uso. Nao chama nenhuma tool. Ative quando o dev perguntar quais comandos do Neural Seam existem, como usar o Neural Seam no Codex CLI, ou pedir /ns-help."
---

# /ns-help

Skill gerenciada pelo Neural Seam. Mostra o mapa das skills e o fluxo tipico. **Nao chama nenhuma tool**
- e um indice estatico. Apresente o conteudo abaixo ao dev, adaptando o tom se ele perguntar por um caso
especifico.

## Como funciona

A superficie tem **um motor guiado** (`ns-start`) + uma **bussola** (`ns-status`) + **atomicas** para
quem sabe o que quer. Todos os comandos sao convergentes: rodar de novo faz so o que falta.

- **Nao sei o que preciso** -> `/ns-start` (te conduz pelo proximo passo).
- **So quero saber onde estou** -> `/ns-status`.

## Fase 1 - Onboarding

| Comando | O que faz |
| ------- | --------- |
| `/ns-status` | Bussola: diz o estado e o proximo comando. |
| `/ns-start` | Motor guiado: le o estado e avanca 1 passo. |
| `/ns-create` | Cenario A (nao tenho projeto): mostra o link do wizard. |
| `/ns-connect [<id>]` | Cenario B (ja criei no wizard): vincula o projeto a este diretorio. |
| `/ns-clone <id>` | Clona so o codigo (idempotente). |
| `/ns-doctor` | Repara o ambiente (auth, language servers, registro MCP). |

## Fase 2 - Loop de trabalho

| Comando | O que faz |
| ------- | --------- |
| `/ns-generate` | Bootstrap do backlog: gera insumos e cria os cards. |
| `/ns-list [status] [kind]` | Lista os cards, agrupados por status. |
| `/ns-open` | Mostra o link do dashboard/bridge local. |
| `/ns-exec <id>` | Renderiza o prompt do card para implementar (P2). |

## Fluxo tipico

1. `/ns-start` -> resolve login/setup/connect ate o estado ficar `ok`.
2. `/ns-generate` -> gera insumos + cria os cards iniciais.
3. `/ns-list` -> escolhe um card.
4. `/ns-exec <id>` -> implementa. Repete 3-4.

Pre-requisitos (fora do bundle): o binario `neural-seam` no PATH e `neural-seam login`. Se algo travar,
`/ns-doctor`.
