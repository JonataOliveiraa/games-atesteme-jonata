import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HAPPY_OFFSET, PEOPLE_SHEET, SHEET } from '../data/art'
import { BALLOON, CLIENT, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * Quem pediu, e o que ele diz.
 *
 * O balão tem DOIS tons e uma regra: creme é o pedido, âmbar é o bilhete que
 * voltou junto com a peça. Nenhum dos dois nomeia um botão — o cliente fala do
 * que ele sente, e a ferramenta é a conclusão da criança.
 */
export function createClient(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.client)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.18)
    shadow.fillEllipse(CLIENT.cx, CLIENT.feetY - 4, 150, 26)
    root.add(shadow)

    /*
     * O corpo mora num contêiner posicionado nos PÉS, e o desenho de reserva é
     * feito em torno de (0, 0). Um `Graphics` em coordenada de tela dentro de um
     * contêiner parado na origem não pode ser animado: o pulo do acerto levaria
     * a silhueta para fora da sala.
     */
    const figureRoot = scene.add.container(CLIENT.cx, CLIENT.feetY)
    root.add(figureRoot)

    let figure: Phaser.GameObjects.Sprite | undefined
    let base = 0

    if (scene.textures.exists(SHEET.people)) {
        figure = scene.add.sprite(0, 0, SHEET.people, 0).setOrigin(0.5, 1).setScale(CLIENT.scale)
        figureRoot.add(figure)
    } else {
        const h = PEOPLE_SHEET.frameHeight * CLIENT.scale
        const silhouette = scene.add.graphics()
        silhouette.fillStyle(C.slate, 1)
        silhouette.fillRoundedRect(-46, -h + 78, 92, h - 78, 28)
        silhouette.fillCircle(0, -h + 46, 46)
        figureRoot.add(silhouette)
    }

    const balloonRoot = scene.add
        .container(BALLOON.x + BALLOON.w / 2, BALLOON.y + BALLOON.h / 2)
        .setDepth(DEPTH.balloon)

    const bubble = scene.add.graphics()
    balloonRoot.add(bubble)

    const line = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '31px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: BALLOON.wrap },
            lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setResolution(2)
    balloonRoot.add(line)

    const paintBubble = (tone: number, border: number) => {
        const w = BALLOON.w
        const h = BALLOON.h
        const tx = BALLOON.tailX - (BALLOON.x + w / 2)
        bubble.clear()
        bubble.fillStyle(C.ink, 0.2)
        bubble.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 26)
        bubble.fillStyle(border, 1)
        bubble.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
        bubble.fillStyle(tone, 1)
        bubble.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 22)
        bubble.fillStyle(C.white, 0.35)
        bubble.fillRoundedRect(-w / 2 + 16, -h / 2 + 12, w - 32, 12, 6)
        bubble.fillStyle(border, 1)
        bubble.fillTriangle(tx - 22, h / 2 - 4, tx + 20, h / 2 - 4, tx + 2, h / 2 + BALLOON.tailDrop)
        bubble.fillStyle(tone, 1)
        bubble.fillTriangle(tx - 15, h / 2 - 8, tx + 13, h / 2 - 8, tx + 1, h / 2 + BALLOON.tailDrop - 8)
    }
    paintBubble(C.paper, C.ink)

    let typing: { skip: () => void } | undefined

    const speak = async (text: string, tone: number, border: number) => {
        typing?.skip()
        paintBubble(tone, border)
        FX.kill(scene, balloonRoot)
        balloonRoot.setScale(0.94)
        void FX.to(scene, balloonRoot, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        const run = FX.type(scene, line, text, { delay: 16 })
        typing = run
        await run
    }

    return {
        setFace(frame: number) {
            base = frame
            figure?.setFrame(frame)
        },

        say(text: string) {
            return speak(text, C.paper, C.ink)
        },

        note(text: string) {
            return speak(text, C.amber, C.amberDeep)
        },

        /**
         * Onde a peça pousa quando é entregue.
         *
         * AO LADO do cliente, e não em cima dele: na primeira montagem o cartaz
         * parava na altura do peito e tapava a pessoa inteira — e a comemoração,
         * que é a recompensa da fase, acontecia atrás do cartaz.
         */
        point() {
            return { x: CLIENT.cx + 205, y: CLIENT.feetY - 150 }
        },

        headPoint() {
            return { x: CLIENT.cx, y: CLIENT.feetY - 240 }
        },

        async cheer() {
            figure?.setFrame(base + HAPPY_OFFSET)
            void FX.sparks(scene, CLIENT.cx, CLIENT.feetY - 150, {
                color: C.green,
                count: 20,
                spread: 170,
                depth: DEPTH.client + 1,
            })
            await FX.to(scene, figureRoot, { y: CLIENT.feetY - 26 }, { duration: 230, ease: 'Sine.easeOut' })
            await FX.to(scene, figureRoot, { y: CLIENT.feetY }, { duration: 320, ease: 'Bounce.easeOut' })
        },

        async shrug() {
            await FX.shake(scene, figureRoot, { amount: 7, times: 2 })
        },

        destroy() {
            typing?.skip()
            FX.kill(scene, balloonRoot)
            FX.kill(scene, figureRoot)
            balloonRoot.destroy(true)
            root.destroy(true)
        },
    }
}

export type Client = ReturnType<typeof createClient>
