# Robô Pintor — planejamento

Jogo **098** (o `NEXT_FREE_ID` de hoje; confirmar no registro) · EF02CO02 ·
2º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md).
Ficha de origem: `docs/rodada-3/EF02CO02.md` (*Jardim das Repetições*),
**trocada pelo usuário em 30/09/2026**. A ficha repetia a mecânica do *Série do
Campeão* (R2, 054): tocar um botão exatamente N vezes. O usuário escolheu a
opção **"a criança escreve a plaquinha, a máquina executa"** e pediu um **tema
novo**. Nome aprovado: *Robô Pintor*. Arte: **vetor geométrico** (refs `23` e `24`).
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelos: `EF01CO06/maquina-dos-ajudantes`
e `EF01CO05/pescaria-dos-codigos`.

**Regras de sempre na rodada:** começou só com o **N1**, e o N2 e o N3 entraram em 02/10/2026 (§12); errou, perdeu (`WRONG_ANSWER` +
`lives.loseAll()`); 2º ano com guia **visual**; nada de texto nem de conceito de
adulto.

---

## 1. O jogo em uma frase

No quintal há uma **cerca de madeira crua** com algumas tábuas (3 a 5). Na ponta
dela, um **robô pintor** segura o pincel. Na **lousa** fica o programa dele: um
**laço** ↻ com dois passos dentro, **pinte** 🖌️ e **ande** ➡️, e um espaço
vazio `× ?`. Embaixo estão **3 cartões de número**. A criança **conta as tábuas**
e **toca no cartão** certo. O número vai para a lousa, e o robô **executa ao pé
da letra**: pinta, anda, pinta, anda… e a cada volta uma bolinha do laço acende.
Com o número exato, a cerca fica toda colorida e o robô para bem na frente do
**gato que dorme no fim da cerca**. Com um a mais, ele **pinta o gato**. Com um
a menos, sobra uma tábua sem tinta.

Um gesto só: **tocar num cartão**.

## 2. A habilidade, e por que não repete os irmãos

> **(EF02CO02)** Criar e simular algoritmos representados em linguagem oral,
> escrita ou pictográfica, construídos como sequências com repetições simples
> (iterações definidas) com base em instruções preestabelecidas ou criadas,
> analisando como a precisão da instrução impacta na execução do algoritmo.

| O que a BNCC pede | Onde acontece |
|---|---|
| algoritmo **pictográfico** | a lousa: ↻ [🖌️ ➡️] × 4 |
| **repetição com quantidade definida** | o número do laço diz quantas vezes o corpo roda; as bolinhas mostram cada volta |
| **criar** | a criança escreve o número que falta no programa |
| **simular** | o robô executa o programa na frente dela, passo a passo |
| **precisão** da instrução | um a mais pinta o gato, um a menos deixa tábua crua: o resultado muda por **um** número |

O exemplo oficial (*"ande um passo 10 vezes"*) é exatamente o corpo do laço: um
passo repetido N vezes.

| Jogo | O que a criança faz |
|---|---|
| *Desfile do Robô Repetidor* (R1, 009) | monta um **caminho de setas** numa grade |
| *Série do Campeão* (R2, 054) | **executa** a repetição com o dedo: toca N vezes |
| **Robô Pintor** | **escreve quantas vezes** e uma máquina executa |

**O teste da bolinha:** tire o número da lousa e o robô não sabe quando parar.
A decisão inteira é a quantidade de repetições.

## 3. O que mudou da ficha, e por quê

| Ficha (Jardim das Repetições) | Aqui | Motivo |
|---|---|---|
| tocar o botão da ação N vezes | **tocar num cartão de número**; o robô repete sozinho | repetia o Série do Campeão (decisão do usuário) |
| canteiro, regar, plantar, cavar | **cerca, pintar e andar** | tema novo, pedido do usuário; tábuas se contam num olhar |
| passarinho com prancheta | o **gato** no fim da cerca, que é a medida da precisão | um personagem só, e ele é o próprio estrago |
| vizinho Exagerado (N3) | continua no N3: é a **depuração** (§12) | é o "analisar a precisão" da ficha |
| TRAVA, reinício, +5 | **errou, perdeu**: o estrago acontece, as tábuas ganham números (a dica chega **depois**) | padrão da rodada |
| número em algarismo + bolinhas | mantido nos cartões e no laço | ficha |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; guia visual; `showLevelComplete` | PADRAO-R3 |
| 3 canteiros por sessão | **3 cercas** (3 fases) | ficha |

