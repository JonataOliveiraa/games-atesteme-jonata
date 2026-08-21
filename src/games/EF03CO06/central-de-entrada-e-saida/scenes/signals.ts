import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import type { DeviceId } from '../types'

export interface Cable {
  layerNode: Phaser.GameObjects.Container
  plugIn: (duration?: number) => Promise<void>
  pulse: (opts?: { reverse?: boolean; duration?: number; iconKey?: string }) => Promise<void>
  setTone: (tone: number) => void
  fault: () => Promise<void>
  unplug: (duration?: number) => Promise<void>
  destroy: () => void
}

export function createCable(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  from: { x: number; y: number },
  to: { x: number; y: number },
  tone: number,
  opts: { sag?: number; depth?: number; via?: Array<{ x: number; y: number }> } = {},
): Cable {
  /*
   * Dois traçados, e a escolha é do chamador.
   *
   * SEM `via`: a curva de sempre — um Bézier quadrático com o ponto de
   * controle no meio, deslocado em y por `sag`. Serve para ligar duas coisas
   * que não têm nada entre elas.
   *
   * COM `via`: uma spline que passa pelos pontos dados, na ordem. É assim que
   * o cabo CONTORNA o computador em vez de cruzá-lo. Resolver isso por
   * profundidade não funciona aqui: o cabo é filho de um Container, e
   * Container do Phaser desenha na ordem de inserção — `setDepth` num filho
   * agenda a ordenação da lista da CENA, não a do pai. Como o cabo nasce
   * depois do computador, ele ficaria por cima de qualquer jeito. E mesmo que
   * ordenasse, passar por trás esconderia a bolinha de sinal justo no trecho
   * em que ela é a explicação do jogo.
   */
  const curve: Phaser.Curves.Curve = opts.via?.length
    ? new Phaser.Curves.Spline([
      new Phaser.Math.Vector2(from.x, from.y),
      ...opts.via.map(p => new Phaser.Math.Vector2(p.x, p.y)),
      new Phaser.Math.Vector2(to.x, to.y),
    ])
    : (() => {
      const sag = opts.sag ?? Math.max(40, Math.abs(to.x - from.x) * 0.22)
      const mid = new Phaser.Math.Vector2((from.x + to.x) / 2, (from.y + to.y) / 2 + sag)
      return new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(from.x, from.y),
        mid,
        new Phaser.Math.Vector2(to.x, to.y),
      )
    })()

  const pts = curve.getPoints(56)

  const node = scene.add.container(0, 0).setDepth(opts.depth ?? 10)
  const wire = scene.add.graphics()
  const glow = scene.add.graphics()
  node.add([wire, glow])
  layer.add(node)

  let color = tone
  let grown = 0
  let litA = 0
  let litB = 0

  const slice = (a: number, b: number) => {
    const n = pts.length - 1
    const i0 = Phaser.Math.Clamp(Math.floor(a * n), 0, n)
    const i1 = Phaser.Math.Clamp(Math.ceil(b * n), 0, n)
    return i1 - i0 < 1 ? [] : pts.slice(i0, i1 + 1)
  }

  const redraw = () => {
    wire.clear()
    glow.clear()
    const shown = slice(0, grown)
    if (shown.length > 1) {
      wire.lineStyle(15, C.ink, 0.5)
      wire.strokePoints(shown, false)
      wire.lineStyle(10, C.inkMid, 1)
      wire.strokePoints(shown, false)
      wire.lineStyle(4, C.white, 0.16)
      wire.strokePoints(shown, false)
    }
    const lit = slice(litA, Math.min(litB, grown))
    if (lit.length > 1) {
      glow.lineStyle(18, color, 0.22)
      glow.strokePoints(lit, false)
      glow.lineStyle(10, color, 1)
      glow.strokePoints(lit, false)
      glow.lineStyle(4, C.white, 0.6)
      glow.strokePoints(lit, false)
    }
  }

  const plugAt = (t: number) => {
    const p = curve.getPoint(t)
    const tan = curve.getTangent(t)
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.9)
    g.fillRoundedRect(-16, -11, 32, 22, 7)
    g.fillStyle(color, 1)
    g.fillRoundedRect(-11, -8, 22, 16, 5)
    g.lineStyle(3, C.white, 0.7)
    g.strokeRoundedRect(-16, -11, 32, 22, 7)
    g.setPosition(p.x, p.y)
    g.setRotation(Math.atan2(tan.y, tan.x))
    node.add(g)
    return g
  }

  redraw()

  const plugIn = async (duration = 420) => {
    const proxy = { v: 0 }
    await new Promise<void>(resolve => {
      scene.tweens.add({
        targets: proxy,
        v: 1,
        duration,
        ease: 'Sine.easeOut',
        onUpdate: () => { grown = proxy.v; redraw() },
        onComplete: () => resolve(),
      })
    })
    grown = 1
    redraw()
    plugAt(0)
    plugAt(1)
    FX.ping(scene, to.x, to.y, color, { radius: 54, duration: 340 })
  }

  const pulse = async (o: { reverse?: boolean; duration?: number; iconKey?: string } = {}) => {
    const duration = o.duration ?? 760
    const rev = !!o.reverse

    const bead = scene.add.container(0, 0).setDepth((opts.depth ?? 10) + 2)
    const halo = scene.add.graphics()
    halo.fillStyle(color, 0.3)
    halo.fillCircle(0, 0, 30)
    const core = scene.add.graphics()
    core.fillStyle(color, 1)
    core.fillCircle(0, 0, 15)
    core.fillStyle(C.white, 0.6)
    core.fillCircle(-4, -5, 6)
    core.lineStyle(3, C.white, 0.9)
    core.strokeCircle(0, 0, 15)
    bead.add([halo, core])

    if (o.iconKey && scene.textures.exists(o.iconKey)) {
      const disc = scene.add.graphics()
      disc.fillStyle(C.white, 0.97)
      disc.fillCircle(0, -46, 30)
      disc.lineStyle(5, color, 1)
      disc.strokeCircle(0, -46, 30)
      const img = scene.add.image(0, -46, o.iconKey)
      img.setScale(Math.min(44 / img.width, 44 / img.height))
      bead.add([disc, img])
    }
    layer.add(bead)
    FX.to(scene, halo, { scale: 1.3, alpha: 0.5 }, { duration: 460, yoyo: true, repeat: -1 })

    const proxy = { v: 0 }
    await new Promise<void>(resolve => {
      scene.tweens.add({
        targets: proxy,
        v: 1,
        duration,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          const t = rev ? 1 - proxy.v : proxy.v
          const p = curve.getPoint(t)
          bead.setPosition(p.x, p.y)
          if (rev) { litA = t; litB = 1 } else { litA = 0; litB = t }
          redraw()
        },
        onComplete: () => resolve(),
      })
    })

    await FX.to(scene, bead, { alpha: 0, scale: 0.5 }, { duration: 160 })
    bead.destroy()
    litA = 0
    litB = 1
    redraw()
  }

  const fault = async () => {
    const old = color
    color = C.red
    litA = 0
    litB = 1
    redraw()
    for (let i = 0; i < 3; i += 1) {
      const p = curve.getPoint(0.35 + i * 0.15)
      FX.sparks(scene, p.x, p.y, { color: C.red, count: 8, spread: 90 })
      await FX.wait(scene, 110)
    }
    FX.shake(scene, node, { amount: 6, times: 4 })
    await FX.wait(scene, 220)
    color = old
    litA = 0
    litB = 0
    redraw()
  }

  const unplug = async (duration = 300) => {
    const proxy = { v: grown }
    litB = 0
    await new Promise<void>(resolve => {
      scene.tweens.add({
        targets: proxy,
        v: 0,
        duration,
        ease: 'Sine.easeIn',
        onUpdate: () => { grown = proxy.v; redraw() },
        onComplete: () => resolve(),
      })
    })
    node.destroy()
  }

  return {
    layerNode: node,
    plugIn,
    pulse,
    setTone: (t: number) => { color = t; redraw() },
    fault,
    unplug,
    destroy: () => node.destroy(),
  }
}

