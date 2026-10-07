import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { CLIENT_ART, CLIENT_CELL, CLIENTS, clientFrame, type Pose } from '../data/files'
import { CLIENT, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export interface Client {
    load(who: number): Promise<void>
    pose(p: Pose): void
    say(text: string, tone?: 'ok' | 'oops'): Promise<void>
    hush(): void
    destroy(): void
}

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
        async load(next) {
            who = next
            hush()
            sprite.setFrame(clientFrame(who, 'ask')).setAlpha(0).setY(CLIENT.foot + 30)
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
            g.fillTriangle(-w / 2 + 24, h / 2 - 16, -w / 2 + 56, h / 2 - 4, -w / 2 - 10, h / 2 + 26)
            g.lineStyle(4, tone === 'oops' ? C.red : C.ink, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            bubble = scene.add.container(CLIENT.x + 90 + w / 2, CLIENT.foot - 130, [g, label]).setDepth(DEPTH.clientBalloon).setScale(0.7).setAlpha(0)
            await FX.to(scene, bubble, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(1.8) })
        },
        hush,
        destroy() {
            hush()
            sprite.destroy()
        },
    }
}
