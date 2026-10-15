import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { addFrames } from '../data/files'
import { C } from '../data/theme'
import { ensureArt } from './pixelart'

/** a arte é toda do código (pixelart.ts): aqui só a tela de carregar e as vidas da plataforma */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Pixels Fujões',
            subtitle: 'Cada pixel é um número',
            description: 'Ligando o tablet...',
            theme: {
                background: { kind: 'solid', color: C.night },
                card: C.panel,
                cardShadow: C.shadow,
                cardHighlight: C.panelLight,
                cardBorder: C.rim,
                title: C.text,
                subtitle: C.cyan,
                description: C.textSoft,
                titleStroke: C.outline,
                progressTrack: C.panelDark,
                progressBorder: C.outline,
                progressFill: C.pink,
                progressHighlight: C.pinkLight,
            },
        })
        preloadLives(this)
    }

    create() {
        ensureArt(this)
        addFrames(this.textures)
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
