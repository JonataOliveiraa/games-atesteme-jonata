import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI2_CELL, UI2_SHEET, UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { DEPTH, HIGHWAY, LANE_ICON, NOTE } from '../data/layout'
import { C, LANE_TONES } from '../data/theme'
import { TIMING } from '../data/timing'
import type { ChartNote, Grade, Lane, Rect } from '../types'
import { baked, fitInto } from './art'

export interface Highway {
    load(notes: ChartNote[], approach: number): void
    update(songMs: number): number
    hit(lane: Lane, songMs: number): Grade | null
    due(songMs: number): Lane[]
    drop(): void
    setInput(on: boolean): void
    setLaneIcons(on: boolean): void
    onLane(cb: (lane: Lane) => void): void
    clear(): void
    rect(): Rect
    destroy(): void
}

interface Live {
    lane: Lane
    t: number
    img?: Phaser.GameObjects.Image
    state: 'wait' | 'hit' | 'miss'
}

const KEYS: Record<string, Lane> = {
    a: 0,
    s: 1,
    d: 2,
    f: 3,
    arrowleft: 0,
    arrowdown: 1,
    arrowup: 2,
    arrowright: 3,
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3,
}

const BOARD = 'rde-board'
const BEATS = [UI2_CELL.kick, UI2_CELL.snare, UI2_CELL.clap, UI2_CELL.cymbal]
const beamKey = (lane: number) => `rde-beam-${lane}`

const SPAN = HIGHWAY.hitY - HIGHWAY.vanishY
const S_FAR = (HIGHWAY.farY - HIGHWAY.vanishY) / SPAN
const S_BOTTOM = (HIGHWAY.bottom - HIGHWAY.vanishY) / SPAN
const Z_FAR = 1 / S_FAR
const SLOPE = (Z_FAR - 1) / (1 - S_FAR)
const LANE_W = (HIGHWAY.halfW * 2) / HIGHWAY.lanes

const persp = (p: number) => (1 / (Z_FAR + (1 - Z_FAR) * p) - S_FAR) / (1 - S_FAR)

export function scaleAt(p: number) {
    const k = HIGHWAY.perspective
    if (p <= 1) return S_FAR + (1 - S_FAR) * ((1 - k) * p + k * persp(p))
    return 1 + (1 - S_FAR) * ((1 - k) + k * SLOPE) * (p - 1)
}

export const yAt = (s: number) => HIGHWAY.vanishY + SPAN * s
export const sAt = (y: number) => (y - HIGHWAY.vanishY) / SPAN
export const edgeX = (edge: number, s: number) => HIGHWAY.cx + ((edge / HIGHWAY.lanes) * 2 - 1) * HIGHWAY.halfW * s
export const laneX = (lane: number, s: number) => edgeX(lane + 0.5, s)

