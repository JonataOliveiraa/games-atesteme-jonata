import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PALETTE } from '../data/layout'
import { C } from '../data/theme'
import { createCard, type Card } from './symbols'
import type { Code, Word } from '../types'

/**
 * A PALETA É O ALFABETO, não uma lista de respostas.
 *
 * Ela mostra todas as palavras do código de destino, sempre as mesmas, em
 * todos os baús do nível. Se ela mostrasse candidatos, a resposta estaria
 * desenhada na tela e o jogo voltaria a ser comparar figuras.
 */
export function createPalette(
    scene: Phaser.Scene,
    onPick: (word: Word) => void,
) {
    const panel = scene.add.graphics().setDepth(DEPTH.panel - 2)

    /** O painel nasce do tamanho do alfabeto: sobra de painel vazio parece erro. */
    const paintPanelFor = (count: number) => {
        const w = (count - 1) * PALETTE.pitch + PALETTE.size + 56
        const x = PALETTE.cx - w / 2
        panel.clear()
        panel.fillStyle(C.ink, 0.16)
        panel.fillRoundedRect(x, PALETTE.panelTop + 6, w, 158, 30)
        panel.fillStyle(C.sand, 0.92)
        panel.fillRoundedRect(x, PALETTE.panelTop, w, 158, 30)
        panel.lineStyle(5, C.sandDeep, 0.8)
        panel.strokeRoundedRect(x, PALETTE.panelTop, w, 158, 30)
    }

    let cards: Array<{ card: Card; zone: Phaser.GameObjects.Zone }> = []
    let enabled = true
    let pulsing: Phaser.Tweens.Tween | null = null

    const clear = () => {
        pulsing?.remove()
        pulsing = null
        cards.forEach(({ card, zone }) => {
            card.destroy()
            zone.destroy()
        })
        cards = []
    }

    return {
        build(words: Word[], code: Code) {
            clear()
            paintPanelFor(words.length)
            cards = words.map((word, i) => {
                const x = PALETTE.cx + (i - (words.length - 1) / 2) * PALETTE.pitch
                const card = createCard(scene, word, code, PALETTE.size)
                card.container.setPosition(x, PALETTE.cy).setDepth(DEPTH.card)

                const zone = scene.add.zone(x, PALETTE.cy, PALETTE.size, PALETTE.size)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (!enabled) return
                    FX.press(scene, card.container)
                    onPick(word)
                })

                FX.popIn(scene, card.container, { delay: i * 80 })
                return { card, zone }
            })
        },

        point(word: Word) {
            const found = cards.find(entry => entry.card.word === word)
            return { x: found?.card.container.x ?? PALETTE.cx, y: PALETTE.cy }
        },

        /** Depois de dois erros no mesmo encaixe, a carta certa pisca. */
        pulse(word: Word) {
            this.stopPulse()
            const found = cards.find(entry => entry.card.word === word)
            if (!found) return
            found.card.setTone('hot')
            pulsing = scene.tweens.add({
                targets: found.card.container,
                scale: 1.1,
                duration: FX.ms(scene, 520),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        stopPulse() {
            if (!pulsing) return
            const target = pulsing.targets[0] as Phaser.GameObjects.Container
            pulsing.remove()
            pulsing = null
            target.setScale(1)
            cards.forEach(({ card }) => card.setTone('idle'))
        },

        setEnabled(value: boolean) {
            enabled = value
            cards.forEach(({ card }) => card.container.setAlpha(value ? 1 : 0.55))
        },

        destroy() {
            clear()
            panel.destroy()
        },
    }
}
