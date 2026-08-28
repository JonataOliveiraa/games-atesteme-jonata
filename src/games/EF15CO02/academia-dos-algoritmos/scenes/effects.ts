import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { ALPHA, C, FONT, TEXT, TIMING, SIZE, hex } from '../data/theme'
import { NOTICE, BENCH, STAGE, COLUMN, HUD, SHELF, TRACK } from '../data/layout'
import { ACTIONS, CONDITIONS, OBJECTS } from '../data/puzzles'
import { at } from '../types'
import type { World, Level, Piece, Glyph } from '../types'

export const hasTexture = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

export function putImage(
  scene: Phaser.Scene,
  key: string,
  cx: number,
  cy: number,
  maxH: number,
  maxW = Number.POSITIVE_INFINITY
): Phaser.GameObjects.Image | null {
  if (!hasTexture(scene, key)) return null
  const img = scene.add.image(cx, cy, key)
  img.setScale(Math.min(maxH / img.height, maxW / img.width, 1))
  return img
}

export function makeText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  txt: string,
  size: string,
  extra: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {}
) {
  return scene.add
    .text(x, y, txt, {
      fontFamily: FONT.black,
      fontSize: size,
      color: hex(TEXT.color),
      stroke: hex(TEXT.stroke),
      strokeThickness: TEXT.thickness,
      align: 'center',
      ...extra,
    })
    .setOrigin(0.5)
    .setResolution(2)
}

function raised(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  color: number,
  border: number
) {
  g.fillStyle(C.shadow, ALPHA.shadow)
  g.fillRoundedRect(x + 4, y + 7, w, h, radius)
  g.fillStyle(color, 1)
  g.fillRoundedRect(x, y, w, h, radius)
  g.lineStyle(3, border, 0.95)
  g.strokeRoundedRect(x, y, w, h, radius)
}

function carved(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  color: number,
  alpha: number,
  border: number
) {
  g.fillStyle(color, alpha)
  g.fillRoundedRect(x, y, w, h, radius)

  g.lineStyle(3, border, 0.9)
  g.strokeRoundedRect(x, y, w, h, radius)
  g.lineStyle(2, C.white, 0.12)
  g.lineBetween(x + radius, y + h - 2, x + w - radius, y + h - 2)
}

function pieceLabel(p: Piece): string {
  if (p.kind === 'action') return ACTIONS[p.action]?.label ?? p.action
  if (p.kind === 'repeat') return `repetir ${p.times}x\n${ACTIONS[p.action]?.label ?? p.action}`
  const cond = CONDITIONS[p.condition]?.label ?? p.condition
  return `se ${cond}\n${(p.then ? ACTIONS[p.then]?.label ?? p.then : '')}`
}

function pieceTexture(p: Piece): string {
  if (p.kind === 'action') return ACTIONS[p.action]?.texture ?? ''
  if (p.kind === 'repeat') return ACTIONS[p.action]?.texture ?? ''
  return (p.then && ACTIONS[p.then]?.texture) ?? ''
}

function pieceTone(p: Piece): number {
  if (p.kind === 'action') return C.wood
  if (p.kind === 'repeat') return C.brass
  return C.green
}

function pieceGlyph(p: Piece): Glyph {
  if (p.kind === 'action') return ACTIONS[p.action]?.glyph ?? 'none'
  if (p.kind === 'repeat') return 'repeat'
  return 'question'
}

