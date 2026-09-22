import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, HUD } from '../data/layout'

export interface Hud {
    setProgress(done: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    destroy(): void
}

/** Sem texto fixo além do `?`: as bolinhas dizem onde a criança está. */
export function createHud(
    scene: Phaser.Scene,
    opts: { sites: number; onHelp: () => void },
): Hud {
    const dots = scene.add.graphics().setDepth(DEPTH.hud)
    let done = 0

    const paint = () => {
        dots.clear()
        for (let i = 0; i < opts.sites; i++) {
            const x = HUD.dotsX + i * HUD.dotGap
            const filled = i < done
            dots.fillStyle(filled ? C.green : C.white, filled ? 1 : 0.7)
            dots.fillCircle(x, HUD.dotsY, HUD.dotR)
            dots.lineStyle(3, filled ? C.greenDark : C.line, filled ? 1 : 0.5)
            dots.strokeCircle(x, HUD.dotsY, HUD.dotR)
        }
    }
    paint()

    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.white, 0.94)
    helpArt.fillCircle(0, 0, HUD.helpR)
    helpArt.lineStyle(5, C.line, 1)
    helpArt.strokeCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: '34px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)

    const zone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })
    zone.on('pointerdown', () => {
        void FX.press(scene, help)
        opts.onHelp()
    })

    return {
        setProgress(n) {
            done = n
            paint()
        },
        async celebrate(index) {
            done = index + 1
            paint()
            await FX.ping(scene, HUD.dotsX + index * HUD.dotGap, HUD.dotsY, C.green, {
                radius: 30,
                duration: 420,
                depth: DEPTH.hud,
            })
        },
        setHelpEnabled(on) {
            if (zone.input) zone.input.enabled = on
            help.setAlpha(on ? 1 : 0.4)
        },
        destroy() {
            zone.destroy()
            help.destroy()
            dots.destroy()
        },
    }
}
