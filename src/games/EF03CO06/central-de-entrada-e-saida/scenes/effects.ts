import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, TYPE_MS, hex } from '../data/theme'
import { W, H, OP, DIALOG, PORTS, BANK, RAIL, PACKET } from '../data/layout'

export type SurfaceState = 'normal' | 'hover' | 'correct' | 'wrong' | 'off'

const FILL: Record<SurfaceState, number> = {
  normal: C.cream,
  hover: C.white,
  correct: C.greenSoft,
  wrong: C.redSoft,
  off: C.creamEdge,
}

/**
 * Porta de ENTRADA/SAÍDA do Nível 1.
 *
 * É um botão de aparelho: faixa colorida em cima com a plaqueta, corpo claro
 * embaixo onde as setas andam, e a borda na cor do fluxo. A faixa é o que faz
 * o rótulo pertencer ao botão em vez de flutuar por perto dele.
 */
export function paintPort(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  r: number,
  tone: number,
  state: SurfaceState,
) {
  const left = -w / 2
  const top = -h / 2
  const band = PORTS.bandH
  const edge = state === 'correct' ? C.green : state === 'wrong' ? C.red : tone
  const lifted = state === 'hover'

  g.clear()

  g.fillStyle(C.shadow, lifted ? 0.3 : A.shadow)
  g.fillRoundedRect(left + 6, top + (lifted ? 14 : 10), w, h, r)

  g.fillStyle(FILL[state], 1)
  g.fillRoundedRect(left, top, w, h, r)

  // faixa da plaqueta: cantos de cima arredondados, os de baixo retos
  g.fillStyle(edge, state === 'normal' ? 0.92 : 1)
  g.fillRoundedRect(left, top, w, band, { tl: r, tr: r, bl: 0, br: 0 })
  g.fillStyle(C.white, A.gloss)
  g.fillRoundedRect(left + 16, top + 10, w - 32, 16, 8)

  // sulco do encaixe, no rodapé: é onde o cabo pluga
  g.fillStyle(C.ink, 0.12)
  g.fillRoundedRect(left + w / 2 - 46, top + h - 26, 92, 12, 6)

  g.lineStyle(lifted ? 8 : 6, edge, 1)
  g.strokeRoundedRect(left, top, w, h, r)
}

/**
 * Uma seta em "V", montada com dois braços arredondados girados a 45°.
 *
 * Nada de bloco com triângulo na ponta: o retângulo com um triângulo colado
 * mostra a emenda e as pontas ficam em bico. Dois `fillRoundedRect` girados
 * têm ponta redonda de graça e encostam limpo no vértice.
 *
 * Nasce apontando para BAIXO. Para cima, `setScale(1, -1)`; para os lados,
 * gire o container.
 */
export function makeChevron(
  scene: Phaser.Scene,
  tone: number,
  w: number,
  thick: number,
): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0)
  const arm = Math.SQRT2 * (w / 2)

  for (const side of [-1, 1] as const) {
    const g = scene.add.graphics()
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-arm / 2, -thick / 2, arm, thick, thick / 2)
    g.setPosition((side * w) / 4, 0)
    g.setRotation((-side * Math.PI) / 4)
    c.add(g)
  }

  return c
}

/**
 * Três setas em fila que acendem em sequência, no sentido do fluxo.
 *
 * A direção deixa de ser uma forma parada e vira movimento — que é o que a
 * palavra "entra" e "sai" queria dizer. Por isso a linha de apoio embaixo da
 * porta pôde sair.
 */
export function createFlow(
  scene: Phaser.Scene,
  { dir, tone, w, thick, gap, count = 3 }:
    { dir: 1 | -1; tone: number; w: number; thick: number; gap: number; count?: number },
): Phaser.GameObjects.Container {
  const flow = scene.add.container(0, 0)
  const span = (count - 1) * gap

  for (let i = 0; i < count; i += 1) {
    const chev = makeChevron(scene, tone, w, thick)
    // desenhado para baixo; para cima é só espelhar em y
    chev.setScale(1, dir)
    chev.setY((-span / 2 + i * gap) * dir)
    chev.setAlpha(0.28)
    flow.add(chev)

    scene.tweens.add({
      targets: chev,
      alpha: 1,
      duration: 420,
      delay: i * 190,
      yoyo: true,
      repeat: -1,
      hold: 90,
      repeatDelay: (count - 1) * 190,
      ease: 'Sine.easeInOut',
    })
  }

  return flow
}

