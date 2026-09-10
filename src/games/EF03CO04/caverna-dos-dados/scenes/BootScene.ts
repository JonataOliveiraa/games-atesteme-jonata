import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

/**
 * As folhas chegaram maiores que o previsto no TEXTURAS.md — o explorador em
 * 1400x1000 e os objetos em 1600x800. A grade é a mesma (4x2); o que mudou foi
 * o lado da célula, e é ele que está aqui.
 */
const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    explorador: { frameWidth: 350, frameHeight: 500 },
    'objetos-caverna': { frameWidth: 400, frameHeight: 400 },
    'dados-n1': { frameWidth: 256, frameHeight: 256 },
    'dados-n2': { frameWidth: 256, frameHeight: 256 },
    'dados-n3': { frameWidth: 256, frameHeight: 256 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO04/caverna-dos-dados/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Caverna dos Dados',
            subtitle: 'Junte os dados que contam a mesma coisa!',
            description: 'Acendendo os cristais...',
            theme: {
                background: { kind: 'solid', color: C.shadow },
                card: C.panel,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.stoneDark,
                title: C.ink,
                subtitle: C.stoneDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.stoneDark,
                progressFill: C.crystal,
                progressHighlight: C.doorLight,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (key.startsWith('cover')) return
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
