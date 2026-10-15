import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { addFrames } from '../data/files'
import { C } from '../data/theme'
import { ensureArt } from './fallback'

const FILES = import.meta.glob('../../../../assets/games/EF04CO04/corrida-no-cabo/*.png', {
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
            title: 'Corrida no Cabo',
            subtitle: 'Mande a figurinha em 0 e 1',
            description: 'Ligando o cabo...',
            theme: {
                background: { kind: 'solid', color: C.grass },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.accent,
                title: C.ink,
                subtitle: C.accent,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.accent,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!key || key.startsWith('cover') || key.startsWith('og')) return
            this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        ensureArt(this)
        addFrames(this.textures)
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
