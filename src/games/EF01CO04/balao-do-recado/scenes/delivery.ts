import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALLOON as BALLOON_TEX, EXTRA_CELL, EXTRAS, PIECES } from '../data/files'
import { DELIVERY, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Form, Message, Point } from '../types'
import type { Balloon } from './balloon'
import { createPic } from './pic'
import type { RecipientWindow } from './window'

export interface Delivery {
    play(form: Form, message: Message): Promise<void>
    think(message: Message | null): Promise<void>
    destroy(): void
}

const TOP = DEPTH.window + 4

function arcs(g: Phaser.GameObjects.Graphics, color: number, radii: number[], spread: number) {
    g.clear()
    for (const r of radii) {
        g.lineStyle(9, C.white, 0.9)
        g.beginPath()
        g.arc(0, 0, r, -spread, spread)
        g.strokePath()
        g.lineStyle(5, color, 1)
        g.beginPath()
        g.arc(0, 0, r, -spread, spread)
        g.strokePath()
    }
}

export function createDelivery(scene: Phaser.Scene, deps: { balloon: Balloon; window: RecipientWindow }): Delivery {
    const temp = new Set<Phaser.GameObjects.GameObject>()
    let thought: Phaser.GameObjects.Container | undefined
    let dead = false

    const keep = <T extends Phaser.GameObjects.GameObject>(o: T) => {
        temp.add(o)
        return o
    }
    const drop = (o: Phaser.GameObjects.GameObject) => {
        temp.delete(o)
        o.destroy()
    }

    const travel = async (from: Point, to: Point, ms: number, color: number, radii: number[], spread: number, rider?: Message) => {
        const g = scene.add.graphics()
        arcs(g, color, radii, spread)
        const parts: Phaser.GameObjects.GameObject[] = [g]
        if (rider) {
            const pic = createPic(scene, -18, 0, 52)
            pic.set(PIECES, rider.icon, rider.id)
            parts.unshift(pic.container)
        }
        const head = keep(scene.add.container(from.x, from.y, parts).setDepth(TOP + 1))
        head.setRotation(Math.atan2(to.y - from.y, to.x - from.x))
        const trail = scene.time.addEvent({
            delay: 160,
            loop: true,
            callback: () => {
                if (dead || !head.active) return
                const echo = keep(scene.add.graphics({ x: head.x, y: head.y }).setDepth(TOP).setRotation(head.rotation))
                arcs(echo, color, [radii[radii.length - 1]], spread)
                scene.tweens.add({ targets: echo, alpha: 0, scale: 1.4, duration: 420, onComplete: () => drop(echo) })
            },
        })
        const bob = scene.tweens.add({ targets: g, y: { from: -6, to: 6 }, duration: 180, yoyo: true, repeat: -1 })
        await FX.to(scene, head, { x: to.x, y: to.y }, { duration: ms, ease: 'Sine.easeInOut' })
        trail.remove()
        bob.remove()
        if (head.active) await FX.to(scene, head, { alpha: 0, scale: 1.4 }, { duration: 200 })
        if (head.active) drop(head)
    }

    const voice = async (message: Message) => {
        const { balloon, window } = deps
        balloon.act('talk')
        await FX.wait(scene, 350)
        if (dead) return
        await travel(balloon.mouth, window.target, DELIVERY.wavesMs, C.coral, [14, 26, 38], 0.8, message)
        if (dead) return
        window.show('happy')
        balloon.act(null)
    }

    const letter = async () => {
        const { window } = deps
        const box = window.target
        const flag = keep(scene.add.container(box.x, box.y + DELIVERY.mailboxDy).setDepth(TOP))
        const art = createPic(scene, 0, 0, DELIVERY.mailboxSize)
        if (scene.textures.exists(EXTRAS)) {
            art.set(EXTRAS, EXTRA_CELL.mailboxUp, 'caixa')
        } else {
            const g = scene.add.graphics()
            g.fillStyle(C.coral, 1)
            g.fillRect(14, -26, 16, 12)
            g.lineStyle(3, C.ink, 1)
            g.lineBetween(14, -26, 14, 6)
            art.container.add(g)
        }
        flag.add(art.container)
        await FX.popIn(scene, flag, { from: 0.4 })
        if (dead) return

        const night = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(TOP - 1))
        const skyPic = createPic(scene, 0, 0, DELIVERY.sun, true)
        const sky = keep(scene.add.container(DELIVERY.sunX, DELIVERY.sunY, [skyPic.container]).setDepth(TOP + 1))
        const setSky = (cell: number, label: string) => {
            if (scene.textures.exists(EXTRAS)) skyPic.set(EXTRAS, cell, label)
            else {
                skyPic.container.removeAll(true)
                const g = scene.add.graphics()
                g.fillStyle(cell === EXTRA_CELL.sun ? C.sun : C.cream, 1)
                g.fillCircle(0, 0, DELIVERY.sun * 0.35)
                g.lineStyle(4, C.ink, 1)
                g.strokeCircle(0, 0, DELIVERY.sun * 0.35)
                skyPic.container.add(g)
            }
        }
        setSky(EXTRA_CELL.sun, 'sol')
        await FX.popIn(scene, sky, { from: 0.4 })
        await FX.wait(scene, DELIVERY.dayMs)
        if (dead) return
        await FX.to(scene, sky, { scale: 0, angle: 120 }, { duration: 260 })
        setSky(EXTRA_CELL.moon, 'lua')
        await FX.all(
            FX.to(scene, sky, { scale: 1, angle: 0 }, { duration: 300, ease: 'Back.easeOut' }),
            FX.to(scene, night, { fillAlpha: DELIVERY.nightAlpha }, { duration: 300 }),
        )
        await FX.wait(scene, DELIVERY.dayMs)
        if (dead) return
        await FX.to(scene, sky, { scale: 0, angle: -120 }, { duration: 260 })
        setSky(EXTRA_CELL.sun, 'sol')
        await FX.all(
            FX.to(scene, sky, { scale: 1, angle: 0 }, { duration: 300, ease: 'Back.easeOut' }),
            FX.to(scene, night, { fillAlpha: 0 }, { duration: 300 }),
        )
        await FX.wait(scene, DELIVERY.dayMs * 0.6)
        if (dead) return
        window.show('happy')
        await FX.wait(scene, 250)
        void FX.to(scene, sky, { alpha: 0, scale: 0.6 }, { duration: 260 }).then(() => drop(sky))
        void FX.to(scene, flag, { alpha: 0 }, { duration: 260 }).then(() => drop(flag))
        drop(night)
    }

    const farFace = () => (deps.window.scene === 'friend-far' ? EXTRA_CELL.friendFace : EXTRA_CELL.grandmaFace)

    const callPopup = (at: Point, dx: number, dy: number, who: 'kid' | 'far') => {
        const { w, h } = DELIVERY.call
        const frame = scene.add.graphics()
        frame.fillStyle(C.shadow, 0.2)
        frame.fillRoundedRect(-w / 2 - 8, -h / 2 - 4, w + 16, h + 16, 14)
        frame.fillStyle(C.lilac, 1)
        frame.fillRoundedRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 14)
        frame.lineStyle(4, C.ink, 1)
        frame.strokeRoundedRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 14)
        frame.fillStyle(C.cream, 1)
        frame.fillRoundedRect(-w / 2, -h / 2, w, h, 8)
        const parts: Phaser.GameObjects.GameObject[] = [frame]
        if (who === 'far') {
            const face = createPic(scene, 0, 4, h * 1.25)
            face.set(EXTRAS, farFace(), 'rosto')
            parts.push(face.container)
        } else if (scene.textures.exists(BALLOON_TEX)) {
            const crop = { x: 186, y: 262, w: 150, h: 110 }
            const s = h / crop.h
            const kid = scene.add.image(0, 0, BALLOON_TEX, 0).setScale(s)
            kid.setCrop(crop.x, crop.y, crop.w, crop.h)
            kid.setPosition((256 - (crop.x + crop.w / 2)) * s, (256 - (crop.y + crop.h / 2)) * s)
            parts.push(kid)
        }
        const x = Phaser.Math.Clamp(at.x + dx, w / 2 + 20, W - w / 2 - 20)
        const y = Phaser.Math.Clamp(at.y + dy, h / 2 + 110, H - h / 2 - 20)
        return keep(scene.add.container(x, y, parts).setDepth(TOP + 2))
    }

    const screen = async () => {
        const { balloon, window } = deps
        balloon.act('tablet', farFace())
        await FX.wait(scene, 450)
        if (dead) return
        await travel({ x: balloon.x + 40, y: balloon.y }, window.target, DELIVERY.signalMs, C.mint, [16, 30, 44], 0.7)
        if (dead) return
        window.show('happy')
        const { dx, dy, selfDx, selfDy } = DELIVERY.call
        const there = callPopup(window.target, dx, dy, 'kid')
        const here = callPopup({ x: balloon.x, y: balloon.y }, selfDx, selfDy, 'far')
        await FX.all(FX.popIn(scene, there, { from: 0.3 }), FX.popIn(scene, here, { from: 0.3, delay: 120 }))
        await FX.wait(scene, DELIVERY.callHoldMs)
        if (dead) return
        await FX.to(scene, [there, here], { alpha: 0, scale: 0.6 }, { duration: 240 })
        drop(there)
        drop(here)
        balloon.act(null)
    }

    const clearThought = () => {
        if (!thought) return
        const old = thought
        thought = undefined
        FX.kill(scene, old)
        drop(old)
    }

    return {
        async play(form, message) {
            clearThought()
            if (form === 'voice') await voice(message)
            else if (form === 'letter') await letter()
            else await screen()
        },
        async think(message) {
            clearThought()
            const { window } = deps
            const at = DELIVERY.thoughtAt[window.scene]
            const p = window.target
            const size = DELIVERY.thought
            const x = Phaser.Math.Clamp(p.x + at.dx, size / 2 + 10, W - size / 2 - 10)
            const y = Phaser.Math.Clamp(p.y + at.dy, size / 2 + 100, H - size / 2 - 10)
            const cloud = createPic(scene, 0, 0, size)
            const hasArt = scene.textures.exists(EXTRAS)
            if (hasArt) cloud.set(EXTRAS, EXTRA_CELL.thought, 'pensamento')
            else {
                const g = scene.add.graphics()
                g.fillStyle(C.white, 1)
                g.lineStyle(4, C.ink, 1)
                g.fillEllipse(size * 0.08, -size * 0.1, size * 0.78, size * 0.58)
                g.strokeEllipse(size * 0.08, -size * 0.1, size * 0.78, size * 0.58)
                g.fillCircle(-size * 0.26, size * 0.26, 12)
                g.strokeCircle(-size * 0.26, size * 0.26, 12)
                g.fillCircle(-size * 0.38, size * 0.4, 7)
                g.strokeCircle(-size * 0.38, size * 0.4, 7)
                cloud.container.add(g)
            }
            const unit = size / DELIVERY.thoughtCell
            const center = hasArt
                ? { x: (DELIVERY.thoughtSlot.x - DELIVERY.thoughtCell / 2) * unit, y: (DELIVERY.thoughtSlot.y - DELIVERY.thoughtCell / 2) * unit }
                : { x: size * 0.08, y: -size * 0.1 }
            const inner: Phaser.GameObjects.GameObject = message
                ? (() => {
                      const pic = createPic(scene, center.x, center.y, DELIVERY.thoughtArt)
                      pic.set(PIECES, message.icon, message.id)
                      return pic.container
                  })()
                : scene.add
                      .text(center.x, center.y, '?', { fontFamily: FONT.black, fontSize: '54px', color: CSS.ink })
                      .setOrigin(0.5)
                      .setResolution(2)
            const bubble = keep(scene.add.container(x, y, [cloud.container, inner]).setDepth(TOP + 2))
            thought = bubble
            await FX.popIn(scene, bubble, { from: 0.3 })
            if (!message) void FX.wiggle(scene, bubble, { deg: 4, duration: 700 })
            await FX.wait(scene, DELIVERY.thoughtHoldMs)
            if (!message || dead) return
            scene.time.delayedCall(FX.ms(scene, DELIVERY.thoughtFadeMs - DELIVERY.thoughtHoldMs), () => {
                if (thought !== bubble || !bubble.active) return
                void FX.to(scene, bubble, { alpha: 0, scale: 0.7 }, { duration: 260 }).then(() => {
                    if (thought === bubble) clearThought()
                })
            })
        },
        destroy() {
            dead = true
            thought = undefined
            temp.forEach(o => o.destroy())
            temp.clear()
        },
    }
}