export function drawGlyph(
  g: Phaser.GameObjects.Graphics,
  kind: Glyph,
  cx: number,
  cy: number,
  r: number,
  color: number
) {
  const line = Math.max(3, r * 0.22)
  g.lineStyle(line, color, 1)
  g.fillStyle(color, 1)

  /*
   * PEGAR SOBE, PÔR DESCE — e estava ao contrário.
   *
   * O sinal `s` era aplicado a TODAS as partes, inclusive à ponta: com
   * `up = true` a ponta ia parar embaixo do centro e a barra em cima. O
   * glifo de `pegar` desenhava uma seta para BAIXO saindo de um teto, e o
   * de `pôr` uma seta para CIMA. Os dois gestos do jogo, trocados.
   *
   * O chão agora é sempre o chão: fica embaixo nos dois casos, porque é
   * de lá que se pega e é para lá que se põe. Quem muda é a seta.
   */
  const arrow = (up: boolean) => {
    const s = up ? -1 : 1
    const tip = cy + s * r * 0.62
    const tail = cy - s * r * 0.45

    g.lineBetween(cx, tail, cx, tip - s * r * 0.3)

    g.fillTriangle(
      cx, tip,
      cx - r * 0.42, tip - s * r * 0.42,
      cx + r * 0.42, tip - s * r * 0.42
    )

    g.lineBetween(cx - r * 0.62, cy + r * 0.86, cx + r * 0.62, cy + r * 0.86)
  }

  const drop = (dx: number, dy: number, k: number) => {
    g.fillCircle(cx + dx, cy + dy + r * 0.18 * k, r * 0.34 * k)
    g.fillTriangle(
      cx + dx, cy + dy - r * 0.55 * k,
      cx + dx - r * 0.32 * k, cy + dy + r * 0.16 * k,
      cx + dx + r * 0.32 * k, cy + dy + r * 0.16 * k
    )
  }

  /*
   * O CADEADO ABERTO ESTAVA SOLTO NO AR.
   *
   * A haste era deslocada 0.3r para a direita e a perna que devia entrar
   * no corpo caía em `cx + 0.66r` — FORA do corpo, que termina em 0.55r.
   * O desenho ficava um arco flutuando ao lado de um retângulo.
   *
   * Agora o deslocamento é o que cabe (0.18r): a perna direita entra no
   * corpo, e é a ESQUERDA que fica erguida, que é o que se vê num cadeado
   * aberto de verdade.
   */
  const padlock = (open: boolean) => {
    const bodyTop = cy - r * 0.05
    const arcY = cy - r * 0.34
    const shift = open ? r * 0.18 : 0
    const R = r * 0.36

    g.fillStyle(color, 1)
    g.fillRoundedRect(cx - r * 0.55, bodyTop, r * 1.1, r * 0.85, r * 0.18)

    g.lineStyle(line, color, 1)
    g.beginPath()
    g.arc(cx + shift, arcY, R, Math.PI, 0)
    g.strokePath()

    g.lineBetween(cx + shift + R, arcY, cx + shift + R, bodyTop)
    g.lineBetween(
      cx + shift - R, arcY,
      cx + shift - R, open ? arcY + r * 0.2 : bodyTop
    )
  }

  switch (kind) {
    case 'pick':
      arrow(true)
      break

    case 'put':
      arrow(false)
      break

    case 'drop':
      drop(0, 0, 1.2)
      break

    case 'drops':
      drop(-r * 0.5, -r * 0.1, 0.7)
      drop(r * 0.5, -r * 0.1, 0.7)
      drop(0, r * 0.35, 0.7)
      break

    case 'sparkle': {
      const tip = r * 0.95
      const waist = r * 0.24
      g.fillTriangle(cx, cy - tip, cx - waist, cy, cx + waist, cy)
      g.fillTriangle(cx, cy + tip, cx - waist, cy, cx + waist, cy)
      g.fillTriangle(cx - tip, cy, cx, cy - waist, cx, cy + waist)
      g.fillTriangle(cx + tip, cy, cx, cy - waist, cx, cy + waist)
      break
    }

    case 'unlock':
      padlock(true)
      break

    case 'lock':
      padlock(false)
      break

    case 'stack':
      for (let i = 0; i < 3; i++) {
        g.fillRoundedRect(
          cx - r * 0.6 + (i % 2) * r * 0.1,
          cy + r * 0.55 - i * r * 0.42,
          r * 1.2,
          r * 0.34,
          r * 0.1
        )
      }
      break

    /*
     * A PONTA DA SETA MORA NO FIM DO ARCO.
     *
     * Ela era um triângulo em coordenadas fixas, e caía perto do COMEÇO do
     * traço, virada para lugar nenhum: lido de longe, um arco com um
     * caroço. Agora a ponta é calculada a partir do ângulo final — apoiada
     * no ponto onde o traço acaba e virada para onde ele ia.
     */
    case 'repeat': {
      const R = r * 0.62
      const from = Math.PI * 0.3
      const to = Math.PI * 1.78

      g.lineStyle(line, color, 1)
      g.beginPath()
      g.arc(cx, cy, R, from, to)
      g.strokePath()

      const ex = cx + Math.cos(to) * R
      const ey = cy + Math.sin(to) * R
      /* a tangente no fim do arco, e a perpendicular dela */
      const tx = -Math.sin(to)
      const ty = Math.cos(to)
      const half = r * 0.3

      g.fillTriangle(
        ex + tx * r * 0.5, ey + ty * r * 0.5,
        ex - ty * half, ey + tx * half,
        ex + ty * half, ey - tx * half
      )
      break
    }

    case 'question': {
      g.lineStyle(line, color, 1)
      g.beginPath()
      g.arc(cx, cy - r * 0.3, r * 0.42, Math.PI, Math.PI * 2.15)
      g.strokePath()
      g.lineBetween(cx + r * 0.05, cy + r * 0.02, cx + r * 0.05, cy + r * 0.35)
      g.fillCircle(cx + r * 0.05, cy + r * 0.72, line * 0.7)
      break
    }

    case 'check':
      g.lineStyle(line * 1.2, color, 1)
      g.beginPath()
      g.moveTo(cx - r * 0.6, cy)
      g.lineTo(cx - r * 0.15, cy + r * 0.5)
      g.lineTo(cx + r * 0.65, cy - r * 0.55)
      g.strokePath()
      break

    /* O par do `check`. O ramo do NÃO usava um `bang`, que diz "atenção"
     * e não "não" — e um par só se lê quando as duas metades são
     * opostas. */
    case 'cross':
      g.lineStyle(line * 1.2, color, 1)
      g.beginPath()
      g.moveTo(cx - r * 0.52, cy - r * 0.52)
      g.lineTo(cx + r * 0.52, cy + r * 0.52)
      g.moveTo(cx + r * 0.52, cy - r * 0.52)
      g.lineTo(cx - r * 0.52, cy + r * 0.52)
      g.strokePath()
      break

    case 'walk':
      g.lineStyle(line * 1.15, color, 1)
      for (let i = 0; i < 2; i++) {
        const x = cx - r * 0.3 + i * r * 0.62
        g.beginPath()
        g.moveTo(x - r * 0.24, cy - r * 0.5)
        g.lineTo(x + r * 0.22, cy)
        g.lineTo(x - r * 0.24, cy + r * 0.5)
        g.strokePath()
      }
      break

    case 'bang':
      g.fillRoundedRect(cx - line * 0.5, cy - r * 0.72, line, r * 1.05, line * 0.5)
      g.fillCircle(cx, cy + r * 0.65, line * 0.72)
      break

    case 'none':
    default:
      break
  }
}

