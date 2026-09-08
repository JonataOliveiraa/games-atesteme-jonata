import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUTTON, DEPTH, DISPLAY, MACHINE, READER, TRAY } from '../data/layout'
import { C } from '../data/theme'
import type { Goal, LabItem, Slot } from '../types'
import { createItemIcon, type ItemIcon } from './itemIcon'
import { SLOT_KIND } from '../data/items'
import { createGoalIcon, createKindIcon, hasKindArt } from './glyphs'

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

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A ENTRADA NÃO TEM PAINEL
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O `chassi.png` já desenha os dois vãos, com rebaixo, sombra e lábio. O
 * código desenhava OUTRO retângulo por cima — e o retângulo pintado tampava
 * justamente o buraco que a arte tinha feito.
 *
 * Agora dentro do vão só existe o que muda: a gravura enquanto está vazio, o
 * ícone da coisa quando está cheio, e um contorno âmbar no instante em que a
 * entrada recusa. Nada de fundo.
 */
function drawRefuse(g: Phaser.GameObjects.Graphics, w: number, h: number, on: boolean) {
    g.clear()
    if (!on) return
    g.lineStyle(7, C.warn, 1)
    g.strokeRoundedRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 16)
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

    /*
     * A gravura em repouso: quase apagada quando é desenho de linha, um pouco
     * mais presente quando é a folha colorida — que precisa de corpo para não
     * virar mancha suja no fundo escuro do vão.
     */
    const idleMark = hasKindArt(scene) ? 0.55 : 0.34

    /* corpo ------------------------------------------------------------ */
    const bodySprite = hasFrame(scene, CHASSI_SHEET, 0)
        ? scene.add.sprite(0, 0, CHASSI_SHEET, 0).setDisplaySize(S, S)
        : null
    const bodyArt = bodySprite ? null : scene.add.graphics()
    if (bodyArt) drawBody(bodyArt, S, 'off')
    const body = (bodySprite ?? bodyArt!).setPosition(MACHINE.bodyDX, MACHINE.bodyDY)
    root.add(body)

    /*
     * O VISOR TAMBÉM NÃO TEM PAINEL.
     *
     * O chassi já traz a tela escura desenhada, com moldura e brilho. O código
     * pintava outra por cima — e a de cima, sendo um retângulo chapado, matava
     * a moldura da arte. Aqui só mora o símbolo do pedido.
     *
     * 'displayW' e 'displayH' continuam existindo: são a medida do vão, e é
     * delas que sai o tamanho do símbolo e a moldura do modo de ajuste.
     */
    const display = scene.add.container(MACHINE.displayDX, MACHINE.displayDY)
    root.add(display)

    let goalIcon: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics | null = null

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
        const halo = scene.add.graphics()

        // a gravura da regra: peça na bandeja, programa no leitor
        const mark = createKindIcon(scene, SLOT_KIND[slot], Math.min(w, h) * 0.72)
        mark.setAlpha(idleMark)

        holder.add(sprite ? [sprite, halo, mark] : [halo, mark])
        root.add(holder)
        return { slot, holder, sprite, halo, mark, w, h }
    }

    const slots: Record<Slot, ReturnType<typeof makeSlot>> = {
        tray: makeSlot('tray'),
        reader: makeSlot('reader'),
    }
    const cargo: Record<Slot, ItemIcon | null> = { tray: null, reader: null }

    const paintSlot = (slot: Slot, state: SlotState) => {
        const parts = slots[slot]
        parts.mark.setAlpha(state === 'loaded' ? 0 : state === 'refuse' ? 1 : idleMark)
        drawRefuse(parts.halo, parts.w, parts.h, state === 'refuse')
        if (!parts.sprite) return
        const frame = slot === 'tray'
            ? { empty: UI.trayEmpty, loaded: UI.trayFull, refuse: UI.trayRefuse }[state]
            : { empty: UI.readerEmpty, loaded: UI.readerFull, refuse: UI.readerRefuse }[state]
        if (hasFrame(scene, UI_SHEET, frame)) parts.sprite.setFrame(frame)
    }

    /* botão ------------------------------------------------------------ */
    const button = scene.add.container(MACHINE.buttonDX, MACHINE.buttonDY)
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
            goalIcon?.destroy()
            goalIcon = null
            if (!goal) return

            goalIcon = createGoalIcon(scene, goal, MACHINE.goalBox, C.light)
            goalIcon.setY(MACHINE.goalDY)
            display.add(goalIcon)
        },

        setBody,

        setSlot(slot: Slot, target: LabItem | null) {
            cargo[slot]?.destroy()
            cargo[slot] = null
            paintSlot(slot, target ? 'loaded' : 'empty')
            if (!target) return
            const size = (slot === 'tray' ? MACHINE.trayH : MACHINE.readerH) * 0.94
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

        /** Só no dev: as peças cruas, para o ajuste de posição (tecla P). */
        parts() {
            return {
                body,
                display,
                tray: slots.tray.holder,
                reader: slots.reader.holder,
                button,
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
