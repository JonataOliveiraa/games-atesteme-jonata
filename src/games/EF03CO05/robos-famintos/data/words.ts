import type { Format } from '../types'

export const PLATE: Record<Format, string> = {
    music: 'MÚSICA',
    photo: 'FOTO',
    text: 'TEXTO',
    video: 'VÍDEO',
}

export const WRONG: Record<Format, string> = {
    music: 'Barrinhas de som são música!',
    photo: 'Pontinhos em grade são foto!',
    text: 'Letras em fila são texto!',
    video: 'Quadros em fila são vídeo!',
}

export const DISGUISED: Record<Format, string> = {
    music: 'São barrinhas de som: é música!',
    photo: 'É uma grade de pontinhos: é foto!',
    text: 'São letras em fila: é texto!',
    video: 'São quadros em fila: é vídeo!',
}

export const GUIDE_WRONG = 'Hum, esse não é meu!'

export const SAY = {
    yum: 'Nhac! Que delícia!',
    summary: 'Cada informação tem seu formato!',
} as const

export const TEACH = {
    hungry: 'Os robôs estão com fome de arquivos!',
    music: 'Barrinhas de som? Isso é música.',
    photo: 'Pontinhos de cor em grade? É foto!',
    pull: 'Puxe para trás, mire e solte.',
    go: 'Agora é com você!',
    helpPull: 'Puxe, mire e solte no robô certo.',
    helpLook: 'Olhe como os dados estão arrumados.',
    helpN1: 'Barrinhas: música. Grade: foto.',
    helpN2: 'Letras: texto. Quadros: vídeo.',
    helpN3: 'Disfarçado? Olhe só o arranjo.',
    newRobots: 'Chegaram dois robôs!',
    text: 'Letras em fila? É texto.',
    video: 'Quadros em fila? É vídeo.',
    disguise: 'Cuidado: este é disfarçado!',
    look: 'Olhe como os dados estão arrumados.',
} as const

export const COUNT: Record<Format, [string, string]> = {
    music: ['música', 'músicas'],
    photo: ['foto', 'fotos'],
    text: ['texto', 'textos'],
    video: ['vídeo', 'vídeos'],
}
