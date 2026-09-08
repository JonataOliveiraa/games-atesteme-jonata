import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { Goal } from '../types'

/**
 * O que sai da máquina quando a criança aperta o TESTAR.
 *
 * Isto fica em `Graphics` de propósito: resultado é MOVIMENTO, e movimento não
 * cabe num PNG. O que é móvel — chassi, encaixes, botão, prateleira — é
 * textura; o que voa, sai, pisca e some é desenhado aqui.
 */

const drawNote = (g: Phaser.GameObjects.Graphics, r: number, color: number) => {
    g.fillStyle(color, 1)
    g.fillEllipse(-r * 0.32, r * 0.52, r * 0.62, r * 0.48)
    g.fillRoundedRect(-r * 0.08, -r * 0.7, r * 0.18, r * 1.3, r * 0.09)
    g.fillRoundedRect(-r * 0.08, -r * 0.86, r * 0.8, r * 0.3, r * 0.13)
}

async function music(scene: Phaser.Scene, x: number, y: number) {
    const jobs: Array<Promise<unknown>> = []
    for (let i = 0; i < 7; i++) {
        const g = scene.add.graphics().setDepth(DEPTH.fx)
        drawNote(g, 22, i % 2 === 0 ? C.hard : C.gold)
        g.setPosition(x + Phaser.Math.Between(-70, 70), y)
        jobs.push(FX.seq(
            () => FX.wait(scene, i * 110),
            () => FX.to(scene, g, {
                y: y - Phaser.Math.Between(150, 240),
                x: g.x + Phaser.Math.Between(-60, 60),
                alpha: 0,
                angle: Phaser.Math.Between(-40, 40),
            }, { duration: 900, ease: 'Sine.easeOut' }),
        ).then(() => g.destroy()))
    }
    jobs.push(FX.ping(scene, x, y, C.hard, { radius: 130, duration: 620 }))
    await Promise.all(jobs)
}

async function photo(scene: Phaser.Scene, x: number, y: number) {
    await FX.flash(scene, 0xffffff, { duration: 260, peak: 0.7 })

    const card = scene.add.graphics().setDepth(DEPTH.fx)
    card.fillStyle(C.ink, 1)
    card.fillRoundedRect(-64, -54, 128, 108, 10)
    card.fillStyle(C.white, 1)
    card.fillRoundedRect(-58, -48, 116, 96, 7)
    card.fillStyle(0x7dd3fc, 1)
    card.fillRoundedRect(-52, -42, 104, 62, 5)
    card.fillStyle(0x86efac, 1)
    card.fillTriangle(-52, 20, -6, -20, 30, 20)
    card.fillStyle(C.gold, 1)
    card.fillCircle(28, -26, 11)
    card.setPosition(x, y).setScale(0.2).setAlpha(0)

    await FX.to(scene, card, { scale: 1, alpha: 1, y: y - 60 },
        { duration: 380, ease: 'Back.easeOut' })
    await FX.wait(scene, 480)
    await FX.to(scene, card, { alpha: 0, y: y - 120 }, { duration: 300 })
    card.destroy()
}

async function paper(scene: Phaser.Scene, x: number, y: number, scribble: boolean) {
    const sheet = scene.add.graphics().setDepth(DEPTH.fx)
    sheet.fillStyle(C.ink, 1)
    sheet.fillRoundedRect(-48, -62, 96, 124, 8)
    sheet.fillStyle(C.white, 1)
    sheet.fillRoundedRect(-43, -57, 86, 114, 6)
    if (scribble) {
        sheet.lineStyle(6, C.warn, 1)
        sheet.beginPath()
        sheet.moveTo(-30, -30)
        for (let i = 0; i < 6; i++) sheet.lineTo(i % 2 === 0 ? 28 : -28, -30 + i * 14)
        sheet.strokePath()
    } else {
        sheet.fillStyle(C.inkSoft, 0.6)
        for (let i = 0; i < 5; i++) sheet.fillRoundedRect(-28, -38 + i * 18, 56, 7, 3)
    }
    sheet.setPosition(x, y - 20).setAlpha(0)

    await FX.to(scene, sheet, { alpha: 1, y: y + 70 }, { duration: 620, ease: 'Quad.easeOut' })
    await FX.wait(scene, 420)
    await FX.to(scene, sheet, { alpha: 0, y: y + 110 }, { duration: 300 })
    sheet.destroy()
}

async function dance(scene: Phaser.Scene, x: number, y: number) {
    await Promise.all([
        FX.stars(scene, x, y - 40, { color: C.gold, count: 12, rise: 150 }),
        FX.sparks(scene, x, y, { color: C.ok, count: 20, spread: 200 }),
    ])
}

async function draw(scene: Phaser.Scene, x: number, y: number) {
    const g = scene.add.graphics().setDepth(DEPTH.fx)
    const colors = [C.hard, C.gold, C.ok, C.soft]
    for (let i = 0; i < 4; i++) {
        g.lineStyle(9, colors[i], 1)
        g.beginPath()
        g.moveTo(x - 90, y - 40 + i * 26)
        g.lineTo(x + 90, y - 54 + i * 26)
        g.strokePath()
    }
    g.setAlpha(0)
    await FX.to(scene, g, { alpha: 1 }, { duration: 240 })
    await FX.wait(scene, 500)
    await FX.to(scene, g, { alpha: 0 }, { duration: 280 })
    g.destroy()
}

const PAINTER: Record<Goal, (scene: Phaser.Scene, x: number, y: number) => Promise<void>> = {
    music,
    photo,
    dance,
    draw,
    print: (scene, x, y) => paper(scene, x, y, false),
    write: (scene, x, y) => paper(scene, x, y, false),
}

/** Deu certo: a máquina faz o que foi pedido. */
export function playResult(scene: Phaser.Scene, goal: Goal, x: number, y: number) {
    return PAINTER[goal](scene, x, y)
}

/**
 * Deu errado, e é para dar vontade de ver de novo.
 *
 * Fumacinha, um papel rabiscado saindo de onde não devia sair papel, e nada de
 * som de buzina. O erro aqui não é castigo: é a máquina obedecendo direitinho
 * a uma ordem que não era para ela.
 */
export async function playWrong(scene: Phaser.Scene, x: number, y: number) {
    const puffs: Array<Promise<unknown>> = []
    for (let i = 0; i < 5; i++) {
        const g = scene.add.graphics().setDepth(DEPTH.fx)
        g.fillStyle(0xb9c6d4, 0.9)
        g.fillCircle(0, 0, 20 + i * 3)
        g.setPosition(x + Phaser.Math.Between(-40, 40), y - 120)
        puffs.push(FX.seq(
            () => FX.wait(scene, i * 90),
            () => FX.to(scene, g, {
                y: g.y - Phaser.Math.Between(90, 150),
                x: g.x + Phaser.Math.Between(-50, 50),
                scale: 1.7,
                alpha: 0,
            }, { duration: 780, ease: 'Sine.easeOut' }),
        ).then(() => g.destroy()))
    }
    await Promise.all([
        ...puffs,
        paper(scene, x, y, true),
        FX.ping(scene, x, y, C.warn, { radius: 120, duration: 520 }),
    ])
}
