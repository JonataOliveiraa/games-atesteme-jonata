import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    CANNON_FRAME,
    CANNON_SHEET,
    cannonOrigin,
    cannonScale,
    MUZZLE,
    SHEET,
} from '../data/art'
import { CANNON, DEPTH } from '../data/layout'
import { C } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O CANHÃO DE TINTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Ele NÃO é um alvo nem um controle: não se clica nele, ele não aponta para a
 * resposta antes da escolha e nunca decide nada. É a confirmação animada de um
 * toque que já aconteceu — a criança escolheu, o canhão mostra.
 *
 * ── ELE OLHA PARA A MATRIZ ───────────────────────────────────────────────
 *
 * A folha entregue tem o cano voltado para a DIREITA, e o canhão mora à
 * direita da tela: sem espelhar, ele dispara para fora do pátio, de costas
 * para a fachada. `setFlipX` resolve, e todo o resto da animação acompanha —
 * o recuo vai para o lado oposto ao cano e a boca troca de lado junto.
 *
 * `FACING` é a única coisa a mudar se algum dia a arte vier já virada.
 */

type Point = { x: number; y: number }

/** -1 = cano para a esquerda (matriz), +1 = para a direita. */
const FACING = -1

export function createCannon(scene: Phaser.Scene) {
    const trail = scene.add.graphics().setDepth(DEPTH.drop - 1)
    const drop = scene.add.graphics().setDepth(DEPTH.drop)
    const splash = scene.add.graphics().setDepth(DEPTH.splash)
    const puff = scene.add.graphics().setDepth(DEPTH.cannon + 1)

    let body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    let baseScale = 1
    const isSheet = scene.textures.exists(SHEET.cannon)

    if (isSheet) {
        const origin = cannonOrigin()
        baseScale = cannonScale(CANNON.w)
        body = scene.add
            .image(CANNON.x, CANNON.y, SHEET.cannon, CANNON_FRAME.idle)
            .setOrigin(origin.x, origin.y)
            .setScale(baseScale)
            .setFlipX(FACING < 0)
            .setDepth(DEPTH.cannon)
    } else {
        const g = scene.add
            .graphics()
            .setPosition(CANNON.x, CANNON.y)
            .setScale(FACING, 1)
            .setDepth(DEPTH.cannon)
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(-84, 16, 150, 26, 12)
        g.fillStyle(C.ink, 1)
        g.fillCircle(-52, 48, 34)
        g.fillCircle(38, 48, 30)
        g.fillStyle(C.wood, 1)
        g.fillCircle(-52, 48, 22)
        g.fillCircle(38, 48, 19)
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-88, -44, 176, 68, 34)
        g.fillStyle(C.steel, 1)
        g.fillRoundedRect(-84, -40, 168, 60, 30)
        g.fillStyle(C.paint, 1)
        g.fillRoundedRect(-84, -40, 168, 42, 26)
        g.fillStyle(C.ink, 1)
        g.fillCircle(84, -10, 30)
        g.fillStyle(C.steel, 1)
        g.fillCircle(84, -10, 24)
        body = g
        baseScale = 1
    }

    const setFrame = (frame: number) => {
        if (body instanceof Phaser.GameObjects.Image) body.setFrame(frame)
    }

    /** A boca do cano. Troca de lado junto com o flip. */
    const muzzle = (): Point => {
        if (!isSheet) return { x: CANNON.x + FACING * 108, y: CANNON.y - 10 }
        const o = cannonOrigin()
        return {
            x: CANNON.x + FACING * (MUZZLE.x - o.x) * CANNON_SHEET.frameWidth * baseScale,
            y: CANNON.y + (MUZZLE.y - o.y) * CANNON_SHEET.frameHeight * baseScale,
        }
    }

    const clearInk = () => {
        trail.clear()
        trail.setAlpha(1)
        drop.clear()
        drop.setAlpha(1)
        splash.clear()
        splash.setAlpha(1)
        puff.clear()
        puff.setAlpha(1)
    }

    /** A fumacinha que sai da boca junto com o tiro. */
    const blow = async (at: Point) => {
        const bolhas = Array.from({ length: 6 }, (_, i) => ({
            a: Math.PI + Phaser.Math.FloatBetween(-0.7, 0.7),
            d: 22 + i * 13,
            r: 13 + (i % 3) * 6,
        }))
        const step = { v: 0 }
        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: step,
                v: 1,
                duration: FX.ms(scene, 460),
                onUpdate: () => {
                    puff.clear()
                    bolhas.forEach(b => {
                        puff.fillStyle(C.white, 0.5 * (1 - step.v))
                        puff.fillCircle(
                            at.x + FACING * Math.abs(Math.cos(b.a)) * b.d * step.v,
                            at.y + Math.sin(b.a) * b.d * step.v * 0.7 - 14 * step.v,
                            b.r * (0.6 + step.v * 0.9),
                        )
                    })
                },
                onComplete: () => resolve(),
            })
        })
        puff.clear()
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     *  A GOTA
     * ─────────────────────────────────────────────────────────────────────
     *
     * Não é uma bolinha: é uma LÁGRIMA, com a ponta virada para onde ela vai.
     * A cauda sai de três círculos decrescentes atrás do corpo, na direção da
     * velocidade — que é o truque mais barato de dar direção a algo redondo
     * sem rotacionar um `Graphics` que desenha em coordenadas de tela.
     */
    const fly = async (to: Point, color: number) => {
        const from = muzzle()
        const step = { v: 0 }
        const lift = 96
        const pingos: Array<Point & { r: number }> = []

        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: step,
                v: 1,
                duration: FX.ms(scene, 460),
                ease: 'Sine.easeIn',
                onUpdate: () => {
                    const t = step.v
                    const inv = 1 - t
                    const cx = (from.x + to.x) / 2
                    const cy = Math.min(from.y, to.y) - lift
                    const x = inv * inv * from.x + 2 * inv * t * cx + t * t * to.x
                    const y = inv * inv * from.y + 2 * inv * t * cy + t * t * to.y

                    // a derivada da bézier dá a direção do voo naquele ponto
                    const dx = 2 * inv * (cx - from.x) + 2 * t * (to.x - cx)
                    const dy = 2 * inv * (cy - from.y) + 2 * t * (to.y - cy)
                    const n = Math.hypot(dx, dy) || 1
                    const ux = dx / n
                    const uy = dy / n

                    const r = 17 - 3 * t
                    drop.clear()
                    // cauda: some para trás, na direção de onde veio
                    for (let i = 3; i >= 1; i--) {
                        const k = i / 3
                        drop.fillStyle(color, 0.5 - 0.12 * i)
                        drop.fillCircle(x - ux * r * k * 1.5, y - uy * r * k * 1.5, r * (1 - k * 0.55))
                    }
                    drop.fillStyle(color, 0.3)
                    drop.fillCircle(x, y, r + 6)
                    drop.fillStyle(color, 1)
                    drop.fillCircle(x, y, r)
                    drop.fillStyle(C.white, 0.55)
                    drop.fillCircle(x - ux * 3 - 4, y - uy * 3 - 5, r * 0.32)

                    // pingos que ficam para trás e somem
                    if (Math.random() < 0.5) {
                        pingos.push({ x: x - ux * 20, y: y - uy * 20, r: Phaser.Math.Between(3, 6) })
                        if (pingos.length > 9) pingos.shift()
                    }
                    trail.clear()
                    pingos.forEach((p, i) => {
                        trail.fillStyle(color, 0.06 + 0.05 * i)
                        trail.fillCircle(p.x, p.y + (pingos.length - i) * 1.4, p.r)
                    })
                },
                onComplete: () => resolve(),
            })
        })
        drop.clear()
        void FX.to(scene, trail as unknown as Phaser.GameObjects.Container, { alpha: 0 }, { duration: 260 }).then(
            () => {
                trail.clear()
                trail.setAlpha(1)
            },
        )
    }

    /**
     * O splash.
     *
     * Metade dos respingos voa em leque e a outra metade ESCORRE para baixo,
     * porque tinta escorre. Sem isso o impacto lê como fagulha, e a única
     * coisa que este jogo não pode parecer é explosão.
     */
    const burst = async (at: Point, color: number) => {
        splash.clear()
        splash.setAlpha(1)
        const leque = Array.from({ length: 9 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 9 + Phaser.Math.FloatBetween(-0.25, 0.25)
            return { a, d: Phaser.Math.Between(30, 52), r: Phaser.Math.Between(6, 13) }
        })
        const escorridos = Array.from({ length: 4 }, () => ({
            dx: Phaser.Math.Between(-26, 26),
            queda: Phaser.Math.Between(26, 46),
            r: Phaser.Math.Between(5, 9),
        }))
        const step = { v: 0 }
        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: step,
                v: 1,
                duration: FX.ms(scene, 460),
                ease: 'Cubic.easeOut',
                onUpdate: () => {
                    const t = step.v
                    splash.clear()

                    splash.fillStyle(color, 0.5 * (1 - t))
                    splash.fillCircle(at.x, at.y, 20 + 42 * t)

                    leque.forEach(b => {
                        splash.fillStyle(color, 0.95 * (1 - t))
                        splash.fillCircle(
                            at.x + Math.cos(b.a) * b.d * t,
                            at.y + Math.sin(b.a) * b.d * t,
                            b.r * (1 - t * 0.55),
                        )
                    })

                    escorridos.forEach(e => {
                        splash.fillStyle(color, 0.9 * (1 - t * 0.7))
                        const y = at.y + e.queda * t * t
                        splash.fillCircle(at.x + e.dx, y, e.r * (1 - t * 0.3))
                        splash.fillRect(at.x + e.dx - e.r * 0.4, at.y, e.r * 0.8, Math.max(0, y - at.y))
                    })
                },
                onComplete: () => resolve(),
            })
        })
        splash.clear()
    }

    return {
        /**
         * Gira, dispara e acerta.
         *
         * `hit` falso usa o cinza do erro: a tinta sai, bate e some sem deixar
         * marca — o §10 pede que o erro seja visível sem ser punição.
         */
        async shoot(to: Point, hit: boolean) {
            const color = hit ? C.paint : C.miss
            clearInk()
            scene.tweens.killTweensOf(body)
            body.setPosition(CANNON.x, CANNON.y).setAngle(0)
            if (body instanceof Phaser.GameObjects.Image) body.setScale(baseScale)
            else body.setScale(FACING, 1)

            const scaleOf = (sx: number, sy: number) =>
                body instanceof Phaser.GameObjects.Image
                    ? { scaleX: baseScale * sx, scaleY: baseScale * sy }
                    : { scaleX: FACING * sx, scaleY: sy }

            /*
             * 1. TOMA IMPULSO. O canhão agacha e recua um dedo, como quem puxa
             *    o braço antes de arremessar. É curto: 160 ms bastam para o
             *    olho registrar que algo vai acontecer.
             */
            setFrame(CANNON_FRAME.idle)
            await FX.all(
                FX.to(scene, body, { angle: FACING * -5 }, { duration: 160, ease: 'Sine.easeOut' }),
                FX.to(scene, body, scaleOf(1.05, 0.94), { duration: 160 }),
            )

            /*
             * 2. DISPARA. O recuo vai para o lado OPOSTO ao cano, o corpo
             *    estica na direção do tiro e a boca solta fumaça.
             */
            setFrame(CANNON_FRAME.fire)
            const boca = muzzle()
            void blow(boca)
            void FX.shakeCam(scene, 'leve')
            await FX.all(
                FX.to(scene, body, { x: CANNON.x - FACING * 26, angle: FACING * 4 }, { duration: 90 }),
                FX.to(scene, body, scaleOf(0.92, 1.08), { duration: 90 }),
            )

            /*
             * 3. A GOTA VOA enquanto o canhão volta ao lugar quicando nas
             *    rodas. As duas coisas ao mesmo tempo: esperar o canhão
             *    assentar antes de soltar a tinta deixaria o tiro lento.
             */
            void FX.to(scene, body, { x: CANNON.x }, { duration: 520, ease: 'Back.easeOut' })
            void FX.to(scene, body, scaleOf(1, 1), { duration: 420, ease: 'Back.easeOut' })
            await fly(to, color)

            setFrame(CANNON_FRAME.smoke)
            await burst(to, color)

            void FX.to(scene, body, { angle: 0 }, { duration: 420, ease: 'Sine.easeInOut' }).then(() =>
                setFrame(CANNON_FRAME.idle),
            )
        },

        clearInk,

        bounds() {
            return { x: CANNON.x, y: CANNON.y - 20, w: CANNON.w + 90, h: CANNON.w + 40 }
        },

        destroy() {
            scene.tweens.killTweensOf(body)
            body.destroy()
            trail.destroy()
            drop.destroy()
            splash.destroy()
            puff.destroy()
        },
    }
}

export type Cannon = ReturnType<typeof createCannon>
