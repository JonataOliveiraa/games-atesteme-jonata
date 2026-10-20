import type { FishKind, Target } from '../types'

export const LABEL = {
    level: 'Nível',
    oops: 'Ops!',
    right: 'A certa era:',
} as const

export const CAPTION = {
    yourTurn: 'SUA VEZ!',
    tryAgain: 'TENTE DE NOVO!',
    passed: 'OS ANOS PASSARAM...',
    reach: 'A LANÇA NÃO ALCANÇA O FUNDO!',
    dark: 'A LINHA VOLTOU VAZIA!',
    darkSpear: 'NO ESCURO, A LANÇA NÃO ACHA O PEIXE!',
    gone: 'O PEIXE GRANDE ACABOU...',
    night: 'A NOITE CHEGOU...',
    morning: 'AMANHECEU!',
    asks: 'A VILA PEDE:',
    fresh: 'TEM PEIXE FRESQUINHO!',
    far: 'O SOM NÃO CHEGA TÃO LONGE!',
    busy: 'NINGUÉM ATENDEU!',
    nophone: 'A VOVÓ NÃO TEM CELULAR...',
    waiting: 'O ÁUDIO ESPERA...',
    tomorrow: 'E AMANHÃ?',
    pickTool: 'ESCOLHA A FERRAMENTA!',
    otherTool: 'ESCOLHA OUTRA FERRAMENTA!',
} as const

export const NOT_THIS: Record<FishKind, string> = {
    small: 'A VILA QUER UM PEIXINHO!',
    big: 'A VILA QUER O PEIXE GRANDE!',
    school: 'A VILA QUER OS PEIXES DO ESCURO!',
}

export const NOT_TO: Record<Target, string> = {
    vila: 'O RECADO É PARA A VILA!',
    mercado: 'O RECADO É PARA O MERCADO!',
}

export const TOOL_NAME = { lanca: 'Lança', vara: 'Vara', sonar: 'Celular' } as const

export const STORY = {
    vila: 'Do outro lado do rio fica uma vila.',
    family: 'Esta família pesca para a vila há muitos e muitos anos.',
    badge: 'Você começa no tempo do bisavô. Ele pesca com uma lança.',
    goal: 'A vila pede um peixe. O pedido fica aqui em cima.',
    fish: 'Toque no peixe para pescar!',
    reach: 'Com a lança, o bisavô não alcança o fundo. Mas os anos vão passar...',
    vovo: 'Agora é o vovô, o filho do bisavô. Ele pesca com uma vara!',
    question: 'O que mudou? Escolha a frase certa.',
    night: 'No escuro, ninguém vê os peixes. Toque na água para jogar a linha.',
    dark: 'O vovô não vê o peixe no escuro. Os anos vão passar de novo...',
    hoje: 'Hoje é a vez da neta. Ela tem um celular com sonar!',
    sonar: 'Toque na água para jogar o sonar.',
    screen: 'O celular mostra os peixes. Toque no peixe da tela!',
    gone: 'Hoje o rio tem menos peixe. O peixe grande acabou.',
    twist: 'Mas a festa precisa de peixe! Pegue um peixinho.',
    help: 'Toque no peixe que a vila pediu. Se não der, os anos passam.',
} as const

export const STORY2 = {
    fresh: 'A família pescou! Agora precisa avisar quem compra o peixe.',
    goal: 'O recado de agora fica aqui em cima.',
    target: 'Toque em quem vai receber o recado!',
    market: 'O mercado fica lá longe, na cidade.',
    far: 'O búzio só chega perto. A cidade é longe... Os anos vão passar.',
    vovo: 'O vovô tem telefone! A voz vai pelo fio.',
    busy: 'O telefone tocou, mas o Seu Juca estava ocupado.',
    hoje: 'A neta grava um áudio no celular.',
    nophone: 'A vovó da vila não tem celular.',
    voice: 'Chame a vovó com a voz!',
    help: 'Toque em quem vai receber o recado. Se não der, os anos passam.',
} as const

export const STORY3 = {
    start: 'Hoje a neta procura o peixe grande.',
    gone: 'O peixe grande acabou. E no amanhã?',
    bisneta: 'Esta é a bisneta. Ela vive no amanhã.',
    invent: 'Você inventa! Escolha uma invenção para o rio.',
    tools: 'A família guardou suas ferramentas. Escolha uma.',
    fish: 'Depois toque no peixe!',
    other: 'Essa não deu. Escolha outra ferramenta!',
    keep: 'Aqui toda resposta vale. O que você quer guardar?',
    help: 'Escolha a ferramenta e toque no peixe que a vila pediu.',
} as const
