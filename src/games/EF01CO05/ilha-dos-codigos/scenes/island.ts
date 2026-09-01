import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG, DEPTH, EXPLORER, H, SMALL_CHEST, TRAIL, W } from '../data/layout'
import { C } from '../data/theme'

const CHEST_SHEET = 'bau'
const EXPLORER_SHEET = 'explorador'
const WALK_ANIM = 'ilha-explorador-anda'

/** O explorador para ao LADO do baú, senão os dois desenhos se cobrem. */
const STAND_OFFSET = -74

export function createIsland(scene: Phaser.Scene, chestCount: number) {
    const sky = scene.add.rectangle(W / 2, H / 2, W, H, C.sky).setDepth(DEPTH.sky)

    const scenery: Phaser.GameObjects.GameObject[] = [sky]

    if (scene.textures.exists('bg-ilha')) {
        const bg = scene.add.image(W / 2, H / 2 + BG.dy, 'bg-ilha')
        bg.setDisplaySize(W, H).setDepth(DEPTH.scenery)
        scenery.push(bg)
    }

    const tail = scene.add.rectangle(W / 2, (BG.tail + H) / 2, W, H - BG.tail, C.sandDark)
        .setDepth(DEPTH.scenery)
    scenery.push(tail)

    const trail = scene.add.graphics().setDepth(DEPTH.trail)
    for (let x = 150; x <= 1140; x += 62) {
        const y = TRAIL.y + Math.sin(x / 130) * 5
        trail.fillStyle(C.sandDeep, 0.28)
        trail.fillEllipse(x, y + 5, 46, 17)
        trail.fillStyle(C.sand, 0.95)
        trail.fillEllipse(x, y, 42, 15)
    }

    const chests = TRAIL.chests.slice(0, chestCount).map(x => {
        const sprite = scene.add.sprite(x, TRAIL.baseY, CHEST_SHEET, 0)
            .setOrigin(0.5, 0.95)
            .setDepth(DEPTH.smallChest)
        if (scene.textures.exists(CHEST_SHEET)) {
            sprite.setDisplaySize(SMALL_CHEST.w, SMALL_CHEST.w * (250 / 300))
        } else {
            sprite.setVisible(false)
        }
        return sprite
    })

    const marks = TRAIL.chests.slice(0, chestCount).map(x => {
        const g = scene.add.graphics().setDepth(DEPTH.trail)
        g.fillStyle(C.ink, 0.16)
        g.fillEllipse(x, TRAIL.baseY + 4, SMALL_CHEST.w * 0.9, 16)
        return g
    })

    if (scene.textures.exists(EXPLORER_SHEET) && !scene.anims.exists(WALK_ANIM)) {
        scene.anims.create({
            key: WALK_ANIM,
            frames: scene.anims.generateFrameNumbers(EXPLORER_SHEET, { frames: [0, 1] }),
            frameRate: 6,
            repeat: -1,
        })
    }

    const explorer = scene.add.sprite(EXPLORER.startX, EXPLORER.baseY, EXPLORER_SHEET, 0)
        .setOrigin(0.5, 0.98)
        .setDepth(DEPTH.explorer)
    if (scene.textures.exists(EXPLORER_SHEET)) {
        explorer.setDisplaySize(EXPLORER.h * (250 / 370), EXPLORER.h)
    } else {
        explorer.setVisible(false)
    }

    const shadow = scene.add.ellipse(explorer.x, EXPLORER.baseY + 4, 62, 16, C.ink, 0.18)
        .setDepth(DEPTH.trail)

    const pieces: Phaser.GameObjects.Graphics[] = []

    const stopAt = (index: number) => TRAIL.chests[index] + STAND_OFFSET

    return {
        async walkTo(index: number) {
            const target = stopAt(index)
            const distance = Math.abs(target - explorer.x)
            if (distance < 4) return
            if (scene.anims.exists(WALK_ANIM)) explorer.play(WALK_ANIM, true)

            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: [explorer, shadow],
                    x: target,
                    duration: FX.ms(scene, Math.max(420, distance * 2.2)),
                    ease: 'Sine.easeInOut',
                    onComplete: () => resolve(),
                })
            })

            explorer.stop()
            explorer.setFrame(0)
        },

        /**
         * O que ela abriu VOA para o baú da trilha. A trilha é a barra de
         * progresso deste jogo — um indicador separado no topo diria a mesma
         * coisa duas vezes.
         */
        sendPiece(from: { x: number; y: number }, index: number) {
            const target = TRAIL.chests[index]
            if (target === undefined) return

            const piece = scene.add.graphics().setDepth(DEPTH.fx)
            piece.fillStyle(C.warnDark, 1)
            piece.fillCircle(0, 3, 17)
            piece.fillStyle(C.warn, 1)
            piece.fillCircle(0, 0, 17)
            piece.fillStyle(C.white, 0.6)
            piece.fillCircle(-5, -6, 5)
            piece.setPosition(from.x, from.y)

            pieces.push(piece)

            scene.tweens.add({
                targets: piece,
                x: target,
                y: TRAIL.baseY - 74,
                scale: { from: 1.2, to: 0.66 },
                duration: FX.ms(scene, 620),
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    const sprite = chests[index]
                    if (sprite) {
                        sprite.setFrame(2)
                        FX.popIn(scene, sprite, { from: 0.72, duration: 300 })
                    }
                    // a peça FICA: a 26 px reais, baú aberto e baú fechado são
                    // quase o mesmo desenho — o brilho parado é o que se lê
                    FX.float(scene, piece, { amount: 5, duration: 1600 })
                },
            })
        },

        /** O brilho de vitória usa a SILHUETA dele: círculo destaca um lugar. */
        async celebrate() {
            explorer.stop()
            explorer.setFrame(2)

            const glow = scene.add.sprite(explorer.x, explorer.y, EXPLORER_SHEET, 2)
                .setOrigin(0.5, 0.98)
                .setDepth(DEPTH.explorer - 1)
                .setTintFill(C.warn)
                .setAlpha(0.75)
            glow.setDisplaySize(explorer.displayWidth, explorer.displayHeight)

            scene.tweens.add({
                targets: glow,
                scaleX: glow.scaleX * 1.35,
                scaleY: glow.scaleY * 1.35,
                alpha: 0,
                duration: FX.ms(scene, 620),
                ease: 'Cubic.easeOut',
                onComplete: () => glow.destroy(),
            })

            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: explorer,
                    y: EXPLORER.baseY - 26,
                    duration: FX.ms(scene, 260),
                    ease: 'Sine.easeOut',
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => resolve(),
                })
            })
        },

        destroy() {
            scenery.forEach(o => o.destroy())
            trail.destroy()
            marks.forEach(g => g.destroy())
            pieces.forEach(p => p.destroy())
            chests.forEach(s => s.destroy())
            shadow.destroy()
            explorer.destroy()
        },
    }
}
