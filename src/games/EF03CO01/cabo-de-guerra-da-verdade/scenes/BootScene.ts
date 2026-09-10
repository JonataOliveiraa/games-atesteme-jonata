import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { DUPLA_COLUMNS, DUPLA_ROWS, DUPLA_SHEET } from './fighters'

const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO01/cabo-de-guerra-da-verdade/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

const SHEETS: Record<string, { columns: number; rows: number }> = {
    [DUPLA_SHEET]: { columns: DUPLA_COLUMNS, rows: DUPLA_ROWS },
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
            title: 'Cabo de Guerra da Verdade',
            subtitle: 'Monte a frase!',
            description: 'Esticando a corda...',
            theme: {
                background: { kind: 'dots', color: 0xd9a85f, base: 0x2f4a63 },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.woodDark,
                title: C.ink,
                subtitle: C.woodDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.ink,
                progressFill: C.wood,
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
