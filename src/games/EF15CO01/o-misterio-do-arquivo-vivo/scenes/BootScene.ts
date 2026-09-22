import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { SHEETS } from '../data/files'
import { C } from '../data/theme'

const SHEET_BY_KEY: Record<string, { frameWidth: number; frameHeight: number }> =
    Object.fromEntries(
        Object.values(SHEETS).map(s => [s.key, { frameWidth: s.frameWidth, frameHeight: s.frameHeight }]),
    )

/** `import.meta.glob`, nunca `import` estático: arquivo ausente quebraria o build. */
const FILES = import.meta.glob(
    '../../../../assets/games/EF15CO01/o-misterio-do-arquivo-vivo/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'O Mistério do Arquivo Vivo',
            subtitle: 'Caiu tudo no chão. Vamos guardar de volta?',
            description: 'Abrindo o arquivo...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.tinta,
                    color: C.ambar,
                    alpha: 0.1,
                    size: 22,
                    gap: 30,
                    angle: 'diagonal',
                },
                card: C.madeiraEscura,
                cardShadow: C.sombra,
                cardHighlight: C.ambar,
                cardBorder: C.ambar,
                title: C.creme,
                subtitle: C.ambar,
                description: C.papel,
                titleStroke: C.tinta,
                progressTrack: C.tinta,
                progressBorder: C.ambar,
                progressFill: C.ambar,
                progressHighlight: C.creme,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!key || key.startsWith('cover')) return
            const sheet = SHEET_BY_KEY[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })

        preloadLives(this)
    }

    create() {
        const level = faseInicial(this, 1)
        /* A INTRODUÇÃO SÓ NA PRIMEIRA ENTRADA DO NÍVEL 1. Quem volta de um
           nível 2 ou 3 já conhece o Tuca, e ninguém assiste a mesma abertura
           duas vezes. */
        const cena = level === 1 ? 'IntroScene' : 'GameScene'
        this.scene.start(cena, { level, points: 0 })
    }
}
