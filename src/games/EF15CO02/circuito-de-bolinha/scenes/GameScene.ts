import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { NICO } from '../data/layout'
import { LEVELS, POINTS, SIDES, guideKey } from '../data/levels'
import { again, bellOf, descend, other, run, spot as cellSpot, type Position } from '../data/logic'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { BLOCKED, CAT, COUNT, FELL, HELP, LABEL, MISSING, SAY, TEACH, TITLE } from '../data/words'
import type { Act, Fail, LevelDef, Outcome, Path, PhaseDef, Piece, Side, State, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBoard, type Board } from './board'
import { createBubble, type Bubble } from './bubble'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createNico, type Nico } from './nico'
import { createPages, type Pages } from './pages'
import { createPipoca, type Pipoca } from './pipoca'
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
    private pipoca!: Pipoca
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
        this.pipoca = createPipoca(this, this.stage, this.audio)
        this.pages = createPages(this, this.audio, () => void this.build())
        this.header = createHeader(this, {
            level: this.level.level,
            title: TITLE[this.level.level],
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
        this.pipoca?.destroy()
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
        this.pipoca.hide()
        this.board.setPhase(this.phase)
        this.pages.setPhase(this.phase)
        this.nico.pose('idle')

        if (index > 0) {
            await this.fade(false)
            if (gen !== this.gen) return
        }
        if (index === 0 && this.introduce) {
            const intro = this.level.level === 3 ? this.introIf(gen) : this.level.level === 2 ? this.introRepeat(gen) : this.opening(gen)
            await intro
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
        await this.yourTurn()
    }

    private yourTurn() {
        return teach(this, guideKey(this.level.level), [
            { text: TEACH.go, ...spot(this.pages.trayRect(), 4), balloonX: 520, balloonY: 250, buttonLabel: LABEL.go },
        ])
    }

    private fromBox() {
        return { ...this.board.boxTop(), w: this.board.cell() * 0.4 }
    }

    private async ruleDemo(gen: number) {
        const top = this.phase.model.find(p => p.kind === 'ramp' && p.r > 0)
        const base = top && this.phase.model.find(p => p.kind === 'block' && p.c === top.c && p.r === top.r - 1)
        if (!top || !base) return
        this.nico.pose('place')
        await this.board.fall(top, this.fromBox())
        if (gen !== this.gen) return
        await this.nico.oops()
        if (gen !== this.gen) return
        await this.nicoSays(SAY.falls)
        if (gen !== this.gen) return
        this.board.clear()
        this.nico.pose('place')
        await this.board.place(base, this.fromBox())
        if (gen !== this.gen) return
        await this.board.place(top, this.fromBox())
        if (gen !== this.gen) return
        await this.nico.cheer()
        if (gen !== this.gen) return
        await this.nicoSays(SAY.stays)
        if (gen !== this.gen) return
        this.nico.pose('idle')
        await this.board.putAway()
    }

    private async press(at: Vec) {
        void this.tap.press(at.x, at.y)
        await FX.wait(this, 320 + TIMING.tapDown)
    }

    private async controlsDemo(gen: number) {
        const id = this.phase.tray[0].id
        await this.press(this.pages.cardAt(id))
        if (gen !== this.gen) return
        await this.pages.tap(id)
        if (gen !== this.gen) return
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        await this.press(this.pages.holderAt({ slot: 0 }))
        if (gen !== this.gen) return
        await this.pages.tapAt({ slot: 0 })
        if (gen !== this.gen) return
        await FX.wait(this, 400)
    }

    private async introRepeat(gen: number) {
        const phase = this.phase
        const c = Math.max(0, Math.min(...phase.bells) - 1)
        const demo: PhaseDef = {
            id: 'demo',
            model: [0, 1, 2].map(r => ({ id: `demo${r}`, kind: 'block', c, r })),
            bells: phase.bells,
            slots: 1,
            tray: [{ id: 'demo', kind: 'repeat', c, n: 3 }],
        }
        await this.board.showBox(true)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.pages.setPhase(demo)
        await this.pages.enter(this.board.boxTop())
        if (gen !== this.gen) return
        await this.press(this.pages.cardAt('demo'))
        if (gen !== this.gen) return
        await this.pages.tap('demo')
        if (gen !== this.gen) return
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.times, ...spot(this.pages.cardRect('demo'), 14), balloonX: 520, balloonY: 300, buttonLabel: LABEL.see },
        ])
        if (gen !== this.gen) return
        if (!(await this.perform(gen, run(demo, this.pages.order()).acts))) return
        await this.nico.cheer()
        if (gen !== this.gen) return
        this.nico.pose('idle')
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await FX.all(this.board.putAway(), this.pages.leave(this.board.boxTop()))
        if (gen !== this.gen) return
        this.pages.setPhase(phase)
        await this.board.showGhost()
        if (gen !== this.gen) return
        await this.pages.enter(this.board.boxTop())
        if (gen !== this.gen) return
        await this.yourTurn()
    }

    private async introIf(gen: number) {
        const phase = this.phase
        const choice = phase.choice
        if (!choice || !phase.cond) return
        const side = other(phase.cond)
        const ramp = (left: boolean): Piece => ({ id: left ? 'demo-l' : 'demo-r', kind: 'ramp', ...choice, ...(left ? { left } : {}) })
        const demo: PhaseDef = {
            ...phase,
            id: 'demo',
            cond: side,
            slots: 1,
            ifSlot: 0,
            tray: [true, false].map(left => ({ id: ramp(left).id, kind: 'piece', piece: ramp(left) })),
        }
        const catBell = bellOf(phase, side)
        const ends = (piece: Piece) => {
            const built = new Map(phase.model.map(p => [cellSpot(p.c, p.r), p]))
            built.set(cellSpot(piece.c, piece.r), piece)
            return descend(built, phase.bells)
        }
        const away = [ramp(true), ramp(false)].find(p => ends(p)?.bell !== catBell) ?? ramp(true)
        const near = away.left ? ramp(false) : ramp(true)
        const path = ends(away)

        await this.board.showBox(true)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.board.showGhost()
        if (gen !== this.gen) return
        this.pages.setPhase(demo)
        await this.pages.enter(this.board.boxTop())
        if (gen !== this.gen) return
        await this.pipoca.enter(this.board.catSpot(catBell), this.board.cell())
        if (gen !== this.gen) return
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.ifHere, ...spot(this.board.bellRect(catBell), 14), balloonX: 640, balloonY: 200, buttonLabel: LABEL.next },
        ])
        if (gen !== this.gen) return
        for (const id of [away.id, near.id]) {
            await this.press(this.pages.cardAt(id))
            if (gen !== this.gen) return
            await this.pages.tap(id)
            if (gen !== this.gen) return
            await FX.wait(this, 300)
            if (gen !== this.gen) return
        }
        this.nico.pose('place')
        for (const piece of [...phase.model].sort((a, b) => a.r - b.r)) {
            await this.board.place(piece, this.fromBox())
            if (gen !== this.gen) return
        }
        const yes: Act = { slot: 0, pocket: 'yes', piece: away, count: 1, total: 1, ok: true, land: away.r }
        if (!(await this.perform(gen, [yes]))) return
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.ifAway, ...spot(this.board.ghostRect(), 10), balloonX: 640, balloonY: 600, buttonLabel: LABEL.see },
        ])
        if (gen !== this.gen) return
        if (path) {
            await this.roll(gen, path)
            if (gen !== this.gen) return
            await this.nico.cheer()
            if (gen !== this.gen) return
            this.nico.pose('idle')
        }
        await FX.all(this.board.putAway(), this.pages.leave(this.board.boxTop()), this.pipoca.leave())
        if (gen !== this.gen) return
        this.pages.setPhase(phase)
        await this.pages.enter(this.board.boxTop())
        if (gen !== this.gen) return
        await this.yourTurn()
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
        const phase = this.phase
        this.state = 'build'
        this.header.setHelpEnabled(false)
        this.pages.setPlayable(false)
        await FX.all(this.header.lift(true), this.room.focus(true))
        if (gen !== this.gen) return

        const tape = this.pages.order()
        if (phase.ifSlot === undefined) {
            if (!(await this.descent(gen, run(phase, tape)))) return
            await this.success(gen)
            return
        }

        const sides = Phaser.Utils.Array.Shuffle([...SIDES])
        await this.pipoca.enter(this.board.catSpot(bellOf(phase, sides[0])), this.board.cell())
        if (gen !== this.gen) return
        const first = run(phase, tape, sides[0])
        if (!(await this.descent(gen, first, sides[0]))) return
        void this.nico.cheer()
        this.audio.good()
        await FX.wait(this, TIMING.party)
        if (gen !== this.gen) return
        this.board.stow()
        this.state = 'build'
        await this.pipoca.move(this.board.catSpot(bellOf(phase, sides[1])))
        if (gen !== this.gen) return
        this.nico.pose('place')
        for (const act of first.acts.filter(a => a.pocket && a.ok)) {
            await this.board.remove(act.piece, this.nico.hands())
            if (gen !== this.gen) return
        }
        this.nico.pose('idle')
        await FX.wait(this, TIMING.read)
        if (gen !== this.gen) return
        if (!(await this.descent(gen, again(phase, first, tape, sides[1]), sides[1]))) return
        await this.success(gen)
    }

    private async perform(gen: number, acts: Act[]): Promise<boolean> {
        let current: Position | undefined
        const close = (at: Position) => {
            this.pages.done(at)
            if (at.pocket) this.pages.done({ slot: at.slot })
        }
        for (const act of acts) {
            const at: Position = { slot: act.slot, pocket: act.pocket }
            if (!current || current.slot !== at.slot || current.pocket !== at.pocket) {
                if (current) close(current)
                current = at
                if (at.pocket) {
                    await this.pages.lift({ slot: at.slot })
                    if (gen !== this.gen) return false
                    this.nico.pose('think')
                    await FX.wait(this, TIMING.think)
                    if (gen !== this.gen) return false
                }
                await this.pages.lift(at)
                if (gen !== this.gen) return false
                this.nico.pose('read')
                await FX.wait(this, TIMING.read)
                if (gen !== this.gen) return false
            }
            if (act.total > 1) {
                this.pages.count(at, act.count)
                await FX.wait(this, TIMING.count)
                if (gen !== this.gen) return false
            }
            this.nico.pose('place')
            const from = this.pages.take(at)
            if (!act.ok) {
                await this.board.fall(act.piece, from, act.land)
                return false
            }
            await this.board.place(act.piece, from)
            if (gen !== this.gen) return false
            if (act.count < act.total) this.pages.restore(at)
            this.nico.pose('idle')
            await FX.wait(this, 180)
            if (gen !== this.gen) return false
        }
        if (current) close(current)
        return true
    }

    private async descent(gen: number, out: Outcome, side?: Side): Promise<boolean> {
        const placed = await this.perform(gen, out.acts)
        if (gen !== this.gen) return false
        const fail = out.fail
        if (fail && fail.why !== 'cat') {
            if (placed && fail.why === 'extra') await this.board.topple(fail.piece)
            if (placed && fail.why === 'missing') {
                this.nico.pose('think')
                await this.board.flash(fail.piece)
            }
            if (gen !== this.gen) return false
            await this.fail(gen, fail)
            return false
        }
        if (!out.path) return false
        const cat = fail && side ? this.pipoca.head() : undefined
        await this.roll(gen, out.path, cat)
        if (gen !== this.gen) return false
        if (fail) {
            await this.pipoca.wake()
            if (gen !== this.gen) return false
            await this.board.spill()
            if (gen !== this.gen) return false
            await this.fail(gen, fail)
            return false
        }
        return true
    }

    private async roll(gen: number, path: Path, cat?: Vec) {
        this.state = 'roll'
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.nico.pose('release')
        await this.board.release(this.nico.hands(), path)
        if (gen !== this.gen) return
        this.nico.pose('idle')
        await this.board.roll(path, cat)
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

    private failText(fail: Fail) {
        switch (fail.why) {
            case 'under':
                return this.level.level === 2 ? COUNT.few : FELL[fail.piece.kind]
            case 'extra':
                return COUNT.many
            case 'blocked':
                return BLOCKED
            case 'missing':
                return MISSING[fail.piece.kind]
            case 'cat':
                return CAT
        }
    }

    private async fail(gen: number, fail: Fail) {
        this.state = 'error'
        if (fail.slot !== undefined) void this.pages.blame({ slot: fail.slot, pocket: fail.pocket })
        void this.nico.oops()
        this.banner.say(this.failText(fail))
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
            { text: HELP[this.level.level], ...spot(this.board.ghostRect(), 6), balloonX: 640, balloonY: 500, buttonLabel: LABEL.resume },
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
