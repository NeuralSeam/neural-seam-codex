# Changelog

All notable changes to the Neural Seam Codex bundle are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Tags use the `neural-seam-codex-v*` prefix.

## [Unreleased]

### Added

- **Bundle inicial**: `.codex-plugin/plugin.json` declarando `skills`, mais as 11 skills `/ns-*`
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
