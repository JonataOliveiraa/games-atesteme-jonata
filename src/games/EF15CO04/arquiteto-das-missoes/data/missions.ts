import type { MissionDef } from '../types'

export const CAFE: MissionDef = {
    id: 'cafe',
    goalLabel: 'CAFÉ DA MANHÃ',
    goalIcon: 'mesa',
    before: 'missao-cafe-antes',
    after: 'missao-cafe-depois',
    sheet: 'icones-cafe',
    parts: [
        {
            id: 'cafe',
            label: 'CAFÉ',
            task: 'Faça o café',
            done: 'Café pronto!',
            icon: 'cafe',
            steps: [
                { id: 'agua', icon: 'agua', label: 'Esquentar a água' },
                { id: 'filtro', icon: 'filtro', label: 'Pôr o filtro' },
                { id: 'coar', icon: 'coar', label: 'Coar o café' },
            ],
        },
        {
            id: 'sanduiche',
            label: 'SANDUÍCHE',
            task: 'Monte o sanduíche',
            done: 'Sanduíche pronto!',
            icon: 'sanduiche',
            steps: [
                { id: 'pao', icon: 'pao', label: 'Pegar o pão' },
                { id: 'recheio', icon: 'recheio', label: 'Pôr o recheio' },
                { id: 'cortar', icon: 'cortar', label: 'Cortar ao meio' },
            ],
        },
    ],
    decoys: [
        { id: 'varrer', label: 'VARRER', icon: 'vassoura' },
        { id: 'cama', label: 'CAMA', icon: 'cama' },
    ],
}

export const FESTA: MissionDef = {
    id: 'festa',
    goalLabel: 'FESTA DA ESCOLA',
    goalIcon: 'festa',
    before: 'missao-festa-antes',
    after: 'missao-festa-depois',
    sheet: 'icones-festa',
    parts: [
        {
            id: 'decoracao',
            label: 'DECORAÇÃO',
            task: 'Encha os balões',
            done: 'Decoração pronta!',
            icon: 'bandeirinhas',
            steps: [
                { id: 'pacote', icon: 'pacote', label: 'Abrir o pacote' },
                { id: 'balao', icon: 'balao', label: 'Encher o balão' },
                { id: 'pendurar', icon: 'pendurar', label: 'Pendurar tudo' },
            ],
        },
        {
            id: 'bolo',
            label: 'BOLO',
            task: 'Faça o bolo',
            done: 'Bolo pronto!',
            icon: 'bolo',
            steps: [
                { id: 'massa', icon: 'massa', label: 'Bater a massa' },
                { id: 'forma', icon: 'forma', label: 'Pôr na forma' },
                { id: 'forno', icon: 'forno', label: 'Assar no forno' },
            ],
        },
        {
            id: 'som',
            label: 'SOM',
            task: 'Ligue o som',
            done: 'Som pronto!',
            icon: 'caixa',
            steps: [
                { id: 'levar', icon: 'levar', label: 'Levar a caixa' },
                { id: 'tomada', icon: 'tomada', label: 'Ligar na tomada' },
                { id: 'musica', icon: 'musica', label: 'Tocar a música' },
            ],
        },
    ],
    decoys: [
        { id: 'licao', label: 'LIÇÃO', icon: 'caderno' },
        { id: 'planta', label: 'PLANTA', icon: 'vasinho' },
    ],
}

export const HORTA: MissionDef = {
    id: 'horta',
    goalLabel: 'HORTA DA ESCOLA',
    goalIcon: 'horta',
    before: 'missao-horta-antes',
    after: 'missao-horta-depois',
    sheet: 'icones-horta',
    parts: [
        {
            id: 'terra',
            label: 'TERRA',
            task: 'Prepare a terra',
            done: 'Terra pronta!',
            icon: 'canteiro',
            steps: [
                { id: 'cavar', icon: 'cavar', label: 'Cavar a terra' },
                { id: 'ancinho', icon: 'ancinho', label: 'Passar o ancinho' },
                { id: 'alisar', icon: 'alisar', label: 'Alisar o canteiro' },
            ],
        },
        {
            id: 'sementes',
            label: 'SEMENTES',
            task: 'Plante as sementes',
            done: 'Sementes plantadas!',
            icon: 'pacotinho',
            steps: [
                { id: 'abrir', icon: 'abrir', label: 'Abrir o pacote' },
                { id: 'semear', icon: 'semear', label: 'Jogar as sementes' },
                { id: 'cobrir', icon: 'cobrir', label: 'Cobrir com terra' },
            ],
        },
        {
            id: 'agua',
            label: 'ÁGUA',
            task: 'Regue a horta',
            done: 'Horta regada!',
            icon: 'regador',
            steps: [
                { id: 'encher', icon: 'encher', label: 'Encher o regador' },
                { id: 'regar', icon: 'regar', label: 'Regar as sementes' },
                { id: 'brotar', icon: 'brotar', label: 'Esperar brotar' },
            ],
        },
        {
            id: 'cerca',
            label: 'CERCA',
            task: 'Monte a cerca',
            done: 'Cerca pronta!',
            icon: 'cercado',
            steps: [
                { id: 'fincar', icon: 'fincar', label: 'Fincar as estacas' },
                { id: 'amarrar', icon: 'amarrar', label: 'Amarrar o barbante' },
                { id: 'placa', icon: 'placa', label: 'Pôr a plaquinha' },
            ],
        },
    ],
    decoys: [
        { id: 'videogame', label: 'VIDEOGAME', icon: 'controle' },
        { id: 'pipa', label: 'PIPA', icon: 'pipa' },
    ],
}
