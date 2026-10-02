import type { Item, ItemId, Kind, Side } from '../types'

export const ITEMS: Record<ItemId, Item> = {
    mouse: { id: 'mouse', name: 'MOUSE', kind: 'part', tricky: false },
    keyboard: { id: 'keyboard', name: 'TECLADO', kind: 'part', tricky: false },
    speaker: { id: 'speaker', name: 'CAIXINHA DE SOM', kind: 'part', tricky: false },
    gamepad: { id: 'gamepad', name: 'CONTROLE', kind: 'part', tricky: false },
    screen: { id: 'screen', name: 'TELA', kind: 'part', tricky: true },
    camera: { id: 'camera', name: 'CÂMERA', kind: 'part', tricky: false },
    robot: { id: 'robot', name: 'ROBÔ', kind: 'part', tricky: true },
    game: { id: 'game', name: 'JOGUINHO', kind: 'program', tricky: false },
    music: { id: 'music', name: 'APP DE MÚSICA', kind: 'program', tricky: false },
    paint: { id: 'paint', name: 'APP DE DESENHO', kind: 'program', tricky: false },
    alarm: { id: 'alarm', name: 'DESPERTADOR', kind: 'program', tricky: false },
    photos: { id: 'photos', name: 'APP DE FOTOS', kind: 'program', tricky: false },
    dance: { id: 'dance', name: 'DANCINHA DO ROBÔ', kind: 'program', tricky: true },
}

export const sideOf = (kind: Kind): Side => (kind === 'part' ? 'left' : 'right')

export const isRight = (id: ItemId, side: Side) => sideOf(ITEMS[id].kind) === side

export const TRAINING: [ItemId, ItemId] = ['camera', 'photos']
