import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

import bgOficinaUrl from '../../../../assets/games/EF03CO05/formato-certo/bg-oficina.png'

import marcaMesUrl from '../../../../assets/games/EF03CO05/formato-certo/marca-mes.png'
import marcaCorUrl from '../../../../assets/games/EF03CO05/formato-certo/marca-cor.png'
import marcaPalavraUrl from '../../../../assets/games/EF03CO05/formato-certo/marca-palavra.png'
import marcaIntrusaUrl from '../../../../assets/games/EF03CO05/formato-certo/marca-intrusa.png'

import seloDataUrl from '../../../../assets/games/EF03CO05/formato-certo/selo-data.png'
import seloPixelsUrl from '../../../../assets/games/EF03CO05/formato-certo/selo-pixels.png'
/*
 * O arquivo do selo de texto está gravado como `selo-textopng.png` — o `.png`
 * entrou duas vezes no nome. A CHAVE continua `selo-texto`, que é o nome certo
 * do papel. Para arrumar: renomeie o arquivo para `selo-texto.png` e troque
 * só esta linha de import.
 */
import seloTextoUrl from '../../../../assets/games/EF03CO05/formato-certo/selo-texto.png'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * Textura é opcional aqui, por decisão de projeto.
 *
 * Só entra imagem onde o `Graphics` não chega: o cenário — madeira, luz,
 * profundidade — e as quatro marcas de peça, que são desenho de objeto e não
 * geometria de interface. Caixa, poço, cartão, HUD, botão e visor continuam
 * desenhados em código: mudam de cor e de estado o tempo todo e, como PNG,
 * virariam dezenas de variantes. Ver VISUAL.md §4.
 *
 * Se um arquivo sumir da pasta, o `effects.ts` volta sozinho para o desenho
 * em código — ver `data/textures.ts`.
 */
const ASSETS: Array<[string, string]> = [
    ['bg-oficina', bgOficinaUrl],

    ['marca-mes', marcaMesUrl],
    ['marca-cor', marcaCorUrl],
    ['marca-palavra', marcaPalavraUrl],
    ['marca-intrusa', marcaIntrusaUrl],

    ['selo-data', seloDataUrl],
    ['selo-pixels', seloPixelsUrl],
    ['selo-texto', seloTextoUrl],
]

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

        ASSETS.forEach(([key, url]) => this.load.image(key, url))
        preloadLives(this)
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto na missão que se quer
         * testar, sem jogar tudo o que vem antes — `{ level: 2, phase: 1 }`
         * cai na segunda missão do Nível 2. Os dois são grampeados no
         * `GameScene.init`, então número fora da faixa não quebra nada.
         *
         * Em produção isto fica em 1 e 0: a plataforma controla o nível pelo
         * `stage` do START_GAME, e a troca de nível acontece no
         * `scene.restart` do fim de fase.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
