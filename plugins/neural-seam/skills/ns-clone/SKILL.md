---
name: ns-clone
description: "Neural Seam: clona SO o codigo do projeto (idempotente; se o repo ja existir, faz git pull). Preocupacao separada do vinculo, que e do /ns-connect. Ative quando o dev quiser baixar o codigo de um projeto do Neural Seam, ou pedir /ns-clone."
---

# /ns-clone

Skill gerenciada pelo Neural Seam. Busca **so o codigo** do projeto - preocupacao separada do vinculo
(`/ns-connect`). Idempotente: se o repositorio ja existir, faz `git pull` em vez de re-clonar.

O dev deve informar o `<projectId>` junto do comando.

## Acao a executar agora

1. Se o `<projectId>` nao vier, peca-o (ou rode `/ns-status` para descobrir o estado) e pare.
2. Rode `neural-seam clone <projectId>`. Esse comando resolve o repositorio shell do projeto e o clona
   (com submodules) localmente. **Se o diretorio ja existir com o remote correto, ele nao re-clona -
   faz `git pull`** e reporta que o codigo ja estava presente.
3. Se falhar por auth/rede, mostre a mensagem e sugira `neural-seam login` ou `/ns-doctor`.
4. Ao terminar, sugira `/ns-status` e, se `ok`, `/ns-list`.