function glyphBadge(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  children: Phaser.GameObjects.GameObject[],
  cx: number,
  cy: number,
  glyph: Glyph,
  radius = 23
) {
  if (glyph === 'none') return

  const g = scene.add.graphics()
  g.fillStyle(C.black, 0.55)
  g.fillCircle(cx, cy + 2, radius + 2)
  g.fillStyle(C.darkWood, 1)
  g.fillCircle(cx, cy, radius)
  g.lineStyle(2, C.cream, 0.9)
  g.strokeCircle(cx, cy, radius)

  drawGlyph(g, glyph, cx, cy, radius * 0.62, C.cream)

  children.push(g)
  container.add(g)
}

export interface Hud {
  container: Phaser.GameObjects.Container
  setLevel(number: number, idea: string): void
  setProgress(done: number, total: number): void
  destroy(): void
}

export function createHud(scene: Phaser.Scene, onHelpTap: () => void): Hud {
  const container = scene.add.container(0, 0).setDepth(40)
  const g = scene.add.graphics()
  container.add(g)

  g.fillStyle(C.darkWood, 1)
  g.fillRect(HUD.x, HUD.y, HUD.w, HUD.h)
  g.fillStyle(C.brass, 1)
  g.fillRect(HUD.x, HUD.y + HUD.h - HUD.accent, HUD.w, HUD.accent)
  g.fillStyle(C.shadow, ALPHA.shadow)
  g.fillRect(HUD.x, HUD.y + HUD.h, HUD.w, 8)

  const levelLabel = makeText(scene, HUD.level.x, HUD.level.cy, '', '24px').setOrigin(0, 0.5)
  container.add(levelLabel)

  const dots = scene.add.graphics()
  container.add(dots)

  /*
   * Era um retangulo arredondado passando por circulo, com o `?` branco de
   * contorno preto grosso — e branco sobre latao nao se le. Agora e um
   * circulo de verdade, com sombra, brilho no alto e a interrogacao em
   * tinta escura.
   */
  const { cx: helpX, cy: helpY, r: helpR } = HUD.help
  const helpG = scene.add.graphics()
  helpG.fillStyle(C.black, 0.4)
  helpG.fillCircle(helpX + 2, helpY + 4, helpR)
  helpG.fillStyle(C.brass, 1)
  helpG.fillCircle(helpX, helpY, helpR)
  helpG.fillStyle(C.cream, 0.3)
  helpG.fillCircle(helpX, helpY - helpR * 0.32, helpR * 0.7)
  helpG.lineStyle(4, C.cream, 1)
  helpG.strokeCircle(helpX, helpY, helpR)
  container.add(helpG)

  container.add(
    makeText(scene, helpX, helpY + 1, '?', SIZE.help, {
      color: hex(C.darkWood),
      stroke: hex(C.cream),
      strokeThickness: 3,
    })
  )

  const helpZone = scene.add
    .zone(helpX, helpY, HUD.help.touch, HUD.help.touch)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(60)
  helpZone.on('pointerdown', onHelpTap)

  return {
    container,
    setLevel(number, idea) {
      levelLabel.setText(`NÍVEL ${number} · ${idea.toUpperCase()}`)
    },
    setProgress(done, total) {
      dots.clear()
      for (let i = 0; i < total; i++) {
        const lit = i < done
        dots.fillStyle(C.black, 0.5)
        dots.fillCircle(HUD.dot.x + i * HUD.dot.gap, HUD.dot.y + 1, HUD.dot.r + 2)
        dots.fillStyle(lit ? C.brass : C.matte, 1)
        dots.fillCircle(HUD.dot.x + i * HUD.dot.gap, HUD.dot.y, HUD.dot.r)
      }
    },
    destroy() {
      helpZone.destroy()
      container.destroy(true)
    },
  }
}

