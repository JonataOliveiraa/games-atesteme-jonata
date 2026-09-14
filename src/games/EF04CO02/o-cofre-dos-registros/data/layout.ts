export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    veil: 1,
    vault: 8,
    vaultFx: 12,
    ring: 16,
    creature: 20,
    clue: 26,
    sheet: 30,
    field: 34,
    hint: 46,
    tray: 50,
    tag: 56,
    fly: 70,
    fx: 200,
    hud: 500,
}

/**
 * Da esquerda para a direita: a pílula do NÍVEL, os ferrolhos da fase, o nome
 * da ficha, as vidas e o `?`.
 *
 * `NÍVEL n` sem o total é o formato dominante do catálogo — trinta jogos,
 * entre eles os dois vizinhos de quarto ano. Os ferrolhos ao lado contam
 * fichas DENTRO do nível e reiniciam em cada um, então sem a pílula três
 * ferrolhos abertos significam a mesma coisa no nível 1 e no nível 3.
 */
export const HUD = {
    h: 88,
    cy: 44,
    pillX: 20,
    pillY: 20,
    pillW: 132,
    pillH: 48,
    dotX: 188,
    dotGap: 44,
    dotR: 15,
    titleX: 640,
    livesX: 1020,
    helpX: 1206,
    helpR: 30,
    helpHit: 136,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A TELA, ENCAIXADA NO FUNDO ENTREGUE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O §7 do planejamento fixou as caixas antes de a arte existir. O fundo que
 * chegou tem geografia própria, medida aqui em coordenadas lógicas:
 *
 *     escotilha da esquerda   x   0..157   y   0..322
 *     bancada da esquerda     topo em y 387
 *     painel liso do casco    x 253..1010  y  42..478
 *     cartazes da direita     x 1018..1125
 *     escotilha da direita    x 1133..1280 y  23..306
 *     balcão da frente        y 536..720
 *
 * Então: o painel liso recebe a FICHA, o balcão da frente recebe a BANDEJA e
 * a CÁPSULA, e a parede da esquerda recebe o aro e a pista. As caixas do §7
 * mudaram de posição, mas nenhuma encolheu abaixo do tamanho que ele garantiu
 * para o celular — a conta de cada uma está anotada no lugar.
 */

/** O aro de observação, na parede à esquerda. Graphics, nunca textura. */
export const RING = { x: 236, y: 216, r: 104 }

/** A criatura, enquadrada dentro do aro com folga. */
export const CREATURE_SPAN = 182

/** A pista, logo abaixo do aro. Até três linhas de 38 px. */
export const CLUE = { x: 24, y: 344, w: 424, h: 134 }

/**
 * A ficha, sobre o painel liso do casco.
 *
 * O container fica no CENTRO dela, e os campos são deslocamentos a partir
 * daí: é o que permite a ficha inteira encolher e voar para dentro da
 * cápsula no fim da fase sem que a escala a arraste para o canto da tela.
 */
export const SHEET_BOX = { x: 452, y: 98, w: 710, h: 380 }
export const SHEET_CX = SHEET_BOX.x + SHEET_BOX.w / 2
export const SHEET_CY = SHEET_BOX.y + SHEET_BOX.h / 2

/**
 * Os campos, em grade 2 × 2 nos três níveis, como manda o §7.
 *
 * `top` é medido A PARTIR DO TOPO DA FICHA, não da tela: é o que mantém as
 * duas linhas dentro do papel quando a caixa da ficha muda de altura.
 *
 * 325 × 145 dá 99 × 44 px reais num celular de 390 px a 30% — o piso que o
 * §7 calculou. No nível 1 o quarto espaço simplesmente não existe: papel em
 * branco, em vez de um campo cinza sem função.
 */
export const FIELD = { w: 325, h: 145, gapX: 16, gapY: 14, padX: 22, top: 60 }

export const fieldOffset = (slot: number) => ({
    x: (slot % 2 === 0 ? -1 : 1) * (FIELD.w + FIELD.gapX) / 2,
    y: SHEET_BOX.y + FIELD.top + Math.floor(slot / 2) * (FIELD.h + FIELD.gapY) + FIELD.h / 2 - SHEET_CY,
})

/** A dica, numa faixa que não passa por baixo da cápsula. */
export const HINT = { x: 24, y: 486, w: 916, h: 58 }

/**
 * A bandeja, deitada no balcão de madeira.
 *
 * Etiqueta de 294 × 120 dá 90 × 37 px reais a 30%, e a zona de toque tem 136
 * de altura, como o §7 exige — o desenho pode ser menor que o alvo, o alvo
 * não pode ser menor que o dedo.
 */
export const TRAY = { cy: 616, w: 294, h: 120, hit: 136, xs: [171, 481, 791] }

/** A cápsula-cofre, de pé no balcão, à direita da bandeja. */
export const VAULT = { x: 1092, baseY: 700, w: 250 }

export const HELP = { x: HUD.helpX, y: HUD.cy }
