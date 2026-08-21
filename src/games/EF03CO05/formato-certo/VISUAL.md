# Formato Certo — Documento visual

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [MECANICA.md](./MECANICA.md)

---

## 1. A regra que governa tudo

**A `GameScene` não desenha nada.** Se ela precisar de um `fillRoundedRect`, falta um painter em `effects.ts`.

Três camadas, iguais às do Chef dos Subproblemas:

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Paleta | `data/theme.ts` | cores, alfas, fontes, tamanhos. Nenhum `0x…` fora daqui |
| Medidas | `data/layout.ts` | coordenadas de 1280×720. Nenhum número mágico nas cenas |
| Desenho | `scenes/effects.ts` | painters puros e construtores de componente |

**Painter puro:** recebe um `Graphics` e desenha. Não cria objeto, não anima, não guarda estado, pode ser chamado de novo para repintar. É o que faz uma caixa mudar de "vazia" para "com defeito" sem recriar nada.

**Construtor:** cria um pedaço de interface e devolve um handle com métodos e `destroy`. A cena nunca toca nos objetos internos dele.

## 2. Paleta

A cena é uma **oficina de dados**: parede fria, bancada de madeira quente, e três cores que *são* os três formatos.

```ts
export const C = {
  // parede e sombra
  ink:        0x101a2b,
  wall:       0x1b2a41,
  wallLight:  0x24374f,

  // bancada
  wood:       0xb4763c,
  woodDark:   0x8a5628,
  woodLight:  0xd0965c,

  // identidade dos formatos  ← nunca usadas para outra coisa
  date:       0x3b82f6,   // Data    — azul
  pixels:     0xf59e0b,   // Pixels  — âmbar
  text:       0x8b5cf6,   // Texto   — roxo

  // estado
  ok:         0x22c55e,
  okSoft:     0xd8f3df,
  fail:       0xef4444,
  failSoft:   0xfadcdc,
  idle:       0x8ea3bd,

  // superfícies
  panel:      0xfff6e8,
  panelEdge:  0xe8dcc6,
  cream:      0xfff9f0,
  slate:      0x3b3b3b,
  muted:      0x7b6b5a,
  screen:     0x0b1a14,   // vidro do leitor, apagado
  screenGlow: 0x2ee6a8,   // fósforo verde do leitor
  white:      0xffffff,
  shadow:     0x000000,
}
```

**Por que Pixels é âmbar e não verde.** A capa do jogo usa uma caixa verde para a grade de pixels. Verde aqui é a cor de *"o leitor conseguiu ler"* — a informação mais importante da tela. Se um formato também fosse verde, a criança leria "formato certo" antes de testar. A identidade do formato cede para o feedback.

**A cor do formato é uma promessa.** Azul só aparece em coisa de data: a caixa Data, os campos dela, as peças `18`/`junho`/`2026`, a leitura de data no visor. Ao fim do Nível 1 a criança associa a cor ao tipo sem que ninguém tenha dito.

```ts
export const A = { veil: 0.58, shadow: 0.26, gloss: 0.22, inset: 0.34, dim: 0.42 }

export const FONT = { black: 'Arial Black, Arial', body: 'Arial' }

// Nada abaixo de 17px na área jogável — 3º ano, com Scale.FIT
export const SIZE = {
  hudLevel: '19px',  hudTitle: '25px',  hudHint: '18px',
  request: '25px',   requestLong: '22px',
  boxTitle: '22px',  boxSubtitle: '16px',
  fieldLabel: '17px',
  pieceLabel: '19px', pieceGlyph: '38px',
  readerTitle: '17px', readerBody: '22px', readerBig: '30px',
  button: '22px',    toast: '21px',
}

export const TYPE_MS = { request: 16, reader: 22 }
```

## 3. Layout

Duas colunas. **Bancada à esquerda**, **leitor à direita**. Nada atravessa a fronteira — é o mesmo princípio que fez o Chef parar de brigar por espaço.

