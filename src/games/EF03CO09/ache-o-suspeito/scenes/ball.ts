import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALL_BOX, BALL_FRAME, BALL_SHEET, fitInside, originOf, SHEET } from '../data/art'
import { DEPTH, GROUND, LAUNCH } from '../data/layout'
import { C } from '../data/theme'
import { arcAt, flightOf, liftOf, type Point } from './arc'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A BOLINHA DE PAPEL
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Ela agora VIVE na bandeja, em vez de nascer a cada tiro: é ela que a criança
 * puxa para trás, e uma bolinha que só aparecesse depois do gesto não teria o
 * que ser puxado.
 *
 * O voo usa a curva de `arc.ts`, a mesma da linha pontilhada da mira.
 */

const SIZE = 66

/** Devolve o índice da placa que ocupa o ponto, ou `null` se for parede. */
export type Probe = (x: number, y: number) => number | null

/**
 * A que distância da mira a bolinha começa a bater nas coisas.
 *
 * O teto é geométrico e vale a pena escrever: com as placas a 300 px uma da
 * outra e 133 px de meia-largura, a BORDA da vizinha fica a 167 px do centro do
 * alvo. Com `REACH` em 170 a bolinha encostava nela de raspão e a criança
 * perdia uma vida por um tiro certeiro. O piso é a deriva de ~26 px que a placa
 * acumula durante o voo, que precisa continuar cabendo aqui dentro.
 */
const REACH = 120

