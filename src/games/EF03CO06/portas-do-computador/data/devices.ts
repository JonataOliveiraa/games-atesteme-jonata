import type { Device, DeviceId, InfoId, PersonId, Wish } from '../types'

export const DEVICES: Record<DeviceId, Device> = {
    mic: { id: 'mic', side: 'input', name: 'MICROFONE', art: 'o MICROFONE' },
    camera: { id: 'camera', side: 'input', name: 'CÂMERA', art: 'a CÂMERA' },
    keyboard: { id: 'keyboard', side: 'input', name: 'TECLADO', art: 'o TECLADO' },
    speaker: { id: 'speaker', side: 'output', name: 'ALTO-FALANTE', art: 'o ALTO-FALANTE' },
    screen: { id: 'screen', side: 'output', name: 'TELA', art: 'a TELA' },
    printer: { id: 'printer', side: 'output', name: 'IMPRESSORA', art: 'a IMPRESSORA' },
}

/** cada tipo de informação entra por um aparelho só */
export const INFO: Record<InfoId, { name: string; kind: string; door: DeviceId }> = {
    note: { name: 'Notinha', kind: 'SOM', door: 'mic' },
    photo: { name: 'Fotinho', kind: 'IMAGEM', door: 'camera' },
    letter: { name: 'Letrinha', kind: 'LETRAS', door: 'keyboard' },
}

/** cada pedido sai por um aparelho só */
export const WISH: Record<Wish, { verb: string; ask: string; door: DeviceId }> = {
    hear: { verb: 'OUVIR', ask: 'Quero OUVIR!', door: 'speaker' },
    see: { verb: 'VER', ask: 'Quero VER!', door: 'screen' },
    paper: { verb: 'no PAPEL', ask: 'Quero no PAPEL!', door: 'printer' },
}

export const PERSON: Record<PersonId, { name: string; art: string }> = {
    grandma: { name: 'Vovó Rosa', art: 'A vovó' },
    theo: { name: 'Theo', art: 'O Theo' },
    teacher: { name: 'Professora Bia', art: 'A professora' },
}
