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

## 5. A grade: duas colunas, e não quatro faixas

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. A coluna "No celular" usa
fator 0,30.

A tela é lida da esquerda para a direita, e a partida também: **pega à esquerda,
monta à direita.**

```
┌──────────────┬──────────────────────────┐
│  prateleira  │                          │
├──────────────┤   o chassi, grande       │
│   o rack     │   mascote no vão         │
│  (2 colunas) │                          │
└──────────────┴──────────────────────────┘
```

| Móvel | Centro | Tamanho | Conteúdo | No celular |
|---|---|---|---|---|
| Header | — | 1280 x 72 | pílula do nível, recado, `?` em (1218, 36) | `?` toque 122 x 122 → 37 |
| Prateleira | (208, 146) | 344 x 108 | 3 nichos de 86; troféu 68 | 26; 20 |
| Rack | (208, 428) | 344 x 436 | 4 a 6 fichas de 122 em 2 colunas | 37 |
| Mascote | (508, 230) | ø 148 | a tela de parede | — |
| Chassi | (900, 400) | 560 x 560 | a máquina | — |

A composição anterior era horizontal — prateleira em cima, máquina no meio, rack
embaixo — e a máquina, que é a coisa que a criança precisa enxergar, ficava com
437px espremidos entre dois móveis. Em pé, o chassi tem a metade direita inteira
e 560.

Dentro do chassi, relativo ao centro (900, 400):

| Peça | Deslocamento | Desenho | Área de toque | No celular |
|---|---|---|---|---|
| arte do chassi | (0, -19) | 560 x 560 | — | — |
| visor do pedido | (-5, -118) | 232 x 86 | — | — |
| bandeja azul | (-81, +40) | 170 x 118 | 180 x 126 | 54 x 38 |
| leitor roxo | (+106, +40) | 113 x 113 | 180 x 150 | 54 x 45 |
| TESTAR | (-1, +151) | ø 97 | 150 x 112 | 45 x 34 |

Estes deslocamentos são medidos **na arte**, com a tecla `P` (ver
`scenes/tuner.ts`). Quando o `s` muda, todos mudam junto pelo mesmo fator — foi
assim que se passou de 437 para 560.

Não existe barra, bolinha nem porcentagem de progresso em lugar nenhum. O que a
criança tem para olhar é a prateleira.

---

## 6. Níveis

Três níveis, três montagens cada. A escada tem um degrau por nível, e cada um
tira uma muleta da criança.

| Nível | O que resolve a montagem | O que deixa de bastar |
|---|---|---|
| 1 | acertar o TIPO de cada entrada | — |
| 2 | escolher o par que atende o pedido | ter um par que funciona |
| 3 | escolher o PROGRAMA certo para a peça | olhar a peça |

### Nível 1 — Laboratório

Quatro fichas: 2 peças e 2 programas. **Um par completo por rack** — acertar o
tipo de cada entrada já resolve quase tudo.

| Montagem | Pedido | Par certo | Rack |
|---|---|---|---|
| 1 | tocar música | caixinha + app de música | mouse, caixinha, app de música, app de desenho |
| 2 | tirar uma foto | câmera + app de fotos | câmera, teclado, app de música, app de fotos |
| 3 | dançar | robô + dancinha | impressora, robô, dancinha, app de escrever |

### Nível 2 — Galpão

Seis fichas: 3 peças e 3 programas, e **mais de um par que funciona de
verdade**. A decisão deixa de ser "o que cabe aqui" e vira "o que faz o que foi
pedido".

| Montagem | Pedido | Par certo | Rack | O que ela ensina |
|---|---|---|---|---|
| 1 | tirar uma foto | câmera + app de fotos | caixinha, câmera, robô, app de música, app de fotos, dancinha | três pares completos: dois funcionam e nenhum dos dois é o pedido |
| 2 | desenhar | tela + app de desenho | impressora, mouse, tela, app de escrever, joguinho, app de desenho | o mouse e o joguinho não mandam em nada que esteja ali |
| 3 | escrever | impressora + app de escrever | teclado, impressora, tela, app de desenho, app de escrever, app de música | a peça menos óbvia: quem põe a palavra no papel não é o teclado |

