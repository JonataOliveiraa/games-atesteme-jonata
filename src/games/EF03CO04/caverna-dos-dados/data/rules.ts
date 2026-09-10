import Phaser from 'phaser'
import type { Datum, DatumId, Gallery } from '../types'

const sameSet = (a: Iterable<DatumId>, b: Iterable<DatumId>) => {
    const left = [...a].sort()
    const right = [...b].sort()
    return left.length === right.length && left.every((id, i) => id === right[i])
}

/** Quantos encaixes o altar mostra. É só o tamanho da informação. */
export const slotsOf = (gallery: Gallery) => gallery.information.datumIds.length

/**
 * O veredito. Não é "este dado é o certo", é "estes dados, juntos, são a
 * informação desta galeria". A ordem dos toques não entra na conta.
 */
export const formsInformation = (gallery: Gallery, selected: Iterable<DatumId>) =>
    sameSet(selected, gallery.information.datumIds)

export const intrudersIn = (gallery: Gallery, selected: Iterable<DatumId>) =>
    [...selected].filter(id => !gallery.information.datumIds.includes(id))

export const missingIn = (gallery: Gallery, selected: DatumId[]) =>
    gallery.information.datumIds.filter(id => !selected.includes(id))

export const datumOf = (gallery: Gallery, id: DatumId): Datum | undefined =>
    gallery.data.find(datum => datum.id === id)

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** A frase da trava nomeia o intruso e o assunto — nunca a resposta. */
export const intruderLine = (gallery: Gallery, id: DatumId) => {
    const datum = datumOf(gallery, id)
    if (!datum) return 'Esse dado não conta esta informação.'
    return `${capitalize(datum.label)} não conta ${gallery.subject}.`
}

/**
 * As posições dos cristais. Embaralhadas com semente da galeria: fica igual a
 * cada partida, e a ordem do arquivo (onde o intruso é sempre o último) não
 * vaza para a tela.
 */
export const shuffledPositions = <T>(gallery: Gallery, positions: T[]): T[] => {
    const rng = new Phaser.Math.RandomDataGenerator([gallery.id])
    const pool = positions.slice()
    for (let i = pool.length - 1; i > 0; i--) {
        const j = rng.integerInRange(0, i)
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool
}
