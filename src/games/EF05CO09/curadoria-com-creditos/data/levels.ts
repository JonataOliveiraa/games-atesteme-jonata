import type { LevelConfig } from '../types'
import { MEDIA } from './media'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Dê os créditos',
    objective: 'Complete a etiqueta de cada mídia dizendo quem fez e de onde ela veio.',
    phases: [
      {
        id: 'l1f1',
        kind: 'ficha',
        instruction: 'Complete a etiqueta desta foto.',
        sub: 'Toque nas lacunas e escolha o que entra em cada uma.',
        fields: ['autor', 'fonte'],
        item: MEDIA.natureza,
      },
      {
        id: 'l1f2',
        kind: 'ficha',
        instruction: 'Complete a etiqueta deste desenho.',
        sub: 'Repare que esta mídia foi feita por você.',
        fields: ['autor', 'fonte'],
        item: MEDIA.robo,
      },
      {
        id: 'l1f3',
        kind: 'ficha',
        instruction: 'Complete a etiqueta desta trilha.',
        sub: 'Música também tem quem criou.',
        fields: ['autor', 'fonte'],
        item: MEDIA.trilha,
      },
    ],
  },
  {
    level: 2,
    title: 'Revise a permissão',
    objective: 'Agora a etiqueta tem uma lacuna a mais: o uso. Olhe a licença antes de escolher.',
    phases: [
      {
        id: 'l2f1',
        kind: 'ficha',
        instruction: 'Complete a etiqueta desta foto sem origem.',
        sub: 'Leia a licença no alto da etiqueta.',
        fields: ['autor', 'fonte', 'uso'],
        item: MEDIA.semAutor,
      },
      {
        id: 'l2f2',
        kind: 'ficha',
        instruction: 'Complete a etiqueta deste mascote de marca.',
        sub: 'Nem tudo que está online pode ser publicado.',
        fields: ['autor', 'fonte', 'uso'],
        item: MEDIA.famoso,
      },
      {
        id: 'l2f3',
        kind: 'ficha',
        instruction: 'Complete a etiqueta deste vídeo da turma.',
        sub: 'Uso escolar e publicar online não são a mesma coisa.',
        fields: ['autor', 'fonte', 'uso'],
        item: MEDIA.videoEscolar,
      },
    ],
  },
  {
    level: 3,
    title: 'Publique a galeria',
    objective: 'Carimbe as quatro mídias do mural e publique a galeria sem nenhum selo vermelho.',
    timeLimit: 90,
    phases: [
      {
        id: 'l3f1',
        kind: 'mural',
        instruction: 'Toque em cada quadro, complete a etiqueta e publique o mural.',
        sub: 'Publicar só libera quando não sobrar nenhum selo vermelho.',
        fields: ['autor', 'fonte', 'uso'],
        items: [MEDIA.espacial, MEDIA.floresta, MEDIA.quadrinho, MEDIA.natureza],
      },
    ],
  },
]