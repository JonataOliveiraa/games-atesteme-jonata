import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MACHINE_FRAME, MACHINE_SHEET, SHEET } from '../data/art'
import { DEPTH, MACHINE } from '../data/layout'
import { C } from '../data/theme'
import type { Bit } from '../types'
import { paintFilled, paintHole, paintPanel } from './paper'

/**
 * A máquina do outro lado do túnel.
 *
 * A tela do PNG é um FURO transparente, então a ordem dentro do contêiner é
 * painel → pixels → sprite: o papel da moldura fica por cima e recorta a grade
 * sozinho, sem máscara.
 *
 * Tudo é desenhado no tamanho NATIVO da folha (400 × 400) e quem encolhe é o
 * contêiner. É isso que deixa a remontagem do fim ser um `setScale` só, sem
 * recalcular a posição de 36 quadradinhos.
 *
 * A grade vem do NÍVEL: 5 × 5 nos dois primeiros, 6 × 6 no terceiro. O lado da
 * célula é calculado para caber na altura do furo, que é o lado curto.
 */
export function createMachine(scene: Phaser.Scene, grid: number) {
    const root = scene.add.container(MACHINE.x, MACHINE.y).setDepth(DEPTH.machine)
    root.setScale(MACHINE.scale)

    const pixel = Math.floor(MACHINE.screenH / grid) - 2
    const size = pixel - 4
    const half = (grid * pixel) / 2

    const cellLocal = (row: number, col: number) => ({
        x: MACHINE.screenX - half + col * pixel + pixel / 2,
        y: MACHINE.screenY - half + row * pixel + pixel / 2,
    })

    const panel = scene.add.graphics()
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(
        MACHINE.screenX - MACHINE.screenW / 2,
        MACHINE.screenY - MACHINE.screenH / 2,
        MACHINE.screenW,
        MACHINE.screenH,
        16,
    )
    panel.fillStyle(C.navyDeep, 1)
    panel.fillRoundedRect(
        MACHINE.screenX - MACHINE.screenW / 2 + 5,
        MACHINE.screenY - MACHINE.screenH / 2 + 5,
        MACHINE.screenW - 10,
        MACHINE.screenH - 10,
        12,
    )
    root.add(panel)

    const cells = scene.add.graphics()
    root.add(cells)

    const glow = scene.add.graphics()
    root.add(glow)

    let sprite: Phaser.GameObjects.Sprite | undefined
    if (scene.textures.exists(SHEET.machine)) {
        sprite = scene.add.sprite(0, 0, SHEET.machine, MACHINE_FRAME.idle)
        sprite.setDisplaySize(MACHINE_SHEET.frameWidth, MACHINE_SHEET.frameHeight)
        root.add(sprite)
    } else {
        const frame = scene.add.graphics()
        frame.lineStyle(18, C.turquoise, 1)
        frame.strokeRoundedRect(-170, -180, 340, 360, 30)
        root.add(frame)
    }

    const received: (Bit | null)[][] = Array.from({ length: grid }, () =>
        Array.from({ length: grid }, () => null as Bit | null),
    )

    /**
     * As vagas vazias aparecem desde o começo.
     *
     * Sem elas a tela é um retângulo preto, e a criança não tem como saber que
     * aquilo vai virar alguma coisa — o progresso fica invisível justamente no
     * objeto que É o progresso.
     */
    const paint = () => {
        cells.clear()
        for (let row = 0; row < grid; row++) {
            for (let col = 0; col < grid; col++) {
                const at = cellLocal(row, col)
                const bit = received[row][col]
                if (bit === null) {
                    cells.fillStyle(C.blue, 0.16)
                    cells.fillRoundedRect(at.x - size / 2, at.y - size / 2, size, size, 6)
                    continue
                }
                if (bit === 1) paintFilled(cells, at.x, at.y, size)
                else paintHole(cells, at.x, at.y, size, C.navy)
            }
        }
    }
    paint()

    return {
        container: root,
        grid,

        /** Onde o pedaço precisa pousar, em coordenada de tela. */
        cellPoint(row: number, col: number) {
            const at = cellLocal(row, col)
            return { x: root.x + at.x * root.scaleX, y: root.y + at.y * root.scaleY }
        },

        cellSize() {
            return size * root.scaleX
        },

        /** O pedaço encaixou: a célula pisca e a máquina acende o LED. */
        set(row: number, col: number, bit: Bit) {
            received[row][col] = bit
            paint()

            const at = cellLocal(row, col)
            const spark = scene.add.graphics()
            spark.fillStyle(C.white, 0.9)
            spark.fillRoundedRect(at.x - size / 2, at.y - size / 2, size, size, 6)
            root.add(spark)
            void FX.to(scene, spark, { alpha: 0, scale: 1.9 }, { duration: 260 }).then(() => spark.destroy())

            sprite?.setFrame(MACHINE_FRAME.busy)
            scene.time.delayedCall(240, () => sprite?.setFrame(MACHINE_FRAME.idle))
        },

        clear() {
            for (let row = 0; row < grid; row++) {
                for (let col = 0; col < grid; col++) received[row][col] = null
            }
            paint()
        },

        /** A linha inteira pisca uma vez: é o único aviso de fim de linha. */
        async flashRow(row: number) {
            const at = cellLocal(row, 0)
            glow.clear()
            glow.fillStyle(C.yellow, 0.5)
            glow.fillRoundedRect(
                at.x - pixel / 2 - 4,
                at.y - pixel / 2 - 4,
                grid * pixel + 8,
                pixel + 8,
                10,
            )
            await FX.wait(scene, 200)
            glow.clear()
        },

        /** O desenho ficou pronto: a máquina dá um pulo antes de cuspir a figurinha. */
        async pulse() {
            await FX.to(scene, root, { scaleX: MACHINE.scale * 1.08, scaleY: MACHINE.scale * 1.08 }, { duration: 150 })
            await FX.to(
                scene,
                root,
                { scaleX: MACHINE.scale, scaleY: MACHINE.scale },
                { duration: 420, ease: 'Elastic.easeOut' },
            )
        },

        screenPoint() {
            return {
                x: root.x + MACHINE.screenX * root.scaleX,
                y: root.y + MACHINE.screenY * root.scaleY,
                scale: root.scaleX,
            }
        },

        /**
         * O desenho vira uma FIGURINHA de papel.
         *
         * É o que a criança leva do nível: a sequência que ela transmitiu sai
         * da tela como objeto. Sem isso a mensagem termina onde começou —
         * dentro de uma tela preta.
         */
        makeCard(art: Bit[][], where?: { x: number; y: number; scale: number }) {
            const at = where ?? this.screenPoint()
            const card = scene.add.container(at.x, at.y).setDepth(DEPTH.reveal + 1).setScale(at.scale)

            const paper = scene.add.graphics()
            const side = grid * pixel + 34
            paintPanel(paper, 0, 0, side, side, 20)
            for (let row = 0; row < grid; row++) {
                for (let col = 0; col < grid; col++) {
                    const cell = cellLocal(row, col)
                    const x = cell.x - MACHINE.screenX
                    const y = cell.y - MACHINE.screenY
                    if (art[row][col] === 1) paintFilled(paper, x, y, size)
                    else paintHole(paper, x, y, size, C.creamShade)
                }
            }
            card.add(paper)
            return card
        },

        async shrinkAway() {
            await FX.to(scene, root, { alpha: 0, scaleX: 0.86, scaleY: 0.86 }, { duration: 340 })
        },

        destroy() {
            root.destroy(true)
        },
    }
}

export type Machine = ReturnType<typeof createMachine>