## 4. O laço do jogo

```
cerca nova entra (3 a 5 tábuas cruas) · o gato dorme no fim · o robô na ponta
· a lousa mostra ↻ [🖌️ ➡️] × ?  · 3 cartões de número embaixo
        │ toque num cartão
        ▼
   o cartão voa para o espaço × ? da lousa · o robô liga (bip)
   · para cada volta: a bolinha da volta acende · 🖌️ acende e o robô pinta a
     tábua da frente · ➡️ acende e ele anda uma tábua
   ┌───────────────────┼─────────────────────┐
 exato               a mais                 a menos
 a cerca fica toda   depois da última       o laço acaba antes; o robô para,
 pintada; o robô     tábua o robô pinta o   e sobra tábua crua brilhando
 para na frente do   GATO, que acorda com   (o gato continua dormindo)
 gato, que acorda    um pulo, colorido      │
 e ronrona           │                      │
 CORRECT_ANSWER      └──── números 1…n aparecem sobre as tábuas, e o
 (+10)                     número certo pisca · WRONG_ANSWER + loseAll → done
        ▼
   próxima cerca (outra cor de tinta) · depois de 3: showLevelComplete
```

## 5. A tela (1280 × 720)

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas em (40, 40), ocultas; 3 bolinhas em (150, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas |
| **lousa** | pintada no fundo, num cavalete, de (440, 90) a (840, 250) | o programa (código): ↻ em volta de 🖌️ e ➡️, e à direita `× [ ]` com as bolinhas das voltas embaixo |
| **cerca** | chão em y 540; tábuas de ~130 × 260; a 1ª tábua em x 250 | 3 a 5 tábuas (sprites), centradas conforme o total |
| **robô** | começa em x ≈ 160, pés em y 560, ~200 px | anda 130 px por volta |
| **gato** | logo depois da última tábua, em almofadinha, pés em y 560 | dormindo |
| **cartões** | y 650; x 440 / 640 / 840; 170 × 120 cada | número grande (DynaPuff) + bolinhas em fileira |

**Densidade:** 3 cartões + `?` = **4 alvos**. A cerca, o robô e o gato não
aceitam toque.

**Teclado:** `1` `2` `3` tocam os cartões; `H` repete o guia.

## 6. Cercas e cartões (`data/levels.ts`)

### As 3 cercas do N1

| Fase | Tábuas | Cartões (sempre em ordem crescente) | Certo no… | Tinta |
|---|---|---|---|---|
| 1 | 3 | 2 · **3** · 4 | meio | azul |
| 2 | 5 | 3 · 4 · **5** | direita | rosa |
| 3 | 4 | **4** · 5 · 6 | esquerda | verde-água |

Os cartões ficam **em ordem crescente**, como na régua, e por isso o lugar do
certo muda com o conjunto de números. A validação cobra que ele **não repita
o lugar** em fases seguidas. O certo tem sempre um vizinho de ±1 entre os
cartões: a precisão está em acertar **exatamente**.

**No máximo 2 a mais:** a 1ª volta a mais pinta o gato, e a 2ª pinta a grama
(um borrão na grama). Mais que isso não existe nos dados.

```ts
type Paint = 'blue' | 'pink' | 'teal' | 'yellow'   // #1CB0F6 · #FF86D0 · #2EC4A6 · #FFC800
interface FenceDef { id: string; boards: number; cards: [number, number, number]; paint: Paint }
interface LevelDef { level: number; fences: FenceDef[]; steps: 1 | 2; debug: boolean }

outcome(boards, n) => n === boards ? 'exact' : n > boards ? 'over' : 'under'
```

**`validateLevels(LEVELS)` no import:**
- 3 fases (≤ 5); N1 com tábuas de 3 a 5, números dos cartões de 1 a 6;
- cartões em ordem crescente, sem repetir, **exatamente um** igual a `boards`,
  e sempre um vizinho de ±1 do certo;
- nenhum cartão com mais de `boards + 2`;
- o lugar do certo (esquerda, meio ou direita) não se repete em fases seguidas;
- as tintas das fases são diferentes;
- N1: `steps === 1` e `debug === false`.

## 7. O erro

1. O robô executa **o número escolhido**, sem atalho: todas as voltas, com as
   bolinhas acendendo. O estrago acontece **na frente da criança**:
   - **a mais:** a tinta vai para o gato, que acorda num pulo, todo manchado da
     cor (engraçado), e o robô leva a mão à boca. Se forem 2 a mais, a última
     volta pinta a grama;
   - **a menos:** o robô para, e a(s) tábua(s) crua(s) brilham. O gato continua
     dormindo.
2. **A dica chega depois:** números 1, 2, 3… aparecem em cima das tábuas, um por
   um, e o número que era o certo pisca na lousa.
3. `WRONG_ANSWER` + `hud.lives.loseAll()`. A cena vai para `done`.

Sem vermelho e sem som áspero.

**Não é erro:** tocar na cerca, no robô, no gato ou na lousa; tocar enquanto o
robô trabalha (é ignorado); o `?`.

**Pontos:** +10 por cerca. **Estrelas:** 3 ao concluir.

**Pista que entrega (conferido):** os 3 cartões são iguais (mesma cor, mesmo
tamanho); nada acende antes da escolha; as tábuas **não têm números** até o
erro; o gato fica sempre no fim, qualquer que seja o número de tábuas.

## 8. O acerto e o fim

1. Na última volta, o robô pinta a última tábua, anda e para **bem na frente
   do gato**. As bolinhas do laço ficam todas acesas.
2. O gato acorda, se espreguiça e ronrona. O robô comemora. A cerca brilha de
   uma ponta à outra.
3. A cerca sai deslizando, e a próxima entra com tábuas cruas e outra lata de
   tinta.

**Fim do nível:** as 3 cercas pintadas aparecem lado a lado, pequenas, e o robô
acena. Confete. `showLevelComplete`: *"O robô faz exatamente o que você
escreve!"*

## 9. Guia visual (sem texto)

`shared/guide/createVisualGuide`, chave `ef02co02-l1`.

1. **Cerca de treino** (`demo`, não conta), com **2 tábuas**. O véu deixa a cerca
   acesa. O dedo **toca em cada tábua**, e os números **1** e **2** pulam nelas.
2. O véu abre os cartões (**1 · 2 · 3**). O dedo toca o **2**, que voa para a
   lousa. O robô executa: pinta, anda, pinta, anda, e para na frente do gato,
   que acorda feliz.
3. **A vez da criança.** A cerca 1 entra. O dedo **passeia pelos 3 cartões sem
   parar em nenhum** (`waitFor`) e sai no primeiro toque.

O `?` repete os passos 1 e 2.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| cartão | voa até a lousa e encaixa | toc |
| robô liga | a antena pisca | bip-bip |
| volta do laço | a bolinha acende | nota (sobe a cada volta) |
| pintar | pincelada, a tábua ganha cor com respingos | "shhlap" |
| andar | passinhos | tic-tic |
| exato | a cerca brilha, o gato ronrona | acorde + ronron |
| a mais | o gato pula colorido | "miau!" engraçado + trombone macio |
| a menos | a tábua crua brilha, "?" no robô | dois bips descendo |
| fim | cercas lado a lado, confete | fanfarra curta |

## 11. Ciclo da cena

`mode`: `intro · guide · choose · run · result · done · panel`. O toque só vale
em `choose`. `startFence` faz `++gen`, e a execução é um laço de verdade no
código (`for i < n`), com `await` por passo e `if (gen !== this.gen) return`. A
bridge segue a Garra: `CORRECT_ANSWER` por cerca, `WRONG_ANSWER` no erro,
`CHECKPOINT` com `progress = round(cercas / 3 × 100)`, `GAME_COMPLETED`.

## 12. Os níveis 2 e 3 (prontos desde 02/10/2026)

Os três níveis usam a mesma tela e o mesmo gesto (tocar num cartão). O que muda
está nos dados (`segments` e `preset` de cada cerca).

| Nível | Assunto | Como é |
|---|---|---|
| 1 | **um laço** | ↻[🖌️ ➡️] × ?, uma cor; 3, 5 e 4 tábuas |
| 2 | **dois laços, um depois do outro** | a cerca tem tábuas com **marca de giz** de duas cores (ex.: 1 azul + 3 amarelas). A lousa tem **dois laços**, cada um com a plaquinha na cor da sua tinta. A criança escreve o 1º número (o espaço da vez fica marcado), os cartões voltam, e ela escreve o 2º. O robô roda os dois laços em sequência |
| 3 | **depurar** | a lousa já vem **escrita, com um número errado**. O robô roda esse programa primeiro, e o estrago aparece **sem custo** (uma tábua da cor errada, o gato pintado, ou uma tábua crua). A tinta é **lavada**, a criança **toca no número errado** da lousa (ele vira "?"), os cartões aparecem, ela escolhe o certo, e o robô roda de novo |

**O erro** é o mesmo nos três: o robô executa tudo, as tábuas que não batem com
a marca de giz piscam, os números aparecem **por cor** (1, 2, 3 rosa; 1
verde-água), a lousa mostra os números certos, e sai `WRONG_ANSWER` +
`loseAll()`. No N3, consertar o laço que já estava certo também é erro.

**As cercas:**

| Nível | Cerca | Laços | Cartões | Programa pronto |
|---|---|---|---|---|
| 2 | 1 | 1 azul → 3 amarelo | 1 · 2 · 3 | — |
| 2 | 2 | 3 rosa → 1 verde-água | 1 · 2 · 3 | — |
| 2 | 3 | 2 amarelo → 2 azul | 1 · 2 · 3 | — |
| 3 | 1 | 2 verde-água → 2 rosa | 1 · 2 · 3 | **3** e 2 (pinta uma tábua rosa de verde-água e o gato) |
| 3 | 2 | 3 azul → 1 amarelo | 1 · 2 · 3 | 3 e **3** (pinta o gato e a grama) |
| 3 | 3 | 1 rosa → 3 verde-água | 2 · 3 · 4 | 1 e **2** (sobra tábua crua) |

**A validação** (`validateLevels`) cobra: N1 com 1 laço e N2/N3 com 2; 3 a 5
tábuas; tintas diferentes na mesma cerca; o número certo entre os cartões, com
vizinho de ±1; no N2, dois cartões grandes não passam de +2 tábuas; no N3,
**exatamente um** número errado no programa pronto, e nenhuma troca possível
passa de +2.

**O guia de cada nível** (chave `ef02co02-l<n>`, uma vez por nível):
- N2: cerca de treino 1 amarela + 2 azuis; o dedo escreve 1 e depois 2, e a
  vinheta vai para a cerca enquanto o robô pinta;
- N3: o programa de treino (2 e 2) roda e faz o estrago, a tinta é lavada, o
  dedo toca o número errado, escolhe o 1, e o robô repinta certo. Na vez da
  criança, a vinheta fica sobre a lousa até ela tocar num número.

## 13. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (laço de execução, `outcome`) | `data/layout.ts`, `data/theme.ts`, `scenes/board.ts` (lousa, laço, bolinhas), `fence.ts` (tábuas, tinta, gato), `robot.ts`, `cards.ts`, `hud.ts`, `audio.ts`, `guide.ts`, catálogo |

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-quintal.png` | 1280 × 720 | quintal com a lousa vazia no cavalete e o chão da cerca livre |
| `robo.png` | 3 × 2, 384 | o robô pintor: parado, andando, pintando, comemorando, "ops!", "?" |
| `cerca.png` | 4 × 1, 256 × 512 | tábua crua, tábua pintada (branca, recebe `tint`), poste do fim, 1 livre |
| `pecas.png` | 4 × 3, 256 | cartão, laço ↻, pincel, seta de andar, gato dormindo, gato manchado, respingo, dedo… |
| `cover-robo-pintor.png` | 1672 × 941 | capa **com o título** |

**Código:** a tinta das tábuas (`tint` da tábua branca), os números dos cartões,
as bolinhas, o programa da lousa (montado com as peças), os números 1…n da dica,
as manchas de tinta do gato (respingos com `tint` por cima dele), o confete.

**Registro:** id `NEXT_FREE_ID` (hoje **098**), slug `robo-pintor`,
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, 3 frases em `gameInstructions.ts`,
`public/og/robo-pintor.jpg`, categoria **Pensamento Computacional**.

## 14. Travas

- O robô executa **sempre** o número escolhido, até o fim: é assim que a
  precisão aparece. Nunca corte a execução no primeiro passo errado.
- A execução é um laço real (`for`), e cada volta acende uma bolinha.
- As tábuas não mostram números antes do erro.
- `steps` e `debug` são dados do nível, não `if` na cena.

## Dúvidas para o usuário

1. ~~Nome~~ — aprovado: *Robô Pintor*.
2. ~~Estilo~~ — **vetor geométrico** (`23`, `24`; capa com `26`), escolhido pelo usuário. Sem contorno: o robô laranja e o gato roxo se destacam pela cor sobre o quintal claro.
3. **Contar para o robô:** o N1 pede contar de 3 a 5 tábuas, bom para o 2º ano.
   Quer números maiores (até 8), como o "ande 10 passos" do exemplo oficial?

## Histórico

- **30/09/2026.** A ficha *Jardim das Repetições* repetia o *Série do Campeão*.
  O usuário escolheu a mecânica "escreva o número, a máquina executa" e pediu um
  tema novo: robô pintor de cerca.
- **30/09/2026, mais tarde.** O usuário aprovou o plano ("gostei. prossiga") e
  escolheu a linha **vetor geométrico** (`references/23` e `24`). O TEXTURAS foi
  reescrito nessa linha, com o robô laranja/cinza, o gato roxo e as tintas azul,
  rosa, verde-água e amarelo.
- **30/09/2026, código do N1.** Jogo **098** no catálogo (`NEXT_FREE_ID` → 099),
  ainda **sem capa** (`thumbnail` vazio até a `cover-robo-pintor.png` chegar).
  Roda inteiro com **desenhos de reserva** chapados (`scenes/fallback.ts`), que
  somem sozinhos quando os PNGs entram em `src/assets/games/EF02CO02/robo-pintor/`.
  Conferido no navegador: guia de treino, acerto nas 3 cercas até o
  `GAME_COMPLETED`, erro "a menos" (tábua crua, números 1…n, o certo na lousa,
  `WRONG_ANSWER` + game over) e "a mais" (o gato pintado, a grama).
  A **tábua pintada não tem ripas** (a tinta vazava para a vizinha): o TEXTURAS
  foi corrigido nisso.
- **02/10/2026, arte entregue.** 4 das 5 folhas chegaram (falta a capa), com
  tamanhos diferentes do TEXTURAS (robô e peças em células de 300, cerca em
  3 × 256 × 330, fundo em 1672 × 941). O código foi ajustado às medidas (ver
  `src/assets/games/EF02CO02/robo-pintor/MANIFEST.md`): a cerca desceu para a
  base em y 500, porque a grama da arte começa em y ≈ 318; o robô encolheu
  (escala 0,62) e recuou 100 px para não tapar a tábua da vez; as bolinhas dos
  cartões saíram de cima da faixa laranja; e a lousa ganhou uma plaquinha
  clara atrás do pincel e da seta.
- **02/10/2026, N2 e N3** (pedido do usuário: "adicione n2 e n3 no Robô
  Pintor"). Como no §12: dois laços em sequência com marcas de giz, e o
  programa pronto com um número errado para consertar. Sem arte nova: as marcas
  de giz e a plaquinha colorida de cada laço são código. Conferido no
  navegador: guias do N2 e do N3, acerto e erro nos dois níveis, e o N1 sem
  mudança.
