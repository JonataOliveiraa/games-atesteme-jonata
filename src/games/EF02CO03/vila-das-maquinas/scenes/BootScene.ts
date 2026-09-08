import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { LEVELS } from '../data/levels'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    maquinas: { frameWidth: 300, frameHeight: 300 },
    'icones-comandos': { frameWidth: 256, frameHeight: 256 },
    itens: { frameWidth: 200, frameHeight: 200 },
    morador: { frameWidth: 250, frameHeight: 250 },
    'gato-e-peixe': { frameWidth: 250, frameHeight: 250 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF02CO03/vila-das-maquinas/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Vila das Máquinas',
            subtitle: 'Quem sabe resolver isso?',
            description: 'Abrindo o galpão...',
            theme: {
                background: { kind: 'waves', color: 0x8bc6b0, base: 0xa8dcc6 },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.wood,
                title: C.ink,
                subtitle: C.ovenDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.woodDark,
                progressFill: C.oven,
                progressHighlight: C.creamDeep,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (key.startsWith('cover-')) return
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        const level = Phaser.Math.Clamp(faseInicial(this, 1), 1, LEVELS.length)
        this.scene.start('GameScene', { level, points: 0 })
    }
}
