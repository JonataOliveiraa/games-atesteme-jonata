import type { Cd } from '../types'

export const TEACH = {
    hello: 'Oi! Eu sou a Duda, a cantora da rádio!',
    today: 'Hoje você toca as músicas comigo!',
    owner: 'Toda música tem um dono.',
    note: 'O bilhete diz se pode tocar.',
    credit: 'No ar, o nome do dono!',
    live: 'O dono ouve ao vivo!',
    go: 'Sua vez!',
} as const

export const HELP = {
    read: 'Leia o bilhete de cada dono.',
    which: 'Qual CD pode tocar?',
    which2: 'Qual pode misturar?',
    which3: 'Sem bilhete, não toca!',
    read2: 'Pode tocar não é pode mexer.',
    read3: 'Abra cada CD e leia.',
} as const

export const TEACH2 = {
    remix: 'Agora a gente faz remix!',
    beat: 'Remix é pôr batida na música.',
    only: 'Só se o dono deixar misturar!',
    lanes: 'As linhas viram batidas!',
} as const

export const TEACH3 = {
    six: 'Agora são seis CDs!',
    open: 'Toque no CD para ler.',
    read: 'Leia o bilhete.',
} as const

export const LABEL = {
    level: 'Nível',
    onAir: 'NO AR',
    perfect: 'PERFEITO!',
    good: 'BOA!',
    combo: 'COMBO',
    credit: (cd: Cd) => `♪ ${cd.credit}`,
    remix: (cd: Cd) => `♪ remix da ${cd.credit}`,
    sign: (name: string) => `— ${name}`,
    play: 'TOCAR',
    back: 'VOLTAR',
} as const
