import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { BIOME, C } from '../data/theme'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * As texturas entram por glob, e não por `import` estático: um import de
 * arquivo que ainda não existe quebra o `vite build` inteiro (era o caso do
 * `pista-arbusto.png` na versão anterior). Com o glob, um PNG novo entra no
 * jogo assim que for salvo na pasta, e um que falta apenas não entra — o
 * mundo é desenhado em Graphics e continua jogável sem nenhum deles.
 */
const WANTED = ['bg-nuvem', 'carro', 'item-formas', 'item-frutas'] as const

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    'item-formas': { frameWidth: 300, frameHeight: 300 },
    'item-frutas': { frameWidth: 300, frameHeight: 300 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO01/corrida-dos-parecidos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        const forest = BIOME.forest

        createLoadingScreen(this, {
            title: 'Corrida dos Parecidos',
            subtitle: 'Pegue só quem combina',
            description: 'Aquecendo o motor...',
            theme: {
                background: { kind: 'solid', color: forest.groundA },
                card: C.cream,
                cardShadow: C.night,
                cardHighlight: C.white,
                cardBorder: forest.plantDark,
                title: C.ink,
                subtitle: C.okDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: forest.plantDark,
                progressFill: C.ok,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!(WANTED as readonly string[]).includes(key)) return
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
