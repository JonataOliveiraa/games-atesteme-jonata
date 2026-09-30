import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, expectedBit, pointsFor, sizeOf, solves, validateLevels } from '../data/levels'
import { BLOCK, BUTTON, DEPTH, H, HUD, LANE_Y, SHOT, W } from '../data/layout'
import { C } from '../data/theme'
import type { Bit, LevelDef, Mode, PhaseDef } from '../types'
import { createTunnel, type Tunnel } from './tunnel'
import { createMachine, type Machine } from './machine'
import { createShip, type Ship } from './ship'
import { createBlock, type Block } from './blocks'
import { createControls, type Controls } from './controls'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { paintFilled, paintHole } from './paper'

const GAME_ID = 'pista-binaria'

interface Shot {
    bit: Bit
    target: Block
    object: Phaser.GameObjects.Container
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  NÍVEL, FASE E O QUE CUSTA VIDA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Nível tem FASES, e cada fase é uma entrega: um desenho inteiro atravessando
 * o túnel. A fase concluída vira figurinha numa bolinha do cabeçalho; o nível
 * acaba quando todas as bolinhas acendem, e aí a nave leva o álbum embora.
 *
 * Dois desfechos que não podem ser confundidos:
 *
 *   ninguém atirou  →  a caixa da frente ENCOSTA e a fila engarrafa atrás
 *                      dela. Não custa vida: dedo lento não é erro de cabeça.
 *   dígito ERRADO   →  TRAVA: a fila para, a caixa treme e o botão certo pulsa.
 *                      Custa uma vida, uma vez por fase.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private grid = 5
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0

    private blocks: Block[] = []
    private shot?: Shot
    private spawnRow = 0
    private spawnCol = 0
    private delivered = 0
    private streak = 0
    private stalled = false

    private score = 0
    private hits = 0
    private errors = 0

    private tutorialOpen = false

    private tunnel!: Tunnel
    private machine!: Machine
    private ship!: Ship
    private controls!: Controls
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics

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

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.grid = sizeOf(this.level)

