import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { MASTER_SHEET, PROPS_SHEET, SHEET } from '../data/art'
import { C } from '../data/theme'

/**
 * As folhas são OPCIONAIS.
 *
 * O `import.meta.glob` não quebra o build quando um PNG ainda não existe, e cada
 * peça confere `textures.exists` antes de desenhar. É o que deixa o jogo rodar
 * inteiro com desenho de reserva — e o que vai continuar valendo para a capa,
 * que ainda não existe.
 */
const ART = import.meta.glob(
    '../../../../assets/games/EF04CO05/expedicao-pixel/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const KEY_OF: Record<string, string> = {
    'bg-festa': SHEET.fair,
    'festa-pecas': SHEET.props,
    'mestre-npc': SHEET.master,
}

const SHEET_CONFIG: Record<string, Phaser.Types.Loader.FileTypes.ImageFrameConfig> = {
    [SHEET.props]: PROPS_SHEET,
    [SHEET.master]: MASTER_SHEET,
}

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Expedição Pixel',
            subtitle: 'A cor do fogo é feita de três luzes!',
            description: 'Armando os fogos da festa...',
            theme: {
                background: { kind: 'solid', color: C.skyHigh },
                card: C.wood,
                cardShadow: C.ink,
                cardHighlight: C.warm,
                cardBorder: C.ink,
                title: C.warm,
                subtitle: 0xf3e6cd,
                description: 0xf3e6cd,
                titleStroke: C.ink,
                progressTrack: C.skyLow,
                progressBorder: C.ink,
                progressFill: C.warm,
                progressHighlight: C.white,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            // a capa é do catálogo, não da cena
            if (name.startsWith('cover-')) return
            const key = KEY_OF[name]
            if (!key) return
            const sheet = SHEET_CONFIG[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
