import { GROUND, RAMP, SKATER } from './layout'
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
