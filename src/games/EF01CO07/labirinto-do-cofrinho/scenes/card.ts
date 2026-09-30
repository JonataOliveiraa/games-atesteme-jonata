import Phaser from 'phaser'
import { CARD } from '../data/layout'
import { CARD_ART, PIECES } from '../data/files'
import { CHILD_NAME } from '../data/people'
import { C, CSS, FONT, LINE, SIZE } from '../data/theme'
import type { Datum, Point } from '../types'

type G = Phaser.GameObjects.Graphics

export function paintFace(g: G, s: number) {
    const u = s / 100
    g.fillStyle(C.aqua, 1)
    g.fillEllipse(0, 44 * u, 76 * u, 40 * u)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeEllipse(0, 44 * u, 76 * u, 40 * u)
    g.fillStyle(C.hair, 1)
    g.fillCircle(-24 * u, -26 * u, 12 * u)
    g.fillCircle(24 * u, -26 * u, 12 * u)
    g.strokeCircle(-24 * u, -26 * u, 12 * u)
    g.strokeCircle(24 * u, -26 * u, 12 * u)
    g.fillStyle(C.skin, 1)
    g.fillCircle(0, 0, 28 * u)
    g.strokeCircle(0, 0, 28 * u)
    g.fillStyle(C.hair, 1)
    g.slice(0, 0, 28 * u, Math.PI, Math.PI * 2, false)
    g.fillPath()
    g.fillStyle(C.skin, 1)
    g.fillEllipse(0, -2 * u, 40 * u, 16 * u)
    g.fillStyle(C.ink, 1)
    g.fillEllipse(-10 * u, 4 * u, 7 * u, 10 * u)
    g.fillEllipse(10 * u, 4 * u, 7 * u, 10 * u)
    g.fillStyle(C.white, 1)
    g.fillCircle(-8.5 * u, 1.5 * u, 2 * u)
    g.fillCircle(11.5 * u, 1.5 * u, 2 * u)
    g.fillStyle(C.blush, 0.7)
    g.fillCircle(-17 * u, 12 * u, 4 * u)
    g.fillCircle(17 * u, 12 * u, 4 * u)
    g.lineStyle(Math.max(2, 2.5 * u), C.ink, 1)
    g.beginPath()
    g.arc(0, 12 * u, 6 * u, 0.2, Math.PI - 0.2, false)
    g.strokePath()
}

export function paintHome(g: G, s: number) {
    const u = s / 100
    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(C.wall, 1)
    g.fillRect(-30 * u, -6 * u, 60 * u, 44 * u)
    g.strokeRect(-30 * u, -6 * u, 60 * u, 44 * u)
    g.fillStyle(C.roof, 1)
    g.fillTriangle(-40 * u, -4 * u, 40 * u, -4 * u, 0, -40 * u)
    g.strokeTriangle(-40 * u, -4 * u, 40 * u, -4 * u, 0, -40 * u)
    g.fillStyle(C.gold, 1)
    g.fillRoundedRect(-8 * u, 12 * u, 16 * u, 26 * u, { tl: 7 * u, tr: 7 * u, bl: 0, br: 0 })
    g.strokeRoundedRect(-8 * u, 12 * u, 16 * u, 26 * u, { tl: 7 * u, tr: 7 * u, bl: 0, br: 0 })
    g.fillStyle(C.sky2, 1)
    g.fillRect(12 * u, 4 * u, 12 * u, 12 * u)
    g.strokeRect(12 * u, 4 * u, 12 * u, 12 * u)
}

export function paintSchool(g: G, s: number) {
    const u = s / 100
    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(C.school, 1)
    g.fillRect(-40 * u, -4 * u, 80 * u, 42 * u)
    g.strokeRect(-40 * u, -4 * u, 80 * u, 42 * u)
    g.fillStyle(C.roof, 1)
    g.fillTriangle(-46 * u, -2 * u, 46 * u, -2 * u, 0, -30 * u)
    g.strokeTriangle(-46 * u, -2 * u, 46 * u, -2 * u, 0, -30 * u)
    g.fillStyle(C.bell, 1)
    g.fillRect(-6 * u, -44 * u, 12 * u, 12 * u)
    g.strokeRect(-6 * u, -44 * u, 12 * u, 12 * u)
    g.fillCircle(0, -34 * u, 5 * u)
    g.fillStyle(C.white, 1)
    ;[-26, 18].forEach(x => {
        g.fillRect(x * u, 6 * u, 10 * u, 10 * u)
        g.strokeRect(x * u, 6 * u, 10 * u, 10 * u)
    })
    g.fillStyle(C.gold, 1)
    g.fillRect(-8 * u, 16 * u, 16 * u, 22 * u)
    g.strokeRect(-8 * u, 16 * u, 16 * u, 22 * u)
}

