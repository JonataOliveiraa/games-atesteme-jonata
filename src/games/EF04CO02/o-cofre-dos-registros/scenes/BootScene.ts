import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { LIFE_SHEET, SAFE_SHEET, SHEET } from '../data/art'
import { C } from '../data/theme'

/**
 * As folhas são OPCIONAIS.
 *
 * O `import.meta.glob` não quebra o build quando um PNG ainda não existe, e
 * cada peça confere `textures.exists` antes de desenhar. É o que deixa o
 * nível 1 rodar inteiro com o desenho de reserva, como pede o §9 do
 * TEXTURAS.md.
 */
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO02/o-cofre-dos-registros/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const KEY_OF: Record<string, string> = {
    'bg-posto-do-fundo-do-mar': SHEET.room,
    'cofre-do-arquivo': SHEET.safe,
    'criaturas-avistadas': SHEET.life,
}

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'O Cofre dos Registros',
            subtitle: 'Cada informação tem um campo com nome!',
            description: 'Acendendo as luzes do posto...',
            theme: {
                background: { kind: 'solid', color: C.deep },
                card: C.paper,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.ink,
                title: C.ink,
                subtitle: C.hullDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.ink,
                progressFill: C.aim,
                progressHighlight: C.lamp,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            // a capa é do catálogo, não da cena
            if (name.startsWith('cover-')) return
            const key = KEY_OF[name]
            if (!key) return
            if (key === SHEET.safe) this.load.spritesheet(key, url, SAFE_SHEET)
            else if (key === SHEET.life) this.load.spritesheet(key, url, LIFE_SHEET)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
