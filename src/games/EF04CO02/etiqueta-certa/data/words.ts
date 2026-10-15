import type { City, Field } from '../types'

export const FIELD: Record<Field, string> = {
    name: 'NOME',
    to: 'PARA',
    from: 'DE',
    weight: 'PESO',
}

export const RULE = 'Separe pelo'

export const GO_LABEL = 'PARTIR'
export const STAMP_LABEL = 'CARIMBAR'

export const TEACH = {
    label: 'Cada trem tem etiqueta.',
    names: 'Cada informação tem um nome.',
    match: (city: City) => `PARA: ${city}!`,
    lever: 'Vire a alavanca.',
    go: 'Aperte PARTIR!',
    moved: 'Mudou de lugar. Leia o nome!',
    yourTurn: 'Sua vez!',
}

/** N2: o pátio largo e a placa que vira */
export const TEACH2 = {
    wide: 'O pátio é grande!',
    drag: 'Arraste para ver.',
    levers: 'Cada alavanca muda um trilho.',
    flip: 'Devolução! Agora manda o DE.',
}

/** N3: o recado e o carimbo */
export const TEACH3 = {
    note: 'Um recado!',
    find: (name: string) => `Achou: ${name}!`,
    stamp: 'Carimbe o campo do recado.',
    changed: 'A etiqueta mudou!',
    /** o trem de mostra que não é o do recado passa sem carimbo */
    notThis: (name: string) => `Não é ${name}.`,
}

/** em maiúsculas, NOME é sempre o campo; o nome de cada campo é citado pelo próprio campo */
export const HELP = {
    sign: 'A placa diz o campo.',
    label: (field: string) => `Ache o ${field} na etiqueta.`,
    lever: 'Vire para a cidade e aperte PARTIR.',
    levers: 'Arraste e vire as alavancas.',
    note: 'O recado é de um NOME só.',
}

export const SAY = {
    /** mandou para o galpão do DE com a placa pedindo o PARA */
    tookFrom: 'Esse é o DE: de onde veio. Quem manda é o PARA.',
    /** mandou para o galpão do PARA com a placa pedindo o DE */
    tookTo: 'Esse é o PARA. Na devolução, quem manda é o DE.',
    other: (field: string, city: City) => `A etiqueta diz ${field}: ${city}.`,
    noteMissing: (name: string) => `Faltou carimbar o recado de ${name}!`,
    wrongTrain: (name: string) => `O recado é só de ${name}.`,
    wrongField: (field: string) => `O recado muda o ${field}.`,
}
