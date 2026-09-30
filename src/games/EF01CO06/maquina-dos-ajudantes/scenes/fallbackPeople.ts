import { C, PARTY } from '../data/theme'
import type { Person, Pose } from '../types'
import { circle, drop, ellipse, face, head, limb, poly, rr, stroke, type G } from './paint'

const JEANS = 0x7b8fc9

function sleeper(g: G, pose: Pose) {
    rr(g, 40, 340, 48, 220, 20, C.wood)
    rr(g, 300, 420, 44, 140, 16, C.wood)
    rr(g, 96, 520, 20, 40, 6, C.woodDark)
    rr(g, 280, 520, 20, 40, 6, C.woodDark)
    rr(g, 70, 450, 262, 70, 20, C.white)

    if (pose === 'helped') {
        ellipse(g, 128, 452, 110, 44, C.white)
        limb(g, 116, 372, 78, 262, 22, C.pyjama)
        limb(g, 186, 372, 224, 262, 22, C.pyjama)
        circle(g, 76, 254, 15, C.skin)
        circle(g, 226, 254, 15, C.skin)
        rr(g, 104, 346, 94, 120, 34, C.pyjama)
        rr(g, 150, 440, 178, 64, 24, C.blanket)
        rr(g, 150, 440, 178, 22, 11, 0xb4cff5)
        head(g, 151, 298, 52, 'short')
        face(g, 151, 298, 52, 'happy', 'grin')
        return
    }

    ellipse(g, 128, 452, 110, 44, C.white)
    rr(g, 150, 416, 180, 84, 28, C.blanket)
    rr(g, 150, 416, 180, 24, 12, 0xb4cff5)
    head(g, 124, 404, 50, 'short')
    if (pose === 'before') {
        face(g, 124, 404, 50, 'closed', 'o')
        return
    }
    face(g, 124, 404, 50, 'closed', 'wail')
    drop(g, 150, 452, 12)
    circle(g, 146, 404, 20, 0xcfeeff, 3)
    g.fillStyle(C.white, 1)
    g.fillCircle(140, 397, 5)
}

function baby(g: G, pose: Pose) {
    rr(g, 44, 250, 24, 310, 10, C.white)
    rr(g, 316, 250, 24, 310, 10, C.white)
    ellipse(g, 192, 420, 176, 190, C.onesie)
    rr(g, 56, 498, 272, 20, 8, C.white)
    for (let x = 90; x <= 294; x += 34) rr(g, x - 6, 314, 12, 188, 6, C.white, 4)
    rr(g, 40, 296, 304, 22, 11, C.white)

    head(g, 192, 238, 66, 'baby')
    if (pose === 'helped') {
        face(g, 192, 238, 66, 'closed', 'smile')
        circle(g, 214, 282, 13, C.skin, 4)
        circle(g, 128, 300, 16, C.skin, 4)
        return
    }
    circle(g, 128, 300, 16, C.skin, 4)
    circle(g, 256, 300, 16, C.skin, 4)
    if (pose === 'before') {
        face(g, 192, 238, 66, 'tight', 'wail')
        drop(g, 144, 280, 13)
        drop(g, 138, 316, 10)
        drop(g, 240, 280, 13)
        drop(g, 246, 316, 10)
        return
    }
    face(g, 192, 238, 66, 'tight', 'bigwail')
    drop(g, 104, 222, 15, C.tear, -1.2)
    drop(g, 72, 248, 12, C.tear, -1.4)
    drop(g, 280, 222, 15, C.tear, 1.2)
    drop(g, 312, 248, 12, C.tear, 1.4)
}

function frame(g: G, x: number, y: number) {
    rr(g, x - 44, y - 36, 88, 72, 10, C.wood)
    rr(g, x - 33, y - 26, 66, 52, 6, C.cream, 4)
    ellipse(g, x, y + 22, 44, 16, C.coral, 3)
    circle(g, x, y - 16, 8, C.grey, 3)
    circle(g, x, y - 2, 12, C.skin, 3)
    g.lineStyle(3, C.ink, 1)
    g.strokeCircle(x - 5, y - 3, 4)
    g.strokeCircle(x + 5, y - 3, 4)
}

function missingGrandma(g: G, pose: Pose) {
    rr(g, 44, 330, 296, 140, 40, C.sofa)
    rr(g, 60, 520, 20, 40, 6, C.woodDark)
    rr(g, 304, 520, 20, 40, 6, C.woodDark)
    rr(g, 40, 450, 304, 74, 24, C.sofa)
    rr(g, 22, 390, 62, 140, 28, C.sofaDark)
    rr(g, 300, 390, 62, 140, 28, C.sofaDark)

    rr(g, 162, 470, 24, 70, 10, C.skin)
    rr(g, 198, 470, 24, 70, 10, C.skin)
    ellipse(g, 172, 544, 36, 18, C.coral, 4)
    ellipse(g, 212, 544, 36, 18, C.coral, 4)
    rr(g, 146, 350, 92, 130, 36, C.dress)

    if (pose === 'helped') {
        limb(g, 226, 372, 290, 276, 18, C.dress)
        circle(g, 292, 266, 16, C.skin, 4)
        frame(g, 176, 460)
        circle(g, 136, 458, 13, C.skin, 4)
        head(g, 192, 290, 58, 'braids', C.hairDark)
        face(g, 192, 290, 58, 'happy', 'grin')
        return
    }
    frame(g, 192, 420)
    circle(g, 150, 426, 13, C.skin, 4)
    circle(g, 234, 426, 13, C.skin, 4)
    head(g, 192, 290, 58, 'braids', C.hairDark)
    if (pose === 'before') face(g, 192, 290, 58, 'sad', 'frown')
    else face(g, 192, 290, 58, 'puzzled', 'wavy')
}

