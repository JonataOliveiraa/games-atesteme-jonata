import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface HudOptions {
    level: number
    totalLevels: number
    onHelp: () => void
}

/**
 * Uma barra fina, e só.
 *
 * O progresso NÃO mora aqui: mora na prateleira, em forma de máquina ligada.
 * O que sobrou para o cabeçalho é o que a plataforma precisa (nível, `?`) e
 * uma linha de recado que muda quando a criança faz alguma coisa.
 */
export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.3)
    bar.fillRect(0, HUD.h, W, 9)
    bar.fillStyle(C.doorDeep, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.cream, 1)
    bar.fillRect(0, 0, W, HUD.h - 5)
    bar.fillStyle(C.white, 0.7)
    bar.fillRect(0, 0, W, 14)
    bar.fillStyle(C.hard, 1)
    bar.fillRect(0, HUD.h - 5, W, 5)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.hardDark, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.hard, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 14, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.34)
    pill.fillRoundedRect(HUD.pillX + 14, HUD.pillY + 9, HUD.pillW - 28, 10, 5)

    const level = scene.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1,
        `NÍVEL ${options.level} de ${options.totalLevels}`, {
            fontFamily: FONT.black,
            fontSize: '19px',
            color: CSS.white,
        }).setOrigin(0.5).setResolution(2)
    level.setStroke(CSS.ink, 5)

    const title = scene.add.text(HUD.titleX, HUD.titleY, '', {
        fontFamily: FONT.black,
        fontSize: '25px',
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: HUD.titleW },
    }).setOrigin(0.5).setResolution(2)

    const hint = scene.add.text(HUD.titleX, HUD.hintY, '', {
        fontFamily: FONT.body,
        fontStyle: 'bold',
        fontSize: '19px',
        color: CSS.inkSoft,
        align: 'center',
        wordWrap: { width: HUD.hintW },
    }).setOrigin(0.5).setResolution(2)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.24)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.creamDeep, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.white, 0.7)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    helpG.lineStyle(5, C.doorDark, 1)
    helpG.strokeCircle(0, 0, HUD.helpR)

    const helpText = scene.add.text(HUD.helpX, HUD.cy + 1, '?', {
        fontFamily: FONT.black,
        fontSize: '27px',
        color: CSS.ink,
    }).setOrigin(0.5).setResolution(2)

    root.add([bar, pill, level, title, hint, helpG, helpText])

    const zone = scene.add.zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        void FX.press(scene, helpG)
        options.onHelp()
    })

    const edge = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)

    let calm = ''

    return {
        setTitle(text: string) {
            title.setText(text)
        },

        setHint(text: string) {
            calm = text
            hint.setColor(CSS.inkSoft).setText(text)
        },

        /** Recado passageiro. Ele volta sozinho para o texto calmo. */
        say(text: string, color = CSS.inkSoft) {
            hint.setColor(color).setText(text)
            scene.tweens.add({
                targets: hint,
                scale: 1.08,
                duration: FX.ms(scene, 150),
                yoyo: true,
                ease: 'Sine.easeOut',
            })
            scene.time.delayedCall(FX.ms(scene, 2200), () => {
                if (hint.text !== text) return
                hint.setColor(CSS.inkSoft).setText(calm)
            })
        },

        alert(text: string) {
            this.say(text, CSS.warn)
        },

        flash(color: number) {
            edge.clear()
            edge.lineStyle(20, color, 1)
            edge.strokeRoundedRect(10, 10, W - 20, H - 20, 28)
            edge.setAlpha(0.85)
            scene.tweens.add({
                targets: edge,
                alpha: 0,
                duration: FX.ms(scene, 520),
                ease: 'Cubic.easeOut',
            })
        },

        helpBounds() {
            return { x: HUD.helpX, y: HUD.cy, w: HUD.helpR * 2 + 16, h: HUD.helpR * 2 + 16 }
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(hint)
            root.destroy(true)
            zone.destroy()
            edge.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
