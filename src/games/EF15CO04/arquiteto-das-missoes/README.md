# Arquiteto das Missões — EF15CO04

**Aplicar a estratégia de decomposição: dividir um problema em partes menores,
resolver cada uma e combinar as soluções.**

Um pedido grande demais aparece na tela e **se parte**. A criança escolhe quais
partes estavam dentro dele, resolve cada uma, junta as duas no plano e aperta
VAI. A cozinha vazia vira a mesa posta.

## O arco é a habilidade

Não é um jogo de sequência com tema de planejamento — os três momentos **são**
os três verbos do EF15CO04, nesta ordem:

1. **DIVIDIR** — o cartão do pedido treme, encolhe e sobem embaixo dele dois
   encaixes vazios. A bandeja tem quatro cartas: duas são partes do pedido,
   duas não são. Só as que pertencem entram.
2. **RESOLVER** — cada parte abre sozinha, com seus três passos embaralhados e
   três encaixes numerados. É aqui que a parte vira uma receita própria.
3. **COMBINAR** — as duas partes resolvidas voltam como cartas com selo verde e
   entram no plano. **Qualquer ordem serve**, e isso é de propósito: o texto da
   BNCC diz que dá para fazer o sanduíche inteiro e depois o café, ou
   intercalar. Punir uma das ordens seria ensinar errado.

O VAI acende as partes uma a uma e a cena revela o resultado. A solução do
problema grande é, literalmente, a soma das partes pequenas.

## Reescrito do zero

A versão anterior tinha 4.200 linhas, cartões de texto com máquina de escrever,
briefs, relatórios, relógio de minutos, dependências explicadas por escrito,
duas faixas de trabalho, reaproveitamento de módulo e uma segunda passada de
divisão. Uma criança de 1º ano não lê nada disso.

Esta versão tem ~1.200 linhas e **nenhuma frase durante o jogo**. O que
sobrou de texto: o rótulo de uma palavra em cada carta (CAFÉ, SANDUÍCHE), o
`NÍVEL x de y` e duas frases no tutorial, que aparece uma vez.

O que a criança precisa entender está em pictograma: a chaleira no fogo, o pó
no filtro, o café sendo coado, o pão aberto, o recheio, o corte. São os 11
ícones de `icones-cafe.png` — ver [TEXTURAS.md](./TEXTURAS.md).

Ficou de fora, de propósito: minutos, dependências, paralelismo e reuso. São
ideias de otimização de plano, não de decomposição — e eram elas que enchiam a
tela de explicação.

## Três níveis, uma missão cada

| Nível | Missão | Partes |
|---|---|---|
| 1 | Café da Manhã | 2 — café, sanduíche |
| 2 | Festa da Escola | 3 — decoração, bolo, som |
| 3 | Horta da Escola | 4 — terra, sementes, água, cerca |

**A dificuldade sobe pelo tamanho do pedido.** Não há relógio, dependência
nem paralelismo: o que fica mais difícil é partir um pedido maior e manter as
partes na cabeça. As bolinhas do painel marcam as etapas dentro da missão —
4 no nível 1, 5 no 2, 6 no 3.

Acrescentar missão é escrever um `MissionDef` em `data/missions.ts` e pôr no
array de `data/levels.ts`; as cenas leem tudo dos dados, inclusive quantas
partes e quantos passos, e `LevelDef.missions` é uma lista, então um nível
pode ter mais de uma. Sobraram os pares antes/depois de **feira** e
**acampamento** sem grid de ícones — são as próximas.

## Sem entregar a resposta

Os encaixes vazios usam o ícone `vazio` (cantos + interrogação), **nunca** o
ícone da carta certa. Foi um erro que existiu por dez minutos nesta reescrita:
com o ícone certo em cinza no encaixe, a criança resolvia por pareamento de
desenho e nunca precisava pensar no pedido.

## Erro: TRAVA

Cartão errado balança, fica vermelho e esmaece — na divisão sai de jogo, na
ordenação volta ao normal para ser tentado de novo. Cada erro custa uma vida
(`WRONG_ANSWER` + `lives.lose()`). Na fase de combinar não existe erro
possível, porque não existe ordem errada.

## Pontos

+10 por fase sem erro, +5 com erro. São 4 + 5 + 6 = 15 fases nos três níveis →
150. Nenhum número aparece na tela; o progresso são as bolinhas do painel do
canto.

## Conversa com a plataforma

`runtimeGameBridge`. `stage` é o número do nível.

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez |
| `CORRECT_ANSWER` | ao fechar cada uma das quatro fases |
| `WRONG_ANSWER` | cada carta errada — custa uma vida |
| `CHECKPOINT` | a cada fase e a cada erro |
| `GAME_COMPLETED` | ao fim de **cada** nível, com `totalStages: LEVELS.length` |

`GAME_OVER` sai de `shared/hud/createLives`, nunca daqui.

## Se for mexer

**Cada missão tem seu próprio sheet de ícones** (`icones-cafe`,
`icones-festa`, `icones-horta`), e o `GameScene` aponta para o da missão da
vez com `applySheet` antes de montar as cartas. O índice do frame não é
escrito à mão: sai de `iconOrder` — objetivo, partes, distratoras, e então os
passos na ordem das partes. É a mesma regra para toda missão nova.

**Os ícones vêm do sheet.** `buildArt` em `scenes/cards.ts` tenta
nesta ordem: PNG solto `icone-<id>` → frame do sheet → desenho de
`scenes/icons.ts`. O desenho continua ali porque é ele que segura a missão
nova enquanto a arte dela não existe — foi assim que o Café da Manhã ficou
jogável antes de ter um pixel.


**A arte da missão é o palco.** `scenes/stage.ts` põe o `antes` em tela cheia
com um véu escuro por cima e guarda o `depois` em `alpha: 0`. No fim o véu
levanta e o `depois` aparece por cima. É por isso que o HUD apaga antes: nada
pode competir com a mesa posta.

**Botão que pulsa mora em container.** O VAI! foi desenhado uma vez com
coordenadas absolutas num `Graphics` e o tween de `scale` o arrastou para fora
do lugar, deixando o texto solto embaixo. Graphics escala em torno da própria
origem, não do desenho. Qualquer coisa que vá pulsar precisa ser um container
posicionado, com o desenho em coordenadas locais.

**`FX.shake` restaura a posição no fim.** Iniciar um tween de `y` logo depois
de chamar shake sem esperar faz o shake devolver o objeto ao ponto de partida
no meio do movimento. Aqui o `await` no shake é obrigatório.

## O que falta conferir com gente

- se uma criança entende, sem ninguém falar, que os quatro cartões de baixo
  não são todos do pedido;
- se os ícones do café (chaleira, filtro, coar) se separam à primeira vista;
- se as 6 cartas do nível 3, menores para caber na tela, ainda são
  confortáveis de tocar num celular;
- se a revelação da mesa posta dura o bastante para valer como prêmio.
