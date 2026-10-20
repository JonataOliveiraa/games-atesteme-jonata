import type { DeviceDef } from '../types'

const the = (d: DeviceDef) => (d.gender === 'a' ? 'a' : 'o')

export const LABEL = {
    level: 'Nível',
    chip: 'PROCESSADOR',
    tapNow: (d: DeviceDef) => `Tudo ligado! Toque ${d.gender === 'a' ? 'na' : 'no'} ${d.name}.`,
    oops: 'Ops!',
} as const

export const SAY = {
    busy: 'Essa tomada já tem cabo.',
    noCable: 'Ligue meu cabo primeiro!',
    noPower: (d: DeviceDef | null) =>
        d ? `${the(d).toUpperCase()} ${d.name} não está ligad${the(d)}.` : 'O computador não está ligado.',
} as const

/** Tudo o que as demonstrações escrevem: uma ou duas palavras por vez. */
export const CAPTION = {
    chip: 'PROCESSA',
    entrada: 'ENTRA',
    saida: 'SAI',
    armazenamento: 'GUARDA',
    memoria: 'SEGURA',
    drag: 'PUXE O CABO',
    which: 'QUAL TOMADA?',
    yourTurn: 'SUA VEZ!',
    /** O aninhamento: a tomada própria de um aparelho ("TOMADA DO MONITOR"). */
    nest: (d: DeviceDef) => `TOMADA ${d.gender === 'a' ? 'DA' : 'DO'} ${d.name}`,
    /** A memória solta o que segurou; o armazenamento fica com ele. */
    forget: 'SÓ AGORA',
    keep: 'PARA SEMPRE',
    hub: 'MAIS ENTRADAS',
    chain: 'HUB → CÂMERA → CARTÃO',
} as const

export const TEACH = {
    nest: (d: DeviceDef) => `Use a tomada ${d.gender === 'a' ? 'da' : 'do'} ${d.name}!`,
} as const

export const SCREEN = {
    texto: 'OLÁ!',
    cursor: '',
    foto: '',
    musica: '',
} as const
