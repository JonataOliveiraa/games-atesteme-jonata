import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ANT_SHEET, antCell, cellKey, sheetScale } from '../data/files'
import { CAP, radiusOf } from '../data/fruits'
import { CUT, DEPTH, GAUGE, H, HEADER, MAP, W, WD } from '../data/layout'
import { C } from '../data/theme'
import type { Rect, Vec } from '../types'
import type { View } from './view'

/**
 * O MODO DE CORTE. Escurece o jardim, mostra o medidor ao lado da fruta e o ✓,
 * e transforma o arrasto do dedo num traço reto: do ponto onde o dedo
 * desceu até o ponto onde subiu.
 */
export interface CutterOptions {
    /** Onde fica a fruta (ou o pedaço) no mundo. O medidor vai à direita. */
    at: Vec
    /** Área do vento em px² de arte, ou 0 sem vento. */
    windMin: number
    /** Área do peso em px² de arte, ou 0 sem peso (o círculo com a formiguinha). */
    lift: number
    /** Meia largura do item no mundo: o medidor fica do lado de fora dele. */
    halfW: number
    done: boolean
    /** Esfregar (N3): sem medidor e sem traço, só o véu e o ✓. */
    scrub?: boolean
    onSwipe(a: Vec, b: Vec): void
    onDone(): void
}

export interface Cutter {
    open(o: CutterOptions): void
    setDone(on: boolean): void
    setInput(on: boolean): void
    close(): void
    hint(a: Vec, b: Vec): void
    clearHint(): void
    pulseGauge(): Promise<void>
    /** Desenha o traço (usado pela demonstração, em coordenadas de tela). */
    drawTrail(a: Vec, b: Vec): void
    clearTrail(): void
    doneAt(): Vec
    doneRect(): Rect
    gaugeRect(): Rect
    destroy(): void
}