export function paintArrow(
  g: Phaser.GameObjects.Graphics,
  tone: number,
  opts: { len?: number; thick?: number; axis?: 'x' | 'y'; dir?: 1 | -1; alpha?: number } = {},
) {
  const len = opts.len ?? 110
  const thick = opts.thick ?? 22
  const axis = opts.axis ?? 'x'
  const dir = opts.dir ?? 1
  const head = Math.min(len * 0.44, thick * 1.6)
  const body = len - head
  const halfHead = thick * 0.86

  g.clear()
  g.fillStyle(tone, opts.alpha ?? 1)

  const tail = (-len / 2) * dir
  const tip = (len / 2) * dir

  if (axis === 'x') {
    g.fillRoundedRect(dir === 1 ? tail : tail - body, -thick / 2, body, thick, thick / 2)
    g.fillTriangle(tip, 0, tip - head * dir, -halfHead, tip - head * dir, halfHead)
  } else {
    g.fillRoundedRect(-thick / 2, dir === 1 ? tail : tail - body, thick, body, thick / 2)
    g.fillTriangle(0, tip, -halfHead, tip - head * dir, halfHead, tip - head * dir)
  }
}

export function paintCard(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  r: number,
  state: SurfaceState,
) {
  g.clear()
  g.fillStyle(C.shadow, state === 'hover' ? 0.28 : 0.18)
  g.fillRoundedRect(-w / 2 + (state === 'hover' ? 7 : 4), -h / 2 + (state === 'hover' ? 12 : 8), w, h, r)

  g.fillStyle(FILL[state], 1)
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r)

  g.fillStyle(C.white, A.gloss)
  g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, 16, 8)

  const stroke =
    state === 'correct' ? C.green :
    state === 'wrong' ? C.red :
    state === 'hover' ? C.inBlue : C.creamEdge

  g.lineStyle(state === 'normal' ? 4 : 6, stroke, state === 'normal' ? 0.9 : 1)
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
}

export function paintSlot(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  r: number,
  tone: number,
  filled: boolean,
) {
  g.clear()
  g.fillStyle(C.shadow, 0.16)
  g.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, r)

  g.fillStyle(filled ? C.cream : C.inkSoft, filled ? 1 : 0.42)
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r)

  if (filled) {
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, 16, 8)
    g.lineStyle(6, tone, 1)
  } else {
    g.lineStyle(5, tone, 0.7)
  }
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)

  if (!filled) {
    g.lineStyle(4, tone, 0.36)
    g.strokeRoundedRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, r - 12)
  }
}

export function paintBoard(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.clear()
  g.fillStyle(C.shadow, 0.26)
  g.fillRoundedRect(x + 8, y + 12, w, h, r)

  g.fillStyle(C.ink, 0.58)
  g.fillRoundedRect(x, y, w, h, r)

  g.fillStyle(C.cream, 0.1)
  g.fillRoundedRect(x + 16, y + 14, w - 32, 56, 20)

  g.lineStyle(3, C.glow, 0.42)
  g.strokeRoundedRect(x, y, w, h, r)
}

export function badge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  tone: number,
): Phaser.GameObjects.Container {
  const box = scene.add.container(x, y)
  const text = scene.add.text(0, -1, label, {
    fontFamily: FONT.black, fontSize: '18px', color: hex(C.white),
  }).setOrigin(0.5).setResolution(2)

  const w = Math.max(96, text.width + 34)
  const h = 38
  const bg = scene.add.graphics()
  bg.fillStyle(C.shadow, 0.2)
  bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
  bg.fillStyle(tone, 1)
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
  bg.fillStyle(C.white, 0.26)
  bg.fillRoundedRect(-w / 2 + 10, -h / 2 + 6, w - 20, 12, 6)
  bg.lineStyle(3, C.white, 0.9)
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)

  box.add([bg, text])
  box.bringToTop(text)
  return box
}

/* ────────────────────────────────────── pacote de informação ────── */

