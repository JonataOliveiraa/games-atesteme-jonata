import Phaser from 'phaser'
import { C } from '../data/theme'
import type { Goal } from '../types'

/**
 * Os desenhos que carregam a regra, e o símbolo do pedido.
 *
 * A mão e a seta aparecem sempre no MESMO lugar: gravadas na entrada que
 * recusou. É essa repetição que faz "mão" virar sinônimo de peça e "seta"
 * virar sinônimo de ordem, sem uma frase.
 *
 * Todos desenham em torno de (0,0) — assim o container pode ser escalado sem
 * a figura sair voando.
 */

/** PEÇA: a mão encosta no objeto. */
export function drawHandTouch(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-46 * u, -44 * u, 62 * u, 50 * u, 12 * u)
    g.fillStyle(C.hardDark, 1)
    g.fillRoundedRect(-41 * u, -39 * u, 52 * u, 40 * u, 9 * u)
    g.fillStyle(C.hard, 1)
    g.fillRoundedRect(-41 * u, -39 * u, 52 * u, 31 * u, 9 * u)
    g.fillStyle(C.white, 0.5)
    g.fillRoundedRect(-33 * u, -33 * u, 36 * u, 9 * u, 4 * u)

    g.lineStyle(5 * u, C.gold, 1)
    for (let i = 1; i <= 2; i++) {
        g.beginPath()
        g.arc(6 * u, -6 * u, (10 + i * 11) * u,
            Phaser.Math.DegToRad(-60), Phaser.Math.DegToRad(30), false)
        g.strokePath()
    }

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(6 * u, -14 * u, 42 * u, 20 * u, 10 * u)
    g.fillRoundedRect(16 * u, -4 * u, 34 * u, 42 * u, 14 * u)
    g.fillStyle(0xf7c99a, 1)
    g.fillRoundedRect(9 * u, -11 * u, 38 * u, 14 * u, 7 * u)
    g.fillRoundedRect(19 * u, -2 * u, 28 * u, 36 * u, 11 * u)
    g.fillStyle(0xe0a97a, 1)
    g.fillRoundedRect(24 * u, 8 * u, 20 * u, 5 * u, 2 * u)
    g.fillRoundedRect(24 * u, 18 * u, 20 * u, 5 * u, 2 * u)
}

/** PROGRAMA: a ficha manda uma seta para a peça. */
export function drawOrder(g: Phaser.GameObjects.Graphics, size: number) {
    const u = size / 100

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-48 * u, -30 * u, 46 * u, 46 * u, 13 * u)
    g.fillStyle(C.softDark, 1)
    g.fillRoundedRect(-44 * u, -26 * u, 38 * u, 38 * u, 10 * u)
    g.fillStyle(C.soft, 1)
    g.fillRoundedRect(-44 * u, -26 * u, 38 * u, 30 * u, 10 * u)
    g.fillStyle(C.white, 1)
    g.fillCircle(-25 * u, -8 * u, 7 * u)

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(16 * u, -4 * u, 36 * u, 32 * u, 9 * u)
    g.fillStyle(C.hardDark, 1)
    g.fillRoundedRect(20 * u, 0, 28 * u, 24 * u, 6 * u)
    g.fillStyle(C.hard, 1)
    g.fillRoundedRect(20 * u, 0, 28 * u, 18 * u, 6 * u)

    g.lineStyle(9 * u, C.gold, 1)
    g.beginPath()
    g.moveTo(-16 * u, -34 * u)
    g.lineTo(6 * u, -42 * u)
    g.lineTo(28 * u, -26 * u)
    g.strokePath()
    g.fillStyle(C.gold, 1)
    g.fillTriangle(18 * u, -32 * u, 38 * u, -30 * u, 24 * u, -12 * u)
}

// ───────────────────────────────────────────── o pedido, no visor

