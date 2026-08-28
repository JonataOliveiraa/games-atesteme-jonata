import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { ALPHA, C, hex, TIMING } from '../data/theme'
import { BELT, LANE, VERSIONS } from '../data/layout'
import { ACTIONS, CONDITIONS, HELD, OBJECTS, slotCount } from '../data/puzzles'
import type { Station, TrailPuzzle, World } from '../types'
import { drawGlyph, hasTexture, makeText, putImage } from './effects'

type Point = { x: number; y: number }

const stationCenters = (n: number): number[] => {
  const span = (LANE.x1 - LANE.x0) / n
  return Array.from({ length: n }, (_, i) => LANE.x0 + span * (i + 0.5))
}

function drawToken(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  r: number,
  body: number,
  ring: number
) {
  g.fillStyle(C.shadow, ALPHA.shadow)
  g.fillCircle(cx + 3, cy + 6, r)
  g.fillStyle(body, 1)
  g.fillCircle(cx, cy, r)
  g.lineStyle(4, ring, 1)
  g.strokeCircle(cx, cy, r)
}

/** O rosto de um gesto: o desenho da coisa, e o símbolo do verbo na quina. */
function faceOf(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  bag: Phaser.GameObjects.GameObject[],
  actionId: string,
  cx: number,
  cy: number,
  r: number,
  depth = 16
) {
  const def = ACTIONS[actionId]
  if (!def) return

  if (def.texture && hasTexture(scene, def.texture)) {
    const img = putImage(scene, def.texture, cx, cy - 4, r * 1.15, r * 1.15)
    if (img) {
      img.setDepth(depth)
      bag.push(img)
      container.add(img)
    }
    const bx = cx + r * 0.6
    const by = cy + r * 0.6
    const badge = scene.add.graphics().setDepth(depth + 1)
    badge.fillStyle(C.black, 0.35)
    badge.fillCircle(bx + 2, by + 3, r * 0.56)
    badge.fillStyle(C.ink, 1)
    badge.fillCircle(bx, by, r * 0.54)
    badge.lineStyle(3, C.cream, 0.9)
    badge.strokeCircle(bx, by, r * 0.54)
    drawGlyph(badge, def.glyph, bx, by, r * 0.36, C.cream)
    bag.push(badge)
    container.add(badge)
    return
  }

  const solo = scene.add.graphics().setDepth(depth)
  drawGlyph(solo, def.glyph, cx, cy, r * 0.7, C.cream)
  bag.push(solo)
  container.add(solo)
}

/* ══════════════════════════════════════════════════════════════════════════
   O CAMINHO
   ══════════════════════════════════════════════════════════════════════════ */

export interface Garden {
  container: Phaser.GameObjects.Container
  build(puzzle: TrailPuzzle, world: World): void
  refresh(world: World): void
  slots(): number
  filled(): (string | null)[]
  firstEmpty(): number
  reserve(i: number): void
  put(i: number, actionId: string): void
  take(i: number): string | null
  slotPos(i: number): Point
  stationCenter(i: number): number
  setActive(on: boolean): void
  light(i: number | null): void
  loopPips(done: number): void
  blame(i: number): Promise<void>
  where(objectId: string, world: World): Point
  walkTo(x: number): Promise<void>
  hop(): Promise<void>
  toBranch(station: number): Promise<void>
  /** A Lia, para a câmera seguir. */
  walker(): Phaser.GameObjects.Container
  toLane(): Promise<void>
  reveal(station: number, yes: boolean): Promise<void>
  carry(sourceId: string, to: Point, world: World, consumed: boolean): Promise<void>
  pour(to: Point): Promise<void>
  trouble(objectId: string, world: World): Promise<void>
  arrive(): Promise<void>
  missGoal(): Promise<void>
  destroy(): void
}

