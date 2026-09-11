import type { ChoiceDef, LevelDef, MissionDef } from '../types'
import { rankOf } from './results'

const add = (term: string, hint: string): ChoiceDef => ({ kind: 'add', term, hint })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Palavras melhores',
        missions: [
            {
                id: 'tucano',
                request: 'Quero uma foto de tucano.',
                visitor: 0,
                initialTerms: ['TUCANO'],
                pool: ['tucano-pelucia', 'tucano-desenho', 'tucano-real'],
                targetId: 'tucano-real',
                steps: [
                    {
                        choices: [
                            add('PELÚCIA', 'Pelúcia é brinquedo. O pedido é foto.'),
                            add('FOTO', ''),
                            add('DESENHO', 'Desenho não é foto.'),
                        ],
                    },
                ],
            },
            {
                id: 'vulcao',
                request: 'Quero ver um vulcão em erupção.',
                visitor: 1,
                initialTerms: ['VULCÃO'],
                pool: ['vulcao-calmo', 'vulcao-maquete', 'vulcao-erupcao'],
                targetId: 'vulcao-erupcao',
                steps: [
                    {
                        choices: [
                            add('ERUPÇÃO', ''),
                            add('MAQUETE', 'Maquete é de escola. O pedido é o de verdade.'),
                            add('CALMO', 'Calmo não está em erupção.'),
                        ],
                    },
                    {
                        choices: [
                            add('BRINQUEDO', 'Nenhum vulcão aqui é brinquedo.'),
                            add('VÍDEO', ''),
                            add('DESENHO', 'Desenho fica parado. O pedido é ver acontecer.'),
                        ],
                    },
                ],
            },
            {
                id: 'baleia',
                request: 'Quero uma foto de baleia de verdade.',
                visitor: 2,
                initialTerms: ['BALEIA'],
                pool: ['baleia-pelucia', 'baleia-desenho', 'baleia-real'],
                targetId: 'baleia-real',
                steps: [
                    {
                        choices: [
                            add('DESENHO', 'Desenho não é foto.'),
                            add('PELÚCIA', 'Pelúcia é brinquedo. O pedido é a de verdade.'),
                            add('FOTO', ''),
                        ],
                    },
                    {
                        choices: [
                            add('PAPEL', 'Papel trouxe o desenho para cima.'),
                            add('ANIMAL', ''),
                            add('BRINQUEDO', 'Brinquedo trouxe a pelúcia de novo.'),
                        ],
                    },
                ],
            },
        ],
    },
]

export const applyChoice = (terms: string[], choice: ChoiceDef) =>
    choice.kind === 'add'
        ? terms.includes(choice.term)
            ? terms
            : [...terms, choice.term]
        : terms.filter(term => term !== choice.term)

export const improves = (mission: MissionDef, terms: string[], choice: ChoiceDef) => {
    const before = rankOf(mission.pool, terms, mission.targetId)
    const after = rankOf(mission.pool, applyChoice(terms, choice), mission.targetId)
    return after === 0 || after < before
}

export const solved = (mission: MissionDef, terms: string[]) =>
    rankOf(mission.pool, terms, mission.targetId) === 0