export interface Packet {
  node: Phaser.GameObjects.Container
  destroy: () => void
}

/**
 * A informação que viaja. O ícone é opcional: no N1 ela é só uma bolha de
 * luz, no N3 ela carrega o ic- correspondente para mostrar o que mudou.
 */
export function makePacket(
  scene: Phaser.Scene,
  x: number,
  y: number,
  tone: number,
  iconKey?: string,
): Packet {
  const node = scene.add.container(x, y).setDepth(150)

  const halo = scene.add.graphics()
  halo.fillStyle(tone, 0.24)
  halo.fillCircle(0, 0, PACKET.r + 16)
  halo.fillStyle(tone, 0.34)
  halo.fillCircle(0, 0, PACKET.r + 8)

  const core = scene.add.graphics()
  core.fillStyle(C.shadow, 0.18)
  core.fillCircle(2, 4, PACKET.r)
  core.fillStyle(tone, 1)
  core.fillCircle(0, 0, PACKET.r)
  core.fillStyle(C.white, 0.42)
  core.fillCircle(-PACKET.r * 0.3, -PACKET.r * 0.34, PACKET.r * 0.34)
  core.lineStyle(4, C.white, 0.86)
  core.strokeCircle(0, 0, PACKET.r)

  node.add([halo, core])

  if (iconKey && scene.textures.exists(iconKey)) {
    const disc = scene.add.graphics()
    disc.fillStyle(C.white, 0.96)
    disc.fillCircle(0, 0, PACKET.r + 10)
    disc.lineStyle(5, tone, 1)
    disc.strokeCircle(0, 0, PACKET.r + 10)

    const img = scene.add.image(0, 0, iconKey)
    img.setScale(Math.min((PACKET.r * 1.6) / img.width, (PACKET.r * 1.6) / img.height))
    node.add([disc, img])
  }

  FX.to(scene, halo, { scale: 1.18, alpha: 0.5 }, { duration: 620, yoyo: true, repeat: -1, ease: Ease.smooth })
  node.setScale(0.5)
  FX.to(scene, node, { scale: 1 }, { duration: 240, ease: Ease.back(2) })

  return { node, destroy: () => node.destroy() }
}

export function flyPacket(
  scene: Phaser.Scene,
  packet: Packet,
  to: { x: number; y: number },
  duration = PACKET.travelMs,
) {
  return FX.arcTo(scene, packet.node, to, { height: PACKET.arcH, duration })
}

/** Pacote bate na porta errada e volta. É a explicação visual do erro. */
export async function bouncePacket(
  scene: Phaser.Scene,
  packet: Packet,
  to: { x: number; y: number },
  home: { x: number; y: number },
) {
  await FX.arcTo(scene, packet.node, to, { height: 40, duration: 420 })
  FX.shake(scene, packet.node, { amount: 14, times: 4 })
  FX.ping(scene, to.x, to.y, C.red, { radius: 82, duration: 420 })
  await FX.wait(scene, 260)
  await FX.arcTo(scene, packet.node, home, { height: 40, duration: 380 })
  await FX.to(scene, packet.node, { alpha: 0, scale: 0.6 }, { duration: 180 })
  packet.destroy()
}

/* ─────────────────────────────────────────── tela do computador ────── */

export interface ScreenView {
  show: (iconKey: string, tone: number) => Promise<void>
  process: () => Promise<void>
  clear: () => void
  destroy: () => void
  rect: () => Phaser.Geom.Rectangle
}

/**
 * Overlay desenhado por cima da tela do computador-central.png.
 * O retângulo vem de COMPUTER.screen em frações, medido no arquivo original.
 */
