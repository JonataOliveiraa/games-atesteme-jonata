import Phaser from 'phaser'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Hud {
    container: Phaser.GameObjects.Container
    setPhase(index: number): void
    setTicker(text: string): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    setShown(on: boolean): void
    destroy(): void
}

export function createHud(
    scene: Phaser.Scene,
    opts: { level: number; phases: number; onHelp: () => void },
): Hud {
    const container = scene.add.container(0, 0).setDepth(DEPTH.hud)
    const g = scene.add.graphics()
    container.add(g)

    g.fillStyle(C.wall, 1)
    g.fillRect(0, 0, W, HUD.h)
    g.fillStyle(C.mustard, 1)
    g.fillRect(0, HUD.h, W, HUD.accent)
    g.fillStyle(C.shadow, 0.16)
    g.fillRect(0, HUD.h + HUD.accent, W, 8)

    const levelText = scene.add
        .text(HUD.levelX, HUD.levelY, `NÍVEL ${opts.level}`, {
            fontFamily: FONT,
            fontSize: `${SIZE.hudLevel}px`,
            color: CSS.cream,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    container.add(levelText)

    const dots = scene.add.graphics()
    container.add(dots)
    let phase = 0

    const paintDots = (pulse = -1) => {
        dots.clear()
        for (let i = 0; i < opts.phases; i++) {
            const x = HUD.levelX + 9 + i * HUD.dotGap
            const done = i < phase
            dots.fillStyle(done ? C.mustard : C.cream, done ? 1 : 0.32)
            dots.fillCircle(x, HUD.dotsY, i === pulse ? HUD.dotR + 3 : HUD.dotR)
        }
    }
    paintDots()

    const ticker = scene.add
        .text(HUD.midX + HUD.midW / 2, HUD.h / 2, '', {
            fontFamily: FONT,
            fontSize: `${SIZE.ticker}px`,
            color: CSS.cream,
            align: 'center',
            wordWrap: { width: HUD.midW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    container.add(ticker)

    const help = scene.add.graphics()
    container.add(help)
    let helpOn = true
    const paintHelp = () => {
        help.clear()
        help.fillStyle(C.cream, helpOn ? 1 : 0.35)
        help.fillCircle(HUD.helpCx, HUD.helpCy, HUD.helpR)
        help.lineStyle(3, C.ink, helpOn ? 1 : 0.35)
        help.strokeCircle(HUD.helpCx, HUD.helpCy, HUD.helpR)
    }
    paintHelp()

    const helpMark = scene.add
        .text(HUD.helpCx, HUD.helpCy + 1, '?', {
            fontFamily: FONT,
            fontSize: '30px',
            color: CSS.wall,
        })
        .setOrigin(0.5)
        .setResolution(2)
    container.add(helpMark)

    const zone = scene.add
        .zone(HUD.helpCx, HUD.helpCy, HUD.helpR * 2 + 16, HUD.helpR * 2 + 16)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })
    zone.on('pointerdown', () => {
        if (helpOn) opts.onHelp()
    })

    return {
        container,
        setPhase(index) {
            phase = index
            paintDots()
        },
        setTicker(text) {
            ticker.setText(text)
        },
        async celebrate(index) {
            phase = index + 1
            paintDots(index)
            await new Promise<void>(res => scene.time.delayedCall(180, () => res()))
            paintDots()
        },
        setHelpEnabled(on) {
            helpOn = on
            zone.input!.enabled = on
            paintHelp()
            helpMark.setAlpha(on ? 1 : 0.35)
        },
        setShown(on) {
            container.setVisible(on)
            zone.input!.enabled = on && helpOn
        },
        destroy() {
            zone.destroy()
            container.destroy()
        },
    }
}

export const FRAME_RECT = new Phaser.Geom.Rectangle(0, 0, W, H)
