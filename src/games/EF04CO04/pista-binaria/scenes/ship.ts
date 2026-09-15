import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { SHEET, SHIP_FRAME, SHIP_SHEET } from '../data/art'
import { DEPTH, SHIP, SHOT } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Bit } from '../types'

/**
 * A nave, e o tiro.
 *
 * O tiro É o dígito: um `1` ou um `0` de papel saindo da proa. Não existe
 * câmara para carregar, nem espera — tocar no botão dispara. É o gesto mais
 * curto possível entre decidir e ver o resultado.
 */
export function createShip(scene: Phaser.Scene) {
    const root = scene.add.container(SHIP.x, SHIP.y).setDepth(DEPTH.ship)
    root.setScale(SHIP.scale)

    let sprite: Phaser.GameObjects.Sprite | undefined
    if (scene.textures.exists(SHEET.ship)) {
        sprite = scene.add.sprite(0, 0, SHEET.ship, SHIP_FRAME.idle)
        sprite.setDisplaySize(SHIP_SHEET.frameWidth, SHIP_SHEET.frameHeight)
        root.add(sprite)
    } else {
        const body = scene.add.graphics()
        body.fillStyle(C.coral, 1)
        body.fillEllipse(0, 0, 420, 190)
        body.fillStyle(C.cream, 1)
        body.fillTriangle(180, -90, 290, 0, 180, 90)
        root.add(body)
    }

    const flash = scene.add.graphics().setDepth(DEPTH.shot)

    let thrust = 0

    FX.float(scene, root, { amount: 6, duration: 2400 })

    return {
        container: root,

        update(dt: number, running: boolean) {
            if (!running || !sprite) return
            thrust += dt
            if (thrust < 0.12) return
            thrust = 0
            sprite.setFrame(sprite.frame.name === String(SHIP_FRAME.idle) ? SHIP_FRAME.thrust : SHIP_FRAME.idle)
        },

        /** O coice do disparo. Curto: o olho tem que seguir o dígito, não a nave. */
        kick() {
            FX.kill(scene, root)
            scene.tweens.add({
                targets: root,
                x: SHIP.x - 16,
                duration: 70,
                yoyo: true,
                onComplete: () => {
                    root.x = SHIP.x
                    FX.float(scene, root, { amount: 6, duration: 2400 })
                },
            })
            flash.clear()
            flash.fillStyle(C.yellow, 0.85)
            flash.fillCircle(SHIP.noseX + 6, SHIP.y, 22)
            scene.time.delayedCall(90, () => flash.clear())
        },

        /** O dígito de papel que sai voando. Quem o move é a cena. */
        spawnShot(bit: Bit) {
            const shot = scene.add.container(SHIP.noseX + 10, SHIP.y).setDepth(DEPTH.shot)
            const disc = scene.add.graphics()
            disc.fillStyle(C.ink, 0.28)
            disc.fillCircle(2, 5, SHOT.size / 2)
            disc.fillStyle(C.cream, 1)
            disc.fillCircle(0, 0, SHOT.size / 2)
            disc.lineStyle(4, C.coral, 1)
            disc.strokeCircle(0, 0, SHOT.size / 2 - 3)
            shot.add(disc)
            shot.add(
                scene.add
                    .text(0, 1, String(bit), {
                        fontFamily: FONT.black,
                        fontSize: '40px',
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
            return shot
        },

        /**
         * A escotilha, em coordenada de tela.
         *
         * Medida no PNG (centroide do papel turquesa): local (107, 14) da
         * célula de 600 × 400. É o alvo da figurinha no fim do nível — ela
         * entra por ali.
         */
        portholePoint() {
            return { x: root.x + 107 * SHIP.scale, y: root.y + 14 * SHIP.scale }
        },

        /** Sai de cena na remontagem: quem tem de ser olhado ali é a máquina. */
        async leave() {
            FX.kill(scene, root)
            await FX.to(scene, root, { alpha: 0, x: SHIP.x - 240 }, { duration: 420, ease: 'Back.easeIn' })
        },

        /** Volta para buscar a figurinha, freando ao chegar. */
        async comeBack(x: number, y: number) {
            sprite?.setFrame(SHIP_FRAME.thrust)
            root.setAlpha(1)
            root.setScale(SHIP.scale)
            root.setPosition(-300, y)
            await FX.to(scene, root, { x: x + 40 }, { duration: 620, ease: 'Sine.easeOut' })
            await FX.to(scene, root, { x }, { duration: 260, ease: 'Sine.easeInOut' })
        },

        /** A figurinha entrou: a escotilha acende e a nave engole com um baque. */
        async swallow() {
            const at = this.portholePoint()
            flash.clear()
            flash.fillStyle(C.cream, 0.95)
            flash.fillCircle(at.x, at.y, 10)
            void FX.to(scene, flash, { alpha: 0 }, { duration: 260 }).then(() => {
                flash.clear()
                flash.setAlpha(1)
            })
            void FX.sparks(scene, at.x, at.y, { color: C.yellow, count: 14, spread: 90, size: 9 })
            await FX.to(scene, root, { scaleX: SHIP.scale * 1.14, scaleY: SHIP.scale * 0.86 }, { duration: 110 })
            await FX.to(
                scene,
                root,
                { scaleX: SHIP.scale, scaleY: SHIP.scale },
                { duration: 420, ease: 'Elastic.easeOut' },
            )
        },

        /** O arranque: recua, estica e some para a direita. */
        async blastOff() {
            sprite?.setFrame(SHIP_FRAME.thrust)
            await FX.to(scene, root, { x: root.x - 60 }, { duration: 260, ease: 'Sine.easeInOut' })
            await FX.to(
                scene,
                root,
                { x: 1700, scaleX: SHIP.scale * 1.1, scaleY: SHIP.scale * 0.92 },
                // 'Back.easeIn' recuaria de novo, e o recuo já é o passo de cima:
                // duas puxadas seguidas fazem a nave parecer indecisa
                { duration: 620, ease: 'Cubic.easeIn' },
            )
        },

        destroy() {
            flash.destroy()
            root.destroy(true)
        },
    }
}

export type Ship = ReturnType<typeof createShip>
