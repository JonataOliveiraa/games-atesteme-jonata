import { PROPS_SHEET, ROOM, SUPORTE } from './art'
import type { Editor } from '../types'

/**
 * Tela fixa de 1280 × 720, com `Scale.FIT`. Nada aqui é relativo.
 *
 * ── A VERTICAL É O ORÇAMENTO APERTADO ────────────────────────────────────
 *
 * O fundo entregue manda nos três cortes: a parede acaba em y 417, o tampo da
 * bancada começa em 482 e a frente dele em 635. Então a área de jogo tem 400 px
 * úteis (82 → 482) e a bancada tem 153. Foi dentro dessas duas faixas que tudo
 * abaixo coube, e é por isso que o quadro não pode crescer mais: ele já encosta
 * no tampo.
 *
 * O piso continua sendo o dedo — a conta é o tamanho real num celular de
 * 390 px (fator 0,30):
 *
 *   botão de ferramenta  184 × 140  →  55 × 42 px reais
 *   ENTREGAR             272 × 156  →  82 × 47 px reais
 *   vão entre eles           324    →  97 px reais
 */
export const W = 1280
export const H = 720

export const HUD = {
    h: 82,
    cy: 41,
    pillX: 20,
    pillY: 18,
    pillW: 126,
    pillH: 46,
    dotX: 176,
    dotGap: 42,
    dotR: 14,
    titleX: 620,
    livesX: 1006,
    helpX: 1212,
    helpR: 28,
    helpHit: 128,
} as const

/* ─────────────────────────────────────────── o cliente e o balão, à esquerda */

export const BALLOON = {
    x: 22,
    y: 90,
    w: 470,
    h: 106,
    tailX: 240,
    tailDrop: 22,
    pad: 26,
    wrap: 414,
} as const

export const CLIENT = {
    cx: 240,
    /** os pés, na faixa de chão que sobra entre a parede e a bancada */
    feetY: ROOM.benchTop - 2,
    scale: 0.52,
} as const

/* ───────────────────────────────────────────────── a peça, no meio da parede */

const CELL = PROPS_SHEET.frameWidth

/**
 * A escala de cada suporte.
 *
 * Os três têm de caber na faixa de parede livre — 395 px entre o cabeçalho e o
 * tampo da bancada. O telão é o mais alto dos três (474 de célula), então é ele
 * que fica com a menor escala.
 */
const SUPORTE_SCALE: Record<Editor, number> = { texto: 1.08, slides: 0.82, video: 0.85 }

export interface SuporteGeo {
    frame: number
    scale: number
    /** Onde o sprite fica dentro do contêiner, para o CENTRO DO OBJETO cair na origem. */
    spriteDX: number
    spriteDY: number
    /** O centro da área lisa, em relação ao centro do objeto. */
    innerDX: number
    innerDY: number
    innerW: number
    innerH: number
    outerW: number
    outerH: number
}

/**
 * O contêiner da peça é ancorado no CENTRO DO OBJETO, e o conteúdo num filho
 * posto no centro da ÁREA LISA.
 *
 * Nenhum dos três suportes tem o miolo no centro da célula — a cortiça está 5 px
 * à direita, a tela do telão 30 px acima. Ancorar tudo no centro da célula
 * deixaria o conteúdo colado na moldura de um lado só, e de um jeito diferente
 * em cada nível.
 */
export function suporteGeo(editor: Editor): SuporteGeo {
    const box = SUPORTE[editor]
    const s = SUPORTE_SCALE[editor]
    return {
        frame: box.frame,
        scale: s,
        spriteDX: -(box.outer.cx - 0.5) * CELL * s,
        spriteDY: -(box.outer.cy - 0.5) * CELL * s,
        innerDX: (box.inner.cx - box.outer.cx) * CELL * s,
        innerDY: (box.inner.cy - box.outer.cy) * CELL * s,
        innerW: box.inner.w * CELL * s,
        innerH: box.inner.h * CELL * s,
        outerW: box.outer.w * CELL * s,
        outerH: box.outer.h * CELL * s,
    }
}

export const PIECE = { cx: 796, cy: 290 } as const

const TEXTO = suporteGeo('texto')

/** O papel pregado na cortiça, e o que cabe dentro dele. Coordenadas locais. */
export const PAPER = {
    w: TEXTO.innerW - 24,
    h: TEXTO.innerH - 24,
    radius: 10,
} as const

export const CONTENT = {
    w: PAPER.w - 28,
    h: PAPER.h - 28,
    titleY: -98,
    imageY: 2,
    imageH: 112,
    phraseY: 96,
    phraseSize: 19,
} as const

/** A borda esquerda do conteúdo: é para cá que o título anda quando sai do meio. */
export const CONTENT_LEFT = -CONTENT.w / 2

/**
 * O slide que está passando no telão.
 *
 * O texto começa em `bodySemFoto` e desce até a borda de baixo; quando não cabe,
 * ele é cortado ali — o mesmo idioma do título que estoura o cartaz no nível 1.
 * Com foto, o espaço do texto encolhe, e é por isso que cabe menos coisa.
 */
export const SLIDE = {
    pad: 18,
    dotsY: -117,
    titleY: -86,
    fotoY: -20,
    fotoH: 76,
    bodySemFoto: -50,
    bodyComFoto: 26,
    /*
     * 24 px, e não 20.
     *
     * Com 20 px as seis frases terminavam a QUINZE pixels da borda: o slide
     * ficava cheio mas parecia inteiro, e o bilhete dizia que não cabia. Com 24
     * a quinta linha é cortada no meio e a sexta nem aparece — aí o "não acaba
     * mais" do cliente é uma coisa que se vê.
     */
    bodySize: 24,
    lineGap: 12,
    /*
     * A SOBRA — as frases que não couberam, caídas para fora do telão.
     *
     * A faixa com setinhas que estava aqui antes era um símbolo a aprender: ela
     * avisava que faltava coisa sem mostrar QUE coisa. As frases que sobraram,
     * escritas numa tirinha de papel caída embaixo da tela, dizem a mesma coisa
     * sem ninguém precisar explicar — e mostram exatamente o que DIVIDIR vai
     * levar para o segundo slide.
     */
    sobraY: 150,
    sobraSize: 20,
    sobraPad: 12,
} as const

/** O vídeo dentro da tela do celular. */
export const VIDEO = {
    pad: 12,
    frameH: 190,
    barH: 30,
    mixY: 112,
} as const

/* ──────────────────────────────────────────── a bancada, embaixo, na madeira */

export const TOOL = {
    w: 184,
    h: 140,
    cy: 568,
    xs: [136, 344, 552],
    labelDY: 50,
    iconDY: -16,
} as const

export const DELIVER = {
    cx: 1104,
    cy: 570,
    w: 272,
    h: 156,
} as const

export const DEPTH = {
    room: 0,
    veil: 1,
    client: 10,
    balloon: 14,
    piece: 20,
    bench: 40,
    benchHit: 41,
    hud: 60,
    frame: 70,
} as const

export { ROOM }
