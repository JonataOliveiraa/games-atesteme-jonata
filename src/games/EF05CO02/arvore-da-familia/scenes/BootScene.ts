import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { IMAGES, SHEETS, addFrames } from '../data/files'
import { C } from '../data/theme'
import { ensureArt } from './art'

const FILES = import.meta.glob('../../../../assets/games/EF05CO02/arvore-da-familia/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const WANTED = new Set([...SHEETS.map(sheet => sheet.key), ...IMAGES])

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Árvore da Família',
            subtitle: 'Cada um no seu galho!',
            description: 'Pendurando os retratos...',
            theme: {
                background: { kind: 'solid', color: C.skyTop },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.accentDark,
                title: C.ink,
                subtitle: C.accentDark,
                description: C.ink,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.accent,
                progressHighlight: C.white,
            },
        })
        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (WANTED.has(key)) this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        ensureArt(this)
        addFrames(this.textures)
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
