# Changelog

All notable changes to the Neural Seam Codex bundle are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Tags use the `neural-seam-codex-v*` prefix.

## [Unreleased]

### Changed

- **Primeiro run: clonar antes de vincular.** O `ns-start` trata o status novo `needs_clone` do
  `check_setup` (projeto acessivel na nuvem, codigo ausente nesta pasta) roteando para
  `$neural-seam:ns-clone <projectId>` **antes** de qualquer `connect`, com o id vindo do proprio
  `check_setup`. Junto vai a **trava de pasta**: depois do clone e preciso reabrir a sessao dentro da
  subpasta clonada, senao o MCP resolve a raiz pelo cwd antigo e o manifesto nasce na pasta pai, longe
  do codigo.
- **Recusa do guard de raiz nunca e engolida.** `ns-start`, `ns-status` e `ns-connect` passam a tratar a
  recusa do `connect` (diretorio que nao e clone do repositorio do projeto) como resultado a mostrar ao
  dev, conduzindo ao clone. Seguir adiante como se o vinculo tivesse ocorrido reproduziria o mesmo bug
  com outra roupa.
- **Card de setup do Aspire cumprido** (`ns-start`): confirmado o Aspire na mesma sessao, a skill procura
  o card pelo titulo estavel, **apresenta** a opcao de fecha-lo e **aguarda a confirmacao do dev** antes
  de escrever. A fronteira P2 esta escrita na propria skill: vale na sessao que o dev disparou, nunca por
  evento remoto.

- **Invocacao no Codex**: adicionados templates de custom prompts e o instalador PowerShell. Depois de
  instalados no perfil do Codex, os comandos aparecem como `/prompts:ns-*` e encaminham para as skills
  `$neural-seam:ns-*`. O namespace `prompts:` e obrigatorio para comandos customizados.

### Added

- **Bundle inicial**: `.codex-plugin/plugin.json` declarando `skills`, mais as 11 skills `$neural-seam:ns-*`
  (`ns-clone`, `ns-connect`, `ns-create`, `ns-doctor`, `ns-exec`, `ns-generate`, `ns-help`, `ns-list`,
  `ns-open`, `ns-start`, `ns-status`). Os corpos sao os mesmos nomes logicos e os mesmos papeis dos
  outros hosts: o invariante e o vocabulario de conceitos, nao a string de invocacao.
- **`ns-doctor` proprio deste host**, porque a historia de diagnostico diverge de verdade aqui: o
  registro MCP e user-scoped (config de projeto so carrega em diretorio trusted, e falha em silencio
  fora dele), a entrada precisa de `default_tools_approval_mode = "approve"` (com `auto` a primeira
  chamada de tool morre cancelada), e os hooks nascem **inertes** ate o *hook trust* ser concedido -
  com o agravante de que o trust segue o hash do conteudo, entao atualizar o runtime o derruba em todo
  projeto ja conectado.

### Notas de fronteira

- O bundle **nao** carrega registro MCP nem hooks: o formato deste host nao os empacota (os manifestos
  distribuidos declaram apenas `skills`, e a feature de hooks de plugin esta `removed`). Quem fia e o
  runtime. Instalar o bundle **nao** substitui `neural-seam connect`.
- Compliance P4: extensao explicita, nao imita o cliente oficial do host, nao empacota o binario Go e
  nao substitui `login`/`connect`.
