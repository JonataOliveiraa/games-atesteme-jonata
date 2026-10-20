import type { DeviceId, Kind, LevelDef, Place, Round, TargetId, Want } from '../types'
import { CANION, CUME, DUNA, FAROL, GRUTA, MESA, PICO, PIER, RECIFE, SERRA, TRILHA, VALE } from './maps'

export const POINTS = 10

export const KIND: Record<DeviceId, Kind> = {
    hdInterno: 'local',
    penDrive: 'remoto',
    cartao: 'remoto',
    hdExterno: 'remoto',
    nuvem: 'remoto',
}

export const PLACE: Record<DeviceId, Place> = {
    hdInterno: 'local',
    penDrive: 'removivel',
    cartao: 'removivel',
    hdExterno: 'removivel',
    nuvem: 'internet',
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Local ou remoto?',
        message: 'LOCAL é o HD de dentro do computador. REMOTO sai dele: pen drive, cartão, HD externo e nuvem.',
        scenery: 'campo',
        rounds: [
            { file: 'foto', want: 'remoto', map: VALE },
            { file: 'video', want: 'local', map: MESA },
            { file: 'musica', want: 'remoto', map: CANION },
            { file: 'trabalho', want: 'local', map: SERRA },
        ],
    },
    {
        level: 2,
        title: 'Dois jeitos de remoto',
        message: 'O remoto pode ser REMOVÍVEL (pen drive, cartão, HD externo) ou estar na INTERNET (a nuvem).',
        scenery: 'praia',
        rounds: [
            { file: 'foto', want: 'removivel', map: DUNA },
            { file: 'video', want: 'internet', map: PIER },
            { file: 'musica', want: 'removivel', map: FAROL },
            { file: 'trabalho', want: 'local', map: RECIFE },
        ],
    },
    {
        level: 3,
        title: 'Onde guardar?',
        message: 'Quem está longe vê pela INTERNET. Sem internet, leve no REMOVÍVEL. Só aqui? Fica no LOCAL.',
        scenery: 'serra',
        rounds: [
            {
                file: 'foto',
                want: 'internet',
                situation: 'A vovó mora longe e quer ver a FOTO hoje.',
                why: 'A vovó está longe: só pela INTERNET!',
                map: PICO,
            },
            {
                file: 'trabalho',
                want: 'removivel',
                situation: 'A escola está sem internet. Leve o TRABALHO.',
                why: 'Sem internet, leve num REMOVÍVEL!',
                map: GRUTA,
            },
            {
                file: 'video',
                want: 'local',
                situation: 'Só você vê o VÍDEO, e só neste computador.',
                why: 'Só neste computador: fica no LOCAL!',
                map: TRILHA,
            },
            {
                file: 'musica',
                want: 'removivel',
                situation: 'O carro do tio não tem internet. Leve a MÚSICA.',
                why: 'Sem internet, leve num REMOVÍVEL!',
                map: CUME,
            },
        ],
    },
]

export const guideKey = (level: number) => `catapulta-do-arquivo-n${level}`

export const targetsOf = (round: Round): TargetId[] => [
    ...round.map.devices.map((_, i) => `d${i}` as TargetId),
    ...round.map.clouds.map((_, i) => `c${i}` as TargetId),
]

export const deviceAt = (round: Round, id: TargetId): DeviceId => {
    const i = Number(id.slice(1))
    return id.startsWith('d') ? round.map.devices[i].device : 'nuvem'
}

/** `remoto` aceita os dois lugares de fora; os outros pedidos aceitam só o próprio lugar */
export const fits = (device: DeviceId, want: Want) => (want === 'remoto' ? KIND[device] === 'remoto' : PLACE[device] === want)

/** o que se diz do dispositivo: no N1 o tipo, depois o lugar */
export const classOf = (device: DeviceId, level: number): Want => (level === 1 ? KIND[device] : PLACE[device])

export const rightTargets = (round: Round) => targetsOf(round).filter(t => fits(deviceAt(round, t), round.want))
