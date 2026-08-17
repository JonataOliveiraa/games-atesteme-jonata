import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

import bgParqueApagadoUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/bg-parque-apagado.png'
import bgParqueIluminadoUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/bg-parque-iluminado.png'

import carrosselApagadoUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-carrossel-apagado.png'
import carrosselAcesoUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-carrossel-aceso.png'
import rodaApagadaUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-roda-apagada.png'
import rodaAcesaUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-roda-acesa.png'
import montanhaApagadaUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-montanha-apagada.png'
import montanhaAcesaUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-montanha-acesa.png'
import quedaApagadaUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-queda-apagada.png'
import quedaAcesaUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/atracao-queda-acesa.png'
import posteDesligadoUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/poste-apagado.png'
import posteAcesoUrl from '../../../../assets/games/EF15CO03/circuito-da-verdade/poste-aceso.png'

const ASSETS: Array<[string, string]> = [
    ['bg-parque-apagado', bgParqueApagadoUrl],
    ['bg-parque-iluminado', bgParqueIluminadoUrl],

    ['poste-desligado', posteDesligadoUrl],
    ['poste-aceso', posteAcesoUrl],
    ['atracao-carrossel-apagado', carrosselApagadoUrl],
    ['atracao-carrossel-aceso', carrosselAcesoUrl],
    ['atracao-roda-apagada', rodaApagadaUrl],
    ['atracao-roda-acesa', rodaAcesaUrl],
    ['atracao-queda-apagada', quedaApagadaUrl],
    ['atracao-queda-acesa', quedaAcesaUrl],
    ['atracao-montanha-apagada', montanhaApagadaUrl],
    ['atracao-montanha-acesa', montanhaAcesaUrl],
]

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Circuito da Verdade',
            subtitle: 'Parque dos Sinais',
            description: 'Puxando a energia dos brinquedos...',
            theme: {
                background: { kind: 'rays', base: 0x003f78, color: 0x0dc0fa, alpha: 0.14, count: 18 },
                card: 0x003f78,
                cardShadow: 0x001a33,
                cardHighlight: 0xfbf49e,
                cardBorder: 0xfdd855,
                title: 0xfbf49e,
                subtitle: 0xfdd855,
                description: 0xd2e9f8,
                titleStroke: 0x001a33,
                progressTrack: 0x002b53,
                progressBorder: 0xfdd855,
                progressFill: 0x0dc0fa,
                progressHighlight: 0xfbf49e,
            },
        })

        ASSETS.forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        this.scene.launch('UIScene')
        this.scene.start('GameScene', { level: 1, phase: 0, points: 0 })
    }
}