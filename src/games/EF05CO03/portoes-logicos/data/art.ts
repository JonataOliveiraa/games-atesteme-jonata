/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FOLHA, MEDIDA EM VEZ DE SUPOSTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `criaturinhas.png` veio certinha: 1280 × 512, grade regular de 5 × 2 células
 * de 256. Então o quadro é `load.spritesheet` mesmo. O que NÃO é regular é o
 * corpo dentro da célula — as caixas alfa medidas dão alturas de 221 a 235 e
 * pés entre 241 e 247.
 *
 * ── DUAS CONSEQUÊNCIAS ───────────────────────────────────────────────────
 *
 * 1. `originX` sai do centro da CAIXA ALFA, não do centro da célula. Sem isso a
 *    criaturinha desliza de lado ao trocar de quadro, como se a fila andasse.
 * 2. `footPad` é o vão entre os pés e a base da célula. Com `originY = 1` a
 *    âncora é a base da CÉLULA, então a fita passaria por baixo dos pés de umas
 *    e por dentro dos pés de outras. Descontando o `footPad` todas pisam a fita.
 *
 * ── UMA ESCALA SÓ PARA AS OITO ───────────────────────────────────────────
 *
 * `BODY_H` é a maior altura medida, e todo mundo divide por ela. Normalizar
 * cada uma pela própria altura apagaria a variação natural de 6% — que é
 * simpática — e, pior, embaralharia `é pequena`: o atributo tem de ser a ÚNICA
 * coisa que muda de tamanho na tela, e ele muda 32%, não 6%.
 */

export const SHEET = {
    criaturinhas: 'criaturinhas',
    portao: 'portao',
    curral: 'curral',
    campo: 'bg-fazendinha',
} as const

export const CELL = 256

export interface Recorte {
    /** centro horizontal da caixa alfa, em fração da célula */
    originX: number
    /** vão entre os pés e a base da célula, em pixels da folha */
    footPad: number
}

/** Índice = quadro na folha. Medido pelo canal alfa em 17/09/2026. */
export const RECORTE: Recorte[] = [
    { originX: 0.508, footPad: 10 },
    { originX: 0.527, footPad: 10 },
    { originX: 0.520, footPad: 10 },
    { originX: 0.514, footPad: 9 },
    { originX: 0.525, footPad: 9 },
    { originX: 0.502, footPad: 11 },
    { originX: 0.494, footPad: 9 },
    { originX: 0.533, footPad: 15 },
]

export const BODY_H = 235

/** Altura desenhada da criaturinha grande. A pequena é esta vezes `SMALL`. */
export const TALL_H = 118
export const SMALL = 0.68

export const scaleOf = (pequena: boolean) => (TALL_H / BODY_H) * (pequena ? SMALL : 1)

/**
 * Onde pôr o sprite para os pés caírem exatamente em `y`.
 *
 * Com `originY = 1` a âncora é a base da CÉLULA, que fica `footPad` px abaixo
 * dos pés — então a âncora desce esse tanto, já na escala do desenho.
 */
export const footY = (frame: number, y: number, scale: number) =>
    y + RECORTE[frame].footPad * scale

/** Os dois ícones soltos da folha: quadro 8 é o boné, quadro 9 são os óculos. */
export const ICON = {
    chapeu: { frame: 8, originX: 0.521, originY: 0.516, box: 205 },
    oculos: { frame: 9, originX: 0.521, originY: 0.516, box: 215 },
} as const

/**
 * O portão tem o arco na MESMA posição nos dois quadros; quem se mexe é só a
 * folha da porta, que no quadro aberto desce 20 px a mais. Por isso a âncora é
 * a base da CÉLULA (constante), e não a caixa alfa (que muda entre os quadros e
 * faria o arco pular a cada abertura).
 */
export const PORTAO_ART = {
    cell: 512,
    /** caixa do arco fechado: dy 74, altura 406 */
    archTop: 74,
    archH: 406,
    boxW: 426,
    /** vão entre a base do poste e a base da célula, no quadro fechado */
    footPad: 32,
} as const

export const portaoScale = (alturaDesenhada: number) => alturaDesenhada / PORTAO_ART.archH

export const CURRAL_ART = {
    w: 700,
    h: 600,
    boxLeft: 15,
    boxTop: 122,
    boxW: 677,
    boxH: 352,
} as const

/** A cerca não é centrada no PNG: a âncora sai da caixa alfa medida. */
export const CURRAL_ORIGIN = {
    x: (CURRAL_ART.boxLeft + CURRAL_ART.boxW / 2) / CURRAL_ART.w,
    y: (CURRAL_ART.boxTop + CURRAL_ART.boxH / 2) / CURRAL_ART.h,
} as const

export const curralScale = (larguraDesenhada: number) => larguraDesenhada / CURRAL_ART.boxW
