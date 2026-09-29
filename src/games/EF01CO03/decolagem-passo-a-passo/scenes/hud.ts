import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HUD } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Hud {
    readonly lives: Lives
    setPhase(index: number): void
    setProgress(done: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export interface HudOptions {
    missions: number
    level: number
    levels: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, opts: HudOptions): Hud {
    const bar = scene.add.graphics().setDepth(DEPTH.hud - 1)
    for (const chip of [HUD.chipLeft, HUD.chipRight]) {
        const r = Math.min(32, chip.h / 2)
        bar.fillStyle(C.shadow, 0.25)
        bar.fillRoundedRect(chip.x + 2, chip.y + 5, chip.w, chip.h, r)
        bar.fillStyle(C.hudLine, 1)
        bar.fillRoundedRect(chip.x - 3, chip.y - 3, chip.w + 6, chip.h + 6, r + 3)
        bar.fillStyle(C.hudBar, 1)
        bar.fillRoundedRect(chip.x, chip.y, chip.w, chip.h, r)
    }

    const pill = HUD.levelPill
    bar.fillStyle(C.pillDark, 1)
    bar.fillRoundedRect(pill.x, pill.y, pill.w, pill.h, pill.h / 2)
    bar.fillStyle(C.pill, 1)
    bar.fillRoundedRect(pill.x + 4, pill.y + 4, pill.w - 8, pill.h - 8, (pill.h - 8) / 2)
    bar.fillStyle(C.white, 0.22)
    bar.fillRoundedRect(pill.x + 14, pill.y + 9, pill.w - 28, 8, 4)

    const levelLabel = scene.add
        .text(pill.x + pill.w / 2, pill.y + pill.h / 2, `NÍVEL ${opts.level}/${opts.levels}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.hudLevel}px`,
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const pips = scene.add.graphics().setDepth(DEPTH.hud + 1)

    const pipX = (i: number) => HUD.pipsX + (i - (opts.missions - 1) / 2) * HUD.pipGap
    let current = 0

    const paint = () => {
        pips.clear()
        for (let i = 0; i < opts.missions; i++) {
            const x = pipX(i)
            const on = i === current
            pips.fillStyle(C.shadow, 0.9)
            pips.fillCircle(x, HUD.pipsY + 2, HUD.pipR + 3 + (on ? 2 : 0))
            pips.fillStyle(i < current ? C.green : on ? C.gold : C.pipIdle, 1)
            pips.fillCircle(x, HUD.pipsY, on ? HUD.pipR + 2 : HUD.pipR)
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

    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.pillDark, 1)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.white, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    helpArt.lineStyle(4, C.gold, 1)
    helpArt.strokeCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: '34px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)

    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    helpZone.on('pointerdown', () => {
        void FX.press(scene, help)
        opts.onHelp()
    })

    const setPhase = (index: number) => {
        current = Phaser.Math.Clamp(index, 0, opts.missions)
        paint()
    }

    return {
        lives,
        setPhase,
        setProgress: setPhase,
        async celebrate(index) {
            setPhase(index + 1)
            await FX.ping(scene, pipX(index), HUD.pipsY, C.green, { radius: 28, duration: 420, depth: DEPTH.hud + 2 })
        },
        setHelpEnabled(on) {
            if (helpZone.input) helpZone.input.enabled = on
            help.setAlpha(on ? 1 : 0.4)
        },
        destroy() {
            helpZone.destroy()
            help.destroy()
            pips.destroy()
            levelLabel.destroy()
            bar.destroy()
            lives.destroy()
        },
    }
}
