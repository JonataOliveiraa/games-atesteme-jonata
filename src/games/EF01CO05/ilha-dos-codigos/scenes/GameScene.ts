import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { formatTime } from '../../../../shared/hud/createTimeBar'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, TOTAL_CHESTS, chestsBefore } from '../data/levels'
import { nameOf } from '../data/island'
import { C } from '../data/theme'
import { CHEST, KEY, PALETTE, W } from '../data/layout'
import type { ChestDef, LevelDef, LevelNumber, PlayState, Word } from '../types'
import { createAudio } from './audio'
import { createClue } from './clue'
import { createHud } from './hud'
import { createIsland } from './island'
import { createLegend } from './legend'
import { createLock } from './lock'
import { createPalette } from './palette'
import { createRecap } from './recap'
import { createTalk } from './talk'

const GAME_ID = 'ilha-dos-codigos'
const KEY_PHRASE = 'A mesma coisa pode ser dita com sons, cores ou desenhos!'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private chestIndex = 0
    private chest!: ChestDef

    private state: PlayState = 'intro'
    private paused = false
    private saying = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private streak = 0
    private chestsDone = 0
    private chestClean = true
    private blamed = -1
    /** Erros por encaixe: dois no mesmo e a carta certa pisca. */
    private slotMistakes: number[] = []
    private levelStart = 0

    private island!: ReturnType<typeof createIsland>
    private clue!: ReturnType<typeof createClue>
    private lock!: ReturnType<typeof createLock>
    private palette!: ReturnType<typeof createPalette>
    private legend!: ReturnType<typeof createLegend>
    private talk!: ReturnType<typeof createTalk>
    private hud!: ReturnType<typeof createHud>
    private recap!: ReturnType<typeof createRecap>
    private audio!: ReturnType<typeof createAudio>

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]
        this.chestIndex = 0
        this.chest = this.level.chests[0]

        this.state = 'intro'
        this.paused = false
        this.saying = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.streak = 0
        this.chestsDone = 0
        this.chestClean = true
        this.blamed = -1
        this.slotMistakes = []
    }

    create() {
        this.input.topOnly = true
        this.levelStart = this.time.now

        this.audio = createAudio(this)
        this.island = createIsland(this, this.level.chests.length)
        this.clue = createClue(this, () => void this.replayClue())
        this.lock = createLock(this, {
            onSlot: index => this.onSlot(index),
            onKey: () => void this.onKey(),
        })
        this.palette = createPalette(this, word => this.onPick(word))
        this.legend = createLegend(this)
        this.talk = createTalk(this)
        this.hud = createHud(this, () => this.replayTutorial())
        this.recap = createRecap(this)

        this.legend.build(this.level.alphabet, this.level.from, this.level.to)
        this.palette.build(this.level.alphabet, this.level.to)
        this.palette.setEnabled(false)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.state = 'tutorial'
        this.runTutorial(true, () => void this.startChest(0))

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 44,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    private shutdownScene() {
        this.gen++
        this.island?.destroy()
        this.clue?.destroy()
        this.lock?.destroy()
        this.palette?.destroy()
        this.legend?.destroy()
        this.talk?.destroy()
        this.hud?.destroy()
        this.recap?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────────────── o baú da vez

    private async startChest(index: number) {
        const gen = this.gen
        this.chestIndex = index
        this.chest = this.level.chests[index]
        this.chestClean = true
        this.blamed = -1
        this.slotMistakes = this.chest.message.map(() => 0)

        this.state = 'walking'
        this.palette.setEnabled(false)
        this.lock.setEnabled(false)
        this.lock.setKeyReady(false)
        this.clue.close()
        this.clue.setEnabled(false)

        await this.island.walkTo(index)
        if (gen !== this.gen) return

        this.lock.setup(this.chest.message.length, this.level.to)
        this.clue.show(this.chest.message, this.level.from)
        this.applyLegendPolicy(index)

        this.state = 'telling'
        this.clue.setEnabled(true)
        await FX.wait(this, 320)
        if (gen !== this.gen) return

        await this.clue.say(word => this.audio.say(word))
        if (gen !== this.gen) return

        this.state = 'building'
        this.palette.setEnabled(true)
        this.lock.setEnabled(true)
    }

    /** A legenda aperta de nível em nível — mas o botão nunca some. */
    private applyLegendPolicy(index: number) {
        this.legend.setSticky(this.level.legend === 'always')
        if (this.level.legend === 'always') {
            this.legend.show()
            return
        }
        if (this.level.legend === 'peek') {
            this.legend.show(5000)
            return
        }
        if (index === 0) this.legend.show(5000)
        else this.legend.hide()
    }

    private async replayClue() {
        if (this.state !== 'building' && this.state !== 'locked') return
        if (this.saying) return
        const gen = this.gen
        this.saying = true
        await this.clue.say(word => this.audio.say(word))
        if (gen !== this.gen) return
        this.saying = false
    }

    // ─────────────────────────────────────────────────────── os toques

    private onPick(word: Word) {
        if (this.state !== 'building') return
        const words = this.lock.words()
        const free = words.findIndex(slot => slot === null)
        if (free < 0) return

        this.audio.place()
        this.palette.stopPulse()
        this.lock.put(free, word, this.palette.point(word))
        this.clue.link(free, 'idle')
        this.lock.setKeyReady(this.lock.isFull())
    }

    private onSlot(index: number) {
        if (this.state === 'locked') {
            if (index !== this.blamed) return
            this.lock.take(index)
            this.audio.remove()
            this.clue.link(index, 'idle')
            this.talk.hide()
            this.palette.stopPulse()
            this.blamed = -1
            this.state = 'building'
            this.palette.setEnabled(true)
            this.lock.setKeyReady(this.lock.isFull())
            return
        }

        if (this.state !== 'building') return
        if (this.lock.take(index) === null) return
        this.audio.remove()
        this.clue.link(index, 'idle')
        this.lock.setKeyReady(false)
    }

    /** A chave é o ÚNICO compromisso: pôr e tirar não custam nada. */
    private async onKey() {
        if (this.state !== 'building' || !this.lock.isFull()) return
        const gen = this.gen

        this.state = 'checking'
        this.palette.setEnabled(false)
        this.lock.setEnabled(false)
        this.lock.setKeyReady(false)
        this.palette.stopPulse()

        this.audio.keyTurn()
        await this.lock.turnKey()
        if (gen !== this.gen) return

        const words = this.lock.words()
        for (let i = 0; i < this.chest.message.length; i++) {
            if (words[i] !== this.chest.message[i]) {
                this.trap(i)
                return
            }
            this.lock.verify(i)
            this.clue.link(i, 'ok')
            this.audio.check(i)
            // O contador de tolerância zera assim que o encaixe fica certo.
            this.slotMistakes[i] = 0
            await FX.wait(this, 120)
            if (gen !== this.gen) return
        }

        await this.openChest()
    }

    // ─────────────────────────────────────────────────────── a trava

    private trap(index: number) {
        this.errors++
        this.streak = 0
        this.chestClean = false
        this.blamed = index

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.audio.wrong()
        this.hud.flash(C.bad)
        void this.clue.shakeChest()

        this.lock.blame(index)
        this.clue.link(index, 'wrong')
        this.clue.pulse(index)
        if (this.level.from === 'som') this.audio.say(this.chest.message[index])

        this.legend.peek(3000)
        this.talk.say(`Aqui o baú disse ${nameOf(this.chest.message[index], this.level.from)}.`, C.badDark, 3200)

        this.slotMistakes[index]++
        if (this.slotMistakes[index] >= 2) this.palette.pulse(this.chest.message[index])

        this.state = 'locked'
        this.lock.setEnabled(true)
        this.palette.setEnabled(false)
        this.emitCheckpoint()
    }

    // ─────────────────────────────────────────────────────── o baú abre

    private async openChest() {
        const gen = this.gen
        this.state = 'opening'
        this.hits++
        this.streak++

        const earned = this.chestClean ? 10 : 5
        this.score += earned
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        this.clue.linkAll('ok')
        this.hud.flash(C.ok)
        this.audio.open()
        await this.clue.open()
        if (gen !== this.gen) return

        this.audio.streak(this.streak)
        this.island.sendPiece(this.clue.chestPoint(), this.chestIndex)
        this.talk.say(KEY_PHRASE, C.okDark, 2600)

        this.chestsDone++
        this.emitCheckpoint()

        await FX.wait(this, 1500)
        if (gen !== this.gen) return

        if (this.chestIndex + 1 < this.level.chests.length) {
            await this.startChest(this.chestIndex + 1)
            return
        }
        await this.endLevel()
    }

    // ─────────────────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.hud.setEnabled(false)
        this.legend.setEnabled(false)
        this.clue.setEnabled(false)
        this.lock.setEnabled(false)
        this.palette.setEnabled(false)
        this.talk.hide()

        /*
         * ANTES de qualquer condição: com o emit dentro do `else`, os níveis 1
         * e 2 terminariam sem a plataforma nunca ficar sabendo.
         */
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
            durationMs: Math.round(this.time.now - this.levelStart),
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        await this.island.celebrate()
        if (gen !== this.gen) return

        await this.recap.play(this.level, () => this.audio.tap())
        if (gen !== this.gen) return

        const level = this.level.level
        const elapsed = formatTime(this.time.now - this.levelStart)

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: `${this.level.name} completa!`,
                subtitle: `Três baús abertos  ·  ${elapsed}`,
                accent: C.warn,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2600,
                    label: 'Seguindo pela trilha...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: next,
                        points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Tesouro da ilha!',
            subtitle: `Você escreveu tudo em sons, cores e desenhos  ·  ${elapsed}`,
            accent: C.warn,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal,
                        level: 1,
                        points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.cyan,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────────────── tutorial

    private tutorialSteps(): TutorialStep[] {
        return [
            {
                text: 'O baú diz uma mensagem.',
                shape: 'rect',
                x: CHEST.x, y: CHEST.baseY - 110, w: CHEST.w + 40, h: 250,
                balloonX: W / 2 + 120, balloonY: 190,
            },
            {
                text: 'Toque aqui para escrever a mesma mensagem no outro código.',
                shape: 'rect',
                x: PALETTE.cx, y: PALETTE.cy, w: PALETTE.pitch * 4, h: PALETTE.size + 30,
                balloonX: W / 2, balloonY: 210,
                pointer: {
                    fromX: PALETTE.cx, fromY: PALETTE.cy,
                    toX: PALETTE.cx - PALETTE.pitch, toY: PALETTE.cy,
                    tap: true,
                },
            },
            {
                text: 'Fechadura cheia? Gire a chave e o baú abre!',
                shape: 'circle',
                x: KEY.x, y: KEY.y, w: KEY.r * 2.8, h: KEY.r * 2.8,
                balloonX: W / 2 - 60, balloonY: 210,
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        createTutorial(this, {
            // uma chave só para a partida: a mecânica não muda de nível para
            // nível, e repetir os três passos a cada troca vira interrupção
            key: 'ef01co05-ilha',
            once,
            accent: C.warn,
            safeTop: 12,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    private replayTutorial() {
        if (this.state !== 'building' && this.state !== 'locked') return
        const previous = this.state
        this.state = 'tutorial'
        this.hud.setEnabled(false)
        this.palette.setEnabled(false)
        this.lock.setEnabled(false)
        this.clue.setEnabled(false)

        this.runTutorial(false, () => {
            this.state = previous
            this.hud.setEnabled(true)
            this.palette.setEnabled(previous === 'building')
            this.lock.setEnabled(true)
            this.clue.setEnabled(true)
        })
    }

    // ─────────────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const done = chestsBefore(this.level.level)
            + (complete ? this.level.chests.length : this.chestsDone)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_CHESTS) * 100),
            score: Math.max(0, this.score),
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
            if (command.type === 'PAUSE_GAME') this.setPaused(true)
            if (command.type === 'RESUME_GAME') this.setPaused(false)
        })
    }

    private setPaused(paused: boolean) {
        if (this.paused === paused) return
        this.paused = paused
        if (paused) this.scene.pause()
        else this.scene.resume()
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