/* ─────────────────────────────── sinal próprio de cada aparelho ── */

function arcWaves(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  tone: number,
  inward: boolean,
  count = 3,
) {
  const jobs: Array<Promise<unknown>> = []
  for (let i = 0; i < count; i += 1) {
    const g = scene.add.graphics().setDepth(140)
    g.lineStyle(7, tone, 1)
    g.beginPath()
    g.arc(0, 0, 46, Phaser.Math.DegToRad(-52), Phaser.Math.DegToRad(52), false)
    g.strokePath()
    g.setPosition(x, y)
    g.setRotation(inward ? Math.PI : 0)
    g.setScale(inward ? 2.2 : 0.4)
    g.setAlpha(0)
    layer.add(g)

    jobs.push(
      FX.seq(
        () => FX.wait(scene, i * 150),
        () => FX.to(scene, g, { alpha: 1 }, { duration: 120 }),
        () => FX.to(scene, g,
          { scale: inward ? 0.4 : 2.2, alpha: 0 },
          { duration: 620, ease: Ease.smooth }),
      ).then(() => g.destroy()),
    )
  }
  return Promise.all(jobs)
}

function ripple(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  tone: number,
) {
  const jobs = [0, 1].map(i => {
    const g = scene.add.graphics().setDepth(140)
    g.lineStyle(6, tone, 1)
    g.strokeCircle(0, 0, 30)
    g.setPosition(x, y).setScale(0.3).setAlpha(0)
    layer.add(g)
    return FX.seq(
      () => FX.wait(scene, i * 160),
      () => FX.to(scene, g, { alpha: 1, scale: 1 }, { duration: 180 }),
      () => FX.to(scene, g, { scale: 1.9, alpha: 0 }, { duration: 460 }),
    ).then(() => g.destroy())
  })
  return Promise.all(jobs)
}

