import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF02CO03/nave-multiuso/*.png', {
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
            title: 'Nave Multiuso',
            subtitle: 'Cada ferramenta, uma tarefa',
            description: 'Ligando os motores...',
            theme: {
                background: { kind: 'dots', base: C.skyLow, color: C.white, alpha: 0.7, size: 56, radius: 6 },
                card: C.white,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.pink,
                title: C.ink,
                subtitle: C.pinkDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.grey,
                progressBorder: C.ink,
                progressFill: C.pink,
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
