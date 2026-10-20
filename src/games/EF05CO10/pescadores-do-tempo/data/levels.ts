import type { InventionDef, LevelDef } from '../types'
import { ICON, INVENT } from './files'

export const POINTS = 10

export const guideKey = (level: number, step: string) => `ef05co10-pescadores-l${level}-${step}`

const N1: LevelDef = {
    level: 1,
    mode: 'pesca',
    title: 'Cada tempo pesca de um jeito',
    message: 'Muda o jeito de pescar. A família continua pescando para a vila!',
    phases: [
        {
            id: 'almoco',
            start: 0,
            night: false,
            want: { fish: 'small', goal: 'Pesque um peixe para o almoço!', icon: ICON.small },
            after: 'A VILA VAI ALMOÇAR!',
        },
        {
            id: 'grande',
            start: 0,
            night: false,
            want: { fish: 'big', goal: 'Pesque o peixe grande!', icon: ICON.big },
            after: 'O VOVÔ PEGOU O PEIXE GRANDE!',
            question: {
                title: 'O que mudou?',
                right: 'A vara alcança o fundo do rio.',
                wrong: ['A vara mostra o peixe no escuro.', 'A vara pesca sozinha.'],
            },
        },
        {
            id: 'noite',
            start: 1,
            night: true,
            want: { fish: 'school', goal: 'Pesque no escuro!', icon: ICON.school },
            after: 'A NETA PESCOU NO ESCURO!',
            question: {
                title: 'O que mudou?',
                right: 'O celular mostra o peixe no escuro.',
                wrong: ['O celular puxa o peixe sozinho.', 'O celular traz o peixe grande de volta.'],
            },
        },
        {
            id: 'festa',
            start: 2,
            night: false,
            want: { fish: 'big', goal: 'Peixe grande para a festa!', icon: ICON.big },
            twist: { fish: 'small', goal: 'Pesque um peixe para a festa!', icon: ICON.party },
            after: 'A FESTA DA VILA COMEÇOU!',
            question: {
                title: 'O que continuou igual?',
                right: 'A família pesca para a vila.',
                wrong: ['A lança de madeira.', 'O rio cheio de peixe grande.'],
            },
        },
    ],
}

const N2: LevelDef = {
    level: 2,
    mode: 'recado',
    title: 'Cada tempo avisa de um jeito',
    message: 'Muda o jeito de avisar. A conversa com a vila continua!',
    uses: ['avisa com búzio', 'avisa por telefone', 'avisa com áudio'],
    phases: [
        {
            id: 'vila',
            start: 0,
            night: false,
            want: { to: 'vila', goal: 'Avise a vila: tem peixe!', icon: ICON.vila },
            after: 'A VILA OUVIU O BÚZIO!',
        },
        {
            id: 'mercado',
            start: 0,
            night: false,
            want: { to: 'mercado', goal: 'Avise o mercado da cidade!', icon: ICON.mercado },
            after: 'O SEU JUCA ATENDEU!',
            question: {
                title: 'O que mudou?',
                right: 'O telefone leva a voz para longe.',
                wrong: ['O telefone leva o peixe para a cidade.', 'O telefone mostra o peixe para o vendedor.'],
            },
        },
        {
            id: 'ocupado',
            start: 1,
            night: false,
            busy: true,
            want: { to: 'mercado', goal: 'Avise o mercado de novo!', icon: ICON.mercado },
            after: 'A BIA OUVIU O ÁUDIO!',
            question: {
                title: 'O que mudou?',
                right: 'O áudio espera a pessoa ouvir depois.',
                wrong: ['O áudio só chega se a pessoa atender na hora.', 'O áudio leva o peixe para a cidade.'],
            },
        },
        {
            id: 'vovo',
            start: 2,
            night: false,
            want: { to: 'vila', goal: 'Avise a vila: tem peixe!', icon: ICON.vila },
            twist: { to: 'vila', goal: 'Chame a vovó com a voz!', icon: ICON.vovo },
            after: 'A VOVÓ OUVIU!',
            question: {
                title: 'O que continuou igual?',
                right: 'A família avisa a vila que tem peixe.',
                wrong: ['O búzio de concha.', 'O telefone com fio.'],
            },
        },
    ],
}

export const INVENTIONS: InventionDef[] = [
    {
        id: 'robo',
        name: 'Robô limpador',
        frame: INVENT.robo,
        question: {
            title: 'O que mudou?',
            right: 'O robô tira o lixo do rio.',
            wrong: ['O robô pesca o peixe grande sozinho.', 'O robô faz o peixe crescer.'],
        },
    },
    {
        id: 'bercario',
        name: 'Berçário de peixes',
        frame: INVENT.bercario,
        question: {
            title: 'O que mudou?',
            right: 'O berçário protege os filhotes até crescerem.',
            wrong: ['O berçário pesca os peixes grandes.', 'O berçário tira o lixo do rio.'],
        },
    },
    {
        id: 'drone',
        name: 'Drone de árvores',
        frame: INVENT.drone,
        question: {
            title: 'O que mudou?',
            right: 'O drone planta árvores na beira do rio.',
            wrong: ['O drone pesca o peixe lá do céu.', 'O drone tira o lixo do fundo do rio.'],
        },
    },
]

const N3: LevelDef = {
    level: 3,
    mode: 'amanha',
    title: 'Você inventa o amanhã',
    message: 'Você inventou o amanhã e guardou o que importa!',
    phases: [
        {
            id: 'invento',
            start: 2,
            night: false,
            want: { fish: 'big', goal: 'Pesque o peixe grande!', icon: ICON.big },
            invent: { fish: 'big', goal: 'Invente: traga o peixe grande de volta!', icon: ICON.idea },
            after: 'O PEIXE GRANDE VOLTOU!',
        },
        {
            id: 'festa',
            start: 3,
            night: false,
            toolbox: true,
            want: { fish: 'big', goal: 'Peixe grande para a festa!', icon: ICON.party },
            after: 'A BISNETA PEGOU O PEIXE GRANDE!',
            question: {
                title: 'O que do passado você quer manter?',
                right: 'A vara do vovô.',
                wrong: ['Pescar só o que a vila precisa.', 'O búzio para chamar a vila.'],
                free: true,
            },
        },
        {
            id: 'noite',
            start: 3,
            night: true,
            toolbox: true,
            want: { fish: 'school', goal: 'Pesque no escuro!', icon: ICON.school },
            after: 'A FESTA DO AMANHÃ COMEÇOU!',
            question: {
                title: 'O que continuou igual?',
                right: 'A família pesca para a festa da vila.',
                wrong: ['A lança de madeira.', 'O rio sem peixe grande.'],
            },
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]
