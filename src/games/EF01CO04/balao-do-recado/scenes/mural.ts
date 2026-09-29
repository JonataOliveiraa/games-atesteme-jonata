import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { EXTRAS, FORM_CELL, MURAL as TEX, PIECE_CELL, PIECES, STAMP_CELL } from '../data/files'
import { BALLOON, DEPTH, MURAL } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Form, Message } from '../types'
import { createPic } from './pic'

export interface Mural {
    drop(): Promise<void>
    pin(index: number, message: Message, form: Form): Promise<void>
    lift(): Promise<void>
    destroy(): void
}

const HIDDEN_Y = -MURAL.h / 2 - 40

function paintBoard(g: Phaser.GameObjects.Graphics) {
    const { w, h } = MURAL
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 12, w, h, 28)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 28)
    g.fillStyle(C.cork, 1)
    g.fillRoundedRect(-w / 2 + 30, -h / 2 + 30, w - 60, h - 60, 16)
    g.lineStyle(3, C.corkDark, 1)
    g.strokeRoundedRect(-w / 2 + 30, -h / 2 + 30, w - 60, h - 60, 16)
}

function makeStamp(scene: Phaser.Scene, form: Form): Phaser.GameObjects.Container {
    const r = MURAL.stamp
    const ring = scene.add.graphics()
    ring.fillStyle(C.cream, 0.9)
    ring.fillCircle(0, 0, r)
    ring.lineStyle(5, C.coralDark, 1)
    ring.strokeCircle(0, 0, r)
    ring.lineStyle(2, C.coralDark, 1)
    ring.strokeCircle(0, 0, r - 7)
    const hasStamp = scene.textures.exists(EXTRAS)
    const icon = createPic(scene, 0, 0, r * (hasStamp ? 1.9 : 1.6), true)
    if (hasStamp) icon.set(EXTRAS, STAMP_CELL[form], form)
    else icon.set(PIECES, FORM_CELL[form], form)
    return scene.add.container(0, 0, [ring, icon.container]).setAngle(-12)
}

export function createMural(scene: Phaser.Scene): Mural {
    const board = scene.textures.exists(TEX)
        ? scene.add.image(0, 0, TEX).setDisplaySize(MURAL.w, (MURAL.w * 600) / 960)
        : (() => {
              const g = scene.add.graphics()
              paintBoard(g)
              return g
          })()
    const container = scene.add.container(MURAL.cx, HIDDEN_Y, [board]).setDepth(DEPTH.mural).setVisible(false)
    const notes = new Map<number, Phaser.GameObjects.Container>()

    const makeNote = (message: Message) => {
        const paper = createPic(scene, 0, 0, MURAL.noteH * 1.26)
        paper.set(PIECES, PIECE_CELL.note, 'note')
        const drawing = createPic(scene, MURAL.noteArtX, -34, MURAL.noteArt)
        drawing.set(PIECES, message.icon, message.id)
        const text = scene.add
            .text(0, 62, message.text, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.note}px`,
                color: CSS.ink,
                align: 'center',
                wordWrap: { width: MURAL.noteW - 50 },
            })
            .setOrigin(0.5)
            .setResolution(2)
        return scene.add.container(0, 0, [paper.container, drawing.container, text])
    }

    return {
        async drop() {
            FX.kill(scene, container)
            container.setVisible(true).setY(HIDDEN_Y)
            await FX.to(scene, container, { y: MURAL.cy }, { duration: MURAL.dropMs, ease: 'Bounce.easeOut' })
        },
        async pin(index, message, form) {
            notes.get(index)?.destroy()
            const note = makeNote(message)
            notes.set(index, note)
            container.add(note)
            const slotX = (MURAL.xs[index] ?? MURAL.xs[0]) - MURAL.cx
            const slotY = MURAL.noteY - MURAL.cy
            note.setPosition(BALLOON.x - MURAL.cx, 300 - MURAL.cy).setScale(0.4).setAngle(-20)
            await FX.to(scene, note, { x: slotX, y: slotY, scale: 1, angle: (index - 1) * 3 }, { duration: 620, ease: 'Back.easeOut' })
            if (!note.active) return
            const stamp = makeStamp(scene, form)
            stamp.setPosition(MURAL.stampX, MURAL.stampY).setScale(2.4).setAlpha(0)
            note.add(stamp)
            await FX.to(scene, stamp, { scale: 1, alpha: 1 }, { duration: 200, ease: 'Quad.easeIn' })
            await FX.impact(scene, note, 0.08)
        },
        async lift() {
            FX.kill(scene, container)
            await FX.to(scene, container, { y: HIDDEN_Y }, { duration: MURAL.dropMs * 0.7, ease: 'Sine.easeIn' })
            if (container.active) container.setVisible(false)
        },
        destroy() {
            FX.kill(scene, container)
            notes.clear()
            container.destroy()
        },
    }
}
