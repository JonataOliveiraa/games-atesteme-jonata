import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, RESULT } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { resultOf } from '../data/results'
import { paintHeart } from './heart'

interface Card {
    id: string
    root: Phaser.GameObjects.Container
}

const scaleAt = (slot: number) => (slot === 0 ? 1 : RESULT.small)

export const slotPos = (slot: number) => ({
    x: RESULT.xs[slot],
    y: RESULT.bottom - (RESULT.h * scaleAt(slot)) / 2,
})

function paintSlots(g: Phaser.GameObjects.Graphics) {
    const { w, h } = RESULT
    const first = slotPos(0)

    g.fillStyle(C.gold, 0.3)
    g.fillRoundedRect(first.x - w / 2 - 18, first.y - h / 2 - 18, w + 36, h + 36, 32)
    g.lineStyle(7, C.gold, 1)
    g.strokeRoundedRect(first.x - w / 2 - 10, first.y - h / 2 - 10, w + 20, h + 20, 26)

    for (let slot = 1; slot < RESULT.xs.length; slot++) {
        const p = slotPos(slot)
        const sw = w * RESULT.small
        const sh = h * RESULT.small
        g.fillStyle(C.ink, 0.1)
        g.fillRoundedRect(p.x - sw / 2 - 4, p.y - sh / 2 - 4, sw + 8, sh + 8, 20)
    }

    const ax = RESULT.arrowX
    const ay = first.y
    g.fillStyle(C.goldDeep, 1)
    g.fillTriangle(ax + 18, ay - 30, ax + 18, ay + 30, ax - 18, ay)
    g.fillStyle(C.gold, 1)
    g.fillTriangle(ax + 12, ay - 20, ax + 12, ay + 20, ax - 10, ay)
}

