import Phaser from 'phaser'
import { ART, ITEMS_SHEET, PIECE_FRAME, frameKey } from '../data/files'
import { DEPTH, SWITCH } from '../data/layout'
import { C } from '../data/theme'
import type { Side } from '../types'

export interface Switch {
    turn(side: Side): Promise<void>
    center(): void
    setInviting(on: boolean): void
    destroy(): void
}

export function createSwitch(scene: Phaser.Scene): Switch {
    const parts: Phaser.GameObjects.GameObject[] = []
    let blade: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    if (scene.textures.exists(ITEMS_SHEET)) {
        const [, , w, h] = PIECE_FRAME.blade
        blade = scene.add
            .image(0, 0, ITEMS_SHEET, frameKey('blade'))
            .setOrigin(ART.bladeRing.x / w, ART.bladeRing.y / h)
            .setScale(SWITCH.bladeH / (h - ART.bladeRing.y))
        parts.push(blade)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.sleeper, 1)
        g.fillRoundedRect(-22, 18, 44, 8, 3)
        g.fillRoundedRect(-22, 46, 44, 8, 3)
        g.lineStyle(6, C.steelDark, 1)
        g.lineBetween(-12, 4, -12, SWITCH.bladeH)
        g.lineBetween(12, 4, 12, SWITCH.bladeH)
        const pivot = scene.add.graphics()
        pivot.fillStyle(C.coral, 1)
        pivot.fillCircle(0, 0, 14)
        pivot.lineStyle(4, C.ink, 1)
        pivot.strokeCircle(0, 0, 14)
        blade = g
        parts.push(g, pivot)
    }
    const holder = scene.add.container(SWITCH.x, SWITCH.y, parts).setDepth(DEPTH.blade)

    const arrows = scene.add.graphics().setDepth(DEPTH.blade + 1)
    for (const dir of [-1, 1]) {
        const x = SWITCH.x + dir * SWITCH.arrowDX
        const y = SWITCH.y + SWITCH.arrowDY
        arrows.fillStyle(C.white, 1)
        arrows.lineStyle(5, C.ink, 1)
        arrows.beginPath()
        arrows.moveTo(x + dir * 34, y + 22)
        arrows.lineTo(x - dir * 8, y - 22)
        arrows.lineTo(x - dir * 22, y + 16)
        arrows.closePath()
        arrows.fillPath()
        arrows.strokePath()
    }
    arrows.setVisible(false)
    let pulse: Phaser.Tweens.Tween | undefined

    return {
        turn(side) {
            return new Promise(resolve => {
                scene.tweens.add({
                    targets: blade,
                    angle: side === 'left' ? SWITCH.turn : -SWITCH.turn,
                    duration: 160,
                    ease: 'Back.easeOut',
                    onComplete: () => resolve(),
                })
            })
        },
        center() {
            scene.tweens.killTweensOf(blade)
            scene.tweens.add({ targets: blade, angle: 0, duration: 200, ease: 'Sine.easeOut' })
        },
        setInviting(on) {
            pulse?.remove()
            pulse = undefined
            arrows.setVisible(on).setAlpha(1)
            if (on) pulse = scene.tweens.add({ targets: arrows, alpha: 0.35, duration: 520, yoyo: true, repeat: -1 })
        },
        destroy() {
            pulse?.remove()
            scene.tweens.killTweensOf([blade, arrows])
            holder.destroy()
            arrows.destroy()
        },
    }
}
