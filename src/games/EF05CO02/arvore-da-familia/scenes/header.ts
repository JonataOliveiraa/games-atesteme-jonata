import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HEADER, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL } from '../data/words'

export interface Header {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    setShown(on: boolean): void
    destroy(): void
}

export interface HeaderOptions {
    level: number
    goal: string
    phases: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

export function createHeader(scene: Phaser.Scene, opts: HeaderOptions): Header {
    const band = scene.add.graphics()
    band.fillStyle(C.shadow, 0.14)
    band.fillRect(0, HEADER.h + 2, W, 8)
    band.fillStyle(C.headerFace, 1)
    band.fillRect(0, 0, W, HEADER.h)
    band.fillStyle(C.headerRim, 1)
    band.fillRect(0, HEADER.h - 6, W, 6)
    band.fillStyle(C.headerLine, 1)
    band.fillRect(0, HEADER.h, W, 3)
    HEADER.dividers.forEach(x => {
        band.fillStyle(C.headerRim, 1)
        band.fillRoundedRect(x - 1.5, 18, 3, HEADER.h - 40, 1.5)
    })

    const pill = scene.add.graphics()
    const top = HUD.y - HUD.levelH / 2
    pill.fillStyle(C.accentDark, 1)
    pill.fillRoundedRect(HUD.levelX, top + 4, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    pill.fillStyle(C.accent, 1)
    pill.fillRoundedRect(HUD.levelX, top, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    const levelText = scene.add
        .text(HUD.levelX + HUD.levelW / 2, HUD.y, `${LABEL.level} ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
        })
        .setOrigin(0.5)
        .setResolution(2)

    const goal = scene.add
        .text(HUD.goalX, HUD.y, opts.goal, { fontFamily: FONT.black, fontSize: `${SIZE.goal}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)

    const pips = Array.from({ length: opts.phases }, (_, i) => scene.add.circle(HUD.pipsX + i * HUD.pipGap, 0, HUD.pipR, C.pip))
    let current = 0
    const paint = () =>
        pips.forEach((pip, i) => {
            const done = i < current
            const now = i === current
            pip.setFillStyle(done ? C.yes : now ? C.butter : C.pip)
            pip.setStrokeStyle(3, C.headerLine, done || now ? 1 : 0.5)
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

    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.shadow, 0.25)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.headerLine, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help - 4}px`, color: '#ffffff' })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, 0, [helpArt, helpText])

    const pipBox = scene.add.container(0, HUD.y, pips)
    const content = scene.add.container(0, 0, [pill, levelText, goal, pipBox, help])
    const root = scene.add.container(0, 0, [band, content]).setDepth(DEPTH.header).setScrollFactor(0)
    help.setY(HUD.helpY)

    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
    let helpOn = false
    let shown = true
    const askHelp = () => {
        if (!helpOn || !shown) return
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
            if (!pip || !shown) return
            const cam = scene.cameras.main
            void FX.sparks(scene, pip.x + cam.scrollX, HUD.y + cam.scrollY, { color: C.yes, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: -10 }, { duration: 150, yoyo: true })
            pip.setY(0)
        },
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        setShown(on) {
            if (on === shown) return
            shown = on
            paintHelp()
            scene.tweens.killTweensOf(root)
            void FX.to(scene, root, { alpha: on ? 1 : 0, y: on ? 0 : -24 }, { duration: 180, ease: 'Sine.easeOut' })
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            scene.tweens.killTweensOf(root)
            helpZone.destroy()
            root.destroy()
            lives.destroy()
        },
    }
}
