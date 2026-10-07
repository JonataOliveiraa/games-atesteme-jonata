import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG, PIECE } from '../data/files'
import { DEPTH, FLIPPER, FUNNEL, H, INLANE, POPS, PROCESSOR, SIDE, TABLE, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { PROCESSOR_LABEL, SIDE_LABEL } from '../data/words'
import { pieceImage } from './art'

export type Side = 'left' | 'right'
export type Band = 'input' | 'process' | 'output'
type Rect = { x: number; y: number; w: number; h: number }

export interface Table {
    update(): void
    flip(side: Side): void
    /** a bolinha está em cima do flipper? `t` vai de 0 (pivô) a 1 (ponta) */
    onFlipper(side: Side, x: number, y: number): number | null
    flipping(side: Side): boolean
    pop(index: number): void
    light(band: Band, on: boolean): void
    rect(): Rect
    sideRect(side: 'input' | 'output'): Rect
    destroy(): void
}

const DEG = Math.PI / 180

function paintField(g: Phaser.GameObjects.Graphics) {
    const { left, right, top, bottom, cx, wall } = TABLE
    const outer = { x: left - wall - 8, y: top - wall - 8, w: right - left + (wall + 8) * 2, h: bottom - top + 200 }

    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(outer.x + 8, outer.y + 12, outer.w, outer.h, 44)
    g.fillStyle(C.rim, 1)
    g.fillRoundedRect(outer.x, outer.y, outer.w, outer.h, 44)
    g.fillStyle(C.rimLight, 1)
    g.fillRoundedRect(outer.x + 6, outer.y + 6, outer.w - 12, 26, 20)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(outer.x, outer.y, outer.w, outer.h, 44)

    g.fillStyle(C.field, 1)
    g.fillRoundedRect(left, top, right - left, bottom - top + 60, 28)

    g.fillStyle(C.input, 0.16)
    g.fillRoundedRect(left, top, right - left, FUNNEL.y0 - top + 10, { tl: 28, tr: 28, bl: 0, br: 0 })
    g.fillStyle(C.process, 0.28)
    g.fillCircle(PROCESSOR.x, PROCESSOR.y, 112)
    g.fillStyle(C.process, 0.18)
    g.fillCircle(PROCESSOR.x, PROCESSOR.y, 150)
    g.fillStyle(C.output, 0.16)
    g.fillRect(right - 90, 290, 90, 270)

    const rng = new Phaser.Math.RandomDataGenerator(['mesa-circuito'])
    g.lineStyle(3, C.trace, 1)
    for (let k = 0; k < 26; k++) {
        let x = rng.between(left + 20, right - 20)
        let y = rng.between(top + 20, bottom - 40)
        const pts = [[x, y]]
        for (let s = 0; s < 3; s++) {
            const len = rng.between(24, 70)
            const dir = rng.pick([0, 1, 2, 3])
            if (dir === 0) x += len
            else if (dir === 1) x -= len
            else if (dir === 2) y += len
            else {
                x += len * 0.7
                y += len * 0.7
            }
            x = Phaser.Math.Clamp(x, left + 14, right - 14)
            y = Phaser.Math.Clamp(y, top + 14, bottom - 30)
            pts.push([x, y])
        }
        g.beginPath()
        g.moveTo(pts[0][0], pts[0][1])
        pts.slice(1).forEach(([px, py]) => g.lineTo(px, py))
        g.strokePath()
        g.fillStyle(C.pad, 1)
        g.fillCircle(pts[0][0], pts[0][1], 4)
        g.fillCircle(pts[pts.length - 1][0], pts[pts.length - 1][1], 4)
    }

    g.fillStyle(C.fieldDeep, 1)
    g.fillRoundedRect(FLIPPER.leftX + 30, FLIPPER.y + 18, FLIPPER.rightX - FLIPPER.leftX - 60, 120, 16)

    g.fillStyle(C.chrome, 0.9)
    ;[
        [outer.x + 22, outer.y + 22],
        [outer.x + outer.w - 22, outer.y + 22],
    ].forEach(([bx, by]) => {
        g.fillCircle(bx, by, 7)
        g.lineStyle(2, C.ink, 0.6)
        g.strokeCircle(bx, by, 7)
    })

    g.lineStyle(6, C.chrome, 1)
    g.strokeRoundedRect(left - 3, top - 3, right - left + 6, bottom - top + 70, 30)
    g.lineStyle(3, C.ink, 1)
    g.strokeRoundedRect(left - 6, top - 6, right - left + 12, bottom - top + 80, 32)

    ;[-1, 1].forEach(sign => {
        const wallX = sign < 0 ? left + 4 : right - 4
        const pivotX = sign < 0 ? FLIPPER.leftX - 8 : FLIPPER.rightX + 8
        g.fillStyle(C.sling, 1)
        g.fillTriangle(wallX, INLANE.y0 + 8, pivotX, FLIPPER.y + 2, wallX, H + 40)
        g.fillStyle(C.rim, 1)
        g.fillTriangle(wallX, INLANE.y0 + 60, pivotX - sign * 30, FLIPPER.y + 40, wallX, H + 40)
    })
    void cx
}

function paintGuide(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, thick: number) {
    g.lineStyle(thick + 8, C.ink, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.lineStyle(thick, C.rubber, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.lineStyle(thick / 3, C.mint, 1)
    g.lineBetween(x1, y1, x2, y2)
    ;[
        [x1, y1],
        [x2, y2],
    ].forEach(([x, y]) => {
        g.fillStyle(C.ink, 1)
        g.fillCircle(x, y, (thick + 8) / 2)
        g.fillStyle(C.rubber, 1)
        g.fillCircle(x, y, thick / 2)
        g.fillStyle(C.mint, 1)
        g.fillCircle(x, y, thick / 5)
    })
}

function header(scene: Phaser.Scene, x: number, text: string, tone: number) {
    const g = scene.add.graphics()
    const w = SIDE.headerW
    const h = SIDE.headerH
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
    g.fillStyle(tone, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(C.ink, 1)
    g.fillTriangle(w / 2 + 12, -12, w / 2 + 12, 12, w / 2 + 30, 0)
    const label = scene.add
        .text(0, 1, text, { fontFamily: FONT.black, fontSize: `${SIZE.panel}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    return scene.add.container(x, SIDE.headerY, [g, label]).setDepth(DEPTH.device)
}

export function createTable(scene: Phaser.Scene): Table {
    const bg = scene.add.image(W / 2, H / 2, BG).setDepth(DEPTH.bg)
    bg.setScale(Math.max(W / bg.width, H / bg.height))

    const { left, right, top, bottom, cx, wall } = TABLE
    const g = scene.add.graphics()
    paintField(g)

    const bodies: MatterJS.BodyType[] = []
    const segment = (x1: number, y1: number, x2: number, y2: number, thick = 16) => {
        const len = Math.hypot(x2 - x1, y2 - y1)
        bodies.push(
            scene.matter.add.rectangle((x1 + x2) / 2, (y1 + y2) / 2, len, thick, {
                isStatic: true,
                angle: Math.atan2(y2 - y1, x2 - x1),
                restitution: 0.35,
                friction: 0,
                label: 'wall',
            }),
        )
        paintGuide(g, x1, y1, x2, y2, thick)
    }
    const edge = (x: number, y: number, w: number, h: number) =>
        bodies.push(scene.matter.add.rectangle(x, y, w, h, { isStatic: true, restitution: 0.35, friction: 0, label: 'wall' }))
    edge(left - wall / 2, (top + bottom) / 2, wall, bottom - top + 200)
    edge(right + wall / 2, (top + bottom) / 2, wall, bottom - top + 200)
    edge(cx, top - wall / 2, right - left + wall * 2, wall)

    segment(left + 4, FUNNEL.y0, cx - FUNNEL.inner, FUNNEL.y1)
    segment(right - 4, FUNNEL.y0, cx + FUNNEL.inner, FUNNEL.y1)
    segment(left + 4, INLANE.y0, FLIPPER.leftX - 8, FLIPPER.y - 6)
    segment(right - 4, INLANE.y0, FLIPPER.rightX + 8, FLIPPER.y - 6)

    const baked = scene.add.renderTexture(0, 0, W, H).setOrigin(0).setDepth(DEPTH.table)
    baked.draw(g)
    g.destroy()

    const engraved = scene.add
        .text(PROCESSOR.x, PROCESSOR.labelY, PROCESSOR_LABEL, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.processing - 2}px`,
            color: '#cbb8ff',
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0.75)
        .setDepth(DEPTH.lights)

    const pops = POPS.map(p => {
        bodies.push(scene.matter.add.circle(p.x, p.y, p.r, { isStatic: true, restitution: 0.4, label: `pop` }))
        return pieceImage(scene, PIECE.bumper, p.r * 2.6).setPosition(p.x, p.y).setDepth(DEPTH.walls + 1)
    })
    bodies.push(scene.matter.add.circle(PROCESSOR.x, PROCESSOR.y, PROCESSOR.r, { isStatic: true, restitution: 0.4, label: 'chip' }))

    const flippers = (['left', 'right'] as Side[]).map(side => {
        const sign = side === 'left' ? 1 : -1
        const pivot = { x: side === 'left' ? FLIPPER.leftX : FLIPPER.rightX, y: FLIPPER.y }
        const body = scene.matter.add.rectangle(pivot.x, pivot.y, FLIPPER.length, FLIPPER.thick, {
            isStatic: true,
            restitution: 0.2,
            friction: 0,
            label: `flipper-${side}`,
            chamfer: { radius: FLIPPER.thick / 2 - 1 },
        })
        const art = pieceImage(scene, PIECE.flipper, FLIPPER.length * 1.12).setDepth(DEPTH.flipper)
        art.setOrigin(0.12, 0.5)
        if (side === 'right') art.setFlipX(true).setOrigin(0.88, 0.5)
        const state = { angle: FLIPPER.rest, busy: false }
        const place = () => {
            const a = state.angle * DEG
            const dir = { x: Math.cos(a) * sign, y: Math.sin(a) }
            scene.matter.body.setPosition(body, { x: pivot.x + (dir.x * FLIPPER.length) / 2, y: pivot.y + (dir.y * FLIPPER.length) / 2 }, false)
            scene.matter.body.setAngle(body, side === 'left' ? a : -a, false)
            art.setPosition(pivot.x, pivot.y).setAngle(side === 'left' ? state.angle : -state.angle)
        }
        place()
        return { side, sign, pivot, body, art, state, place }
    })
    bodies.push(...flippers.map(f => f.body))

    const lights = scene.add.graphics().setDepth(DEPTH.lights)
    const lit: Record<Band, boolean> = { input: false, process: false, output: false }
    const paintLights = () => {
        lights.clear()
        const chevron = (x: number, y: number, dx: number, dy: number, on: boolean, tone: number) => {
            const a = Math.atan2(dy, dx)
            const p = (r: number, t: number) => [x + Math.cos(a + t) * r, y + Math.sin(a + t) * r]
            const [ax, ay] = p(14, 0)
            const [bx, by] = p(14, 2.4)
            const [qx, qy] = p(14, -2.4)
            lights.fillStyle(on ? C.glow : tone, on ? 1 : 0.35)
            lights.fillTriangle(ax, ay, bx, by, qx, qy)
        }
        ;[0, 1, 2].forEach(k => chevron(cx, FUNNEL.y1 - 70 + k * 24, 0, 1, lit.input, C.input))
        lights.lineStyle(6, lit.process ? C.glow : C.process, lit.process ? 1 : 0.5)
        lights.strokeCircle(PROCESSOR.x, PROCESSOR.y, PROCESSOR.r + 16)
        ;[0, 1, 2].forEach(k => chevron(cx, PROCESSOR.y + 92 + k * 22, 0, 1, lit.output, C.output))
    }
    paintLights()

    const headers = {
        input: header(scene, SIDE.inputX, SIDE_LABEL.input, C.input),
        output: header(scene, SIDE.outputX, SIDE_LABEL.output, C.output),
    }

    return {
        update() {
            flippers.forEach(f => f.place())
        },
        flip(side) {
            const f = flippers.find(x => x.side === side)
            if (!f) return
            scene.tweens.killTweensOf(f.state)
            f.state.busy = true
            scene.tweens.add({
                targets: f.state,
                angle: FLIPPER.up,
                duration: 70,
                onComplete: () => {
                    scene.tweens.add({
                        targets: f.state,
                        angle: FLIPPER.rest,
                        duration: 200,
                        delay: 110,
                        onComplete: () => (f.state.busy = false),
                    })
                },
            })
        },
        onFlipper(side, x, y) {
            const f = flippers.find(v => v.side === side)
            if (!f) return null
            const a = FLIPPER.rest * DEG
            const dir = { x: Math.cos(a) * f.sign, y: Math.sin(a) }
            const up = { x: Math.sin(a) * f.sign, y: -Math.cos(a) }
            const rel = { x: x - f.pivot.x, y: y - f.pivot.y }
            const t = (rel.x * dir.x + rel.y * dir.y) / FLIPPER.length
            const d = rel.x * up.x + rel.y * up.y
            return t > -0.2 && t < 1.2 && d > -16 && d < 52 ? Phaser.Math.Clamp(t, 0, 1) : null
        },
        flipping(side) {
            return flippers.find(f => f.side === side)?.state.busy ?? false
        },
        pop(index) {
            const img = pops[index]
            if (!img || img.getData('hot')) return
            img.setData('hot', true).setTint(C.glow)
            void FX.impact(scene, img, 0.22).then(() => {
                img.clearTint()
                img.setData('hot', false)
            })
        },
        light(band, on) {
            if (lit[band] === on) return
            lit[band] = on
            paintLights()
            if (on && band !== 'process') void FX.impact(scene, headers[band], 0.12)
        },
        rect() {
            return { x: cx, y: (top + H) / 2 - 4, w: right - left + wall * 2 + 24, h: H - top + wall + 24 }
        },
        sideRect(side) {
            const x = side === 'input' ? (SIDE.inputX - SIDE.cardW / 2 + left) / 2 : (SIDE.outputX + SIDE.cardW / 2 + right) / 2
            return { x, y: 414, w: Math.abs(left - SIDE.inputX) + SIDE.cardW / 2 + 30, h: 520 }
        },
        destroy() {
            bodies.forEach(b => scene.matter.world?.remove(b))
            flippers.forEach(f => f.art.destroy())
            pops.forEach(p => p.destroy())
            Object.values(headers).forEach(h => h.destroy())
            lights.destroy()
            engraved.destroy()
            baked.destroy()
            bg.destroy()
        },
    }
}
