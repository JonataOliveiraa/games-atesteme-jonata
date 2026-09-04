# Fuga do Laboratório - EF02CO04

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

A criança **monta uma máquina**. O chassi da bancada tem duas entradas: uma
bandeja azul, que só aceita coisa que se pega, e um leitor roxo, que só aceita
ordem. Com as duas cheias acende o TESTAR, e é ela quem faz a máquina rodar.

Cada máquina que funciona sai da bancada e vai morar na prateleira de cima,
viva, até o fim da partida.

> **Histórico.** A primeira versão deste jogo era um quiz: um cartão na mesa e
> dois botões, `PEÇA` e `PROGRAMA`, com uma porta de três fechaduras contando o
> progresso. Foi jogada e recusada — sem mecânica, com a interface empilhada em
> faixas que não pertenciam ao cenário. O §14 registra o que sobrou e o que
> caiu.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF02CO04)** Diferenciar componentes físicos (hardware) e programas que
> fornecem as instruções (software) para o hardware.

Objeto: **Hardware e software**.

O teste da bolinha: **troque caixinha, câmera, app de música e dancinha por
bolinhas sem significado. O jogo muda?**

Muda, e em dois lugares. Sem saber se a coisa é física, a criança não sabe em
qual entrada ela cabe — a forma recusa. E sem saber o que o programa manda
fazer, ela não sabe qual ordem serve para aquela peça — o TESTAR faz besteira.

| Campo | Valor no jogo |
|---|---|
| Código | `EF02CO04` |
| Ano | 2º ano |
| Unidade | Mundo Digital |
| Objeto | Hardware e software |
| Verbo da habilidade | diferenciar |
| Evidência jogável | encaixar cada tipo na entrada dele e casar programa com a peça que ele comanda |

A habilidade não é perguntada, é **encenada**: peça sozinha fica parada, ordem
sozinha não tem onde rodar, e o programa errado faz a peça certa fazer besteira.

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF02CO04: **Museu Vivo do Computador**.

| Jogo | O que a criança faz | Diferença |
|---|---|---|
| Museu Vivo do Computador | Arrasta itens para grupos e monta kits. | Classificar e colecionar. |
| Fuga do Laboratório | Monta uma máquina e a liga. | Fazer funcionar: o acerto é a máquina rodando. |

---

## 3. O laço

```
o visor da máquina mostra o PEDIDO (tocar música, tirar foto, dançar)
→ a criança toca numa coisa do rack
→ toca na entrada onde ela acha que aquilo cabe
   ↳ tipo errado: a forma recusa, a gravura da entrada acende, TRAVA
   ↳ tipo certo: a coisa voa e encaixa
→ com as duas entradas cheias, o TESTAR acende
→ a criança aperta
   ↳ par certo e pedido atendido: a máquina FAZ, e sobe para a prateleira
   ↳ par errado: a máquina faz besteira, e as duas voltam para o rack
→ três máquinas na prateleira: laboratório ligado
```

Controle: **toque em toque**. Escolhe a coisa, escolhe onde ela entra. Nada de
arrastar. Tocar numa entrada **cheia** devolve o que está lá, de graça — mudar
de ideia não é errar.

---

## 4. Clareza para criança

| Conceito | Como a tela mostra |
|---|---|
| peça/hardware | bandeja azul, larga, com uma mão gravada |
| programa/software | leitor roxo, com fenda e uma seta gravada |
| a máquina precisa dos dois | duas entradas vazias, botão apagado |
| pronto para testar | o botão verde acende e pulsa |
| deu certo | a máquina faz o que foi pedido, e vai morar na prateleira |
| deu errado | fumacinha, papel rabiscado, e as duas coisas voltam |
| progresso | a prateleira enchendo de máquina ligada |
| mascote | tela de parede: aponta, comemora, fica em dúvida |

O nome de cada coisa aparece **uma vez**, no recado do topo, no instante em que
a criança toca nela — que é quando ela está olhando. As fichas do rack não têm
rótulo embaixo: seis textos de 18px numa fileira viram uma linha que ninguém lê.

---

## 5. A grade: três móveis, não quatro placas

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. A coluna "No celular" usa
fator 0,30.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| Header | 0 - 72 | pílula do nível, recado, `?` em (1218, 36) | `?` toque 122 x 122 | 37 x 37 |
| Prateleira | 76 - 188 | 3 nichos: as máquinas vivas | nicho 116; troféu 86 | 35; 26 |
| Bancada | 192 - 592 | o chassi (400 x 400) e a mascote na parede | ver abaixo | — |
| Rack | 594 - 718 | 4 a 6 fichas de peça e programa | ficha 118 | 35 |

Dentro do chassi, relativo ao centro (640, 392):