export function createGarden(scene: Phaser.Scene, onSlotTap: (i: number) => void): Garden {
  const container = scene.add.container(0, 0).setDepth(10)
  const ground = scene.add.graphics().setDepth(8)
  const hintG = scene.add.graphics().setDepth(13)
  const marks = scene.add.graphics().setDepth(13)
  const slotG = scene.add.graphics().setDepth(14)
  container.add(ground)
  container.add(marks)
  container.add(slotG)

  let bg: Phaser.GameObjects.Image | null = null
  let veil: Phaser.GameObjects.Graphics | null = null
  let stations: Station[] = []
  let centers: number[] = []
  let placed: (string | null)[] = []
  let lit: number | null = null
  let blamed: number | null = null
  let active = true
  let done = 0

  const reserved = new Set<number>()
  const slotXY: Point[] = []
  const objectSpots = new Map<string, Point>()
  const objectImgs = new Map<string, Phaser.GameObjects.Image>()
  const covers = new Map<number, Phaser.GameObjects.Container>()
  const askMarks = new Map<number, Phaser.GameObjects.Container>()
  const goalIcons: Phaser.GameObjects.Image[] = []
  const scrap: Phaser.GameObjects.GameObject[] = []
  const faces: Phaser.GameObjects.GameObject[] = []
  const zones: Phaser.GameObjects.Zone[] = []

  const lia = scene.add.container(LANE.startX, LANE.cy).setDepth(40)
  const liaImg = putImage(scene, 'personagem-lia', 0, -LANE.lia.h / 2 + 12, LANE.lia.h, 150)
  if (liaImg) lia.add(liaImg)
  container.add(lia)

  const hand = scene.add.container(LANE.startX + 54, LANE.cy - 46).setDepth(41)
  container.add(hand)
  let handImg: Phaser.GameObjects.Image | null = null

  const followHand = () => hand.setPosition(lia.x + 54, lia.y - 46)

  /*
   * A ORDEM DAS CAMADAS, e por que ela e esta.
   *
   * Container nao ordena filho por `depth`: desenha na ordem em que
   * recebeu. Sem arrumar, a Lia ficava atras de tudo e sumia; levantando
   * ela para o topo, passava a andar por cima dos icones do algoritmo.
   *
   * Nem um nem outro: os icones sao a PROGRAMACAO, e programacao e camada
   * de interface — fica sempre visivel. A Lia e mundo: anda na frente do
   * chao, das pedras e das coisas, e por tras dos icones.
   *
   *   chao < pedras < coisas < Lia e a mao < colchete, buracos e gestos
   */
  const raiseWalker = () => {
    container.bringToTop(lia)
    container.bringToTop(hand)
  }
  scene.tweens.add({
    targets: hintG,
    alpha: 0.45,
    duration: 780,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  })

  const goalPost = (): Point => ({ x: LANE.goal.cx, y: LANE.cy + LANE.goal.objectDy })

  /**
   * Uma coisa mora num lugar só.
   *
   * A bifurcação pergunta sobre o regador que a criança pegou lá na primeira
   * estação — se ela reescrevesse o endereço, o regador sumiria de onde ele é
   * pego e apareceria embaixo do "?". Quem registra primeiro fica com ele.
   */
  const place = (id: string, p: Point) => {
    if (!objectSpots.has(id)) objectSpots.set(id, p)
  }

  const clearAll = () => {
    scrap.forEach((o) => o.destroy())
    scrap.length = 0
    faces.forEach((o) => o.destroy())
    faces.length = 0
    objectImgs.forEach((i) => i.destroy())
    objectImgs.clear()
    objectSpots.clear()
    covers.forEach((c) => c.destroy())
    covers.clear()
    askMarks.clear()
    goalIcons.forEach((i) => i.destroy())
    goalIcons.length = 0
    zones.forEach((z) => z.destroy())
    zones.length = 0
    slotXY.length = 0
    reserved.clear()
  }

  const paintGround = () => {
    ground.clear()
    ground.lineStyle(54, C.darkWood, 0.5)
    ground.lineBetween(LANE.startX, LANE.cy, LANE.goal.cx - 40, LANE.cy)
    ground.lineStyle(40, C.wood, 0.92)
    ground.lineBetween(LANE.startX, LANE.cy, LANE.goal.cx - 40, LANE.cy)

    stations.forEach((st, i) => {
      const cx = centers[i]

      const { w, h, radius } = LANE.stone
      const wide = st.kind === 'loop' ? w + 44 : w
      ground.fillStyle(C.shadow, ALPHA.shadow)
      ground.fillRoundedRect(cx - wide / 2 + 4, LANE.cy - h / 2 + 8, wide, h, radius)
      ground.fillStyle(C.darkWood, 1)
      ground.fillRoundedRect(cx - wide / 2, LANE.cy - h / 2, wide, h, radius)
      ground.lineStyle(3, C.wood, 0.9)
      ground.strokeRoundedRect(cx - wide / 2, LANE.cy - h / 2, wide, h, radius)
    })
  }

  /**
   * O LAÇO É UM COLCHETE, NÃO UMA PALAVRA.
   *
   * Ele abraça as três coisas e o gesto: o que está aqui dentro acontece uma
   * vez em cada uma. As bolinhas em cima dizem quantas — e acendem uma a uma
   * durante a execução, que é o laço virando movimento.
   */
  const paintMarks = () => {
    marks.clear()

    stations.forEach((st, i) => {
      const cx = centers[i]

      if (st.kind === 'loop') {
        const hw = LANE.loop.halfWidth
        const top = LANE.loop.top
        marks.lineStyle(8, C.brass, 0.95)
        marks.beginPath()
        marks.moveTo(cx - hw, LANE.loop.bottom)
        marks.lineTo(cx - hw, top)
        marks.lineTo(cx + hw, top)
        marks.lineTo(cx + hw, LANE.loop.bottom)
        marks.strokePath()

        const n = st.each.length
        const first = cx - ((n - 1) * LANE.loop.pip.gap) / 2
        for (let k = 0; k < n; k++) {
          marks.fillStyle(C.ink, 0.75)
          marks.fillCircle(first + k * LANE.loop.pip.gap, top - 2, LANE.loop.pip.r + 3)
          marks.fillStyle(done > k ? C.green : C.cream, 1)
          marks.fillCircle(first + k * LANE.loop.pip.gap, top - 4, LANE.loop.pip.r)
        }
        return
      }

      if (st.kind === 'fork') {
        const F = LANE.fork
        const elbow = cx + F.elbowDx

        for (const dir of [-1, 1]) {
          const y = LANE.slotY + dir * F.dy
          const yes = dir < 0

          marks.lineStyle(10, C.wood, 1)
          marks.beginPath()
          marks.moveTo(cx + F.cardDx + F.cardR, LANE.slotY)
          marks.lineTo(elbow, LANE.slotY)
          marks.lineTo(elbow, y)
          marks.lineTo(cx + F.slotDx - LANE.slot.r, y)
          marks.strokePath()

          marks.fillStyle(C.ink, 1)
          marks.fillCircle(elbow, y, 24)
          marks.fillStyle(yes ? C.green : C.coral, 1)
          marks.fillCircle(elbow, y, 20)
          drawGlyph(marks, yes ? 'check' : 'cross', elbow, y, 12, C.ink)
        }
      }
    })
  }

  const nextEmpty = () => placed.findIndex((p, i) => p === null && !reserved.has(i))

  const paintSlots = () => {
    slotG.clear()
    hintG.clear()

    const next = active ? nextEmpty() : -1

    slotXY.forEach((p, i) => {
      const taken = placed[i] !== null
      const ring =
        blamed === i ? C.coral : lit === i || reserved.has(i) ? C.brass : C.dim
      slotG.fillStyle(C.ink, taken ? 0.95 : ALPHA.empty)
      slotG.fillCircle(p.x, p.y, LANE.slot.r)
      slotG.lineStyle(blamed === i || lit === i ? 7 : 4, ring, 1)
      slotG.strokeCircle(p.x, p.y, LANE.slot.r)
      if (!taken && !reserved.has(i)) {
        slotG.lineStyle(3, C.cream, 0.22)
        slotG.strokeCircle(p.x, p.y, LANE.slot.r - 14)
      }
    })

    // Onde o próximo gesto vai cair. Sem isto a criança toca no cinto e a
    // peça some para um buraco que ela não estava olhando.
    if (next >= 0) {
      const p = slotXY[next]
      hintG.fillStyle(C.brass, 0.16)
      hintG.fillCircle(p.x, p.y, LANE.slot.r + 20)
      hintG.lineStyle(7, C.brass, 0.95)
      hintG.strokeCircle(p.x, p.y, LANE.slot.r + 6)
      hintG.fillStyle(C.brass, 1)
      hintG.fillTriangle(
        p.x, p.y - LANE.slot.r - 20,
        p.x - 15, p.y - LANE.slot.r - 44,
        p.x + 15, p.y - LANE.slot.r - 44
      )
    }
  }

  const paintFaces = () => {
    faces.forEach((o) => o.destroy())
    faces.length = 0
    placed.forEach((a, i) => {
      if (a) faceOf(scene, container, faces, a, slotXY[i].x, slotXY[i].y, LANE.slot.r - 10)
    })
    raiseWalker()
  }

  const paintObjects = (world: World) => {
    const held = world.inHand ? HELD[world.inHand] : null
    objectSpots.forEach((p, id) => {
      const def = OBJECTS[id]
      if (!def) return
      const wanted = def.texture(world)
      let img = objectImgs.get(id)
      if (!img) {
        const made = putImage(scene, wanted, p.x, p.y, LANE.object.size, LANE.object.size)
        if (!made) return
        made.setDepth(12)
        container.add(made)
        objectImgs.set(id, made)
        img = made
      } else if (img.texture.key !== wanted && hasTexture(scene, wanted)) {
        img.setTexture(wanted)
        img.setScale(Math.min(LANE.object.size / img.height, LANE.object.size / img.width, 1))
        void FX.impact(scene, img, 0.22)
      }
      img.setAlpha(def.hidden?.(world) || held === id ? 0 : 1)
    })
    raiseWalker()
  }

  const paintHand = (world: World) => {
    const id = world.inHand ? HELD[world.inHand] : null
    const key = id ? (OBJECTS[id]?.texture(world) ?? '') : ''
    if (handImg && handImg.texture.key === key) return
    handImg?.destroy()
    handImg = null
    if (!key) return
    handImg = putImage(scene, key, 0, 0, 64, 64)
    if (handImg) {
      handImg.setDepth(42)
      hand.add(handImg)
      void FX.popIn(scene, handImg, { from: 0.4 })
    }
  }

  const garden: Garden = {
    container,

    build(puzzle, world) {
      clearAll()
      stations = puzzle.trail
      centers = stationCenters(stations.length)
      placed = new Array(slotCount(stations)).fill(null)
      lit = null
      blamed = null
      done = 0

      if (!bg) {
        bg = putImage(scene, 'bg-academia-hub', 640, 360, 3000, 3000)
        if (bg) {
          bg.setScale(Math.max(1280 / bg.width, 720 / bg.height))
          bg.setDepth(1)
          veil = scene.add.graphics().setDepth(2)
          veil.fillStyle(C.ink, ALPHA.veil)
          veil.fillRect(0, 0, 1280, 720)
        }
      }

      stations.forEach((st, i) => {
        const cx = centers[i]

        if (st.kind === 'fork') {
          const F = LANE.fork
          slotXY.push({ x: cx + F.slotDx, y: LANE.slotY - F.dy })
          slotXY.push({ x: cx + F.slotDx, y: LANE.slotY + F.dy })
          place(st.about, { x: cx + F.postDx, y: LANE.object.cy })

          const cover = scene.add.container(cx + F.cardDx, LANE.slotY).setDepth(20)

          const plate = scene.add.graphics()
          plate.fillStyle(C.black, 0.4)
          plate.fillCircle(2, 6, F.cardR)
          plate.fillStyle(C.glass, 1)
          plate.fillCircle(0, 0, F.cardR)
          plate.lineStyle(6, C.brass, 1)
          plate.strokeCircle(0, 0, F.cardR)
          cover.add(plate)

          // A silhueta diz SOBRE O QUE se pergunta; o `?` diz que a
          // resposta ainda não existe.
          const shape = putImage(
            scene,
            OBJECTS[st.about]?.texture(world) ?? '',
            0,
            -4,
            F.cardR * 1.2,
            F.cardR * 1.2
          )
          if (shape) {
            shape.setTintFill(C.ink)
            cover.add(shape)
          }

          // O `?` é a letra, igual à do botão de ajuda — a interrogação
          // desenhada à mão nunca fica com a mesma cara da fonte.
          const badge = scene.add.container(F.cardR * 0.62, F.cardR * 0.62)
          const disc = scene.add.graphics()
          disc.fillStyle(C.ink, 1)
          disc.fillCircle(0, 0, 25)
          disc.lineStyle(3, C.brass, 1)
          disc.strokeCircle(0, 0, 25)
          badge.add(disc)
          badge.add(
            makeText(scene, 0, 1, '?', '30px', {
              color: hex(C.brass),
              strokeThickness: 0,
            })
          )
          cover.add(badge)
          askMarks.set(i, badge)

          const ask = makeText(
            scene,
            cx + F.cardDx,
            LANE.slotY + F.labelDy,
            CONDITIONS[st.condition]?.question ?? '',
            '22px',
            { wordWrap: { width: 220 } }
          )
          ask.setDepth(21)
          scrap.push(ask)
          container.add(ask)

          covers.set(i, cover)
          container.add(cover)
          return
        }

        slotXY.push({ x: cx, y: LANE.slotY })

        if (st.kind === 'check') {
          place(st.about, { x: cx, y: LANE.object.cy })
        } else if (st.kind === 'loop') {
          const n = st.each.length
          const first = cx - ((n - 1) * LANE.object.gap) / 2
          st.each.forEach((id, k) =>
            place(id, { x: first + k * LANE.object.gap, y: LANE.object.cy })
          )
        } else if (st.object) {
          place(st.object, { x: cx, y: LANE.object.cy })
        }
      })

      slotXY.forEach((p, i) => {
        const z = scene.add
          .zone(p.x, p.y, LANE.slot.r * 2, LANE.slot.r * 2)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(60)
        z.on('pointerdown', () => {
          if (active) onSlotTap(i)
        })
        zones.push(z)
      })

      const board = scene.add.graphics().setDepth(9)
      board.fillStyle(C.shadow, ALPHA.shadow)
      board.fillRoundedRect(
        LANE.goal.cx - LANE.goal.w / 2 + 5,
        LANE.cy - 150 + 9,
        LANE.goal.w,
        268,
        LANE.goal.radius
      )
      board.fillStyle(C.darkWood, 1)
      board.fillRoundedRect(LANE.goal.cx - LANE.goal.w / 2, LANE.cy - 150, LANE.goal.w, 268, LANE.goal.radius)
      board.lineStyle(5, C.brass, 1)
      board.strokeRoundedRect(LANE.goal.cx - LANE.goal.w / 2, LANE.cy - 150, LANE.goal.w, 268, LANE.goal.radius)
      drawGlyph(board, 'check', LANE.goal.cx, LANE.cy - 116, 22, C.green)
      scrap.push(board)
      container.add(board)

      const n = puzzle.goal.length
      const first = LANE.cy - 60 + (3 - n) * 26
      puzzle.goal.forEach((tex, k) => {
        const icon = putImage(
          scene,
          tex,
          LANE.goal.cx,
          first + k * (LANE.goal.icon + LANE.goal.gap),
          LANE.goal.icon,
          LANE.goal.icon
        )
        if (icon) {
          icon.setDepth(11)
          container.add(icon)
          goalIcons.push(icon)
        }
      })

      lia.setPosition(LANE.startX, LANE.cy)
      followHand()
      paintGround()
      paintMarks()
      paintSlots()
      paintFaces()
      paintObjects(world)
      paintHand(world)
    },

    refresh(world) {
      paintObjects(world)
      paintHand(world)
      followHand()
    },

    async pour(to) {
      const water = putImage(scene, 'item-poca', to.x, to.y - 130, 76, 76)
      if (!water) return

      const wide = water.scaleX
      const tall = water.scaleY
      water.setDepth(30)
      container.add(water)
      raiseWalker()

      await FX.to(scene, water, { y: to.y - 10 }, { duration: 240, ease: 'Quad.easeIn' })
      await FX.to(
        scene,
        water,
        { y: to.y + 16, scaleX: wide * 1.55, scaleY: tall * 0.4 },
        { duration: 130 }
      )
      await FX.to(scene, water, { alpha: 0, scaleX: wide * 1.8 }, { duration: 340 })
      water.destroy()
    },

    walker: () => lia,

    slots: () => placed.length,
    filled: () => [...placed],
    firstEmpty: () => placed.findIndex((p, i) => p === null && !reserved.has(i)),
    slotPos: (i) => slotXY[i],
    stationCenter: (i) => centers[i],

    reserve(i) {
      reserved.add(i)
      paintSlots()
    },

    put(i, actionId) {
      reserved.delete(i)
      placed[i] = actionId
      paintSlots()
      paintFaces()
    },

    take(i) {
      const a = placed[i]
      reserved.delete(i)
      placed[i] = null
      paintSlots()
      paintFaces()
      return a
    },

    setActive(on) {
      active = on
      zones.forEach((z) => {
        if (z.input) z.input.enabled = on
      })
      paintSlots()
    },

    light(i) {
      lit = i
      blamed = null
      paintSlots()
    },

    loopPips(n) {
      done = n
      paintMarks()
    },

    async blame(i) {
      blamed = i
      lit = null
      paintSlots()
      await FX.ping(scene, slotXY[i].x, slotXY[i].y, C.coral, { radius: 110 })
    },

    /**
     * ONDE UMA COISA ESTÁ.
     *
     * Na estação dela, se tiver uma; na mão da Lia, se ela estiver carregando;
     * senão, lá na placa do fim — que é onde mora a mochila, e é por isso que
     * a coisa atravessa a tela até ela.
     */
    where(objectId, world) {
      if (world.inHand && HELD[world.inHand] === objectId) {
        return { x: lia.x + 54, y: lia.y - 46 }
      }
      return objectSpots.get(objectId) ?? goalPost()
    },

    async walkTo(x) {
      if (Math.abs(x - lia.x) < 6) return
      const from = lia.x
      const steps = Math.max(2, Math.round(Math.abs(x - from) / 95))
      for (let k = 1; k <= steps; k++) {
        const to = from + ((x - from) * k) / steps
        await FX.all(
          FX.to(scene, lia, { x: to }, { duration: 150, ease: Ease.smooth }),
          FX.to(scene, lia, { y: lia.y - 16 }, { duration: 75, yoyo: true })
        )
        followHand()
      }
      lia.setX(x)
      followHand()
    },

    async hop() {
      const base = lia.y
      await FX.to(scene, lia, { y: base - 48 }, { duration: 170, ease: Ease.back(2) })
      await FX.to(scene, lia, { y: base }, { duration: 210, ease: 'Bounce.easeOut' })
      followHand()
    },

    async toBranch(station) {
      await FX.to(scene, lia, { x: centers[station] }, { duration: 320, ease: Ease.smooth })
      followHand()
    },

    async toLane() {
      if (Math.abs(lia.y - LANE.cy) < 2) return
      await FX.to(scene, lia, { y: LANE.cy }, { duration: 300, ease: Ease.smooth })
      followHand()
    },

    /** O "?" cai e o ramo que valeu acende. É a condição virando imagem. */
    async reveal(station, yes) {
      const cover = covers.get(station)
      if (!cover) return

      await FX.to(scene, cover, { scale: 1.16 }, { duration: 160, ease: Ease.back(2) })

      const mark = askMarks.get(station)
      if (mark) {
        void FX.to(scene, mark, { alpha: 0, scale: 0.4 }, { duration: 200 })
        askMarks.delete(station)
      }
      cover.list.forEach((child) => {
        const img = child as Phaser.GameObjects.Image
        if (typeof img.clearTint === 'function') img.clearTint()
      })

      await FX.all(
        FX.to(scene, cover, { scale: 1 }, { duration: 220, ease: Ease.settle }),
        FX.ping(scene, cover.x, cover.y, yes ? C.green : C.coral, { radius: 96 })
      )
      covers.delete(station)
    },

    /**
     * A COISA VIAJA — e é ela, não um disco genérico.
     *
     * A coisa sai do lugar dela, entra na mochila e não volta; a pasta vai
     * até a escova, se inclina como quem espreme, e volta para o lugar dela.
     * Uma textura que troca sozinha esconde a causa; um objeto que se move
     * mostra quem fez o quê em quem, que é o que um passo de algoritmo é.
     */
    async carry(sourceId, to, world, consumed) {
      const from = garden.where(sourceId, world)
      const tex = OBJECTS[sourceId]?.texture(world) ?? ''
      const ghost = putImage(scene, tex, from.x, from.y, LANE.object.size * 0.8, LANE.object.size * 0.8)
      if (!ghost) {
        await FX.wait(scene, 260)
        return
      }
      ghost.setDepth(75)

      const held = world.inHand ? HELD[world.inHand] : null
      const original = held === sourceId ? handImg : (objectImgs.get(sourceId) ?? null)
      original?.setAlpha(0)

      await FX.arcTo(scene, ghost, { x: to.x, y: to.y - 34 }, { duration: 330, height: 92 })
      await FX.to(scene, ghost, { angle: 30 }, { duration: 130, ease: Ease.smooth })
      await FX.impact(scene, ghost, 0.18)

      if (consumed) {
        await FX.to(scene, ghost, { alpha: 0, scale: ghost.scale * 0.5 }, { duration: 220 })
        ghost.destroy()
        return
      }

      await FX.to(scene, ghost, { angle: 0 }, { duration: 110 })
      await FX.arcTo(scene, ghost, from, { duration: 260, height: 62 })
      ghost.destroy()
      original?.setAlpha(1)
    },

    /** O que faltou, em desenho: a coisa que recusou, com um "!" em cima. */
    async trouble(objectId, world) {
      const p = garden.where(objectId, world)
      const bubble = scene.add.container(p.x, p.y - 76).setDepth(70)
      const g = scene.add.graphics()
      g.fillStyle(C.ink, 0.94)
      g.fillCircle(0, 0, 54)
      g.lineStyle(6, C.coral, 1)
      g.strokeCircle(0, 0, 54)
      bubble.add(g)

      const img = putImage(scene, OBJECTS[objectId]?.texture(world) ?? '', 0, 0, 66, 66)
      if (img) bubble.add(img)

      const bang = scene.add.graphics()
      drawGlyph(bang, 'bang', 34, -36, 16, C.coral)
      bubble.add(bang)

      await FX.popIn(scene, bubble, { from: 0.4 })
      await FX.wait(scene, TIMING.stuck)
      await FX.to(scene, bubble, { alpha: 0 }, { duration: 200 })
      bubble.destroy()
    },

    async arrive() {
      await garden.walkTo(LANE.goal.cx - 96)
      await FX.all(
        ...goalIcons.map((icon, i) =>
          FX.wait(scene, i * 130).then(() =>
            FX.all(
              FX.impact(scene, icon, 0.3),
              FX.ping(scene, icon.x, icon.y, C.green, { radius: 58 })
            )
          )
        )
      )
    },

    /** Andou tudo e não chegou: a placa recusa, e nada mais precisa ser dito. */
    async missGoal() {
      await garden.walkTo(LANE.goal.cx - 96)
      await FX.all(
        FX.ping(scene, LANE.goal.cx, LANE.cy, C.coral, { radius: 120 }),
        ...goalIcons.map((icon) => FX.nope(scene, icon))
      )
    },

    destroy() {
      clearAll()
      bg?.destroy()
      veil?.destroy()
      container.destroy(true)
    },
  }

  return garden
}

