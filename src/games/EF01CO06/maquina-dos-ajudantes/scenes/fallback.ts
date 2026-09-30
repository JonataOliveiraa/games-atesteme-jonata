import Phaser from 'phaser'
import {
    BG,
    DEVICES,
    MACHINE,
    MACHINE_ART,
    PEOPLE,
    PEOPLE_COLS,
    PERSON_CELL,
    PERSON_COL,
    PIECES,
    POSE_ROW,
    TABLET_SCREEN,
} from '../data/files'
import { H, HOUSE, LINE, ROOMS, TABLE, W, ropeY } from '../data/layout'
import { C, PARTY } from '../data/theme'
import type { DeviceArt, Person, Pose } from '../types'
import { paintPerson } from './fallbackPeople'
import { arcLine, circle, ellipse, face, head, heart, note, poly, rr, stroke, type G } from './paint'

export const isFallback = (scene: Phaser.Scene, key: string): boolean =>
    !!(scene.textures.get(key).customData as { fallback?: boolean }).fallback

function bake(
    scene: Phaser.Scene,
    key: string,
    w: number,
    h: number,
    cell: { w: number; h: number } | null,
    paint: (g: G, index: number) => void,
) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    if (cell) {
        const cols = Math.floor(w / cell.w)
        const rows = Math.floor(h / cell.h)
        for (let i = 0; i < cols * rows; i++) {
            g.save()
            g.translateCanvas((i % cols) * cell.w, Math.floor(i / cols) * cell.h)
            paint(g, i)
            g.restore()
        }
    } else paint(g, 0)
    g.generateTexture(key, w, h)
    g.destroy()
    const texture = scene.textures.get(key)
    if (cell) {
        const cols = Math.floor(w / cell.w)
        const rows = Math.floor(h / cell.h)
        for (let i = 0; i < cols * rows; i++) texture.add(i, 0, (i % cols) * cell.w, Math.floor(i / cols) * cell.h, cell.w, cell.h)
    }
    ;(texture.customData as { fallback?: boolean }).fallback = true
}

function paintYard(g: G) {
    g.fillStyle(C.skyDeep, 1)
    g.fillRect(0, 0, W, 420)
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 96, W, 324)
    for (const [x, y, r] of [
        [760, 60, 26],
        [470, 250, 30],
    ]) {
        g.fillStyle(C.cloud, 0.85)
        g.fillCircle(x, y, r)
        g.fillCircle(x + r, y + 6, r * 0.8)
        g.fillCircle(x - r, y + 8, r * 0.7)
        g.fillRect(x - r * 1.5, y + 4, r * 3.1, r * 0.8)
    }

    g.fillStyle(C.grassDark, 1)
    g.fillEllipse(220, 430, 700, 90)
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 420, W, H - 420)
    g.fillStyle(C.grassDark, 1)
    g.fillRect(0, 420, W, 8)

    for (let x = 24; x < 440; x += 44) rr(g, x, 360, 22, 70, 8, C.fence, 4)
    rr(g, 10, 380, 440, 14, 6, C.fence, 4)

    for (const [x, y] of [
        [470, 690],
        [610, 660],
        [30, 700],
        [640, 440],
        [440, 450],
    ]) {
        g.fillStyle(C.flower, 1)
        for (let k = 0; k < 5; k++) {
            const a = (k / 5) * Math.PI * 2
            g.fillCircle(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 6)
        }
        g.fillStyle(C.flowerCore, 1)
        g.fillCircle(x, y, 5)
    }

    rr(g, LINE.left - 8, LINE.top - 20, 14, 330, 6, C.woodDark)
    rr(g, LINE.right - 6, LINE.top - 20, 14, 330, 6, C.woodDark)
    g.lineStyle(4, C.rope, 1)
    g.beginPath()
    g.moveTo(LINE.left, ropeY(LINE.left))
    for (let x = LINE.left; x <= LINE.right; x += 10) g.lineTo(x, ropeY(x))
    g.strokePath()
    for (const x of LINE.pegs) rr(g, x - 5, ropeY(x) - 12, 10, 24, 3, C.wood, 3)

    g.fillStyle(C.shadow, 0.12)
    g.fillEllipse(TABLE.x, 692, TABLE.w + 40, 18)
    rr(g, TABLE.x - TABLE.w / 2 + 18, TABLE.top + 10, 18, 100, 6, C.woodDark)
    rr(g, TABLE.x + TABLE.w / 2 - 36, TABLE.top + 10, 18, 100, 6, C.woodDark)
    rr(g, TABLE.x - TABLE.w / 2, TABLE.top, TABLE.w, TABLE.h, 10, C.wood)

    rr(g, HOUSE.left + 10, HOUSE.eaves - 10, HOUSE.right - HOUSE.left - 20, HOUSE.bottom - HOUSE.eaves + 10, 12, C.wall)
    ROOMS.forEach(r => {
        const left = r.x - r.w / 2
        const top = r.y - r.h / 2
        g.fillStyle(C.paper, 1)
        g.fillRect(left, top, r.w, r.h)
        g.fillStyle(C.creamDark, 0.5)
        for (let x = left + 22; x < left + r.w; x += 44) g.fillRect(x, top, 3, r.h - 40)
        g.fillStyle(C.floor, 1)
        g.fillRect(left, HOUSE.floor - 40, r.w, 40)
        g.lineStyle(3, C.woodDark, 0.6)
        g.lineBetween(left, HOUSE.floor - 20, left + r.w, HOUSE.floor - 20)
        g.lineStyle(6, C.ink, 1)
        g.strokeRect(left, top, r.w, r.h)
    })
    poly(g, [
        [HOUSE.left - 14, HOUSE.eaves + 8],
        [(HOUSE.left + HOUSE.right) / 2, HOUSE.top],
        [HOUSE.right + 14, HOUSE.eaves + 8],
    ], C.roof)
    circle(g, (HOUSE.left + HOUSE.right) / 2, 200, 30, C.glass)
    stroke(g, (HOUSE.left + HOUSE.right) / 2, 172, (HOUSE.left + HOUSE.right) / 2, 228, 4)
    stroke(g, (HOUSE.left + HOUSE.right) / 2 - 28, 200, (HOUSE.left + HOUSE.right) / 2 + 28, 200, 4)
}

