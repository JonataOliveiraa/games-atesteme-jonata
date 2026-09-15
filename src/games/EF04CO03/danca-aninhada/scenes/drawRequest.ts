import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { COMPARE, DEPTH, REQUEST, W } from '../data/layout'
import { wantedMoves } from '../data/rules'
import { C, CSS, FONT } from '../data/theme'
import { moveIcon } from './pictogram'
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
 * ── NO NÍVEL 3 A TIRA NÃO TERMINA ────────────────────────────────────────
 *
 * Lá o pedido não pode dizer quantos refrões haverá — é justamente o que a
 * criança não deve saber, e o que a condição existe para descobrir. Então a
 * tira mostra UM refrão e, depois da barra, uma placa de reticências com a
 * lâmpada apagada: "e continua, até a luz apagar".
 *
 * Expandir a sequência ali, como nos níveis 1 e 2, entregaria a resposta
 * antes de o ensaio começar — e entregaria uma resposta DIFERENTE em cada um
 * dos dois ensaios, que é a única coisa que o nível 3 quer provar.
 *
 * ── SEM PALAVRA DEBAIXO DO DESENHO ───────────────────────────────────────
 *
 * Cada cartão trazia PASSO, PALMA ou GIRO escrito. Numa tela que já tem o
 * nome da fase, o `REPITA n VEZES` da ficha, a fala da bandeja e a palavra em
 * cada opção, eram mais quatro palavras repetindo o que a silhueta diz. Aqui
 * o que se lê é uma SEQUÊNCIA; o vocabulário é ensinado na bandeja, onde a
 * criança escolhe com o nome do lado.
 *
 * ── O FUNDO ABRAÇA OS CARTÕES, E NÃO A LARGURA DA TELA ───────────────────
 *
 * Era uma faixa de ponta a ponta com uma caixa de texto grudada na esquerda.
 * Com o palco, a ficha e a bandeja, davam quatro painéis na tela e o olho não
 * sabia onde pousar. Agora a sombra tem o tamanho dos cartões: o que chama
 * atenção são eles.
 */

/**
 * A CENA AINDA EXISTE?
 *
 * Sair da página no meio de um ensaio destrói o jogo inteiro, e o `displayList`
 * vira `null`. O contador `gen` da `GameScene` já barra o FLUXO, mas entre a
 * promessa que resolve e a próxima guarda cabem algumas linhas — e uma delas
 * cria objeto. Sem isto, fechar a aba no meio da dança deixa um TypeError no
 * console de quem já foi embora.
 */
const vivo = (scene: Phaser.Scene) => Boolean(scene.sys?.displayList)

const CARD_H = 78
// quase quadrado: a largura existia para caber a palavra que saiu
const CARD_MAX = 92
const CARD_GAP = 10
const BREAK = 24
const PAD = 16

interface Card {
    body: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Graphics
    move: Move
    round: number
}

/** A placa de "e continua": reticências em cima, lâmpada apagada embaixo. */
function paintTail(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    paintCard(g, w, h)
    g.fillStyle(C.inkSoft, 1)
    for (let i = -1; i <= 1; i++) g.fillCircle(i * 15, -h * 0.26, 5)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, h * 0.1, 17)
    g.fillStyle(C.lampOff, 1)
    g.fillCircle(0, h * 0.1, 13)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-8, h * 0.1 + 11, 16, 9, 4)
}

function paintCard(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 16)
    g.fillStyle(C.sheetDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 13)
    g.fillStyle(C.sheet, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 6, 13)
}

