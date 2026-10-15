import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE, PIECE_SHEET } from '../data/files'
import { CAR } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { WAIT } from '../data/words'
import { fit, refit } from './art'

export interface Car {
    place(x: number, y: number, angle: number): void
    setBrake(on: boolean): void
    setFlow(n: number): void
    emerge(x: number, y: number, angle: number): Promise<void>
    dock(x: number, y: number): Promise<void>
    hide(): void
    /** o balãozinho "1 ou 0?" enquanto o carrinho espera no portal */
    ask(on: boolean): void
    destroy(): void
}

/** o carrinho visto de lado, dentro do tubo; a chaminha aparece no embalo */
export function createCar(scene: Phaser.Scene, layer: Phaser.GameObjects.Container): Car {
    const body = fit(scene, PIECE_SHEET, PIECE.car, CAR.size)
    const base = body.scale
    const flame = fit(scene, PIECE_SHEET, PIECE.flame, 48).setOrigin(1, 0.5).setAlpha(0)
    flame.setPosition(-body.displayWidth / 2 + 6, 2)
    const flameBase = flame.scale
    const box = scene.add.container(0, 0, [flame, body]).setVisible(false)
    layer.add(box)
    const askText = scene.add
        .text(0, -4, WAIT, { fontFamily: FONT.black, fontSize: '26px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const askW = askText.width + 28
    const askArt = scene.add.graphics()
    askArt.fillStyle(C.white, 1)
    askArt.fillRoundedRect(-askW / 2, -26, askW, 44, 18)
    askArt.fillTriangle(-10, 16, 10, 16, 0, 30)
    askArt.lineStyle(3, C.ink, 1)
    askArt.strokeRoundedRect(-askW / 2, -26, askW, 44, 18)
    const bubble = scene.add.container(0, 0, [askArt, askText]).setVisible(false)
    layer.add(bubble)
    let braking = false
    let flow = 0

    const frame = (on: boolean) => {
        refit(body, on ? PIECE.brake : PIECE.car, CAR.size)
        body.setScale(base)
    }

    return {
        place(x, y, angle) {
            box.setPosition(x, y).setRotation(angle)
            bubble.setPosition(x, y - 62)
        },
        setBrake(on) {
            if (on === braking) return
            braking = on
            frame(on)
        },
        setFlow(n) {
            if (n === flow) return
            flow = n
            scene.tweens.killTweensOf(flame)
            if (n <= 0) {
                void FX.to(scene, flame, { alpha: 0 }, { duration: 180 })
                return
            }
            void FX.to(scene, flame, { alpha: 1, scaleX: flameBase * (0.7 + n * 0.2), scaleY: flameBase * (0.8 + n * 0.08) }, { duration: 200 })
        },
        async emerge(x, y, angle) {
            braking = false
            frame(false)
            flow = 0
            flame.setAlpha(0)
            box.setPosition(x, y).setRotation(angle).setVisible(true).setAlpha(1)
            body.setScale(base * 0.2)
            await FX.to(scene, body, { scale: base }, { duration: 360, ease: 'Back.easeOut' })
        },
        async dock(x, y) {
            this.setFlow(0)
            this.ask(false)
            await FX.all(
                FX.to(scene, box, { x, y }, { duration: 300 }),
                FX.to(scene, body, { scale: base * 0.2 }, { duration: 300 }),
                FX.to(scene, box, { alpha: 0 }, { duration: 220, delay: 100 }),
            )
            box.setVisible(false)
            body.setScale(base)
        },
        hide() {
            box.setVisible(false)
            bubble.setVisible(false)
        },
        ask(on) {
            if (on === bubble.visible) return
            scene.tweens.killTweensOf(bubble)
            if (!on) {
                bubble.setVisible(false)
                return
            }
            bubble.setVisible(true).setScale(1)
            void FX.popIn(scene, bubble, { from: 0.5, duration: 260 })
        },
        destroy() {
            box.destroy()
            bubble.destroy()
        },
    }
}
