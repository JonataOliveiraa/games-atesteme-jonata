import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    DATA_BOX,
    dataFrame,
    DATA_SHEET,
    DEST_BOX,
    DEST_SHEET,
    destFrame,
    fitInside,
    originOf,
    PHOTO_BOX,
    SHEET,
} from '../data/art'
import { BIN, CARD, DEPTH, SLOT } from '../data/layout'
import { OWNER_LABEL } from '../data/rules'
import { C, CSS, FONT } from '../data/theme'
import type { TargetCard } from '../types'

interface Slot {
    card: TargetCard
    root: Phaser.GameObjects.Container
    paper: Phaser.GameObjects.Graphics
    ring: Phaser.GameObjects.Graphics
    body: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    x: number
}

function paintPaper(g: Phaser.GameObjects.Graphics, pressed: boolean) {
    const { w, h } = CARD
    const dy = pressed ? 6 : 0
    g.clear()
    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 12, w, h, 26)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4 + dy, w + 8, h + 8, 28)
    g.fillStyle(C.paperDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, 24)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h - 8, 24)
    g.fillStyle(C.white, 0.6)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 12 + dy, w - 32, 10, 5)
}

function paintStrip(g: Phaser.GameObjects.Graphics) {
    const { w } = CARD
    const { y, h } = SLOT.strip
    g.clear()
    g.lineStyle(3, C.ink, 0.16)
    g.lineBetween(-w / 2 + 26, y - 16, w / 2 - 26, y - 16)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 + 20, y, w - 40, h, 18)
    g.fillStyle(C.wall, 1)
    g.fillRoundedRect(-w / 2 + 23, y + 3, w - 46, h - 8, 15)
}

function paintLock(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.lineStyle(7, C.ink, 1)
    g.beginPath()
    g.arc(0, -8, 12, Math.PI, 0)
    g.strokePath()
    g.lineStyle(4, C.amber, 1)
    g.beginPath()
    g.arc(0, -8, 12, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-20, -10, 40, 32, 8)
    g.fillStyle(C.amber, 1)
    g.fillRoundedRect(-17, -7, 34, 26, 6)
    g.fillStyle(C.amberDeep, 1)
    g.fillCircle(0, 3, 5)
    g.fillRect(-2, 3, 4, 9)
}

