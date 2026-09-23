import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, applyChoice, improves, queryText, solved, startQuery, validateLevels } from '../data/levels'
import { rankResults } from '../data/results'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C } from '../data/theme'
import type { ChoiceDef, LevelDef, LevelNumber, MissionDef, Mode, QueryState } from '../types'
import { createCast, KEEPER, type Cast } from './cast'
import { createQuery, type Query } from './query'
import { createBoard, type Board } from './board'
import { createChoices, type Choices } from './choices'
import { createHint, type Hint } from './hint'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'a-busca-do-bibliotecario'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private missionIndex = 0
    private mode: Mode = 'reading'
    private gen = 0

    /**
     * A CONSULTA INTEIRA — palavras, filtro e buscador.
     *
     * Era uma lista de palavras, e virou um objeto quando o filtro e o
     * buscador entraram: os três eixos precisam viajar juntos até o
     * `rankResults`, que é o único lugar que decide a ordem da estante.
     */
    private busca: QueryState = { terms: [], engine: 'grimorio' }
    private stepIndex = 0
    private misses = 0
    private stumbled = false

    private tutorialOpen = false
    private pendingTutorial = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private cast!: Cast
    private query!: Query
    private board!: Board
    private choices!: Choices
    private hint!: Hint
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get mission(): MissionDef {
        return this.level.missions[this.missionIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.missionIndex = 0
        this.mode = 'reading'
        this.busca = { terms: [], engine: 'grimorio' }
        this.stepIndex = 0
        this.misses = 0
        this.stumbled = false
        this.tutorialOpen = false
        this.pendingTutorial = number === 1
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        if (this.textures.exists('bg-biblioteca')) {
            this.add.image(W / 2, H / 2, 'bg-biblioteca').setDisplaySize(W, H + 2).setDepth(DEPTH.bg)
        } else {
            const room = this.add.graphics().setDepth(DEPTH.bg)
            room.fillStyle(C.parchmentDeep, 1)
            room.fillRect(0, 0, W, H)
            room.fillStyle(C.wood, 1)
            room.fillRect(0, H * 0.62, W, H * 0.38)
        }

        const veil = this.add.graphics().setDepth(DEPTH.bg + 1)
        veil.fillStyle(C.parchment, 0.42)
        veil.fillRect(0, 0, W, H)

        this.audio = createAudio(this)
        this.cast = createCast(this)
        this.query = createQuery(this)
        this.board = createBoard(this)
        this.choices = createChoices(this, index => void this.pick(index))
        this.hint = createHint(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            missions: this.level.missions.length,
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
            tint: C.warn,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startMission(0)
    }

    private shutdownScene() {
        this.gen++
        this.hint?.destroy()
        this.choices?.destroy()
        this.board?.destroy()
        this.query?.destroy()
        this.cast?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private top3(q: QueryState) {
        return rankResults(this.mission.pool, q)
            .slice(0, 3)
            .map(item => item.id)
    }

    private async startMission(index: number) {
        const gen = ++this.gen
        this.missionIndex = index
        this.mode = 'reading'
        this.stepIndex = 0
        this.misses = 0
        this.stumbled = false

        const mission = this.mission
        this.busca = startQuery(mission)
        this.hint.hush()
        this.board.clear()
        this.choices.clear()
        this.query.set(this.busca)
        this.hud.setMissions(this.done)
        this.cast.keeper(KEEPER.show)
        this.applyInput()

        await this.cast.arrive(mission.visitor, mission.request)
        if (gen !== this.gen) return

        this.audio.search()
        await this.query.run()
        if (gen !== this.gen) return

        await this.board.show(this.top3(this.busca), mission.targetId)
        if (gen !== this.gen) return

        this.cast.doubt()
        this.cast.keeper(KEEPER.think)
        await this.choices.show(mission.steps[0].choices)
        if (gen !== this.gen) return

        this.mode = 'choosing'
        this.applyInput()

        if (this.pendingTutorial && index === 0) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    private async pick(index: number) {
        if (this.mode !== 'choosing' || this.tutorialOpen) return
        const gen = this.gen
        const mission = this.mission
        const choice = mission.steps[this.stepIndex].choices[index]
        const before = this.busca
        const after = applyChoice(before, choice)
        const good = improves(mission, before, choice)

        this.mode = 'searching'
        this.applyInput()
        this.choices.press(index)
        this.audio.tap()
        this.hint.hush()

        /*
         * CADA GESTO TEM O SEU MOVIMENTO NA BARRA.
         *
         * A palavra voa do botão e vira ficha; o filtro pousa uma ficha de
         * tipo no fim da consulta; o buscador troca a cara da barra inteira
         * e não mexe em ficha nenhuma — a criança vê que a consulta não
         * mudou, e é por isso que a estante não muda depois.
         */
        if (choice.kind === 'add') {
            this.audio.term()
            await this.query.add(choice.term, this.choices.posOf(index))
        } else if (choice.kind === 'remove') {
            this.audio.unterm()
            await this.query.remove(choice.term)
        } else if (choice.kind === 'filter') {
            this.audio.term()
            await this.query.setFilter(after.filter, this.choices.posOf(index))
        } else {
            this.audio.term()
            await this.query.setEngine(after.engine)
        }
        if (gen !== this.gen) return

        this.audio.search()
        this.cast.keeper(KEEPER.show)
        await this.query.run()
        if (gen !== this.gen) return

        await this.board.reorder(this.top3(after))
        if (gen !== this.gen) return

        if (!good) {
            await this.stall(index, choice, before)
            return
        }

        this.busca = after
        this.audio.rise()

        if (solved(mission, this.busca)) {
            void this.hint.say('Achou!', 'good')
            void this.cast.happy()
            await this.deliver()
            return
        }

        this.board.glow(mission.targetId)
        /*
         * A FRASE DIZ O QUE ACABOU DE ACONTECER.
         *
         * Depois de trocar de buscador a estante NÃO se mexeu, e dizer
         * "subiu!" ali seria o jogo descrevendo um movimento que não houve —
         * que é o jeito mais rápido de ensinar que o texto dele não vale a
         * leitura. A troca tem a frase dela, e é a lição do nível.
         */
        void this.hint.say(
            choice.kind === 'engine'
                ? 'Outro buscador, os MESMOS resultados. Quem acha são as palavras.'
                : 'Subiu! Falta mais um pouco.',
            'good',
        )
        this.stepIndex += 1
        this.misses = 0
        this.cast.keeper(KEEPER.think)

        await this.choices.hide()
        if (gen !== this.gen) return
        await this.choices.show(mission.steps[this.stepIndex].choices)
        if (gen !== this.gen) return

        this.mode = 'choosing'
        this.applyInput()
    }

    private async stall(index: number, choice: ChoiceDef, before: QueryState) {
        const gen = this.gen

        this.audio.stall()
        this.cast.keeper(KEEPER.think)
        void this.cast.refuse()
        void this.choices.nope(index)
        void this.hint.say(choice.hint, 'bad')

        await FX.wait(this, 1200)
        if (gen !== this.gen) return

        // A palavra que não serviu VOLTA para o botão de onde veio; o resto
        // se desfaz repintando a consulta como ela estava.
        if (choice.kind === 'add') {
            this.audio.unterm()
            await this.query.remove(choice.term, this.choices.posOf(index))
        } else {
            this.query.set(before)
        }
        if (gen !== this.gen) return

        await this.board.reorder(this.top3(before))
        if (gen !== this.gen) return

        this.stumbled = true
        this.misses += 1

        if (this.misses >= 2) {
            this.misses = 0
            this.errors += 1
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER',
                gameId: GAME_ID,
                pointsEarned: 0,
                stage: this.level.level,
            })
            this.lives.lose()
            this.livesLeft = this.lives.remaining

            const useful = this.mission.steps[this.stepIndex].choices.findIndex(item =>
                improves(this.mission, this.busca, item),
            )
            if (useful >= 0) this.choices.hint(useful)
        }

        this.mode = 'choosing'
        this.applyInput()
    }

    private async deliver() {
        const gen = this.gen
        const mission = this.mission
        const points = this.stumbled ? 5 : 10

        this.mode = 'delivering'
        this.applyInput()

        this.audio.deliver()
        void this.cast.cheer()
        await this.choices.hide()
        if (gen !== this.gen) return

        await this.board.deliver(mission.targetId, this.cast.visitorPos())
        if (gen !== this.gen) return

        this.hint.hush()
        this.done += 1
        this.hits += 1
        this.score += points
        this.hud.setMissions(this.done)

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await this.cast.leave()
        if (gen !== this.gen) return

        const next = this.missionIndex + 1
        if (next < this.level.missions.length) void this.startMission(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.applyInput()
        this.hud.setEnabled(false)

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
        void FX.confetti(this, { colors: [C.gold, C.magic, C.ok, C.heart] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const done = this.level.level
        const recap = this.level.missions
            .map(mission => `${mission.initialTerms.join(' + ')} → ${this.finalQuery(mission)}`)
            .join('\n')

        const panel = {
            title: 'Tudo encontrado!',
            subtitle: 'Palavras melhores trazem resultados melhores.',
            message: recap,
            accent: C.gold,
            panelColor: C.parchment,
            overlayColor: C.woodDark,
            depth: 5000,
        }

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                ...panel,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 3000,
                    label: `${LEVELS[done].title}...`,
                    onComplete: () =>
                        this.scene.restart({
                            lives: this.livesLeft,
                            level: (done + 1) as LevelNumber,
                            points: this.score,
                        }),
                },
            })
            return
        }

        showLevelComplete(this, {
            ...panel,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Buscar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.magic,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /** A consulta que resolve a missão, escrita para o painel de fim de fase. */
    private finalQuery(mission: MissionDef) {
        let q = startQuery(mission)
        mission.steps.forEach(step => {
            const useful = step.choices.find(choice => improves(mission, q, choice))
            if (useful) q = applyChoice(q, useful)
        })
        return queryText(q)
    }

    private applyInput() {
        this.choices.setEnabled(!this.tutorialOpen && this.mode === 'choosing')
    }

    private tutorialSteps() {
        const target = this.board.posOf(this.mission.targetId)
        const first = this.board.firstBounds()
        const row = this.choices.bounds()
        const left = 24
        const right = first.x + first.w / 2
        return [
            {
                text: 'Este é o que o visitante quer.',
                shape: 'rect' as const,
                x: target.x,
                y: target.y,
                w: 250,
                h: 210,
                balloonX: 640,
                balloonY: 150,
                pointer: { fromX: target.x, fromY: target.y, toX: target.x, toY: target.y, tap: true },
            },
            {
                text: 'O 1º lugar vai para o visitante.',
                shape: 'rect' as const,
                x: (left + right) / 2,
                y: first.y - 10,
                w: right - left,
                h: first.h + 20,
                balloonX: 880,
                balloonY: 150,
                pointer: { fromX: first.x, fromY: first.y, toX: first.x, toY: first.y, tap: true },
            },
            {
                text: 'Toque numa palavra para mudar a busca.',
                shape: 'rect' as const,
                x: row.x,
                y: row.y,
                w: row.w,
                h: row.h,
                balloonX: 640,
                balloonY: 330,
                buttonLabel: 'Vamos!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        this.tutorialOpen = true
        this.applyInput()
        this.hud.setEnabled(false)
        createTutorial(this, {
            key: 'ef03co07-bibliotecario-l1',
            once,
            accent: C.gold,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.hud.setEnabled(true)
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'choosing') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.missions.length
        const done = complete ? total : this.done
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
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
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
