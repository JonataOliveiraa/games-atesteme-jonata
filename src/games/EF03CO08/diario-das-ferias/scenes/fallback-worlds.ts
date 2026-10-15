import Phaser from 'phaser'
import { BG_FARM, BG_NIGHT, FARM_SHEET, NIGHT_SHEET } from '../data/files'
import { H, WORLD } from '../data/layout'
import { C } from '../data/theme'
import { bakeOne, bakeSheet, box, cloud, disc, limb, oval, poly, type G } from './fallback'

/** Arte de reserva do sítio (N2) e do acampamento (N3), nas chaves e grades do TEXTURAS. */
export function ensureWorldArt(scene: Phaser.Scene) {
    bakeOne(scene, BG_FARM, WORLD.w, H, farm)
    bakeOne(scene, BG_NIGHT, WORLD.w, H, night)
    bakeSheet(scene, FARM_SHEET, farmThing)
    bakeSheet(scene, NIGHT_SHEET, nightThing)
}

const INK = C.ink
const GRASS = 0xa8d8a0
const GRASS_DARK = 0x86c487
const HILL = 0xc2e3b0
const BARN = 0xe98a7a
const BARN_DARK = 0xc96a5c
const WATER = 0x9fd3e6
const ROAD = 0xe2c79c

// ───────────────────────────────────────────── o sítio

function farm(g: G) {
    const ground = 430
    g.fillStyle(C.sky, 1)
    g.fillRect(0, 0, WORLD.w, ground)
    ;[
        [200, 70, 110],
        [880, 90, 130],
        [1380, 60, 100],
        [1900, 100, 120],
    ].forEach(([x, y, w]) => cloud(g, x, y, w))
    g.fillStyle(HILL, 1)
    for (let x = -100; x < WORLD.w + 200; x += 360) g.fillEllipse(x, ground + 20, 520, 220)
    g.fillStyle(GRASS, 1)
    g.fillRect(0, ground, WORLD.w, H - ground)
    g.lineStyle(4, GRASS_DARK, 1)
    g.lineBetween(0, ground, WORLD.w, ground)

    // o lago, a folha do sapo e o capim do pato
    oval(g, 300, 495, 470, 150, WATER, 4, 0x6fb3cc)
    g.lineStyle(3, 0xd8f2f2, 1)
    ;[
        [230, 480, 60],
        [400, 520, 70],
    ].forEach(([x, y, w]) => {
        g.beginPath()
        g.arc(x, y, w / 2, Math.PI * 1.15, Math.PI * 1.85)
        g.strokePath()
    })
    ;[
        [330, 470, 90],
        [430, 500, 60],
    ].forEach(([x, y, w]) => {
        oval(g, x, y, w, w * 0.32, 0x7cc47e, 3, 0x4f9a5f)
        g.fillStyle(WATER, 1)
        g.fillTriangle(x, y, x + w * 0.5, y - 6, x + w * 0.5, y + 6)
    })
    for (let i = 0; i < 16; i++) {
        const x = 70 + i * 9
        const h = 70 + ((i * 37) % 45)
        g.lineStyle(7, i % 2 ? 0x6fb784 : 0x8fcf98, 1)
        g.lineBetween(x, 470, x + ((i % 3) - 1) * 10, 470 - h)
    }

    // a árvore com a colmeia
    box(g, 540, 250, 40, 200, 12, 0xc9a27a, 4, 0x9c7957)
    ;[
        [560, 220, 140],
        [490, 250, 100],
        [630, 250, 100],
        [560, 160, 110],
    ].forEach(([x, y, r]) => disc(g, x, y, r / 1.4, 0x8fcf98, 4, 0x5fa572))
    oval(g, 600, 240, 46, 56, 0xf2c56b, 4, 0xc99a3c)
    g.lineStyle(3, 0xc99a3c, 1)
    for (let y = 226; y < 262; y += 11) g.lineBetween(582, y, 618, y)
    disc(g, 600, 262, 6, 0x6b4a2a, 0)

    // o jardim de flores
    for (let i = 0; i < 18; i++) {
        const x = 610 + (i % 6) * 44 + (i % 2) * 18
        const y = 470 + Math.floor(i / 6) * 34
        g.lineStyle(4, 0x5fa572, 1)
        g.lineBetween(x, y, x, y + 26)
        disc(g, x, y, 11, [0xf6a593, 0xffe49a, 0xcdb8ec, 0xffc9a8][i % 4], 3, 0xd08a6a)
        disc(g, x, y, 4, 0xfff6e4, 0)
    }

    // o celeiro (o galo canta atrás dele)
    box(g, 930, 250, 250, 210, 8, BARN, 5, BARN_DARK)
    poly(
        g,
        [
            { x: 910, y: 260 },
            { x: 1055, y: 170 },
            { x: 1200, y: 260 },
        ],
        0xb85a4c,
        5,
        0x8f4136,
    )
    box(g, 1005, 330, 100, 130, 6, 0xfff6e4, 4, BARN_DARK)
    g.lineStyle(5, BARN_DARK, 1)
    g.lineBetween(1005, 330, 1105, 460)
    g.lineBetween(1105, 330, 1005, 460)
    box(g, 1030, 220, 50, 40, 6, 0xfff6e4, 4, BARN_DARK)

    // a estradinha de terra do trator
    g.fillStyle(ROAD, 1)
    g.fillRect(1180, 415, 540, 44)
    g.lineStyle(3, 0xc9a06c, 1)
    g.lineBetween(1180, 415, 1720, 415)
    g.lineBetween(1180, 459, 1720, 459)

    // o pasto da vaca
    g.lineStyle(6, 0xc9a06c, 1)
    for (let x = 1480; x <= 1760; x += 56) g.lineBetween(x, 470, x, 530)
    g.lineBetween(1480, 486, 1760, 486)
    g.lineBetween(1480, 512, 1760, 512)

    // a casinha do cachorro
    box(g, 1735, 390, 120, 100, 6, 0xf4c27a, 4, 0xc9904c)
    poly(
        g,
        [
            { x: 1722, y: 398 },
            { x: 1795, y: 340 },
            { x: 1868, y: 398 },
        ],
        0xe98a7a,
        4,
        BARN_DARK,
    )
    g.fillStyle(0x5a3d2a, 1)
    g.fillRoundedRect(1770, 420, 50, 70, { tl: 25, tr: 25, bl: 0, br: 0 })

    // a casa do vovô, lá no fundo
    box(g, 1910, 300, 120, 130, 6, 0xfff6e4, 4, 0xc9a06c)
    poly(
        g,
        [
            { x: 1895, y: 308 },
            { x: 1970, y: 240 },
            { x: 2044, y: 308 },
        ],
        0x8fb7e0,
        4,
        0x5f86b0,
    )
}