export function createCards(scene: Phaser.Scene, onPick: (index: number) => void) {
    let slots: Slot[] = []
    let enabled = false

    const lock = scene.add.graphics().setDepth(DEPTH.cardFx).setVisible(false)
    paintLock(lock)

    const xOf = (index: number, total: number) => {
        if (total === CARD.xs.length) return CARD.xs[index]
        const span = 1280
        return span / 2 + (index - (total - 1) / 2) * 400
    }

    const build = (card: TargetCard, index: number, total: number): Slot => {
        const x = xOf(index, total)
        const cy = CARD.y + CARD.h / 2
        const root = scene.add.container(x, cy).setDepth(DEPTH.card)

        const ring = scene.add.graphics().setAlpha(0)
        ring.lineStyle(8, C.cyan, 1)
        ring.strokeRoundedRect(-CARD.w / 2 - 12, -CARD.h / 2 - 12, CARD.w + 24, CARD.h + 24, 34)

        const paper = scene.add.graphics()
        const body = scene.add.container(0, 0)

        const ownerChip = scene.add.graphics()
        const chipW = card.owner === 'self' ? 108 : 178
        ownerChip.fillStyle(C.ink, 1)
        ownerChip.fillRoundedRect(SLOT.owner.x - 26, SLOT.owner.y - 21, chipW, 42, 21)
        ownerChip.fillStyle(card.owner === 'self' ? C.blue : C.purple, 1)
        ownerChip.fillRoundedRect(SLOT.owner.x - 23, SLOT.owner.y - 18, chipW - 6, 36, 18)
        body.add(ownerChip)

        if (scene.textures.exists(SHEET.photo) && card.owner === 'self') {
            const photo = scene.add.image(SLOT.owner.x, SLOT.owner.y, SHEET.photo)
            const origin = originOf(PHOTO_BOX, 500, 500)
            photo.setOrigin(origin.x, origin.y)
            photo.setScale(fitInside(PHOTO_BOX, 34, 34))
            const mask = scene.add.graphics().setVisible(false)
            mask.fillStyle(0xffffff, 1)
            mask.fillCircle(x + SLOT.owner.x, cy + SLOT.owner.y, 17)
            photo.setMask(mask.createGeometryMask())
            body.add(photo)
        }

        const ownerText = scene.add
            .text(SLOT.owner.x + 24, SLOT.owner.y, OWNER_LABEL[card.owner], {
                fontFamily: FONT.black,
                fontSize: '17px',
                color: CSS.white,
            })
            .setOrigin(0, 0.5)
            .setResolution(2)
        body.add(ownerText)

        if (scene.textures.exists(SHEET.data)) {
            const box = DATA_BOX[dataFrame(card.kind)]
            const icon = scene.add.image(SLOT.icon.x, SLOT.icon.y, SHEET.data, dataFrame(card.kind))
            const origin = originOf(box, DATA_SHEET.frameWidth, DATA_SHEET.frameHeight)
            icon.setOrigin(origin.x, origin.y)
            icon.setScale(fitInside(box, SLOT.icon.size, SLOT.icon.size))
            body.add(icon)
        } else {
            const g = scene.add.graphics()
            g.fillStyle(C.blue, 1)
            g.fillRoundedRect(SLOT.icon.x - 44, SLOT.icon.y - 44, 88, 88, 16)
            body.add(g)
        }

        const message = scene.add
            .text(SLOT.message.x, SLOT.message.y, card.message, {
                fontFamily: FONT.body,
                fontStyle: 'bold',
                fontSize: '21px',
                color: CSS.ink,
                align: 'left',
                wordWrap: { width: SLOT.message.wrap },
                lineSpacing: 4,
            })
            .setOrigin(0, 0.5)
            .setResolution(2)
        body.add(message)

        const strip = scene.add.graphics()
        paintStrip(strip)
        body.add(strip)

        const stripCy = SLOT.strip.y + SLOT.strip.h / 2
        if (scene.textures.exists(SHEET.destinations)) {
            const frame = destFrame(card.audience)
            const box = DEST_BOX[frame]
            const icon = scene.add.image(-CARD.w / 2 + 66, stripCy, SHEET.destinations, frame)
            const origin = originOf(box, DEST_SHEET.frameWidth, DEST_SHEET.frameHeight)
            icon.setOrigin(origin.x, origin.y)
            icon.setScale(fitInside(box, 58, 58))
            body.add(icon)
        }

        const destination = scene.add
            .text(-CARD.w / 2 + 104, stripCy, card.destination, {
                fontFamily: FONT.black,
                fontSize: '19px',
                color: CSS.ink,
                align: 'left',
                wordWrap: { width: CARD.w - 148 },
                lineSpacing: 2,
            })
            .setOrigin(0, 0.5)
            .setResolution(2)
        body.add(destination)

        root.add([ring, paper, body])
        paintPaper(paper, false)

        const zone = scene.add
            .zone(x, cy, CARD.w + 22, CARD.h + 22)
            .setOrigin(0.5)
            .setDepth(DEPTH.card + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (enabled) onPick(index)
        })

        return { card, root, paper, ring, body, zone, x }
    }

    const clear = () => {
        slots.forEach(slot => {
            scene.tweens.killTweensOf([slot.root, slot.ring])
            slot.zone.destroy()
            slot.root.destroy(true)
        })
        slots = []
        scene.tweens.killTweensOf(lock)
        lock.setVisible(false).setAlpha(1).setScale(1)
    }

    return {
        async show(cards: TargetCard[]) {
            clear()
            slots = cards.map((card, index) => build(card, index, cards.length))
            const rest = CARD.y + CARD.h / 2
            slots.forEach(slot => slot.root.setY(rest - 180).setAlpha(0))
            await FX.all(
                ...slots.map((slot, index) =>
                    FX.wait(scene, index * 130).then(() =>
                        FX.all(
                            FX.to(scene, slot.root, { y: rest }, { duration: 460, ease: 'Back.easeOut' }),
                            FX.to(scene, slot.root, { alpha: 1 }, { duration: 300 }),
                        ),
                    ),
                ),
            )
        },

        centerOf(index: number) {
            const slot = slots[index]
            return { x: slot.root.x, y: slot.root.y }
        },

        press(index: number) {
            const slot = slots[index]
            if (!slot) return
            paintPaper(slot.paper, true)
            slot.body.setY(6)
            void FX.wait(scene, 150).then(() => {
                if (!slot.root.active) return
                paintPaper(slot.paper, false)
                slot.body.setY(0)
            })
        },

        focus(index: number | null) {
            slots.forEach((slot, i) => {
                scene.tweens.killTweensOf(slot.ring)
                slot.ring.setAlpha(i === index ? 1 : 0)
            })
            if (index === null) return
            void FX.to(scene, slots[index].ring, { alpha: 0 }, { duration: 420, delay: 180 })
        },

        async shake(index: number) {
            const slot = slots[index]
            if (!slot) return
            await FX.shake(scene, slot.root, { amount: 12, times: 3 })
        },

        showLock(index: number) {
            const slot = slots[index]
            if (!slot) return
            scene.tweens.killTweensOf(lock)
            lock
                .setPosition(slot.root.x + CARD.w / 2 - 14, slot.root.y - CARD.h / 2 + 12)
                .setVisible(true)
                .setScale(0.3)
            void FX.to(scene, lock, { scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        hideLock() {
            scene.tweens.killTweensOf(lock)
            lock.setVisible(false).setAlpha(1).setScale(1)
        },

        pulse(index: number) {
            const slot = slots[index]
            if (!slot) return
            scene.tweens.killTweensOf(slot.ring)
            slot.ring.setAlpha(0)
            scene.tweens.add({
                targets: slot.ring,
                alpha: 1,
                duration: FX.ms(scene, 620),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        async crumple(index: number) {
            const slot = slots[index]
            if (!slot) return
            slot.zone.destroy()
            scene.tweens.killTweensOf(slot.ring)
            slot.ring.setAlpha(0)
            await FX.to(scene, slot.root, { scaleX: 1.06, scaleY: 0.9 }, { duration: 110, yoyo: true })
            await FX.all(
                FX.to(scene, slot.root, { scaleX: 0.24, scaleY: 0.26, angle: 22 }, { duration: 360, ease: 'Cubic.easeIn' }),
                FX.wait(scene, 120).then(() =>
                    FX.arcTo(scene, slot.root, { x: BIN.x, y: BIN.y }, { height: 130, duration: 520 }),
                ),
            )
            await FX.to(scene, slot.root, { alpha: 0, scale: 0.08 }, { duration: 180 })
        },

        async deliver() {
            await FX.all(
                ...slots
                    .filter(slot => slot.root.active && slot.root.alpha > 0)
                    .map(slot =>
                        FX.all(
                            FX.to(scene, slot.root, { y: slot.root.y - 46 }, { duration: 420, ease: 'Cubic.easeIn' }),
                            FX.to(scene, slot.root, { alpha: 0, scale: 0.86 }, { duration: 420 }),
                        ),
                    ),
            )
        },

        setEnabled(value: boolean, dim = false) {
            enabled = value
            slots.forEach(slot => {
                if (slot.zone.active && slot.zone.input) slot.zone.input.enabled = value
                slot.root.setAlpha(dim ? 0.76 : slot.root.alpha > 0 ? 1 : slot.root.alpha)
            })
        },

        bounds() {
            return { x: 640, y: CARD.y + CARD.h / 2, w: 900, h: CARD.h + 46 }
        },

        clear,

        destroy() {
            clear()
            lock.destroy()
        },
    }
}

export type Cards = ReturnType<typeof createCards>
