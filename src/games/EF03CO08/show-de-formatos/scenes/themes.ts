import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { fitInside, SCENE_BOX, SHEET } from '../data/art'
import { DEPTH, H, W } from '../data/layout'
import { THEME_COVER, THEME_LABEL, THEME_ORDER } from '../data/levels'
import { C, CSS, FONT } from '../data/theme'
import type { ThemeId } from '../types'

const CARD = { w: 306, h: 304, gap: 40, cy: 366, plate: 66 }

export function createThemePicker(scene: Phaser.Scene, onPick: (theme: ThemeId) => void) {
    const veil = scene.add
        .rectangle(W / 2, H / 2, W, H, C.ink)
        .setAlpha(0)
        .setDepth(DEPTH.curtain - 6)
        .setInteractive()

    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = false
    let closed = false

    const span = CARD.w * THEME_ORDER.length + CARD.gap * (THEME_ORDER.length - 1)
    const xOf = (index: number) => W / 2 - span / 2 + CARD.w / 2 + index * (CARD.w + CARD.gap)

    const cards = THEME_ORDER.map((theme, index) => {
        const x = xOf(index)
        const root = scene.add.container(x, CARD.cy).setDepth(DEPTH.curtain - 5)
        const face = scene.add.graphics()
        const body = scene.add.container(0, 0)

        const { w, h } = CARD
        const shot = h - CARD.plate - 26
        const paint = (pressed: boolean) => {
            const dy = pressed ? 7 : 0
            face.clear()
            face.fillStyle(C.ink, 0.3)
            face.fillRoundedRect(-w / 2 + 5, -h / 2 + 12, w, h, 28)
            face.fillStyle(C.ink, 1)
            face.fillRoundedRect(-w / 2 - 4, -h / 2 - 4 + dy, w + 8, h + 8, 30)
            face.fillStyle(C.purpleDeep, 1)
            face.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, 26)
            face.fillStyle(C.cream, 1)
            face.fillRoundedRect(-w / 2 + 7, -h / 2 + 7 + dy, w - 14, h - 22, 21)
            face.fillStyle(C.purple, 1)
            face.fillRoundedRect(-w / 2 + 7, h / 2 - CARD.plate - 15 + dy, w - 14, CARD.plate, 18)
            face.fillStyle(C.white, 0.22)
            face.fillRoundedRect(-w / 2 + 22, h / 2 - CARD.plate - 6 + dy, w - 44, 9, 5)
            body.setY(dy)
        }

        const top = -h / 2 + 16 + shot / 2
        if (scene.textures.exists(SHEET.scenes)) {
            const frame = THEME_COVER[theme]
            const box = SCENE_BOX[frame]
            const image = scene.add.image(0, top, SHEET.scenes, frame)
            image.setOrigin((box.x + box.w / 2) / image.frame.width, (box.y + box.h / 2) / image.frame.height)
            image.setScale(fitInside(box, w - 46, shot))
            body.add(image)
        } else {
            const g = scene.add.graphics()
            g.fillStyle(C.blue, 1)
            g.fillRoundedRect(-(w - 46) / 2, top - shot / 2, w - 46, shot, 14)
            body.add(g)
        }

        const name = scene.add
            .text(0, h / 2 - CARD.plate / 2 - 15, THEME_LABEL[theme], {
                fontFamily: FONT.black,
                fontSize: '25px',
                color: CSS.white,
                align: 'center',
            })
            .setOrigin(0.5)
            .setResolution(2)
        name.setStroke(CSS.ink, 5)
        if (name.width > w - 44) name.setScale((w - 44) / name.width)
        body.add(name)

        root.add([face, body])
        paint(false)

        const zone = scene.add
            .zone(x, CARD.cy, w + 18, h + 22)
            .setOrigin(0.5)
            .setDepth(DEPTH.curtain - 4)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled || closed) return
            enabled = false
            paint(true)
            void FX.wait(scene, 150).then(() => root.active && paint(false))
            onPick(theme)
        })
        zones.push(zone)

        return { root, face, paint }
    })

    const destroy = () => {
        closed = true
        enabled = false
        scene.tweens.killTweensOf([veil, ...cards.map(card => card.root)])
        zones.forEach(zone => zone.destroy())
        cards.forEach(card => card.root.destroy(true))
        veil.destroy()
    }

    return {
        async open() {
            cards.forEach(card => card.root.setScale(0.82).setAlpha(0))
            await FX.to(scene, veil, { alpha: 0.66 }, { duration: 300 })
            await FX.all(
                ...cards.map((card, index) =>
                    FX.wait(scene, index * 120).then(() =>
                        FX.to(scene, card.root, { scale: 1, alpha: 1 }, { duration: 340, ease: 'Back.easeOut' }),
                    ),
                ),
            )
            enabled = true
        },

        async close(picked: ThemeId) {
            enabled = false
            const index = THEME_ORDER.indexOf(picked)
            await FX.all(
                ...cards.map((card, i) =>
                    i === index
                        ? FX.to(scene, card.root, { scale: 1.12, alpha: 0 }, { duration: 380, ease: 'Back.easeIn' })
                        : FX.to(scene, card.root, { scale: 0.86, alpha: 0 }, { duration: 260 }),
                ),
            )
            await FX.to(scene, veil, { alpha: 0 }, { duration: 260 })
            destroy()
        },

        destroy,
    }
}

export type ThemePicker = ReturnType<typeof createThemePicker>
