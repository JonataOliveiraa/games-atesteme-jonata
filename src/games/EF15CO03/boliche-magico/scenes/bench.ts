import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BENCH, DEPTH, H, SIGN, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL, chipText } from '../data/words'
import type { Op, Rack, Rect, Term, Vec } from '../types'
import { paintImage } from './art'
import { termIcon } from './icons'
import { OP_TONE, type Side } from './sign'

export interface BenchHandlers {
    onCard(index: number): void
    onNot(side: Side): void
    onOp(op: Op): void
    onPlay(): void
}

export interface BenchState {
    card: number | null
    not: Record<Side, boolean>
    op: Op | null
}

export type Target = { kind: 'card'; index: number } | { kind: 'not'; side: Side } | { kind: 'op'; op: Op } | { kind: 'play' }

export interface Bench {
    build(rack: Rack): void
    paint(state: BenchState): void
    enable(handlers: BenchHandlers): void
    disable(): void
    pos(target: Target): Vec
    press(target: Target): void
    rect(): Rect
    notRect(): Rect | null
    opRect(): Rect | null
    show(): Promise<void>
    hide(): Promise<void>
    destroy(): void
}

interface Button {
    root: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Container
    on: Phaser.GameObjects.Image
    off: Phaser.GameObjects.Image
    ring: Phaser.GameObjects.Image
    zone: Phaser.GameObjects.Zone
    x: number
    y: number
    w: number
    h: number
    pulse?: Phaser.Tweens.Tween
}

const DROP = 7

function plate(scene: Phaser.Scene, w: number, h: number, fill: number, rim: number, r: number, line?: number) {
    return paintImage(scene, w + 8, h + DROP + 8, g => {
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(4, DROP + 6, w, h, r)
        g.fillStyle(rim, 1)
        g.fillRoundedRect(4, DROP + 2, w, h, r)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(4, 2, w, h, r)
        if (line !== undefined) {
            g.lineStyle(4, line, 1)
            g.strokeRoundedRect(6, 4, w - 4, h - 4, r - 2)
        }
    }).setOrigin((w / 2 + 4) / (w + 8), (h / 2 + 2) / (h + DROP + 8))
}

function ringArt(scene: Phaser.Scene, w: number, h: number, r: number) {
    return paintImage(scene, w + 24, h + 24, g => {
        g.lineStyle(7, C.accentYellow, 1)
        g.strokeRoundedRect(5, 5, w + 14, h + 14, r + 7)
        g.lineStyle(2, C.headerLine, 0.8)
        g.strokeRoundedRect(1.5, 1.5, w + 21, h + 21, r + 10)
    })
}

const SIDES: Side[] = ['left', 'right']
const OPS: Op[] = ['e', 'ou']

