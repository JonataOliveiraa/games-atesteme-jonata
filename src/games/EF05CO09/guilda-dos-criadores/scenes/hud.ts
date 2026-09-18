import Phaser from 'phaser'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Hud {
    container: Phaser.GameObjects.Container
    setPhase(index: number): void
    setPrompt(text: string): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    destroy(): void
}

/**
 * O cabeçalho de ponta a ponta, com TRÊS BLOCOS que não se sobrepõem: à
 * esquerda o nível e as bolinhas, à direita as vidas e o `?`, no meio o
 * enunciado — com largura PRÓPRIA (`midW`), nunca "a tela toda".
 */
export function createHud(
    scene: Phaser.Scene,
    opts: { level: number; phases: number; onHelp: () => void },
): Hud {
    const container = scene.add.container(0, 0).setDepth(DEPTH.hud)
    const g = scene.add.graphics()
    container.add(g)

    g.fillStyle(C.header, 1)
    g.fillRect(0, 0, W, HUD.h)
    g.fillStyle(C.gold, 1)
    g.fillRect(0, HUD.h, W, HUD.accent)
    g.fillStyle(C.shadow, 0.16)
    g.fillRect(0, HUD.h + HUD.accent, W, 8)

    container.add(
        scene.add
            .text(HUD.levelX, HUD.levelY, `NÍVEL ${opts.level}`, {
                fontFamily: FONT, fontSize: `${SIZE.hudLevel}px`, color: CSS.cream,
            })
            .setOrigin(0, 0.5)
            .setResolution(2),
    )

    const dots = scene.add.graphics()
    container.add(dots)
    let phase = 0

    const paintDots = (pulse = -1) => {
        dots.clear()
        for (let i = 0; i < opts.phases; i++) {
            const x = HUD.levelX + 9 + i * HUD.dotGap
            const done = i < phase
            dots.fillStyle(done ? C.gold : C.cream, done ? 1 : 0.3)
            dots.fillCircle(x, HUD.dotsY, i === pulse ? HUD.dotR + 3 : HUD.dotR)
        }
    }
    paintDots()

    const prompt = scene.add
        .text(HUD.midX + HUD.midW / 2, HUD.h / 2, '', {
            fontFamily: FONT,
            fontSize: `${SIZE.prompt}px`,
            color: CSS.cream,
            align: 'center',
            wordWrap: { width: HUD.midW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    container.add(prompt)

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
            fontFamily: FONT, fontSize: '30px', color: CSS.header,
        })
        .setOrigin(0.5)
        .setResolution(2)
    container.add(helpMark)

    const zone = scene.add
        .zone(HUD.helpCx, HUD.helpCy, HUD.helpR * 2 + 16, HUD.helpR * 2 + 16)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })
    zone.on('pointerdown', () => { if (helpOn) opts.onHelp() })

    return {
        container,

        setPhase(index) {
            phase = index
            paintDots()
        },

        setPrompt(text) {
            prompt.setText(text)
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

        destroy() {
            zone.destroy()
            container.destroy()
        },
    }
}
