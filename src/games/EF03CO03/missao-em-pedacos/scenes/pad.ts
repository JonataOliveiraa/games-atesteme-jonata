import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PAD, PHYS } from '../data/layout'
import { C } from '../data/theme'

type Which = 'left' | 'right' | 'jump'

/** Os três botões, e o teclado. Um gesto por botão, nada de combinação. */
export function createPad(scene: Phaser.Scene) {
    const g = scene.add.graphics().setDepth(DEPTH.pad).setScrollFactor(0)
    const held: Record<Which, boolean> = { left: false, right: false, jump: false }
    const touch: Record<Which, boolean> = { left: false, right: false, jump: false }
    let enabled = false
    let lastJumpAt = -1e9

    const paint = () => {
        g.clear()
        if (!enabled) return

        const button = (x: number, y: number, r: number, down: boolean, tone: number, dark: number) => {
            g.fillStyle(C.ink, 0.24)
            g.fillCircle(x + 3, y + 8, r)
            g.fillStyle(dark, down ? 0.95 : 0.8)
            g.fillCircle(x, y + (down ? 4 : 0), r)
            g.fillStyle(tone, down ? 0.95 : 0.82)
            g.fillCircle(x, y + (down ? 4 : 0) - 4, r - 3)
            g.fillStyle(C.white, 0.28)
            g.fillEllipse(x - r * 0.16, y - r * 0.44, r * 1.1, r * 0.42)
            g.lineStyle(6, C.white, 0.55)
            g.strokeCircle(x, y + (down ? 4 : 0) - 2, r)
        }

        const arrow = (x: number, y: number, dir: number, down: boolean) => {
            const dy = down ? 4 : 0
            g.fillStyle(C.white, 1)
            g.fillTriangle(x + 20 * dir, y - 26 + dy, x + 20 * dir, y + 26 + dy, x - 22 * dir, y + dy)
        }

        button(PAD.left.x, PAD.left.y, PAD.left.r, held.left, C.blue, C.blueDark)
        arrow(PAD.left.x, PAD.left.y - 2, 1, held.left)
        button(PAD.right.x, PAD.right.y, PAD.right.r, held.right, C.blue, C.blueDark)
        arrow(PAD.right.x, PAD.right.y - 2, -1, held.right)

        button(PAD.jump.x, PAD.jump.y, PAD.jump.r, held.jump, C.ok, C.okDark)
        const dy = held.jump ? 4 : 0
        g.fillStyle(C.white, 1)
        g.fillTriangle(
            PAD.jump.x,
            PAD.jump.y - 40 + dy,
            PAD.jump.x - 34,
            PAD.jump.y + 4 + dy,
            PAD.jump.x + 34,
            PAD.jump.y + 4 + dy,
        )
        g.fillRoundedRect(PAD.jump.x - 13, PAD.jump.y + dy, 26, 34, 8)
    }

    const zones: Phaser.GameObjects.Zone[] = []

    const makeZone = (which: Which, x: number, y: number, r: number) => {
        const zone = scene.add
            .zone(x, y, r * 2 + 26, r * 2 + 26)
            .setOrigin(0.5)
            .setDepth(DEPTH.pad + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => {
            if (!enabled) return
            touch[which] = true
            held[which] = true
            if (which === 'jump') lastJumpAt = scene.time.now
            paint()
        })
        const release = () => {
            if (!touch[which]) return
            touch[which] = false
            held[which] = false
            paint()
        }
        zone.on('pointerup', release)
        zone.on('pointerout', release)
        zones.push(zone)
    }

    makeZone('left', PAD.left.x, PAD.left.y, PAD.left.r)
    makeZone('right', PAD.right.x, PAD.right.y, PAD.right.r)
    makeZone('jump', PAD.jump.x, PAD.jump.y, PAD.jump.r)

    const clearAll = () => {
        ;(Object.keys(touch) as Which[]).forEach(which => {
            touch[which] = false
            held[which] = false
        })
        paint()
    }
    scene.input.on(Phaser.Input.Events.POINTER_UP, clearAll)
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, clearAll)

    const keys = scene.input.keyboard?.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as Record<string, Phaser.Input.Keyboard.Key> | undefined

    if (keys) {
        ;[keys.up, keys.w, keys.space].forEach(key => {
            key?.on('down', () => {
                if (!enabled) return
                lastJumpAt = scene.time.now
                held.jump = true
                paint()
            })
            key?.on('up', () => {
                if (touch.jump) return
                held.jump = false
                paint()
            })
        })
    }

    return {
        get left() {
            return held.left || !!keys?.left.isDown || !!keys?.a.isDown
        },

        get right() {
            return held.right || !!keys?.right.isDown || !!keys?.d.isDown
        },

        /**
         * O DEDO PARADO NO BOTÃO CONTINUA VALENDO.
         *
         * Antes o pulo só existia no instante do toque: criança que segura o
         * botão — e criança segura — dava UM pulo e depois nada. Parecia botão
         * quebrado. Agora, enquanto o dedo estiver no PULAR, o herói pula de
         * novo a cada vez que encosta no chão.
         */
        get jumpHeld() {
            return held.jump
        },

        /** O pulo guardado: apertar um pouco antes de encostar no chão vale. */
        consumeJump() {
            if (scene.time.now - lastJumpAt > PHYS.bufferMs) return false
            lastJumpAt = -1e9
            return true
        },

        setEnabled(value: boolean) {
            enabled = value
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
            if (!value) clearAll()
            paint()
        },

        jumpBounds() {
            return { x: PAD.jump.x, y: PAD.jump.y, w: PAD.jump.r * 2 + 40, h: PAD.jump.r * 2 + 40 }
        },

        press(which: Which) {
            held[which] = true
            paint()
            void FX.wait(scene, 160).then(() => {
                held[which] = false
                paint()
            })
        },

        destroy() {
            scene.input.off(Phaser.Input.Events.POINTER_UP, clearAll)
            scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, clearAll)
            zones.forEach(zone => zone.destroy())
            g.destroy()
        },
    }
}

export type Pad = ReturnType<typeof createPad>
