# Detetives da Busca — Documento visual

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md) · [MECANICA.md](./MECANICA.md) · [TEXTURAS.md](./TEXTURAS.md)

---

## 1. A regra que governa tudo

**A `GameScene` não desenha nada.** Se ela precisar de um `fillRoundedRect`, falta um painter em `effects.ts`.

Três camadas, iguais às do Chef e do Formato Certo:

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Paleta | `data/theme.ts` | cores, alfas, fontes, tamanhos. Nenhum `0x…` fora daqui |
| Medidas | `data/layout.ts` | coordenadas de 1280×720. Nenhum número mágico nas cenas |
| Desenho | `scenes/effects.ts` | painters puros e construtores de componente |

**Painter puro:** recebe um `Graphics` e desenha. Não cria objeto, não anima, não guarda estado, pode ser chamado de novo para repintar. É o que faz um cartão passar de "fechado" para "fora do assunto" sem recriar nada.

**Construtor:** cria um pedaço de interface e devolve um handle com métodos e `destroy`. A cena nunca toca nos objetos internos dele.

O mural é grande o bastante para ter arquivo próprio: `scenes/mural.ts` guarda a parede, a chegada e a queda dos cartões. Ele é um construtor como qualquer outro — só que mora fora do `effects.ts` porque ali dentro ficaria maior que todo o resto somado.

## 2. Paleta

A cena é um **quadro de cortiça** de detetive: parede quente, papel creme, e **um azul só, que é a busca**.

```ts
export const C = {
  // parede e móvel
  ink:        0x1b2333,
  cork:       0xd9a566,
  corkDark:   0xb8853f,
  wood:       0x8a5628,

  // a busca — o único acento do jogo
  search:     0x3b82f6,
  searchSoft: 0xdbeafe,
  searchDark: 0x1d4ed8,

  // estado
  ok:         0x22c55e,
  okSoft:     0xd8f3df,
  warn:       0xf59e0b,
  warnSoft:   0xfdecd0,
  idle:       0x8ea3bd,

  // o pino, e nada mais
  pin:        0xe23b3b,

  // superfícies
  paper:      0xfff6e8,
  paperEdge:  0xe8dcc6,
  cream:      0xfff9f0,
  slate:      0x3b3b3b,
  muted:      0x7b6b5a,
  white:      0xffffff,
  shadow:     0x000000,
}
```

### 2.1 Quatro cores, quatro promessas

| Cor | Significa | Onde aparece |
|---|---|---|
| **Azul** `search` | *a busca* | barra, palavra ligada, filtro ativo, aro da lupa |
| **Verde** `ok` | *serve* | marca do cartão certo, contador quando sobra a resposta |
| **Âmbar** `warn` | *fora do assunto* | marca do cartão errado, aviso de mural vazio |
| **Vermelho** `pin` | **só o pino** | a cabeça do pino, e mais nada |

**Não existe vermelho de erro neste jogo.** O erro é âmbar, porque âmbar quer dizer "olha isso" e vermelho quer dizer "você fez uma coisa ruim" — e o jogo inteiro é construído sobre a ideia de que testar não é fazer coisa ruim. O vermelho fica reservado ao pino, que aparece em todo cartão, o tempo todo, sem significar nada além de "isto está pregado aqui". Se o pino fosse a cor do erro, a parede diria "errado" cinco vezes por busca.

### 2.2 O tipo do resultado não tem cor

Site, imagem e vídeo se distinguem pela **forma do selo** — página com globo, moldura de foto, retângulo com play — e nunca por cor. Dois motivos, e os dois são fortes:

1. Uma quarta, quinta e sexta cor de identidade quebrariam a promessa das quatro acima. O azul deixaria de ser "a busca" no instante em que também fosse "site".
2. Forma funciona com daltonismo e com projetor ruim de sala de aula, que é o ambiente real deste jogo.

```ts
export const A = { veil: 0.34, shadow: 0.24, gloss: 0.22, inset: 0.3, dim: 0.55, off: 0.42 }

export const FONT = { black: 'Arial Black, Arial', body: 'Arial' }

// Nada abaixo de 17px na área jogável — 3º ano, com Scale.FIT
export const SIZE = {
  hudLevel: '19px',  hudTitle: '25px',  hudHint: '18px',
  question: '25px',  questionLong: '22px',  criterion: '17px',
  word: '22px',      counter: '20px',   filter: '19px',
  cardTitle: '20px', cardSource: '16px',
  openTitle: '28px', openSource: '18px', openSnippet: '21px', openFrom: '17px',
  button: '23px',    toast: '21px',     help: '30px',
}

export const TYPE_MS = { question: 16, snippet: 22 }

/** Acima disso o pedido cai para `questionLong` e cabe em duas linhas. */
export const LONG_QUESTION = 62
```

