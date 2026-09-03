import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { drawIcon } from './icons'
import type { IconId } from '../types'

export type CardTone = 'idle' | 'ok' | 'wrong' | 'hot' | 'ghost'

const TONE: Record<CardTone, { fill: number; border: number; width: number }> = {
    idle: { fill: C.cream, border: C.woodDark, width: 7 },
    ok: { fill: C.cream, border: C.ok, width: 9 },
    wrong: { fill: C.creamDeep, border: C.bad, width: 9 },
    hot: { fill: C.white, border: C.warn, width: 10 },
    ghost: { fill: C.ink, border: C.cream, width: 6 },
}

export interface Card {
    root: Phaser.GameObjects.Container
    setTone(tone: CardTone): void
    setBadge(kind: 'none' | 'check' | 'number', value?: number): void
    destroy(): void
}

export const ICON_SHEETS = ['icones-cafe', 'icones-festa', 'icones-feira', 'icones-acampamento', 'icones-horta']

export const textureOf = (icon: IconId) => `icone-${icon}`

let sheetKey: string | undefined
let sheetOrder: IconId[] = []

/** O GameScene aponta para o sheet da missão da vez antes de montar as cartas. */
export function applySheet(key: string | undefined, order: IconId[]) {
    sheetKey = key
    sheetOrder = order
}

function fit(
    image: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
    size: number,
) {
    const scale = size / Math.max(image.width, image.height)
    image.setDisplaySize(image.width * scale, image.height * scale)
    return image
}

type IconArt =
    | Phaser.GameObjects.Image
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Graphics

function buildArt(scene: Phaser.Scene, icon: IconId, size: number): IconArt {
    const key = textureOf(icon)
    if (scene.textures.exists(key)) {
        return fit(scene.add.image(0, 0, key), size)
    }

    const frame = sheetOrder.indexOf(icon)
    if (frame >= 0 && sheetKey && scene.textures.exists(sheetKey)) {
        return fit(scene.add.sprite(0, 0, sheetKey, frame), size)
    }

    const g = scene.add.graphics()
    drawIcon(g, icon, size)
    return g
}

export function paintCard(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    tone: CardTone,
) {
    const t = TONE[tone]
    const r = 26
    g.clear()
    g.fillStyle(C.ink, 0.28)
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, r)
    g.fillStyle(t.fill, tone === 'ghost' ? 0.34 : 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    if (tone !== 'ghost') {
        g.fillStyle(C.white, 0.65)
        g.fillRoundedRect(-w / 2 + 12, -h / 2 + 9, w - 24, 16, 8)
        g.fillStyle(C.creamEdge, 0.28)
        g.fillRoundedRect(-w / 2 + 12, h / 2 - 24, w - 24, 12, 6)
    }
    g.lineStyle(t.width, t.border, tone === 'ghost' ? 0.75 : 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
}

function paintCheck(g: Phaser.GameObjects.Graphics, r: number) {
    g.clear()
    g.fillStyle(C.ink, 0.24)
    g.fillCircle(2, 4, r)
    g.fillStyle(C.okDark, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.ok, 1)
    g.fillCircle(0, -2, r - 3)
    g.lineStyle(Math.max(4, r * 0.28), C.white, 1)
    g.beginPath()
    g.moveTo(-r * 0.42, -r * 0.02)
    g.lineTo(-r * 0.1, r * 0.32)
    g.lineTo(r * 0.46, -r * 0.36)
    g.strokePath()
}

export function createCard(
    scene: Phaser.Scene,
    options: {
        icon: IconId
        label?: string
        w: number
        h: number
        iconScale?: number
    },
): Card {
    const { icon, label, w, h } = options
    const root = scene.add.container(0, 0)
    const bg = scene.add.graphics()
    paintCard(bg, w, h, 'idle')

    const size = Math.min(w, h) * (options.iconScale ?? 0.74)
    const art = buildArt(scene, icon, size).setPosition(0, label ? -h * 0.08 : 0)

    root.add([bg, art])

    let text: Phaser.GameObjects.Text | null = null
    if (label) {
        text = scene.add.text(0, h / 2 - 26, label, {
            fontFamily: FONT.black,
            fontSize: '20px',
            color: CSS.ink,
        }).setOrigin(0.5).setResolution(2)
        root.add(text)
    }

    const badge = scene.add.graphics().setPosition(w / 2 - 24, -h / 2 + 24).setVisible(false)
    const badgeText = scene.add.text(w / 2 - 24, -h / 2 + 23, '', {
        fontFamily: FONT.black,
        fontSize: '24px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2).setVisible(false)
    root.add([badge, badgeText])

    return {
        root,

        setTone(tone: CardTone) {
            paintCard(bg, w, h, tone)
            const dim = tone === 'ghost'
            art.setAlpha(dim ? 0.25 : 1)
            text?.setAlpha(dim ? 0.3 : 1)
        },

        setBadge(kind, value) {
            if (kind === 'none') {
                badge.setVisible(false)
                badgeText.setVisible(false)
                return
            }
            if (kind === 'check') {
                paintCheck(badge, 22)
                badge.setVisible(true)
                badgeText.setVisible(false)
                FX.popIn(scene, badge, { from: 0.3, duration: 300 })
                return
            }
            badge.clear()
            badge.fillStyle(C.ink, 1)
            badge.fillCircle(0, 0, 22)
            badge.fillStyle(C.teal, 1)
            badge.fillCircle(0, -2, 19)
            badge.setVisible(true)
            badgeText.setText(String(value ?? 0)).setVisible(true)
        },

        destroy() {
            root.destroy()
        },
    }
}
