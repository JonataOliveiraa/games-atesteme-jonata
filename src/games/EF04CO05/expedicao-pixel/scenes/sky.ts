import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PROPS, SHEET } from '../data/art'
import { DEPTH, SKY } from '../data/layout'
import { C } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O CÉU — ONDE A RESPOSTA APARECE DO TAMANHO DA PRAÇA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O estouro é **sempre `Graphics`**, nunca textura: a cor dele é a resposta que
 * a criança acabou de codificar, e tem de nascer da mesma função que pinta o
 * foguete e a placa. Um PNG de explosão colorida seria uma segunda fonte de cor
 * — e no dia em que as duas discordassem, o jogo estaria mentindo.
 *
 * O céu mostra só o estouro, sem a cor pedida ao lado: a comparação é da placa,
 * que volta logo depois com PEDIDO e SUA LUZ lado a lado.
 *
 * ── O LANÇAMENTO É UMA CENA, NÃO UM EFEITO ──────────────────────────────
 *
 * Enquanto o foguete sobe, a interface inteira sai de cena e a câmera fecha um
 * pouco. É o único momento do jogo em que não há nada para decidir: deixar a
 * mesa, a placa e o cabeçalho na tela nessa hora divide a atenção justamente
 * quando ela deveria estar toda em cima do que a criança acabou de fabricar.
 */

/**
 * A inclinação que o foguete já tem no PNG: bico para cima e para a direita.
 * É o que se desconta da tangente para ele apontar para onde está indo.
 */
const ART_NOSE = Math.PI / 4