export function createBench(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0).setDepth(5)
  const g = scene.add.graphics()
  container.add(g)
  raised(g, BENCH.x, BENCH.y, BENCH.w, BENCH.h, BENCH.radius, C.darkWood, C.wood)
  return container
}

export interface Stage {
  container: Phaser.GameObjects.Container
  dress(level: Level): void
  build(ids: string[], world: World): void
  refresh(world: World): void
  play(actionId: string, ok: boolean, world: World): Promise<void>
  celebrate(): Promise<void>
  destroy(): void
}

export function createStage(scene: Phaser.Scene): Stage {
  const container = scene.add.container(0, 0).setDepth(10)

  const frame = scene.add.graphics()
  container.add(frame)

  let bgImage: Phaser.GameObjects.Image | null = null
  let veil: Phaser.GameObjects.Graphics | null = null

  type Thing = {
    id: string
    img: Phaser.GameObjects.Image
    halo: Phaser.GameObjects.Graphics
    x: number
    y: number
    currentTexture: string
  }
  let things: Thing[] = []

  const drawFrame = () => {
    frame.clear()
    carved(frame, STAGE.x, STAGE.y, STAGE.w, STAGE.h, STAGE.radius, C.ink, 0.5, C.brass)
  }
  drawFrame()

  const clearThings = () => {
    things.forEach((c) => {
      FX.kill(scene, c.img)
      c.img.destroy()
      c.halo.destroy()
    })
    things = []
  }

  const scaleFor = (img: Phaser.GameObjects.Image) =>
    Math.min(STAGE.object.size / img.height, STAGE.object.size / img.width, 1)

  const find = (id: string) => things.find((c) => c.id === id)

  const paintThing = (c: Thing, world: World, withImpact: boolean) => {
    const def = OBJECTS[c.id]
    if (!def) return

    const wanted = def.texture(world)
    if (wanted !== c.currentTexture && hasTexture(scene, wanted)) {
      c.img.setTexture(wanted)
      c.img.setScale(scaleFor(c.img))
      c.currentTexture = wanted
      if (withImpact) void FX.impact(scene, c.img, 0.2)
    }

    const isHidden = def.hidden?.(world) ?? false
    c.img.setAlpha(isHidden ? 0 : 1)

    c.halo.clear()
    if (!isHidden && def.glows?.(world)) {
      const r = STAGE.object.size * 0.62
      c.halo.fillStyle(C.brass, 0.16)
      c.halo.fillCircle(c.x, c.y, r)
      c.halo.lineStyle(4, C.brass, 0.75)
      c.halo.strokeCircle(c.x, c.y, r)
    }
  }

  return {
    container,
    dress(level) {
      bgImage?.destroy()
      veil?.destroy()

      const key = level.scenery === 'room' ? 'bg-sala-treino' : 'bg-academia-hub'
      bgImage = putImage(scene, key, STAGE.x + STAGE.w / 2, STAGE.y + STAGE.h / 2, 4000, 4000)

      if (bgImage) {
        bgImage.setScale(Math.max(STAGE.w / bgImage.width, STAGE.h / bgImage.height))

        bgImage.preFX?.addBlur(1, 2, 2, 0.4)
        container.addAt(bgImage, 0)

        veil = scene.add.graphics()
        veil.fillStyle(C.ink, ALPHA.veil)
        veil.fillRoundedRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h, STAGE.radius)
        container.addAt(veil, 1)
      }

      drawFrame()
    },
    build(ids, world) {
      clearThings()

      const n = ids.length
      const width = n * STAGE.object.size + (n - 1) * STAGE.object.gap
      const x0 = STAGE.x + (STAGE.w - width) / 2 + STAGE.object.size / 2

      ids.forEach((id, i) => {
        const def = OBJECTS[id]
        if (!def) return

        const cx = x0 + i * (STAGE.object.size + STAGE.object.gap)
        const img = putImage(scene, def.texture(world), cx, STAGE.object.cy, STAGE.object.size, STAGE.object.size)
        if (!img) return

        const halo = scene.add.graphics()
        container.add(halo)
        container.add(img)

        const c: Thing = {
          id,
          img,
          halo,
          x: cx,
          y: STAGE.object.cy,
          currentTexture: def.texture(world),
        }
        things.push(c)

        paintThing(c, world, false)
        void FX.popIn(scene, img, { delay: i * 90 })
      })
    },
    refresh(world) {
      things.forEach((c) => paintThing(c, world, true))
    },
    async play(actionId, ok, world) {
      const def = ACTIONS[actionId]
      if (!def) {
        await FX.wait(scene, TIMING.beat * 0.4)
        return
      }

      const target = find(at(def.target, world))
      const source = def.source ? find(at(def.source, world)) : null

      if (!target) {
        await FX.wait(scene, TIMING.beat * 0.4)
        return
      }

      if (!source || source === target) {
        const high = target.y + STAGE.focus.dy
        await FX.to(scene, target.img, { y: high }, { duration: 190, ease: Ease.back(2) })

        if (ok) {
          this.refresh(world)
          await FX.all(
            FX.impact(scene, target.img, 0.2),
            FX.ping(scene, target.x, high, C.green, { radius: 64 })
          )
        } else {
          await FX.nope(scene, target.img)
        }

        await FX.to(scene, target.img, { y: target.y }, { duration: 190, ease: Ease.smooth })
        return
      }

      const prevDepth = source.img.depth
      source.img.setDepth(50)

      const dest = { x: target.x, y: target.y - STAGE.object.size * 0.42 }
      await FX.arcTo(scene, source.img, dest, { duration: 320, height: 70 })

      if (!ok) {
        await FX.nope(scene, source.img)
        await FX.arcTo(scene, source.img, { x: source.x, y: source.y }, { duration: 280, height: 50 })
        source.img.setDepth(prevDepth)
        return
      }

      await FX.to(scene, source.img, { angle: 32 }, { duration: 140, ease: Ease.smooth })
      await FX.all(
        FX.impact(scene, source.img, 0.16),
        FX.ping(scene, target.x, target.y - 10, C.green, { radius: 58 })
      )

      this.refresh(world)
      void FX.impact(scene, target.img, 0.18)

      await FX.to(scene, source.img, { angle: 0 }, { duration: 120 })
      await FX.arcTo(scene, source.img, { x: source.x, y: source.y }, { duration: 280, height: 50 })
      source.img.setDepth(prevDepth)
    },
    async celebrate() {
      await FX.all(
        FX.confetti(scene, { colors: [C.brass, C.green, C.cream, C.wood] }),
        ...things
          .filter((c) => c.img.alpha > 0)
          .map((c, i) => FX.wait(scene, i * 100).then(() => FX.impact(scene, c.img, 0.24)))
      )
    },
    destroy() {
      clearThings()
      bgImage?.destroy()
      veil?.destroy()
      container.destroy(true)
    },
  }
}

