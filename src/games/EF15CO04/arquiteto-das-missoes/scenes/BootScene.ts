import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { ICON_SHEETS } from './cards'

const ICON_FRAME = { frameWidth: 256, frameHeight: 256 }

const FILES = import.meta.glob(
    '../../../../assets/games/EF15CO04/arquiteto-das-missoes/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Arquiteto das Missões',
            subtitle: 'Divida o pedido em partes!',
            description: 'Abrindo a prancheta...',
            theme: {
                background: { kind: 'waves', color: 0x2ea6a1, base: 0x35c6c0 },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.wood,
                title: C.ink,
                subtitle: C.tealDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.woodDark,
                progressFill: C.teal,
                progressHighlight: C.cream,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (key.startsWith('cover-')) return
            if (ICON_SHEETS.includes(key)) {
                this.load.spritesheet(key, url, ICON_FRAME)
                return
            }
            this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
