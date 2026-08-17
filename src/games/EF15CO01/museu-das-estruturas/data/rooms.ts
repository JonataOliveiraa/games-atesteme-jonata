import type { StructureDef, StructureId } from '../types'

export const ROOMS: Record<StructureId, StructureDef> = {
  lista: {
    id: 'lista',
    kidName: 'Corredor da Fila',
    techName: 'LISTA',
    texture: 'porta-1',
    icon: 'lista',
    tagline: 'Uma coisa depois da outra.',
    tinoLine: 'Aqui tudo fica em fila. Quem vem primeiro, fica na frente.',
  },
  matriz: {
    id: 'matriz',
    kidName: 'Salão da Grade',
    techName: 'MATRIZ',
    texture: 'porta-2',
    icon: 'matriz',
    tagline: 'Cada coisa no seu quadradinho.',
    tinoLine: 'Aqui tem linhas e colunas. Cada peça mora em um quadradinho.',
  },
  registro: {
    id: 'registro',
    kidName: 'Gabinete das Fichas',
    techName: 'REGISTRO',
    texture: 'porta-3',
    icon: 'registro',
    tagline: 'Cada informação tem um nome.',
    tinoLine: 'Aqui cada informação tem um nome do lado. É só ler o nome.',
  },
  grafo: {
    id: 'grafo',
    kidName: 'Ala dos Fios',
    techName: 'GRAFO',
    texture: 'porta-4',
    icon: 'grafo',
    tagline: 'Isto se liga com aquilo.',
    tinoLine: 'Aqui a gente puxa fios. Um fio mostra que dois pontos se ligam.',
  },
  solto: {
    id: 'solto',
    kidName: 'Depósito',
    techName: 'SOLTO',
    texture: 'porta-5',
    icon: 'solto',
    tagline: 'Coisa solta, sem arrumação.',
    tinoLine: 'Aqui está tudo solto. Número, palavra e sim ou não, tudo misturado.',
  },
}

export const ROOM_ORDER: StructureId[] = ['lista', 'matriz', 'registro', 'grafo', 'solto']

export const CURATOR_DOOR = 'porta-6'

export const KIND_LABEL: Record<string, string> = {
  numero: 'Números',
  palavra: 'Palavras',
  simnao: 'Sim ou não',
}