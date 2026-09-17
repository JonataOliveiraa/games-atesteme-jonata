import type { PartDef } from '../types'

export const SHEET = { key: 'pecas', frameWidth: 256, frameHeight: 256 } as const

export const MACHINE_SHEET = { key: 'maquina', frameWidth: 512, frameHeight: 512 } as const

/** Os objetos que o computador manipula, usados pelos desafios de peça. */
export const THING_SHEET = { key: 'coisas', frameWidth: 256, frameHeight: 256 } as const

/** Os rostos que a câmera fotografa. */
export const FACE_SHEET = { key: 'rostos', frameWidth: 512, frameHeight: 512 } as const

/** `originX`/`originY` saíram da caixa alfa medida quadro a quadro. */
export const PARTS: Record<string, PartDef> = {
    teclado: {
        id: 'teclado',
        frame: 0,
        category: 'entrada',
        originX: 0.504,
        originY: 0.549,
        name: 'TECLADO',
        hint: 'Eu recebo o que você digita.',
        confirm: 'Isso! O teclado é uma ENTRADA: por ele as palavras chegam em mim.',
    },
    mouse: {
        id: 'mouse',
        frame: 1,
        category: 'entrada',
        originX: 0.561,
        originY: 0.514,
        name: 'MOUSE',
        hint: 'Eu levo para dentro o que a sua mão faz.',
        confirm: 'Isso! O mouse é uma ENTRADA: por ele a sua mão chega em mim.',
    },
    microfone: {
        id: 'microfone',
        frame: 2,
        category: 'entrada',
        originX: 0.377,
        originY: 0.533,
        name: 'MICROFONE',
        hint: 'Eu recebo o som da sua voz.',
        confirm: 'Isso! O microfone é uma ENTRADA: por ele a sua voz chega em mim.',
    },
    camera: {
        id: 'camera',
        frame: 3,
        category: 'entrada',
        originX: 0.531,
        originY: 0.508,
        name: 'CÂMERA',
        hint: 'Eu recebo a imagem e mando para dentro.',
        confirm: 'Isso! A câmera é uma ENTRADA: por ela a imagem chega em mim.',
    },
    chip: {
        id: 'chip',
        frame: 4,
        category: 'processador',
        originX: 0.502,
        originY: 0.51,
        name: 'PROCESSADOR',
        hint: 'Eu penso e faço as contas. Só isso.',
        confirm: 'Isso! O processador é quem PENSA e faz as contas aqui dentro.',
    },
    pente: {
        id: 'pente',
        frame: 5,
        category: 'memoria',
        originX: 0.49,
        originY: 0.48,
        name: 'MEMÓRIA RAM',
        hint: 'Eu esqueço tudo quando desliga.',
        confirm: 'Isso! A memória RAM SEGURA o que estou usando agora, e só agora.',
    },
    disco: {
        id: 'disco',
        frame: 6,
        category: 'armazenamento',
        originX: 0.502,
        originY: 0.504,
        name: 'DISCO RÍGIDO',
        hint: 'Eu sou devagar. Eu só guardo.',
        confirm: 'Isso! O disco rígido é ARMAZENAMENTO: ele guarda mesmo desligado.',
    },
    pendrive: {
        id: 'pendrive',
        frame: 7,
        category: 'armazenamento',
        originX: 0.506,
        originY: 0.551,
        name: 'PENDRIVE',
        hint: 'Eu guardo, e vou junto no bolso.',
        confirm: 'Isso! O pendrive é ARMAZENAMENTO, e ainda vai junto no bolso.',
    },
    cartao: {
        id: 'cartao',
        frame: 8,
        category: 'armazenamento',
        originX: 0.537,
        originY: 0.512,
        name: 'CARTÃO SD',
        hint: 'Eu guardo as fotos, mesmo desligado.',
        confirm: 'Isso! O cartão é ARMAZENAMENTO: ele guarda as fotos para depois.',
    },
    tela: {
        id: 'tela',
        frame: 9,
        category: 'saida',
        originX: 0.512,
        originY: 0.613,
        name: 'MONITOR',
        hint: 'Eu mostro. Eu não recebo nada.',
        confirm: 'Isso! O monitor é uma SAÍDA: por ele você vê o que eu faço.',
    },
    altofalante: {
        id: 'altofalante',
        frame: 10,
        category: 'saida',
        originX: 0.506,
        originY: 0.512,
        name: 'ALTO-FALANTE',
        hint: 'Eu toco o som para fora.',
        confirm: 'Isso! O alto-falante é uma SAÍDA: por ele o som sai de mim.',
    },
    impressora: {
        id: 'impressora',
        frame: 11,
        category: 'saida',
        originX: 0.514,
        originY: 0.504,
        name: 'IMPRESSORA',
        hint: 'Eu entrego no papel o que já está pronto.',
        confirm: 'Isso! A impressora é uma SAÍDA: por ela o desenho sai no papel.',
    },
    cooler: {
        id: 'cooler',
        frame: 12,
        category: 'nenhuma',
        originX: 0.508,
        originY: 0.504,
        name: 'COOLER',
        hint: 'Eu só faço vento. Não penso, não guardo.',
        confirm: 'O cooler só faz vento. Ele não é entrada, saída, memória nem nada disso.',
    },
    fonte: {
        id: 'fonte',
        frame: 13,
        category: 'nenhuma',
        originX: 0.525,
        originY: 0.527,
        name: 'FONTE',
        hint: 'Eu só trago a energia da tomada.',
        confirm: 'A fonte só traz energia. Ela não é entrada, saída, memória nem nada disso.',
    },
    cabo: {
        id: 'cabo',
        frame: 14,
        category: 'nenhuma',
        originX: 0.516,
        originY: 0.531,
        name: 'CABO',
        hint: 'Eu só levo energia de um lado ao outro.',
        confirm: 'O cabo só leva energia. Ele não é entrada, saída, memória nem nada disso.',
    },
}

export function part(id: string): PartDef {
    const found = PARTS[id]
    if (!found) throw new Error(`[raio-x-da-maquina] peça desconhecida: ${id}`)
    return found
}
