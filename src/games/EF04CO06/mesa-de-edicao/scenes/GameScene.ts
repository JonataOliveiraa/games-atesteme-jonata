import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, aplicar, pendencias, pointsFor, validateLevels } from '../data/levels'
import { BALLOON, DELIVER, DEPTH, H, HUD, PIECE, TOOL, W, suporteGeo } from '../data/layout'
import { C } from '../data/theme'
import type { Editor, Fase, Ferramenta, LevelDef, Mode, Peca } from '../types'
import { createRoom, type Room } from './room'
import { createPiece, type Piece } from './piece'
import { createClient, type Client } from './client'
import { createBench, type Bench } from './bench'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'mesa-de-edicao'

/** O que fazer, em uma ordem curta, por oficina. */
const ENUNCIADO: Record<Editor, string> = {
    texto: 'Arrume o cartaz e entregue',
    slides: 'Arrume os slides e entregue',
    video: 'Arrume o vídeo e entregue',
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE CUSTA VIDA, E O QUE NÃO CUSTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   apertar ferramenta  →  de graça, sem limite. É o verbo da habilidade:
 *                          "experimentam os recursos de um editor".
 *   ENTREGAR com falta  →  TRAVA. Uma vida, uma vez por fase; o bilhete diz o
 *                          que incomoda e o botão só destrava mexendo em algo.
 *
 * Se cada toque numa ferramenta contasse, experimentar sairia caro e a criança
 * pararia de experimentar — que é justamente o que o jogo existe para provocar.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private faseIndex = 0
    private peca!: Peca
    private mode: Mode = 'editando'
    private gen = 0

    private travou = false
    private errosNaFase = 0
    private score = 0
    private hits = 0
    private errors = 0
    private tutorialOpen = false

    private room!: Room
    private piece!: Piece
    private client!: Client
    private bench!: Bench
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics

    private unsubPlatform?: () => void

    private get fase(): Fase {
        return this.level.fases[this.faseIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.faseIndex = 0
        this.mode = 'editando'
        this.travou = false
        this.errosNaFase = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.tutorialOpen = false
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.room = createRoom(this)
        this.piece = createPiece(this, this.level.editor)
        this.client = createClient(this)
        this.audio = createAudio(this)
        this.bench = createBench(this, {
            tools: this.level.ferramentas,
            onTool: tool => this.useTool(tool),
            onDeliver: () => void this.deliver(),
        })
        this.hud = createHud(this, {
            level: this.level.level,
            goal: ENUNCIADO[this.level.editor],
            fases: this.level.fases.length,
            onHelp: () => this.replayTutorial(),
        })

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
            y: HUD.cy,
            size: 28,
            tint: C.amber,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startFase(0)
    }

    private shutdownScene() {
        this.gen++
        this.bench?.destroy()
        this.hud?.destroy()
        this.piece?.destroy()
        this.client?.destroy()
        this.room?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ────────────────────────────────── a fase ────────────────────────── */

    private startFase(index: number) {
        const gen = ++this.gen
        this.faseIndex = index
        this.travou = false
        this.errosNaFase = 0
        this.mode = 'editando'

        this.peca = { ...this.fase.peca }
        this.piece.reset()
        this.piece.render(this.peca)
        this.bench.render(this.peca)
        this.bench.hush(this.peca)
        this.bench.setLocked(false)
        this.client.setFace(this.fase.cliente)

        this.applyInput()

        // com a peça JÁ desenhada, a medida é a de verdade: uma fase que nasce
        // sem pendência seria entregue sem a criança tocar em nada, e isso não
        // aparece na conferência dos dados, que não sabe medir texto
        if (!pendencias(this.peca, this.fase, this.level.regras, this.piece.measure()).length) {
            console.error(`[${GAME_ID}] ${this.fase.id}: a peça já começa pronta`)
        }

        void this.client.say(this.fase.pedido).then(() => {
            if (gen !== this.gen) return
            if (index === 0) this.runTutorial()
        })
    }

    /** O toque na ferramenta: muda o estado, repinta e destrava. Nada mais. */
    private useTool(tool: Ferramenta) {
        if (this.tutorialOpen) return
        if (this.mode !== 'editando' && this.mode !== 'travado') return

        const antes = this.peca
        this.peca = aplicar(this.peca, tool)
        this.piece.render(this.peca)
        this.bench.render(this.peca)

        this.audio.tool(tool === 'som' ? this.peca.som : this.peca.tamanho)
        if (this.peca.tamanho !== antes.tamanho) this.audio.grow(this.peca.tamanho)
        void this.piece.react()

        if (this.mode === 'travado') {
            this.mode = 'editando'
            this.bench.setLocked(false)
            this.bench.hush(this.peca)
            void this.client.say(this.fase.pedido)
            this.applyInput()
        }
    }

    /* ─────────────────────────────── a entrega ────────────────────────── */

    private async deliver() {
        if (this.tutorialOpen || this.mode !== 'editando') return
        const gen = this.gen

        this.mode = 'entregando'
        this.applyInput()

        const faltas = pendencias(this.peca, this.fase, this.level.regras, this.piece.measure())

        this.audio.deliver()
        const alvo = this.client.point()
        await this.piece.flyTo(alvo.x, alvo.y)
        if (gen !== this.gen) return

        if (faltas.length === 0) {
            await this.approve()
            return
        }

        this.audio.hmm()
        void this.client.shrug()
        void this.client.note(faltas[0].queixa)
        await this.piece.comeBack()
        if (gen !== this.gen) return

        void this.piece.blink(C.amber)
        void this.flashFrame(C.amber)
        this.audio.lock()
        this.bench.setLocked(true)
        this.mode = 'travado'
        this.applyInput()

        this.loseOnce()
        this.errosNaFase += 1
        if (this.errosNaFase >= 2) this.bench.call(faltas[0].aponta, this.peca)
    }

    private async approve() {
        const gen = this.gen

        const points = pointsFor(this.travou)
        this.score += points
        this.hits += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.approve()
        void this.flashFrame(C.green)
        await this.client.cheer()
        if (gen !== this.gen) return

        void this.client.say(this.fase.elogio)

        const dot = this.hud.dotPoint(this.faseIndex)
        this.audio.pin()
        await this.piece.fileAway(dot.x, dot.y)
        if (gen !== this.gen) return

        await this.hud.celebrate(this.faseIndex)
        if (gen !== this.gen) return

        const next = this.faseIndex + 1
        if (next < this.level.fases.length) {
            this.startFase(next)
            return
        }
        void this.finishLevel()
    }

    /** Uma vida por FASE, no primeiro erro dela. Os seguintes, não. */
    private loseOnce() {
        if (this.travou) return
        this.travou = true
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

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(16, color, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 380 })
    }

    /* ───────────────────────────── fim do nível ───────────────────────── */

    private async finishLevel() {
        const gen = ++this.gen
        this.mode = 'fim'
        this.applyInput()

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

        await this.bench.hide()
        if (gen !== this.gen) return

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.amber, C.green, C.wall, C.blue] })

        showLevelComplete(this, {
            accent: C.amber,
            panelColor: C.paper,
            overlayColor: C.ink,
            depth: 5000,
            title: this.level.title,
            message: this.level.closing,
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.green,
                              onClick: () =>
                                  this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.amber,
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
        const free = !this.tutorialOpen && (this.mode === 'editando' || this.mode === 'travado')
        this.bench.setEnabled(free)
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'fim')
    }

    /**
     * Três falas, e cada uma diz o que FAZER.
     *
     * A primeira versão tinha quatro e descrevia a tela ("o convite dele é
     * este"), o que não ensina nada: a criança já vê o convite. Agora o tutorial
     * conta o objetivo inteiro em três frases — qual é o problema, qual é o
     * gesto, e quando acaba.
     */
    private runTutorial(once = true) {
        this.tutorialOpen = true
        this.applyInput()

        createTutorial(this, {
            key: `ef04co06me-l${this.level.level}`,
            once,
            accent: C.amber,
            safeTop: HUD.h + 10,
            steps: this.level.level === 1 ? this.tutorialDoPrimeiro() : this.tutorialDaOficina(),
            onFinish: () => {
                this.tutorialOpen = false
                this.applyInput()
            },
        })
    }

    private recorteDaBancada() {
        const ultimo = this.level.ferramentas.length - 1
        return {
            shape: 'rect' as const,
            x: (TOOL.xs[0] + TOOL.xs[ultimo]) / 2,
            y: TOOL.cy,
            w: TOOL.xs[ultimo] - TOOL.xs[0] + TOOL.w + 36,
            h: TOOL.h + 36,
        }
    }

    private recorteDaPeca() {
        const geo = suporteGeo(this.level.editor)
        return {
            shape: 'rect' as const,
            x: PIECE.cx,
            y: PIECE.cy,
            w: geo.outerW + 24,
            h: geo.outerH + 24,
        }
    }

    private dedoNaPrimeira() {
        const alvo = this.bench.pos(this.level.ferramentas[0])
        return { fromX: alvo.x, fromY: alvo.y, toX: alvo.x, toY: alvo.y, tap: true }
    }

    private tutorialDoPrimeiro(): TutorialStep[] {
        return [
            {
                text: 'O Téo não consegue ler o cartaz dele.',
                shape: 'rect',
                x: BALLOON.x + BALLOON.w / 2,
                y: BALLOON.y + BALLOON.h / 2,
                w: BALLOON.w + 24,
                h: BALLOON.h + 34,
                balloonX: 820,
                balloonY: 430,
            },
            {
                text: 'Aperte um botão e olhe o cartaz mudar.',
                ...this.recorteDaBancada(),
                balloonX: 310,
                balloonY: 200,
                pointer: this.dedoNaPrimeira(),
            },
            {
                text: 'Quando ele conseguir ler, é só ENTREGAR.',
                shape: 'rect',
                x: DELIVER.cx,
                y: DELIVER.cy,
                w: DELIVER.w + 36,
                h: DELIVER.h + 36,
                balloonX: 310,
                balloonY: 200,
                pointer: { fromX: DELIVER.cx, fromY: DELIVER.cy, toX: DELIVER.cx, toY: DELIVER.cy, tap: true },
            },
        ]
    }

    /**
     * Nos níveis 2 e 3 a criança já sabe jogar: muda a OFICINA, não a regra.
     * Duas falas — para quem a peça vai, e que a bancada trocou de botões.
     */
    private tutorialDaOficina(): TutorialStep[] {
        const slides = this.level.editor === 'slides'
        return [
            {
                text: slides
                    ? 'Tem texto que não cabe no slide da Bia.'
                    : 'A Bia filmou o vídeo da vovó de lado.',
                ...this.recorteDaPeca(),
                balloonX: 310,
                balloonY: 430,
            },
            {
                text: slides
                    ? 'Aperte um botão e olhe o slide mudar.'
                    : 'Aperte um botão e olhe o vídeo mudar.',
                ...this.recorteDaBancada(),
                balloonX: 310,
                balloonY: 200,
                pointer: this.dedoNaPrimeira(),
            },
        ]
    }

    private replayTutorial() {
        if (this.tutorialOpen) return
        if (this.mode !== 'editando' && this.mode !== 'travado') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.fases.length
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
