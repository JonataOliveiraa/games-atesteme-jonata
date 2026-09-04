import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUTTON, DEPTH, DISPLAY, MACHINE, READER, TRAY } from '../data/layout'
import { C } from '../data/theme'
import type { Goal, LabItem, Slot } from '../types'
import { createItemIcon, type ItemIcon } from './itemIcon'
import { drawGoal, drawHandTouch, drawOrder } from './glyphs'

export const CHASSI_SHEET = 'chassi'
export const CHASSI_COLUMNS = 2
export const CHASSI_ROWS = 2

export const UI_SHEET = 'ui'
export const UI_COLUMNS = 4
export const UI_ROWS = 3

/** Quadros de `ui.png`, na ordem da folha. */
export const UI = {
    trayEmpty: 0, trayFull: 1, trayRefuse: 2,
    readerEmpty: 3, readerFull: 4, readerRefuse: 5,
    buttonOff: 6, buttonOn: 7, buttonDown: 8,
    bezel: 9,
    nicheEmpty: 10, nicheFull: 11,
}

export type BodyState = 'off' | 'idle' | 'work' | 'wrong'
export type SlotState = 'empty' | 'loaded' | 'refuse'

const BODY_FRAME: Record<BodyState, number> = { off: 0, idle: 1, work: 2, wrong: 3 }

const hasFrame = (scene: Phaser.Scene, key: string, frame: number) =>
    scene.textures.exists(key) && scene.textures.get(key).has(String(frame))

/* ─────────────────────────────────────────── desenhos de reserva ── */

function drawBody(g: Phaser.GameObjects.Graphics, s: number, state: BodyState) {
    const u = s / 400
    const lamp = state === 'work' ? C.ok : state === 'wrong' ? C.warn
        : state === 'idle' ? C.light : C.steelDark
    const skin = state === 'off' ? 0xa9bbcd : C.steel

    g.clear()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-176 * u, -160 * u, 352 * u, 356 * u, 44 * u)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-176 * u, -176 * u, 352 * u, 356 * u, 44 * u)
    g.fillStyle(C.steelDark, 1)
    g.fillRoundedRect(-168 * u, -168 * u, 336 * u, 340 * u, 38 * u)
    g.fillStyle(skin, 1)
    g.fillRoundedRect(-168 * u, -168 * u, 336 * u, 322 * u, 38 * u)
    g.fillStyle(C.white, 0.4)
    g.fillRoundedRect(-140 * u, -152 * u, 280 * u, 22 * u, 11 * u)

    // antena e as duas lâmpadas: é por elas que a máquina "acorda"
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-5 * u, -212 * u, 10 * u, 44 * u, 5 * u)
    g.fillCircle(0, -218 * u, 13 * u)
    g.fillStyle(lamp, 1)
    g.fillCircle(0, -218 * u, 9 * u)
    for (const dx of [-124, 124]) {
        g.fillStyle(C.ink, 1)
        g.fillCircle(dx * u, -120 * u, 20 * u)
        g.fillStyle(lamp, 1)
        g.fillCircle(dx * u, -120 * u, 15 * u)
        g.fillStyle(C.white, 0.55)
        g.fillCircle(dx * u - 4 * u, -125 * u, 5 * u)
    }

    // pés
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-140 * u, 168 * u, 60 * u, 26 * u, 12 * u)
    g.fillRoundedRect(80 * u, 168 * u, 60 * u, 26 * u, 12 * u)
}

function drawTray(g: Phaser.GameObjects.Graphics, w: number, h: number, state: SlotState) {
    const rim = state === 'refuse' ? C.warn : C.hardDark
    const face = state === 'loaded' ? C.hard : 0x0b1a26
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 18)
    g.fillStyle(rim, 1)
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 15)
    g.fillStyle(face, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
    if (state !== 'loaded') {
        g.fillStyle(C.ink, 0.55)
        g.fillRoundedRect(-w / 2, -h / 2, w, h * 0.4, 12)
    }
    // o lábio da bandeja, que é o que a faz ler como gaveta e não como buraco
    g.fillStyle(rim, 1)
    g.fillRoundedRect(-w / 2 - 3, h / 2 - 4, w + 6, 16, 8)
    g.fillStyle(C.white, 0.3)
    g.fillRoundedRect(-w / 2 + 12, h / 2 - 1, w - 24, 6, 3)
}