export function createScreen(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  computer: Phaser.GameObjects.Image,
  frac: { fx: number; fy: number; fw: number; fh: number },
): ScreenView {
  const w = computer.displayWidth * frac.fw
  const h = computer.displayHeight * frac.fh
  const cx = computer.x - computer.displayWidth / 2 + computer.displayWidth * frac.fx
  const cy = computer.y - computer.displayHeight / 2 + computer.displayHeight * frac.fy

  const box = scene.add.container(cx, cy).setDepth(computer.depth + 1)

  const glow = scene.add.graphics()
  glow.fillStyle(C.glow, 0.16)
  glow.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
  glow.setAlpha(0)

  const holder = scene.add.container(0, 0)
  box.add([glow, holder])
  layer.add(box)

  let current: Phaser.GameObjects.Image | null = null

  const clear = () => {
    current?.destroy()
    current = null
    glow.setAlpha(0)
  }

  const show = async (iconKey: string, tone: number) => {
    clear()
    if (!scene.textures.exists(iconKey)) return
    const img = scene.add.image(0, 0, iconKey)
    img.setScale(Math.min((w * 0.66) / img.width, (h * 0.72) / img.height))
    img.setAlpha(0).setScale(img.scale * 0.7)
    holder.add(img)
    current = img
    glow.clear()
    glow.fillStyle(tone, 0.2)
    glow.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
    FX.to(scene, glow, { alpha: 1 }, { duration: 220 })
    await FX.to(scene, img, { alpha: 1, scale: img.scale / 0.7 }, { duration: 300, ease: Ease.back(1.8) })
  }

  /** Pisca três vezes: é o "computador trabalhando" da cadeia. */
  const process = async () => {
    for (let i = 0; i < 3; i += 1) {
      glow.clear()
      glow.fillStyle(C.glow, 0.4)
      glow.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
      glow.setAlpha(1)
      if (current) FX.impact(scene, current, 0.14)
      await FX.wait(scene, 150)
      await FX.to(scene, glow, { alpha: 0.25 }, { duration: 130 })
    }
  }

  return {
    show,
    process,
    clear,
    destroy: () => box.destroy(),
    rect: () => new Phaser.Geom.Rectangle(cx - w / 2, cy - h / 2, w, h),
  }
}

/* ──────────────────────────────────────────────── fala do operador ────── */

export interface OpDialog {
  speak: (lines: string[]) => Promise<void>
  react: (line: string) => void
  isBusy: () => boolean
  destroy: () => void
}

