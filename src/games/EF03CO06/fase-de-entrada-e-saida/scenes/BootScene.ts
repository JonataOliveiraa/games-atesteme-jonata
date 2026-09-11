import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEET } from '../data/devices'
import { C } from '../data/theme'

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = Object.fromEntries(
    Object.values(SHEET).map(sheet => [sheet.key, { frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight }]),
)

const FILES = import.meta.glob('../../../../assets/games/EF03CO06/fase-de-entrada-e-saida/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Fase de Entrada e Saída',
            subtitle: 'Ajude a informação a entrar e sair do computador!',
            description: 'Ligando os cabos...',
            theme: {
                background: { kind: 'solid', color: C.inputDeep },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.ink,
                title: C.ink,
                subtitle: C.inputDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.ink,
                progressFill: C.output,
                progressHighlight: C.input,
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
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
