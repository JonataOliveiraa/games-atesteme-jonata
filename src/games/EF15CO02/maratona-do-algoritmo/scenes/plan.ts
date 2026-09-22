import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import { DEPTH, GROUND, MEDAL, SKATER } from '../data/layout'
import { approachX, trickPath } from '../data/moves'
import { createPoseIcon } from './cards'
import type { TrickKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  A LINHA — o plano desenhado SOBRE o parque
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Não existe fita de quadradinhos no topo. O plano é a TRAJETÓRIA que o
 * skatista vai percorrer, pontilhada por cima do concreto, com o ícone de
 * cada manobra pousado acima do seu marco e amarrado a ele por um tracejado.
 *
 * Três coisas mudam por causa disso, e nenhuma é decoração:
 *
 * 1. **O plano e o mundo dividem um espaço só.** "Esta manobra pertence a
 *    este pedaço do parque" deixa de ser uma correspondência que a criança
 *    faz de cabeça entre duas faixas distantes da tela.
 * 2. **A linha é o preview de verdade.** Ela sobe no ollie e escala na rampa
 *    porque sai da MESMA função que anima o skatista (`data/moves.ts`). Não
 *    existe um caminho previsto e outro executado.
 * 3. **A linha cresce conforme ela monta.** Do começo até o primeiro marco
 *    vazio ela é firme e colorida; dali em diante é um pontilhado apagado. A
 *    criança vê o quanto do percurso ela já decidiu, sem um número na tela.
 *
 * Um toque põe, um toque tira — o gesto continua o mesmo da casa.
 */
export function createPlan(
    scene: Phaser.Scene,
    root: Phaser.GameObjects.Container,
    marksX: number[],
    onTapMedal: (index: number) => void,
) {
    const count = marksX.length
    const program: (TrickKind | null)[] = Array.from({ length: count }, () => null)
    const icons: (Phaser.GameObjects.Container | null)[] = Array.from({ length: count }, () => null)

    const trail = scene.add.graphics().setDepth(DEPTH.trail)
    const rings = scene.add.graphics().setDepth(DEPTH.medal)
    root.add([trail, rings])

    let active = -1
    let locked = -1

    // ──────────────────────────────────────────────── a trajetória

    /**
     * A TRAJETÓRIA, amostrada dos MESMOS eases que animam o skatista.
     *
     * A primeira versão passava uma spline pelos pontos de parada, e a spline
     * estourava nas curvas: ela desenhava um caminho que o skatista não faz.
     * Aqui cada trecho é interpolado com a curva de aceleração do seu próprio
     * tween — `Sine.easeOut` na subida, `Sine.easeIn` na descida —, então o
     * pontilhado É o percurso, ponto a ponto.
     */
    interface Amostra { x: number; y: number; firme: boolean }

    function amostrar(): Amostra[] {
        const out: Amostra[] = []
        let cur = { x: SKATER.startX, y: GROUND.y }
        const vago = program.findIndex(item => !item)
        const tudoPronto = vago < 0

        const trecho = (
            alvo: { x: number; y: number }, ease: string, firme: boolean,
        ) => {
            const fn = Phaser.Tweens.Builders.GetEaseFunction(ease)
            const dist = Phaser.Math.Distance.Between(cur.x, cur.y, alvo.x, alvo.y)
            const passos = Math.max(2, Math.round(dist / 13))
            for (let k = 1; k <= passos; k++) {
                const t = fn(k / passos)
                out.push({
                    x: cur.x + (alvo.x - cur.x) * t,
                    y: cur.y + (alvo.y - cur.y) * t,
                    firme,
                })
            }
            cur = alvo
        }

        marksX.forEach((x, i) => {
            const decidido = tudoPronto || i < vago
            const trick = program[i]
            trecho({ x: approachX(trick ?? 'empurrar', x), y: GROUND.y }, 'Linear', decidido)
            if (trick) {
                trickPath(trick, x).forEach(step => {
                    trecho({ x: step.x, y: step.y }, step.ease, decidido)
                })
            } else {
                /* Marco ainda sem manobra: o percurso passa reto por ele. É
                 * honesto — nada foi decidido ali —, e é o pontilhado apagado
                 * que diz isso, não uma linha inventada. */
                trecho({ x: x + 110, y: GROUND.y }, 'Linear', false)
            }
        })

        trecho({ x: SKATER.exitX, y: GROUND.y }, 'Linear', tudoPronto)
        return out
    }

    /**
     * As bolinhas ANDAM, e são discretas.
     *
     * Paradas e escuras elas competiam com o skatista e com os obstáculos —
     * viravam um traço grosso atravessando a tela. Agora são pálidas e
     * desfilam para a frente, uma a cada 55 ms: é o desenho universal de
     * "por aqui", o mesmo das formiguinhas de uma seleção. O movimento diz
     * para onde ele vai, e é o movimento que chama o olho, não a tinta.
     */
    let amostras: Amostra[] = []
    let passo = 0
    let acumulado = 0

    /** Uma bolinha a cada 3 amostras (~39 px), andando 13 px por vez. */
    const VAO = 3
    const RITMO = 55

    function paintTrail() {
        trail.clear()
        amostras.forEach((p, i) => {
            if ((i + passo) % VAO !== 0) return
            trail.fillStyle(p.firme ? C.ink : C.inkSoft, p.firme ? 0.45 : 0.22)
            trail.fillCircle(p.x, p.y, p.firme ? 4 : 3)
        })
    }

    // ───────────────────────────────────────────────── os medalhões

    function paintRings() {
        rings.clear()
        marksX.forEach((x, i) => {
            const half = MEDAL.size / 2

            /* O tracejado vertical amarra o medalhão ao seu marco. Sem ele o
             * ícone fica boiando e a criança tem de adivinhar de quem é. */
            const from = MEDAL.y + half
            const to = GROUND.y - 34
            const tone = i === locked ? C.bad : i === active ? C.warn : C.inkSoft
            for (let y = from; y < to; y += 16) {
                rings.fillStyle(tone, i === active || i === locked ? 0.8 : 0.35)
                rings.fillCircle(x, y, 3)
            }

            if (program[i]) return

            /* Vazio: um anel aberto, do tamanho exato do ícone que vai cair
             * ali. O buraco tem a forma da peça que falta. */
            rings.lineStyle(5, C.ink, 0.5)
            rings.strokeRoundedRect(x - half, MEDAL.y - half, MEDAL.size, MEDAL.size, 18)
            rings.fillStyle(C.cream, 0.32)
            rings.fillRoundedRect(x - half, MEDAL.y - half, MEDAL.size, MEDAL.size, 18)
        })
    }

    function repaint() {
        amostras = amostrar()
        paintTrail()
        paintRings()
    }
    repaint()

    /*
     * As zonas de toque ficam no NÍVEL DA CENA, e não dentro do parque.
     * Elas só são tocáveis enquanto a criança monta, e nesse momento o foco
     * está desligado e o parque em escala 1 — então as duas coordenadas são
     * a mesma. Durante a descida a paleta está desabilitada e ninguém toca
     * em nada, que é quando o parque cresce e as duas divergiriam.
     */
    const zones = marksX.map((x, i) => {
        const zone = scene.add
            .zone(x, MEDAL.y, MEDAL.size + 24, MEDAL.size + 24)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(DEPTH.card + 6)
        zone.on('pointerdown', () => onTapMedal(i))
        return zone
    })

    return {
        program,
        slotAt: (i: number) => ({ x: marksX[i], y: MEDAL.y }),

        /** O desfile das bolinhas. Só redesenha a trilha, nunca os anéis. */
        update(delta: number) {
            acumulado += delta
            if (acumulado < RITMO) return
            acumulado = 0
            passo = (passo + VAO - 1) % VAO
            paintTrail()
        },

        firstEmpty: () => program.findIndex(item => !item),
        isFull: () => program.every(Boolean),

        /** A manobra VOA da carta até o medalhão. O voo é o recibo do toque. */
        async place(index: number, kind: TrickKind, from: { x: number; y: number }) {
            icons[index]?.destroy()
            const icon = createPoseIcon(scene, kind, MEDAL.size)
            icon.setPosition(from.x, from.y).setDepth(DEPTH.medal + 1).setScale(0.6)
            root.add(icon)
            icons[index] = icon
            program[index] = kind
            repaint()
            await FX.to(scene, fx(icon), { x: marksX[index], y: MEDAL.y, scale: 1 }, {
                duration: 300, ease: Ease.back(2),
            })
            repaint()
        },

        clear(index: number) {
            icons[index]?.destroy()
            icons[index] = null
            program[index] = null
            if (locked === index) locked = -1
            repaint()
        },

        setActive(index: number) {
            active = index
            repaint()
            const icon = icons[index]
            if (index >= 0 && icon) {
                void FX.to(scene, fx(icon), { scale: 1.18 }, {
                    duration: 160, yoyo: true, ease: Ease.back(2),
                })
            }
        },

        idle() {
            active = -1
            repaint()
        },

        /**
         * A TRAVA, e ela é sobre UM MARCO. Tremor, vermelho e o ícone
         * apagando só ali — o resto da linha fica como está, porque o resto
         * dela estava certo.
         */
        async blame(index: number) {
            active = -1
            locked = index
            repaint()
            const icon = icons[index]
            if (icon) {
                await FX.to(scene, fx(icon), { angle: -8 }, { duration: 70, yoyo: true, repeat: 2 })
                await FX.to(scene, fx(icon), { alpha: 0.3 }, { duration: 160 })
            }
            void FX.ping(scene, marksX[index], MEDAL.y, C.bad, {
                radius: MEDAL.size, duration: 420,
            })
        },

        destroy() {
            icons.forEach(icon => icon?.destroy())
            zones.forEach(zone => zone.destroy())
            trail.destroy()
            rings.destroy()
        },
    }
}
