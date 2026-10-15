# Etiqueta Certa (EF04CO02): N2 e N3, a sua metade

Pasta: `src/games/EF04CO02/etiqueta-certa/`. O N1 está aprovado: **não pode mudar nada nele**, nem visualmente nem no comportamento.

## O que o usuário pediu

> "n2 deve ter mapa grande horizontal repetitivo, com mais trilhos interconectados. faça n2 e n3"

## O desenho

- **N2:**
  - o pátio tem 2 telas de largura (`MAPS[1].width = 2560`), com 3 pistas, 2 alavancas e 3 galpões;
  - a criança **arrasta o mapa** para o lado e a câmera segue o trem;
  - a placa troca entre PARA e DE (devolução), e na fase 3 ela **vira no meio**.
- **N3:**
  - 3200 de largura, 3 alavancas e 4 galpões;
  - um **posto do carimbo** perto do sinal, com um **recado** preso: "Caio: PARA → Recife";
  - quando chega o trem com aquele NOME, a criança aperta **CARIMBAR** e toca no campo da etiqueta que o recado manda mudar. O valor troca, e só depois ela arma as alavancas.
- **No N2 e no N3 a etiqueta é uma faixa comprida no alto** (`STRIP` no layout), com os 4 campos lado a lado: NOME, PARA, DE e PESO, numa ordem que muda.

## Contratos já escritos (leia antes)

- `types.ts`:
  - `Phase.start` agora é `number[]`, uma posição por alavanca;
  - novos `Rule`, `Note`, `flipAt` e o modo `'stamp'`.
- `data/maps.ts`:
  - `MapDef` traz trilhos, chaves (com `lever: Point`), galpões, `shedSize`, `plaque`, `stopX`, `signal`, `board: 'big' | 'strip'`, `booth?` e `note?`;
  - `MAPS[0]` reproduz o N1 exatamente (mesmas coordenadas do layout antigo);
  - exporta `doorDx(map)`.
- `data/layout.ts`:
  - novos `STRIP`, `STAMP_BUTTON`, `NOTE`, `WIDE_BANNER` e `CAMERA` no fim;
  - os antigos `BRANCHES`, `SHEDS`, `FORK`, `MAIN_Y`, `STOP_X`, `SIGNAL`, `LEVER`, `PLAQUE` e `SHED_DOOR_DX` vão sair: troque o uso deles pelo `map`. O `LEVER` fica só com as medidas (`base`, `handle`, `tilt`, `hitW`, `hitH`), e as posições vêm do mapa.
- `data/files.ts`:
  - novas `STRIP_SHEET` (`etiqueta-longa`, 1 × 1) e `STAMP_SHEET` (`carimbo`, 2 × 2 de 320);
  - `STAMP = {tool, mark, booth, button}`.
- `data/words.ts`: novos `STAMP_LABEL`, `TEACH2`, `TEACH3`, `HELP.levers`, `HELP.note` e `SAY.*`.
- `data/levels.ts`: os níveis 2 e 3, `ruleAt`, `stamped`, `target`.

**Coordenadas:** tudo do mapa (trilhos, galpões, alavancas, sinal, posto e recado) está em **coordenadas do mundo** e anda com a câmera. A UI fica **fixa na tela** com `setScrollFactor(0)`: HUD, placa, etiqueta (grande e faixa), PARTIR, CARIMBAR, faixa do erro e as linhas de pontinhos (`link`).

## A sua parte (eu faço `rails.ts`, `GameScene.ts`, o fundo e os tutoriais)

### 1. `scenes/camera.ts` (novo)

```ts
export interface Cam {
    /** liga/desliga o arrastar e as teclas A/D ←/→ (só faz algo se map.width > 1280) */
    setEnabled(on: boolean): void
    /** true se o ponteiro atual já andou mais que CAMERA.dragSlop: um toque não vale */
    readonly dragging: boolean
    /** leva o centro da tela até o x do mundo (limitado às bordas) */
    panTo(x: number, ms?: number): Promise<void>
    /** segue o objeto (só no eixo x, lerp CAMERA.followLerp); null para de seguir */
    follow(target: Phaser.GameObjects.Components.Transform | null): void
    /** o x do mundo no centro da tela */
    centerX(): number
    destroy(): void
}
export function createCamera(scene: Phaser.Scene, map: MapDef): Cam
```

- `setBounds(0, 0, map.width, 720)`.
- **Arrastar:**
  - funciona com o dedo ou o mouse em qualquer ponto do mapa;
  - só depois de `dragSlop` px vira arrasto, e aí `dragging = true` até soltar;
  - um toque que vira arrasto **nunca** vira alavanca;
  - o mapa anda com o dedo (1 : 1), sem inércia complicada (uma inércia curtinha pode).
- **Teclas A/D e ←/→:** andam com a tecla segurada, a `CAMERA.keySpeed` px/s.
- Nada de seta ou mãozinha pulsando na tela.

### 2. `scenes/lever.ts` → várias alavancas

```ts
export interface Levers {
    readonly states: number[]
    set(states: number[], animate?: boolean): Promise<void>
    /** k = índice da alavanca */
    onFlip(cb: (k: number, state: number) => void): void
    setEnabled(on: boolean): void
    /** retângulo no MUNDO */
    rect(k: number): Rect
    destroy(): void
}
export function createLevers(scene: Phaser.Scene, map: MapDef, cam: Cam): Levers
```

