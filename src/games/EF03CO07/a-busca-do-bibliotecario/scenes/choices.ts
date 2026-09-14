import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CHOICE, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { ChoiceDef } from '../types'

interface Button {
    def: ChoiceDef
    root: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    ring: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
}

export function createChoices(scene: Phaser.Scene, onPick: (index: number) => void) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.choice)
    let buttons: Button[] = []
    let enabled = false

    const slotX = (index: number) => CHOICE.cx + (index - 1) * CHOICE.gap

    const paint = (button: Button, pressed: boolean) => {
        const { w, h } = CHOICE
        const add = button.def.kind === 'add'
        const dy = pressed ? 8 : 0
        button.face.clear()
        button.face.fillStyle(C.ink, 0.28)
        button.face.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, 26)
        button.face.fillStyle(add ? C.magicDeep : C.warnDark, 1)
        button.face.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, 26)
        button.face.fillStyle(add ? C.magic : C.warn, 1)
        button.face.fillRoundedRect(-w / 2 + 7, -h / 2 + 7 + dy, w - 14, h - 20, 20)
        button.face.fillStyle(C.white, 0.3)
        button.face.fillRoundedRect(-w / 2 + 22, -h / 2 + 16 + dy, w - 44, 14, 7)
    }

    const clear = () => {
        buttons.forEach(button => {
            scene.tweens.killTweensOf(button.root)
            scene.tweens.killTweensOf(button.ring)
            button.zone.destroy()
            button.root.destroy(true)
        })
        buttons = []
    }

    return {
        async show(defs: ChoiceDef[]) {
            clear()
            buttons = defs.map((def, index) => {
                const container = scene.add.container(slotX(index), CHOICE.y)
                const ring = scene.add.graphics().setAlpha(0)
                ring.lineStyle(9, C.gold, 1)
                ring.strokeRoundedRect(-CHOICE.w / 2 - 8, -CHOICE.h / 2 - 8, CHOICE.w + 16, CHOICE.h + 16, 32)
                const face = scene.add.graphics()
                container.add([ring, face])
                container.add(
                    scene.add
                        .text(0, -6, `${def.kind === 'add' ? '+' : '−'} ${def.term}`, {
                            fontFamily: FONT.black,
                            fontSize: '34px',
                            color: CSS.white,
                        })
                        .setOrigin(0.5)
                        .setResolution(2),
                )

                const zone = scene.add
                    .zone(slotX(index), CHOICE.y, CHOICE.hitW, CHOICE.hitH)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.choice + 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (enabled) onPick(index)
                })
                if (zone.input) zone.input.enabled = enabled

                root.add(container)
                const button: Button = { def, root: container, face, ring, zone }
                paint(button, false)
                container.setScale(0.85).setAlpha(0)
                return button
            })

            await FX.all(
                ...buttons.map((button, index) =>
                    FX.wait(scene, index * 90).then(() =>
                        FX.to(scene, button.root, { scale: 1, alpha: 1 }, { duration: 300, ease: 'Back.easeOut' }),
                    ),
                ),
            )
        },

        setEnabled(value: boolean) {
            enabled = value
            buttons.forEach(button => {
                if (button.zone.input) button.zone.input.enabled = value
                button.root.setAlpha(button.root.alpha > 0 ? (value ? 1 : 0.6) : 0)
            })
        },

        posOf(index: number) {
            return { x: slotX(index), y: CHOICE.y }
        },

        bounds() {
            return { x: CHOICE.cx, y: CHOICE.y, w: CHOICE.gap * 2 + CHOICE.w + 30, h: CHOICE.h + 36 }
        },

        press(index: number) {
            const button = buttons[index]
            if (!button) return
            paint(button, true)
            void FX.wait(scene, 130).then(() => paint(button, false))
        },

        nope(index: number) {
            const button = buttons[index]
            if (!button) return
            return FX.shake(scene, button.root, { times: 3, amount: 12 })
        },

        hint(index: number) {
            const button = buttons[index]
            if (!button) return
            scene.tweens.killTweensOf(button.ring)
            button.ring.setAlpha(0)
            scene.tweens.add({
                targets: button.ring,
                alpha: 1,
                duration: 560,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        async hide() {
            await FX.all(
                ...buttons.map(button => FX.to(scene, button.root, { alpha: 0, scale: 0.85 }, { duration: 220 })),
            )
            clear()
        },

        clear,

        destroy() {
            clear()
            root.destroy(true)
        },
    }
}

export type Choices = ReturnType<typeof createChoices>
