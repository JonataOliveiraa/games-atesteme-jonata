import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { AIR, AIR_BAR, ASK, BAG, DEPTH, DOCK, minimapBox, SURFACE, W, WORLD } from '../data/layout'
import { BUBBLE_FRAME, FINDS, SUBS } from '../data/files'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { FindDef, MapDef, Rect, Vec } from '../types'
import { miniRocks } from './rocks'
import { baked } from './bake'

export function pin<T>(scene: Phaser.Scene, make: () => T): T {
    const before = new Set(scene.children.list)
    const out = make()
    scene.children.list.forEach(o => {
        if (!before.has(o)) (o as unknown as Phaser.GameObjects.Components.ScrollFactor).setScrollFactor?.(0)
    })
    return out
}

export interface Ask {
    set(text: string, tone?: 'ok' | 'oops'): Promise<void>
    rect(): Rect
    destroy(): void
}

export function createAsk(scene: Phaser.Scene): Ask {
    let box: Phaser.GameObjects.Container | undefined
    let w: number = ASK.minW
    return {
        async set(text, tone = 'ok') {
            box?.destroy()
            const label = scene.add
                .text(0, 1, text, { fontFamily: FONT.black, fontSize: `${SIZE.ask}px`, color: tone === 'oops' ? CSS.red : CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            w = Math.max(ASK.minW, label.width + 50)
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.2)
            g.fillRoundedRect(-w / 2 + 3, -ASK.h / 2 + 5, w, ASK.h, ASK.h / 2)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-w / 2, -ASK.h / 2, w, ASK.h, ASK.h / 2)
            g.lineStyle(4, tone === 'oops' ? C.red : C.ink, 1)
            g.strokeRoundedRect(-w / 2, -ASK.h / 2, w, ASK.h, ASK.h / 2)
            box = scene.add.container(ASK.x, ASK.y, [g, label]).setDepth(DEPTH.ask).setScrollFactor(0).setScale(0.7).setAlpha(0)
            await FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(1.8) })
        },
        rect() {
            return { x: ASK.x, y: ASK.y, w: w + 20, h: ASK.h + 20 }
        },
        destroy() {
            box?.destroy()
        },
    }
}

export interface AirBar {
    set(value: number): void
    rect(): Rect
    destroy(): void
}

export function createAirBar(scene: Phaser.Scene): AirBar {
    const { x, y, w, h } = AIR_BAR
    const frameKey = baked(scene, 'mg-air-frame', w + 10, h + 10, g => {
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(0, 0, w + 6, h + 6, (h + 6) / 2)
        g.fillStyle(0x3a2f7a, 1)
        g.fillRoundedRect(3, 3, w, h, h / 2)
    })
    const frame = scene.add.image(x - w / 2 - 3, y - h / 2 - 3, frameKey).setOrigin(0).setDepth(DEPTH.ui).setScrollFactor(0)
    const fill = scene.add.rectangle(x - w / 2 + 2, y, w - 4, h - 6, C.aqua).setOrigin(0, 0.5).setDepth(DEPTH.ui + 1).setScrollFactor(0)
    const icon = scene.add
        .sprite(x - w / 2 - AIR_BAR.icon / 2 + 4, y, SUBS, BUBBLE_FRAME.full)
        .setDisplaySize(AIR_BAR.icon, AIR_BAR.icon)
        .setDepth(DEPTH.ui)
        .setScrollFactor(0)
    const label = scene.add
        .text(icon.x - AIR_BAR.icon / 2 - 6, y + 1, AIR_BAR.title, {
            fontFamily: FONT.black,
            fontSize: `${AIR_BAR.label}px`,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
        })
        .setOrigin(1, 0.5)
        .setResolution(2)
        .setDepth(DEPTH.ui)
        .setScrollFactor(0)
    const left = label.x - label.width - 8
    const right = x + w / 2 + 10
    let shown = -1
    const paint = (v: number) => {
        const k = Phaser.Math.Clamp(v / AIR.max, 0, 1)
        const px = Math.round(k * (w - 4))
        if (px === shown) return
        shown = px
        fill.setSize(Math.max(0, px), h - 6).setVisible(px > 0)
        fill.setFillStyle(v < AIR.low ? C.red : C.aqua)
    }
    paint(AIR.max)
    return {
        set: paint,
        rect() {
            return { x: (left + right) / 2, y, w: right - left, h: AIR_BAR.icon + 16 }
        },
        destroy() {
            frame.destroy()
            fill.destroy()
            icon.destroy()
            label.destroy()
        },
    }
}

