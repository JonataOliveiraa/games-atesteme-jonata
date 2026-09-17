/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS FOLHAS, MEDIDAS EM VEZ DE SUPOSTAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O TEXTURAS.md pediu folhas de 256; elas chegaram maiores e com o desenho
 * ocupando frações diferentes em cada quadro — o estádio é largo e baixo, a
 * escola é alta, a Duda de cadeira de rodas é o dobro da largura do Téo.
 *
 *   estacoes.png      1600 × 800   →  4 × 2 de 400 × 400
 *   passageiros.png   1400 × 800   →  4 × 2 de 350 × 400   (chegou com 1399:
 *                                     1 px de largura a menos deixava a célula
 *                                     em 349,75 e o recorte andava de quadro
 *                                     em quadro; foi normalizada para 1400)
 *
 * Por isso o jogo NÃO usa o centro do quadro: cada peça é ancorada pela caixa
 * alfa medida abaixo — centro horizontal do desenho e BASE dele. É o que faz
 * prédio e criança pisarem na mesma linha, com qualquer enquadramento.
 */

export const KEY = {
    city: 'mm-city',
    stations: 'mm-stations',
    riders: 'mm-riders',
    train: 'mm-train',
    /** a peça que fica no estoque, em cima da bandeja */
    piece: 'mm-piece',
    /** o pedaço de via que se REPETE ao longo da ligação */
    tile: 'mm-tile',
} as const

export const STATIONS_SHEET = { frameWidth: 400, frameHeight: 400 }
export const RIDERS_SHEET = { frameWidth: 350, frameHeight: 400 }

export interface ArtBox {
    /** canto esquerdo do desenho, em fração da célula */
    x: number
    /** largura do desenho, em fração da célula */
    w: number
    /** altura do desenho, em fração da célula */
    h: number
    /** onde o desenho ENCOSTA embaixo, em fração da célula */
    base: number
}

/** `estacoes.png`, quadro a quadro. Medido pelo canal alfa. */
export const STATION_BOX: ArtBox[] = [
    { x: 0.0575, w: 0.935, h: 0.905, base: 0.9525 },
    { x: 0.0125, w: 0.9725, h: 0.88, base: 0.9625 },
    { x: 0.0375, w: 0.96, h: 0.8725, base: 0.96 },
    { x: 0.0425, w: 0.92, h: 0.7825, base: 0.965 },
    { x: 0.04, w: 0.9175, h: 0.7525, base: 0.92 },
    { x: 0.0425, w: 0.93, h: 0.745, base: 0.9075 },
    { x: 0.0675, w: 0.87, h: 0.7375, base: 0.92 },
    { x: 0.0125, w: 0.98, h: 0.745, base: 0.9175 },
]

/** `passageiros.png`: 0..3 esperando, 4..7 as MESMAS quatro chegando. */
export const RIDER_BOX: ArtBox[] = [
    { x: 0.2771, w: 0.4914, h: 0.9575, base: 0.985 },
    { x: 0.22, w: 0.56, h: 0.945, base: 0.9775 },
    { x: 0.1057, w: 0.7857, h: 0.9475, base: 0.995 },
    { x: 0.2229, w: 0.6114, h: 0.94, base: 0.9925 },
    { x: 0.0629, w: 0.8857, h: 0.9375, base: 0.9875 },
    { x: 0.1629, w: 0.7371, h: 0.9425, base: 0.9875 },
    { x: 0.0029, w: 0.9829, h: 0.93, base: 0.9825 },
    { x: 0.2286, w: 0.6029, h: 0.9625, base: 0.9925 },
]

/** `trilho-icone.png`: o desenho é diagonal e ocupa só a faixa do meio. */
export const PIECE_BOX: ArtBox = { x: 0.0275, w: 0.94, h: 0.425, base: 0.7325 }

/** `trem.png`, medido igual. A âncora vertical sobe um pouco: o trem não
 *  PISA no trilho, ele monta nele — as rodas abraçam a linha. */
export const TRAIN_BOX: ArtBox = { x: 0.016, w: 0.96, h: 0.935, base: 0.965 }

/**
 * A escala que faz o desenho caber, e a âncora que faz ele pisar.
 *
 * `setOrigin` do Phaser é fração do QUADRO — que é exatamente o que a caixa
 * medida entrega: origem horizontal no meio do desenho, vertical na base dele.
 */
export function fitArt(
    box: ArtBox,
    frame: { frameWidth: number; frameHeight: number },
    limit: { h: number; w: number },
) {
    const drawnW = box.w * frame.frameWidth
    const drawnH = box.h * frame.frameHeight
    return {
        scale: Math.min(limit.h / drawnH, limit.w / drawnW),
        originX: box.x + box.w / 2,
        originY: box.base,
    }
}
