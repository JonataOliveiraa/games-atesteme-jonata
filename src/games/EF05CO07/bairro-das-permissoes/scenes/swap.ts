import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey } from '../data/files'
import { BAG, DEPTH, PANEL, SWAP } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'

export interface SwapPick {
    icon: number
    name: string
}

export interface Swap {
    ask(items: SwapPick[]): Promise<number>
    hide(): Promise<void>
    destroy(): void
}

interface Choice {
    box: Phaser.GameObjects.Container
    icon: Phaser.GameObjects.Image
    name: Phaser.GameObjects.Text
    zone: Phaser.GameObjects.Zone
}

export function createSwap(scene: Phaser.Scene): Swap {
    const { w, h } = PANEL
    const card = scene.add.graphics()
    card.fillStyle(C.shadow, 0.25)
    card.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 36)
    card.fillStyle(C.cream, 1)
    card.fillRoundedRect(-w / 2, -h / 2, w, h, 36)
    card.lineStyle(6, C.ink, 1)
    card.strokeRoundedRect(-w / 2, -h / 2, w, h, 36)

    const title = scene.add
        .text(0, SWAP.titleY, LABEL.swap, { fontFamily: FONT.black, fontSize: `${SIZE.says}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)

    const choices: Choice[] = Array.from({ length: BAG.slots }, (_, i) => {
        const dx = (i - (BAG.slots - 1) / 2) * SWAP.itemDx
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.22)
        g.fillCircle(0, 6, SWAP.r)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, SWAP.r)
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(0, 0, SWAP.r)
        const icon = scene.add.image(0, 0, 'icones', cellKey(0)).setDisplaySize(SWAP.icon, SWAP.icon)
        const name = scene.add
            .text(0, SWAP.nameY, '', { fontFamily: FONT.black, fontSize: `${SIZE.name}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(dx, SWAP.itemY, [g, icon, name])
        const zone = scene.add
            .zone(PANEL.x + dx, PANEL.y + SWAP.itemY + 22, SWAP.r * 2 + 60, SWAP.r * 2 + 84)
            .setDepth(DEPTH.door + 2)
        return { box, icon, name, zone }
    })

    const panel = scene.add
        .container(PANEL.x, PANEL.y, [card, title, ...choices.map(c => c.box)])
        .setDepth(DEPTH.door)
        .setVisible(false)

    let answer: ((i: number) => void) | undefined
    let armed = false
    let breathe: Phaser.Tweens.Tween[] = []

    const arm = (on: boolean) => {
        armed = on
        choices.forEach(c => {
            if (on && c.box.visible) c.zone.setInteractive({ useHandCursor: true })
            else c.zone.disableInteractive()
        })
    }
    arm(false)

    const calm = () => {
        breathe.forEach(t => t.remove())
        breathe = []
    }

    choices.forEach((c, i) =>
        c.zone.on('pointerdown', () => {
            if (!armed || !answer) return
            arm(false)
            calm()
            c.box.setScale(1.08)
            choices.forEach(o => o !== c && o.box.setAlpha(0.35))
            void FX.press(scene, c.box)
            const done = answer
            answer = undefined
            done(i)
        }),
    )

    return {
        async ask(items) {
            choices.forEach((c, i) => {
                const item = items[i]
                c.box.setVisible(Boolean(item)).setScale(1).setAlpha(1)
                if (!item) return
                c.icon.setFrame(cellKey(item.icon)).setDisplaySize(SWAP.icon, SWAP.icon)
                c.name.setText(item.name).setScale(1)
                if (c.name.width > SWAP.itemDx - 20) c.name.setScale((SWAP.itemDx - 20) / c.name.width)
            })
            panel.setVisible(true).setAlpha(0).setY(PANEL.y + 60)
            await FX.to(scene, panel, { alpha: 1, y: PANEL.y }, { duration: 260, ease: 'Back.easeOut' })
            await FX.wait(scene, PANEL.arm)
            breathe = choices.filter(c => c.box.visible).map(c => scene.tweens.add({ targets: c.box, scale: 1.05, duration: 520, yoyo: true, repeat: -1 }))
            return new Promise<number>(resolve => {
                answer = resolve
                arm(true)
            })
        },
        async hide() {
            arm(false)
            calm()
            answer = undefined
            if (!panel.visible) return
            await FX.to(scene, panel, { alpha: 0, y: PANEL.y + 40 }, { duration: 200 })
            panel.setVisible(false)
        },
        destroy() {
            calm()
            choices.forEach(c => c.zone.destroy())
            panel.destroy()
        },
    }
}
