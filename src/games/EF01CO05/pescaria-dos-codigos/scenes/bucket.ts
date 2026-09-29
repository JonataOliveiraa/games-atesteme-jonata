import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUCKET_ART, PIECE_CELL, PIECES } from '../data/files'
import { BUCKET, DEPTH, SIGN, TOKENS, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Mark } from '../types'
import { createMarkView, type MarkView } from './marks'
import type { FishView } from './school'

export interface Bucket {
    catchFish(fish: FishView): Promise<void>
    finale(pairs: [Mark, Mark][]): Promise<void>
    destroy(): void
}

const MOUTH_Y = BUCKET.y - BUCKET.h + 18

function paintBucket(back: Phaser.GameObjects.Graphics, front: Phaser.GameObjects.Graphics) {
    const { w, h } = BUCKET
    back.fillStyle(C.waterMid, 1)
    back.fillEllipse(0, -h + 16, w - 12, 26)
    back.lineStyle(4, C.ink, 1)
    back.strokeEllipse(0, -h + 16, w - 12, 26)

    front.lineStyle(5, C.ink, 1)
    front.fillStyle(C.wood, 1)
    front.beginPath()
    front.moveTo(-w / 2, -h + 18)
    front.lineTo(w / 2, -h + 18)
    front.lineTo(w / 2 - 14, 0)
    front.lineTo(-w / 2 + 14, 0)
    front.closePath()
    front.fillPath()
    front.strokePath()
    front.fillStyle(C.mint, 1)
    front.fillRect(-w / 2 + 3, -h + 34, w - 6, 12)
    front.fillRect(-w / 2 + 11, -26, w - 22, 12)
    front.lineStyle(3, C.ink, 1)
    front.strokeRect(-w / 2 + 3, -h + 34, w - 6, 12)
    front.strokeRect(-w / 2 + 11, -26, w - 22, 12)
}

function paintToken(g: Phaser.GameObjects.Graphics) {
    const { w, h } = TOKENS
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, 20)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
    g.lineStyle(10, C.ink, 1)
    g.lineBetween(30, -8, 48, -8)
    g.lineBetween(30, 8, 48, 8)
    g.lineStyle(5, C.mint, 1)
    g.lineBetween(30, -8, 48, -8)
    g.lineBetween(30, 8, 48, 8)
}

export function createBucket(scene: Phaser.Scene): Bucket {
    const back = scene.add.graphics({ x: BUCKET.x, y: BUCKET.y }).setDepth(DEPTH.bucket - 2)
    const front = scene.add.graphics({ x: BUCKET.x, y: BUCKET.y }).setDepth(DEPTH.bucket)
    let image: Phaser.GameObjects.Image | undefined
    if (scene.textures.exists(PIECES)) {
        image = scene.add
            .image(BUCKET.x, BUCKET.y, PIECES, PIECE_CELL.bucket)
            .setOrigin(0.5, BUCKET_ART.baseY / 320)
            .setScale(BUCKET.w / BUCKET_ART.w)
            .setDepth(DEPTH.bucket)
    } else {
        paintBucket(back, front)
    }

    const leftovers: Phaser.GameObjects.GameObject[] = []
    const splash = () => {
        const hasDrop = scene.textures.exists(PIECES)
        for (let i = 0; i < 9; i++) {
            const angle = Phaser.Math.DegToRad(-160 + i * 17.5)
            const drop = hasDrop
                ? scene.add.image(BUCKET.x, MOUTH_Y, PIECES, PIECE_CELL.drop).setScale(0.09)
                : scene.add.circle(BUCKET.x, MOUTH_Y, 7, C.waterLine).setStrokeStyle(2, C.ink, 0.6)
            drop.setDepth(DEPTH.bucket + 1)
            const reach = Phaser.Math.Between(50, 90)
            scene.tweens.add({
                targets: drop,
                x: BUCKET.x + Math.cos(angle) * reach,
                y: MOUTH_Y + Math.sin(angle) * reach,
                alpha: 0,
                duration: 520,
                ease: 'Sine.easeOut',
                onComplete: () => drop.destroy(),
            })
        }
        void FX.to(scene, image ?? front, { scaleY: (image?.scaleY ?? 1) * 0.9 }, { duration: 90, yoyo: true })
    }

    return {
        async catchFish(fish) {
            fish.container.setDepth(DEPTH.bucket - 1)
            await FX.arcTo(scene, fish.container, { x: BUCKET.x, y: MOUTH_Y - 20 }, { height: 160, duration: 620 })
            splash()
            await FX.to(scene, fish.container, { y: MOUTH_Y + 40, scale: 0.6, alpha: 0 }, { duration: 260, ease: 'Sine.easeIn' })
            fish.destroy()
        },
        async finale(pairs) {
            const views: MarkView[] = []
            const tokens = pairs.map(([clue, answer], i) => {
                const g = scene.add.graphics()
                paintToken(g)
                const left = createMarkView(scene, clue, TOKENS.drum, 3)
                left.container.setPosition(-TOKENS.w / 2 + 16 + left.width / 2, 0)
                const right = createMarkView(scene, answer, TOKENS.mark)
                right.container.setPosition(TOKENS.w / 2 - 12 - TOKENS.mark / 2, 0)
                views.push(left, right)
                const token = scene.add
                    .container(BUCKET.x, MOUTH_Y, [g, left.container, right.container])
                    .setDepth(DEPTH.tokens)
                    .setScale(0.3)
                    .setAlpha(0)
                leftovers.push(token)
                const x = W / 2 + (i - (pairs.length - 1) / 2) * TOKENS.gap
                return { token, x }
            })
            await Promise.all(
                tokens.map(({ token, x }, i) =>
                    FX.wait(scene, i * 180).then(async () => {
                        token.setAlpha(1)
                        splash()
                        await Promise.all([
                            FX.arcTo(scene, token, { x, y: TOKENS.y }, { height: 140, duration: 640 }),
                            FX.to(scene, token, { scale: 1 }, { duration: 640 }),
                        ])
                    }),
                ),
            )

            const sign = scene.add
                .text(SIGN.x, SIGN.y, 'MESMA COISA,\nDOIS CÓDIGOS!', {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.sign}px`,
                    color: CSS.white,
                    align: 'center',
                    stroke: CSS.ink,
                    strokeThickness: 10,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.sign)
            leftovers.push(sign)
            await FX.popIn(scene, sign, { from: 0.3, duration: 480 })
            void FX.to(scene, sign, { scale: 1.05 }, { duration: 500, yoyo: true, repeat: 1 })
        },
        destroy() {
            leftovers.forEach(obj => obj.destroy())
            image?.destroy()
            back.destroy()
            front.destroy()
        },
    }
}
