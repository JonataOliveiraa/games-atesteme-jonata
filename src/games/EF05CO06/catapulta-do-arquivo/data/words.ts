import type { DeviceId, FileId, Kind } from '../types'

export const TITLE = 'Catapulta do Arquivo'

export const KIND_WORD: Record<Kind, string> = { local: 'LOCAL', remoto: 'REMOTO' }

export const NAME: Record<DeviceId, string> = {
    hdInterno: 'HD do computador',
    penDrive: 'pen drive',
    cartao: 'cartão de memória',
    hdExterno: 'HD externo',
    nuvem: 'nuvem',
}

export const SHORT: Record<DeviceId, string> = {
    hdInterno: 'HD DO COMPUTADOR',
    penDrive: 'PEN DRIVE',
    cartao: 'CARTÃO',
    hdExterno: 'HD EXTERNO',
    nuvem: 'NUVEM',
}

export const ORDER_WORD = 'Guarde no'

const FILE: Record<FileId, string> = { video: 'o VÍDEO', foto: 'a FOTO', musica: 'a MÚSICA', trabalho: 'o TRABALHO' }

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export const TEACH = {
    order: (file: FileId, want: Kind) => `Guarde ${FILE[file]} num lugar ${KIND_WORD[want]}.`,
    local: 'O HD de dentro do computador é LOCAL.',
    remote: (id: DeviceId) => `${cap(NAME[id])} e nuvem saem do computador: são REMOTOS.`,
    pan: 'Arraste a tela para ver o mapa todo. O mapinha mostra onde você está.',
    shoot: 'Puxe a catapulta para trás, mire e solte!',
}

export const SAY = {
    is: (id: DeviceId, kind: Kind) => `${SHORT[id]} = ${KIND_WORD[kind]}`,
    wanted: (kind: Kind) => `O pedido era ${KIND_WORD[kind]}!`,
    miss: 'Quase! De novo!',
}
