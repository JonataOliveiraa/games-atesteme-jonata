import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, REQUEST } from '../data/layout'
import { wantedMoves } from '../data/rules'
import { C, CSS, FONT, MOVE_NAME } from '../data/theme'
import { drawMove } from './pictogram'
import type { Move, PhaseDef } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O PEDIDO MOSTRA O RESULTADO, NUNCA O ALGORITMO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A tira traz os movimentos que devem SAIR, um por um, sem moldura, sem
 * número e sem `REPITA`. Quantas vezes repetir é coisa que a criança conta
 * nos pictogramas e escreve na ficha — se o pedido já viesse agrupado em
 * blocos, ele responderia a pergunta que o jogo faz.
 *
 * A separação entre refrões aparece DEPOIS da ação final de cada um, e só
 * quando o refrão tem mais de um movimento. Ela mostra o agrupamento sem
 * entregar as molduras: é a barra vertical do §4, não um comando.
 *
 * ── A CAIXA DA ESQUERDA TEM DOIS EMPREGOS ────────────────────────────────
 *
 * Enquanto a criança monta, ela traz a frase do pedido. Na TRAVA, ela vira a
 * comparação lado a lado que o §4 pede — o que o pedido queria e o que saiu.
 * São dois usos do mesmo canto porque a frase não é necessária no instante em
 * que a dança parou, e porque a comparação precisa ficar perto da tira.
 */

const PAD = 18
const ASK_W = 336
const CARD_H = 84
const CARD_MAX = 116
const CARD_GAP = 10
const BREAK = 22

interface Card {
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    ring: Phaser.GameObjects.Graphics
    move: Move
    round: number
}

function paintCard(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.clear()
    g.fillStyle(C.ink, 0.2)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, 14)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 16)
    g.fillStyle(C.sheetDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 13)
    g.fillStyle(C.sheet, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 6, 13)
}

