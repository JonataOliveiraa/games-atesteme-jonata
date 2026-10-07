import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { addFrames } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF03CO02/fabrica-liga-desliga/*.png', {
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
            title: 'Fábrica Liga-Desliga',
            subtitle: 'Liga enquanto está aceso',
            description: 'Esquentando o forno...',
            theme: {
                background: { kind: 'solid', color: C.wall },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.coral,
                title: C.ink,
                subtitle: C.mintDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.coral,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!key || key.startsWith('cover')) return
            this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        addFrames(this.textures)
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
