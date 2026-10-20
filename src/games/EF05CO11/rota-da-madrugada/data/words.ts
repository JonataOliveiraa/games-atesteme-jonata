import type { DeviceId, ProblemDef, ProblemKind } from '../types'

export const LABEL = {
    level: 'Nível',
    on: 'LIGADO',
    sensorOff: 'A chuva parou: o sensor desligou o limpador.',
    delivered: 'Entregue!',
    warned: 'A vila toda ficou sabendo!',
    house: 'Dona Cida',
    neighbor: 'Seu Zé',
} as const

export const LEVEL_TEXT = {
    1: { title: 'A vila à noite', goal: 'Leve a encomenda até a Dona Cida!', message: 'Cada problema pede a sua tecnologia: a que resolve ESTE problema.' },
    2: { title: 'A serra', goal: 'Atravesse a serra até a vila!', message: 'Para UMA pessoa, mensagem. Para a VILA TODA, alto-falante.' },
    3: { title: 'Sem sinal', goal: 'Leve a encomenda até a Dona Cida!', message: 'A tecnologia certa depende do problema E do lugar.' },
} as const

export const PROBLEM_TEXT = {
    escuro: { ask: 'Acabaram os postes. Está ESCURO!', good: 'Agora dá pra ver!' },
    chuva: { ask: 'Começou a CHOVER! O vidro embaçou.', good: 'Vidro limpo!' },
    cachorro: { ask: 'Um cachorro dormindo no MEIO da rua!', good: 'Ele acordou e saiu da rua!' },
    entrega: { ask: 'Chegou! Avise SÓ a Dona Cida. A rua está dormindo.', good: 'Só a Dona Cida acordou!' },
    bifurcacao: { ask: 'A estrada se dividiu! Qual vai pra vila?', good: 'Achei o caminho!' },
    vaca: { ask: 'Uma vaca parada no MEIO da estrada!', good: 'A vaca saiu da estrada!' },
    vizinho: { ask: 'A vaca é do seu Zé. Avise SÓ ele! A serra está dormindo.', good: 'Só o seu Zé acordou!' },
    ponte: { ask: 'A ponte caiu! Avise a VILA TODA.', good: 'A vila toda ficou sabendo!' },
    semsinal: { ask: 'SEM SINAL! Qual estrada vai pra vila?', good: 'O mapa mostrou o caminho!' },
    atoleiro: { ask: 'Atolou na lama! Chame o guincho. Ainda SEM SINAL.', good: 'O guincho puxou o carro!' },
    ruanova: { ask: 'O sinal voltou! Rua NOVA: o mapa de papel é velho.', good: 'O GPS conhece a rua nova!' },
    cida: { ask: 'Chegou! Avise a Dona Cida.', good: 'A Dona Cida acordou!' },
} as const

const WHY: Record<string, Partial<Record<DeviceId, string>>> = {
    escuro: {
        buzina: 'A buzina não ilumina!',
        mensagem: 'Mensagem não ilumina a estrada!',
        limpador: 'O limpador não ilumina!',
    },
    chuva: {
        buzina: 'A buzina não limpa o vidro!',
        mensagem: 'Mensagem não limpa o vidro!',
        farol: 'O farol não limpa o vidro!',
    },
    cachorro: {
        farol: 'O farol não avisa ninguém!',
        mensagem: 'Cachorro não lê mensagem!',
        limpador: 'O limpador não acorda ninguém!',
    },
    entrega: {
        farol: 'O farol não avisa ninguém!',
        buzina: 'Acordou a rua toda!',
        limpador: 'O limpador não avisa ninguém!',
    },
    bifurcacao: {
        buzina: 'A buzina não mostra o caminho!',
        mensagem: 'A mensagem não mostra o caminho!',
        altofalante: 'O alto-falante não mostra o caminho!',
    },
    vaca: {
        mensagem: 'Vaca não lê mensagem!',
        altofalante: 'Acordou a serra toda!',
        gps: 'O GPS não tira a vaca!',
    },
    vizinho: {
        altofalante: 'Acordou a serra toda!',
        buzina: 'A buzina não chega lá em cima!',
        gps: 'O GPS não avisa ninguém!',
    },
    ponte: {
        mensagem: 'Só uma pessoa ficou sabendo!',
        buzina: 'A buzina não chega na vila!',
        gps: 'O GPS não avisa ninguém!',
    },
    semsinal: {
        gps: 'Sem sinal, o GPS não acha o caminho!',
        mensagem: 'Sem sinal, a mensagem não sai!',
        radio: 'O rádio não mostra o caminho!',
    },
    atoleiro: {
        mensagem: 'Sem sinal, a mensagem não sai!',
        gps: 'O GPS não chama ninguém!',
        mapa: 'O mapa não chama ninguém!',
    },
    ruanova: {
        mapa: 'O mapa é velho: não tem esta rua!',
        radio: 'O rádio não mostra o caminho!',
        mensagem: 'A mensagem não mostra o caminho!',
    },
    cida: {
        radio: 'A Dona Cida não tem rádio!',
        gps: 'O GPS não avisa ninguém!',
        mapa: 'O mapa não avisa ninguém!',
    },
}

export const why = (problem: ProblemDef, device: DeviceId) => WHY[problem.id]?.[device] ?? ''

export const TUTOR = {
    start: 'Leve a encomenda até a Dona Cida!',
    dark: 'Escureceu! O carro não vê a estrada.',
    tech: 'O computador do carro tem tecnologias. Uma resolve ESTE problema.',
    newTech: 'Tecnologias novas no carro!',
    reach: 'O aviso tem que CHEGAR em quem precisa.',
    noSignal: 'Acabou o SINAL do celular.',
    online: 'O que precisa de sinal não funciona.',
    yourTurn: 'Sua vez!',
    help: 'Leia o problema. Escolha o que resolve ESTE problema.',
    see: 'Ver',
    ok: 'Continuar',
} as const

export const MESSAGE: Record<ProblemKind, string> = {
    escuro: 'Está escuro aqui!',
    chuva: 'Está chovendo!',
    cachorro: 'Sai da rua, cachorro!',
    entrega: 'Dona Cida, sua encomenda chegou!',
    bifurcacao: 'Qual é o caminho?',
    vaca: 'Sai da estrada, vaca!',
    vizinho: 'Seu Zé, sua vaca fugiu!',
    ponte: 'A ponte caiu!',
    atoleiro: 'Atolei! Socorro!',
}

export const RADIO_CALL: Partial<Record<ProblemKind, string>> = {
    atoleiro: 'Guincho, atolei!',
    entrega: 'Alô, Dona Cida?',
}

export const RADIO_DEFAULT = 'Alô, alguém?'
