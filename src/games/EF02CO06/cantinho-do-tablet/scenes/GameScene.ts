import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, POINTS, TEST_ORDER, guideKey } from '../data/levels'
import { BETO, CABLE, CUP, FOCUS, H, LIA, TABLE_TOP, W, WINDOW } from '../data/layout'
import { C, CSS } from '../data/theme'
import { INTRO, OUCH, SEAL, TEACH, YAY } from '../data/words'
import type { LevelDef, Mode, Rect, SpotId, State, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createCast, type Cast } from './cast'
import { ensureArt } from './fallback'
import { tutorialDone } from '../../../../shared/tutorial/createTutorial'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createRoom, type Room } from './room'
import { createSpots, type Spots } from './spots'
import { createBalloon, createBoard, createCoach, createPlayButton, createSeals, type Balloon, type Board, type Coach, type PlayButton, type Seals } from './ui'

const GAME_ID = 'cantinho-do-tablet'
const FOCUS_MS = 460
const SHOW_ERROR_MS = 700
const PHASE_PAUSE_MS = 1300
const FINALE_MS = 2000
const STAGE: Rect = { x: 560, y: 452, w: 980, h: 470 }

const grow = (r: Rect, by: number): Rect => ({ x: r.x, y: r.y, w: r.w + by * 2, h: r.h + by * 2 })
const flip = (state: State): State => (state === 'risk' ? 'safe' : 'risk')

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private waitFor?: { id: SpotId; resolve: () => void }

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0

    private audio!: Audio
    private room!: Room
    private cast!: Cast
    private spots!: Spots
    private play!: PlayButton
    private balloon!: Balloon
    private seals!: Seals
    private coach!: Coach
    private board!: Board
    private hud!: Hud

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.phaseIndex = 0
        this.mode = 'intro'
        this.guiding = false
        this.waitFor = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cleared = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.cameras.main.setBounds(0, 0, W, H)
        ensureArt(this)

        this.audio = createAudio()
        this.room = createRoom(this)
        this.cast = createCast(this)
        this.spots = createSpots(this, this.room, this.level.spots, id => void this.tapSpot(id))
        this.play = createPlayButton(this, () => void this.runTest())
        this.balloon = createBalloon(this)
        this.seals = createSeals(this)
        this.coach = createCoach(this)
        this.board = createBoard(this)
        this.hud = createHud(this, {
            phases: this.level.phases.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.arrange(0)
        const key = guideKey(this.level.level)
        if (this.registry.get(key)) this.openSetup()
        else {
            this.registry.set(key, true)
            void this.runGuide()
        }
    }

    update(time: number) {
        this.room.update(time)
        this.spots.update(time)
    }

    private shutdownScene() {
        this.gen++
        this.waitFor = undefined
        this.hud?.destroy()
        this.board?.destroy()
        this.coach?.destroy()
        this.seals?.destroy()
        this.balloon?.destroy()
        this.play?.destroy()
        this.spots?.destroy()
        this.cast?.destroy()
        this.room?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private arrange(index: number) {
        this.phaseIndex = index
        this.hud.setPhase(index)
        const risk = this.level.phases[index].risk
        TEST_ORDER.forEach(id => void this.room.set(id, this.level.spots.includes(id) && risk.includes(id) ? 'risk' : 'safe', false))
        this.cast.reset()
    }

    private openSetup() {
        tutorialDone(this)
        this.mode = 'setup'
        this.spots.enable(this.level.spots)
        this.spots.glow(this.level.spots)
        this.play.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private closeSetup() {
        this.spots.enable([])
        this.play.setEnabled(false)
        this.hud.setHelpEnabled(false)
    }

    private async tapSpot(id: SpotId) {
        if (this.waitFor) {
            if (this.waitFor.id !== id) return
            const done = this.waitFor.resolve
            this.waitFor = undefined
            done()
            return
        }
        if (this.mode !== 'setup') return
        const gen = this.gen
        this.mode = 'busy'
        this.play.setEnabled(false)
        this.audio.tap()
        this.audio.swap()
        await this.room.set(id, flip(this.room.state(id)), true)
        if (gen !== this.gen || this.mode !== 'busy') return
        this.mode = 'setup'
        this.play.setEnabled(true)
    }

    private async focus(id: SpotId) {
        const f = FOCUS[id]
        const cam = this.cameras.main
        cam.pan(f.x, f.y, FOCUS_MS, 'Sine.easeInOut')
        cam.zoomTo(f.zoom, FOCUS_MS, 'Sine.easeInOut')
        await FX.wait(this, FOCUS_MS + 40)
    }

    private async unfocus() {
        const cam = this.cameras.main
        cam.pan(W / 2, H / 2, FOCUS_MS, 'Sine.easeInOut')
        cam.zoomTo(1, FOCUS_MS, 'Sine.easeInOut')
        await FX.wait(this, FOCUS_MS + 40)
    }

    private catLanding(): Vec {
        return { x: this.room.tablet().x + CUP.offset - 112, y: TABLE_TOP }
    }

    private async happen(id: SpotId): Promise<boolean> {
        const room = this.room
        const cast = this.cast
        if (id === 'cup') {
            this.audio.meow()
            await cast.catJump(this.catLanding())
            if (room.state('cup') === 'risk') {
                this.audio.splash()
                await room.spill()
                void cast.catScare()
                return false
            }
            await cast.catSniff()
            await cast.catHome()
            return true
        }
        if (id === 'cable') {
            this.audio.run()
            await cast.betoRun(BETO.trip, 900)
            if (room.state('cable') === 'risk') {
                this.audio.trip()
                const fall = room.yank(() => cast.betoFoot())
                await cast.betoTrip()
                await fall
                this.audio.crash()
                return false
            }
            return true
        }
        if (id === 'edge') {
            this.audio.run()
            await cast.betoRun(BETO.bump, 380)
            this.audio.tap()
            void cast.betoOops()
            const ok = await room.bump()
            if (!ok) {
                this.audio.crash()
                return false
            }
            await cast.betoLeave()
            return true
        }
        const ok = await room.sunPeak()
        if (!ok) this.audio.sizzle()
        return ok
    }

    private sealAt(id: SpotId): Vec {
        if (id === 'cup') {
            const c = this.room.cup()
            return this.room.state('cup') === 'safe' ? { x: c.x - 118, y: c.y - 30 } : { x: c.x, y: c.y - 80 }
        }
        if (id === 'cable') return { x: CABLE.hit.x + 175, y: CABLE.hit.y - 6 }
        if (id === 'edge') {
            const t = this.room.tablet()
            return { x: t.x, y: t.y - 110 }
        }
        return { x: WINDOW.x, y: WINDOW.y - 40 }
    }

    private ouchAt(): Vec {
        const t = this.room.tablet()
        return { x: t.x, y: t.y - (t.y < TABLE_TOP ? 200 : 130) }
    }

    private async runTest() {
        if (this.mode !== 'setup') return
        const gen = ++this.gen
        this.mode = 'test'
        this.closeSetup()
        this.spots.glow([])
        this.audio.play()
        void this.play.show(false)
        await this.hud.show(false)
        if (gen !== this.gen) return

        for (const id of TEST_ORDER.filter(s => this.level.spots.includes(s))) {
            await this.focus(id)
            if (gen !== this.gen) return
            const ok = await this.happen(id)
            if (gen !== this.gen) return
            if (!ok) {
                await this.fail(gen, id)
                return
            }
            this.audio.seal()
            await this.seals.add(this.sealAt(id), SEAL[id])
            if (gen !== this.gen) return
            await FX.wait(this, 240)
            if (gen !== this.gen) return
        }
        await this.unfocus()
        if (gen !== this.gen) return
        await this.cheer(gen)
    }

    private async fail(gen: number, id: SpotId) {
        this.cast.liaPose('scared')
        await this.balloon.say(this.ouchAt(), OUCH[id], 'oops')
        if (gen !== this.gen) return
        await FX.wait(this, SHOW_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.closeSetup()
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    private async cheer(gen: number) {
        this.cast.liaPose('yay')
        this.room.shine()
        this.audio.win()
        void FX.stars(this, this.room.tablet().x, this.room.tablet().y, { color: C.glow, count: 10 })
        await this.balloon.say({ x: LIA.x + 40, y: LIA.footY - 262 }, YAY)
        if (gen !== this.gen) return

        this.score += POINTS
        this.hits += 1
        this.cleared += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        void this.hud.show(true)
        await this.hud.celebrate(this.phaseIndex)
        await FX.wait(this, PHASE_PAUSE_MS)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        await FX.curtain(
            this,
            async () => {
                this.balloon.hide()
                await this.seals.clear()
                this.arrange(next)
            },
            C.cream,
        )
        if (gen !== this.gen) return
        void this.play.show(true)
        this.openSetup()
    }

    private waitTap(id: SpotId): Promise<void> {
        return new Promise(resolve => {
            this.waitFor = { id, resolve }
        })
    }

    private async introduce(gen: number, id: SpotId): Promise<boolean> {
        const key = guideKey(this.level.level)
        const look = union(grow(this.room.hit(id), 16), grow(this.room.hit('edge'), 16))
        this.spots.glow(this.level.spots)
        await teach(this, key, [{ text: INTRO[id].look, ...spot(look), buttonLabel: 'Ver' }])
        if (gen !== this.gen) return false
        this.spots.glow([])

        await this.focus(id)
        await this.happen(id)
        if (gen !== this.gen) return false
        this.cast.liaPose('scared')
        await this.balloon.say(this.ouchAt(), OUCH[id], 'oops')
        await FX.wait(this, 1200)
        if (gen !== this.gen) return false
        this.balloon.hide()
        this.audio.rewind()
        await FX.flash(this, C.white, { duration: 420, peak: 0.85 })
        this.cast.reset()
        this.room.rewind()
        await this.unfocus()
        if (gen !== this.gen) return false

        const hit = this.room.hit(id)
        await teach(this, key, [
            {
                text: INTRO[id].fix,
                ...spot(grow(hit, 16)),
                pointer: { fromX: hit.x, fromY: hit.y, toX: hit.x, toY: hit.y, tap: true },
                balloonY: hit.y > 420 ? 150 : 540,
                buttonLabel: 'Ok',
            },
        ])
        if (gen !== this.gen) return false
        tutorialDone(this)
        this.coach.show(grow(hit, 18), { x: hit.x, y: hit.y })
        this.spots.enable([id])
        await this.waitTap(id)
        if (gen !== this.gen) return false
        this.coach.hide()
        this.spots.enable([])
        this.audio.tap()
        this.audio.swap()
        await this.room.set(id, 'safe', true)
        if (gen !== this.gen) return false

        await this.focus(id)
        await this.happen(id)
        if (gen !== this.gen) return false
        this.audio.seal()
        await this.seals.add(this.sealAt(id), SEAL[id])
        await FX.wait(this, 500)
        if (gen !== this.gen) return false
        await this.unfocus()
        await this.seals.clear()
        this.cast.reset()
        return gen === this.gen
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.guiding = true
        this.closeSetup()
        this.spots.glow(this.level.spots)
        const key = guideKey(this.level.level)

        this.cast.liaPose('point')
        const first = this.level.level === 1
        await teach(this, key, [{ text: first ? TEACH.goal : TEACH.fresh, ...spot(STAGE), buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        for (const id of this.level.fresh) {
            if (!(await this.introduce(gen, id))) return
        }

        this.spots.glow(this.level.spots)
        const all = this.level.spots.map(id => grow(this.room.hit(id), 14))
        const play = this.play.rect()
        this.play.setEnabled(true)
        await teach(this, key, [
            { text: TEACH.you, ...spot(all.reduce(union)), buttonLabel: first ? 'Próximo' : 'Vamos começar!' },
            ...(first
                ? [
                      {
                          text: TEACH.play,
                          ...spot(grow(play, 12)),
                          pointer: { fromX: play.x, fromY: play.y, toX: play.x + 30, toY: play.y + 10, tap: true },
                          balloonY: 260,
                      },
                  ]
                : []),
        ])
        if (gen !== this.gen) return
        this.guiding = false
        this.cast.liaPose('wait')
        this.openSetup()
    }

    private async explain() {
        if (this.mode !== 'setup' || this.guiding) return
        const gen = this.gen
        this.mode = 'panel'
        this.guiding = true
        this.closeSetup()
        const all = this.level.spots.map(id => grow(this.room.hit(id), 14))
        const play = this.play.rect()
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: TEACH.goal, ...spot(STAGE) },
            { text: TEACH.toggle, ...spot(all.reduce(union)) },
            { text: TEACH.play, ...spot(grow(play, 12)), balloonY: 260, buttonLabel: 'Continuar' },
        ])
        this.guiding = false
        if (gen !== this.gen) return
        this.openSetup()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.closeSetup()
        this.balloon.hide()
        await this.seals.clear()
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

        await this.board.show(TEST_ORDER.filter(id => this.level.spots.includes(id)).map(id => SEAL[id]))
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.mint, C.coral, C.lilac, C.yellow] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.mint,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.mintDark,
            messageColor: CSS.inkSoft,
            title: last ? 'Cantinho seguro!' : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.mint,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () => this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }),
        })
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.cleared / this.level.phases.length) * 100),
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
