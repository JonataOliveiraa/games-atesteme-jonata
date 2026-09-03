import Phaser from 'phaser'
import { C, CSS, FONT, MEDIUM_COLOR } from '../data/theme'
import type { MediumId, SubjectDef } from '../types'

const ART = 0.42

type Tone = { main: number; dark: number }

export function createSubjectArt(
    scene: Phaser.Scene,
    subject: SubjectDef,
    size: number,
): Phaser.GameObjects.Image | Phaser.GameObjects.Text {
    if (scene.textures.exists(subject.texture)) {
        return scene.add.image(0, 0, subject.texture).setDisplaySize(size, size)
    }
    const start = Math.max(8, Math.round(size * 0.24))
    const label = scene.add.text(0, 0, subject.word, {
        fontFamily: FONT.black,
        fontSize: `${start}px`,
        color: CSS.inkSoft,
        align: 'center',
    }).setOrigin(0.5).setResolution(2)
    for (let px = start; px > 7; px -= 1) {
        label.setFontSize(`${px}px`)
        if (label.width <= size) break
    }
    return label
}

function drawVoz(g: Phaser.GameObjects.Graphics, s: number, tone: Tone) {
    const w = s * 0.96
    const h = s * 0.84
    const hw = w / 2
    const hh = h / 2
    const r = s * 0.3
    const edge = s * 0.055

    g.fillStyle(C.ink, 1)
    g.fillTriangle(-hw * 0.34, hh - edge, hw * 0.1, hh - edge, -hw * 0.5, hh + s * 0.34)
    g.fillRoundedRect(-hw - edge, -hh - edge, w + edge * 2, h + edge * 2, r + edge)

    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-hw, -hh, w, h, r)
    g.fillStyle(tone.main, 1)
    g.fillTriangle(-hw * 0.3, hh - s * 0.06, hw * 0.06, hh - s * 0.06, -hw * 0.42, hh + s * 0.26)
    g.fillRoundedRect(-hw, -hh, w, h - s * 0.05, r)

    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-hw + s * 0.11, -hh + s * 0.11, w - s * 0.22, h - s * 0.24, r * 0.68)
    g.fillStyle(tone.main, 0.22)
    g.fillEllipse(0, hh - s * 0.22, w * 0.5, s * 0.12)
}

function drawCarta(g: Phaser.GameObjects.Graphics, s: number, tone: Tone) {
    const w = s * 1.04
    const h = s * 0.86
    const hw = w / 2
    const hh = h / 2
    const r = s * 0.12
    const edge = s * 0.055

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-hw - edge, -hh - edge, w + edge * 2, h + edge * 2, r + edge)
    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-hw, -hh, w, h, r)
    g.fillStyle(tone.main, 1)
    g.fillRoundedRect(-hw, -hh, w, h - s * 0.05, r)

    g.lineStyle(s * 0.075, tone.dark, 1)
    g.beginPath()
    g.moveTo(-hw + s * 0.03, -hh + s * 0.05)
    g.lineTo(0, s * 0.03)
    g.lineTo(hw - s * 0.03, -hh + s * 0.05)
    g.strokePath()

    g.fillStyle(C.white, 0.34)
    g.fillEllipse(-hw * 0.44, -hh + s * 0.09, w * 0.34, s * 0.08)

    const win = s * 0.62
    g.fillStyle(C.ink, 0.18)
    g.fillRoundedRect(-win / 2 + s * 0.02, -win / 2 + s * 0.03, win, win, s * 0.08)
    g.fillStyle(C.creamEdge, 1)
    g.fillRoundedRect(-win / 2, -win / 2, win, win, s * 0.08)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-win / 2, -win / 2, win, win - s * 0.03, s * 0.08)
}

function drawCelular(g: Phaser.GameObjects.Graphics, s: number, tone: Tone) {
    const w = s * 0.76
    const h = s * 1.06
    const hw = w / 2
    const hh = h / 2
    const r = s * 0.19
    const edge = s * 0.055

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-hw - edge, -hh - edge, w + edge * 2, h + edge * 2, r + edge)
    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-hw, -hh, w, h, r)
    g.fillStyle(tone.main, 1)
    g.fillRoundedRect(-hw, -hh, w, h - s * 0.05, r)

    const screenW = w * 0.74
    const screenH = h * 0.6
    g.fillStyle(C.ink, 0.18)
    g.fillRoundedRect(-screenW / 2 + s * 0.02, -screenH / 2 + s * 0.03, screenW, screenH, s * 0.08)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-screenW / 2, -screenH / 2, screenW, screenH, s * 0.08)

    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-w * 0.15, -hh + s * 0.07, w * 0.3, s * 0.05, s * 0.03)
    g.fillStyle(C.white, 0.9)
    g.fillRoundedRect(-w * 0.18, hh - s * 0.13, w * 0.36, s * 0.055, s * 0.03)
    g.fillStyle(C.white, 0.3)
    g.fillEllipse(-hw * 0.5, -hh + s * 0.24, w * 0.3, s * 0.09)
}

function drawShell(g: Phaser.GameObjects.Graphics, medium: MediumId, size: number) {
    const tone = MEDIUM_COLOR[medium]
    if (medium === 'voz') drawVoz(g, size, tone)
    else if (medium === 'carta') drawCarta(g, size, tone)
    else drawCelular(g, size, tone)
}

export function createMessage(
    scene: Phaser.Scene,
    subject: SubjectDef,
    medium: MediumId,
    size: number,
) {
    const box = scene.add.container(0, 0)
    const g = scene.add.graphics()
    drawShell(g, medium, size)
    box.add(g)
    box.add(createSubjectArt(scene, subject, size * ART))
    return box
}

export function createPortrait(scene: Phaser.Scene, frame: number, size: number) {
    const box = scene.add.container(0, 0)
    const g = scene.add.graphics()
    const hs = size / 2
    const r = size * 0.26

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-hs - 5, -hs - 5, size + 10, size + 10, r + 4)
    g.fillStyle(C.creamEdge, 1)
    g.fillRoundedRect(-hs, -hs, size, size, r)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-hs, -hs, size, size * 0.94, r)
    box.add(g)

    if (scene.textures.exists('personagens')) {
        const sprite = scene.add.sprite(0, size * 0.04, 'personagens', frame)
        sprite.setDisplaySize(size * 0.86 * (400 / 500), size * 0.86)
        box.add(sprite)
    } else {
        const fallback = scene.add.graphics()
        fallback.fillStyle(C.shirtDark, 1)
        fallback.fillRoundedRect(-size * 0.2, -size * 0.24, size * 0.4, size * 0.56, size * 0.14)
        fallback.fillStyle(C.creamDeep, 1)
        fallback.fillCircle(0, -size * 0.26, size * 0.18)
        box.add(fallback)
    }
    return box
}
