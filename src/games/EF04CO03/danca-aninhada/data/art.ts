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
    icons: 'dance-move-icons',
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

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FOLHA DOS PICTOGRAMAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Silhueta chapada em preto sobre alfa real, três células. Quem dá a cor é o
 * `setTint`: os três aparecem em quatro tamanhos e em duas cores, e um PNG
 * por cor seriam seis arquivos que precisariam concordar entre si.
 *
 * O §5 do TEXTURAS.md pediu 768 × 256; veio 900 × 300. Não importa: o quadro
 * sai da divisão da largura entregue por três, no `BootScene`.
 *
 * ── AS CAIXAS SÃO MEDIDAS, E NÃO A CÉLULA ────────────────────────────────
 *
 * Os três desenhos não ocupam a célula inteira nem ocupam o mesmo tanto: a
 * pegada tem 136 × 260 e a seta, 219 × 238. Esticar cada célula para um
 * quadrado — que é o que `setDisplaySize(s, s)` faz — achataria a seta e
 * espremeria o pé.
 *
 * Então a escala vem da ALTURA, que é quase igual nos três, e a âncora vem do
 * centro da caixa alfa. É o que deixa os três com o mesmo peso ótico e
 * parados no mesmo ponto, do cartão de 44 px à legenda de 96.
 */

export const ICON_FRAME: Record<'step' | 'clap' | 'spin', string> = {
    step: 'step',
    clap: 'clap',
    spin: 'spin',
}

interface Box {
    x: number
    y: number
    w: number
    h: number
}

/** Caixas alfa medidas na folha entregue, em coordenadas da célula de 300. */
export const ICON_BOX: Record<'step' | 'clap' | 'spin', Box> = {
    step: { x: 90, y: 22, w: 136, h: 260 },
    clap: { x: 51, y: 15, w: 204, h: 267 },
    spin: { x: 40, y: 32, w: 219, h: 238 },
}

/** A maior das três alturas: a referência única de escala. */
export const ICON_H = 267

export const iconScale = (size: number) => size / ICON_H

/** Fração da célula onde está o centro do desenho. */
export const iconOrigin = (box: Box, cell: number) => ({
    x: (box.x + box.w / 2) / cell,
    y: (box.y + box.h / 2) / cell,
})
