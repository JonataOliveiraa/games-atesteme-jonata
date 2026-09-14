import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { CANNON_SHEET, SHEET } from '../data/art'
import { C } from '../data/theme'

/**
 * As folhas são OPCIONAIS.
 *
 * O `import.meta.glob` não quebra o build quando um PNG ainda não existe, e
 * cada peça confere `textures.exists` antes de desenhar. É o que deixa o
 * nível 1 rodar inteiro com o desenho de reserva, como pede o §8 do
 * TEXTURAS.md.
 */
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO01/canhao-das-coordenadas/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const KEY_OF: Record<string, string> = {
    'bg-patio-da-arte': SHEET.courtyard,
    'canhao-de-tinta': SHEET.cannon,
}

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Canhão das Coordenadas',
            subtitle: 'Leia a linha e a coluna para achar a janela!',
            description: 'Preparando a tinta...',
            theme: {
                background: { kind: 'solid', color: C.paintDeep },
                card: C.wall,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.ink,
                title: C.ink,
                subtitle: C.paintDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.ink,
                progressFill: C.aim,
                progressHighlight: C.amber,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            // a capa é do catálogo, não da cena
            if (name.startsWith('cover-')) return
            const key = KEY_OF[name]
            if (!key) return
            if (key === SHEET.cannon) this.load.spritesheet(key, url, CANNON_SHEET)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
