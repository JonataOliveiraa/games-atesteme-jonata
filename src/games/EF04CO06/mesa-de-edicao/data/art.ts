/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS FOLHAS, MEDIDAS EM VEZ DE SUPOSTAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O TEXTURAS.md pediu suportes 1024, clientes 1024 × 768 e acervo 768 × 512.
 * Vieram 1000 × 1000, 1480 × 1040 e 1200 × 800 — as grades bateram, os
 * tamanhos não. Os números abaixo são os da folha ENTREGUE, medidos pelo
 * canal alfa, e é por eles que o layout se guia.
 *
 *   suportes  f0 quadro de cortiça  caixa (28,67) 452×368  miolo (65,108) 381×290
 *             f1 telão              caixa (41,21) 429×474  tela  (53,60) 384×321
 *             f2 celular            caixa (87,33) 328×454  tela (148,76) 205×332
 *   clientes  f0 Téo parado         caixa (103,10) 175×510, pés na base
 *             f4 Téo comemorando    caixa (58,0)  267×499, pés a 4% do chão
 *   acervo    f0 teatro             caixa (12,61) 379×302
 */

export const SHEET = {
    room: 'me-room',
    props: 'me-props',
    people: 'me-people',
    art: 'me-art',
} as const

export const PROPS_SHEET = { frameWidth: 500, frameHeight: 500 }
export const PEOPLE_SHEET = { frameWidth: 370, frameHeight: 520 }
export const ART_SHEET = { frameWidth: 400, frameHeight: 400 }

export const PROP_FRAME = { cork: 0, screen: 1, phone: 2, box: 3 } as const

/** O feliz de cada cliente é o parado + 4: a folha tem uma linha por estado. */
export const PEOPLE = { teo: 0, bia: 1, zila: 2, vovo: 3 } as const
export const HAPPY_OFFSET = 4

export const ART_FRAME = {
    teatro: 0,
    horta: 1,
    festa: 2,
    feijao: 3,
    bolo: 4,
    trilha: 5,
} as const

/**
 * Os três suportes, em fração da célula de 500.
 *
 * `outer` é o objeto inteiro — é ele que dá o tamanho na tela. `inner` é a área
 * lisa (cortiça, tela do telão, tela do celular), e é o único lugar onde a peça
 * pode ser desenhada. Nenhum dos três tem o miolo no centro da célula, e ancorar
 * no centro deixaria o conteúdo encostado na moldura de um lado só.
 */
export const SUPORTE = {
    texto: {
        frame: PROP_FRAME.cork,
        outer: { cx: 254 / 500, cy: 251 / 500, w: 452 / 500, h: 368 / 500 },
        inner: { cx: 255.5 / 500, cy: 253 / 500, w: 381 / 500, h: 290 / 500 },
    },
    slides: {
        frame: PROP_FRAME.screen,
        outer: { cx: 255.5 / 500, cy: 258 / 500, w: 429 / 500, h: 474 / 500 },
        inner: { cx: 244.5 / 500, cy: 220 / 500, w: 384 / 500, h: 321 / 500 },
    },
    video: {
        frame: PROP_FRAME.phone,
        outer: { cx: 251 / 500, cy: 260 / 500, w: 328 / 500, h: 454 / 500 },
        inner: { cx: 250 / 500, cy: 241.5 / 500, w: 205 / 500, h: 332 / 500 },
    },
} as const

/** A caixa alfa de cada ilustração do acervo, em fração da célula de 400. */
export const ART_BOX: Array<{ cx: number; cy: number; w: number; h: number }> = [
    { cx: 0.504, cy: 0.531, w: 0.948, h: 0.755 },
    { cx: 0.507, cy: 0.532, w: 0.917, h: 0.853 },
    { cx: 0.508, cy: 0.505, w: 0.755, h: 0.920 },
    { cx: 0.493, cy: 0.497, w: 0.585, h: 0.947 },
    { cx: 0.502, cy: 0.488, w: 0.893, h: 0.890 },
    { cx: 0.503, cy: 0.510, w: 0.935, h: 0.820 },
]

/**
 * Os marcos do fundo, já na grade de 1280 × 720.
 *
 * O PNG tem 1672 × 941 e entra esticado para a tela inteira (as duas caixas são
 * 16:9), então é só multiplicar por 720/941. São estes três números que dizem
 * onde o cliente pisa e onde a bancada começa — chutar qualquer um deles põe
 * gente flutuando ou botão no ar.
 */
export const ROOM = {
    wallLine: Math.round(545 * (720 / 941)),
    benchTop: Math.round(630 * (720 / 941)),
    benchFront: Math.round(830 * (720 / 941)),
    shelfX: Math.round(1470 * (1280 / 1672)),
} as const