export function createBench(scene: Phaser.Scene): Bench {
    const root = scene.add.container(0, 0).setDepth(DEPTH.bench)
    const band = paintImage(scene, W, H - BENCH.top + 10, g => {
        g.fillStyle(C.shadow, 0.18)
        g.fillRect(0, 0, W, 10)
        g.fillStyle(C.benchDark, 1)
        g.fillRect(0, 8, W, H - BENCH.top + 2)
        g.fillStyle(C.bench, 1)
        g.fillRect(0, 14, W, H - BENCH.top)
        g.fillStyle(C.benchTop, 1)
        g.fillRect(0, 8, W, 8)
    }).setOrigin(0, 0)
    band.setPosition(0, BENCH.top - 8)
    root.add(band)

    let buttons: Button[] = []
    let cards: Button[] = []
    let notBtns: Partial<Record<Side, Button>> = {}
    let opBtns: Partial<Record<Op, Button>> = {}
    let playBtn: Button | undefined
    let handlers: BenchHandlers | undefined
    let active = false
    let shown = true
    let kind: Rack['kind'] = 'one'
    let state: BenchState = { card: null, not: { left: false, right: false }, op: null }

    const tag = (o: Phaser.GameObjects.GameObject & { y: number }) => o.setData('y', o.y)

    const makeButton = (
        x: number,
        w: number,
        h: number,
        content: (face: Phaser.GameObjects.Container) => void,
        tone: { on: number; onRim: number; off: number; offRim: number; line?: number },
        sink = true,
    ): Button => {
        const y = BENCH.y
        const off = plate(scene, w, h, tone.off, tone.offRim, 22, tone.line)
        const on = plate(scene, w, h, tone.on, tone.onRim, 22, tone.line).setVisible(false)
        if (sink) on.setY(DROP - 2)
        const ring = ringArt(scene, w, h, 22).setVisible(false)
        const face = scene.add.container(0, 0, [off, on])
        content(face)
        const btnRoot = scene.add.container(x, y, [ring, face])
        root.add(btnRoot)
        const zone = scene.add
            .zone(x, y + DROP / 2, w + 16, h + DROP + 16)
            .setDepth(DEPTH.bench + 2)
            .setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        const b: Button = { root: btnRoot, face, on, off, ring, zone, x, y, w, h }
        zone.on('pointerover', () => {
            if (active && zone.input?.enabled) face.setY(-3)
        })
        zone.on('pointerout', () => face.setY(0))
        buttons.push(b)
        return b
    }

    const label = (text: string, size: number, color: string = CSS.white) =>
        scene.add.text(0, 0, text, { fontFamily: FONT.black, fontSize: `${size}px`, color }).setOrigin(0.5).setResolution(2)

    const fitRow = (face: Phaser.GameObjects.Container, parts: (Phaser.GameObjects.Image | Phaser.GameObjects.Text)[], room: number) => {
        const gap = 10
        const widths = parts.map(p => p.displayWidth)
        const total = widths.reduce((s, w) => s + w, 0) + gap * (parts.length - 1)
        const s = Math.min(1, room / total)
        let x = (-total * s) / 2
        parts.forEach((p, i) => {
            p.setScale(p.scale * s)
            p.setX(x + (widths[i] * s) / 2)
            x += (widths[i] + gap) * s
            face.add(tag(p))
        })
    }

    const stopPulse = (b: Button) => {
        b.pulse?.stop()
        b.pulse = undefined
        b.ring.setVisible(false).setAlpha(1)
    }

    const setPressed = (b: Button, pressed: boolean) => {
        b.on.setVisible(pressed)
        b.off.setVisible(!pressed)
        b.face.list.forEach(o => {
            if (o === b.on || o === b.off) return
            ;(o as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject).y = (o.getData('y') as number) + (pressed ? DROP - 2 : 0)
        })
    }

    const ready = () => (kind === 'one' ? state.card !== null : kind === 'join' ? state.op !== null : true)

    const refresh = () => {
        cards.forEach((b, i) => setPressed(b, state.card === i))
        SIDES.forEach(side => {
            const b = notBtns[side]
            if (b) setPressed(b, state.not[side])
        })
        OPS.forEach(op => {
            const b = opBtns[op]
            if (b) setPressed(b, state.op === op)
        })
        const go = ready()
        if (playBtn) {
            playBtn.off.setVisible(!go)
            playBtn.on.setVisible(go)
            playBtn.face.list.forEach(o => {
                if (o instanceof Phaser.GameObjects.Text) o.setColor(go ? inkOn(C.play) : CSS.white).setAlpha(go ? 1 : 0.75)
            })
        }
        buttons.forEach(b => {
            const can = active && shown && (b !== playBtn || go)
            if (b.zone.input) b.zone.input.enabled = can
            stopPulse(b)
        })
    }

    const clear = () => {
        buttons.forEach(b => {
            stopPulse(b)
            b.zone.destroy()
            b.root.destroy()
        })
        buttons = []
        cards = []
        notBtns = {}
        opBtns = {}
        playBtn = undefined
    }

    const center = (b: Button | undefined, fallback: Vec): Vec => (b ? { x: b.x, y: b.y } : fallback)

    const find = (t: Target) =>
        t.kind === 'card' ? cards[t.index] : t.kind === 'not' ? notBtns[t.side] : t.kind === 'op' ? opBtns[t.op] : playBtn

    const around = (list: Button[]): Rect | null => {
        if (!list.length) return null
        const left = Math.min(...list.map(b => b.x - b.w / 2))
        const right = Math.max(...list.map(b => b.x + b.w / 2))
        return { x: (left + right) / 2, y: BENCH.y + 3, w: right - left + 30, h: BENCH.cardH + 30 }
    }

    const notButton = (x: number, w: number, side: Side, term?: Term) => {
        const b = makeButton(
            x,
            w,
            BENCH.cardH,
            face => {
                const word = label(LABEL.not, SIGN.text + 4)
                if (!term) {
                    face.add(tag(word))
                    return
                }
                const ic = paintImage(scene, BENCH.icon, BENCH.icon, g => termIcon(g, term, BENCH.icon))
                const text = label(chipText(term), SIZE.card - 2)
                fitRow(face, [word, ic, text], w - 30)
            },
            { on: C.notDark, onRim: 0x4f2aa8, off: C.not, offRim: C.notDark },
        )
        b.zone.on('pointerdown', () => {
            if (active) handlers?.onNot(side)
        })
        notBtns[side] = b
    }

    const bench: Bench = {
        build(rack) {
            clear()
            kind = rack.kind
            state = { card: null, not: { left: false, right: false }, op: null }
            if (rack.kind === 'one') {
                const xs = rack.cards.length > 1 ? BENCH.cardXs2 : BENCH.cardXs1
                rack.cards.forEach((term: Term, i) => {
                    const b = makeButton(
                        xs[i],
                        BENCH.cardW,
                        BENCH.cardH,
                        face => {
                            const ic = paintImage(scene, BENCH.icon, BENCH.icon, g => termIcon(g, term, BENCH.icon))
                            const text = label(chipText(term), SIZE.card, CSS.ink)
                            fitRow(face, [ic, text], BENCH.cardW - 30)
                        },
                        { on: C.cardOn, onRim: C.creamDark, off: C.card, offRim: C.cardRim, line: C.chipRim },
                    )
                    b.zone.on('pointerdown', () => {
                        if (active) handlers?.onCard(i)
                    })
                    cards.push(b)
                })
                if (rack.not) notButton(BENCH.notX, BENCH.notW, 'left')
            } else if (rack.kind === 'join') {
                OPS.forEach((op, i) => {
                    const tone = OP_TONE[op]
                    const b = makeButton(
                        BENCH.opXs[i],
                        BENCH.opW,
                        BENCH.cardH,
                        face => face.add(tag(label(op === 'e' ? LABEL.e : LABEL.ou, SIZE.play + 10))),
                        { on: tone.dark, onRim: tone.dark, off: tone.fill, offRim: tone.dark },
                    )
                    b.zone.on('pointerdown', () => {
                        if (active) handlers?.onOp(op)
                    })
                    opBtns[op] = b
                })
            } else {
                notButton(BENCH.notXs[0], BENCH.notWide, 'left', rack.left)
                notButton(BENCH.notXs[1], BENCH.notWide, 'right', rack.right)
            }
            playBtn = makeButton(
                BENCH.playX,
                BENCH.playW,
                BENCH.playH,
                face => {
                    const text = label(LABEL.play, SIZE.play).setX(-14)
                    const arrow = paintImage(scene, 30, 34, g => {
                        g.fillStyle(C.white, 1)
                        g.fillTriangle(2, 2, 2, 32, 28, 17)
                    })
                    arrow.setPosition(text.x + text.width / 2 + 24, 0)
                    face.add([tag(text), tag(arrow)])
                },
                { on: C.play, onRim: C.playDark, off: C.off, offRim: C.offDark },
                false,
            )
            playBtn.zone.on('pointerdown', () => {
                if (active && ready()) handlers?.onPlay()
            })
            refresh()
        },
        paint(next) {
            state = { card: next.card, not: { ...next.not }, op: next.op }
            refresh()
        },
        enable(h) {
            handlers = h
            active = true
            refresh()
        },
        disable() {
            active = false
            buttons.forEach(b => b.face.setY(0))
            refresh()
        },
        pos(t) {
            const fallback = t.kind === 'not' ? { x: BENCH.notX, y: BENCH.y } : { x: BENCH.playX, y: BENCH.y }
            return center(find(t), fallback)
        },
        press(t) {
            const b = find(t)
            if (b) void FX.press(scene, b.root)
        },
        rect() {
            const left = Math.min(...buttons.map(b => b.x - b.w / 2))
            const right = Math.max(...buttons.map(b => b.x + b.w / 2))
            return { x: (left + right) / 2, y: BENCH.y + 3, w: right - left + 40, h: BENCH.playH + 34 }
        },
        notRect: () => around(SIDES.flatMap(side => (notBtns[side] ? [notBtns[side] as Button] : []))),
        opRect: () => around(OPS.flatMap(op => (opBtns[op] ? [opBtns[op] as Button] : []))),
        async show() {
            shown = true
            scene.tweens.killTweensOf(root)
            await FX.to(scene, root, { y: 0 }, { duration: 320, ease: 'Back.easeOut' })
            refresh()
        },
        async hide() {
            shown = false
            refresh()
            scene.tweens.killTweensOf(root)
            await FX.to(scene, root, { y: BENCH.hide }, { duration: 280, ease: 'Sine.easeIn' })
        },
        destroy() {
            clear()
            scene.tweens.killTweensOf(root)
            root.destroy()
        },
    }
    return bench
}
