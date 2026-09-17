import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

export const TEX = {
    bg: 'robo-bg',
    owl: 'robo-coruja',
    robot: 'robo-bip',
    prop: 'robo-moveis',
    propHidden: 'robo-moveis-escondido',
    mel: 'robo-mel',
} as const

/** Medidos nos PNGs entregues: 768×512, 1280×256, 1024×256 e 2500×550. */
const SHEETS = {
    owl: { frameWidth: 256, frameHeight: 256 },
    robot: { frameWidth: 256, frameHeight: 256 },
    prop: { frameWidth: 256, frameHeight: 256 },
    propHidden: { frameWidth: 256, frameHeight: 256 },
    mel: { frameWidth: 500, frameHeight: 550 },
} as const

/** As poses de `robo.png`. A ordem é contrato com o código. */
export const POSE = { idle: 0, walkA: 1, walkB: 2, hide: 3, cheer: 4 } as const

/**
 * Os quadros de `moveis.png`: três esconderijos e a porta. A folha
 * `moveis-com-robo-escondido.png` repete os TRÊS primeiros com o robô dentro,
 * na mesma ordem — é a troca que o jogo faz quando a regra manda esconder.
 */
export const PROP_FRAME = { box: 0, basket: 1, plant: 2, door: 3 } as const

const ART = import.meta.glob(
    '../../../../assets/games/EF05CO04/robo-sorrateiro/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Robô Sorrateiro',
            subtitle: 'Ensine o robô a decidir sozinho.',
            description: 'Apagando as luzes da biblioteca...',
            theme: {
                background: { kind: 'solid', color: C.night },
                card: C.card,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.sign,
                title: C.ink,
                subtitle: C.night,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.slate,
                progressBorder: C.ink,
                progressFill: C.bip,
                progressHighlight: C.white,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            if (name.startsWith('cover-')) return
            if (name === 'bg-biblioteca') this.load.image(TEX.bg, url)
            else if (name === 'coruja') this.load.spritesheet(TEX.owl, url, SHEETS.owl)
            else if (name === 'robo') this.load.spritesheet(TEX.robot, url, SHEETS.robot)
            else if (name === 'moveis') this.load.spritesheet(TEX.prop, url, SHEETS.prop)
            else if (name === 'moveis-com-robo-escondido') this.load.spritesheet(TEX.propHidden, url, SHEETS.propHidden)
            else if (name === 'mel') this.load.spritesheet(TEX.mel, url, SHEETS.mel)
        })

        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
