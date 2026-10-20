import type { Test } from '../types'

export const CAPTION = {
    rule: 'A REGRA',
    gas: 'ACELERAR',
    brake: 'FREAR',
    rained: 'CHOVEU!',
    box: 'BOX',
    stop: 'PARE',
    rainRain: 'CHOVE → CHUVA',
    yourTurn: 'SUA VEZ!',
    topDown: 'DE CIMA PARA BAIXO',
    which: 'MOTO OU CARRO?',
    thenSky: 'DEPOIS, O CÉU',
    mud: 'LAMA!',
    relay: 'REVEZAMENTO!',
    missed: 'Passou do box!',
    already: 'Já estava certo!',
    go: 'JÁ!',
    lastLap: 'ÚLTIMA VOLTA!',
} as const

export const LABEL = {
    level: 'Nível',
    gas: 'ACELERAR',
    brake: 'FREIO',
    pit: 'TROCAR PNEU',
    pitOn: 'INDO PRO BOX',
    relayOn: 'REVEZAMENTO',
    place: (n: number) => `${n}º`,
    placeLong: (n: number) => `${n}º lugar!`,
} as const

export const TEST_WORD: Record<Test, string> = {
    chovendo: 'chovendo',
    lama: 'lama',
    moto: 'moto',
}

export const WHY = {
    rain: 'Está chovendo: pneu de CHUVA!',
    dry: 'Sem chuva: pneu LISO!',
    cloudy: 'Nublado não é chuva: pneu LISO!',
    dryNoMud: 'Sem lama e sem chuva: pneu LISO!',
    mud: 'Pista de lama: pneu de CRAVOS!',
    mudFirst: 'A lama vem primeiro: CRAVOS!',
    moto: 'Moto usa pneu de MOTO!',
    carro: 'Carro usa pneu de CARRO!',
} as const
