/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FOLHA DO DANÇARINO, MEDIDA EM VEZ DE SUPOSTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O §4 do TEXTURAS.md pediu 1024 × 256 em quatro células iguais de 256. Veio
 * 1648 × 580 com as quatro poses em posições IRREGULARES: as colunas vazias
 * entre elas estão em 294–441, 738–894 e 1110–1204, e um corte uniforme de
 * 412 px passaria bem no meio do dançarino do giro.
 *
 * Então os quadros são recortes declarados, medidos pelo canal alfa, e não
 * uma grade. Cada um traz a caixa exata do corpo.
 *
 * ── A ÂNCORA É A CABEÇA E O CHÃO ─────────────────────────────────────────
 *
 * `originX` sai do centro da CABEÇA, não do centro da caixa: no passo e no
 * giro o que sai do eixo é o braço ou a perna, e centrar pela caixa faria o
 * dançarino deslizar de lado a cada pose, como se andasse sozinho.
 *
 * `originY` é 1, o pé. As quatro bases medidas (555, 559, 563, 566) caem no
 * chão do palco sem correção.
 */

export const SHEET = {
    stage: 'dance-stage',
    dancer: 'dance-dancer',
}

export type PoseKey = 'idle' | 'step' | 'clap' | 'spin'

interface Cut {
    key: PoseKey
    x: number
    y: number
    w: number
    h: number
    /** centro da cabeça, em pixels absolutos da folha */
    headX: number
}

export const CUTS: Cut[] = [
    { key: 'idle', x: 96, y: 26, w: 198, h: 529, headX: 194 },
    { key: 'step', x: 442, y: 34, w: 296, h: 525, headX: 587 },
    { key: 'clap', x: 895, y: 32, w: 215, h: 531, headX: 1001 },
    { key: 'spin', x: 1205, y: 35, w: 391, h: 531, headX: 1378 },
]

/** A altura do corpo em repouso: a referência única de escala das quatro poses. */
export const BODY_H = 529

export const originOf = (cut: Cut) => ({ x: (cut.headX - cut.x) / cut.w, y: 1 })

export const dancerScale = (height: number) => height / BODY_H
