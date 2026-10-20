import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HEADER, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL, TITLE } from '../data/words'
import type { Rect } from '../types'
import { paintImage } from './art'

export interface Header {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    visible(on: boolean): void
    lift(on: boolean): Promise<void>
    helpRect(): Rect
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
    const band = paintImage(scene, W, HEADER.h + 10, g => {
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
    }).setOrigin(0, 0)

    const top = HUD.y - HUD.levelH / 2
    const pill = paintImage(scene, HUD.levelW, HUD.levelH + 4, g => {
        g.fillStyle(C.headerLine, 1)
        g.fillRoundedRect(0, 4, HUD.levelW, HUD.levelH, HUD.levelH / 2)
        g.fillStyle(C.accent, 1)
        g.fillRoundedRect(0, 0, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    })
        .setOrigin(0, 0)
        .setPosition(HUD.levelX, top)
    const levelText = scene.add
        .text(HUD.levelX + HUD.levelW / 2, HUD.y, `${LABEL.level} ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
        })
        .setOrigin(0.5)
        .setResolution(2)

    const pips = Array.from({ length: opts.phases }, (_, i) =>
        scene.add.circle(HUD.pipsX + i * HUD.pipGap, HUD.y, HUD.pipR, C.headerSoft),
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

    const title = scene.add
        .text(HUD.titleX, HUD.y, TITLE, { fontFamily: FONT.black, fontSize: `${SIZE.title}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    if (title.width > HUD.titleMaxW) title.setScale(HUD.titleMaxW / title.width)

    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.shadow, 0.25)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.headerLine, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help - 4}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText])

    const root = scene.add.container(0, 0, [band, pill, levelText, ...pips, title, help]).setDepth(DEPTH.header)

    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })

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

    let helpOn = false
    let shown = true
    let lifted = false
    const askHelp = () => {
        if (!helpOn || !shown || lifted) return
        scene.tweens.killTweensOf(help)
        help.setScale(1)
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', askHelp)

    const paintHelp = () => {
        if (helpZone.input) helpZone.input.enabled = helpOn && shown && !lifted
        help.setAlpha(helpOn ? 1 : 0.45)
    }
    paintHelp()

    return {
        lives,
        setPhase(index) {
            current = Phaser.Math.Clamp(index, 0, opts.phases)
            paint()
        },
        async celebrate(index) {
            current = index + 1
            paint()
            const pip = pips[index]
            if (!pip) return
            void FX.sparks(scene, pip.x, pip.y + root.y, { color: C.yes, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: HUD.y - 10 }, { duration: 150, yoyo: true })
            pip.setY(HUD.y)
        },
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        visible(on) {
            shown = on
            root.setVisible(on)
            paintHelp()
        },
        async lift(on) {
            lifted = on
            paintHelp()
            scene.tweens.killTweensOf(root)
            await FX.to(scene, root, { y: on ? -HEADER.lift : 0 }, { duration: TIMING.focus, ease: on ? 'Quad.easeIn' : 'Back.easeOut' })
        },
        helpRect: () => ({ x: HUD.helpX, y: HUD.helpY, w: HUD.helpR * 2 + 16, h: HUD.helpR * 2 + 16 }),
        destroy() {
            scene.tweens.killTweensOf(root)
            helpZone.destroy()
            root.destroy()
            lives.destroy()
        },
    }
}
