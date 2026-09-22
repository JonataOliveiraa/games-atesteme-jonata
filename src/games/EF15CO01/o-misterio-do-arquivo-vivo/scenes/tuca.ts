import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import { C, CSS } from '../data/theme'
import { DEPTH, TUCA } from '../data/layout'
import { SHEETS, TUCA_F, has } from '../data/files'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O TUCA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * As prateleiras deste jogo são `Graphics`, então **toda a personalidade passa
 * por ele**. É o "vivo" do título: ele acena, comemora, fica curioso quando
 * erram e aponta quando a criança demora — e nada encaixa em cima dele.
 *
 * **Ele nunca dá bronca.** O estado de erro é `curioso`, de cabeça inclinada.
 * A criança errou uma posição, não uma pessoa.
 */

export interface Tuca {
    readonly sprite: Phaser.GameObjects.Image
    pose(frame: number): void
    /** Uma linha curta, em balão, ao lado dele. `undefined` fecha o balão. */
    fala(texto?: string): void
    comemorar(): Promise<void>
    destroy(): void
}

export function criarTuca(
    scene: Phaser.Scene,
    x: number = TUCA.x,
    y: number = TUCA.y,
    escala: number = TUCA.escala,
): Tuca {
    const sprite = has(scene, SHEETS.arquivista.key)
        ? scene.add.image(x, y, SHEETS.arquivista.key, TUCA_F.esperando)
        : (scene.add.rectangle(x, y, 160, 190, C.madeira) as unknown as Phaser.GameObjects.Image)
    sprite.setScale(escala).setDepth(DEPTH.arquivista)
    FX.float(scene, sprite, { amount: 6, duration: 2200 })

    let balao: Phaser.GameObjects.Container | undefined

    const fecharBalao = () => {
        balao?.destroy()
        balao = undefined
    }

    return {
        sprite,

        pose(frame) {
            sprite.setFrame(frame)
        },

        fala(texto) {
            fecharBalao()
            if (!texto) return

            const c = scene.add.container(x + 108, y - 108).setDepth(DEPTH.faixa)
            const t = scene.add.text(0, 0, texto, {
                fontFamily: FONT_JOGO.black,
                fontSize: '30px',
                color: CSS.tinta,
                align: 'left',
                wordWrap: { width: 430 },
            }).setOrigin(0, 0.5).setResolution(2)

            const w = t.width + 56
            const h = Math.max(78, t.height + 44)
            const g = scene.add.graphics()
            g.fillStyle(C.creme, 0.97)
            g.lineStyle(6, C.tinta, 1)
            g.fillRoundedRect(-28, -h / 2, w, h, 22)
            g.strokeRoundedRect(-28, -h / 2, w, h, 22)
            /* O rabinho aponta para o Tuca, para ninguém achar que a fala é da
               peça que está do lado. */
            g.fillStyle(C.creme, 0.97)
            g.fillTriangle(-24, 8, -24, 40, -62, 34)
            g.lineStyle(6, C.tinta, 1)
            g.lineBetween(-24, 8, -62, 34)
            g.lineBetween(-62, 34, -24, 40)

            c.add([g, t])
            balao = c

            c.setAlpha(0)
            scene.tweens.add({ targets: c, alpha: 1, x: x + 116, duration: 220, ease: 'Back.easeOut' })
        },

        async comemorar() {
            sprite.setFrame(TUCA_F.comemorando)
            await FX.to(scene, sprite, { y: y - 46 }, { duration: 180, ease: 'Quad.easeOut' })
            await FX.to(scene, sprite, { y }, { duration: 240, ease: 'Bounce.easeOut' })
        },

        destroy() {
            fecharBalao()
            sprite.destroy()
        },
    }
}
