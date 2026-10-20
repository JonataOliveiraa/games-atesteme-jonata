import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HEADER, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL } from '../data/words'

const BAND_KEY = 'cabecalho'
const HELP_KEY = 'ajuda'

export interface Header {
    readonly lives: Lives
    ask(text: string, strong?: boolean): void
    celebrate(index: number): Promise<void>
    setLevel(level: number): void
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export interface HeaderOptions {
    level: number
    phases: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

export function createHeader(scene: Phaser.Scene, opts: HeaderOptions): Header {
    if (!scene.textures.exists(BAND_KEY)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(C.shadow, 0.16)
        g.fillRect(0, HEADER.h + 2, W, 8)
        g.fillStyle(C.headerFace, 1)
        g.fillRect(0, 0, W, HEADER.h)
        g.fillStyle(C.headerRim, 1)
        g.fillRect(0, HEADER.h - 6, W, 6)
        g.fillStyle(C.headerLine, 0.55)
        g.fillRect(0, HEADER.h, W, 2)
        HEADER.dividers.forEach(x => {
            g.fillStyle(C.headerRim, 1)
            g.fillRoundedRect(x - 1.5, 18, 3, HEADER.h - 40, 1.5)
        })
        const top = HUD.y - HUD.levelH / 2
        g.fillStyle(C.headerLine, 1)
        g.fillRoundedRect(HUD.levelX, top + 4, HUD.levelW, HUD.levelH, HUD.levelH / 2)
        g.fillStyle(C.accent, 1)
        g.fillRoundedRect(HUD.levelX, top, HUD.levelW, HUD.levelH, HUD.levelH / 2)
        g.generateTexture(BAND_KEY, W, HEADER.h + 10)
        g.destroy()
    }
    if (!scene.textures.exists(HELP_KEY)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(C.shadow, 0.25)
        g.fillCircle(HUD.helpR, HUD.helpR + 4, HUD.helpR)
        g.fillStyle(C.headerLine, 1)
        g.fillCircle(HUD.helpR, HUD.helpR, HUD.helpR)
        g.generateTexture(HELP_KEY, HUD.helpR * 2, HUD.helpR * 2 + 4)
        g.destroy()
    }
    const band = scene.add.image(0, 0, BAND_KEY).setOrigin(0).setDepth(DEPTH.header)
    const levelText = scene.add
        .text(HUD.levelX + HUD.levelW / 2, HUD.y, `${LABEL.level} ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const pips = Array.from({ length: opts.phases }, (_, i) =>
        scene.add.circle(HUD.pipsX + i * HUD.pipGap, HUD.y, HUD.pipR, C.headerSoft).setDepth(DEPTH.hud + 1),
    )
    let current = 0
    const paint = () =>
        pips.forEach((pip, i) => {
            const done = i < current
            const now = i === current
            pip.setFillStyle(done ? C.yes : now ? C.butter : C.white)
            pip.setStrokeStyle(3, C.headerLine, done || now ? 1 : 0.5)
            pip.setScale(now ? 1.15 : 1)
        })
    paint()

    const askText = scene.add
        .text(HUD.askX, HUD.y, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.ask}px`,
            color: CSS.ink,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const lives = createLives(scene, {
        total: opts.livesTotal,
        remaining: opts.livesLeft,
        gameId: opts.gameId,
        x: HUD.livesX,
        y: HUD.livesY,
        size: HUD.livesSize,
        stage: opts.stage,
        depth: DEPTH.hud + 1,
    })
    lives.container.setVisible(false)

    const helpArt = scene.add.image(0, 2, HELP_KEY)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help - 4}px`, color: '#ffffff' })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = false
    const askHelp = () => {
        if (!helpOn) return
        scene.tweens.killTweensOf(help)
        help.setScale(1)
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', askHelp)
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'h' || event.key === 'H') askHelp()
    }
    scene.input.keyboard?.on('keydown', onKey)

    const paintHelp = () => {
        if (helpZone.input) helpZone.input.enabled = helpOn
        help.setAlpha(helpOn ? 1 : 0.45)
    }
    paintHelp()

    return {
        lives,
        ask(text, strong = false) {
            scene.tweens.killTweensOf(askText)
            askText.setText(text).setColor(strong ? CSS.accent : CSS.ink).setScale(1)
            if (askText.width > HUD.askW) askText.setScale(HUD.askW / askText.width)
            const base = askText.scale
            askText.setScale(base * 0.7)
            void FX.to(scene, askText, { scale: base }, { duration: 260, ease: 'Back.easeOut' })
        },
        async celebrate(index) {
            current = index + 1
            paint()
            const pip = pips[index]
            if (!pip) return
            void FX.sparks(scene, pip.x, pip.y, { color: C.yes, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: HUD.y - 10 }, { duration: 150, yoyo: true })
            pip.setY(HUD.y)
        },
        setLevel(level) {
            levelText.setText(`${LABEL.level} ${level}`)
            void FX.to(scene, levelText, { scale: 1.25 }, { duration: 160, yoyo: true })
            current = 0
            paint()
            pips.forEach((pip, i) => {
                pip.setScale(0)
                void FX.to(scene, pip, { scale: i === 0 ? 1.15 : 1 }, { duration: 240, delay: 120 + i * 70, ease: 'Back.easeOut' })
            })
        },
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            levelText.destroy()
            askText.destroy()
            pips.forEach(p => p.destroy())
            band.destroy()
            lives.destroy()
        },
    }
}
