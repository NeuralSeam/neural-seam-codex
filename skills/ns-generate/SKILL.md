---
name: ns-generate
description: "Neural Seam: bootstrap do backlog de um projeto ja conectado. Gera os insumos iniciais (spec, glossario, historias, modelo de dominio, backlog) e cria os cards a partir deles. Ative quando o projeto estiver ok com pending_jobs > 0, quando o dev quiser gerar o backlog/insumos iniciais, ou pedir /ns-generate."
---

# /ns-generate

Skill gerenciada pelo Neural Seam. Faz o **bootstrap do backlog** de um projeto ja pronto (`ok`): gera
os insumos iniciais e transforma o backlog em cards. Toda inferencia nasce de acao manual do dev (P2):
voce apresenta o prompt, o dev decide gerar; **nada e submetido automaticamente**.

## Acao a executar agora

1. (Opcional) Confirme o estado com a tool `check_setup`. Se nao estiver `ok`, redirecione para
   `/ns-start`.
2. Chame a tool `next_job`. Ela consome o job pendente de geracao de insumos e retorna `prompt` (o
   prompt de geracao renderizado) + `action_kind`. Apresente o `prompt` ao dev e **aguarde a
   confirmacao** - nao gere nada antes disso.
   - Se `next_job` retornar payload `blocked` (atividades bloqueadas por prerequisites), mostre quais e
     pare.
3. Quando o dev confirmar, gere os insumos: a spec do projeto, os docs de discovery (glossario,
   historias de usuario, modelo de dominio) e o backlog.
   - **Projeto brownfield** (o diretorio ja tinha codigo antes de ser conectado ao Neural Seam): quando
     isso e o caso, o `prompt` retornado por `next_job` ja vem com uma secao adicional sobre projeto
     brownfield, instruindo a rodar `analyze_existing_project` primeiro. Siga essa instrucao: leia o
     codigo real antes de escrever a spec, e limite o backlog aos gaps reais entre a entrevista e o que
     ja esta implementado - nao proponha cards para o que ja existe. Sem essa secao no prompt, o projeto
     e greenfield e a entrevista basta.
4. Persista com a tool `save_insumos`, passando `spec`, `glossary`, `user_stories`, `domain_model`,
   `backlog`. Confira o JSON de retorno (artifacts no backend + copias em disco).
5. Para cada item do backlog, chame a tool `create_activity` com `kind` (TECH, FEATURE, IMPROVE, BUG ou
   VERIFY), `title` e `description`. Guarde o `id` de cada card.
6. Resuma: insumos persistidos + cards criados. Feche sugerindo `/ns-list` e `/ns-exec <id>`.

Se qualquer tool retornar `error` (rede/auth), pare e oriente `neural-seam login` ou `/ns-doctor`.
