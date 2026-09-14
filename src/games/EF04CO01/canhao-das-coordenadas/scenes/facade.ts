import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellCenter, DEPTH, GRID } from '../data/layout'
import { keyOf, type Painted } from '../data/rules'
import { C, CSS, FONT, inkOf } from '../data/theme'
import type { Cell } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FACHADA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Dezesseis janelas numa matriz 4 × 4, com os números das linhas à esquerda e
 * os das colunas em cima. É o objeto do mundo real que a EF04CO01 pede, e é
 * também o registro do que a criança fez: a tinta FICA na célula, então no fim
 * do mural ela vê o padrão que construiu, não um aviso de acerto.
 *
 * ── OS RÓTULOS FICAM FORA DA GRADE ───────────────────────────────────────
 *
 * Linha e coluna se distinguem por POSIÇÃO e por número, nunca só por cor —
 * critério do §7 do planejamento, e o que faz o jogo continuar legível para
 * quem não separa azul de amarelo.
 *
 * ── OS GUIAS ACENDEM EM ORDEM ────────────────────────────────────────────
 *
 * Primeiro a faixa da linha, depois a da coluna, e só então o cruzamento. A
 * ordem é a resposta para a confusão que o jogo inteiro existe para desfazer:
 * L vem antes de C.
 */

export interface FacadeOptions {
    onPick: (cell: Cell) => void
}

interface Pane {
    cell: Cell
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    /** `null` = sem tinta; número = índice na paleta `INKS`. */
    ink: number | null
    pulse?: Phaser.Tweens.Tween
}

function paintPane(g: Phaser.GameObjects.Graphics, ink: number | null, pressed: boolean) {
    const s = GRID.cell
    const inset = 9
    const w = s - inset * 2
    const dy = pressed ? 4 : 0
    const tinta = ink === null ? null : inkOf(ink)
    g.clear()

    g.fillStyle(C.ink, 0.18)
    g.fillRoundedRect(-w / 2 + 4, -w / 2 + 7 + dy, w, w, 14)

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 3, -w / 2 - 3 + dy, w + 6, w + 6, 16)
    g.fillStyle(tinta ? tinta.deep : C.wallDeep, 1)
    g.fillRoundedRect(-w / 2, -w / 2 + dy, w, w, 13)
    g.fillStyle(tinta ? tinta.face : C.wall, 1)
    g.fillRoundedRect(-w / 2, -w / 2 + dy, w, w - 7, 13)

    // os caixilhos: é o que faz o quadrado ser lido como JANELA, e não como
    // casa de tabuleiro
    g.lineStyle(4, tinta ? tinta.deep : C.wallDeep, 1)
    g.lineBetween(0, -w / 2 + 8 + dy, 0, w / 2 - 12 + dy)
    g.lineBetween(-w / 2 + 8, dy - 2, w / 2 - 8, dy - 2)

    g.fillStyle(C.white, tinta ? 0.34 : 0.55)
    g.fillRoundedRect(-w / 2 + 12, -w / 2 + 9 + dy, w - 24, 8, 4)
}

