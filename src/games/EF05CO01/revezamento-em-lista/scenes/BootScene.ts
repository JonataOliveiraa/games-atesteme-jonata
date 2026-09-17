import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

export const TEX = {
    bg: 'revez-bg',
    face: 'revez-faces',
    swim: 'revez-nado',
    rival: 'revez-rival',
    coach: 'revez-tecnica',
} as const

/** Medidos nos PNGs entregues: 1800×400, 1980×780, 990×260 e 2500×550. */
const SHEETS = {
    face: { frameWidth: 300, frameHeight: 400 },
    swim: { frameWidth: 330, frameHeight: 260 },
    rival: { frameWidth: 330, frameHeight: 260 },
    coach: { frameWidth: 500, frameHeight: 550 },
} as const

/** As poses de `nadadores.png`, por linha. A ordem é contrato com o código. */
export const POSE = { glide: 0, strokeA: 1, strokeB: 2 } as const

const ART = import.meta.glob(
    '../../../../assets/games/EF05CO01/revezamento-em-lista/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Revezamento em Lista',
            subtitle: 'A escalação é uma lista.',
            description: 'Enchendo a piscina...',
            theme: {
                background: { kind: 'solid', color: C.waterDeep },
                card: C.card,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.rope,
                title: C.ink,
                subtitle: C.waterDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.slate,
                progressBorder: C.ink,
                progressFill: C.water,
                progressHighlight: C.white,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            if (name.startsWith('cover-')) return
            if (name === 'bg-parque') this.load.image(TEX.bg, url)
            else if (name === 'nadadores-foto') this.load.spritesheet(TEX.face, url, SHEETS.face)
            else if (name === 'nadadores') this.load.spritesheet(TEX.swim, url, SHEETS.swim)
            else if (name === 'rival') this.load.spritesheet(TEX.rival, url, SHEETS.rival)
            else if (name === 'tecnica') this.load.spritesheet(TEX.coach, url, SHEETS.coach)
        })

        preloadLives(this)
    }

    create() {
        this.scene.start('TutorialScene', { level: faseInicial(this, 1), points: 0 })
    }
}
