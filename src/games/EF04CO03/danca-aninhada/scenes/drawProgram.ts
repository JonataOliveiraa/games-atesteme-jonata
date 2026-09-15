import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    CHIP,
    DEPTH,
    FRAME_PAD,
    GAP,
    HEADER_H,
    SIGN_CHIP,
    SLOT,
    bodyOf,
    frameOf,
    innerCounterColumn,
    type Body,
    type Rect,
} from '../data/layout'
import { slotsOf } from '../data/rules'
import { C, CSS, FONT, SIGNAL_NAME } from '../data/theme'
import { moveIcon } from './pictogram'
import type { SheetDef, SlotId, SlotValue } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FICHA: DUAS MOLDURAS, NO MÁXIMO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A moldura de FORA é o refrão; a de DENTRO, quando existe, é o movimento
 * repetido. O §5 limita a ficha a dois níveis justamente porque uma terceira
 * moldura deixaria de ser lida como aninhamento e passaria a ser lida como
 * enfeite.
 *
 * As duas têm cor E nome escrito — cor sozinha não distingue. Mas as
 * etiquetas só aparecem quando existem DUAS molduras: com uma só, "FORA" não
 * se opõe a nada e é palavra na tela sem trabalho a fazer.
 *
 * ── A FICHA É PICTOGRÁFICA ───────────────────────────────────────────────
 *
 * Os espaços mostram o DESENHO do movimento, sem a palavra embaixo e sem o
 * rótulo MOVIMENTO/DEPOIS em cima. É o "roteiro pictográfico" do §1 do
 * planejamento, e é o que a habilidade nomeia. Quem diz a ordem é a posição
 * dos espaços, que é justamente o que a criança está decidindo.
 *
 * ── O NÍVEL 1 TEM UMA MOLDURA SÓ ─────────────────────────────────────────
 *
 * E é por isso que as etiquetas somem lá: sem a de dentro, "FORA" não se
 * opõe a nada. Do nível 2 em diante as duas aparecem, com os nomes escritos.
 */

type State = 'empty' | 'filled' | 'select' | 'lock'

interface Piece {
    id: SlotId
    box: Rect
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    content: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    state: State
}

export interface ProgramOptions {
    onSlot: (id: SlotId) => void
}

/**
 * A BORDA diz o estado; o MIOLO diz se há conteúdo.
 *
 * São duas informações independentes, e juntá-las numa coisa só foi erro: o
 * espaço ativo ficava com cara de preenchido antes de a criança escolher
 * nada, e o único vazio visível da ficha era o que ela NÃO estava olhando.
 */
function paintSlot(g: Phaser.GameObjects.Graphics, w: number, h: number, state: State, filled: boolean) {
    const r = Math.min(18, h / 3)
    g.clear()
    g.fillStyle(C.ink, 0.18)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, r)

    const border = state === 'select' ? C.select : state === 'lock' ? C.stall : filled ? C.ink : C.inkSoft
    g.fillStyle(border, 1)
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, r + 4)

    if (!filled) {
        g.fillStyle(C.sheetDeep, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
        g.lineStyle(4, state === 'select' ? C.select : C.inkSoft, state === 'select' ? 0.9 : 0.55)
        g.strokeRoundedRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, r - 4)
        return
    }

    g.fillStyle(C.sheetDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.fillStyle(C.sheet, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 7, r)
    g.fillStyle(C.white, 0.7)
    g.fillRoundedRect(-w / 2 + 12, -h / 2 + 9, w - 24, 9, 5)
}

/** O cadeado do §9, desenhado por código: o sinal de que a tarefa travou. */
function drawLock(g: Phaser.GameObjects.Graphics, s = 1) {
    g.lineStyle(6 * s, C.ink, 1)
    g.beginPath()
    g.arc(0, -8 * s, 10 * s, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-17 * s, -9 * s, 34 * s, 28 * s, 7 * s)
    g.fillStyle(C.stall, 1)
    g.fillRoundedRect(-14 * s, -6 * s, 28 * s, 22 * s, 5 * s)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 2 * s, 4 * s)
    g.fillRect(-1.6 * s, 2 * s, 3.2 * s, 8 * s)
}

