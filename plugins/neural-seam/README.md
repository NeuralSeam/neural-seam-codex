# neural-seam-codex

Bundle de plugin do **Neural Seam** para o **Codex CLI**. Empacota as skills `$neural-seam:ns-*` - a superficie de
onboarding e de loop de trabalho - para que elas fiquem disponiveis em qualquer projeto da maquina, sem
serem versionadas no repositorio do desenvolvedor.

Content-only: markdown e json, sem toolchain de codigo.

## Instalacao

Sao **dois passos, nesta ordem**. O verbo de instalacao resolve o plugin contra marketplaces **ja
configurados** - ele nao aceita URL nem caminho -, entao registrar o marketplace vem primeiro:

```
codex plugin marketplace add NeuralSeam/neural-seam-codex
codex plugin add neural-seam@neural-seam
codex plugin list
```

O `list` deve mostrar `neural-seam@neural-seam` como `installed, enabled`. Um plugin registrado porem
**desabilitado** carrega zero skills, e e por isso que o runtime trata esse estado como ausente e volta
a orientar a instalacao.

O bundle e **obrigatorio por host**. Sem ele voce fica so com o guia de entrada que o runtime
materializa no projeto, e o que voce consegue fazer passa a depender do que aquela maquina instalou -
que e exatamente a divergencia de experiencia que o bundle existe para fechar. O `neural-seam connect`
e o `neural-seam doctor` orientam a instalacao quando detectam o host sem o bundle; eles **nunca
bloqueiam** por causa disso.

## O que este bundle NAO faz (limitacoes estruturais, nao pendencias)

- **Nao registra o servidor MCP e nao instala hooks.** O formato de plugin deste host nao os carrega: os
  manifestos dos plugins distribuidos declaram apenas `skills`, e a feature de hooks de plugin esta
  marcada como `removed`. Quem fia MCP e hooks e o **runtime**, no `config.toml` e no `hooks.json` do
  escopo do usuario, com ou sem este bundle instalado. Consequencia pratica: **instalar o bundle nao
  substitui `neural-seam connect`**.
- **Nao empacota o binario `neural-seam`.** O binario e pre-requisito e se instala a parte.
- **Nao substitui `neural-seam login` / `connect`.** Device flow, manifesto assinado e vinculo de
  projeto sao estado de produto e continuam no runtime.
- **Nao imita o cliente oficial do host.** Este bundle e uma extensao explicita (compliance P4).

## Incerteza declarada

Nao ha evidencia, ate aqui, de que **prompts** e arquivos de **rules** sejam empacotaveis por este
formato. Os itens ficaram sem sondar no levantamento da superficie do host, e estao registrados como
incerteza, nao como fato - se voce confirmar num ou noutro sentido, atualize esta secao.

## Comandos slash e skills

O formato de plugin registra skills, mas nao instala comandos slash diretamente. Este bundle fornece
templates de *custom prompts* para preencher o menu `/`. A partir da raiz deste repositorio, instale-os
no perfil local do Codex:

```powershell
.\plugins\neural-seam\scripts\install-prompts.ps1
```

Reinicie o Codex ou abra uma nova conversa. Use `/prompts:ns-start` (e os demais `/prompts:ns-*`).
O namespace `prompts:` e exigido pelo Codex; o manifesto nao pode registrar `/ns-start` diretamente.
As skills tambem podem ser chamadas com `$neural-seam:ns-*`; os prompts encaminham para elas.

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

## Contrato de identidade

O nome do bundle e o do servidor MCP sao **contrato acoplado** ao runtime: o managed-cleanup do runtime
reconhece o que e gerenciado por marcador, entao divergir de um lado sem o outro gera dupla-fiacao ou
limpeza errada. Mudar qualquer um exige mudar o par no runtime no mesmo release.
