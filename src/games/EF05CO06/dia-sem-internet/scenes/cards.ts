import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { file } from '../data/files'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Place, SlotDef } from '../types'
import { paintIcon } from './icons'

const fx = (o: unknown) => o as unknown as FxTarget

/** O cartão de vitrine dentro de cada lugar. Ele não recebe toque. */
export const CARD = { w: 150, h: 134, icon: 90, iconDy: -16, nameDy: 46, gap: 172 } as const

export interface Card {
    root: Phaser.GameObjects.Container
    back: Phaser.GameObjects.Graphics
    art: Phaser.GameObjects.GameObject
    name: Phaser.GameObjects.Text
    lock: Phaser.GameObjects.Graphics
    slot: SlotDef
    drift?: Phaser.Tweens.Tween
}

/**
 * O BARALHO — os arquivos em vitrine, e é o mesmo nos dois mundos.
 *
 * Um cartão é a única coisa que a criança lê sobre um arquivo: o símbolo grande
 * e o nome escrito embaixo. É por isso que ele precisa existir em TODO lugar
 * alcançável — foi a lição que tirou as miniaturas dos botões (§15 do
 * PLANEJAMENTO): um símbolo pequeno não diz o próprio nome.
 *
 * O baralho não sabe onde as coisas ficam. Quem sabe é o mundo, que entrega o
 * `anchor` de cada lugar.
 */
export interface Deck {
    mount(slots: SlotDef[]): Promise<void>
    at(place: Place): Card[]
    /** O ponto de uma coisa, em coordenada de MUNDO. */
    point(place: Place): { x: number; y: number }
    /** Apaga e tranca tudo que está num lugar, um cartão de cada vez. */
    lock(place: Place): Promise<void>
    open(place: Place, fileId: string): Promise<Card | undefined>
    deny(place: Place): Promise<void>
    clear(): void
}

export interface DeckOptions {
    anchor(place: Place): { cx: number; cy: number }
    /** Um ponto do mundo convertido para a tela — as faíscas moram na tela. */
    onScreen(x: number, y: number): { x: number; y: number }
    /** Quanto o cartão de cada lugar boia. O que está no céu boia mais. */
    drift(place: Place): number
}

