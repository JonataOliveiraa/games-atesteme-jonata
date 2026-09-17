import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface HudOptions {
    level: number
    goal: string
    phases: number
    onHelp: () => void
}

/** Pílula do NÍVEL e bolinhas de FASE à esquerda, o que fazer no meio, vidas e `?` à direita. */
export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud).setScrollFactor(0)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.inkSoft, 1)
    bar.fillRect(0, 0, W, HUD.h - 6)
    bar.fillStyle(C.white, 0.07)
    bar.fillRect(0, 0, W, 16)
    bar.fillStyle(C.amber, 1)
    bar.fillRect(0, HUD.h - 6, W, 4)
    root.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.blueDeep, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.blue, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 13, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.3)
    pill.fillRoundedRect(HUD.pillX + 13, HUD.pillY + 8, HUD.pillW - 26, 8, 4)
    root.add(pill)

    const levelText = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black,
            fontSize: '18px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    levelText.setStroke(CSS.ink, 5)
    root.add(levelText)

    const dotX = (i: number) => HUD.dotX + i * HUD.dotGap

    const dots = scene.add.graphics()
    const paintDots = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.phases; i++) {
            const x = dotX(i)
            const full = i < done
            dots.fillStyle(C.ink, full ? 1 : 0.4)
            dots.fillCircle(x, HUD.cy, HUD.dotR + 3)
            dots.fillStyle(full ? C.green : C.rail, 1)
            dots.fillCircle(x, HUD.cy, HUD.dotR)
            if (!full) continue
            dots.fillStyle(C.white, 0.85)
            dots.fillCircle(x, HUD.cy, 5)
        }
    }
    paintDots(0)
    root.add(dots)

    const title = scene.add
        .text(HUD.titleX, HUD.cy, options.goal, {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: CSS.city,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    title.setStroke(CSS.ink, 5)
    root.add(title)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.35)
    helpG.fillCircle(2, 6, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.city, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    root.add(helpG)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '29px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpText)

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 2)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, helpG)
        options.onHelp()
    })

    return {
        dotPoint(index: number) {
            return { x: dotX(index), y: HUD.cy }
        },

        async celebrate(index: number) {
            paintDots(index + 1)
            await FX.ping(scene, dotX(index), HUD.cy, C.green, { radius: 34, depth: DEPTH.hud + 3 })
        },

        setGoal(text: string) {
            title.setText(text)
        },

        /** Some inteiro na partida: cena focada não tem interface por cima. */
        async setShown(value: boolean) {
            zone.setVisible(value)
            await FX.to(scene, root, { alpha: value ? 1 : 0 }, { duration: 260 })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        destroy() {
            FX.kill(scene, root)
            zone.destroy()
            root.destroy(true)
        },
    }
}

export type Hud = ReturnType<typeof createHud>
