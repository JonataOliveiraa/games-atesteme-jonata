import Phaser from 'phaser'
import { ISLAND } from '../data/island'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Code, Word } from '../types'

export const SYMBOL_SHEET = 'simbolos-ilha'

export type Tone = 'idle' | 'ok' | 'wrong' | 'dim' | 'hot'

const TONES: Record<Tone, { fill: number; border: number; width: number; alpha: number }> = {
    idle: { fill: C.cream, border: C.creamEdge, width: 5, alpha: 1 },
    ok: { fill: C.cream, border: C.ok, width: 8, alpha: 1 },
    wrong: { fill: C.cream, border: C.bad, width: 8, alpha: 1 },
    dim: { fill: C.creamDeep, border: C.creamEdge, width: 5, alpha: 0.45 },
    hot: { fill: C.white, border: C.warn, width: 8, alpha: 1 },
}

export interface Card {
    container: Phaser.GameObjects.Container
    word: Word
    code: Code
    setTone(tone: Tone): void
    destroy(): void
}

export function paintPanel(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    fill: number,
    border: number,
    width = 5,
    radius = 22,
) {
    g.clear()
    g.fillStyle(C.ink, 0.18)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, radius)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.lineStyle(width, border, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.fillStyle(C.white, 0.35)
    g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, h * 0.22, radius * 0.5)
}

/**
 * O som tem DESENHO próprio — uma onda, que não é a figura da palavra. É o que
 * deixa o jogo inteiro jogável no mudo, e é a partitura do exemplo oficial da
 * BNCC. Cada onda é diferente pela silhueta, nunca pela cor.
 */
function drawWave(g: Phaser.GameObjects.Graphics, word: Word, size: number, color: number) {
    const w = size * 0.62
    const h = size * 0.34
    g.lineStyle(Math.max(5, size * 0.055), color, 1)

    if (ISLAND[word].sound === 'chocalho') {
        const points: Phaser.Math.Vector2[] = []
        for (let i = 0; i <= 12; i++) {
            points.push(new Phaser.Math.Vector2(
                -w / 2 + (w * i) / 12,
                (i % 2 === 0 ? -1 : 1) * h * 0.32,
            ))
        }
        g.strokePoints(points, false, false)
        return
    }

    if (ISLAND[word].sound === 'agua') {
        const points: Phaser.Math.Vector2[] = []
        for (let i = 0; i <= 40; i++) {
            const t = i / 40
            points.push(new Phaser.Math.Vector2(
                -w / 2 + w * t,
                -Math.sin(t * Math.PI * 2) * h * 0.5,
            ))
        }
        g.strokePoints(points, false, false)
        return
    }

    if (ISLAND[word].sound === 'tambor') {
        const bar = Math.max(7, size * 0.075)
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h * 0.6, bar, h * 1.2, bar / 2)
        const points: Phaser.Math.Vector2[] = []
        for (let i = 0; i <= 30; i++) {
            const t = i / 30
            points.push(new Phaser.Math.Vector2(
                -w / 2 + bar + w * 0.9 * t,
                -Math.cos(t * Math.PI * 3) * h * 0.45 * (1 - t),
            ))
        }
        g.strokePoints(points, false, false)
        return
    }

    const bar = Math.max(8, size * 0.085)
    g.fillStyle(color, 1)
    g.fillRoundedRect(-w * 0.34, -h * 0.6, bar, h * 1.2, bar / 2)
    g.fillRoundedRect(w * 0.16, -h * 0.6, bar, h * 1.2, bar / 2)
}

/** O desenho de reserva, para o jogo rodar antes de a arte existir. */
function drawFigureFallback(g: Phaser.GameObjects.Graphics, word: Word, size: number) {
    const r = size * 0.24
    g.fillStyle(C.creamDeep, 1)
    g.fillCircle(0, 0, size * 0.36)
    g.lineStyle(Math.max(4, size * 0.04), C.sandDeep, 1)
    g.strokeCircle(0, 0, size * 0.36)
    g.fillStyle(C.sandDeep, 1)

    if (word === 'SOL') {
        g.fillCircle(0, 0, r * 0.62)
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4
            g.fillCircle(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05, r * 0.16)
        }
        return
    }

    if (word === 'PEIXE') {
        g.fillEllipse(r * 0.12, 0, r * 1.5, r * 0.9)
        g.fillTriangle(-r * 0.6, 0, -r * 1.2, -r * 0.5, -r * 1.2, r * 0.5)
        return
    }

    if (word === 'LUA') {
        g.lineStyle(Math.max(6, size * 0.09), C.sandDeep, 1)
        g.beginPath()
        g.arc(r * 0.2, 0, r * 0.8, Phaser.Math.DegToRad(50), Phaser.Math.DegToRad(310), false)
        g.strokePath()
        return
    }

    g.fillCircle(0, -r * 0.42, r * 0.3)
    g.fillCircle(-r * 0.44, r * 0.32, r * 0.3)
    g.fillCircle(r * 0.44, r * 0.32, r * 0.3)
}

function buildSymbol(
    scene: Phaser.Scene,
    word: Word,
    code: Code,
    size: number,
): Phaser.GameObjects.GameObject[] {
    if (code === 'cor') {
        const g = scene.add.graphics()
        g.fillStyle(ISLAND[word].colorDark, 1)
        g.fillCircle(0, size * 0.02, size * 0.3)
        g.fillStyle(ISLAND[word].color, 1)
        g.fillCircle(0, 0, size * 0.3)
        g.fillStyle(C.white, 0.35)
        g.fillEllipse(-size * 0.09, -size * 0.11, size * 0.2, size * 0.12)
        return [g]
    }

    if (code === 'som') {
        const g = scene.add.graphics()
        drawWave(g, word, size, C.ink)
        return [g]
    }

    if (scene.textures.exists(SYMBOL_SHEET)) {
        const sprite = scene.add.sprite(0, 0, SYMBOL_SHEET, ISLAND[word].frame)
        sprite.setDisplaySize(size * 0.82, size * 0.82)
        return [sprite]
    }

    const g = scene.add.graphics()
    drawFigureFallback(g, word, size)
    const label = scene.add.text(0, size * 0.36, word, {
        fontFamily: FONT.body,
        fontSize: SIZE.placeholder,
        color: CSS.inkSoft,
    }).setOrigin(0.5)
    return [g, label]
}

export function createCard(
    scene: Phaser.Scene,
    word: Word,
    code: Code,
    size: number,
): Card {
    const container = scene.add.container(0, 0)
    const bg = scene.add.graphics()
    paintPanel(bg, size, size, TONES.idle.fill, TONES.idle.border, TONES.idle.width)
    container.add(bg)
    buildSymbol(scene, word, code, size).forEach(part => container.add(part))

    return {
        container,
        word,
        code,
        setTone(tone: Tone) {
            const t = TONES[tone]
            paintPanel(bg, size, size, t.fill, t.border, t.width)
            container.setAlpha(t.alpha)
        },
        destroy() {
            container.destroy()
        },
    }
}
