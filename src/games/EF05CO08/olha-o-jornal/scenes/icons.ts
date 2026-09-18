import Phaser from 'phaser'
import type { Clue } from '../types'
import { C } from '../data/theme'

/** Pictogramas das três linhas da capa. Interface é sempre Graphics. */
export function drawClueIcon(g: Phaser.GameObjects.Graphics, clue: Clue, cx: number, cy: number) {
    const s = 13
    g.lineStyle(3, C.ink, 1)
    if (clue === 'author') {
        g.fillStyle(C.mustard, 1)
        g.fillTriangle(cx - s, cy + s, cx + s * 0.2, cy - s, cx + s, cy - s * 0.2)
        g.strokeTriangle(cx - s, cy + s, cx + s * 0.2, cy - s, cx + s, cy - s * 0.2)
        g.lineBetween(cx - s, cy + s, cx - s * 0.2, cy + s * 0.3)
        return
    }
    if (clue === 'year') {
        g.fillStyle(C.blueSoft, 1)
        g.fillRect(cx - s, cy - s * 0.7, s * 2, s * 1.7)
        g.strokeRect(cx - s, cy - s * 0.7, s * 2, s * 1.7)
        g.lineBetween(cx - s, cy - s * 0.1, cx + s, cy - s * 0.1)
        g.lineBetween(cx - s * 0.5, cy - s * 1.1, cx - s * 0.5, cy - s * 0.4)
        g.lineBetween(cx + s * 0.5, cy - s * 1.1, cx + s * 0.5, cy - s * 0.4)
        return
    }
    g.fillStyle(C.greenSoft, 1)
    g.fillCircle(cx - s * 0.2, cy - s * 0.2, s * 0.8)
    g.strokeCircle(cx - s * 0.2, cy - s * 0.2, s * 0.8)
    g.lineBetween(cx + s * 0.35, cy + s * 0.35, cx + s, cy + s)
}

export const CLUE_LABEL: Record<Clue, string> = {
    author: 'quem escreveu',
    year: 'quando',
    origin: 'de onde tirou',
}