export function createBall(scene: Phaser.Scene) {
    const trail = scene.add.graphics().setDepth(DEPTH.trail)
    let sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null = null
    let scaleBase = 1

    const make = () => {
        if (!scene.textures.exists(SHEET.ball)) {
            const g = scene.add.graphics().setDepth(DEPTH.ball)
            g.fillStyle(C.ink, 1)
            g.fillCircle(0, 0, SIZE / 2 + 3)
            g.fillStyle(C.paper, 1)
            g.fillCircle(0, 0, SIZE / 2)
            g.fillStyle(C.paperDeep, 1)
            g.fillCircle(-7, 6, SIZE / 5)
            scaleBase = 1
            return g
        }
        const box = BALL_BOX[BALL_FRAME.appearing]
        const image = scene.add.image(0, 0, SHEET.ball, BALL_FRAME.appearing).setDepth(DEPTH.ball)
        const origin = originOf(box, BALL_SHEET.frameWidth, BALL_SHEET.frameHeight)
        image.setOrigin(origin.x, origin.y)
        scaleBase = fitInside(box, SIZE, SIZE)
        return image
    }

    const ensure = () => {
        if (sprite?.active) return sprite
        sprite = make()
        return sprite
    }

    const drop = () => {
        if (!sprite) return
        scene.tweens.killTweensOf(sprite)
        sprite.destroy()
        sprite = null
        trail.clear()
        trail.setAlpha(1)
    }

    const setFrame = (frame: number) => {
        if (sprite instanceof Phaser.GameObjects.Image) sprite.setFrame(frame)
    }

    const paintTrail = (dots: Point[]) => {
        trail.clear()
        dots.forEach((dot, i) => {
            const k = i / dots.length
            trail.fillStyle(C.cyan, 0.3 * k)
            trail.fillCircle(dot.x, dot.y, 4 + 9 * k)
        })
    }

    const travel = (
        from: Point,
        to: Point,
        lift: number,
        duration: number,
        spin: number,
        probe?: Probe,
    ) => {
        const ball = ensure()
        const dots: Point[] = []
        const step = { v: 0 }
        const at = arcAt(from, to, lift)
        return new Promise<number | null>(resolve => {
            let struck: number | null = null
            const tween = scene.tweens.add({
                targets: step,
                v: 1,
                duration: FX.ms(scene, duration),
                ease: 'Sine.easeIn',
                onUpdate: () => {
                    if (!ball.active) return
                    const p = at(step.v)
                    ball.setPosition(p.x, p.y).setAngle(step.v * spin)
                    setFrame(Math.floor(step.v * 8) % 2 ? BALL_FRAME.flyB : BALL_FRAME.flyA)
                    dots.push(p)
                    if (dots.length > 14) dots.shift()
                    paintTrail(dots)

                    /*
                     * A COLISÃO É PERGUNTADA QUADRO A QUADRO, MAS SÓ PERTO DO FIM.
                     *
                     * Quadro a quadro porque é o que faz placa em movimento
                     * valer alguma coisa: a bolinha bate em quem estiver ali no
                     * instante em que ela passa, não em quem estava na largada.
                     *
                     * Só perto do fim por geometria. A bandeja fica no centro
                     * de baixo e as placas se espalham acima, então TODA
                     * trajetória para uma placa lateral cruza a região da placa
                     * central — medido: indo para a da esquerda, a bolinha passa
                     * por (517, 363), que é dentro da do meio. Colidindo ao
                     * longo de todo o caminho, mirar na ponta acertava o meio, e
                     * a criança perdia uma vida tendo lido e mirado certo.
                     *
                     * `REACH` é generoso o bastante para a placa que derivou
                     * durante o voo ainda ser atingida, e curto o bastante para
                     * não alcançar a vizinha, que fica a 300 px.
                     */
                    if (probe && struck === null && Math.hypot(p.x - to.x, p.y - to.y) < REACH) {
                        const found = probe(p.x, p.y)
                        if (found !== null) {
                            struck = found
                            tween.stop()
                            resolve(struck)
                        }
                    }
                },
                onComplete: () => {
                    if (struck === null) resolve(null)
                },
            })
        })
    }

    const fadeTrail = () =>
        FX.to(scene, trail as unknown as Phaser.GameObjects.Container, { alpha: 0 }, { duration: 220 }).then(() => {
            trail.clear()
            trail.setAlpha(1)
        })

    return {
        /** Devolve a bolinha à bandeja, pronta para a próxima puxada. */
        async rest(animated = true) {
            const ball = ensure()
            scene.tweens.killTweensOf(ball)
            ball.setPosition(LAUNCH.x, LAUNCH.y).setAngle(0).setAlpha(1)
            setFrame(BALL_FRAME.appearing)
            trail.clear()
            trail.setAlpha(1)
            if (!animated) {
                ball.setScale(scaleBase)
                return
            }
            ball.setScale(0)
            await FX.to(scene, ball, { scale: scaleBase }, { duration: 220, ease: 'Back.easeOut' })
        },

        /**
         * Agacha antes de sair, como quem toma impulso.
         *
         * É o único anúncio de que o botão foi lido, e ele é curto de propósito:
         * quem apertou JOGAR quer ver a bolinha voar, não uma espera.
         */
        async wind() {
            const ball = ensure()
            scene.tweens.killTweensOf(ball)
            await FX.to(
                scene,
                ball,
                { scaleX: scaleBase * 1.18, scaleY: scaleBase * 0.8, y: LAUNCH.y + 10 },
                { duration: 110 },
            )
        },

        /**
         * Voa até a mira, batendo no que encontrar no caminho.
         *
         * Devolve o índice da placa atingida, ou `null` se atravessou o vazio.
         */
        async throwAt(to: Point, probe: Probe, power = 0.7) {
            const ball = ensure()
            scene.tweens.killTweensOf(ball)
            ball.setScale(scaleBase)
            // parte da BANDEJA: a linha pontilhada foi desenhada a partir dali,
            // e um voo que saísse de outro ponto passaria ao lado dela
            const struck = await travel(
                { x: LAUNCH.x, y: LAUNCH.y },
                to,
                liftOf(power),
                flightOf(power),
                300 + power * 240,
                probe,
            )
            if (!ball.active) return struck
            if (struck === null) return null
            setFrame(BALL_FRAME.impact)
            void fadeTrail()
            await FX.to(
                scene,
                ball,
                { scaleX: scaleBase * 1.2, scaleY: scaleBase * 0.78 },
                { duration: 90, yoyo: true },
            )
            return struck
        },

        /**
         * O arremesso que passou pelo vazio.
         *
         * Não é resposta errada: a bolinha perde a força, cai e volta para a
         * bandeja. O custo é o segundo que ela leva para voltar, e mais nada —
         * pontaria não é a habilidade que este jogo avalia.
         */
        async fallShort() {
            const ball = sprite
            if (!ball?.active) return
            void fadeTrail()
            const landX = Phaser.Math.Clamp(ball.x + (ball.x - LAUNCH.x) * 0.3, 90, 1190)
            await FX.arcTo(scene, ball, { x: landX, y: GROUND.y + 96 }, { height: 34, duration: 520 })
            if (!ball.active) return
            await FX.to(scene, ball, { scaleX: scaleBase * 1.2, scaleY: scaleBase * 0.74 }, { duration: 80, yoyo: true })
            await FX.to(scene, ball, { alpha: 0, scale: scaleBase * 0.7 }, { duration: 200 })
        },

        /** Bateu na placa segura: perde a força e cai. */
        async bounceOff() {
            const ball = sprite
            if (!ball?.active) return
            void fadeTrail()
            await FX.all(
                FX.arcTo(scene, ball, { x: ball.x - 70, y: GROUND.y + 40 }, { height: 70, duration: 500 }),
                FX.to(scene, ball, { angle: ball.angle + 200 }, { duration: 500 }),
            )
            await FX.to(scene, ball, { alpha: 0 }, { duration: 160 })
        },

        /** Acertou a suspeita: some no impacto, porque a placa já está caindo. */
        async vanish() {
            const ball = sprite
            if (!ball?.active) return
            void fadeTrail()
            await FX.to(scene, ball, { alpha: 0, scale: scaleBase * 1.5 }, { duration: 200 })
        },

        hide() {
            drop()
        },

        destroy() {
            drop()
            scene.tweens.killTweensOf(trail)
            trail.destroy()
        },
    }
}

export type Ball = ReturnType<typeof createBall>
