# A pista - como a corrida é montada

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [TEXTURAS.md](./TEXTURAS.md)

A arte chegou montada em peças soltas — grama, casa, moita, portão, corredor —
em vez de um fundo pronto com a pista desenhada dentro. Isso é melhor para o
jogo (a casa passa, a moita passa, a pista corre) e é onde moram todos os bugs
possíveis, porque agora **o código é quem faz a perspectiva**.

Este documento existe para que a perspectiva seja **uma função só**, usada por
todo mundo. Toda vez que alguém calcular posição de outro jeito, aparece um
objeto flutuando, uma placa atrás do chão ou uma decisão que não dispara.

---

## 1. O que a arte entregou, medido

| Arquivo | Tamanho | Grade | Caixa alfa |
|---|---|---|---|
| `corredor.png` | 280 x 1680 | 1 x 6 de 280 | ver §1.1 |
| `tecnologias.png` | 1400 x 1050 | 4 x 3 de 350 | objeto centrado |
| `grama.png` | 1672 x 941 | — | ver §1.3 |
| `casa.png` | 340 x 240 | — | x3 y1 w336 h236, base em 98,8% |
| `moita.png` | 340 x 240 | — | x3 y12 w331 h215, base em **94,6%** |

`portao.png` **não é carregado** (está na lista `SKIP` do `BootScene`). A placa
do portão media 161 x 73 px para um objeto quadrado de 350: encaixado ali, o
objeto ficaria com 20 px reais no celular na hora de decidir. O portão virou
duas **placas de beira de pista** desenhadas em `Graphics`, com o objeto a 196
px — que dá 88 px reais no momento do julgamento. O §4 descreve a peça.

### 1.1 `corredor.png`

| Frame | Caixa alfa | Topo | Base |
|---|---|---|---|
| 0 corrida, contato | x50 y4 w167 h276 | 1,4% | 100% |
| 1 corrida, passagem | x64 y0 w148 h279 | 0% | 99,6% |
| 2 corrida, contato espelhado | x61 y9 w166 h271 | 3,2% | 100% |
| 3 corrida, passagem espelhada | x66 y0 w147 h280 | 0% | 100% |
| 4 parado | x78 y0 w130 h279 | 0% | 99,6% |
| 5 comemorando | x37 y1 w205 h278 | 0,4% | 99,6% |

**O balanço da corrida já está desenhado** — o topo da cabeça sobe e desce até
9 px entre os quadros. O código **não** acrescenta bob nenhum; se acrescentar,
some com o pulo natural do desenho e o corredor parece pular fora do ritmo.

Os pés (e a sombra) encostam na base do quadro nos seis. Origem `(0.5, 1)`.

### 1.3 `grama.png`

Só o chão; o céu é transparente. O horizonte é **curvo**, como o alto de uma
colina:

| x (na imagem) | topo da grama | fração |
|---|---|---|
| 0 e 1671 | y = 455 | 48,4% |
| 418 e 1254 | y = 444 | 47,2% |
| 836 (centro) | y = 437 | **46,4%** |

Esticada para 1280 x 720 (a proporção bate: 1672/941 = 1,777), o centro da
linha da grama cai em **y = 365**.

**Cuidado com a diferença entre a linha da grama e o ponto de fuga.** A pista
não é desenhada até o infinito: ela para em `P_ROAD_FAR` (0,1), e nessa altura
ela está em `yOf(0,1) = 365` — exatamente a linha da grama. O ponto de fuga
(`HORIZON_Y`) fica 31 px acima, em 334, e é um número de cálculo, não um lugar
da tela. Igualar os dois **desalinha** a ponta da pista da grama.

---

## 2. A perspectiva: uma função, e só ela

Todo objeto do mundo tem uma profundidade `z`, em unidades de mundo, e nada
mais. A tela sai de `z`:

```ts
export const F = 600

export const pOf   = (z: number) => F / (F + z)
export const yOf   = (p: number) => HORIZON_Y + (GROUND_Y - HORIZON_Y) * p
export const xOf   = (p: number, wx: number) => CX + wx * p
export const depthOf = (p: number) => Math.round(p * 1000)
```