export interface Notice {
  container: Phaser.GameObjects.Container
  show(phrase: string, tone: 'error' | 'ok'): Promise<void>
  clear(): void
  destroy(): void
}

export function createNotice(scene: Phaser.Scene): Notice {
  const container = scene.add.container(0, 0).setDepth(35).setAlpha(0)
  const g = scene.add.graphics()
  container.add(g)

  const phrase = makeText(scene, NOTICE.cx, NOTICE.cy, '', SIZE.notice, {
    wordWrap: { width: NOTICE.w - 44 },
  })
  container.add(phrase)

  return {
    container,
    async show(txt, tone) {
      const color = tone === 'error' ? C.coral : C.green
      g.clear()
      raised(
        g,
        NOTICE.cx - NOTICE.w / 2,
        NOTICE.cy - NOTICE.h / 2,
        NOTICE.w,
        NOTICE.h,
        NOTICE.radius,
        C.ink,
        color
      )
      phrase.setText(txt)
      await FX.to(scene, container, { alpha: 1 }, { duration: 200 })
    },
    clear() {
      container.setAlpha(0)
      phrase.setText('')
      g.clear()
    },
    destroy() {
      container.destroy(true)
    },
  }
}

export interface Track {
  container: Phaser.GameObjects.Container
  build(slots: number): void
  reserve(index: number): void
  put(index: number, piece: Piece): void
  take(index: number): Piece | null
  firstEmpty(): number
  pieces(): (Piece | null)[]
  slotPos(index: number): { x: number; y: number }
  setActive(on: boolean): void
  light(index: number, loop?: { current: number; total: number }): Promise<void>
  lock(index: number): Promise<void>
  celebrate(): Promise<void>
  destroy(): void
}

