---
name: ns-open
description: "Neural Seam: mostra o link do dashboard/bridge local (a SPA ja abre escopada ao projeto deste diretorio). Ative quando o dev quiser abrir o dashboard, o kanban ou a UI do Neural Seam, ou pedir /ns-open."
---

# /ns-open

Skill gerenciada pelo Neural Seam. Mostra o link do dashboard da bridge local para o dev abrir no
navegador. Como a bridge e servida pelo runtime a partir do diretorio atual (`serve
--project-from-cwd`), a SPA ja abre **escopada ao projeto vinculado a este diretorio** - nao ha id na
URL. Por compliance (P4), o runtime nao abre o browser por conta propria; ele so entrega o link.

## Acao a executar agora

1. Chame a tool `open_dashboard` do servidor MCP `neural-seam-runtime`. Ela retorna o texto com a URL
   da bridge local (ex.: `http://127.0.0.1:7077`).
2. Apresente a URL e peca ao dev para abri-la no navegador.
3. Se a resposta indicar que **nao ha bridge local rodando**, oriente subir o runtime/bridge (ou o app
   de bandeja `neural-seam tray`) e, se preciso, `/ns-doctor`.
4. Feche sugerindo `/ns-list` (ver cards no terminal) como alternativa.
