import type { ItemDef, ItemKind, OrderKind, Poly } from '../types'
import { area, bounds, vertex } from './geometry'
import { GIANT, MAP, PLATE } from './layout'

/**
 * AS MEDIDAS. Tudo em área, em px² de arte (a célula da fruta tem 512 px).
 * Área é o que a criança vê como "tamanho": uma fatia comprida e um gomo do
 * mesmo tamanho passam ou entalam juntos.
 */

/** A fresta: pedaço maior que isto entala. Um círculo de raio ~126. */
export const CAP = 50_000

/** O vento: pedaço menor que isto voa (12 % da maçã do N1). */
export const WIND_AREA = 15_000

/** O peso (N2): pedaço maior que isto não sai do chão. */
export const LIFT = 110_000

/** O farelo: corte que deixaria um pedaço menor que esta fração não acontece. */
export const CRUMB = 0.04

export const MAX_PIECES = 12

/** Quantos vértices tem a silhueta. */
const STEPS = 64

export const ITEMS: Record<ItemKind, ItemDef> = {
    morango: { kind: 'morango', form: 'egg', a: 185, b: 205, e: 0.22, skin: 0xe8434f, pulp: 0xff9a9a, pulpDark: 0xd8475a },
    laranja: { kind: 'laranja', form: 'egg', a: 230, b: 230, e: 0, skin: 0xf59a23, pulp: 0xffd06b, pulpDark: 0xe08a1c },
    maca: { kind: 'maca', form: 'egg', a: 205, b: 194, e: 0.08, skin: 0x8bd35a, pulp: 0xfff2c2, pulpDark: 0xc9b46a },
    folha: { kind: 'folha', form: 'leaf', a: 400, b: 223, e: 0.12, skin: 0x6cc24a, pulp: 0xc9efa0, pulpDark: 0x7fb85a },
    folhaGrande: { kind: 'folhaGrande', form: 'leaf', a: 440, b: 260, e: 0.12, skin: 0xa8c93a, pulp: 0xe9f5a8, pulpDark: 0xa9b84e },
}

/**
 * Fruta: x = a·sen t·(1 + e·cos t), y = −b·cos t (um "ovo" com a parte larga em cima).
 * Folha: x = −a·cos t, y = b·sen t·(1 + e·cos t) (deitada, a base larga à esquerda).
 */
export function itemPoly(def: ItemDef): Poly {
    const poly: Poly = []
    for (let i = 0; i < STEPS; i++) {
        const t = (i / STEPS) * Math.PI * 2
        if (def.form === 'leaf') poly.push(vertex(-def.a * Math.cos(t), def.b * Math.sin(t) * (1 + def.e * Math.cos(t))))
        else poly.push(vertex(def.a * Math.sin(t) * (1 + def.e * Math.cos(t)), -def.b * Math.cos(t)))
    }
    return poly
}

/** A folha gigante do N3, em px de arte da folha (um oval). */
export function giantPoly(): Poly {
    const poly: Poly = []
    for (let i = 0; i < STEPS; i++) {
        const t = (i / STEPS) * Math.PI * 2
        poly.push(vertex((-GIANT.leafW / 2) * Math.cos(t), (GIANT.leafH / 2) * Math.sin(t)))
    }
    return poly
}

export const orderPoly = (kind: OrderKind) => (kind === 'gigante' ? giantPoly() : itemPoly(ITEMS[kind]))

export const itemArea = (kind: ItemKind) => area(itemPoly(ITEMS[kind]))

/** O raio do círculo de mesma área (para o medidor e para colisões). */
export const radiusOf = (a: number) => Math.sqrt(a / Math.PI)

/** No prato, o item encolhe até caber: a fruta do N1 fica a 0,30, a folha fica menor. */
export function plateScale(kind: OrderKind) {
    const b = bounds(orderPoly(kind))
    return Math.min(MAP.scale, (2 * PLATE.r * 0.9) / Math.max(b.w, b.h))
}