export function createDeck(
    scene: Phaser.Scene,
    root: Phaser.GameObjects.Container,
    options: DeckOptions,
): Deck {
    const cards: Card[] = []
    const locked = new Set<Place>()

    const paintBack = (card: Card, state: 'on' | 'off' | 'done') => {
        const g = card.back
        g.clear()
        const body = state === 'off' ? C.grey : C.creamSoft
        const edge = state === 'done' ? C.green : state === 'off' ? C.greyDeep : C.navy
        g.fillStyle(C.shadow, 0.18)
        g.fillRoundedRect(-CARD.w / 2 + 3, -CARD.h / 2 + 6, CARD.w, CARD.h, 16)
        g.fillStyle(edge, 1)
        g.fillRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 16)
        g.fillStyle(body, 1)
        g.fillRoundedRect(-CARD.w / 2 + 6, -CARD.h / 2 + 6, CARD.w - 12, CARD.h - 12, 11)
    }

    const paintLock = (g: Phaser.GameObjects.Graphics) => {
        g.clear()
        g.fillStyle(C.navyDeep, 0.38)
        g.fillRoundedRect(-CARD.w / 2 + 6, -CARD.h / 2 + 6, CARD.w - 12, CARD.h - 12, 11)
        g.fillStyle(C.navyDeep, 1)
        g.fillRoundedRect(-22, -4, 44, 36, 7)
        g.lineStyle(8, C.navyDeep, 1)
        g.beginPath()
        g.arc(0, -6, 14, Math.PI, 0, false)
        g.strokePath()
        g.fillStyle(C.gold, 1)
        g.fillCircle(0, 12, 6)
    }

    const applyState = (card: Card) => {
        const off = locked.has(card.slot.place)
        paintBack(card, off ? 'off' : 'on')
        card.name.setColor(off ? CSS.grey : CSS.navy)
        ;(card.art as Phaser.GameObjects.Sprite).setAlpha?.(off ? 0.4 : 1)
        card.lock.setAlpha(off ? 1 : 0)
    }

    const build = (slot: SlotDef, index: number, total: number) => {
        const def = file(slot.file)
        const at = options.anchor(slot.place)
        const x = at.cx + (index - (total - 1) / 2) * CARD.gap

        const box = scene.add.container(x, at.cy)

        const back = scene.add.graphics()
        box.add(back)

        let art: Phaser.GameObjects.GameObject
        if (scene.textures.exists('arquivos')) {
            art = scene.add.sprite(0, CARD.iconDy, 'arquivos', def.frame).setDisplaySize(CARD.icon, CARD.icon)
        } else {
            const g = scene.add.graphics().setPosition(0, CARD.iconDy)
            paintIcon(g, def.id, CARD.icon)
            art = g
        }
        box.add(art)

        const name = scene.add
            .text(0, CARD.nameDy, def.name, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.card}px`,
                color: CSS.navy,
            })
            .setOrigin(0.5)
            .setResolution(2)
        if (name.width > CARD.w - 16) name.setScale((CARD.w - 16) / name.width)
        box.add(name)

        const lock = scene.add.graphics().setAlpha(0)
        paintLock(lock)
        box.add(lock)

        root.add(box)

        const card: Card = { root: box, back, art, name, lock, slot }
        applyState(card)
        return card
    }

    const at = (place: Place) => cards.filter(c => c.slot.place === place)

    const clear = () => {
        cards.forEach(c => {
            c.drift?.stop()
            c.root.destroy()
        })
        cards.length = 0
        locked.clear()
    }

    return {
        mount: async slots => {
            clear()

            const groups: Record<string, SlotDef[]> = {}
            slots.forEach(s => {
                groups[s.place] = groups[s.place] ?? []
                groups[s.place].push(s)
            })

            slots.forEach(slot => {
                const group = groups[slot.place]
                cards.push(build(slot, group.indexOf(slot), group.length))
            })

            await Promise.all(
                cards.map(async (card, i) => {
                    card.root.setAlpha(0).setScale(0.6)
                    await FX.wait(scene, i * 90)
                    await FX.to(scene, fx(card.root), { alpha: 1, scale: 1 }, { duration: 300, ease: 'Back.easeOut' })
                }),
            )

            // nada fica parado: cada cartão boia no seu próprio tempo
            cards.forEach((card, i) => {
                card.drift?.stop()
                card.drift = scene.tweens.add({
                    targets: card.root,
                    y: card.root.y - options.drift(card.slot.place),
                    duration: 1700 + i * 210,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            })
        },

        at,

        point: place => {
            const list = at(place)
            if (!list.length) {
                const a = options.anchor(place)
                return { x: a.cx, y: a.cy }
            }
            return { x: list[0].root.x, y: list[0].root.y }
        },

        lock: async place => {
            locked.add(place)
            for (const card of at(place)) {
                applyState(card)
                card.lock.setAlpha(0).setScale(1.8)
                void FX.to(scene, fx(card.lock), { alpha: 1, scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
                await FX.wait(scene, 130)
            }
        },

        open: async (place, fileId) => {
            const card = at(place).find(c => c.slot.file === fileId)
            if (!card) return undefined
            paintBack(card, 'done')
            const spark = options.onScreen(card.root.x, card.root.y)
            void FX.sparks(scene, spark.x, spark.y, { color: C.green, count: 16 })
            await FX.to(scene, fx(card.root), { scale: 1.18 }, { duration: 170, ease: 'Back.easeOut' })
            await FX.to(scene, fx(card.root), { scale: 1 }, { duration: 200 })
            return card
        },

        deny: async place => {
            const list = at(place)
            if (!list.length) return
            await Promise.all(list.map(c => FX.shake(scene, fx(c.root), { amount: 13 })))
        },

        clear,
    }
}
