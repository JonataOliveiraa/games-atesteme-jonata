import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

/**
 * `import.meta.glob`, nunca `import` estático: arte faltando não pode derrubar
 * o `vite build`, e o jogo inteiro continua jogável em `Graphics` sem ela.
 */
const FILES = import.meta.glob('../../../../assets/games/EF15CO04/canteiro-de-obras/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Canteiro de Obras',
            subtitle: 'Corte o terreno e faça uma obra de cada vez!',
            description: 'Abrindo o canteiro...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.sky,
                    color: C.white,
                    alpha: 0.2,
                    size: 26,
                    gap: 34,
                    angle: 'diagonal',
                },
                card: C.paper,
                cardShadow: C.shadow,
                cardHighlight: C.amber,
                cardBorder: C.paperEdge,
                title: C.ink,
                subtitle: C.amberDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.paperEdge,
                progressBorder: C.amberDark,
                progressFill: C.amber,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!key || key.startsWith('cover')) return
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