export function createFacade(scene: Phaser.Scene, options: FacadeOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.board)
    const guides = scene.add.graphics().setDepth(DEPTH.guide)
    const marks = scene.add.graphics().setDepth(DEPTH.cellFx)
    const spot = scene.add.graphics().setDepth(DEPTH.cellFx + 1).setVisible(false)

    let enabled = false
    const panes = new Map<string, Pane>()

    const board = scene.add.graphics()
    board.fillStyle(C.ink, 0.16)
    board.fillRoundedRect(GRID.x - 16, GRID.y - 10, GRID.size + 32, GRID.size + 32, 22)
    board.fillStyle(C.wallDeep, 1)
    board.fillRoundedRect(GRID.x - 18, GRID.y - 18, GRID.size + 36, GRID.size + 36, 20)
    board.fillStyle(C.wall, 1)
    board.fillRoundedRect(GRID.x - 18, GRID.y - 18, GRID.size + 36, GRID.size + 28, 20)
    root.add(board)

    /* ── rótulos ─────────────────────────────────────────────────────── */
    const labelStyle = {
        fontFamily: FONT.black,
        fontSize: '34px',
        color: CSS.ink,
    }
    const colLabels: Phaser.GameObjects.Text[] = []
    const rowLabels: Phaser.GameObjects.Text[] = []
    for (let i = 1; i <= GRID.n; i++) {
        const c = cellCenter(1, i)
        const colTag = scene.add
            .text(c.x, GRID.y - GRID.labelBand / 2 - GRID.labelGap - 10, `C${i}`, labelStyle)
            .setOrigin(0.5)
            .setResolution(2)
        root.add(colTag)
        colLabels.push(colTag)

        const r = cellCenter(i, 1)
        const rowTag = scene.add
            .text(GRID.x - GRID.labelBand / 2 - GRID.labelGap - 10, r.y, `L${i}`, labelStyle)
            .setOrigin(0.5)
            .setResolution(2)
        root.add(rowTag)
        rowLabels.push(rowTag)
    }

    const tintLabels = (row: number | null, col: number | null) => {
        rowLabels.forEach((t, i) => t.setColor(i + 1 === row ? CSS.paint : CSS.ink))
        colLabels.forEach((t, i) => t.setColor(i + 1 === col ? CSS.paint : CSS.ink))
    }

    /* ── as janelas ──────────────────────────────────────────────────── */
    for (let row = 1; row <= GRID.n; row++) {
        for (let col = 1; col <= GRID.n; col++) {
            const p = cellCenter(row, col)
            const body = scene.add.container(p.x, p.y).setDepth(DEPTH.cell)
            const face = scene.add.graphics()
            paintPane(face, null, false)
            body.add(face)

            const zone = scene.add
                .zone(p.x, p.y, GRID.cell - 6, GRID.cell - 6)
                .setOrigin(0.5)
                .setDepth(DEPTH.cell + 1)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (enabled) options.onPick({ row, col })
            })

            panes.set(keyOf({ row, col }), { cell: { row, col }, body, face, zone, ink: null })
        }
    }

    const stopPulse = (pane: Pane) => {
        pane.pulse?.remove()
        pane.pulse = undefined
        scene.tweens.killTweensOf(pane.body)
        // devolver a escala na mão: `FX.kill` sozinho deixaria a janela
        // parada num tamanho intermediário
        pane.body.setScale(1)
    }

    const clearPulses = () => panes.forEach(stopPulse)

    return {
        /** Repõe a fachada no estado do mural, sem animação. */
        reset(painted: Painted) {
            clearPulses()
            guides.clear()
            marks.clear()
            tintLabels(null, null)
            panes.forEach((pane, key) => {
                pane.ink = painted.has(key) ? (painted.get(key) ?? 0) : null
                paintPane(pane.face, pane.ink, false)
                pane.body.setAlpha(1).setScale(1)
            })
        },

        /** A grade nasce célula por célula, como manda o §12. */
        async show(painted: Painted) {
            this.reset(painted)
            const list = [...panes.values()]
            list.forEach(p => p.body.setScale(0).setAlpha(0))
            await FX.all(
                ...list.map((pane, i) =>
                    FX.wait(scene, i * 26).then(() =>
                        FX.to(scene, pane.body, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' }),
                    ),
                ),
            )
        },

        centerOf(cell: Cell) {
            return cellCenter(cell.row, cell.col)
        },

        press(cell: Cell) {
            const pane = panes.get(keyOf(cell))
            if (!pane) return
            paintPane(pane.face, pane.ink, true)
            void FX.wait(scene, 140).then(() => {
                if (pane.body.active) paintPane(pane.face, pane.ink, false)
            })
        },

        /**
         * Acende a linha, depois a coluna, e devolve o cruzamento.
         *
         * É a única parte do jogo que ensina sozinha: quem olha vê a faixa
         * horizontal aparecer primeiro, e é dela que sai o nome L.
         */
        async traceTo(cell: Cell) {
            const p = cellCenter(cell.row, cell.col)
            guides.clear()
            tintLabels(cell.row, null)
            guides.fillStyle(C.aim, 0.3)
            guides.fillRoundedRect(GRID.x, p.y - GRID.cell / 2 + 6, GRID.size, GRID.cell - 12, 10)
            await FX.wait(scene, 300)

            tintLabels(cell.row, cell.col)
            guides.fillStyle(C.aim, 0.3)
            guides.fillRoundedRect(p.x - GRID.cell / 2 + 6, GRID.y, GRID.cell - 12, GRID.size, 10)
            await FX.wait(scene, 300)

            marks.clear()
            marks.lineStyle(7, C.aim, 1)
            marks.strokeRoundedRect(
                p.x - GRID.cell / 2 + 4,
                p.y - GRID.cell / 2 + 4,
                GRID.cell - 8,
                GRID.cell - 8,
                14,
            )
            await FX.wait(scene, 160)
        },

        hideGuides() {
            guides.clear()
            marks.clear()
            tintLabels(null, null)
        },

        async paint(cell: Cell, ink = 0) {
            const pane = panes.get(keyOf(cell))
            if (!pane) return
            pane.ink = ink
            paintPane(pane.face, ink, false)
            await FX.to(scene, pane.body, { scale: 1.12 }, { duration: 130 })
            await FX.to(scene, pane.body, { scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },

        /** A tinta sai daqui: usado pelo MOVER, antes de ela chegar no destino. */
        async unpaint(cell: Cell) {
            const pane = panes.get(keyOf(cell))
            if (!pane) return
            pane.ink = null
            await FX.to(scene, pane.body, { scale: 0.86 }, { duration: 150 })
            paintPane(pane.face, null, false)
            await FX.to(scene, pane.body, { scale: 1 }, { duration: 280, ease: 'Back.easeOut' })
        },

        inkAt(cell: Cell) {
            return panes.get(keyOf(cell))?.ink ?? null
        },

        /**
         * O destaque do nível 2: "é ESTA a janela, como se chama?".
         *
         * Amarelo neutro de propósito, e nunca a cor da tinta: ele aponta sem
         * dizer se algo está certo, e é a única marca da tela que não significa
         * nem acerto nem erro.
         */
        highlight(cell: Cell | null) {
            scene.tweens.killTweensOf(spot)
            if (!cell) {
                spot.setVisible(false)
                return
            }
            const p = cellCenter(cell.row, cell.col)
            spot.clear()
            spot.lineStyle(9, C.spot, 1)
            spot.strokeRoundedRect(-GRID.cell / 2 + 6, -GRID.cell / 2 + 6, GRID.cell - 12, GRID.cell - 12, 16)
            spot.fillStyle(C.spot, 0.22)
            spot.fillRoundedRect(-GRID.cell / 2 + 6, -GRID.cell / 2 + 6, GRID.cell - 12, GRID.cell - 12, 16)
            spot.setPosition(p.x, p.y).setVisible(true).setAlpha(1).setScale(1)
            scene.tweens.add({
                targets: spot,
                alpha: 0.45,
                scale: 1.06,
                duration: FX.ms(scene, 620),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        async shake(cell: Cell) {
            const pane = panes.get(keyOf(cell))
            if (!pane) return
            await FX.shake(scene, pane.body, { amount: 11, times: 3 })
        },

        /** A resposta pisca — só depois de dois erros na mesma tarefa. */
        pulse(cell: Cell) {
            const pane = panes.get(keyOf(cell))
            if (!pane) return
            stopPulse(pane)
            pane.pulse = scene.tweens.add({
                targets: pane.body,
                scale: 1.08,
                duration: FX.ms(scene, 560),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        clearPulses,

        /** Mostra a fachada inteira, sem os guias, no fim do mural. */
        async reveal() {
            this.hideGuides()
            clearPulses()
            const pintadas = [...panes.values()].filter(p => p.ink !== null)
            await FX.all(
                ...pintadas.map((pane, i) =>
                    FX.wait(scene, i * 110).then(async () => {
                        await FX.to(scene, pane.body, { scale: 1.16 }, { duration: 200 })
                        await FX.to(scene, pane.body, { scale: 1 }, { duration: 280, ease: 'Back.easeOut' })
                    }),
                ),
            )
        },

        setEnabled(value: boolean) {
            enabled = value
            panes.forEach(pane => {
                if (pane.zone.input) pane.zone.input.enabled = value
            })
        },

        bounds() {
            return {
                x: GRID.x + GRID.size / 2,
                y: GRID.y + GRID.size / 2,
                w: GRID.size + 60,
                h: GRID.size + 60,
            }
        },

        rowBounds(row: number) {
            const p = cellCenter(row, 1)
            return { x: GRID.x + GRID.size / 2, y: p.y, w: GRID.size + 24, h: GRID.cell }
        },

        colBounds(col: number) {
            const p = cellCenter(1, col)
            return { x: p.x, y: GRID.y + GRID.size / 2, w: GRID.cell, h: GRID.size + 24 }
        },

        destroy() {
            clearPulses()
            panes.forEach(pane => {
                pane.zone.destroy()
                pane.body.destroy(true)
            })
            panes.clear()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
            guides.destroy()
            marks.destroy()
            spot.destroy()
        },
    }
}

export type Facade = ReturnType<typeof createFacade>