```
┌──────────────────────────────────────────────────────────┐
│ HUD  nível · progresso · título · ajuda            10–94  │
├────────────────────────────────────────┬─────────────────┤
│ ▬▬▬▬▬ barra de tempo ▬▬▬▬▬     104–130 │                 │
│ ┌────────────────────────────────────┐ │   L E I T O R   │
│ │ PEDIDO                    142–234  │ │                 │
│ ├────────────────────────────────────┤ │   visor         │
│ │ CAIXA(S) DE FORMATO       252–476  │ │   150–470       │
│ ├────────────────────────────────────┤ │                 │
│ │ BANDEJA DE PEÇAS          496–702  │ │   [ L E R ]     │
│ └────────────────────────────────────┘ │   516–590       │
│ 24 ─────────────────────────────── 956 │ 972 ─────── 1256│
└────────────────────────────────────────┴─────────────────┘
```

```ts
export const W = 1280
export const H = 720

export const HUD = {
  x: 16, y: 10, w: 1248, h: 84, r: 26, cy: 52,
  pillX: 42, pillY: 32, pillW: 134, pillH: 40,
  dotsX: 202, dotsMaxW: 190, dotR: 8,
  titleX: 660, titleY: 40, titleW: 600, hintY: 70, hintW: 620,
  helpX: 1216, helpR: 27,   // o `?` ocupa o canto: não há botão de som
}

export const TIMER = { cx: 490, y: 104, w: 880, h: 26, r: 13, warnAt: 0.5, panicAt: 0.25 }

/** Bancada: tudo que é jogável. */
export const BENCH = { x: 24, y: 138, w: 932, h: 570, r: 30, cx: 490 }

export const REQUEST = { cx: 490, cy: 188, w: 884, h: 92, r: 24, iconX: -382, iconSize: 62, textX: -318, wrap: 620 }

/**
 * Faixa das caixas. A largura vem da quantidade — três para escolher (N1),
 * duas lado a lado (N2), uma sozinha e maior (N1 preenchendo, N3).
 */
export const BOXES = {
  cy: 364, h: 224, r: 26, gap: 24,
  w1: 560,   // uma caixa aberta
  w2: 424,   // duas caixas (N2)
  w3: 288,   // três caixas fechadas, para escolher (N1)
  titleDY: -84, subtitleDY: -58, fieldsDY: 26,
}

/** Campos dentro da caixa. */
export const FIELD = {
  w: 116, h: 116, r: 20, gap: 18,
  labelDY: -78,          // rótulo acima do poço (Dia, Mês, Ano / 1º 2º 3º)
  pixelSize: 92,         // ponto de pixel é quadrado e menor
}

/** Bandeja de peças. Duas fileiras quando passa de 5. */
export const TRAY = {
  cx: 490, y: 496, w: 884, h: 206, r: 24,
  singleY: 600, row1Y: 558, row2Y: 656,
  cardW: 132, cardH: 112, gap: 16, cardR: 20, maxW: 850,
}

/** Coluna do leitor. */
export const READER = {
  cx: 1114, x: 972, w: 284,
  screenY: 300, screenW: 268, screenH: 300, screenR: 24,
  bezel: 14,
  btnY: 552, btnW: 244, btnH: 76,
  labelY: 140,
}

export const TOAST = { y: 656, hiddenY: 790, w: 720, h: 72, r: 22 }
```

**Alvo de arraste nunca abaixo de 100px.** `FIELD` é 116×116 e a peça é 132×112. Dedo de criança de 8 anos em tablet, com `Scale.FIT` encolhendo tudo junto.

## 4. Os painters

### 4.1 `createWorkbench(scene)` — o cenário

Com `bg-oficina.png` carregada, entra a imagem por **cobertura** (`Math.max`, nunca esticada), mais um véu de `ink` a `A.bgVeil` e a vinheta. Sem a textura, cai no `paintWorkbench(g)` abaixo. Ver §10.

O `paintWorkbench` desenha:

1. **Parede**: 14 faixas horizontais de `wall` → `wallLight`, de cima para baixo. Degradê barato e sem textura.
2. **Prateleira ao fundo**: uma linha em `y≈150` e cinco retângulos arredondados de silhueta em `shadow` a 0.18 — sugerem caixas guardadas sem competir com nada.
3. **Laje da bancada**: bloco em `wood` de `y=138` até o rodapé, com sete linhas de veio em `woodDark` a 0.12 e a borda frontal em `woodDark` cheia, 16px — é a espessura que faz a bancada parecer móvel e não papel de parede.
4. **Vinheta**: `ink` a 0.2 nos 70px de cima e de baixo.