## 3. Layout

Uma coluna só, em faixas horizontais. Sem coluna lateral de personagem, então a largura inteira é do jogo.

```
┌──────────────────────────────────────────────────────────────┐
│ HUD   nível · progresso · título · ajuda              10–94   │
├──────────────────────────────────────────────────────────────┤
│ ┌ CASO ──────────────────────────────────────────────┐       │
│ │  ▤   o pedido                              116–208  │       │
│ └────────────────────────────────────────────────────┘       │
│ ┌ BUSCA ─────────────────────────┐   5 resultados  228–300   │
│ │  ○  [ palavra ] [ palavra ]     │                          │
│ └────────────────────────────────┘                           │
│   Tudo · Imagens · Vídeos · Sites                    312–368  │
│ ┌ MURAL ─────────────────────────────────────────────┐       │
│ │   📌      📌      📌      📌               380–604  │       │
│ └────────────────────────────────────────────────────┘       │
│   BANDEJA   [ palavra ]  [ palavra ]  [ palavra ]    616–706  │
└──────────────────────────────────────────────────────────────┘
```

```ts
export const W = 1280
export const H = 720

export const HUD = {
  x: 16, y: 10, w: 1248, h: 84, r: 26, cy: 52,
  pillX: 42, pillY: 32, pillW: 134, pillH: 40,
  dotsX: 202, dotsMaxW: 190, dotR: 8,
  titleX: 660, titleY: 40, titleW: 600, hintY: 70, hintW: 620,
  helpX: 1216, helpR: 27,
}

export const CASE = {
  cx: 640, cy: 162, w: 1160, h: 92, r: 24,
  iconX: -520, iconSize: 62, iconTexBox: 70,
  textX: -456, wrap: 880,
  /** Etiqueta do critério, só no N3. Fica à direita do pedido. */
  chipX: 452, chipW: 240, chipH: 40, chipR: 20,
}

export const SEARCH = {
  cx: 520, cy: 264, w: 920, h: 72, r: 36,
  lensX: -420, lensSize: 44,
  slot0X: -300, slotW: 260, slotH: 48, slotR: 24, slotGap: 18,
  counterX: 1092, counterY: 264,
}

export const FILTERS = { cy: 340, w: 210, h: 56, r: 28, gap: 18, seloSize: 34 }

/**
 * O mural muda de altura conforme as faixas que existem no nível.
 * A faixa que não existe não deixa buraco: o mural come o espaço dela.
 */
export const MURAL = {
  x: 60, w: 1160, r: 28,
  withFilters:    { y: 380, h: 224 },   // N2
  withoutFilters: { y: 340, h: 264 },   // N1
  big:            { y: 340, h: 320 },   // N3, duas pistas grandes
}

export const CARD = {
  w: 248, wTight: 202, h: 196, r: 22, gap: 22,
  /** Acima disso o cartão encolhe para `wTight`. Nunca há segunda fileira. */
  perRowMax: 4,
  seloDY: -54, seloSize: 62,
  titleDY: 26, titleWrap: 200,
  sourceDY: 66,
  /** O pino crava na borda de cima do cartão, sem pedir espaço extra. */
  pinDY: -98, pinSize: 44,
  /** Marca de "já li", canto superior direito. */
  readDX: 96, readDY: -74, readR: 11,
  // N3
  bigW: 420, bigH: 300, bigGap: 60,
}

export const TRAY = {
  cx: 640, y: 616, w: 1160, h: 90, r: 24,
  chipW: 230, chipH: 62, chipR: 31, gap: 22,
}

/** A lupa em repouso, no canto de baixo à direita. */
export const LENS = { restX: 1186, restY: 646, size: 118 }

/** O cartão aberto pela lupa. Cobre o mural, com o resto escurecido. */
export const OPEN = {
  cx: 640, cy: 430, w: 800, h: 320, r: 28,
  seloX: -300, seloSize: 84,
  titleX: -216, titleDY: -104, titleWrap: 520,
  sourceDY: -66,
  snippetDY: -6, snippetWrap: 700,
  fromDY: 58,
  btnY: 118, btnW: 260, btnH: 66,
}

export const TOAST = { y: 660, hiddenY: 790, w: 760, h: 72, r: 22 }
```

