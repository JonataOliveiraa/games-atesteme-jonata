import type { SheetDef, SlotId } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    veil: 4,
    floor: 6,
    dancer: 10,
    lamp: 14,
    panel: 20,
    frame: 24,
    slot: 30,
    chip: 36,
    tray: 40,
    fly: 60,
    fx: 200,
    hud: 500,
}

export const HUD = {
    h: 88,
    cy: 44,
    dotX: 54,
    dotGap: 42,
    dotR: 14,
    titleX: 400,
    livesX: 1020,
    helpX: 1206,
    helpR: 30,
    /** 136 px de hitbox: o `?` pequeno num canto é o alvo que dedo infantil mais erra. */
    helpHit: 136,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS CINCO FAIXAS DO §5
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O pedido atravessa o topo inteiro; embaixo dele o palco fica à esquerda e a
 * ficha à direita, lado a lado, porque as duas coisas precisam ser lidas AO
 * MESMO TEMPO durante o ensaio — é assim que a criança liga o bloco que
 * acende ao passo que sai. A bandeja e o DANÇAR ocupam a faixa de baixo.
 */
export const REQUEST = { x: 40, y: 96, w: 1060, h: 104 }
export const STAGE = { x: 36, y: 212, w: 452, h: 302 }
export const SHEET = { x: 514, y: 212, w: 728, h: 302 }
export const TRAY = { x: 40, y: 536, w: 980, h: 172 }
export const DANCE = { x: 1040, y: 536, w: 200, h: 172 }

/** Onde o pé do dançarino toca o piso do palco desenhado no fundo. */
export const DANCER = { x: 218, footY: 496, height: 224 }

/** A lâmpada do nível 3 — desenhada, nunca parte do fundo. */
export const LAMP = { x: 418, y: 286, r: 40 }

/** Alvos editáveis: 156 × 132 dão ~47 × 40 px reais no celular a 0,30. */
export const SLOT = { w: 156, h: 132 }
export const TAG_H = 26
export const CHIP = { w: 96, h: 64 }
export const SIGN_CHIP = { w: 286, h: 64 }

export const FRAME_PAD = 16
export const HEADER_H = 60
export const GAP = 22

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface SlotBox extends Rect {
    id: SlotId
    tag: string
}

export interface Body {
    /** A faixa do corpo do laço externo, abaixo do cabeçalho. */
    area: Rect
    innerFrame: Rect | null
    slots: SlotBox[]
}

/** A moldura interna: o rótulo DENTRO, a coluna do contador e o movimento. */
export const INNER = { w: 408, h: 190, col: 206, pad: 16 }

const centered = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h })

/**
 * Onde mora cada peça do corpo do laço externo.
 *
 * Tudo em coordenadas de CENTRO, que é o que um container do Phaser quer, e a
 * fila é montada da esquerda para a direita e depois centrada no quadro: uma
 * ficha de um espaço só não pode ficar encostada na borda esquerda enquanto a
 * de três ocupa o quadro inteiro.
 */
export function bodyOf(sheet: SheetDef): Body {
    const top = SHEET.y + FRAME_PAD + HEADER_H + 6
    const area = centered(
        SHEET.x + SHEET.w / 2,
        top + (SHEET.y + SHEET.h - FRAME_PAD - top) / 2,
        SHEET.w - FRAME_PAD * 2,
        SHEET.y + SHEET.h - FRAME_PAD - top,
    )

    const pieces: { w: number; kind: 'slot' | 'inner'; id?: SlotId; tag?: string }[] = []
    if (sheet.leading >= 1) pieces.push({ w: SLOT.w, kind: 'slot', id: 'lead1', tag: 'MOVIMENTO' })
    if (sheet.leading >= 2) pieces.push({ w: SLOT.w, kind: 'slot', id: 'lead2', tag: 'DEPOIS' })
    if (sheet.nested) pieces.push({ w: INNER.w, kind: 'inner' })
    if (sheet.trailing) pieces.push({ w: SLOT.w, kind: 'slot', id: 'after', tag: 'DEPOIS' })

    const total = pieces.reduce((n, p) => n + p.w, 0) + GAP * Math.max(0, pieces.length - 1)
    let cursor = area.x - total / 2

    let innerFrame: Rect | null = null
    const slots: SlotBox[] = []

    for (const piece of pieces) {
        const cx = cursor + piece.w / 2
        if (piece.kind === 'inner') {
            innerFrame = centered(cx, area.y, INNER.w, INNER.h)
            // dentro da moldura: a coluna do contador à esquerda, o passo à direita
            const right = cx + INNER.w / 2 - INNER.pad - SLOT.w / 2
            slots.push({
                id: 'innerMove',
                tag: 'MOVIMENTO',
                x: right,
                y: area.y + TAG_H / 2,
                w: SLOT.w,
                h: SLOT.h,
            })
        } else {
            slots.push({ id: piece.id!, tag: piece.tag!, x: cx, y: area.y + TAG_H / 2, w: SLOT.w, h: SLOT.h })
        }
        cursor += piece.w + GAP
    }

    return { area, innerFrame, slots }
}

/** A coluna `REPITA __ VEZES` da moldura interna, à esquerda do movimento. */
export function innerCounterColumn(frame: Rect) {
    return {
        x: frame.x - frame.w / 2 + INNER.pad + INNER.col / 2,
        y: frame.y + TAG_H / 2,
        w: INNER.col,
        h: SLOT.h,
    }
}
