import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { boxOf, DEVICE_NAME, fitScale } from '../data/devices'
import { CARD, DEPTH, STATION } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { isInput } from '../data/rules'
import type { DeviceId } from '../types'
import { createDeviceView, type DeviceView } from './device'

interface Card {
    id: DeviceId
    root: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    ring: Phaser.GameObjects.Graphics
    view: DeviceView
    body: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    artScale: number
}

const ART_X = -CARD.w / 2 + 96

export function createCards(scene: Phaser.Scene, onPick: (index: number) => void) {
    let cards: Card[] = []
    let enabled = false

    const slotX = (index: number) => CARD.cx + (index - 0.5) * CARD.gap

    const paint = (card: Card, pressed: boolean) => {
        const { w, h } = CARD
        const dy = pressed ? 7 : 0
        card.face.clear()
        card.face.fillStyle(C.ink, 0.25)
        card.face.fillRoundedRect(-w / 2 + 5, -h / 2 + 10, w, h, 28)
        card.face.fillStyle(C.ink, 1)
        card.face.fillRoundedRect(-w / 2 - 4, -h / 2 - 4 + dy, w + 8, h + 8, 30)
        card.face.fillStyle(C.plasticDeep, 1)
        card.face.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, 26)
        card.face.fillStyle(C.white, 1)
        card.face.fillRoundedRect(-w / 2 + 6, -h / 2 + 6 + dy, w - 12, h - 18, 22)
        card.body.setY(dy)
    }

    const clear = () => {
        cards.forEach(card => {
            scene.tweens.killTweensOf([card.root, card.ring, card.view.root])
            card.zone.destroy()
            card.root.destroy(true)
        })
        cards = []
    }

    const build = (id: DeviceId, index: number): Card => {
        const x = slotX(index)
        const root = scene.add.container(x, CARD.y).setDepth(DEPTH.card)

        const ring = scene.add.graphics().setAlpha(0)
        ring.lineStyle(10, C.gold, 1)
        ring.strokeRoundedRect(-CARD.w / 2 - 14, -CARD.h / 2 - 14, CARD.w + 28, CARD.h + 28, 36)
        const face = scene.add.graphics()

        const fit = isInput(id) ? STATION.inputBox : STATION.outputBox
        const view = createDeviceView(scene, id, fit)
        const box = boxOf(id)
        const artScale = fitScale(box, CARD.art.w, CARD.art.h) / view.scale
        view.root.setScale(artScale).setPosition(ART_X, ((box.b - box.y) / 2) * view.scale * artScale - 4)

        const name = scene.add
            .text(ART_X + 88, -6, DEVICE_NAME[id], { fontFamily: FONT.black, fontSize: '30px', color: CSS.ink })
            .setOrigin(0, 0.5)
            .setResolution(2)
        const room = CARD.w / 2 - (ART_X + 88) - 20
        if (name.width > room) name.setScale(room / name.width)

        const body = scene.add.container(0, 0, [view.root, name])
        root.add([ring, face, body])

        const zone = scene.add
            .zone(x, CARD.y, CARD.hitW, CARD.hitH)
            .setOrigin(0.5)
            .setDepth(DEPTH.card + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (enabled) onPick(index)
        })

        const card: Card = { id, root, face, ring, view, body, zone, artScale }
        paint(card, false)
        return card
    }

    return {
        async show(ids: DeviceId[]) {
            clear()
            cards = ids.map(build)
            cards.forEach(card => card.root.setScale(0.85).setAlpha(0))
            await FX.all(
                ...cards.map((card, index) =>
                    FX.wait(scene, index * 110).then(() =>
                        FX.to(scene, card.root, { scale: 1, alpha: 1 }, { duration: 300, ease: 'Back.easeOut' }),
                    ),
                ),
            )
        },

        setEnabled(value: boolean, dim = !value) {
            enabled = value
            cards.forEach(card => {
                if (card.zone.input) card.zone.input.enabled = value
                card.root.setAlpha(dim ? 0.72 : 1)
            })
        },

        press(index: number) {
            const card = cards[index]
            if (!card) return
            paint(card, true)
            void FX.wait(scene, 140).then(() => card.root.active && paint(card, false))
        },

        artOf(index: number) {
            const card = cards[index]
            const view = card.view.root
            return {
                x: card.root.x + view.x,
                y: card.root.y + view.y - ((boxOf(card.id).b - boxOf(card.id).y) / 2) * card.view.scale * card.artScale,
                scale: card.artScale,
            }
        },

        take(index: number, taken: boolean) {
            const card = cards[index]
            if (!card) return
            card.view.root.setAlpha(taken ? 0.18 : 1)
        },

        hint(index: number) {
            const card = cards[index]
            if (!card) return
            scene.tweens.killTweensOf(card.ring)
            card.ring.setAlpha(0)
            scene.tweens.add({
                targets: card.ring,
                alpha: 1,
                duration: FX.ms(scene, 520),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        clearHints() {
            cards.forEach(card => {
                scene.tweens.killTweensOf(card.ring)
                card.ring.setAlpha(0)
            })
        },

        bounds() {
            return {
                x: CARD.cx,
                y: CARD.y,
                w: CARD.gap + CARD.w + 50,
                h: CARD.h + 44,
            }
        },

        async hide() {
            await FX.all(...cards.map(card => FX.to(scene, card.root, { alpha: 0, scale: 0.9 }, { duration: 200 })))
            clear()
        },

        clear,

        destroy: clear,
    }
}

export type Cards = ReturnType<typeof createCards>
