import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { AIM, DEPTH, FIRE, LAUNCH, NEXT, PREV } from '../data/layout'
import { C } from '../data/theme'
import { arcAt, liftOf, type Point } from './arc'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  MIRAR E ARREMESSAR
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `<` e `>`, juntas à esquerda, movem um retículo pela parede. O botão redondo
 * da direita arremessa. A linha pontilhada mostra por onde a bolinha vai
 * passar, e ela para exatamente onde a mira está.
 *
 * ── É MIRA, NÃO SELEÇÃO ──────────────────────────────────────────────────
 *
 * A versão anterior escolhia uma PLACA e travava o tiro nela. Funcionava com
 * tudo parado, mas o dia em que as placas começarem a andar essa trava faria o
 * movimento virar enfeite: a bolinha perseguiria a peça e o acerto não teria
 * nada a ver com o instante do arremesso.
 *
 * Aqui a criança aponta para um LUGAR. Quem decide o resultado é o que estiver
 * naquele caminho quando a bolinha passar — que é o que faz placa em
 * movimento valer alguma coisa.
 *
 * ── O RETÍCULO AVISA QUANDO ESTÁ EM CIMA DE ALGO ─────────────────────────
 *
 * Sobre uma placa ele fica ciano e fechado; no vazio, cinza e aberto. Sem esse
 * aviso a mira viraria adivinhação, e a criança pagaria pela pontaria em vez
 * de responder o que o jogo pergunta. Mesmo assim, errar o alvo nunca é
 * resposta errada — quem cuida disso é a cena.
 *
 * ── SEGURAR ANDA SOZINHO ─────────────────────────────────────────────────
 *
 * Um toque anda um passo; segurar passa a deslizar. Atravessar a tela com
 * trinta toquinhos cansa antes de ensinar qualquer coisa.
 */

const POWER = 0.62
const DOTS = 22

export interface ControlOptions {
    /** Índice da placa que ocupa este ponto, ou `null` se for parede vazia. */
    probe: (x: number, y: number) => number | null
    onAim: (index: number | null) => void
    onFire: (at: Point) => void
}

