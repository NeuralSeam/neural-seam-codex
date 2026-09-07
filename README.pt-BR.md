# Neural Seam para o Codex CLI

Guia curto em português. A documentação canônica é o [README.md](./README.md), em inglês, e é ele que
fica em dia primeiro.

Adaptador do **Neural Seam** para o **OpenAI Codex CLI**, distribuído como plugin do Codex. Instalar
registra o servidor MCP `neural-seam-runtime` e adiciona as 11 skills `$neural-seam:ns-*`. Tudo aponta
para o binário `neural-seam` no seu `PATH`.

> **O Neural Seam não fornece modelo e não roda inferência.** Ele coordena o trabalho: a
> especificação, o glossário, o backlog, os cards e as convenções por caminho do seu projeto vivem no
> Neural Seam e são servidos ao seu agente por MCP. O modelo com quem você fala é o que o seu Codex
> CLI já usa, cobrado por quem o fornece. O Neural Seam nunca se autentica num provedor de modelo no
> seu lugar.

## Pré-requisitos

| Você precisa de | Como obter | Conferir com |
| --- | --- | --- |
| Codex CLI | instalador da OpenAI | `codex --version` |
| o binário `neural-seam` no `PATH` | [instalador do Neural Seam](https://github.com/NeuralSeam/neural-seam-releases#download-and-install) | `neural-seam version` |
| conta Neural Seam, autenticado | `neural-seam login` (device flow) | `neural-seam doctor` |
| projeto vinculado a esta pasta | `neural-seam connect <projectId>`, ou o painel local | `$neural-seam:ns-status` |

## Instalação

Dois passos, nesta ordem. O verbo de instalação deste host resolve o plugin contra marketplaces **já
configurados**, então o marketplace vem primeiro.

```sh
codex plugin marketplace add NeuralSeam/neural-seam-codex
codex plugin add neural-seam@neural-seam
codex plugin list
```

O `list` deve mostrar `neural-seam@neural-seam` como `installed, enabled`. Plugin registrado porém
**desabilitado** carrega zero skills e nenhum registro MCP.

Para atualizar: `codex plugin marketplace upgrade` e instalar de novo. Para remover:
`codex plugin remove neural-seam@neural-seam` (leva as skills e o registro MCP junto).

**Vindo da 0.2.0: apague o que o `install-prompts.ps1` deixou.** Ele copiou 11 arquivos para o seu
perfil do Codex, e nada os remove: não fazem parte do plugin, então o `codex plugin remove` nunca os
toca, e eles seguem mostrando entradas `/prompts:ns-*` velhas no menu `/`.

No PowerShell:

```powershell
Remove-Item "$HOME\.codex\prompts\ns-*.md"
```

Em shells Unix:

```sh
rm -f ~/.codex/prompts/ns-*.md
```

## Aprovação das tools

Este host pergunta antes de deixar uma chamada de tool passar, e **o bundle não pode responder por
você**: um modo de aprovação escrito no arquivo MCP de um plugin é descartado pelo CLI. A configuração
fica no seu próprio Codex.

Se as tools aparecem mas a primeira chamada volta cancelada, é essa pergunta, não um servidor
quebrado. O `neural-seam doctor` informa se a aprovação está no lugar.

## Primeiro uso

```
$neural-seam:ns-start
```

É a resposta inteira para "e agora?". Ele lê o estado e avança um passo: autenticar, criar ou escolher
um projeto, vincular, e parar. Rode de novo para o passo seguinte; repetir só faz o que falta.

Depois:

```
$neural-seam:ns-generate     # gera o backlog
$neural-seam:ns-list         # escolhe um card
$neural-seam:ns-exec <id>    # renderiza o prompt de implementação do card
```

Os dois últimos são o laço do dia a dia.

## Skills

Este host invoca as skills de um plugin como `$<plugin>:<skill>`, então `$neural-seam:` faz parte do
nome.

| Skill | O que faz | Oferecida sozinha? |
| --- | --- | --- |
| `$neural-seam:ns-status` | Diz o estado e qual comando vem a seguir. | sim |
| `$neural-seam:ns-start` | Guiado: lê o estado e avança um passo. | sim |
| `$neural-seam:ns-create` | Ainda não há projeto: mostra o link do assistente. | sim |
| `$neural-seam:ns-list [status] [kind]` | Lista os cards, agrupados por status. | sim |
| `$neural-seam:ns-open` | Mostra o link do painel local. | sim |
| `$neural-seam:ns-connect [<id>]` | Projeto já existe: vincula a esta pasta. | não |
| `$neural-seam:ns-clone <id>` | Clona só o código. Idempotente. | não |
| `$neural-seam:ns-doctor` | Repara o ambiente: login, language servers, registro MCP. | não |
| `$neural-seam:ns-generate` | Gera os insumos e cria os cards. | não |
| `$neural-seam:ns-exec <id>` | Renderiza o prompt de implementação de um card. | não |
| `$neural-seam:ns-help` | Índice de todas as skills acima. | sim |

**A coluna "oferecida sozinha" é decisão, não acaso.** Toda skill que escreve (em disco, no backend ou
no seu ambiente) declara `allow_implicit_invocation: false`, então o modelo não decide sozinho clonar
um repositório, gerar um backlog ou mexer na sua configuração. Essas cinco rodam quando **você** as
nomeia. Todas as 11 continuam invocáveis explicitamente.

## O que o bundle não fia, e por quê

**Hooks de ciclo de vida não vão neste bundle, e isso é decisão de arquitetura, não limite do
formato.** O formato de plugin do Codex oferece um canal de hooks. Mesmo assim, quem instala hooks
neste host é o runtime, na sua configuração de usuário: duas fontes concorrentes para a mesma
integração significam dois lugares para desligar e um para esquecer. A decisão pode ser revista.

Detalhe medido, porque ele contradiz a documentação oficial: neste CLI o validador de publicação
recusa o campo `hooks` **no manifesto**, embora a documentação o descreva como válido. Os números da
medição estão no [README.md](./README.md#compatibility).

**Aprovação de tool também não vai no bundle**: o CLI descarta o modo de aprovação escrito no arquivo
MCP do plugin.

Os dois seguem com o runtime. Por isso **instalar o bundle não substitui `neural-seam connect`**.

## Onde pedir ajuda

- Dúvidas e bugs deste bundle: [SUPPORT.md](./SUPPORT.md)
- Vulnerabilidade: [SECURITY.md](./SECURITY.md) (não abra issue pública)
- Dados: [PRIVACY.md](./PRIVACY.md)
- Conta, plano ou projeto: <https://app.neuralseam.cloud>

## Licença

MIT, veja [LICENSE](./LICENSE). A licença cobre o conteúdo deste repositório; ela não concede direitos
sobre o nome nem sobre a marca Neural Seam, veja [TRADEMARKS.md](./TRADEMARKS.md).