function drawReader(g: Phaser.GameObjects.Graphics, w: number, h: number, state: SlotState) {
    const rim = state === 'refuse' ? C.warn : C.softDark
    const face = state === 'loaded' ? C.soft : 0x140f26
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 18)
    g.fillStyle(rim, 1)
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 15)
    g.fillStyle(face, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
    // a fenda por onde a ordem entra
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 + 12, -h / 2 - 12, w - 24, 14, 7)
    g.fillStyle(rim, 1)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 - 9, w - 32, 8, 4)
}

function drawButton(g: Phaser.GameObjects.Graphics, d: number, on: boolean, down: boolean) {
    const r = d / 2
    const drop = down ? 5 : 0
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 6, r + 6)
    g.fillStyle(on ? C.okDark : C.steelDark, 1)
    g.fillCircle(0, 4, r + 1)
    g.fillStyle(on ? C.ok : 0x9fb0c2, 1)
    g.fillCircle(0, drop - 2, r - 3)
    g.fillStyle(C.white, on ? 0.4 : 0.24)
    g.fillEllipse(-r * 0.2, drop - r * 0.42, r * 1.1, r * 0.44)
    g.fillStyle(on ? C.white : C.steelDark, 1)
    g.fillTriangle(
        -r * 0.26, drop - 2 - r * 0.4,
        -r * 0.26, drop - 2 + r * 0.4,
        r * 0.42, drop - 2,
    )
}

/* ────────────────────────────────────────────────── a máquina ── */

export interface MachineOptions {
    onSlot: (slot: Slot) => void
    onRun: () => void
}

/**
 * O chassi.
 *
 * Ele não sabe nada de acerto: sabe mostrar um pedido, guardar o que puseram
 * em cada entrada e acender o TESTAR quando as duas estão cheias. O veredito é
 * função dos dados, e mora na cena.
 */
