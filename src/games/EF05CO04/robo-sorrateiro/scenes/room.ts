import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, DOOR, H, PATH, PROP, ROOM, W, stepX } from '../data/layout'
import { C } from '../data/theme'
import { PROP_FRAME, TEX } from './BootScene'

export interface Point {
    x: number
    y: number
}

export interface Room {
    /** Quantos passos tem cada trecho, na ordem. Refaz o chão inteiro. */
    build(legs: number[]): void
    stepPoint(leg: number, step: number): Point
    /** Onde o robô para para a criança escolher. Não há placa: é só o lugar. */
    signPoint(leg: number): Point
    doorPoint(): Point
    entryPoint(): Point
    drawPath(): Promise<void>
    /**
     * Guarda o robô no móvel mais perto de x, trocando a peça pela versão
     * COM ele dentro. Sem x, todos voltam ao normal.
     */
    tuck(x?: number): void
    knockDoor(): Promise<void>
    destroy(): void
}

/*
 * OS TRÊS ESCONDERIJOS, E O ROBÔ DENTRO DELES.
 *
 * A folha de móveis com robô tem os mesmos três móveis com ele espiando de
 * dentro, na mesma ordem. Esconder deixou de ser o robô atrás da peça — é a
 * peça inteira que troca de desenho. Assim o vaso de planta volta a servir: no
 * quadro dele o robô aparece ao lado, e não engolido.
 */
const PROPS = [PROP_FRAME.box, PROP_FRAME.basket, PROP_FRAME.plant]

export function createRoom(scene: Phaser.Scene): Room {
    let spans: number[] = []
    let total = 0
    const firstOf: number[] = []

    if (scene.textures.exists(TEX.bg)) {
        scene.add.image(0, 0, TEX.bg).setOrigin(0, 0).setDisplaySize(W, H).setDepth(DEPTH.bg)
    } else {
        const floor = scene.add.graphics().setDepth(DEPTH.bg)
        floor.fillStyle(C.night, 1)
        floor.fillRect(0, 0, W, H)
        floor.fillStyle(C.wood, 1)
        floor.fillRect(0, ROOM.top + 120, W, ROOM.bottom - ROOM.top)
        floor.fillStyle(C.rug, 1)
        floor.fillRoundedRect(180, 360, 920, 220, 30)
    }

    const path = scene.add.graphics().setDepth(DEPTH.path)
    const props: Array<{ sprite: Phaser.GameObjects.Sprite; kind: number }> = []

    const door = scene.textures.exists(TEX.prop)
        ? scene.add.sprite(DOOR.x, DOOR.y, TEX.prop, PROP_FRAME.door).setDepth(DEPTH.prop)
        : undefined
    if (door) door.setDisplaySize(DOOR.h * (200 / 240), DOOR.h)

    const doorGlow = scene.add.graphics().setDepth(DEPTH.glow).setAlpha(0)
    doorGlow.fillStyle(C.lamp, 0.4)
    doorGlow.fillEllipse(DOOR.x, DOOR.y + DOOR.h / 2, 190, 70)

    const point = (leg: number, step: number): Point =>
        ({ x: stepX(firstOf[leg] + step, total), y: PATH.y })

    const signAt = (leg: number): Point => {
        const span = (PATH.endX - PATH.startX) / Math.max(1, total)
        return { x: stepX(firstOf[leg], total) - span * 0.62, y: PATH.y }
    }

    return {
        build: legs => {
            spans = legs.slice()
            total = legs.reduce((sum, n) => sum + n, 0)
            firstOf.length = 0
            let running = 0
            legs.forEach(n => { firstOf.push(running); running += n })

            props.splice(0).forEach(p => p.sprite.destroy())

            // Um móvel em CADA lugar onde o robô para — inclusive na largada,
            // que é onde ele começa o trecho. Sem isso a regra manda esconder e
            // ele se agacha no meio do chão, sem nada na frente.
            const spots = [
                ...legs.map((_, leg) => signAt(leg).x),
                ...Array.from({ length: total }, (_, i) => stepX(i, total)),
            ]

            if (scene.textures.exists(TEX.prop)) {
                spots.forEach((x, i) => {
                    const kind = PROPS[i % PROPS.length]
                    const sprite = scene.add
                        .sprite(x, PATH.y + PROP.dy, TEX.prop, kind)
                        .setDepth(DEPTH.prop)
                    sprite.setDisplaySize(PROP.h, PROP.h)
                    sprite.setOrigin(0.5, 0.72)
                    props.push({ sprite, kind })
                })
            }
        },

        stepPoint: point,
        signPoint: signAt,
        doorPoint: () => ({ x: DOOR.x - 132, y: PATH.y }),
        entryPoint: () => ({ x: PATH.startX - 120, y: PATH.y }),

        /*
         * O CHÃO DIZ O CAMINHO, E SÓ.
         *
         * Pontinhos até a porta e um anel em cada parada. A placa "SE?" saiu:
         * era um cartaz laranja no meio da sala, sem nada explicando o que
         * era — e a criança já para sozinha quando as cartas sobem.
         */
        drawPath: async () => {
            path.clear()
            const from = PATH.startX - 120
            const to = DOOR.x - 60
            const dots = Math.floor((to - from) / 26)

            for (let i = 0; i <= dots; i++) {
                path.fillStyle(C.path, 0.75)
                path.fillCircle(from + i * 26, PATH.y + 34, 5)
            }
            for (let i = 0; i < total; i++) {
                path.lineStyle(4, C.path, 0.65)
                path.strokeCircle(stepX(i, total), PATH.y + 34, 15)
            }
            spans.forEach((_, leg) => {
                path.fillStyle(C.sign, 0.9)
                path.fillCircle(signAt(leg).x, PATH.y + 34, 10)
            })

            path.setAlpha(0)
            await FX.to(scene, path, { alpha: 1 }, { duration: 420 })
        },

        tuck: x => {
            if (!scene.textures.exists(TEX.propHidden)) return
            props.forEach(p => p.sprite.setTexture(TEX.prop, p.kind))
            if (x === undefined || !props.length) return

            const near = props.reduce((best, p) =>
                Math.abs(p.sprite.x - x) < Math.abs(best.sprite.x - x) ? p : best)
            near.sprite.setTexture(TEX.propHidden, near.kind)
            near.sprite.setDisplaySize(PROP.h, PROP.h)
            FX.kill(scene, near.sprite)
            void FX.to(scene, near.sprite,
                { y: PATH.y + PROP.dy - 8 },
                { duration: 180, yoyo: true, ease: 'Sine.easeInOut' })
        },

        knockDoor: async () => {
            if (!door) return
            void FX.to(scene, doorGlow, { alpha: 1 }, { duration: 300, yoyo: true, repeat: 1 })
            await FX.to(scene, door, { scaleY: door.scaleY * 1.04 }, { duration: 260, yoyo: true, repeat: 1 })
        },

        destroy: () => {
            props.splice(0).forEach(p => p.sprite.destroy())
            door?.destroy()
            doorGlow.destroy()
            path.destroy()
        },
    }
}
