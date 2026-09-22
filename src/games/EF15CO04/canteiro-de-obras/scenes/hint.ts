import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Hint {
    /** Arma a mãozinha: 4 s sem toque e ela bate uma vez no que está pulsando. */
    arm(targets: () => { x: number; y: number }[]): void
    /** Qualquer toque adia a mãozinha. */
    poke(): void
    stop(): void
    destroy(): void
}

const IDLE = 4000

export function createHint(scene: Phaser.Scene): Hint {
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.2)
    g.fillEllipse(4, 40, 54, 16)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-22, -10, 44, 54, 18)
    g.fillRoundedRect(-8, -46, 20, 44, 10)
    g.lineStyle(5, C.line, 1)
    g.strokeRoundedRect(-22, -10, 44, 54, 18)
    g.strokeRoundedRect(-8, -46, 20, 44, 10)

    const hand = scene.add.container(0, 0, [g]).setDepth(DEPTH.hint).setAlpha(0)

    let timer: Phaser.Time.TimerEvent | undefined
    let getTargets: (() => { x: number; y: number }[]) | undefined
    let showing = false

    const hide = () => {
        if (!showing) return
        showing = false
        FX.kill(scene, fx(hand))
        void FX.to(scene, fx(hand), { alpha: 0 }, { duration: 160 })
    }

    const show = async () => {
        const list = getTargets?.() ?? []
        if (!list.length) return
        const spot = list[Math.floor(Math.random() * list.length)]
        showing = true
        hand.setPosition(spot.x + 26, spot.y + 40).setAlpha(0).setScale(1)
        await FX.to(scene, fx(hand), { alpha: 1 }, { duration: 200 })
        await FX.to(scene, fx(hand), { y: spot.y + 16, scale: 0.9 }, { duration: 220, yoyo: true, repeat: 1 })
        await FX.wait(scene, 300)
        hide()
    }

    const start = () => {
        timer?.remove()
        timer = scene.time.addEvent({
            delay: IDLE,
            loop: true,
            callback: () => {
                if (!showing) void show()
            },
        })
    }

    return {
        arm(targets) {
            getTargets = targets
            hide()
            start()
        },
        poke() {
            hide()
            if (timer) start()
        },
        stop() {
            hide()
            timer?.remove()
            timer = undefined
            getTargets = undefined
        },
        destroy() {
            timer?.remove()
            hand.destroy()
        },
    }
}
