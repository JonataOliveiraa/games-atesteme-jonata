import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { LEVELS } from '../data/levels'

const WANTED = ['bg-clareira', 'formas', 'cesta', 'vinhas']

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    formas: { frameWidth: 128, frameHeight: 128 },
    cesta: { frameWidth: 128, frameHeight: 128 },
    vinhas: { frameWidth: 169, frameHeight: 441 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO01/base-dos-classificadores/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Base dos Classificadores',
            subtitle: 'Guarde as pedras',
            description: 'Abrindo a clareira...',
            theme: {
                background: { kind: 'solid', color: C.grass },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.leaf,
                title: C.ink,
                subtitle: C.leaf,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.leaf,
                progressFill: C.leafLight,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!WANTED.includes(key)) return
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        const level = Phaser.Math.Clamp(faseInicial(this, 1), 1, LEVELS.length)
        this.scene.start('GameScene', { level, points: 0 })
    }
}
