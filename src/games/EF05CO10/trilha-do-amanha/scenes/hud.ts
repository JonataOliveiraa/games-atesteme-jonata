import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface HudOptions {
    level: number
    totalLevels: number
    totalFases: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud).setScrollFactor(0)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.2)
    bar.fillRect(0, HUD.h, W, 7)
    bar.fillStyle(C.warnDark, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.card, 1)
    bar.fillRect(0, 0, W, HUD.h - 5)
    bar.fillStyle(C.white, 0.72)
    bar.fillRect(0, 0, W, 13)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.warnDark, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.warn, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 13, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.32)
    pill.fillRoundedRect(HUD.pillX + 13, HUD.pillY + 9, HUD.pillW - 26, 8, 4)

    const levelLabel =
        options.totalLevels > 1
            ? `NÍVEL ${options.level} de ${options.totalLevels}`
            : `NÍVEL ${options.level}`

    const levelText = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, levelLabel, {
            fontFamily: FONT.black,
            fontSize: '19px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    levelText.setStroke(CSS.ink, 5)

    const dots = scene.add.graphics()
    let done = 0
    let current = 0

    const paintDots = () => {
        dots.clear()
        for (let i = 0; i < options.totalFases; i++) {
            const x = HUD.dotsX + i * HUD.dotGap
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(x, HUD.cy, HUD.dotR + 3)
            const filled = i < done
            dots.fillStyle(filled ? C.ok : C.cardDeep, 1)
            dots.fillCircle(x, HUD.cy, HUD.dotR)
            if (i === current && !filled) {
                dots.lineStyle(4, C.warn, 1)
                dots.strokeCircle(x, HUD.cy, HUD.dotR + 5)
            }
            if (filled) {
                dots.fillStyle(C.white, 0.5)
                dots.fillEllipse(x - 2, HUD.cy - 4, HUD.dotR, HUD.dotR * 0.5)
            }
        }
    }
    paintDots()

    const title = scene.add
        .text(HUD.titleX, HUD.cy, '', {
            fontFamily: FONT.black,
            fontSize: '25px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: HUD.titleW },
        })
        .setOrigin(0.5)
        .setResolution(2)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.24)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.cardDeep, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.white, 0.7)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    helpG.lineStyle(5, C.warnDark, 1)
    helpG.strokeCircle(0, 0, HUD.helpR)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)

    root.add([bar, pill, levelText, dots, title, helpG, helpText])

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on(
        'pointerdown',
        (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event?.stopPropagation?.()
            if (!enabled) return
            void FX.press(scene, helpG)
            options.onHelp()
        },
    )

    const guide = scene.add.graphics().setDepth(DEPTH.guide).setScrollFactor(0).setVisible(false)
    let guideDir = 0

    const paintGuide = (dir: number) => {
        guide.clear()
        if (!dir) {
            guide.setVisible(false)
            return
        }
        const x = dir > 0 ? W - 54 : 54
        const y = 300
        guide.fillStyle(C.ink, 0.3)
        guide.fillTriangle(x + dir * 28, y + 4, x - dir * 20, y - 34, x - dir * 20, y + 42)
        guide.fillStyle(C.warn, 0.95)
        guide.fillTriangle(x + dir * 26, y, x - dir * 20, y - 36, x - dir * 20, y + 36)
        guide.fillStyle(C.white, 0.75)
        guide.fillTriangle(x + dir * 6, y, x - dir * 16, y - 20, x - dir * 16, y + 20)
        guide.setVisible(true)
    }

    return {
        setTitle(text: string) {
            title.setText(text)
        },

        setGuide(dir: number) {
            if (guideDir === dir) return
            guideDir = dir
            paintGuide(dir)
            if (!dir) {
                scene.tweens.killTweensOf(guide)
                return
            }
            guide.setAlpha(0.3)
            scene.tweens.add({
                targets: guide,
                alpha: 1,
                duration: FX.ms(scene, 620),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        guideBounds() {
            return { x: guideDir > 0 ? W - 54 : 54, y: 300, w: 120, h: 120 }
        },

        setProgress(completed: number, at: number) {
            done = completed
            current = at
            paintDots()
        },

        celebrateDot(index: number) {
            const mark = scene.add
                .circle(HUD.dotsX + index * HUD.dotGap, HUD.cy, HUD.dotR + 4, C.ok, 0.7)
                .setDepth(DEPTH.hud + 2)
                .setScrollFactor(0)
            scene.tweens.add({
                targets: mark,
                scale: 2.4,
                alpha: 0,
                duration: FX.ms(scene, 520),
                ease: 'Cubic.easeOut',
                onComplete: () => mark.destroy(),
            })
        },

        helpBounds() {
            return { x: HUD.helpX, y: HUD.cy, w: HUD.helpR * 2 + 22, h: HUD.helpR * 2 + 22 }
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        /** Some inteiro enquanto a câmera se mexe: com zoom, o que é fixo na tela cresce junto. */
        setVisible(value: boolean) {
            root.setVisible(value)
            if (zone.input) zone.input.enabled = value && enabled
            if (!value) {
                guideDir = 0
                scene.tweens.killTweensOf(guide)
                guide.setVisible(false)
            }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(guide)
            guide.destroy()
            root.destroy(true)
            zone.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
