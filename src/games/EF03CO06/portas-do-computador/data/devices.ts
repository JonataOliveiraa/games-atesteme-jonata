import type { Device, DeviceId, InfoId } from '../types'

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
