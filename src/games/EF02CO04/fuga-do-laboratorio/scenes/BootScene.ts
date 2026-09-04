import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { ITEM_COLUMNS, ITEM_ROWS, ITEM_SHEET } from './itemIcon'
import { MASCOT_COLUMNS, MASCOT_ROWS, MASCOT_SHEET } from './mascot'
import {
    CHASSI_COLUMNS, CHASSI_ROWS, CHASSI_SHEET,
    UI_COLUMNS, UI_ROWS, UI_SHEET,
} from './machine'
import { MOVEIS_COLUMNS, MOVEIS_ROWS, MOVEIS_SHEET } from './furniture'

const FILES = import.meta.glob(
    '../../../../assets/games/EF02CO04/fuga-do-laboratorio/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

/**
 * As folhas do jogo e a grade de cada uma.
 *
 * Chave que não existe na pasta simplesmente não é cortada — e cada peça tem
 * desenho de reserva em `Graphics`. O jogo continua jogável enquanto a arte
 * não chega.
 */
const SHEETS: Record<string, { columns: number; rows: number }> = {
    [ITEM_SHEET]: { columns: ITEM_COLUMNS, rows: ITEM_ROWS },
    [MASCOT_SHEET]: { columns: MASCOT_COLUMNS, rows: MASCOT_ROWS },
    [CHASSI_SHEET]: { columns: CHASSI_COLUMNS, rows: CHASSI_ROWS },
    [UI_SHEET]: { columns: UI_COLUMNS, rows: UI_ROWS },
    [MOVEIS_SHEET]: { columns: MOVEIS_COLUMNS, rows: MOVEIS_ROWS },
}

/** Corta a folha em quadros numerados da esquerda para a direita, linha a linha. */
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
            title: 'Fuga do Laboratório',
            subtitle: 'Monte a máquina: uma peça e um programa!',
            description: 'Ligando a bancada...',
            theme: {
                background: { kind: 'dots', color: 0x38bdf8, base: 0x123a5c },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.hardDark,
                title: C.ink,
                subtitle: C.softDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.doorDeep,
                progressFill: C.hard,
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
