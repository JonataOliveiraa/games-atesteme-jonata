import type { SpotId } from '../types'

export const SEAL: Record<SpotId, string> = {
    cup: 'Suco longe do tablet!',
    cable: 'Fio longe do caminho!',
    edge: 'Tablet no meio da mesa!',
    sun: 'Tablet longe do sol forte!',
}

export const OUCH: Record<SpotId, string> = {
    cup: 'Molhou o tablet!',
    cable: 'Tropeçou no fio!',
    edge: 'O tablet caiu!',
    sun: 'O tablet esquentou!',
}

export const INTRO: Record<SpotId, { look: string; fix: string }> = {
    cup: { look: 'O suco está perto do tablet. Veja!', fix: 'Toque no copo para levar o suco longe.' },
    edge: { look: 'O tablet está na beirada. Veja!', fix: 'Toque no tablet para pôr no meio.' },
    cable: { look: 'O fio está no caminho. Veja!', fix: 'Toque no fio para prender na parede.' },
    sun: { look: 'O sol forte bate no tablet. Veja!', fix: 'Toque na cortina para fechar.' },
}

export const TEACH = {
    goal: 'Deixe o cantinho seguro para a Lia jogar.',
    fresh: 'Tem um perigo novo no quarto!',
    you: 'Agora é você: arrume só o que é perigo.',
    play: 'Depois, aperte JOGAR e veja o dia da Lia.',
    toggle: 'Toque para mudar. De novo, desfaz.',
} as const

export const PLAY = 'JOGAR'
export const YAY = 'Oba! Agora dá pra jogar!'
export const BOARD_TITLE = 'Cuidados com o tablet'