export function createCutter(scene: Phaser.Scene, view: View): Cutter {
    const veil = scene.add.rectangle(W / 2, H / 2, W * 3, H * 3, C.veil, 0.45).setVisible(false)
    view.add(veil, WD.veil)

    const gauge = scene.add.container(0, 0).setVisible(false)
    view.add(gauge, WD.gauge)
    const gaugeArt = scene.add.graphics()
    const liftAnt = scene.add
        .image(0, 0, ANT_SHEET.key, cellKey(antCell('carry')))
        .setOrigin(0.5, 0.9)
        .setVisible(false)
    gauge.add([gaugeArt, liftAnt])

    const hintArt = scene.add.graphics().setVisible(false)
    view.add(hintArt, WD.hint)
    let hintTween: Phaser.Tweens.Tween | undefined

    const trail = scene.add.graphics().setDepth(DEPTH.trail)

    const doneArt = scene.add.graphics()
    const done = scene.add.container(CUT.doneX, CUT.doneY, [doneArt]).setDepth(DEPTH.done).setVisible(false)
    const doneZone = scene.add
        .zone(CUT.doneX, CUT.doneY, CUT.doneR * 2 + 20, CUT.doneR * 2 + 20)
        .setDepth(DEPTH.done + 1)
        .setInteractive({ useHandCursor: true })
    if (doneZone.input) doneZone.input.enabled = false

    let opts: CutterOptions | null = null
    let doneOn = false
    let input = false
    let owner: number | null = null
    let start: Vec = { x: 0, y: 0 }
    let gaugeR = 0

    const paintDone = () => {
        doneArt.clear()
        const r = CUT.doneR
        const fill = doneOn ? C.yes : C.creamDark
        const rim = doneOn ? C.yesDark : C.slotRim
        doneArt.fillStyle(C.shadow, 0.25)
        doneArt.fillCircle(3, 7, r)
        doneArt.fillStyle(rim, 1)
        doneArt.fillCircle(0, 0, r)
        doneArt.fillStyle(fill, 1)
        doneArt.fillCircle(0, -4, r - 6)
        doneArt.lineStyle(13, C.white, doneOn ? 1 : 0.7)
        doneArt.strokePoints(
            [
                { x: -24, y: -2 },
                { x: -6, y: 18 },
                { x: 26, y: -22 },
            ],
            false,
        )
        if (doneZone.input) doneZone.input.enabled = doneOn && input
    }

    const paintGauge = (windMin: number, lift: number) => {
        gaugeArt.clear()
        const s = MAP.scale
        gaugeR = radiusOf(CAP) * s
        liftAnt.setVisible(lift > 0)
        if (lift > 0) {
            // até deste tamanho ela levanta: o círculo maior, em linha cheia, com a formiguinha dentro
            const r = radiusOf(lift) * s
            gaugeArt.fillStyle(C.lift, 0.14)
            gaugeArt.fillCircle(0, 0, r)
            gaugeArt.lineStyle(3, C.lift, 1)
            gaugeArt.strokeCircle(0, 0, r)
            const band = r - gaugeR
            liftAnt.setPosition(0, r - 2).setScale((band * 1.5 / ANT_SHEET.cellW) * sheetScale(scene, ANT_SHEET))
        }
        // as duas pedrinhas da fresta, uma de cada lado
        ;[-1, 1].forEach(side => {
            gaugeArt.fillStyle(C.stoneDark, 1)
            gaugeArt.fillEllipse(side * (gaugeR + 15), 2, 24, 30)
            gaugeArt.fillStyle(C.stone, 1)
            gaugeArt.fillEllipse(side * (gaugeR + 15), 0, 20, 26)
            gaugeArt.fillStyle(C.stoneLight, 1)
            gaugeArt.fillEllipse(side * (gaugeR + 13) - 3, -6, 8, 6)
        })
        gaugeArt.fillStyle(C.white, 0.22)
        gaugeArt.fillCircle(0, 0, gaugeR)
        // o círculo tracejado: até deste tamanho passa
        const n = 28
        gaugeArt.lineStyle(2.6, C.white, 1)
        for (let i = 0; i < n; i += 2) {
            const a0 = (i / n) * Math.PI * 2
            const a1 = ((i + 1) / n) * Math.PI * 2
            gaugeArt.beginPath()
            gaugeArt.arc(0, 0, gaugeR, a0, a1, false)
            gaugeArt.strokePath()
        }
        if (windMin > 0) {
            const r = radiusOf(windMin) * s
            gaugeArt.fillStyle(C.sky, 0.9)
            gaugeArt.fillCircle(0, 0, r)
            gaugeArt.lineStyle(1.6, C.white, 1)
            gaugeArt.strokeCircle(0, 0, r)
            // o redemoinho
            gaugeArt.lineStyle(1.8, C.white, 1)
            gaugeArt.beginPath()
            for (let k = 0; k <= 24; k++) {
                const a = (k / 24) * Math.PI * 3
                const rr = (k / 24) * r * 0.75
                const px = Math.cos(a) * rr
                const py = Math.sin(a) * rr
                if (k === 0) gaugeArt.moveTo(px, py)
                else gaugeArt.lineTo(px, py)
            }
            gaugeArt.strokePath()
        }
    }

    const clearTrail = () => trail.clear()

    const drawTrail = (a: Vec, b: Vec) => {
        trail.clear()
        trail.lineStyle(14, C.knifeEdge, 0.55)
        trail.lineBetween(a.x, a.y, b.x, b.y)
        trail.lineStyle(6, C.knife, 1)
        trail.lineBetween(a.x, a.y, b.x, b.y)
        trail.fillStyle(C.knife, 1)
        trail.fillCircle(a.x, a.y, 7)
        trail.fillCircle(b.x, b.y, 9)
        trail.lineStyle(3, C.knifeEdge, 1)
        trail.strokeCircle(b.x, b.y, 9)
    }

    const onDown = (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (!opts || opts.scrub || !input || owner !== null || over.length) return
        if (p.y < HEADER.h) return
        owner = p.id
        start = { x: p.x, y: p.y }
        drawTrail(start, start)
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (p.id !== owner) return
        drawTrail(start, { x: p.x, y: p.y })
    }
    const onUp = (p: Phaser.Input.Pointer) => {
        if (p.id !== owner) return
        owner = null
        const end = { x: p.x, y: p.y }
        void FX.to(scene, trail, { alpha: 0 }, { duration: 180 }).then(() => {
            if (owner === null) clearTrail()
            trail.setAlpha(1)
        })
        if (Math.hypot(end.x - start.x, end.y - start.y) < CUT.minSwipe) return
        opts?.onSwipe(view.toWorld(start.x, start.y), view.toWorld(end.x, end.y))
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)

    doneZone.on('pointerdown', () => {
        if (!opts || !doneOn || !input) return
        void FX.press(scene, done)
        opts.onDone()
    })

    const cutter: Cutter = {
        open(o) {
            opts = o
            doneOn = o.done
            input = false
            veil.setVisible(true).setAlpha(0)
            void FX.to(scene, veil, { alpha: 1 }, { duration: 300 })
            paintGauge(o.windMin, o.lift)
            const outer = o.lift > 0 ? radiusOf(o.lift) * MAP.scale : gaugeR + 27
            const dx = Math.max(CUT.gaugeDX, o.halfW + outer + GAUGE.gap)
            gauge.setPosition(o.at.x + dx, o.at.y + CUT.gaugeDY).setVisible(!o.scrub).setAlpha(0)
            if (!o.scrub) void FX.to(scene, gauge, { alpha: 1 }, { duration: 300, delay: 200 })
            done.setVisible(true)
            paintDone()
            void FX.popIn(scene, done, { from: 0.5, duration: 320 })
        },
        setDone(on) {
            doneOn = on
            paintDone()
        },
        setInput(on) {
            input = on
            if (!on) {
                owner = null
                clearTrail()
            }
            paintDone()
        },
        close() {
            cutter.setInput(false)
            cutter.clearHint()
            opts = null
            void FX.to(scene, [veil, gauge], { alpha: 0 }, { duration: 240 }).then(() => {
                if (opts) return
                veil.setVisible(false)
                gauge.setVisible(false)
            })
            done.setVisible(false)
            if (doneZone.input) doneZone.input.enabled = false
        },
        hint(a, b) {
            hintArt.clear().setVisible(true).setAlpha(1)
            const len = Math.hypot(b.x - a.x, b.y - a.y)
            const n = Math.max(2, Math.floor(len / 9))
            hintArt.lineStyle(4.5, C.hint, 1)
            for (let i = 0; i < n; i += 2) {
                const t0 = i / n
                const t1 = Math.min(1, (i + 1) / n)
                hintArt.lineBetween(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0, a.x + (b.x - a.x) * t1, a.y + (b.y - a.y) * t1)
            }
            hintTween?.stop()
            hintTween = scene.tweens.add({ targets: hintArt, alpha: 0.25, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        clearHint() {
            hintTween?.stop()
            hintTween = undefined
            hintArt.clear().setVisible(false)
        },
        async pulseGauge() {
            await FX.to(scene, gauge, { scale: 1.25 }, { duration: 260, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
            gauge.setScale(1)
        },
        drawTrail,
        clearTrail,
        doneAt: () => ({ x: CUT.doneX, y: CUT.doneY }),
        doneRect: () => ({ x: CUT.doneX, y: CUT.doneY, w: CUT.doneR * 2 + 24, h: CUT.doneR * 2 + 24 }),
        gaugeRect() {
            const c = view.toScreen(gauge.x, gauge.y)
            const r = (gaugeR + 30) * view.root.scale
            return { x: c.x, y: c.y, w: r * 2, h: r * 2 }
        },
        destroy() {
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            hintTween?.stop()
            doneZone.destroy()
            done.destroy()
            trail.destroy()
            hintArt.destroy()
            gauge.destroy()
            veil.destroy()
        },
    }
    return cutter
}
