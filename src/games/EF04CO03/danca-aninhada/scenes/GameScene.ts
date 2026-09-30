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
import type {
    Command,
    Divergence,
    LevelDef,
    LevelNumber,
    Mode,
    PhaseDef,
    SlotId,
    SlotValue,
    Values,
} from '../types'
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
        this.resetLamp()
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

    /**
     * A lâmpada existe por causa da CONDIÇÃO, não do número do nível.
     *
     * Ela volta a acender entre uma tentativa e outra: deixada apagada depois
     * de um ensaio, ela diria que o sinal já passou quando a dança seguinte
     * ainda nem começou.
     */
    private resetLamp() {
        this.stage.setLamp(this.phase.sheet.outer === 'until' ? 'on' : null)
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

        const bad = await this.rehearse(program, 0)
        if (gen !== this.gen) return
        if (bad) {
            await this.fail(bad)
            return
        }

        /*
         * ══════════════════════════════════════════════════════════════════
         *  O SEGUNDO ENSAIO DO NÍVEL 3
         * ══════════════════════════════════════════════════════════════════
         *
         * A MESMA ficha roda de novo, com a luz apagando noutra hora. A
         * criança não mexe em nada entre os dois — e é exatamente isso que o
         * §7 quer que ela veja: o programa não mudou, a dança mudou.
         *
         * Um número na moldura não conseguiria fazer isso. É a prova de que a
         * condição não é um número disfarçado.
         */
        if (phase.signalPlans) {
            void this.options.say('A mesma ficha, de novo — e a luz vai apagar noutra hora.')
            await FX.wait(this, 1800)
            if (gen !== this.gen) return
            this.request.unmark()
            const outra = await this.rehearse(program, 1)
            if (gen !== this.gen) return
            if (outra) {
                await this.fail(outra)
                return
            }
        }

        await this.succeed()
    }

    /**
     * Um ensaio, do apagar da interface ao selo na tira.
     *
     * Devolve a divergência, ou `null` quando a dança bateu com o pedido.
     * Quem decide o que fazer com isso é quem chamou: o nível 3 chama duas
     * vezes, e o primeiro ensaio precisa passar antes de o segundo começar.
     */
    private async rehearse(program: Command, rehearsal: number): Promise<Divergence | null> {
        const gen = this.gen
        const phase = this.phase
        const plan = planOf(phase, rehearsal)
        const trace = simulate(program, plan)
        const bad = firstDivergence(phase, trace, rehearsal)
        const lastGood = (bad ? bad.index : trace.beats.length) - 1
        const rounds = this.values.outer?.kind === 'times' ? this.values.outer.times : trace.rounds
        const innerTotal = this.values.innerTimes?.kind === 'times' ? this.values.innerTimes.times : 0

        /*
         * ══════════════════════════════════════════════════════════════════
         *  O ENSAIO LIMPA A TELA
         * ══════════════════════════════════════════════════════════════════
         *
         * Cabeçalho, pedido, ficha e bandeja saem; sobra o palco. Enquanto
         * ela monta, o que importa é a ficha; quando ela toca DANÇAR, o que
         * importa é se a dança saiu como o pedido.
         *
         * O que continua na tela é a LEGENDA do movimento, as duas fileiras
         * de pontos e a lâmpada — a única coisa que amarra a dança ao
         * algoritmo que a produziu. Sem elas o ensaio provaria que o
         * dançarino dança, não que a ficha dela faz aquilo.
         */
        await this.showUi(false)
        if (gen !== this.gen) return null

        this.audio.countIn()
        void this.stage.spotlight(true)
        this.stage.beads(0, rounds)
        this.stage.innerBeads(0, innerTotal)
        await FX.wait(this, 520)
        if (gen !== this.gen) return null

        const dance = async (k: number) => {
            const beat = trace.beats[k]
            void this.stage.say(beat.move)
            if (beat.inner !== null) this.stage.innerBeads(beat.inner, innerTotal)
            this.audio.beat(beat.move)
            await this.stage.pose(beat.move, BEAT_MS)
            return beat
        }

        for (let k = 0; k <= lastGood; k++) {
            const beat = await dance(k)
            if (gen !== this.gen) return null

            const next = trace.beats[k + 1]
            if (!next || next.outer !== beat.outer) {
                this.audio.roundClose()
                this.stage.beads(beat.outer, rounds)
                // o contador de dentro ZERA no fim do refrão: é a evidência
                // do nível 2, e ela some se a fileira continuar somando
                this.stage.innerBeads(0, innerTotal)

                // a luz apaga ao fim do refrão que o plano marcou, e a dança
                // só termina DEPOIS dele — a condição é testada no fim da
                // volta, nunca no meio
                if (plan !== undefined && beat.outer >= plan) {
                    this.audio.lampOff()
                    await this.stage.blinkLamp()
                    if (gen !== this.gen) return null
                }
            } else if (beat.inner !== null && next.inner === null) {
                this.audio.innerClose()
            }
        }

        // o movimento que divergiu também é dançado: é ele que a criança
        // precisa ver para entender a comparação "pedido × saiu"
        if (bad && bad.got !== null && trace.beats[bad.index]) {
            await dance(bad.index)
            if (gen !== this.gen) return null
        }

        await FX.wait(this, 420)
        if (gen !== this.gen) return null

        void this.stage.spotlight(false)
        await this.showUi(true)
        if (gen !== this.gen) return null

        // a faixa ainda trazia "toque em DANÇAR", que já não era verdade: o
        // ensaio acabou e o que acontece agora é a conferência
        void this.options.say('Conferindo com o pedido...')

        /*
         * OS SELOS SÓ AGORA: durante o ensaio a tira estava fora da tela.
         *
         * No nível 3 a tira mostra UM refrão, e não a fila inteira — então
         * não há refrão 2 para selar. Ou o refrão bateu, e o selo é um só, ou
         * não bateu, e quem fala é o âmbar.
         */
        if (phase.signalPlans) {
            if (!bad) await this.request.seal(0)
        } else {
            const sealed = bad ? Math.floor(bad.index / phase.pattern.length) : trace.rounds
            for (let r = 0; r < sealed; r++) {
                await this.request.seal(r)
                if (gen !== this.gen) return null
            }
        }
        return bad
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
        this.resetLamp()
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
        const { sheet, pattern, rounds, signalPlans } = this.phase
        const primeiro = MOVE_NAME[pattern[0]]
        const ultimo = MOVE_NAME[pattern[pattern.length - 1]]

        if (signalPlans) {
            return `A mesma ficha: ${signalPlans[0]} refrões numa vez, ${signalPlans[1]} na outra. Quem mandou parar foi a luz.`
        }
        if (sheet.nested) {
            return `Cada refrão: ${primeiro} ${pattern.length - 1} vezes e ${ultimo}. O de fora repetiu ${rounds}.`
        }
        if (sheet.leading >= 2) {
            return `O laço repetiu os dois movimentos, na sua ordem, ${rounds} vezes.`
        }
        return `O laço repetiu ${primeiro} ${rounds} vezes. Igualzinho ao pedido!`
    }

    /**
     * O fecho do NÍVEL, que é onde a síntese do §10 mora.
     *
     * Cada uma nomeia só o que aquele nível ensinou. A do nível 3 é a frase
     * inteira do planejamento, porque é ali que os dois laços e a condição já
     * foram todos vistos.
     */
    private levelText(): string {
        if (this.level.level === 2) {
            return 'O bloco de DENTRO repete um movimento. O de FORA repete o refrão inteiro — e o de dentro recomeça em cada um.'
        }
        if (this.level.level === 3) {
            return 'O bloco de dentro repete movimentos. O de fora repete o refrão — ou espera a luz apagar.'
        }
        return 'O bloco REPITA faz o dançarino repetir o que está dentro dele — e a ordem dos movimentos muda a dança.'
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
            message: this.levelText(),
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
     * ─────────────────────────────────────────────────────────────────────
     *  O TUTORIAL MOSTRA SÓ A NOVIDADE
     * ─────────────────────────────────────────────────────────────────────
     *
     * O §12 é explícito: os níveis 2 e 3 mostram apenas o que mudou. Quem
     * chegou ao nível 3 já montou seis fichas — repetir "toque num espaço
     * vazio" ali não ensina nada e atrasa quem já sabe.
     *
     * Cada passo aponta uma peça REAL da tela do momento, e não uma posição
     * fixa: a ficha muda de formato entre os níveis, e a moldura de dentro
     * nem existe no nível 1.
     */
    private tutorialSteps() {
        if (this.level.level === 2) {
            return [
                {
                    text: 'Agora há um laço DENTRO do outro.',
                    shape: 'rect' as const,
                    ...this.program.innerBounds(),
                    balloonX: 560,
                    balloonY: 590,
                },
                {
                    text: 'O de dentro repete um movimento. O de fora repete o refrão inteiro.',
                    shape: 'rect' as const,
                    ...this.program.bounds(),
                    balloonX: 560,
                    balloonY: 590,
                    buttonLabel: 'Vamos!',
                },
            ]
        }

        if (this.level.level === 3) {
            return [
                {
                    text: 'Esta luz começa acesa — e vai apagar no meio da dança.',
                    shape: 'rect' as const,
                    ...this.stage.lampBounds(),
                    balloonX: 700,
                    balloonY: 420,
                },
                {
                    text: 'ATÉ não conta vezes: o laço para quando a luz apagar.',
                    shape: 'rect' as const,
                    ...this.program.slotBounds('outer'),
                    balloonX: 620,
                    balloonY: 590,
                    buttonLabel: 'Vamos!',
                },
            ]
        }

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
