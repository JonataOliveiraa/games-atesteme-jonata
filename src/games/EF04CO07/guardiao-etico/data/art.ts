/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS FOLHAS, MEDIDAS EM VEZ DE SUPOSTAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O TEXTURAS.md pediu a lupa em 512 × 512 com o vidro em 42 % × 42 % e raio de
 * 30 %. Ela chegou em 800 × 800, e o buraco do vidro foi medido pelo canal alfa
 * (179 371 pixels transparentes cercados por desenho):
 *
 *   buraco  x 81 y 80  483 × 474   →  centro 0,4025 × 0,3956   raio 0,3019
 *
 * O jogo ancora a arte pelo CENTRO DO VIDRO, nunca pelo centro do PNG — é isso
 * que faz o aumento cair no lugar certo com qualquer enquadramento que vier.
 */

export const SHEET = {
    desk: 'ge-desk',
    people: 'ge-people',
    art: 'ge-art',
    tools: 'ge-tools',
    lens: 'ge-lupa',
} as const

export const PEOPLE_SHEET = { frameWidth: 288, frameHeight: 288 }
export const ART_SHEET = { frameWidth: 512, frameHeight: 512 }
export const TOOLS_SHEET = { frameWidth: 256, frameHeight: 256 }

/** O vidro da `lupa.png`, em fração da imagem. Medido, não pedido. */
export const LENS_ART = {
    glassX: 0.4025,
    glassY: 0.3956,
    glassR: 0.3019,
} as const
