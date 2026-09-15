/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS FOLHAS, MEDIDAS EM VEZ DE SUPOSTAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O TEXTURAS.md pediu `canhao-de-tinta.png` em 1024 × 256, grade 4 × 1. Veio
 * 1725 × 450 com TRÊS quadros — repouso, disparo e fumaça. Os números abaixo
 * são os da folha entregue, medidos pelo canal alfa, e é por eles que o código
 * se guia.
 */

export const SHEET = {
    courtyard: 'coords-courtyard',
    cannon: 'coords-cannon',
}

export const CANNON_SHEET = { frameWidth: 575, frameHeight: 450 }

/** A folha tem três estados; o quarto (`settle`) do plano não foi entregue. */
export const CANNON_FRAME = {
    idle: 0,
    fire: 1,
    smoke: 2,
} as const

/**
 * ── POR QUE A ÂNCORA É FIXA, E NÃO A CAIXA DE CADA QUADRO ────────────────
 *
 * As três caixas alfa medidas são bem diferentes entre si:
 *
 *     f0 repouso  x=132 y=145 w=310 h=272   base 417
 *     f1 disparo  x=125 y=132 w=437 h=284   base 416
 *     f2 fumaça   x=140 y= 95 w=415 h=334   base 429
 *
 * O que cresce em f1 e f2 é o JATO e a FUMAÇA, não o canhão. Centrar cada
 * quadro pela sua própria caixa faria a peça pular para a esquerda e afundar
 * 12 px no exato instante do tiro — como se o canhão andasse sozinho.
 *
 * Então a âncora é uma só, tirada do centro do CORPO no quadro de repouso, e
 * vale para os três. O jato e a fumaça saem para fora dela, que é o que eles
 * devem fazer.
 */
export const CANNON_BODY = { x: 132, y: 145, w: 310, h: 272 }

export const cannonOrigin = () => ({
    x: (CANNON_BODY.x + CANNON_BODY.w / 2) / CANNON_SHEET.frameWidth,
    y: (CANNON_BODY.y + CANNON_BODY.h / 2) / CANNON_SHEET.frameHeight,
})

/** Escala para o CORPO ocupar a largura pedida, ignorando jato e fumaça. */
export const cannonScale = (width: number) => width / CANNON_BODY.w

/**
 * Onde a boca do cano fica, em fração da célula, para a gota nascer ali.
 *
 * Tirado do quadro de disparo: o jato começa logo à direita e acima do centro
 * do corpo. Sem isso a gota sairia do meio do canhão.
 */
export const MUZZLE = { x: 0.66, y: 0.46 }