const TILE: Record<Datum, { w: number; h: number }> = {
    photo: { w: 150, h: 150 },
    name: { w: 176, h: 78 },
    home: { w: 96, h: 96 },
    school: { w: 96, h: 96 },
}

const SPOT: Record<Datum, Point> = {
    photo: { x: -118, y: 4 },
    name: { x: 92, y: -58 },
    home: { x: 36, y: 56 },
    school: { x: 148, y: 56 },
}

export const datumScale = (kind: Datum, px: number) => px / Math.max(TILE[kind].w, TILE[kind].h)

export const DATA: Datum[] = ['photo', 'name', 'home', 'school']

const ART_FIT: Record<Datum, number> = { photo: 138, name: 0, home: 92, school: 96 }

function artDatum(scene: Phaser.Scene, kind: Datum): Phaser.GameObjects.GameObject | null {
    if (kind === 'name' || !scene.textures.exists(PIECES)) return null
    const image = scene.add.image(0, 0, PIECES, kind)
    image.setScale(ART_FIT[kind] / Math.max(image.width, image.height))
    return image
}

export function createDatum(scene: Phaser.Scene, kind: Datum, scale = 1): Phaser.GameObjects.Container {
    const art = artDatum(scene, kind)
    if (art) return scene.add.container(0, 0, [art]).setScale(scale)
    const { w, h } = TILE[kind]
    const g = scene.add.graphics()
    g.fillStyle(kind === 'photo' ? 0xdff6f1 : C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, kind === 'name' ? h / 2 : 18)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, kind === 'name' ? h / 2 : 18)
    const parts: Phaser.GameObjects.GameObject[] = [g]
    if (kind === 'photo') paintFace(g, w * 0.92)
    if (kind === 'home') paintHome(g, w * 0.8)
    if (kind === 'school') paintSchool(g, w * 0.8)
    if (kind === 'name') {
        parts.push(
            scene.add
                .text(0, 2, CHILD_NAME.toUpperCase(), { fontFamily: FONT.black, fontSize: `${SIZE.name}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2),
        )
    }
    return scene.add.container(0, 0, parts).setScale(scale)
}

export interface IdCard {
    readonly container: Phaser.GameObjects.Container
    datum(kind: Datum): Phaser.GameObjects.Container
    datumWorld(kind: Datum): Point
    destroy(): void
}

function artCard(scene: Phaser.Scene): Phaser.GameObjects.Image | null {
    if (!scene.textures.exists(PIECES)) return null
    const image = scene.add.image(0, 0, PIECES, 'card')
    return image.setScale(CARD.w / image.width)
}

export function createIdCard(scene: Phaser.Scene, x: number, y: number, scale = 1): IdCard {
    const { w, h } = CARD
    const art = artCard(scene)
    const spot = (kind: Datum): Point => (art ? CARD_ART[kind] : SPOT[kind])
    const frame = art ?? scene.add.graphics()
    if (frame instanceof Phaser.GameObjects.Graphics) paintCardFrame(frame, w, h)

    const data = new Map<Datum, Phaser.GameObjects.Container>()
    DATA.forEach(kind => {
        const d = createDatum(scene, kind)
        d.setPosition(spot(kind).x, spot(kind).y)
        data.set(kind, d)
    })
    const container = scene.add.container(x, y, [frame, ...data.values()]).setScale(scale)

    return {
        container,
        datum: kind => data.get(kind) as Phaser.GameObjects.Container,
        datumWorld(kind) {
            const m = data.get(kind)?.getWorldTransformMatrix()
            return m ? { x: m.tx, y: m.ty } : { x: container.x, y: container.y }
        },
        destroy() {
            container.destroy()
        },
    }
}

function paintCardFrame(frame: Phaser.GameObjects.Graphics, w: number, h: number) {
    frame.fillStyle(C.shadow, 0.2)
    frame.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 30)
    frame.fillStyle(C.aqua, 1)
    frame.fillRoundedRect(-w / 2, -h / 2, w, h, 30)
    frame.fillStyle(C.cream, 1)
    frame.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 20)
    frame.lineStyle(5, C.ink, 1)
    frame.strokeRoundedRect(-w / 2, -h / 2, w, h, 30)
    frame.lineStyle(LINE, C.aquaDark, 1)
    frame.strokeRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 20)
}
