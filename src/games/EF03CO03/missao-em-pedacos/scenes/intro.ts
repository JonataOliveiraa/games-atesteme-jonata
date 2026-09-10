import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, INTRO, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Task } from '../types'

/**
 * O CARTÃO DA TAREFA. Sem ele a criança caía direto numa tela de painéis sem
 * saber o que estava preparando. Ele diz o nome da missão, mostra as coisas que
 * precisam ser arrumadas e some sozinho — ou no primeiro toque.
 */
export function createIntro(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.overlay - 200).setScrollFactor(0)
    root.setVisible(false)

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.55).setScrollFactor(0)
    const card = scene.add.container(INTRO.cx, INTRO.cy).setScrollFactor(0)
    const face = scene.add.graphics()
    const pill = scene.add.graphics()

    let tone = C.warn

    const paint = () => {
        const w = INTRO.w
        const h = INTRO.h
        face.clear()
        face.fillStyle(C.ink, 0.3)
        face.fillRoundedRect(-w / 2 - 4, -h / 2 + 12, w + 8, h, 34)
        face.fillStyle(C.ink, 1)
        face.fillRoundedRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 34)
        face.fillStyle(C.card, 1)
        face.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
        face.fillStyle(tone, 1)
        face.fillRoundedRect(-w / 2, -h / 2, w, 18, 9)

        pill.clear()
        pill.fillStyle(C.ink, 1)
        pill.fillRoundedRect(-106, -h / 2 + 24, 212, 50, 25)
        pill.fillStyle(tone, 1)
        pill.fillRoundedRect(-102, -h / 2 + 28, 204, 38, 19)
    }
    paint()

    const label = scene.add
        .text(0, -INTRO.h / 2 + 47, 'MISSÃO', {
            fontFamily: FONT.black,
            fontSize: '22px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    label.setStroke(CSS.ink, 5)

    const title = scene.add
        .text(0, -INTRO.h / 2 + 106, '', {
            fontFamily: FONT.black,
            fontSize: '40px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: INTRO.w - 90 },
        })
        .setOrigin(0.5)
        .setResolution(2)

    const line = scene.add
        .text(0, INTRO.h / 2 - 46, '', {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: CSS.warn,
            align: 'center',
            wordWrap: { width: INTRO.w - 90 },
        })
        .setOrigin(0.5)
        .setResolution(2)

    card.add([face, pill, label, title, line])
    root.add([veil, card])

    let icons: Phaser.GameObjects.Image[] = []
    let zone: Phaser.GameObjects.Zone | null = null

    const clearIcons = () => {
        icons.forEach(icon => icon.destroy())
        icons = []
    }

    return {
        async show(task: Task, sheet: string, options: { badge: string; line: string; tone?: number }) {
            clearIcons()
            title.setText(task.name)
            line.setText(options.line)
            label.setText(options.badge)
            tone = options.tone ?? C.warn
            paint()

            if (scene.textures.exists(sheet)) {
                const size = INTRO.icon
                const pitch = INTRO.iconPitch
                const x0 = -((task.items.length - 1) * pitch) / 2
                icons = task.items.map((item, index) => {
                    const icon = scene.add
                        .image(x0 + index * pitch, 24, sheet, item.frame)
                        .setDisplaySize(size, size)
                        .setScrollFactor(0)
                    card.add(icon)
                    return icon
                })
            }

            root.setVisible(true)
            veil.setAlpha(0)
            card.setScale(0.86)
            card.setAlpha(0)

            let done = false
            const finish = () => {
                done = true
            }
            zone = scene.add
                .zone(W / 2, H / 2, W, H)
                .setDepth(DEPTH.overlay - 199)
                .setScrollFactor(0)
                .setInteractive()
            zone.on('pointerdown', finish)

            void FX.to(scene, veil, { alpha: 1 }, { duration: 220 })
            await FX.to(scene, card, { alpha: 1, scale: 1 }, { duration: 340, ease: 'Back.easeOut' })
            void FX.all(
                ...icons.map((icon, index) =>
                    FX.wait(scene, 90 + index * 55).then(() => FX.popIn(scene, icon, { from: 0.4 })),
                ),
            )

            const started = scene.time.now
            while (!done && scene.time.now - started < 4200) {
                await FX.wait(scene, 120)
            }

            // Quem fecha o cartão pode ter sido `hide()` ou `destroy()` enquanto esta
            // espera rodava: a zona já pode não existir mais.
            zone?.destroy()
            zone = null
            await FX.to(scene, card, { alpha: 0, scale: 0.9 }, { duration: 220 })
            await FX.to(scene, veil, { alpha: 0 }, { duration: 160 })
            root.setVisible(false)
            clearIcons()
        },

        hide() {
            zone?.destroy()
            zone = null
            root.setVisible(false)
            clearIcons()
        },

        destroy() {
            zone?.destroy()
            zone = null
            clearIcons()
            scene.tweens.killTweensOf(card)
            root.destroy(true)
        },
    }
}

export type Intro = ReturnType<typeof createIntro>
