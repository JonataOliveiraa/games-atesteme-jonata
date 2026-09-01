import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { poolOf } from '../data/items'
import {
    LEVELS, OK_COLLECT, OK_PASS, TOTAL_ITEMS,
    itemsBefore, itemsInLevel, mistakeSentence, nextDecision, nextLane,
    pickCandidate, pickRule, ruleSentence, shouldCollect, starsFor,
} from '../data/levels'
import { BIOME, C, CSS, SIZE } from '../data/theme'
import {
    CAR, CAR_H, DEPTH, H, HEADER, ITEM, ROAD, TRAVEL, W, laneLeft, laneX,
} from '../data/layout'
import type {
    FallingItem, ItemDef, LevelDef, LevelNumber, PlayState, Rule,
} from '../types'
import {
    createAlbum, createCar, createCopilot, createFrame, createGate,
    createHelpButton, createItemIcon, createLaneHint, createLock, createProgress,
    createRuleAlert, createRuleSign, puff,
} from './effects'
import { createRoad, type RoadWorld } from './road'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'corrida-dos-parecidos'
const MAX_STEP_MS = 34

const fx = (o: unknown) => o as unknown as FxTarget

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelDef!: LevelDef
    private pool: ItemDef[] = []
    private rule!: Rule

    private state: PlayState = 'intro'
    private paused = false
    private isMuted = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private firstTry = 0
    private stretchIndex = 0
    private itemInStretch = 0
    private itemsDone = 0

    private speed = { factor: 0 }
    private baseSpeed = 0

    private decisions: boolean[] = []
    private lanes: number[] = []
    private collected: ItemDef[] = []

    private current: FallingItem | null = null
    private icon: Phaser.GameObjects.Container | null = null

    private road!: RoadWorld
    private frame!: ReturnType<typeof createFrame>
    private sign!: ReturnType<typeof createRuleSign>
    private alert!: ReturnType<typeof createRuleAlert>
    private progress!: ReturnType<typeof createProgress>
    private help!: ReturnType<typeof createHelpButton>
    private copilot!: ReturnType<typeof createCopilot>
    private car!: ReturnType<typeof createCar>
    private laneHint!: ReturnType<typeof createLaneHint>
    private lock!: ReturnType<typeof createLock>
    private album!: ReturnType<typeof createAlbum>
    private puffTimer = 0

    private gate: ReturnType<typeof createGate> | null = null
    private laneZones: Phaser.GameObjects.Zone[] = []
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.levelDef = LEVELS[number - 1]
        this.baseSpeed = TRAVEL / this.levelDef.fallMs

        this.state = 'intro'
        this.paused = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.firstTry = 0
        this.stretchIndex = 0
        this.itemInStretch = 0
        this.itemsDone = 0
        this.speed = { factor: 0 }
        this.decisions = []
        this.lanes = []
        this.collected = []
        this.current = null
        this.icon = null
        this.gate = null
        this.laneZones = []
    }

    create() {
        this.input.topOnly = true
        const level = this.levelDef

        this.road = createRoad(this, { biome: level.biome, lanes: level.lanes })
        this.frame = createFrame(this, level.biome)
        this.sign = createRuleSign(this)
        this.alert = createRuleAlert(this)
        this.progress = createProgress(this, level.stretches.length)
        this.progress.setLevel(level.level, LEVELS.length)
        this.help = createHelpButton(this, () => this.replayTutorial())
        this.copilot = createCopilot(this)
        this.car = createCar(this, level.lanes, Math.floor(level.lanes / 2))
        this.laneHint = createLaneHint(this, level.lanes)
        this.lock = createLock(this)
        this.album = createAlbum(this)

        this.buildLaneZones()
        this.bindKeyboard()
        this.bindPlatform()

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.startLevel()

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            stage: () => this.levelDef.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    update(_time: number, delta: number) {
        if (this.paused) return

        const dt = Math.min(delta, MAX_STEP_MS)
        const speed = this.baseSpeed * this.speed.factor
        this.road.update(dt, speed)

        if (this.gate) {
            const y = this.gate.y() + speed * dt
            this.gate.setY(y)
            if (y > CAR.y + 70) { this.gate.destroy(); this.gate = null }
        }

        this.puffTimer += dt
        if (this.puffTimer > 92 && this.speed.factor > 0.06) {
            this.puffTimer = 0
            const at = this.car.at()
            puff(this, at.x + Phaser.Math.Between(-26, 26), at.y + CAR_H * 0.46,
                BIOME[this.levelDef.biome].shoulder)
        }

        const item = this.current
        const icon = this.icon
        if (!item || !icon || item.returning) return
        if (this.state !== 'running') return

        item.y += speed * dt
        icon.setY(item.y)
        icon.setAngle(Math.sin(item.y * 0.014) * 7)

        /*
         * A coleta é COLISÃO entre as duas caixas: passar o carro por cima
         * pega. Antes existia uma linha invisível na altura do carro, e
         * encostar nele não bastava — a mecânica contradizia os olhos.
         */
        const car = this.car.at()
        const touching =
            Math.abs(icon.x - car.x) < CAR.w * 0.5 + ITEM.size * 0.42 &&
            Math.abs(item.y - car.y) < CAR_H * 0.5 + ITEM.size * 0.42

        if (touching) this.resolveItem(true)
        else if (item.y > car.y + 10) this.resolveItem(false)
    }

    private shutdownScene() {
        this.gen++
        this.laneZones.forEach(z => z.destroy())
        this.gate?.destroy()
        this.icon?.destroy()
        this.road?.destroy()
        this.frame?.destroy()
        this.sign?.destroy()
        this.alert?.destroy()
        this.progress?.destroy()
        this.help?.destroy()
        this.copilot?.destroy()
        this.car?.destroy()
        this.laneHint?.destroy()
        this.lock?.destroy()
        this.album?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────────────── abertura

    private startLevel() {
        this.rule = this.rollRule(0)
        this.sign.set(this.rule)
        this.progress.set(0, 0)
        this.copilot.say(ruleSentence(this.rule))
        this.emitCheckpoint()

        this.state = 'tutorial'
        this.rampTo(0.35, 900)
        this.playRev()

        this.runTutorial(true, () => {
            this.state = 'running'
            this.rampTo(this.cruise, 700)
            this.spawnNext(700)
        })
    }

    private rollRule(slot: number): Rule {
        const option = this.levelDef.rulePlan[slot]
        const key = `cdp-last-${this.levelDef.level}-${slot}`
        const avoid = this.registry.get(key)
        const rule = pickRule(option, Math.random, avoid)
        this.registry.set(key, rule.value)
        this.pool = poolOf(option.sheets)
        return rule
    }

    /** A velocidade de cruzeiro do trecho atual — o último é a arrancada. */
    private get cruise() {
        return this.stretchIndex >= this.levelDef.sprintFrom
            ? this.levelDef.sprintFactor
            : 1
    }

    private rampTo(factor: number, duration: number) {
        this.tweens.killTweensOf(this.speed)
        this.tweens.add({ targets: this.speed, factor, duration, ease: 'Sine.easeInOut' })
    }

    // ─────────────────────────────────────────────────────── tutorial

    /**
     * Três passos, uma frase curta cada, um alvo por passo — e o texto SEGUE A
     * PLACA. Na regra de negação o tutorial dizia "quem você deve pegar"
     * enquanto a placa dizia o contrário, e as duas juntas não explicavam nada.
     */
    private tutorialSteps(): TutorialStep[] {
        // o carro nasce no meio; o dedo aponta para a faixa que ele NÃO ocupa
        const freeLane = 0
        const exclude = this.rule.mode === 'exclude'
        return [
            {
                text: exclude
                    ? 'A placa mostra quem NÃO entra no carrinho.'
                    : 'A placa mostra quem você deve pegar.',
                shape: 'rect', x: W / 2, y: HEADER.h / 2, w: 520, h: 104,
                balloonX: W / 2, balloonY: 250,
            },
            {
                text: 'Toque numa faixa para o carrinho ir lá.',
                shape: 'rect', x: W / 2, y: CAR.y - 20, w: ROAD.w + 40, h: 230,
                balloonX: W / 2, balloonY: 232,
                pointer: {
                    fromX: 0, fromY: 0,
                    toX: laneX(freeLane, this.levelDef.lanes), toY: CAR.y,
                    tap: true,
                },
            },
            {
                text: exclude
                    ? 'Pegue todos os outros passando por cima.'
                    : 'Passe por cima de quem combina com a placa.',
                shape: 'none', balloonX: W / 2, balloonY: 300,
                buttonLabel: 'Acelerar!',
            },
        ]
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        createTutorial(this, {
            key: `ef01co01-corrida-l${this.levelDef.level}`,
            once,
            accent: BIOME[this.levelDef.biome].plantDark,
            safeTop: HEADER.h + HEADER.accent + 10,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    private replayTutorial() {
        if (this.state === 'ending' || this.state === 'tutorial') return
        const previous = this.state
        const factor = this.speed.factor
        this.state = 'tutorial'
        this.rampTo(0, 260)
        this.help.setEnabled(false)
        this.runTutorial(false, () => {
            this.state = previous
            this.rampTo(factor || this.cruise, 420)
            this.help.setEnabled(true)
        })
    }

    // ─────────────────────────────────────────────────────── controles

    private buildLaneZones() {
        const lanes = this.levelDef.lanes
        const top = ROAD.top
        const bottom = H
        for (let i = 0; i < lanes; i++) {
            const left = i === 0 ? 0 : laneLeft(i, lanes)
            const right = i === lanes - 1 ? W : laneLeft(i + 1, lanes)
            const zone = this.add
                .zone((left + right) / 2, (top + bottom) / 2, right - left, bottom - top)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setDepth(DEPTH.item + 5)
            zone.on('pointerdown', () => this.goToLane(i))
            this.laneZones.push(zone)
        }
    }

    private bindKeyboard() {
        const keyboard = this.input.keyboard
        if (!keyboard) return
        keyboard.on('keydown-LEFT', () => this.step(-1))
        keyboard.on('keydown-A', () => this.step(-1))
        keyboard.on('keydown-RIGHT', () => this.step(1))
        keyboard.on('keydown-D', () => this.step(1))
    }

    private step(direction: number) {
        const target = Phaser.Math.Clamp(this.car.lane() + direction, 0, this.levelDef.lanes - 1)
        this.goToLane(target)
    }

    private goToLane(lane: number) {
        if (this.state === 'ending' || this.state === 'tutorial') return
        if (this.paused || lane === this.car.lane()) return
        this.playTap()
        const from = this.car.at()
        this.road.addSkid(from.x, from.y + CAR_H * 0.18)
        void this.car.moveTo(lane)
    }

    // ─────────────────────────────────────────────────────── os itens

    private async spawnNext(delay = 0) {
        const gen = ++this.gen
        if (delay > 0) {
            await FX.wait(this, delay)
            if (gen !== this.gen) return
        }

        this.laneHint.hide()

        if (this.itemsDone >= itemsInLevel(this.levelDef)) {
            void this.endLevel()
            return
        }

        if (this.itemInStretch >= this.levelDef.stretches[this.stretchIndex]) {
            await this.runGate()
            if (gen !== this.gen) return
        }

        const lanes = this.levelDef.lanes
        const collect = nextDecision(this.decisions, Math.random)
        const candidate = pickCandidate(this.pool, this.rule, collect, Math.random)
        if (!candidate) return

        const lane = nextLane(lanes, this.lanes, Math.random)
        this.decisions.push(collect)
        this.lanes.push(lane)

        const aura = this.levelDef.level === 1 && collect
        const icon = createItemIcon(this, candidate, ITEM.size, aura)
        icon.setPosition(laneX(lane, lanes), ITEM.spawnY).setDepth(DEPTH.item).setScale(0)

        this.icon = icon
        this.current = {
            def: candidate,
            lane,
            y: ITEM.spawnY,
            mistakes: 0,
            returning: false,
            collect,
        }

        void FX.to(this, fx(icon), { scale: 1 }, { duration: 280, ease: Ease.back(2.4) })
    }

    private resolveItem(tookIt: boolean) {
        const item = this.current
        const icon = this.icon
        if (!item || !icon || item.returning) return
        const wanted = shouldCollect(item.def, this.rule)
        if (tookIt === wanted) void this.succeed(item, icon, tookIt)
        else void this.trip(item, icon, tookIt)
    }

    private async succeed(
        item: FallingItem,
        icon: Phaser.GameObjects.Container,
        tookIt: boolean,
    ) {
        const gen = this.gen
        item.returning = true
        this.laneHint.hide()

        const points = item.mistakes > 0 ? 5 : tookIt ? 10 : 5
        this.score += points
        this.hits += 1
        if (item.mistakes === 0) this.firstTry += 1
        void FX.popText(this, icon.x, icon.y - 52, `+${points}`, {
            color: CSS.okBright, size: SIZE.float, rise: 84,
        })

        if (tookIt) {
            this.playCollect()
            const car = this.car.at()
            void FX.sparks(this, icon.x, icon.y, { color: C.ok, count: 20, spread: 150 })
            await FX.to(this, fx(icon),
                { x: car.x, y: car.y + 30, scale: 0.18, alpha: 0 },
                { duration: 300, ease: 'Back.easeIn' })
            if (gen !== this.gen) return
            void this.car.bounce()
            this.collected.push(item.def)
            void this.copilot.say(OK_COLLECT, 'happy')
        } else {
            this.playPass()
            void FX.ping(this, icon.x, icon.y, C.ok, { radius: 76 })
            await FX.to(this, fx(icon),
                { y: H + 100, alpha: 0.25 },
                { duration: 360, ease: 'Quad.easeIn' })
            if (gen !== this.gen) return
            void this.copilot.say(OK_PASS, 'happy')
        }

        icon.destroy()
        this.icon = null
        this.current = null
        this.itemsDone += 1
        this.itemInStretch += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.levelDef.level,
        })
        this.emitCheckpoint()

        void this.spawnNext(this.levelDef.spawnGapMs)
    }

    /**
     * A TRAVA. A pista para, o item volta ao topo da mesma faixa e a corrida
     * só continua quando a criança resolve aquele item. Errar não empurra a
     * fase para frente, e a frase diz QUAL peça e por quê — nunca "de novo".
     */
    private async trip(
        item: FallingItem,
        icon: Phaser.GameObjects.Container,
        tookIt: boolean,
    ) {
        const gen = this.gen
        this.state = 'locked'
        item.returning = true
        item.mistakes += 1
        this.errors += 1

        this.playScreech()
        this.rampTo(0, 260)
        this.cameras.main.shake(220, 0.005)
        void this.copilot.say(mistakeSentence(item.def, this.rule, tookIt), 'oops')
        void this.sign.alert()
        void this.car.nudge()

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        await this.lock.showAt(icon.x, icon.y - 66)
        if (gen !== this.gen) return

        if (item.mistakes >= 2) {
            const wanted = shouldCollect(item.def, this.rule)
            const all = Array.from({ length: this.levelDef.lanes }, (_, i) => i)
            this.laneHint.show(wanted ? [item.lane] : all.filter(l => l !== item.lane))
        }

        await FX.wait(this, 700)
        if (gen !== this.gen) return

        this.lock.hide()
        await FX.to(this, fx(icon),
            { x: laneX(item.lane, this.levelDef.lanes), y: ITEM.spawnY },
            { duration: 640, ease: Ease.back(1.2) })
        if (gen !== this.gen) return

        item.y = ITEM.spawnY
        item.returning = false
        this.state = 'running'
        this.rampTo(this.cruise, 520)
    }

    // ─────────────────────────────────────────────────────── os trechos

    private async runGate() {
        const finished = this.stretchIndex
        const next = finished + 1
        const slot = this.levelDef.rulePlan.findIndex(option => option.fromStretch === next)
        const changesRule = slot > 0

        this.itemInStretch = 0
        this.stretchIndex = next
        void this.progress.celebrate(finished)
        this.progress.set(next, next)
        this.gate?.destroy()
        this.gate = createGate(
            this,
            changesRule ? 'rule' : 'stretch',
            changesRule ? 'PLACA NOVA!' : `TRECHO ${next + 1}`,
            ROAD.top - 70,
        )

        if (!changesRule) {
            this.playGate()
            void FX.flash(this, BIOME[this.levelDef.biome].plantLight, { duration: 240, peak: 0.2 })
            if (next >= this.levelDef.sprintFrom) {
                this.playSprint()
                void this.copilot.say('Segura! A pista vai acelerar.', 'calm')
            }
            await FX.wait(this, 850)
            this.rampTo(this.cruise, 700)
            return
        }

        this.rampTo(0.42, 420)
        this.playSiren()
        this.rule = this.rollRule(slot)
        this.decisions = []
        this.collected.splice(0)
        void this.alert.show(this.rule)
        await this.sign.swap(this.rule)
        void this.copilot.say(ruleSentence(this.rule), 'calm')
        await FX.wait(this, 1400)
        void this.alert.hide()
        this.rampTo(this.cruise, 620)
    }

    // ─────────────────────────────────────────────────────── fim do nível

    private albumTitle() {
        if (!this.collected.length) return 'O carrinho voltou vazio!'
        return this.rule.mode === 'include'
            ? `Olha só: todos ${this.rule.word}!`
            : `Nada de ${this.rule.word} aqui!`
    }

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.laneHint.hide()
        void this.alert.hide()
        this.help.setEnabled(false)
        this.progress.set(this.levelDef.stretches.length, -1)
        this.rampTo(0.12, 1300)
        this.playFanfare()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.levelDef.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        void this.copilot.say('Chegamos! Olha o que você juntou.', 'happy')
        void FX.confetti(this)
        await FX.wait(this, 450)
        if (gen !== this.gen) return

        // primeiro o conteúdo — o grupo que ela formou, peça por peça
        const stars = starsFor(this.firstTry, itemsInLevel(this.levelDef))
        await this.album.show(this.collected, this.albumTitle(), stars)
        if (gen !== this.gen) return
        await FX.wait(this, 1600)
        if (gen !== this.gen) return
        await this.album.hide()
        if (gen !== this.gen) return

        // e só então o painel de fim de nível, igual ao dos outros 44 jogos
        const level = this.levelDef.level

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: `Nível ${level} completo!`,
                subtitle: this.albumTitle(),
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2600,
                    label: `Preparando o nível ${next}...`,
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.score }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Corrida completa!',
            subtitle: this.albumTitle(),
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Correr de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesLeft, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.info,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const done = itemsBefore(this.levelDef.level)
            + (complete ? itemsInLevel(this.levelDef) : this.itemsDone)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_ITEMS) * 100),
            score: Math.max(0, this.score),
            stage: this.levelDef.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.levelDef.level) {
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.setPaused(true)
            if (command.type === 'RESUME_GAME') this.setPaused(false)
        })
    }

    /**
     * Pausa de verdade. O sinalizador sozinho só segurava o `update`: item
     * continuava nascendo, tween continuava correndo e som continuava tocando
     * atrás da tela de game over da plataforma. Pausar a CENA congela update,
     * tweens, timers e entrada de uma vez — e o quadro parado continua na tela.
     */
    private setPaused(paused: boolean) {
        if (this.paused === paused) return
        this.paused = paused
        if (paused) this.scene.pause()
        else this.scene.resume()
    }

    private onMute(muted: boolean) {
        this.isMuted = muted
    }

    // ─────────────────────────────────────────────────────── som

    /**
     * Sem arquivo de áudio: tudo é WebAudio. O que separa um "bip" de um som
     * de jogo é o ENVELOPE e o FILTRO — nota com ataque curto e queda
     * exponencial, e ruído passa-banda varrendo a frequência para os sons de
     * ar (motor, derrapagem, troca de faixa).
     */
    private audio(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context ?? null
        } catch {
            return null
        }
    }

    private note(o: {
        freq: number
        dur: number
        type?: OscillatorType
        gain?: number
        to?: number
        delay?: number
        cutoff?: number
    }) {
        const ctx = this.audio()
        if (!ctx) return

        const t0 = ctx.currentTime + (o.delay ?? 0)
        const osc = ctx.createOscillator()
        const amp = ctx.createGain()

        osc.type = o.type ?? 'sine'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)

        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.08, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        osc.connect(amp)
        if (o.cutoff) {
            const low = ctx.createBiquadFilter()
            low.type = 'lowpass'
            low.frequency.setValueAtTime(o.cutoff, t0)
            amp.connect(low)
            low.connect(ctx.destination)
        } else {
            amp.connect(ctx.destination)
        }

        osc.start(t0)
        osc.stop(t0 + o.dur + 0.03)
    }

    /** Sopro de ar: ruído branco passando por um passa-banda que varre. */
    private air(o: { dur: number; from: number; to: number; gain?: number; delay?: number }) {
        const ctx = this.audio()
        if (!ctx) return

        const t0 = ctx.currentTime + (o.delay ?? 0)
        const frames = Math.max(1, Math.floor(ctx.sampleRate * o.dur))
        const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)

        const source = ctx.createBufferSource()
        source.buffer = buffer

        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = 1.2
        band.frequency.setValueAtTime(o.from, t0)
        band.frequency.exponentialRampToValueAtTime(Math.max(80, o.to), t0 + o.dur)

        const amp = ctx.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.055, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        source.connect(band)
        band.connect(amp)
        amp.connect(ctx.destination)
        source.start(t0)
        source.stop(t0 + o.dur)
    }

    private later(ms: number, run: () => void) {
        this.time.delayedCall(ms, run)
    }

    private playTap() {
        this.air({ dur: 0.22, from: 1500, to: 380, gain: 0.045 })
        this.note({ freq: 240, to: 170, dur: 0.14, type: 'sine', gain: 0.04 })
    }

    private playCollect() {
        this.note({ freq: 660, dur: 0.1, type: 'triangle', gain: 0.075 })
        this.note({ freq: 880, dur: 0.11, type: 'triangle', gain: 0.07, delay: 0.06 })
        this.note({ freq: 1320, dur: 0.14, type: 'sine', gain: 0.06, delay: 0.12 })
        this.note({ freq: 2640, dur: 0.42, type: 'sine', gain: 0.026, delay: 0.12 })
    }

    private playPass() {
        this.air({ dur: 0.26, from: 900, to: 260, gain: 0.04 })
        this.note({ freq: 520, to: 330, dur: 0.16, type: 'sine', gain: 0.045 })
    }

    private playError() {
        this.note({ freq: 250, to: 120, dur: 0.32, type: 'square', gain: 0.055, cutoff: 900 })
        this.note({ freq: 186, to: 92, dur: 0.4, type: 'sawtooth', gain: 0.04, cutoff: 620, delay: 0.07 })
    }

    private playScreech() {
        this.air({ dur: 0.34, from: 2800, to: 620, gain: 0.06 })
        this.air({ dur: 0.2, from: 1900, to: 500, gain: 0.04, delay: 0.12 })
        this.later(200, () => this.playError())
    }

    private playGate() {
        this.note({ freq: 880, dur: 0.1, type: 'triangle', gain: 0.06 })
        this.note({ freq: 1320, dur: 0.16, type: 'triangle', gain: 0.055, delay: 0.08 })
        this.note({ freq: 2640, dur: 0.5, type: 'sine', gain: 0.022, delay: 0.08 })
    }

    private playSprint() {
        this.note({ freq: 180, to: 520, dur: 0.5, type: 'sawtooth', gain: 0.05, cutoff: 1200 })
        this.air({ dur: 0.5, from: 400, to: 1800, gain: 0.035 })
    }

    /** O aviso de placa nova dura os 2s que a criança precisa para olhar. */
    private playSiren() {
        for (let i = 0; i < 5; i++) {
            this.note({ freq: 620, dur: 0.17, type: 'triangle', gain: 0.07, delay: i * 0.38 })
            this.note({ freq: 880, dur: 0.19, type: 'triangle', gain: 0.07, delay: i * 0.38 + 0.18 })
        }
    }

    private playRev() {
        this.note({ freq: 90, to: 230, dur: 0.55, type: 'sawtooth', gain: 0.05, cutoff: 700 })
        this.note({ freq: 60, to: 150, dur: 0.6, type: 'square', gain: 0.03, cutoff: 400, delay: 0.05 })
    }

    private playFanfare() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            this.note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
        })
        this.note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        this.note({ freq: 1568, dur: 0.9, type: 'sine', gain: 0.028, delay: 0.44 })
    }
}
