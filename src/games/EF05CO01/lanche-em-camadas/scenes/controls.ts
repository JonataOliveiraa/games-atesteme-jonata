import Phaser from 'phaser'
import { UI_CELL, UI_SHEET } from '../data/files'
import { CONTROLS, DEPTH } from '../data/layout'
import type { Rect } from '../types'
import { fit } from './art'

export interface Controls {
    dir(): number
    setWalk(on: boolean): void
    hold(side: -1 | 0 | 1): void
    visible(on: boolean): void
    rect(side: -1 | 1): Rect
    destroy(): void
}

interface Pad {
    art: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
}

export function createControls(scene: Phaser.Scene): Controls {
    const pointers = new Map<number, -1 | 1>()
    let keyDir = 0
    let demo: -1 | 0 | 1 = 0
    let walkOn = false
    let shown = true

    const pad = (x: number, flip: boolean): Pad => {
        const img = fit(scene, UI_SHEET, UI_CELL.arrow, CONTROLS.r * 2).setFlipX(flip)
        const art = scene.add.container(x, CONTROLS.y, [img]).setDepth(DEPTH.controls)
        const zone = scene.add
            .zone(x, CONTROLS.y, CONTROLS.r * 2 + 40, CONTROLS.r * 2 + 40)
            .setDepth(DEPTH.controls + 1)
            .setInteractive({ useHandCursor: true })
        return { art, zone }
    }
    const left = pad(CONTROLS.leftX, true)
    const right = pad(CONTROLS.rightX, false)

    const touchDir = () => Math.sign([...pointers.values()].reduce<number>((a, b) => a + b, 0))

    const paint = () => {
        const d = demo || touchDir() || keyDir
        left.art.setVisible(shown).setScale(d < 0 ? 0.88 : 1).setAlpha(walkOn || demo ? 1 : 0.5)
        right.art.setVisible(shown).setScale(d > 0 ? 0.88 : 1).setAlpha(walkOn || demo ? 1 : 0.5)
        ;[left, right].forEach(p => {
            if (p.zone.input) p.zone.input.enabled = shown && walkOn
        })
    }

    const bind = (p: Pad, side: -1 | 1) => {
        p.zone.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
            pointers.set(ptr.id, side)
            paint()
        })
        const up = (ptr: Phaser.Input.Pointer) => {
            pointers.delete(ptr.id)
            paint()
        }
        p.zone.on('pointerup', up)
        p.zone.on('pointerout', up)
        p.zone.on('pointerupoutside', up)
    }
    bind(left, -1)
    bind(right, 1)

    const held = new Set<string>()
    const LEFT = new Set(['a', 'arrowleft'])
    const RIGHT = new Set(['d', 'arrowright'])
    const read = () => {
        keyDir = ([...held].some(k => RIGHT.has(k)) ? 1 : 0) - ([...held].some(k => LEFT.has(k)) ? 1 : 0)
        paint()
    }
    const onDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase()
        if (!LEFT.has(k) && !RIGHT.has(k)) return
        held.add(k)
        read()
    }
    const onUp = (e: KeyboardEvent) => {
        held.delete(e.key.toLowerCase())
        read()
    }
    scene.input.keyboard?.on('keydown', onDown)
    scene.input.keyboard?.on('keyup', onUp)
    const onBlur = () => {
        held.clear()
        pointers.clear()
        read()
    }
    window.addEventListener('blur', onBlur)
    paint()

    return {
        dir() {
            if (!walkOn || !shown) return 0
            return touchDir() || keyDir
        },
        setWalk(on) {
            walkOn = on
            if (!on) pointers.clear()
            paint()
        },
        hold(side) {
            demo = side
            paint()
        },
        visible(on) {
            shown = on
            if (!on) pointers.clear()
            paint()
        },
        rect: side => ({ x: side < 0 ? CONTROLS.leftX : CONTROLS.rightX, y: CONTROLS.y, w: CONTROLS.r * 2 + 16, h: CONTROLS.r * 2 + 16 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onDown)
            scene.input.keyboard?.off('keyup', onUp)
            window.removeEventListener('blur', onBlur)
            ;[left, right].forEach(p => {
                p.zone.destroy()
                p.art.destroy()
            })
        },
    }
}
