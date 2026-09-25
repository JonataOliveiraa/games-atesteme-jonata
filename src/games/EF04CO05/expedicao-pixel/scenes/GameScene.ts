import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import {
    LEVELS,
    POINTS_AFTER_STALL,
    POINTS_CLEAN,
    TOTAL_ROUNDS,
    matches,
    missText,
    nextStep,
    toColor,
    validateLevels,
    worstChannel,
} from '../data/levels'
import { HUD } from '../data/layout'
import { C } from '../data/theme'
import type { Channel, LevelDef, Mix, Phase, Round } from '../types'
import { createFair, createMaster, type Fair, type Master } from './effects'
import { createSky, type Sky } from './sky'
import { createBoard, type Board } from './board'
import { createConsole, type Console } from './console'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'expedicao-pixel'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  MEXER E LANÇAR SÃO COISAS SEPARADAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * É a única regra fina do jogo. Se cada toque numa torneira fosse uma tentativa,
 * experimentar a cor — que é exatamente o que ensina — custaria vidas, e a
 * criança pararia de experimentar.
 *
 * ── O ERRO NÃO TIRA O ESPETÁCULO ─────────────────────────────────────────
 *
 * O fogo errado sobe e estoura do mesmo jeito, ao lado do círculo da cor pedida.
 * A criança vê os dois no céu e descobre sozinha o que faltou — e é por isso que
 * a TRAVA daqui não prende a mão: ela só impede um segundo lançamento sem que
 * nada tenha mudado. Mexer numa torneira destrava, porque mexer é a única
 * maneira de corrigir.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private roundIndex = 0
    private gen = 0

    private phase: Phase = 'misturando'
    private mix: Mix = { r: 0, g: 0, b: 0 }

    private tries = 0
    private stalled = false
    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private tutorialOpen = false

    private fair!: Fair
    private sky!: Sky
    private board!: Board
    private deck!: Console
    private master!: Master
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    private get round(): Round {
        return this.level.rounds[this.roundIndex]
    }

    init(data?: { level?: number; points?: number; lives?: number }) {
        validateLevels()

        const index = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.level = LEVELS[index]
        this.roundIndex = 0
        this.score = data?.points ?? 0

        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        this.gen = 0
        this.phase = 'pausado'
        this.mix = { r: 0, g: 0, b: 0 }
        this.tries = 0
        this.stalled = false
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.tutorialOpen = false
    }

    create() {
        this.fair = createFair(this)
        this.sky = createSky(this)
        this.board = createBoard(this)
        this.master = createMaster(this)
        this.audio = createAudio(this)

        this.deck = createConsole(this, {
            steps: this.level.tapSteps,
            onTap: channel => this.onTap(channel),
            onLaunch: () => void this.onLaunch(),
        })

        this.hud = createHud(this, {
            level: this.level.level,
            rounds: this.level.rounds.length,
            onHelp: () => this.replayTutorial(),
        })
        this.hud.setTitle(this.level.title)

        // FORA de qualquer container que sofra removeAll()
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 30,
            tint: C.trava,
            stage: () => this.level.level,
        })

        this.bindKeyboard()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        /*
         * Só no dev server: com o pane do navegador escondido o Phaser congela,
         * e sem uma alça para a cena não dá para dirigir o jogo por JS nem
         * conferir estado. Some no build.
         */
        if (import.meta.env.DEV) {
            ;(window as unknown as { __EP?: unknown }).__EP = this
        }

        void this.playRound(0)
    }

    private shutdownScene() {
        this.gen += 1
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.lives?.destroy()
        this.deck?.destroy()
        this.board?.destroy()
        this.sky?.destroy()
        this.master?.destroy()
        this.hud?.destroy()
        this.fair?.destroy()
    }

    /* ─────────────────────────────── a rodada ─────────────────────────── */

    private async playRound(index: number) {
        const gen = ++this.gen
        this.roundIndex = index

        // `tries` e `stalled` são estado de MOMENTO: zeram em toda rodada nova,
        // senão a segunda cobraria a vida que a primeira já cobrou
        this.tries = 0
        this.stalled = false
        this.mix = { r: 0, g: 0, b: 0 }

        this.phase = 'pausado'
        this.applyInput()

        this.master.hush()
        this.master.leave()
        this.deck.hideLock()
        this.deck.setMix(this.mix, toColor(this.mix))
        this.board.setAsk(toColor(this.round.target), this.round.nome)
        this.board.setMix(toColor(this.mix))
        this.hud.setDone(this.done)
        this.deck.reload()

        await FX.wait(this, 280)
        if (gen !== this.gen) return

        this.phase = 'misturando'
        this.applyInput()

        if (index === 0) this.runTutorial(false)
    }

    /* ──────────────────────────────── toque ──────────────────────────── */

    private onTap(channel: Channel) {
        if (this.tutorialOpen) return

        // a TRAVA some no instante em que algo muda: ela existia só para
        // impedir um segundo lançamento idêntico
        if (this.phase === 'travado') {
            this.phase = 'misturando'
            this.master.hush()
            this.deck.hideLock()
        }
        if (this.phase !== 'misturando') return

        const value = nextStep(this.mix[channel], this.level.tapSteps)
        this.mix = { ...this.mix, [channel]: value }

        const color = toColor(this.mix)
        this.deck.setMix(this.mix, color)
        this.board.setMix(color)
        this.audio.tap(value)
    }

    private async onLaunch() {
        if (this.tutorialOpen || this.phase !== 'misturando') return

        const gen = this.gen
        const acertou = matches(this.mix, this.round.target)
        const color = toColor(this.mix)

        this.phase = 'voando'
        this.applyInput()
        this.master.hush()

        await this.deck.fire()
        if (gen !== this.gen) return

        /*
         * ══════════════════════════════════════════════════════════════════
         *  O LANÇAMENTO É UMA CENA
         * ══════════════════════════════════════════════════════════════════
         *
         * Mesa, placa e cabeçalho saem; fica o céu, a praça e o foguete. É o
         * único trecho do jogo em que não há nada para decidir — e é o momento
         * que paga o esforço da mistura, então merece a tela inteira.
         */
        const nose = this.deck.rocketNose()
        await FX.all(this.deck.hide(), this.board.hide(), this.hud.fade(0))
        if (gen !== this.gen) return

        this.audio.whistle()
        await FX.wait(this, 200)
        if (gen !== this.gen) return

        this.audio.burst()
        await this.sky.launch(color, nose.x, nose.y)
        if (gen !== this.gen) return

        await FX.all(this.deck.show(), this.board.show(), this.hud.fade(1))
        if (gen !== this.gen) return

        if (acertou) await this.hit(color)
        else await this.miss()
    }

    private async hit(color: number) {
        const gen = this.gen
        this.done += 1
        this.hits += 1

        const points = this.stalled ? POINTS_AFTER_STALL : POINTS_CLEAN
        this.score += points
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.crowd()
        void this.board.celebrate()
        await this.sky.store(this.done - 1, color)
        if (gen !== this.gen) return

        await this.hud.celebrate(this.done - 1)
        if (gen !== this.gen) return

        await FX.wait(this, 900)
        if (gen !== this.gen) return

        const next = this.roundIndex + 1
        if (next < this.level.rounds.length) void this.playRound(next)
        else void this.endLevel()
    }

    private async miss() {
        const gen = this.gen
        this.tries += 1
        this.phase = 'travado'

        // uma vida por rodada, no primeiro erro. Os seguintes, não: a criança já
        // pagou por não ter entendido, e continua tentando.
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

        this.audio.sigh()
        this.deck.reload()
        await this.deck.showLock()
        if (gen !== this.gen) return

        await this.master.say(missText(this.mix, this.round.target))
        if (gen !== this.gen) return

        this.applyInput()

        // depois do segundo fogo errado na MESMA rodada, a torneira do canal
        // mais distante pulsa. O valor certo continua não aparecendo.
        if (this.tries >= 2) {
            void this.deck.hint(worstChannel(this.mix, this.round.target))
        }
    }

    /* ────────────────────────────── fim do nível ──────────────────────── */

    private async endLevel() {
        const gen = ++this.gen
        this.phase = 'fim'
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

        /*
         * O MESTRE ENTRA AQUI, E SÓ AQUI.
         *
         * Acima do véu do painel (5000), à esquerda dele: é a única hora do
         * nível em que alguém tem o que comemorar, e a única em que sobra tela
         * para ele ser grande.
         */
        this.audio.win()
        this.master.hush()
        this.master.cheer(5001)
        await this.sky.twinkle()
        if (gen !== this.gen) return

        void FX.confetti(this, { colors: [C.r, C.g, C.b, C.warm] })
        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.warm,
            panelColor: 0xf3e6cd,
            overlayColor: C.skyHigh,
            depth: 5000,
            title: last ? 'Você é o mestre dos fogos!' : 'Que show de fogos!',
            message: last
                ? 'Cada pontinho da tela do seu celular faz o mesmo que você: acende três luzinhas e soma. Lá, cada uma vai de 0 a 255.'
                : this.level.level === 2
                  ? 'Duas luzes juntas fazem uma cor nova. As três juntas fazem branco.'
                  : 'Cada fogo do varal é uma cor que você fez com três luzes.',
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.ok,
                              onClick: () =>
                                  this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.brass,
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

    /* ──────────────────────────────── tutorial ───────────────────────── */

    /**
     * Quatro falas, na ordem em que o olho anda: pedido → ferramenta → prévia →
     * ação. A terceira é a que ensina o jogo inteiro, porque é onde a criança vê
     * a torneira mexer na cor.
     */
    private tutorialSteps(): TutorialStep[] {
        const board = this.board.bounds()
        const taps = this.deck.allTapsBounds()
        const red = this.deck.tapBounds('r')
        const launch = this.deck.launchBounds()

        return [
            {
                text: 'A festa pediu esta cor.',
                shape: 'rect',
                x: board.x,
                y: board.y,
                w: board.w,
                h: board.h,
                balloonX: 760,
                balloonY: 300,
            },
            {
                text: this.level.objective,
                shape: 'rect',
                x: taps.x,
                y: taps.y,
                w: taps.w,
                h: taps.h,
                balloonX: 640,
                balloonY: 250,
            },
            {
                text:
                    this.level.tapSteps === 4
                        ? 'Toque de novo na mesma torneira para abrir mais: 0, 1, 2, 3.'
                        : 'Abra uma torneira e veja o foguete mudar de cor.',
                shape: 'rect',
                x: red.x,
                y: red.y,
                w: red.w,
                h: red.h,
                balloonX: 780,
                balloonY: 250,
                pointer: { fromX: red.x, fromY: red.y, toX: red.x, toY: red.y, tap: true },
            },
            {
                text: 'Quando a sua luz ficar igual à da placa, aperte LANÇAR!',
                shape: 'rect',
                x: launch.x,
                y: launch.y,
                w: launch.w,
                h: launch.h,
                balloonX: 520,
                balloonY: 260,
                pointer: { fromX: launch.x, fromY: launch.y, toX: launch.x, toY: launch.y, tap: true },
            },
        ]
    }

    private runTutorial(force: boolean) {
        this.tutorialOpen = true
        this.applyInput()
        createTutorial(this, {
            key: `ef04co05ep-l${this.level.level}`,
            once: !force,
            accent: C.warm,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || (this.phase !== 'misturando' && this.phase !== 'travado')) return
        this.runTutorial(true)
    }

    /* ─────────────────────────────────── resto ───────────────────────── */

    private applyInput() {
        const free = !this.tutorialOpen && (this.phase === 'misturando' || this.phase === 'travado')
        this.deck.setEnabled(free)
        this.hud.setEnabled(!this.tutorialOpen && this.phase !== 'fim')
    }

    private bindKeyboard() {
        const board = this.input.keyboard
        if (!board) return
        const map: Array<[string, Channel]> = [
            ['ONE', 'r'],
            ['TWO', 'g'],
            ['THREE', 'b'],
        ]
        map.forEach(([key, channel]) => {
            board.on(`keydown-${key}`, () => this.onTap(channel))
        })
        board.on('keydown-SPACE', () => void this.onLaunch())
        this.events.once('shutdown', () => board.removeAllListeners())
    }

    private emitCheckpoint(complete = false) {
        /*
         * O progresso é do JOGO, não do nível.
         *
         * `hits` zera a cada `scene.restart`, então contar só ele fazia o nível 3
         * terminar com os mesmos 33% do nível 1. As rodadas dos níveis anteriores
         * entram pelo número do nível.
         */
        const feitas = complete ? this.level.rounds.length : this.hits
        const anteriores = LEVELS.slice(0, this.level.level - 1).reduce((n, l) => n + l.rounds.length, 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(anteriores + feitas, TOTAL_ROUNDS) / TOTAL_ROUNDS) * 100),
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