| Constante | Valor | De onde veio |
|---|---|---|
| `HORIZON_Y` | 334 | o PONTO DE FUGA — não é a linha da grama |
| `GRASS_Y` | 365 | a linha da grama no PNG, e onde `P_ROAD_FAR` cai |
| `GROUND_Y` | 640 | a linha dos pés do corredor |
| `CX` | 640 | o meio da tela |
| `LANE_WX` | ± 220 | dá x = 420 e 860 com `p = 1` |
| `ROAD_HALF_WX` | 441 | pista de 883 px embaixo, 69% da tela |
| `P_SPAWN` | 0,22 | onde tudo nasce; é a borda longe da pista |
| `P_DECIDE` | 0,92 | onde a faixa escolhida é julgada |
| `P_CULL` | 2,2 | onde tudo é destruído |

Isso não é truque: `y` linear em `p` e `escala` proporcional a `p` **é** a
projeção correta de um plano de chão numa câmera. Por isso a pista, as placas,
as casas e as moitas fecham sozinhos, sem números de conserto espalhados.

Duas consequências que valem escrever:

- **A pista é o mesmo modelo.** O trapézio é desenhado de `P_ROAD_FAR` (0,1,
  quase no ponto de fuga) até `P_ROAD_NEAR` (1,34, além da borda de baixo), com
  meia-largura `ROAD_HALF_WX * p`. As placas nascem mais perto, em `P_SPAWN`,
  para o objeto já entrar em tamanho que dá para reconhecer.
- **A curva do horizonte é ignorada de propósito.** O ponto de fuga usa o
  horizonte do centro (334). Um objeto só existe perto da borda da tela quando
  já está com `p` grande e bem abaixo do horizonte: no pior caso ele nasce 3 px
  acima da grama, a 20% de escala. Não conserte isso com um segundo horizonte —
  vai desalinhar a pista.

### As velocidades

`z` diminui `speed * dt` por quadro. `speed = base * boost`.

| Fase | `base` | Tempo de `P_SPAWN` até `P_DECIDE` |
|---|---|---|
| 1 | 480 | 4,3 s |
| 2 | 545 | 3,8 s |
| 3 | 610 | 3,4 s |

`boost` é 1, vira 1,35 no acerto e volta a 1 em 1 s com tween. **Nunca escreva
em `base`**: um boost somado no lugar errado deixa a fase inteira mais rápida e
o bug só aparece na terceira decisão.

---

## 3. Quem desenha o quê, e em que ordem

| Camada | Depth | Quem |
|---|---|---|
| céu (gradiente + nuvens) | -100 | `track.ts`, `Graphics` |
| grama | -90 | `grama.png`, esticada para 1280 x 720 |
| asfalto + bordas | -80 | `track.ts`, `Graphics`, repintado todo quadro |
| listras do meio | -70 | `track.ts`, do mesmo `z` |
| casas e moitas | `depthOf(p)` | `props.ts` |
| placas | `depthOf(p)` | `signs.ts` |
| corredor | **999** | `runner.ts` |
| objeto voando do acerto | 3000 | `reward.ts` |
| balão, plaquinha, HUD | 3100 a 3400 | `balloon.ts`, `trava.ts`, `hud.ts` |
| painel de fim de nível | 5000 | `showLevelComplete` |

O corredor em 999 é o que faz a placa passar **por trás** dele enquanto se
aproxima (`p < 1`) e **por cima** dele depois de atravessada (`p > 1`) — é o
efeito de passar por baixo dela, e sai de graça da mesma conta.

**O asfalto é pintado uma vez; só o que se mexe é repintado.** São dois
`Graphics`: o de baixo tem meio-fio e asfalto, que nunca mudam, e é desenhado
no `create`. O de cima tem as listras, o brilho da faixa escolhida e os riscos
de velocidade — e mesmo esse só é repintado quando alguma coisa mudou (uma
flag `dirty`, ligada pelo `advance`, pelo `setLane` e pelo `setBoost`). Com o
mundo congelado na trava, no tutorial ou no fim do nível, a pista não gasta um
quadro sequer.

**Quem desenhar coisa nova em cima da pista precisa ligar o `dirty`.** Sem
isso, ela aparece uma vez e congela.

