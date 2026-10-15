import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICE, DEVICE_SHEET, PIECE_SHEET, PISTA, PISTA_SHEET, TUBE_TILE, UI, cellKey } from '../data/files'
import { COMPUTER, DESK, DEVICE_CELL, LAPTOP, PLAY, W } from '../data/layout'
import { COMPUTER_PORT, LAPTOP_PORT, buildDesk, deskPoint } from '../data/levels'
import { poseAt, type Path, type Point, type Pose } from '../data/path'
import { BIT_COLOR, C, CSS, FONT, SIZE } from '../data/theme'
import type { Bit, Look } from '../types'
import { fit, piece, refit } from './art'
import { STATIC } from './fallback'

export type Rect = { x: number; y: number; w: number; h: number }

export interface Desk {
    readonly root: Phaser.GameObjects.Container
    readonly path: Path
    setShape(shape: number): void
    swapShape(shape: number): Promise<void>
    poseAt(fraction: number): Pose
    endPose(): Pose
    /** o ponto (x, y) da mesa aparece em (sx, sy) da tela, com zoom e giro */
    view(x: number, y: number, sx: number, sy: number, zoom: number, rotation: number): void
    rest(): void
    spark(to: number, ms: number): Promise<void>
    sending(look: Look | null): void
    laptopRect(): Rect
    /** a figura tenta entrar na porta do fio e volta: ela não cabe */
    bounce(): Promise<void>
    /** onde cada número do código fica na tela do notebook */
    codeSpots(n: number): Point[]
    showCode(code: string | null): void
    store(code: string, onEach: (bit: Bit) => void): Promise<void>
    shakeMemory(i: number): Promise<void>
    computerScreen(): Rect
    showSpot(): Point
    /** a figura que chegou, ou a palavra montada até aqui */
    show(look: Look): void
    noise(): Promise<void>
    party(): Promise<void>
    clearRead(): void
    destroy(): void
}

const MINI_PLUG = DESK.cable / PLAY.tube

