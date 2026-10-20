import Phaser from 'phaser'
import { DEPTH, HEADER, PAD, W } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

export interface Controls {
    dir(): number
    show(dir: number): void
    ping(dir: -1 | 1): void
    pad(dir: -1 | 1): Vec
    destroy(): void
}

const padKey = (lit: boolean) => (lit ? 'pad-aceso' : 'pad')

function bakePad(scene: Phaser.Scene, lit: boolean) {
    const key = padKey(lit)
    if (scene.textures.exists(key)) return
    const s = PAD.size
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(C.white, 0.9)
    g.fillRoundedRect(0, 0, s + 12, s + 22, 42)
    g.fillStyle(lit ? C.goldDark : C.tabShade, 1)
    g.fillRoundedRect(6, 16 - (lit ? 6 : 0), s, s, 36)
    g.fillStyle(lit ? C.butter : C.white, 1)
    g.fillRoundedRect(6, 6 + (lit ? 4 : 0), s, s - 4, 36)
    g.fillStyle(C.accent, 1)
    const cx = 6 + s / 2
    const cy = 6 + s / 2 + (lit ? 2 : -2)
    const t = 34
    g.fillTriangle(cx + t, cy, cx - t * 0.7, cy - t, cx - t * 0.7, cy + t)
    g.fillCircle(cx + t - 6, cy, 6)
    g.generateTexture(key, s + 12, s + 22)
    g.destroy()
}

export function createControls(scene: Phaser.Scene): Controls {
    bakePad(scene, false)
    bakePad(scene, true)
    const left = scene.add.image(PAD.leftX, PAD.y, padKey(false)).setFlipX(true).setDepth(DEPTH.pad)
    const right = scene.add.image(PAD.rightX, PAD.y, padKey(false)).setDepth(DEPTH.pad)
    let litLeft = false
    let litRight = false

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
        if (l !== litLeft) left.setTexture(padKey((litLeft = l)))
        if (r !== litRight) right.setTexture(padKey((litRight = r)))
    }

    return {
        dir() {
            const { l, r } = read()
            return (r ? 1 : 0) - (l ? 1 : 0)
        },
        show,
        ping(dir) {
            const at = dir < 0 ? left : right
            const ring = scene.add.circle(at.x, at.y, PAD.size * 0.42).setDepth(DEPTH.pad + 1)
            ring.setStrokeStyle(8, C.pulse, 1)
            scene.tweens.add({ targets: ring, scale: 1.5, alpha: 0, duration: 650, repeat: 1, onComplete: () => ring.destroy() })
        },
        pad: dir => ({ x: dir < 0 ? PAD.leftX : PAD.rightX, y: PAD.y }),
        destroy() {
            left.destroy()
            right.destroy()
        },
    }
}