export function createProgram(scene: Phaser.Scene, options: ProgramOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)
    const frames = scene.add.graphics().setDepth(DEPTH.frame)
    const tags = scene.add.container(0, 0).setDepth(DEPTH.frame)
    const pieces = new Map<SlotId, Piece>()
    const arrow = scene.add.graphics().setDepth(DEPTH.chip + 2).setVisible(false)
    const lockMark = scene.add.graphics().setDepth(DEPTH.chip + 2).setVisible(false)

    root.add(frames)
    root.add(tags)

    let sheet: SheetDef | null = null
    let frame: Rect = frameOf({ outer: 'times', leading: 1, nested: false, trailing: false }, 0)
    let body: Body | null = null
    let enabled = false
    let selected: SlotId | null = null
    let locked: SlotId | null = null

    /*
     * NÃO HÁ CONTADOR NA FICHA.
     *
     * Havia um selo "2/3" na moldura de fora e outro na de dentro, que
     * avançavam durante o ensaio. O ensaio passou a acontecer com a ficha
     * fora da tela, e contador que ninguém vê é só código para manter — quem
     * conta os refrões agora é a fileira de pontos, no palco.
     */
    const clear = () => {
        pieces.forEach(piece => {
            scene.tweens.killTweensOf(piece.body)
            piece.zone.destroy()
            piece.body.destroy(true)
        })
        pieces.clear()
        frames.clear()
        tags.removeAll(true)
        arrow.setVisible(false)
        lockMark.setVisible(false)
    }

    /** A etiqueta FORA / DENTRO. Recebe a borda esquerda e devolve a largura. */
    const pill = (left: number, y: number, text: string, face: number, ink: string) => {
        const t = scene.add
            .text(0, y, text, { fontFamily: FONT.black, fontSize: '21px', color: ink })
            .setOrigin(0.5)
            .setResolution(2)
        const w = t.width + 32
        const x = left + w / 2
        t.setX(x)

        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(x - w / 2 - 3, y - 20, w + 6, 40, 20)
        g.fillStyle(face, 1)
        g.fillRoundedRect(x - w / 2, y - 17, w, 34, 17)
        tags.add(g)
        tags.add(t)
        return w
    }

    const label = (x: number, y: number, text: string, size: number, color: string) => {
        const t = scene.add
            .text(x, y, text, { fontFamily: FONT.black, fontSize: `${size}px`, color })
            .setOrigin(0, 0.5)
            .setResolution(2)
        tags.add(t)
        return t
    }

    const addPiece = (id: SlotId, box: Rect) => {
        const body = scene.add.container(box.x, box.y)
        const face = scene.add.graphics()
        paintSlot(face, box.w, box.h, 'empty', false)
        body.add(face)
        const content = scene.add.container(0, 0)
        body.add(content)
        root.add(body)
        body.setDepth(DEPTH.slot)

        // zona FROUXA e fora do container: o espaço encolhe ao ser tocado, e
        // uma zona filha encolheria junto, fazendo o segundo toque errar
        const zone = scene.add
            .zone(box.x, box.y, box.w + 18, box.h + 18)
            .setOrigin(0.5)
            .setDepth(DEPTH.slot + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled) return
            if (locked && id !== locked) return
            options.onSlot(id)
        })

        pieces.set(id, { id, box, body, face, content, zone, state: 'empty' })
    }

    /**
     * A seta aponta de cima; no cabeçalho ela aponta de baixo.
     *
     * O espaço do laço externo mora encostado no topo da moldura, e uma seta
     * acima dele sairia da ficha e entraria na faixa do pedido.
     */
    const drawArrow = (piece: Piece) => {
        arrow.clear()
        const top = piece.box.y - piece.box.h / 2 - 22
        const below = top - 16 < frame.y - frame.h / 2 + 4
        const y = below ? piece.box.y + piece.box.h / 2 + 22 : top
        const dir = below ? -1 : 1
        arrow.fillStyle(C.select, 1)
        arrow.beginPath()
        arrow.moveTo(piece.box.x, y + dir * 16)
        arrow.lineTo(piece.box.x - 15, y - dir * 6)
        arrow.lineTo(piece.box.x + 15, y - dir * 6)
        arrow.closePath()
        arrow.fillPath()
        arrow.setVisible(true)
    }

    const repaint = (piece: Piece) => {
        const filled = piece.content.length > 0
        const state: State =
            piece.id === locked ? 'lock' : piece.id === selected ? 'select' : filled ? 'filled' : 'empty'
        piece.state = state
        paintSlot(piece.face, piece.box.w, piece.box.h, state, filled)
    }

    return {
        /** Monta a ficha vazia no formato desta fase. */
        build(next: SheetDef) {
            clear()
            sheet = next
            selected = null
            locked = null

            /*
             * O CABEÇALHO É MEDIDO ANTES DE A MOLDURA EXISTIR.
             *
             * A largura de `REPITA` depende da fonte que o navegador carregou,
             * então ela não cabe num arquivo de layout. Os textos nascem, são
             * medidos, e só então a moldura sabe de que tamanho ser e onde o
             * corpo começa.
             */
            /*
             * A ORDEM DAS PALAVRAS MUDA COM O LAÇO.
             *
             * `REPITA 3 VEZES` tem o número no meio; `REPITA ATÉ A LUZ
             * APAGAR` tem a condição no fim. Escrever "REPITA [ ] ATÉ" — que
             * foi o primeiro corte — deixava a ficha com uma frase que
             * ninguém fala.
             */
            const conta = next.outer === 'times'
            const repita = label(0, 0, conta ? 'REPITA' : 'REPITA ATÉ', 36, CSS.white)
            repita.setStroke(CSS.ink, 5)
            const tail = conta ? label(0, 0, 'VEZES', 36, CSS.white) : null
            tail?.setStroke(CSS.ink, 5)
            const chipW = conta ? CHIP.w : SIGN_CHIP.w
            const pillW = next.nested ? 112 : 0
            const headerW = pillW + repita.width + chipW + (tail?.width ?? 0) + 42

            frame = frameOf(next, headerW)
            body = bodyOf(next, frame)

            const left = frame.x - frame.w / 2
            const top = frame.y - frame.h / 2

            frames.fillStyle(C.ink, 0.28)
            frames.fillRoundedRect(left + 5, top + 9, frame.w, frame.h, 28)
            frames.fillStyle(C.outerDeep, 1)
            frames.fillRoundedRect(left - 5, top - 5, frame.w + 10, frame.h + 10, 30)
            frames.fillStyle(C.outer, 1)
            frames.fillRoundedRect(left, top, frame.w, frame.h, 26)
            frames.fillStyle(C.sheet, 1)
            frames.fillRoundedRect(
                left + 12,
                top + FRAME_PAD + HEADER_H - 4,
                frame.w - 24,
                frame.h - FRAME_PAD - HEADER_H - 8,
                20,
            )

            // ── o cabeçalho: [FORA] REPITA [ ] VEZES ─────────────────────
            const hy = top + FRAME_PAD + HEADER_H / 2 - 4
            let cursor = frame.x - headerW / 2
            // a etiqueta só existe quando há a de DENTRO para se opor a ela
            if (next.nested) cursor += pill(cursor, hy, 'FORA', C.sheet, CSS.outer) + 18
            repita.setPosition(cursor, hy)
            cursor += repita.width + 14
            addPiece('outer', { x: cursor + chipW / 2, y: hy, w: chipW, h: CHIP.h })
            cursor += chipW + 14
            tail?.setPosition(cursor, hy)

            // ── a moldura de dentro, quando a fase tem uma ───────────────
            if (body.innerFrame) {
                const f: Rect = body.innerFrame
                frames.fillStyle(C.innerDeep, 1)
                frames.fillRoundedRect(f.x - f.w / 2 - 5, f.y - f.h / 2 - 5, f.w + 10, f.h + 10, 24)
                frames.fillStyle(C.inner, 1)
                frames.fillRoundedRect(f.x - f.w / 2, f.y - f.h / 2, f.w, f.h, 20)
                pill(f.x - f.w / 2 + 14, f.y - f.h / 2 + 4, 'DENTRO', C.sheet, CSS.inner)

                const col = innerCounterColumn(f)
                const rep = scene.add
                    .text(col.x, col.y - 40, 'REPITA', {
                        fontFamily: FONT.black,
                        fontSize: '30px',
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                tags.add(rep)

                addPiece('innerTimes', { x: col.x - 46, y: col.y + 18, w: CHIP.w, h: CHIP.h })
                const vezes = scene.add
                    .text(col.x + 14, col.y + 18, 'VEZES', {
                        fontFamily: FONT.black,
                        fontSize: '26px',
                        color: CSS.ink,
                    })
                    .setOrigin(0, 0.5)
                    .setResolution(2)
                tags.add(vezes)
            }

            body.slots.forEach(slot => {
                if (!pieces.has(slot.id)) addPiece(slot.id, slot)
            })

            slotsOf(next).forEach(id => {
                if (!pieces.has(id)) return
                repaint(pieces.get(id)!)
            })
        },

        /** O conteúdo escolhido entra no espaço. `null` esvazia. */
        setValue(id: SlotId, value: SlotValue | null) {
            const piece = pieces.get(id)
            if (!piece) return
            piece.content.removeAll(true)

            if (value) {
                const small = piece.box.h < SLOT.h
                if (value.kind === 'times') {
                    const n = scene.add
                        .text(0, 0, String(value.times), {
                            fontFamily: FONT.black,
                            fontSize: small ? '44px' : '58px',
                            color: CSS.ink,
                        })
                        .setOrigin(0.5)
                        .setResolution(2)
                    piece.content.add(n)
                } else if (value.kind === 'signal') {
                    const t = scene.add
                        .text(0, 0, SIGNAL_NAME[value.signal], {
                            fontFamily: FONT.black,
                            fontSize: '26px',
                            color: CSS.ink,
                            align: 'center',
                        })
                        .setOrigin(0.5)
                        .setResolution(2)
                    piece.content.add(t)
                } else {
                    const icon = moveIcon(scene, value.move, piece.box.h * 0.76, C.ink, C.inkSoft)
                    piece.content.add(icon)
                }
            }

            repaint(piece)
        },

        /** O espaço ativo: contorno ciano e a setinha do §5. */
        select(id: SlotId | null) {
            const before = selected
            selected = id
            if (before && pieces.has(before)) repaint(pieces.get(before)!)
            if (!id || !pieces.has(id)) {
                arrow.setVisible(false)
                return
            }
            const piece = pieces.get(id)!
            repaint(piece)
            drawArrow(piece)
            void FX.press(scene, piece.body)
        },

        /** A TRAVA: só este espaço aceita toque até ser corrigido. */
        lock(id: SlotId | null) {
            const before = locked
            locked = id
            if (before && pieces.has(before)) repaint(pieces.get(before)!)
            if (!id || !pieces.has(id)) {
                lockMark.setVisible(false)
                return
            }
            const piece = pieces.get(id)!
            repaint(piece)
            lockMark.clear()
            lockMark.setPosition(piece.box.x + piece.box.w / 2 + 2, piece.box.y - piece.box.h / 2 - 2)
            drawLock(lockMark, piece.box.h < SLOT.h ? 0.8 : 1)
            lockMark.setVisible(true)
            lockMark.setScale(0.3)
            void FX.to(scene, lockMark, { scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        /** O bloco acende no movimento que ele produziu. */
        async flash(id: SlotId) {
            const piece = pieces.get(id)
            if (!piece) return
            await FX.to(scene, piece.body, { scale: 1.1 }, { duration: 120, yoyo: true, ease: 'Sine.easeOut' })
        },

        /**
         * Devolve todos os espaços ao tamanho normal.
         *
         * A ajuda do §9 pulsa a OPÇÃO na bandeja, não o espaço — piscar os
         * dois seria dizer duas vezes a mesma coisa. O que sobra aqui é
         * desfazer o que `flash` e `FX.press` deixaram pelo caminho antes de
         * um ensaio começar.
         */
        settle() {
            pieces.forEach(piece => {
                scene.tweens.killTweensOf(piece.body)
                piece.body.setScale(1)
            })
        },

        setEnabled(value: boolean) {
            enabled = value
            pieces.forEach(piece => {
                if (piece.zone.input) piece.zone.input.enabled = value
            })
        },

        /** A ficha inteira some durante o ensaio, seta e cadeado junto. */
        fade(on: boolean) {
            scene.tweens.killTweensOf([root, arrow, lockMark])
            arrow.setAlpha(on ? 1 : 0)
            lockMark.setAlpha(on ? 1 : 0)
            return FX.to(scene, root, { alpha: on ? 1 : 0 }, { duration: 260 })
        },

        slotBounds(id: SlotId) {
            const piece = pieces.get(id)
            if (!piece) return this.bounds()
            return { x: piece.box.x, y: piece.box.y, w: piece.box.w + 40, h: piece.box.h + 40 }
        },

        firstEmpty(): SlotId | null {
            if (!sheet) return null
            return slotsOf(sheet).find(id => !pieces.get(id)?.content.length) ?? null
        },

        bounds() {
            return { x: frame.x, y: frame.y, w: frame.w + 34, h: frame.h + 34 }
        },

        /** A moldura de DENTRO, para o tutorial do nível 2 apontar. */
        innerBounds() {
            if (!body?.innerFrame) return this.bodyBounds()
            const f = body.innerFrame
            return { x: f.x, y: f.y, w: f.w + 26, h: f.h + 26 }
        },

        /** Só o corpo, sem o cabeçalho — o tutorial aponta os movimentos. */
        bodyBounds() {
            if (!body) return this.bounds()
            return { x: body.area.x, y: body.area.y, w: body.area.w + GAP, h: body.area.h + GAP }
        },

        destroy() {
            clear()
            scene.tweens.killTweensOf([root, lockMark])
            arrow.destroy()
            lockMark.destroy()
            root.destroy(true)
        },
    }
}

export type Program = ReturnType<typeof createProgram>
