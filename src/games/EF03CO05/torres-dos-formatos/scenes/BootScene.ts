import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

/**
 * As grades das folhas. As duas de criatura têm a MESMA leitura: uma linha por
 * formato (som, imagem, texto, vídeo) e quatro poses em cada. A primeira tem
 * ainda uma quinta linha, o ninja.
 */
const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    'arquivo-criatura': { frameWidth: 300, frameHeight: 300 },
    'arquivo-criatura-2': { frameWidth: 300, frameHeight: 300 },
    formatos: { frameWidth: 400, frameHeight: 400 },
    conteudos: { frameWidth: 362, frameHeight: 362 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO05/torres-dos-formatos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Torres dos Formatos',
            subtitle: 'Escolha o leitor que entende cada estrutura!',
            description: 'Ligando os leitores...',
            theme: {
                background: { kind: 'solid', color: C.grassDark },
                card: C.panel,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.leaf,
                title: C.ink,
                subtitle: C.leaf,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.leaf,
                progressFill: C.grass,
                progressHighlight: C.gold,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (key.startsWith('cover')) return
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
