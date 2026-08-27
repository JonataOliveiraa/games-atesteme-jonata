import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { C } from '../data/theme'

/**
 * As texturas que os três níveis usam.
 *
 * `bg-academia-hub` e `cover-academia-dos-algoritmos` estão na pasta e NÃO
 * entram: o hub virou o fundo do Nível 2 por outro caminho, e a capa é do
 * catálogo, não do jogo. Carregar arte que ninguém mostra é peso de download
 * por nada.
 *
 * A falta de qualquer uma delas deixa o jogo feio e jogável: o lugar fica
 * vazio, o rótulo embaixo continua lá, e o estado continua legível — porque
 * quem desenha estado aqui é `Graphics`, nunca a textura.
 */
const WANTED = [
  'bg-sala-treino',
  'bg-academia-hub',

  'treinador-normal',
  'treinador-feliz',
  'treinador-pensando',

  'avatar-crianca',

  'item-escova',
  'item-pasta-dente',
  'item-mochila',
  'item-caderno',
  'item-lanche',
  'item-regador',
  'item-planta',
  'item-poca',
  'item-bloco-montar',
  'item-brinquedo',
] as const

/**
 * As texturas são VARRIDAS da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que não existe quebra o build INTEIRO — não este
 * jogo, o site — e é assim que uma arte renomeada derruba o catálogo de
 * quarenta e cinco jogos. Com `import.meta.glob` o Vite registra o que está lá.
 */
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
    (par): par is [string, string] => !!par[1]
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
          color: C.latao,
          alpha: 0.14,
          size: 46,
          radius: 4,
        },
        card: C.madeiraEscura,
        cardShadow: C.sombra,
        cardBorder: C.latao,
        title: C.creme,
        subtitle: C.latao,
        description: C.dim,
        titleStroke: C.ink,
        progressTrack: C.ink,
        progressBorder: C.latao,
        progressFill: C.madeira,
      },
    })

    found().forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    /*
     * A fase inicial vem do registry, escrito no `preBoot`.
     *
     * A plataforma manda `?stage=2` na URL quando quer abrir direto no Nível
     * 2. Pelo `START_GAME` seria tarde: a cena já teria nascido no Nível 1.
     */
    this.scene.start('GameScene', { nivel: faseInicial(this, 1), caso: 0 })
  }
}

