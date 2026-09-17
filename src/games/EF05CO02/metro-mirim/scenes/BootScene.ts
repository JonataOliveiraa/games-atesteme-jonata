import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { KEY, RIDERS_SHEET, STATIONS_SHEET } from '../data/art'
import { C } from '../data/theme'

/**
 * As folhas são OPCIONAIS: o `import.meta.glob` não quebra o build quando um
 * PNG falta, e cada peça confere `textures.exists` antes de desenhar. Hoje o
 * `trem.png` ainda não chegou, e o trenzinho sai em `Graphics`.
 */
const ART = import.meta.glob('../../../../assets/games/EF05CO02/metro-mirim/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Metrô Mirim',
            subtitle: 'Ligue as estações, leve todo mundo.',
            description: 'Montando a cidade...',
            theme: {
                background: { kind: 'solid', color: C.cityDeep },
                card: C.city,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.rail,
                title: C.ink,
                subtitle: C.blueDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.cityDeep,
                progressBorder: C.rail,
                progressFill: C.green,
                progressHighlight: C.white,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            if (name.startsWith('cover-')) return
            if (name === 'bg-cidade') this.load.image(KEY.city, url)
            else if (name === 'estacoes') this.load.spritesheet(KEY.stations, url, STATIONS_SHEET)
            else if (name === 'passageiros') this.load.spritesheet(KEY.riders, url, RIDERS_SHEET)
            else if (name === 'trem') this.load.image(KEY.train, url)
            else if (name === 'trilho-icone' || name === 'icone-trilho') this.load.image(KEY.piece, url)
            else if (name === 'trilho-tile') this.load.image(KEY.tile, url)
        })
        preloadLives(this)
    }

    create() {
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