- Uma alavanca por `map.switches[k]`, com a base em `lever`. A posição 0 inclina para um lado e a 1 para o outro, como hoje.
- **O toque vira a alavanca no `pointerup`**, se `!cam.dragging` e o dedo começou nela (por causa do arrastar).
- **Teclado:**
  - W/↑ põe em 0 e S/↓ põe em 1, como hoje;
  - quando há várias alavancas, a tecla vale para **a alavanca visível mais perto do centro da tela** (`cam.centerX()`);
  - no N1 o comportamento continua igual.

### 3. `scenes/sheds.ts`: `createSheds(scene, map)`

- Galpões em `map.sheds`, com tamanho `map.shedSize` e plaquinha em `map.plaque` (no N2/N3 ela fica em cima do telhado, `dy -40`).
- A API continua igual: `door(i)` usa `doorDx(map)`, e `plaque`, `rect` e `area` ficam no mundo.
- Novo: `bump(i): Promise<void>`, a plaquinha pula 2 vezes (o erro mostra o galpão certo).

### 4. `scenes/go.ts`: `createGo(scene, map)`

- O sinal vai para `map.signal` (no mundo).
- O botão PARTIR fica onde está (430, 676), **fixo na tela** (`setScrollFactor(0)` no botão e na zona).

### 5. `scenes/strip.ts` (novo): a etiqueta comprida

Implementa a **mesma interface `Board`** do `board.ts` e mais:

```ts
export interface Label extends Board {
    /** troca o valor do campo com o carimbo: a borracha desce, a tinta fica, o texto novo entra */
    stamp(field: Field, value: string, from: { x: number; y: number }): Promise<void>
    /** liga o modo de escolher campo (N3): tocar num campo chama cb(field) */
    setPickable(on: boolean): void
    onPick(cb: (field: Field) => void): void
}
export function createStrip(scene: Phaser.Scene): Label
```

- Arte: `etiqueta-longa` esticada para `STRIP.w × STRIP.h`, em `STRIP.x, STRIP.y` (fixa na tela). A arte da Aquarela está vindo; até lá, use o fallback.
- **Os campos ficam lado a lado, na ordem de `train.order`.** Cada um é uma pílula (`createPill` com `STRIP.pillW × pillH`) e o valor à direita, encolhendo se não couber. O PESO aparece como `5 kg`.
- `show(train, from)`: a faixa salta do caixote (`from` em coordenadas de **tela**) para o lugar.
- `pill(field)`, `value(field)` e `rect()` em coordenadas de tela.
- `stamp(...)`:
  - a ferramenta `STAMP.tool` vem de `from`, desce sobre o valor e afunda;
  - fica uma `STAMP.mark` pequena atrás do valor;
  - o texto antigo sai e o novo entra (`pop`).
- `setPickable(true)`: cada campo vira uma zona de toque (o campo inteiro). **Não acenda nada esperando o toque**, porque o certo não pode ser apontado.

### 6. `scenes/stamp.ts` (novo, só N3)

```ts
export interface StampDesk {
    setNote(note: Note | null): Promise<void>
    /** o CARIMBAR foi apertado (alterna: apertar de novo cancela) */
    onToggle(cb: (armed: boolean) => void): void
    readonly armed: boolean
    disarm(): void
    setEnabled(on: boolean): void
    /** de onde a ferramenta sai, em coordenadas de TELA (o botão) */
    origin(): { x: number; y: number }
    noteRect(): Rect   // mundo
    buttonRect(): Rect // tela
    press(): Promise<void> // o botão afunda sozinho (demo do tutorial)
    destroy(): void
}
export function createStampDesk(scene: Phaser.Scene, map: MapDef): StampDesk
```

- O **posto** (`STAMP.booth`, ≈ 150) fica em `map.booth`, no mundo.
- O **recado** (`UI.note`, `NOTE.w × NOTE.h`) fica em `map.note`, no mundo, e mostra em duas linhas:
  - `Caio`, grande;
  - a pílula `PARA` seguida de `→ Recife`.

  O `setNote` troca o recado com um pop.
- O botão **CARIMBAR** (`STAMP.button`, lilás) fica em `STAMP_BUTTON`, fixo na tela. Enquanto está armado, ele fica afundado e um pouco escuro.
- Enter/Espaço continuam sendo o PARTIR. Para o CARIMBAR, use a tecla **C**.

### 7. `scenes/sign.ts`: `flip(rule): Promise<void>`

A placa balança, a pílula gira (scaleX 1 → 0 → 1) e troca o texto, com um som (`audio.flip()` ou reaproveitando um que já existe).

### 8. O resto

- `link.ts` e `banner.ts`:
  - `setScrollFactor(0)` nas linhas e na faixa;
  - `showBanner(scene, text, at = BANNER)`, aceitando `WIDE_BANNER`.
- `hud.ts` e `board.ts`: `setScrollFactor(0)` em tudo. Confira se o `createLives` compartilhado já faz isso.
- `fallback.ts`: arte de reserva para `etiqueta-longa` e `carimbo`, no mesmo estilo.
- `audio.ts`: `stamp()` (um "tum" fofo) e `flip()`.
- `src/data/gameInstructions.ts` e a descrição do catálogo (id 114): incluir o N2 (pátio grande, arrastar, placa PARA/DE) e o N3 (recado + CARIMBAR).

## Regras

- Código em inglês, poucos comentários; texto da criança em português.
- O **N1 tem de continuar idêntico**.
- `npx tsc --noEmit -p .` e `npx eslint` limpos nos seus arquivos.
- Eu mexo em `rails.ts` e `GameScene.ts` ao mesmo tempo: **não edite esses dois**. Se o seu código não compilar por causa deles, tudo bem, eu ajusto.
- Ao terminar, responda com a lista de arquivos e as assinaturas finais (se mudou alguma).
