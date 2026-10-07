import { DOG_NAME } from './cast'
import type { DogId, TraitId } from '../types'

export const LABEL: Record<TraitId, string> = {
    cap: 'BONÉ',
    hat: 'CHAPÉU',
    glasses: 'ÓCULOS',
    bucket: 'BALDE',
    ring: 'BOIA',
    ball: 'BOLA',
    fins: 'PÉ DE PATO',
}

const WEARS: Record<TraitId, boolean> = {
    cap: true,
    hat: true,
    glasses: true,
    bucket: false,
    ring: false,
    ball: false,
    fins: true,
}

const he = (t: TraitId) => (WEARS[t] ? 'usa' : 'tem')
const i = (t: TraitId) => (WEARS[t] ? 'uso' : 'tenho')
const all = (t: TraitId) => (WEARS[t] ? 'usam' : 'têm')
const low = (t: TraitId) => LABEL[t].toLowerCase()

export const SAY = {
    found: (dog: DogId) => `Achei o ${DOG_NAME[dog]}! Cadê o dono?`,
    datum: (t: TraitId) => `O dono ${he(t)} ${LABEL[t]}!`,
    nobody: (t: TraitId) => `Todos ${all(t)} ${LABEL[t]}! Ninguém sai.`,
    leave: 'Não sou eu!',
    kept: (t: TraitId) => `Eu ${i(t)} ${LABEL[t]}!`,
    keptOwner: (t: TraitId, dog: DogId) => `Eu ${i(t)} ${LABEL[t]}! O ${DOG_NAME[dog]} é meu!`,
    missed: (t: TraitId) => `Opa! Eu não ${i(t)} ${LABEL[t]}.`,
}

export const TEACH = {
    lost: (dog: DogId) => `O ${DOG_NAME[dog]} se perdeu! Vamos achar o dono.`,
    datum: (t: TraitId) => `Um dado: o dono ${he(t)} ${LABEL[t]}.`,
    who: (t: TraitId) => `Quem não ${he(t)} ${low(t)} não é o dono.`,
    rest: (t: TraitId) => `Tire os outros que não ${all(t)} ${low(t)}.`,
    notEnough: (n: number) => `Sobraram ${n}. Um dado só não basta!`,
    radio: 'Agora é você quem chama o próximo dado.',
    radioGo: 'Tirou quem não combina? Toque no rádio!',
    useless: (t: TraitId, n: number) => `${n === 2 ? 'Os dois' : 'Todos'} ${all(t)} ${low(t)}. Ninguém sai: toque no rádio!`,
}

export const LEVEL_INTRO: Record<number, string> = {
    2: 'Agora são 3 dados. Às vezes, 2 não bastam!',
}

export const HELP = {
    board: 'Os dados do dono chegam aqui, um de cada vez.',
    grid: 'Toque em quem NÃO combina com o dado. Quem sobrar é o dono!',
    radio: 'Acabou este dado? Toque no rádio para chamar o próximo.',
}

export const RADIO_LABEL = 'PRÓXIMO DADO'

export const CARD = {
    title: (dog: DogId) => `Dono do ${DOG_NAME[dog]}`,
    line: 'Juntos, os dados acharam o dono!',
    next: 'Próximo',
}

export const FINALE = {
    title: 'Diário da praia',
    data: 'DADOS',
    info: 'INFORMAÇÃO',
    line: 'Dados são pedacinhos. Juntos, viram informação!',
}