/* ══════════════════════════════════════════════════════════════════════════
   O CINTO E O BOTÃO
   ══════════════════════════════════════════════════════════════════════════ */

/** O gesto viajando do cinto até o buraco: com cara, senão é um disco anônimo. */
export async function flyGesture(
  scene: Phaser.Scene,
  actionId: string,
  from: Point,
  to: Point
): Promise<void> {
  const ghost = scene.add.container(from.x, from.y).setDepth(80)
  const g = scene.add.graphics()
  drawToken(g, 0, 0, BELT.token.r - 8, C.wood, C.brass)
  ghost.add(g)

  const bag: Phaser.GameObjects.GameObject[] = []
  faceOf(scene, ghost, bag, actionId, 0, 0, BELT.token.r - 18, 81)

  await FX.arcTo(scene, ghost, to, { duration: TIMING.flight, height: 120 })
  ghost.destroy()
}

export interface Belt {
  container: Phaser.GameObjects.Container
  build(ids: string[]): void
  posOf(i: number): Point
  /** Esconde os gestos que já estão num buraco. */
  setUsed(ids: string[]): void
  setActive(on: boolean): void
  destroy(): void
}

export function createBelt(
  scene: Phaser.Scene,
  onTap: (actionId: string, i: number) => void
): Belt {
  const container = scene.add.container(0, 0).setDepth(20)
  const g = scene.add.graphics()
  container.add(g)

  let ids: string[] = []
  let active = true
  let used: string[] = []
  const zones: Phaser.GameObjects.Zone[] = []
  const bag: Phaser.GameObjects.GameObject[] = []
  const pieces = new Map<number, Phaser.GameObjects.GameObject[]>()

  const xOf = (i: number) => BELT.cx - ((ids.length - 1) * BELT.token.gap) / 2 + i * BELT.token.gap

  return {
    container,

    build(next) {
      ids = Phaser.Utils.Array.Shuffle([...next])
      used = []
      bag.forEach((o) => o.destroy())
      bag.length = 0
      zones.forEach((z) => z.destroy())
      zones.length = 0
      pieces.clear()

      g.clear()
      ids.forEach((_, i) => drawToken(g, xOf(i), BELT.cy, BELT.token.r, C.wood, C.brass))

      ids.forEach((id, i) => {
        const x = xOf(i)
        const own: Phaser.GameObjects.GameObject[] = []
        faceOf(scene, container, own, id, x, BELT.cy, BELT.token.r - 10, 22)
        own.forEach((o) => bag.push(o))

        const name = makeText(scene, x, BELT.cy + BELT.label.dy, ACTIONS[id]?.label ?? '', BELT.label.size, {
          wordWrap: { width: BELT.label.wrap },
        })
        name.setDepth(23)
        bag.push(name)
        own.push(name)
        container.add(name)
        pieces.set(i, own)

        const z = scene.add
          .zone(x, BELT.cy + BELT.label.dy / 2, BELT.token.r * 2 + 12, BELT.token.r * 2 + BELT.label.dy)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(60)
        z.on('pointerdown', () => {
          if (!active) return
          void FX.ping(scene, x, BELT.cy, C.brass, { radius: BELT.token.r })
          onTap(id, i)
        })
        zones.push(z)
      })
    },

    posOf: (i) => ({ x: xOf(i), y: BELT.cy }),

    /*
     * Um gesto que já está no caminho não pode continuar no cinto: a
     * criança tocava nele de novo e nada acontecia, o que lê como jogo
     * travado. Tirar o gesto do lugar devolve o disco.
     */
    setUsed(next) {
      used = next
      g.clear()
      ids.forEach((id, i) => {
        const gone = used.includes(id)
        if (!gone) drawToken(g, xOf(i), BELT.cy, BELT.token.r, C.wood, C.brass)

        const own = pieces.get(i) ?? []
        own.forEach((o) => {
          const shown = o as unknown as { setAlpha?: (a: number) => void }
          shown.setAlpha?.(gone ? 0 : 1)
        })

        const z = zones[i]
        if (z?.input) z.input.enabled = active && !gone
      })
    },

    setActive(on) {
      active = on
      zones.forEach((z, i) => {
        if (z.input) z.input.enabled = on && !used.includes(ids[i])
      })
    },

    destroy() {
      zones.forEach((z) => z.destroy())
      zones.length = 0
      pieces.clear()
      container.destroy(true)
    },
  }
}