**Alvo de toque nunca abaixo de 196 px de altura.** O cartão é 248×196 (202×196 com cinco), a ficha de palavra é 230×62, o filtro é 210×56. Dedo de criança de 8 anos, em tablet, com `Scale.FIT` encolhendo tudo junto.

## 4. Os painters

### 4.1 `createScene(scene)` — o cenário

Com `bg-escritorio.png` carregada, entra por **cobertura** (`Math.max`, nunca esticada), mais um véu de `ink` a `A.veil` e a vinheta. Sem a textura, cai no `paintCorkBoard(g)`, que desenha:

1. **Cortiça**: bloco em `cork` de ponta a ponta, com uns 400 pontinhos em `corkDark` a 0.14, tamanho e posição variando — é o granulado que faz cortiça parecer cortiça e custa um `for`.
2. **Moldura**: borda em `wood` de 22 px em volta, com um filete claro no topo.
3. **Rodapé da mesa**: faixa em `wood` nos 40 px de baixo.
4. **Vinheta**: `ink` a 0.2 nos 70 px de cima e de baixo.

### 4.2 `paintResultCard(g, w, h, r, { state })`

O cartão é um **papel pregado na parede**: creme, sombra funda, e uma leve inclinação que muda por cartão.

```
        📌
     ┌──────────┐
     │   ▤      │   ← selo do tipo (página · foto · play)
     │  Título  │
     │  fonte   │
     └──────────┘
```

| `state` | Preenchimento | Borda | Quando |
|---|---|---|---|
| `idle` | `paper` | `paperEdge` 3 px | na parede, esperando |
| `hover` | `cream` | `search` 5 px + halo | ponteiro em cima |
| `open` | `cream` | `search` 6 px | aberto pela lupa |
| `serve` | `okSoft` | `ok` 6 px | escolhido e certo |
| `fora` | `warnSoft` | `warn` 6 px | escolhido e errado |
| `leaving` | `paper` a 0.7 | `paperEdge` | caindo da parede |

**Cada cartão nasce com um ângulo próprio**, entre −3° e 3°, derivado do índice (não sorteado, para o mural não dançar a cada repintura). Papel pregado à mão nunca fica reto, e é isso que separa "mural de detetive" de "tabela".

### 4.3 `paintWordChip(g, w, h, r, { on })`

A ficha de palavra é um **interruptor**, e os dois estados têm de ser lidos sem cor:

- **ligada**: elevada — sombra externa, corpo `searchSoft`, borda `search` cheia de 5 px, faixa de brilho no topo
- **desligada**: rebaixada — sombra interna, corpo `paper` a `A.off`, borda **pontilhada** em `idle`

Elevado convida a desligar; rebaixado convida a ligar. É a mesma lógica do poço do Formato Certo, invertida.

### 4.4 `paintFilterButton(g, w, h, r, { active })`

Pastilha com o selo do tipo à esquerda e o nome à direita. Ativa: afunda 4 px, corpo `search`, texto branco, selo maior. Inativa: corpo `paper`, texto `muted`.

### 4.5 `paintSearchBar(g)` e o contador

A barra é um campo de busca de verdade: pastilha bem arredondada em `paper`, aro `search` de 4 px, a lupa pequena à esquerda e os slots como pastilhas internas. Slot vazio é um **tracejado**, não um retângulo cinza — buraco pede para ser preenchido.

O contador fica **fora** da barra, à direita: um número grande em `search` e a palavra "resultados" pequena embaixo. Ele é o placar silencioso do Nível 2, então merece tamanho.

### 4.6 `drawRichLine(scene, tokens, opts)` — o trecho com destaque

O `snippet` vem de `casos.ts` com as palavras da busca entre asteriscos. O painter quebra a frase em fichas, mede cada uma, quebra a linha na mão e devolve os `Text` posicionados. As fichas marcadas saem em `searchDark`, com um retângulo arredondado em `searchSoft` atrás.

É o único lugar do jogo que faz layout de texto na mão, e vale a pena: **ver a palavra que você digitou acesa dentro da frase é a explicação inteira do jogo em um segundo.**

Se um token marcado não couber numa linha sozinho, ele sai sem destaque em vez de estourar a caixa. Degradar é melhor do que quebrar.

