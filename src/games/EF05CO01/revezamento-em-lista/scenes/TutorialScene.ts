import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { swimmers } from '../data/cast'
import { BENCH } from '../data/layout'
import type { Swimmer } from '../types'

import { createPool, type Pool } from './pool'
import { createRoster, type Roster } from './roster'
import { createWhistle, type Whistle } from './whistle'
import { createTeacher, type Teacher } from './teacher'
import { createFinger, type Finger } from './finger'
import { createAudio, type Audio } from './audio'

export interface TutorialData {
    level?: number
    points?: number
    lives?: number
    /** Reaberto pelo `?` no meio da partida: volta para o jogo em vez de recomeçar. */
    replay?: boolean
}

/** Um passo do tutorial. O runner confere a geração ANTES de cada um. */
type Step = () => Promise<unknown> | unknown

/**
 * A treinadora ensina o jogo no próprio jogo: a tira é a tira de verdade, a
 * água é a água de verdade, e o dedo mostra cada toque.
 *
 * ── O RITMO É DA CRIANÇA, NÃO DO RELÓGIO ────────────────────────────────
 *
 * Toda fala é ESCRITA letra a letra e PARA. Nada acontece enquanto ela não
 * tocar no botão: primeiro ela lê, depois ela pede para ver, e só então a
 * animação roda. Antes, a frase aparecia pronta e a prova começava em menos de
 * um segundo — ninguém tinha tempo de ler o que ia ser mostrado.
 */
export class TutorialScene extends Phaser.Scene {
    private entry: TutorialData = {}
    private beat = 0
    private gen = 0
    private busy = false
    private ending = false
    /** Resolve quando a criança toca no botão no meio de um tempo. */
    private waiting?: () => void

    private list: Swimmer[] = []
    private bench: Swimmer[] = []
    private carried?: Swimmer

    private pool!: Pool
    private roster!: Roster
    private whistle!: Whistle
    private teacher!: Teacher
    private finger!: Finger
    private audio!: Audio

    constructor() {
        super({ key: 'TutorialScene' })
    }

    init(data: TutorialData) {
        this.entry = data ?? {}
        this.beat = 0
        this.busy = false
        this.ending = false
        this.waiting = undefined
        this.carried = undefined
        this.gen += 1
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.pool = createPool(this, {
            onDive: () => this.audio.dive(),
            onWall: () => this.audio.wall(),
            onLeg: index => this.roster.highlight(index),
        })

        this.roster = createRoster(this, {
            onChip: () => {},
            onBenchChip: () => {},
            onPin: () => {},
            onBench: () => {},
            onCarried: () => {},
        })
        this.roster.setEnabled(false)

        this.whistle = createWhistle(this, () => {})
        this.whistle.setEnabled(false)

        this.finger = createFinger(this)
        this.teacher = createTeacher(this, {
            onNext: () => this.next(),
            onSkip: () => this.finish(),
        })

        // Um toque em qualquer lugar completa a frase que está sendo escrita.
        this.input.on('pointerdown', () => this.teacher.skipSay())

        this.list = []
        this.bench = swimmers(['duda'])
        this.carried = undefined
        this.paint(false)

        this.events.once('shutdown', () => {
            this.gen += 1
            this.waiting = undefined
            this.pool.abort()
            this.finger.destroy()
            this.teacher.destroy()
            this.whistle.destroy()
            this.roster.destroy()
            this.pool.destroy()
            this.audio.destroy()
        })

        void this.play(0)
    }

    private paint(animate = true) {
        this.roster.render({
            list: this.list,
            bench: this.bench,
            carried: this.carried,
            benchLocked: false,
        }, animate)
    }

    /** Nada de ontem continua hoje: água parada, dedo fora, botão apagado. */
    private cut() {
        this.pool.abort()
        this.finger.reset()
        this.roster.highlight(undefined)
        this.teacher.setButton('PRÓXIMO', false)
    }

    /** O tempo para aqui até a criança tocar. É ela quem manda no ritmo. */
    private waitTap(label: string): Promise<void> {
        this.teacher.setButton(label, true)
        return new Promise<void>(resolve => {
            this.waiting = () => {
                this.teacher.setButton(label, false)
                resolve()
            }
        })
    }

    private next() {
        if (this.teacher.skipSay()) return

        if (this.waiting) {
            const go = this.waiting
            this.waiting = undefined
            go()
            return
        }

        if (this.busy) return
        if (this.beat >= this.script.length - 1) {
            this.finish()
            return
        }
        void this.play(this.beat + 1)
    }

