import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { INFO } from '../data/devices'
import { DEPTH, INFO_H, PORCH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { InfoId, InfoPose } from '../types'
import { infoImage, setInfoPose } from './art'

export interface Walker {
    readonly id: InfoId
    readonly x: number
    readonly y: number
    /** anda da borda esquerda até a calçada */
    arrive(ms: number, onStep: (i: number) => void): Promise<void>
    pose(p: InfoPose): void
    /** pula até um ponto (o centro da porta) e encolhe */
    hop(x: number, y: number, ms: number, scale?: number): Promise<void>
    /** some para dentro do que estiver na frente */
    vanish(): Promise<void>
    /** aparece num ponto, no tamanho dado */
    appear(x: number, feet: number, scale: number): Promise<void>
    walkTo(x: number, ms: number): Promise<void>
    /** volta para a calçada depois de bater na porta */
    bounceBack(): Promise<void>
    plate(on: boolean): void
    /** a plaquinha pula para chamar atenção para o tipo */
    callout(): Promise<void>
    /** de onde sai a seta do guia */
    point(): { x: number; y: number }
    rect(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

export function createWalker(scene: Phaser.Scene, id: InfoId): Walker {
    const body = infoImage(scene, id, 'walkA', INFO_H)
    const tag = scene.add.graphics()
    const text = scene.add
        .text(0, PORCH.plateDY, INFO[id].kind, { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const pw = Math.max(110, text.width + 34)
    tag.fillStyle(C.shadow, 0.16)
    tag.fillRoundedRect(-pw / 2 + 3, PORCH.plateDY - 18 + 4, pw, 36, 18)
    tag.fillStyle(C.white, 1)
    tag.fillRoundedRect(-pw / 2, PORCH.plateDY - 18, pw, 36, 18)
    tag.lineStyle(4, C.ink, 1)
    tag.strokeRoundedRect(-pw / 2, PORCH.plateDY - 18, pw, 36, 18)
    const plateBox = scene.add.container(0, 0, [tag, text])
    const box = scene.add.container(PORCH.startX, PORCH.feet, [body, plateBox]).setDepth(DEPTH.info)
    let stepping: Phaser.Time.TimerEvent | undefined

    const walking = (on: boolean, onStep?: (i: number) => void) => {
        stepping?.remove()
        stepping = undefined
        if (!on) return
        let k = 0
        stepping = scene.time.addEvent({
            delay: 170,
            loop: true,
            callback: () => {
                k += 1
                setInfoPose(body, id, k % 2 ? 'walkB' : 'walkA')
                body.setY(k % 2 ? -6 : 0)
                onStep?.(k)
            },
        })
    }

    const walkTo = async (x: number, ms: number, onStep?: (i: number) => void) => {
        walking(true, onStep)
        await FX.to(scene, box, { x }, { duration: ms, ease: 'Sine.easeOut' })
        walking(false)
        setInfoPose(body, id, 'walkA')
        body.setY(0)
    }

    return {
        id,
        get x() {
            return box.x
        },
        get y() {
            return box.y - (INFO_H * box.scale) / 2
        },
        async arrive(ms, onStep) {
            box.setPosition(PORCH.startX, PORCH.feet).setScale(1).setAlpha(1)
            await walkTo(PORCH.x, ms, onStep)
        },
        pose(p) {
            setInfoPose(body, id, p)
        },
        async hop(x, y, ms, scale = 0.7) {
            plateBox.setVisible(false)
            const start = { x: box.x, y: box.y }
            const k = { t: 0 }
            const feet = y + (INFO_H * scale) / 2
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const arc = Math.sin(k.t * Math.PI) * 120
                        box.setPosition(Phaser.Math.Linear(start.x, x, k.t), Phaser.Math.Linear(start.y, feet, k.t) - arc)
                        box.setScale(Phaser.Math.Linear(1, scale, k.t))
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                }),
            )
        },
        async vanish() {
            await FX.to(scene, box, { scale: 0.05, alpha: 0 }, { duration: 260, ease: 'Back.easeIn' })
        },
        async appear(x, feet, scale) {
            plateBox.setVisible(false)
            box.setPosition(x, feet).setScale(0.05).setAlpha(1)
            await FX.to(scene, box, { scale }, { duration: 300, ease: 'Back.easeOut' })
        },
        walkTo: (x, ms) => walkTo(x, ms),
        async bounceBack() {
            setInfoPose(body, id, 'dizzy')
            await FX.to(scene, box, { x: PORCH.x, y: PORCH.feet, scale: 1 }, { duration: 520, ease: 'Bounce.easeOut' })
            plateBox.setVisible(true)
        },
        plate(on) {
            plateBox.setVisible(on)
        },
        async callout() {
            for (let k = 0; k < 2; k++) {
                await FX.to(scene, plateBox, { scale: 1.3 }, { duration: 160, ease: 'Back.easeOut' })
                await FX.to(scene, plateBox, { scale: 1 }, { duration: 160 })
            }
        },
        point() {
            return { x: box.x + 54, y: box.y - INFO_H * 0.75 }
        },
        rect() {
            return { x: box.x, y: box.y - INFO_H / 2 + 14, w: 190, h: INFO_H + 70 }
        },
        destroy() {
            walking(false)
            box.destroy()
        },
    }
}