function farmThing(g: G, i: number) {
    const cx = 160
    if (i === 0) {
        oval(g, cx, 210, 170, 110, 0x8fd38a, 5, 0x4f9a5f)
        oval(g, cx, 230, 110, 50, 0xd6f0c4, 0)
        disc(g, cx - 42, 150, 30, 0x8fd38a, 5, 0x4f9a5f)
        disc(g, cx + 42, 150, 30, 0x8fd38a, 5, 0x4f9a5f)
        ;[-42, 42].forEach(dx => {
            disc(g, cx + dx, 150, 16, C.white, 3, 0x4f9a5f)
            disc(g, cx + dx, 152, 8, INK, 0)
        })
        g.lineStyle(5, 0x3f7a4a, 1)
        g.beginPath()
        g.arc(cx, 205, 40, 0.3, Math.PI - 0.3)
        g.strokePath()
        oval(g, cx - 75, 255, 70, 28, 0x8fd38a, 4, 0x4f9a5f)
        oval(g, cx + 75, 255, 70, 28, 0x8fd38a, 4, 0x4f9a5f)
        return
    }
    if (i === 1) {
        oval(g, cx - 55, 130, 110, 120, 0xf6a5c8, 5, 0xc96a9a)
        oval(g, cx + 55, 130, 110, 120, 0xf6a5c8, 5, 0xc96a9a)
        oval(g, cx - 45, 215, 80, 80, 0xcdb8ec, 5, 0x9c84c8)
        oval(g, cx + 45, 215, 80, 80, 0xcdb8ec, 5, 0x9c84c8)
        disc(g, cx - 55, 130, 18, 0xffe49a, 0)
        disc(g, cx + 55, 130, 18, 0xffe49a, 0)
        box(g, cx - 12, 100, 24, 150, 12, 0x5a4a6a, 0)
        g.lineStyle(4, 0x5a4a6a, 1)
        g.lineBetween(cx - 4, 104, cx - 30, 60)
        g.lineBetween(cx + 4, 104, cx + 30, 60)
        return
    }
    if (i === 2) {
        poly(
            g,
            [
                { x: 90, y: 170 },
                { x: 40, y: 80 },
                { x: 70, y: 70 },
                { x: 110, y: 140 },
                { x: 100, y: 60 },
                { x: 130, y: 70 },
                { x: 130, y: 170 },
            ],
            0xf2a24c,
            4,
            0xc97a2c,
        )
        oval(g, cx + 10, 190, 170, 130, C.white, 5, 0xb9b3c4)
        limb(g, { x: cx - 10, y: 250 }, { x: cx - 16, y: 290 }, 8, 0xf2c24c)
        limb(g, { x: cx + 30, y: 250 }, { x: cx + 36, y: 290 }, 8, 0xf2c24c)
        disc(g, cx + 75, 120, 45, C.white, 5, 0xb9b3c4)
        ;[0, 1, 2].forEach(k => disc(g, cx + 58 + k * 16, 76 - (k % 2) * 8, 14, 0xe8584c, 3, 0xb83a30))
        poly(
            g,
            [
                { x: cx + 115, y: 115 },
                { x: cx + 145, y: 125 },
                { x: cx + 115, y: 135 },
            ],
            0xf2c24c,
            3,
            0xc99a2c,
        )
        oval(g, cx + 100, 150, 16, 26, 0xe8584c, 3, 0xb83a30)
        disc(g, cx + 88, 112, 6, INK, 0)
        return
    }
    if (i === 3 || i === 4) {
        const moo = i === 4
        oval(g, cx, 170, 230, 130, C.white, 5, 0x6b6470)
        ;[
            [cx - 50, 150, 50],
            [cx + 30, 190, 40],
            [cx + 70, 140, 30],
        ].forEach(([x, y, w]) => oval(g, x, y, w, w * 0.8, 0x4a4450, 0))
        ;[-80, -40, 40, 80].forEach(dx => box(g, cx + dx - 10, 220, 20, 70, 8, C.white, 4, 0x6b6470))
        const hx = moo ? cx - 120 : cx - 115
        const hy = moo ? 120 : 200
        oval(g, hx, hy, 90, 80, C.white, 5, 0x6b6470)
        oval(g, hx - 10, hy + 22, 70, 40, 0xf6b9b0, 4, 0xc98a80)
        disc(g, hx - 24, hy + 22, 5, INK, 0)
        disc(g, hx + 4, hy + 22, 5, INK, 0)
        disc(g, hx + 14, hy - 12, 6, INK, 0)
        oval(g, hx + 30, hy - 30, 30, 16, C.white, 3, 0x6b6470)
        if (moo) oval(g, hx - 10, hy + 40, 22, 18, 0x6b3a3a, 0)
        else {
            g.lineStyle(5, 0x5fa572, 1)
            g.lineBetween(hx - 30, hy + 50, hx - 36, hy + 80)
            g.lineBetween(hx - 10, hy + 50, hx - 6, hy + 80)
        }
        return
    }
    if (i === 5) {
        oval(g, cx + 10, 200, 150, 120, 0xc99a6a, 5, 0x8a6440)
        g.lineStyle(14, 0xc99a6a, 1)
        g.lineBetween(cx + 80, 200, cx + 120, 150)
        disc(g, cx - 40, 130, 60, 0xc99a6a, 5, 0x8a6440)
        oval(g, cx - 90, 125, 34, 70, 0x8a6440, 0)
        oval(g, cx + 10, 125, 34, 70, 0x8a6440, 0)
        oval(g, cx - 40, 155, 50, 34, 0xf4e2c8, 0)
        disc(g, cx - 40, 145, 9, INK, 0)
        disc(g, cx - 58, 118, 6, INK, 0)
        disc(g, cx - 22, 118, 6, INK, 0)
        oval(g, cx - 40, 172, 18, 14, 0xf28a8a, 0)
        box(g, cx - 40, 240, 30, 50, 10, 0xc99a6a, 4, 0x8a6440)
        box(g, cx + 20, 240, 30, 50, 10, 0xc99a6a, 4, 0x8a6440)
        return
    }
    if (i === 6) {
        oval(g, cx, 250, 220, 30, WATER, 3, 0x6fb3cc)
        oval(g, cx + 10, 205, 170, 100, 0xffe07a, 5, 0xd9a83a)
        disc(g, cx - 60, 140, 45, 0xffe07a, 5, 0xd9a83a)
        poly(
            g,
            [
                { x: cx - 100, y: 140 },
                { x: cx - 140, y: 150 },
                { x: cx - 100, y: 160 },
            ],
            0xf2a24c,
            3,
            0xc97a2c,
        )
        disc(g, cx - 66, 128, 7, INK, 0)
        oval(g, cx + 30, 200, 80, 40, 0xf7d060, 3, 0xd9a83a)
        return
    }
    box(g, 50, 140, 150, 90, 14, 0xe8584c, 5, 0xb83a30)
    box(g, 150, 80, 90, 100, 10, 0xe8584c, 5, 0xb83a30)
    box(g, 165, 92, 60, 50, 8, 0xd6f0f8, 4, 0x8fb7e0)
    g.lineStyle(8, 0x6b6470, 1)
    g.lineBetween(90, 140, 90, 90)
    disc(g, 210, 230, 62, 0x4a4450, 5, INK)
    disc(g, 210, 230, 28, 0xffe07a, 4, 0xd9a83a)
    disc(g, 90, 250, 40, 0x4a4450, 5, INK)
    disc(g, 90, 250, 18, 0xffe07a, 4, 0xd9a83a)
}

