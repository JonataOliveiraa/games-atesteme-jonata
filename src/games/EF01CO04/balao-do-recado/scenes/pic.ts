import Phaser from 'phaser'
import { FORM_CELL, PIECES } from '../data/files'
import { FORM_SLOT, RING } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Form, Message } from '../types'

export interface Pic {
    readonly container: Phaser.GameObjects.Container
    set(key: string, frame: number, label: string): void
    destroy(): void
}

export function createPic(scene: Phaser.Scene, x: number, y: number, size: number, round = false): Pic {
    const container = scene.add.container(x, y)
    return {
        container,
        set(key, frame, label) {
            container.removeAll(true)
            if (scene.textures.exists(key)) {
                const image = scene.add.image(0, 0, key, frame)
                image.setScale(size / Math.max(image.frame.width, image.frame.height))
                container.add(image)
                return
            }
            const g = scene.add.graphics()
            g.fillStyle(C.cream, 1)
            if (round) g.fillCircle(0, 0, size / 2)
            else g.fillRoundedRect(-size / 2, -size / 2, size, size, 16)
            g.lineStyle(3, C.inkSoft, 1)
            if (round) g.strokeCircle(0, 0, size / 2)
            else g.strokeRoundedRect(-size / 2, -size / 2, size, size, 16)
            const text = scene.add
                .text(0, 0, label, {
                    fontFamily: FONT.body,
                    fontSize: `${SIZE.placeholder}px`,
                    color: CSS.inkSoft,
                    align: 'center',
                    wordWrap: { width: size - 10, useAdvancedWrap: true },
                })
                .setOrigin(0.5)
                .setResolution(2)
            container.add([g, text])
        },
        destroy() {
            container.destroy()
        },
    }
}

export function createFormView(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    form: Form,
    message: Message,
): Phaser.GameObjects.Container {
    const unit = size / RING.cell
    const shell = createPic(scene, 0, 0, size)
    shell.set(PIECES, FORM_CELL[form], form)
    const slot = FORM_SLOT[form]
    const inner = createPic(scene, (slot.x - RING.cell / 2) * unit, (slot.y - RING.cell / 2) * unit, slot.size * unit)
    inner.set(PIECES, message.icon, message.id)
    return scene.add.container(x, y, [shell.container, inner.container])
}
