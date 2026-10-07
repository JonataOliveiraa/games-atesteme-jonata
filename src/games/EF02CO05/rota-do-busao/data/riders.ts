import type { Rider, RiderId } from '../types'

export const RIDERS: Record<RiderId, Rider> = {
    clock: { id: 'clock', name: 'RELÓGIO', tech: true, place: 'home', line: 'Eu mostro as horas!', glyph: 'clock' },
    fridge: { id: 'fridge', name: 'GELADEIRA', tech: true, place: 'home', line: 'Eu deixo a comida gelada!', glyph: 'flake' },
    speaker: { id: 'speaker', name: 'CAIXINHA DE SOM', tech: true, place: 'home', line: 'Eu toco música!', glyph: 'note' },
    phone: { id: 'phone', name: 'CELULAR', tech: true, place: 'home', line: 'Eu ligo para quem está longe!', glyph: 'ring' },
    tv: { id: 'tv', name: 'TELEVISÃO', tech: true, place: 'home', line: 'Eu passo desenho!', glyph: 'star' },
    microwave: { id: 'microwave', name: 'MICRO-ONDAS', tech: true, place: 'home', line: 'Eu esquento a comida!', glyph: 'heat' },
    computer: { id: 'computer', name: 'COMPUTADOR', tech: true, place: 'school', line: 'Eu guardo a lista da turma!', glyph: 'star' },
    projector: { id: 'projector', name: 'PROJETOR', tech: true, place: 'school', line: 'Eu mostro tudo na parede!', glyph: 'light' },
    camera: { id: 'camera', name: 'CÂMERA', tech: true, place: 'school', line: 'Eu tiro fotos!', glyph: 'light' },
    cardMachine: { id: 'cardMachine', name: 'MAQUININHA', tech: true, place: 'town', line: 'Eu pago com o cartão!', glyph: 'star' },
    scale: { id: 'scale', name: 'BALANÇA', tech: true, place: 'town', line: 'Eu digo quanto pesa!', glyph: 'star' },
    trafficLight: { id: 'trafficLight', name: 'SEMÁFORO', tech: true, place: 'town', line: 'Eu aviso a hora de atravessar!', glyph: 'light' },
    pencil: { id: 'pencil', name: 'LÁPIS', tech: false, place: 'school', line: 'Eu escrevo sem tomada!', glyph: 'star' },
    wateringCan: { id: 'wateringCan', name: 'REGADOR', tech: false, place: 'town', line: 'Eu molho as plantas!', glyph: 'drop' },
}
