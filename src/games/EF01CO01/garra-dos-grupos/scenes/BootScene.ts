import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF01CO01/garra-dos-grupos/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Garra dos Grupos',
            subtitle: 'Pegue só o que combina!',
            description: 'Ligando a máquina...',
            theme: {
                background: {
                    kind: 'dots',
                    base: C.cabinetDark,
                    color: C.cabinetLight,
                    alpha: 0.35,
                    size: 34,
                    radius: 5,
                },
                card: C.cabinet,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.gold,
                title: C.white,
                subtitle: C.gold,
                description: C.tray,
                titleStroke: C.ink,
                progressTrack: C.ink,
                progressBorder: C.white,
                progressFill: C.gold,
                progressHighlight: C.white,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!key || key.startsWith('cover')) return
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
