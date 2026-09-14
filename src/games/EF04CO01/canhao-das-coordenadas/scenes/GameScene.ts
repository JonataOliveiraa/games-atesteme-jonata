import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, POINTS_AFTER_STALL, POINTS_CLEAN } from '../data/levels'
import {
    answerOf,
    applyTask,
    correct,
    destinationOf,
    inkFor,
    label,
    paintedFrom,
    shuffled,
    validateLevels,
    type Painted,
} from '../data/rules'
import { DEPTH, HUD } from '../data/layout'
import { C } from '../data/theme'
import type { Cell, LevelDef, LevelNumber, Mode, Mural, Task } from '../types'
import { createYard, type Yard } from './yard'
import { createFacade, type Facade } from './facade'
import { createPrompt, type Prompt } from './prompt'
import { createCannon, type Cannon } from './cannon'
import { createCards, type Cards } from './cards'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'canhao-das-coordenadas'

/** A dica muda com o verbo: cada uma aponta o raciocínio, não a resposta. */
const FIRST_HINT: Record<Task['kind'], string> = {
    paint: 'L é a linha, que vai de lado. Procure a linha antes da coluna.',
    read: 'Leia primeiro o número da esquerda; depois, o de cima.',
    move: 'A tinta sai da origem. Conte só um passo na direção da seta.',
    copy: 'A origem continua pintada. Conte um passo para a cópia.',
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private muralIndex = 0
    private taskIndex = 0
    private painted: Painted = new Map()
    private mode: Mode = 'intro'
    private gen = 0

    private tries = 0
    private stalled = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private tutorialOpen = false
    private pendingTutorial = true

    private yard!: Yard
    private facade!: Facade
    private prompt!: Prompt
    private cannon!: Cannon
    private cards!: Cards
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get mural(): Mural {
        return this.level.murals[this.muralIndex]
    }

    private get task(): Task {
        return this.mural.tasks[this.taskIndex]
    }

    private get totalTasks(): number {
        return this.level.murals.reduce((n, m) => n + m.tasks.length, 0)
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.muralIndex = 0
        this.taskIndex = 0
        this.painted = new Map()
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.tutorialOpen = false
        this.pendingTutorial = true
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels([this.level])
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.yard = createYard(this)
        this.audio = createAudio(this)
        this.facade = createFacade(this, { onPick: cell => void this.pick(cell) })
        this.prompt = createPrompt(this)
        this.cannon = createCannon(this)
        this.cards = createCards(this, { onPick: cell => void this.pick(cell) })
        this.hud = createHud(this, {
            level: this.level.level,
            murals: this.level.murals.length,
            onHelp: () => this.replayTutorial(),
        })

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 28,
            tint: C.amber,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playMural(0)
    }

    private shutdownScene() {
        this.gen++
        this.hud?.destroy()
        this.cards?.destroy()
        this.cannon?.destroy()
        this.prompt?.destroy()
        this.facade?.destroy()
        this.yard?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ──────────────────────────── ciclo do mural ──────────────────────── */

    private async playMural(index: number) {
        const gen = ++this.gen
        this.muralIndex = index
        this.taskIndex = 0
        this.mode = 'intro'
        this.applyInput()

        this.painted = paintedFrom(this.mural.initialPainted)
        this.prompt.hush()
        this.cannon.clearInk()
        this.hud.setDone(this.done === 0 ? 0 : index)
        this.hud.setTitle(this.mural.title)

        this.audio.build()
        await this.facade.show(this.painted)
        if (gen !== this.gen) return

        await this.askTask()
    }

    private async askTask() {
        const gen = this.gen
        const task = this.task
        this.tries = 0
        this.stalled = false
        this.facade.clearPulses()
        this.facade.hideGuides()
        this.prompt.hush()
        this.prompt.useLowHint(task.kind === 'read')

        /*
         * CADA VERBO MONTA A TELA DELE.
         *
         * `read` acende a janela e abre os três cartões; `move`/`copy` mostram
         * a direção e a cor da mancha que vai andar; `paint` não precisa de
         * nada além da frase. Tudo o que não pertence ao verbo é desligado
         * aqui, e não espalhado pelos outros ramos.
         */
        this.facade.highlight(task.kind === 'read' ? task.highlighted : null)
        if (task.kind === 'move' || task.kind === 'copy') {
            this.prompt.setShift(task.shift.row, task.shift.col, inkFor(this.painted, task))
        } else {
            this.prompt.setShift(0, 0)
        }

        await this.prompt.setAsk(this.askText(task))
        if (gen !== this.gen) return

        if (task.kind === 'read') {
            // a ordem do trio é sorteada: a resposta certa não pode morar
            // sempre no mesmo cartão
            await this.cards.show(shuffled([...task.options]))
            if (gen !== this.gen) return
        } else {
            await this.cards.hide()
            if (gen !== this.gen) return
        }

        this.mode = 'asking'
        this.applyInput()

        if (this.pendingTutorial && this.muralIndex === 0 && this.taskIndex === 0) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    private askText(task: Task): string {
        if (task.kind === 'paint') return `Pinte ${label(task.target)}`
        if (task.kind === 'read') return 'Qual é esta janela?'
        return `${task.kind === 'move' ? 'MOVER' : 'COPIAR'} ${label(task.source)}`
    }

    /**
     * A segunda dica nomeia o erro na mesma convenção do pedido.
     *
     * No nível 3 ela lembra QUAL passo contar, porque ali o engano quase nunca
     * é trocar L com C: é contar dois em vez de um, ou para o lado errado.
     */
    private againText(cell: Cell, task: Task): string {
        if (task.kind === 'move' || task.kind === 'copy') {
            const eixo = task.shift.col !== 0 ? 'coluna' : 'linha'
            // o destino continua não escrito: dizê-lo aqui resolveria a tarefa
            // em vez de ensinar a contar o passo
            return `Você escolheu ${label(cell)}. Conte UM passo de ${eixo} a partir de ${label(task.source)}.`
        }
        return `Você tocou ${label(cell)}. Leia de novo o pedido e conte a linha primeiro.`
    }

    /**
     * O fecho do mural, dito no verbo daquele nível.
     *
     * Era uma frase fixa sobre "quatro posições", que já mentia no nível 2 e no
     * 3 — os dois têm três pedidos, e nem um nem outro procura posição: um LÊ e
     * o outro MUDA.
     */
    private muralText(): string {
        const n = this.mural.tasks.length
        const kind = this.mural.tasks[0].kind
        if (kind === 'read') return `Você leu ${n} coordenadas da matriz.`
        if (kind === 'move' || kind === 'copy') return `Você mudou ${n} manchas de lugar.`
        return `Você encontrou ${n} posições na matriz.`
    }

    /** O que aconteceu, dito de volta em coordenadas. */
    private doneText(cell: Cell, task: Task): string {
        if (task.kind === 'read') return `Esta janela é a ${label(cell)}.`
        if (task.kind === 'move') return `A tinta saiu de ${label(task.source)} e foi para ${label(cell)}.`
        if (task.kind === 'copy') return `A cópia de ${label(task.source)} ficou em ${label(cell)}.`
        return `Linha ${cell.row} com coluna ${cell.col}: ${label(cell)}.`
    }

    /* ─────────────────────────────── resposta ─────────────────────────── */

    private async pick(cell: Cell) {
        if (this.mode !== 'asking' || this.tutorialOpen) return
        const gen = this.gen
        const task = this.task

        this.mode = 'firing'
        this.applyInput()
        this.audio.tap()
        if (task.kind === 'read') this.cards.press(task.options.findIndex(o => o.row === cell.row && o.col === cell.col))
        else this.facade.press(cell)
        this.prompt.hush()

        /*
         * O TRAÇADO VEM ANTES DO TIRO, E SEMPRE.
         *
         * Acende a linha, depois a coluna, depois o cruzamento — mesmo quando
         * a escolha está errada. É aqui que a criança vê ONDE ela tocou, em
         * coordenadas, e é como ela descobre sozinha que trocou L com C. Fazer
         * isso só no acerto esconderia justamente a explicação do erro.
         */
        this.audio.guide(false)
        await FX.wait(this, 120)
        if (gen !== this.gen) return
        this.audio.guide(true)
        await this.facade.traceTo(cell)
        if (gen !== this.gen) return

        const hit = correct(task, cell)
        const ink = inkFor(this.painted, task)
        this.audio.turn()
        this.audio.shoot()
        // o disparo sai com a COR DA MANCHA que o pedido nomeia, e cinza
        // quando a escolha está errada
        await this.cannon.shoot(this.facade.centerOf(cell), hit, hit ? ink : null)
        if (gen !== this.gen) return

        if (hit) await this.succeed(cell, task, ink)
        else await this.miss(cell, task)
    }

    private async succeed(cell: Cell, task: Task, ink: number) {
        const gen = this.gen
        const points = this.stalled ? POINTS_AFTER_STALL : POINTS_CLEAN
        this.score += points
        this.hits += 1

        this.audio.splat()
        this.painted = applyTask(this.painted, task)
        this.facade.highlight(null)
        void this.cards.hide()
        // no MOVER a origem esvazia primeiro: é o que deixa ver que a tinta
        // SAIU de um lugar, em vez de ter brotado no outro
        if (task.kind === 'move') await this.facade.unpaint(task.source)
        await this.facade.paint(cell, ink)
        if (gen !== this.gen) return

        this.facade.hideGuides()
        this.prompt.setShift(0, 0)
        // a frase NOMEIA a transformação, que é o que o §8 pede do nível 3: a
        // criança precisa ouvir de volta o que ela acabou de fazer com a matriz
        void this.prompt.say(this.doneText(cell, task), 'good')

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const next = this.taskIndex + 1
        if (next < this.mural.tasks.length) {
            this.taskIndex = next
            await this.askTask()
            return
        }
        await this.finishMural()
    }

    /**
     * Erro é escolha de conteúdo, e a tarefa NÃO anda.
     *
     * Só o primeiro erro de cada tarefa custa vida: insistir na mesma dúvida
     * não pode ir somando castigo, senão a criança que não entendeu perde tudo
     * enquanto tenta entender. Os seguintes só aumentam a ajuda.
     */
    private async miss(cell: Cell, task: Task) {
        const gen = this.gen
        this.tries += 1

        this.audio.dud()
        // no nível 2 quem treme é o CARTÃO escolhido, não a janela: foi nele
        // que a criança tocou, e sacudir a matriz culparia a peça errada
        if (task.kind === 'read') {
            await this.cards.shake(task.options.findIndex(o => o.row === cell.row && o.col === cell.col))
        } else {
            await this.facade.shake(cell)
        }
        if (gen !== this.gen) return
        this.facade.hideGuides()

        const first = FIRST_HINT[task.kind]
        const again = this.againText(cell, task)
        void this.prompt.say(this.tries === 1 ? first : again, 'warn', true)

        if (!this.stalled) {
            this.stalled = true
            this.errors += 1
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER',
                gameId: GAME_ID,
                pointsEarned: 0,
                stage: this.level.level,
            })
            this.lives.lose()
            this.livesLeft = this.lives.remaining
        }

        await FX.wait(this, 700)
        if (gen !== this.gen) return

        // depois de duas tentativas a resposta pulsa: a ajuda cresce, mas só
        // depois de a criança ter tido duas chances de raciocinar
        if (this.tries >= 2) {
            if (task.kind === 'read') this.cards.pulse(task.highlighted)
            else this.facade.pulse(answerOf(task))
        }

        this.mode = 'asking'
        this.applyInput()
    }

    private async finishMural() {
        const gen = this.gen
        this.mode = 'reveal'
        this.applyInput()
        this.done += 1

        this.prompt.hush()
        this.prompt.setShift(0, 0)
        this.facade.highlight(null)
        void this.cards.hide()
        void this.prompt.setAsk(this.mural.title)
        this.audio.mural()
        await this.facade.reveal()
        if (gen !== this.gen) return

        void this.prompt.say(this.muralText(), 'good')
        await this.hud.celebrate(this.done - 1)
        if (gen !== this.gen) return
        await FX.wait(this, 1500)
        if (gen !== this.gen) return

        const next = this.muralIndex + 1
        if (next < this.level.murals.length) void this.playMural(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.applyInput()
        this.hud.setEnabled(false)

        const last = this.level.level >= LEVELS.length

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        if (last) void FX.confetti(this, { colors: [C.aim, C.green, C.amber, C.paint] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.paint,
            panelColor: C.wall,
            overlayColor: C.ink,
            depth: 5000,
            title: 'Mural pronto!',
            message: 'Cada janela tem um lugar: linha e coluna ajudam a encontrar e mudar esse lugar.',
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.green,
                              onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.paint,
                              onClick: () => EventBus.emit('exit-game'),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2200,
                          onComplete: () =>
                              this.scene.restart({
                                  lives: this.livesLeft,
                                  level: this.level.level + 1,
                                  points: this.score,
                              }),
                      },
                  }),
        })
    }

    /* ──────────────────────────────── resto ───────────────────────────── */

    private applyInput() {
        const free = !this.tutorialOpen && this.mode === 'asking'
        // no nível 2 quem responde são os CARTÕES: deixar a matriz tocável ali
        // daria dois caminhos para a mesma pergunta, e um deles sem resposta
        const lendo = this.mode !== 'done' && this.task && this.task.kind === 'read'
        this.facade.setEnabled(free && !lendo)
        this.cards.setEnabled(free && lendo)
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'done')
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     *  O TUTORIAL MUDA COM O NÍVEL
     * ─────────────────────────────────────────────────────────────────────
     *
     * O §13 do planejamento é claro: os níveis 2 e 3 mostram só o VERBO NOVO,
     * sem repetir os quatro passos de linha e coluna. Quem chega ao nível 3 já
     * sabe ler uma coordenada — o que ela ainda não viu é a tinta mudar de
     * lugar, e é disso, e só disso, que o passo precisa falar.
     */
    private tutorialSteps(full: boolean) {
        const task = this.task

        if (task.kind === 'read') {
            return [
                {
                    text: 'Agora a janela é apontada, e você diz o nome dela.',
                    shape: 'rect' as const,
                    ...this.facade.bounds(),
                    balloonX: 640,
                    balloonY: 560,
                },
                {
                    text: 'Toque no cartão com a coordenada certa.',
                    shape: 'rect' as const,
                    ...this.cards.bounds(),
                    balloonX: 640,
                    balloonY: 560,
                    buttonLabel: 'Vamos!',
                },
            ]
        }

        if (task.kind === 'move' || task.kind === 'copy') {
            const origem = this.facade.centerOf(task.source)
            return [
                {
                    text: 'Cada mancha tem a sua cor. O pedido diz de qual ele fala.',
                    shape: 'rect' as const,
                    x: origem.x,
                    y: origem.y,
                    w: 168,
                    h: 168,
                    balloonX: 960,
                    balloonY: 470,
                },
                {
                    text: 'MOVER tira a tinta daqui. COPIAR deixa as duas.',
                    shape: 'rect' as const,
                    ...this.prompt.bounds(),
                    balloonX: 640,
                    balloonY: 560,
                },
                {
                    text: 'Conte um passo na direção da seta e toque lá.',
                    shape: 'rect' as const,
                    ...this.facade.bounds(),
                    balloonX: 640,
                    balloonY: 560,
                    buttonLabel: 'Vamos!',
                },
            ]
        }

        // sobrou o `paint`, mas o compilador não estreita `'move' | 'copy'` por
        // eliminação: a guarda explícita é o que o convence
        const target = task.kind === 'paint' ? task.target : { row: 1, col: 1 }
        const steps = [
            {
                text: 'Esta fachada é uma matriz de janelas.',
                shape: 'rect' as const,
                ...this.facade.bounds(),
                balloonX: 960,
                balloonY: 430,
            },
            {
                text: 'L é a linha: ela vai de lado.',
                shape: 'rect' as const,
                ...this.facade.rowBounds(target.row),
                balloonX: 960,
                balloonY: 430,
            },
            {
                text: 'C é a coluna: ela vai de cima para baixo.',
                shape: 'rect' as const,
                ...this.facade.colBounds(target.col),
                balloonX: 960,
                balloonY: 430,
            },
            {
                // o dedo bate na célula que o pedido REALMENTE pede, lida da
                // tarefa — apontar uma célula fixa ensinaria a resposta errada
                // no dia em que a ordem dos murais mudar
                text: 'Toque onde a linha e a coluna se encontram.',
                shape: 'rect' as const,
                x: this.facade.centerOf(target).x,
                y: this.facade.centerOf(target).y,
                w: 168,
                h: 168,
                balloonX: 960,
                balloonY: 430,
                buttonLabel: 'Vamos!',
                pointer: {
                    fromX: this.facade.centerOf(target).x,
                    fromY: this.facade.centerOf(target).y,
                    toX: this.facade.centerOf(target).x,
                    toY: this.facade.centerOf(target).y,
                    tap: true,
                },
            },
        ]
        return full ? steps : steps.slice(1)
    }

    private runTutorial(once: boolean, full = true) {
        this.tutorialOpen = true
        this.applyInput()
        createTutorial(this, {
            key: `ef04co01-canhao-das-coordenadas-l${this.level.level}`,
            once,
            accent: C.aim,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(full),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'asking') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.totalTasks
        const feitas = complete ? total : this.hits
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(feitas, total) / total) * 100),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.level.level) {
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.scene.pause()
            if (command.type === 'RESUME_GAME') this.scene.resume()
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
