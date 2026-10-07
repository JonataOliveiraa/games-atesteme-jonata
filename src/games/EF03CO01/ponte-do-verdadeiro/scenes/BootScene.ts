import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { BG, BRIDGE, CAST, PARTS, SHEETS } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF03CO01/ponte-do-verdadeiro/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const WANTED = new Set([BG, BRIDGE, CAST, PARTS])

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Ponte do Verdadeiro',
            subtitle: 'Só a verdade atravessa',
            description: 'Baixando a ponte...',
            theme: {
                background: { kind: 'dots', base: C.sky, color: C.skyPink, alpha: 1, size: 48, radius: 5 },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.lavender,
                title: C.ink,
                subtitle: C.hot,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.pink,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!WANTED.has(key)) return
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
