import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_CELL, UI_SHEET } from '../data/files'
import { CONTROLS, DECIDE, DEPTH } from '../data/layout'
import { CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { Rect, Verdict } from '../types'
import { fit } from './art'

export interface Controls {
    dir(): number
    setWalk(on: boolean): void
    setLook(on: boolean): void
    setDecide(on: boolean): Promise<void>
    hold(side: -1 | 0 | 1): void
    press(which: 'look' | Verdict): Promise<void>
    visible(on: boolean): void
    arrowsRect(): Rect
    lookRect(): Rect
    decideRect(): Rect
    destroy(): void
}

export interface ControlOptions {
    onLook: () => void
    onDecide: (verdict: Verdict) => void
}

interface Pad {
    art: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    base: number
}

export function createControls(scene: Phaser.Scene, opts: ControlOptions): Controls {
    const pointers = new Map<number, -1 | 1>()
    let keyDir = 0
    let demo: -1 | 0 | 1 = 0
    let walkOn = false
    let lookOn = false
    let decideOn = false
    let shown = true

    const round = (cell: number, x: number, y: number, r: number, flip = false): Pad => {
        const img = fit(scene, UI_SHEET, cell, r * 2).setFlipX(flip)
        const art = scene.add.container(x, y, [img]).setDepth(DEPTH.controls)
        const zone = scene.add.zone(x, y, r * 2 + 20, r * 2 + 20).setDepth(DEPTH.controls + 1).setInteractive({ useHandCursor: true })
        return { art, zone, base: 1 }
    }

    const left = round(UI_CELL.arrow, CONTROLS.leftX, CONTROLS.y, CONTROLS.r, true)
    const right = round(UI_CELL.arrow, CONTROLS.rightX, CONTROLS.y, CONTROLS.r)
    const look = round(UI_CELL.look, CONTROLS.lookX, CONTROLS.lookY, CONTROLS.lookR)

    const wide = (verdict: Verdict, x: number): Pad => {
        const img = fit(scene, UI_SHEET, UI_CELL.wide, DECIDE.w)
        const icon = fit(scene, UI_SHEET, verdict === 'trust' ? UI_CELL.thumb : UI_CELL.palm, DECIDE.icon).setPosition(-DECIDE.w / 2 + 52, DECIDE.faceY)
        const label = scene.add
            .text(24, DECIDE.faceY, verdict === 'trust' ? LABEL.trust : LABEL.distrust, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.decide}px`,
                color: CSS.ink,
            })
            .setOrigin(0.5)
            .setResolution(2)
        if (label.width > DECIDE.w - 120) label.setScale((DECIDE.w - 120) / label.width)
        const art = scene.add.container(x, DECIDE.y, [img, icon, label]).setDepth(DEPTH.controls).setVisible(false)
        const zone = scene.add.zone(x, DECIDE.y, DECIDE.w, DECIDE.h + 10).setDepth(DEPTH.controls + 1).setInteractive({ useHandCursor: true })
        return { art, zone, base: 1 }
    }
    const trust = wide('trust', DECIDE.xs[0])
    const distrust = wide('distrust', DECIDE.xs[1])

    const sink = (pad: Pad, down: boolean) => {
        scene.tweens.killTweensOf(pad.art)
        pad.art.setScale(down ? 0.9 : 1)
    }

    const paint = () => {
        const d = Math.sign(demo || Math.sign([...pointers.values()].reduce<number>((a, b) => a + b, 0)) || keyDir)
        left.art.setVisible(shown && walkOn).setScale(d < 0 ? 0.9 : 1)
        right.art.setVisible(shown && walkOn).setScale(d > 0 ? 0.9 : 1)
        look.art.setVisible(shown && lookOn)
        ;[trust, distrust].forEach(p => p.art.setVisible(shown && decideOn))
        const enable = (pad: Pad, on: boolean) => {
            if (pad.zone.input) pad.zone.input.enabled = on
        }
        enable(left, shown && walkOn)
        enable(right, shown && walkOn)
        enable(look, shown && lookOn)
        enable(trust, shown && decideOn)
        enable(distrust, shown && decideOn)
    }

    const bindWalk = (pad: Pad, side: -1 | 1) => {
        pad.zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
            pointers.set(p.id, side)
            paint()
        })
        const up = (p: Phaser.Input.Pointer) => {
            pointers.delete(p.id)
            paint()
        }
        pad.zone.on('pointerup', up)
        pad.zone.on('pointerout', up)
        pad.zone.on('pointerupoutside', up)
    }
    bindWalk(left, -1)
    bindWalk(right, 1)

    const doLook = () => {
        if (!lookOn || !shown) return
        void FX.press(scene, look.art)
        opts.onLook()
    }
    look.zone.on('pointerdown', doLook)

    const decide = (verdict: Verdict) => {
        if (!decideOn) return
        void FX.press(scene, verdict === 'trust' ? trust.art : distrust.art)
        opts.onDecide(verdict)
    }
    trust.zone.on('pointerdown', () => decide('trust'))
    distrust.zone.on('pointerdown', () => decide('distrust'))

    const held = new Set<string>()
    const LEFT = new Set(['a', 'arrowleft'])
    const RIGHT = new Set(['d', 'arrowright'])
    const LOOK = new Set(['w', 'arrowup', ' ', 'enter'])
    const readKeys = () => {
        keyDir = ([...held].some(k => RIGHT.has(k)) ? 1 : 0) - ([...held].some(k => LEFT.has(k)) ? 1 : 0)
        paint()
    }
    const onDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase()
        if (LEFT.has(k) || RIGHT.has(k)) {
            held.add(k)
            readKeys()
        } else if (LOOK.has(k) && !e.repeat) doLook()
    }
    const onUp = (e: KeyboardEvent) => {
        held.delete(e.key.toLowerCase())
        readKeys()
    }
    scene.input.keyboard?.on('keydown', onDown)
    scene.input.keyboard?.on('keyup', onUp)
    const onBlur = () => {
        held.clear()
        pointers.clear()
        readKeys()
    }
    window.addEventListener('blur', onBlur)

    paint()

    return {
        dir() {
            if (!walkOn || !shown) return 0
            const touch = Math.sign([...pointers.values()].reduce<number>((a, b) => a + b, 0))
            return touch || keyDir
        },
        setWalk(on) {
            walkOn = on
            if (!on) pointers.clear()
            paint()
        },
        setLook(on) {
            if (on && !lookOn && shown) {
                look.art.setScale(0.6)
                void FX.to(scene, look.art, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
            }
            lookOn = on
            paint()
        },
        async setDecide(on) {
            decideOn = on
            paint()
            if (!on) return
            await FX.all(
                ...[trust, distrust].map((p, i) => {
                    p.art.setScale(0.6).setAlpha(0)
                    return FX.to(scene, p.art, { scale: 1, alpha: 1 }, { duration: 300, delay: i * 90, ease: 'Back.easeOut' })
                }),
            )
        },
        hold(side) {
            demo = side
            paint()
        },
        async press(which) {
            const pad = which === 'look' ? look : which === 'trust' ? trust : distrust
            sink(pad, true)
            await FX.wait(scene, 160)
            sink(pad, false)
        },
        visible(on) {
            shown = on
            if (!on) pointers.clear()
            paint()
        },
        arrowsRect: () => ({
            x: (CONTROLS.leftX + CONTROLS.rightX) / 2,
            y: CONTROLS.y,
            w: CONTROLS.rightX - CONTROLS.leftX + CONTROLS.r * 2 + 16,
            h: CONTROLS.r * 2 + 16,
        }),
        lookRect: () => ({ x: CONTROLS.lookX, y: CONTROLS.lookY, w: CONTROLS.lookR * 2 + 16, h: CONTROLS.lookR * 2 + 16 }),
        decideRect: () => ({
            x: (DECIDE.xs[0] + DECIDE.xs[1]) / 2,
            y: DECIDE.y,
            w: DECIDE.xs[1] - DECIDE.xs[0] + DECIDE.w + 20,
            h: DECIDE.h + 24,
        }),
        destroy() {
            scene.input.keyboard?.off('keydown', onDown)
            scene.input.keyboard?.off('keyup', onUp)
            window.removeEventListener('blur', onBlur)
            ;[left, right, look, trust, distrust].forEach(p => {
                scene.tweens.killTweensOf(p.art)
                p.zone.destroy()
                p.art.destroy()
            })
        },
    }
}