export interface Minimap {
    update(sub: Vec, lit: Vec[], home: boolean): void
    setMap(map: MapDef): void
    setMarks(marks: { spots: Vec[]; pickups: Vec[] }): void
    rect(): Rect
    destroy(): void
}

export function createMinimap(scene: Phaser.Scene, fog: Phaser.Textures.Texture): Minimap {
    const { x, y, w, h } = minimapBox()
    const left = x - w / 2
    const top = y - h / 2
    const mx = (wx: number) => left + (wx / WORLD.w) * w
    const my = (wy: number) => top + (wy / WORLD.h) * h
    const seaTop = (SURFACE / WORLD.h) * h
    const frameKey = baked(scene, `mg-minimap-frame-${w}x${h}`, w + 16, h + 16, g => {
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(2, 6, w + 12, h + 10, 16)
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(0, 0, w + 12, h + 12, 16)
        g.fillStyle(C.seaMid, 1)
        g.fillRect(6, 6, w, h)
        g.fillStyle(C.sky, 1)
        g.fillRect(6, 6, w, seaTop)
        g.fillStyle(C.pink, 1)
        g.fillRect(6, 6 + seaTop - 4, (DOCK.right / WORLD.w) * w, 4)
    })
    const frame = scene.add.image(left - 6, top - 6, frameKey).setOrigin(0).setDepth(DEPTH.ui).setScrollFactor(0)
    const marks = scene.add.graphics().setDepth(DEPTH.ui + 0.6).setScrollFactor(0)
    const shade = scene.add
        .image(left, top + seaTop, fog)
        .setOrigin(0)
        .setDisplaySize(w, h - seaTop)
        .setDepth(DEPTH.ui + 1)
        .setScrollFactor(0)
    const air = scene.add.graphics().setDepth(DEPTH.ui + 1.5).setScrollFactor(0)
    const dots = scene.add.graphics().setDepth(DEPTH.ui + 2).setScrollFactor(0)
    let rocks: Phaser.GameObjects.Image | undefined
    let drawn = ''
    return {
        setMap(map) {
            rocks?.destroy()
            rocks = scene.add.image(left, top, miniRocks(scene, map)).setOrigin(0).setDepth(DEPTH.ui + 0.5).setScrollFactor(0)
        },
        setMarks(next) {
            marks.clear()
            air.clear()
            next.pickups.forEach(p => {
                air.fillStyle(C.ink, 1)
                air.fillCircle(mx(p.x), my(p.y), 4)
                air.fillStyle(C.aqua, 1)
                air.fillCircle(mx(p.x), my(p.y), 2.8)
            })
            next.spots.forEach(p => {
                marks.fillStyle(C.ink, 1)
                marks.fillCircle(mx(p.x), my(p.y), 4)
                marks.fillStyle(C.cream, 1)
                marks.fillCircle(mx(p.x), my(p.y), 2.6)
            })
        },
        update(sub, lit, home) {
            const sx = Math.round(mx(sub.x))
            const sy = Math.round(my(sub.y))
            const key = `${sx},${sy}|${home}|${lit.map(p => `${p.x},${p.y}`).join(';')}`
            if (key === drawn) return
            drawn = key
            dots.clear()
            if (home) {
                const dx = mx(DOCK.x)
                const dy = my(DOCK.y)
                dots.lineStyle(4, C.ink, 1)
                dots.strokeCircle(dx, dy, 9)
                dots.lineStyle(3, C.pink, 1)
                dots.strokeCircle(dx, dy, 9)
            }
            lit.forEach(p => {
                dots.lineStyle(3, C.ink, 1)
                dots.strokeCircle(mx(p.x), my(p.y), 7)
                dots.lineStyle(2, C.glow, 1)
                dots.strokeCircle(mx(p.x), my(p.y), 7)
                dots.fillStyle(C.glow, 1)
                dots.fillCircle(mx(p.x), my(p.y), 3)
            })
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(sx, sy, 6.5)
            dots.fillStyle(C.lemon, 1)
            dots.fillCircle(sx, sy, 4.5)
        },
        rect() {
            return { x, y, w: w + 24, h: h + 24 }
        },
        destroy() {
            frame.destroy()
            rocks?.destroy()
            marks.destroy()
            shade.destroy()
            air.destroy()
            dots.destroy()
        },
    }
}

