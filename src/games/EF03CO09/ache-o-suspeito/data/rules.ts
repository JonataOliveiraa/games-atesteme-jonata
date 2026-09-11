import { DATA_BOX, dataFrame } from './art'
import { LEVELS } from './levels'
import type { DataKind, LevelDef, TargetCard } from '../types'

const SENSITIVE = new Set<DataKind>([
    'address',
    'phone',
    'live-location',
    'school-routine',
    'vehicle-plate',
])

const OPEN_AUDIENCE = new Set(['public', 'unknown'])

export const exposesSensitiveData = (card: TargetCard) =>
    SENSITIVE.has(card.kind) && OPEN_AUDIENCE.has(card.audience)

export const exposesPeerWithoutConsent = (card: TargetCard) =>
    card.owner === 'peer' && card.consent !== true

export const isSuspicious = (card: TargetCard) =>
    exposesSensitiveData(card) || exposesPeerWithoutConsent(card)

export const OWNER_LABEL = { self: 'MEU', peer: 'DE UM COLEGA' }

const MAX = { message: 66, destination: 24, note: 82 }

export const validateLevels = (levels: LevelDef[] = LEVELS): string[] => {
    const problems: string[] = []
    levels.forEach(level => {
        if (level.waves.length !== 3) problems.push(`nível ${level.level}: ${level.waves.length} ondas`)
        level.waves.forEach(wave => {
            const where = `${level.level}/${wave.id}`
            const suspicious = wave.cards.filter(isSuspicious)
            if (suspicious.length !== 1) problems.push(`${where}: ${suspicious.length} placas suspeitas`)
            if (wave.cards.length < 2) problems.push(`${where}: ${wave.cards.length} placas`)
            const ids = new Set(wave.cards.map(card => card.id))
            if (ids.size !== wave.cards.length) problems.push(`${where}: ids repetidos`)
            wave.cards.forEach(card => {
                if (card.message.length > MAX.message) problems.push(`${where}/${card.id}: mensagem com ${card.message.length}`)
                if (card.destination.length > MAX.destination) problems.push(`${where}/${card.id}: destino com ${card.destination.length}`)
                if (card.note.length > MAX.note) problems.push(`${where}/${card.id}: dica com ${card.note.length}`)
                if (!DATA_BOX[dataFrame(card.kind)]) problems.push(`${where}/${card.id}: dado ${card.kind} sem frame`)
                if (card.owner === 'peer' && card.consent === undefined) {
                    problems.push(`${where}/${card.id}: dado de colega sem declarar consentimento`)
                }
            })
        })
    })
    return problems
}

export const shuffled = <T>(list: T[]): T[] => {
    const out = list.slice()
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}
