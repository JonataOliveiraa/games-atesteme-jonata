import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { ART, BG, OBJ, OBJECTS, at } from '../data/files'
import {
    CABLE,
    CUP,
    DEPTH,
    PLUG,
    SHELF,
    SHELF_TOP,
    SOCKET,
    SUN,
    TABLE,
    TABLE_RIGHT,
    TABLE_TOP,
    TABLET,
    WALL_Y,
    WINDOW,
} from '../data/layout'
import { C } from '../data/theme'
import type { Rect, SpotId, State, Vec } from '../types'

export interface Room {
    state(id: SpotId): State
    set(id: SpotId, state: State, animate: boolean): Promise<void>
    hit(id: SpotId): Rect
    tablet(): Vec
    cup(): Vec
    tabletSprite(): Phaser.GameObjects.Sprite
    spill(): Promise<void>
    bump(): Promise<boolean>
    yank(foot: () => Vec): Promise<void>
    sunPeak(): Promise<boolean>
    shine(): void
    rewind(): void
    update(time: number): void
    destroy(): void
}

const TOGGLE_MS = 460
const ALL: SpotId[] = ['cup', 'cable', 'edge', 'sun']

export function createRoom(scene: Phaser.Scene): Room {
    const objects: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        objects.push(o)
        return o
    }
    const extras = new Set<Phaser.GameObjects.GameObject>()
    const extra = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        extras.add(o)
        o.once('destroy', () => extras.delete(o))
        return o
    }

    keep(scene.add.image(0, 0, BG).setOrigin(0).setDepth(DEPTH.bg).setDisplaySize(1280, 720))
    const win = keep(scene.add.sprite(WINDOW.x, WINDOW.y, OBJECTS, OBJ.windowOpen).setOrigin(...at(ART.window.x, ART.window.y)).setScale(WINDOW.scale).setDepth(DEPTH.window))
    const glow = keep(scene.add.graphics().setDepth(DEPTH.window - 1))
    const beam = keep(scene.add.graphics().setDepth(DEPTH.beam))
    const sunArt = keep(scene.add.graphics().setDepth(DEPTH.window + 1))
    const heatArt = keep(scene.add.graphics().setDepth(DEPTH.fx))
    keep(scene.add.sprite(SHELF.x, SHELF.y, OBJECTS, OBJ.shelf).setOrigin(...at(ART.shelf.x, 175)).setScale(SHELF.scale).setDepth(DEPTH.shelf))
    keep(scene.add.sprite(SOCKET.x, SOCKET.y, OBJECTS, OBJ.socket).setOrigin(...at(ART.socket.x, ART.socket.y)).setScale(SOCKET.scale).setDepth(DEPTH.socket))
    const desk = keep(scene.add.sprite(TABLE.x, TABLE.footY, OBJECTS, OBJ.table).setOrigin(...at(ART.table.x, ART.base)).setScale(TABLE.scale).setDepth(DEPTH.table))
    const pad = keep(
        scene.add.sprite(TABLET.mid, TABLE_TOP, OBJECTS, OBJ.tabletOk).setOrigin(...at(ART.tablet.x, ART.base)).setScale(TABLET.scale).setDepth(DEPTH.tablet),
    )
    const glass = keep(scene.add.sprite(0, 0, OBJECTS, OBJ.cup).setOrigin(...at(ART.cup.x, ART.base)).setScale(CUP.scale).setDepth(DEPTH.cup))
    const cord = keep(scene.add.graphics().setDepth(DEPTH.cable))
    const puddle = keep(scene.add.graphics().setDepth(DEPTH.cup - 1))

    const states: Record<SpotId, State> = { cup: 'risk', cable: 'risk', edge: 'risk', sun: 'risk' }
    const view = { tuck: 0, beam: 1, heat: 0, sunGlow: 0, sun: 0, thermo: 0, temp: 0.18 }
    let foot: (() => Vec) | undefined
    let fallen = false

    const tabletX = () => (states.edge === 'safe' ? TABLET.mid : TABLET.edge)
    const nearCup = (x = pad.x): Vec => ({ x: x + CUP.offset, y: TABLE_TOP })
    const farCup: Vec = { x: SHELF.x, y: SHELF_TOP }
    const cupSpot = () => (states.cup === 'safe' ? farCup : nearCup(tabletX()))

    const place = () => {
        pad.setPosition(tabletX(), TABLE_TOP).setAngle(states.edge === 'safe' ? 0 : TABLET.tilt).setFrame(OBJ.tabletOk).setScale(TABLET.scale)
        const c = cupSpot()
        glass.setPosition(c.x, c.y).setAngle(0).setFrame(OBJ.cup).setScale(CUP.scale).setVisible(true)
        view.tuck = states.cable === 'safe' ? 1 : 0
        view.beam = states.sun === 'safe' ? 0 : 1
        view.heat = 0
        view.sunGlow = 0
        view.sun = 0
        view.thermo = 0
        view.temp = 0.18
        win.setFrame(states.sun === 'safe' ? OBJ.windowShut : OBJ.windowOpen).setScale(WINDOW.scale)
        puddle.clear()
        foot = undefined
        fallen = false
    }

    const lerp = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

    const cablePoints = (): Vec[] => {
        const start = { x: pad.x + 30, y: pad.y - 6 }
        const mid = CABLE.risk.map((p, i) => lerp(p, CABLE.safe[i], view.tuck))
        if (foot) mid[3] = foot()
        if (fallen) mid[0] = { x: pad.x + 10, y: pad.y - 10 }
        return [start, ...mid, PLUG]
    }

    const drawCable = () => {
        cord.clear()
        const spline = new Phaser.Curves.Spline(cablePoints().map(p => new Phaser.Math.Vector2(p.x, p.y)))
        const line = spline.getPoints(48)
        cord.lineStyle(CABLE.width + 5, C.ink, 1)
        cord.strokePoints(line, false)
        cord.lineStyle(CABLE.width, C.white, 1)
        cord.strokePoints(line, false)
        if (view.tuck > 0.85 && !foot) {
            CABLE.clips.forEach(x => {
                cord.fillStyle(C.cream, 1)
                cord.lineStyle(3, C.ink, 1)
                cord.fillRoundedRect(x - 9, WALL_Y - 4, 18, 18, 6)
                cord.strokeRoundedRect(x - 9, WALL_Y - 4, 18, 18, 6)
            })
        }
    }

    const drawBeam = (time: number) => {
        beam.clear()
        glow.clear()
        const b = view.beam
        if (b > 0.01) {
            const pulse = 0.85 + Math.sin(time * 0.004) * 0.15
            const tone = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(C.beam),
                Phaser.Display.Color.ValueToColor(C.heat),
                100,
                view.heat * 100,
            )
            const wedge = (spread: number) => [
                { x: SUN.beam[0], y: SUN.beam[1] },
                { x: pad.x + 80 * spread, y: pad.y - 150 * spread },
                { x: pad.x + 80 * spread, y: pad.y + 4 },
                { x: SUN.beam[2], y: SUN.beam[3] },
            ]
            beam.fillStyle(Phaser.Display.Color.GetColor(tone.r, tone.g, tone.b), (0.3 + view.sun * 0.12 + view.heat * 0.2) * b * pulse)
            beam.fillPoints(wedge(1), true)
            beam.fillStyle(C.white, (0.18 + view.sun * 0.12) * b * pulse)
            beam.fillPoints(wedge(0.55), true)
        }
        if (b > 0.01 && view.heat > 0.01) {
            beam.fillStyle(C.heat, 0.45 * view.heat * b)
            beam.fillEllipse(pad.x, pad.y - 60, 220 * TABLET.scale * 1.6, 170 * TABLET.scale * 1.6)
        }
        drawSun(time)
        drawHeat(time)
        if (view.sunGlow > 0.01) {
            glow.fillStyle(C.sunGlow, 0.55 * view.sunGlow)
            glow.fillCircle(SUN.disc.x, SUN.disc.y, SUN.disc.r * (1.6 + view.sunGlow))
            glow.fillStyle(C.sunGlow, 0.35 * view.sunGlow)
            glow.fillRoundedRect(WINDOW.x - 170, WINDOW.y - 170, 340, 340, 30)
        }
    }

    const drawSun = (time: number) => {
        sunArt.clear()
        if (view.sun < 0.01) return
        const r = SUN.disc.r * (0.9 + view.sun * 0.55)
        const { x, y } = SUN.disc
        const turn = time * 0.0012
        sunArt.fillStyle(C.sunGlow, 0.5 * view.sun)
        sunArt.fillCircle(x, y, r * 1.9)
        for (let k = 0; k < 12; k++) {
            const a = turn + (k / 12) * Math.PI * 2
            const len = r * (k % 2 ? 1.45 : 1.75)
            sunArt.fillStyle(k % 2 ? C.sun : C.heat, view.sun)
            sunArt.fillTriangle(
                x + Math.cos(a - 0.14) * r * 0.95,
                y + Math.sin(a - 0.14) * r * 0.95,
                x + Math.cos(a + 0.14) * r * 0.95,
                y + Math.sin(a + 0.14) * r * 0.95,
                x + Math.cos(a) * len,
                y + Math.sin(a) * len,
            )
        }
        sunArt.fillStyle(C.sun, view.sun)
        sunArt.fillCircle(x, y, r)
        sunArt.lineStyle(4, C.ink, view.sun)
        sunArt.strokeCircle(x, y, r)
        sunArt.fillStyle(C.white, 0.6 * view.sun)
        sunArt.fillEllipse(x - r * 0.35, y - r * 0.4, r * 0.5, r * 0.3)
    }

    const drawHeat = (time: number) => {
        heatArt.clear()
        if (view.heat > 0.01) {
            heatArt.lineStyle(5, C.heat, 0.85 * view.heat)
            for (let k = -1; k <= 1; k++) {
                const x0 = pad.x + k * 34
                const rise = (time * 0.06 + (k + 1) * 20) % 40
                heatArt.beginPath()
                for (let j = 0; j <= 10; j++) {
                    const yy = pad.y - 130 - j * 7 - rise
                    const xx = x0 + Math.sin(j * 0.9 + time * 0.01) * 7
                    if (j === 0) heatArt.moveTo(xx, yy)
                    else heatArt.lineTo(xx, yy)
                }
                heatArt.strokePath()
            }
        }
        if (view.thermo < 0.01) return
        const s = view.thermo
        const tx = pad.x + 100
        const ty = pad.y - 70
        const h = 84 * s
        const fill = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(C.cool),
            Phaser.Display.Color.ValueToColor(C.red),
            100,
            Phaser.Math.Clamp((view.temp - 0.2) / 0.7, 0, 1) * 100,
        )
        const color = Phaser.Display.Color.GetColor(fill.r, fill.g, fill.b)
        heatArt.fillStyle(C.shadow, 0.18 * s)
        heatArt.fillRoundedRect(tx - 18 + 3, ty - h / 2 - 8 + 4, 36, h + 30, 18)
        heatArt.fillStyle(C.white, s)
        heatArt.lineStyle(4, C.ink, s)
        heatArt.fillRoundedRect(tx - 12, ty - h / 2, 24, h, 12)
        heatArt.strokeRoundedRect(tx - 12, ty - h / 2, 24, h, 12)
        heatArt.fillCircle(tx, ty + h / 2, 19 * s)
        heatArt.strokeCircle(tx, ty + h / 2, 19 * s)
        heatArt.fillStyle(color, s)
        heatArt.fillCircle(tx, ty + h / 2, 13 * s)
        const level = (h - 12) * view.temp
        heatArt.fillRoundedRect(tx - 6, ty + h / 2 - level, 12, level, 6)
        heatArt.lineStyle(2, C.ink, 0.5 * s)
        for (let k = 1; k <= 3; k++) heatArt.lineBetween(tx + 4, ty - h / 2 + k * (h / 4), tx + 10, ty - h / 2 + k * (h / 4))
    }

    const hop = (target: Phaser.GameObjects.Sprite, to: Vec, ms: number, lift: number) => {
        const from = { x: target.x, y: target.y }
        return new Promise<void>(resolve =>
            scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: ms,
                ease: 'Sine.easeInOut',
                onUpdate: tween => {
                    const t = tween.getValue() ?? 0
                    target.setPosition(Phaser.Math.Linear(from.x, to.x, t), Phaser.Math.Linear(from.y, to.y, t) - Math.sin(t * Math.PI) * lift)
                },
                onComplete: () => resolve(),
            }),
        )
    }

    const tweenView = (props: Partial<typeof view>, ms: number, ease: string | ((t: number) => number) = Ease.smooth) =>
        new Promise<void>(resolve => {
            scene.tweens.add({ targets: view, ...props, duration: FX.ms(scene, ms), ease, onComplete: () => resolve() })
        })

    const toggle = async (id: SpotId) => {
        if (id === 'cup') {
            await hop(glass, cupSpot(), TOGGLE_MS + 80, 140)
            await FX.impact(scene, glass, 0.12)
            return
        }
        if (id === 'edge') {
            const jobs: Promise<void>[] = [FX.to(scene, pad, { x: tabletX(), angle: states.edge === 'safe' ? 0 : TABLET.tilt }, { duration: TOGGLE_MS, ease: Ease.back(1.4) })]
            if (states.cup === 'risk') jobs.push(FX.to(scene, glass, { x: nearCup(tabletX()).x }, { duration: TOGGLE_MS, ease: Ease.back(1.4) }))
            await Promise.all(jobs)
            return
        }
        if (id === 'cable') {
            await tweenView({ tuck: states.cable === 'safe' ? 1 : 0 }, TOGGLE_MS, Ease.back(1.2))
            return
        }
        await FX.to(scene, win, { scaleX: WINDOW.scale * 0.9, scaleY: WINDOW.scale * 1.03 }, { duration: 120 })
        win.setFrame(states.sun === 'safe' ? OBJ.windowShut : OBJ.windowOpen)
        void tweenView({ beam: states.sun === 'safe' ? 0 : 1 }, 320)
        await FX.to(scene, win, { scaleX: WINDOW.scale, scaleY: WINDOW.scale }, { duration: 320, ease: Ease.back(2) })
    }

    const splash = (x: number, y: number) => {
        for (let k = 0; k < 7; k++) {
            const d = extra(scene.add.graphics().setDepth(DEPTH.fx))
            d.fillStyle(C.juice, 1)
            d.lineStyle(3, C.ink, 1)
            d.fillCircle(0, 0, Phaser.Math.Between(5, 9))
            d.strokeCircle(0, 0, 8)
            d.setPosition(x, y)
            const to = { x: x + Phaser.Math.Between(20, 150), y: y - Phaser.Math.Between(10, 90) }
            void FX.to(scene, d, { x: to.x, y: to.y }, { duration: 260, ease: 'Quad.easeOut', delay: k * 18 })
                .then(() => FX.to(scene, d, { y: TABLE_TOP - Phaser.Math.Between(20, 90), alpha: 0.9 }, { duration: 260, ease: 'Quad.easeIn' }))
                .then(() => FX.to(scene, d, { alpha: 0 }, { duration: 300 }))
                .then(() => d.destroy())
        }
    }

    const steam = () => {
        for (let k = 0; k < 6; k++) {
            const s = extra(scene.add.graphics().setDepth(DEPTH.fx))
            s.fillStyle(C.white, 0.95)
            s.lineStyle(3, C.ink, 0.7)
            s.fillCircle(0, 0, 16)
            s.strokeCircle(0, 0, 16)
            s.setPosition(pad.x + Phaser.Math.Between(-50, 50), pad.y - 110).setScale(0.4)
            void FX.to(scene, s, { y: s.y - Phaser.Math.Between(70, 130), scale: 1.2, alpha: 0 }, { duration: 900, delay: k * 120 }).then(() => s.destroy())
        }
    }

    const fall = async (dx: number) => {
        fallen = true
        await FX.to(scene, pad, { x: TABLE_RIGHT + 24, angle: 34 }, { duration: 260, ease: 'Quad.easeIn' })
        pad.setDepth(DEPTH.actors + 3)
        await FX.to(scene, pad, { x: TABLE_RIGHT + dx, y: TABLET.floorY, angle: 150 }, { duration: 380, ease: 'Quad.easeIn' })
        pad.setFrame(OBJ.tabletBroken).setAngle(-14)
        FX.shakeCam(scene, 'medio')
        await FX.to(scene, pad, { angle: -6 }, { duration: 420, ease: Ease.spring(2, 6) })
    }

    place()

    return {
        state: id => states[id],
        async set(id, state, animate) {
            states[id] = state
            if (!animate) {
                place()
                return
            }
            await toggle(id)
        },
        hit(id) {
            if (id === 'cup') return { x: glass.x, y: glass.y + CUP.hit.dy, w: CUP.hit.w, h: CUP.hit.h }
            if (id === 'edge') return { x: pad.x, y: TABLE_TOP + TABLET.hit.dy, w: TABLET.hit.w, h: TABLET.hit.h }
            if (id === 'cable') return { ...CABLE.hit }
            return { x: WINDOW.x, y: WINDOW.y, w: WINDOW.hit.w, h: WINDOW.hit.h }
        },
        tablet: () => ({ x: pad.x, y: pad.y - 70 }),
        cup: () => ({ x: glass.x, y: glass.y - 50 }),
        tabletSprite: () => pad,
        async spill() {
            await FX.to(scene, glass, { angle: 82, x: glass.x + 18 }, { duration: 240, ease: 'Quad.easeIn' })
            glass.setFrame(OBJ.cupDown).setAngle(0).setX(glass.x + 10)
            splash(glass.x + 30, glass.y - 40)
            await FX.wait(scene, 280)
            pad.setFrame(OBJ.tabletWet)
            await FX.impact(scene, pad, 0.16)
        },
        async bump() {
            const tilt = states.edge === 'safe' ? 0 : TABLET.tilt
            await FX.to(scene, desk, { angle: -2.5, x: TABLE.x - 6 }, { duration: 90 })
            await FX.to(scene, desk, { angle: 0, x: TABLE.x }, { duration: 300, ease: Ease.spring(2, 6) })
            if (states.edge === 'safe') {
                await FX.to(scene, pad, { angle: tilt - 6, y: TABLE_TOP - 8 }, { duration: 120 })
                await FX.to(scene, pad, { angle: 0, y: TABLE_TOP }, { duration: 360, ease: Ease.spring(2, 6) })
                return true
            }
            await fall(10)
            return false
        },
        async yank(feet) {
            foot = feet
            await FX.wait(scene, 220)
            await fall(18)
            foot = undefined
            view.tuck = 0
        },
        async sunPeak() {
            const open = states.sun === 'risk'
            await tweenView(open ? { sunGlow: 1, sun: 1 } : { sunGlow: 1 }, 700, Ease.back(1.4))
            await tweenView({ thermo: 1 }, 260, Ease.back(1.8))
            if (!open) {
                await FX.to(scene, win, { scaleX: WINDOW.scale * 1.03 }, { duration: 200, yoyo: true })
                void FX.to(scene, pad, { scaleX: TABLET.scale * 1.08, scaleY: TABLET.scale * 1.08 }, { duration: 200, yoyo: true, ease: 'Sine.easeInOut' })
                await FX.wait(scene, 700)
                await tweenView({ sunGlow: 0.3 }, 300)
                return true
            }
            await tweenView({ heat: 1, temp: 1 }, 1500, 'Sine.easeIn')
            pad.setFrame(OBJ.tabletHot)
            steam()
            await FX.impact(scene, pad, 0.14)
            return false
        },
        shine() {
            void FX.to(scene, pad, { scaleX: TABLET.scale * 1.08, scaleY: TABLET.scale * 1.08 }, { duration: 200, yoyo: true, ease: 'Sine.easeInOut' })
        },
        rewind() {
            place()
        },
        update(time) {
            drawCable()
            drawBeam(time)
        },
        destroy() {
            objects.forEach(o => {
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
            extras.forEach(o => {
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
            extras.clear()
            scene.tweens.killTweensOf(view)
        },
    }
}

export const SPOTS: SpotId[] = ALL
