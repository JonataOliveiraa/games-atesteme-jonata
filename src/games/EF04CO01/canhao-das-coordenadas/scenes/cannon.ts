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
 * Por isso ele gira DEPOIS da escolha, e nunca antes. Um canhão que se vira
 * sozinho enquanto a criança pensa estaria entregando a coordenada.
 */

type Point = { x: number; y: number }

export function createCannon(scene: Phaser.Scene) {
    const drop = scene.add.graphics().setDepth(DEPTH.drop)
    const splash = scene.add.graphics().setDepth(DEPTH.splash)

    let body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    let baseScale = 1

    if (scene.textures.exists(SHEET.cannon)) {
        const origin = cannonOrigin()
        baseScale = cannonScale(CANNON.w)
        body = scene.add
            .image(CANNON.x, CANNON.y, SHEET.cannon, CANNON_FRAME.idle)
            .setOrigin(origin.x, origin.y)
            .setScale(baseScale)
            .setDepth(DEPTH.cannon)
    } else {
        // reserva: cano azul, boca larga, carreta e duas rodas — o suficiente
        // para o nível 1 rodar antes da arte, como manda o §8 do TEXTURAS.md
        const g = scene.add.graphics().setPosition(CANNON.x, CANNON.y).setDepth(DEPTH.cannon)
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

    /** A boca do cano, de onde a gota nasce. */
    const muzzle = (): Point =>
        body instanceof Phaser.GameObjects.Image
            ? {
                  x: CANNON.x + (MUZZLE.x - cannonOrigin().x) * CANNON_SHEET.frameWidth * baseScale,
                  y: CANNON.y + (MUZZLE.y - cannonOrigin().y) * CANNON_SHEET.frameHeight * baseScale,
              }
            : { x: CANNON.x + 108, y: CANNON.y - 10 }

    const clearInk = () => {
        drop.clear()
        drop.setAlpha(1)
        splash.clear()
        splash.setAlpha(1)
    }

    /** O voo da gota: um arco curto, e some em menos de 0,6 s. */
    const fly = async (to: Point, color: number) => {
        const from = muzzle()
        const step = { v: 0 }
        const lift = 70
        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: step,
                v: 1,
                duration: FX.ms(scene, 420),
                ease: 'Sine.easeIn',
                onUpdate: () => {
                    const t = step.v
                    const inv = 1 - t
                    const cx = (from.x + to.x) / 2
                    const cy = Math.min(from.y, to.y) - lift
                    const x = inv * inv * from.x + 2 * inv * t * cx + t * t * to.x
                    const y = inv * inv * from.y + 2 * inv * t * cy + t * t * to.y
                    drop.clear()
                    drop.fillStyle(color, 0.28)
                    drop.fillCircle(x, y, 22 - 6 * t)
                    drop.fillStyle(color, 1)
                    drop.fillCircle(x, y, 15 - 3 * t)
                    drop.fillStyle(C.white, 0.5)
                    drop.fillCircle(x - 4, y - 5, 5 - 1.5 * t)
                },
                onComplete: () => resolve(),
            })
        })
        drop.clear()
    }

    const burst = async (at: Point, color: number) => {
        splash.clear()
        splash.setAlpha(1)
        const blobs = Array.from({ length: 7 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 7 + Phaser.Math.FloatBetween(-0.3, 0.3)
            return { a, d: Phaser.Math.Between(26, 44), r: Phaser.Math.Between(7, 13) }
        })
        const step = { v: 0 }
        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: step,
                v: 1,
                duration: FX.ms(scene, 340),
                onUpdate: () => {
                    splash.clear()
                    splash.fillStyle(color, 0.9 * (1 - step.v))
                    blobs.forEach(b => {
                        splash.fillCircle(
                            at.x + Math.cos(b.a) * b.d * step.v,
                            at.y + Math.sin(b.a) * b.d * step.v,
                            b.r * (1 - step.v * 0.6),
                        )
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

            // o recuo: a peça inteira dá um passo para trás e volta
            setFrame(CANNON_FRAME.idle)
            await FX.to(scene, body, { angle: -7 }, { duration: 180, ease: 'Sine.easeOut' })
            setFrame(CANNON_FRAME.fire)
            void FX.to(scene, body, { x: CANNON.x - 18 }, { duration: 90 }).then(() =>
                FX.to(scene, body, { x: CANNON.x }, { duration: 420, ease: 'Back.easeOut' }),
            )

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
            drop.destroy()
            splash.destroy()
        },
    }
}

export type Cannon = ReturnType<typeof createCannon>
