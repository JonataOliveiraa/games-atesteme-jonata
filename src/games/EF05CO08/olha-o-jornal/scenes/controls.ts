import Phaser from 'phaser'
import { CTRL, DEPTH } from '../data/layout'
import { C } from '../data/theme'

export interface Controls {
    setEnabled(on: boolean): void
    setShown(on: boolean): void
    update(delta: number): void
    arrowPos(dir: -1 | 1): { x: number; y: number }
    throwPos(): { x: number; y: number }
    destroy(): void
}

const HOLD_MS = 260
const REPEAT_MS = 110

export function createControls(
    scene: Phaser.Scene,
    opts: { onStep: (dir: -1 | 1) => void; onThrow: () => void },
): Controls {
    const root = scene.add.container(0, 0).setDepth(DEPTH.controls)
    const g = scene.add.graphics()
    root.add(g)

    let enabled = false
    let held: -1 | 1 | null = null
    let heldFor = 0
    let pressed: -1 | 1 | 0 | null = null

    const paint = () => {
        g.clear()
        const alpha = enabled ? 1 : 0.4

        const arrow = (cx: number, dir: -1 | 1) => {
            const w = CTRL.arrowW
            const h = CTRL.arrowH
            const down = pressed === dir
            const y = CTRL.arrowCy + (down ? 4 : 0)
            g.fillStyle(C.shadow, 0.25 * alpha)
            g.fillRect(cx - w / 2 + 5, y - h / 2 + 7, w, h)
            g.fillStyle(C.cream, alpha)
            g.fillRect(cx - w / 2, y - h / 2, w, h)
            g.lineStyle(5, C.ink, alpha)
            g.strokeRect(cx - w / 2, y - h / 2, w, h)
            g.fillStyle(C.ink, alpha)
            const s = 30
            if (dir < 0) g.fillTriangle(cx + s * 0.55, y - s, cx + s * 0.55, y + s, cx - s * 0.7, y)
            else g.fillTriangle(cx - s * 0.55, y - s, cx - s * 0.55, y + s, cx + s * 0.7, y)
        }

        arrow(CTRL.leftCx, -1)
        arrow(CTRL.rightCx, 1)

        const down = pressed === 0
        const ty = CTRL.throwCy + (down ? 4 : 0)
        g.fillStyle(C.shadow, 0.25 * alpha)
        g.fillCircle(CTRL.throwCx + 5, ty + 7, CTRL.throwR)
        g.fillStyle(C.mustard, alpha)
        g.fillCircle(CTRL.throwCx, ty, CTRL.throwR)
        g.lineStyle(5, C.ink, alpha)
        g.strokeCircle(CTRL.throwCx, ty, CTRL.throwR)
        g.fillStyle(C.paper, alpha)
        g.fillRect(CTRL.throwCx - 28, ty - 14, 56, 28)
        g.lineStyle(4, C.ink, alpha)
        g.strokeRect(CTRL.throwCx - 28, ty - 14, 56, 28)
        g.lineBetween(CTRL.throwCx - 16, ty - 4, CTRL.throwCx + 16, ty - 4)
        g.lineBetween(CTRL.throwCx - 16, ty + 5, CTRL.throwCx + 16, ty + 5)
    }
    paint()

    const zoneFor = (cx: number, cy: number, w: number, h: number) =>
        scene.add
            .zone(cx, cy, w, h)
            .setOrigin(0.5)
            .setDepth(DEPTH.controls + 1)
            .setInteractive({ useHandCursor: true })

    const makeArrow = (cx: number, dir: -1 | 1) => {
        const zone = zoneFor(cx, CTRL.arrowCy, CTRL.arrowW + 12, CTRL.arrowH + 12)
        zone.on('pointerdown', () => {
            if (!enabled) return
            pressed = dir
            held = dir
            heldFor = 0
            opts.onStep(dir)
            paint()
        })
        const release = () => {
            if (held === dir) held = null
            if (pressed === dir) pressed = null
            paint()
        }
        zone.on('pointerup', release)
        zone.on('pointerout', release)
        return zone
    }

    const zones = [makeArrow(CTRL.leftCx, -1), makeArrow(CTRL.rightCx, 1)]

    const throwZone = zoneFor(CTRL.throwCx, CTRL.throwCy, CTRL.throwR * 2 + 24, CTRL.throwR * 2 + 24)
    throwZone.on('pointerdown', () => {
        if (!enabled) return
        pressed = 0
        paint()
        opts.onThrow()
    })
    const throwRelease = () => {
        if (pressed === 0) pressed = null
        paint()
    }
    throwZone.on('pointerup', throwRelease)
    throwZone.on('pointerout', throwRelease)
    zones.push(throwZone)

    const setEnabled = (on: boolean) => {
        enabled = on
        held = null
        pressed = null
        zones.forEach(z => {
            z.input!.enabled = on
        })
        paint()
    }

    return {
        setEnabled,
        setShown(on) {
            root.setVisible(on)
            zones.forEach(z => {
                z.input!.enabled = on && enabled
            })
        },
        update(delta) {
            if (!enabled || held === null) return
            heldFor += delta
            if (heldFor < HOLD_MS) return
            if ((heldFor - HOLD_MS) % REPEAT_MS < delta) opts.onStep(held)
        },
        arrowPos(dir) {
            return { x: dir < 0 ? CTRL.leftCx : CTRL.rightCx, y: CTRL.arrowCy }
        },
        throwPos() {
            return { x: CTRL.throwCx, y: CTRL.throwCy }
        },
        destroy() {
            zones.forEach(z => z.destroy())
            root.destroy()
        },
    }
}