// ───────────────────────────────────────────── o acampamento à noite

const NIGHT_SKY = 0x2c2a5a
const NIGHT_LOW = 0x3c3770
const NIGHT_GROUND = 0x2a3a3a
const SILHOUETTE = 0x1c2433

function night(g: G) {
    const ground = 440
    g.fillStyle(NIGHT_SKY, 1)
    g.fillRect(0, 0, WORLD.w, ground)
    g.fillStyle(NIGHT_LOW, 1)
    g.fillRect(0, ground - 120, WORLD.w, 120)
    for (let i = 0; i < 90; i++) {
        const x = (i * 211) % WORLD.w
        const y = (i * 97) % 300
        g.fillStyle(0xfff6e4, 0.5 + (i % 3) * 0.2)
        g.fillCircle(x, y, 1.5 + (i % 3))
    }
    g.fillStyle(0x24304a, 1)
    for (let x = -100; x < WORLD.w + 200; x += 400) g.fillEllipse(x, ground + 30, 560, 220)
    g.fillStyle(NIGHT_GROUND, 1)
    g.fillRect(0, ground, WORLD.w, H - ground)

    // a árvore grande onde a coruja se esconde
    g.fillStyle(SILHOUETTE, 1)
    g.fillRect(225, 250, 50, 230)
    ;[
        [250, 200, 120],
        [170, 240, 90],
        [330, 240, 90],
        [250, 130, 90],
    ].forEach(([x, y, r]) => g.fillCircle(x, y, r))

    // o mato do grilo
    for (let i = 0; i < 26; i++) {
        const x = 540 + i * 9
        const h = 50 + ((i * 29) % 40)
        g.lineStyle(6, i % 2 ? 0x1f3a2e : 0x264a38, 1)
        g.lineBetween(x, 540, x + ((i % 3) - 1) * 8, 540 - h)
    }

    // a barraca
    poly(
        g,
        [
            { x: 800, y: 480 },
            { x: 900, y: 340 },
            { x: 1000, y: 480 },
        ],
        0x4a5a8a,
        4,
        0x2c3760,
    )
    poly(
        g,
        [
            { x: 870, y: 480 },
            { x: 900, y: 400 },
            { x: 930, y: 480 },
        ],
        0x2c3760,
        0,
    )

    // as pedras e a lenha da fogueira
    ;[
        [1100, 515],
        [1130, 522],
        [1165, 522],
        [1198, 515],
    ].forEach(([x, y]) => oval(g, x, y, 40, 22, 0x5a5a6a, 3, 0x3a3a4a))
    box(g, 1110, 498, 80, 14, 6, 0x6b4a2a, 3, 0x4a3020)

    // as moitas dos vaga-lumes
    ;[
        [1700, 420, 70],
        [1780, 410, 80],
        [1850, 430, 60],
    ].forEach(([x, y, r]) => {
        g.fillStyle(0x1f3a2e, 1)
        g.fillCircle(x, y, r)
    })

    // a lagoa
    oval(g, 1860, 540, 300, 90, 0x22304a, 4, 0x34466a)
    g.lineStyle(3, 0x4a5f8a, 1)
    g.lineBetween(1800, 540, 1850, 540)
    g.lineBetween(1880, 556, 1930, 556)
}

