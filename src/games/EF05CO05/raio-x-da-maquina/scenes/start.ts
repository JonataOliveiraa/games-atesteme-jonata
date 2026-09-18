import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, W, XRAY } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

const BTN = {
    cx: W / 2,
    cy: XRAY.y + XRAY.h / 2,
    h: 110,
    minW: 380,
    radius: 28,
} as const

export interface StartGate {
    /**
     * Mostra o botão e só volta quando a criança toca nele.
     *
     * É a pausa entre a fala da máquina e o desafio: sem ela o palco abre por
     * cima do balão e a frase some antes de ser lida.
     */
    ask(label: string): Promise<void>
    destroy(): void
}

export interface StartOptions {
    onTap(): void
}

export function createStart(scene: Phaser.Scene, options: StartOptions): StartGate {
    const root = scene.add
        .container(BTN.cx, BTN.cy)
        .setDepth(DEPTH.sign)
        .setAlpha(0)
        .setVisible(false)

    const plate = scene.add.graphics()
    root.add(plate)

    const label = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '46px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(label)

    const play = scene.add.graphics()
    root.add(play)

    const zone = scene.add
        .zone(BTN.cx, BTN.cy, BTN.minW, BTN.h)
        .setOrigin(0.5)
        .setDepth(DEPTH.sign + 1)
        .setInteractive({ useHandCursor: true })
    if (zone.input) zone.input.enabled = false

    let pending: (() => void) | undefined
    let pulse: Phaser.Tweens.Tween | undefined

    function paint(text: string) {
        label.setText(text)
        const w = Math.max(BTN.minW, label.width + 190)

        plate.clear()
        plate.fillStyle(C.shadow, 0.4)
        plate.fillRoundedRect(-w / 2, -BTN.h / 2 + 10, w, BTN.h, BTN.radius)
        plate.fillStyle(C.ink, 1)
        plate.fillRoundedRect(-w / 2, -BTN.h / 2 + 5, w, BTN.h, BTN.radius)
        plate.fillStyle(C.cyan, 1)
        plate.fillRoundedRect(-w / 2, -BTN.h / 2, w, BTN.h, BTN.radius)
        plate.fillStyle(C.white, 0.28)
        plate.fillRoundedRect(-w / 2 + 8, -BTN.h / 2 + 6, w - 16, BTN.h * 0.3, BTN.radius - 8)

        const tipX = -w / 2 + 84
        label.setX(28)
        play.clear()
        play.fillStyle(C.ink, 1)
        play.fillTriangle(tipX - 24, -26, tipX - 24, 26, tipX + 22, 0)

        zone.setSize(w + 40, BTN.h + 40)
        return w
    }

    function close(done: () => void) {
        void (async () => {
            await FX.press(scene, root)
            await FX.to(scene, root, { alpha: 0 }, { duration: 170 })
            root.setVisible(false)
            done()
        })()
    }

    zone.on('pointerdown', () => {
        if (!pending) return
        const done = pending
        pending = undefined
        if (zone.input) zone.input.enabled = false
        pulse?.remove()
        pulse = undefined
        options.onTap()
        close(done)
    })

    return {
        ask: text =>
            new Promise<void>(resolve => {
                pending = resolve
                paint(text)
                root.setVisible(true).setAlpha(0).setScale(0.82)
                if (zone.input) zone.input.enabled = true
                void (async () => {
                    await FX.popIn(scene, fx(root), { from: 0.82, duration: 300 })
                    if (!pending) return
                    pulse = scene.tweens.add({
                        targets: root,
                        scale: 1.06,
                        duration: 780,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                    })
                })()
            }),

        destroy: () => {
            pulse?.remove()
            pulse = undefined
            const done = pending
            pending = undefined
            FX.kill(scene, fx(root))
            zone.destroy()
            root.destroy(true)
            done?.()
        },
    }
}