export function createRequest(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)

    const band = scene.add.graphics()
    band.fillStyle(C.ink, 0.3)
    band.fillRoundedRect(REQUEST.x + 4, REQUEST.y + 7, REQUEST.w, REQUEST.h, 24)
    band.fillStyle(C.ink, 1)
    band.fillRoundedRect(REQUEST.x - 4, REQUEST.y - 4, REQUEST.w + 8, REQUEST.h + 8, 26)
    band.fillStyle(C.curtain, 1)
    band.fillRoundedRect(REQUEST.x, REQUEST.y, REQUEST.w, REQUEST.h, 22)
    band.fillStyle(C.white, 0.1)
    band.fillRoundedRect(REQUEST.x + 16, REQUEST.y + 9, REQUEST.w - 32, 12, 6)
    root.add(band)

    const ask = scene.add
        .text(REQUEST.x + PAD + 6, REQUEST.y + REQUEST.h / 2, '', {
            fontFamily: FONT.body,
            fontStyle: 'bold',
            fontSize: '23px',
            color: CSS.white,
            wordWrap: { width: ASK_W - 24 },
            lineSpacing: 3,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    root.add(ask)

    /** A comparação da TRAVA, escondida enquanto a criança monta. */
    const compare = scene.add.container(REQUEST.x + PAD + ASK_W / 2 - 10, REQUEST.y + REQUEST.h / 2).setVisible(false)
    root.add(compare)

    const strip = scene.add.container(0, 0)
    root.add(strip)

    let cards: Card[] = []
    let badges: Phaser.GameObjects.Graphics[] = []
    let cardW = CARD_MAX
    const seals = scene.add.graphics()
    root.add(seals)

    const dropBadges = () => {
        badges.forEach(b => {
            scene.tweens.killTweensOf(b)
            b.destroy()
        })
        badges = []
    }

    const clear = () => {
        cards.forEach(card => {
            scene.tweens.killTweensOf(card.body)
            card.body.destroy(true)
        })
        cards = []
        dropBadges()
        seals.clear()
    }

    /**
     * A frase cabe na faixa, custe o que custar.
     *
     * A altura do pedido é fixa e a frase muda a cada fase; uma linha a mais
     * do que o previsto cortava o texto em cima e embaixo. Em vez de contar
     * caracteres no arquivo de dados, mede-se e encolhe-se até caber.
     */
    const setAsk = (text: string) => {
        const room = REQUEST.h - 14
        for (let size = 23; size >= 17; size -= 2) {
            ask.setStyle({ fontSize: `${size}px`, wordWrap: { width: ASK_W - 24 } })
            ask.setText(text)
            if (ask.height <= room) break
        }
        ask.setVisible(true)
    }

    const buildCompare = (wanted: Move | null, got: Move | null) => {
        compare.removeAll(true)
        const slot = (dx: number, tag: string, move: Move | null, tint: number) => {
            const box = scene.add.container(dx, 0)
            const g = scene.add.graphics()
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(-52, -40, 104, 84, 15)
            g.fillStyle(tint, 1)
            g.fillRoundedRect(-52, -40, 104, 78, 15)
            box.add(g)

            const label = scene.add
                .text(0, -28, tag, { fontFamily: FONT.black, fontSize: '17px', color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            box.add(label)

            const icon = scene.add.graphics().setPosition(0, 12)
            if (move) drawMove(icon, move, 46, C.ink, C.ink)
            else {
                icon.lineStyle(6, C.ink, 0.8)
                icon.lineBetween(-14, 0, 14, 0)
            }
            box.add(icon)
            compare.add(box)
        }
        slot(-58, 'PEDIDO', wanted, C.sheet)
        slot(58, 'SAIU', got, C.stall)
    }

    return {
        /** Monta a tira inteira do ensaio pedido. */
        show(phase: PhaseDef, rehearsal = 0) {
            clear()
            setAsk(phase.ask)
            compare.setVisible(false)

            const moves = wantedMoves(phase, rehearsal)
            const per = phase.pattern.length
            const grouped = per > 1
            const breaks = grouped ? Math.max(0, moves.length / per - 1) : 0

            const left = REQUEST.x + PAD + ASK_W
            const right = REQUEST.x + REQUEST.w - PAD
            const room = right - left
            const w = Math.min(
                CARD_MAX,
                Math.floor((room - CARD_GAP * (moves.length - 1) - BREAK * breaks) / Math.max(1, moves.length)),
            )
            cardW = w
            const total = w * moves.length + CARD_GAP * (moves.length - 1) + BREAK * breaks
            let cursor = left + (room - total) / 2
            const cy = REQUEST.y + REQUEST.h / 2

            moves.forEach((move, i) => {
                const round = Math.floor(i / per)
                const body = scene.add.container(cursor + w / 2, cy)
                const face = scene.add.graphics()
                paintCard(face, w, CARD_H)
                body.add(face)

                const ring = scene.add.graphics()
                body.add(ring)

                const icon = scene.add.graphics().setPosition(0, -9)
                drawMove(icon, move, w * 0.42, C.ink, C.inkSoft)
                body.add(icon)

                const name = scene.add
                    .text(0, CARD_H / 2 - 20, MOVE_NAME[move], {
                        fontFamily: FONT.black,
                        fontSize: '18px',
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                body.add(name)

                strip.add(body)
                cards.push({ body, face, ring, move, round })

                cursor += w + CARD_GAP
                if (grouped && i % per === per - 1 && i < moves.length - 1) cursor += BREAK - CARD_GAP
            })

            /*
             * AS BARRAS DE REFRÃO.
             *
             * Vêm DEPOIS da ação final de cada refrão e só existem quando o
             * refrão tem mais de um movimento — com um movimento só, separar
             * cada cartão do seguinte não agruparia nada, apenas encheria a
             * faixa de traços.
             *
             * São claras e grossas de propósito: é por elas que a criança
             * conta quantos refrões existem, e um fio fino sobre o índigo do
             * painel some no celular.
             */
            if (grouped) {
                for (let i = per - 1; i < moves.length - 1; i += per) {
                    const a = cards[i].body.x + w / 2
                    const b = cards[i + 1].body.x - w / 2
                    const x = (a + b) / 2
                    const top = cy - CARD_H / 2 + 2
                    const bottom = cy + CARD_H / 2 - 2
                    seals.fillStyle(C.ink, 1)
                    seals.fillRoundedRect(x - 5, top - 2, 10, bottom - top + 4, 5)
                    seals.fillStyle(C.warm, 1)
                    seals.fillRoundedRect(x - 3, top, 6, bottom - top, 3)
                }
            }
        },

        /** O movimento que está saindo agora: a tira acompanha a dança. */
        async beat(index: number) {
            const card = cards[index]
            if (!card) return
            await FX.to(scene, card.body, { scale: 1.12 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
        },

        /**
         * O selo do refrão fechado.
         *
         * Vale para o refrão inteiro, e não para o último cartão: o que
         * terminou foi uma volta do laço de fora, e é esse agrupamento que a
         * criança precisa ver ganhar o selo.
         */
        async seal(round: number) {
            const inRound = cards.filter(c => c.round === round)
            if (!inRound.length) return
            inRound.forEach(card => {
                card.ring.clear()
                card.ring.lineStyle(5, C.good, 1)
                card.ring.strokeRoundedRect(-cardW / 2 - 3, -CARD_H / 2 - 3, cardW + 6, CARD_H + 6, 15)
            })
            const last = inRound[inRound.length - 1]
            const badge = scene.add.graphics().setPosition(last.body.x + cardW / 2 - 6, last.body.y - CARD_H / 2 + 4)
            badge.fillStyle(C.ink, 1)
            badge.fillCircle(0, 0, 16)
            badge.fillStyle(C.good, 1)
            badge.fillCircle(0, 0, 13)
            badge.lineStyle(4, C.white, 1)
            badge.beginPath()
            badge.moveTo(-6, 0)
            badge.lineTo(-2, 5)
            badge.lineTo(7, -5)
            badge.strokePath()
            strip.add(badge)
            badges.push(badge)
            badge.setScale(0.3)
            await FX.to(scene, badge, { scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        /** O cartão onde a dança divergiu, e o que saiu no lugar. */
        mark(index: number, wanted: Move | null, got: Move | null) {
            const card = cards[Math.min(index, cards.length - 1)]
            if (card) {
                card.ring.clear()
                card.ring.lineStyle(7, C.stall, 1)
                card.ring.strokeRoundedRect(-cardW / 2 - 4, -CARD_H / 2 - 4, cardW + 8, CARD_H + 8, 16)
                scene.tweens.killTweensOf(card.body)
                card.body.setScale(1)
                void FX.to(scene, card.body, { scale: 1.08 }, { duration: 420, yoyo: true, repeat: -1 })
            }
            ask.setVisible(false)
            buildCompare(wanted, got)
            compare.setScale(0.8).setAlpha(0).setVisible(true)
            void FX.to(scene, compare, { scale: 1, alpha: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        /** Volta ao estado de montar: some a comparação, some o âmbar. */
        unmark() {
            compare.setVisible(false)
            ask.setVisible(true)
            dropBadges()
            cards.forEach(card => {
                scene.tweens.killTweensOf(card.body)
                card.body.setScale(1)
                card.ring.clear()
            })
        },

        bounds() {
            return {
                x: REQUEST.x + REQUEST.w / 2,
                y: REQUEST.y + REQUEST.h / 2,
                w: REQUEST.w + 26,
                h: REQUEST.h + 26,
            }
        },

        /** Só a tira, sem a frase — para o tutorial apontar os movimentos. */
        stripBounds() {
            if (!cards.length) return this.bounds()
            const first = cards[0].body.x
            const last = cards[cards.length - 1].body.x
            return {
                x: (first + last) / 2,
                y: REQUEST.y + REQUEST.h / 2,
                w: last - first + CARD_MAX + 40,
                h: REQUEST.h + 18,
            }
        },

        destroy() {
            clear()
            scene.tweens.killTweensOf([root, compare])
            root.destroy(true)
        },
    }
}

export type Request = ReturnType<typeof createRequest>
