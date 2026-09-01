---
name: ns-connect
description: "Neural Seam: vincula um projeto JA existente a este diretorio (materializa o manifesto/binding, sem clonar codigo). Ative quando o dev disser que ja criou o projeto no wizard e quer liga-lo a esta pasta, quando check_setup retornar needs_connect, ou quando pedir $neural-seam:ns-connect."
---

# $neural-seam:ns-connect

Skill gerenciada pelo Neural Seam. Cenario **B - o projeto ja existe** no Neural Seam e o dev quer
vincula-lo a este diretorio. Materializa o manifesto/binding **sem** clonar codigo (para so o codigo,
use `$neural-seam:ns-clone`).

Se o dev passou um `<projectId>` junto do comando, use-o no caminho de fallback do passo 2.

## Acao a executar agora

1. **Caminho guiado (recomendado, sem digitar id):** chame a tool `check_setup` do servidor MCP
   `neural-seam-runtime`.
   - Se `status = needs_connect`, pegue o campo `connect_url` (UI da bridge, ex.:
     `http://127.0.0.1:7077/connect`) e apresente-o: o dev escolhe/vincula o projeto la. Ao vincular, o
     manifesto e gravado neste diretorio e o proximo `check_setup` ja vem `ok` (o `project_id` sai do
     manifesto). Explique que **nao e preciso digitar o id**.
   - Se `status = needs_setup`, nao ha projeto para conectar -> redirecione para `$neural-seam:ns-create`.
   - Se `status = ok`, ja esta vinculado -> sugira `$neural-seam:ns-list`.

2. **Fallback headless (o dev forneceu um `<projectId>`):** rode `neural-seam connect <projectId>`.
   Esse comando busca o manifesto assinado, verifica a assinatura e materializa o binding no diretorio
   atual. Use quando a UI da bridge nao estiver disponivel.

3. Feche com o proximo passo: **apos vincular, rode `$neural-seam:ns-status`**; com `ok`, siga para `$neural-seam:ns-generate`
   (bootstrap) ou `$neural-seam:ns-clone <id>` se ainda faltar o codigo.

Se algo falhar por auth/rede, mostre a mensagem e sugira `neural-seam login` ou `$neural-seam:ns-doctor`.