function note(g: Phaser.GameObjects.Graphics, u: number, color: number) {
    g.fillStyle(color, 1)
    g.fillEllipse(-14 * u, 24 * u, 26 * u, 20 * u)
    g.fillEllipse(22 * u, 16 * u, 26 * u, 20 * u)
    g.fillRoundedRect(-3 * u, -30 * u, 8 * u, 56 * u, 4 * u)
    g.fillRoundedRect(31 * u, -38 * u, 8 * u, 56 * u, 4 * u)
    g.fillRoundedRect(-3 * u, -38 * u, 42 * u, 14 * u, 6 * u)
}

function camera(g: Phaser.GameObjects.Graphics, u: number, color: number) {
    g.fillStyle(color, 1)
    g.fillRoundedRect(-34 * u, -18 * u, 68 * u, 44 * u, 10 * u)
    g.fillRoundedRect(-16 * u, -30 * u, 26 * u, 14 * u, 5 * u)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 4 * u, 15 * u)
    g.fillStyle(color, 1)
    g.fillCircle(0, 4 * u, 8 * u)
    for (let i = 0; i < 5; i++) {
        const a = Phaser.Math.DegToRad(-150 + i * 30)
        g.fillCircle(Math.cos(a) * 46 * u, -22 * u + Math.sin(a) * 20 * u, 4 * u)
    }
}

function page(g: Phaser.GameObjects.Graphics, u: number, color: number) {
    g.fillStyle(color, 1)
    g.fillRoundedRect(-26 * u, -34 * u, 52 * u, 66 * u, 8 * u)
    g.fillStyle(C.ink, 0.55)
    for (let i = 0; i < 4; i++) g.fillRoundedRect(-16 * u, (-20 + i * 14) * u, 32 * u, 6 * u, 3 * u)
    g.fillStyle(color, 1)
    g.fillTriangle(-40 * u, 30 * u, 40 * u, 30 * u, 0, 44 * u)
}

function dancer(g: Phaser.GameObjects.Graphics, u: number, color: number) {
    g.fillStyle(color, 1)
    g.fillCircle(0, -30 * u, 14 * u)
    g.fillRoundedRect(-9 * u, -16 * u, 18 * u, 30 * u, 8 * u)
    g.fillRoundedRect(-34 * u, -14 * u, 28 * u, 9 * u, 4 * u)
    g.fillRoundedRect(6 * u, -26 * u, 28 * u, 9 * u, 4 * u)
    g.fillRoundedRect(-16 * u, 12 * u, 10 * u, 28 * u, 5 * u)
    g.fillRoundedRect(8 * u, 12 * u, 10 * u, 28 * u, 5 * u)
    g.lineStyle(5 * u, color, 0.8)
    g.beginPath()
    g.arc(0, 0, 50 * u, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(40), false)
    g.strokePath()
}

function brush(g: Phaser.GameObjects.Graphics, u: number, color: number) {
    g.fillStyle(color, 1)
    g.fillRoundedRect(-8 * u, -40 * u, 18 * u, 50 * u, 6 * u)
    g.fillTriangle(-12 * u, 10 * u, 14 * u, 10 * u, 1 * u, 38 * u)
    g.lineStyle(7 * u, color, 0.75)
    g.beginPath()
    g.moveTo(-40 * u, 34 * u)
    g.lineTo(-16 * u, 20 * u)
    g.strokePath()
    g.beginPath()
    g.moveTo(22 * u, 30 * u)
    g.lineTo(42 * u, 16 * u)
    g.strokePath()
}

const GOAL_PAINTER: Record<Goal, (g: Phaser.GameObjects.Graphics, u: number, c: number) => void> = {
    music: note,
    photo: camera,
    print: page,
    dance: dancer,
    draw: brush,
    write: page,
}

/** O símbolo do pedido, desenhado dentro do visor do chassi. */
export function drawGoal(
    g: Phaser.GameObjects.Graphics,
    goal: Goal,
    size: number,
    color: number,
) {
    GOAL_PAINTER[goal](g, size / 100, color)
}