function paintMachine(g: G) {
    const { hatch, slot } = MACHINE_ART
    rr(g, 60, 930, 520, 44, 16, C.turquoiseDark)
    rr(g, 50, 430, 540, 520, 60, C.turquoise)
    rr(g, 80, 590, 480, 20, 10, C.coral, 4)
    for (let i = 0; i < 7; i++) circle(g, 110 + i * 70, 470, 14, i % 2 ? C.gold : C.coral, 4)

    rr(g, slot.x - 18, slot.y - 42, 36, 84, 14, C.gold)
    rr(g, slot.x - 5, slot.y - 30, 10, 60, 5, C.ink, 0)

    rr(g, hatch.x - hatch.w / 2 - 14, hatch.y - hatch.h / 2 - 14, hatch.w + 28, hatch.h + 28, 26, C.goldDark)
    rr(g, hatch.x - hatch.w / 2, hatch.y - hatch.h / 2, hatch.w, hatch.h, 20, C.coral)
    rr(g, hatch.x - 40, hatch.y + 30, 80, 16, 8, C.coralDark, 4)

    circle(g, 170, 790, 56, C.coralDark)
    heart(g, 170, 790, 30, C.gold)

    rr(g, 110, 400, 420, 50, 24, C.gold)
    circle(g, 320, 255, 175, C.glass)
    g.fillStyle(C.white, 0.6)
    g.fillEllipse(230, 170, 60, 110)
    const gifts: [number, number, number, number][] = [
        [240, 330, 90, C.coral],
        [360, 320, 100, C.lilac],
        [300, 240, 84, C.yellow],
    ]
    gifts.forEach(([x, y, s, color]) => {
        rr(g, x - s / 2, y - s / 2, s, s, 10, color, 5)
        rr(g, x - 8, y - s / 2, 16, s, 4, C.turquoise, 3)
        rr(g, x - s / 2, y - 8, s, 16, 4, C.turquoise, 3)
    })
    g.lineStyle(6, C.ink, 1)
    g.strokeCircle(320, 255, 175)
    circle(g, 320, 70, 22, C.coral)
}

function paintDevice(g: G, device: DeviceArt) {
    switch (device) {
        case 'clock':
            rr(g, 116, 300, 30, 44, 10, C.yellowDark)
            rr(g, 238, 300, 30, 44, 10, C.yellowDark)
            stroke(g, 192, 44, 192, 80, 10)
            circle(g, 192, 44, 14, C.yellowDark)
            circle(g, 112, 92, 44, C.yellow)
            circle(g, 272, 92, 44, C.yellow)
            circle(g, 192, 204, 124, C.yellow)
            circle(g, 192, 204, 94, C.white)
            for (const [dx, dy] of [
                [0, -1],
                [1, 0],
                [0, 1],
                [-1, 0],
            ])
                stroke(g, 192 + dx * 76, 204 + dy * 76, 192 + dx * 86, 204 + dy * 86, 8)
            stroke(g, 192, 204, 192, 140, 10)
            stroke(g, 192, 204, 240, 204, 10)
            circle(g, 192, 204, 10, C.coral, 4)
            break
        case 'speaker':
            rr(g, 88, 60, 208, 280, 60, C.lilac)
            circle(g, 192, 226, 78, C.lilacDark)
            g.fillStyle(C.lilac, 1)
            for (let y = 170; y <= 282; y += 22)
                for (let x = 136; x <= 248; x += 22) if ((x - 192) ** 2 + (y - 226) ** 2 < 68 ** 2) g.fillCircle(x, y, 5)
            circle(g, 192, 108, 18, C.white, 4)
            circle(g, 150, 108, 9, C.mint, 3)
            break
        case 'phone':
            rr(g, 70, 262, 244, 84, 30, C.coralDark)
            rr(g, 132, 40, 120, 262, 44, C.coral)
            rr(g, 164, 64, 56, 16, 8, C.ink, 0)
            rr(g, 154, 96, 76, 36, 10, C.screen, 4)
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) circle(g, 164 + c * 28, 160 + r * 30, 10, C.white, 3)
            circle(g, 250, 304, 10, C.mint, 3)
            break
        case 'tablet': {
            const s = TABLET_SCREEN
            rr(g, s.x - s.w / 2 - 22, s.y - s.h / 2 - 22, s.w + 44, s.h + 50, 30, C.blueGrey)
            rr(g, s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 12, C.screen, 4)
            circle(g, s.x, s.y + s.h / 2 + 14, 8, C.blueGreyDark, 3)
            g.fillStyle(C.white, 0.7)
            g.fillTriangle(s.x - s.w / 2 + 12, s.y - s.h / 2 + 60, s.x - s.w / 2 + 60, s.y - s.h / 2 + 12, s.x - s.w / 2 + 12, s.y - s.h / 2 + 12)
            break
        }
    }
}