async function irisFlash(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  tone: number,
) {
  const ring = scene.add.graphics().setDepth(140)
  ring.lineStyle(9, tone, 1)
  ring.strokeCircle(0, 0, 54)
  ring.setPosition(x, y).setAlpha(0)
  layer.add(ring)

  await FX.to(scene, ring, { alpha: 1, scale: 0.42 }, { duration: 300, ease: Ease.smooth })

  const flash = scene.add.graphics().setDepth(141)
  flash.fillStyle(C.white, 0.9)
  flash.fillCircle(0, 0, 40)
  flash.setPosition(x, y).setScale(0.3)
  layer.add(flash)

  await Promise.all([
    FX.to(scene, flash, { scale: 1.6, alpha: 0 }, { duration: 340 }),
    FX.to(scene, ring, { scale: 1.3, alpha: 0 }, { duration: 340 }),
  ])
  flash.destroy()
  ring.destroy()
}

async function keyTaps(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  tone: number,
) {
  const jobs = [-38, 0, 38].map((dx, i) => {
    const g = scene.add.graphics().setDepth(140)
    g.fillStyle(C.white, 0.96)
    g.fillRoundedRect(-15, -15, 30, 30, 8)
    g.lineStyle(4, tone, 1)
    g.strokeRoundedRect(-15, -15, 30, 30, 8)
    g.fillStyle(tone, 0.9)
    g.fillRoundedRect(-7, -3, 14, 5, 2)
    g.setPosition(x + dx, y).setAlpha(0).setScale(0.5)
    layer.add(g)
    return FX.seq(
      () => FX.wait(scene, i * 130),
      () => FX.to(scene, g, { alpha: 1, scale: 1, y: y - 34 }, { duration: 230, ease: Ease.back(2) }),
      () => FX.to(scene, g, { alpha: 0, y: y - 62 }, { duration: 280 }),
    ).then(() => g.destroy())
  })
  await Promise.all(jobs)
}

async function paperOut(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  tone: number,
) {
  const sheet = scene.add.container(x, y).setDepth(140)
  const g = scene.add.graphics()
  g.fillStyle(C.shadow, 0.18)
  g.fillRoundedRect(-32, -38, 68, 84, 8)
  g.fillStyle(C.white, 1)
  g.fillRoundedRect(-34, -40, 68, 84, 8)
  g.lineStyle(4, tone, 0.9)
  g.strokeRoundedRect(-34, -40, 68, 84, 8)
  g.fillStyle(tone, 0.55)
  for (let i = 0; i < 4; i += 1) g.fillRoundedRect(-22, -24 + i * 17, 44, 6, 3)
  sheet.add(g)
  sheet.setScale(1, 0).setAlpha(0)
  layer.add(sheet)

  await FX.to(scene, sheet, { alpha: 1, scaleY: 1, y: y + 46 }, { duration: 520, ease: Ease.smooth })
  await FX.wait(scene, 260)
  await FX.to(scene, sheet, { alpha: 0, y: y + 66 }, { duration: 260 })
  sheet.destroy()
}

async function screenBloom(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  tone: number,
) {
  const beam = scene.add.graphics().setDepth(139)
  beam.fillStyle(tone, 0.28)
  beam.fillTriangle(0, 0, -78, 96, 78, 96)
  beam.setPosition(x, y).setAlpha(0)
  layer.add(beam)
  await FX.to(scene, beam, { alpha: 1 }, { duration: 220 })
  await ripple(scene, layer, x, y, tone)
  await FX.to(scene, beam, { alpha: 0 }, { duration: 260 })
  beam.destroy()
}

/**
 * O que cada aparelho faz quando é ligado. É esta diferença que ensina
 * entrada e saída sem texto: onda que converge, onda que se abre, papel
 * que desce, tecla que pula.
 */
export function deviceSignal(
  scene: Phaser.Scene,
  layer: Phaser.GameObjects.Container,
  x: number,
  y: number,
  id: DeviceId,
): Promise<unknown> {
  switch (id) {
    case 'microfone': return arcWaves(scene, layer, x, y - 46, C.inBlue, true)
    case 'alto-falante': return arcWaves(scene, layer, x, y - 46, C.outAmber, false)
    case 'camera': return irisFlash(scene, layer, x, y - 24, C.inBlue)
    case 'teclado': return keyTaps(scene, layer, x, y - 20, C.inBlue)
    case 'mouse': return ripple(scene, layer, x, y - 24, C.inBlue)
    case 'monitor': return screenBloom(scene, layer, x, y - 34, C.outAmber)
    case 'impressora': return paperOut(scene, layer, x, y - 10, C.outAmber)
    default: return ripple(scene, layer, x, y, C.inBlue)
  }
}