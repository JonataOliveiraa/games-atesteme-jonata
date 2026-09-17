import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { formatTime } from '../../../../shared/hud/createTimeBar'
import { FX } from '../../../../shared/effects/FX'

import { swimmers } from '../data/cast'
import { LEVELS, MAX_IN_WATER, MIN_IN_WATER, pointsFor, TOTAL_LAPS, validateLevels } from '../data/levels'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import type { Heat, LevelDef, Phase, Request, Swimmer } from '../types'

import { createPool, type Pool } from './pool'
import { createRoster, type Roster } from './roster'
import { createCoach, type Coach } from './coach'
import { createWhistle, type Whistle } from './whistle'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { createFinger, type Finger } from './finger'

const GAME_ID = 'revezamento-em-lista'

interface Carried {
    who: Swimmer
    from: 'list' | 'bench'
    index: number
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private heatIndex = 0
    private lapIndex = 0
    private phase: Phase = 'briefing'
    private gen = 0

    private list: Swimmer[] = []
    private bench: Swimmer[] = []
    private startList: Swimmer[] = []
    private startBench: Swimmer[] = []
    private carried?: Carried

    private errorsInLap = 0
    private chargedThisLap = false
    private score = 0
    private hits = 0
    private errors = 0
    private lapsDone = 0
    private startedAt = 0

    private pool!: Pool
    private roster!: Roster
    private coach!: Coach
    private whistle!: Whistle
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics
    private finger!: Finger
    private hintTimer?: Phaser.Time.TimerEvent

    private unsubPlatform?: () => void

    private get heat(): Heat {
        return this.level.heats[this.heatIndex]
    }

