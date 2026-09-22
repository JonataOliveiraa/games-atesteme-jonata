import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { cutSheet } from './sheet'

const FILES = import.meta.glob('../../../../assets/games/EF05CO10/trilha-do-amanha/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

/** A grade de cada folha. O tamanho do quadro sai do arquivo, não do contrato. */
const GRID: Record<string, { cols: number; rows: number; trimWhite?: boolean }> = {
    menino: { cols: 4, rows: 2 },
    pessoas: { cols: 2, rows: 3 },
    invencoes: { cols: 3, rows: 2 },
    trilha: { cols: 4, rows: 1 },
    ceu: { cols: 1, rows: 3 },
    chao: { cols: 1, rows: 1, trimWhite: true },
    morros: { cols: 1, rows: 1 },
    oficina: { cols: 1, rows: 1 },
    veiculos: { cols: 3, rows: 2 },
    'pessoas-n2': { cols: 2, rows: 3 },
    destinos: { cols: 3, rows: 1 },
    encomendas: { cols: 3, rows: 1 },
    instrumentos: { cols: 4, rows: 2 },
    visoes: { cols: 3, rows: 1 },
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Trilha do Amanhã',
            subtitle: 'Leve o recado!',
            description: 'Abrindo a trilha...',
            theme: {
                background: { kind: 'solid', color: C.ceu },
                card: C.card,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.warnDark,
                title: C.ink,
                subtitle: C.warnDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.warnDark,
                progressFill: C.warn,
                progressHighlight: C.gold,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!GRID[key]) return
            this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        Object.entries(GRID).forEach(([key, grid]) => cutSheet(this, key, grid.cols, grid.rows, grid.trimWhite))
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
