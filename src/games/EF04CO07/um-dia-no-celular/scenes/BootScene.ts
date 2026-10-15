import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { FILE_KEYS, addFrames } from '../data/files'
import { C } from '../data/theme'
import { ensureBits } from './art'
import { ensureArt } from './fallback'

const FILES = import.meta.glob('../../../../assets/games/EF04CO07/um-dia-no-celular/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const WANTED = new Set(FILE_KEYS)

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Um Dia no Celular',
            subtitle: 'Cuide dos dados!',
            description: 'Ligando o celular...',
            theme: {
                background: { kind: 'solid', color: C.lilac },
                card: C.paper,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.accent,
                title: C.ink,
                subtitle: C.accent,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.accentSoft,
                progressBorder: C.ink,
                progressFill: C.accent,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!WANTED.has(key)) return
            this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        ensureArt(this)
        ensureBits(this)
        addFrames(this.textures)
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
