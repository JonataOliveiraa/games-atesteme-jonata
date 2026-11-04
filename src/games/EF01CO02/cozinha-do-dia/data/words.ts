import type { ObjectId } from '../types'

export const LABEL = {
    level: 'Nível',
} as const

export const TURN_OF: Record<ObjectId, string> = {
    bowl: 'da tigela',
    cereal: 'do cereal',
    milk: 'do leite',
    bun: 'do pão',
    sausage: 'da salsicha',
    ketchup: 'do ketchup',
    banana: 'da banana',
    lid: 'da tampa',
    button: 'de ligar',
    bread: 'do pão',
    cheese: 'do queijo',
    cup: 'da taça',
    scoop: 'do sorvete',
    syrup: 'da calda',
    cookie: 'do biscoito',
    cream: 'do creme',
    berry: 'do morango',
}

export const whyLine = (id: ObjectId) => `Era a vez ${TURN_OF[id]}!`

export const TEACH = {
    hungry: 'O gatinho está com fome!',
    wants: 'Ele quer cereal com leite.',
    recipe: 'Esta é a receita.',
    oneByOne: 'Um passo de cada vez!',
    outOfOrder: 'Fora da receita, vira bagunça!',
    go: 'Sua vez!',
    hold: 'Segure para derramar!',
    aim: 'Arraste para acertar!',
    noLight: 'Agora nada acende!',
    check: 'O ✓ mostra o que já foi.',
    twice: 'Tem coisa que volta!',
    two: 'Duas receitas!',
    onlyOne: 'Só uma faz este prato.',
    goPick: 'Qual faz o prato?',
} as const

export const HELP = {
    follow: 'Siga a receita, um passo de cada vez.',
    track: 'O ✓ mostra o que já foi. Veja o próximo!',
    pick: 'Só uma receita faz o prato da nuvem.',
} as const
