import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { cutAt, HOST_SHEET, SCENE_GRID, SHEET, SOUND_SHEET } from '../data/art'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF03CO08/show-de-formatos/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const KEY_OF: Record<string, string> = {
    'bg-palco-escolar': SHEET.background,
    'apresentadora-duda': SHEET.host,
    'cenas-do-show': SHEET.scenes,
    'sons-do-show': SHEET.sounds,
}

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Show de Formatos',
            subtitle: 'Monte uma cena com imagem, frase e som!',
            description: 'Acendendo os refletores...',
            theme: {
                background: { kind: 'solid', color: C.purpleDeep },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.ink,
                title: C.ink,
                subtitle: C.purple,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.ink,
                progressFill: C.coral,
                progressHighlight: C.yellow,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const name = nameOf(path)
            const key = KEY_OF[name]
            if (!key) return
            if (key === SHEET.host) this.load.spritesheet(key, url, HOST_SHEET)
            else if (key === SHEET.sounds) this.load.spritesheet(key, url, SOUND_SHEET)
            else this.load.image(key, url)
        })
    }

    create() {
        this.sliceScenes()
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }

    private sliceScenes() {
        if (!this.textures.exists(SHEET.scenes)) return
        const texture = this.textures.get(SHEET.scenes)
        const source = texture.getSourceImage() as HTMLImageElement
        const { cols, rows, inset } = SCENE_GRID
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = cutAt(col, source.width, cols)
                const y = cutAt(row, source.height, rows)
                texture.add(
                    row * cols + col,
                    0,
                    x.from + inset,
                    y.from + inset,
                    x.size - inset * 2,
                    y.size - inset * 2,
                )
            }
        }
    }
}
