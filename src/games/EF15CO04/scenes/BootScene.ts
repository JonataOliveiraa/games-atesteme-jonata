import Phaser from 'phaser'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

import bgCentralUrl from '../../../assets/games/EF15CO04/bg-central-missoes.png'
import caixaModulosUrl from '../../../assets/games/EF15CO04/caixa-modulos.png'

import cafeAntesUrl from '../../../assets/games/EF15CO04/missao-cafe-antes.png'
import cafeDepoisUrl from '../../../assets/games/EF15CO04/missao-cafe-depois.png'
import festaAntesUrl from '../../../assets/games/EF15CO04/missao-festa-antes.png'
import festaDepoisUrl from '../../../assets/games/EF15CO04/missao-festa-depois.png'
import feiraAntesUrl from '../../../assets/games/EF15CO04/missao-feira-antes.png'
import feiraDepoisUrl from '../../../assets/games/EF15CO04/missao-feira-depois.png'
import acampamentoAntesUrl from '../../../assets/games/EF15CO04/missao-acampamento-antes.png'
import acampamentoDepoisUrl from '../../../assets/games/EF15CO04/missao-acampamento-depois.png'

const ASSETS: Array<[string, string]> = [
    ['bg-central-missoes', bgCentralUrl],
    ['caixa-modulos', caixaModulosUrl],

    ['missao-cafe-antes', cafeAntesUrl],
    ['missao-cafe-depois', cafeDepoisUrl],
    ['missao-festa-antes', festaAntesUrl],
    ['missao-festa-depois', festaDepoisUrl],
    ['missao-feira-antes', feiraAntesUrl],
    ['missao-feira-depois', feiraDepoisUrl],
    ['missao-acampamento-antes', acampamentoAntesUrl],
    ['missao-acampamento-depois', acampamentoDepoisUrl],
]

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Arquiteto das Missões',
            subtitle: 'Central de Planos',
            description: 'Abrindo a prancheta e afiando o lápis...',
            theme: {
                background: { kind: 'grid', base: 0x1b2b46, color: 0xfaf6e8, alpha: 0.1, size: 68, width: 2 },
                card: 0x22344f,
                cardShadow: 0x0b1424,
                cardHighlight: 0xfaf6e8,
                cardBorder: 0xefa525,
                title: 0xfaf6e8,
                subtitle: 0xf2c744,
                description: 0xc6ece9,
                titleStroke: 0x0b1424,
                progressTrack: 0x111e33,
                progressBorder: 0xefa525,
                progressFill: 0x2aa6a1,
                progressHighlight: 0xfaf6e8,
            },
        })

        ASSETS.forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        this.scene.launch('UIScene')
        this.scene.start('GameScene', { level: 1, phase: 0, points: 0 })
    }
}