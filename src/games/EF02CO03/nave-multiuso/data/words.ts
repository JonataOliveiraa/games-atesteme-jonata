import type { Kind, Place, Rule, Tool } from '../types'

export const TEACH = {
    hello: 'Oi! Eu sou a Zuri, piloto desta nave.',
    reach: 'Esta faixa mostra onde a ferramenta alcança.',
    leavesLook: 'Olhe: folhas no caminho!',
    stick: 'Arraste a bolinha para pilotar a nave até lá.',
    fireLook: 'Agora vem uma árvore pegando fogo!',
    fire: 'Troque para a água antes de chegar.',
    back: 'Depois, volte para o assoprador!',
    careful: 'Não deixe nada passar! Ferramenta errada não funciona.',
    stickHelp: 'Arraste a bolinha para voar para qualquer lado.',
    signRead: 'A placa mostra o que vem, na ordem.',
    signSwap: 'Troque a ferramenta antes de cada grupo chegar!',
    toolsRead: 'Agora a placa mostra a ferramenta, e a nave troca sozinha.',
    toolsGo: 'Voe até a coisa que essa ferramenta resolve!',
    toolsSkip: 'O que ela não resolve pode passar.',
} as const

export const SIGN_HELP: Record<Exclude<Rule, 'free'>, string> = {
    things: 'A placa mostra o que vem, na ordem.',
    tools: 'Voe até o que a ferramenta da placa resolve.',
}

export const PLACE_HELLO: Record<Place, string> = {
    earth: 'Vamos limpar o caminho!',
    space: 'Segura firme: vamos para o espaço!',
    moon: 'Chegamos na Lua!',
}

export const PAIRS: Record<Place, Record<Tool, string>> = {
    earth: {
        blower: 'O assoprador tira as folhas do caminho.',
        water: 'A água apaga o fogo.',
        pull: 'O raio-puxa resgata a ovelhinha.',
    },
    space: {
        blower: 'No espaço, o assoprador espalha a poeira das estrelas.',
        water: 'A água apaga o meteoro pegando fogo.',
        pull: 'O raio-puxa resgata a ovelha astronauta.',
    },
    moon: {
        blower: 'Na Lua, o assoprador tira a poeira do chão.',
        water: 'A água apaga o robô pegando fogo.',
        pull: 'O raio-puxa resgata o coelhinho da Lua.',
    },
}

export const KIND_NAME: Record<Place, Record<Kind, string>> = {
    earth: { leaves: 'Folhas', fire: 'Fogo', sheep: 'Ovelha' },
    space: { leaves: 'Poeira', fire: 'Meteoro', sheep: 'Ovelha' },
    moon: { leaves: 'Poeira', fire: 'Robô', sheep: 'Coelho' },
}

export const TOOL_NAME: Record<Tool, string> = {
    blower: 'Assoprador',
    water: 'Água',
    pull: 'Raio-puxa',
}

export const TOOLS_HELP: Record<Place, string> = {
    earth: 'Assoprador: folhas. Água: fogo. Raio-puxa: ovelha.',
    space: 'Assoprador: poeira. Água: meteoro. Raio-puxa: ovelha.',
    moon: 'Assoprador: poeira. Água: robô. Raio-puxa: coelhinho.',
}

export const END = {
    title: 'Caminho limpo!',
    message: 'Cada ferramenta faz a sua tarefa, e juntas elas limpam o caminho!',
} as const

export const END_BY_LEVEL: Record<number, { title: string; message: string }> = {
    2: { title: 'Até o espaço!', message: 'Você leu a placa e trocou a ferramenta na hora certa!' },
    3: { title: 'Pouso na Lua!', message: 'Para cada ferramenta, você achou a tarefa que ela sabe fazer!' },
}
