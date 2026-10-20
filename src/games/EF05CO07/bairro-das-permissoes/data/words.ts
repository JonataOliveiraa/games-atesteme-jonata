export const LABEL = {
    level: 'Nível',
    yes: 'PODE',
    no: 'NÃO PODE',
    wait: 'ESPERAR',
    busy: 'EM USO',
    stamp: 'NÃO',
    oops: 'Ops!',
    ask: 'Pode ou não pode?',
    askWait: 'Pode, espera ou não pode?',
    swap: 'Qual peça sai da mochila?',
} as const

export const SAY = {
    bring: (want: string, app: string) => `Leve ${want} para ${app}!`,
    full: (want: string) => `Falta lugar para ${want}!`,
    free: (want: string) => `${want[0].toUpperCase()}${want.slice(1)} ficou livre!`,
    wasFree: (want: string) => `${want[0].toUpperCase()}${want.slice(1)} estava livre!`,
}

export const CAPTION = {
    alone: 'SEM O SISTEMA...',
    nobody: 'NINGUÉM SE FALA!',
    you: 'VOCÊ É O SISTEMA!',
    hold: 'SEGURE PARA CORRER',
    yourTurn: 'SUA VEZ!',
    yes: 'PODE!',
    no: 'PROTEGIDO!',
    bag: 'NA MOCHILA!',
    full: 'MOCHILA CHEIA!',
    home: 'DE VOLTA PARA CASA!',
    grow: 'O BAIRRO CRESCEU!',
    two: 'ÀS VEZES SÃO DUAS PEÇAS!',
    busy: 'PEÇA EM USO...',
    once: 'UMA DE CADA VEZ!',
    wait: 'ESPERE A VEZ!',
} as const
