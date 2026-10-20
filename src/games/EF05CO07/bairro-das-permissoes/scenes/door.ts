import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey } from '../data/files'
import { DEPTH, PANEL } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL } from '../data/words'

export interface DoorAsk {
    app: number
    want: number
    says: string
}

export interface Door {
    ask(q: DoorAsk): Promise<boolean>
    stamp(): Promise<void>
    glow(yes: boolean): void
    hide(): Promise<void>
    destroy(): void
}

interface Button {
    box: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
}

export function createDoor(scene: Phaser.Scene): Door {
    const card = scene.add.graphics()
    const { w, h } = PANEL
    card.fillStyle(C.shadow, 0.25)
    card.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 36)
    card.fillStyle(C.cream, 1)
    card.fillRoundedRect(-w / 2, -h / 2, w, h, 36)
    card.lineStyle(6, C.ink, 1)
    card.strokeRoundedRect(-w / 2, -h / 2, w, h, 36)

    const plate = (x: number) => {
        const g = scene.add.graphics()
        g.fillStyle(C.white, 1)
        g.fillCircle(x, PANEL.iconY, PANEL.icon * 0.62)
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(x, PANEL.iconY, PANEL.icon * 0.62)
        return g
    }
    const appPlate = plate(-PANEL.iconDx)
    const wantPlate = plate(PANEL.iconDx)
    const appIcon = scene.add.image(-PANEL.iconDx, PANEL.iconY, 'icones', cellKey(0)).setDisplaySize(PANEL.icon, PANEL.icon)
    const wantIcon = scene.add.image(PANEL.iconDx, PANEL.iconY, 'icones', cellKey(6)).setDisplaySize(PANEL.icon, PANEL.icon)
    const arrow = scene.add.graphics()
    arrow.fillStyle(C.ink, 1)
    arrow.fillRoundedRect(-62, PANEL.iconY - 8, 90, 16, 8)
    arrow.fillTriangle(22, PANEL.iconY - 26, 22, PANEL.iconY + 26, 62, PANEL.iconY)

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

    const makeButton = (x: number, label: string, face: number, dark: number, yes: boolean): Button => {
        const g = scene.add.graphics()
        const bw = PANEL.buttonW
        const bh = PANEL.buttonH
        g.fillStyle(dark, 1)
        g.fillRoundedRect(-bw / 2, -bh / 2 + 7, bw, bh, bh / 2)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, bh / 2)
        g.fillStyle(C.white, 0.22)
        g.fillRoundedRect(-bw / 2 + 18, -bh / 2 + 8, bw - 36, 14, 7)
        g.fillStyle(C.white, 1)
        const ix = -bw / 2 + 46
        if (yes) {
            g.lineStyle(10, C.white, 1)
            g.beginPath()
            g.moveTo(ix - 14, 0)
            g.lineTo(ix - 3, 12)
            g.lineTo(ix + 16, -12)
            g.strokePath()
        } else {
            g.lineStyle(10, C.white, 1)
            g.lineBetween(ix - 12, -12, ix + 12, 12)
            g.lineBetween(ix - 12, 12, ix + 12, -12)
        }
        const text = scene.add
            .text(22, 0, label, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(x, PANEL.buttonY, [g, text])
        const zone = scene.add.zone(PANEL.x + x, PANEL.y + PANEL.buttonY, bw + 20, bh + 20).setDepth(DEPTH.door + 2)
        return { box, zone }
    }
    const yes = makeButton(-PANEL.buttonDx, LABEL.yes, C.yes, C.yesDark, true)
    const no = makeButton(PANEL.buttonDx, LABEL.no, C.no, C.noDark, false)

    const panel = scene.add
        .container(PANEL.x, PANEL.y, [card, appPlate, wantPlate, appIcon, wantIcon, arrow, says, yes.box, no.box, stamp])
        .setDepth(DEPTH.door)
        .setVisible(false)

    let answer: ((v: boolean) => void) | undefined
    let armed = false

    const arm = (on: boolean) => {
        armed = on
        ;[yes, no].forEach(b => {
            if (on) b.zone.setInteractive({ useHandCursor: true })
            else b.zone.disableInteractive()
        })
    }
    arm(false)

    const pick = (value: boolean, b: Button) => {
        if (!armed || !answer) return
        arm(false)
        void FX.press(scene, b.box)
        const done = answer
        answer = undefined
        done(value)
    }
    yes.zone.on('pointerdown', () => pick(true, yes))
    no.zone.on('pointerdown', () => pick(false, no))

    let breathe: Phaser.Tweens.Tween[] = []

    return {
        async ask(q) {
            appIcon.setFrame(cellKey(q.app)).setDisplaySize(PANEL.icon, PANEL.icon)
            wantIcon.setFrame(cellKey(q.want)).setDisplaySize(PANEL.icon, PANEL.icon)
            says.setText(q.says).setScale(1)
            if (says.width > w - 60) says.setScale((w - 60) / says.width)
            stamp.setVisible(false)
            ;[yes.box, no.box].forEach(b => b.setScale(1).setAlpha(1))
            panel.setVisible(true).setAlpha(0).setY(PANEL.y + 60)
            await FX.to(scene, panel, { alpha: 1, y: PANEL.y }, { duration: 260, ease: 'Back.easeOut' })
            await FX.wait(scene, PANEL.arm)
            breathe = [yes.box, no.box].map(b => scene.tweens.add({ targets: b, scale: 1.05, duration: 520, yoyo: true, repeat: -1 }))
            return new Promise<boolean>(resolve => {
                answer = resolve
                arm(true)
            })
        },
        async stamp() {
            stamp.setVisible(true).setScale(2.4).setAlpha(0)
            await FX.to(scene, stamp, { scale: 1, alpha: 1 }, { duration: TIMING.stamp, ease: 'Quad.easeIn' })
            FX.shakeCam(scene, 'leve')
        },
        glow(isYes) {
            breathe.forEach(t => t.remove())
            breathe = []
            const keep = isYes ? yes.box : no.box
            const fade = isYes ? no.box : yes.box
            keep.setScale(1.08)
            fade.setAlpha(0.35).setScale(1)
        },
        async hide() {
            arm(false)
            breathe.forEach(t => t.remove())
            breathe = []
            answer = undefined
            if (!panel.visible) return
            await FX.to(scene, panel, { alpha: 0, y: PANEL.y + 40 }, { duration: 200 })
            panel.setVisible(false)
        },
        destroy() {
            breathe.forEach(t => t.remove())
            yes.zone.destroy()
            no.zone.destroy()
            panel.destroy()
        },
    }
}
