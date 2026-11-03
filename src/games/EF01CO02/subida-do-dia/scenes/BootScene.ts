import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF01CO02/subida-do-dia/*.png', {
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
            title: 'Subida do Dia',
            subtitle: 'Um passo de cada vez!',
            description: 'Montando a escada...',
            theme: {
                background: {
                    kind: 'dots',
                    base: C.paper,
                    color: C.paperDark,
                    alpha: 0.5,
                    size: 34,
                    radius: 5,
                },
                card: C.white,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.ink,
                title: C.ink,
                subtitle: C.gold,
                description: C.ink,
                titleStroke: C.white,
                progressTrack: C.paperDark,
                progressBorder: C.ink,
                progressFill: C.gold,
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