### 4.2 `paintFormatBox(g, w, h, r, { tone, state })`

A caixa é um **aparelho**: chassi, placa de identificação e poços onde as peças entram.

```
     ┌──────────────────────────┐
     │  ▭ placa: "DATA"         │   ← plaqueta na cor do formato
     │    dia, mês e ano        │
     │   ┌──┐  ┌──┐  ┌──┐       │   ← poços (paintField)
     │   │  │  │  │  │  │       │
     │   └──┘  └──┘  └──┘       │
     │  ▬▬  ▬  ▬▬  luzinhas     │   ← três leds na base
     └──────────────────────────┘
```

Estados:

| `state` | Preenchimento | Borda | Quando |
|---|---|---|---|
| `closed` | `panel` a 0.9 | `tone` 4px | N1, esperando escolha |
| `open` | `panel` | `tone` 6px + brilho interno | escolhida, aceitando peças |
| `full` | `okSoft` | `ok` 6px | todos os campos preenchidos |
| `broken` | `failSoft` | `fail` 6px tracejada | N3, chegou com defeito |
| `rejected` | `failSoft` | `fail` 7px | escolhida errada, leitura falhou |

O tracejado do `broken` é a única borda não-contínua do jogo. Serve para a criança bater o olho no N3 e saber que aquela caixa está doente antes de ler qualquer texto.

### 4.3 `paintField(g, w, h, r, { tone, state, kind })`

O poço onde a peça assenta. `kind` é `'slot' | 'pixel'` — o de pixel é quadrado e com moldura de grade, para parecer um ponto de imagem e não uma gaveta.

Estados: `empty` (fundo rebaixado, `inset` 0.34, borda pontilhada), `hover` (borda `tone` grossa + halo), `filled` (borda `tone` cheia), `wrong` (borda `fail` + tremida).

O `empty` é **rebaixado, não elevado** — sombra interna em vez de externa. Buraco convida a encaixar; caixinha saliente convida a clicar. É a diferença entre a criança entender o gesto em dois segundos ou em vinte.

### 4.4 `paintPiece(g, w, h, r, { tone, held, placed })`

Cartão de dado. Sombra, corpo `cream`, faixa de brilho no topo (`gloss`), borda na cor do formato ao qual a peça pertence.

Cinco desenhos por cima, por `kind`:

| `kind` | Desenho | Usado em |
|---|---|---|
| `numero` | cubo com glifo grande centralizado | `18`, `2026`, `1`, `2`, `A`, `-`, `/` |
| `mes` | folha de calendário: argolas no topo, faixa colorida, nome do mês | `junho`, `abril` |
| `cor` | gota de tinta com realce elíptico, na cor que representa | 🔴 🔵 🟡 |
| `palavra` | etiqueta com fita, texto em caixa baixa | `vermelho`, `azul`, `amarelo` |
| `intrusa` | estrela ou placa — forma **sem** borda de formato | distratoras |

**A peça intrusa não tem borda colorida.** Todas as outras carregam a cor do formato a que pertencem. Quem não pertence a nenhum não ganha cor. É a dica silenciosa de que aquilo não vai encaixar em lugar nenhum.

### 4.5 O visor (`reader.ts`)

Duas regras, e elas vieram de o visor ter ficado ilegível:

**Uma coisa por vez.** Duas caixas viram duas leituras em sequência, nunca lado a lado — no N2 o espaço se dividia em duas metades de 110px e nenhuma das duas cabia. Enquanto varre, a tela está vazia. A frase só entra depois de o conteúdo estar parado.

**Nada de cenário dentro do vidro.** Saíram inteiros: grade de fósforo, riscos de tubo, reflexo diagonal, faixa de status com led e rótulo, chuvisco de 44 retângulos e o rastro de seis retângulos atrás da varredura. Eram oito camadas competindo com o único elemento que importa — o dado que a caixa devolveu.

Sobraram três superfícies: **moldura**, **vidro** e **linha de varredura**.