function buildMedal(scene: Phaser.Scene) {
    const { w, h } = RESULT
    const first = slotPos(0)
    const medal = scene.add
        .container(first.x - w / 2 + 4, first.y - h / 2 + 4)
        .setDepth(DEPTH.medal)
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.25)
    g.fillCircle(2, 4, 30)
    g.fillStyle(C.goldDeep, 1)
    g.fillCircle(0, 0, 30)
    g.fillStyle(C.gold, 1)
    g.fillCircle(0, 0, 25)
    g.fillStyle(C.white, 0.35)
    g.fillEllipse(-6, -10, 26, 10)
    const label = scene.add
        .text(1, 1, '1º', { fontFamily: FONT.black, fontSize: '25px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    medal.add([g, label])
    return medal
}

function paintPlay(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(C.ink, 0.72)
    g.fillCircle(x, y, 27)
    g.fillStyle(C.white, 1)
    g.fillTriangle(x - 8, y - 13, x - 8, y + 13, x + 14, y)
}

function paintTag(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(C.ink, 0.25)
    g.fillCircle(x + 2, y + 5, 31)
    g.fillStyle(C.heartDeep, 1)
    g.fillCircle(x, y, 31)
    g.fillStyle(C.white, 1)
    g.fillCircle(x, y, 26)
    paintHeart(g, x, y - 2, 34, C.heart)
}

export function createBoard(scene: Phaser.Scene) {
    const slots = scene.add.graphics().setDepth(DEPTH.slot)
    paintSlots(slots)
    const medal = buildMedal(scene)

    const root = scene.add.container(0, 0).setDepth(DEPTH.card)
    let cards: Card[] = []
    let targetId = ''

    const makeCard = (id: string, slot: number): Card => {
        const def = resultOf(id)
        const pos = slotPos(slot)
        const container = scene.add.container(pos.x, pos.y).setScale(scaleAt(slot))
        const { w, h, art } = RESULT

        const face = scene.add.graphics()
        face.fillStyle(C.ink, 0.25)
        face.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 22)
        face.fillStyle(C.woodDark, 1)
        face.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        face.fillStyle(C.parchment, 1)
        face.fillRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 17)
        container.add(face)

        if (scene.textures.exists('resultados')) {
            container.add(scene.add.image(0, 0, 'resultados', def.frame).setDisplaySize(art, art))
        } else {
            const g = scene.add.graphics()
            g.fillStyle(C.parchmentDeep, 1)
            g.fillRoundedRect(-art / 2, -art / 2, art, art, 16)
            container.add(g)
            container.add(
                scene.add
                    .text(0, 0, id, { fontFamily: FONT.body, fontSize: '18px', color: CSS.inkSoft })
                    .setOrigin(0.5),
            )
        }

        const marks = scene.add.graphics()
        if (def.type === 'video') paintPlay(marks, art / 2 - 16, art / 2 - 18)
        if (id === targetId) paintTag(marks, w / 2 - 8, -h / 2 + 8)
        container.add(marks)

        root.add(container)
        return { id, root: container }
    }

    const cardOf = (id: string) => cards.find(card => card.id === id)

    const clear = () => {
        cards.forEach(card => {
            scene.tweens.killTweensOf(card.root)
            card.root.destroy(true)
        })
        cards = []
    }

    return {
        async show(ids: string[], target: string) {
            clear()
            targetId = target
            cards = ids.map((id, slot) => {
                const card = makeCard(id, slot)
                card.root.setAlpha(0).setScale(scaleAt(slot) * 0.8)
                return card
            })
            await FX.all(
                ...cards.map((card, slot) =>
                    FX.wait(scene, slot * 110).then(() =>
                        FX.to(
                            scene,
                            card.root,
                            { scale: scaleAt(slot), alpha: 1 },
                            { duration: 320, ease: 'Back.easeOut' },
                        ),
                    ),
                ),
            )
        },

        async reorder(ids: string[]) {
            const leaving = cards.filter(card => !ids.includes(card.id))
            await FX.all(
                ...leaving.map(card => FX.to(scene, card.root, { alpha: 0, scale: 0.5 }, { duration: 240 })),
            )
            leaving.forEach(card => card.root.destroy(true))
            cards = cards.filter(card => !leaving.includes(card))

            ids.forEach((id, slot) => {
                if (cardOf(id)) return
                const card = makeCard(id, slot)
                card.root.setAlpha(0).setScale(scaleAt(slot) * 0.8)
                cards.push(card)
            })

            const leader = cardOf(ids[0])
            if (leader) root.bringToTop(leader.root)

            await FX.all(
                ...ids.map((id, slot) => {
                    const card = cardOf(id)!
                    const p = slotPos(slot)
                    return FX.to(
                        scene,
                        card.root,
                        { x: p.x, y: p.y, scale: scaleAt(slot), alpha: 1 },
                        { duration: 480, ease: 'Back.easeOut' },
                    )
                }),
            )
        },

        posOf(id: string) {
            const card = cardOf(id)
            return { x: card?.root.x ?? RESULT.xs[0], y: card?.root.y ?? slotPos(0).y }
        },

        firstBounds() {
            const p = slotPos(0)
            return { x: p.x, y: p.y, w: RESULT.w + 40, h: RESULT.h + 40 }
        },

        glow(id: string) {
            const card = cardOf(id)
            if (!card) return
            void FX.ping(scene, card.root.x, card.root.y, C.ok, { radius: 150 })
        },

        async deliver(id: string, to: { x: number; y: number }) {
            const card = cardOf(id)
            if (!card) return
            card.root.setDepth(DEPTH.fx)
            root.bringToTop(card.root)
            void FX.ping(scene, card.root.x, card.root.y, C.gold, { radius: 170 })
            void FX.sparks(scene, card.root.x, card.root.y, { color: C.gold, count: 22, spread: 200 })
            await FX.to(scene, card.root, { scale: 1.08 }, { duration: 240, ease: 'Back.easeOut' })
            await FX.arcTo(scene, card.root, to, { height: 150, duration: 620 })
            await FX.to(scene, card.root, { scale: 0.2, alpha: 0 }, { duration: 240 })
        },

        clear,

        destroy() {
            clear()
            root.destroy(true)
            medal.destroy(true)
            slots.destroy()
        },
    }
}

export type Board = ReturnType<typeof createBoard>
