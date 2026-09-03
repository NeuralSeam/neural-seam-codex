---
name: ns-start
description: "Neural Seam: motor guiado de onboarding. Le o estado do projeto e avanca UM passo sensato (login, criar, vincular, gerar backlog), sem refazer o que ja esta pronto. Ative quando o dev nao souber qual comando do Neural Seam usar, pedir para comecar/configurar o projeto, ou pedir $neural-seam:ns-start."
---

# $neural-seam:ns-start

Skill gerenciada pelo Neural Seam. E a **porta da frente guiada**: le o estado do projeto e conduz o
dev pelo proximo passo, sem refazer o que ja esta pronto (convergente). Toda inferencia nasce de uma
acao manual do dev (P2): voce apresenta os prompts, o dev decide gerar.

Ela **nao reimplementa** nada - delega as mesmas transicoes atomicas (`$neural-seam:ns-create`, `$neural-seam:ns-connect`,
`$neural-seam:ns-generate`, ...). Rode quantas vezes quiser: sempre faz so o delta.

## Fluxo a executar

1. Chame a tool `check_setup` do servidor MCP `neural-seam-runtime`.
2. Trate o `status` avancando **um** passo sensato (mesma tabela do `$neural-seam:ns-status`):

   - `needs_login` -> peca `neural-seam login` e pare ate concluir.
   - `needs_setup` -> apresente o `setup_url` (wizard da bridge) e pare; o dev cria o projeto la. Ao criar, o manifesto e gravado no diretorio e o proximo `check_setup` ja vem `ok` (o `project_id` sai do manifesto - o dev nao digita id). Equivale a `$neural-seam:ns-create`.
   - `needs_clone` -> ha projeto na nuvem, mas **esta pasta nao e o repositorio dele**. Apresente `$neural-seam:ns-clone <projectId>` (o id vem do proprio `check_setup`, em `projects` - o dev nao digita id a mao) e **pare com a trava de pasta abaixo**. Nao ofereca `connect` neste passo.
     - **Trava de pasta (nao pule):** o `ns-clone` materializa o codigo numa **subpasta**. Antes de rodar `$neural-seam:ns-connect`, o dev tem de **reabrir a sessao dentro dessa subpasta**. Seguir na sessao atual faz o MCP resolver a raiz pelo cwd antigo, e o `connect` grava o manifesto na pasta pai - manifesto num lugar, codigo em outro.
     - Se o projeto ainda nao tem repositorio provisionado, o clone nao se aplica: siga para `$neural-seam:ns-connect` na pasta atual mesmo. A `message` do `check_setup` diz qual dos dois casos e.
   - `needs_connect` -> apresente o `connect_url` (UI da bridge, onde o dev escolhe/vincula o projeto) e pare. Equivale a `$neural-seam:ns-connect`.
   - `import_candidate` -> peca `neural-seam import` (mostre `detected_indicators`).
   - `trial_expired` / `unsupported` -> mostre a `message` (+ `upgrade_url` / peca `neural-seam upgrade`) e pare.
   - `ok` -> siga para o passo 3.

3. **Se o `connect` recusar, mostre a recusa e pare.** O runtime recusa materializar quando o diretorio nao e um
   clone do repositorio do projeto. Essa recusa e o resultado - reproduza a mensagem dela ao dev e conduza para o
   `$neural-seam:ns-clone` que ela indica. **Nunca** siga adiante como se o vinculo tivesse acontecido: recusa
   engolida reproduz o bug da pasta errada com outra roupa.

4. Com `status = ok`:
   - Se `pending_jobs > 0` (ha backlog a gerar), ofereca rodar `$neural-seam:ns-generate` para gerar os insumos e criar os cards. **Nao submeta a geracao sozinho** - apresente e aguarde o dev confirmar.
   - Caso contrario, o projeto ja esta em regime de trabalho: sugira `$neural-seam:ns-list` (ver cards) e `$neural-seam:ns-exec <id>` (implementar um card).

5. **Card de setup do Aspire ja cumprido.** Se, nesta mesma sessao, um `aspire_status`/`aspire_up` confirmou o
   Aspire configurado, o card de setup semeado no board pode estar aberto sem ter mais o que fazer:
   - busque com `list_activities` o card de titulo exato **"Conferir e finalizar o setup do Aspire"** (titulo
     estavel por contrato do archetype);
   - se estiver aberto, **apresente** ao dev a opcao de move-lo/fecha-lo (`update_activity_status` ou
     `move_to_board`) e **aguarde a confirmacao dele antes de escrever** - mesmo padrao do `ns-generate` no passo 4;
   - confirmado, reporte em **uma linha** (incluindo duplicatas encontradas) em vez de narrar o processo.

   **Fronteira (P2):** vale dentro de uma execucao de `$neural-seam:ns-start` que o **dev** disparou. Nunca como job
   agendado ou reacao a evento remoto.

6. Ao terminar cada passo, diga **"fiz X -> proximo: `$neural-seam:ns-...`"**. Se qualquer tool retornar `error`
   (rede/auth), pare e oriente `neural-seam login` ou `$neural-seam:ns-doctor`.
