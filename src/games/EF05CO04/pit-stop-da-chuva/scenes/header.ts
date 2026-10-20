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
    setRace(player: number, rivals: number[], place: number): void
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
    const map = scene.add.graphics().setDepth(DEPTH.hud)
    const mapW = HUD.mapX1 - HUD.mapX0
    map.fillStyle(C.headerLine, 0.25)
    map.fillRoundedRect(HUD.mapX0, HUD.y - 5, mapW, 10, 5)
    map.fillStyle(C.white, 1)
    map.fillRoundedRect(HUD.mapX0, HUD.y - 3, mapW, 6, 3)
    for (let k = 1; k < opts.phases; k++) {
        map.fillStyle(C.headerLine, 0.5)
        map.fillRect(HUD.mapX0 + (k * mapW) / opts.phases - 1.5, HUD.y - 10, 3, 20)
    }
    const flag = scene.add.graphics().setDepth(DEPTH.hud)
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) {
            flag.fillStyle((r + c) % 2 ? C.white : C.flagDark, 1)
            flag.fillRect(HUD.mapX1 + 6 + c * 8, HUD.y - 22 + r * 8, 8, 8)
        }
    flag.lineStyle(2, C.line, 1)
    flag.strokeRect(HUD.mapX1 + 6, HUD.y - 22, 24, 24)
    flag.fillStyle(C.metalDark, 1)
    flag.fillRect(HUD.mapX1 + 4, HUD.y - 22, 3, 34)
    const rivalDots = [C.rival, C.rivalB].map(tone =>
        scene.add.circle(HUD.mapX0, HUD.y, HUD.mapDot - 2, tone).setStrokeStyle(3, C.headerLine).setDepth(DEPTH.hud + 1),
    )
    const playerDot = scene.add.circle(HUD.mapX0, HUD.y, HUD.mapDot, C.team).setStrokeStyle(4, C.headerLine).setDepth(DEPTH.hud + 2)
    const placeText = scene.add
        .text(HUD.posX, HUD.y, '', { fontFamily: FONT.black, fontSize: `${SIZE.pos}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)
    let shownPlace = 0

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
        setRace(player, rivals, place) {
            const at = (k: number) => HUD.mapX0 + Phaser.Math.Clamp(k, 0, 1) * mapW
            playerDot.setX(at(player))
            rivalDots.forEach((dot, i) => dot.setVisible(shown && i < rivals.length).setX(at(rivals[i] ?? 0)))
            placeText.setVisible(shown && place > 0)
            if (place === shownPlace) return
            const better = shownPlace > 0 && place < shownPlace
            shownPlace = place
            placeText.setText(place > 0 ? LABEL.place(place) : '')
            if (better) void FX.to(scene, placeText, { scale: 1.3 }, { duration: 140, yoyo: true }).then(() => placeText.setScale(1))
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
        visible(on) {
            shown = on
            ;[band, pill, levelText, ...pips, map, flag, ...rivalDots, playerDot, placeText].forEach(o => o.setVisible(on))
            paintHelp()
        },
        helpRect: () => ({ x: HUD.helpX, y: HUD.helpY, w: HUD.helpR * 2 + 16, h: HUD.helpR * 2 + 16 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            levelText.destroy()
            pips.forEach(p => p.destroy())
            ;[map, flag, ...rivalDots, playerDot, placeText].forEach(o => o.destroy())
            pill.destroy()
            band.destroy()
            lives.destroy()
        },
    }
}
