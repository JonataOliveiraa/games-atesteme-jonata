import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { LEVELS } from '../data/levels'

/**
 * Tiras de quadros. As de gente são VERTICAIS, 450 × 450, e o índice do quadro
 * é a linha; a do cofre é HORIZONTAL, 256 × 256, e vai de fechado (0) a
 * escancarado (3).
 */
const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    crianca: { frameWidth: 450, frameHeight: 450 },
    pessoas: { frameWidth: 450, frameHeight: 450 },
    cofre: { frameWidth: 256, frameHeight: 256 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO07/esconde-dados/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Esconde-Dados',
            subtitle: 'Proteja o seu cartão',
            description: 'Abrindo a pracinha...',
            theme: {
                background: { kind: 'solid', color: C.sky },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.safeGreen,
                title: C.ink,
                subtitle: C.safeGreen,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.safeGreen,
                progressFill: C.safeLight,
                progressHighlight: C.white,
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
        const level = Phaser.Math.Clamp(faseInicial(this, 1), 1, LEVELS.length)
        this.scene.start('GameScene', { level, points: 0 })
    }
}
