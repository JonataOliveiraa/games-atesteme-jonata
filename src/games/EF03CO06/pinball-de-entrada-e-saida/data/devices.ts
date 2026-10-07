import type { ContentId, Device, DeviceId } from '../types'

export const DEVICES: Record<DeviceId, Device> = {
    keyboard: { id: 'keyboard', row: 'input', name: 'TECLADO', art: 'o TECLADO' },
    mic: { id: 'mic', row: 'input', name: 'MICROFONE', art: 'o MICROFONE' },
    camera: { id: 'camera', row: 'input', name: 'CÂMERA', art: 'a CÂMERA' },
    speaker: { id: 'speaker', row: 'output', name: 'ALTO-FALANTE', art: 'o ALTO-FALANTE' },
    screen: { id: 'screen', row: 'output', name: 'TELA', art: 'a TELA' },
    printer: { id: 'printer', row: 'output', name: 'IMPRESSORA', art: 'a IMPRESSORA' },
}

export const INPUTS: DeviceId[] = ['keyboard', 'mic', 'camera']
export const OUTPUTS: DeviceId[] = ['speaker', 'screen', 'printer']

/** o verbo do pedido que aponta cada aparelho (validação) */
export const VERBS: Record<DeviceId, string[]> = {
    keyboard: ['ESCREVER'],
    mic: ['CANTAR', 'FALAR'],
    camera: ['MOSTRAR'],
    speaker: ['OUVIR', 'ESCUTAR'],
    screen: ['VER'],
    printer: ['PAPEL'],
}

export const CONTENT_WORD: Record<ContentId, string> = {
    letters: 'as letras',
    voice: 'a voz',
    drawing: 'o desenho',
    music: 'a música',
    cartoon: 'o desenho animado',
    story: 'a história',
    invite: 'o convite',
    name: 'o nome',
}

export const MINE: Partial<Record<ContentId, string>> = {
    letters: 'as minhas letras',
    voice: 'a minha voz',
    drawing: 'o meu desenho',
}
