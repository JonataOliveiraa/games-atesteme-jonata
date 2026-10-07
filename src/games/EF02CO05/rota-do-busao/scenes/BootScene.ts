import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS, addFrames } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF02CO05/rota-do-busao/*.png', {
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
            title: 'Rota do Busão',
            subtitle: 'Quem resolve?',
            description: 'Ligando o motor do busão...',
            theme: {
                background: { kind: 'solid', color: C.sky },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.yellow,
                title: C.ink,
                subtitle: C.mintDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.yellow,
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
        addFrames(this.textures)
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