| `state` | Visor |
|---|---|
| `off` | escuro, cursor `▮` piscando e "aguardando dados" |
| `scanning` | uma linha, uma passada de cima a baixo, ~460 ms, tela vazia |
| `fail` | borda e banho em `fail`, a leitura literal, depois a frase honesta |
| `success` | borda e banho em `screenGlow`, a informação recuperada, faíscas |

**O estado do aparelho é dito uma vez só**, pela cor da borda e do banho. Antes era dito quatro vezes — tinta do vidro, led, rótulo "SEM LEITURA" e a cor do dado. O dado continua colorido porque ali a cor é informação por célula, não estado do aparelho.

## 5. Como cada formato se recupera no visor

A parte mais importante da tela. **O visor mostra o que leu, não um veredicto.**

**Data** — três linhas rotuladas, do jeito que a caixa guardou:
```
 dia  18
 mês  junho
 ano  2026

 18 de junho de 2026
```
Na falha, a última linha vira a frase honesta: `dia 2026 · não existe dia 2026`.

**Pixels** — a imagem, desenhada de verdade: os pontos na ordem dos campos, como uma faixa de três quadrados grandes. Campo vazio ou com peça errada vira um **buraco quadriculado** — o padrão de xadrez cinza que todo editor de imagem usa para "nada aqui". A criança vê o buraco antes de ler qualquer palavra.

**Texto** — só a sequência, em letras grandes. `1A-2` aparece exatamente assim, do tamanho de `A-12`, para a comparação ser imediata. Os traços de posição embaixo saíram: a posição já está na ordem dos caracteres e a peça errada já vem na cor da falha.

## 6. Animação

Tudo pelo `FX` compartilhado, que devolve `Promise` — sem pirâmide de `onComplete`.

| Momento | Efeito |
|---|---|
| Entrada da bancada | `FX.slideIn` no HUD (dy 26), `FX.popIn` escalonado nas caixas (gap 90 ms) |
| Entrada da bandeja | `dealIn` — cascata de `popIn`, 60 ms entre cartas |
| Pegar a peça | `scale 1.14`, `angle -3`, `Ease.back(2)`, 120 ms; sombra cresce |
| Peça sobre um campo válido | campo repinta para `hover` + `FX.to(scale 1.04)` |
| Soltar no campo | `FX.arcTo` com `height 74` — **arco, nunca linha reta** |
| Soltar fora | volta para casa com `Ease.settle` (oscilação amortecida) |
| Caixa completa | `FX.shine` atravessando + pulso 1.05 |
| LER | leitor: varredura 460 ms → uma caixa por vez, 1,5 s entre elas |
| Sucesso | `FX.sparks` no visor, `FX.stars` na caixa, `FX.flash` suave |
| Falha | `FX.shakeCam('leve')`, campo culpado treme (`FX.shake`, 12px, 4×) |
| Tempo esgotado | barra pisca em `fail`, peças voltam em cascata |

**A peça sempre voa em arco.** Linha reta lê como teletransporte; o arco dá massa ao objeto e é o que faz a bancada parecer física.

## 7. Estados que precisam ser distinguíveis sem cor

Daltonismo e projetor ruim de sala de aula. Nenhuma informação depende só de matiz:

- **campo vazio** → rebaixado + borda pontilhada
- **campo preenchido** → elevado + borda cheia
- **caixa com defeito** → borda **tracejada**
- **leitura com falha** → a **leitura literal** no visor, não só texto vermelho
- **pixel faltando** → **xadrez cinza**, não um quadrado vermelho
- **peça intrusa** → **sem** borda, enquanto todas as outras têm

## 8. Tipografia e legibilidade

- `Arial Black` para título, rótulo e glifo; `Arial bold` para corpo.
- `setResolution(2)` em todo `Text` — sem isso, `Scale.FIT` em tela cheia borra a letra.
- Pedido acima de 64 caracteres cai de `request` (25px) para `requestLong` (22px). O corte foi escolhido para o cartão nunca passar de duas linhas.
- Nome de mês nunca abreviado: *junho*, não *jun*. Quem ainda soleta não decodifica abreviação.
- Contraste mínimo 4.5:1 entre texto e fundo em todas as combinações — `cream` sobre `wall`, `slate` sobre `panel`, `okSoft` sobre `screen`.

