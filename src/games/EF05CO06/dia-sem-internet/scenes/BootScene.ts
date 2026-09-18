import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const SHEET_BY_KEY: Record<string, { frameWidth: number; frameHeight: number }> = Object.fromEntries(
    Object.values(SHEETS).map(s => [s.key, { frameWidth: s.frameWidth, frameHeight: s.frameHeight }]),
)

/**
 * `import.meta.glob`, nunca `import` estático: a arte deste jogo ainda não
 * existe, e um import de arquivo ausente quebraria o `vite build` inteiro.
 */
const FILES = import.meta.glob('../../../../assets/games/EF05CO06/dia-sem-internet/*.png', {
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
            title: 'O Dia Sem Internet',
            subtitle: 'O que ainda abre quando o fio arrebenta?',
            description: 'Ligando o computador...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.navyDeep,
                    color: C.sky,
                    alpha: 0.08,
                    size: 26,
                    gap: 34,
                    angle: 'diagonal',
                },
                card: C.navy,
                cardShadow: C.shadow,
                cardHighlight: C.orange,
                cardBorder: C.orange,
                title: C.creamSoft,
                subtitle: C.gold,
                description: C.sky,
                titleStroke: C.navyDeep,
                progressTrack: C.navyDeep,
                progressBorder: C.orange,
                progressFill: C.orange,
                progressHighlight: C.creamSoft,
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
