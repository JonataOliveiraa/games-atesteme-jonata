import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

/**
 * Não há assets para carregar.
 *
 * Caixa, campo, peça, leitor e cenário são todos desenhados em Graphics — ver
 * VISUAL.md §1. A cena existe para dar à plataforma o mesmo ritmo de abertura
 * dos outros jogos e para servir de gancho caso arte volte a entrar.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Formato Certo',
            subtitle: 'Eureka!',
            description: 'Ligando a bancada...',
            theme: {
                background: {
                    kind: 'dots',
                    base: C.wall,
                    color: C.white,
                    alpha: 0.05,
                    size: 34,
                    radius: 2,
                },

                card: C.wallLight,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.pixels,

                title: C.cream,
                subtitle: C.pixels,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.idle,
                progressFill: C.ok,
                progressHighlight: C.okSoft,
            },
        })
    }

    create() {
        this.scene.start('GameScene')
    }
}