export function createRequest(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)

    const bed = scene.add.graphics()
    root.add(bed)

    /*
     * SEM RÓTULO.
     *
     * Havia um "O PALCO PEDIU" em cima da tira. Entre a barra do cabeçalho e
     * a altura dos cartões não sobravam os 22 px dele sem empurrar a ficha
     * para baixo — e a faixa de pictogramas no topo da tela, com o passo a
     * passo do tutorial explicando, não precisava da legenda para ser lida.
     */
    const strip = scene.add.container(0, 0)
    root.add(strip)

    const bars = scene.add.graphics()
    root.add(bars)

    /** O aviso do §4: o que o pedido queria ali e o que saiu no lugar. */
    const callout = scene.add.container(0, 0).setDepth(DEPTH.fly).setVisible(false)

    let cards: Card[] = []
    let badges: Phaser.GameObjects.Graphics[] = []
    let cardW = CARD_MAX
    let per = 1
    /** Nível 3: a tira mostra um refrão só, e não a sequência inteira. */
    let open = false

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
        bars.clear()
        bed.clear()
        callout.removeAll(true)
        callout.setVisible(false)
    }

    /**
     * O PEDIDO E O QUE SAIU, LADO A LADO.
     *
     * Fica no vão do palco, ao lado do dançarino. Foi pendurado no cartão que
     * divergiu e caía sobre o cabeçalho da ficha — escondia o espaço travado
     * de que estava falando. Quem aponta o lugar na sequência é o âmbar no
     * cartão; aqui mora só a comparação.
     */
    const buildCallout = (wanted: Move | null, got: Move | null) => {
        callout.removeAll(true)
        const w = 244
        const h = 96
        callout.setPosition(COMPARE.x, COMPARE.y)

        const box = scene.add.graphics()
        box.fillStyle(C.ink, 1)
        box.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 20)
        box.fillStyle(C.sheet, 1)
        box.fillRoundedRect(-w / 2, -h / 2, w, h, 17)
        callout.add(box)

        const half = (dx: number, tag: string, move: Move | null, tint: number, ink: string) => {
            const chip = scene.add.graphics()
            chip.fillStyle(tint, 1)
            chip.fillRoundedRect(dx - 52, -h / 2 + 8, 104, h - 16, 13)
            callout.add(chip)

            const t = scene.add
                .text(dx, -h / 2 + 22, tag, { fontFamily: FONT.black, fontSize: '16px', color: ink })
                .setOrigin(0.5)
                .setResolution(2)
            callout.add(t)

            if (move) {
                const icon = moveIcon(scene, move, 42, C.ink, C.ink)
                icon.setPosition(dx, 12)
                callout.add(icon)
            } else {
                const dash = scene.add.graphics().setPosition(dx, 12)
                dash.lineStyle(6, C.ink, 0.8)
                dash.lineBetween(-14, 0, 14, 0)
                callout.add(dash)
            }
        }
        half(-58, 'PEDIDO', wanted, C.sheetDeep, CSS.ink)
        half(58, 'SAIU', got, C.stall, CSS.stallInk)

        callout.setVisible(true)
        callout.setScale(0.7).setAlpha(0)
        void FX.to(scene, callout, { scale: 1, alpha: 1 }, { duration: 240, ease: 'Back.easeOut' })
    }

    return {
        /**
         * Monta a tira do pedido.
         *
         * Nos níveis 1 e 2 ela traz a sequência inteira; no 3, um refrão e a
         * placa de continuação, porque lá a quantidade é o segredo da fase.
         */
        show(phase: PhaseDef) {
            clear()

            open = Boolean(phase.signalPlans)
            const moves = open ? phase.pattern.slice() : wantedMoves(phase, 0)
            per = phase.pattern.length
            const grouped = per > 1
            const tiles = moves.length + (open ? 1 : 0)
            const breaks = open ? 1 : grouped ? Math.max(0, moves.length / per - 1) : 0

            const room = REQUEST.w - PAD * 2
            const w = Math.min(
                CARD_MAX,
                Math.floor((room - CARD_GAP * (tiles - 1) - BREAK * breaks) / Math.max(1, tiles)),
            )
            cardW = w
            const total = w * tiles + CARD_GAP * (tiles - 1) + BREAK * breaks
            const left = REQUEST.x + (REQUEST.w - total) / 2
            let cursor = left
            const cy = REQUEST.y + REQUEST.h / 2

            // a sombra tem o tamanho dos cartões, com uma folga de respiro
            bed.fillStyle(C.ink, 0.42)
            bed.fillRoundedRect(left - PAD, REQUEST.y, total + PAD * 2, REQUEST.h, 22)

            moves.forEach((move, i) => {
                const round = Math.floor(i / per)
                const body = scene.add.container(cursor + w / 2, cy)
                const face = scene.add.graphics()
                paintCard(face, w, CARD_H)
                body.add(face)

                const ring = scene.add.graphics()
                body.add(ring)

                const icon = moveIcon(scene, move, CARD_H * 0.74, C.ink, C.inkSoft)
                body.add(icon)

                strip.add(body)
                cards.push({ body, ring, move, round })

                cursor += w + CARD_GAP
                const fechaRefrao = i % per === per - 1
                if (fechaRefrao && (open || (grouped && i < moves.length - 1))) cursor += BREAK - CARD_GAP
            })

            if (open) {
                const body = scene.add.container(cursor + w / 2, cy)
                const face = scene.add.graphics()
                paintTail(face, w, CARD_H)
                body.add(face)
                strip.add(body)
            }

            /*
             * AS BARRAS DE REFRÃO.
             *
             * Vêm DEPOIS da ação final de cada refrão e só existem quando o
             * refrão tem mais de um movimento — com um movimento só, separar
             * cada cartão do seguinte não agruparia nada. No nível 3 há uma
             * barra sempre: ela separa o refrão da placa de continuação.
             *
             * São claras e grossas de propósito: é por elas que a criança
             * conta quantos refrões existem, e um fio fino some no celular.
             */
            const bar = (a: number, b: number) => {
                const x = (a + b) / 2
                const top = cy - CARD_H / 2 + 2
                const bottom = cy + CARD_H / 2 - 2
                bars.fillStyle(C.ink, 1)
                bars.fillRoundedRect(x - 5, top - 2, 10, bottom - top + 4, 5)
                bars.fillStyle(C.warm, 1)
                bars.fillRoundedRect(x - 3, top, 6, bottom - top, 3)
            }
            if (open) {
                bar(cards[cards.length - 1].body.x + w / 2, cursor)
            } else if (grouped) {
                for (let i = per - 1; i < moves.length - 1; i += per) {
                    bar(cards[i].body.x + w / 2, cards[i + 1].body.x - w / 2)
                }
            }
        },

        /**
         * O selo do refrão fechado.
         *
         * Vale para o refrão inteiro, e não para o último cartão: o que
         * terminou foi uma volta do laço de fora, e é esse agrupamento que a
         * criança precisa ver ganhar o selo.
         */
        async seal(round: number) {
            if (!vivo(scene)) return
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
            await FX.to(scene, badge, { scale: 1 }, { duration: 200, ease: 'Back.easeOut' })
        },

        /**
         * O cartão onde a dança divergiu, e o balão com o que saiu.
         *
         * O índice vem da sequência inteira do ensaio. Com a tira aberta do
         * nível 3, que mostra um refrão só, ele é dobrado para dentro do
         * refrão: o lugar do erro ali é uma POSIÇÃO no refrão, não uma
         * posição numa fila que a criança não pode ver.
         */
        mark(index: number, wanted: Move | null, got: Move | null) {
            const alvo = open ? index % per : index
            const card = cards[Math.min(alvo, cards.length - 1)]
            if (!card) return
            card.ring.clear()
            card.ring.lineStyle(7, C.stall, 1)
            card.ring.strokeRoundedRect(-cardW / 2 - 4, -CARD_H / 2 - 4, cardW + 8, CARD_H + 8, 16)
            scene.tweens.killTweensOf(card.body)
            card.body.setScale(1)
            void FX.to(scene, card.body, { scale: 1.08 }, { duration: 420, yoyo: true, repeat: -1 })
            buildCallout(wanted, got)
        },

        /** Volta ao estado de montar: some o balão, somem selos e âmbar. */
        unmark() {
            scene.tweens.killTweensOf(callout)
            callout.setVisible(false)
            callout.removeAll(true)
            dropBadges()
            cards.forEach(card => {
                scene.tweens.killTweensOf(card.body)
                card.body.setScale(1)
                card.ring.clear()
            })
        },

        fade(on: boolean) {
            scene.tweens.killTweensOf(root)
            callout.setVisible(on && callout.length > 0)
            return FX.to(scene, root, { alpha: on ? 1 : 0 }, { duration: 260 })
        },

        bounds() {
            return this.stripBounds()
        },

        /** Só a tira, para o tutorial apontar os movimentos. */
        stripBounds() {
            if (!cards.length) {
                return { x: W / 2, y: REQUEST.y + REQUEST.h / 2, w: REQUEST.w, h: REQUEST.h + 24 }
            }
            const first = cards[0].body.x
            const last = cards[cards.length - 1].body.x
            return {
                x: (first + last) / 2,
                y: REQUEST.y + REQUEST.h / 2,
                w: last - first + cardW + PAD * 2 + 20,
                h: REQUEST.h + 22,
            }
        },

        destroy() {
            clear()
            scene.tweens.killTweensOf([root, callout])
            callout.destroy(true)
            root.destroy(true)
        },
    }
}

export type Request = ReturnType<typeof createRequest>
