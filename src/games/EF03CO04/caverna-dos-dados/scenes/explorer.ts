import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAVE, DEPTH, EXPLORER } from '../data/layout'
import { C } from '../data/theme'
import type { Pose } from '../types'

const FRAME: Record<Pose, number> = {
    idle: 0,
    walkA: 1,
    walkB: 2,
    reach: 3,
    curious: 4,
    surprise: 5,
    cheer: 6,
    enter: 7,
    mineUp: 8,
    mineDown: 9,
}

/** Reserva: sem `explorador.png`, um boneco de círculos e cápsulas. */
function drawStandIn(g: Phaser.GameObjects.Graphics) {
    const h = EXPLORER.frameH * EXPLORER.originY
    g.clear()
    g.fillStyle(C.leather, 1)
    g.fillCircle(-70, -h * 0.52, 46)
    g.fillStyle(C.crystal, 1)
    g.fillRoundedRect(-60, -h * 0.62, 120, 150, 34)
    g.fillStyle(C.doorLight, 1)
    g.fillRoundedRect(-56, -h * 0.28, 112, 78, 26)
    g.fillStyle(C.stoneDark, 1)
    g.fillRoundedRect(-54, -h * 0.06, 44, 60, 18)
    g.fillRoundedRect(10, -h * 0.06, 44, 60, 18)
    g.fillStyle(0xd9a26a, 1)
    g.fillCircle(0, -h * 0.76, 62)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-6, -h * 0.9, 52)
}

export interface ExplorerOptions {
    onStep: () => void
}

/** Quanto mais alto na trilha, mais longe — e menor. */
const scaleAt = (footY: number) =>
    Phaser.Math.Linear(
        EXPLORER.farScale,
        EXPLORER.nearScale,
        Phaser.Math.Clamp((footY - CAVE.footMin) / (CAVE.footMax - CAVE.footMin), 0, 1),
    )

export function createExplorer(scene: Phaser.Scene, options: ExplorerOptions) {
    const hasArt = scene.textures.exists('explorador')

    const root = scene.add.container(CAVE.startX, CAVE.startY).setDepth(DEPTH.explorer)

    const sprite = hasArt
        ? scene.add.image(0, 0, 'explorador', 0).setOrigin(0.5, EXPLORER.originY)
        : null

    const standIn = hasArt ? null : scene.add.graphics()
    if (standIn) drawStandIn(standIn)

    root.add(hasArt ? sprite! : standIn!)
    root.setScale(scaleAt(CAVE.startY))

    let stepTimer: Phaser.Time.TimerEvent | null = null

    const setPose = (pose: Pose) => sprite?.setFrame(FRAME[pose])

    const stopSteps = () => {
        stepTimer?.remove()
        stepTimer = null
    }

    return {
        get x() {
            return root.x
        },

        get y() {
            return root.y
        },

        setAt(x: number, y = CAVE.startY) {
            root.setPosition(x, y).setScale(scaleAt(y))
        },

        pose(value: Pose) {
            setPose(value)
        },

        /** Anda pela trilha: x e profundidade juntos, com o passo alternando. */
        async walkTo(x: number, y = root.y) {
            const targetX = Phaser.Math.Clamp(x, CAVE.minX, 1150)
            const targetY = Phaser.Math.Clamp(y, CAVE.footMin, CAVE.footMax)
            const distance = Phaser.Math.Distance.Between(root.x, root.y, targetX, targetY)
            if (distance < 6) {
                setPose('idle')
                return
            }

            sprite?.setFlipX(targetX < root.x)
            let toggle = false
            stopSteps()
            stepTimer = scene.time.addEvent({
                delay: EXPLORER.stepMs,
                loop: true,
                callback: () => {
                    toggle = !toggle
                    setPose(toggle ? 'walkA' : 'walkB')
                    options.onStep()
                },
            })

            await FX.to(
                scene,
                root,
                { x: targetX, y: targetY, scale: scaleAt(targetY) },
                { duration: (distance / EXPLORER.speedPxS) * 1000, ease: 'Sine.easeInOut' },
            )

            stopSteps()
            sprite?.setFlipX(false)
            setPose('idle')
        },

        /** A picareta sobe e desce. Cada golpe avisa quem está ouvindo. */
        async mine(hits: number, onHit: (index: number) => void) {
            for (let i = 0; i < hits; i++) {
                setPose('mineUp')
                await FX.wait(scene, EXPLORER.swingMs)
                setPose('mineDown')
                onHit(i)
                await FX.to(
                    scene,
                    root,
                    { x: root.x + 12 },
                    { duration: 90, yoyo: true, ease: 'Sine.easeOut' },
                )
                await FX.wait(scene, EXPLORER.swingMs - 40)
            }
            setPose('idle')
        },

        /** Sai da trilha e assume o posto ao lado do altar. */
        async toAltar() {
            stopSteps()
            setPose('idle')
            await FX.to(
                scene,
                root,
                { x: EXPLORER.altar.x, y: EXPLORER.altar.y, scale: EXPLORER.altar.scale },
                { duration: 460, ease: 'Sine.easeInOut' },
            )
        },

        /** Atravessa a porta: some na luz sem andar a tela inteira. */
        async enterDoor(to: { x: number; y: number }) {
            setPose('enter')
            await FX.to(
                scene,
                root,
                { x: to.x, y: to.y, scale: EXPLORER.altar.scale * 0.5, alpha: 0 },
                { duration: 680, ease: 'Sine.easeIn' },
            )
        },

        reset() {
            stopSteps()
            scene.tweens.killTweensOf(root)
            root
                .setPosition(CAVE.startX, CAVE.startY)
                .setScale(scaleAt(CAVE.startY))
                .setAlpha(1)
            sprite?.setFlipX(false)
            setPose('idle')
        },

        destroy() {
            stopSteps()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Explorer = ReturnType<typeof createExplorer>
