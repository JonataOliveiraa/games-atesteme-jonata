import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BLOCK_FRAME, BLOCK_SHEET, SHEET } from '../data/art'
import { BLOCK, DEPTH, LANE_Y } from '../data/layout'
import { C } from '../data/theme'
import type { Bit } from '../types'
import { paintFilled, paintHole } from './paper'

/**
 * Uma caixa da fila.
 *
 * Ela sabe de onde veio (`row`, `col`) para o pedaço pousar na célula certa da
 * máquina — mas NÃO sabe a resposta: o `bit` é lido do desenho na hora em que
 * ela nasce, e o veredito é recalculado no impacto.
 *
 * O furo do PNG é transparente, mas o miolo não fica vazado: por trás dele o
 * túnel tem uma clareira creme, e um quadradinho vazio viraria mancha clara
 * justo onde precisa parecer buraco. O código sempre pinta o recesso escuro.
 */
export function createBlock(scene: Phaser.Scene, bit: Bit, row: number, col: number) {
    const root = scene.add.container(BLOCK.spawnX, LANE_Y).setDepth(DEPTH.block)
    root.setScale(BLOCK.scale)

    const hole = scene.add.graphics()
    const holeX = BLOCK.holeX / BLOCK.scale
    const holeY = BLOCK.holeY / BLOCK.scale
    const inner = BLOCK.inner / BLOCK.scale

    const paint = (closed: boolean) => {
        hole.clear()
        if (closed) return
        paintHole(hole, holeX, holeY, inner + 26)
        if (bit === 1) paintFilled(hole, holeX, holeY, inner)
    }
    root.add(hole)

    let sprite: Phaser.GameObjects.Sprite | undefined
    if (scene.textures.exists(SHEET.block)) {
        sprite = scene.add.sprite(0, 0, SHEET.block, BLOCK_FRAME.open)
        sprite.setDisplaySize(BLOCK_SHEET.frameWidth, BLOCK_SHEET.frameHeight)
        root.add(sprite)
    } else {
        const frame = scene.add.graphics()
        frame.lineStyle(34, C.cream, 1)
        frame.strokeRoundedRect(-180, -180, 360, 360, 26)
        root.add(frame)
    }
    paint(false)

    // cada caixa flutua com a sua própria fase: a fila inteira subindo e
    // descendo junta pareceria um acordeão, e não uma fila
    FX.float(scene, root, {
        amount: Phaser.Math.Between(4, 7),
        duration: Phaser.Math.Between(1500, 2300),
        delay: Phaser.Math.Between(0, 600),
    })

    let dead = false

    return {
        bit,
        row,
        col,
        container: root,

        get x() {
            return root.x
        },

        get alive() {
            return !dead
        },

        moveTo(x: number) {
            root.x = x
        },

        /** Onde o quadradinho está, em coordenada de tela. */
        holePoint() {
            return { x: root.x + BLOCK.holeX, y: root.y + BLOCK.holeY }
        },

        /**
         * A TRAVA: a caixa cresce e treme, e continua ABERTA.
         *
         * Fechá-la era o desenho mais bonito e o erro mais caro — sumia com o
         * quadradinho justo quando a criança precisa olhar para ele. O quadro
         * fechado existe para a caixa lacrada do nível 3, que é outra coisa.
         */
        async lock() {
            sprite?.setTint(0xffc08a)
            await FX.shake(scene, root, { amount: 10, times: 2 })
        },

        unlock() {
            sprite?.clearTint()
            root.setScale(BLOCK.scale)
        },

        /** A caixa lacrada do nível 3: chega fechada, sem mostrar o quadradinho. */
        seal() {
            sprite?.setFrame(BLOCK_FRAME.closed)
            paint(true)
        },

        /** O dígito acertou: a caixa se abre e some — o pedaço já saiu voando. */
        async burst() {
            dead = true
            FX.kill(scene, root)

            // estilhaços de papel: a caixa não some, ela se desmancha
            for (let i = 0; i < 7; i++) {
                const shard = scene.add.graphics().setDepth(DEPTH.block + 1)
                shard.fillStyle(i % 2 ? C.cream : C.blue, 1)
                const w = Phaser.Math.Between(10, 20)
                shard.fillRoundedRect(-w / 2, -w / 4, w, w * 0.6, 3)
                shard.setPosition(root.x, root.y)
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
                const dist = Phaser.Math.Between(50, 110)
                void FX.to(
                    scene,
                    shard,
                    {
                        x: root.x + Math.cos(angle) * dist,
                        y: root.y + Math.sin(angle) * dist + 40,
                        angle: Phaser.Math.Between(-220, 220),
                        alpha: 0,
                    },
                    { duration: 520, ease: 'Quad.easeOut' },
                ).then(() => shard.destroy())
            }
            await FX.to(
                scene,
                root,
                { scaleX: BLOCK.scale * 1.2, scaleY: BLOCK.scale * 1.2 },
                { duration: 90, ease: 'Back.easeOut' },
            )
            await FX.to(
                scene,
                root,
                { alpha: 0, scaleX: BLOCK.scale * 0.5, scaleY: BLOCK.scale * 0.5 },
                { duration: 180 },
            )
            root.destroy(true)
        },

        destroy() {
            dead = true
            root.destroy(true)
        },
    }
}

export type Block = ReturnType<typeof createBlock>
