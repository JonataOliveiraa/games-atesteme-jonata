import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey, STAMP, STAMP_SHEET, UI, UI_SHEET } from '../data/files'
import { BOOTH, DEPTH, NOTE, RIM, STAMP_BUTTON } from '../data/layout'
import type { MapDef } from '../data/maps'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FIELD, STAMP_LABEL } from '../data/words'
import type { Note } from '../types'
import { fade, fit, fitRimmed, pin, shadowOf, sizeIn } from './art'
import { createPill, type Rect } from './board'

export interface StampDesk {
    setNote(note: Note | null): Promise<void>
    /** o CARIMBAR foi apertado (alterna: apertar de novo cancela) */
    onToggle(cb: (armed: boolean) => void): void
    readonly armed: boolean
    disarm(): void
    setEnabled(on: boolean): void
    /** de onde a ferramenta sai, em coordenadas de TELA (o botão) */
    origin(): { x: number; y: number }
    /** no mundo */
    noteRect(): Rect
    /** na tela */
    buttonRect(): Rect
    /** o botão afunda sozinho (demo do tutorial) */
    press(): Promise<void>
    /** o botão some enquanto a criança arrasta o pátio; o recado fica, ele é do mundo */
    setShown(on: boolean): void
    destroy(): void
}

const OFF_ALPHA = 0.55
const ARMED_TINT = 0xc9c0dc
const SINK = 5
const PILL_W = 110
const PILL_H = 46
const ARROW_W = 34
const GAP = 12

export function createStampDesk(scene: Phaser.Scene, map: MapDef): StampDesk {
    let enabled = false
    let armed = false
    let toggled: (armed: boolean) => void = () => {}
    const spot = map.note ?? { x: 0, y: 0 }

    const booth = map.booth
        ? fit(scene, STAMP_SHEET, STAMP.booth, BOOTH.size).setPosition(map.booth.x, map.booth.y).setDepth(DEPTH.lever)
        : null
    const boothShadow = booth ? shadowOf(scene, booth).setDepth(DEPTH.shadow) : null

    const paper = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI.note)).setDisplaySize(NOTE.w, NOTE.h)
    const name = scene.add
        .text(0, -NOTE.h * 0.2, '', { fontFamily: FONT.black, fontSize: `${SIZE.noteName}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const pill = createPill(scene, FIELD.to, PILL_W, PILL_H)
    const arrow = scene.add.graphics()
    arrow.fillStyle(C.ink, 1)
    arrow.fillRoundedRect(0, -4, ARROW_W - 10, 8, 4)
    arrow.fillTriangle(ARROW_W - 14, -12, ARROW_W, 0, ARROW_W - 14, 12)
    const value = scene.add
        .text(0, 2, '', { fontFamily: FONT.black, fontSize: `${SIZE.noteValue}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const row = scene.add.container(0, NOTE.h * 0.18, [pill.container, arrow, value])
    const note = scene.add.container(spot.x, spot.y, [shadowOf(scene, paper), paper, name, row]).setDepth(DEPTH.plaque).setVisible(false)

    const write = (n: Note) => {
        name.setText(n.name).setScale(1)
        const nameRoom = NOTE.w - 40
        if (name.width > nameRoom) name.setScale(nameRoom / name.width)
        pill.setText(FIELD[n.field])
        value.setText(n.value).setScale(1)
        const room = NOTE.w - 36 - PILL_W - ARROW_W - GAP * 2
        if (value.width > room) value.setScale(room / value.width)
        const total = PILL_W + GAP + ARROW_W + GAP + value.displayWidth
        const left = -total / 2
        pill.container.setX(left + PILL_W / 2)
        arrow.setX(left + PILL_W + GAP)
        value.setX(left + PILL_W + GAP + ARROW_W + GAP)
    }

    const face = fitRimmed(scene, STAMP_SHEET, STAMP.button, sizeIn(scene, STAMP_SHEET, STAMP.button, STAMP_BUTTON.w, STAMP_BUTTON.h), RIM)
    const label = scene.add
        .text(0, -3, STAMP_LABEL, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.go}px`,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setResolution(2)
    const labelRoom = face.displayWidth * 0.8
    if (label.width > labelRoom) label.setScale(labelRoom / label.width)
    const button = scene.add.container(0, 0, [shadowOf(scene, face), face, label]).setAlpha(OFF_ALPHA)
    /** o some/volta do arrastar mexe só aqui; o alpha do `button` diz se ele está ligado */
    const holder = pin(scene.add.container(STAMP_BUTTON.x, STAMP_BUTTON.y, [button]).setDepth(DEPTH.board))
    const zone = scene.add
        .zone(STAMP_BUTTON.x, STAMP_BUTTON.y, STAMP_BUTTON.w + 20, STAMP_BUTTON.h + 20)
        .setDepth(DEPTH.board + 1)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })

    const paint = () => {
        scene.tweens.killTweensOf(button)
        button.setScale(armed ? 0.95 : 1).setY(armed ? SINK : 0)
        if (armed) face.setTint(ARMED_TINT)
        else face.clearTint()
        label.setAlpha(armed ? 0.85 : 1)
    }

    const toggle = () => {
        if (!enabled) return
        armed = !armed
        paint()
        toggled(armed)
    }

    zone.on('pointerdown', toggle)
    const onKey = (e: KeyboardEvent) => {
        if (e.code === 'KeyC') toggle()
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        async setNote(next) {
            scene.tweens.killTweensOf(note)
            if (note.visible) {
                await FX.to(scene, note, { scale: 0.6, alpha: 0 }, { duration: 180, ease: 'Sine.easeIn' })
                note.setScale(1).setAlpha(1)
            }
            if (!next) {
                note.setVisible(false)
                return
            }
            write(next)
            note.setVisible(true)
            await FX.popIn(scene, note, { from: 0.4, duration: 380 })
        },
        onToggle(cb) {
            toggled = cb
        },
        get armed() {
            return armed
        },
        disarm() {
            if (!armed) return
            armed = false
            paint()
        },
        setEnabled(on) {
            enabled = on
            button.setAlpha(on ? 1 : OFF_ALPHA)
        },
        origin() {
            return { x: STAMP_BUTTON.x, y: STAMP_BUTTON.y - STAMP_BUTTON.h / 2 }
        },
        noteRect() {
            return { x: spot.x, y: spot.y, w: NOTE.w + 20, h: NOTE.h + 20 }
        },
        buttonRect() {
            return { x: STAMP_BUTTON.x, y: STAMP_BUTTON.y, w: STAMP_BUTTON.w, h: STAMP_BUTTON.h }
        },
        async press() {
            scene.tweens.killTweensOf(button)
            await FX.to(scene, button, { scale: 0.92, y: SINK }, { duration: 110, yoyo: true, ease: 'Sine.easeOut' })
            paint()
        },
        setShown(on) {
            fade(scene, holder, on ? 1 : 0)
            if (zone.input) zone.input.enabled = on
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            scene.tweens.killTweensOf([button, holder, note])
            zone.destroy()
            holder.destroy()
            note.destroy()
            booth?.destroy()
            boothShadow?.destroy()
        },
    }
}