/** a vista geral: as duas mesas, os dois computadores e o fio fino entre eles */
export function createDesk(scene: Phaser.Scene, bits: number): Desk {
    const root = scene.add.container(0, 0)
    const far = 40000

    const wall = scene.add.rectangle(-far, -far, far * 2 + W, far + DESK.floor, C.wall).setOrigin(0)
    const floor = scene.add.rectangle(-far, DESK.floor, far * 2 + W, far, C.floor).setOrigin(0)
    const floorLine = scene.add.rectangle(-far, DESK.floor, far * 2 + W, 6, C.floorLine).setOrigin(0)
    root.add([wall, floor, floorLine])

    const device = (index: number, centerX: number) =>
        scene.add
            .image(centerX, deskPoint(centerX, { x: 0, y: DEVICE_CELL.h / 2 }).y, DEVICE_SHEET.key, cellKey(index))
            .setDisplaySize(DEVICE_CELL.w * DESK.scale, DEVICE_CELL.h * DESK.scale)
    const laptop = device(DEVICE.laptop, DESK.laptopX)
    const computer = device(DEVICE.computer, DESK.computerX)
    root.add([laptop, computer])

    /** o fio é o mesmo tubo da corrida, encolhido: no mergulho ele vira o tubo de verdade */
    const cable = scene.add.container(0, 0).setScale(MINI_PLUG)
    root.add(cable)
    const plugA = scene.add.image(0, 0, PISTA_SHEET.key, cellKey(PISTA.plug)).setFlipX(true).setOrigin(0, 0.5)
    const plugB = scene.add.image(0, 0, PISTA_SHEET.key, cellKey(PISTA.plug)).setOrigin(1, 0.5)
    ;[plugA, plugB].forEach(p => p.setScale(((PLAY.tube * PLAY.plug) / p.frame.height) * MINI_PLUG))
    root.add([plugA, plugB])

    const rect = (centerX: number, r: Rect): Rect => {
        const a = deskPoint(centerX, { x: r.x, y: r.y })
        const b = deskPoint(centerX, { x: r.x + r.w, y: r.y + r.h })
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: b.x - a.x, h: b.y - a.y }
    }
    const lap = rect(DESK.laptopX, LAPTOP.screen)
    const scr = rect(DESK.computerX, COMPUTER.screen)

    const outgoing = fit(scene, PIECE_SHEET, 4, 84).setPosition(lap.x, lap.y).setAlpha(0)
    const outgoingText = scene.add
        .text(lap.x, lap.y, '', { fontFamily: FONT.black, fontSize: '84px', color: CSS.accent, stroke: CSS.white, strokeThickness: 8 })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0)
    const CELL = Math.min(32, Math.floor((scr.w - 12) / bits) - 4)
    const memY = scr.y - scr.h / 2 + CELL / 2 + 8
    const memX = (i: number) => scr.x + (i - (bits - 1) / 2) * (CELL + 6)
    const memory = Array.from({ length: bits }, (_, i) => {
        const art = piece(scene, UI.slot, CELL).setPosition(memX(i), memY).setAlpha(0)
        const digit = scene.add
            .text(memX(i), memY + 1, '', { fontFamily: FONT.black, fontSize: `${Math.min(SIZE.memory, Math.round(CELL * 0.7))}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        return { art, digit }
    })
    const below = memY + CELL / 2
    const showY = (below + scr.y + scr.h / 2) / 2
    const FIG = Math.min(96, scr.y + scr.h / 2 - below - 14)
    const big = fit(scene, PIECE_SHEET, 4, FIG).setPosition(scr.x, showY).setAlpha(0)
    const bigText = scene.add
        .text(scr.x, showY, '', { fontFamily: FONT.black, fontSize: `${Math.round(FIG)}px`, color: CSS.accent, stroke: CSS.white, strokeThickness: 8 })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0)
    const fuzzTop = memY + CELL / 2 + 8
    const fuzzBottom = scr.y + scr.h / 2 - 8
    const fuzz = scene.add
        .image(scr.x, (fuzzTop + fuzzBottom) / 2, STATIC)
        .setDisplaySize(scr.w - 16, fuzzBottom - fuzzTop)
        .setAlpha(0)
    const question = scene.add
        .text(scr.x, showY, '?', { fontFamily: FONT.black, fontSize: `${Math.round(FIG)}px`, color: CSS.ink, stroke: CSS.white, strokeThickness: 8 })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0)
    const spark = scene.add.image(0, 0, PISTA_SHEET.key, cellKey(PISTA.spark)).setAlpha(0)
    const sparkBase = 34 / spark.frame.width
    spark.setScale(sparkBase)
    root.add([outgoing, outgoingText, ...memory.flatMap(m => [m.art, m.digit]), fuzz, big, bigText, question, spark])
    let codeTexts: Phaser.GameObjects.Text[] = []
    const codeStep = (n: number) => Math.min(44, (lap.w - 16) / n)
    const codeX = (i: number, n: number) => lap.x + (i - (n - 1) / 2) * codeStep(n)
    const clearCode = () => {
        codeTexts.forEach(t => t.destroy())
        codeTexts = []
    }

    let path: Path = buildDesk(0)
    let ropes: Phaser.GameObjects.Rope[] = []
    let fuzzTween: Phaser.Tweens.Tween | undefined
    let shown = 4

    const paintCable = () => {
        ropes.forEach(r => r.destroy())
        ropes = []
        const tile = scene.textures.get(TUBE_TILE).getSourceImage() as HTMLCanvasElement
        const per = Math.max(2, Math.round((tile.width * MINI_PLUG) / path.step))
        for (let i = 0; i < path.xs.length - 1; i += per) {
            const pts: Phaser.Math.Vector2[] = []
            for (let j = i; j <= Math.min(i + per, path.xs.length - 1); j++)
                pts.push(new Phaser.Math.Vector2(path.xs[j] / MINI_PLUG, path.ys[j] / MINI_PLUG))
            if (pts.length < 2) break
            const rope = scene.add.rope(0, 0, TUBE_TILE, undefined, pts, true)
            cable.add(rope)
            ropes.push(rope)
        }
        const a = poseAt(path, 0)
        const b = poseAt(path, path.length)
        plugA.setPosition(LAPTOP_PORT.x, LAPTOP_PORT.y).setRotation(a.angle)
        plugB.setPosition(COMPUTER_PORT.x, COMPUTER_PORT.y).setRotation(b.angle)
    }

    const setShape = (shape: number) => {
        path = buildDesk(shape)
        paintCable()
    }
    setShape(0)

    return {
        root,
        get path() {
            return path
        },
        setShape,
        async swapShape(shape) {
            await FX.to(scene, cable, { alpha: 0 }, { duration: 220 })
            setShape(shape)
            cable.setAlpha(0).setScale(MINI_PLUG, MINI_PLUG * 0.6)
            await FX.to(scene, cable, { alpha: 1, scaleY: MINI_PLUG }, { duration: 420, ease: 'Back.easeOut' })
        },
        poseAt: fraction => poseAt(path, fraction * path.length),
        endPose: () => poseAt(path, path.length),
        view(x, y, sx, sy, zoom, rotation) {
            const cos = Math.cos(rotation)
            const sin = Math.sin(rotation)
            root.setScale(zoom).setRotation(rotation)
            root.setPosition(sx - (cos * x - sin * y) * zoom, sy - (sin * x + cos * y) * zoom)
            spark.setScale((sparkBase * Math.min(zoom, 2.5)) / zoom)
        },
        rest() {
            root.setScale(1).setRotation(0).setPosition(0, 0).setAlpha(1).setVisible(true)
            spark.setAlpha(0).setScale(sparkBase)
        },
        async spark(to, ms) {
            spark.setAlpha(1)
            const s = { v: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: s,
                    v: to,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeIn',
                    onUpdate: () => {
                        const p = poseAt(path, s.v * path.length)
                        spark.setPosition(p.x, p.y)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
        },
        sending(look) {
            spark.setAlpha(0)
            clearCode()
            outgoing.setAlpha(0)
            outgoingText.setAlpha(0)
            if (look === null) return
            if ('glyph' in look) {
                outgoingText.setText(look.glyph).setAlpha(1).setScale(1)
                void FX.popIn(scene, outgoingText, { from: 0.5 })
                return
            }
            refit(outgoing, look.frame, 84)
            const base = outgoing.scale
            outgoing.setAlpha(1)
            void FX.popIn(scene, outgoing, { from: 0.5 }).then(() => outgoing.setScale(base))
        },
        laptopRect: () => ({ x: laptop.x, y: laptop.y, w: laptop.displayWidth + 16, h: laptop.displayHeight + 16 }),
        async bounce() {
            const home = { x: outgoing.x, y: outgoing.y }
            const base = outgoing.scale
            await FX.to(scene, outgoing, { x: LAPTOP_PORT.x - 10, y: LAPTOP_PORT.y, scale: base * 0.5 }, { duration: 560, ease: 'Sine.easeIn' })
            await FX.shake(scene, outgoing, { amount: 5, times: 3 })
            await FX.to(scene, outgoing, { x: home.x, y: home.y, scale: base }, { duration: 420, ease: 'Back.easeOut' })
        },
        codeSpots: n => Array.from({ length: n }, (_, i) => ({ x: codeX(i, n), y: lap.y })),
        showCode(code) {
            clearCode()
            if (!code) return
            outgoing.setAlpha(0)
            outgoingText.setAlpha(0)
            const size = Math.min(50, Math.round(codeStep(code.length) * 1.15))
            codeTexts = [...code].map((d, i) => {
                const t = scene.add
                    .text(codeX(i, code.length), lap.y, d, {
                        fontFamily: FONT.black,
                        fontSize: `${size}px`,
                        color: Phaser.Display.Color.IntegerToColor(BIT_COLOR[d as Bit]).rgba,
                        stroke: CSS.ink,
                        strokeThickness: size > 36 ? 8 : 5,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                root.add(t)
                return t
            })
        },
        async store(code, onEach) {
            for (let i = 0; i < code.length; i++) {
                const bit = code[i] as Bit
                const m = memory[i]
                m.art.setAlpha(1)
                m.digit.setText(bit).setColor(Phaser.Display.Color.IntegerToColor(BIT_COLOR[bit]).rgba)
                onEach(bit)
                void FX.popIn(scene, m.art, { from: 0.4, duration: 200 })
                await FX.popIn(scene, m.digit, { from: 0.4, duration: 200 })
                await FX.wait(scene, 120)
            }
        },
        async shakeMemory(i) {
            const m = memory[i]
            if (!m) return
            await FX.all(FX.shake(scene, m.art, { amount: 5, times: 3 }), FX.shake(scene, m.digit, { amount: 5, times: 3 }))
        },
        computerScreen: () => ({ ...scr }),
        showSpot: () => ({ x: scr.x, y: showY }),
        show(look) {
            if ('glyph' in look) {
                big.setAlpha(0)
                const size = Math.min(FIG, ((scr.w - 30) / Math.max(1, look.glyph.length)) * 1.3)
                bigText.setText(look.glyph).setFontSize(Math.round(size)).setAlpha(1)
                return
            }
            bigText.setAlpha(0)
            shown = look.frame
            refit(big, look.frame, FIG)
            big.setAlpha(1)
        },
        async noise() {
            fuzz.setAlpha(1)
            question.setAlpha(1)
            fuzzTween?.stop()
            fuzzTween = scene.tweens.add({ targets: fuzz, x: { from: fuzz.x - 5, to: fuzz.x + 5 }, duration: 60, yoyo: true, repeat: 12 })
            await FX.popIn(scene, question, { from: 0.4 })
        },
        async party() {
            const target = bigText.alpha > 0 ? bigText : big.alpha > 0 ? big : null
            if (!target) return
            void FX.sparks(scene, scr.x, showY, { color: C.one, count: 18, spread: 140 })
            await FX.to(scene, target, { y: showY - 16 }, { duration: 160, yoyo: true, repeat: 1 })
            target.y = showY
            if (target === big) refit(big, shown, FIG)
        },
        clearRead() {
            big.setAlpha(0)
            bigText.setAlpha(0)
            fuzz.setAlpha(0)
            question.setAlpha(0)
            fuzzTween?.stop()
            memory.forEach(m => {
                m.art.setAlpha(0)
                m.digit.setText('')
            })
        },
        destroy() {
            fuzzTween?.stop()
            root.destroy()
        },
    }
}
