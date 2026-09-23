import { COURSE, GROUND, LEDGE, RAMP, SKATER, W } from './layout'
import type { TrickKind } from '../types'

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  A GEOMETRIA DAS MANOBRAS — uma fonte só
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Cada manobra é uma lista de pontos por onde as RODAS passam. Isto existe
 * como dado puro, sem Phaser, porque DUAS coisas diferentes precisam dele e
 * elas não podem discordar:
 *
 *  - o `park` faz o skatista percorrer estes pontos;
 *  - o `plan` DESENHA estes pontos como a linha tracejada sobre o parque.
 *
 * Se a animação e o desenho tivessem cada um a sua conta, a criança veria um
 * caminho previsto e um caminho executado que não batem — e o jogo inteiro
 * depende de ela confiar que a linha que ela montou é a linha que vai rodar.
 *
 * `y` é a altura das RODAS: `GROUND.y` quando está no chão.
 */

export type MoveFrame = 'parado' | 'empurra' | 'agacha' | 'ar'

export interface Step {
    x: number
    y: number
    ms: number
    ease: string
    frame: MoveFrame
}

/**
 * Onde o skatista para antes de executar a manobra daquele marco.
 *
 * O ollie precisa de MAIS PISTA que as outras duas, e por causa do desenho:
 * a caixa que chegou tem 240 px de largura, cinco vezes mais larga que alta.
 * Saltando a 108 px do centro dela, o skatista começaria a subir já em cima
 * da borda esquerda e atravessaria a peça. Daí os 190.
 */
export const approachX = (kind: TrickKind, markX: number) =>
    markX - (kind === 'pular' ? 190 : 108)

export function trickPath(kind: TrickKind, markX: number): Step[] {
    const g = GROUND.y

    if (kind === 'empurrar') {
        return [
            { x: markX + 110, y: g, ms: 380, ease: 'Sine.easeOut', frame: 'empurra' },
        ]
    }

    if (kind === 'pular') {
        /* O arco abre bem antes da caixa e fecha bem depois dela: nos dois
         * extremos da peça o skatista já está a mais de 70 px do chão, e a
         * caixa tem 45. É folga medida, não chutada. */
        return [
            { x: markX - 180, y: g, ms: 90, ease: 'Sine.easeOut', frame: 'agacha' },
            { x: markX + 10, y: g - SKATER.jumpH, ms: 330, ease: 'Sine.easeOut', frame: 'ar' },
            { x: markX + 190, y: g, ms: 330, ease: 'Sine.easeIn', frame: 'ar' },
        ]
    }

    /* A subida da rampa é uma transição, não um pulo: x avança pouco e y sobe
     * muito no primeiro trecho — é o desenho de um quarter-pipe. */
    return [
        { x: markX + RAMP.w / 2, y: g - RAMP.h, ms: 340, ease: 'Sine.easeOut', frame: 'agacha' },
        { x: markX + RAMP.w / 2 + 40, y: g - SKATER.rampH, ms: 240, ease: 'Sine.easeOut', frame: 'ar' },
        { x: markX + RAMP.w / 2 + 120, y: g, ms: 320, ease: 'Sine.easeIn', frame: 'ar' },
    ]
}

/** Onde o skatista fica depois de executar a manobra daquele marco. */
export function endX(kind: TrickKind, markX: number): number {
    const path = trickPath(kind, markX)
    return path[path.length - 1].x
}

/** Metade da largura do desenho que mora no marco: nada, rampa ou caixote. */
const halfArt = (kind: TrickKind) =>
    kind === 'subir' ? RAMP.w / 2 : kind === 'pular' ? LEDGE.w / 2 : 40

/**
 * ONDE CADA MARCO FICA, a partir das manobras que resolvem cada um.
 *
 * O marco seguinte começa depois de três coisas somadas: o fim da manobra
 * deste (onde o skatista pousa), a corrida que a próxima pede antes do marco
 * e a folga `COURSE.gap`. E nunca mais perto do que as duas peças desenhadas
 * permitem, para uma rampa não encostar no caixote.
 */
export function courseXs(line: TrickKind[]): number[] {
    const xs: number[] = []
    line.forEach((kind, i) => {
        if (i === 0) {
            xs.push(COURSE.firstX)
            return
        }
        const prev = line[i - 1]
        const px = xs[i - 1]
        const landing = endX(prev, px) - px
        const runUp = 0 - approachX(kind, 0)
        const byMoves = landing + runUp + COURSE.gap
        const byArt = halfArt(prev) + halfArt(kind) + COURSE.gap
        xs.push(px + Math.max(byMoves, byArt))
    })
    return xs
}

/** A largura do mundo: da largada até a pista livre depois da última manobra. */
export function worldWidth(line: TrickKind[], xs: number[]): number {
    const last = xs.length - 1
    const end = last >= 0 ? endX(line[last], xs[last]) : SKATER.startX
    return Math.max(W, Math.ceil(end + COURSE.tail))
}