| Peça | Deslocamento | Desenho | Área de toque | No celular |
|---|---|---|---|---|
| visor do pedido | (0, -140) | 190 x 70 | — | — |
| bandeja azul | (-95, -10) | 150 x 104 | 176 x 136 | 53 x 41 |
| leitor roxo | (+95, -10) | 114 x 114 | 146 x 146 | 44 x 44 |
| TESTAR | (0, +110) | ø 120 | 152 x 152 | 46 x 46 |

Não existe barra, bolinha nem porcentagem de progresso em lugar nenhum. O que a
criança tem para olhar é a prateleira.

---

## 6. Níveis

**Só o nível 1 existe.** Regra do projeto: um nível para validação antes de
expandir.

| Nível | Montagem | Pedido | Par certo | Rack |
|---|---|---|---|---|
| 1 | 1 | tocar música | caixinha + app de música | mouse, caixinha, app de música, app de desenho |
| 1 | 2 | tirar uma foto | câmera + app de fotos | câmera, teclado, app de música, app de fotos |
| 1 | 3 | dançar | robô + dancinha | impressora, robô, dancinha, app de escrever |

Sempre 2 peças e 2 programas no rack: a decisão de **tipo** e a de **par** são
as duas reais.

Ideias para 2 e 3, quando o 1 passar: seis fichas no rack; dois programas que
servem para a mesma peça mas atendem pedidos diferentes; uma montagem em que a
peça certa é a menos óbvia (impressora para "escrever").

---

## 7. As regras, em código

```ts
export const SLOT_KIND: Record<Slot, ItemKind> = {
  tray: 'hardware',
  reader: 'software',
}

export const fits = (target: LabItem, slot: Slot) =>
  target.kind === SLOT_KIND[slot]

export function outcomeOf(build: Build, hardwareId: string, softwareId: string) {
  if (hardwareId === build.hardwareId && softwareId === build.softwareId) return 'ok'
  if (commands(softwareId, hardwareId)) return 'off-goal'
  return 'mismatch'
}
```

O veredito é **função do que está encaixado no instante do toque**. Não existe
campo `correto` em botão nenhum: a mesma caixinha de som é o acerto do pedido de
música e o fracasso engraçado do pedido de foto.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| montou de primeira | `CORRECT_ANSWER` | +10 |
| montou depois de errar | `CORRECT_ANSWER` | +5 |
| entrada recusou o tipo | `WRONG_ANSWER` + `lives.lose()` | 0 |
| TESTAR rodou errado | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número de ponto, acerto ou porcentagem aparece na tela.

---

## 8. O erro

Dois erros, e cada um ensina uma coisa diferente.

**A entrada recusa.** A criança levou um programa para a bandeja. A forma não
entra, a gravura da entrada acende, e a TRAVA mostra o item ao lado da gravura
com a frase: `A bandeja só aceita peça.` / `O leitor só aceita programa.` Depois
de dois erros na mesma montagem, a entrada certa pisca.

**O TESTAR roda errado.** As duas entradas estavam cheias, mas o programa não é
daquela peça. A máquina obedece: fumacinha, papel rabiscado, luz âmbar. Depois
as duas coisas aparecem lado a lado com o motivo escrito com o nome delas —
`Câmera não sabe tocar música.` As duas voltam para o rack e a mesma montagem
recomeça limpa.

O erro não pode ser:

| Não fazer | Motivo |
|---|---|
| buzina e "tente de novo" | não diz qual das duas coisas estava errada |
| relógio com derrota | pressa não ajuda a diferenciar hardware de software |
| notas ou porcentagens | padrão do catálogo proíbe placar textual |
| punir quem desencaixa | mudar de ideia é exploração, não desatenção |

---

## 9. Feedback

| Momento | Visual | Som |
|---|---|---|
| pega uma ficha | ela sobe e fica dourada | plim curto |
| entra na bandeja | voa em arco e encaixa | clique seco |
| entra no leitor | voa em arco e encaixa | bipe digital |
| entrada recusa | a entrada treme e a gravura acende | mola macia |
| duas cheias | o botão verde acende e pulsa | dois tons subindo |
| TESTAR | a máquina treme e as lâmpadas acendem | motor curto |
| funcionou | ondas, flash, papel ou faíscas, conforme o pedido | arpejo |
| máquina viva | ela sobe para o nicho e fica se mexendo | brilho subindo |
| rodou errado | fumaça e papel rabiscado | acorde descendo |
| fim do nível | confete e as três máquinas mexendo | fanfarra |

---

## 10. Tutorial

Cinco falas de uma linha, puláveis, no primeiro nível:

| Passo | Frase | Recorte |
|---|---|---|
| 1 | `Esta máquina só liga com DUAS coisas.` | o chassi inteiro |
| 2 | `A bandeja azul só aceita PEÇA: o que dá para pegar na mão.` | a bandeja, com dedo |
| 3 | `O leitor roxo só aceita PROGRAMA: quem dá as ordens.` | o leitor, com dedo |
| 4 | `Toque numa coisa daqui e depois onde ela entra.` | o rack, com dedo |
| 5 | `Com as duas cheias, aperte o botão verde!` | o TESTAR |

