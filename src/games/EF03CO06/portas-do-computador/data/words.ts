import type { DeviceId, InfoId } from '../types'
import { DEVICES, INFO } from './devices'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const PROCESSING = 'PROCESSANDO…'
export const SIDE_LABEL = { input: 'ENTRADA', output: 'SAÍDA' }

export const SAY = {
    wrongDoor: (door: DeviceId, info: InfoId) => `${cap(DEVICES[door].art)} não pega ${INFO[info].kind}!`,
}

export const TEACH = {
    computer: 'Este é o computador. Os aparelhos ficam ligados nas portas dele.',
    info: (info: InfoId) => `Chegou uma informação do mundo lá fora: ${INFO[info].kind === 'LETRAS' ? 'LETRAS' : `um ${INFO[info].kind}`}.`,
    door: {
        note: 'O SOM entra pelo MICROFONE. Toque nele!',
        photo: 'A IMAGEM entra pela CÂMERA. Toque nela!',
        letter: 'As LETRAS entram pelo TECLADO. Toque nele!',
    } as Record<InfoId, string>,
    goal: 'Ela entrou no computador! Encha todas as luzes.',
}

export const HELP = {
    info: 'Veja o que a informação é: SOM, IMAGEM ou LETRAS.',
    doors: 'Toque no aparelho que deixa ela ENTRAR no computador.',
    goal: 'Encha todas as luzes do computador.',
}

export const FINALE = {
    title: 'Por onde cada informação entrou',
    lines: {
        note: 'O SOM entra pelo MICROFONE.',
        photo: 'A IMAGEM entra pela CÂMERA.',
        letter: 'As LETRAS entram pelo TECLADO.',
    } as Record<InfoId, string>,
    synth: 'O computador conversa com o mundo: a informação ENTRA por um aparelho de entrada.',
}
