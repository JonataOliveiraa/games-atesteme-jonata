import type { DeviceId, FileId, Want } from '../types'

export const TITLE = 'Catapulta do Arquivo'

export const WANT_WORD: Record<Want, string> = {
    local: 'LOCAL',
    remoto: 'REMOTO',
    removivel: 'REMOVÍVEL',
    internet: 'INTERNET',
}

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

export const ORDER_WORD: Record<Want, string> = {
    local: 'Guarde no',
    remoto: 'Guarde no',
    removivel: 'Guarde no',
    internet: 'Guarde na',
}

const cap = (t: string) => t.charAt(0) + t.slice(1).toLowerCase()

const FILE: Record<FileId, string> = { video: 'o VÍDEO', foto: 'a FOTO', musica: 'a MÚSICA', trabalho: 'o TRABALHO' }

export const TEACH = {
    order: (file: FileId, want: Want) => `Guarde ${FILE[file]} ${want === 'internet' ? 'na' : 'no'} ${WANT_WORD[want]}.`,
    local: 'HD de dentro: LOCAL.',
    remote: (id: DeviceId, cloud: boolean) => (cloud ? `${cap(SHORT[id])} e nuvem saem: REMOTOS.` : `${cap(SHORT[id])} sai: REMOTO.`),
    look: 'Veja o mapa todo.',
    removable: 'Tira e leva: REMOVÍVEL.',
    internet: 'Nuvem: INTERNET.',
    split: 'Remoto tem dois jeitos!',
    read: 'Leia o pedido.',
    where: 'Onde ele precisa estar?',
    go: 'Sua vez!',
}

export const SAY = {
    is: (id: DeviceId, kind: Want) => `${SHORT[id]} = ${WANT_WORD[kind]}`,
    wanted: (want: Want) => `O pedido era ${WANT_WORD[want]}!`,
    miss: 'Quase! De novo!',
}
