import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

export const TEX = {
    stage: 'maestro-palco',
    programs: 'maestro-programas',
    pieces: 'maestro-pecas',
    icons: 'maestro-icones',
} as const

/** As folhas entregues: 1024×1024, 1024×256 e 768×256, todas em células de 256. */
const CELL = { frameWidth: 256, frameHeight: 256 } as const

/** Quadros de `icones.png`, quando ela existir. */
export const ICON = { baton: 0, umbrella: 1, brokenNote: 2 } as const

const ART = import.meta.glob(
    '../../../../assets/games/EF05CO07/maestro-do-sistema/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Maestro do Sistema',
            subtitle: 'Dê a vez a cada programa.',
            description: 'Acendendo os refletores...',
            theme: {
                background: { kind: 'solid', color: C.plum },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.gold,
                title: C.ink,
                subtitle: C.curtain,
                description: C.plumSoft,
                titleStroke: C.white,
                progressTrack: C.plumSoft,
                progressBorder: C.ink,
                progressFill: C.gold,
                progressHighlight: C.white,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            if (name.startsWith('cover-')) return
            if (name === 'bg-palco') this.load.image(TEX.stage, url)
            else if (name === 'programas') this.load.spritesheet(TEX.programs, url, CELL)
            else if (name === 'pecas') this.load.spritesheet(TEX.pieces, url, CELL)
            else if (name === 'icones') this.load.spritesheet(TEX.icons, url, CELL)
        })

        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
