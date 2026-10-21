import Phaser from 'phaser'
import { BG_KEY, PROPS_SHEET, PROP, cellKey, sheetScale } from '../data/files'
import { BUSH_AT, DECOR, H, MAP, MOUND, PHERO, PLATE, W, WALL, WD, WIND } from '../data/layout'
import { C } from '../data/theme'
import type { Rect, Vec } from '../types'
import { baked } from './art'
import type { View } from './view'

/**
 * O jardim: o chão, o muro de pedras com a fresta, o vento, o formigueiro e
 * o prato. Também responde as perguntas de lugar: bate no muro? está na
 * fresta? está no vento?
 */
export interface Garden {
    /** O círculo (x, y, r) bate em alguma coisa? Com `gate`, a fresta também fecha. */
    blocked(x: number, y: number, r: number, gate: boolean): boolean
    /** O círculo está encostando na fresta fechada (só faz sentido com `gate`). */
    atGate(x: number, y: number, r: number): boolean
    inWind(x: number): boolean
    setWind(on: boolean): void
    windOn(): boolean
    trail(x: number, y: number): void
    gapRect(): Rect
    windRect(): Rect
    gapCenter(): Vec
    destroy(): void
}

const STREAK = 'of-streak'

type Box = { x0: number; x1: number; y0: number; y1: number }

const WALL_TOP: Box = { x0: WALL.x - WALL.half, x1: WALL.x + WALL.half, y0: -200, y1: WALL.gapTop }
const WALL_BOTTOM: Box = { x0: WALL.x - WALL.half, x1: WALL.x + WALL.half, y0: WALL.gapBottom, y1: H + 200 }
const GATE: Box = { x0: WALL.x - WALL.half, x1: WALL.x + WALL.half, y0: WALL.gapTop, y1: WALL.gapBottom }

function hits(b: Box, x: number, y: number, r: number) {
    const cx = Phaser.Math.Clamp(x, b.x0, b.x1)
    const cy = Phaser.Math.Clamp(y, b.y0, b.y1)
    return (x - cx) ** 2 + (y - cy) ** 2 < r * r
}

