import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    CHIP,
    DEPTH,
    FRAME_PAD,
    GAP,
    HEADER_H,
    SHEET,
    SIGN_CHIP,
    SLOT,
    TAG_H,
    bodyOf,
    innerCounterColumn,
    type Rect,
} from '../data/layout'
import { slotsOf } from '../data/rules'
import { C, CSS, FONT, MOVE_NAME, SIGNAL_NAME } from '../data/theme'
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
 * As duas têm cor E nome escrito. Cor sozinha não distingue — quem não separa
 * ciano de âmbar continuaria lendo FORA e DENTRO.
 *
 * ── ESTE CORTE DESENHA SÓ O QUE O NÍVEL 1 USA ────────────────────────────
 *
 * O nível 1 tem uma moldura só. A de dentro está aqui porque o `bodyOf` já a
 * posiciona e porque desenhá-la é o mesmo laço dos espaços — mas quem a
 * exercita é o nível 2, que ainda não foi ao teste.
 */

type State = 'empty' | 'filled' | 'select' | 'lock'

interface Piece {
    id: SlotId
    box: Rect
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    content: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    /** Os espaços do corpo têm rótulo em cima; os do cabeçalho, não. */
    tagged: boolean
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

    const addPiece = (id: SlotId, box: Rect, tagged = false) => {
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

        pieces.set(id, { id, box, body, face, content, zone, tagged, state: 'empty' })
    }

    /**
     * A seta aponta de cima; no cabeçalho ela aponta de baixo.
     *
     * O espaço do laço externo mora encostado no topo da moldura, e uma seta
     * acima dele sairia da ficha e entraria na faixa do pedido.
     */
    const drawArrow = (piece: Piece) => {
        arrow.clear()
        // acima do RÓTULO, não do espaço: a seta encostada no espaço
        // cairia em cima da palavra MOVIMENTO
        const top = piece.box.y - piece.box.h / 2 - 22 - (piece.tagged ? TAG_H : 0)
        const below = top - 16 < SHEET.y + 4
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

            const body = bodyOf(next)

            frames.fillStyle(C.ink, 0.28)
            frames.fillRoundedRect(SHEET.x + 5, SHEET.y + 9, SHEET.w, SHEET.h, 28)
            frames.fillStyle(C.outerDeep, 1)
            frames.fillRoundedRect(SHEET.x - 5, SHEET.y - 5, SHEET.w + 10, SHEET.h + 10, 30)
            frames.fillStyle(C.outer, 1)
            frames.fillRoundedRect(SHEET.x, SHEET.y, SHEET.w, SHEET.h, 26)
            frames.fillStyle(C.sheet, 1)
            frames.fillRoundedRect(
                SHEET.x + 12,
                SHEET.y + FRAME_PAD + HEADER_H - 4,
                SHEET.w - 24,
                SHEET.h - FRAME_PAD - HEADER_H - 8,
                20,
            )

            // ── o cabeçalho: FORA · REPITA [ ] VEZES ─────────────────────
            const hy = SHEET.y + FRAME_PAD + HEADER_H / 2 - 4
            let cursor = SHEET.x + 30
            cursor += pill(cursor, hy, 'FORA', C.sheet, CSS.outer) + 18

            const repita = label(cursor, hy, 'REPITA', 36, CSS.white)
            repita.setStroke(CSS.ink, 5)
            cursor += repita.width + 14

            const chipW = next.outer === 'times' ? CHIP.w : SIGN_CHIP.w
            addPiece('outer', { x: cursor + chipW / 2, y: hy, w: chipW, h: CHIP.h })
            cursor += chipW + 14

            if (next.outer === 'times') {
                const vezes = label(cursor, hy, 'VEZES', 36, CSS.white)
                vezes.setStroke(CSS.ink, 5)
            } else {
                const ate = label(cursor, hy, 'ATÉ', 36, CSS.white)
                ate.setStroke(CSS.ink, 5)
            }

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

            // ── os espaços do corpo, com o rótulo em cima ────────────────
            body.slots.forEach(slot => {
                if (!pieces.has(slot.id)) addPiece(slot.id, slot, true)
                const tag = scene.add
                    .text(slot.x, slot.y - slot.h / 2 - TAG_H / 2 - 4, slot.tag, {
                        fontFamily: FONT.black,
                        fontSize: '20px',
                        color: slot.id === 'innerMove' ? CSS.inner : CSS.inkSoft,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                tags.add(tag)
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
                    const icon = moveIcon(scene, value.move, 66, C.ink, C.inkSoft)
                    icon.setPosition(0, -14)
                    piece.content.add(icon)
                    const name = scene.add
                        .text(0, piece.box.h / 2 - 24, MOVE_NAME[value.move], {
                            fontFamily: FONT.black,
                            fontSize: '24px',
                            color: CSS.ink,
                        })
                        .setOrigin(0.5)
                        .setResolution(2)
                    piece.content.add(name)
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
            return { x: SHEET.x + SHEET.w / 2, y: SHEET.y + SHEET.h / 2, w: SHEET.w + 34, h: SHEET.h + 34 }
        },

        /** Só o corpo, sem o cabeçalho — o tutorial aponta os movimentos. */
        bodyBounds() {
            if (!sheet) return this.bounds()
            const body = bodyOf(sheet)
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
