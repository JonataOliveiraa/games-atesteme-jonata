import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { CELL, PORTAO_ART, SHEET } from '../data/art'
import { C } from '../data/theme'

/** Folhas com grade regular. O resto entra como imagem única. */
const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [SHEET.criaturinhas]: { frameWidth: CELL, frameHeight: CELL },
    [SHEET.portao]: { frameWidth: PORTAO_ART.cell, frameHeight: PORTAO_ART.cell },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF05CO03/portoes-logicos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Portões Lógicos',
            subtitle: 'Abra o portão da frase verdadeira!',
            description: 'Soltando as criaturinhas...',
            theme: {
                background: { kind: 'solid', color: C.ceu },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.madeiraDark,
                title: C.ink,
                subtitle: C.okDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.madeiraDark,
                progressFill: C.ok,
                progressHighlight: C.gold,
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
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
