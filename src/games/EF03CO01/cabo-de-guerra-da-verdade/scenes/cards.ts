import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { CARD, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Token } from '../types'

interface CardParts {
    root: Phaser.GameObjects.Container
    art: Phaser.GameObjects.Graphics
    label: Phaser.GameObjects.Text
    token: Token
}

function paint(g: Phaser.GameObjects.Graphics, token: Token, lit: boolean) {
    const base = token === 'negated' ? C.deny : C.child
    const dark = token === 'negated' ? C.denyDark : C.childDark
    const w = CARD.w
    const h = CARD.h

    g.clear()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-w / 2, -h / 2 + 9, w, h, 26)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
    g.fillStyle(dark, 1)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 21)
    g.fillStyle(base, 1)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 24, 21)
    g.fillStyle(C.white, lit ? 0.5 : 0.28)
    g.fillRoundedRect(-w / 2 + 22, -h / 2 + 16, w - 44, 22, 11)
    if (!lit) return
    g.lineStyle(6, C.gold, 1)
    g.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 30)
}

export interface CardsOptions {
    onPick: (token: Token) => void
}

export function createCards(scene: Phaser.Scene, options: CardsOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.cards)
    const cards: CardParts[] = []

    const build = (token: Token, x: number) => {
        const art = scene.add.graphics()
        paint(art, token, false)

        const label = scene.add.text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '46px',
            color: CSS.white,
        }).setOrigin(0.5).setResolution(2)
        label.setStroke(CSS.ink, 7)

        const card = scene.add.container(x, CARD.cy, [art, label])
        card.setSize(CARD.w, CARD.h)
        card.setInteractive({ useHandCursor: true })
        root.add(card)

        const parts: CardParts = { root: card, art, label, token }
        cards.push(parts)

        card.on('pointerdown', () => {
            if (!card.input?.enabled) return
            void FX.press(scene, card)
            options.onPick(token)
        })
    }

    build('plain', CARD.leftX)
    build('negated', CARD.rightX)

    let hintTween: Phaser.Tweens.Tween | null = null

    return {
        get container() {
            return root
        },

        setLabels(labels: Record<Token, string>) {
            cards.forEach(card => card.label.setText(labels[card.token]))
        },

        setEnabled(on: boolean) {
            cards.forEach(card => {
                if (card.root.input) card.root.input.enabled = on
            })
        },

        async enter() {
            root.setAlpha(0)
            await FX.stagger(scene, cards.map(card => card.root), card => {
                card.setScale(0.7)
                return FX.to(scene, card, { scale: 1 }, { duration: 280, ease: Ease.back(2) })
            }, 90)
            root.setAlpha(1)
        },

        hint(token: Token) {
            const card = cards.find(one => one.token === token)
            if (!card) return
            paint(card.art, card.token, true)
            hintTween?.stop()
            hintTween = scene.tweens.add({
                targets: card.root,
                scale: 1.06,
                duration: FX.ms(scene, 420),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        clearHint() {
            hintTween?.stop()
            hintTween = null
            cards.forEach(card => {
                paint(card.art, card.token, false)
                card.root.setScale(1)
            })
        },

        pointOf(token: Token) {
            const card = cards.find(one => one.token === token)
            return { x: card?.root.x ?? CARD.leftX, y: CARD.cy }
        },

        bounds() {
            return {
                x: (CARD.leftX + CARD.rightX) / 2,
                y: CARD.cy,
                w: CARD.rightX - CARD.leftX + CARD.w + 30,
                h: CARD.h + 30,
            }
        },

        destroy() {
            hintTween?.stop()
            cards.forEach(card => scene.tweens.killTweensOf(card.root))
            root.destroy(true)
        },
    }
}

export type Cards = ReturnType<typeof createCards>
