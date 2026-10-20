import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HEADER, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL } from '../data/words'
import type { Rect } from '../types'

export interface Header {
    readonly lives: Lives
    setPhase(index: number): void
    /** O pedido, no meio da faixa. `strong` é o "agora toque" depois de tudo ligado. */
    ask(text: string, strong?: boolean): void
    askRect(): Rect
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    visible(on: boolean): void
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
    const band = scene.add.graphics().setDepth(DEPTH.header)
    band.fillStyle(C.shadow, 0.16)
    band.fillRect(0, HEADER.h + 2, W, 8)
    band.fillStyle(C.headerFace, 1)
    band.fillRect(0, 0, W, HEADER.h)
    band.fillStyle(C.headerRim, 1)
    band.fillRect(0, HEADER.h - 6, W, 6)
    band.fillStyle(C.headerLine, 0.55)
    band.fillRect(0, HEADER.h, W, 2)
    HEADER.dividers.forEach(x => {
        band.fillStyle(C.headerRim, 1)
        band.fillRoundedRect(x - 1.5, 18, 3, HEADER.h - 40, 1.5)
    })

    const pill = scene.add.graphics().setDepth(DEPTH.hud)
    const top = HUD.y - HUD.levelH / 2
    pill.fillStyle(C.headerLine, 1)
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
            wordWrap: { width: HUD.askW, useAdvancedWrap: true },
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
    helpArt.fillStyle(C.shadow, 0.25)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.headerLine, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
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
        help.setAlpha(shown ? (helpOn ? 1 : 0.45) : 0)
    }
    paintHelp()

    return {
        lives,
        setPhase(index) {
            current = Phaser.Math.Clamp(index, 0, opts.phases)
            paint()
        },
        ask(text, strong = false) {
            scene.tweens.killTweensOf(askText)
            askText.setText(text).setColor(strong ? CSS.accent : CSS.ink).setScale(1)
            if (askText.width > HUD.askW) askText.setScale(HUD.askW / askText.width)
            const base = askText.scale
            askText.setScale(base * 0.7)
            void FX.to(scene, askText, { scale: base }, { duration: 260, ease: 'Back.easeOut' })
        },
        askRect: () => ({ x: HUD.askX, y: HUD.y, w: HUD.askW + 40, h: HEADER.h - 10 }),
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
        visible(on) {
            shown = on
            ;[band, pill, levelText, askText, ...pips].forEach(o => o.setVisible(on))
            paintHelp()
        },
        helpRect: () => ({ x: HUD.helpX, y: HUD.helpY, w: HUD.helpR * 2 + 16, h: HUD.helpR * 2 + 16 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            levelText.destroy()
            askText.destroy()
            pips.forEach(p => p.destroy())
            pill.destroy()
            band.destroy()
            lives.destroy()
        },
    }
}
