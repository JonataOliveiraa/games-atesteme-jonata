import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CELL, NICO } from '../data/layout'
import { LEVELS, POINTS, guideKey } from '../data/levels'
import { build } from '../data/logic'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { FELL, HELP, LABEL, SAY, TEACH } from '../data/words'
import type { LevelDef, PhaseDef, Piece, State } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBoard, type Board } from './board'
import { createBubble, type Bubble } from './bubble'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createNico, type Nico } from './nico'
import { createPages, type Pages } from './pages'
import { createRoom, type Room } from './room'
import { createStage, type Stage } from './stage'
import { createTap, type Tap } from './tap'

const GAME_ID = 'circuito-de-bolinha'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false

    private score = 0
    private hits = 0
    private errors = 0
    private built = 0

    private audio!: Audio
    private stage!: Stage
    private room!: Room
    private board!: Board
    private nico!: Nico
    private pages!: Pages
    private header!: Header
    private bubble!: Bubble
    private banner!: Banner
    private tap!: Tap

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.phaseIndex = 0
        this.state = 'intro'
        this.introduce = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.built = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.stage = createStage(this)
        this.room = createRoom(this, this.stage)
        this.board = createBoard(this, this.stage, this.audio)
        this.nico = createNico(this, this.stage)
        this.pages = createPages(this, this.audio, () => void this.build())
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.tap = createTap(this)
        this.header.setHelpEnabled(false)

        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.startPhase(++this.gen, 0)
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.tap?.destroy()
        this.banner?.destroy()
        this.bubble?.destroy()
        this.header?.destroy()
        this.pages?.destroy()
        this.nico?.destroy()
        this.board?.destroy()
        this.room?.destroy()
        this.stage?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update() {
        this.stage?.sort()
    }

    // ───────────────────────────────────────────── fase

    private async startPhase(gen: number, index: number) {
        this.phaseIndex = index
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        this.header.setPhase(index)
        this.banner.clear()
        this.board.setPhase(this.phase)
        this.pages.setPhase(this.phase)
        this.nico.pose('idle')

        if (index > 0) {
            await this.fade(false)
            if (gen !== this.gen) return
        }
        if (index === 0 && this.introduce) {
            await this.opening(gen)
            if (gen !== this.gen) return
        } else {
            await this.board.showBox(true)
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            await this.board.showGhost()
            if (gen !== this.gen) return
            await this.pages.enter(this.board.boxTop())
            if (gen !== this.gen) return
        }
        this.play()
    }

    private async opening(gen: number) {
        this.header.visible(false)
        this.nico.pose('box')
        await this.stage.close({ x: NICO.x + 40, y: NICO.y - 140 }, 1)
        if (gen !== this.gen) return
        await FX.wait(this, 600)
        if (gen !== this.gen) return
        await this.nicoSays(SAY.gift)
        if (gen !== this.gen) return
        this.nico.pose('idle')
        await this.board.showBox(false)
        if (gen !== this.gen) return
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await this.board.showBox(true)
        if (gen !== this.gen) return
        await this.stage.open()
        if (gen !== this.gen) return
        this.header.visible(true)
        await this.board.showGhost()
        if (gen !== this.gen) return
        await this.nicoSays(SAY.same)
        if (gen !== this.gen) return
        await this.pages.enter(this.board.boxTop())
        if (gen !== this.gen) return
        this.nico.pose('read')
        await this.nicoSays(SAY.manual)
        if (gen !== this.gen) return
        this.nico.pose('idle')
        await this.ruleDemo(gen)
        if (gen !== this.gen) return
        await this.controlsDemo(gen)
        if (gen !== this.gen) return
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.go, ...spot(this.pages.trayRect(), 4), balloonX: 520, balloonY: 250, buttonLabel: LABEL.go },
        ])
    }

    private async ruleDemo(gen: number) {
        const top = this.phase.pieces.find(p => p.kind === 'ramp' && p.r > 0)
        const base = top && this.phase.pieces.find(p => p.kind === 'block' && p.c === top.c && p.r === top.r - 1)
        if (!top || !base) return
        const from = () => ({ ...this.board.boxTop(), w: CELL * 0.4 })
        this.nico.pose('place')
        await this.board.fall(top, from())
        if (gen !== this.gen) return
        await this.nico.oops()
        if (gen !== this.gen) return
        await this.nicoSays(SAY.falls)
        if (gen !== this.gen) return
        this.board.clear()
        this.nico.pose('place')
        await this.board.place(base, from())
        if (gen !== this.gen) return
        await this.board.place(top, from())
        if (gen !== this.gen) return
        await this.nico.cheer()
        if (gen !== this.gen) return
        await this.nicoSays(SAY.stays)
        if (gen !== this.gen) return
        this.nico.pose('idle')
        await this.board.putAway()
    }

    private async controlsDemo(gen: number) {
        const id = this.phase.tray[0]
        const card = this.pages.cardAt(id)
        void this.tap.press(card.x, card.y)
        await FX.wait(this, 320 + TIMING.tapDown)
        if (gen !== this.gen) return
        await this.pages.tap(id)
        if (gen !== this.gen) return
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        const slot = this.pages.slotAt(0)
        void this.tap.press(slot.x, slot.y)
        await FX.wait(this, 320 + TIMING.tapDown)
        if (gen !== this.gen) return
        await this.pages.tapSlot(0)
        if (gen !== this.gen) return
        await FX.wait(this, 400)
    }

    private nicoSays(text: string) {
        const head = this.nico.head()
        const at = this.stage.toScreen(head.x + 30, head.y - 20)
        return this.bubble.say(text, { x: at.x + 60, y: at.y }, LABEL.next)
    }

    private play() {
        this.state = 'play'
        this.header.setHelpEnabled(true)
        this.pages.setPlayable(true)
    }

    // ───────────────────────────────────────────── montar

    private async build() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'build'
        this.header.setHelpEnabled(false)
        this.pages.setPlayable(false)
        await FX.all(this.header.lift(true), this.room.focus(true))
        if (gen !== this.gen) return

        const steps = build(this.pages.order())
        for (const [i, step] of steps.entries()) {
            await this.pages.lift(i)
            if (gen !== this.gen) return
            this.nico.pose('read')
            await FX.wait(this, TIMING.read)
            if (gen !== this.gen) return
            this.nico.pose('place')
            const from = this.pages.take(i)
            if (!step.ok) {
                await this.board.fall(step.piece, from)
                if (gen !== this.gen) return
                await this.fail(gen, i, step.piece)
                return
            }
            await this.board.place(step.piece, from)
            if (gen !== this.gen) return
            this.pages.done(i)
            this.nico.pose('idle')
            await FX.wait(this, 180)
            if (gen !== this.gen) return
        }
        await this.roll(gen)
    }

    private async roll(gen: number) {
        this.state = 'roll'
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.nico.pose('release')
        await this.board.release(this.nico.hands())
        if (gen !== this.gen) return
        this.nico.pose('idle')
        await this.board.roll()
        if (gen !== this.gen) return
        await this.success(gen)
    }

    private async success(gen: number) {
        void this.nico.cheer()
        this.audio.good()
        this.score += POINTS
        this.hits += 1
        this.built += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await FX.all(this.header.lift(false), this.room.focus(false))
        if (gen !== this.gen) return
        await this.header.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.party)
        if (gen !== this.gen) return
        if (this.phaseIndex >= this.level.phases.length - 1) {
            void this.endLevel()
            return
        }
        await this.fade(true)
        if (gen !== this.gen) return
        await this.startPhase(gen, this.phaseIndex + 1)
    }

    private fade(out: boolean) {
        const cam = this.cameras.main
        return new Promise<void>(resolve => {
            const event = out ? Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE : Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE
            cam.once(event, () => resolve())
            if (out) cam.fadeOut(TIMING.fade, 0x2a1f30)
            else cam.fadeIn(TIMING.fade, 0x2a1f30)
        })
    }

    // ───────────────────────────────────────────── erro

    private async fail(gen: number, index: number, piece: Piece) {
        this.state = 'error'
        void this.pages.blame(index)
        void this.nico.oops()
        this.banner.say(FELL[piece.kind])
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.pages.setPlayable(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        this.pages.setPlayable(false)
        this.header.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP.rule, ...spot(this.board.ghostRect(), 6), balloonX: 640, balloonY: 500, buttonLabel: LABEL.resume },
        ])
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.audio.win()
        this.nico.pose('cheer')
        void FX.confetti(this, { colors: [C.yellow, C.blue, C.green, C.coral, C.ramp] })
        await FX.wait(this, TIMING.finale)
        if (gen !== this.gen) return

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()
        this.state = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.accent,
            messageColor: CSS.inkSoft,
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(!last
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () => this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.accent,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.min(100, Math.round((this.built / this.level.phases.length) * 100)),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') this.score = command.points ?? this.score
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