        this.phaseIndex = 0
        this.mode = 'intro'
        this.blocks = []
        this.shot = undefined
        this.spawnRow = 0
        this.spawnCol = 0
        this.delivered = 0
        this.streak = 0
        this.stalled = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.tutorialOpen = false
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.tunnel = createTunnel(this)
        this.machine = createMachine(this, this.grid)
        this.ship = createShip(this)
        this.audio = createAudio(this)
        this.controls = createControls(this, { onPick: bit => this.pick(bit) })
        this.hud = createHud(this, {
            level: this.level.level,
            phases: this.level.phases.length,
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
            size: 30,
            tint: C.coral,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.applyInput()
        this.runTutorial()
    }

    private shutdownScene() {
        this.gen++
        this.blocks.forEach(block => block.destroy())
        this.shot?.object.destroy()
        this.controls?.destroy()
        this.hud?.destroy()
        this.ship?.destroy()
        this.machine?.destroy()
        this.tunnel?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ───────────────────────────────── o laço ─────────────────────────── */

    update(_time: number, delta: number) {
        // trava de aba e de breakpoint: sem isso um quadro longo teleporta a
        // fila por cima da nave e o tiro nunca encontra ninguém
        const dt = Math.min(delta, 50) / 1000
        const moving = this.mode === 'jogando' && !this.tutorialOpen

        this.tunnel.update(dt, moving)
        this.ship.update(dt, moving)

        if (moving) {
            this.advanceQueue(dt)
            this.fillQueue()
        }
        if (!this.tutorialOpen) this.advanceShot(dt)
    }

    /**
     * A fila anda até encostar. Cada caixa tem um lugar na fila, e é esse
     * lugar que segura o engarrafamento quando ninguém atira.
     */
    private advanceQueue(dt: number) {
        const step = this.level.speed * dt
        this.blocks.forEach((block, index) => {
            const floor = BLOCK.stopX + index * BLOCK.gap
            block.moveTo(Math.max(block.x - step, floor))
        })
    }

    private fillQueue() {
        if (this.spawnRow >= this.grid) return
        const last = this.blocks[this.blocks.length - 1]
        if (last && last.x > BLOCK.spawnX - BLOCK.gap) return

        const bit = expectedBit(this.phase, this.spawnRow, this.spawnCol)
        this.blocks.push(createBlock(this, bit, this.spawnRow, this.spawnCol))

        this.spawnCol += 1
        if (this.spawnCol >= this.grid) {
            this.spawnCol = 0
            this.spawnRow += 1
        }
    }

    private advanceShot(dt: number) {
        const shot = this.shot
        if (!shot) return

        shot.object.x += SHOT.speed * dt
        shot.object.angle += dt * 220

        if (!shot.target.alive) {
            shot.object.destroy()
            this.shot = undefined
            return
        }

        // encontro na FACE da caixa, não no centro: é onde o olho vê bater
        if (shot.object.x >= shot.target.x - BLOCK.size * 0.3) {
            this.shot = undefined
            void this.impact(shot)
            return
        }

        if (shot.object.x > W + 120) {
            shot.object.destroy()
            this.shot = undefined
        }
    }

    /* ─────────────────────────────── o disparo ────────────────────────── */

    private pick(bit: Bit) {
        if (this.tutorialOpen) return
        if (this.mode !== 'jogando' && this.mode !== 'travado') return
        if (this.shot) return

        const target = this.blocks[0]
        if (!target) return

        this.controls.flash(bit)
        this.ship.kick()
        this.audio.fire(bit)

        this.shot = { bit, target, object: this.ship.spawnShot(bit) }
    }

    private async impact(shot: Shot) {
        const target = shot.target
        const right = solves(shot.bit, this.phase, target.row, target.col)

        if (right) {
            void FX.sparks(this, shot.object.x, shot.object.y, {
                color: C.yellow,
                count: 12,
                spread: 80,
                size: 9,
            })
            shot.object.destroy()
            await this.convert(target)
            return
        }

        // o dígito errado NÃO entra: ele bate e volta
        void FX.to(
            this,
            shot.object,
            { x: shot.object.x - 150, y: shot.object.y + 120, angle: -180, alpha: 0 },
            { duration: 460, ease: 'Quad.easeIn' },
        ).then(() => shot.object.destroy())

        await this.trip(target)
    }

    /* ──────────────────────────────── acerto ──────────────────────────── */

    private async convert(target: Block) {
        const gen = this.gen

        if (this.mode === 'travado') {
            this.mode = 'jogando'
            this.controls.hush()
            target.unlock()
        }

        this.streak += 1
        this.audio.hit(target.bit, this.streak)

        const from = target.holePoint()
        const to = this.machine.cellPoint(target.row, target.col)
        this.blocks = this.blocks.filter(block => block !== target)
        void target.burst()

        await this.flyPiece(target.bit, from, to)
        if (gen !== this.gen) return

        this.machine.set(target.row, target.col, target.bit)
        this.delivered += 1

        if (target.col === this.grid - 1) void this.machine.flashRow(target.row)
        if (this.delivered >= this.grid * this.grid) void this.finishPhase()
    }

    /** O pedaço não vai em linha reta: ele é arremessado até a máquina. */
    private async flyPiece(bit: Bit, from: { x: number; y: number }, to: { x: number; y: number }) {
        const piece = this.add.graphics().setDepth(DEPTH.flight)
        const size = BLOCK.inner
        if (bit === 1) paintFilled(piece, 0, 0, size)
        else paintHole(piece, 0, 0, size, C.navy)
        piece.setPosition(from.x, from.y)

        const end = this.machine.cellSize() / size
        await FX.to(this, piece, { scale: 1.2 }, { duration: 90, ease: 'Back.easeOut' })
        void FX.to(this, piece, { scale: end, angle: 160 }, { duration: 420, ease: 'Sine.easeIn' })
        await FX.arcTo(this, piece, to, { height: 120, duration: 420 })
        piece.destroy()
    }

    /* ──────────────────────────── fim da fase ─────────────────────────── */

    private async finishPhase() {
        const gen = this.gen
        this.mode = 'entregando'
        this.applyInput()

        const points = pointsFor(this.level, this.stalled)
        this.score += points
        this.hits += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.row()
        await this.machine.pulse()
        if (gen !== this.gen) return

        // a figurinha sai da máquina e vai para a bolinha da fase, no álbum
        const card = this.machine.makeCard(this.phase.art)
        const base = card.scale
        this.audio.card()
        await FX.to(
            this,
            card,
            { y: card.y - 70, scaleX: base * 1.12, scaleY: base * 1.12, angle: -6 },
            { duration: 420, ease: 'Back.easeOut' },
        )
        if (gen !== this.gen) return

        const dot = this.hud.dotPoint(this.phaseIndex)
        await FX.to(
            this,
            card,
            { x: dot.x, y: dot.y, scaleX: 0.06, scaleY: 0.06, angle: 160 },
            { duration: 520, ease: 'Back.easeIn' },
        )
        card.destroy()
        if (gen !== this.gen) return

        this.audio.swallow()
        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) {
            this.startPhase(next)
            return
        }
        void this.finishLevel()
    }

    private startPhase(index: number) {
        this.phaseIndex = index
        this.spawnRow = 0
        this.spawnCol = 0
        this.delivered = 0
        this.streak = 0
        this.stalled = false
        this.machine.clear()
        this.mode = 'jogando'
        this.applyInput()
    }

    /* ───────────────────────────────── erro ───────────────────────────── */

    private async trip(target: Block) {
        const gen = this.gen
        this.mode = 'travado'
        this.streak = 0

        this.audio.wrong()
        void this.flashFrame()
        this.loseOnce()

        await target.lock()
        if (gen !== this.gen) return
    }

    /** Uma vida por FASE, no primeiro erro dela. Os seguintes, não. */
    private loseOnce() {
        if (this.stalled) return
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

    private async flashFrame() {
        this.frame.clear()
        this.frame.lineStyle(16, C.red, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 380 })
    }

    /* ─────────────────────────────── fim do nível ─────────────────────── */

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

        await this.controls.hide()
        if (gen !== this.gen) return

        await this.collectAlbum()
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.coral,
            panelColor: C.cream,
            overlayColor: C.navyDeep,
            depth: 5000,
            title: this.level.title,
            message: this.level.closing,
            progress: { total: LEVELS.length, current: this.level.level, size: 9 },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.turquoise,
                              onClick: () =>
                                  this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                          },
                          {
                              label: 'Escolher jogo',
                              color: C.coral,
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

    /**
     * A NAVE LEVA O ÁLBUM.
     *
     * As figurinhas do nível saem das bolinhas do cabeçalho, atravessam a tela
     * e entram pela escotilha, uma a uma. É o que fecha a viagem: o que a
     * criança transmitiu vira objeto e vai junto com ela.
     */
    private async collectAlbum() {
        const gen = this.gen
        await this.ship.comeBack(420, LANE_Y)
        if (gen !== this.gen) return

        for (let i = 0; i < this.level.phases.length; i++) {
            const dot = this.hud.dotPoint(i)
            const card = this.machine.makeCard(this.level.phases[i].art, { x: dot.x, y: dot.y, scale: 0.08 })
            const hatch = this.ship.portholePoint()

            this.audio.card()
            await FX.to(
                this,
                card,
                { x: 880, y: LANE_Y - 20, scaleX: 1.15, scaleY: 1.15, angle: -8 },
                { duration: 520, ease: 'Back.easeOut' },
            )
            if (gen !== this.gen) return

            await FX.to(
                this,
                card,
                { x: hatch.x, y: hatch.y, scaleX: 0.03, scaleY: 0.03, angle: 220 },
                { duration: 480, ease: 'Back.easeIn' },
            )
            card.destroy()
            if (gen !== this.gen) return

            this.audio.swallow()
            await this.ship.swallow()
            if (gen !== this.gen) return
        }

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.coral, C.yellow, C.turquoise, C.cream] })
        this.audio.blast()
        await this.ship.blastOff()
    }

    /* ──────────────────────────────── resto ───────────────────────────── */

    private applyInput() {
        const free = !this.tutorialOpen && (this.mode === 'jogando' || this.mode === 'travado')
        this.controls.setEnabled(free)
        this.hud.setEnabled(!this.tutorialOpen && this.mode !== 'entregando' && this.mode !== 'fim')
    }

    /**
     * O tutorial é para VER, não para ler: seis palavras e dois dedos batendo.
     * A fila só começa a andar quando ele termina, e ele só aparece uma vez na
     * partida — nos outros níveis o jogo é o mesmo e a criança já sabe.
     */
    private runTutorial(once = true) {
        this.tutorialOpen = true
        this.applyInput()

        createTutorial(this, {
            key: 'ef04co04pb-l1',
            once,
            accent: C.coral,
            safeTop: HUD.h + 10,
            steps: [
                {
                    text: 'Cheio é 1.',
                    shape: 'rect',
                    x: BUTTON.oneX,
                    y: BUTTON.y,
                    w: BUTTON.w + 24,
                    h: BUTTON.h + 24,
                    balloonY: LANE_Y + 130,
                    pointer: { fromX: BUTTON.oneX, fromY: BUTTON.y, toX: BUTTON.oneX, toY: BUTTON.y, tap: true },
                },
                {
                    text: 'Vazio é 0.',
                    shape: 'rect',
                    x: BUTTON.zeroX,
                    y: BUTTON.y,
                    w: BUTTON.w + 24,
                    h: BUTTON.h + 24,
                    balloonY: LANE_Y + 130,
                    pointer: { fromX: BUTTON.zeroX, fromY: BUTTON.y, toX: BUTTON.zeroX, toY: BUTTON.y, tap: true },
                },
            ],
            onFinish: () => {
                this.tutorialOpen = false
                if (this.mode === 'intro') this.mode = 'jogando'
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen) return
        if (this.mode !== 'jogando' && this.mode !== 'travado') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.phases.length
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
