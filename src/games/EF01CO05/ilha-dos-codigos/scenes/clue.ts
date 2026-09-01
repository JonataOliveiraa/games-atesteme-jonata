import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CHEST, CLUE, DEPTH, LOCK, bandWidth, rowX } from '../data/layout'
import { C } from '../data/theme'
import { createCard, type Card } from './symbols'
import type { Code, Word } from '../types'

const CHEST_SHEET = 'bau'
const LINK_COLOR = { idle: C.creamEdge, ok: C.ok, wrong: C.bad }

/**
 * O que o baú DIZ, e o baú que diz. Tocar nele repete a mensagem — de graça,
 * sempre: reouvir não é tentativa.
 */
export function createClue(scene: Phaser.Scene, onReplay: () => void) {
    const chest = scene.add.sprite(CHEST.x, CHEST.baseY, CHEST_SHEET, 0)
        .setOrigin(0.5, 0.95)
        .setDepth(DEPTH.chest)
    if (scene.textures.exists(CHEST_SHEET)) {
        chest.setDisplaySize(CHEST.w, CHEST.w * (250 / 300))
    } else {
        chest.setVisible(false)
    }

    const shadow = scene.add.ellipse(CHEST.x, CHEST.baseY + 10, CHEST.w * 0.8, 26, C.ink, 0.16)
        .setDepth(DEPTH.chest - 1)

    const glow = scene.add.graphics().setDepth(DEPTH.chest - 1).setAlpha(0)
    glow.fillStyle(C.warn, 0.5)
    glow.fillCircle(CHEST.x, CHEST.baseY - CHEST.w * 0.28, CHEST.w * 0.62)

    const links = scene.add.graphics().setDepth(DEPTH.connector)
    const linkTones: Array<'idle' | 'ok' | 'wrong'> = []

    let cards: Card[] = []
    let enabled = true

    chest.setInteractive({ useHandCursor: true })
    chest.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, chest)
        onReplay()
    })

    /**
     * A COLUNA É O ARGUMENTO DO JOGO.
     *
     * Uma linha fina entre as duas fileiras não bastava: elas continuavam
     * lendo como duas listas soltas. A moldura envolve a pista e o encaixe da
     * mesma posição, e é ela que fica verde no acerto e vermelha na trava —
     * assim o "isto aqui é aquilo ali" não depende de ninguém explicar.
     */
    const drawLinks = () => {
        links.clear()
        const top = CLUE.cy - CLUE.size / 2 - 12
        const bottom = LOCK.cy + LOCK.size / 2 + 12
        const w = bandWidth(cards.length)

        cards.forEach((_, i) => {
            const x = rowX(i, cards.length)
            const tone = linkTones[i] ?? 'idle'
            links.fillStyle(C.white, tone === 'idle' ? 0.26 : 0.42)
            links.fillRoundedRect(x - w / 2, top, w, bottom - top, 30)
            links.lineStyle(tone === 'idle' ? 5 : 10, LINK_COLOR[tone], tone === 'idle' ? 0.7 : 1)
            links.strokeRoundedRect(x - w / 2, top, w, bottom - top, 30)
        })
    }

    return {
        show(message: Word[], code: Code) {
            cards.forEach(card => card.destroy())
            linkTones.length = 0
            cards = message.map((word, i) => {
                const card = createCard(scene, word, code, CLUE.size)
                card.container.setPosition(rowX(i, message.length), CLUE.cy)
                card.container.setDepth(DEPTH.card)
                linkTones[i] = 'idle'
                return card
            })
            drawLinks()
            cards.forEach((card, i) => FX.popIn(scene, card.container, { delay: i * 90 }))
        },

        chestPoint() {
            return { x: CHEST.x, y: CHEST.baseY - CHEST.w * 0.3 }
        },

        link(i: number, tone: 'idle' | 'ok' | 'wrong') {
            linkTones[i] = tone
            drawLinks()
        },

        linkAll(tone: 'idle' | 'ok' | 'wrong') {
            cards.forEach((_, i) => { linkTones[i] = tone })
            drawLinks()
        },

        /** A mensagem inteira, um símbolo de cada vez. */
        async say(onWord: (word: Word, index: number) => void) {
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i]
                card.setTone('hot')
                onWord(card.word, i)
                FX.popIn(scene, card.container, { from: 1.16, duration: 240 })
                await FX.wait(scene, 460)
                card.setTone('idle')
                await FX.wait(scene, 90)
            }
        },

        pulse(i: number) {
            const card = cards[i]
            if (!card) return
            card.setTone('hot')
            FX.popIn(scene, card.container, { from: 1.2, duration: 300 })
            scene.time.delayedCall(FX.ms(scene, 900), () => card.setTone('idle'))
        },

        setEnabled(value: boolean) {
            enabled = value
        },

        shakeChest() {
            return FX.shake(scene, chest, { amount: 12, times: 3 })
        },

        async open() {
            chest.setFrame(1)
            await FX.wait(scene, 180)
            chest.setFrame(2)
            scene.tweens.add({
                targets: glow,
                alpha: { from: 0.9, to: 0 },
                duration: FX.ms(scene, 900),
                ease: 'Cubic.easeOut',
            })
            await FX.popIn(scene, chest, { from: 1.12, duration: 320 })
        },

        close() {
            chest.setFrame(0)
            glow.setAlpha(0)
        },

        destroy() {
            cards.forEach(card => card.destroy())
            links.destroy()
            glow.destroy()
            shadow.destroy()
            chest.destroy()
        },
    }
}
