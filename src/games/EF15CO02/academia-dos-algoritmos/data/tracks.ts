import type { TrackDef } from '../types'
import { TRACK_COLOR } from './theme'

export const TRACKS: Record<TrackDef['id'], TrackDef> = {
  sequencia: {
    id: 'sequencia',
    label: 'Passos',
    technicalLabel: 'SEQUENCIA',
    color: TRACK_COLOR.sequencia,
    icon: 'setas',
    tinoLine: 'Aqui a ordem manda. Primeiro vem um passo, depois o outro.',
  },
  repeticao: {
    id: 'repeticao',
    label: 'Repete',
    technicalLabel: 'REPETICAO',
    color: TRACK_COLOR.repeticao,
    icon: 'loop',
    tinoLine: 'Quando uma acao aparece muitas vezes, podemos guardar tudo num repita.',
  },
  condicao: {
    id: 'condicao',
    label: 'Se',
    technicalLabel: 'CONDICAO',
    color: TRACK_COLOR.condicao,
    icon: 'bifurcacao',
    tinoLine: 'Alguns passos so acontecem se uma pergunta tiver resposta sim.',
  },
  depuracao: {
    id: 'depuracao',
    label: 'Conserto',
    technicalLabel: 'DEPURACAO',
    color: TRACK_COLOR.depuracao,
    icon: 'ferramenta',
    tinoLine: 'Testar, achar o erro e melhorar tambem faz parte de criar algoritmos.',
  },
  final: {
    id: 'final',
    label: 'Desafio',
    technicalLabel: 'ALGORITMO',
    color: TRACK_COLOR.final,
    icon: 'trofeu',
    tinoLine: 'Agora voce escolhe os blocos, testa versoes e explica sua melhor solucao.',
  },
}

export const TRACK_ORDER: TrackDef['id'][] = [
  'sequencia',
  'repeticao',
  'condicao',
  'depuracao',
  'final',
]
