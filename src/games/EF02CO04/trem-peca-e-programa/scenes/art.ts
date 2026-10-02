import Phaser from 'phaser'
import { APP, C } from '../data/theme'
import type { ItemId } from '../types'

type G = Phaser.GameObjects.Graphics

const line = (g: G, w = 5) => g.lineStyle(w, C.ink, 1)

function shadow(g: G, w: number, y = 66) {
    g.fillStyle(C.shadow, 0.12)
    g.fillEllipse(0, y, w, 16)
}

function mouse(g: G) {
    shadow(g, 90)
    line(g, 4)
    g.beginPath()
    g.moveTo(0, -46)
    g.lineTo(0, -60)
    g.lineTo(18, -66)
    g.lineTo(30, -58)
    g.strokePath()
    g.fillStyle(C.device, 1)
    g.fillEllipse(0, 6, 92, 124)
    line(g)
    g.strokeEllipse(0, 6, 92, 124)
    g.lineBetween(0, -56, 0, -6)
    g.lineBetween(-44, -6, 44, -6)
    g.fillStyle(C.deviceDark, 1)
    g.fillRoundedRect(-6, -40, 12, 24, 6)
    g.strokeRoundedRect(-6, -40, 12, 24, 6)
}

function keyboard(g: G) {
    shadow(g, 140, 42)
    g.fillStyle(C.deviceDark, 1)
    g.fillRoundedRect(-72, -30, 144, 66, 12)
    g.fillStyle(C.device, 1)
    g.fillRoundedRect(-72, -38, 144, 66, 12)
    line(g)
    g.strokeRoundedRect(-72, -38, 144, 66, 12)
    g.fillStyle(C.white, 1)
    g.lineStyle(3, C.ink, 1)
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 7; col++) {
            const x = -62 + col * 18
            const y = -30 + row * 17
            g.fillRoundedRect(x, y, 14, 13, 3)
            g.strokeRoundedRect(x, y, 14, 13, 3)
        }
    }
}

function speaker(g: G) {
    shadow(g, 110)
    g.fillStyle(C.lilac, 1)
    g.fillRoundedRect(-52, -66, 104, 130, 18)
    line(g)
    g.strokeRoundedRect(-52, -66, 104, 130, 18)
    g.fillStyle(C.device, 1)
    g.fillCircle(0, 16, 34)
    g.strokeCircle(0, 16, 34)
    g.fillStyle(C.deviceDark, 1)
    g.fillCircle(0, 16, 15)
    g.strokeCircle(0, 16, 15)
    g.fillStyle(C.device, 1)
    g.fillCircle(0, -36, 13)
    g.strokeCircle(0, -36, 13)
}

function gamepad(g: G) {
    shadow(g, 140, 46)
    g.fillStyle(C.device, 1)
    g.fillRoundedRect(-70, -30, 140, 62, 30)
    g.fillCircle(-46, 20, 26)
    g.fillCircle(46, 20, 26)
    line(g)
    g.strokeRoundedRect(-70, -30, 140, 62, 30)
    g.beginPath()
    g.arc(-46, 20, 26, 0.15 * Math.PI, 0.95 * Math.PI)
    g.strokePath()
    g.beginPath()
    g.arc(46, 20, 26, 0.05 * Math.PI, 0.85 * Math.PI)
    g.strokePath()
    g.fillStyle(C.deviceDark, 1)
    g.fillRect(-52, -10, 30, 10)
    g.fillRect(-42, -20, 10, 30)
    g.fillStyle(C.coral, 1)
    g.fillCircle(38, -12, 7)
    g.fillStyle(C.mint, 1)
    g.fillCircle(52, 2, 7)
    g.lineStyle(3, C.ink, 1)
    g.strokeCircle(38, -12, 7)
    g.strokeCircle(52, 2, 7)
}

function camera(g: G) {
    shadow(g, 130, 54)
    g.fillStyle(C.device, 1)
    g.fillRoundedRect(-32, -52, 40, 18, 6)
    g.fillRoundedRect(-66, -40, 132, 90, 16)
    line(g)
    g.strokeRoundedRect(-32, -52, 40, 18, 6)
    g.strokeRoundedRect(-66, -40, 132, 90, 16)
    g.fillStyle(C.deviceDark, 1)
    g.fillCircle(4, 6, 32)
    g.strokeCircle(4, 6, 32)
    g.fillStyle(C.ink, 1)
    g.fillCircle(4, 6, 17)
    g.fillStyle(C.white, 1)
    g.fillCircle(-3, -1, 6)
    g.fillStyle(C.coral, 1)
    g.fillCircle(48, -26, 7)
}

function screen(g: G) {
    shadow(g, 110)
    g.fillStyle(C.deviceDark, 1)
    g.fillRect(-10, 30, 20, 26)
    g.fillRoundedRect(-40, 52, 80, 12, 6)
    g.fillStyle(C.device, 1)
    g.fillRoundedRect(-72, -62, 144, 96, 12)
    line(g)
    g.strokeRoundedRect(-72, -62, 144, 96, 12)
    g.fillStyle(0x4b5568, 1)
    g.fillRoundedRect(-62, -52, 124, 76, 6)
}

