import type { FruitDef, FruitKind, Poly } from '../types'
import { area, vertex } from './geometry'

/**
 * AS MEDIDAS. Tudo em área, em px² de arte (a célula da fruta tem 512 px).
 * Área é o que a criança vê como "tamanho": uma fatia comprida e um gomo do
 * mesmo tamanho passam ou entalam juntos.
 */

/** A fresta: pedaço maior que isto entala. Um círculo de raio ~126. */
export const CAP = 50_000

/** O vento: pedaço menor que esta fração da fruta voa. */
export const WIND_MIN = 0.12

/** O farelo: corte que deixaria um pedaço menor que esta fração não acontece. */
export const CRUMB = 0.04

export const MAX_PIECES = 8

/** Quantos vértices tem a silhueta. */
const STEPS = 64

export const FRUITS: Record<FruitKind, FruitDef> = {
    morango: { kind: 'morango', a: 185, b: 205, e: 0.22, skin: 0xe8434f, pulp: 0xff9a9a, pulpDark: 0xd8475a },
    laranja: { kind: 'laranja', a: 230, b: 230, e: 0, skin: 0xf59a23, pulp: 0xffd06b, pulpDark: 0xe08a1c },
    maca: { kind: 'maca', a: 205, b: 194, e: 0.08, skin: 0x8bd35a, pulp: 0xfff2c2, pulpDark: 0xc9b46a },
}

/** A célula de cada fruta em `frutas.png`. */
export const FRUIT_CELL: Record<FruitKind, number> = { morango: 0, laranja: 1, maca: 2 }

/** x = a·sen t·(1 + e·cos t), y = −b·cos t: um "ovo" com a parte larga em cima. */
export function fruitPoly(def: FruitDef): Poly {
    const poly: Poly = []
    for (let i = 0; i < STEPS; i++) {
        const t = (i / STEPS) * Math.PI * 2
        poly.push(vertex(def.a * Math.sin(t) * (1 + def.e * Math.cos(t)), -def.b * Math.cos(t)))
    }
    return poly
}

export const fruitArea = (kind: FruitKind) => area(fruitPoly(FRUITS[kind]))

/** O raio do círculo de mesma área (para o medidor e para colisões). */
export const radiusOf = (a: number) => Math.sqrt(a / Math.PI)
