import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'
import { ATHLETE_COLUMNS, ATHLETE_SHEET } from './athlete'
import { COACH_COLUMNS, COACH_SHEET } from './coach'
import { ICON_COLUMNS, ICON_SHEET } from './icons'

const FILES = import.meta.glob(
    '../../../../assets/games/EF02CO02/serie-do-campeao/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

const SHEETS: Record<string, number> = {
    [ATHLETE_SHEET]: ATHLETE_COLUMNS,
    [COACH_SHEET]: COACH_COLUMNS,
    [ICON_SHEET]: ICON_COLUMNS,
}

function sliceSheet(scene: Phaser.Scene, key: string, columns: number) {
    if (!scene.textures.exists(key)) return
    const texture = scene.textures.get(key)
    if (texture.has('0')) return

    const source = texture.getSourceImage() as { width: number; height: number }
    const w = Math.floor(source.width / columns)
    const h = source.height
    for (let i = 0; i < columns; i++) texture.add(i, 0, i * w, 0, w, h)
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Série do Campeão',
            subtitle: 'Repita o movimento na conta certa!',
            description: 'Aquecendo no ginásio...',
            theme: {
                background: { kind: 'waves', color: 0x1a8f83, base: 0x2dd4bf },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.wood,
                title: C.ink,
                subtitle: C.tealDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.woodDark,
                progressFill: C.amber,
                progressHighlight: C.creamDeep,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (key.startsWith('cover-')) return
            this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        Object.entries(SHEETS).forEach(([key, columns]) => sliceSheet(this, key, columns))
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
