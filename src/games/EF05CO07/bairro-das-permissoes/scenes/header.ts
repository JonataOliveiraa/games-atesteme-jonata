import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { cellKey } from '../data/files'
import { DEPTH, GOAL, HEADER, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL } from '../data/words'

export interface Header {
    readonly lives: Lives
    setPhase(index: number): void
    goal(icon: number | null, text: string, strong?: boolean): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    setCompact(k: number): void
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
    const band = scene.add.graphics()
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

    const pill = scene.add.graphics()
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

    const pips = Array.from({ length: opts.phases }, (_, i) => scene.add.circle(HUD.pipsX + i * HUD.pipGap, HUD.y, HUD.pipR, C.headerSoft))
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

    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.shadow, 0.25)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.headerLine, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help - 4}px`, color: '#ffffff' })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText])
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })

    const bar = scene.add.container(0, 0, [band, pill, levelText, ...pips, help]).setDepth(DEPTH.header)

    const backing = scene.add.graphics().setAlpha(0)
    const disc = scene.add.graphics()
    disc.fillStyle(C.shadow, 0.2)
    disc.fillCircle(0, 3, GOAL.disc)
    disc.fillStyle(C.white, 1)
    disc.fillCircle(0, 0, GOAL.disc)
    disc.lineStyle(4, C.headerLine, 1)
    disc.strokeCircle(0, 0, GOAL.disc)
    const icon = scene.add.image(0, 0, 'icones', cellKey(0)).setDisplaySize(GOAL.icon, GOAL.icon)
    const text = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.ask}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const goalBox = scene.add.container(GOAL.x, HUD.y, [backing, disc, icon, text]).setDepth(DEPTH.hud).setVisible(false)

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
    let compact = 0
    const reachable = () => helpOn && compact < 0.5
    const askHelp = () => {
        if (!reachable()) return
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
        if (helpZone.input) helpZone.input.enabled = reachable()
        help.setAlpha(helpOn ? 1 : 0.45)
    }
    paintHelp()

    const layoutGoal = (withIcon: boolean) => {
        text.setScale(1)
        const room = GOAL.maxW - (withIcon ? GOAL.disc * 2 + GOAL.gap : 0)
        if (text.width > room) text.setScale(room / text.width)
        const total = (withIcon ? GOAL.disc * 2 + GOAL.gap : 0) + text.displayWidth
        const left = -total / 2
        disc.setX(left + GOAL.disc)
        icon.setX(left + GOAL.disc)
        text.setX(withIcon ? left + GOAL.disc * 2 + GOAL.gap : left)
        const w = total + GOAL.padX * 2
        const h = GOAL.h
        backing.clear()
        backing.fillStyle(C.shadow, 0.16)
        backing.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        backing.fillStyle(C.headerFace, 1)
        backing.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        backing.fillStyle(C.headerRim, 1)
        backing.fillRoundedRect(-w / 2 + h / 2, h / 2 - 6, w - h, 6, 3)
    }

    return {
        lives,
        setPhase(index) {
            current = Phaser.Math.Clamp(index, 0, opts.phases)
            paint()
        },
        goal(iconIndex, line, strong = false) {
            scene.tweens.killTweensOf(goalBox)
            const withIcon = iconIndex !== null
            disc.setVisible(withIcon)
            icon.setVisible(withIcon)
            if (withIcon) icon.setFrame(cellKey(iconIndex)).setDisplaySize(GOAL.icon, GOAL.icon)
            text.setText(line).setColor(strong ? CSS.accent : CSS.ink)
            layoutGoal(withIcon)
            const base = 1 - (1 - GOAL.compact) * compact
            goalBox.setVisible(line.length > 0).setScale(base * 0.8)
            void FX.to(scene, goalBox, { scale: base }, { duration: 260, ease: 'Back.easeOut' })
        },
        async celebrate(index) {
            current = index + 1
            paint()
            const pip = pips[index]
            if (!pip) return
            void FX.sparks(scene, pip.x, pip.y + bar.y, { color: C.yes, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: HUD.y - 10 }, { duration: 150, yoyo: true })
            pip.setY(HUD.y)
        },
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        setCompact(k) {
            compact = Phaser.Math.Clamp(k, 0, 1)
            bar.setY(-(HEADER.h + 18) * compact).setAlpha(1 - 0.4 * compact)
            backing.setAlpha(compact)
            if (!scene.tweens.isTweening(goalBox)) goalBox.setScale(1 - (1 - GOAL.compact) * compact)
            paintHelp()
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            bar.destroy()
            goalBox.destroy()
            lives.destroy()
        },
    }
}