    private finish() {
        if (this.ending) return
        this.ending = true
        this.gen += 1
        this.waiting = undefined
        this.cut()

        if (this.entry.replay) {
            this.scene.stop()
            this.scene.resume('GameScene')
            return
        }
        this.scene.start('GameScene', {
            level: this.entry.level ?? 1,
            points: this.entry.points ?? 0,
            lives: this.entry.lives,
        })
    }

    private async play(index: number) {
        const gen = ++this.gen
        this.beat = index
        this.busy = true
        this.waiting = undefined
        this.cut()

        for (const step of this.script[index]) {
            if (gen !== this.gen) return
            await step()
        }
        if (gen !== this.gen) return

        this.busy = false
        this.teacher.setButton(index >= this.script.length - 1 ? 'VAMOS NADAR!' : 'PRÓXIMO', true)
    }

    /* ───────────────────────────── os cinco tempos ─────────────────────── */

    private get script(): Step[][] {
        return [
            [
                () => this.teacher.say('Oi! Eu sou a treinadora. Esta fila aqui embaixo é a sua ESCALAÇÃO.'),
                () => this.waitTap('QUEM SÃO?'),
                () => this.enter('nina'),
                () => this.enter('teo'),
                () => this.enter('bia'),
                () => this.roster.renumber(i => this.audio.step(i)),
                () => FX.wait(this, 500),
                () => this.teacher.say('Olha os números: 1º, 2º e 3º. A fila tem ordem.'),
            ],

            [
                () => this.teacher.say('A ordem da fila é a ordem de nadar: o 1º nada primeiro, e o último fecha a prova.'),
                () => this.waitTap('VER A PROVA'),
                () => this.teacher.leave(),
                () => FX.wait(this, 400),
                () => this.pool.lap(this.list, true, 0),
                () => FX.wait(this, 500),
                () => this.roster.highlight(undefined),
                () => this.teacher.comeBack(),
                () => this.teacher.say('Viu? Eles nadaram na ordem da fila, um de cada vez.'),
            ],

            [
                () => this.teacher.say('Antes de cada volta eu peço uma mudança. Por exemplo: TIRE o 2º da fila.'),
                () => this.waitTap('E COMO?'),
                () => this.teacher.say('Toque no nadador para PEGAR ele.'),
                () => FX.wait(this, 600),
                () => {
                    const point = this.roster.chipPoint(1)
                    return this.finger.tap(point.x, point.y)
                },
                () => {
                    this.carried = this.list[1]
                    this.list = this.list.filter((_, i) => i !== 1)
                    this.audio.pick()
                    this.paint()
                },
                () => this.finger.hide(),
                () => FX.wait(this, 700),
                () => this.teacher.say('Pronto: ele está na sua mão, e os lugares abriram.'),
            ],

            [
                () => this.teacher.say('Agora solte. O BANCO tira ele da prova; um número põe ele naquele lugar.'),
                () => this.waitTap('VER'),
                () => this.finger.tap(BENCH.x + BENCH.w / 2, BENCH.y + BENCH.h / 2),
                () => {
                    if (this.carried) this.bench = [...this.bench, this.carried]
                    this.carried = undefined
                    this.audio.drop()
                    this.paint()
                },
                () => this.finger.hide(),
                () => FX.wait(this, 500),
                () => this.roster.renumber(i => this.audio.step(i)),
                () => FX.wait(this, 400),
                () => this.teacher.say('Viu? Quem era o 3º virou o 2º. A fila se renumera sozinha.'),
            ],

            [
                () => this.teacher.say('Quando a fila estiver do jeito que eu pedi, aperte NADAR.'),
                () => this.waitTap('APITAR!'),
                () => {
                    this.whistle.setEnabled(true)
                    const point = this.whistle.center()
                    return this.finger.tap(point.x, point.y)
                },
                () => this.finger.hide(),
                () => {
                    this.audio.whistle()
                    return this.whistle.press()
                },
                () => this.teacher.leave(),
                () => FX.wait(this, 300),
                () => this.pool.lap(this.list, true, 0),
                () => FX.wait(this, 500),
                () => {
                    this.roster.highlight(undefined)
                    this.whistle.setEnabled(false)
                },
                () => this.teacher.comeBack(),
                () => this.teacher.say('É só isso! Mude a fila, aperte NADAR, e veja a prova acontecer.'),
            ],
        ]
    }

    private async enter(id: string) {
        this.list = [...this.list, ...swimmers([id])]
        this.paint()
        this.audio.drop()
        await FX.wait(this, 520)
    }
}
