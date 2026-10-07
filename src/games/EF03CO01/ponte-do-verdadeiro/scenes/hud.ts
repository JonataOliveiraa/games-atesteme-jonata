import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HUD } from '../data/layout'
import { C, CSS, FONT, inkOn, SIZE } from '../data/theme'

export interface Hud {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    show(on: boolean): Promise<void>
    destroy(): void
}

export interface HudOptions {
    phases: number
    level: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, opts: HudOptions): Hud {
    const pipX = (i: number) => HUD.pipsX + i * HUD.pipGap
    const chipH = HUD.levelH + 16
    const chipLeft = HUD.chipX
    const chipW = pipX(opts.phases - 1) + HUD.pipR + 22 - chipLeft
    const chipTop = HUD.pipsY - chipH / 2

    const chip = scene.add.graphics().setDepth(DEPTH.hud)
    chip.fillStyle(C.shadow, 0.12)
    chip.fillRoundedRect(chipLeft + 2, chipTop + 4, chipW, chipH, chipH / 2)
    chip.fillStyle(C.cream, 1)
    chip.fillRoundedRect(chipLeft, chipTop, chipW, chipH, chipH / 2)
    chip.lineStyle(3, C.ink, 1)
    chip.strokeRoundedRect(chipLeft, chipTop, chipW, chipH, chipH / 2)
    const pillX = chipLeft + 8
    const pillY = HUD.pipsY - HUD.levelH / 2
    chip.fillStyle(C.lavender, 1)
    chip.fillRoundedRect(pillX, pillY, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    chip.lineStyle(3, C.ink, 1)
    chip.strokeRoundedRect(pillX, pillY, HUD.levelW, HUD.levelH, HUD.levelH / 2)

    const levelText = scene.add
        .text(pillX + HUD.levelW / 2, HUD.pipsY + 1, `Nível ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.lavender),
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const pips = scene.add.graphics().setDepth(DEPTH.hud + 1)
    let current = 0
    const paint = () => {
        pips.clear()
        for (let i = 0; i < opts.phases; i++) {
            const x = pipX(i)
            const on = i === current
            const r = on ? HUD.pipR + 2 : HUD.pipR
            pips.fillStyle(i < current ? C.yes : on ? C.pink : C.white, 1)
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
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)
    const parts: Phaser.GameObjects.GameObject[] = [chip, levelText, pips, help]

    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = true
    const askHelp = () => {
        if (!helpOn) return
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', askHelp)
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'h' || event.key === 'H') askHelp()
    }
    scene.input.keyboard?.on('keydown', onKey)

    const setPhase = (index: number) => {
        current = Phaser.Math.Clamp(index, 0, opts.phases)
        paint()
    }

    return {
        lives,
        setPhase,
        async celebrate(index) {
            setPhase(index + 1)
            await FX.ping(scene, pipX(index), HUD.pipsY, C.yes, { radius: 28, duration: 420, depth: DEPTH.hud + 2 })
        },
        show(on) {
            return FX.to(scene, parts as Phaser.GameObjects.Image[], { alpha: on ? 1 : 0 }, { duration: 260 })
        },
        setHelpEnabled(on) {
            helpOn = on
            if (helpZone.input) helpZone.input.enabled = on
            help.setAlpha(on ? 1 : 0.4)
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            pips.destroy()
            levelText.destroy()
            chip.destroy()
            lives.destroy()
        },
    }
}
