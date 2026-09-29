import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { BG } from '../data/files'
import { CLOUD, DEPTH, FRAME, GROUND_Y, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Art } from '../types'

export interface ArtView {
    readonly container: Phaser.GameObjects.Container
    set(art: Art): void
    destroy(): void
}

export function createArtView(scene: Phaser.Scene, x: number, y: number, size: number): ArtView {
    const container = scene.add.container(x, y)
    const draw = (art: Art) => {
        container.removeAll(true)
        if (scene.textures.exists(art.key)) {
            const image = scene.add.image(0, 0, art.key, art.frame)
            image.setScale(size / Math.max(image.frame.width, image.frame.height))
            container.add(image)
            return
        }
        const box = scene.add.graphics()
        box.fillStyle(C.paperLight, 1)
        box.fillRoundedRect(-size / 2, -size / 2, size, size, 14)
        box.lineStyle(3, C.inkSoft, 1)
        box.strokeRoundedRect(-size / 2, -size / 2, size, size, 14)
        const label = scene.add
            .text(0, 0, art.id, {
                fontFamily: FONT.body,
                fontSize: `${SIZE.placeholder}px`,
                color: CSS.inkSoft,
                align: 'center',
                wordWrap: { width: size - 12, useAdvancedWrap: true },
            })
            .setOrigin(0.5)
            .setResolution(2)
        container.add([box, label])
    }
    return {
        container,
        set: draw,
        destroy() {
            container.destroy()
        },
    }
}

export interface Board {
    show(start: Art, goal: Art): Promise<void>
    revealGoal(): Promise<void>
    setFrame(art: Art): Promise<void>
    fail(art: Art): Promise<void>
    reset(start: Art): Promise<void>
    celebrate(): Promise<void>
    readonly frameRect: GuideRect
    readonly cloudRect: GuideRect
    readonly cloud: Phaser.GameObjects.Container
    destroy(): void
}

function paintFallback(g: Phaser.GameObjects.Graphics) {
    g.fillStyle(C.paper, 1)
    g.fillRect(0, 0, W, H)
    g.fillStyle(C.paperLight, 1)
    g.lineStyle(4, C.ink, 1)
    g.fillEllipse(CLOUD.cx, CLOUD.cy, CLOUD.w, CLOUD.h)
    g.strokeEllipse(CLOUD.cx, CLOUD.cy, CLOUD.w, CLOUD.h)
    g.fillRoundedRect(FRAME.x, FRAME.y, FRAME.w, FRAME.h, 22)
    g.strokeRoundedRect(FRAME.x, FRAME.y, FRAME.w, FRAME.h, 22)
    g.lineStyle(3, C.ink, 1)
    g.lineBetween(8, GROUND_Y, W - 8, GROUND_Y)
}

export function createBoard(scene: Phaser.Scene): Board {
    const bg = scene.textures.exists(BG)
        ? scene.add.image(W / 2, H / 2, BG).setDisplaySize(W, H).setDepth(DEPTH.bg)
        : (() => {
              const g = scene.add.graphics().setDepth(DEPTH.bg)
              paintFallback(g)
              return g
          })()

    const frame = scene.add.container(FRAME.cx, FRAME.cy).setDepth(DEPTH.board)
    const frameArt = createArtView(scene, 0, 0, FRAME.art)
    frame.add(frameArt.container)

    const cloud = scene.add.container(CLOUD.artX, CLOUD.artY).setDepth(DEPTH.board).setAlpha(0)
    const goalArt = createArtView(scene, 0, 0, CLOUD.art)
    cloud.add(goalArt.container)

    const puffs = new Set<Phaser.GameObjects.Graphics>()
    const puff = () => {
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2
            const g = scene.add.graphics({ x: FRAME.cx, y: FRAME.cy }).setDepth(DEPTH.board + 1)
            g.fillStyle(C.paperLight, 1)
            g.fillCircle(0, 0, 16)
            g.lineStyle(3, C.ink, 1)
            g.strokeCircle(0, 0, 16)
            puffs.add(g)
            scene.tweens.add({
                targets: g,
                x: FRAME.cx + Math.cos(a) * 130,
                y: FRAME.cy + Math.sin(a) * 120,
                scale: 0.3,
                alpha: 0,
                duration: 360,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    puffs.delete(g)
                    g.destroy()
                },
            })
        }
    }

    const swap = async (art: Art, withPuff = true) => {
        FX.kill(scene, frame)
        frame.setScale(1).setPosition(FRAME.cx, FRAME.cy).setAngle(0)
        await FX.to(scene, frame, { scale: 0.86, alpha: 0.4 }, { duration: 110 })
        frameArt.set(art)
        if (withPuff) puff()
        await FX.to(scene, frame, { scale: 1, alpha: 1 }, { duration: 260, ease: Ease.back(2) })
    }

    return {
        async show(start, goal) {
            FX.kill(scene, [frame, cloud])
            frameArt.set(start)
            goalArt.set(goal)
            frame.setScale(1).setAngle(0)
            cloud.setScale(1).setAlpha(0)
            await FX.popIn(scene, frame)
        },
        async revealGoal() {
            FX.kill(scene, cloud)
            cloud.setScale(1)
            await FX.popIn(scene, cloud, { from: 0.5 })
            await FX.to(scene, cloud, { scale: 1.08 }, { duration: 180, yoyo: true, ease: 'Sine.easeInOut' })
        },
        setFrame(art) {
            return swap(art)
        },
        async fail(art) {
            await swap(art, false)
            await FX.to(scene, frame, { angle: -4 }, { duration: 80 })
            for (let i = 0; i < 4; i++) {
                await FX.to(scene, frame, { angle: 4, x: FRAME.cx + 6 }, { duration: 90 })
                await FX.to(scene, frame, { angle: -4, x: FRAME.cx - 6 }, { duration: 90 })
            }
            await FX.to(scene, frame, { angle: 0, x: FRAME.cx }, { duration: 120 })
        },
        reset(start) {
            return swap(start, false)
        },
        async celebrate() {
            void FX.stars(scene, CLOUD.artX, CLOUD.artY, { color: C.gold, count: 12, depth: DEPTH.replay })
            void FX.sparks(scene, FRAME.cx, FRAME.cy, { color: C.gold, count: 14, spread: 150, depth: DEPTH.replay })
            await FX.all(FX.impact(scene, cloud, 0.12), FX.impact(scene, frame, 0.1))
            await FX.to(scene, [cloud, frame], { scale: 1.08 }, { duration: 220, yoyo: true, ease: 'Sine.easeInOut' })
        },
        frameRect: { x: FRAME.cx, y: FRAME.cy, w: FRAME.w, h: FRAME.h },
        cloudRect: { x: CLOUD.cx, y: CLOUD.cy, w: CLOUD.w - 40, h: CLOUD.h - 20 },
        cloud,
        destroy() {
            puffs.forEach(g => g.destroy())
            puffs.clear()
            frameArt.destroy()
            goalArt.destroy()
            frame.destroy()
            cloud.destroy()
            bg.destroy()
        },
    }
}