export function createHighway(scene: Phaser.Scene): Highway {
    const ox = HIGHWAY.cx - HIGHWAY.halfW * S_BOTTOM - 12
    const oy = HIGHWAY.farY - 12
    const bw = HIGHWAY.halfW * S_BOTTOM * 2 + 24
    const bh = HIGHWAY.bottom - oy
    const quad = (e0: number, e1: number, y0: number, y1: number) => {
        const s0 = sAt(y0)
        const s1 = sAt(y1)
        return [
            { x: edgeX(e0, s0) - ox, y: y0 - oy },
            { x: edgeX(e1, s0) - ox, y: y0 - oy },
            { x: edgeX(e1, s1) - ox, y: y1 - oy },
            { x: edgeX(e0, s1) - ox, y: y1 - oy },
        ]
    }
    baked(scene, BOARD, bw, bh, g => {
        g.fillStyle(C.shadow, 0.78)
        g.fillPoints(quad(0, 4, HIGHWAY.farY, HIGHWAY.bottom), true)
        LANE_TONES.forEach((tone, i) => {
            g.fillStyle(tone, 0.07)
            g.fillPoints(quad(i, i + 1, HIGHWAY.farY, HIGHWAY.bottom), true)
        })
        g.fillStyle(C.white, 0.1)
        g.fillPoints(quad(0, 4, HIGHWAY.hitY - HIGHWAY.padH / 2, HIGHWAY.hitY + HIGHWAY.padH / 2), true)
        for (let e = 1; e < HIGHWAY.lanes; e++) {
            const [a, , , d] = quad(e, e, HIGHWAY.farY, HIGHWAY.bottom)
            g.lineStyle(3, C.violetLight, 0.45)
            g.lineBetween(a.x, a.y, d.x, d.y)
        }
        ;[
            { e: 0, tone: C.pink },
            { e: 4, tone: C.cyan },
        ].forEach(({ e, tone }) => {
            const [a, , , d] = quad(e, e, HIGHWAY.farY, HIGHWAY.bottom)
            g.lineStyle(14, tone, 0.25)
            g.lineBetween(a.x, a.y, d.x, d.y)
            g.lineStyle(4, tone, 1)
            g.lineBetween(a.x, a.y, d.x, d.y)
        })
        const top = quad(0, 4, HIGHWAY.farY, HIGHWAY.farY)
        g.lineStyle(3, C.violetLight, 0.8)
        g.lineBetween(top[0].x, top[0].y, top[1].x, top[1].y)
        LANE_TONES.forEach((tone, i) => {
            const cell = quad(i + 0.04, i + 0.96, HIGHWAY.hitY - HIGHWAY.padH / 2, HIGHWAY.hitY + HIGHWAY.padH / 2)
            g.lineStyle(4, tone, 0.95)
            g.strokePoints(cell, true)
        })
        const line = quad(0, 4, HIGHWAY.hitY, HIGHWAY.hitY)
        g.lineStyle(16, C.white, 0.18)
        g.lineBetween(line[0].x - 6, line[0].y, line[1].x + 6, line[1].y)
        g.lineStyle(5, C.white, 1)
        g.lineBetween(line[0].x - 6, line[0].y, line[1].x + 6, line[1].y)
    })
    const beamBox: Rect[] = []
    LANE_TONES.forEach((_, i) => {
        const left = Math.min(edgeX(i, 1), edgeX(i, S_FAR))
        const right = Math.max(edgeX(i + 1, 1), edgeX(i + 1, S_FAR))
        const w = right - left
        const h = HIGHWAY.hitY - HIGHWAY.farY
        beamBox.push({ x: left, y: HIGHWAY.farY, w, h })
        baked(scene, beamKey(i), w, h, g => {
            const N = 22
            for (let k = 0; k < N; k++) {
                const y0 = HIGHWAY.hitY - (h * k) / N
                const y1 = HIGHWAY.hitY - (h * (k + 1)) / N
                const s0 = sAt(y0)
                const s1 = sAt(y1)
                g.fillStyle(0xffffff, 0.75 * (1 - k / N) ** 1.6)
                g.fillPoints(
                    [
                        { x: edgeX(i, s0) - left, y: y0 - HIGHWAY.farY },
                        { x: edgeX(i + 1, s0) - left, y: y0 - HIGHWAY.farY },
                        { x: edgeX(i + 1, s1) - left, y: y1 - HIGHWAY.farY },
                        { x: edgeX(i, s1) - left, y: y1 - HIGHWAY.farY },
                    ],
                    true,
                )
            }
        })
    })

    const board = scene.add.image(ox, oy, BOARD).setOrigin(0, 0).setDepth(DEPTH.board)
    const beams = beamBox.map((b, i) =>
        scene.add
            .image(b.x, b.y, beamKey(i))
            .setOrigin(0, 0)
            .setTint(LANE_TONES[i])
            .setAlpha(0)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(DEPTH.flash),
    )
    const zones = LANE_TONES.map((_, i) => {
        const left = edgeX(i, 1)
        return scene.add
            .zone(left + LANE_W / 2, (HIGHWAY.zoneTop + HIGHWAY.bottom) / 2, LANE_W, HIGHWAY.bottom - HIGHWAY.zoneTop)
            .setDepth(DEPTH.note)
            .setInteractive({ useHandCursor: true })
    })
    const icons = BEATS.map((cell, i) =>
        fitInto(scene.add.image(laneX(i, sAt(LANE_ICON.y)), LANE_ICON.y, UI2_SHEET.key, cellKey(cell)), LANE_ICON.size)
            .setAlpha(LANE_ICON.alpha)
            .setDepth(DEPTH.board + 0.5)
            .setVisible(false),
    )
    let notes: Live[] = []
    let approach = 2200
    let inputOn = false
    let handler: ((lane: Lane) => void) | null = null
    const flyers: Phaser.GameObjects.Image[] = []

    const paintInput = () =>
        zones.forEach(z => {
            if (z.input) z.input.enabled = inputOn
        })
    paintInput()

    zones.forEach((zone, i) =>
        zone.on('pointerdown', () => {
            if (inputOn) handler?.(i as Lane)
        }),
    )
    const onKey = (event: KeyboardEvent) => {
        if (event.repeat) return
        const lane = KEYS[event.key.toLowerCase()]
        if (lane === undefined || !inputOn) return
        handler?.(lane)
    }
    scene.input.keyboard?.on('keydown', onKey)

    const flash = (lane: Lane, strong: boolean) => {
        const beam = beams[lane]
        scene.tweens.killTweensOf(beam)
        beam.setAlpha(strong ? 1 : 0.35)
        void FX.to(scene, beam, { alpha: 0 }, { duration: strong ? 360 : 200 })
        const icon = icons[lane]
        if (strong && icon.visible && !scene.tweens.isTweening(icon)) void FX.press(scene, icon, 1.18)
    }

    const burst = (n: Live) => {
        const img = n.img
        n.img = undefined
        img?.destroy()
        const spark = fitInto(scene.add.image(laneX(n.lane, 1), HIGHWAY.hitY, UI_SHEET.key, cellKey(UI_CELL.spark)), 150)
        spark.setTint(LANE_TONES[n.lane]).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.spark)
        flyers.push(spark)
        const base = spark.scale
        spark.setScale(base * 0.5)
        void FX.to(scene, spark, { scale: base * 1.15, alpha: 0, angle: 30 }, { duration: 340 }).then(() => {
            const at = flyers.indexOf(spark)
            if (at >= 0) flyers.splice(at, 1)
            spark.destroy()
        })
    }

    const place = (img: Phaser.GameObjects.Image, lane: Lane, p: number) => {
        const s = scaleAt(p)
        const w = LANE_W * s * NOTE.width
        img.setPosition(laneX(lane, s), yAt(s)).setDisplaySize(w, w * NOTE.aspect).setDepth(DEPTH.note + Math.min(p, 2) * 0.1)
    }

    const highway: Highway = {
        load(chart, ms) {
            highway.clear()
            approach = ms
            notes = chart.map(n => ({ lane: n.lane, t: n.t, state: 'wait' as const }))
        },
        update(songMs) {
            let missed = 0
            notes.forEach(n => {
                if (n.state === 'hit') return
                const p = 1 - (n.t - songMs) / approach
                if (p < 0) return
                if (!n.img)
                    n.img = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.note)).setTint(LANE_TONES[n.lane]).setDepth(DEPTH.note)
                const img = n.img
                place(img, n.lane, p)
                if (n.state === 'wait') img.setAlpha(Math.min(1, p * 5))
                if (n.state === 'wait' && songMs - n.t > TIMING.hitWindow) {
                    n.state = 'miss'
                    img.setTint(C.silverDark).setAlpha(0.45)
                    missed += 1
                }
                if (p > NOTE.gone) {
                    img.destroy()
                    n.img = undefined
                    n.state = 'hit'
                }
            })
            return missed
        },
        hit(lane, songMs) {
            let best: Live | undefined
            notes.forEach(n => {
                if (n.lane !== lane || n.state !== 'wait') return
                const d = Math.abs(n.t - songMs)
                if (d <= TIMING.hitWindow && (!best || d < Math.abs(best.t - songMs))) best = n
            })
            flash(lane, !!best)
            if (!best) return null
            const grade: Grade = Math.abs(best.t - songMs) <= TIMING.perfect ? 'perfect' : 'good'
            best.state = 'hit'
            burst(best)
            return grade
        },
        due(songMs) {
            const lanes: Lane[] = []
            notes.forEach(n => {
                if (n.state !== 'wait' || n.t > songMs) return
                n.state = 'hit'
                flash(n.lane, true)
                burst(n)
                lanes.push(n.lane)
            })
            return lanes
        },
        drop() {
            notes.forEach(n => {
                const img = n.img
                n.img = undefined
                n.state = 'hit'
                if (!img) return
                img.setTint(C.silverDark)
                flyers.push(img)
                void FX.to(scene, img, { y: img.y + 160, alpha: 0, angle: Phaser.Math.Between(-40, 40) }, { duration: 560 }).then(() => {
                    const at = flyers.indexOf(img)
                    if (at >= 0) flyers.splice(at, 1)
                    img.destroy()
                })
            })
        },
        setInput(on) {
            inputOn = on
            paintInput()
        },
        setLaneIcons(on) {
            icons.forEach(icon => icon.setVisible(on))
        },
        onLane(cb) {
            handler = cb
        },
        clear() {
            notes.forEach(n => n.img?.destroy())
            notes = []
        },
        rect: () => ({ x: HIGHWAY.cx, y: (HIGHWAY.farY + HIGHWAY.bottom) / 2, w: bw, h: HIGHWAY.bottom - HIGHWAY.farY + 20 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            highway.clear()
            flyers.forEach(f => f.destroy())
            zones.forEach(z => z.destroy())
            beams.forEach(b => b.destroy())
            icons.forEach(icon => icon.destroy())
            board.destroy()
            ;[BOARD, ...LANE_TONES.map((_, i) => beamKey(i))].forEach(k => {
                if (scene.textures.exists(k)) scene.textures.remove(k)
            })
        },
    }
    return highway
}
