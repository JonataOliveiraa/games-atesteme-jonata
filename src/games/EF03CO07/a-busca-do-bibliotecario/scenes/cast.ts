import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAST, DEPTH, REACTION, REQUEST, VISITOR_ART } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export const KEEPER = { idle: 0, show: 1, think: 2, cheer: 3 }

const CELL_RATIO = 300 / 400

function drawStandIn(g: Phaser.GameObjects.Graphics, tint: number, h: number) {
    g.fillStyle(C.inkSoft, 1)
    g.fillEllipse(0, -6, h * 0.5, h * 0.12)
    g.fillStyle(tint, 1)
    g.fillRoundedRect(-h * 0.2, -h * 0.62, h * 0.4, h * 0.6, 22)
    g.fillStyle(0xe8c9a0, 1)
    g.fillCircle(0, -h * 0.74, h * 0.17)
}

function buildStandIn(scene: Phaser.Scene, at: { x: number; y: number }, tint: number) {
    const root = scene.add.container(at.x, at.y).setDepth(DEPTH.cast)
    const g = scene.add.graphics()
    drawStandIn(g, tint, CAST.height)
    root.add(g)
    return root
}

export function createCast(scene: Phaser.Scene) {
    const keeperRoot = scene.textures.exists('personagens')
        ? scene.add.container(CAST.keeper.x, CAST.keeper.y).setDepth(DEPTH.cast)
        : buildStandIn(scene, CAST.keeper, C.wood)
    const keeperSprite = scene.textures.exists('personagens')
        ? scene.add
              .image(0, 0, 'personagens', KEEPER.idle)
              .setOrigin(0.5, 0.96)
              .setDisplaySize(CAST.height * CELL_RATIO, CAST.height)
              .setFlipX(true)
        : null
    if (keeperSprite) keeperRoot.add(keeperSprite)

    const hasVisitors = scene.textures.exists(VISITOR_ART.key)
    const visitorRoot = hasVisitors
        ? scene.add.container(CAST.visitor.x, CAST.visitor.y).setDepth(DEPTH.cast)
        : buildStandIn(scene, CAST.visitor, C.magic)
    const visitorSprite = hasVisitors
        ? scene.add.image(0, 0, VISITOR_ART.key, 0).setScale(VISITOR_ART.scale)
        : null
    if (visitorSprite) visitorRoot.add(visitorSprite)

    let visitorCol = 0

    const pose = (reaction: number) => {
        if (!visitorSprite) return
        const { cols, feet, footX } = VISITOR_ART
        const index = reaction * cols + visitorCol
        const frame = scene.textures.getFrame(VISITOR_ART.key, index)
        const cellLeft = Math.round((visitorCol * frame.source.width) / cols)
        visitorSprite.setFrame(index)
        visitorSprite.setOrigin((cellLeft + footX[index] - frame.cutX) / frame.width, feet[index] / frame.height)
    }

    const visitor = { root: visitorRoot }
    const keeper = { root: keeperRoot, sprite: keeperSprite }

    const balloon = scene.add.container(REQUEST.x, REQUEST.y).setDepth(DEPTH.query).setAlpha(0)
    const balloonG = scene.add.graphics()
    const request = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: REQUEST.w - 90 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    balloon.add([balloonG, request])

    const paintBalloon = () => {
        const w = REQUEST.w
        const h = Math.max(REQUEST.h, request.height + 30)
        const tipX = CAST.visitor.x - REQUEST.x + 40
        const tipY = CAST.visitor.y - CAST.height * 0.86 - REQUEST.y
        balloonG.clear()
        balloonG.fillStyle(C.ink, 0.22)
        balloonG.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 24)
        balloonG.fillStyle(C.woodDark, 1)
        balloonG.fillTriangle(-w / 2 + 20, h / 2 - 20, tipX, tipY, -w / 2 + 76, h / 2 - 6)
        balloonG.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
        balloonG.fillStyle(C.parchment, 1)
        balloonG.fillTriangle(-w / 2 + 28, h / 2 - 24, tipX + 8, tipY - 10, -w / 2 + 68, h / 2 - 12)
        balloonG.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 18)
    }

    return {
        visitorPos() {
            return { x: CAST.visitor.x, y: CAST.visitor.y - CAST.height * 0.55 }
        },

        async arrive(col: number, text: string) {
            visitorCol = col
            pose(REACTION.wait)
            visitor.root.setPosition(CAST.visitor.x - 220, CAST.visitor.y).setAlpha(0)
            request.setText(text)
            paintBalloon()

            await FX.all(
                FX.to(scene, visitor.root, { x: CAST.visitor.x, alpha: 1 }, { duration: 420, ease: 'Back.easeOut' }),
                FX.wait(scene, 180).then(() => {
                    balloon.setAlpha(0).setScale(0.9)
                    return FX.to(scene, balloon, { alpha: 1, scale: 1 }, { duration: 300, ease: 'Back.easeOut' })
                }),
            )
        },

        doubt() {
            pose(REACTION.doubt)
        },

        refuse() {
            pose(REACTION.doubt)
            return FX.shake(scene, visitor.root, { times: 3, amount: 9 })
        },

        happy() {
            pose(REACTION.happy)
            return FX.to(scene, visitor.root, { y: CAST.visitor.y - 16 }, { duration: 160, yoyo: true })
        },

        async leave() {
            void FX.to(scene, balloon, { alpha: 0 }, { duration: 220 })
            await FX.to(
                scene,
                visitor.root,
                { x: CAST.visitor.x - 240, alpha: 0 },
                { duration: 420, ease: 'Sine.easeIn' },
            )
        },

        keeper(pose: number) {
            keeper.sprite?.setFrame(pose)
        },

        cheer() {
            keeper.sprite?.setFrame(KEEPER.cheer)
            return FX.to(scene, keeper.root, { y: CAST.keeper.y - 22 }, { duration: 180, yoyo: true })
        },

        destroy() {
            scene.tweens.killTweensOf(visitor.root)
            scene.tweens.killTweensOf(keeper.root)
            scene.tweens.killTweensOf(balloon)
            visitor.root.destroy(true)
            keeper.root.destroy(true)
            balloon.destroy(true)
        },
    }
}

export type Cast = ReturnType<typeof createCast>