    private get request(): Request {
        return this.heat.requests[this.lapIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.heatIndex = 0
        this.lapIndex = 0
        this.phase = 'briefing'
        this.carried = undefined
        this.errorsInLap = 0
        this.chargedThisLap = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.lapsDone = 0
    }

    create() {
        this.input.topOnly = true
        this.startedAt = Date.now()

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.audio = createAudio()
        this.pool = createPool(this, {
            onDive: () => this.audio.dive(),
            onWall: () => this.audio.wall(),
            onLeg: index => this.roster.highlight(index),
        })

        this.roster = createRoster(this, {
            onChip: index => this.pickFromWater(index),
            onBenchChip: index => this.pickFromBench(index),
            onPin: index => this.dropAtPin(index),
            onBench: () => this.dropAtBench(),
            onCarried: () => this.cancelCarry(),
        })

        this.coach = createCoach(this)
        this.whistle = createWhistle(this, () => void this.onWhistle())
        this.hud = createHud(this, {
            laps: this.heat.requests.length,
            onHelp: () => this.replayTutorial(),
        })

        this.finger = createFinger(this)
        this.frame = this.add.graphics().setDepth(DEPTH.frame).setAlpha(0)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.livesY,
            size: 30,
            tint: C.red,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startHeat(0)
    }

    private shutdownScene() {
        this.gen++
        this.hintTimer?.remove()
        this.finger?.destroy()
        this.hud?.destroy()
        this.whistle?.destroy()
        this.coach?.destroy()
        this.roster?.destroy()
        this.pool?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ──────────────────────────────── a prova ──────────────────────────── */

    /**
     * A prova se MONTA na frente da criança: o time entra um por um, o reserva
     * senta no banco e a fila se numera. Entrar com tudo pronto na tela é o que
     * fazia o jogo parecer que já estava no meio quando o tutorial acabava.
     */
    private async startHeat(index: number) {
        const gen = ++this.gen
        this.heatIndex = index
        this.list = []
        this.bench = []
        this.carried = undefined
        this.phase = 'briefing'
        this.applyInput()

        this.render(false)
        this.hud.setDone(0)
        await FX.wait(this, 320)
        if (gen !== this.gen) return

        for (const who of swimmers(this.heat.list)) {
            this.list = [...this.list, who]
            this.render()
            this.audio.drop()
            await FX.wait(this, 380)
            if (gen !== this.gen) return
        }

        if (this.heat.bench.length) {
            this.bench = swimmers(this.heat.bench)
            this.render()
            this.audio.drop()
            await FX.wait(this, 320)
            if (gen !== this.gen) return
        }

        await this.roster.renumber(i => this.audio.step(i))
        if (gen !== this.gen) return

        await FX.wait(this, 320)
        if (gen !== this.gen) return

        void this.startLap(0)
    }

    private async startLap(index: number) {
        const gen = ++this.gen
        this.lapIndex = index
        this.startList = this.list.slice()
        this.startBench = this.bench.slice()
        this.errorsInLap = 0
        this.chargedThisLap = false

        this.phase = 'briefing'
        this.applyInput()
        this.hud.setDone(index)

        await this.coach.say(this.request.line, this.request.verb)
        if (gen !== this.gen) return

        this.phase = 'editing'
        this.applyInput()
        this.armHint(this.heat.guided ? 3200 : 9000)
    }

    /* ─────────────────────── a mão da treinadora ───────────────────────── */

    /**
     * Na prova guiada a treinadora não deixa ninguém travado: passado um tempo
     * sem toque, o dedo mostra QUAL é o próximo movimento — o mesmo dedo do
     * tutorial, no mesmo lugar onde a criança tem de tocar.
     */
    private armHint(delay: number) {
        this.hintTimer?.remove()
        if (!this.heat.guided) return
        this.hintTimer = this.time.delayedCall(FX.ms(this, delay), () => void this.showHint())
    }

    private cancelHint() {
        this.hintTimer?.remove()
        this.hintTimer = undefined
        this.finger.reset()
    }

    private async showHint() {
        if (this.phase !== 'editing' && this.phase !== 'carrying') return
        const gen = this.gen
        const hint = this.request.hint(this.list, this.startList)

        if (hint.kind === 'pin' && !this.carried) return
        const point = hint.kind === 'chip'
            ? this.roster.chipPoint(hint.index)
            : hint.kind === 'bench'
                ? this.roster.benchPoint()
                : this.roster.pinPoint(hint.index)

        await this.finger.tap(point.x, point.y)
        if (gen !== this.gen) return
        await this.finger.hide()
        if (gen !== this.gen) return

        this.armHint(7000)
    }

    /* ─────────────────────── pegar, soltar, cancelar ───────────────────── */

    private pickFromWater(index: number) {
        if (this.phase !== 'editing') return
        const who = this.list[index]
        if (!who) return
        this.list = this.list.filter((_, i) => i !== index)
        this.cancelHint()
        this.carried = { who, from: 'list', index }
        this.phase = 'carrying'
        this.audio.pick()
        this.render()
        this.applyInput()
    }

    private pickFromBench(index: number) {
        if (this.phase !== 'editing') return
        const who = this.bench[index]
        if (!who) return
        if (this.list.length >= MAX_IN_WATER) {
            this.audio.locked()
            this.coach.tip('A raia já está cheia.')
            return
        }
        this.bench = this.bench.filter((_, i) => i !== index)
        this.cancelHint()
        this.carried = { who, from: 'bench', index }
        this.phase = 'carrying'
        this.audio.pick()
        this.render()
        this.applyInput()
    }

    private dropAtPin(index: number) {
        if (this.phase !== 'carrying' || !this.carried) return
        const who = this.carried.who
        const at = Phaser.Math.Clamp(index, 0, this.list.length)
        this.list = [...this.list.slice(0, at), who, ...this.list.slice(at)]
        this.carried = undefined
        this.phase = 'editing'
        this.audio.drop()
        this.render()
        this.applyInput()
        void this.coach.say(this.request.line, this.request.verb, false)
        void this.roster.renumber(i => this.audio.step(i))
        this.armHint(this.heat.guided ? 4500 : 9000)
    }

    /** A água nunca fica com menos de dois: sem isso a prova não acontece. */
    private dropAtBench() {
        if (this.phase !== 'carrying' || !this.carried) return
        if (this.list.length < MIN_IN_WATER) {
            this.audio.locked()
            this.coach.tip('A prova precisa de dois nadadores na água.')
            return
        }
        this.bench = [...this.bench, this.carried.who]
        this.carried = undefined
        this.phase = 'editing'
        this.audio.drop()
        this.render()
        this.applyInput()
        void this.coach.say(this.request.line, this.request.verb, false)
        void this.roster.renumber(i => this.audio.step(i))
        this.armHint(this.heat.guided ? 4500 : 9000)
    }

    private cancelCarry() {
        if (this.phase !== 'carrying' || !this.carried) return
        const { who, from, index } = this.carried
        if (from === 'list') {
            const at = Phaser.Math.Clamp(index, 0, this.list.length)
            this.list = [...this.list.slice(0, at), who, ...this.list.slice(at)]
        } else {
            this.bench = [...this.bench, who]
        }
        this.carried = undefined
        this.phase = 'editing'
        this.audio.drop()
        this.render()
        void this.coach.say(this.request.line, this.request.verb, false)
        this.applyInput()
    }

    private render(animate = true) {
        this.roster.render({
            list: this.list,
            bench: this.bench,
            carried: this.carried?.who,
            benchLocked: this.phase === 'carrying' && this.list.length < MIN_IN_WATER,
        }, animate)
    }

    /* ───────────────────────────── o apito ─────────────────────────────── */

    private async onWhistle() {
        this.cancelHint()
        if (this.phase === 'carrying') {
            this.audio.locked()
            this.whistle.call()
            this.coach.tip('Solte o nadador antes de apitar.')
            return
        }
        if (this.phase !== 'editing') return

        const gen = this.gen
        this.phase = 'swimming'
        this.applyInput()
        void this.whistle.press()
        this.audio.whistle()

        const request = this.request
        const ok = request.solves(this.list, this.startList)
        const hint = request.hint(this.list, this.startList)
        const stumble = hint.kind === 'chip'
            ? Phaser.Math.Clamp(hint.index, 0, this.list.length - 1)
            : 0

        await this.pool.lap(this.list, ok, stumble)
        if (gen !== this.gen) return

        if (ok) await this.right()
        else await this.wrong()
    }

    private async right() {
        const gen = this.gen
        const points = pointsFor(this.errorsInLap > 0)
        this.score += points
        this.hits += 1
        this.lapsDone += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.crowd()
        void this.flashFrame(C.green)
        void this.coach.cheer()
        await this.hud.celebrate(this.lapIndex)
        if (gen !== this.gen) return

        // Um respiro entre a comemoração e o pedido seguinte: sem ele a
        // frase nova entra por cima da alegria da volta que acabou.
        await FX.wait(this, 800)
        if (gen !== this.gen) return

        const next = this.lapIndex + 1
        if (next < this.heat.requests.length) {
            void this.startLap(next)
            return
        }

        await this.coach.say(this.heat.close, 'insert')
        await FX.wait(this, 1200)
        if (gen !== this.gen) return

        const nextHeat = this.heatIndex + 1
        if (nextHeat < this.level.heats.length) {
            void this.startHeat(nextHeat)
            return
        }
        void this.finishLevel()
    }

    private async wrong() {
        const gen = this.gen
        this.errorsInLap += 1
        this.chargeOnce()

        this.audio.wrong()
        void this.flashFrame(C.red)
        this.coach.tip(this.request.why)

        this.list = this.startList.slice()
        this.bench = this.startBench.slice()
        this.carried = undefined
        this.phase = 'locked'
        this.render()
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        void this.roster.renumber(i => this.audio.step(i))
        await this.coach.say(this.request.line, this.request.verb)
        if (gen !== this.gen) return

        this.phase = 'editing'
        this.applyInput()

        // Errou uma vez na prova guiada? A mão vem logo, sem esperar os
        // segundos de sempre — é a hora em que a criança mais precisa dela.
        if (this.heat.guided || this.errorsInLap >= 2) {
            this.armHint(this.heat.guided ? 900 : 2500)
        }
        if (this.errorsInLap >= 2) {
            this.roster.blink(this.request.hint(this.list, this.startList))
        }
    }

    /**
     * Uma vida por VOLTA, no primeiro erro dela — e **nenhuma** na prova
     * guiada: ali o erro é aula, não castigo. Sem vida perdida não sai
     * `WRONG_ANSWER`, porque na plataforma um implica o outro.
     */
    private chargeOnce() {
        if (this.chargedThisLap) return
        this.chargedThisLap = true
        this.errors += 1
        if (this.heat.guided) return
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    private applyInput() {
        const editing = this.phase === 'editing' || this.phase === 'carrying'
        this.roster.setEnabled(editing)
        this.whistle.setEnabled(this.phase === 'editing')
    }

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(16, color, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 380 })
    }

    /* ────────────────────────────── fim do nível ───────────────────────── */

    private async finishLevel() {
        const gen = ++this.gen
        this.phase = 'briefing'
        this.applyInput()

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
        void FX.confetti(this, { colors: [C.water, C.green, C.rope, C.cardLift] })
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        const clean = this.errors === 0

        showLevelComplete(this, {
            accent: C.waterDeep,
            panelColor: 0xfffaf0,
            overlayColor: C.ink,
            title: clean ? 'Escalação perfeita!' : 'Prova concluída!',
            subtitle: formatTime(Date.now() - this.startedAt),
            message: 'A escalação é uma LISTA: tem ordem, tem posição, e a gente pode mexer nela.',
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                    buttons: [{
                        label: 'JOGAR DE NOVO',
                        color: C.waterDeep,
                        onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                    }],
                }
                : {
                    autoAdvance: {
                        delay: 2600,
                        label: 'Próximo nível',
                        onComplete: () => this.scene.restart({
                            level: this.level.level + 1,
                            points: this.score,
                            lives: this.livesLeft,
                        }),
                    },
                }),
        })
    }

    /* ─────────────────────────────── tutorial ──────────────────────────── */

    /**
     * Quem ensina é a `TutorialScene`, com a treinadora de frente. O `?` a
     * chama por cima do jogo parado, e ela devolve a cena quando termina.
     */
    private replayTutorial() {
        if (this.phase !== 'editing') return
        if (this.scene.isActive('TutorialScene')) return
        this.scene.pause()
        this.scene.launch('TutorialScene', { replay: true })
        // A ordem das cenas é [Boot, Tutorial, Game]: sem trazer para a frente, o
        // tutorial reaberto pelo `?` nasce ATRÁS do jogo pausado e não aparece.
        this.scene.bringToTop('TutorialScene')
    }

    /* ────────────────────────────── plataforma ─────────────────────────── */

    private emitCheckpoint(final = false) {
        const done = final ? TOTAL_LAPS : this.lapsDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_LAPS) * 100),
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
