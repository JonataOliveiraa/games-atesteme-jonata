import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { IMAGES, SHEETS, addFrames } from '../data/files'
import { C } from '../data/theme'
import { ensureArt } from './fallback'

const FILES = import.meta.glob('../../../../assets/games/EF05CO10/pescadores-do-tempo/*.png', {
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
            title: 'Pescadores do Tempo',
            subtitle: 'A vila pede um peixe',
            description: 'Preparando o rio...',
            theme: {
                background: { kind: 'solid', color: C.skyTop },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.time,
                title: C.ink,
                subtitle: C.time,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.time,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!WANTED.has(key)) return
            this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        ensureArt(this)
        addFrames(this.textures)
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
