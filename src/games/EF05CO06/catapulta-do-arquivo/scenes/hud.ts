import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HEADER, HUD, W } from '../data/layout'
import { C, CSS, FONT, inkOn, SIZE } from '../data/theme'

export interface Hud {
    readonly lives: Lives
    setRound(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export interface HudOptions {
    rounds: number
    level: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, opts: HudOptions): Hud {
    const header = scene.add.graphics().setDepth(DEPTH.header).setScrollFactor(0)
    header.fillStyle(C.shadow, 0.12)
    header.fillRect(0, HEADER.height, W, 8)
    header.fillStyle(C.headerCream, 1)
    header.fillRect(0, 0, W, HEADER.height)
    header.fillStyle(C.headerRim, 1)
    header.fillRect(0, HEADER.height - 6, W, 6)
    header.fillStyle(C.headerLine, 1)
    header.fillRect(0, HEADER.height, W, 3)

    const pipX = (i: number) => HUD.pipsX + i * HUD.pipGap
    const chipH = HUD.levelH + 16
    const chipW = pipX(opts.rounds - 1) + HUD.pipR + 22 - HUD.chipX
    const chipTop = HUD.pipsY - chipH / 2

    const chip = scene.add.graphics().setDepth(DEPTH.hud).setScrollFactor(0)
    chip.fillStyle(C.shadow, 0.12)
    chip.fillRoundedRect(HUD.chipX + 2, chipTop + 4, chipW, chipH, chipH / 2)
    chip.fillStyle(C.cream, 1)
    chip.fillRoundedRect(HUD.chipX, chipTop, chipW, chipH, chipH / 2)
    chip.lineStyle(3, C.ink, 1)
    chip.strokeRoundedRect(HUD.chipX, chipTop, chipW, chipH, chipH / 2)
    const pillX = HUD.chipX + 8
    const pillY = HUD.pipsY - HUD.levelH / 2
    chip.fillStyle(C.accent, 1)
    chip.fillRoundedRect(pillX, pillY, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    chip.lineStyle(3, C.ink, 1)
    chip.strokeRoundedRect(pillX, pillY, HUD.levelW, HUD.levelH, HUD.levelH / 2)

    const levelText = scene.add
        .text(pillX + HUD.levelW / 2, HUD.pipsY + 1, `Nível ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)
        .setScrollFactor(0)

    const pips = scene.add.graphics().setDepth(DEPTH.hud + 1).setScrollFactor(0)
    let current = 0
    const paint = () => {
        pips.clear()
        for (let i = 0; i < opts.rounds; i++) {
            const x = pipX(i)
            const on = i === current
            const r = on ? HUD.pipR + 2 : HUD.pipR
            pips.fillStyle(i < current ? C.yes : on ? C.lilac : C.white, 1)
            pips.fillCircle(x, HUD.pipsY, r)
            pips.lineStyle(3, C.ink, 1)
            pips.strokeCircle(x, HUD.pipsY, r)
        }
    }
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
    helpArt.fillStyle(C.shadow, 0.16)
    helpArt.fillCircle(2, 5, HUD.helpR)
    helpArt.fillStyle(C.cream, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    helpArt.lineStyle(4, C.ink, 1)
    helpArt.strokeCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud).setScrollFactor(0)
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })
    let helpOn = true
    helpZone.on('pointerdown', () => {
        if (!helpOn) return
        void FX.press(scene, help)
        opts.onHelp()
    })

    const setRound = (index: number) => {
        current = Phaser.Math.Clamp(index, 0, opts.rounds)
        paint()
    }

    return {
        lives,
        setRound,
        async celebrate(index) {
            setRound(index + 1)
            const ring = scene.add.graphics({ x: pipX(index), y: HUD.pipsY }).setScrollFactor(0).setDepth(DEPTH.hud + 2)
            ring.fillStyle(C.yes, 0.35)
            ring.fillCircle(0, 0, 28)
            ring.lineStyle(4, C.yes, 1)
            ring.strokeCircle(0, 0, 28)
            ring.setScale(0.2)
            await FX.to(scene, ring, { scale: 1, alpha: 0 }, { duration: 420 })
            ring.destroy()
        },
        setHelpEnabled(on) {
            helpOn = on
            if (helpZone.input) helpZone.input.enabled = on
            help.setAlpha(on ? 1 : 0.4)
        },
        destroy() {
            helpZone.destroy()
            help.destroy()
            pips.destroy()
            levelText.destroy()
            chip.destroy()
            header.destroy()
            lives.destroy()
        },
    }
}
