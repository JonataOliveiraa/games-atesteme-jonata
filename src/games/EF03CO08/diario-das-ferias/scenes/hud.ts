import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HUD } from '../data/layout'
import { C, CSS, FONT, inkOn, SIZE } from '../data/theme'

export interface Hud {
    readonly lives: Lives
    setHelpEnabled(on: boolean): void
    show(on: boolean): void
    destroy(): void
}

export interface HudOptions {
    level: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

/** Pílula do nível à esquerda e `?` à direita. O progresso é o diário, no meio. */
export function createHud(scene: Phaser.Scene, opts: HudOptions): Hud {
    const chipH = HUD.levelH + 16
    const chipW = HUD.levelW + 16
    const chipTop = HUD.y - chipH / 2

    const chip = scene.add.graphics().setDepth(DEPTH.hud)
    chip.fillStyle(C.shadow, 0.12)
    chip.fillRoundedRect(HUD.chipX + 2, chipTop + 4, chipW, chipH, chipH / 2)
    chip.fillStyle(C.cream, 1)
    chip.fillRoundedRect(HUD.chipX, chipTop, chipW, chipH, chipH / 2)
    chip.lineStyle(3, C.ink, 1)
    chip.strokeRoundedRect(HUD.chipX, chipTop, chipW, chipH, chipH / 2)
    const pillX = HUD.chipX + 8
    const pillY = HUD.y - HUD.levelH / 2
    chip.fillStyle(C.accent, 1)
    chip.fillRoundedRect(pillX, pillY, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    chip.lineStyle(3, C.ink, 1)
    chip.strokeRoundedRect(pillX, pillY, HUD.levelW, HUD.levelH, HUD.levelH / 2)

    const levelText = scene.add
        .text(pillX + HUD.levelW / 2, HUD.y + 1, `Nível ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
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

    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = true
    let shown = true
    const askHelp = () => {
        if (!helpOn || !shown) return
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', askHelp)
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'h' || event.key === 'H') askHelp()
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        lives,
        setHelpEnabled(on) {
            helpOn = on
            if (helpZone.input) helpZone.input.enabled = on && shown
            help.setAlpha(shown ? (on ? 1 : 0.4) : 0)
        },
        show(on) {
            shown = on
            if (helpZone.input) helpZone.input.enabled = on && helpOn
            ;[chip, levelText].forEach(p => p.setAlpha(on ? 1 : 0))
            help.setAlpha(on ? (helpOn ? 1 : 0.4) : 0)
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            levelText.destroy()
            chip.destroy()
            lives.destroy()
        },
    }
}