export function createSky(scene: Phaser.Scene) {
    const junk: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        junk.push(o)
        return o
    }

    /** Os fogos que já acertaram, pendurados no varal. É o placar — sem número. */
    const stars: Phaser.GameObjects.Graphics[] = []

    /*
     * O varal e os ganchos vazios, desenhados uma vez.
     *
     * Os lugares aparecem ANTES de serem preenchidos: a criança vê quantos fogos
     * o nível tem antes de soltar o primeiro.
     */
    const rack = scene.add.graphics().setDepth(DEPTH.star - 1)
    const firstX = SKY.rack.x[0]
    const lastX = SKY.rack.x[SKY.rack.x.length - 1]
    rack.lineStyle(3, C.brass, 0.75)
    rack.beginPath()
    rack.moveTo(firstX - 34, SKY.rack.lineY)
    rack.lineTo(lastX + 34, SKY.rack.lineY + 5)
    rack.strokePath()
    SKY.rack.x.forEach(x => {
        rack.lineStyle(3, C.brass, 0.6)
        rack.beginPath()
        rack.moveTo(x, SKY.rack.lineY + 2)
        rack.lineTo(x, SKY.rack.y - SKY.rack.r)
        rack.strokePath()
        rack.fillStyle(C.ink, 0.45)
        rack.fillCircle(x, SKY.rack.y, SKY.rack.r)
        rack.lineStyle(3, C.brass, 0.5)
        rack.strokeCircle(x, SKY.rack.y, SKY.rack.r)
    })

    /** Fumaça: bolinhas cinza que incham e somem. Vai ficando para trás. */
    const puff = (x: number, y: number) => {
        const smoke = keep(
            scene.add
                .circle(x + Phaser.Math.Between(-6, 6), y, Phaser.Math.Between(7, 13), 0xb9c2d0, 0.3)
                .setDepth(DEPTH.rocket - 2),
        )
        void FX.to(
            scene,
            smoke,
            { scale: 2.4, alpha: 0, y: smoke.y + Phaser.Math.Between(6, 22) },
            { duration: Phaser.Math.Between(700, 1100), ease: 'Sine.easeOut' },
        ).then(() => smoke.destroy())
    }

    /** As faíscas que caem depois do estouro: sobem em leque e desabam. */
    const rain = (color: number, x: number, y: number, count: number) => {
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.2, 0.2)
            const reach = Phaser.Math.Between(70, SKY.burstR)
            const spark = keep(
                scene.add
                    .circle(x, y, Phaser.Math.Between(3, 6), color, 1)
                    .setDepth(DEPTH.burst + 1)
                    .setBlendMode(Phaser.BlendModes.ADD),
            )
            const tx = x + Math.cos(a) * reach
            const ty = y + Math.sin(a) * reach
            void FX.to(scene, spark, { x: tx, y: ty }, { duration: 460, ease: 'Quad.easeOut' }).then(() =>
                FX.to(
                    scene,
                    spark,
                    { y: ty + Phaser.Math.Between(90, 190), alpha: 0, scale: 0.4 },
                    { duration: Phaser.Math.Between(700, 1100), ease: 'Quad.easeIn' },
                ).then(() => spark.destroy()),
            )
        }
    }

    /**
     * A explosão: clarão, coroa de pétalas, anel de sopro e chuva de faíscas.
     * Tudo somado em luz, na cor que a criança montou.
     */
    async function burst(color: number, x: number, y: number, radius: number) {
        scene.cameras.main.shake(260, 0.004)

        // o clarão: branco, rápido, e é o que dá o "baque" do estouro
        const flash = keep(
            scene.add
                .circle(x, y, radius * 0.5, 0xffffff, 0.9)
                .setDepth(DEPTH.burst + 2)
                .setBlendMode(Phaser.BlendModes.ADD),
        )
        void FX.to(scene, flash, { scale: 1.7, alpha: 0 }, { duration: 260, ease: 'Quad.easeOut' }).then(() =>
            flash.destroy(),
        )

        // o anel de sopro, que abre e some antes das pétalas
        const ring = keep(
            scene.add.graphics({ x, y }).setDepth(DEPTH.burst).setBlendMode(Phaser.BlendModes.ADD),
        )
        ring.lineStyle(6, color, 0.7)
        ring.strokeCircle(0, 0, radius * 0.4)
        ring.setScale(0.2)
        void FX.to(scene, ring, { scale: 2.6, alpha: 0 }, { duration: 620, ease: 'Cubic.easeOut' }).then(() =>
            ring.destroy(),
        )

        rain(color, x, y, 26)

        const petals = keep(scene.add.graphics({ x, y }).setDepth(DEPTH.burst))
        petals.setBlendMode(Phaser.BlendModes.ADD)
        const arms = 20

        const draw = (t: number) => {
            petals.clear()
            const len = radius * t
            petals.fillStyle(color, 0.22 * (1 - t))
            petals.fillCircle(0, 0, len * 0.9)

            // coroa de fora
            petals.lineStyle(9, color, 1 - t * 0.85)
            for (let i = 0; i < arms; i++) {
                const a = (i / arms) * Math.PI * 2
                petals.beginPath()
                petals.moveTo(Math.cos(a) * len * 0.18, Math.sin(a) * len * 0.18)
                petals.lineTo(Math.cos(a) * len, Math.sin(a) * len)
                petals.strokePath()
                petals.fillStyle(color, 1 - t * 0.7)
                petals.fillCircle(Math.cos(a) * len, Math.sin(a) * len, 9 * (1 - t * 0.5))
            }

            // coroa de dentro, meio passo fora de fase: é ela que dá volume
            petals.lineStyle(5, C.white, (1 - t) * 0.5)
            for (let i = 0; i < arms; i++) {
                const a = ((i + 0.5) / arms) * Math.PI * 2
                petals.beginPath()
                petals.moveTo(0, 0)
                petals.lineTo(Math.cos(a) * len * 0.55, Math.sin(a) * len * 0.55)
                petals.strokePath()
            }
        }

        const state = { t: 0.04 }
        draw(state.t)
        await new Promise<void>(resolve => {
            scene.tweens.add({
                targets: state,
                t: 1,
                duration: 950,
                ease: 'Cubic.easeOut',
                onUpdate: () => draw(state.t),
                onComplete: () => resolve(),
            })
        })
        petals.destroy()
    }

    return {
        /**
         * O voo e o estouro.
         *
         * O foguete sobe grande, com fumaça e um facho da cor da mistura — a cor
         * já está no ar antes de estourar. A câmera fecha um pouco enquanto ele
         * sobe e volta depois, que é o que dá a sensação de "olha lá em cima".
         */
        async launch(color: number, fromX: number, fromY: number) {
            const camera = scene.cameras.main
            camera.zoomTo(1.06, 700, 'Sine.easeOut')

            const glow = keep(
                scene.add
                    .circle(fromX, fromY, 46, color, 0.55)
                    .setDepth(DEPTH.rocket - 1)
                    .setBlendMode(Phaser.BlendModes.ADD),
            )

            const flying = scene.textures.exists(SHEET.props)
                ? keep(
                      scene.add
                          .image(fromX, fromY, SHEET.props, PROPS.rocketFlying)
                          .setDisplaySize(150, 150)
                          .setDepth(DEPTH.rocket),
                  )
                : keep(scene.add.circle(fromX, fromY, 18, C.bulb).setDepth(DEPTH.rocket))

            /*
             * A CURVA SAI PARA CIMA E PARA A DIREITA ANTES DE VIRAR.
             *
             * O foguete está numa rampa inclinada para a direita: um arco que já
             * começa indo para a esquerda faz a peça sair andando de lado no
             * primeiro quadro. O ponto de controle à direita da rampa dá a ela a
             * mesma direção de saída que o desenho promete.
             */
            const curve = new Phaser.Curves.QuadraticBezier(
                new Phaser.Math.Vector2(fromX, fromY),
                new Phaser.Math.Vector2(fromX + 60, fromY - 340),
                new Phaser.Math.Vector2(SKY.burstX, SKY.burstY),
            )

            const state = { t: 0 }
            let lastPuff = 0
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: state,
                    t: 1,
                    duration: 900,
                    ease: 'Sine.easeOut',
                    onUpdate: () => {
                        const p = curve.getPoint(state.t)
                        flying.setPosition(p.x, p.y)
                        glow.setPosition(p.x, p.y)
                        glow.setScale(1 - state.t * 0.35)

                        /*
                         * O BICO SEGUE A TANGENTE DA CURVA.
                         *
                         * O desenho entregue já vem inclinado, com o bico para
                         * cima e para a direita — uns 45°. Girar pela tangente
                         * SEM descontar essa inclinação deixaria o foguete
                         * voando de lado o tempo todo.
                         */
                        const dir = curve.getTangent(state.t)
                        flying.setRotation(Math.atan2(dir.y, dir.x) + ART_NOSE)

                        if (state.t > 0.05) {
                            const spark = keep(
                                scene.add
                                    .circle(p.x, p.y + 10, Phaser.Math.Between(3, 8), color, 0.95)
                                    .setDepth(DEPTH.rocket - 1)
                                    .setBlendMode(Phaser.BlendModes.ADD),
                            )
                            void FX.to(
                                scene,
                                spark,
                                { alpha: 0, scale: 0.25, y: spark.y + Phaser.Math.Between(4, 16) },
                                { duration: 520 },
                            ).then(() => spark.destroy())

                            // a fumaça é mais rala que as faíscas, senão vira nuvem
                            if (state.t - lastPuff > 0.09) {
                                lastPuff = state.t
                                puff(p.x, p.y + 16)
                            }
                        }
                    },
                    onComplete: () => resolve(),
                })
            })
            flying.destroy()
            void FX.to(scene, glow, { scale: 0, alpha: 0 }, { duration: 160 }).then(() => glow.destroy())

            await burst(color, SKY.burstX, SKY.burstY, SKY.burstR)
            camera.zoomTo(1, 520, 'Sine.easeInOut')
        },

