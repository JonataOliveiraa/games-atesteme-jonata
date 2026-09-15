import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARDS, DEPTH } from '../data/layout'
import { label } from '../data/rules'
import { C, CSS, FONT } from '../data/theme'
import type { Cell } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS TRÊS CARTÕES DE COORDENADA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Só o nível 2 usa. A janela é apontada na fachada e a criança escolhe o nome
 * dela — o caminho inverso do nível 1, e o que prova que a convenção foi
 * entendida: achar uma coordenada dada e escrever a coordenada de uma posição
 * são duas habilidades diferentes.
 *
 * ── OS CARTÕES NÃO TÊM COR DE ESTADO ─────────────────────────────────────
 *
 * Todos iguais, sempre. Um cartão mais claro, maior ou destacado viraria dica
 * involuntária, e a escolha deixaria de ser leitura.
 */

export interface CardsOptions {
    onPick: (cell: Cell, index: number) => void
}

interface Card {
    cell: Cell
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    text: Phaser.GameObjects.Text
    zone: Phaser.GameObjects.Zone
    pulse?: Phaser.Tweens.Tween
}

function paintCard(g: Phaser.GameObjects.Graphics, pressed: boolean) {
    const { w, h } = CARDS
    const dy = pressed ? 5 : 0
    g.clear()
    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 9 + dy, w, h, 20)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4 + dy, w + 8, h + 8, 22)
    g.fillStyle(C.wallDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, 18)
    g.fillStyle(C.wall, 1)
    g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h - 8, 18)
    g.fillStyle(C.white, 0.6)
    g.fillRoundedRect(-w / 2 + 14, -h / 2 + 11 + dy, w - 28, 10, 5)
}

export function createCards(scene: Phaser.Scene, options: CardsOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)
    let cards: Card[] = []
    let enabled = false

    const clear = () => {
        cards.forEach(card => {
            card.pulse?.remove()
            scene.tweens.killTweensOf(card.body)
            card.zone.destroy()
            card.body.destroy(true)
        })
        cards = []
    }

    return {
        async show(options3: Cell[]) {
            clear()
            cards = options3.slice(0, 3).map((cell, i) => {
                const x = CARDS.xs[i] + CARDS.w / 2
                const y = CARDS.y + CARDS.h / 2
                const body = scene.add.container(x, y)
                const face = scene.add.graphics()
                paintCard(face, false)
                body.add(face)

                const text = scene.add
                    .text(0, -2, label(cell), {
                        fontFamily: FONT.black,
                        fontSize: '30px',
                        color: CSS.ink,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                body.add(text)
                root.add(body)

                const zone = scene.add
                    .zone(x, y, CARDS.w + 14, CARDS.h + 14)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.panel + 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (enabled) options.onPick(cell, i)
                })

                return { cell, body, face, text, zone }
            })

            cards.forEach(c => c.body.setScale(0.7).setAlpha(0))
            await FX.all(
                ...cards.map((card, i) =>
                    FX.wait(scene, i * 90).then(() =>
                        FX.to(scene, card.body, { scale: 1, alpha: 1 }, { duration: 300, ease: 'Back.easeOut' }),
                    ),
                ),
            )
        },

        press(index: number) {
            const card = cards[index]
            if (!card) return
            paintCard(card.face, true)
            card.text.setY(3)
            void FX.wait(scene, 150).then(() => {
                if (!card.body.active) return
                paintCard(card.face, false)
                card.text.setY(-2)
            })
        },

        async shake(index: number) {
            const card = cards[index]
            if (!card) return
            await FX.shake(scene, card.body, { amount: 10, times: 3 })
        },

        /** Marca a opção certa — só depois de dois erros, como manda o §10. */
        pulse(cell: Cell) {
            const card = cards.find(c => c.cell.row === cell.row && c.cell.col === cell.col)
            if (!card) return
            card.pulse?.remove()
            card.pulse = scene.tweens.add({
                targets: card.body,
                scale: 1.07,
                duration: FX.ms(scene, 560),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        async hide() {
            if (!cards.length) return
            await FX.all(
                ...cards.map(card => FX.to(scene, card.body, { alpha: 0, scale: 0.8 }, { duration: 220 })),
            )
            clear()
        },

        setEnabled(value: boolean) {
            enabled = value
            cards.forEach(card => {
                if (card.zone.input) card.zone.input.enabled = value
            })
        },

        bounds() {
            const left = CARDS.xs[0]
            const right = CARDS.xs[2] + CARDS.w
            return {
                x: (left + right) / 2,
                y: CARDS.y + CARDS.h / 2,
                w: right - left + 36,
                h: CARDS.h + 36,
            }
        },

        clear,

        destroy() {
            clear()
            root.destroy(true)
        },
    }
}

export type Cards = ReturnType<typeof createCards>
