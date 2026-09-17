import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { FACE_SHEET, MACHINE_SHEET, SHEET, THING_SHEET } from '../data/parts'
import { C } from '../data/theme'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = Object.fromEntries(
    [SHEET, MACHINE_SHEET, THING_SHEET, FACE_SHEET].map(sheet => [
        sheet.key,
        { frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight },
    ]),
)

const FILES = import.meta.glob('../../../../assets/games/EF05CO05/raio-x-da-maquina/*.png', {
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
            title: 'Raio-X da Máquina',
            subtitle: 'Veja o que tem dentro do computador!',
            description: 'Ligando o raio-X...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.cyan,
                    alpha: 0.06,
                    size: 26,
                    gap: 34,
                    angle: 'diagonal',
                },
                card: C.inkSoft,
                cardShadow: C.shadow,
                cardHighlight: C.cyan,
                cardBorder: C.cyan,
                title: C.cream,
                subtitle: C.cyan,
                description: C.dim,
                titleStroke: C.ink,
                progressTrack: C.screen,
                progressBorder: C.cyan,
                progressFill: C.cyan,
                progressHighlight: C.cream,
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
