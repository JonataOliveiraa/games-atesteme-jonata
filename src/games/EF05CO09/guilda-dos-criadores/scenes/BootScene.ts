import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const SHEET_BY_KEY: Record<string, { frameWidth: number; frameHeight: number }> =
    Object.fromEntries(
        Object.values(SHEETS).map(s => [s.key, { frameWidth: s.frameWidth, frameHeight: s.frameHeight }]),
    )

/** `import.meta.glob`, nunca `import` estático: arquivo ausente quebraria o build. */
const FILES = import.meta.glob(
    '../../../../assets/games/EF05CO09/guilda-dos-criadores/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'A Guilda dos Criadores',
            subtitle: 'Toda obra tem dono. Vire e veja de quem é.',
            description: 'Abrindo a caixa de obras...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.header,
                    color: C.gold,
                    alpha: 0.1,
                    size: 22,
                    gap: 30,
                    angle: 'diagonal',
                },
                card: C.woodDeep,
                cardShadow: C.shadow,
                cardHighlight: C.gold,
                cardBorder: C.gold,
                title: C.cream,
                subtitle: C.gold,
                description: C.paper,
                titleStroke: C.header,
                progressTrack: C.header,
                progressBorder: C.gold,
                progressFill: C.gold,
                progressHighlight: C.cream,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!key || key.startsWith('cover')) return
            const sheet = SHEET_BY_KEY[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
