import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { C } from '../data/theme'
import { preloadLives } from '../../../../shared/hud/createLives'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    personagens: { frameWidth: 400, frameHeight: 500 },
}

const SKIP = ['robo', 'cover-passe-da-mensagem']

const FILES = import.meta.glob(
    '../../../../assets/games/EF01CO04/passe-da-mensagem/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Passe da Mensagem',
            subtitle: 'O mesmo recado, por voz, carta e celular',
            description: 'Entrando em quadra...',
            theme: {
                background: { kind: 'solid', color: 0x6fbf5a },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.shirtDark,
                title: C.ink,
                subtitle: C.shirtDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.shirtDark,
                progressFill: C.shirt,
                progressHighlight: C.warn,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (SKIP.includes(key)) return
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
