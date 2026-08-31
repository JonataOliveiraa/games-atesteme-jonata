/**
 * ══════════════════════════════════════════════════════════════════════
 *  CORRIDA DOS PARECIDOS — EF01CO01
 * ══════════════════════════════════════════════════════════════════════
 *
 * A habilidade pede ORGANIZAR objetos por uma característica, dizendo o que
 * é semelhante e o que é diferente. Aqui a característica está escrita na
 * placa da estrada, e organizar é uma decisão de direção: o que combina
 * entra no carrinho, o que difere passa pelo lado.
 *
 * A regra nunca é um gabarito guardado no item — é um PREDICADO aplicado ao
 * que o item é no instante em que ele desce (ver `shouldCollect`). Por isso a
 * mesma peça pode ser "pega" numa rodada e "deixa passar" na seguinte.
 */

export type LevelNumber = 1 | 2 | 3
export type ItemSheet = 'item-frutas' | 'item-formas'
export type RuleMode = 'include' | 'exclude'
export type TraitKind = 'color' | 'shape'
export type ColorName = 'vermelho' | 'azul' | 'amarelo' | 'roxo' | 'verde' | 'laranja'
export type ShapeName = 'redondo' | 'quadrado' | 'triangulo' | 'estrela' | 'retangulo' | 'comprido'
export type TraitValue = ColorName | ShapeName
export type Biome = 'forest' | 'snow' | 'autumn'

/** `locked` é a TRAVA: o mundo para até a criança resolver o mesmo item. */
export type PlayState = 'intro' | 'tutorial' | 'running' | 'locked' | 'ending'

export interface ItemDef {
    id: string
    label: string
    sheet: ItemSheet
    frame: number
    color: ColorName
    shape: ShapeName
}

export interface Rule {
    mode: RuleMode
    kind: TraitKind
    value: TraitValue
    word: string
}

export interface RuleOption {
    kind: TraitKind
    mode: RuleMode
    values: TraitValue[]
    sheets: ItemSheet[]
    /** Índice do trecho em que esta regra entra no ar. */
    fromStretch: number
}

export interface FallingItem {
    def: ItemDef
    lane: number
    y: number
    mistakes: number
    returning: boolean
    collect: boolean
}

export interface LevelDef {
    level: LevelNumber
    biome: Biome
    lanes: 2 | 3
    /** Itens de cada trecho. Três trechos por nível. */
    stretches: number[]
    fallMs: number
    spawnGapMs: number
    /** Do trecho final em diante o mundo acelera — é a arrancada. */
    sprintFrom: number
    sprintFactor: number
    rulePlan: RuleOption[]
    hint: string
}
