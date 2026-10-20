import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BENCH, DEPTH, H, SIGN, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL, chipText } from '../data/words'
import type { Rack, Rect, Term, Vec } from '../types'
import { paintImage } from './art'
import { termIcon } from './icons'

export interface BenchHandlers {
    onCard(index: number): void
    onNot(): void
    onPlay(): void
}

export interface Bench {
    build(rack: Rack): void
    paint(card: number | null, not: boolean): void
    enable(handlers: BenchHandlers): void
    disable(): void
    cardPos(index: number): Vec
    notPos(): Vec
    playPos(): Vec
    press(target: 'card' | 'not' | 'play', index?: number): void
    rect(): Rect
    notRect(): Rect | null
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
    let notBtn: Button | undefined
    let playBtn: Button | undefined
    let handlers: BenchHandlers | undefined
    let active = false
    let shown = true
    let state = { card: null as number | null, not: false }

    const makeButton = (x: number, w: number, h: number, content: (face: Phaser.GameObjects.Container) => void, tone: { on: number; onRim: number; off: number; offRim: number; line?: number }, sink = true): Button => {
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

    const stopPulse = (b: Button) => {
        b.pulse?.stop()
        b.pulse = undefined
        b.ring.setVisible(false).setAlpha(1)
    }

    const startPulse = (b: Button) => {
        if (b.pulse) return
        b.ring.setVisible(true).setAlpha(0.35)
        b.pulse = scene.tweens.add({ targets: b.ring, alpha: 1, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }

    const setPressed = (b: Button, pressed: boolean) => {
        b.on.setVisible(pressed)
        b.off.setVisible(!pressed)
        b.face.list.forEach(o => {
            if (o === b.on || o === b.off) return
            ;(o as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject).y = (o.getData('y') as number) + (pressed ? DROP - 2 : 0)
        })
    }

    const refresh = () => {
        cards.forEach((b, i) => setPressed(b, state.card === i))
        if (notBtn) setPressed(notBtn, state.not)
        const ready = state.card !== null
        if (playBtn) {
            playBtn.off.setVisible(!ready)
            playBtn.on.setVisible(ready)
            playBtn.face.list.forEach(o => {
                if (o instanceof Phaser.GameObjects.Text) o.setColor(ready ? inkOn(C.play) : CSS.white).setAlpha(ready ? 1 : 0.75)
            })
        }
        buttons.forEach(b => {
            const can = active && shown && (b !== playBtn || ready)
            if (b.zone.input) b.zone.input.enabled = can
            if (can) startPulse(b)
            else stopPulse(b)
        })
    }

    const tag = (o: Phaser.GameObjects.GameObject & { y: number }) => o.setData('y', o.y)

    const clear = () => {
        buttons.forEach(b => {
            stopPulse(b)
            b.zone.destroy()
            b.root.destroy()
        })
        buttons = []
        cards = []
        notBtn = undefined
        playBtn = undefined
    }

    const center = (b: Button): Vec => ({ x: b.x, y: b.y })

    const bench: Bench = {
        build(rack) {
            clear()
            state = { card: null, not: false }
            const xs = rack.cards.length > 1 ? BENCH.cardXs2 : BENCH.cardXs1
            rack.cards.forEach((term: Term, i) => {
                const b = makeButton(
                    xs[i],
                    BENCH.cardW,
                    BENCH.cardH,
                    face => {
                        const text = scene.add
                            .text(0, 0, chipText(term), { fontFamily: FONT.black, fontSize: `${SIZE.card}px`, color: CSS.ink })
                            .setOrigin(0, 0.5)
                            .setResolution(2)
                        const inner = BENCH.icon + 12 + text.width
                        const ic = paintImage(scene, BENCH.icon, BENCH.icon, g => termIcon(g, term, BENCH.icon))
                        ic.setPosition(-inner / 2 + BENCH.icon / 2, 0)
                        text.setX(-inner / 2 + BENCH.icon + 12)
                        if (inner > BENCH.cardW - 30) {
                            const s = (BENCH.cardW - 30) / inner
                            text.setScale(s).setX(-inner * s / 2 + BENCH.icon * s + 12 * s)
                            ic.setScale(s).setX(-inner * s / 2 + (BENCH.icon * s) / 2)
                        }
                        face.add([tag(ic), tag(text)])
                    },
                    { on: C.cardOn, onRim: C.creamDark, off: C.card, offRim: C.cardRim, line: C.chipRim },
                )
                b.zone.on('pointerdown', () => {
                    if (!active) return
                    handlers?.onCard(i)
                })
                cards.push(b)
            })
            if (rack.not) {
                notBtn = makeButton(
                    BENCH.notX,
                    BENCH.notW,
                    BENCH.cardH,
                    face => {
                        const label = scene.add
                            .text(0, 0, LABEL.not, { fontFamily: FONT.black, fontSize: `${SIGN.text + 4}px`, color: CSS.white })
                            .setOrigin(0.5)
                            .setResolution(2)
                        face.add(tag(label))
                    },
                    { on: C.notDark, onRim: 0x4f2aa8, off: C.not, offRim: C.notDark },
                )
                notBtn.zone.on('pointerdown', () => {
                    if (!active) return
                    handlers?.onNot()
                })
            }
            playBtn = makeButton(
                BENCH.playX,
                BENCH.playW,
                BENCH.playH,
                face => {
                    const label = scene.add
                        .text(-14, 0, LABEL.play, { fontFamily: FONT.black, fontSize: `${SIZE.play}px`, color: CSS.white })
                        .setOrigin(0.5)
                        .setResolution(2)
                    const arrow = paintImage(scene, 30, 34, g => {
                        g.fillStyle(C.white, 1)
                        g.fillTriangle(2, 2, 2, 32, 28, 17)
                    })
                    arrow.setPosition(label.x + label.width / 2 + 24, 0)
                    face.add([tag(label), tag(arrow)])
                },
                { on: C.play, onRim: C.playDark, off: C.off, offRim: C.offDark },
                false,
            )
            playBtn.zone.on('pointerdown', () => {
                if (!active || state.card === null) return
                handlers?.onPlay()
            })
            refresh()
        },
        paint(card, not) {
            state = { card, not }
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
        cardPos: i => center(cards[i] ?? cards[0]),
        notPos: () => (notBtn ? center(notBtn) : { x: BENCH.notX, y: BENCH.y }),
        playPos: () => (playBtn ? center(playBtn) : { x: BENCH.playX, y: BENCH.y }),
        press(target, index = 0) {
            const b = target === 'card' ? cards[index] : target === 'not' ? notBtn : playBtn
            if (!b) return
            void FX.press(scene, b.root)
        },
        rect() {
            const left = Math.min(...buttons.map(b => b.x - b.w / 2))
            const right = Math.max(...buttons.map(b => b.x + b.w / 2))
            return { x: (left + right) / 2, y: BENCH.y + 3, w: right - left + 40, h: BENCH.playH + 34 }
        },
        notRect() {
            if (!notBtn) return null
            return { x: notBtn.x, y: notBtn.y + 3, w: notBtn.w + 30, h: notBtn.h + 30 }
        },
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
