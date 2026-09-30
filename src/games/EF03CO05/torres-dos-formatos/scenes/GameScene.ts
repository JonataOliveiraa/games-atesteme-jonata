import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, belongs, formatOfFile } from '../data/levels'
import { BUCKET, CONTROLS, DEPTH, FALLER, H, HUD, LANE, W } from '../data/layout'
import { C } from '../data/theme'
import type { LevelDef, LevelNumber, Mode, WaveDef } from '../types'
import { createLanes, type Lanes } from './lanes'
import { createFaller, type Faller } from './faller'
import { createControls, type Controls } from './controls'
import { createLock, type Lock } from './lock'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'torres-dos-formatos'

const SHEET = 'conteudos'

/** Metade do caminho: onde o ninja larga o disfarce. */
const REVEAL_Y = (LANE.spawnY + LANE.landY) / 2

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private waveIndex = 0
    private mode: Mode = 'ready'
    private gen = 0

    private next = 0
    private tries = 0
    /** O ninja desce devagar do começo ao fim, revelado ou não. */
    private slow = false
    private swapped = false
    private lostLife = false

    private tutorialOpen = false
    private pendingTutorial = false

    private score = 0
    private hits = 0
    private errors = 0
    private wavesDone = 0

    private lanes!: Lanes
    private faller!: Faller
    private controls!: Controls
    private lock!: Lock
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get wave(): WaveDef {
        return this.level.waves[this.waveIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.waveIndex = 0
        this.mode = 'ready'
        this.next = 0
        this.tries = 0
        this.lostLife = false
        this.tutorialOpen = false
        this.pendingTutorial = number === 1
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.wavesDone = 0
    }

    create() {
        this.input.topOnly = true

        // Cada nível tem o seu fundo; sem ele, o jardim de reserva entra.
        const bg = this.textures.exists(this.level.bg) ? this.level.bg : 'bg-jardim-tecnologico'
        if (this.textures.exists(bg)) {
            this.add.image(W / 2, H / 2, bg).setDisplaySize(W, H + 2).setDepth(DEPTH.bg)
        } else {
            const grass = this.add.graphics().setDepth(DEPTH.bg)
            grass.fillStyle(0x9fd35a, 1)
            grass.fillRect(0, 0, W, H)
            grass.fillStyle(C.grassDark, 0.5)
            grass.fillEllipse(W / 2, H, W * 1.4, 420)
        }

        this.audio = createAudio(this)
        this.lanes = createLanes(this)
        this.faller = createFaller(this)
        this.faller.setSkinChance(this.level.skinTwo)
        this.controls = createControls(this, {
            onLeft: () => void this.move(-1),
            onRight: () => void this.move(1),
        })
        this.lock = createLock(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            waves: this.level.waves.length,
            onHelp: () => this.replayTutorial(),
        })

        // As setas do teclado fazem o mesmo que os botões: no computador o
        // dedo não é o único jeito de mover.
        // Sem o capture, a seta rola a página atrás do jogo.
        this.input.keyboard?.addCapture('LEFT,RIGHT')
        this.input.keyboard?.on('keydown-LEFT', this.onKeyLeft, this)
        this.input.keyboard?.on('keydown-RIGHT', this.onKeyRight, this)

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

        void this.startWave(0)
    }

    private shutdownScene() {
        this.gen++
        this.lock?.destroy()
        this.controls?.destroy()
        this.faller?.destroy()
        this.lanes?.destroy()
        this.hud?.destroy()
        this.input.keyboard?.off('keydown-LEFT', this.onKeyLeft, this)
        this.input.keyboard?.off('keydown-RIGHT', this.onKeyRight, this)
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── a onda

    private async startWave(index: number) {
        const gen = ++this.gen
        this.waveIndex = index
        this.mode = 'ready'
        this.next = 0
        this.tries = 0
        this.slow = false
        this.swapped = false
        this.lostLife = false

        this.faller.clear()
        this.lock.hide()
        this.lanes.build(this.wave.lanes)
        this.hud.setWaves(this.wavesDone)
        this.controls.setEnabled(false)
        this.audio.preview(this.wave.lanes.length)

        await FX.wait(this, 900)
        if (gen !== this.gen) return

        void this.dropNext()
    }

    /**
     * Um arquivo por vez, e nunca já na caixa certa: toda queda pede pelo
     * menos uma decisão da criança.
     */
    private async dropNext() {
        const wave = this.wave
        if (this.next >= wave.files.length) {
            void this.finishWave()
            return
        }

        // Nível 3: no meio da onda as caixas deslizam para outra ordem. A
        // troca acontece ENTRE dois arquivos, nunca com um no ar.
        if (wave.swapTo && !this.swapped && this.next === (wave.swapAfter ?? 0)) {
            this.swapped = true
            const gen = this.gen
            this.mode = 'ready'
            this.applyInput()
            this.audio.preview(2)
            await this.lanes.reorder(wave.swapTo)
            if (gen !== this.gen) return
        }

        const file = wave.files[this.next]
        this.next += 1
        this.tries = 0
        this.slow = !!file.ninja

        const right = this.lanes.indexOf(formatOfFile(file))
        const options = wave.lanes.map((_, i) => i).filter(i => i !== right)
        const start = Phaser.Utils.Array.GetRandom(options)

        this.faller.drop(file, start, this.lanes.xAt(start))
        this.audio.pick()
        this.mode = 'falling'
        this.applyInput()

        if (this.pendingTutorial && this.waveIndex === 0 && this.next === 1) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    update(_time: number, delta: number) {
        if (this.mode !== 'falling' || this.tutorialOpen) return
        const dt = Math.min(delta, 50) / 1000

        // O ninja desce devagar do começo ao fim: quem só descobre o que é no
        // meio do caminho precisa da metade de baixo inteira para decidir.
        const speed = this.slow ? this.level.fallSpeed * 0.42 : this.level.fallSpeed
        this.faller.fall(speed * dt)

        if (this.faller.hidden && this.faller.y >= REVEAL_Y) {
            void this.revealNinja()
            return
        }
        if (this.faller.y >= LANE.landY) void this.land()
    }

    /** No meio do caminho o disfarce cai e o arquivo vira um dos sorteáveis. */
    private async revealNinja() {
        const file = this.faller.file
        if (!file?.ninja) return
        const pick = Phaser.Utils.Array.GetRandom(file.ninja)
        this.audio.reveal()
        await this.faller.reveal(pick)
    }

    /** Um toque, uma pista. Trocar de ideia no ar nunca é erro. */
    private async move(dir: -1 | 1) {
        if (this.tutorialOpen) return
        if (this.mode !== 'falling' && this.mode !== 'locked') return
        if (this.faller.busy || !this.faller.file) return

        const target = Phaser.Math.Clamp(this.faller.lane + dir, 0, this.lanes.count() - 1)
        if (target === this.faller.lane) return

        this.audio.slide()
        await this.faller.slide(target, this.lanes.xAt(target))

        // Na trava, mover é a própria correção: chegou na caixa certa, entra.
        if (this.mode === 'locked') void this.tryFix(target)
    }

    // ─────────────────────────────────────────────── pousar

    private async land() {
        const file = this.faller.file
        if (!file) return
        this.mode = 'landing'
        this.applyInput()

        const index = this.faller.lane
        const lane = this.lanes.formatAt(index)
        if (lane && belongs(lane, file)) {
            await this.accept(index)
            return
        }
        await this.refuse(index)
    }

    private async accept(index: number) {
        const gen = this.gen
        const file = this.faller.file
        if (!file) return

        this.audio.store()
        const from = this.faller.pos()
        await this.faller.land({ x: this.lanes.xAt(index), y: BUCKET.y })
        if (gen !== this.gen) return

        void this.flyContent(file.contentFrame, from, index)
        await this.lanes.accept(index)
        if (gen !== this.gen) return

        await FX.wait(this, 260)
        if (gen !== this.gen) return
        void this.dropNext()
    }

    /** O conteúdo guardado entra na caixa: a informação que estava no arquivo. */
    private flyContent(frame: number, from: { x: number; y: number }, index: number) {
        if (!this.textures.exists(SHEET)) return
        const icon = this.add
            .image(from.x, from.y - 70, SHEET, frame)
            .setDisplaySize(54, 54)
            .setDepth(DEPTH.fx)
        void FX.arcTo(this, icon, { x: this.lanes.xAt(index), y: BUCKET.y - 6 }, { height: 90, duration: 460 })
            .then(() => FX.to(this, icon, { scale: 0.2, alpha: 0 }, { duration: 200 }))
            .then(() => icon.destroy())
    }

    /**
     * O ÚNICO erro: soltar o arquivo numa caixa de outro formato. Ele para em
     * cima dela, a estrutura continua à vista e as setas seguem funcionando —
     * a trava só abre quando o arquivo chega ao formato dele.
     */
    private async refuse(index: number) {
        const gen = this.gen
        const file = this.faller.file
        if (!file) return

        this.mode = 'locked'
        this.tries = 0
        this.applyInput()

        this.audio.wrong()
        this.faller.stall()
        void this.lanes.refuse(index)
        this.hud.flash(C.warn)

        if (!this.lostLife) {
            this.lostLife = true
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

        await FX.wait(this, 260)
        if (gen !== this.gen) return
    }

    private async tryFix(index: number) {
        const file = this.faller.file
        if (!file) return
        const lane = this.lanes.formatAt(index)

        if (!lane || !belongs(lane, file)) {
            this.tries += 1
            void this.lanes.refuse(index)
            if (this.tries >= 2) this.lanes.hint(formatOfFile(file))
            return
        }

        this.mode = 'landing'
        this.applyInput()
        this.lanes.clearHints()
        this.lock.hide()
        this.audio.unlock()
        await this.accept(index)
    }

    // ─────────────────────────────────────────────── fechar

    private async finishWave() {
        const gen = this.gen
        this.mode = 'closing'
        this.applyInput()

        const points = this.lostLife ? 5 : 10
        this.wavesDone += 1
        this.hits += 1
        this.score += points
        this.hud.setWaves(this.wavesDone)
        this.lanes.celebrate()
        this.audio.wave()

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await FX.wait(this, 1300)
        if (gen !== this.gen) return

        const next = this.waveIndex + 1
        if (next < this.level.waves.length) void this.startWave(next)
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
        void FX.confetti(this, { colors: [C.gold, C.ok, C.select, C.grass] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: 'Tudo no lugar!',
                subtitle: 'Cada formato guarda os dados do seu jeito.',
                accent: C.grass,
                panelColor: C.panel,
                overlayColor: C.leaf,
                depth: 5000,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 2800,
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
            title: 'Tudo no lugar!',
            subtitle: 'Som, imagem, texto e vídeo: cada um guarda os dados do seu jeito.',
            accent: C.grass,
            panelColor: C.panel,
            overlayColor: C.leaf,
            depth: 5000,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () =>
                        this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.select,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── entrada e tutorial

    private applyInput() {
        const free = !this.tutorialOpen
        this.controls.setEnabled(free && (this.mode === 'falling' || this.mode === 'locked'))
    }

    private tutorialSteps() {
        const file = this.faller.pos()
        const bucket = { x: 640, y: BUCKET.y }
        return [
            {
                text: 'Veja como os dados estão arrumados.',
                shape: 'rect' as const,
                x: file.x,
                y: file.y - FALLER.size * 0.45,
                w: 230,
                h: 230,
                balloonX: 640,
                balloonY: 386,
                pointer: {
                    fromX: file.x,
                    fromY: file.y - 80,
                    toX: file.x,
                    toY: file.y - 80,
                    tap: true,
                },
            },
            {
                text: 'Use as setas para mover.',
                shape: 'rect' as const,
                x: 640,
                y: CONTROLS.y,
                w: 1000,
                h: CONTROLS.hitH + 20,
                balloonX: 640,
                balloonY: 386,
                pointer: {
                    fromX: CONTROLS.rightX,
                    fromY: CONTROLS.y,
                    toX: CONTROLS.rightX,
                    toY: CONTROLS.y,
                    tap: true,
                },
            },
            {
                text: 'Leve até a caixa do formato certo.',
                shape: 'rect' as const,
                x: bucket.x,
                y: bucket.y,
                w: 1000,
                h: BUCKET.h + 40,
                balloonX: 640,
                balloonY: 330,
                buttonLabel: 'Vamos!',
                pointer: { fromX: bucket.x, fromY: bucket.y, toX: bucket.x, toY: bucket.y, tap: true },
            },
        ]
    }

    private runTutorial(once: boolean) {
        this.tutorialOpen = true
        this.applyInput()
        this.hud.setEnabled(false)
        createTutorial(this, {
            key: 'ef03co05-torres-l1',
            once,
            accent: C.grass,
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
        if (this.tutorialOpen || this.mode === 'done' || this.mode === 'closing') return
        this.runTutorial(false)
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = this.level.waves.length
        const done = complete ? total : this.wavesDone
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

    private onKeyLeft() {
        void this.move(-1)
    }

    private onKeyRight() {
        void this.move(1)
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
