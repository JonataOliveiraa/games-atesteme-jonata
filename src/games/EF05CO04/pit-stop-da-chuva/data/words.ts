import type { Test, Weather } from '../types'
import { PIECE_CELL, PIECE_SHEET, TRAIL_CELL, TRAIL_SHEET } from './files'
import { C } from './theme'

export const CAPTION = {
    vehicle: 'MOTO OU CARRO?',
    mud: 'LAMA!',
    mudOut: 'ACABOU A LAMA',
    narrowIn: 'PISTA ESTREITA!',
    narrowOut: 'A PISTA ALARGOU!',
    onlyMoto: 'Só a MOTO passa!',
    missed: 'Passou do box!',
    already: 'Já estava certo!',
    go: 'JÁ!',
    lastLap: 'ÚLTIMA VOLTA!',
} as const

/** Os balões da história: curtos, cada um sobre o que acabou de acontecer. Nenhum fala de controle. */
export const GUIDE = {
    hello: 'Esta é a Kika. Você é a equipe dela!',
    rule: 'Cada botão diz QUANDO usar.',
    rained: 'Começou a chover!',
    yourTurn: 'Sua vez!',
    mud: 'Agora tem LAMA na pista!',
    mudSlow: 'Pneu liso patina na lama!',
    mudFirst: 'Lama e chuva? A LAMA vem primeiro!',
    narrow: 'Pista estreita? Só a MOTO passa.',
    thenSky: 'Depois, olhe o céu.',
} as const

/** O ícone de cada condição, o mesmo da regra: aparece na legenda quando ela muda. */
export const CONDITION_ICON = {
    chovendo: { sheet: PIECE_SHEET.key, cell: PIECE_CELL.rainCloud },
    lama: { sheet: PIECE_SHEET.key, cell: PIECE_CELL.mud },
    estreita: { sheet: TRAIL_SHEET.key, cell: TRAIL_CELL.sign },
} as const satisfies Record<Test, unknown>

/** A legenda de cada mudança de céu. Ela diz o que aconteceu, nunca o pneu. */
export const SKY_WORD: Record<Weather, { text: string; tone: number; icon: { sheet: string; cell: number } }> = {
    chuva: { text: 'CHOVEU!', tone: C.drop, icon: CONDITION_ICON.chovendo },
    nublado: { text: 'NUBLOU', tone: C.cloud, icon: { sheet: PIECE_SHEET.key, cell: PIECE_CELL.cloud } },
    sol: { text: 'SOL!', tone: C.butter, icon: { sheet: PIECE_SHEET.key, cell: PIECE_CELL.sun } },
}

export const LABEL = {
    level: 'Nível',
    gas: 'ACELERAR',
    brake: 'FREIO',
    pit: 'TROCAR PNEU',
    pitOn: 'INDO PRO BOX',
    relayOn: 'TROCAR VEÍCULO',
    moto: 'MOTO',
    carro: 'CARRO',
    place: (n: number) => `${n}º`,
    placeLong: (n: number) => `${n}º lugar!`,
} as const

export const TEST_WORD: Record<Test, string> = {
    chovendo: 'chovendo',
    lama: 'lama',
    estreita: 'pista estreita',
}

export const WHY = {
    rain: 'Está chovendo: pneu de CHUVA!',
    dry: 'Sem chuva: pneu LISO!',
    cloudy: 'Nublado não é chuva: pneu LISO!',
    dryNoMud: 'Sem lama e sem chuva: pneu LISO!',
    mud: 'Pista de lama: pneu de CRAVOS!',
    mudFirst: 'A lama vem primeiro: CRAVOS!',
    narrow: 'Pista estreita: só a MOTO passa!',
    wide: 'Pista larga: volte para o CARRO!',
} as const