Listra é uma lista de `z` que recicla — **nunca** `tileSprite` com
`tilePositionY`, que descola do mundo assim que a velocidade muda ou o mundo
congela. As listras longe demais (abaixo de 0,13 de escala) são puladas: viram
menos de um pixel.

---

## 4. A placa é um contêiner

Cada placa é um `Container` com o desenho em `Graphics` e o objeto da
tecnologia dentro. O código mexe só no contêiner:

```ts
sign.setPosition(xOf(p, lane === 0 ? -LANE_WX : LANE_WX), yOf(p))
sign.setScale(p)
sign.setDepth(depthOf(p))
```

Assim o objeto acompanha a placa sozinho, e destruir a placa destrói o objeto
junto — solto, ele fica na tela para sempre, e ninguém descobre de onde veio.

Dentro do contêiner, em unidades de mundo com o chão em `y = 0`:

| Peça | Onde | Por quê |
|---|---|---|
| poste | `x = ±250`, 344 de altura | fica na borda de fora da faixa, longe de quem corre |
| braço | do poste até `x = 0`, em `y = -322` | leva a placa para cima do meio da faixa |
| painel | 262 x 262 em `(0, -322)` | o topo dele fica em y = 202 na tela, logo abaixo do balão |
| objeto | 196 x 196, no centro do painel | 88 px reais no celular na hora de decidir |
| cancela | de `x = ±250` até o meio da pista, em `y = -102` | só aparece no estado bloqueado, e fecha a faixa inteira |

O painel muda de cor por estado — creme parado, verde no acerto, âmbar com
cadeado no bloqueio — e é isso que impede a placa de ser um PNG.

---

## 5. A máquina de estados

Um par de placas por vez. Um `enum`, e nenhuma decisão fora dele:

```
IDLE ──(intervalo de 1,2 s de corrida)──> ARMED
ARMED    o balão desce, o par de placas nasce em P_SPAWN
   │
   └──(p >= P_DECIDE)──> RESOLVE
RESOLVE  julga a faixa COMPROMETIDA, uma vez só
   ├── certo  ──> PASSING  (boost 1 s, o objeto voa, o par segue até P_CULL)
   └── errado ──> BLOCKED  (mundo congela, a cancela desce na faixa errada)
BLOCKED  ──(toque na faixa certa)──> UNLOCK ──> PASSING
PASSING  ──(p > P_CULL)──> destrói o par ──> IDLE ou fim da fase
```

Regras que o estado carrega:

- **`RESOLVE` roda uma vez.** Uma flag `resolved` no par, além do teste de
  cruzamento, porque um quadro longo pode passar de `P_DECIDE` direto para
  `p = 1,1`.
- **O veredito olha a faixa comprometida (`chosenLane`), não o `x` do
  corredor.** Se a criança toca 200 ms antes da decisão, o tween de troca de
  faixa ainda está no ar; julgar pelo `x` daria a faixa errada com a decisão
  certa — o pior bug possível neste jogo.
- **Em `BLOCKED`, tocar de novo na faixa fechada não custa nada.** Sem vida,
  sem `WRONG_ANSWER`, só uma tremidinha. O erro é cobrado uma vez, no
  `RESOLVE`.
- **Em `BLOCKED` o mundo congela**, mas a cena **não** é pausada: `scene.pause()`
  mataria o tween da plaquinha, o pulso da placa certa e o próprio input. O
  congelamento é uma flag `running` que só corta o avanço de `z`.

---

## 6. O laço de `update(time, delta)`

Ordem fixa. Trocar a ordem é como a maioria dos bugs de runner aparece:

```
1. dt = min(delta, 50) / 1000          ← trava de aba/breakpoint
2. se running: para cada placa e prop, z -= speed * dt
3. projeta todos: posição, escala, depth
4. cruzamento: se prevP < P_DECIDE <= p  → RESOLVE (uma vez)
5. descarta quem passou de P_CULL ou saiu de lado
6. nasce prop por DISTÂNCIA acumulada, nunca por tempo
7. repinta asfalto e listras
8. corredor: quadro da animação e interpolação de faixa
9. som do passo, disparado pela TROCA DE QUADRO do corredor
```

O passo 1 é o que impede o jogo de teleportar uma decisão inteira depois que a
criança troca de aba e volta: sem a trava, `delta` chega com 3 000 ms, a placa
pula de `p = 0,3` para `p = 3` e a decisão nunca acontece — a corrida segue
como se nada tivesse sido perguntado.

