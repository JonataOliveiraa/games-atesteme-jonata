import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { A, C, CSS, FONT, OP_WORD, SIZE, WORD, WORD_SHORT } from '../data/theme'
import { DEPTH, HAND, TERM } from '../data/layout'
import type { CardDef, Term } from '../types'
import {
    createIcon,
    drawCheck,
    drawCross,
    drawNoTag,
    drawOperator,
    drawTermBox,
} from './art'

interface Slot {
    holder: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    card: CardDef
    home: { x: number; y: number }
    gone: boolean
}

export interface Hand {
    deal(cards: CardDef[]): Promise<void>
    setEnabled(on: boolean): void
    lift(index: number): Promise<void>
    drop(index: number): Promise<void>
    stamp(index: number, ok: boolean): Promise<void>
    /** A carta verdadeira sai da mão e vai para o campo do cartaz. */
    flyTo(index: number, to: { x: number; y: number }): Promise<void>
    /** Depois de uma carta falsa, a certa respira. Mostra onde olhar. */
    breatheAt(index: number): void
    calm(): void
    clear(): Promise<void>
    destroy(): void
}

export function createHand(scene: Phaser.Scene, opts: { onPick: (index: number) => void }): Hand {
    const slots: Slot[] = []
    let enabled = false

    const paintPaper = (g: Phaser.GameObjects.Graphics) => {
        const { cardW: w, cardH: h } = HAND
        g.clear()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-w / 2 + 5, -h / 2 + 7, w, h, 20)
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.lineStyle(6, C.line, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
    }

    /** Encolhe por largura MEDIDA, nunca por chute. */
    const fit = (label: Phaser.GameObjects.Text, max: number, from: number, min: number) => {
        let px = from
        while (label.width > max && px > min) {
            px -= 1
            label.setFontSize(px)
        }
    }

    /* ── a carta de UM termo: ícone grande e a frase inteira ── */
    const faceOne = (card: CardDef): Phaser.GameObjects.GameObject[] => {
        const icon = createIcon(scene, card.term.value, 92, {
            negated: card.term.negated,
        }).setPosition(0, -36)

        const style = { fontFamily: FONT.black, fontSize: `${SIZE.card}px`, color: CSS.ink }
        const pieces: Phaser.GameObjects.Text[] = []
        if (card.term.negated) {
            pieces.push(scene.add.text(0, 0, 'NÃO', { ...style, color: CSS.no }).setOrigin(0.5).setResolution(2))
        }
        pieces.push(scene.add.text(0, 0, WORD[card.term.value], style).setOrigin(0.5).setResolution(2))

        const gap = 12
        let total = pieces.reduce((n, p) => n + p.width, 0) + gap * (pieces.length - 1)
        const max = HAND.cardW - 44
        if (total > max) {
            const px = Math.max(SIZE.cardMin, Math.floor(SIZE.card * (max / total)))
            pieces.forEach(p => p.setFontSize(px))
            total = pieces.reduce((n, p) => n + p.width, 0) + gap * (pieces.length - 1)
        }

        let x = -total / 2
        pieces.forEach(p => {
            p.setPosition(x + p.width / 2, 50)
            x += p.width + gap
        })

        return [icon, ...pieces]
    }

    /* ── a moldura de um termo, dentro da carta de dois ── */
    const termBox = (term: Term, cx: number): Phaser.GameObjects.Container => {
        const frame = scene.add.graphics()
        drawTermBox(frame, TERM.boxW, TERM.boxH)

        const icon = createIcon(scene, term.value, TERM.iconSize, { negated: term.negated })
            .setPosition(0, TERM.iconY)

        const word = scene.add
            .text(0, TERM.wordY, WORD_SHORT[term.value], {
                fontFamily: FONT.black,
                fontSize: `${SIZE.term}px`,
                color: CSS.ink,
            })
            .setOrigin(0.5)
            .setResolution(2)
        fit(word, TERM.boxW - 16, SIZE.term, SIZE.termMin)

        const parts: Phaser.GameObjects.GameObject[] = [frame, icon, word]

        if (term.negated) {
            const tagText = scene.add
                .text(0, TERM.tagY, 'NÃO', {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.tag}px`,
                    color: CSS.white,
                })
                .setOrigin(0.5)
                .setResolution(2)
            const tag = scene.add.graphics().setPosition(0, TERM.tagY)
            drawNoTag(tag, tagText.width + 24, SIZE.tag + 12)
            parts.splice(2, 0, tag, tagText)
        }

        return scene.add.container(cx, 0, parts)
    }

    /* ── a carta de DOIS termos: uma fileira, nunca uma frase corrida ── */
    const faceTwo = (card: CardDef): Phaser.GameObjects.GameObject[] => {
        const span = TERM.boxW * 2 + TERM.gap * 2 + TERM.opW
        const side = span / 2 - TERM.boxW / 2

        const left = termBox(card.term, -side)
        const right = termBox(card.right!, side)

        const pill = scene.add.graphics().setPosition(0, TERM.iconY)
        drawOperator(pill, card.op!, TERM.opW, TERM.opH)
        const opText = scene.add
            .text(0, TERM.iconY, OP_WORD[card.op!], {
                fontFamily: FONT.black,
                fontSize: `${SIZE.op}px`,
                color: card.op === 'e' ? CSS.white : CSS.ink,
            })
            .setOrigin(0.5)
            .setResolution(2)

        return [left, right, pill, opText]
    }

    const removeAll = () => {
        slots.forEach(s => {
            FX.kill(scene, s.holder)
            s.zone.destroy()
            s.holder.destroy()
        })
        slots.length = 0
    }

    return {
        async deal(cards) {
            removeAll()

            cards.forEach((card, i) => {
                const home = { x: HAND.xs[i], y: HAND.cy }
                const paper = scene.add.graphics()
                paintPaper(paper)

                const face = card.op && card.right ? faceTwo(card) : faceOne(card)
                const holder = scene.add
                    .container(home.x, home.y, [paper, ...face])
                    .setDepth(DEPTH.hand)

                /**
                 * A zona é um objeto de CENA, em coordenada absoluta, e não
                 * acompanha tween nenhum. Como a carta cresce no gesto, é o
                 * jeito certo — e o interruptor é `input.enabled`, NUNCA
                 * `setVisible(false)`, que mataria o toque.
                 */
                const zone = scene.add
                    .zone(home.x, home.y, HAND.cardW, HAND.cardH)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.hand + 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (!enabled) return
                    opts.onPick(i)
                })
                zone.input!.enabled = false

                slots.push({ holder, zone, card, home, gone: false })
            })

            await FX.stagger(
                scene,
                slots.map(s => s.holder),
                holder => {
                    holder.setAlpha(0).setY(HAND.cy + 150)
                    return FX.to(scene, holder, { alpha: 1, y: HAND.cy }, { duration: 340, ease: 'Back.easeOut' })
                },
                90,
            )
        },

        setEnabled(on) {
            enabled = on
            slots.forEach(s => {
                if (s.zone.input) s.zone.input.enabled = on && !s.gone
            })
        },

        async lift(index) {
            const s = slots[index]
            if (!s) return
            FX.kill(scene, s.holder)
            s.holder.setDepth(DEPTH.lifted)
            const others = slots.filter((_, i) => i !== index && !slots[i].gone)
            void FX.to(scene, others.map(o => o.holder), { alpha: A.dimmed }, { duration: 200 })
            await FX.to(
                scene,
                s.holder,
                { y: s.home.y - HAND.liftY, scale: HAND.liftScale },
                { duration: 260, ease: 'Back.easeOut' },
            )
        },

        async drop(index) {
            const s = slots[index]
            if (!s) return
            const others = slots.filter((_, i) => i !== index && !slots[i].gone)
            await FX.all(
                FX.to(scene, s.holder, { y: s.home.y, scale: 1 }, { duration: 280 }),
                FX.to(scene, others.map(o => o.holder), { alpha: 1 }, { duration: 220 }),
            )
            s.holder.setDepth(DEPTH.hand)
        },

        async stamp(index, ok) {
            const s = slots[index]
            if (!s) return
            const g = scene.add.graphics()
            if (ok) drawCheck(g, 118)
            else drawCross(g, 118)
            const mark = scene.add
                .container(s.holder.x + HAND.cardW * 0.34, s.holder.y - HAND.cardH * 0.3, [g])
                .setDepth(DEPTH.lifted + 1)
                .setScale(0.2)
                .setAngle(-16)

            await FX.to(scene, mark, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
            if (!ok) await FX.shake(scene, s.holder, { amount: 12 })
            await FX.wait(scene, ok ? 240 : 520)
            await FX.to(scene, mark, { alpha: 0, scale: 1.3 }, { duration: 200 })
            mark.destroy()
        },

        async flyTo(index, to) {
            const s = slots[index]
            if (!s) return
            s.gone = true
            if (s.zone.input) s.zone.input.enabled = false
            await FX.arcTo(scene, s.holder, to, { height: 150, duration: 520 })
            await FX.to(scene, s.holder, { alpha: 0, scale: 0.4 }, { duration: 180 })
            s.holder.setVisible(false)
            const others = slots.filter((_, i) => i !== index && !slots[i].gone)
            await FX.to(scene, others.map(o => o.holder), { alpha: 1 }, { duration: 200 })
        },

        breatheAt(index) {
            const s = slots[index]
            if (!s || s.gone) return
            FX.breathe(scene, s.holder, { grow: 1.06, duration: 900 })
        },

        calm() {
            slots.forEach(s => {
                if (s.gone) return
                FX.kill(scene, s.holder)
                s.holder.setScale(1).setAlpha(1).setPosition(s.home.x, s.home.y)
            })
        },

        async clear() {
            const alive = slots.filter(s => !s.gone)
            if (!alive.length) {
                removeAll()
                return
            }
            await FX.to(scene, alive.map(s => s.holder), { alpha: 0, y: HAND.cy + 140 }, { duration: 260 })
            removeAll()
        },

        destroy() {
            removeAll()
        },
    }
}
