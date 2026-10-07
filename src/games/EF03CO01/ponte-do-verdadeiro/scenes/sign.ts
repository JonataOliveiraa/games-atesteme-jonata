import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { ART, BRIDGE } from '../data/files'
import { DEPTH, SIGN, SIGN_FACE } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { sentenceWords } from '../data/words'
import type { Rect, Sentence, Word } from '../types'

export interface WordBlock {
    objects: Phaser.GameObjects.GameObject[]
    hot: Rect[]
    width: number
    height: number
}

export function layoutWords(scene: Phaser.Scene, words: Word[], maxW: number, size: number): WordBlock {
    const texts = words.map(w =>
        scene.add
            .text(0, 0, w.text, { fontFamily: FONT.black, fontSize: `${size}px`, color: w.hot ? CSS.hot : CSS.ink })
            .setOrigin(0, 0.5)
            .setResolution(2),
    )
    const space = size * 0.3
    const lines: number[][] = [[]]
    let lineW = 0
    texts.forEach((t, i) => {
        const line = lines[lines.length - 1]
        const add = (line.length ? space : 0) + t.width
        if (line.length && lineW + add > maxW) {
            lines.push([i])
            lineW = t.width
        } else {
            line.push(i)
            lineW += add
        }
    })
    const lineH = size * 1.22
    const pills = scene.add.graphics()
    const hot: Rect[] = []
    let widest = 0
    lines.forEach((line, li) => {
        const width = line.reduce((acc, i, k) => acc + texts[i].width + (k ? space : 0), 0)
        widest = Math.max(widest, width)
        let x = -width / 2
        const y = (li - (lines.length - 1) / 2) * lineH
        line.forEach(i => {
            const t = texts[i]
            t.setPosition(x, y + 2)
            if (words[i].hot) {
                const r = { x: x + t.width / 2, y, w: t.width + 18, h: size + 12 }
                hot.push(r)
                pills.fillStyle(C.pinkSoft, 1)
                pills.fillRoundedRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h, r.h / 2)
                pills.lineStyle(3, C.hot, 0.85)
                pills.strokeRoundedRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h, r.h / 2)
            }
            x += t.width + space
        })
    })
    return { objects: [pills, ...texts], hot, width: widest, height: lines.length * lineH }
}

export interface Sign {
    set(s: Sentence): void
    reveal(): Promise<void>
    faceRect(): Rect
    hotRect(): Rect | undefined
    destroy(): void
}

export function createSign(scene: Phaser.Scene): Sign {
    const texture = scene.textures.get(BRIDGE)
    const f = ART.sign.frame
    if (!texture.has('sign')) texture.add('sign', 0, f.x, f.y, f.w, f.h)
    const faceX = (ART.sign.face.x + ART.sign.face.right) / 2
    const faceY = (ART.sign.face.y + ART.sign.face.bottom) / 2
    const board = scene.add
        .image(0, 0, BRIDGE, 'sign')
        .setOrigin((faceX - f.x) / f.w, (faceY - f.y) / f.h)
        .setScale(SIGN.scale)
    const words = scene.add.container(0, 0)
    const box = scene.add.container(SIGN.x, SIGN.y, [board, words]).setDepth(DEPTH.sign)
    let hot: Rect[] = []

    return {
        set(s) {
            words.removeAll(true)
            const block = layoutWords(scene, sentenceWords(s), SIGN_FACE.w - SIGN.padX * 2, SIGN.textSize)
            words.add(block.objects)
            hot = block.hot
            scene.tweens.killTweensOf(words)
            words.setAlpha(1).setScale(1)
        },
        async reveal() {
            words.setAlpha(0).setScale(0.86)
            await FX.to(scene, words, { alpha: 1, scale: 1 }, { duration: 320, ease: Ease.back(1.8) })
        },
        faceRect: () => ({ x: SIGN.x, y: SIGN.y, w: SIGN_FACE.w + 40, h: SIGN_FACE.h + 40 }),
        hotRect() {
            const r = hot[0]
            return r ? { x: SIGN.x + r.x, y: SIGN.y + r.y, w: r.w + 24, h: r.h + 22 } : undefined
        },
        destroy() {
            scene.tweens.killTweensOf(words)
            box.destroy()
        },
    }
}