export function createMachine(scene: Phaser.Scene, options: MachineOptions) {
    const S = MACHINE.s
    const root = scene.add.container(MACHINE.cx, MACHINE.cy).setDepth(DEPTH.machine)

    /* corpo ------------------------------------------------------------ */
    const bodySprite = hasFrame(scene, CHASSI_SHEET, 0)
        ? scene.add.sprite(0, 0, CHASSI_SHEET, 0).setDisplaySize(S, S)
        : null
    const bodyArt = bodySprite ? null : scene.add.graphics()
    if (bodyArt) drawBody(bodyArt, S, 'off')
    root.add(bodySprite ?? bodyArt!)

    /* visor do pedido -------------------------------------------------- */
    const display = scene.add.container(MACHINE.displayDX, MACHINE.displayDY)
    const screen = scene.add.graphics()
    const paintScreen = (lit: boolean) => {
        const w = MACHINE.displayW
        const h = MACHINE.displayH
        screen.clear()
        screen.fillStyle(C.ink, 1)
        screen.fillRoundedRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 16)
        screen.fillStyle(lit ? 0x123a5c : 0x0d1c2a, 1)
        screen.fillRoundedRect(-w / 2, -h / 2, w, h, 11)
        if (lit) {
            screen.fillStyle(C.white, 0.1)
            screen.fillRoundedRect(-w / 2 + 8, -h / 2 + 5, w - 16, h * 0.34, 7)
        }
    }
    paintScreen(false)
    const goalArt = scene.add.graphics()
    display.add([screen, goalArt])
    root.add(display)

    /* entradas --------------------------------------------------------- */
    const makeSlot = (slot: Slot) => {
        const dx = slot === 'tray' ? MACHINE.trayDX : MACHINE.readerDX
        const dy = slot === 'tray' ? MACHINE.trayDY : MACHINE.readerDY
        const w = slot === 'tray' ? MACHINE.trayW : MACHINE.readerW
        const h = slot === 'tray' ? MACHINE.trayH : MACHINE.readerH

        const holder = scene.add.container(dx, dy)
        const sheetFrame = slot === 'tray' ? UI.trayEmpty : UI.readerEmpty
        const sprite = hasFrame(scene, UI_SHEET, sheetFrame)
            ? scene.add.sprite(0, 0, UI_SHEET, sheetFrame).setDisplaySize(w + 26, h + 26)
            : null
        const art = sprite ? null : scene.add.graphics()
        if (art) (slot === 'tray' ? drawTray : drawReader)(art, w, h, 'empty')

        // a gravura da regra: mão na bandeja, seta no leitor
        const mark = scene.add.graphics().setAlpha(0.34)
        if (slot === 'tray') drawHandTouch(mark, w * 0.52)
        else drawOrder(mark, h * 0.52)

        holder.add([sprite ?? art!, mark])
        root.add(holder)
        return { slot, holder, sprite, art, mark, w, h }
    }

    const slots: Record<Slot, ReturnType<typeof makeSlot>> = {
        tray: makeSlot('tray'),
        reader: makeSlot('reader'),
    }
    const cargo: Record<Slot, ItemIcon | null> = { tray: null, reader: null }

    const paintSlot = (slot: Slot, state: SlotState) => {
        const parts = slots[slot]
        parts.mark.setAlpha(state === 'loaded' ? 0 : state === 'refuse' ? 1 : 0.34)
        if (parts.sprite) {
            const frame = slot === 'tray'
                ? { empty: UI.trayEmpty, loaded: UI.trayFull, refuse: UI.trayRefuse }[state]
                : { empty: UI.readerEmpty, loaded: UI.readerFull, refuse: UI.readerRefuse }[state]
            if (hasFrame(scene, UI_SHEET, frame)) parts.sprite.setFrame(frame)
            return
        }
        ;(slot === 'tray' ? drawTray : drawReader)(parts.art!, parts.w, parts.h, state)
    }

    /* botão ------------------------------------------------------------ */
    const button = scene.add.container(0, MACHINE.buttonDY)
    const buttonSprite = hasFrame(scene, UI_SHEET, UI.buttonOff)
        ? scene.add.sprite(0, 0, UI_SHEET, UI.buttonOff).setDisplaySize(MACHINE.buttonD + 30, MACHINE.buttonD + 30)
        : null
    const buttonArt = buttonSprite ? null : scene.add.graphics()
    if (buttonArt) drawButton(buttonArt, MACHINE.buttonD, false, false)
    button.add(buttonSprite ?? buttonArt!)
    root.add(button)

    const paintButton = (on: boolean, down: boolean) => {
        if (buttonSprite) {
            const frame = down ? UI.buttonDown : on ? UI.buttonOn : UI.buttonOff
            if (hasFrame(scene, UI_SHEET, frame)) buttonSprite.setFrame(frame)
            return
        }
        drawButton(buttonArt!, MACHINE.buttonD, on, down)
    }

    /* toque ------------------------------------------------------------ */
    const zone = (x: number, y: number, w: number, h: number) =>
        scene.add.zone(x, y, w, h)
            .setOrigin(0.5)
            .setDepth(DEPTH.slot)
            .setInteractive({ useHandCursor: true })

    const trayZone = zone(TRAY.x, TRAY.y, MACHINE.trayHit.w, MACHINE.trayHit.h)
    const readerZone = zone(READER.x, READER.y, MACHINE.readerHit.w, MACHINE.readerHit.h)
    const runZone = zone(BUTTON.x, BUTTON.y, MACHINE.buttonHit.w, MACHINE.buttonHit.h)

    let enabled = false
    let runOn = false
    let runPulse: Phaser.Tweens.Tween | null = null

    trayZone.on('pointerdown', () => { if (enabled) options.onSlot('tray') })
    readerZone.on('pointerdown', () => { if (enabled) options.onSlot('reader') })
    runZone.on('pointerdown', () => {
        if (!enabled || !runOn) return
        paintButton(true, true)
        options.onRun()
    })
    runZone.on('pointerup', () => paintButton(runOn, false))
    runZone.on('pointerout', () => paintButton(runOn, false))

    const stopPulse = () => {
        runPulse?.stop()
        runPulse = null
        button.setScale(1)
    }

    const setBody = (state: BodyState) => {
        if (bodySprite) {
            const frame = BODY_FRAME[state]
            if (hasFrame(scene, CHASSI_SHEET, frame)) bodySprite.setFrame(frame)
            bodySprite.setDisplaySize(S, S)
            return
        }
        drawBody(bodyArt!, S, state)
    }

    return {
        get container() {
            return root
        },

        setGoal(goal: Goal | null) {
            goalArt.clear()
            paintScreen(goal !== null)
            if (goal) drawGoal(goalArt, goal, MACHINE.displayH * 0.9, C.light)
        },

        setBody,

        setSlot(slot: Slot, target: LabItem | null) {
            cargo[slot]?.destroy()
            cargo[slot] = null
            paintSlot(slot, target ? 'loaded' : 'empty')
            if (!target) return
            const size = (slot === 'tray' ? MACHINE.trayH : MACHINE.readerH) * 0.82
            const icon = createItemIcon(scene, target, size)
            icon.setPosition(0, slot === 'tray' ? -4 : 0)
            slots[slot].holder.add(icon)
            cargo[slot] = icon
            void FX.popIn(scene, icon, { from: 0.4, duration: 260 })
        },

        setEnabled(on: boolean) {
            enabled = on
            trayZone.input!.enabled = on
            readerZone.input!.enabled = on
            runZone.input!.enabled = on
            if (!on) stopPulse()
        },

        /** O TESTAR só acende com as duas entradas cheias. */
        setRunReady(on: boolean) {
            runOn = on
            paintButton(on, false)
            stopPulse()
            if (!on) return
            runPulse = scene.tweens.add({
                targets: button,
                scale: 1.08,
                duration: FX.ms(scene, 520),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        /** Pisca a entrada que a criança ainda não usou. Só depois de errar. */
        async hintSlot(slot: Slot) {
            const parts = slots[slot]
            await FX.to(scene, parts.holder, { scale: 1.14 }, { duration: 220, yoyo: true, repeat: 2 })
            parts.holder.setScale(1)
        },

        /** A entrada recusa: a forma não entra, e a gravura acende. */
        async refuse(slot: Slot) {
            const parts = slots[slot]
            paintSlot(slot, 'refuse')
            await FX.shake(scene, parts.holder, { amount: 12, times: 3 })
            parts.holder.setPosition(
                slot === 'tray' ? MACHINE.trayDX : MACHINE.readerDX,
                slot === 'tray' ? MACHINE.trayDY : MACHINE.readerDY,
            )
            await FX.wait(scene, 260)
            paintSlot(slot, cargo[slot] ? 'loaded' : 'empty')
        },

        pressRun() {
            paintButton(true, true)
            return FX.to(scene, button, { scale: 0.92 }, { duration: 110, yoyo: true })
                .then(() => paintButton(runOn, false))
        },

        async rumble() {
            await FX.shake(scene, root, { amount: 9, times: 6 })
            root.setPosition(MACHINE.cx, MACHINE.cy)
        },

        slotPoint(slot: Slot) {
            return slot === 'tray' ? { ...TRAY } : { ...READER }
        },

        bounds() {
            return { x: MACHINE.cx, y: MACHINE.cy, w: S + 24, h: S + 24 }
        },

        slotBounds(slot: Slot) {
            const point = slot === 'tray' ? TRAY : READER
            const hit = slot === 'tray' ? MACHINE.trayHit : MACHINE.readerHit
            return { x: point.x, y: point.y, w: hit.w + 16, h: hit.h + 16 }
        },

        buttonBounds() {
            return { x: BUTTON.x, y: BUTTON.y, w: MACHINE.buttonHit.w + 12, h: MACHINE.buttonHit.h + 12 }
        },

        displayBounds() {
            return {
                x: DISPLAY.x, y: DISPLAY.y,
                w: MACHINE.displayW + 34, h: MACHINE.displayH + 34,
            }
        },

        destroy() {
            stopPulse()
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(button)
            trayZone.destroy()
            readerZone.destroy()
            runZone.destroy()
            root.destroy(true)
        },
    }
}

export type Machine = ReturnType<typeof createMachine>
