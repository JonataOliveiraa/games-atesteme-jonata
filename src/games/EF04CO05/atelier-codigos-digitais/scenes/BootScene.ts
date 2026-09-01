import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * A única chave que o jogo consome: o cenário.
 *
 * Célula, ficha da legenda, carta de formato e visto de linha certa são todos
 * `Graphics` — cada um tem estado, e estado como PNG vira uma pilha de
 * variantes por peça. A versão antiga deste jogo tinha um arquivo de 1,1 MB
 * para desenhar UMA célula.
 *
 * A capa fica de fora: quem usa ela é o catálogo, com `import` direto.
 */
const WANTED = ['bg-atelie'] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e o fundo entra no jogo
 * assim que for salvo na pasta, sem tocar em uma linha de código — até lá,
 * `createRoom` desenha a parede em `Graphics`.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO05/atelier-codigos-digitais/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) =>
    path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

function found(): Array<[string, string]> {
    const byKey = new Map<string, string>()
    Object.entries(FILES).forEach(([path, url]) => {
        const key = keyOf(path)
        if (key) byKey.set(key, url)
    })
    return WANTED
        .map(key => [key, byKey.get(key)] as [string, string | undefined])
        .filter((pair): pair is [string, string] => !!pair[1])
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Ateliê de Códigos Digitais',
            subtitle: 'Pixels, tons e letras',
            description: 'Abrindo os potes de tinta...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.white,
                    alpha: 0.05,
                    size: 34,
                    gap: 34,
                    angle: 'diagonal',
                },

                card: C.wood,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.bitmap,

                title: C.paper,
                subtitle: C.ascii,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.edge,
                progressFill: C.bitmap,
                progressHighlight: C.cinza,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
        preloadLives(this)
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto na encomenda que se quer ver —
         * `{ level: 3, phase: 3 }` cai na bandeirinha colorida. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não quebra
         * nada.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