export function createOpDialog(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  op: Phaser.GameObjects.Image,
  baseDepth: number,
): OpDialog {
  const veil = scene.add.graphics()
  veil.fillStyle(C.ink, 0.76)
  veil.fillRect(0, 0, W, H)
  veil.setAlpha(0).setVisible(false)

  const glow = scene.add.graphics()
  for (let i = 6; i >= 1; i -= 1) {
    glow.fillStyle(C.glow, 0.045)
    glow.fillCircle(OP.cx, OP.y - 20, 88 + i * 26)
  }
  glow.setAlpha(0)

  const bubble = scene.add.container(OP.cx, OP.bubbleY)
  const bg = scene.add.graphics()
  const label = scene.add.text(0, 0, '', {
    fontFamily: FONT.body,
    fontStyle: 'bold',
    fontSize: SIZE.bubble,
    color: hex(C.ink),
    align: 'center',
    wordWrap: { width: OP.bubbleW - 46 },
    lineSpacing: 6,
  }).setOrigin(0.5).setResolution(2)
  bubble.add([bg, label])

  const next = scene.add.container(DIALOG.x, 0).setVisible(false)
  const nextBg = scene.add.graphics()
  const nextTxt = scene.add.text(0, -1, 'Próximo', {
    fontFamily: FONT.black, fontSize: '23px', color: hex(C.white),
  }).setOrigin(0.5).setResolution(2)
  const paintNext = () => {
    const { btnW: bw, btnH: bh } = DIALOG
    nextBg.clear()
    nextBg.fillStyle(C.shadow, 0.3)
    nextBg.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 8, bw, bh, bh / 2)
    nextBg.fillStyle(C.inBlue, 1)
    nextBg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
    nextBg.fillStyle(C.white, 0.28)
    nextBg.fillRoundedRect(-bw / 2 + 14, -bh / 2 + 9, bw - 28, 16, 8)
    nextBg.lineStyle(4, C.inBlueDark, 0.92)
    nextBg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
  }
  paintNext()
  next.add([nextBg, nextTxt])

  const nextHit = scene.add.zone(DIALOG.x, 0, DIALOG.btnW + 26, DIALOG.btnH + 22)
    .setOrigin(0.5)
    .setVisible(false)

  layer.addAt(veil, 0)
  layer.addAt(glow, 1)
  layer.add([bubble, next, nextHit])

  let typing: { skip: () => void } | null = null
  let busy = false
  const opScale = op.scale

  const paintQuick = () => {
    const bw = OP.bubbleW
    const bh = Phaser.Math.Clamp(label.height + 46, OP.bubbleMinH, OP.bubbleMaxH)
    bg.clear()
    bg.fillStyle(C.shadow, 0.24)
    bg.fillRoundedRect(-bw / 2 + 5, -bh / 2 + 8, bw, bh, 24)
    bg.fillStyle(C.cream, 0.99)
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
    bg.fillStyle(C.inBlue, 0.16)
    bg.fillRoundedRect(-bw / 2 + 14, -bh / 2 + 12, bw - 28, 16, 8)
    bg.lineStyle(4, C.inBlue, 0.85)
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
    bg.fillStyle(C.cream, 0.99)
    bg.fillTriangle(-18, bh / 2 - 6, 22, bh / 2 - 6, 0, bh / 2 + 26)
    bg.lineStyle(4, C.inBlue, 0.85)
    bg.lineBetween(-18, bh / 2 - 4, 0, bh / 2 + 26)
    bg.lineBetween(22, bh / 2 - 4, 0, bh / 2 + 26)
    return bh
  }

  const paintFocus = () => {
    const bw = DIALOG.w
    const bh = Phaser.Math.Clamp(label.height + 74, DIALOG.minH, DIALOG.maxH)
    bg.clear()
    bg.fillStyle(C.shadow, 0.36)
    bg.fillRoundedRect(-bw / 2 + 7, -bh / 2 + 12, bw, bh, DIALOG.r)
    bg.fillStyle(C.cream, 1)
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, DIALOG.r)
    bg.fillStyle(C.inBlue, 0.18)
    bg.fillRoundedRect(-bw / 2 + 18, -bh / 2 + 14, bw - 36, 20, 10)
    bg.lineStyle(6, C.inBlue, 0.95)
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, DIALOG.r)
    bg.fillStyle(C.cream, 1)
    bg.fillTriangle(bw / 2 - 6, -26, bw / 2 - 6, 22, bw / 2 + 40, -2)
    bg.lineStyle(6, C.inBlue, 0.95)
    bg.lineBetween(bw / 2 - 4, -26, bw / 2 + 40, -2)
    bg.lineBetween(bw / 2 - 4, 22, bw / 2 + 40, -2)
    return bh
  }

  const layoutFor = (text: string, focus: boolean) => {
    label.setFontSize(focus ? SIZE.dialog : SIZE.bubble)
    label.setWordWrapWidth(focus ? DIALOG.wrap : OP.bubbleW - 46)
    label.setText(text)
    bubble.setPosition(focus ? DIALOG.x : OP.cx, focus ? DIALOG.y : OP.bubbleY)
    const bh = focus ? paintFocus() : paintQuick()
    label.setText('')
    return bh
  }

  const enterFocus = () => {
    layer.setDepth(300)
    veil.setVisible(true)
    veil.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains)
    return FX.all(
      FX.to(scene, veil, { alpha: 1 }, { duration: 260 }),
      FX.to(scene, glow, { alpha: 1 }, { duration: 300 }),
      FX.to(scene, op, { scale: opScale * DIALOG.opGrow }, { duration: 340, ease: Ease.back(1.2) }),
    )
  }

  const exitFocus = async () => {
    next.setVisible(false)
    nextHit.setVisible(false).disableInteractive()
    await FX.all(
      FX.to(scene, veil, { alpha: 0 }, { duration: 240 }),
      FX.to(scene, glow, { alpha: 0 }, { duration: 240 }),
      FX.to(scene, op, { scale: opScale }, { duration: 280 }),
      FX.to(scene, bubble, { alpha: 0 }, { duration: 200 }),
    )
    bg.clear()
    label.setText('')
    bubble.setAlpha(1).setScale(1)
    veil.setVisible(false).disableInteractive()
    layer.setDepth(baseDepth)
  }

  const waitForNext = (tw: { skip: () => void }, done: () => boolean, isLast: boolean, bh: number) =>
    new Promise<void>(resolve => {
      nextTxt.setText(isLast ? 'Vamos lá!' : 'Próximo')
      const by = DIALOG.y + bh / 2 + DIALOG.btnGap
      next.setPosition(DIALOG.x, by).setVisible(true).setAlpha(0).setScale(0.9)
      nextHit.setPosition(DIALOG.x, by).setVisible(true)
      nextHit.setInteractive({ useHandCursor: true })
      FX.to(scene, next, { alpha: 1, scale: 1 }, { duration: 220, ease: Ease.back(2) })

      const onTap = () => {
        if (!done()) { tw.skip(); return }
        nextHit.off('pointerup', onTap)
        FX.press(scene, next, 0.94)
        resolve()
      }
      nextHit.on('pointerup', onTap)
    })

  const speak = async (lines: string[]) => {
    const list = lines.filter(l => !!l && l.trim().length > 0)
    if (!list.length) return

    busy = true
    typing?.skip()
    await enterFocus()

    for (let i = 0; i < list.length; i += 1) {
      const bh = layoutFor(list[i], true)
      FX.kill(scene, bubble)
      bubble.setScale(0.96)
      FX.to(scene, bubble, { scale: 1 }, { duration: 200, ease: Ease.back(1.8) })

      const full = list[i]
      const tw = FX.type(scene, label, full, { delay: TYPE_MS.dialog })
      typing = tw

      await waitForNext(tw, () => label.text.length >= full.length, i === list.length - 1, bh)
      next.setVisible(false)
      nextHit.setVisible(false).disableInteractive()
    }

    typing = null
    await exitFocus()
    busy = false
  }

  const react = (line: string) => {
    if (busy || !line) return
    typing?.skip()
    layoutFor(line, false)
    FX.kill(scene, bubble)
    bubble.setScale(0.94).setAlpha(0.92)
    FX.to(scene, bubble, { scale: 1, alpha: 1 }, { duration: 200, ease: Ease.back(1.8) })
    typing = FX.type(scene, label, line, { delay: TYPE_MS.aside })
  }

  return {
    speak,
    react,
    isBusy: () => busy,
    destroy: () => {
      typing?.skip()
      veil.destroy()
      glow.destroy()
      bubble.destroy()
      next.destroy()
      nextHit.destroy()
    },
  }
}