const DEVICE_ORDER: DeviceArt[] = ['clock', 'speaker', 'phone', 'tablet']

function paintPiece(g: G, index: number) {
    switch (index) {
        case 0:
            rr(g, 58, 112, 140, 104, 12, C.coral)
            rr(g, 46, 84, 164, 38, 12, 0xffb3a3)
            rr(g, 116, 84, 24, 132, 6, C.turquoise, 4)
            ellipse(g, 102, 70, 56, 36, C.turquoise)
            ellipse(g, 154, 70, 56, 36, C.turquoise)
            circle(g, 128, 76, 14, C.turquoiseDark, 4)
            break
        case 1:
            note(g, 90, 170, 90, PARTY[2])
            note(g, 150, 130, 80, PARTY[0], true)
            break
        case 2:
            g.fillStyle(C.yellow, 1)
            g.beginPath()
            g.arc(110, 128, 76, Math.PI * 0.35, Math.PI * 1.65)
            g.arc(142, 116, 64, Math.PI * 1.55, Math.PI * 0.45, true)
            g.closePath()
            g.fillPath()
            g.lineStyle(6, C.ink, 1)
            g.strokePath()
            arcLine(g, 76, 120, 9, 0.2, Math.PI - 0.2, 4)
            note(g, 190, 190, 70, C.lilac)
            break
        case 3:
            heart(g, 128, 132, 90, C.heart)
            break
        case 4:
            ellipse(g, 102, 64, 30, 90, C.white)
            ellipse(g, 150, 60, 30, 90, C.white)
            ellipse(g, 102, 70, 12, 60, 0xffc2d4, 0)
            ellipse(g, 150, 66, 12, 60, 0xffc2d4, 0)
            ellipse(g, 128, 176, 110, 96, C.white)
            ellipse(g, 90, 222, 44, 24, C.white)
            ellipse(g, 166, 222, 44, 24, C.white)
            circle(g, 126, 122, 50, C.white)
            face(g, 126, 118, 44, 'happy', 'smile')
            circle(g, 126, 132, 6, 0xff8fb0, 0)
            break
        case 5:
            circle(g, 128, 128, 104, C.coral)
            circle(g, 128, 128, 88, C.cream)
            ellipse(g, 128, 206, 130, 40, C.coral, 0)
            head(g, 128, 124, 54, 'bun', C.grey)
            face(g, 128, 124, 54, 'happy', 'grin')
            g.lineStyle(5, C.ink, 1)
            g.strokeCircle(108, 128, 15)
            g.strokeCircle(148, 128, 15)
            g.lineBetween(123, 128, 133, 128)
            break
    }
}

function paintPeople(g: G, index: number) {
    const col = index % PEOPLE_COLS
    const row = Math.floor(index / PEOPLE_COLS)
    const person = (Object.keys(PERSON_COL) as Person[]).find(p => PERSON_COL[p] === col)
    const pose = (Object.keys(POSE_ROW) as Pose[]).find(p => POSE_ROW[p] === row)
    if (person && pose) paintPerson(g, person, pose)
}

export function ensureArt(scene: Phaser.Scene) {
    const tex = scene.textures
    if (!tex.exists(BG)) bake(scene, BG, W, H, null, g => paintYard(g))
    if (!tex.exists(MACHINE)) bake(scene, MACHINE, MACHINE_ART.w, MACHINE_ART.h, null, g => paintMachine(g))
    if (!tex.exists(DEVICES)) bake(scene, DEVICES, 768, 768, { w: 384, h: 384 }, (g, i) => paintDevice(g, DEVICE_ORDER[i]))
    if (!tex.exists(PIECES)) bake(scene, PIECES, 768, 768, { w: 256, h: 256 }, (g, i) => paintPiece(g, i))
    if (!tex.exists(PEOPLE))
        bake(scene, PEOPLE, PERSON_CELL.w * PEOPLE_COLS, PERSON_CELL.h * 3, { w: PERSON_CELL.w, h: PERSON_CELL.h }, paintPeople)
}
