import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, ITEMS_SHEET, PIECE_FRAME, TRAIN_FRAME, TRAIN_SHEET, frameKey } from '../data/files'
import { DEPTH, ENGINE, RAIL, TRAIN, WAGON } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { SIGN } from '../data/words'
import type { Kind, Side } from '../types'
import { drawHand, drawOrders } from './art'

export interface Train {
    enter(): Promise<void>
    leave(): Promise<void>
    reset(): void
    load(side: Side, item: Phaser.GameObjects.Container): Promise<void>
    reject(side: Side): Promise<void>
    whistle(): void
    mouth(side: Side): { x: number; y: number }
    rect(side: Side): { x: number; y: number; w: number; h: number }
    pulseSign(side: Side): Promise<void>
    readonly cargo: Phaser.GameObjects.Container
    destroy(): void
}

const KIND: Record<Side, Kind> = { left: 'part', right: 'program' }
const SLOTS = [-58, 58, 0, -100]
const SIGN_W = 222
const SIGN_H = 56

function signIcon(scene: Phaser.Scene, kind: Kind) {
    const name = kind === 'part' ? 'signHand' : 'signOrders'
    if (scene.textures.exists(ITEMS_SHEET)) {
        const [, , w, h] = PIECE_FRAME[name]
        return scene.add.image(0, 0, ITEMS_SHEET, frameKey(name)).setScale(40 / Math.max(w, h))
    }
    const g = scene.add.graphics()
    if (kind === 'part') drawHand(g)
    else drawOrders(g)
    return g.setScale(0.8)
}

