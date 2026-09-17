import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KEY, TRAIN_BOX, fitArt } from '../data/art'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { RiderView } from './rider'

export interface Trip {
    rider: RiderView
    /** as estações por onde o trem passa, na ordem */
    path: string[]
    ok: boolean
}

export interface RunnerOptions {
    where: (id: string) => { x: number; y: number }
    onLit: (a: string, b: string, on: boolean) => void
    onStep: () => void
}

const SEGMENT = 620

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O TERCEIRO ATO: A PARTIDA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Um trem de cada vez, com a câmera atrás dele. Nada aqui julga — o veredito
 * chega pronto em `Trip.ok`; este módulo só MOSTRA: o trem percorre os trilhos
 * que existem, acende cada um por onde passa, e para onde a rede acabar.
 *
 * Em paralelo era mais rápido e não se via nada: três trens minúsculos em
 * cantos diferentes de um mapa que não cabe na tela.
 */
export function createRunner(scene: Phaser.Scene, options: RunnerOptions) {
    let current: Phaser.GameObjects.Container | null = null

    return {
        /** Onde o passageiro embarca: a cabeça do trem, parada na origem. */
        boardingPoint(trip: Trip) {
            const start = options.where(trip.path[0])
            return { x: start.x + 70, y: start.y + 40 }
        },

        async drive(trip: Trip) {
            const train = createTrain(scene)
            current = train

            const points = trip.path.map(options.where)
            train.setPosition(points[0].x + 70, points[0].y + 40)
            train.setScale(0.2)

            const camera = scene.cameras.main
            camera.startFollow(train, false, 0.09, 0.09)

            await FX.to(scene, train, { scale: 1 }, { duration: 260, ease: 'Back.out' })

            for (let i = 1; i < points.length; i++) {
                const from = points[i - 1]
                const to = points[i]
                const angle = Phaser.Math.Angle.Between(from.x, from.y, to.x, to.y)

                train.setRotation(angle)
                train.setScale(1, Math.cos(angle) < 0 ? -1 : 1)
                options.onLit(trip.path[i - 1], trip.path[i], true)
                options.onStep()

                puff(scene, train)
                await FX.to(scene, train, { x: to.x, y: to.y }, { duration: SEGMENT, ease: 'Sine.inOut' })
                trip.rider.spendDot()
            }

            if (points.length === 1) await FX.shake(scene, train, { amount: 6 })

            camera.stopFollow()
            await FX.to(scene, train, { scale: 0 }, { duration: 220 })
            train.destroy(true)
            current = null
        },

        destroy() {
            scene.cameras.main.stopFollow()
            if (current) {
                FX.kill(scene, current)
                current.destroy(true)
                current = null
            }
        },
    }
}

/** Fumacinha: o detalhe que faz o trem parecer andar, e não deslizar. */
function puff(scene: Phaser.Scene, train: Phaser.GameObjects.Container) {
    for (let i = 0; i < 3; i++) {
        const smoke = scene.add.graphics().setDepth(DEPTH.train - 1)
        smoke.fillStyle(C.white, 0.55)
        smoke.fillCircle(0, 0, 16 + i * 4)
        smoke.setPosition(train.x - 30, train.y - 46)
        void FX.to(
            scene,
            smoke,
            { y: smoke.y - 70 - i * 10, alpha: 0, scale: 1.8 },
            { duration: 900 + i * 120, delay: i * 140 },
        ).then(() => smoke.destroy())
    }
}

/** O trenzinho. Sem `trem.png`, ele sai em `Graphics` e o jogo não muda. */
function createTrain(scene: Phaser.Scene) {
    const train = scene.add.container(0, 0).setDepth(DEPTH.train)

    if (scene.textures.exists(KEY.train)) {
        const art = scene.add.image(0, 0, KEY.train)
        const fit = fitArt(TRAIN_BOX, { frameWidth: art.width, frameHeight: art.height }, { h: 100, w: 210 })
        art.setOrigin(fit.originX, fit.originY - 0.09)
        art.setScale(fit.scale)
        train.add(art)
        return train
    }

    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-88, -50, 176, 92, 22)
    g.fillStyle(C.red, 1)
    g.fillRoundedRect(-80, -42, 160, 76, 18)
    g.fillStyle(C.white, 0.92)
    g.fillCircle(30, -8, 19)
    g.fillCircle(-16, -8, 19)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-68, -74, 38, 34, 9)
    g.fillCircle(-46, 42, 21)
    g.fillCircle(38, 42, 21)
    g.fillStyle(C.railLight, 1)
    g.fillCircle(-46, 42, 9)
    g.fillCircle(38, 42, 9)
    train.add(g)
    return train
}

export type Runner = ReturnType<typeof createRunner>
