import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { CSS } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * A VIAGEM — e a viagem é a aula.
 *
 * As duas pontas do mundo nunca aparecem juntas, e a única forma de a criança
 * sentir a distância é o jogo gastar tempo para cobri-la. Quando ela escolhe a
 * nuvem, o mundo desce até mostrar o céu; quando escolhe o celular, corre até a
 * outra ponta. O estalo acontece no meio do caminho, onde a ligação passa.
 *
 * **Quem se move é o mundo, não a câmera** — ver `data/layout.ts`. Durante uma
 * tomada o cabeçalho, o pedido e os botões SOMEM: quando a viagem manda, o
 * resto é ruído.
 *
 * **O eixo e o roteiro vêm de fora.** O mundo do quarto sobe e desce; o do ar
 * corre de lado; e a tomada de abertura de cada um é uma lista de passos que o
 * nível entrega. Aqui só existe a mecânica de ir de um lugar a outro.
 */
export type Shot = string

/** Um passo da tomada de abertura. */
export interface Step {
    /** Para onde ir — uma chave de `views`. */
    go?: Shot
    ms?: number
    /** Quanto esperar parado, depois de chegar. */
    wait?: number
    /** Acender a ligação (o pulso no cabo, a onda no ar). */
    link?: boolean
}

export interface Cinema {
    /** A abertura: ela conta de onde para onde a ligação vai. */
    open(): Promise<void>
    go(shot: Shot, ms?: number): Promise<void>
    where(): Shot
    destroy(): void
}

export interface CinemaOptions {
    stage(): Phaser.GameObjects.Container
    axis: 'x' | 'y'
    views: Record<string, number>
    /** Onde o mundo fica parado quando ninguém está viajando. */
    home: Shot
    opening: Step[]
    /** O que sai de cena enquanto a viagem manda. */
    hide(on: boolean): void
    onLink(): void
}

export function createCinema(scene: Phaser.Scene, options: CinemaOptions): Cinema {
    const { axis, views } = options
    let at: Shot = options.home
    let cancelled = false

    let skipper: Phaser.GameObjects.Zone | undefined
    let hint: Phaser.GameObjects.Text | undefined

    const alive = () => !cancelled
    const pos = () => (axis === 'y' ? options.stage().y : options.stage().x)

    /**
     * Toda viagem MATA a anterior antes de começar.
     *
     * Sem isso, a tomada de abertura — que pode ser pulada no meio — deixava o
     * seu tween vivo, e a primeira escolha da criança criava um segundo tween no
     * mesmo alvo. Os dois brigavam e o mundo ficava onde estava, enquanto o
     * jogo já achava que tinha chegado.
     */
    const travel = async (shot: Shot, ms: number, ease = 'Sine.easeInOut') => {
        const stage = options.stage()
        at = shot
        FX.kill(scene, fx(stage))
        await FX.to(scene, fx(stage), { [axis]: views[shot] }, { duration: ms, ease })
    }

    const jump = (shot: Shot) => {
        at = shot
        const stage = options.stage()
        FX.kill(scene, fx(stage))
        if (axis === 'y') stage.setY(views[shot])
        else stage.setX(views[shot])
    }

    const armSkip = (done: () => void) => {
        skipper = scene.add.zone(W / 2, H / 2, W, H).setOrigin(0.5).setDepth(DEPTH.overlay).setInteractive()
        skipper.once('pointerdown', () => {
            cancelled = true
            done()
        })
        hint = scene.add
            .text(W - 28, H - 18, 'toque para pular', {
                fontFamily: 'DynaPuff, Arial, sans-serif',
                fontStyle: 'bold',
                fontSize: '20px',
                color: CSS.navy,
            })
            .setOrigin(1, 1)
            .setAlpha(0.5)
            .setDepth(DEPTH.overlay)
            .setResolution(2)
    }

    const disarmSkip = () => {
        skipper?.destroy()
        hint?.destroy()
        skipper = undefined
        hint = undefined
    }

    return {
        open: async () => {
            cancelled = false
            options.hide(true)
            jump(options.home)

            let done = () => {}
            const skipped = new Promise<void>(resolve => {
                done = resolve
                armSkip(resolve)
            })

            const shot = (async () => {
                for (const step of options.opening) {
                    if (!alive()) return
                    if (step.link) options.onLink()
                    if (step.wait) await FX.wait(scene, step.wait)
                    if (!alive()) return
                    if (step.go) await travel(step.go, step.ms ?? 800)
                }
            })()

            await Promise.race([shot, skipped])
            cancelled = true
            done()
            disarmSkip()

            jump(options.home)
            options.hide(false)
            cancelled = false
        },

        /**
         * A pergunta é ONDE O MUNDO ESTÁ, e não onde o cinema acha que deixou.
         *
         * Desde que a criança pode arrastar a tela (`scroll.ts`), o `at` é
         * apenas a última vista que o JOGO pediu — o dedo dela muda a posição
         * sem avisar ninguém. Confiar no `at` fazia a viagem de volta ser
         * descartada como desnecessária logo depois de a criança ter ido até a
         * outra ponta por conta própria, e o jogo seguia com o cenário errado
         * debaixo da plaquinha.
         */
        go: async (shot, ms = 640) => {
            if (Math.abs(pos() - views[shot]) < 2) {
                at = shot
                return
            }
            await travel(shot, ms)
        },

        where: () => at,

        destroy: () => {
            cancelled = true
            disarmSkip()
        },
    }
}