O passo 6 é o que mantém o espaçamento das casas igual em qualquer velocidade.
Por tempo, a fase 3 ficaria com o dobro de casas.

O passo 9 é o que amarra o som à imagem: se o passo sair de um `timer`
paralelo, ele descola do desenho em menos de um minuto, e descola de novo a
cada boost.

---

## 7. A lista de armadilhas

Cada uma já derrubou um jogo de corrida em algum lugar. A coluna da direita é o
que o código faz.

| # | Armadilha | O que evita |
|---|---|---|
| 1 | `delta` gigante depois de trocar de aba | `dt` limitado a 50 ms |
| 2 | decisão por igualdade (`p == 0.92`) | teste de cruzamento `prevP < P <= p` + flag `resolved` |
| 3 | julgar pelo `x` do corredor no meio do tween | julga `chosenLane` |
| 4 | dois tweens de troca de faixa brigando | guarda a referência e `stop()` antes de criar outro |
| 5 | `scene.pause()` para congelar | flag `running`, só corta o avanço de `z` |
| 6 | boost somado em `base` | `speed = base * boost`, `boost` volta por tween |
| 7 | prop nascendo por tempo | nasce por distância acumulada |
| 8 | objeto da tecnologia sobrevivendo à placa | os dois vivem no mesmo `Container` |
| 9 | objeto pequeno demais para reconhecer a tempo | placa em `Graphics`, objeto a 196 px em vez dos 73 px da arte |
| 10 | `moita.png` flutuando | origem medida (94,6%), não `(0.5, 1)` |
| 11 | segundo horizonte para a curva da grama | ponto de fuga único, no centro |
| 12 | placa desenhada por cima do corredor cedo demais | `depthOf(p)` contra o 999 do corredor |
| 13 | `tileSprite` para as listras | listras são `z`, recicladas |
| 14 | toque repetido na trava cobrando vida a cada vez | cobra só no `RESOLVE` |
| 15 | contador de tolerância que não zera | zera no começo de cada fase |
| 16 | `scene.restart` sem o saldo de vidas | passa `lives: this.livesLeft` |
| 17 | contêiner, tween e áudio sobrevivendo ao `shutdown` | tudo destruído no `events.once('shutdown')` |
| 18 | textura faltando derrubando o `vite build` | `import.meta.glob` + `textures.exists()` |
| 19 | reserva desenhada em lugar diferente da textura | a reserva usa a MESMA projeção |
| 20 | `GAME_READY` saindo a cada fase | sai uma vez, na primeira |

---

## 8. O toque

Uma zona por faixa, desenhada no espaço do jogo (não da janela), cobrindo de
`y = 200` até o rodapé: esquerda `0..640`, direita `640..1280`. A faixa da
pista acende quando é a escolhida — é o que torna a zona visível, que é a regra
do §4 do modal.

O mesmo gesto serve para tudo: correr, escolher e destravar. Setas do teclado
fazem o mesmo. Nada de arrastar, nada de alvo invisível.

---

## 9. O que ainda falta de arte, e como o jogo roda sem

| Falta | Reserva enquanto não chega |
|---|---|
| `situacoes.png` (9 pictogramas) | o balão fica só com a frase, centralizada |
| `rua.png` | o asfalto é `Graphics`, e é o que permite listra correndo e faixa acesa |
| `mapa-bairro.png` | o cartão do canto é `Graphics`: casa, nove vagas, e os objetos caindo nelas |
| ~~`cover-corrida-do-cotidiano.png`~~ | **entregue**, e o jogo já está no catálogo |

Sobre a rua: ela **fica em `Graphics` de propósito**, mesmo agora que a grama é
textura. O asfalto muda a cada quadro (listras correndo, faixa da escolha
acesa, brilho do acerto) e um PNG não muda. Como ele é desenhado **por cima** da
grama, e não ao lado dela, não existe a emenda que o PLANEJAMENTO temia: a
costura fica dentro do próprio traço do meio-fio.

Se um `rua.png` aparecer depois, ele entra sem reescrever nada — vira o
preenchimento do mesmo trapézio, e as listras continuam por cima.
