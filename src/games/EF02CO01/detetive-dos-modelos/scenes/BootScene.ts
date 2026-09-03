import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { VEHICLE_FRAME } from '../data/layout'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    veiculos: { frameWidth: VEHICLE_FRAME.w, frameHeight: VEHICLE_FRAME.h },
    detetive: { frameWidth: 500, frameHeight: 500 },
}

const SKIP = ['cover-detetive-dos-modelos']

const FILES = import.meta.glob(
    '../../../../assets/games/EF02CO01/detetive-dos-modelos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Detetive dos Modelos',
            subtitle: 'Onde este veículo funciona?',
            description: 'Preparando os testes...',
            theme: {
                background: { kind: 'solid', color: C.board },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.skyDeep,
                title: C.ink,
                subtitle: C.skyDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.skyDeep,
                progressFill: C.sky,
                progressHighlight: C.warn,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (SKIP.includes(key)) return
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
