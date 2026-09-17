import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { ART_SHEET, PEOPLE_SHEET, TOOLS_SHEET } from '../data/art'
import { DESK_TEXTURE } from './desk'
import { ART_TEXTURE } from './sheet'
import { PEOPLE_TEXTURE } from './people'
import { LENS_TEXTURE } from './lens'
import { TOOLS_TEXTURE } from './toolbar'

/**
 * As folhas são OPCIONAIS: o `import.meta.glob` não quebra o build quando um
 * PNG falta, e cada peça confere `textures.exists` antes de desenhar.
 */
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO07/guardiao-etico/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Guardião Ético',
            subtitle: 'Confira antes de publicar.',
            description: 'Arrumando a mesa...',
            theme: {
                background: { kind: 'solid', color: C.wallDeep },
                card: C.wall,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.wood,
                title: C.ink,
                subtitle: C.amberDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.wallDeep,
                progressBorder: C.wood,
                progressFill: C.green,
                progressHighlight: C.white,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            if (name.startsWith('cover-')) return
            if (name === 'bg-mesa') this.load.image(DESK_TEXTURE, url)
            else if (name === 'colegas') {
                this.load.spritesheet(PEOPLE_TEXTURE, url, PEOPLE_SHEET)
            } else if (name === 'acervo') {
                this.load.spritesheet(ART_TEXTURE, url, ART_SHEET)
            } else if (name === 'ferramentas') {
                this.load.spritesheet(TOOLS_TEXTURE, url, TOOLS_SHEET)
            } else if (name === 'lupa') this.load.image(LENS_TEXTURE, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