O botão `?` reabre. Sem narração.

---

## 11. Textura e Graphics

A regra que faltou na primeira versão: **o que é móvel é textura; o que voa,
some e pisca é `Graphics`.**

| Elemento | Onde |
|---|---|
| chassi da máquina | `chassi.png`, 4 estados |
| bandeja, leitor, TESTAR, moldura, nicho | `ui.png`, 12 quadros |
| prateleira de parede e rack | `moveis.png`, 2 quadros |
| itens | `itens.png` (pronto) |
| mascote | `mascote.png` (pronto) |
| cenário | `bg-laboratorio.png` (pronto) |
| ondas, flash, papel, fumaça, faísca | `Graphics` + kit `FX` |
| símbolo do pedido no visor | `Graphics` (4 glifos, mudam a cada montagem) |
| header e pílula do nível | `Graphics` (UI de plataforma, igual nos 49) |

Todo carregamento passa por `import.meta.glob`; todo consumo, por
`textures.exists()`. Cada peça tem desenho de reserva — o jogo é jogável sem os
três PNGs novos, e feio.

---

## 12. Registro

```
src/games/EF02CO04/fuga-do-laboratorio/
src/assets/games/EF02CO04/fuga-do-laboratorio/
```

| Campo | Valor |
|---|---|
| `id` | `056` |
| `slug` | `fuga-do-laboratorio` |
| `module` | `EF02CO04/fuga-do-laboratorio` |
| `skill` | `EF02CO04` |
| `years` | `[2]` |
| `tags` | `["hardware", "software", "montagem", "toque"]` |
| `order` | `115` |
| `points` | `60` |
| `icon` | `🔧` |

Também registrado em `src/data/gameInstructions.ts` e em
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`.

---

## 13. Arquivos

```
types.ts            LabItem, Build, Slot, Goal, Outcome
data/theme.ts       cores, fontes, frases das entradas
data/layout.ts      W/H + um objeto por móvel, com o porquê dos números
data/items.ts       ITEMS, PAIRS, fits(), outcomeOf(), wrongLine()
data/levels.ts      LEVELS: as montagens
scenes/BootScene.ts glob + corte das 5 folhas + createLoadingScreen
scenes/GameScene.ts orquestração. Não desenha nada.
scenes/machine.ts   o chassi: visor, duas entradas, TESTAR
scenes/rack.ts      o rack das fichas, com take/give
scenes/shelf.ts     a prateleira: o progresso
scenes/results.ts   o que sai da máquina no TESTAR
scenes/trava.ts     os dois erros
scenes/glyphs.ts    mão, seta e os símbolos de pedido
scenes/lab.ts       cenário e véu
scenes/mascot.ts    o retrato na tela de parede
scenes/hud.ts       a barra fina
scenes/audio.ts     WebAudio, sem arquivo
scenes/furniture.ts chaves de `moveis.png`
```

---

## 14. O que mudou na construção

### Da versão recusada, o que caiu

| Caiu | Motivo |
|---|---|
| cartão na mesa + dois botões gigantes | era escolha entre duas opções, sem nada a descobrir |
| gavetas PEÇA e PROGRAMA | viraram as duas entradas do chassi, que é onde a decisão tem consequência |
| porta com três fechaduras | medidor de progresso flutuando na parede; virou a prateleira de máquinas vivas |
| sala de pares como epílogo | o pareamento virou o miolo do jogo, não o último terço |
| bolinhas de sala no header | o progresso saiu do cabeçalho |

### O que sobreviveu

O véu do cenário, a mascote em retrato (agora numa tela de parede, com moldura),
a TRAVA que compara e volta para a mesma decisão, as frases concretas de erro, e
o `itens.png`.

### As decisões novas

**O botão TESTAR é da criança.** O jogo poderia julgar sozinho no instante do
segundo encaixe. Não julga: existe um momento em que as duas coisas estão na
máquina e nada aconteceu ainda, e é a criança quem escolhe apertar. É a
diferença entre ser corrigida e fazer.

**Tocar numa entrada cheia devolve, e não custa nada.** Sem essa saída, a
criança que encaixa de propósito no lugar errado — com 7 anos isso é exploração
— ficaria presa até apertar o TESTAR e perder uma vida por curiosidade.

**O erro do TESTAR é engraçado.** A máquina obedece à ordem errada e faz
besteira. É a lição inteira num gesto: o programa manda, a peça obedece, e
mandar a coisa errada dá no que dá.

**O rack guarda o vão da ficha que saiu.** Sem isso, cada desencaixe
rearranjaria a fileira e a criança perderia o endereço que já tinha decorado
com o olho.

**A prateleira diz mais que uma barra.** Ela conta quantas faltam e, ao mesmo
tempo, por que aquelas estão ligadas — cada troféu é uma peça que alguém mandou
funcionar.