export function createTrack(
  scene: Phaser.Scene,
  onSlotTap: (index: number) => void
): Track {
  const container = scene.add.container(0, 0).setDepth(20)
  const g = scene.add.graphics()
  container.add(g)

  let slots = 0
  let content: (Piece | null)[] = []
  let lit = -1
  let blamed = -1
  let active = true

  const reserved = new Set<number>()

  const children: Phaser.GameObjects.GameObject[] = []
  const zones: Phaser.GameObjects.Zone[] = []

  const head = scene.add.graphics().setDepth(30)
  container.add(head)

  let headDrawn = false

  const xOf = (i: number) => {
    const total = slots * TRACK.slotWidth + (slots - 1) * TRACK.gap
    const x0 = BENCH.x + (BENCH.w - total) / 2 + TRACK.slotWidth / 2
    return x0 + i * (TRACK.slotWidth + TRACK.gap)
  }

  let signature = ''

  const paint = () => {
    g.clear()

    for (let i = 0; i < slots; i++) {
      const cx = xOf(i)
      const piece = content[i]
      const x = cx - TRACK.slotWidth / 2
      const y = TRACK.cy - TRACK.slotHeight / 2

      if (!piece) {
        const incoming = reserved.has(i)
        carved(
          g, x, y, TRACK.slotWidth, TRACK.slotHeight, TRACK.radius,
          C.ink, incoming ? 0.6 : ALPHA.empty, incoming ? C.brass : C.wood
        )
      } else {
        const tone = i === blamed ? C.coral : i === lit ? C.brass : pieceTone(piece)
        raised(g, x, y, TRACK.slotWidth, TRACK.slotHeight, TRACK.radius, tone, C.cream)
      }

      if (i < slots - 1) {
        const middle = cx + TRACK.slotWidth / 2 + TRACK.gap / 2
        g.fillStyle(C.brass, 0.9)
        g.fillTriangle(
          middle - TRACK.arrow.width / 2, TRACK.cy - TRACK.arrow.height / 2,
          middle - TRACK.arrow.width / 2, TRACK.cy + TRACK.arrow.height / 2,
          middle + TRACK.arrow.width / 2, TRACK.cy
        )
      }

      const nx = cx + TRACK.badge.dx
      const ny = TRACK.cy + TRACK.badge.dy
      g.fillStyle(C.black, 0.55)
      g.fillCircle(nx, ny + 2, TRACK.badge.r + 2)
      g.fillStyle(piece ? C.brass : C.matte, 1)
      g.fillCircle(nx, ny, TRACK.badge.r)
    }
  }

  const rebuildChildren = () => {
    const sig = content.map((p) => (p ? pieceLabel(p) : '.')).join('|') + '#' + slots
    if (sig === signature) return
    signature = sig

    children.forEach((f) => f.destroy())
    children.length = 0

    for (let i = 0; i < slots; i++) {
      const cx = xOf(i)

      const stepText = makeText(
        scene,
        cx + TRACK.badge.dx,
        TRACK.cy + TRACK.badge.dy,
        String(i + 1),
        SIZE.badge
      )
      children.push(stepText)
      container.add(stepText)

      const piece = content[i]
      if (!piece) continue

      const img = putImage(scene, pieceTexture(piece), cx, TRACK.cy - 16, 46, 46)
      if (img) {
        children.push(img)
        container.add(img)
      }

      glyphBadge(
        scene,
        container,
        children,
        cx + TRACK.slotWidth / 2 - 20,
        TRACK.cy - TRACK.slotHeight / 2 + 20,
        pieceGlyph(piece),
        20
      )

      const rot = makeText(scene, cx, TRACK.cy + 28, pieceLabel(piece), SIZE.block, {
        wordWrap: { width: TRACK.slotWidth - 20 },
      })
      children.push(rot)
      container.add(rot)
    }
  }

  return {
    container,
    build(n) {
      slots = n
      content = new Array(n).fill(null)
      reserved.clear()
      lit = -1
      blamed = -1
      signature = ''

      zones.forEach((z) => z.destroy())
      zones.length = 0

      for (let i = 0; i < n; i++) {
        const z = scene.add
          .zone(xOf(i), TRACK.cy, TRACK.slotWidth, TRACK.slotHeight)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(60)
        z.on('pointerdown', () => {
          if (active) onSlotTap(i)
        })
        zones.push(z)
      }

      paint()
      rebuildChildren()
      head.clear()
      headDrawn = false
    },
    reserve(i) {
      reserved.add(i)
      paint()
    },
    put(i, piece) {
      reserved.delete(i)
      content[i] = piece
      paint()
      rebuildChildren()
    },
    take(i) {
      const p = content[i]
      reserved.delete(i)
      content[i] = null
      paint()
      rebuildChildren()
      return p
    },
    firstEmpty: () => content.findIndex((p, i) => p === null && !reserved.has(i)),
    pieces: () => [...content],
    slotPos: (i) => ({ x: xOf(i), y: TRACK.cy }),
    setActive(on) {
      active = on
      zones.forEach((z) => {
        if (z.input) z.input.enabled = on
      })
    },
    async light(i, loop) {
      lit = i
      blamed = -1
      paint()

      const cx = xOf(i)
      const cy = TRACK.cy + TRACK.head.dy

      if (!headDrawn) {
        head.fillStyle(C.black, 0.5)
        head.fillCircle(0, 2, TRACK.head.r + 6)
        head.fillStyle(C.brass, 1)
        head.fillCircle(0, 0, TRACK.head.r)
        head.lineStyle(3, C.white, 0.95)
        head.strokeCircle(0, 0, TRACK.head.r + 6)
        headDrawn = true
        head.setPosition(cx, cy).setAlpha(0)
        await FX.to(scene, head, { alpha: 1 }, { duration: 160 })
      } else {
        await FX.to(scene, head, { x: cx, y: cy }, { duration: 220, ease: Ease.smooth })
      }

      if (loop) {
        await FX.popText(scene, cx, cy - 36, `${loop.current}/${loop.total}`, {
          color: hex(C.white),
          size: SIZE.badge,
        })
        return
      }

      await FX.wait(scene, TIMING.beat * 0.3)
    },
    async lock(i) {
      blamed = i
      lit = -1
      paint()
      await FX.all(
        FX.ping(scene, xOf(i), TRACK.cy, C.coral, { radius: 96 }),
        FX.wait(scene, TIMING.stuck)
      )
    },
    async celebrate() {
      head.clear()
      headDrawn = false
      lit = -1
      blamed = -1
      paint()

      for (let i = 0; i < slots; i++) {
        if (!content[i]) continue
        void FX.ping(scene, xOf(i), TRACK.cy, C.green, { radius: 80 })
        await FX.wait(scene, 130)
      }
    },
    destroy() {
      zones.forEach((z) => z.destroy())
      zones.length = 0
      container.destroy(true)
    },
  }
}