## 9. Inventário de componentes

O que `effects.ts` exporta:

```ts
// painters puros
paintWorkbench, paintFormatBox, paintField, paintPiece, paintTray,
paintHudBar, paintRequestCard, drawPieceMark

// construtores
createWorkbench(scene)                  → void        // arte ou painter
createPieceMark(scene, piece, h)        → PieceMark   // arte ou painter
createHud(scene, { onHelp })            → Hud
createTimerBar(scene)                   → TimerBar
createRequestCard(scene)                → RequestCard
createFormatBox(scene, spec)            → FormatBox
createPiece(scene, spec)                → Piece
createTray(scene)                       → Tray
createBigButton(scene, spec)            → BigButton    // Zone separada!
showToast(scene, msg, tone, life)
```

E `reader.ts` exporta `createReader(scene) → Reader` — as superfícies dele moram lá, não aqui. Ver §4.5 e [MECANICA.md §5](./MECANICA.md).

**A zona de toque é sempre um objeto separado do que anima.** O container cresce no hover e afunda no clique; se a área de toque fosse ele, a borda mudaria de tamanho no meio do gesto e um `pointerup` perto da margem cairia fora, comendo o clique. Foi a lição mais cara do Chef e vale para todo botão, peça e campo daqui.

## 10. Camada de textura

Oito PNGs em `src/assets/games/EF03CO05/formato-certo/`, importados e registrados na `BootScene` — mesma convenção dos outros jogos. A chave Phaser é o nome do arquivo, e o `effects.ts` a usa direto.

**Regra de entrada.** Só vira arte o que o `Graphics` não faz bem: o cenário — madeira, luz, profundidade — e as quatro marcas de peça, que são desenho de objeto. Caixa, poço, cartão, HUD, barra de tempo, botão, tarja e visor continuam desenhados em código, porque mudam de cor e de estado o tempo todo: a caixa sozinha tem 5 estados × 3 tons × 3 larguras, que como PNG seriam 45 arquivos.

| Chave | Onde entra | Detalhe |
|---|---|---|
| `bg-oficina` | `createWorkbench` | cobertura + véu `A.bgVeil` + vinheta |
| `marca-mes` | peça `kind: 'mes'` | nome do mês vai **abaixo** da folha |
| `marca-cor` | peça `kind: 'cor'` | quase branca, recebe `setTint` |
| `marca-palavra` | peça `kind: 'palavra'` | palavra vai **abaixo** da etiqueta |
| `marca-intrusa` | peça `kind: 'intrusa'` | cinza, sem cor de formato |
| `selo-data` · `selo-pixels` · `selo-texto` | `createRequestCard` | uma `Image` que troca de textura por rodada |

**Textura é opcional, e o fallback é permanente.** Todo consumo passa por um `scene.textures.exists()`; sem o arquivo, o painter em `Graphics` desenha como sempre desenhou. Isso garante que o `npm run build` nunca dependa de PNG, que um arquivo que falhe ao carregar não derrube a fase, e que dê para comparar arte contra código só tirando o arquivo da pasta. Nunca aparece o quadrado verde de textura ausente do Phaser.

**Encaixe por proporção, não por tamanho.** `fitImage` escala pela menor razão. Os PNGs são 350×350 com folga transparente, então `MARK.box` e `REQUEST.iconTexBox` são **caixa máxima**, não medida exigida — arte com proporção diferente encolhe em vez de esticar.

**Texto nunca vai por cima da arte.** Mês e palavra escrevem ABAIXO da marca (`MARK.*.labelBelow`). Escrever dentro do desenho obriga o código a apostar que a palavra cabe na área branca da imagem, e o texto vem de `missions.ts` — a aposta se perde no dia em que a palavra for mais longa. Fora da imagem quem limita é a largura do cartão, que o layout conhece.

**`MARK` é fração da altura do cartão**, única exceção à regra de pixels de `layout.ts`. O cartão tem dois tamanhos (132×112 e 116×90 quando a bandeja quebra em duas fileiras) e a marca precisa encolher junto.
