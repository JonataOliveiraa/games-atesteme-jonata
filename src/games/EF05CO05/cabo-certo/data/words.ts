export const LABEL = {
    level: 'Nível',
    chip: 'PROCESSADOR',
    tapNow: (name: string) => `Tudo ligado! Toque no ${name}.`,
    oops: 'Ops!',
} as const

export const SAY = {
    hello: 'Oi! Eu sou o processador. Tudo o que entra no computador passa por mim.',
    busy: 'Essa tomada já tem cabo.',
    noCable: 'Ligue meu cabo primeiro!',
    noPower: (name: string) => `O ${name} não está ligado.`,
    think: 'Pensando...',
    welcome: 'Acordei! Agora eu também posso ser ligado.',
} as const

export const TEACH = {
    pc: 'Este é o computador. No meio dele fica o PROCESSADOR: tudo o que entra passa por ele.',
    entrada: 'Pelas tomadas verdes a informação ENTRA no computador.',
    saida: 'Pela tomada laranja a informação SAI para a gente ver ou ouvir.',
    armazenamento: 'Na tomada roxa a informação fica GUARDADA para depois.',
    drag: 'Puxe o cabo de um aparelho até a tomada da função dele. Todo plugue é igual: quem decide é você!',
    pan: 'O mapa é maior que a tela: arraste o chão para achar os outros aparelhos.',
    use: 'Com tudo ligado, toque no aparelho para ele funcionar.',
    nest: 'A tomada de SAÍDA do computador já está ocupada. Olhe: o monitor tem uma tomada de SAÍDA também!',
} as const

export const HELP = [TEACH.entrada, TEACH.saida, TEACH.armazenamento, TEACH.pan] as const

export const SCREEN = {
    texto: 'OLÁ!',
    cursor: '',
    foto: '',
    musica: '',
} as const
