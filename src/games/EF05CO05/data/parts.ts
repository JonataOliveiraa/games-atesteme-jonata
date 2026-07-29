import { C } from './theme'
import type { Category, PartDef, PartId, View } from '../types'

export const CATEGORY_LABEL: Record<Category, string> = {
    estrutura: 'Estrutura',
    energia: 'Energia',
    processamento: 'Processamento',
    memoria: 'Memória',
    armazenamento: 'Armazenamento',
    entrada: 'Entrada',
    saida: 'Saída',
}

export const CATEGORY_COLOR: Record<Category, number> = {
    estrutura: C.cinza,
    energia: C.amarelo,
    processamento: C.laranja,
    memoria: C.roxo,
    armazenamento: C.verde,
    entrada: C.azul,
    saida: C.ciano,
}

export const PARTS: Record<PartId, PartDef> = {
    'gabinete': {
        id: 'gabinete',
        label: 'Gabinete',
        category: 'estrutura',
        view: 'oficina',
        layers: ['layer-gabinete'],
        icon: 'icone-gabinete',
        funcao: 'A caixa que abriga e protege todas as peças de dentro do computador.',
        dica: 'aqui vai a caixa que guarda e protege todas as outras peças',
        requires: [],
    },
    'placa-mae': {
        id: 'placa-mae',
        label: 'Placa-mãe',
        category: 'estrutura',
        view: 'oficina',
        layers: ['layer-placa-mae'],
        icon: 'icone-placa-mae',
        funcao: 'A base onde todas as peças se conectam e conversam entre si.',
        dica: 'aqui vai a peça onde todas as outras se encaixam e se conectam',
        requires: ['gabinete'],
    },
    'fonte': {
        id: 'fonte',
        label: 'Fonte',
        category: 'energia',
        view: 'oficina',
        layers: ['layer-fonte'],
        icon: 'icone-fonte',
        funcao: 'Leva a energia da tomada para todas as peças. Sem ela, nada liga.',
        dica: 'aqui vai a peça que leva energia para todas as outras',
        requires: ['gabinete'],
    },
    'processador': {
        id: 'processador',
        label: 'Processador',
        category: 'processamento',
        view: 'oficina',
        layers: ['layer-processador'],
        icon: 'icone-processador',
        funcao: 'O cérebro. Faz as contas e executa as instruções dos programas.',
        dica: 'aqui vai a peça que faz as contas e executa os programas',
        requires: ['placa-mae'],
    },
    'ram': {
        id: 'ram',
        label: 'Memória RAM',
        category: 'memoria',
        view: 'oficina',
        layers: ['layer-ram'],
        icon: 'icone-ram',
        funcao: 'Guarda o que o computador está usando agora. Ao desligar, esquece tudo.',
        dica: 'aqui vai a peça que guarda o que está em uso agora e esquece ao desligar',
        requires: ['placa-mae'],
    },
    'hd': {
        id: 'hd',
        label: 'HD',
        category: 'armazenamento',
        view: 'oficina',
        layers: ['layer-hd'],
        icon: 'icone-hd',
        funcao: 'Guarda seus arquivos para sempre — eles continuam lá depois de desligar.',
        dica: 'aqui vai a peça que guarda os arquivos mesmo com o computador desligado',
        requires: ['placa-mae'],
    },
    'monitor': {
        id: 'monitor',
        label: 'Monitor',
        category: 'saida',
        view: 'mesa',
        layers: ['layer-monitor'],
        icon: 'icone-monitor',
        funcao: 'Mostra para você o resultado do que o computador fez.',
        dica: 'aqui vai a peça que mostra o resultado para você',
        requires: [],
    },
    'teclado': {
        id: 'teclado',
        label: 'Teclado',
        category: 'entrada',
        view: 'mesa',
        layers: ['layer-teclado'],
        icon: 'icone-teclado',
        funcao: 'Manda letras e números para dentro do computador.',
        dica: 'aqui vai a peça que envia letras e números para o computador',
        requires: [],
    },
    'mouse': {
        id: 'mouse',
        label: 'Mouse',
        category: 'entrada',
        view: 'mesa',
        layers: ['layer-mouse'],
        icon: 'icone-mouse',
        funcao: 'Manda para o computador onde você quer clicar.',
        dica: 'aqui vai a peça que aponta e clica na tela',
        requires: [],
    },
    'som': {
        id: 'som',
        label: 'Caixas de som',
        category: 'saida',
        view: 'mesa',
        layers: ['layer-som-esq', 'layer-som-dir'],
        icon: 'icone-som',
        funcao: 'Deixa o computador falar com você por som.',
        dica: 'aqui vai a peça que deixa o computador se comunicar por som',
        requires: [],
    },
}

export const ALL_PARTS = Object.keys(PARTS) as PartId[]

export const partsOfView = (view: View) =>
    ALL_PARTS.filter(id => PARTS[id].view === view)

/** Camada trocada quando o boot chega na saída. */
export const MONITOR_ON = 'layer-monitor-ligado'

export const VIEW_BASE: Record<View, string> = {
    oficina: 'bg-oficina',
    mesa: 'layer-mesa',
}

export const VIEW_LABEL: Record<View, string> = {
    oficina: 'Oficina',
    mesa: 'Mesa',
}

/** Peça só pode ser instalada se todos os pré-requisitos já estiverem lá. */
export function canInstall(id: PartId, installed: Set<PartId>): boolean {
    return PARTS[id].requires.every(r => installed.has(r))
}

/** Removê-la derrubaria peças que dependem dela? */
export function dependentsOf(id: PartId, installed: Set<PartId>): PartId[] {
    return ALL_PARTS.filter(o => installed.has(o) && PARTS[o].requires.includes(id))
}