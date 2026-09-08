import type { LevelDef, RoundDef } from '../types'
import { BUBBLE_COLORS } from './theme'
import { situation } from './situations'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Mesa da sala',
        crossing: 8,
        maxVisible: 3,
        bubbleColors: BUBBLE_COLORS.calm,
        ambient: 14,
        rounds: [
            { id: '1.1', order: ['agua', 'sentada', 'sol', 'melado'] },
            { id: '1.2', order: ['beirada', 'capa', 'agua', 'sentada', 'sol'] },
            { id: '1.3', order: ['melado', 'sentada', 'beirada', 'agua', 'capa', 'sol'] },
        ],
    },
    {
        level: 2,
        name: 'Quarto',
        crossing: 7,
        maxVisible: 3,
        bubbleColors: BUBBLE_COLORS.party,
        ambient: 20,
        rounds: [
            { id: '2.1', order: ['rosto', 'sentada', 'volume', 'capa', 'escuro'] },
            { id: '2.2', order: ['aviso', 'alongar', 'rosto', 'agua', 'sentada', 'volume'] },
            { id: '2.3', order: ['escuro', 'capa', 'aviso', 'alongar', 'beirada', 'sentada', 'rosto'] },
        ],
    },
    {
        level: 3,
        name: 'Casa toda',
        crossing: 5,
        maxVisible: 4,
        bubbleColors: BUBBLE_COLORS.party,
        ambient: 28,
        rounds: [
            { id: '3.1', order: ['aviso', 'atualiza', 'escuro', 'sentada', 'volume', 'alongar'] },
            { id: '3.2', order: ['atualiza', 'aviso', 'rosto', 'capa', 'agua', 'alongar', 'escuro'] },
            { id: '3.3', order: ['sentada', 'aviso', 'atualiza', 'beirada', 'alongar', 'escuro', 'capa', 'volume'] },
        ],
    },
]

export const risksIn = (round: RoundDef) =>
    round.order.filter(id => situation(id).kind === 'risk').length
