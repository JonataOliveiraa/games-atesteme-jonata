import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { CLIENT_ART, CLIENT_CELL, CLIENTS, clientFrame, type Pose } from '../data/files'
import { CLIENT, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Client {
    readonly sprite: Phaser.GameObjects.Sprite
    load(who: number): Promise<void>
    pose(p: Pose): void
    say(text: string, tone?: 'ok' | 'oops'): Promise<void>
    walkTo(x: number): Promise<void>
    hop(): Promise<void>
    hush(): void
    destroy(): void
}

const HEAD = CLIENT_ART.height * CLIENT.scale

export function createClient(scene: Phaser.Scene): Client {
    let who = 0
    const sprite = scene.add
        .sprite(CLIENT.x, CLIENT.foot, CLIENTS, 0)
        .setOrigin(0.5, CLIENT_ART.foot / CLIENT_CELL)
        .setScale(CLIENT.scale)
        .setDepth(DEPTH.client)
    let bubble: Phaser.GameObjects.Container | undefined

    const hush = () => {
        bubble?.destroy()
        bubble = undefined
    }

    return {
        sprite,
        async load(next) {
            who = next
            hush()
            scene.tweens.killTweensOf(sprite)
            sprite.setFrame(clientFrame(who, 'ask')).setAlpha(0).setPosition(CLIENT.x, CLIENT.foot + 30).setFlipX(false).setAngle(0)
            await FX.to(scene, sprite, { alpha: 1, y: CLIENT.foot }, { duration: 360, ease: Ease.back(1.6) })
        },
        pose(p) {
            sprite.setFrame(clientFrame(who, p))
        },
        async say(text, tone = 'ok') {
            hush()
            const label = scene.add
                .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color: tone === 'oops' ? CSS.red : CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const w = Math.max(240, label.width + 48)
            const h = 62
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.2)
            g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillTriangle(-14, h / 2 - 4, 14, h / 2 - 4, 0, h / 2 + 22)
            g.lineStyle(4, tone === 'oops' ? C.red : C.ink, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            bubble = scene.add
                .container(sprite.x, sprite.y - HEAD - h / 2 - 22, [g, label])
                .setDepth(DEPTH.clientBalloon)
                .setScale(0.7)
                .setAlpha(0)
            await FX.to(scene, bubble, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(1.8) })
        },
        async walkTo(x) {
            const steps = Math.max(1, Math.round(Math.abs(x - sprite.x) / 60))
            sprite.setFlipX(x < sprite.x)
            const hops = { k: 0 }
            const from = sprite.x
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: hops,
                    k: 1,
                    duration: steps * 170,
                    ease: 'Linear',
                    onUpdate: () => {
                        sprite.x = Phaser.Math.Linear(from, x, hops.k)
                        sprite.y = CLIENT.foot - Math.abs(Math.sin(hops.k * steps * Math.PI)) * 10
                    },
                    onComplete: () => {
                        sprite.setPosition(x, CLIENT.foot)
                        resolve()
                    },
                }),
            )
        },
        async hop() {
            await FX.to(scene, sprite, { y: CLIENT.foot - 26 }, { duration: 180, ease: 'Quad.easeOut', yoyo: true })
            sprite.y = CLIENT.foot
        },
        hush,
        destroy() {
            hush()
            sprite.destroy()
        },
    }
}
