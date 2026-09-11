import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { VISITOR_ART } from '../data/layout'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    personagens: { frameWidth: 300, frameHeight: 400 },
    resultados: { frameWidth: 256, frameHeight: 256 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO07/a-busca-do-bibliotecario/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'A Busca do Bibliotecário',
            subtitle: 'Escolha a palavra que traz o que o visitante quer!',
            description: 'Abrindo a biblioteca...',
            theme: {
                background: { kind: 'solid', color: C.woodDark },
                card: C.parchment,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.wood,
                title: C.ink,
                subtitle: C.woodDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.wood,
                progressFill: C.gold,
                progressHighlight: C.magic,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (key.startsWith('cover')) return
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.cutVisitors()
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }

    private cutVisitors() {
        const { key, cols, rows, cuts } = VISITOR_ART
        if (!this.textures.exists(key)) return
        const texture = this.textures.get(key)
        const source = texture.getSourceImage()
        const cellW = source.width / cols
        const cellH = source.height / rows
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const frame = row * cols + col
                const left = cuts[frame]?.left ?? Math.round(col * cellW)
                const right = cuts[frame]?.right ?? Math.round((col + 1) * cellW)
                const top = Math.round(row * cellH)
                texture.add(frame, 0, left, top, right - left, Math.round(cellH))
            }
        }
    }
}
