import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    corredor: { frameWidth: 280, frameHeight: 280 },
    tecnologias: { frameWidth: 350, frameHeight: 350 },
}

const SKIP = ['portao']

const FILES = import.meta.glob(
    '../../../../assets/games/EF02CO05/corrida-do-cotidiano/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Corrida do Cotidiano',
            subtitle: 'Corra e escolha o caminho certo!',
            description: 'Preparando o bairro...',
            theme: {
                background: { kind: 'solid', color: 0x7fcdf2 },
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
                progressHighlight: C.gold,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (SKIP.includes(key) || key.startsWith('cover')) return
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