O nível 2 é o que finalmente usa o veredito **`off-goal`**. Até aqui ele era um
ramo do `outcomeOf` que nenhuma partida alcançava, porque nunca havia um segundo
par certo no rack para a criança montar por engano — e é ele que produz a frase
"Funcionou, mas eu pedi outra coisa."

O tutorial do 2 não reensina a máquina: são duas falas, uma no rack e uma no
visor, sobre o que mudou.

### Nível 3 — Depósito

Seis fichas, e agora **a mesma peça aparece em pedidos diferentes**. A tela
desenha e a tela escreve; a caixinha toca música e a caixinha desperta. Olhar a
peça deixa de bastar: quem decide é o programa.

| Montagem | Pedido | O que fecha | O que engana |
|---|---|---|---|
| 1 | desenhar | tela + app de desenho | tela + app de escrever — a mesma peça, e escreve de verdade |
| 2 | escrever | tela **ou** impressora + app de escrever | tela + app de desenho; câmera + app de fotos |
| 3 | tocar música | caixinha + app de música | caixinha + despertador — desperta, e desperta não é tocar |

O tutorial do 3 troca as duas falas: "aqui a mesma peça serve para mais de um
pedido" e "quem decide é o programa; olhe o visor antes de escolher".

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
  if (!commands(softwareId, hardwareId)) return 'mismatch'
  return item(softwareId).goal === build.goal ? 'ok' : 'off-goal'
}
```

O veredito é **função do que está encaixado no instante do toque**. Não existe
campo `correto` em botão nenhum, e a montagem **não guarda a resposta**: a mesma
caixinha de som é o acerto do pedido de música e o fracasso engraçado do pedido
de foto.

### Um programa manda em várias peças

`COMMANDS` é de um para muitos, porque o mundo é assim: para escrever serve o
teclado, serve a tela, serve a impressora.

```ts
'app-escrever': ['teclado', 'tela', 'impressora'],
```

Quando a lista era um par só, o jogo respondia "Teclado não sabe escrever" — uma
frase que a criança sabe que é falsa, e frase falsa ensina errado. **Quase toda
montagem tem mais de uma resposta certa**, e o troféu que sobe para a prateleira
é a peça que ela encaixou, não um gabarito.

O que continua errado é o que continua errado de verdade: mandar tocar música
num mouse, mandar desenhar num robô.

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

**Três falas no nível 1, uma em cada um dos outros.** Todas puláveis, todas de
uma linha, e todas com o dedo batendo no lugar.

Quem carrega a explicação é o gesto, não a frase: cada passo acende UM lugar e
bate nele, na ordem exata do que a criança vai fazer.

| Nível | Passo | Frase | Recorte, e onde o dedo bate |
|---|---|---|---|
| 1 | 1 | `Escolha uma coisa aqui.` | o rack; dedo na primeira ficha |
| 1 | 2 | `E toque onde ela entra.` | as DUAS entradas juntas; dedo na que serve para aquela ficha |
| 1 | 3 | `Com as duas cheias, aperte o verde!` | o TESTAR; dedo nele |
| 2 | 1 | `Mais de um par funciona. Faça o que o visor pediu.` | o visor |
| 3 | 1 | `Quem decide é o programa, não a peça.` | o visor |

O dedo é sempre **toque parado com ondinha**, nunca trajeto de A para B: o
trajeto é o desenho universal de arrastar, e este jogo não tem arrasto.

### O que saiu do texto

Eram cinco falas no 1 e duas em cada um dos outros — leitura demais para quem
tem 7 anos e ainda soletra. Três coisas saíram, e nenhuma se perdeu:

| Saiu | Quem ensina agora |
|---|---|
| "Esta máquina só liga com DUAS coisas" | as duas entradas vazias e o botão apagado |
| "A bandeja azul só aceita PEÇA" | a gravura da `tipos.png`: um punhado de coisas que se pega |
| "O leitor roxo só aceita PROGRAMA" | a gravura da `tipos.png`: tiles de app |

E o que o desenho não disser, a TRAVA diz na hora do erro — que é quando a
criança quer saber.

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
