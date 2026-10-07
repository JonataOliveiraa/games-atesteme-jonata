import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE } from '../data/files'
import { BALL, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { ContentId } from '../types'
import { contentView, emptyView, pieceImage } from './art'

export interface Ball {
    spawn(x: number, y: number, vx?: number, vy?: number): void
    carry(content: ContentId | null): void
    transform(content: ContentId): Promise<void>
    kick(vx: number, vy: number): void
    sync(): void
    freeze(on: boolean): void
    remove(): void
    readonly body: MatterJS.BodyType | undefined
    readonly x: number
    readonly y: number
    readonly speed: number
    destroy(): void
}

export function createBall(scene: Phaser.Scene): Ball {
    const metal = pieceImage(scene, PIECE.ball, BALL.r * 2.2)
    const badgeBg = scene.add.graphics()
    badgeBg.fillStyle(C.white, 1)
    badgeBg.fillCircle(0, 0, BALL.badge / 2 + 4)
    badgeBg.lineStyle(3, C.ink, 1)
    badgeBg.strokeCircle(0, 0, BALL.badge / 2 + 4)
    const badge = scene.add.container(BALL.badge * 0.7, -BALL.badge * 0.7, [badgeBg])
    const look = scene.add.container(0, 0, [metal, badge]).setDepth(DEPTH.ball).setVisible(false)
    let icon: Phaser.GameObjects.Container | undefined
    let body: MatterJS.BodyType | undefined

    const setIcon = (content: ContentId | null) => {
        icon?.destroy()
        icon = content ? contentView(scene, content, BALL.badge * 0.86) : emptyView(scene, BALL.badge)
        badge.add(icon)
    }

    const remove = () => {
        if (body) scene.matter.world?.remove(body)
        body = undefined
        look.setVisible(false)
    }

    return {
        spawn(x, y, vx = 0, vy = 0) {
            remove()
            body = scene.matter.add.circle(x, y, BALL.r, {
                restitution: 0.45,
                friction: 0.001,
                frictionAir: 0.004,
                label: 'ball',
            })
            if (vx || vy) scene.matter.body.setVelocity(body, { x: vx, y: vy })
            look.setPosition(x, y).setVisible(true).setScale(0.3)
            void FX.to(scene, look, { scale: 1 }, { duration: 200, ease: 'Back.easeOut' })
        },
        carry(content) {
            setIcon(content)
        },
        async transform(content) {
            void FX.ping(scene, look.x + badge.x, look.y + badge.y, C.glow, { radius: 56, duration: 520, depth: DEPTH.fx })
            await FX.to(scene, badge, { scale: 0 }, { duration: 140 })
            setIcon(content)
            await FX.to(scene, badge, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },
        kick(vx, vy) {
            if (body) scene.matter.body.setVelocity(body, { x: vx, y: vy })
        },
        sync() {
            if (!body) return
            const v = body.velocity
            const s = Math.hypot(v.x, v.y)
            if (s > BALL.speedMax) scene.matter.body.setVelocity(body, { x: (v.x / s) * BALL.speedMax, y: (v.y / s) * BALL.speedMax })
            look.setPosition(body.position.x, body.position.y)
            metal.setAngle(metal.angle + v.x * 2)
        },
        freeze(on) {
            if (body) scene.matter.body.setStatic(body, on)
        },
        remove,
        get body() {
            return body
        },
        get x() {
            return body?.position.x ?? look.x
        },
        get y() {
            return body?.position.y ?? look.y
        },
        get speed() {
            return body ? Math.hypot(body.velocity.x, body.velocity.y) : 0
        },
        destroy() {
            remove()
            look.destroy()
        },
    }
}
