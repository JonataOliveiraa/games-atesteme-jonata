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
export const REQUEST = { x: 40, y: 106, w: 1060, h: 96 }
export const STAGE = { x: 36, y: 212, w: 452, h: 302 }
export const SHEET = { x: 514, y: 212, w: 728, h: 302 }
export const TRAY = { x: 40, y: 536, w: 980, h: 172 }
export const DANCE = { x: 1040, y: 536, w: 200, h: 172 }

/** Onde o pé do dançarino toca o piso do palco desenhado no fundo. */
export const DANCER = { x: 218, footY: 496, height: 224 }

/**
 * ── O LUGAR DO DANÇARINO DURANTE O ENSAIO ────────────────────────────────
 *
 * Com a interface fora do caminho, ele vem para o meio e cresce. O pé fica na
 * MESMA linha do piso: é o que impede a troca de parecer um corte de câmera
 * em vez de um foco.
 */
export const FOCUS = { x: 624, footY: 496, height: 344 }

/**
 * A lâmpada do nível 3 — desenhada, nunca parte do fundo.
 *
 * Pendurada na coxia esquerda, longe de duas coisas: do dançarino, que no
 * ensaio cresce e vem para o meio, e da comparação da TRAVA, que mora no vão
 * do palco. Ela não é interface: continua em cena quando todo o resto sai.
 */
export const LAMP = { x: 108, y: 274, r: 36 }

/**
 * A comparação da TRAVA, no vão vazio do palco.
 *
 * Pendurada no cartão que divergiu, ela caía em cima do cabeçalho da ficha —
 * escondia justamente o espaço travado de que estava falando. Aqui ela fica
 * na metade da tela que não tem nada, ao lado do dançarino, e o cartão
 * continua marcado de âmbar lá em cima.
 */
export const COMPARE = { x: 388, y: 304 }

/** Alvos editáveis: 156 × 132 dão ~47 × 40 px reais no celular a 0,30. */
export const SLOT = { w: 156, h: 132 }
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
}

export interface Body {
    /** A faixa do corpo do laço externo, abaixo do cabeçalho. */
    area: Rect
    innerFrame: Rect | null
    slots: SlotBox[]
}

/** Quanto o corpo ocupa de largura, para a moldura saber de que tamanho ser. */
export function bodyWidthOf(sheet: SheetDef): number {
    const parts: number[] = []
    if (sheet.leading >= 1) parts.push(SLOT.w)
    if (sheet.leading >= 2) parts.push(SLOT.w)
    if (sheet.nested) parts.push(INNER.w)
    if (sheet.trailing) parts.push(SLOT.w)
    return parts.reduce((n, w) => n + w, 0) + GAP * Math.max(0, parts.length - 1)
}

/**
 * ── A MOLDURA TEM O TAMANHO DO PROGRAMA ──────────────────────────────────
 *
 * Era uma laje fixa de 728 × 302 com um espaço de 156 × 132 boiando dentro.
 * Um laço de um movimento e um laço aninhado de quatro peças não podem ocupar
 * a mesma área: a ficha é o que a criança escreveu, e ela deve parecer do
 * tamanho do que foi escrito.
 *
 * A altura só cresce quando existe moldura de dentro; a largura sai do maior
 * entre o cabeçalho e o corpo, medida em tempo de desenho porque depende da
 * largura real do texto `REPITA` na fonte carregada.
 */
export const SHEET_MIN_W = 470

export const sheetHeightOf = (sheet: SheetDef): number => (sheet.nested ? 296 : 238)

export function frameOf(sheet: SheetDef, headerWidth: number): Rect {
    const w = Math.min(SHEET.w, Math.max(SHEET_MIN_W, headerWidth, bodyWidthOf(sheet)) + FRAME_PAD * 4)
    const h = sheetHeightOf(sheet)
    return { x: SHEET.x + SHEET.w / 2, y: SHEET.y + SHEET.h / 2, w, h }
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
export function bodyOf(sheet: SheetDef, frame: Rect): Body {
    const top = frame.y - frame.h / 2 + FRAME_PAD + HEADER_H + 6
    const bottom = frame.y + frame.h / 2 - FRAME_PAD
    const area = centered(frame.x, (top + bottom) / 2, frame.w - FRAME_PAD * 2, bottom - top)

    const pieces: { w: number; kind: 'slot' | 'inner'; id?: SlotId }[] = []
    if (sheet.leading >= 1) pieces.push({ w: SLOT.w, kind: 'slot', id: 'lead1' })
    if (sheet.leading >= 2) pieces.push({ w: SLOT.w, kind: 'slot', id: 'lead2' })
    if (sheet.nested) pieces.push({ w: INNER.w, kind: 'inner' })
    if (sheet.trailing) pieces.push({ w: SLOT.w, kind: 'slot', id: 'after' })

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
            slots.push({ id: 'innerMove', x: right, y: area.y, w: SLOT.w, h: SLOT.h })
        } else {
            slots.push({ id: piece.id!, x: cx, y: area.y, w: SLOT.w, h: SLOT.h })
        }
        cursor += piece.w + GAP
    }

    return { area, innerFrame, slots }
}

/** A coluna `REPITA __ VEZES` da moldura interna, à esquerda do movimento. */
export function innerCounterColumn(frame: Rect) {
    return {
        x: frame.x - frame.w / 2 + INNER.pad + INNER.col / 2,
        y: frame.y,
        w: INNER.col,
        h: SLOT.h,
    }
}