export interface Shelf {
  container: Phaser.GameObjects.Container
  build(pieces: Piece[]): void
  cardPos(index: number): { x: number; y: number }
  setActive(on: boolean): void
  destroy(): void
}

export function createShelf(
  scene: Phaser.Scene,
  onBlockTap: (piece: Piece, index: number) => void
): Shelf {
  const container = scene.add.container(0, 0).setDepth(20)
  const g = scene.add.graphics()
  container.add(g)

  let pieces: Piece[] = []
  let active = true
  const children: Phaser.GameObjects.GameObject[] = []
  const zones: Phaser.GameObjects.Zone[] = []

  const xOf = (i: number) => {
    const total = pieces.length * SHELF.width + (pieces.length - 1) * SHELF.gap
    const x0 = BENCH.x + (BENCH.w - total) / 2 + SHELF.width / 2
    return x0 + i * (SHELF.width + SHELF.gap)
  }

  const paint = () => {
    g.clear()

    g.fillStyle(C.wood, 0.85)
    g.fillRoundedRect(
      BENCH.x + BENCH.pad,
      SHELF.board.y,
      BENCH.w - BENCH.pad * 2,
      SHELF.board.h,
      SHELF.board.h / 2
    )

    pieces.forEach((p, i) => {
      const cx = xOf(i)
      raised(
        g,
        cx - SHELF.width / 2,
        SHELF.cy - SHELF.height / 2,
        SHELF.width,
        SHELF.height,
        SHELF.radius,
        active ? pieceTone(p) : C.matte,
        active ? C.cream : C.darkWood
      )
    })
  }

  return {
    container,
    build(fresh) {
      pieces = Phaser.Utils.Array.Shuffle([...fresh])
      children.forEach((f) => f.destroy())
      children.length = 0
      zones.forEach((z) => z.destroy())
      zones.length = 0

      paint()

      pieces.forEach((p, i) => {
        const cx = xOf(i)

        const img = putImage(
          scene,
          pieceTexture(p),
          cx,
          SHELF.cy + SHELF.icon.dy,
          SHELF.icon.size,
          SHELF.icon.size
        )
        if (img) {
          children.push(img)
          container.add(img)
        }

        glyphBadge(
          scene,
          container,
          children,
          cx + SHELF.width / 2 - 22,
          SHELF.cy - SHELF.height / 2 + 22,
          pieceGlyph(p)
        )

        const rot = makeText(
          scene,
          cx,
          SHELF.cy + SHELF.label.dy,
          pieceLabel(p),
          SIZE.block,
          { wordWrap: { width: SHELF.width - 20 } }
        )
        children.push(rot)
        container.add(rot)

        const z = scene.add
          .zone(cx, SHELF.cy, SHELF.width, SHELF.height)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(60)
        z.on('pointerdown', () => {
          if (!active) return
          if (img) void FX.press(scene, img)
          onBlockTap(p, i)
        })
        zones.push(z)

        void FX.popIn(scene, rot, { delay: i * 70 })
      })
    },
    cardPos: (i) => ({ x: xOf(i), y: SHELF.cy }),
    setActive(on) {
      active = on
      paint()
      zones.forEach((z) => {
        if (z.input) z.input.enabled = on
      })
    },
    destroy() {
      zones.forEach((z) => z.destroy())
      zones.length = 0
      container.destroy(true)
    },
  }
}

