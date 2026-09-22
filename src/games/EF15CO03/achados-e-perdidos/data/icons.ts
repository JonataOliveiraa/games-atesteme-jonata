import type { Value } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  `icones.png` — 3 × 1 de 256 × 256
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  A GOTA É BRANCA, e quem pinta é o `setTint`. Quatro gotas desenhadas à mão
 *  seriam quatro chances de o azul da carta não ser o azul do bichinho — e
 *  neste jogo a cor é a pergunta, não a decoração.
 *
 *  O `tint` do Phaser multiplica: `branco × azul = azul`, `preto × azul =
 *  preto`. Por isso o miolo da gota tem de ser branco PURO no arquivo; um
 *  cinza claro ali devolve um azul lavado, e o defeito só aparece ao lado do
 *  bichinho.
 *
 *  O chapéu e os óculos NÃO são tingidos: eles já vêm nas cores fixas deles,
 *  porque o acessório nunca pode ter cor de atributo.
 */
export const ICON_SHEET = {
    key: 'icones',
    frameWidth: 256,
    frameHeight: 256,
} as const

export const ICON_FRAME: Record<Value, number> = {
    blue: 0,
    green: 0,
    red: 0,
    yellow: 0,
    hat: 1,
    glasses: 2,
    /* o tamanho e Graphics, nunca quadro: ele e uma COMPARACAO (ver createIcon) */
    big: -1,
    small: -1,
}

/**
 * A caixa alfa MEDIDA de cada quadro, na célula de 256. Daqui saem duas
 * coisas que a escala pela célula não dá:
 *
 * - **cada ícone enche a própria caixa** (`size / maior lado`), em vez de
 *   herdar o vazio que sobrou em volta dele no arquivo. Sem isso a gota, que
 *   é estreita e alta, sai 20 % menor que o chapéu, que é largo e baixo — e
 *   os três precisam ter o mesmo peso a 72 px reais;
 * - **o centro é o da caixa, não o da célula.** Os óculos foram desenhados
 *   5,5 px abaixo do meio, e sem corrigir isso eles ficam caídos dentro da
 *   moldura do campo.
 */
export const ICON_BOX = [
    { w: 148, h: 214, cx: 124, cy: 131 },
    { w: 236, h: 124, cx: 129, cy: 127 },
    { w: 215, h: 91, cx: 128.5, cy: 133.5 },
] as const

/** Só a gota recebe tinta. O chapéu e os óculos vão como estão. */
export const TINTED: Record<Value, boolean> = {
    blue: true,
    green: true,
    red: true,
    yellow: true,
    hat: false,
    glasses: false,
    big: false,
    small: false,
}
