export const TEACH = {
    rule: 'A regra: ENQUANTO o forno estiver aceso, a esteira fica LIGADA.',
    on: 'O forno acendeu! Toque para ligar a esteira.',
    spark: 'Faísca! O forno vai apagar.',
    off: 'Apagou! Toque para desligar.',
    raw: 'Se a esteira rodar com o forno apagado, o biscoito sai cru.',
    help: 'Olhe o forno: aceso, liga; apagado, desliga.',
} as const

export const HELP = {
    oven: 'Olhe o forno: aceso, liga; apagado, desliga.',
    tray: 'Deixe ligada até a bandeja ter 6. Encheu? Desligue!',
    whistle: 'Deixe ligada até o chef apitar. Apitou? Desligue!',
} as const

export const LEVEL_INTRO: Record<number, string> = {
    2: 'Regra nova: ATÉ. Deixe a esteira ligada ATÉ a bandeja ter 6 biscoitos.',
    3: 'Agora a regra muda no meio! Leia a ficha toda vez que ela balançar.',
}

export const CHANGE = 'A regra mudou! Leia a ficha.'
export const WHISTLE = 'PRIIII!'

export const FINALE = {
    title: 'A fornada de hoje',
    oven: 'FORNO',
    rule: 'REGRA',
    belt: 'ESTEIRA',
    line: 'A repetição continua ENQUANTO a condição vale, e para quando ela muda.',
} as const