function bored(g: G, pose: Pose) {
    rr(g, 64, 290, 256, 190, 50, C.coral)
    rr(g, 66, 520, 20, 40, 6, C.woodDark)
    rr(g, 298, 520, 20, 40, 6, C.woodDark)
    rr(g, 56, 450, 272, 76, 26, C.coral)
    rr(g, 34, 380, 68, 150, 30, C.coralDark)
    rr(g, 282, 380, 68, 150, 30, C.coralDark)

    rr(g, 168, 470, 28, 74, 10, JEANS)
    rr(g, 208, 470, 28, 74, 10, JEANS)
    ellipse(g, 180, 546, 40, 18, C.white, 4)
    ellipse(g, 222, 546, 40, 18, C.white, 4)

    const helped = pose === 'helped'
    const headY = helped ? 312 : 328
    if (!helped) {
        limb(g, 158, 392, 84, 452, 18, C.shirt)
        limb(g, 246, 392, 300, 452, 18, C.shirt)
        circle(g, 80, 458, 14, C.skin, 4)
        circle(g, 304, 458, 14, C.skin, 4)
    }
    rr(g, 150, 370, 104, 112, 34, C.shirt)
    if (helped) {
        circle(g, 182, 440, 15, C.skin, 4)
        circle(g, 222, 440, 15, C.skin, 4)
    }
    head(g, 202, headY, 56, 'short')
    g.fillStyle(C.cap, 1)
    g.beginPath()
    g.arc(202, headY - 18, 58, Math.PI, Math.PI * 2)
    g.closePath()
    g.fillPath()
    g.lineStyle(6, C.ink, 1)
    g.strokePath()
    ellipse(g, 262, headY - 20, 74, 20, C.cap)

    if (pose === 'before') face(g, 202, headY + 4, 54, 'half', 'yawn')
    else if (helped) {
        face(g, 202, headY + 4, 54, 'happy', 'grin')
        drop(g, 150, headY + 4, 9)
        drop(g, 254, headY + 4, 9)
    } else face(g, 202, headY + 4, 54, 'puzzled', 'wavy')
}

function party(g: G, pose: Pose) {
    stroke(g, 70, 190, 100, 380, 3, C.ink)
    stroke(g, 314, 210, 284, 380, 3, C.ink)
    ellipse(g, 70, 150, 66, 80, PARTY[0])
    ellipse(g, 314, 170, 66, 80, PARTY[1])
    poly(g, [[64, 190], [76, 190], [70, 180]], PARTY[0], 3)
    poly(g, [[308, 210], [320, 210], [314, 200]], PARTY[1], 3)

    const hairs = [C.hair, C.hairDark, 0xc98a4a]
    ;[96, 192, 288].forEach((x, i) => {
        const color = PARTY[i]
        rr(g, x - 24, 478, 18, 72, 8, JEANS)
        rr(g, x + 6, 478, 18, 72, 8, JEANS)
        if (pose === 'before') {
            limb(g, x - 28, 398, x - 38, 470, 14, color)
            limb(g, x + 28, 398, x + 38, 470, 14, color)
            circle(g, x - 38, 474, 11, C.skin, 4)
            circle(g, x + 38, 474, 11, C.skin, 4)
        } else if (pose === 'helped') {
            limb(g, x - 28, 398, x - 54, 302, 14, color)
            limb(g, x + 28, 398, x + 54, 302, 14, color)
            circle(g, x - 55, 296, 11, C.skin, 4)
            circle(g, x + 55, 296, 11, C.skin, 4)
        }
        rr(g, x - 32, 378, 64, 112, 24, color)
        head(g, x, 340, 40, 'short', hairs[i])
        poly(g, [[x - 26, 306], [x + 26, 306], [x, 246]], PARTY[(i + 2) % 4])
        circle(g, x, 244, 8, C.white, 4)
        if (pose === 'before') face(g, x, 340, 40, 'half', 'flat')
        else if (pose === 'helped') face(g, x, 340, 40, 'happy', 'grin')
        else {
            limb(g, x - 28, 398, x - 44, 352, 14, color)
            limb(g, x + 28, 398, x + 44, 352, 14, color)
            circle(g, x - 44, 346, 12, C.skin, 4)
            circle(g, x + 44, 346, 12, C.skin, 4)
            face(g, x, 340, 40, 'tight', 'grin')
        }
    })
}

const PAINTERS: Record<Person, (g: G, pose: Pose) => void> = {
    sleeper,
    baby,
    'missing-grandma': missingGrandma,
    bored,
    party,
}

export function paintPerson(g: G, person: Person, pose: Pose) {
    PAINTERS[person](g, pose)
}
