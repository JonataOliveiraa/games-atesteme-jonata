import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { WISH } from '../data/devices'
import { DEPTH, PERSON, WISH_BALLOON } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { PersonId, PersonPose, Wish } from '../types'
import { personImage, setPersonPose, wishImage } from './art'

type Rect = { x: number; y: number; w: number; h: number }

export interface PersonView {
    readonly id: PersonId
    /** entra pela direita e mostra o pedido */
    arrive(ms: number, onStep: (i: number) => void): Promise<void>
    pose(p: PersonPose): void
    /** o balão do pedido pula para chamar atenção */
    callout(): Promise<void>
    /** recebe a informação: pula de alegria */
    cheer(): Promise<void>
    leave(): Promise<void>
    /** de onde sai a seta do guia */
    point(): { x: number; y: number }
    rect(): Rect
    wishRect(): Rect
    readonly x: number
    readonly y: number
    destroy(): void
}

export function createPerson(scene: Phaser.Scene, id: PersonId, wish: Wish): PersonView {
    const body = personImage(scene, id, 'wait', PERSON.h).setPosition(PERSON.startX, PERSON.feet).setDepth(DEPTH.info)

    const { w, h, icon, tail } = WISH_BALLOON
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 26)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
    g.fillTriangle(-16, h / 2 - 2, 16, h / 2 - 2, 6, h / 2 + tail)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 26)
    g.lineBetween(-16, h / 2, 6, h / 2 + tail)
    g.lineBetween(16, h / 2, 6, h / 2 + tail)
    g.fillStyle(C.white, 1)
    g.fillRect(-14, h / 2 - 4, 28, 6)
    const pic = wishImage(scene, wish, icon).setPosition(0, -h / 2 + icon / 2 + 10)
    const text = scene.add
        .text(0, h / 2 - 26, WISH[wish].ask, { fontFamily: FONT.black, fontSize: '23px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    if (text.width > w - 20) text.setScale((w - 20) / text.width)
    const balloon = scene.add.container(PERSON.x, WISH_BALLOON.y, [g, pic, text]).setDepth(DEPTH.info + 1).setVisible(false)

    let stepping: Phaser.Time.TimerEvent | undefined
    const walking = (on: boolean, onStep?: (i: number) => void) => {
        stepping?.remove()
        stepping = undefined
        body.setY(PERSON.feet)
        if (!on) return
        let k = 0
        stepping = scene.time.addEvent({
            delay: 170,
            loop: true,
            callback: () => {
                k += 1
                body.setY(PERSON.feet - (k % 2 ? 8 : 0))
                onStep?.(k)
            },
        })
    }

    return {
        id,
        async arrive(ms, onStep) {
            walking(true, onStep)
            await FX.to(scene, body, { x: PERSON.x }, { duration: ms, ease: 'Sine.easeOut' })
            walking(false)
            balloon.setVisible(true).setScale(0.3)
            await FX.to(scene, balloon, { scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },
        pose(p) {
            setPersonPose(body, id, p)
        },
        async callout() {
            for (let k = 0; k < 2; k++) {
                await FX.to(scene, balloon, { scale: 1.12 }, { duration: 160, ease: 'Back.easeOut' })
                await FX.to(scene, balloon, { scale: 1 }, { duration: 160 })
            }
        },
        async cheer() {
            setPersonPose(body, id, 'happy')
            balloon.setVisible(false)
            await FX.to(scene, body, { y: PERSON.feet - 34 }, { duration: 180, ease: 'Sine.easeOut', yoyo: true, repeat: 1 })
            body.setY(PERSON.feet)
        },
        async leave() {
            balloon.setVisible(false)
            walking(true)
            await FX.to(scene, body, { x: PERSON.startX }, { duration: 700, ease: 'Sine.easeIn' })
            walking(false)
        },
        point() {
            return { x: PERSON.x - w / 2 + 6, y: WISH_BALLOON.y }
        },
        rect() {
            return { x: PERSON.x, y: (WISH_BALLOON.y - h / 2 + PERSON.feet) / 2, w: Math.max(w, 200) + 30, h: PERSON.feet - WISH_BALLOON.y + h / 2 + 20 }
        },
        wishRect() {
            return { x: PERSON.x, y: WISH_BALLOON.y, w: w + 24, h: h + 24 }
        },
        get x() {
            return body.x
        },
        get y() {
            return PERSON.feet - PERSON.h * 0.6
        },
        destroy() {
            walking(false)
            balloon.destroy()
            body.destroy()
        },
    }
}
