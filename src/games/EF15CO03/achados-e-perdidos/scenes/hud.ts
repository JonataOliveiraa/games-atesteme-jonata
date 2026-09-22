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

/**
 * Não existe texto fixo na tela além do `?`. Sem pílula de nível, sem rótulo
 * de fase, sem relógio: as bolinhas dizem onde ela está.
 */
export function createHud(
    scene: Phaser.Scene,
    opts: { cases: number; onHelp: () => void },
): Hud {
    const dots = scene.add.graphics().setDepth(DEPTH.hud)
    const dotHolders: Phaser.GameObjects.Container[] = []
    let done = 0

    const paintDots = () => {
        dots.clear()
        for (let i = 0; i < opts.cases; i++) {
            const x = HUD.dotsX + i * HUD.dotGap
            const filled = i < done
            dots.fillStyle(filled ? C.coral : C.white, filled ? 1 : 0.7)
            dots.fillCircle(x, HUD.dotsY, HUD.dotR)
            dots.lineStyle(3, filled ? C.coralDark : C.inkSoft, filled ? 1 : 0.5)
            dots.strokeCircle(x, HUD.dotsY, HUD.dotR)
        }
    }
    paintDots()

    for (let i = 0; i < opts.cases; i++) {
        dotHolders.push(scene.add.container(HUD.dotsX + i * HUD.dotGap, HUD.dotsY).setDepth(DEPTH.hud))
    }

    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.white, 0.92)
    helpArt.fillCircle(0, 0, HUD.helpR)
    helpArt.lineStyle(5, C.line, 1)
    helpArt.strokeCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: '34px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)

    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })
    helpZone.on('pointerdown', () => {
        void FX.press(scene, help)
        opts.onHelp()
    })

    return {
        setProgress(n) {
            done = n
            paintDots()
        },

        async celebrate(index) {
            done = index + 1
            paintDots()
            const holder = dotHolders[index]
            if (!holder) return
            await FX.ping(scene, holder.x, holder.y, C.coral, { radius: 34, duration: 420, depth: DEPTH.hud })
        },

        setHelpEnabled(on) {
            if (helpZone.input) helpZone.input.enabled = on
            help.setAlpha(on ? 1 : 0.4)
        },

        destroy() {
            helpZone.destroy()
            help.destroy()
            dotHolders.forEach(d => d.destroy())
            dots.destroy()
        },
    }
}
