import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { SITUATION_COLUMNS, SITUATION_ROWS, SITUATION_SHEET } from './situationArt'

const FILES = import.meta.glob(
    '../../../../assets/games/EF02CO06/bolhas-da-seguranca/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

const SHEETS: Record<string, { columns: number; rows: number }> = {
    [SITUATION_SHEET]: { columns: SITUATION_COLUMNS, rows: SITUATION_ROWS },
}

function sliceSheet(scene: Phaser.Scene, key: string, columns: number, rows: number) {
    if (!scene.textures.exists(key)) return
    const texture = scene.textures.get(key)
    if (texture.has('0')) return

    const source = texture.getSourceImage() as { width: number; height: number }
    const w = Math.floor(source.width / columns)
    const h = Math.floor(source.height / rows)
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            texture.add(row * columns + col, 0, col * w, row * h, w, h)
        }
    }
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Bolhas da Segurança',
            subtitle: 'Cuidado ao usar tablet!',
            description: 'Enchendo as bolhas...',
            theme: {
                background: { kind: 'dots', color: 0x9bd8ff, base: 0x1c3a52 },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.bubbleDark,
                title: C.ink,
                subtitle: C.shellDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.shellDeep,
                progressFill: C.bubble,
                progressHighlight: C.creamDeep,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (key.startsWith('cover-')) return
            this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        Object.entries(SHEETS).forEach(([key, grid]) =>
            sliceSheet(this, key, grid.columns, grid.rows),
        )
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
