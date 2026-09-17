import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

export const TEX = {
    bg: 'duelo-bg',
    robot: 'duelo-robo',
    busts: 'duelo-vizinhos',
    icons: 'duelo-icones',
    marks: 'duelo-botoes',
    hand: 'duelo-mao',
} as const

/** Os quadros de `botoes.png`, em grade 2 × 2. A ordem é contrato. */
export const MARK = { plane: 0, ball: 1, hand: 2, megaphone: 3 } as const

/** Medidos nos PNGs entregues: 1000², 1536 × 1024 e 1200 × 1000. */
const SHEETS = {
    robot: { frameWidth: 500, frameHeight: 500 },
    busts: { frameWidth: 512, frameHeight: 512 },
    icons: { frameWidth: 200, frameHeight: 200 },
    marks: { frameWidth: 256, frameHeight: 256 },
} as const

/**
 * As folhas são OPCIONAIS: o `import.meta.glob` não quebra o build quando um
 * PNG falta, e cada peça confere `textures.exists` antes de desenhar.
 */
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO08/duelo-das-fontes/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Duelo das Fontes',
            subtitle: 'Confira antes de espalhar.',
            description: 'Abrindo o balcão...',
            theme: {
                background: { kind: 'solid', color: C.sky },
                card: C.paper,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.band,
                title: C.ink,
                subtitle: C.band,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.slate,
                progressBorder: C.ink,
                progressFill: C.band,
                progressHighlight: C.white,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            if (name.startsWith('cover-')) return
            if (name === 'bg-balcao') this.load.image(TEX.bg, url)
            else if (name === 'robo') this.load.spritesheet(TEX.robot, url, SHEETS.robot)
            else if (name === 'vizinhos') this.load.spritesheet(TEX.busts, url, SHEETS.busts)
            else if (name === 'icones') this.load.spritesheet(TEX.icons, url, SHEETS.icons)
            else if (name === 'botoes') this.load.spritesheet(TEX.marks, url, SHEETS.marks)
        })

        preloadLives(this)
    }

    create() {
        // O dedo do tutorial precisa ser uma textura de quadro único: o
        // ponteiro do `createTutorial` desenha a imagem inteira, e passar a
        // folha mostraria os quatro ícones de uma vez.
        if (this.textures.exists(TEX.marks) && !this.textures.exists(TEX.hand)) {
            const frame = this.textures.getFrame(TEX.marks, MARK.hand)
            const canvas = this.textures.createCanvas(TEX.hand, frame.width, frame.height)
            canvas?.drawFrame(TEX.marks, MARK.hand, 0, 0)
            canvas?.refresh()
        }

        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
