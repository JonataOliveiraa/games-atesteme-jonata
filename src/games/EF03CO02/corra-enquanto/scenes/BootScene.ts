import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

/**
 * Os seis quadros de `robo.png` não têm altura igual — foram medidos no
 * arquivo. Por isso a folha entra como imagem e os quadros são registrados
 * na mão: cortar em grade fixa faria o robô escorregar de quadro em quadro.
 */
const ROBOT_FRAMES = [
    { y: 14, h: 280 },
    { y: 318, h: 274 },
    { y: 620, h: 274 },
    { y: 914, h: 270 },
    { y: 1228, h: 266 },
    { y: 1528, h: 262 },
]

const ROBOT_W = 250

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    sinais: { frameWidth: 400, frameHeight: 400 },
}

const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO02/corra-enquanto/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Corra Enquanto...',
            subtitle: 'Segure enquanto a regra valer!',
            description: 'Ligando o robô...',
            theme: {
                background: { kind: 'solid', color: C.sky },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.blueDark,
                title: C.ink,
                subtitle: C.blueDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.blueDark,
                progressFill: C.blue,
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
        if (this.textures.exists('robo')) {
            const texture = this.textures.get('robo')
            ROBOT_FRAMES.forEach((frame, index) => {
                if (!texture.has(String(index))) {
                    texture.add(index, 0, 0, frame.y, ROBOT_W, frame.h)
                }
            })
        }

        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
