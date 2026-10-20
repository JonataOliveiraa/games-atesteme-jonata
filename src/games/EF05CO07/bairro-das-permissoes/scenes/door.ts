import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey } from '../data/files'
import { DEPTH, PANEL } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL } from '../data/words'
import type { Answer } from '../types'

export interface DoorAsk {
    app: number
    wants: { icon: number; busy: number | null }[]
    says: string
    wait: boolean
}

export interface Door {
    ask(q: DoorAsk): Promise<Answer>
    glow(answer: Answer): void
    stamp(): Promise<void>
    hourglass(): Promise<void>
    hide(): Promise<void>
    destroy(): void
}

interface Button {
    value: Answer
    box: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    text: Phaser.GameObjects.Text
    zone: Phaser.GameObjects.Zone
}

interface Slot {
    box: Phaser.GameObjects.Container
    plate: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Image
    seal: Phaser.GameObjects.Container
    sealIcon: Phaser.GameObjects.Image
    tag: Phaser.GameObjects.Container
    glass: Phaser.GameObjects.Container
    r: number
    busy: boolean
}

const plateR = (size: number) => size * 0.62

export function createDoor(scene: Phaser.Scene): Door {
    const card = scene.add.graphics()
    const { w, h } = PANEL
    card.fillStyle(C.shadow, 0.25)
    card.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 36)
    card.fillStyle(C.cream, 1)
    card.fillRoundedRect(-w / 2, -h / 2, w, h, 36)
    card.lineStyle(6, C.ink, 1)
    card.strokeRoundedRect(-w / 2, -h / 2, w, h, 36)

    const appPlate = scene.add.graphics()
    appPlate.fillStyle(C.white, 1)
    appPlate.fillCircle(-PANEL.iconDx, PANEL.iconY, plateR(PANEL.icon))
    appPlate.lineStyle(5, C.ink, 1)
    appPlate.strokeCircle(-PANEL.iconDx, PANEL.iconY, plateR(PANEL.icon))
    const appIcon = scene.add.image(-PANEL.iconDx, PANEL.iconY, 'icones', cellKey(0)).setDisplaySize(PANEL.icon, PANEL.icon)
    const arrow = scene.add.graphics()
    arrow.fillStyle(C.ink, 1)
    arrow.fillRoundedRect(-62, PANEL.iconY - 8, 90, 16, 8)
    arrow.fillTriangle(22, PANEL.iconY - 26, 22, PANEL.iconY + 26, 62, PANEL.iconY)

    const makeGlass = () => {
        const s = PANEL.glass
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillCircle(3, 5, s * 0.62)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, s * 0.62)
        g.lineStyle(5, C.waitDark, 1)
        g.strokeCircle(0, 0, s * 0.62)
        g.fillStyle(C.wait, 1)
        g.fillTriangle(-s * 0.28, -s * 0.34, s * 0.28, -s * 0.34, 0, 0)
        g.fillTriangle(-s * 0.28, s * 0.34, s * 0.28, s * 0.34, 0, 0)
        g.fillStyle(C.butter, 1)
        g.fillTriangle(-s * 0.16, s * 0.34, s * 0.16, s * 0.34, 0, s * 0.14)
        g.fillStyle(C.waitDark, 1)
        g.fillRoundedRect(-s * 0.36, -s * 0.44, s * 0.72, s * 0.12, s * 0.06)
        g.fillRoundedRect(-s * 0.36, s * 0.32, s * 0.72, s * 0.12, s * 0.06)
        return scene.add.container(0, 0, [g]).setVisible(false)
    }

    const makeSlot = (): Slot => {
        const plate = scene.add.graphics()
        const icon = scene.add.image(0, 0, 'icones', cellKey(6))
        const sealG = scene.add.graphics()
        sealG.fillStyle(C.white, 1)
        sealG.fillCircle(0, 0, PANEL.seal.r)
        sealG.lineStyle(4, C.ink, 1)
        sealG.strokeCircle(0, 0, PANEL.seal.r)
        const sealIcon = scene.add.image(0, 0, 'icones', cellKey(0)).setDisplaySize(PANEL.seal.icon, PANEL.seal.icon)
        const seal = scene.add.container(0, 0, [sealG, sealIcon]).setVisible(false)
        const tagG = scene.add.graphics()
        const { w: tw, h: th } = PANEL.tag
        tagG.fillStyle(C.ink, 1)
        tagG.fillRoundedRect(-tw / 2, -th / 2, tw, th, th / 2)
        const tagText = scene.add
            .text(0, 1, LABEL.busy, { fontFamily: FONT.black, fontSize: `${SIZE.tag}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        const tag = scene.add.container(0, 0, [tagG, tagText]).setVisible(false)
        const glass = makeGlass()
        const box = scene.add.container(0, PANEL.iconY, [plate, icon, tag, seal, glass])
        return { box, plate, icon, seal, sealIcon, tag, glass, r: 0, busy: false }
    }
    const slots = [makeSlot(), makeSlot()]

    const says = scene.add
        .text(0, PANEL.saysY, '', { fontFamily: FONT.black, fontSize: `${SIZE.says}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)

    const stampArt = scene.add.graphics()
    stampArt.lineStyle(10, C.no, 1)
    stampArt.strokeRoundedRect(-92, -44, 184, 88, 20)
    const stampText = scene.add
        .text(0, 2, LABEL.stamp, { fontFamily: FONT.black, fontSize: `${SIZE.stamp}px`, color: CSS.no })
        .setOrigin(0.5)
        .setResolution(2)
    const stamp = scene.add.container(PANEL.iconDx, PANEL.iconY, [stampArt, stampText]).setAngle(-14).setVisible(false)

    const paintIcon = (g: Phaser.GameObjects.Graphics, value: Answer, ix: number) => {
        g.lineStyle(10, C.white, 1)
        if (value === 'pode') {
            g.beginPath()
            g.moveTo(ix - 14, 0)
            g.lineTo(ix - 3, 12)
            g.lineTo(ix + 16, -12)
            g.strokePath()
            return
        }
        if (value === 'nao') {
            g.lineBetween(ix - 12, -12, ix + 12, 12)
            g.lineBetween(ix - 12, 12, ix + 12, -12)
            return
        }
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(ix - 15, -20, 30, 7, 3.5)
        g.fillRoundedRect(ix - 15, 13, 30, 7, 3.5)
        g.fillTriangle(ix - 11, -13, ix + 11, -13, ix, 0)
        g.fillTriangle(ix - 11, 13, ix + 11, 13, ix, 0)
    }

    const colors: Record<Answer, [number, number]> = {
        pode: [C.yes, C.yesDark],
        espera: [C.wait, C.waitDark],
        nao: [C.no, C.noDark],
    }

    const makeButton = (value: Answer, label: string): Button => {
        const face = scene.add.graphics()
        const text = scene.add
            .text(0, 0, label, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(0, PANEL.buttonY, [face, text])
        const zone = scene.add.zone(0, 0, 10, 10).setDepth(DEPTH.door + 2)
        return { value, box, face, text, zone }
    }
    const yes = makeButton('pode', LABEL.yes)
    const wait = makeButton('espera', LABEL.wait)
    const no = makeButton('nao', LABEL.no)
    const buttons = [yes, wait, no]

    const shape = (b: Button, x: number, bw: number) => {
        const bh = PANEL.buttonH
        const [face, dark] = colors[b.value]
        const g = b.face
        g.clear()
        g.fillStyle(dark, 1)
        g.fillRoundedRect(-bw / 2, -bh / 2 + 7, bw, bh, bh / 2)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
        g.fillStyle(C.white, 0.22)
        g.fillRoundedRect(-bw / 2 + 18, -bh / 2 + 8, bw - 36, 14, 7)
        const ix = -bw / 2 + 44
        paintIcon(g, b.value, ix)
        const room = bw - 88 - 22
        b.text.setScale(1)
        if (b.text.width > room) b.text.setScale(room / b.text.width)
        b.text.setX(ix + 24 + room / 2)
        b.box.setX(x)
        b.zone.removeInteractive()
        b.zone.setPosition(PANEL.x + x, PANEL.y + PANEL.buttonY).setSize(bw + 20, bh + 20)
    }

    const panel = scene.add
        .container(PANEL.x, PANEL.y, [card, appPlate, appIcon, arrow, ...slots.map(s => s.box), says, ...buttons.map(b => b.box), stamp])
        .setDepth(DEPTH.door)
        .setVisible(false)

    let live: Button[] = [yes, no]
    let shown: Slot[] = []
    let answer: ((v: Answer) => void) | undefined
    let armed = false

    const arm = (on: boolean) => {
        armed = on
        buttons.forEach(b => {
            if (on && live.includes(b)) b.zone.setInteractive({ useHandCursor: true })
            else if (b.zone.input) b.zone.disableInteractive()
        })
    }
    arm(false)

    const pick = (b: Button) => {
        if (!armed || !answer) return
        arm(false)
        void FX.press(scene, b.box)
        const done = answer
        answer = undefined
        done(b.value)
    }
    buttons.forEach(b => b.zone.on('pointerdown', () => pick(b)))

    const fill = (slot: Slot, x: number, size: number, want: DoorAsk['wants'][number]) => {
        const r = plateR(size)
        slot.r = r
        slot.busy = want.busy !== null
        slot.box.setPosition(x, PANEL.iconY).setVisible(true)
        slot.plate.clear()
        slot.plate.fillStyle(C.white, 1)
        slot.plate.fillCircle(0, 0, r)
        slot.plate.lineStyle(5, C.ink, 1)
        slot.plate.strokeCircle(0, 0, r)
        slot.icon.setFrame(cellKey(want.icon)).setDisplaySize(size, size).clearTint()
        slot.glass.setVisible(false).setAngle(0).setScale(1)
        slot.seal.setVisible(slot.busy).setPosition(r * PANEL.seal.at, -r * PANEL.seal.at)
        slot.tag.setVisible(slot.busy).setPosition(0, r * PANEL.tag.at)
        if (want.busy !== null) slot.sealIcon.setFrame(cellKey(want.busy)).setDisplaySize(PANEL.seal.icon, PANEL.seal.icon)
    }

    let breathe: Phaser.Tweens.Tween[] = []
    const still = () => {
        breathe.forEach(t => t.remove())
        breathe = []
    }

    return {
        async ask(q) {
            appIcon.setFrame(cellKey(q.app)).setDisplaySize(PANEL.icon, PANEL.icon)
            slots.forEach(s => s.box.setVisible(false))
            if (q.wants.length > 1) {
                shown = slots.slice(0, 2)
                q.wants.slice(0, 2).forEach((want, i) => fill(slots[i], PANEL.pair.dx[i], PANEL.pair.icon, want))
                stamp.setPosition((PANEL.pair.dx[0] + PANEL.pair.dx[1]) / 2, PANEL.iconY)
            } else {
                shown = slots.slice(0, 1)
                fill(slots[0], PANEL.iconDx, PANEL.icon, q.wants[0])
                stamp.setPosition(PANEL.iconDx, PANEL.iconY)
            }
            says.setText(q.says).setScale(1)
            if (says.width > w - 60) says.setScale((w - 60) / says.width)
            stamp.setVisible(false)
            if (q.wait) {
                live = [yes, wait, no]
                live.forEach((b, i) => shape(b, (i - 1) * PANEL.trio.dx, PANEL.trio.w))
            } else {
                live = [yes, no]
                shape(yes, -PANEL.buttonDx, PANEL.buttonW)
                shape(no, PANEL.buttonDx, PANEL.buttonW)
            }
            buttons.forEach(b => b.box.setVisible(live.includes(b)).setScale(1).setAlpha(1))
            panel.setVisible(true).setAlpha(0).setY(PANEL.y + 60)
            await FX.to(scene, panel, { alpha: 1, y: PANEL.y }, { duration: 260, ease: 'Back.easeOut' })
            await FX.wait(scene, PANEL.arm)
            breathe = live.map(b => scene.tweens.add({ targets: b.box, scale: 1.05, duration: 520, yoyo: true, repeat: -1 }))
            return new Promise<Answer>(resolve => {
                answer = resolve
                arm(true)
            })
        },
        glow(value) {
            still()
            live.forEach(b => {
                if (b.value === value) b.box.setScale(1.08).setAlpha(1)
                else b.box.setScale(1).setAlpha(0.35)
            })
        },
        async stamp() {
            const k = shown.length > 1 ? 1.2 : 1
            stamp.setVisible(true).setScale(2.4 * k).setAlpha(0)
            await FX.to(scene, stamp, { scale: k, alpha: 1 }, { duration: TIMING.stamp, ease: 'Quad.easeIn' })
            FX.shakeCam(scene, 'leve')
        },
        async hourglass() {
            const busy = shown.filter(s => s.busy)
            const targets = busy.length ? busy : shown
            await FX.all(
                ...targets.map(async s => {
                    s.icon.setTint(C.dim)
                    s.glass.setVisible(true).setScale(0).setAngle(0)
                    await FX.to(scene, s.glass, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
                    await FX.to(scene, s.glass, { angle: 180 }, { duration: 380, ease: 'Sine.easeInOut' })
                    await FX.wait(scene, 140)
                    await FX.to(scene, s.glass, { angle: 360 }, { duration: 380, ease: 'Sine.easeInOut' })
                }),
            )
        },
        async hide() {
            arm(false)
            still()
            answer = undefined
            if (!panel.visible) return
            await FX.to(scene, panel, { alpha: 0, y: PANEL.y + 40 }, { duration: 200 })
            panel.setVisible(false)
        },
        destroy() {
            still()
            buttons.forEach(b => b.zone.destroy())
            panel.destroy()
        },
    }
}
