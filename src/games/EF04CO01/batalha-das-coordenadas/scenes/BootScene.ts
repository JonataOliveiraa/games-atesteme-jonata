import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'

/**
 * As chaves que o jogo consome.
 *
 * A capa (`cover-batalha-coordenadas`) não entra: quem a usa é o catálogo, não
 * a cena.
 */
const WANTED = [
    'bg-praia',
    'icone-bau',
    'icone-anel',
    'icone-mapa',
    'icone-pirata-sorridente',
    'icone-pirata-duvida',
    'icone-pirata-feliz',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e um arquivo novo entra
 * no jogo assim que for salvo na pasta, sem tocar em uma linha de código.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO01/batalha-das-coordenadas/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

function found(): Array<[string, string]> {
    const byKey = new Map<string, string>()
    Object.entries(FILES).forEach(([path, url]) => {
        const key = path.split('/').pop()?.replace(/\.png$/i, '')
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
            title: 'Batalha das Coordenadas',
            subtitle: 'Ilha do Tesouro',
            description: 'Desenhando o mapa...',
            theme: {
                background: {
                    kind: 'waves',
                    base: C.waterDark,
                    color: C.white,
                    alpha: 0.1,
                    amplitude: 22,
                    length: 240,
                    rows: 7,
                },

                card: C.wood,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.gold,

                title: C.paper,
                subtitle: C.gold,
                description: C.sand,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.sand,
                progressFill: C.gold,
                progressHighlight: C.goldSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no caso que se quer testar —
         * `{ level: 3, phase: 2 }` cai no último caso do Nível 3. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não quebra
         * nada.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
