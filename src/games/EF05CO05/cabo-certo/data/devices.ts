import type { DeviceDef, DeviceId, Kind, Payload } from '../types'

/**
 * Os sete aparelhos do mapa. A posição é no mapa de 2400 × 1350, com o
 * computador em (1200, 700). Os que começam fora da vista estão marcados.
 */
export const DEVICES: Record<DeviceId, DeviceDef> = {
    teclado: {
        id: 'teclado',
        name: 'TECLADO',
        kind: 'entrada',
        cell: 0,
        at: { x: 800, y: 960 },
        sends: 'texto',
        why: 'O teclado faz as letras ENTRAREM no computador.',
    },
    mouse: {
        id: 'mouse',
        name: 'MOUSE',
        kind: 'entrada',
        cell: 1,
        at: { x: 430, y: 860 }, // fora da vista, à esquerda
        sends: 'cursor',
        why: 'O mouse faz o seu movimento ENTRAR no computador.',
    },
    microfone: {
        id: 'microfone',
        name: 'MICROFONE',
        kind: 'entrada',
        cell: 2,
        at: { x: 380, y: 430 }, // fora da vista, em cima à esquerda
        sends: 'voz',
        why: 'O microfone faz a sua voz ENTRAR no computador.',
    },
    camera: {
        id: 'camera',
        name: 'CÂMERA',
        kind: 'entrada',
        cell: 3,
        at: { x: 760, y: 240 }, // fora da vista, em cima
        sends: 'foto',
        why: 'A câmera faz a imagem ENTRAR no computador.',
    },
    monitor: {
        id: 'monitor',
        name: 'MONITOR',
        kind: 'saida',
        cell: 4,
        at: { x: 1640, y: 520 },
        size: 240,
        takes: ['texto', 'cursor', 'foto', 'musica'],
        sockets: [{ id: 'monitor-saida', kind: 'saida', at: { x: 134, y: 40 } }],
        why: 'O monitor MOSTRA o que SAI do computador.',
    },
    altofalante: {
        id: 'altofalante',
        name: 'ALTO-FALANTE',
        kind: 'saida',
        cell: 5,
        at: { x: 2150, y: 830 }, // fora da vista, à direita
        takes: ['musica'],
        why: 'O alto-falante faz o som SAIR do computador.',
    },
    pendrive: {
        id: 'pendrive',
        name: 'PENDRIVE',
        kind: 'armazenamento',
        cell: 6,
        at: { x: 1520, y: 1000 },
        sends: 'musica',
        takes: ['voz'],
        why: 'O pendrive GUARDA para depois: é ARMAZENAMENTO.',
    },
}

export const KIND_NAME: Record<Kind, string> = {
    entrada: 'ENTRADA',
    saida: 'SAÍDA',
    armazenamento: 'ARMAZENAMENTO',
}

/** O que falta, dito pelo processador, quando a informação não tem para onde ir. */
export const MISSING: Record<Payload, string> = {
    texto: 'Não tenho onde MOSTRAR!',
    cursor: 'Não tenho onde MOSTRAR!',
    foto: 'Não tenho onde MOSTRAR!',
    voz: 'Não tenho onde GUARDAR!',
    musica: 'Não tenho quem TOQUE o som!',
}
