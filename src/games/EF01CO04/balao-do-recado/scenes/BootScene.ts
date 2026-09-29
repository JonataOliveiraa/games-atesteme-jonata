import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF01CO04/balao-do-recado/*.png', {
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
            title: 'Balão do Recado',
            subtitle: 'Leve o recado!',
            description: 'Enchendo o balão...',
            theme: {
                background: {
                    kind: 'dots',
                    base: C.sky,
                    color: C.cloud,
                    alpha: 0.5,
                    size: 34,
                    radius: 5,
                },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.coral,
                title: C.ink,
                subtitle: C.coralDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.sun,
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
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0, message: 0 })
    }
}
