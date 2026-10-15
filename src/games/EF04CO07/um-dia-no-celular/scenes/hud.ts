import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HUD } from '../data/layout'
import { C, FONT, SIZE, inkOn } from '../data/theme'
import { T } from '../data/timing'
import type { Rect } from '../types'
import { paintImage } from './art'

export interface Hud {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    helpRect(): Rect
    setShown(on: boolean): void
    destroy(): void
}

export interface HudOptions {
    level: number
    phases: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, opts: HudOptions): Hud {
    const top = HUD.y - HUD.levelH / 2
    const pill = paintImage(scene, HUD.levelW, HUD.levelH + 4, g => {
        g.fillStyle(C.headerLine, 1)
        g.fillRoundedRect(0, 4, HUD.levelW, HUD.levelH, HUD.levelH / 2)
        g.fillStyle(C.accent, 1)
        g.fillRoundedRect(0, 0, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    })
        .setPosition(HUD.levelX, top)
        .setDepth(DEPTH.hud)
    const levelText = scene.add
        .text(HUD.levelX + HUD.levelW / 2, HUD.y, `Nível ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const pips = Array.from({ length: opts.phases }, (_, i) =>
        scene.add.circle(HUD.pipsX + i * HUD.pipGap, HUD.y, HUD.pipR, C.white).setDepth(DEPTH.hud + 1),
    )
    let current = 0
    const paint = () =>
        pips.forEach((pip, i) => {
            const done = i < current
            const now = i === current
            pip.setFillStyle(done ? C.yes : now ? C.butter : C.white)
            pip.setStrokeStyle(3, C.headerLine, done || now ? 1 : 0.45)
            pip.setScale(now ? 1.15 : 1)
        })
    paint()

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

    const helpArt = paintImage(
        scene,
        HUD.helpR * 2,
        HUD.helpR * 2 + 4,
        g => {
            g.fillStyle(C.shadow, 0.22)
            g.fillCircle(0, 4, HUD.helpR)
            g.fillStyle(C.headerLine, 1)
            g.fillCircle(0, 0, HUD.helpR)
        },
        HUD.helpR,
        HUD.helpR,
    )
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help}px`, color: '#ffffff' })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText])
    const bar = scene.add.container(0, 0, [pill, levelText, ...pips, help]).setDepth(DEPTH.hud)
    let shown = true
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = false
    const ask = () => {
        if (!helpOn) return
        scene.tweens.killTweensOf(help)
        help.setScale(1)
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', ask)
    const paintHelp = () => {
        if (helpZone.input) helpZone.input.enabled = helpOn && shown
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
            void FX.sparks(scene, pip.x, pip.y, { color: C.yes, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: HUD.y - 10 }, { duration: 150, yoyo: true })
            pip.setY(HUD.y)
        },
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        helpRect: () => ({ x: HUD.helpX, y: HUD.helpY, w: HUD.helpR * 2 + 16, h: HUD.helpR * 2 + 16 }),
        setShown(on) {
            if (!bar.active) return
            shown = on
            paintHelp()
            scene.tweens.killTweensOf(bar)
            void FX.to(scene, bar, { y: on ? 0 : -(HUD.y + HUD.levelH), alpha: on ? 1 : 0 }, { duration: T.short, ease: on ? 'Back.easeOut' : 'Sine.easeIn' })
        },
        destroy() {
            helpZone.destroy()
            bar.destroy()
            lives.destroy()
        },
    }
}