### 4.7 `createLens(scene)` — a lupa

Repousa no canto de baixo à direita, com `FX.float` de 8 px para não parecer morta. Ao abrir um cartão, voa em arco até ele e fica pousada na borda enquanto o cartão está aberto. Ao fechar, volta.

**O vidro precisa ser transparente de verdade** ([TEXTURAS.md §5.2](./TEXTURAS.md)). Se a textura vier com miolo opaco, o fallback em `Graphics` desenha um aro com miolo em `white` a 0.18 — e é ele que fica, porque lupa que apaga o que está embaixo é pior que nenhuma lupa.

## 5. O mural, quadro a quadro

O que a criança vê a cada toque, e é aqui que o jogo ganha ou perde.

**Cartão chegando.** Nasce acima da parede, fora da tela, escala 0.8, ângulo aleatório maior. Voa em arco (`FX.arcTo`, altura 90, 420 ms) até o lugar dele. Ao aterrissar: o pino desce de cima e crava (`FX.to` 160 ms + `FX.impact` 0.16 no cartão), uma nuvenzinha de `FX.sparks` em `corkDark` com 6 partículas, e a notinha de áudio. Cascata de 60 ms entre cartões.

**Cartão saindo.** O pino **salta primeiro** (sobe 30 px girando, some), e só então o cartão tomba: ângulo para 14°, y +90, alpha 0, 320 ms com `Ease.anticipate`. A ordem importa — o pino saltando é a causa, o cartão caindo é o efeito, e invertê-los faz o cartão parecer que escorregou sozinho.

**Filtro.** Quem sai não cai: **desliza para a lateral** e some. Movimento diferente para causa diferente — palavra tira porque não combina, filtro tira porque é de outro tipo, e a criança percebe a distinção sem ninguém dizer.

**Mural vazio.** O desenho `mural-vazio` entra com `popIn` no centro da parede, com o toast embaixo. Sai com `fadeOut` quando os cartões voltam.

## 6. Animação

Tudo pelo `FX` compartilhado, que devolve `Promise` — sem pirâmide de `onComplete`.

| Momento | Efeito |
|---|---|
| Entrada da tela | `FX.slideIn` no HUD (dy 26), `FX.popIn` no cartão de caso |
| O pedido | `FX.type` a 16 ms |
| Tocar numa palavra | `FX.press` na ficha, ela repinta para ligada, e uma cópia voa em arco até o slot |
| A busca rodando | varredura de luz atravessando a barra, 460 ms, `FX.shine` |
| Cartões saindo | pino salta → cartão tomba, `FX.stagger` 60 ms |
| Cartões chegando | `FX.arcTo` altura 90 → pino crava → `FX.impact` + faíscas de cortiça |
| Contador mudando | `FX.count`, e um `FX.impact` 0.2 quando o número cai |
| Tocar num cartão | lupa voa em arco, cartão cresce e vai ao centro, o resto escurece |
| O trecho | `FX.type` a 22 ms, palavras acesas já pintadas |
| É ESSA! e acertou | `FX.sparks` + `FX.stars` no cartão, `marca-serve` com `popIn`, `FX.flash` suave |
| É ESSA! e errou | `FX.shake` 10 px × 3, `marca-fora` com `popIn`, cartão volta ao mural |
| Mural vazio | `popIn` da caixa vazia + toast |
| Fim de nível | `showLevelComplete`; no fim do jogo, `FX.confetti` |

**O cartão sempre voa em arco.** Linha reta lê como teletransporte; o arco dá massa ao papel e é o que faz a parede parecer física.

## 7. Estados que precisam ser distinguíveis sem cor

Daltonismo e projetor ruim de sala de aula. Nenhuma informação depende só de matiz:

- **tipo do resultado** → forma do selo, nunca cor
- **palavra ligada** → elevada com borda cheia; **desligada** → rebaixada com borda pontilhada
- **filtro ativo** → afundado, com o selo maior
- **cartão que serve** → marca com **check**
- **cartão fora do assunto** → marca com **"!"**
- **cartão já lido** → marca de canto, um disco pequeno
- **slot vazio da barra** → tracejado
- **mural vazio** → a caixa vazia desenhada, não um texto vermelho

## 8. Tipografia e legibilidade

