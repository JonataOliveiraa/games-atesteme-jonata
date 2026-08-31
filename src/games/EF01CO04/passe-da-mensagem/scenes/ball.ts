import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import { BALL, DEPTH, ROBOT } from '../data/layout'


const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  A BOLA-MENSAGEM E O ROBÔ
 * ══════════════════════════════════════════════════════════════════════
 *
 * A bola carrega a mensagem de AGORA, e ela muda de linguagem a cada parada —
 * é o que o jogo tem para ensinar, então ela mostra o conteúdo, não é uma bola
 * qualquer.
 *
 * O robô não anda e não persegue: ele é a consequência do erro. Comparar duas
 * linguagens é trabalho de olhar com calma, e um interceptador andando
 * transformaria isso em chute. Ele ganha mais graça sendo o dono do erro do
 * que sendo um cronômetro com pernas.
 */
export function createBall(scene: Phaser.Scene) {
    const holder = scene.add.container(0, 0).setDepth(DEPTH.ball)
    const shell = scene.add.graphics()
    holder.add(shell)
    let breathing: Phaser.Tweens.Tween | null = null

    /* Uma bola de verdade, com gomos. Ela não carrega conteúdo: quem diz o que
     * mandar é o painel do topo. */
    ;(function paintShell() {
        shell.fillStyle(C.ink, 0.24)
        shell.fillEllipse(4, BALL.r + 22, BALL.r * 1.6, 16)
        shell.fillStyle(C.ink, 1)
        shell.fillCircle(0, 0, BALL.r + 7)
        shell.fillStyle(C.white, 1)
        shell.fillCircle(0, 0, BALL.r)
        shell.fillStyle(C.warn, 1)
        shell.fillCircle(0, 0, BALL.r * 0.42)
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2
            shell.fillStyle(C.warn, 1)
            shell.fillTriangle(
                Math.cos(a) * BALL.r * 0.3, Math.sin(a) * BALL.r * 0.3,
                Math.cos(a + 0.42) * BALL.r * 0.95, Math.sin(a + 0.42) * BALL.r * 0.95,
                Math.cos(a - 0.42) * BALL.r * 0.95, Math.sin(a - 0.42) * BALL.r * 0.95,
            )
        }
        shell.lineStyle(6, C.ink, 1)
        shell.strokeCircle(0, 0, BALL.r)
    })()

    const robot = scene.add.container(0, 0).setDepth(DEPTH.robot).setVisible(false)
    let robotSprite: Phaser.GameObjects.Sprite | null = null
    if (scene.textures.exists('robo')) {
        robotSprite = scene.add.sprite(0, 0, 'robo', 0)
        robotSprite.setDisplaySize(ROBOT.size, ROBOT.size)
        robot.add(robotSprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.robot, 1)
        g.fillRoundedRect(-56, -70, 112, 140, 30)
        robot.add(g)
    }

    function stopBreath() {
        if (!breathing) return
        FX.kill(scene, fx(holder))
        holder.setScale(1)
        breathing = null
    }

    return {
        /** A bola marca ONDE o recado está. O que ele diz mora no painel. */
        show(x: number, y: number) {
            holder.setPosition(x + BALL.dx, y + BALL.dy).setVisible(true)
            stopBreath()
            breathing = FX.breathe(scene, fx(holder), { grow: 1.08, duration: 900 })
        },

        at: () => ({ x: holder.x, y: holder.y }),

        async passTo(x: number, y: number) {
            stopBreath()
            await FX.to(scene, fx(holder),
                { x: x + BALL.dx, y: y + BALL.dy, angle: 360 },
                { duration: 500, ease: 'Sine.easeInOut' })
            holder.setAngle(0)
            void FX.impact(scene, fx(holder), 0.28)
        },

        /** O robô corta no meio do caminho, ergue a bola e devolve. */
        async intercept(x: number, y: number, back: { x: number; y: number }) {
            stopBreath()
            await FX.to(scene, fx(holder), { x, y },
                { duration: 260, ease: 'Sine.easeIn' })

            robotSprite?.setFrame(0)
            robot.setPosition(x, y + 40).setVisible(true).setScale(0.4).setAlpha(0)
            await FX.to(scene, fx(robot), { scale: 1, alpha: 1 },
                { duration: 220, ease: Ease.back(2.6) })

            holder.setVisible(false)
            robotSprite?.setFrame(1)
            void FX.sparks(scene, x, y, { color: C.warn, count: 14, spread: 170 })
            await FX.wait(scene, 520)

            holder.setVisible(true)
            robotSprite?.setFrame(0)
            await FX.all(
                FX.to(scene, fx(robot), { scale: 0.4, alpha: 0 }, { duration: 240 }),
                FX.to(scene, fx(holder), { x: back.x + BALL.dx, y: back.y + BALL.dy },
                    { duration: 380, ease: 'Sine.easeOut' }),
            )
            robot.setVisible(false)
            breathing = FX.breathe(scene, fx(holder), { grow: 1.06, duration: 900 })
        },

        async deliver(x: number, y: number) {
            stopBreath()
            await FX.to(scene, fx(holder), { x, y, scale: 0.3, alpha: 0 },
                { duration: 460, ease: 'Back.easeIn' })
            holder.setVisible(false).setAlpha(1).setScale(1)
        },

        hide() {
            stopBreath()
            holder.setVisible(false)
        },

        destroy() {
            stopBreath()
            FX.kill(scene, fx(robot))
            holder.destroy()
            robot.destroy()
        },
    }
}