function robot(g: G) {
    shadow(g, 90)
    g.fillStyle(C.mint, 1)
    g.fillRoundedRect(-34, -6, 68, 56, 12)
    g.fillRoundedRect(-44, -66, 88, 60, 16)
    line(g)
    g.strokeRoundedRect(-34, -6, 68, 56, 12)
    g.strokeRoundedRect(-44, -66, 88, 60, 16)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-32, -56, 64, 40, 10)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-12, -36, 6)
    g.fillCircle(12, -36, 6)
}

function tile(g: G, color: number) {
    shadow(g, 120)
    g.fillStyle(color, 1)
    g.fillRoundedRect(-62, -62, 124, 124, 30)
    line(g)
    g.strokeRoundedRect(-62, -62, 124, 124, 30)
    g.fillStyle(C.white, 0.25)
    g.fillRoundedRect(-50, -54, 100, 26, 13)
}

function game(g: G) {
    tile(g, APP.game)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-44, 26, 40, 10, 5)
    g.fillRoundedRect(10, 6, 38, 10, 5)
    g.fillCircle(-18, -18, 11)
    g.lineStyle(7, C.cream, 1)
    g.lineBetween(-18, -6, -14, 12)
    g.lineBetween(-14, 12, -26, 22)
    g.lineBetween(-14, 12, -2, 18)
    g.lineBetween(-16, 0, -30, -6)
    g.lineBetween(-16, 0, -2, -10)
}

function music(g: G) {
    tile(g, APP.music)
    g.fillStyle(C.cream, 1)
    g.fillEllipse(-22, 26, 28, 20)
    g.fillEllipse(26, 16, 28, 20)
    g.fillRect(-12, -30, 8, 56)
    g.fillRect(36, -40, 8, 56)
    g.beginPath()
    g.moveTo(-12, -30)
    g.lineTo(44, -40)
    g.lineTo(44, -26)
    g.lineTo(-12, -16)
    g.closePath()
    g.fillPath()
}

function paint(g: G) {
    tile(g, APP.paint)
    g.lineStyle(9, C.cream, 1)
    g.beginPath()
    g.moveTo(-40, 10)
    g.lineTo(-24, -14)
    g.lineTo(-8, 12)
    g.lineTo(8, -14)
    g.lineTo(22, 8)
    g.strokePath()
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(18, -40, 14, 44, 6)
    g.fillTriangle(18, 4, 32, 4, 25, 22)
}

function alarm(g: G) {
    tile(g, APP.alarm)
    g.fillStyle(C.cream, 1)
    g.beginPath()
    g.moveTo(-26, 18)
    g.lineTo(-20, -14)
    g.lineTo(0, -30)
    g.lineTo(20, -14)
    g.lineTo(26, 18)
    g.closePath()
    g.fillPath()
    g.fillRoundedRect(-34, 16, 68, 10, 5)
    g.fillCircle(0, 34, 7)
    g.lineStyle(5, C.cream, 1)
    g.beginPath()
    g.arc(0, -4, 44, 1.15 * Math.PI, 1.35 * Math.PI)
    g.strokePath()
    g.beginPath()
    g.arc(0, -4, 44, 1.65 * Math.PI, 1.85 * Math.PI)
    g.strokePath()
}

function photos(g: G) {
    tile(g, APP.photos)
    g.fillStyle(C.cream, 1)
    g.fillCircle(24, -22, 13)
    g.fillTriangle(-46, 34, -12, -16, 22, 34)
    g.fillTriangle(0, 34, 22, 4, 46, 34)
}

function dance(g: G) {
    tile(g, APP.dance)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-22, -36, 32, 26, 8)
    g.fillRoundedRect(-18, -8, 24, 28, 6)
    g.lineStyle(6, C.cream, 1)
    g.lineBetween(-18, 0, -36, -14)
    g.lineBetween(6, 0, 22, 14)
    g.lineBetween(-12, 20, -20, 36)
    g.lineBetween(0, 20, 8, 36)
    g.fillEllipse(32, -24, 14, 10)
    g.fillRect(36, -46, 5, 22)
}

const DRAW: Record<ItemId, (g: G) => void> = {
    mouse,
    keyboard,
    speaker,
    gamepad,
    screen,
    camera,
    robot,
    game,
    music,
    paint,
    alarm,
    photos,
    dance,
}

export function drawItem(g: G, id: ItemId) {
    g.clear()
    DRAW[id](g)
}

export function drawHand(g: G) {
    g.clear()
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-18, -4, 36, 30, 12)
    for (let i = 0; i < 4; i++) g.fillRoundedRect(-17 + i * 9, -26 + Math.abs(i - 1.5) * 3, 8, 26, 4)
    g.fillRoundedRect(-30, 2, 18, 10, 5)
    line(g, 3)
    g.strokeRoundedRect(-18, -4, 36, 30, 12)
    for (let i = 0; i < 4; i++) g.strokeRoundedRect(-17 + i * 9, -26 + Math.abs(i - 1.5) * 3, 8, 26, 4)
    g.strokeRoundedRect(-30, 2, 18, 10, 5)
}

export function drawOrders(g: G) {
    g.clear()
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-22, -28, 44, 56, 6)
    line(g, 3)
    g.strokeRoundedRect(-22, -28, 44, 56, 6)
    for (let i = 0; i < 3; i++) {
        const y = -14 + i * 14
        g.fillStyle(C.ink, 1)
        g.fillTriangle(-14, y - 5, -14, y + 5, -6, y)
        g.lineBetween(-2, y, 14, y)
    }
}
