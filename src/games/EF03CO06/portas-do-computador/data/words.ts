import type { DeviceId, InfoId, LevelKind, PersonId, Wish } from '../types'
import { DEVICES, INFO, PERSON, WISH } from './devices'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
/** "pelo MICROFONE", "pela CÂMERA" */
const by = (d: DeviceId) => `${DEVICES[d].art.startsWith('a ') ? 'pela' : 'pelo'} ${DEVICES[d].name}`

export const PROCESSING = 'PROCESSANDO…'

export const SAY = {
    wrongDoor: (door: DeviceId, info: InfoId) => `${cap(DEVICES[door].art)} não pega ${INFO[info].kind}!`,
    wrongWish: (person: PersonId, wish: Wish) => `${PERSON[person].art} queria ${WISH[wish].verb}!`,
}

export const TEACH = {
    yourTurn: (lights: number) => `Sua vez! Acenda as ${lights} luzes.`,
    door: {
        note: 'SOM entra pelo MICROFONE.',
        photo: 'IMAGEM entra pela CÂMERA.',
        letter: 'LETRAS entram pelo TECLADO.',
    } as Record<InfoId, string>,
    wish: {
        hear: 'OUVIR: sai pelo ALTO-FALANTE.',
        see: 'VER: sai pela TELA.',
        paper: 'PAPEL: sai pela IMPRESSORA.',
    } as Record<Wish, string>,
}

export const HELP = {
    info: 'SOM, IMAGEM ou LETRAS?',
    wish: 'O que a pessoa quer?',
    doors: 'Toque no aparelho certo.',
    goal: (lights: number) => `Acenda as ${lights} luzes.`,
}

export const FINALE = {
    title: {
        in: 'Por onde cada informação entrou',
        out: 'Por onde cada informação saiu',
        both: 'O caminho de cada informação',
    } as Record<LevelKind, string>,
    lines: {
        note: 'O SOM entra pelo MICROFONE.',
        photo: 'A IMAGEM entra pela CÂMERA.',
        letter: 'As LETRAS entram pelo TECLADO.',
    } as Record<InfoId, string>,
    wishes: {
        hear: 'Para OUVIR, sai pelo ALTO-FALANTE.',
        see: 'Para VER, sai pela TELA.',
        paper: 'Para o PAPEL, sai pela IMPRESSORA.',
    } as Record<Wish, string>,
    path: (info: InfoId, out: DeviceId) => `${INFO[info].kind}: entra ${by(INFO[info].door)}, sai ${by(out)}.`,
    synth: {
        in: 'O computador conversa com o mundo: a informação ENTRA por um aparelho de entrada.',
        out: 'O computador conversa com o mundo: a informação SAI por um aparelho de saída.',
        both: 'O computador conversa com o mundo: a informação ENTRA por um aparelho e SAI por outro.',
    } as Record<LevelKind, string>,
}

export const LAST_TITLE = 'O computador conversou com o mundo!'
