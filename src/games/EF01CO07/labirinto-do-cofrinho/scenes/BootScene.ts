import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { HEDGE_GRID, HEDGES, PIECE_BOX, PIECES, SHEETS } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF01CO07/labirinto-do-cofrinho/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Labirinto do Cofrinho',
            subtitle: 'Leve o cartão até o cofre!',
            description: 'Plantando as sebes...',
            theme: {
                background: {
                    kind: 'waves',
                    base: C.lawn,
                    color: C.lawnDark,
                    alpha: 0.6,
                    amplitude: 8,
                    length: 140,
                    rows: 7,
                },
                card: C.cream,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.aqua,
                title: C.ink,
                subtitle: C.aquaDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.creamDark,
                progressBorder: C.ink,
                progressFill: C.aqua,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!key || key.startsWith('cover')) return
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        this.cutHedges()
        this.cutPieces()
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }

    private cutPieces() {
        if (!this.textures.exists(PIECES)) return
        const texture = this.textures.get(PIECES)
        Object.entries(PIECE_BOX).forEach(([name, [x, y, w, h]]) => {
            if (!texture.has(name)) texture.add(name, 0, x, y, w, h)
        })
    }

    private cutHedges() {
        if (!this.textures.exists(HEDGES)) return
        const texture = this.textures.get(HEDGES)
        if (texture.has('0')) return
        const source = texture.getSourceImage()
        const w = source.width / HEDGE_GRID.cols
        const h = source.height / HEDGE_GRID.rows
        for (let i = 0; i < HEDGE_GRID.cols * HEDGE_GRID.rows; i++) {
            const x = Math.round((i % HEDGE_GRID.cols) * w)
            const y = Math.round(Math.floor(i / HEDGE_GRID.cols) * h)
            texture.add(String(i), 0, x, y, Math.floor(w), Math.floor(h))
        }
    }
}
