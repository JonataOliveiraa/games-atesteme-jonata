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
            icon: 'cafe',
            steps: [
                { id: 'agua', icon: 'agua' },
                { id: 'filtro', icon: 'filtro' },
                { id: 'coar', icon: 'coar' },
            ],
        },
        {
            id: 'sanduiche',
            label: 'SANDUÍCHE',
            icon: 'sanduiche',
            steps: [
                { id: 'pao', icon: 'pao' },
                { id: 'recheio', icon: 'recheio' },
                { id: 'cortar', icon: 'cortar' },
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
            icon: 'bandeirinhas',
            steps: [
                { id: 'pacote', icon: 'pacote' },
                { id: 'balao', icon: 'balao' },
                { id: 'pendurar', icon: 'pendurar' },
            ],
        },
        {
            id: 'bolo',
            label: 'BOLO',
            icon: 'bolo',
            steps: [
                { id: 'massa', icon: 'massa' },
                { id: 'forma', icon: 'forma' },
                { id: 'forno', icon: 'forno' },
            ],
        },
        {
            id: 'som',
            label: 'SOM',
            icon: 'caixa',
            steps: [
                { id: 'levar', icon: 'levar' },
                { id: 'tomada', icon: 'tomada' },
                { id: 'musica', icon: 'musica' },
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
            icon: 'canteiro',
            steps: [
                { id: 'cavar', icon: 'cavar' },
                { id: 'ancinho', icon: 'ancinho' },
                { id: 'alisar', icon: 'alisar' },
            ],
        },
        {
            id: 'sementes',
            label: 'SEMENTES',
            icon: 'pacotinho',
            steps: [
                { id: 'abrir', icon: 'abrir' },
                { id: 'semear', icon: 'semear' },
                { id: 'cobrir', icon: 'cobrir' },
            ],
        },
        {
            id: 'agua',
            label: 'ÁGUA',
            icon: 'regador',
            steps: [
                { id: 'encher', icon: 'encher' },
                { id: 'regar', icon: 'regar' },
                { id: 'brotar', icon: 'brotar' },
            ],
        },
        {
            id: 'cerca',
            label: 'CERCA',
            icon: 'cercado',
            steps: [
                { id: 'fincar', icon: 'fincar' },
                { id: 'amarrar', icon: 'amarrar' },
                { id: 'placa', icon: 'placa' },
            ],
        },
    ],
    decoys: [
        { id: 'videogame', label: 'VIDEOGAME', icon: 'controle' },
        { id: 'pipa', label: 'PIPA', icon: 'pipa' },
    ],
}