export function screenCurtain(scene: Phaser.Scene, onMid: () => void): Promise<void> {
    const r = scene.add.rectangle(W / 2, 360, W, 720, C.white, 0).setDepth(DEPTH.curtain).setScrollFactor(0).setInteractive()
    return FX.to(scene, r, { alpha: 1 }, { duration: 300 })
        .then(() => onMid())
        .then(() => FX.to(scene, r, { alpha: 0 }, { duration: 340 }))
        .then(() => r.destroy())
}

export function banner(scene: Phaser.Scene, title: string, line: string): Promise<void> {
    const w = 640
    const h = 190
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.3)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 32)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 32)
    g.lineStyle(6, C.red, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 32)
    const head = scene.add
        .text(0, -32, title, { fontFamily: FONT.black, fontSize: '44px', color: CSS.red })
        .setOrigin(0.5)
        .setResolution(2)
    const body = scene.add
        .text(0, 36, line, { fontFamily: FONT.black, fontSize: '28px', color: CSS.ink, align: 'center', wordWrap: { width: w - 60 } })
        .setOrigin(0.5)
        .setResolution(2)
    const veil = scene.add.rectangle(W / 2, 360, W, 720, C.shadow, 0.45).setScrollFactor(0).setDepth(DEPTH.balloon - 1).setAlpha(0)
    const box = scene.add.container(W / 2, 330, [g, head, body]).setScrollFactor(0).setDepth(DEPTH.balloon).setScale(0.6).setAlpha(0)
    void FX.to(scene, veil, { alpha: 1 }, { duration: 200 })
    return FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 300, ease: Ease.back(1.6) })
}

export interface Bag {
    load(slots: number): void
    fill(finds: FindDef[]): void
    rect(): Rect
    destroy(): void
}

export function createBag(scene: Phaser.Scene): Bag {
    const R = BAG.size / 2
    const slotKey = baked(scene, 'mg-bag-slot', BAG.size + 8, BAG.size + 10, g => {
        g.fillStyle(C.shadow, 0.3)
        g.fillCircle(R + 4, R + 7, R)
        g.fillStyle(C.white, 0.9)
        g.fillCircle(R + 2, R + 2, R)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(R + 2, R + 2, R)
    })
    let slots: Phaser.GameObjects.Container[] = []
    let count = 0
    const clear = () => {
        slots.forEach(s => s.destroy())
        slots = []
    }
    return {
        load(n) {
            clear()
            count = n
            slots = Array.from({ length: n }, (_, i) =>
                scene.add
                    .container(BAG.x + i * (BAG.size + BAG.gap), BAG.y, [scene.add.image(2, 3, slotKey)])
                    .setDepth(DEPTH.ui)
                    .setScrollFactor(0),
            )
        },
        fill(finds) {
            slots.forEach((slot, i) => {
                const has = slot.length > 1
                const find = finds[i]
                if (!find || has) return
                const art = scene.add.image(0, 0, FINDS, find.frame).setScale(BAG.art)
                slot.add(art)
                void FX.popIn(scene, art)
            })
        },
        rect() {
            const w = count * BAG.size + (count - 1) * BAG.gap
            return { x: BAG.x - BAG.size / 2 + w / 2, y: BAG.y, w: w + 24, h: BAG.size + 24 }
        },
        destroy() {
            clear()
        },
    }
}
