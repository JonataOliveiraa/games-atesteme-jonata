import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { SHEET } from '../data/art'
import { DEPTH, PIECE, suporteGeo } from '../data/layout'
import { C } from '../data/theme'
import type { Editor, Medida, Peca } from '../types'
import { createCanvasTexto } from './canvasTexto'
import { createCanvasSlides } from './canvasSlides'
import { createCanvasVideo } from './canvasVideo'

interface Canvas {
    render: (peca: Peca) => void
    measure: () => Medida
    react: () => Promise<void>
    setClip: (on: boolean) => void
    destroy: () => void
}

/**
 * A PEÇA — o suporte onde ela vive, e o conteúdo dentro dele.
 *
 * O contêiner fica no centro do OBJETO e o conteúdo num filho posto no centro da
 * ÁREA LISA, porque nenhum dos três suportes tem o miolo no centro da célula do
 * PNG. Quem desenha o conteúdo é o canvas do editor; aqui só moram o suporte, o
 * voo e a borda que pisca.
 */
export function createPiece(scene: Phaser.Scene, editor: Editor) {
    const geo = suporteGeo(editor)
    const root = scene.add.container(PIECE.cx, PIECE.cy).setDepth(DEPTH.piece)

    if (scene.textures.exists(SHEET.props)) {
        const board = scene.add
            .image(geo.spriteDX, geo.spriteDY, SHEET.props, geo.frame)
            .setScale(geo.scale)
        root.add(board)
    } else {
        const reserva = scene.add.graphics()
        root.add(reserva)
        reserva.fillStyle(C.ink, 0.28)
        reserva.fillRoundedRect(-geo.outerW / 2 + 6, -geo.outerH / 2 + 12, geo.outerW, geo.outerH, 18)
        reserva.fillStyle(C.wood, 1)
        reserva.fillRoundedRect(-geo.outerW / 2, -geo.outerH / 2, geo.outerW, geo.outerH, 18)
        reserva.fillStyle(C.cork, 1)
        reserva.fillRoundedRect(
            geo.innerDX - geo.innerW / 2,
            geo.innerDY - geo.innerH / 2,
            geo.innerW,
            geo.innerH,
            8,
        )
    }

    const inner = scene.add.container(geo.innerDX, geo.innerDY)
    root.add(inner)

    const canvas: Canvas =
        editor === 'texto'
            ? createCanvasTexto(scene, inner, geo)
            : editor === 'slides'
              ? createCanvasSlides(scene, inner, geo)
              : createCanvasVideo(scene, inner, geo)

    const edge = scene.add.graphics()
    inner.add(edge)

    return {
        container: root,

        render(peca: Peca) {
            canvas.render(peca)
        },

        measure(): Medida {
            return canvas.measure()
        },

        react() {
            return canvas.react()
        },

        point() {
            return { x: root.x, y: root.y }
        },

        /** A borda avisa que alguma coisa incomodou, sem dizer o que fazer. */
        async blink(color: number) {
            edge.clear()
            edge.lineStyle(7, color, 1)
            edge.strokeRoundedRect(-geo.innerW / 2, -geo.innerH / 2, geo.innerW, geo.innerH, 10)
            edge.setAlpha(0)
            await FX.to(scene, edge, { alpha: 1 }, { duration: 110 })
            await FX.to(scene, edge, { alpha: 0 }, { duration: 420 })
            edge.clear()
        },

        /** Vai até o cliente. O recorte sai: em voo ele ficaria no lugar errado. */
        async flyTo(x: number, y: number) {
            canvas.setClip(false)
            await FX.to(
                scene,
                root,
                { x, y, scaleX: 0.4, scaleY: 0.4, angle: -6 },
                { duration: 520, ease: 'Back.easeIn' },
            )
        },

        async comeBack() {
            await FX.to(
                scene,
                root,
                { x: PIECE.cx, y: PIECE.cy, scaleX: 1, scaleY: 1, angle: 0 },
                { duration: 420, ease: 'Back.easeOut' },
            )
            canvas.setClip(true)
        },

        /** Some dentro da bolinha da fase, no cabeçalho. */
        async fileAway(x: number, y: number) {
            await FX.to(
                scene,
                root,
                { x, y, scaleX: 0.05, scaleY: 0.05, angle: 160 },
                { duration: 520, ease: 'Back.easeIn' },
            )
            root.setVisible(false)
        },

        /** Volta para a parede sem animação: é o começo de uma fase nova. */
        reset() {
            FX.kill(scene, root)
            root.setVisible(true)
            root.setPosition(PIECE.cx, PIECE.cy)
            root.setScale(1)
            root.setAngle(0)
            canvas.setClip(true)
        },

        destroy() {
            FX.kill(scene, root)
            canvas.destroy()
            root.destroy(true)
        },
    }
}

export type Piece = ReturnType<typeof createPiece>
