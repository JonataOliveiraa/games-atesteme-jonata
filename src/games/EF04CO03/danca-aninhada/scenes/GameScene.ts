import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { BEAT_MS, LEVELS, POINTS_AFTER_STALL, POINTS_CLEAN } from '../data/levels'
import {
    buildProgram,
    complete,
    firstDivergence,
    kindOf,
    optionsFor,
    planOf,
    sameValue,
    simulate,
    slotsOf,
    solutionOf,
    validateLevels,
} from '../data/rules'
import { DEPTH, HUD } from '../data/layout'
import { C, MOVE_NAME } from '../data/theme'
import type { Divergence, LevelDef, LevelNumber, Mode, PhaseDef, SlotId, SlotValue, Values } from '../types'
import { createStage, type Stage } from './drawStage'
import { createRequest, type Request } from './drawRequest'
import { createProgram, type Program } from './drawProgram'
import { createOptions, type Options } from './drawOptions'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'danca-aninhada'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A CENA ORQUESTRA; O TRAÇO VEM DE `rules.ts`
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Nada aqui decide se a coreografia está certa. A ficha vira programa, o
 * programa é executado em `simulate`, e o que esta cena faz é ANIMAR o traço
 * que saiu de lá e parar onde `firstDivergence` mandou parar.
 *
 * Isso é o que o §8 do planejamento pede, e a razão é prática: pausar,
 * silenciar o áudio ou trocar de nível não pode mudar o resultado lógico do
 * programa, e não muda — quem calcula não sabe que existe tela.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'building'
    private gen = 0

    private values: Values = {}
    private selected: SlotId | null = null
    private locked: SlotId | null = null
    private tries = new Map<SlotId, number>()
    private stalled = false

    private score = 0
    private hits = 0
    private errors = 0

    private tutorialOpen = false
    private pendingTutorial = true

    private stage!: Stage
    private request!: Request
    private program!: Program
    private options!: Options
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.mode = 'building'
        this.values = {}
        this.selected = null
        this.locked = null
        this.tries = new Map()
        this.stalled = false
        this.tutorialOpen = false
        this.pendingTutorial = true
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels([this.level])
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.stage = createStage(this)
        this.audio = createAudio(this)
        this.request = createRequest(this)
        this.program = createProgram(this, { onSlot: id => this.selectSlot(id) })
        this.options = createOptions(this, {
            onPick: value => this.pickOption(value),
            onDance: () => void this.dance(),
        })
        this.hud = createHud(this, {
            phases: this.level.phases.length,
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
            tint: C.inner,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.hud?.destroy()
        this.options?.destroy()
        this.program?.destroy()
        this.request?.destroy()
        this.stage?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ──────────────────────────── ciclo da fase ───────────────────────── */

    private async playPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.values = {}
        this.selected = null
        this.locked = null
        this.tries = new Map()
        this.stalled = false
        this.mode = 'building'

        const phase = this.phase
        this.hud.setTitle(phase.title)
        this.hud.setDone(index)
        this.stage.rest()
        void this.stage.spotlight(false)
        this.request.show(phase)
        this.program.build(phase.sheet)
        this.options.setDance(false)
        this.applyInput()

        await this.selectSlot(slotsOf(phase.sheet)[0])
        if (gen !== this.gen) return

        if (this.pendingTutorial && index === 0) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    /** O que a bandeja pede, em palavras, para o espaço que está ativo. */
    private askFor(id: SlotId): string {
        const kind = kindOf(this.phase.sheet, id)
        if (kind === 'signal') return 'Quando o laço deve parar?'
        if (kind === 'times') {
            return id === 'outer'
                ? 'Quantas vezes o laço deve repetir?'
                : 'Quantas vezes o movimento de dentro se repete?'
        }
        if (id === 'lead2' || id === 'after') return 'E qual movimento vem depois?'
        return 'Qual movimento entra neste espaço?'
    }

    private async selectSlot(id: SlotId) {
        if (this.mode !== 'building' || this.tutorialOpen) return
        if (this.locked && id !== this.locked) return
        const gen = this.gen

        this.selected = id
        this.program.select(id)
        this.audio.tap()
        /*
         * NA TRAVA, A FRASE DO ERRO FICA.
         *
         * O espaço travado é reaberto sozinho logo depois da divergência, e
         * anunciar "qual movimento entra aqui?" por cima apagaria, em menos de
         * um segundo, a única explicação do que deu errado.
         */
        if (this.locked !== id) void this.options.say(this.askFor(id))
        await this.options.show(optionsFor(kindOf(this.phase.sheet, id)))
        if (gen !== this.gen) return

        // a ajuda do §9 só aparece depois de DUAS tentativas neste espaço
        if ((this.tries.get(id) ?? 0) >= 2) {
            const right = solutionOf(this.phase)[id]
            if (right) this.options.pulseValue(value => sameValue(value, right))
        }
        this.applyInput()
    }

    private pickOption(value: SlotValue) {
        if (this.mode !== 'building' || this.tutorialOpen || !this.selected) return
        const id = this.selected

        this.values = { ...this.values, [id]: value }
        this.program.setValue(id, value)
        this.audio.snap()

        /*
         * MEXER NO ESPAÇO TRAVADO DESTRAVA A FICHA.
         *
         * O §9 é claro: corrigi-lo destrava, e a criança toca DANÇAR de novo
         * para conferir. O jogo não julga a correção aqui — se julgasse, a
         * prova voltaria a ser uma comparação com gabarito, e a simulação
         * deixaria de ser a evidência.
         */
        if (this.locked === id) {
            this.locked = null
            this.program.lock(null)
            this.program.settle()
            this.request.unmark()
        }

        if (complete(this.phase.sheet, this.values)) {
            this.selected = null
            this.program.select(null)
            void this.options.hide()
            this.options.setDance(true)
            void this.options.say('A ficha está pronta. Toque em DANÇAR para ver o que ela faz.')
            this.applyInput()
            return
        }

        const next = this.program.firstEmpty()
        if (next) void this.selectSlot(next)
    }

    /* ────────────────────────────── o ensaio ──────────────────────────── */

    private async dance() {
        if (this.mode !== 'building' || this.tutorialOpen) return
        const program = buildProgram(this.phase.sheet, this.values)
        if (!program) return

        const gen = this.gen
        const phase = this.phase
        this.mode = 'dancing'
        this.applyInput()
        this.options.setDance(false)
        this.program.select(null)
        this.program.settle()
        this.request.unmark()

        const trace = simulate(program, planOf(phase, 0))
        const bad = firstDivergence(phase, trace, 0)
        const lastGood = (bad ? bad.index : trace.beats.length) - 1
        const total = this.values.outer?.kind === 'times' ? this.values.outer.times : trace.rounds

        /*
         * ══════════════════════════════════════════════════════════════════
         *  O ENSAIO LIMPA A TELA
         * ══════════════════════════════════════════════════════════════════
         *
         * Cabeçalho, pedido, ficha e bandeja saem; sobra o palco. É o pedido
         * do autor do jogo, e a troca tem sentido: enquanto ela monta, o que
         * importa é a ficha; quando ela toca DANÇAR, o que importa é se a
         * dança saiu como o pedido.
         *
         * O que continua na tela é a LEGENDA do movimento e os pontos dos
         * refrões — a única coisa que amarra a dança ao algoritmo que a
         * produziu. Sem eles o ensaio provaria que o dançarino dança, não que
         * a ficha dela faz aquilo.
         */
        await this.showUi(false)
        if (gen !== this.gen) return

        this.audio.countIn()
        void this.stage.spotlight(true)
        this.stage.beads(0, total)
        await FX.wait(this, 520)
        if (gen !== this.gen) return

        const dance = async (k: number) => {
            const beat = trace.beats[k]
            void this.stage.say(beat.move)
            this.audio.beat(beat.move)
            await this.stage.pose(beat.move, BEAT_MS)
            return beat
        }

        for (let k = 0; k <= lastGood; k++) {
            const beat = await dance(k)
            if (gen !== this.gen) return

            const next = trace.beats[k + 1]
            if (!next || next.outer !== beat.outer) {
                this.audio.roundClose()
                this.stage.beads(beat.outer, total)
            } else if (beat.inner !== null && next.inner === null) {
                this.audio.innerClose()
            }
        }

        // o movimento que divergiu também é dançado: é ele que a criança
        // precisa ver para entender a comparação "pedido × saiu"
        if (bad && bad.got !== null && trace.beats[bad.index]) {
            await dance(bad.index)
            if (gen !== this.gen) return
        }

        await FX.wait(this, 420)
        if (gen !== this.gen) return

        void this.stage.spotlight(false)
        await this.showUi(true)
        if (gen !== this.gen) return

        // os selos só agora: durante o ensaio a tira estava fora da tela
        const sealed = bad ? Math.floor(bad.index / phase.pattern.length) : trace.rounds
        for (let r = 0; r < sealed; r++) {
            await this.request.seal(r)
            if (gen !== this.gen) return
        }

        if (!bad) {
            await this.succeed()
            return
        }
        await this.fail(bad)
    }

    /** A interface inteira entra ou sai, e o dançarino troca de lugar junto. */
    private async showUi(on: boolean) {
        await FX.all(
            this.hud.fade(on),
            this.request.fade(on),
            this.program.fade(on),
            this.options.fade(on),
            this.stage.focus(!on),
        )
    }

    /* ───────────────────────────── TRAVA e acerto ─────────────────────── */

    /**
     * O erro conceitual: a ficha estava completa e a dança divergiu do pedido.
     *
     * Uma vida por FASE, nunca por tentativa. Insistir na mesma dúvida não
     * pode ir somando castigo — quem não entendeu perderia tudo justamente
     * enquanto tenta entender. As tentativas seguintes só aumentam a ajuda.
     */
    private async fail(bad: Divergence) {
        const gen = this.gen
        this.mode = 'locked'
        this.applyInput()

        this.audio.stall()
        this.stage.rest()
        void this.stage.spotlight(false)
        this.request.mark(bad.index, bad.expected, bad.got)
        this.program.lock(bad.slot)
        this.locked = bad.slot

        this.tries.set(bad.slot, (this.tries.get(bad.slot) ?? 0) + 1)

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

        void this.options.say(this.failText(bad))

        await FX.wait(this, 700)
        if (gen !== this.gen) return

        this.mode = 'building'
        this.applyInput()
        await this.selectSlot(bad.slot)
    }

    /** A frase do §9: específica, e sobre o que fazer — não sobre quem errou. */
    private failText(bad: Divergence): string {
        if (bad.reason === 'move' && bad.expected && bad.got) {
            return `Aqui o pedido quer ${MOVE_NAME[bad.expected]}, e saiu ${MOVE_NAME[bad.got]}. Troque este espaço.`
        }
        if (bad.reason === 'roundsLess') return 'A dança parou cedo: o laço de fora repetiu poucas vezes.'
        if (bad.reason === 'roundsMore') return 'Sobrou movimento no fim: o laço de fora repetiu vezes demais.'
        if (bad.reason === 'innerLess') return 'Neste refrão faltou um movimento: o laço de dentro repetiu pouco.'
        if (bad.reason === 'innerMore') return 'Neste refrão sobrou um movimento: o laço de dentro repetiu demais.'
        if (bad.reason === 'signal') return 'A luz ainda está acesa; o laço não deve parar aqui.'
        return 'O laço não sabia quando parar. Escolha de novo.'
    }

    private async succeed() {
        const gen = this.gen
        const points = this.stalled ? POINTS_AFTER_STALL : POINTS_CLEAN
        this.score += points
        this.hits += 1

        this.mode = 'reveal'
        this.applyInput()
        void this.stage.spotlight(false)
        this.audio.phase()
        void this.options.say(this.doneText())

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        // a reprise do §10: as molduras acendem na ordem em que executaram
        for (const id of slotsOf(this.phase.sheet)) {
            await this.program.flash(id)
            if (gen !== this.gen) return
        }

        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) void this.playPhase(next)
        else void this.endLevel()
    }

    /** O fecho da fase, dito no que a ficha fez — nunca em pontos. */
    private doneText(): string {
        const phase = this.phase
        if (phase.sheet.leading >= 2) {
            return `O laço repetiu os dois movimentos, na sua ordem, ${phase.rounds} vezes.`
        }
        return `O laço repetiu ${MOVE_NAME[phase.pattern[0]]} ${phase.rounds} vezes. Igualzinho ao pedido!`
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
        void FX.confetti(this, { colors: [C.outer, C.inner, C.good, C.warm] })
        await this.stage.finish()
        if (gen !== this.gen) return
        await FX.wait(this, 600)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.outer,
            panelColor: C.sheet,
            overlayColor: C.ink,
            depth: 5000,
            title: 'Coreografia no palco!',
            message: 'O bloco REPITA faz o dançarino repetir o que está dentro dele — e a ordem dos movimentos muda a dança.',
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.good,
                              onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.outer,
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
        const free = !this.tutorialOpen && this.mode === 'building'
        this.program.setEnabled(free)
        this.options.setEnabled(free)
        // o `?` fica desligado durante o ensaio: ele está fora da tela, e um
        // alvo invisível que responde ao toque é armadilha, não ajuda
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'done' && this.mode !== 'dancing')
    }

    /**
     * Os quatro passos do §12, na ordem da entrada: pedido → ficha → opções →
     * DANÇAR. Cada um aponta uma peça REAL da tela do momento, e não uma
     * posição fixa — a ficha muda de formato entre as fases.
     */
    private tutorialSteps() {
        const first = this.program.firstEmpty() ?? slotsOf(this.phase.sheet)[0]
        return [
            {
                text: 'Veja os movimentos que o palco pediu.',
                shape: 'rect' as const,
                ...this.request.stripBounds(),
                balloonX: 640,
                balloonY: 420,
            },
            {
                text: 'Toque num espaço vazio da ficha.',
                shape: 'rect' as const,
                ...this.program.slotBounds(first),
                balloonX: 520,
                balloonY: 430,
            },
            {
                text: 'Escolha uma opção: ela entra no espaço.',
                shape: 'rect' as const,
                ...this.options.bounds(),
                balloonX: 640,
                balloonY: 330,
            },
            {
                text: 'Com a ficha cheia, toque em DANÇAR para testar.',
                shape: 'rect' as const,
                ...this.options.danceBounds(),
                balloonX: 560,
                balloonY: 330,
                buttonLabel: 'Vamos!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        this.tutorialOpen = true
        this.applyInput()
        createTutorial(this, {
            key: `ef04co03-danca-aninhada-l${this.level.level}`,
            once,
            accent: C.select,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'building') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.phases.length
        const done = complete ? total : this.hits
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(done, total) / total) * 100),
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
