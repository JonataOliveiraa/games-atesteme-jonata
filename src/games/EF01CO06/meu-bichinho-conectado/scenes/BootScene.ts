import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { LEVELS } from '../data/levels'

/**
 * As folhas são tiras VERTICAIS de quadros 300 × 300, então o índice do
 * quadro é a linha, contada de cima para baixo.
 */
const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    bichinho: { frameWidth: 300, frameHeight: 300 },
    'bichinhos-amigos': { frameWidth: 300, frameHeight: 300 },
    'artefato-repouso': { frameWidth: 300, frameHeight: 300 },
    'artefato-uso': { frameWidth: 300, frameHeight: 300 },
    pedidos: { frameWidth: 300, frameHeight: 300 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO06/meu-bichinho-conectado/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Meu Bichinho',
            subtitle: 'CONECTADO',
            description: 'Arrumando o quarto...',
            theme: {
                background: { kind: 'solid', color: C.wall },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.amber,
                title: C.ink,
                subtitle: C.phone,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.amberDark,
                progressFill: C.amber,
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
