import type { Message } from '../types'
import { PIECE_CELL } from './files'

export const MESSAGES: Message[] = [
    { id: 'party', text: 'A festa é sábado!', icon: PIECE_CELL.party },
    { id: 'pencil', text: 'Traga o lápis amarelo', icon: PIECE_CELL.pencil },
    { id: 'practice', text: 'O treino mudou de hora', icon: PIECE_CELL.practice },
]

export const messageAt = (index: number): Message => MESSAGES[Math.abs(index) % MESSAGES.length]
