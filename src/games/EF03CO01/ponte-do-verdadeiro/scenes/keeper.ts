import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, CAST, CASTOR_POSE, PART, PART_CELL, PARTS, anchor } from '../data/files'
import { CASTOR, DEPTH, LEVER } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LEVER_LABEL } from '../data/words'
import type { Rect, Vec } from '../types'

const KNOB = { x: 117, y: 128 }

export interface Lever {
    setEnabled(on: boolean): void
    pull(): void
    reset(): void
    rect(): Rect
    tapPoint(): Vec
    destroy(): void
}

export function createLever(scene: Phaser.Scene, onPull: () => void): Lever {
    const rim = Array.from({ length: LEVER.rimSteps }, (_, k) => {
        const a = (k / LEVER.rimSteps) * Math.PI * 2
        return scene.add
            .image(Math.cos(a) * LEVER.rim, Math.sin(a) * LEVER.rim, PARTS, PART.leverUp)
            .setScale(LEVER.scale)
            .setTintFill(C.white)
    })
    const img = scene.add.image(0, 0, PARTS, PART.leverUp).setScale(LEVER.scale)
    const body = scene.add.container(LEVER.x, LEVER.footY, [...rim, img]).setDepth(DEPTH.lever)
    const place = (frame: number) => {
        ;[...rim, img].forEach(part => {
            part.setFrame(frame)
            part.setOrigin(ART.lever.feet[frame] / PART_CELL, ART.lever.base / PART_CELL)
        })
    }
    place(PART.leverUp)

    const text = scene.add
        .text(0, 1, LEVER_LABEL, { fontFamily: FONT.black, fontSize: `${SIZE.label}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    const w = text.width + 44
    const h = SIZE.label + 20
    const pill = scene.add.graphics()
    const paint = (on: boolean) => {
        pill.clear()
        pill.fillStyle(C.shadow, 0.25)
        pill.fillRoundedRect(-w / 2 + 2, -h / 2 + 5, w, h, h / 2)
        pill.fillStyle(on ? C.pink : C.lavender, 1)
        pill.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        pill.fillStyle(C.white, 0.3)
        pill.fillRoundedRect(-w / 2 + 10, -h / 2 + 5, w - 20, 10, 5)
        pill.lineStyle(4, C.ink, 1)
        pill.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    }
    const label = scene.add.container(LEVER.x, LEVER.labelY, [pill, text]).setDepth(DEPTH.lever + 1)

    const zone = scene.add
        .zone(LEVER.hit.x, LEVER.hit.y, LEVER.hit.w, LEVER.hit.h)
        .setDepth(DEPTH.lever + 5)
        .setInteractive({ useHandCursor: true })
    let on = false
    zone.on('pointerdown', () => {
        if (on) onPull()
    })

    const setEnabled = (value: boolean) => {
        on = value
        if (zone.input) zone.input.enabled = value
        paint(value)
        label.setAlpha(value ? 1 : 0.75)
    }
    setEnabled(false)

    return {
        setEnabled,
        pull() {
            place(PART.leverDown)
            void FX.impact(scene, body, 0.1)
            void FX.press(scene, label)
        },
        reset() {
            scene.tweens.killTweensOf(body)
            body.setScale(1)
            place(PART.leverUp)
        },
        rect: () => ({ x: LEVER.hit.x - 6, y: LEVER.hit.y - 6, w: LEVER.hit.w + 30, h: LEVER.hit.h + 20 }),
        tapPoint: () => ({
            x: LEVER.x + (KNOB.x - ART.lever.feet[0]) * LEVER.scale,
            y: LEVER.footY + (KNOB.y - ART.lever.base) * LEVER.scale + 18,
        }),
        destroy() {
            zone.destroy()
            label.destroy()
            body.destroy()
        },
    }
}

export type CastorPose = keyof typeof CASTOR_POSE

export interface Castor {
    pose(p: CastorPose): void
    rect(): Rect
    top(): Vec
    destroy(): void
}

export function createCastor(scene: Phaser.Scene): Castor {
    const img = scene.add.image(0, 0, CAST, CASTOR_POSE.talk).setScale(CASTOR.scale)
    img.setOrigin(...anchor(CASTOR_POSE.talk))
    const box = scene.add.container(CASTOR.x, CASTOR.footY, [img]).setDepth(DEPTH.castor)
    let current: CastorPose = 'talk'

    return {
        pose(p) {
            if (p === current) return
            current = p
            const f = CASTOR_POSE[p]
            img.setFrame(f)
            img.setOrigin(...anchor(f))
            void FX.impact(scene, box, 0.08)
        },
        rect: () => ({ x: CASTOR.x, y: CASTOR.footY - 78, w: 200, h: 180 }),
        top: () => ({ x: CASTOR.x, y: CASTOR.footY - 150 }),
        destroy() {
            scene.tweens.killTweensOf(box)
            box.destroy()
        },
    }
}