export interface PlayButton {
  container: Phaser.GameObjects.Container
  setReady(on: boolean): void
  destroy(): void
}

export function createPlay(scene: Phaser.Scene, onPress: () => void): PlayButton {
  const container = scene.add.container(0, 0).setDepth(25)
  const g = scene.add.graphics()
  container.add(g)

  const face = scene.add.container(BELT.play.cx, BELT.play.cy).setDepth(26)
  const arrow = scene.add.graphics()
  face.add(arrow)
  container.add(face)

  let ready = false
  let beat: Phaser.Tweens.Tween | null = null

  const paint = () => {
    g.clear()
    drawToken(
      g,
      BELT.play.cx,
      BELT.play.cy,
      BELT.play.r,
      ready ? C.green : C.matte,
      ready ? C.cream : C.wood
    )
    arrow.clear()
    arrow.fillStyle(ready ? C.cream : C.dim, 1)
    arrow.fillTriangle(-15, -25, -15, 25, 27, 0)
  }
  paint()

  const z = scene.add
    .zone(BELT.play.cx, BELT.play.cy, BELT.play.r * 2, BELT.play.r * 2)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(60)
  z.on('pointerdown', () => {
    if (!ready) return
    void FX.press(scene, face)
    onPress()
  })

  return {
    container,

    setReady(on) {
      if (ready === on) return
      ready = on
      paint()
      beat?.remove()
      beat = null
      face.setScale(1)
      if (on) beat = FX.breathe(scene, face, { grow: 1.09, duration: 720 })
    },

    destroy() {
      beat?.remove()
      z.destroy()
      container.destroy(true)
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   O QUADRO DE VERSÕES
   ══════════════════════════════════════════════════════════════════════════

   A ficha pede "comparar diferentes soluções" e "guardar histórico de versões
   do algoritmo". É isto: cada EXECUTAR vira uma linha, na ordem em que ela
   tentou, com os gestos que ela pôs e a marca coral no que travou. Sem uma
   palavra — a evolução do raciocínio dela é a diferença entre as linhas. */

export type Version = {
  filling: (string | null)[]
  stuckAt: number | null
  won: boolean
}

export interface Versions {
  container: Phaser.GameObjects.Container
  show(list: Version[]): Promise<void>
  destroy(): void
}

export function createVersions(scene: Phaser.Scene): Versions {
  const container = scene.add.container(0, 0).setDepth(90).setAlpha(0)
  const g = scene.add.graphics()
  container.add(g)
  const bag: Phaser.GameObjects.GameObject[] = []

  return {
    container,

    async show(list) {
      bag.forEach((o) => o.destroy())
      bag.length = 0
      g.clear()

      const rows = list.slice(-4)
      if (rows.length < 2) return

      const h = rows.length * VERSIONS.rowH + 56
      const top = VERSIONS.cy - h / 2

      g.fillStyle(C.ink, 0.84)
      g.fillRect(0, 0, 1280, 720)
      g.fillStyle(C.shadow, ALPHA.shadow)
      g.fillRoundedRect(VERSIONS.cx - VERSIONS.w / 2 + 5, top + 9, VERSIONS.w, h, VERSIONS.radius)
      g.fillStyle(C.darkWood, 1)
      g.fillRoundedRect(VERSIONS.cx - VERSIONS.w / 2, top, VERSIONS.w, h, VERSIONS.radius)
      g.lineStyle(5, C.brass, 1)
      g.strokeRoundedRect(VERSIONS.cx - VERSIONS.w / 2, top, VERSIONS.w, h, VERSIONS.radius)

      rows.forEach((v, r) => {
        const y = top + 28 + VERSIONS.rowH * (r + 0.5)
        const n = v.filling.length
        const first = VERSIONS.cx - ((n - 1) * VERSIONS.gap) / 2 - 46

        v.filling.forEach((a, i) => {
          const x = first + i * VERSIONS.gap
          const bad = v.stuckAt === i
          g.fillStyle(C.ink, 0.85)
          g.fillCircle(x, y, VERSIONS.chip + 4)
          g.fillStyle(a ? C.wood : C.matte, 1)
          g.fillCircle(x, y, VERSIONS.chip)
          g.lineStyle(3, bad ? C.coral : C.brass, bad ? 1 : 0.55)
          g.strokeCircle(x, y, VERSIONS.chip)
          if (a) faceOf(scene, container, bag, a, x, y, VERSIONS.chip - 6, 92)
        })

        const endX = first + n * VERSIONS.gap + 14
        const mark = scene.add.graphics().setDepth(92)
        const won = v.won
        mark.fillStyle(won ? C.green : C.coral, 1)
        mark.fillCircle(endX, y, 22)
        drawGlyph(mark, won ? 'check' : 'bang', endX, y, 12, C.ink)
        bag.push(mark)
        container.add(mark)
      })

      await FX.to(scene, container, { alpha: 1 }, { duration: 260 })
      await FX.wait(scene, 1100 + rows.length * 420)
      await FX.to(scene, container, { alpha: 0 }, { duration: 240 })
    },

    destroy() {
      container.destroy(true)
    },
  }
}
