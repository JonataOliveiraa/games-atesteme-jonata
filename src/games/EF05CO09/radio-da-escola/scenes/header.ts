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
    celebrate(index: number): Promise<void>
    ask(text: string | null): void
    onAir(credit: string): void
    offAir(): void
    flicker(): Promise<void>
    setHelpEnabled(on: boolean): void
    visible(on: boolean): void
    centerRect(): Rect
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
    band.fillStyle(C.shadow, 0.35)
    band.fillRect(0, HEADER.h, W, 10)
    band.fillStyle(C.headerFace, 0.9)
    band.fillRect(0, 0, W, HEADER.h)
    band.fillStyle(C.pink, 1)
    band.fillRect(0, HEADER.h - 4, W, 4)
    band.fillStyle(C.cyan, 0.8)
    band.fillRect(0, HEADER.h, W, 2)
    HEADER.dividers.forEach(x => {
        band.fillStyle(C.headerRim, 1)
        band.fillRoundedRect(x - 1.5, 16, 3, HEADER.h - 36, 1.5)
    })

    const pill = scene.add.graphics().setDepth(DEPTH.hud)
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
        .setDepth(DEPTH.hud + 1)

    const pips = Array.from({ length: opts.phases }, (_, i) =>
        scene.add.circle(HUD.pipsX + i * HUD.pipGap, HUD.y, HUD.pipR, C.headerSoft).setDepth(DEPTH.hud + 1),
    )
    let current = 0
    const paint = () =>
        pips.forEach((pip, i) => {
            const done = i < current
            const now = i === current
            pip.setFillStyle(done ? C.mint : now ? C.lemon : C.headerSoft)
            pip.setStrokeStyle(3, C.white, done || now ? 1 : 0.4)
            pip.setScale(now ? 1.15 : 1)
        })
    paint()

    const askText = scene.add
        .text(HUD.askX, HUD.y, '', { fontFamily: FONT.black, fontSize: `${SIZE.ask}px`, color: CSS.white, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const lamp = scene.add.circle(0, HUD.y, 11, C.lamp).setStrokeStyle(3, C.white).setDepth(DEPTH.hud + 1).setVisible(false)
    const airText = scene.add
        .text(0, HUD.y, LABEL.onAir, { fontFamily: FONT.black, fontSize: `${SIZE.onAir}px`, color: CSS.lamp })
        .setOrigin(0, 0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)
        .setVisible(false)
    const creditText = scene.add
        .text(0, HUD.y, '', { fontFamily: FONT.black, fontSize: `${SIZE.credit}px`, color: CSS.white })
        .setOrigin(0, 0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)
        .setVisible(false)
    const air = [lamp, airText, creditText]

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
    helpArt.fillStyle(C.shadow, 0.4)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.violetDark, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    helpArt.lineStyle(3, C.violetLight, 1)
    helpArt.strokeCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help - 6}px`, color: '#ffffff' })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = false
    let shown = true
    let airOn = false
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
        help.setAlpha(shown ? (helpOn ? 1 : 0.4) : 0)
    }
    paintHelp()

    const showAir = (on: boolean) => air.forEach(o => o.setVisible(on && shown))

    const header: Header = {
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
            void FX.sparks(scene, pip.x, pip.y, { color: C.mint, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: HUD.y - 10 }, { duration: 150, yoyo: true })
            pip.setY(HUD.y)
        },
        ask(text) {
            scene.tweens.killTweensOf(askText)
            askText.setText(text ?? '').setScale(1).setAlpha(1)
            if (askText.width > HUD.askW) askText.setScale(HUD.askW / askText.width)
            if (text) {
                header.offAir()
                void FX.popIn(scene, askText, { from: 0.85, duration: 260 })
            }
        },
        onAir(credit) {
            askText.setText('')
            airOn = true
            creditText.setText(credit).setColor(CSS.white).setAlpha(1)
            airText.setColor(CSS.lamp).setAlpha(1)
            lamp.setFillStyle(C.lamp).setAlpha(1)
            const total = 22 + 10 + airText.width + 24 + creditText.width
            const left = HUD.askX - total / 2
            lamp.setX(left + 11)
            airText.setX(left + 32)
            creditText.setX(left + 32 + airText.width + 24)
            showAir(true)
            void FX.popIn(scene, creditText, { from: 0.8, duration: 300 })
        },
        offAir() {
            airOn = false
            air.forEach(o => scene.tweens.killTweensOf(o))
            showAir(false)
        },
        async flicker() {
            for (let i = 0; i < 3; i++) {
                lamp.setAlpha(0.2)
                creditText.setAlpha(0.3)
                await FX.wait(scene, 90)
                lamp.setAlpha(1)
                creditText.setAlpha(1)
                await FX.wait(scene, 90)
            }
            lamp.setFillStyle(0x6a3a5a)
            airText.setColor(CSS.dim)
            creditText.setAlpha(0.45)
        },
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        visible(on) {
            shown = on
            ;[band, pill, levelText, askText, ...pips].forEach(o => o.setVisible(on))
            showAir(airOn)
            paintHelp()
        },
        centerRect: () => ({ x: HUD.askX, y: HUD.y, w: HUD.askW, h: HEADER.h - 10 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            air.forEach(o => o.destroy())
            askText.destroy()
            levelText.destroy()
            pips.forEach(p => p.destroy())
            pill.destroy()
            band.destroy()
            lives.destroy()
        },
    }
    return header
}
