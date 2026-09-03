---
name: ns-create
description: "Neural Seam: cenario greenfield (o projeto ainda nao existe). Mostra o link do wizard da bridge local para o dev criar o projeto. Ative quando o dev quiser criar um projeto novo no Neural Seam, ou pedir $neural-seam:ns-create."
---

# $neural-seam:ns-create

Skill gerenciada pelo Neural Seam. Cenario **A - o projeto ainda nao existe**. Leva o dev ate a porta
do wizard para criar o projeto. Nao cria por ele: a criacao e uma acao manual do dev na UI (P2).

## Acao a executar agora

1. Chame a tool `check_setup` do servidor MCP `neural-seam-runtime`.
2. Trate o `status`:
   - `needs_setup` -> pegue o campo `setup_url` (raiz da bridge, ex.: `http://127.0.0.1:7077`) e
     apresente-o: peca ao dev para abrir o wizard e criar o projeto. Explique que, ao criar, o wizard
     grava o manifesto (`.neural-seam/manifest.json`) neste diretorio e vincula o projeto ao cwd.
   - `import_candidate` -> e brownfield; o `setup_url` aponta `/setup`. Ofereca tambem `neural-seam import`.
   - `needs_connect` -> o projeto ja existe no Neural Seam; nao precisa criar. Redirecione para `$neural-seam:ns-connect`.
   - `needs_login` -> peca `neural-seam login` primeiro.
   - `ok` -> ja ha projeto vinculado a este diretorio; nada a criar. Sugira `$neural-seam:ns-list`.
3. Feche com o proximo passo: **apos criar no wizard, rode `$neural-seam:ns-status`** (o estado deve virar `ok`) e
   siga para `$neural-seam:ns-generate`.

Se `check_setup` retornar `error`, oriente `$neural-seam:ns-doctor`.
