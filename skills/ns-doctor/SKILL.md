---
name: ns-doctor
description: "Neural Seam: diagnostica e remedia o ambiente (auth, language servers, registro do projeto) via `neural-seam doctor --fix`, e confere o registro do servidor MCP neural-seam-runtime e o estado do hook trust. Ative quando as tools do Neural Seam falharem, o servidor MCP nao aparecer, os hooks nao dispararem, houver erro de auth/rede, ou o dev pedir /ns-doctor."
---

# /ns-doctor

Skill gerenciada pelo Neural Seam. Diagnostica e remedia o ambiente, depois confere as duas coisas que
neste host falham **em silencio**: o registro do servidor MCP e o *hook trust*.

## Acao a executar agora

1. Rode no terminal `neural-seam doctor --fix`. Esse comando remedia auth (device flow), language
   servers e o registro do projeto, e re-verifica o resultado. Mostre a saida ao desenvolvedor.

2. Confira o registro do MCP. **Este bundle nao registra o servidor MCP** - ele carrega apenas skills,
   porque o formato de plugin deste host nao empacota servidor MCP nem hook. Quem registra e o proprio
   runtime, no `config.toml` do **escopo do usuario** (honra `CODEX_HOME`), na entrada
   `[mcp_servers.neural-seam-runtime]`. Como o servidor resolve o projeto pelo diretorio de trabalho,
   **um** registro atende todos os projetos.

   - O registro e user-scoped **de proposito**: este host so carrega config de projeto dentro de um
     diretorio marcado como *trusted*, o trust nao e herdado de diretorio pai, e num projeto nao-trusted
     o registro e ignorado **sem erro e sem aviso**. Mover a entrada para um arquivo de projeto a mao
     compra esse silencio.
   - A entrada precisa carregar `default_tools_approval_mode = "approve"`. Sem ela - **e tambem com o
     valor `auto`** - a primeira chamada de tool morre cancelada antes de o servidor ser consultado.
   - O binario chamado deve estar atualizado: `neural-seam version` e, se houver release mais novo,
     `neural-seam upgrade`.

3. Se o servidor `neural-seam-runtime` nao aparecer na sessao, confira nesta ordem:
   - `neural-seam version` responde (binario no PATH);
   - o bundle esta instalado e habilitado (`codex plugin list`);
   - a entrada `[mcp_servers.neural-seam-runtime]` existe no `config.toml` do usuario.

4. **Hooks: escrito nao e ativo.** Este host so executa um hook apos um ato de *hook trust* que ele
   persiste, e o trust e atrelado ao **hash do conteudo** do hook. Consequencias que o dev precisa
   entender antes de concluir que algo quebrou:

   - Enquanto o trust nao for concedido, nada dispara, e o diagnostico do proprio host **nao** sinaliza
     "hook presente mas inerte". Quem reporta isso e o `neural-seam doctor`, que lista os eventos
     inertes.
   - Para conceder: abra uma sessao do Codex CLI (`codex`) e aceite o hook. O trust e um controle de
     seguranca do host - o runtime **apenas le** esse campo e nunca escreve o hash de confianca.
   - **Atualizar o runtime derruba o trust** de todo projeto ja conectado, porque muda o conteudo
     renderizado. Os hooks voltam a ficar inertes ate o dev reconceder. Nao e defeito: e o modelo de
     seguranca do host.
   - "Nunca confiado" e "confiado e depois reescrito" sao **indistinguiveis** olhando o arquivo (as duas
     situacoes aparecem como inertes), justamente porque o runtime nao grava o campo. So o
     `neural-seam connect` separa os dois casos, porque compara antes e depois na mesma execucao.
   - Defeito conhecido de **apresentacao** (nao e falha de trust): o relatorio classifica por entrada de
     hook, e o evento pre-tool tem duas entradas, entao ele aparece repetido na linha de inertes.

5. Resuma para o desenvolvedor o que foi corrigido e o que ainda precisa de acao manual - em especial se
   o hook trust estiver pendente, que e a causa mais provavel de "instalei e nada acontece".
