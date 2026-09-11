import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { BALL_SHEET, DATA_SHEET, DEST_SHEET, SHEET } from '../data/art'
import { C } from '../data/theme'

const FILES = import.meta.glob('../../../../assets/games/EF03CO09/ache-o-suspeito/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const KEY_OF: Record<string, string> = {
    'bg-sala-de-alvos': SHEET.room,
    'bolinha-de-papel': SHEET.ball,
    'foto-usuario': SHEET.photo,
    'destinos-da-rede': SHEET.destinations,
    'dados-suspeitos': SHEET.data,
}

const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [SHEET.ball]: BALL_SHEET,
    [SHEET.destinations]: DEST_SHEET,
    [SHEET.data]: DATA_SHEET,
}

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Ache o Suspeito',
            subtitle: 'Leia as placas e ache o compartilhamento suspeito!',
            description: 'Arrumando a sala...',
            theme: {
                background: { kind: 'solid', color: C.blueDeep },
                card: C.paper,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.ink,
                title: C.ink,
                subtitle: C.blue,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.ink,
                progressFill: C.cyan,
                progressHighlight: C.amber,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = KEY_OF[nameOf(path)]
            if (!key) return
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
