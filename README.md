# neural-seam-codex

**Marketplace** de plugins do Neural Seam para o **Codex CLI**. Este repositorio nao e um plugin: ele e
o catalogo que o host consome, e o plugin `neural-seam` vive dentro dele.

Content-only: markdown e json, sem toolchain de codigo.

## Por que a raiz e um marketplace, e nao o plugin

O verbo de instalacao deste host resolve o plugin contra marketplaces **ja configurados**; ele nao
aceita URL nem caminho de repositorio. Um repo que carregue apenas `.codex-plugin/plugin.json` na raiz
**nao e instalavel** - o host nao tem por onde comeca-lo. O que ele consome e o manifesto de
marketplace, que declara o proprio nome e aponta os plugins que distribui.

Layout, espelhando o dos marketplaces que acompanham o host:

```
.agents/plugins/marketplace.json    catalogo: nome do marketplace + plugins que ele distribui
plugins/neural-seam/                o plugin em si
  .codex-plugin/plugin.json         manifesto do plugin (nome, versao, skills)
  skills/ns-*/SKILL.md              as 11 skills da superficie
  prompts/ns-*.md                   templates dos comandos slash
  scripts/install-prompts.ps1       instala os templates no perfil do Codex
```

## Instalacao

```
codex plugin marketplace add NeuralSeam/neural-seam-codex
codex plugin add neural-seam@neural-seam
codex plugin list
```

O `list` deve mostrar `neural-seam@neural-seam` como `installed, enabled`.

O bundle e **obrigatorio por host**. Sem ele voce fica so com o guia de entrada que o runtime
materializa no projeto, e o que voce consegue fazer passa a depender do que aquela maquina instalou -
exatamente a divergencia de experiencia que o bundle existe para fechar. O `neural-seam connect` e o
`neural-seam doctor` orientam a instalacao quando detectam o host sem o bundle; eles **nunca bloqueiam**
por causa disso.

## Contrato de identidade (acoplado ao runtime)

O runtime deriva a referencia `neural-seam@neural-seam` de `<nome do plugin>@<nome do marketplace>` e
sonda o estado lendo a tabela de plugins do config do host. Logo **tres nomes tem de casar**:

| Onde | Campo | Valor |
| ---- | ----- | ----- |
| `.agents/plugins/marketplace.json` | `name` | `neural-seam` |
| `plugins/neural-seam/.codex-plugin/plugin.json` | `name` | `neural-seam` |
| adapter do runtime | `PluginName` / `PluginMarketplace` | os dois acima |

Mudar qualquer um sem o par no runtime quebra a deteccao **em silencio**: o dev instala o bundle e o
`connect` segue mandando instalar. Mudar um lado exige mudar o outro no mesmo release.

## O que este bundle NAO faz (limitacoes estruturais, nao pendencias)

- **Nao registra o servidor MCP e nao instala hooks.** O formato de plugin deste host nao os carrega:
  os manifestos dos plugins distribuidos declaram apenas `skills`, e a feature de hooks de plugin esta
  marcada como `removed`. Quem fia MCP e hooks e o **runtime**, no escopo do usuario, com ou sem este
  bundle instalado. Consequencia pratica: **instalar o bundle nao substitui `neural-seam connect`**.
- **Nao empacota o binario `neural-seam`.** O binario e pre-requisito e se instala a parte.
- **Nao substitui `neural-seam login` / `connect`.** Device flow, manifesto assinado e vinculo de
  projeto sao estado de produto e continuam no runtime.
- **Nao imita o cliente oficial do host.** Este bundle e uma extensao explicita (compliance P4).

## Comandos slash e skills

O formato de plugin do Codex registra skills, mas nao instala comandos slash diretamente. Para a
superficie aparecer no menu `/`, o bundle fornece templates de *custom prompts*. Instale-os no perfil
local do Codex (eles sao intencionalmente user-scoped):

```powershell
.\plugins\neural-seam\scripts\install-prompts.ps1
```

Reinicie o Codex ou abra uma nova conversa. Os comandos aparecerao como `/prompts:ns-*` — por exemplo,
`/prompts:ns-start`. O namespace `prompts:` e exigido pelo Codex; nao e possivel registrar `/ns-start`
diretamente pelo manifesto do plugin.

As skills continuam disponiveis sem o instalador, por invocacao explicita com `$neural-seam:ns-*` ou
pela selecao automatica do Codex. Os prompts slash encaminham para essas mesmas skills.

| Slash command | Skill direta | O que faz |
| ----- | --------- |
| `/prompts:ns-status` | `$neural-seam:ns-status` | Bussola: diz o estado e o proximo comando. |
| `/prompts:ns-start` | `$neural-seam:ns-start` | Motor guiado: le o estado e avanca um passo. |
| `/prompts:ns-create` | `$neural-seam:ns-create` | Nao tenho projeto: mostra o link do wizard. |
| `/prompts:ns-connect` | `$neural-seam:ns-connect` | Ja criei no wizard: vincula o projeto a esta pasta. |
| `/prompts:ns-clone` | `$neural-seam:ns-clone` | Clona so o codigo (idempotente). |
| `/prompts:ns-doctor` | `$neural-seam:ns-doctor` | Repara o ambiente e confere registro MCP e hook trust. |
| `/prompts:ns-generate` | `$neural-seam:ns-generate` | Bootstrap do backlog: gera insumos e cria os cards. |
| `/prompts:ns-list` | `$neural-seam:ns-list` | Lista os cards, agrupados por status. |
| `/prompts:ns-open` | `$neural-seam:ns-open` | Mostra o link do dashboard/bridge local. |
| `/prompts:ns-exec` | `$neural-seam:ns-exec` | Renderiza o prompt do card para implementar. |
| `/prompts:ns-help` | `$neural-seam:ns-help` | Indice das skills e o fluxo tipico. |

O **vocabulario de conceitos** e o invariante entre hosts: os mesmos nomes logicos, o mesmo papel, o
mesmo corpo. Como cada CLI grafa a invocacao e particularidade dela, nao do Neural Seam - quem troca de
host reaprende a CLI, nunca o Neural Seam.