export function createTrain(scene: Phaser.Scene): Train {
    const art = scene.textures.exists(TRAIN_SHEET)
    const back = scene.add.container(0, 0).setDepth(DEPTH.trainBack)
    const cargo = scene.add.container(0, 0).setDepth(DEPTH.cargo)
    const front = scene.add.container(0, 0).setDepth(DEPTH.trainFront)
    const layers = [back, cargo, front]

    const half = WAGON.w / 2
    const signY = (WAGON.frontTop + RAIL.y - 24) / 2

    const links = scene.add.graphics()
    links.fillStyle(C.steelDark, 1)
    links.fillRect(WAGON.xs.left + half - 4, RAIL.y - 40, WAGON.xs.right - WAGON.xs.left - WAGON.w + 8, 9)
    back.add(links)

    const signs = {} as Record<Side, Phaser.GameObjects.Container>
    const bodies = {} as Record<Side, Phaser.GameObjects.Container>
    const count: Record<Side, number> = { left: 0, right: 0 }

    const [, , wagonW, wagonH] = TRAIN_FRAME.wagon
    const wagonScale = WAGON.w / wagonW

    for (const side of ['left', 'right'] as Side[]) {
        const x = WAGON.xs[side]
        const body = scene.add.container(0, 0)
        if (art) {
            const whole = scene.add
                .image(x, RAIL.y, TRAIN_SHEET, frameKey('wagon'))
                .setOrigin(0.5, 1)
                .setScale(wagonScale)
            back.add(whole)
            const wall = scene.add
                .image(x, RAIL.y, TRAIN_SHEET, frameKey('wagon'))
                .setOrigin(0.5, 1)
                .setScale(wagonScale)
                .setCrop(0, ART.wagonFrontTop, wagonW, wagonH - ART.wagonFrontTop)
            body.add(wall)
        } else {
            const inner = scene.add.graphics()
            inner.fillStyle(C.woodDark, 1)
            inner.fillRoundedRect(x - half + 8, WAGON.top, WAGON.w - 16, WAGON.frontTop - WAGON.top + 4, 8)
            inner.lineStyle(4, C.ink, 1)
            inner.strokeRoundedRect(x - half + 8, WAGON.top, WAGON.w - 16, WAGON.frontTop - WAGON.top + 4, 8)
            back.add(inner)
            const g = scene.add.graphics()
            const bottom = RAIL.y - WAGON.wheelR - 4
            g.fillStyle(C.wood, 1)
            g.fillRoundedRect(x - half, WAGON.frontTop, WAGON.w, bottom - WAGON.frontTop, 12)
            g.lineStyle(5, C.ink, 1)
            g.strokeRoundedRect(x - half, WAGON.frontTop, WAGON.w, bottom - WAGON.frontTop, 12)
            g.fillStyle(C.mint, 1)
            g.fillRoundedRect(x - half - 6, WAGON.frontTop - 6, WAGON.w + 12, 16, 8)
            g.strokeRoundedRect(x - half - 6, WAGON.frontTop - 6, WAGON.w + 12, 16, 8)
            for (const dx of [-half + 46, half - 46]) {
                g.fillStyle(C.steelDark, 1)
                g.fillCircle(x + dx, RAIL.y - WAGON.wheelR, WAGON.wheelR)
                g.lineStyle(4, C.ink, 1)
                g.strokeCircle(x + dx, RAIL.y - WAGON.wheelR, WAGON.wheelR)
            }
            body.add(g)
        }

        const plate = scene.add.graphics()
        plate.fillStyle(C.cream, 1)
        plate.fillRoundedRect(-SIGN_W / 2, -SIGN_H / 2, SIGN_W, SIGN_H, 14)
        plate.lineStyle(4, C.ink, 1)
        plate.strokeRoundedRect(-SIGN_W / 2, -SIGN_H / 2, SIGN_W, SIGN_H, 14)
        const icon = signIcon(scene, KIND[side]).setPosition(-SIGN_W / 2 + 32, 0)
        const title = scene.add
            .text(20, -9, SIGN[KIND[side]].title, { fontFamily: FONT.black, fontSize: `${SIZE.sign}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const sub = scene.add
            .text(20, 14, SIGN[KIND[side]].sub, {
                fontFamily: FONT.body,
                fontStyle: 'bold',
                fontSize: `${SIZE.signSub}px`,
                color: CSS.inkSoft,
            })
            .setOrigin(0.5)
            .setResolution(2)
        const sign = scene.add.container(x, signY, [plate, icon, title, sub])
        signs[side] = sign
        body.add(sign)
        bodies[side] = body
        front.add(body)
    }

    let chimney = { x: ENGINE.x + 40, y: RAIL.y - ENGINE.h }
    if (art) {
        const [, , w, h] = TRAIN_FRAME.engine
        const scale = ENGINE.h / h
        front.add(scene.add.image(ENGINE.x, RAIL.y, TRAIN_SHEET, frameKey('engine')).setOrigin(0.5, 1).setScale(scale))
        chimney = { x: ENGINE.x + (ART.engineChimney.x - w / 2) * scale, y: RAIL.y - (h - ART.engineChimney.y) * scale }
    } else {
        const engine = scene.add.graphics()
        const ex = ENGINE.x
        const base = RAIL.y - WAGON.wheelR
        engine.fillStyle(C.cream, 1)
        engine.fillRoundedRect(ex - 76, base - 130, 64, 120, 10)
        engine.lineStyle(5, C.ink, 1)
        engine.strokeRoundedRect(ex - 76, base - 130, 64, 120, 10)
        engine.fillStyle(C.lilac, 1)
        engine.fillRoundedRect(ex - 16, base - 90, 92, 80, 24)
        engine.strokeRoundedRect(ex - 16, base - 90, 92, 80, 24)
        engine.fillStyle(C.lilacDark, 1)
        engine.fillRect(ex + 30, base - 124, 22, 34)
        engine.strokeRect(ex + 30, base - 124, 22, 34)
        engine.fillStyle(C.ink, 1)
        engine.fillCircle(ex + 38, base - 56, 5)
        engine.fillCircle(ex + 60, base - 56, 5)
        for (const dx of [-50, 6, 50]) {
            engine.fillStyle(C.steelDark, 1)
            engine.fillCircle(ex + dx, base, WAGON.wheelR)
            engine.lineStyle(4, C.ink, 1)
            engine.strokeCircle(ex + dx, base, WAGON.wheelR)
        }
        front.add(engine)
        chimney = { x: ex + 41, y: base - 130 }
    }

    const puff = () => {
        const x = layers[0].x + chimney.x
        const y = chimney.y
        const cloud = scene.add.graphics({ x, y }).setDepth(DEPTH.trainFront + 1)
        cloud.fillStyle(C.smoke, 0.95)
        cloud.fillCircle(0, 0, 14)
        cloud.fillCircle(12, -6, 11)
        cloud.fillCircle(-10, -8, 10)
        cloud.lineStyle(3, C.ink, 0.5)
        cloud.strokeCircle(0, 0, 14)
        cloud.setScale(0.4)
        void FX.to(scene, cloud, { y: y - 70, x: x - 30, scale: 1.4, alpha: 0 }, { duration: 900 }).then(() => cloud.destroy())
    }

    const moveTo = (x: number, duration: number, ease: string) =>
        Promise.all(layers.map(layer => FX.to(scene, layer, { x }, { duration, ease }))).then(() => undefined)

    return {
        async enter() {
            layers.forEach(layer => layer.setX(TRAIN.enterFrom))
            const smoke = scene.time.addEvent({ delay: 260, loop: true, callback: puff })
            await moveTo(0, TRAIN.enterMs, 'Cubic.easeOut')
            smoke.remove()
        },
        async leave() {
            const smoke = scene.time.addEvent({ delay: 200, loop: true, callback: puff })
            await FX.wait(scene, 200)
            await moveTo(TRAIN.leaveTo, TRAIN.leaveMs, 'Cubic.easeIn')
            smoke.remove()
        },
        reset() {
            cargo.removeAll(true)
            count.left = 0
            count.right = 0
            layers.forEach(layer => layer.setX(0))
        },
        async load(side, item) {
            const slot = SLOTS[count[side] % SLOTS.length]
            count[side] += 1
            const to = { x: WAGON.xs[side] + slot, y: WAGON.rest }
            await FX.to(scene, item, { x: to.x, y: to.y }, { duration: 260, ease: 'Quad.easeIn' })
            item.setDepth(DEPTH.cargo)
            cargo.add(item)
            item.setPosition(to.x - cargo.x, to.y)
            void FX.impact(scene, bodies[side], 0.05)
        },
        async reject(side) {
            await FX.shake(scene, bodies[side], { amount: 8, times: 3 })
        },
        whistle: puff,
        mouth(side) {
            return { x: WAGON.xs[side], y: WAGON.mouthY }
        },
        rect(side) {
            return { x: WAGON.xs[side], y: (WAGON.top + RAIL.y) / 2, w: WAGON.w + 20, h: RAIL.y - WAGON.top + 30 }
        },
        async pulseSign(side) {
            void FX.ping(scene, signs[side].x, signs[side].y, C.glow, { radius: 120, depth: DEPTH.balloon })
            await FX.impact(scene, signs[side], 0.16)
        },
        cargo,
        destroy() {
            layers.forEach(layer => {
                scene.tweens.killTweensOf(layer)
                layer.destroy()
            })
        },
    }
}
