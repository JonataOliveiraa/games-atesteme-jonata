import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { CLERK_SHEET, CRITTER_SHEET } from '../data/critters'
import { ICON_SHEET } from '../data/icons'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [CRITTER_SHEET.key]: {
        frameWidth: CRITTER_SHEET.frameWidth,
        frameHeight: CRITTER_SHEET.frameHeight,
    },
    [CLERK_SHEET.key]: {
        frameWidth: CLERK_SHEET.frameWidth,
        frameHeight: CLERK_SHEET.frameHeight,
    },
    [ICON_SHEET.key]: {
        frameWidth: ICON_SHEET.frameWidth,
        frameHeight: ICON_SHEET.frameHeight,
    },
}

/**
 * `import.meta.glob`, nunca `import` estático: arte faltando não pode derrubar
 * o `vite build`, e o jogo inteiro continua jogável em `Graphics` sem ela.
 */
const FILES = import.meta.glob('../../../../assets/games/EF15CO03/achados-e-perdidos/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

/**
 * As texturas trazem os bichinhos, a atendente e a praça. O balcão, o cartaz,
 * as cartas e o risco do NÃO continuam em `Graphics`, porque são geometria que
 * a regra lê.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Achados e Perdidos',
            subtitle: 'Diga a verdade sobre o bichinho perdido!',
            description: 'Abrindo o balcão...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.sky,
                    color: C.white,
                    alpha: 0.22,
                    size: 26,
                    gap: 34,
                    angle: 'diagonal',
                },
                card: C.paper,
                cardShadow: C.shadow,
                cardHighlight: C.coral,
                cardBorder: C.paperEdge,
                title: C.ink,
                subtitle: C.coralDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.paperEdge,
                progressBorder: C.coral,
                progressFill: C.coral,
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
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
