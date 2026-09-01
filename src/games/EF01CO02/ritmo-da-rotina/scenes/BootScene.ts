import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { C } from '../data/theme'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * As texturas entram por glob, e não por `import` estático: um import de
 * arquivo que ainda não existe quebra o `vite build` inteiro. Com o glob, um
 * PNG novo entra no jogo assim que for salvo na pasta, e um que falta apenas
 * não entra — o `createFigure` desenha um cartão com o nome do passo no lugar.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO02/ritmo-da-rotina/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Ritmo da Rotina',
            subtitle: 'Bata no tambor na ordem certa',
            description: 'Afinando o tambor...',
            theme: {
                background: { kind: 'solid', color: 0xfbecc8 },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.coralDark,
                title: C.ink,
                subtitle: C.coralDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.coralDark,
                progressFill: C.coral,
                progressHighlight: C.warn,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            this.load.image(keyOf(path), url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
