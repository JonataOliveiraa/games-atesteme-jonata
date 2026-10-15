import type { Sender } from '../types'

export const NAME: Record<Sender, string> = {
    nina: 'Nina',
    duda: 'Duda',
    bia: 'Bia',
    caio: 'Caio',
    rafa: 'Rafa',
    prof: 'Profª Ana',
    mae: 'Mãe',
    vovo: 'Vovó',
    turma: 'Turma do 4º ano',
    escola: 'Grupo da escola',
    pet: 'Bichinho',
    unknown: 'Desconhecido',
}

export const APP_NAME = {
    camera: 'Câmera',
    gallery: 'Galeria',
    chat: 'Conversas',
    pet: 'Bichinho',
    music: 'Música',
    settings: 'Ajustes',
    flashlight: 'Lanterna',
    map: 'Mapa',
} as const

export const PHONE_TEXT = {
    days: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
    typing: 'Mensagem',
    photo: 'FOTO',
    erase: 'Apagar',
    wallpaper: 'Pôr de fundo de tela',
    night: 'Boa noite!',
    sent: 'enviada',
}

export const TEACH = {
    phone: 'Este é o seu celular.',
    phoneButton: 'Ligar',
    data: 'Nele moram fotos, recados e senhas.',
    friends: 'Muitos são dos seus amigos.',
    asks: 'Hoje, muita gente vai te pedir coisas.',
    demoBanner: 'Chegou um pedido da Vovó!',
    demoChat: 'Ela quer uma foto do seu desenho.',
    demoCamera: 'O desenho é seu. Pode fotografar!',
    demoDone: 'Pedido atendido! A Vovó adorou.',
    care: 'E se for de outra pessoa? Cuidado!',
    choose: 'O que você faz?',
    go: 'Sua vez!',
    goButton: 'Vamos começar!',
}

export const HELP = {
    order: 'Leia o pedido.',
    care: 'Cuide dos dados de todos.',
}

export const DEMO = {
    banner: 'Me manda uma foto do seu desenho?',
    order: 'Me manda foto do seu desenho?',
    thanks: 'Que lindo! Vou pôr na geladeira!',
}

export const MURAL = {
    banner: 'Mandem a foto de um colega para o mural!',
    order: 'Mandem a foto de um colega!',
    ask: 'Nina, posso tirar uma foto sua?',
    yes: 'Pode! Vou fazer pose!',
    thanks: 'Que foto linda!',
    happy: 'Fiquei bonita!',
    oops: 'Ei! Você nem me perguntou!',
}

export const DIARY = {
    order: 'Tira foto do diário da Bia!',
    duda: 'Achei o diário da Bia! Tira foto!',
    refuse: 'Não! O diário é da Bia.',
    agree: 'É... tem razão.',
    thanks: 'Meu diário! Obrigada!',
    oops: 'Você fotografou meu diário?!',
}

export const PASSWORD = {
    banner: 'Me passa sua senha do Bichinho? Eu cuido dele!',
    order: 'Me passa sua senha do Bichinho?',
    give: 'A senha é 7 2 5 8.',
    keep: 'Senha eu não passo, nem pra amigo!',
    fine: 'Tá certo! Senha é segredo.',
    leak: 'Valeu! Vou passar pro Leo também!',
    alert: 'Alguém entrou na sua conta!',
}

export const PARTY = {
    banner: 'Manda uma foto da festa?',
    order: 'Manda uma foto da festa?',
    ask: 'Rafa, posso tirar uma foto sua?',
    no: 'Agora não! Tô todo sujo de bolo!',
    respect: 'Tá bom! Tiro do bolo.',
    thanks: 'Valeu!',
    mom: 'Que bolo lindo!',
    oopsFirst: 'Ei! Tô todo sujo!',
    oopsAfter: 'Eu disse que agora não!',
}

export const FUNNY = {
    banner: 'Apaga a foto da minha careta?',
    order: 'Apaga a foto da minha careta?',
    thanks: 'Valeu! Você é demais!',
    oops: 'Todo mundo vai ver minha careta!',
}

export const NEXT = 'Continuar'

export const TO: Partial<Record<Sender, string>> = {
    nina: 'à Nina',
    bia: 'à Bia',
    duda: 'à Duda',
    caio: 'ao Caio',
    rafa: 'ao Rafa',
    mae: 'à Mãe',
    vovo: 'à Vovó',
}

export const DEST: Partial<Record<Sender, string>> = {
    escola: 'a escola',
    caio: 'o Caio',
    unknown: 'o desconhecido',
    vovo: 'a Vovó',
    mae: 'a Mãe',
}