export async function flyToTrack(
  scene: Phaser.Scene,
  piece: Piece,
  from: { x: number; y: number },
  to: { x: number; y: number }
): Promise<void> {
  const img = putImage(scene, pieceTexture(piece), from.x, from.y, 56, 56)
  if (!img) return

  img.setDepth(70)
  await FX.arcTo(scene, img, { x: to.x, y: to.y }, { duration: TIMING.flight, height: 90 })
  img.destroy()
}

export interface Column {
  container: Phaser.GameObjects.Container
  setRequest(phrase: string): void
  setMood(mood: 'normal' | 'happy' | 'thinking'): void
  setButton(enabled: boolean, label?: string): void
  destroy(): void
}

export function createColumn(scene: Phaser.Scene, onRun: () => void): Column {
  const container = scene.add.container(0, 0).setDepth(20)

  let trainerImg: Phaser.GameObjects.Image | null = null
  let enabled = false

  const bubble = scene.add.graphics()
  container.add(bubble)

  const request = scene.add
    .text(COLUMN.cx, COLUMN.bubble.cy, '', {
      fontFamily: FONT.black,
      fontSize: `${SIZE.request}px`,
      color: hex(TEXT.color),
      stroke: hex(TEXT.stroke),
      strokeThickness: TEXT.thickness,
      align: 'center',
      wordWrap: { width: COLUMN.bubble.w - 48 },
    })
    .setOrigin(0.5)
    .setResolution(2)
  container.add(request)

  const paintBubble = () => {
    const h = Phaser.Math.Clamp(request.getBounds().height + 48, COLUMN.bubble.hMin, COLUMN.bubble.hMax)
    const y = COLUMN.bubble.cy - h / 2
    bubble.clear()
    raised(bubble, COLUMN.cx - COLUMN.bubble.w / 2, y, COLUMN.bubble.w, h, COLUMN.bubble.radius, C.darkWood, C.brass)

    bubble.fillStyle(C.darkWood, 1)
    bubble.fillTriangle(COLUMN.cx - 18, y + h - 2, COLUMN.cx + 18, y + h - 2, COLUMN.cx, y + h + 22)
  }

  const buttonG = scene.add.graphics()
  container.add(buttonG)
  const buttonTxt = makeText(scene, COLUMN.cx, COLUMN.button.cy, 'EXECUTAR', SIZE.button)
  container.add(buttonTxt)

  const paintButton = () => {
    buttonG.clear()
    raised(
      buttonG,
      COLUMN.cx - COLUMN.button.w / 2,
      COLUMN.button.cy - COLUMN.button.h / 2,
      COLUMN.button.w,
      COLUMN.button.h,
      COLUMN.button.radius,
      enabled ? C.brass : C.matte,
      enabled ? C.white : C.darkWood
    )
    buttonTxt.setAlpha(enabled ? 1 : 0.45)
  }
  paintButton()

  const zone = scene.add
    .zone(COLUMN.cx, COLUMN.button.cy, COLUMN.button.w, COLUMN.button.h)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(60)
  zone.on('pointerdown', () => {
    if (!enabled) return
    void FX.press(scene, buttonTxt)
    onRun()
  })

  return {
    container,
    setRequest(phrase) {
      request.setText(phrase)
      let size = SIZE.request
      request.setFontSize(size)
      while (request.getBounds().height > COLUMN.bubble.hMax - 48 && size > SIZE.requestMin) {
        size -= 2
        request.setFontSize(size)
      }
      paintBubble()
    },
    setMood(mood) {
      trainerImg?.destroy()
      trainerImg = putImage(
        scene,
        `treinador-${mood}`,
        COLUMN.cx,
        COLUMN.trainer.cy,
        COLUMN.trainer.h,
        COLUMN.trainer.w
      )
      if (trainerImg) {
        container.add(trainerImg)
        void FX.popIn(scene, trainerImg, { from: 0.95, duration: 220 }).then(() => {
          if (trainerImg) FX.breathe(scene, trainerImg, { grow: 1.03, duration: 2400 })
        })
      }
    },
    setButton(on, label) {
      const justLit = on && !enabled
      enabled = on
      if (label) buttonTxt.setText(label)
      paintButton()
      if (zone.input) zone.input.enabled = on

      if (justLit) {
        void FX.impact(scene, buttonTxt, 0.22)
        void FX.ping(scene, COLUMN.cx, COLUMN.button.cy, C.brass, { radius: 120 })
      }
    },
    destroy() {
      zone.destroy()
      trainerImg?.destroy()
      container.destroy(true)
    },
  }
}