/**
         * O fogo que acertou é GUARDADO: ele encolhe, atravessa o céu e fica
         * pendurado no varal, na cor exata que a criança fabricou.
         */
        async store(index: number, color: number) {
            const slot = SKY.rack.x[index] ?? lastX
            const star = scene.add.graphics({ x: SKY.burstX, y: SKY.burstY }).setDepth(DEPTH.star)
            star.setBlendMode(Phaser.BlendModes.ADD)
            star.fillStyle(color, 0.3)
            star.fillCircle(0, 0, SKY.rack.r * 2.1)
            star.fillStyle(color, 1)
            star.fillCircle(0, 0, SKY.rack.r * 0.95)
            star.fillStyle(0xffffff, 0.35)
            star.fillCircle(-SKY.rack.r * 0.28, -SKY.rack.r * 0.3, SKY.rack.r * 0.34)
            stars.push(star)
            await FX.to(scene, star, { x: slot, y: SKY.rack.y }, { duration: 680, ease: 'Cubic.easeInOut' })
            await FX.to(scene, star, { scale: 1.2 }, { duration: 150, yoyo: true })
        },

        async twinkle() {
            await FX.all(
                ...stars.map(star =>
                    FX.to(scene, star, { scale: 1.25 }, { duration: 320, yoyo: true, repeat: 1 }),
                ),
            )
        },

        destroy() {
            // no shutdown o gerenciador de câmeras já foi embora: sem o `?.` o
            // destroy explode e leva junto a limpeza de todo o resto
            scene.cameras?.main?.setZoom(1)
            junk.forEach(o => {
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
            junk.length = 0
            stars.forEach(s => {
                scene.tweens.killTweensOf(s)
                s.destroy()
            })
            stars.length = 0
            rack.destroy()
        },
    }
}

export type Sky = ReturnType<typeof createSky>