export function createGarden(scene: Phaser.Scene, view: View): Garden {
    baked(scene, STREAK, 74, 22, g => {
        const pts = Array.from({ length: 12 }, (_, i) => ({ x: 6 + i * 5.6, y: 11 + Math.sin(i * 0.9) * 5 }))
        g.lineStyle(8, C.sky, 1)
        g.strokePoints(pts, false)
        g.lineStyle(4, C.wind, 1)
        g.strokePoints(pts, false)
    })

    const objects: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T) => {
        objects.push(o)
        return o
    }

    const bg = keep(scene.add.image(0, 0, BG_KEY).setOrigin(0, 0).setDisplaySize(W, H))
    view.add(bg, WD.bg)

    const k = sheetScale(scene, PROPS_SHEET)
    const prop = (cell: number, x: number, y: number, w: number, depth: number, originY = (PROPS_SHEET.cellH - 10) / PROPS_SHEET.cellH) => {
        const img = keep(scene.add.image(x, y, PROPS_SHEET.key, cellKey(cell)).setOrigin(0.5, originY))
        img.setScale((w / PROPS_SHEET.cellW) * k)
        view.add(img, depth)
        return img
    }

    DECOR.tufts.forEach((t, i) => prop(PROP.tuft, t.x, t.y, 70 + (i % 3) * 10, WD.decor))
    prop(PROP.mound, MOUND.x, MOUND.y, MOUND.w, WD.decor + 1)
    prop(PROP.plate, PLATE.x, PLATE.y, PLATE.r * 2.16, WD.plate, 0.5)
    // o arbusto fica no chão: os pedaços que se espalham para cima não podem sumir atrás dele
    prop(PROP.bush, BUSH_AT.x, BUSH_AT.y, 190, WD.decor + 3)
    WALL.stones.forEach(s => prop(s.cell, s.x, s.y, s.w, WD.actor + s.y))

    // o vento: listras brancas descendo pela faixa, e dois dentes-de-leão marcando onde ele sopra
    const puffs = WIND.puffs.map(p => prop(PROP.puff, p.x, p.y, 74, WD.actor + p.y))
    const streaks: Phaser.GameObjects.Image[] = []
    const streakTweens: Phaser.Tweens.Tween[] = []
    for (let i = 0; i < 16; i++) {
        const x = WIND.left + 14 + ((i * 37) % (WIND.right - WIND.left - 28))
        const img = keep(scene.add.image(x, 0, STREAK).setAngle(90).setAlpha(0))
        view.add(img, WD.wind)
        streaks.push(img)
    }
    const band = keep(scene.add.rectangle((WIND.left + WIND.right) / 2, (MAP.top + H) / 2, WIND.right - WIND.left, H - MAP.top + 40, C.sky, 0.22))
    view.add(band, WD.decor + 2)

    let wind = false
    const setWind = (on: boolean) => {
        wind = on
        streakTweens.forEach(t => t.stop())
        streakTweens.length = 0
        band.setVisible(on)
        puffs.forEach(p => p.setVisible(on))
        streaks.forEach((s, i) => {
            scene.tweens.killTweensOf(s)
            s.setAlpha(0).setVisible(on)
            if (!on) return
            const from = MAP.top - 40
            const to = H + 40
            s.setY(from)
            streakTweens.push(
                scene.tweens.add({
                    targets: s,
                    y: to,
                    duration: 1300 + (i % 4) * 240,
                    delay: i * 170,
                    repeat: -1,
                    onRepeat: () => s.setX(WIND.left + 14 + Math.random() * (WIND.right - WIND.left - 28)),
                    // acende no meio do caminho e apaga nas pontas (o progresso do tween não serve: ele repete para sempre)
                    onUpdate: () => s.setAlpha(Math.sin(((s.y - from) / (to - from)) * Math.PI) * 0.95),
                }),
            )
        })
    }
    setWind(false)

    // os pontinhos de feromônio que a formiga deixa pelo caminho
    const dots: Phaser.GameObjects.Arc[] = []

    return {
        blocked(x, y, r, gate) {
            if (x - r < MAP.left || x + r > MAP.right || y - r < MAP.top || y + r > MAP.bottom) return true
            if (hits(WALL_TOP, x, y, r) || hits(WALL_BOTTOM, x, y, r)) return true
            return gate && hits(GATE, x, y, r)
        },
        atGate: (x, y, r) => hits(GATE, x, y, r + 3),
        inWind: x => wind && x > WIND.left && x < WIND.right,
        setWind,
        windOn: () => wind,
        trail(x, y) {
            const dot = scene.add.circle(x, y, PHERO.r, C.phero, 0.55)
            view.add(dot, WD.trail)
            dots.push(dot)
            scene.tweens.add({
                targets: dot,
                alpha: 0,
                duration: PHERO.life,
                ease: 'Quad.easeIn',
                onComplete: () => {
                    dots.splice(dots.indexOf(dot), 1)
                    dot.destroy()
                },
            })
        },
        gapRect: () => ({ x: WALL.x, y: (WALL.gapTop + WALL.gapBottom) / 2, w: WALL.half * 2 + 120, h: WALL.gapBottom - WALL.gapTop + 150 }),
        windRect: () => ({ x: (WIND.left + WIND.right) / 2, y: (MAP.top + H) / 2, w: WIND.right - WIND.left + 30, h: H - MAP.top }),
        gapCenter: () => ({ x: WALL.x, y: (WALL.gapTop + WALL.gapBottom) / 2 }),
        destroy() {
            streakTweens.forEach(t => t.stop())
            dots.forEach(d => d.destroy())
            objects.forEach(o => o.destroy())
        },
    }
}
