import Phaser from 'phaser'
import { DEPTH, HEADER, PAD, W } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

export interface Controls {
    dir(): number
    touched(): boolean
    show(dir: number): void
    pad(dir: -1 | 1): Vec
    destroy(): void
}

export function createControls(scene: Phaser.Scene): Controls {
    const paint = (g: Phaser.GameObjects.Graphics, side: -1 | 1, lit: boolean) => {
        const s = PAD.size
        g.clear()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-s / 2, -s / 2 + 8, s, s, 36)
        g.fillStyle(lit ? C.butter : C.white, lit ? 1 : 0.9)
        g.fillRoundedRect(-s / 2, -s / 2, s, s, 36)
        g.lineStyle(6, C.headerLine, 1)
        g.strokeRoundedRect(-s / 2, -s / 2, s, s, 36)
        g.fillStyle(C.headerLine, 1)
        const t = 34
        g.fillTriangle(side * t, 0, -side * t * 0.7, -t, -side * t * 0.7, t)
    }
    const left = scene.add.graphics().setPosition(PAD.leftX, PAD.y).setDepth(DEPTH.pad)
    const right = scene.add.graphics().setPosition(PAD.rightX, PAD.y).setDepth(DEPTH.pad)
    let litLeft = false
    let litRight = false
    paint(left, -1, false)
    paint(right, 1, false)

    const keys = scene.input.keyboard?.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<'left' | 'right' | 'a' | 'd', Phaser.Input.Keyboard.Key> | undefined

    const read = () => {
        let l = false
        let r = false
        scene.input.manager.pointers.forEach(p => {
            if (!p.isDown || p.y < HEADER.h) return
            if (p.x < W / 2) l = true
            else r = true
        })
        if (keys) {
            if (keys.left.isDown || keys.a.isDown) l = true
            if (keys.right.isDown || keys.d.isDown) r = true
        }
        return { l, r }
    }

    const show = (dir: number) => {
        const l = dir < 0
        const r = dir > 0
        if (l !== litLeft) paint(left, -1, (litLeft = l))
        if (r !== litRight) paint(right, 1, (litRight = r))
        left.setScale(l ? 0.94 : 1)
        right.setScale(r ? 0.94 : 1)
    }

    return {
        dir() {
            const { l, r } = read()
            return (r ? 1 : 0) - (l ? 1 : 0)
        },
        touched() {
            const { l, r } = read()
            return l || r
        },
        show,
        pad: dir => ({ x: dir < 0 ? PAD.leftX : PAD.rightX, y: PAD.y }),
        destroy() {
            left.destroy()
            right.destroy()
        },
    }
}
