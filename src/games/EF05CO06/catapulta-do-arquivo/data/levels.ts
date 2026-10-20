import type { DeviceId, Kind, LevelDef, Round, TargetId } from '../types'
import { CANION, MESA, SERRA, VALE } from './maps'

export const POINTS = 10

export const KIND: Record<DeviceId, Kind> = {
    hdInterno: 'local',
    penDrive: 'remoto',
    cartao: 'remoto',
    hdExterno: 'remoto',
    nuvem: 'remoto',
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Local ou remoto?',
        message: 'LOCAL é o HD de dentro do computador. REMOTO sai dele: pen drive, cartão, HD externo e nuvem.',
        rounds: [
            { file: 'foto', want: 'remoto', map: VALE },
            { file: 'video', want: 'local', map: MESA },
            { file: 'musica', want: 'remoto', map: CANION },
            { file: 'trabalho', want: 'local', map: SERRA },
        ],
    },
]

export const guideKey = (level: number) => `catapulta-do-arquivo-n${level}`

export const targetsOf = (round: Round): TargetId[] => [
    ...round.map.holes.map((_, i) => `h${i}` as TargetId),
    ...round.map.clouds.map((_, i) => `c${i}` as TargetId),
]

export const deviceAt = (round: Round, id: TargetId): DeviceId => {
    const i = Number(id.slice(1))
    return id.startsWith('h') ? round.map.holes[i].device : 'nuvem'
}

export const rightTargets = (round: Round) => targetsOf(round).filter(t => KIND[deviceAt(round, t)] === round.want)