function nightThing(g: G, i: number) {
    const cx = 160
    const glow = (x: number, y: number, r: number, tone: number) => {
        for (let k = 4; k >= 1; k--) {
            g.fillStyle(tone, 0.08 * (5 - k))
            g.fillCircle(x, y, r * (1 + k * 0.35))
        }
    }
    if (i === 0) {
        glow(cx, 160, 80, 0xfff3c0)
        disc(g, cx, 160, 80, 0xfff3c0, 4, 0xd9c27a)
        ;[
            [cx - 25, 140, 16],
            [cx + 20, 185, 12],
            [cx + 30, 130, 9],
        ].forEach(([x, y, r]) => disc(g, x, y, r, 0xf2e2a0, 0))
        return
    }
    if (i === 1) {
        ;[
            [100, 120],
            [190, 90],
            [240, 160],
            [150, 190],
            [80, 230],
            [210, 240],
            [130, 260],
        ].forEach(([x, y]) => {
            glow(x, y, 12, 0xeaff8a)
            disc(g, x, y, 10, 0xeaff8a, 2, 0xb8d050)
        })
        return
    }
    if (i === 2 || i === 3) {
        const b = i === 3
        glow(cx, 190, 70, 0xffb24c)
        poly(
            g,
            [
                { x: cx - 70, y: 250 },
                { x: cx - 50, y: b ? 150 : 170 },
                { x: cx - 25, y: 200 },
                { x: cx, y: b ? 90 : 110 },
                { x: cx + 25, y: 190 },
                { x: cx + 50, y: b ? 160 : 140 },
                { x: cx + 70, y: 250 },
            ],
            0xff9a3c,
            4,
            0xd9602c,
        )
        poly(
            g,
            [
                { x: cx - 35, y: 250 },
                { x: cx - 10, y: b ? 170 : 160 },
                { x: cx + 10, y: b ? 150 : 175 },
                { x: cx + 35, y: 250 },
            ],
            0xffe07a,
            0,
        )
        box(g, cx - 90, 245, 180, 26, 10, 0x8a5a3a, 4, 0x5a3a20)
        return
    }
    if (i === 4) {
        g.fillStyle(0xfff6e4, 0.35)
        g.fillTriangle(30, 120, 210, 150, 210, 170)
        g.fillStyle(0xfff6e4, 0.6)
        g.fillTriangle(110, 140, 210, 152, 210, 168)
        glow(225, 160, 26, 0xfff3c0)
        const pts = Array.from({ length: 10 }, (_, k) => {
            const r = k % 2 ? 16 : 38
            const a = -Math.PI / 2 + (k * Math.PI) / 5
            return { x: 225 + Math.cos(a) * r, y: 160 + Math.sin(a) * r }
        })
        poly(g, pts, 0xffe49a, 3, 0xd9b04c)
        return
    }
    glow(cx, 170, 70, 0xffe7a0)
    box(g, cx - 40, 110, 80, 120, 18, 0xfff3c0, 5, 0xc99a3c)
    box(g, cx - 50, 92, 100, 26, 10, 0x6b8a6a, 4, 0x4a6a4a)
    box(g, cx - 50, 222, 100, 26, 10, 0x6b8a6a, 4, 0x4a6a4a)
    g.lineStyle(6, 0x4a6a4a, 1)
    g.beginPath()
    g.arc(cx, 92, 30, Math.PI, 0)
    g.strokePath()
}
