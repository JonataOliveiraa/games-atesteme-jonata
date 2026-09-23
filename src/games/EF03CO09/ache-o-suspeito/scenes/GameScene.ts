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
import { isSuspicious, shuffled, validateLevels } from '../data/rules'
import { DEPTH, FIRE, HUD, PREV } from '../data/layout'
import { C } from '../data/theme'
import type { LevelDef, LevelNumber, Mode, TargetCard, Wave } from '../types'
import { createRoom, type Room } from './room'
import { createSigns, type Signs } from './signs'
import { createBall, type Ball } from './ball'
import { createControls, type Controls } from './controls'
import { createRescue, type Rescue } from './rescue'
import { createBand, type Band } from './band'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import type { Point } from './arc'

const GAME_ID = 'ache-o-suspeito'

/** Sem puxada não há força para medir: todo arremesso sai igual. */
const THROW_POWER = 0.62

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private index = 0
    private deck: TargetCard[] = []
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

    private room!: Room
    private signs!: Signs
    private ball!: Ball
    private controls!: Controls
    private rescue!: Rescue
    private band!: Band
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get wave(): Wave {
        return this.level.waves[this.index]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.index = 0
        this.deck = []
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

        this.room = createRoom(this)
        this.audio = createAudio(this)
        this.signs = createSigns(this, index => this.pick(index))
        this.ball = createBall(this)
        this.rescue = createRescue(this)
        this.controls = createControls(this, {
            probe: (x, y) => this.signs.hitAt(x, y),
            onAim: index => {
                this.signs.aimAt(index)
                if (index !== null) this.audio.tap()
            },
            onFire: at => void this.shoot(at),
        })
        this.band = createBand(this)
        this.hud = createHud(this, {
            level: this.level.level,
            waves: this.level.waves.length,
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
            tint: C.coral,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playWave(0)
    }

    private shutdownScene() {
        this.gen++
        this.band?.destroy()
        this.rescue?.destroy()
        this.controls?.destroy()
        this.ball?.destroy()
        this.signs?.destroy()
        this.hud?.destroy()
        this.room?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private async playWave(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.applyInput()

        this.signs.hideLock()
        void this.band.hush()
        this.rescue.clear()
        this.hud.setDone(this.done)

        this.deck = shuffled(this.wave.cards)
        this.signs.setMode(this.wave.movement, this.level.covered === true)
        this.audio.slide()
        await this.signs.show(this.deck)
        if (gen !== this.gen) return

        await this.ball.rest()
        if (gen !== this.gen) return

        this.mode = 'choosing'
        this.controls.reset()
        this.applyInput()

        if (this.pendingTutorial && index === 0) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    /* ─────────────────────────── escolha e arremesso ──────────────────── */

    /**
     * Tocar na placa LEVA A MIRA até ela, não dispara.
     *
     * É um atalho para quem não quer percorrer a parede de seta em seta, e ele
     * não anula nada: a mira vai para onde a placa está AGORA, e com placas em
     * movimento continua sendo o instante do arremesso que decide.
     */
    private pick(index: number) {
        if (this.mode !== 'choosing' || this.tutorialOpen) return
        this.controls.aimAtX(this.signs.centerOf(index).x)
    }

    private async shoot(at: Point) {
        if (this.tutorialOpen || this.mode !== 'choosing') return
        const gen = this.gen

        this.mode = 'flying'
        this.applyInput()
        this.signs.hideLock()
        this.signs.aimAt(null)
        void this.band.hush()

        this.audio.release()
        await this.ball.wind()
        if (gen !== this.gen) return

        const struck = await this.ball.throwAt(at, (x, y) => this.signs.hitAt(x, y), THROW_POWER)
        if (gen !== this.gen) return

        const card = struck === null ? null : this.deck[struck]
        if (struck === null || !card) {
            await this.missed()
            return
        }
        if (!this.signs.isRevealed(struck)) {
            await this.uncover(struck)
            return
        }
        if (isSuspicious(card)) await this.succeed(struck, card)
        else await this.stall(struck, card)
    }

    /**
     * Acertou uma placa que ainda estava coberta.
     *
     * ABRIR NÃO É RESPONDER. A bolinha derruba a tampa, a placa mostra o que
     * estava escrito e o jogo espera de novo — sem emitir nada, sem tirar vida
     * e sem contar tentativa. A criança abre quantas quiser antes de acusar; o
     * que o nível 3 cobra é ter LIDO antes de decidir, e cobrar isso seria
     * impossível se o primeiro arremesso já valesse como acusação.
     */
    private async uncover(index: number) {
        const gen = this.gen
        this.audio.bounce()
        await FX.all(this.ball.bounceOff(), this.signs.reveal(index))
        if (gen !== this.gen) return
        this.audio.save()
        await this.ball.rest()
        if (gen !== this.gen) return
        this.mode = 'choosing'
        this.applyInput()
    }

    /**
     * A bolinha atravessou a parede vazia.
     *
     * Nada é emitido, nenhuma vida cai, a tentativa não conta e a onda não
     * anda. Errar a pontaria não é errar a resposta: a EF03CO09 pergunta qual
     * compartilhamento é arriscado, não se a criança tem mira boa.
     */
    private async missed() {
        const gen = this.gen
        this.audio.bounce()
        await this.ball.fallShort()
        if (gen !== this.gen) return
        await this.ball.rest()
        if (gen !== this.gen) return
        this.mode = 'choosing'
        this.applyInput()
    }

    /* ────────────────────────────── resultado ─────────────────────────── */

    private async succeed(index: number, card: TargetCard) {
        const gen = this.gen
        this.mode = 'impact'
        this.applyInput()

        const points = this.stalled ? POINTS_AFTER_STALL : POINTS_CLEAN
        this.score += points
        this.hits += 1
        this.done += 1

        await FX.all(
            this.ball.vanish(),
            this.signs.fall(index, () => this.audio.crash()),
        )
        if (gen !== this.gen) return
        this.audio.thump()

        const where = this.signs.centerOf(index)
        void FX.sparks(this, where.x, where.y, { color: C.green, count: 16, spread: 150, depth: DEPTH.fx })
        await FX.wait(this, 420)
        if (gen !== this.gen) return

        /*
         * A ORDEM AQUI É O CONTEÚDO.
         *
         * A placa caída, deitada, ocupa a faixa da tela onde a dica aparece. Se
         * a frase entrasse antes de ela sumir, a explicação do impacto — que é
         * o motivo do jogo existir — nasceria atrás de uma placa de madeira.
         * Por isso `sink` vem primeiro, e só então a faixa e o resgate.
         */
        await this.signs.sink(index)
        if (gen !== this.gen) return

        void this.band.say(card.note, 'good')
        await this.rescue.play(where, card.kind, () => {
            this.audio.save()
            void this.hud.catchData()
        })
        if (gen !== this.gen) return

        this.audio.deliver()
        await this.signs.deliver()
        if (gen !== this.gen) return

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.wave()
        await this.hud.celebrate(this.done - 1)
        if (gen !== this.gen) return
        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        void this.band.hush()
        this.ball.hide()
        const next = this.index + 1
        if (next < this.level.waves.length) void this.playWave(next)
        else void this.endLevel()
    }

    private async stall(index: number, card: TargetCard) {
        const gen = this.gen
        this.tries += 1

        this.audio.bounce()
        await FX.all(this.ball.bounceOff(), this.signs.shake(index))
        if (gen !== this.gen) return

        this.signs.showLock(index)
        void this.band.say(card.note, 'warn')

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

        await FX.wait(this, 900)
        if (gen !== this.gen) return

        if (this.tries >= 2) {
            const right = this.deck.findIndex(isSuspicious)
            if (right >= 0) this.signs.pulse(right)
        }

        // a bolinha volta ANTES de o modo abrir. Na ordem trocada havia um
        // vão de meio segundo em que o jogo já se dizia jogável e os botões
        // ainda estavam desligados: quem apertasse ali não era atendido
        await this.ball.rest()
        if (gen !== this.gen) return
        this.mode = 'choosing'
        this.applyInput()
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
        if (last) void FX.confetti(this, { colors: [C.cyan, C.green, C.amber, C.blue] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.blue,
            panelColor: C.paper,
            overlayColor: C.ink,
            depth: 5000,
            title: last ? 'Protetor de dados!' : 'Sala protegida!',
            // cada aviso conta o que MUDA no nível seguinte, para a criança não
            // descobrir a regra nova levando um susto
            message: last
                ? 'Antes de compartilhar, veja qual é o dado, de quem ele é e até onde pode chegar.'
                : this.level.level === 1
                  ? 'Agora as placas se mexem e o destino muda o risco. Leia antes de arremessar.'
                  : 'Agora as placas vêm cobertas. Acerte uma para ler, e só depois acuse a suspeita.',
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
                              color: C.blue,
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

    /**
     * As placas andam SEMPRE que a onda está em jogo, inclusive com a bolinha
     * no ar — é disso que depende a colisão do instante — e inclusive durante o
     * tutorial, porque uma parede congelada ensinaria um jogo que não existe.
     * Param no fim do nível e enquanto a placa derrubada cai.
     */
    update(_time: number, delta: number) {
        if (this.mode !== 'done' && this.mode !== 'impact') this.signs.update(delta)
        if (this.mode === 'choosing' && !this.tutorialOpen) this.controls.tick(delta)
    }

    private applyInput() {
        const free = !this.tutorialOpen && this.mode === 'choosing'
        this.signs.setEnabled(free, this.mode === 'flying' || this.mode === 'impact')
        this.controls.setEnabled(free)
        // a mira continua desenhada no tutorial, que fala dela; some é no voo
        this.controls.setSight(this.mode === 'choosing')
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'done')
    }

    private tutorialSteps(full: boolean) {
        const right = this.deck.findIndex(isSuspicious)
        const target = this.signs.centerOf(right >= 0 ? right : 0)
        const width = this.signs.width()
        const steps = [
            {
                text: 'Leia o dado e o destino de cada placa.',
                shape: 'rect' as const,
                ...this.signs.bounds(),
                balloonX: 640,
                balloonY: 540,
            },
            {
                text: 'Ache o compartilhamento suspeito.',
                shape: 'rect' as const,
                ...this.hud.orderBounds(),
                balloonX: 640,
                balloonY: 260,
            },
            {
                text: 'As setas movem a mira. Pare em cima da placa.',
                shape: 'rect' as const,
                ...this.controls.arrowsBounds(),
                balloonX: 700,
                balloonY: 424,
                pointer: {
                    fromX: PREV.x,
                    fromY: PREV.y,
                    toX: PREV.x,
                    toY: PREV.y,
                    tap: true,
                },
            },
            {
                text: 'Toque em JOGAR para arremessar.',
                shape: 'circle' as const,
                x: FIRE.x,
                y: FIRE.y,
                w: FIRE.r * 2 + 44,
                h: FIRE.r * 2 + 44,
                balloonX: 540,
                balloonY: 424,
                buttonLabel: 'Vamos!',
                pointer: {
                    fromX: FIRE.x,
                    fromY: FIRE.y,
                    toX: FIRE.x,
                    toY: FIRE.y,
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
            key: `ef03co09-ache-o-suspeito-l${this.level.level}`,
            once,
            accent: C.cyan,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(full),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'choosing') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.waves.length
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
