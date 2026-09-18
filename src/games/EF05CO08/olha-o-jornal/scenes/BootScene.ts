import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const SHEET_BY_KEY: Record<string, { frameWidth: number; frameHeight: number }> = Object.fromEntries(
    Object.values(SHEETS).map(s => [s.key, { frameWidth: s.frameWidth, frameHeight: s.frameHeight }]),
)

/** `import.meta.glob`, nunca `import` estático: arquivo ausente quebraria o build. */
const FILES = import.meta.glob('../../../../assets/games/EF05CO08/olha-o-jornal/*.png', {
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
            title: 'Olha o Jornal!',
            subtitle: 'Dois jornais, a mesma história — e só um vale a pena espalhar.',
            description: 'Separando a edição de hoje...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.wall,
                    color: C.mustard,
                    alpha: 0.1,
                    size: 24,
                    gap: 32,
                    angle: 'diagonal',
                },
                card: C.counter,
                cardShadow: C.shadow,
                cardHighlight: C.mustard,
                cardBorder: C.mustard,
                title: C.cream,
                subtitle: C.mustard,
                description: C.paper,
                titleStroke: C.wall,
                progressTrack: C.wall,
                progressBorder: C.mustard,
                progressFill: C.mustard,
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
