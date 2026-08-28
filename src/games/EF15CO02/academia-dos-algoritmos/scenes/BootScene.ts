import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { C } from '../data/theme'

const WANTED = [
  'bg-sala-treino',
  'bg-academia-hub',

  'personagem-lia',

  'treinador-normal',
  'treinador-feliz',
  'treinador-pensando',

  'item-escova',
  'item-escova-sem-pasta',
  'escova-boca',
  'item-pasta-dente',
  'item-mochila',
  'item-mochila-aberta',
  'item-caderno',
  'item-lanche',
  'item-regador',
  'item-planta',
  'item-poca',
  'item-brinquedo',
  'item-bloco-montar',
] as const

const FILES = import.meta.glob(
  '../../../../assets/games/EF15CO02/academia-dos-algoritmos/*.png',
  { eager: true, import: 'default' }
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

function found(): Array<[string, string]> {
  const byKey = new Map<string, string>()
  Object.entries(FILES).forEach(([path, url]) => {
    const key = keyOf(path)
    if (key) byKey.set(key, url)
  })
  return WANTED.map((key) => [key, byKey.get(key)] as [string, string | undefined]).filter(
    (pair): pair is [string, string] => !!pair[1]
  )
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Academia dos Algoritmos',
      subtitle: 'Monte os passos. Aperte executar.',
      description: 'Aquecendo os treinos...',
      theme: {
        background: {
          kind: 'dots',
          base: C.ink,
          color: C.brass,
          alpha: 0.14,
          size: 46,
          radius: 4,
        },
        card: C.darkWood,
        cardShadow: C.shadow,
        cardBorder: C.brass,
        title: C.cream,
        subtitle: C.brass,
        description: C.dim,
        titleStroke: C.ink,
        progressTrack: C.ink,
        progressBorder: C.brass,
        progressFill: C.wood,
      },
    })

    found().forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene', { level: faseInicial(this, 1), puzzle: 0 })
  }
}

