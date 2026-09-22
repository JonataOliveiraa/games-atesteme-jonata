import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { cutSheet } from './sheet'

const FILES = import.meta.glob('../../../../assets/games/EF05CO11/kit-do-solucionador/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

/** A grade de cada folha. O tamanho do quadro sai do arquivo, não do contrato. */
const GRID: Record<string, { cols: number; rows: number }> = {
    ferramentas: { cols: 4, rows: 3 },
    casas: { cols: 3, rows: 1 },
    gente: { cols: 6, rows: 1 },
    exagero: { cols: 5, rows: 1 },
    ceu: { cols: 1, rows: 1 },
    arvore: { cols: 1, rows: 1 },
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Kit do Solucionador',
            subtitle: 'Avise quem precisa saber!',
            description: 'Abrindo a vila...',
            theme: {
                background: { kind: 'solid', color: C.ceu },
                card: C.card,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.cardBorda,
                title: C.ink,
                subtitle: C.warnDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.cardBorda,
                progressFill: C.warn,
                progressHighlight: C.luz,
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
        Object.entries(GRID).forEach(([key, grid]) => cutSheet(this, key, grid.cols, grid.rows))
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
