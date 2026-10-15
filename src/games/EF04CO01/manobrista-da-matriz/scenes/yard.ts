import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG, PIECE } from '../data/files'
import { CAR, DEPTH, GRID, H, HEADERS, LABEL, SHOT, W, WHEEL, YARD, spotCenter, spotRect, type Shot } from '../data/layout'
import { C, FONT } from '../data/theme'
import { colLabel, rowLabel } from '../data/words'
import type { Cell, Scheme } from '../types'
import { carImage, pieceImage } from './art'

export type Rect = { x: number; y: number; w: number; h: number }

const ROW_TONE = 0xb89cf0
const COL_TONE = 0x5fd0b0
const WALL = 40

/**
 * O pátio: o fundo, as vagas pintadas, os números das linhas e colunas, os carros
 * estacionados e as guias que acendem. Tudo num container; o "zoom" é a escala dele.
 */
export function createYard(scene: Phaser.Scene, rows: number, cols: number) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.world)
    root.add(scene.add.image(W / 2, H / 2, BG).setDisplaySize(W, H))

    const key = `grid-${rows}x${cols}`
    if (!scene.textures.exists(key)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.lineStyle(6, 0xffffff, 0.95)
        for (let l = 1; l <= rows; l++) {
            const top = spotRect([l, 1]).y
            g.lineBetween(GRID.x0, top, GRID.x0 + cols * GRID.spotW, top)
            for (let c = 0; c <= cols; c++) {
                const x = GRID.x0 + c * GRID.spotW
                g.lineBetween(x, top, x, top + GRID.spotH)
            }
            g.fillStyle(0xffffff, 0.35)
            const aisleY = top + GRID.spotH + GRID.aisle / 2
            for (let x = GRID.x0 - 120; x < YARD.x + YARD.w - 150; x += 60) g.fillRect(x, aisleY - 3, 30, 6)
        }
        g.generateTexture(key, W, H)
        g.destroy()
    }

    const gridRight = GRID.x0 + cols * GRID.spotW
    const gridBottom = spotRect([rows, 1]).y + GRID.spotH
    const rowBands: Phaser.GameObjects.Rectangle[] = []
    const colBands: Phaser.GameObjects.Rectangle[] = []
    for (let l = 1; l <= rows; l++) {
        const r = spotRect([l, 1])
        rowBands.push(scene.add.rectangle(LABEL.rowX - 26, r.y + r.h / 2, gridRight - LABEL.rowX + 36, r.h, ROW_TONE, 0).setOrigin(0, 0.5))
    }
    for (let c = 1; c <= cols; c++) {
        const r = spotRect([1, c])
        colBands.push(scene.add.rectangle(r.x + r.w / 2, LABEL.colY - 24, r.w, gridBottom - LABEL.colY + 24, COL_TONE, 0).setOrigin(0.5, 0))
    }
    root.add([...rowBands, ...colBands])
    root.add(scene.add.image(W / 2, H / 2, key))

    const plate = (x: number, y: number, n: number, tone: number, prefix: string) => {
        const bg = scene.add.graphics()
        bg.fillStyle(C.shadow, 0.25)
        const { w, h } = LABEL
        bg.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 13)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 13)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 13)
        const t = scene.add
            .text(0, 1, `${prefix}${n}`, { fontFamily: FONT.black, fontSize: `${LABEL.font}px`, color: '#3d2c3e' })
            .setOrigin(0.5)
            .setResolution(2)
        return scene.add.container(x, y, [bg, t]).setDepth(DEPTH.headers).setData('ax', x).setData('ay', y)
    }
    const rowPlates: Phaser.GameObjects.Container[] = []
    const colPlates: Phaser.GameObjects.Container[] = []
    for (let l = 1; l <= rows; l++) rowPlates.push(plate(LABEL.rowX, spotCenter([l, 1]).y, l, ROW_TONE, 'L'))
    for (let c = 1; c <= cols; c++) colPlates.push(plate(spotCenter([1, c]).x, LABEL.colY, c, COL_TONE, 'C'))

    const outline = scene.add.rectangle(0, 0, GRID.spotW - 8, GRID.spotH - 8).setStrokeStyle(7, C.star).setVisible(false)
    const cars = scene.add.container(0, 0)
    root.add([outline, cars])

    const parked: Array<{ cell: Cell; image: Phaser.GameObjects.Image }> = []
    let pulse: Phaser.Tweens.Tween | undefined

    const walls: Rect[] = [
        { x: YARD.x - WALL, y: YARD.y - WALL, w: YARD.w + WALL * 2, h: WALL },
        { x: YARD.x - WALL, y: YARD.y + YARD.h, w: YARD.w + WALL * 2, h: WALL },
        { x: YARD.x - WALL, y: YARD.y, w: WALL, h: YARD.h },
        { x: YARD.x + YARD.w, y: YARD.y, w: WALL, h: YARD.h },
    ]

    let shot: Shot = { x: W / 2, y: H / 2, zoom: 1 }
    const clamp = (to: Shot): Shot => {
        const hw = W / 2 / to.zoom
        const hh = H / 2 / to.zoom
        return { zoom: to.zoom, x: Phaser.Math.Clamp(to.x, hw, W - hw), y: Phaser.Math.Clamp(to.y, hh, H - hh) }
    }
    const apply = (v: Shot) => {
        root.setScale(v.zoom)
        root.setPosition(W / 2 - v.x * v.zoom, H / 2 - v.y * v.zoom)
        placeHeaders()
    }
    const toScreen = (p: { x: number; y: number }) => ({ x: root.x + p.x * root.scaleX, y: root.y + p.y * root.scaleY })

    /** as placas ficam fora do zoom: seguem a fileira/coluna e grudam na borda da tela */
    const placeHeaders = () => {
        rowPlates.forEach(p => {
            const s = toScreen({ x: p.getData('ax'), y: p.getData('ay') })
            // na altura do volante, a placa desvia para a direita dele
            const left = s.y > WHEEL.y - WHEEL.r - 26 ? WHEEL.x + WHEEL.r + 40 : HEADERS.left
            p.setPosition(Math.max(left, s.x), s.y).setVisible(s.y > HEADERS.top && s.y < HEADERS.bottom)
        })
        colPlates.forEach(p => {
            const s = toScreen({ x: p.getData('ax'), y: p.getData('ay') })
            p.setPosition(s.x, Math.max(HEADERS.top, s.y)).setVisible(s.x > HEADERS.margin && s.x < W - HEADERS.margin)
        })
    }

    const glow = (band: Phaser.GameObjects.Rectangle | undefined, alpha: number, ms = 260) =>
        band ? FX.to(scene, band, { fillAlpha: alpha }, { duration: ms }) : Promise.resolve()

    placeHeaders()

    return {
        root,
        rows,
        cols,
        add(obj: Phaser.GameObjects.GameObject) {
            cars.add(obj)
        },
        toScreen,
        get shot() {
            return shot
        },
        frame(to: Shot, ms = 650) {
            const from = { ...shot }
            const end = clamp(to)
            shot = end
            const k = { t: 0 }
            return new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: () =>
                        apply({
                            zoom: Phaser.Math.Linear(from.zoom, end.zoom, k.t),
                            x: Phaser.Math.Linear(from.x, end.x, k.t),
                            y: Phaser.Math.Linear(from.y, end.y, k.t),
                        }),
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                }),
            )
        },
        /** a câmera alcança o ponto aos poucos, com o zoom de dirigir */
        chase(to: { x: number; y: number }, dt: number) {
            const end = clamp({ x: to.x, y: to.y, zoom: SHOT.follow })
            const k = 1 - Math.exp(-SHOT.chase * dt)
            shot = { zoom: end.zoom, x: Phaser.Math.Linear(shot.x, end.x, k), y: Phaser.Math.Linear(shot.y, end.y, k) }
            apply(shot)
        },
        /** a vaga que contém o ponto (coordenadas do mundo) */
        cellAt(x: number, y: number): Cell | null {
            for (let l = 1; l <= rows; l++)
                for (let c = 1; c <= cols; c++) {
                    const r = spotRect([l, c])
                    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return [l, c]
                }
            return null
        },
        isFree(cell: Cell) {
            return !parked.some(p => p.cell[0] === cell[0] && p.cell[1] === cell[1])
        },
        /** o carro fica na vaga e vira obstáculo */
        park(cell: Cell, image: Phaser.GameObjects.Image) {
            parked.push({ cell, image })
        },
        /** um carro já estacionado (começo do nível) */
        placeParked(cell: Cell, color: number) {
            const p = spotCenter(cell)
            const image = carImage(scene, color, CAR.len).setPosition(p.x, p.y)
            cars.add(image)
            parked.push({ cell, image })
        },
        /** os carros que já estavam no pátio aparecem um por um */
        async popParked(onEach: (i: number) => void) {
            const all = parked.map(p => p.image)
            all.forEach(img => img.setVisible(false))
            for (let i = 0; i < all.length; i++) {
                all[i].setVisible(true)
                onEach(i)
                void FX.popIn(scene, all[i], { from: 0.3, duration: 260 })
                await FX.wait(scene, 140)
            }
        },
        obstacles(): Rect[] {
            return [
                ...walls,
                ...parked.map(p => {
                    const c = spotCenter(p.cell)
                    return { x: c.x - CAR.w / 2 - 2, y: c.y - CAR.len / 2 - 2, w: CAR.w + 4, h: CAR.len + 4 }
                }),
            ]
        },
        showRow(l: number, alpha = 0.45) {
            return glow(rowBands[l - 1], alpha)
        },
        showCol(c: number, alpha = 0.45) {
            return glow(colBands[c - 1], alpha)
        },
        /** as placas viram (como uma página) e mostram a numeração nova */
        relabel(scheme: Scheme) {
            const flip = (p: Phaser.GameObjects.Container, label: string, i: number) =>
                new Promise<void>(resolve =>
                    scene.tweens.add({
                        targets: p,
                        scaleX: 0,
                        duration: FX.ms(scene, 150),
                        delay: FX.ms(scene, i * 60),
                        yoyo: true,
                        ease: 'Sine.easeInOut',
                        onYoyo: () => (p.list[1] as Phaser.GameObjects.Text).setText(label),
                        onComplete: () => resolve(),
                        onStop: () => resolve(),
                    }),
                )
            return Promise.all([
                ...rowPlates.map((p, i) => flip(p, rowLabel(i + 1, scheme), i)),
                ...colPlates.map((p, i) => flip(p, colLabel(i + 1, scheme), rows + i)),
            ])
        },
        /** a faixa da linha se pinta da esquerda para a direita */
        sweepRow(l: number) {
            const band = rowBands[l - 1]
            if (!band) return Promise.resolve()
            band.setFillStyle(ROW_TONE, 0.5).setScale(0, 1)
            return FX.to(scene, band, { scaleX: 1 }, { duration: 650, ease: 'Sine.easeOut' })
        },
        /** a faixa da coluna se pinta de cima para baixo */
        sweepCol(c: number) {
            const band = colBands[c - 1]
            if (!band) return Promise.resolve()
            band.setFillStyle(COL_TONE, 0.5).setScale(1, 0)
            return FX.to(scene, band, { scaleY: 1 }, { duration: 650, ease: 'Sine.easeOut' })
        },
        rowPlate(l: number) {
            const p = rowPlates[l - 1]
            return { x: p.x, y: p.y }
        },
        colPlate(c: number) {
            const p = colPlates[c - 1]
            return { x: p.x, y: p.y }
        },
        hideGuides() {
            rowBands.forEach(b => void glow(b, 0).then(() => b.setScale(1)))
            colBands.forEach(b => void glow(b, 0).then(() => b.setScale(1)))
            pulse?.remove()
            pulse = undefined
            outline.setVisible(false)
        },
        bumpRow(l: number) {
            const p = rowPlates[l - 1]
            return p ? FX.to(scene, p, { scale: 1.3 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' }) : Promise.resolve()
        },
        bumpCol(c: number) {
            const p = colPlates[c - 1]
            return p ? FX.to(scene, p, { scale: 1.3 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' }) : Promise.resolve()
        },
        /** contorno amarelo piscando na vaga */
        mark(cell: Cell) {
            const p = spotCenter(cell)
            pulse?.remove()
            outline.setPosition(p.x, p.y).setVisible(true).setAlpha(1)
            pulse = scene.tweens.add({ targets: outline, alpha: 0.25, duration: FX.ms(scene, 380), yoyo: true, repeat: -1 })
        },
        /** a fileira toda e as colunas, na tela (para os destaques do tutorial) */
        gridRect(): Rect {
            const a = toScreen({ x: LABEL.rowX - 40, y: LABEL.colY - 34 })
            const b = toScreen({ x: gridRight + 14, y: gridBottom + 14 })
            return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: b.x - a.x, h: b.y - a.y }
        },
        spotScreen(cell: Cell) {
            return toScreen(spotCenter(cell))
        },
        /** fim do nível: cada carro pisca o farol, um por vez */
        async blink(onEach: (i: number) => void) {
            for (let i = 0; i < parked.length; i++) {
                const { image } = parked[i]
                const ahead = CAR.len / 2 + 26
                const light = pieceImage(scene, PIECE.light, 70)
                    .setPosition(image.x + Math.sin(image.rotation) * ahead, image.y - Math.cos(image.rotation) * ahead)
                    .setRotation(image.rotation - Math.PI / 2)
                    .setAlpha(0)
                cars.add(light)
                onEach(i)
                void FX.to(scene, image, { scale: image.scale * 1.08 }, { duration: 120, yoyo: true })
                await FX.to(scene, light, { alpha: 1 }, { duration: 120, yoyo: true, repeat: 1 })
                light.destroy()
            }
        },
        destroy() {
            pulse?.remove()
            ;[...rowPlates, ...colPlates].forEach(p => p.destroy())
            root.destroy()
        },
    }
}

export type Yard = ReturnType<typeof createYard>