export const SHARE = {
    title: 'Encaminhar para',
    send: (to: Sender) => `Enviar para ${DEST[to] ?? NAME[to]}`,
    ask: (owner: Sender) => `Perguntar ${TO[owner] ?? NAME[owner]}`,
    keep: 'Não enviar',
    waiting: 'Esperando a resposta...',
    yes: (owner: Sender) => `${NAME[owner]} deixou!`,
    no: (owner: Sender) => `${NAME[owner]} não deixou.`,
    forward: 'Encaminhar',
    forwardContact: 'Encaminhar contato',
    sent: 'Enviado!',
}

export const PERMISSION = {
    allow: 'Permitir',
    deny: 'Não permitir',
    camera: 'A Câmera quer usar a CÂMERA.',
    map: 'O Mapa quer saber ONDE VOCÊ ESTÁ.',
    flashlight: 'A Lanterna quer ver seus CONTATOS.',
}

export const TEACH2 = {
    day: 'Mais um dia com o celular!',
    forward: 'Hoje, pedem pra passar coisas adiante.',
    demoBanner: 'A Vovó quer a foto do bolo.',
    demoGallery: 'A foto é sua. Pode encaminhar!',
    demoDone: 'Encaminhado! A Vovó recebeu.',
    care: 'Se for de outra pessoa, pergunte antes!',
}

export const TEACH3 = {
    day: 'Mais um dia com o celular!',
    apps: 'Hoje, os apps também pedem dados.',
    demoDialog: 'A câmera precisa da câmera. Pode!',
    demoDone: 'Permita só o que o app precisa!',
}

export const DEMO2 = {
    banner: 'Me encaminha aquela foto do bolo?',
    order: 'Me encaminha a foto do bolo?',
    thanks: 'Que delícia de bolo!',
}

export const DEMO3 = {
    banner: 'Tira uma foto do seu quarto arrumado?',
    order: 'Tira foto do seu quarto?',
}

export const FWD_PHOTO = {
    banner: 'Quem tiver foto da turma, encaminha pro grupo da escola!',
    order: 'Encaminhem fotos para a escola!',
    yes: 'Pode! Adorei essa foto.',
    thanks: 'Que foto linda, Nina!',
    oops: 'Era só pro mural da turma!',
}

export const FWD_FACE = {
    banner: 'Olha a cara da Bia! Encaminha pra escola toda!',
    order: 'Encaminha a foto da Bia!',
    no: 'Não! Apaga essa foto, por favor!',
    sorry: 'Foi mal... você tem razão.',
    thanks: 'Valeu por não mandar!',
    oops: 'Todo mundo viu minha cara!',
}

export const FWD_NUMBER = {
    ask: 'Me passa o número da Nina?',
    order: 'Me passa o número da Nina?',
    yes: 'Pode! O Caio é meu amigo.',
    thanks: 'Valeu! Vou chamar a Nina.',
    oops: 'Ei! Meu número é meu!',
    number: '(11) 98765-4321',
}

export const FWD_LIST = {
    banner: 'Oi! Sou da escola nova. Me manda a lista da sua turma?',
    order: 'Me manda a lista da sua turma?',
    title: 'Lista da turma',
    no: 'Não envie! Você nem sabe quem é.',
    thanks: 'Fez bem! Os números são dos seus amigos.',
    oops: 'Um estranho me mandou mensagem!',
    oops2: 'Quem deu meu número pra ele?',
}

export const MAP = {
    banner: 'Hoje tem passeio! Abram o Mapa pra ninguém se perder.',
    order: 'Abram o Mapa do passeio!',
    found: 'Achei o caminho do museu!',
    lost: 'E agora? Cadê a turma?',
    here: 'Você está aqui',
    unknown: 'Onde você está?',
}

export const POSTER = {
    caio: 'Pode usar meu desenho no cartaz!',
    banner: 'Montem o cartaz da Feira com o desenho do Caio!',
    order: 'Monte o cartaz da Feira!',
    title: 'Feira de Ciências',
    sign: 'Desenho de:',
    credit: 'Pôr o nome do Caio',
    mine: 'Pôr o meu nome',
    me: 'Você',
    thanks: 'Meu nome no cartaz!',
    oops: 'Mas fui eu que desenhei!',
}

export const COINS = {
    banner: 'Libere seus contatos e ganhe 500 moedas!',
    order: 'Libere os contatos e ganhe moedas!',
    title: '500 moedas!',
    text: 'É só liberar seus CONTATOS.',
    allow: 'Liberar contatos',
    deny: 'Agora não',
    fine: 'Seu bichinho continua feliz!',
    oops: 'Recebi propaganda do Bichinho!',
    oops2: 'Eu também! Quem passou meu número?',
}

export const LIGHT = {
    banner: 'Faltou luz! Liga a lanterna do celular?',
    order: 'Liga a lanterna do celular?',
    thanks: 'Achei a vela! Obrigada!',
    oops: 'Recebi propaganda da Lanterna!',
}
