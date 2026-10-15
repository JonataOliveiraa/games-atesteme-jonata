import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALLOON, DEPTH, W } from '../data/layout'
import { ASKERS, labelOf, whose } from '../data/requests'
import { C, CSS, FONT } from '../data/theme'
import { OWNER_TAG, REPLY } from '../data/words'
import type { Request } from '../types'
import { infoImage } from './art'

type Point = { x: number; y: number }
type Rect = Point & { w: number; h: number }
type DoorSpot = { x: number; top: number; half: number }

/** O balão de conversa de quem bateu: quem é, a frase e a informação pedida, com desenho. */
export interface Balloon {
    show(): Promise<void>
    iconPoint(): Point
    /** a informação sai do balão para voar (o balão fica sem ela) */
    takeIcon(): Phaser.GameObjects.Image
    rect(): Rect
    hide(): Promise<void>
    destroy(): void
}

const NOTE_H = 58

/** a moldura do balão com o rabinho apontando para a porta; devolve o centro */
function frame(g: Phaser.GameObjects.Graphics, w: number, h: number, right: boolean) {
    const tailY = -h / 2 + 64
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 30)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 30)
    g.lineStyle(5, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 30)
    const edge = right ? -w / 2 : w / 2
    const tip = right ? -w / 2 - 34 : w / 2 + 34
    g.fillStyle(C.white, 1)
    g.fillTriangle(edge, tailY - 18, edge, tailY + 18, tip, tailY + 6)
    g.lineStyle(5, C.ink, 1)
    g.lineBetween(edge, tailY - 18, tip, tailY + 6)
    g.lineBetween(edge, tailY + 18, tip, tailY + 6)
    g.fillStyle(C.white, 1)
    g.fillRect(edge - (right ? 3 : 0), tailY - 15, 3, 30)
}

function place(door: DoorSpot, w: number) {
    const right = door.x + door.half + BALLOON.gap + w <= W - 16
    const x = right ? door.x + door.half + BALLOON.gap + w / 2 : door.x - door.half - BALLOON.gap - w / 2
    return { right, x }
}

async function pop(scene: Phaser.Scene, box: Phaser.GameObjects.Container, right: boolean) {
    box.setVisible(true).setScale(0.4).setAngle(right ? -6 : 6).setAlpha(0)
    await FX.to(scene, box, { scale: 1, angle: 0, alpha: 1 }, { duration: 340, ease: 'Back.easeOut' })
}

/**
 * `reply`: o Davi já respondeu (N2). A resposta fica escrita no pé do balão,
 * para a criança decidir olhando para ela.
 */
export function createBalloon(scene: Phaser.Scene, r: Request, door: DoorSpot, reply?: boolean): Balloon {
    const { w, icon: iconSize } = BALLOON
    const h = BALLOON.h + (reply === undefined ? 0 : NOTE_H)
    const top = BALLOON.y - BALLOON.h / 2
    const y = top + h / 2
    const asker = ASKERS[r.asker]
    const { right, x } = place(door, w)

    const g = scene.add.graphics()
    frame(g, w, h, right)
    const parts: Phaser.GameObjects.GameObject[] = [g]

    const left = -w / 2 + 30
    const text = (ty: number, s: string, size: number, color: string) =>
        scene.add.text(left, ty, s, { fontFamily: FONT.black, fontSize: `${size}px`, color }).setOrigin(0, 0.5).setResolution(2)
    parts.push(text(-h / 2 + 32, asker.label, 22, CSS.accent))
    parts.push(text(-h / 2 + 70, asker.hello, 28, CSS.ink))
    parts.push(text(-h / 2 + 106, `${asker.verb} ${whose(r)}`, 28, CSS.inkSoft))
    const iconAt = { x: -w / 2 + 78, y: -h / 2 + BALLOON.h - 60 }
    const icon = infoImage(scene, r.info, iconSize).setPosition(iconAt.x, iconAt.y)
    const word = scene.add
        .text(-w / 2 + 140, iconAt.y, `${labelOf(r)}?`, { fontFamily: FONT.black, fontSize: '40px', color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    if (word.width > w - 170) word.setScale((w - 170) / word.width)
    parts.push(icon, word)

    if (r.owner) {
        const tag = scene.add
            .text(w / 2 - 22, -h / 2 + 32, OWNER_TAG, {
                fontFamily: FONT.black,
                fontSize: '20px',
                color: CSS.ink,
                backgroundColor: '#ffd84d',
                padding: { x: 10, y: 4 },
            })
            .setOrigin(1, 0.5)
            .setResolution(2)
        parts.push(tag)
    }
    if (reply !== undefined) {
        const ny = h / 2 - NOTE_H / 2 - 6
        const chip = scene.add.graphics()
        chip.fillStyle(reply ? C.mint : 0xffc6d4, 1)
        chip.fillRoundedRect(-w / 2 + 18, ny - 22, w - 36, 44, 18)
        chip.lineStyle(3, C.ink, 1)
        chip.strokeRoundedRect(-w / 2 + 18, ny - 22, w - 36, 44, 18)
        const note = scene.add
            .text(0, ny, REPLY.note(reply), { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        parts.push(chip, note)
    }

    const box = scene.add.container(x, y, parts).setDepth(DEPTH.balloon).setVisible(false)

    return {
        async show() {
            await pop(scene, box, right)
            void FX.to(scene, icon, { scale: icon.scale * 1.18 }, { duration: 180, yoyo: true, ease: 'Sine.easeOut' })
        },
        iconPoint() {
            return { x: x + iconAt.x, y: y + iconAt.y }
        },
        takeIcon() {
            icon.setVisible(false)
            return infoImage(scene, r.info, iconSize)
                .setPosition(x + iconAt.x, y + iconAt.y)
                .setDepth(DEPTH.flying)
        },
        rect() {
            return { x, y, w: w + 20, h: h + 20 }
        },
        async hide() {
            await FX.to(scene, box, { alpha: 0, scale: 0.85 }, { duration: 200 })
            box.destroy()
        },
        destroy() {
            if (box.active) box.destroy()
        },
    }
}

/** Uma fala curta de quem abriu a porta (o Davi respondendo). */
export function createSay(scene: Phaser.Scene, who: string, line: string, door: DoorSpot) {
    const w = 400
    const h = 150
    const { right, x } = place(door, w)
    const y = BALLOON.y - BALLOON.h / 2 + h / 2
    const g = scene.add.graphics()
    frame(g, w, h, right)
    const name = scene.add
        .text(-w / 2 + 30, -h / 2 + 32, who, { fontFamily: FONT.black, fontSize: '22px', color: CSS.accent })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const text = scene.add
        .text(0, 18, line, { fontFamily: FONT.black, fontSize: '38px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    if (text.width > w - 50) text.setScale((w - 50) / text.width)
    const box = scene.add.container(x, y, [g, name, text]).setDepth(DEPTH.balloon).setVisible(false)
    return {
        show: () => pop(scene, box, right),
        async hide() {
            await FX.to(scene, box, { alpha: 0, scale: 0.85 }, { duration: 200 })
            box.destroy()
        },
        destroy() {
            if (box.active) box.destroy()
        },
    }
}