- `Arial Black` para título, pedido, rótulo e número; `Arial bold` para corpo.
- `setResolution(2)` em todo `Text` — sem isso, `Scale.FIT` em tela cheia borra a letra.
- Pedido acima de 62 caracteres cai de `question` (25 px) para `questionLong` (22 px). O corte foi escolhido para o cartão nunca passar de duas linhas.
- Título de cartão: no máximo duas linhas, `wordWrap` em 200 px. Título que não couber é problema do conteúdo, não do layout — `casos.ts` que se ajuste.
- Nada de abreviação: *Enciclopédia Infantil*, não *Enc. Inf.* Quem ainda soleta não decodifica abreviação.
- Contraste mínimo 4.5:1 em todas as combinações — `slate` sobre `paper`, `ink` sobre `cork`, `white` sobre `search`.

## 9. Inventário de componentes

O que `effects.ts` exporta:

```ts
// painters puros
paintCorkBoard, paintHudBar, paintCaseCard, paintSearchBar, paintWordChip,
paintFilterButton, paintResultCard, paintOpenCard, paintTray, drawTypeMark

// construtores
createScene(scene)                       → void         // arte ou painter
createHud(scene, { onHelp })             → Hud
createCaseCard(scene)                    → CaseCard
createSearchBar(scene)                   → SearchBar     // slots + contador
createFilterRow(scene, filters, onTap)   → FilterRow
createTray(scene, words, onTap)          → Tray
createLens(scene)                        → Lens
createOpenCard(scene)                    → OpenCard      // o cartão sob a lupa
createBigButton(scene, spec)             → BigButton     // Zone separada!
createRoundButton(scene, …)              → RoundButton
drawRichLine(scene, tokens, opts)        → Text[]
showToast(scene, msg, tone, life)
```

E `mural.ts` exporta `createMural(scene) → Mural`:

```ts
interface Mural {
  apply(shown: string[], next: string[], how: 'palavra' | 'filtro'): Promise<void>
  cardAt(x: number, y: number): string | null
  setLayout(spec: { y: number; h: number }): void
  markRead(id: string): void
  dim(on: boolean): void
  destroy(): void
}
```

**A zona de toque é sempre um objeto separado do que anima.** O cartão cresce no hover e afunda no clique; se a área de toque fosse ele, a borda mudaria de tamanho no meio do gesto e um `pointerup` perto da margem cairia fora, comendo o clique. Foi a lição mais cara do Chef e vale para todo botão, ficha, filtro e cartão daqui.

## 10. Camada de textura

Onze PNGs em `src/assets/games/EF03CO07/detetives-da-busca/`, importados e registrados na `BootScene` — mesma convenção dos outros jogos. A chave Phaser é o nome do arquivo sem extensão, e o `effects.ts` a usa direto.

**Regra de entrada.** Só vira arte o que o `Graphics` não faz bem: o cenário e os desenhos de objeto (lupa, pino, selos, marcas, pasta, caixa vazia). Cartão, barra, ficha, filtro, mural, HUD, contador e tarja continuam desenhados em código, porque mudam de cor e de estado o tempo todo — o cartão sozinho tem seis estados, e como PNG seriam seis arquivos por tipo.

| Chave | Onde entra |
|---|---|
| `bg-escritorio` | `createScene` — cobertura + véu `A.veil` + vinheta |
| `lupa` | `createLens`; voa até o cartão aberto |
| `pino` | topo de cada cartão do mural; salta na saída |
| `selo-site` · `selo-imagem` · `selo-video` | canto do cartão **e** botão do filtro |
| `marca-serve` · `marca-fora` | cartão escolhido, certo ou fora do assunto |
| `selo-caso` | ícone do cartão de pedido, o mesmo nos nove casos |
| `mural-vazio` | centro da parede quando a busca zera |
| `cover-detetives-da-busca` | catálogo, não é carregada pelo jogo |

**Textura é opcional, e o fallback é permanente.** Todo consumo passa por `scene.textures.exists()`; sem o arquivo, o painter em `Graphics` desenha como sempre desenhou. Isso garante que o `npm run build` nunca dependa de PNG, que um arquivo que falhe ao carregar não derrube a fase, e que dê para comparar arte contra código só tirando o arquivo da pasta. Nunca aparece o quadrado verde de textura ausente do Phaser.

**Encaixe por proporção, não por tamanho.** `fitImage` escala pela menor razão. Os PNGs são 350×350 com folga transparente, então `CARD.seloSize` e companhia são **caixa máxima**, não medida exigida — arte com proporção diferente encolhe em vez de esticar.
