import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { ART_SHEET, PEOPLE_SHEET, PROPS_SHEET, SHEET } from '../data/art'
import { C } from '../data/theme'

/**
 * As folhas são OPCIONAIS.
 *
 * O `import.meta.glob` não quebra o build quando um PNG some ou muda de nome, e
 * cada peça confere `textures.exists` antes de desenhar. É o que deixa o jogo
 * rodar inteiro com o desenho de reserva.
 */
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO06/mesa-de-edicao/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Mesa de Edição',
            subtitle: 'Deixe do jeito que ele pediu.',
            description: 'Abrindo o estúdio...',
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
            if (name === 'bg-estudio') this.load.image(SHEET.room, url)
            else if (name === 'suportes') this.load.spritesheet(SHEET.props, url, PROPS_SHEET)
            else if (name === 'clientes') this.load.spritesheet(SHEET.people, url, PEOPLE_SHEET)
            else if (name === 'acervo') this.load.spritesheet(SHEET.art, url, ART_SHEET)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
