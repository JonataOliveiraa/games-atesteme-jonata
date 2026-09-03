import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    bau: { frameWidth: 300, frameHeight: 250 },
    explorador: { frameWidth: 250, frameHeight: 370 },
    'simbolos-ilha': { frameWidth: 250, frameHeight: 250 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO05/ilha-dos-codigos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Ilha dos Códigos',
            subtitle: 'Abra os baús da ilha!',
            description: 'Preparando o mapa...',
            theme: {
                background: { kind: 'waves', color: 0x9fe0ef, base: 0xbfe9f5 },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.wood,
                title: C.ink,
                subtitle: C.woodDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.woodDark,
                progressFill: C.warn,
                progressHighlight: C.cream,
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