/* ─────────────────────────────────────────────────────── botão grande */

export interface BigButton {
  container: Phaser.GameObjects.Container
  setEnabled: (on: boolean) => void
  isEnabled: () => boolean
  setLabel: (text: string) => void
  destroy: () => void
}

export function createBigButton(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
): BigButton {
  const container = scene.add.container(x, y).setDepth(56)
  const bg = scene.add.graphics()
  const text = scene.add.text(0, -1, label, {
    fontFamily: FONT.black,
    fontSize: SIZE.button,
    color: hex(C.white),
    align: 'center',
  }).setOrigin(0.5).setResolution(2)

  let enabled = false
  let pulse: Phaser.Tweens.Tween | undefined

  const paint = () => {
    bg.clear()
    bg.fillStyle(C.shadow, 0.26)
    bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, h / 2)
    bg.fillStyle(enabled ? C.green : 0x6a7787, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    bg.fillStyle(C.white, enabled ? 0.3 : 0.12)
    bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 10, w - 28, 18, 9)
    bg.lineStyle(4, enabled ? 0x1f8a58 : 0x4d5866, 0.9)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
  }

  container.add([bg, text])
  layer.add(container)
  paint()
  container.setAlpha(0.5)

  const hit = scene.add.zone(x, y, w + 26, h + 22).setOrigin(0.5)
  hit.setInteractive({ useHandCursor: true })
  layer.add(hit)

  const setCursor = (on: boolean) => {
    if (hit.input) hit.input.cursor = on ? 'pointer' : 'default'
  }
  setCursor(false)

  hit.on('pointerover', () => { if (enabled) FX.to(scene, container, { scale: 1.05 }, { duration: 120 }) })
  hit.on('pointerout', () => { if (enabled) FX.to(scene, container, { scale: 1 }, { duration: 120 }) })
  hit.on('pointerdown', () => { if (enabled) FX.press(scene, container, 0.94) })
  hit.on('pointerup', () => { if (enabled) onClick() })

  const setEnabled = (on: boolean) => {
    const changed = on !== enabled
    enabled = on
    paint()
    container.setAlpha(on ? 1 : 0.5)
    setCursor(on)
    if (!changed) return

    pulse?.remove()
    pulse = undefined
    FX.kill(scene, container)
    container.setScale(1)
    if (on) {
      FX.to(scene, container, { scale: 1.08 }, { duration: 180, yoyo: true, ease: Ease.back(2) })
      pulse = FX.breathe(scene, container, { grow: 1.035, duration: 1100 })
    }
  }

  return {
    container,
    setEnabled,
    isEnabled: () => enabled,
    setLabel: (t: string) => text.setText(t),
    destroy: () => {
      pulse?.remove()
      hit.destroy()
      container.destroy()
    },
  }
}