export function createControls(scene: Phaser.Scene, options: ControlOptions) {
    const path = scene.add.graphics().setDepth(DEPTH.aim)
    const sight = scene.add.graphics().setDepth(DEPTH.aim + 1)
    const tray = scene.add.graphics().setDepth(DEPTH.board + 1)
    const bar = scene.add.container(0, 0).setDepth(DEPTH.controls)

    let enabled = false
    /**
     * A mira é DESENHADA fora das horas em que responde ao toque.
     *
     * O passo do tutorial que fala dela apaga os botões — e apagar a mira junto
     * deixaria a criança lendo "as setas movem a mira" com a tela sem mira
     * nenhuma. Some mesmo é durante o voo, quando quem importa é a bolinha.
     */
    let sightOn = false
    let x = (AIM.minX + AIM.maxX) / 2
    let over: number | null = null
    let held: -1 | 1 | null = null
    let heldSince = 0

    const paintTray = () => {
        tray.clear()
        tray.fillStyle(C.ink, 0.2)
        tray.fillEllipse(LAUNCH.x + 5, LAUNCH.y + 36, 184, 38)
        tray.fillStyle(C.amberDeep, 1)
        tray.fillRoundedRect(LAUNCH.x - 84, LAUNCH.y + 4, 168, 40, 18)
        tray.fillStyle(C.wood, 1)
        tray.fillRoundedRect(LAUNCH.x - 84, LAUNCH.y + 4, 168, 32, 16)
        tray.fillStyle(C.ink, 0.14)
        tray.fillEllipse(LAUNCH.x, LAUNCH.y + 12, 132, 21)
        tray.fillStyle(C.paperDeep, 1)
        tray.fillEllipse(LAUNCH.x - 42, LAUNCH.y + 10, 50, 19)
        tray.fillEllipse(LAUNCH.x + 44, LAUNCH.y + 13, 44, 17)
        tray.fillStyle(C.paper, 1)
        tray.fillEllipse(LAUNCH.x - 44, LAUNCH.y + 7, 40, 13)
    }

    const paintArrow = (g: Phaser.GameObjects.Graphics, dir: -1 | 1, on: boolean) => {
        const r = PREV.r
        g.clear()
        g.fillStyle(C.ink, on ? 0.26 : 0.12)
        g.fillCircle(3, 7, r)
        g.fillStyle(C.ink, on ? 1 : 0.45)
        g.fillCircle(0, 0, r)
        g.fillStyle(on ? C.paper : C.paperDeep, 1)
        g.fillCircle(0, 0, r - 5)
        g.fillStyle(C.white, on ? 0.75 : 0.3)
        g.fillEllipse(-r * 0.16, -r * 0.4, r * 1.05, r * 0.44)

        // O VÉRTICE APONTA PARA ONDE A SETA LEVA: em `dir = -1` ele fica à
        // esquerda. Trocar este sinal desenha duas setas que mandam a criança
        // para o lado contrário do que fazem.
        const tone = on ? C.ink : C.inkSoft
        g.lineStyle(11, tone, on ? 1 : 0.5)
        g.beginPath()
        g.moveTo(-dir * 9, -17)
        g.lineTo(dir * 8, 0)
        g.lineTo(-dir * 9, 17)
        g.strokePath()
    }

    /**
     * O botão de arremesso, com uma MIRA desenhada dentro.
     *
     * O rótulo escrito saiu: "JOGAR" é uma palavra a mais para ler numa tela
     * que já pede leitura em toda placa, e o mesmo símbolo que está na parede
     * diz sozinho o que o botão faz. Quem não lê ainda liga um ao outro pelo
     * desenho.
     */
    const paintFire = (g: Phaser.GameObjects.Graphics, on: boolean) => {
        const r = FIRE.r
        g.clear()
        g.fillStyle(C.ink, on ? 0.28 : 0.12)
        g.fillCircle(5, 10, r)
        g.fillStyle(C.ink, on ? 1 : 0.45)
        g.fillCircle(0, 0, r)
        g.fillStyle(on ? C.blue : C.crowd, 1)
        g.fillCircle(0, 0, r - 6)
        g.fillStyle(on ? C.cyan : C.crowd, 1)
        g.fillCircle(0, -4, r - 6)
        g.fillStyle(C.white, on ? 0.3 : 0.14)
        g.fillEllipse(-r * 0.14, -r * 0.44, r * 1.06, r * 0.4)

        const tone = on ? C.ink : C.inkSoft
        const ring = r * 0.46
        const arm = r * 0.72
        g.lineStyle(8, tone, on ? 1 : 0.5)
        g.strokeCircle(0, 0, ring)
        ;[
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ].forEach(([dx, dy]) => {
            g.lineBetween(dx * (ring - 9), dy * (ring - 9), dx * arm, dy * arm)
        })
        g.fillStyle(tone, on ? 1 : 0.5)
        g.fillCircle(0, 0, 7)
    }

    const prevG = scene.add.graphics().setPosition(PREV.x, PREV.y)
    const nextG = scene.add.graphics().setPosition(NEXT.x, NEXT.y)
    const fireG = scene.add.graphics().setPosition(FIRE.x, FIRE.y)
    bar.add([prevG, nextG, fireG])

    const paintAll = () => {
        paintArrow(prevG, -1, enabled)
        paintArrow(nextG, 1, enabled)
        paintFire(fireG, enabled)
    }

    /** O retículo. Fechado e ciano sobre uma placa, aberto e cinza no vazio. */
    const paintSight = () => {
        sight.clear()
        if (!sightOn) return
        const on = over !== null
        const tone = on ? C.cyan : C.crowd
        const r = on ? 30 : 38
        const gap = on ? 9 : 16

        sight.lineStyle(7, C.ink, on ? 0.5 : 0.3)
        sight.strokeCircle(x, AIM.y + 3, r)
        sight.lineStyle(6, tone, on ? 1 : 0.75)
        sight.strokeCircle(x, AIM.y, r)
        ;[
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ].forEach(([dx, dy]) => {
            sight.lineBetween(
                x + dx * (r - gap),
                AIM.y + dy * (r - gap),
                x + dx * (r + gap + 6),
                AIM.y + dy * (r + gap + 6),
            )
        })
        sight.fillStyle(tone, on ? 1 : 0.7)
        sight.fillCircle(x, AIM.y, on ? 7 : 5)
    }

    /**
     * A linha que promete o caminho. Ela e o voo saem da mesma curva.
     *
     * Ela vai até a mira inteira, porque agora a mira PODE estar no vazio: o
     * último ponto é a informação, não um enfeite sobre a placa.
     */
    const drawPath = () => {
        path.clear()
        if (!sightOn) return
        const to = { x, y: AIM.y }
        const at = arcAt({ x: LAUNCH.x, y: LAUNCH.y }, to, liftOf(POWER))
        const on = over !== null
        for (let i = 1; i <= DOTS; i++) {
            const t = i / DOTS
            const p = at(t)
            if (Math.hypot(to.x - p.x, to.y - p.y) < 46) break
            path.fillStyle(on ? C.cyan : C.crowd, (on ? 0.42 : 0.3) + 0.5 * t)
            path.fillCircle(p.x, p.y, 4 + 4 * t)
        }
    }

    const refresh = () => {
        const found = sightOn ? options.probe(x, AIM.y) : null
        if (found !== over) {
            over = found
            options.onAim(over)
        }
        paintSight()
        drawPath()
    }

    const move = (by: number) => {
        if (!enabled) return
        const before = x
        x = Phaser.Math.Clamp(x + by, AIM.minX, AIM.maxX)
        if (x !== before) refresh()
    }

    const hit = (
        g: Phaser.GameObjects.Graphics,
        cx: number,
        cy: number,
        w: number,
        h: number,
        press: () => void,
        dir?: -1 | 1,
    ) => {
        const zone = scene.add
            .zone(cx, cy, w, h)
            .setOrigin(0.5)
            .setDepth(DEPTH.controls + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled) return
            void FX.press(scene, g)
            press()
            if (dir) {
                held = dir
                heldSince = scene.time.now
            }
        })
        if (dir) {
            const release = () => {
                if (held === dir) held = null
            }
            zone.on('pointerup', release)
            zone.on('pointerout', release)
            zone.on('pointerupoutside', release)
        }
        return zone
    }

    const zones = [
        hit(prevG, PREV.x, PREV.y, PREV.r * 2 + 26, PREV.r * 2 + 26, () => move(-AIM.step), -1),
        hit(nextG, NEXT.x, NEXT.y, NEXT.r * 2 + 26, NEXT.r * 2 + 26, () => move(AIM.step), 1),
        hit(fireG, FIRE.x, FIRE.y, FIRE.r * 2 + 26, FIRE.r * 2 + 26, () =>
            options.onFire({ x, y: AIM.y }),
        ),
    ]

    /* Um pointerup em qualquer lugar solta o botão: o dedo costuma escorregar
     * para fora do círculo antes de levantar, e sem isto a mira sairia andando
     * sozinha até a borda. */
    const globalUp = () => {
        held = null
    }
    scene.input.on('pointerup', globalUp)
    scene.input.on('pointerupoutside', globalUp)

    const onKey = (event: KeyboardEvent) => {
        if (!enabled) return
        if (event.key === 'ArrowLeft') move(-AIM.step)
        else if (event.key === 'ArrowRight') move(AIM.step)
        else if (event.key === ' ' || event.key === 'Enter') {
            void FX.press(scene, fireG)
            options.onFire({ x, y: AIM.y })
        } else return
        event.preventDefault()
    }
    scene.input.keyboard?.on('keydown', onKey)

    paintTray()
    paintAll()

    return {
        at(): Point {
            return { x, y: AIM.y }
        },

        over() {
            return over
        },

        /** A mira volta ao meio: entre as placas, sem apontar para nenhuma. */
        reset() {
            x = (AIM.minX + AIM.maxX) / 2
            held = null
            over = null
            refresh()
        },

        /** Atalho do toque na placa: leva a mira até ela. */
        aimAtX(value: number) {
            if (!enabled) return
            x = Phaser.Math.Clamp(value, AIM.minX, AIM.maxX)
            refresh()
        },

        /** Repinta SEMPRE, com ou sem mudança. */
        setEnabled(value: boolean) {
            enabled = value
            if (!value) held = null
            paintAll()
            refresh()
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
        },

        /** Mostrar a mira é decisão à parte de aceitar toque — ver `sightOn`. */
        setSight(value: boolean) {
            sightOn = value
            refresh()
        },

        /**
         * Todo quadro: desliza enquanto a seta está segurada e reconfere o que
         * está sob a mira, porque as placas balançam (e um dia vão andar).
         */
        tick(delta: number) {
            if (!enabled) return
            if (held && scene.time.now - heldSince > AIM.holdAfter) {
                move(held * AIM.speed * (delta / 1000))
                return
            }
            refresh()
        },

        arrowsBounds() {
            return {
                x: (PREV.x + NEXT.x) / 2,
                y: PREV.y,
                w: NEXT.x - PREV.x + PREV.r * 2 + 36,
                h: PREV.r * 2 + 34,
            }
        },

        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            scene.input.off('pointerup', globalUp)
            scene.input.off('pointerupoutside', globalUp)
            scene.tweens.killTweensOf([prevG, nextG, fireG])
            zones.forEach(zone => zone.destroy())
            bar.destroy(true)
            path.destroy()
            sight.destroy()
            tray.destroy()
        },
    }
}

export type Controls = ReturnType<typeof createControls>
