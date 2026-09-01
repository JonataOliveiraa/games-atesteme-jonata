import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { C } from '../data/theme'
import { preloadLives } from '../../../../shared/hud/createLives'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    coelho: { frameWidth: 400, frameHeight: 400 },
    obstaculos: { frameWidth: 256, frameHeight: 256 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO03/pulo-programado/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Pulo Programado',
            subtitle: 'Veja o coelho correr!',
            description: 'Aquecendo as patinhas...',
            theme: {
                background: { kind: 'solid', color: 0x8fd66a },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.okDark,
                title: C.ink,
                subtitle: C.okDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.okDark,
                progressFill: C.ok,
                progressHighlight: C.warn,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
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
