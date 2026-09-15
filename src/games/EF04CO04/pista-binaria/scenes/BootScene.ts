import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { BLOCK_SHEET, MACHINE_SHEET, SHEET, SHIP_SHEET } from '../data/art'
import { C } from '../data/theme'

/**
 * As folhas são OPCIONAIS.
 *
 * O `import.meta.glob` não quebra o build quando um PNG some ou muda de nome,
 * e cada peça confere `textures.exists` antes de desenhar. É o que deixa o
 * jogo rodar inteiro com o desenho de reserva.
 */
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO04/pista-binaria/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Pista Binária',
            subtitle: 'Cheio é 1. Vazio é 0.',
            description: 'Aquecendo os motores...',
            theme: {
                background: { kind: 'solid', color: C.navyDeep },
                card: C.navy,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.cream,
                title: C.cream,
                subtitle: C.yellow,
                description: C.creamDeep,
                titleStroke: C.ink,
                progressTrack: C.navyDeep,
                progressBorder: C.cream,
                progressFill: C.coral,
                progressHighlight: C.yellow,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            if (name.startsWith('cover-')) return
            if (name === 'tunel') this.load.image(SHEET.tunnel, url)
            else if (name === 'nave') this.load.spritesheet(SHEET.ship, url, SHIP_SHEET)
            else if (name === 'bloco') this.load.spritesheet(SHEET.block, url, BLOCK_SHEET)
            else if (name === 'maquina') this.load.spritesheet(SHEET.machine, url, MACHINE_SHEET)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