export function createRoundButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  r: number,
  label: string,
  onClick: () => void,
) {
  const btn = scene.add.container(x, y)
  const bg = scene.add.graphics()
  bg.fillStyle(C.cream, 0.14)
  bg.fillCircle(0, 0, r)
  bg.lineStyle(3, C.glow, 0.9)
  bg.strokeCircle(0, 0, r)
  const txt = scene.add.text(0, -1, label, {
    fontFamily: FONT.black,
    fontSize: '26px',
    color: hex(C.cream),
  }).setOrigin(0.5).setResolution(2)

  btn.add([bg, txt])
  btn.setSize(r * 2, r * 2)
  btn.setInteractive(new Phaser.Geom.Circle(0, 0, r + 6), Phaser.Geom.Circle.Contains)
  if (btn.input) btn.input.cursor = 'pointer'
  btn.on('pointerover', () => FX.to(scene, btn, { scale: 1.12 }, { duration: 120 }))
  btn.on('pointerout', () => FX.to(scene, btn, { scale: 1 }, { duration: 120 }))
  btn.on('pointerup', () => { FX.press(scene, btn); onClick() })
  return btn
}

/* ───────────────────────────────────────────────────── reações ────── */

export function cardAccept(scene: Phaser.Scene, box: Phaser.GameObjects.Container, x: number, y: number) {
  FX.impact(scene, box, 0.14)
  FX.ping(scene, x, y, C.green, { radius: 84, duration: 460 })
}

export function cardReject(scene: Phaser.Scene, box: Phaser.GameObjects.Container) {
  FX.shake(scene, box, { amount: 12, times: 4 })
}

export function dealIn(scene: Phaser.Scene, cards: Phaser.GameObjects.Container[]) {
  return FX.stagger(scene, cards, (card) => FX.popIn(scene, card, { from: 0.7, duration: 340 }), 70)
}

export function flyToSlot(
  scene: Phaser.Scene,
  node: Phaser.GameObjects.Container,
  to: { x: number; y: number },
  endScale: number,
  duration = 340,
) {
  FX.to(scene, node, { scale: endScale, angle: 0 }, { duration, ease: Ease.smooth })
  return FX.arcTo(scene, node, to, { height: 78, duration })
}

/* ──────────────────────────────────────────────────────── toast ────── */

export function showToast(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  message: string,
  tone: number,
  life = 1900,
) {
  const box = scene.add.container(W / 2, H + 60).setDepth(200)
  const bg = scene.add.graphics()
  const w = 720
  const h = 74
  bg.fillStyle(C.shadow, 0.28)
  bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22)
  bg.fillStyle(tone, 0.98)
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
  bg.fillStyle(C.white, 0.2)
  bg.fillRoundedRect(-w / 2 + 12, -h / 2 + 9, w - 24, 16, 8)
  bg.lineStyle(4, C.white, 0.85)
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)

  const text = scene.add.text(0, 0, message, {
    fontFamily: FONT.black,
    fontSize: '21px',
    color: hex(C.cream),
    align: 'center',
    wordWrap: { width: w - 60 },
  }).setOrigin(0.5).setResolution(2)

  box.add([bg, text])
  layer.add(box)

  FX.seq(
    () => FX.to(scene, box, { y: 648 }, { duration: 320, ease: Ease.back(1.6) }),
    () => FX.wait(scene, life),
    () => FX.to(scene, box, { y: H + 60, alpha: 0 }, { duration: 280 }),
  ).then(() => box.destroy())

  return box
}