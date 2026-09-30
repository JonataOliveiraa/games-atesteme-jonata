import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, POINTS, matches, pickUnder, piecesOf, shuffled } from '../data/levels'
import { TRAY } from '../data/layout'
import { C, CSS } from '../data/theme'
import type { BoxDef, LevelDef, Mode, Spot } from '../types'

import { createAudio, type Audio } from './audio'
import { createBox, type Box } from './box'
import { createCabinet, type Cabinet } from './cabinet'
import { createClaw, type Claw } from './claw'
import { createClawGuide, type ClawGuide } from './guide'
import { createHud, type Hud } from './hud'
import { createSorting, type Sorting } from './sorting'
import { createTray, type TrayView } from './tray'
import { createVisor, type Visor } from './visor'

const GAME_ID = 'garra-dos-grupos'

export class GameScene extends Phaser.Scene {
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private boxIndex = 0
    private mode: Mode = 'intro'
    private gen = 0

    private filled = 0

    private score = 0
    private hits = 0
    private errors = 0
    private boxesDone = 0
    private guiding = false

    private alignWaiter?: (spot: Spot) => void
    private grabWaiter?: () => void

    private audio!: Audio
    private cabinet!: Cabinet
    private visor!: Visor
    private tray!: TrayView
    private claw!: Claw
    private box!: Box
    private sorting!: Sorting
    private hud!: Hud
    private guide!: ClawGuide

    private unsubPlatform?: () => void

    private get over(): boolean {
        return this.mode === 'done'
    }

    private get current(): BoxDef {
        return this.level.boxes[this.boxIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.boxIndex = 0
        this.mode = 'intro'
        this.filled = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.boxesDone = 0
        this.guiding = false
        this.alignWaiter = undefined
        this.grabWaiter = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.cabinet = createCabinet(this)
        this.visor = createVisor(this)
        this.tray = createTray(this)
        this.claw = createClaw(this)
        this.box = createBox(this, this.level.boxes[0].perBox)
        this.sorting = createSorting(this, { box: this.box, tray: this.tray })
        this.hud = createHud(this, {
            boxes: this.level.boxes.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.guide = createClawGuide(this, { visor: this.visor, claw: this.claw, tray: this.tray })

        this.hud.onShowcaseTap(() => this.onTap())

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startBox(0)
    }

    update(_time: number, delta: number) {
        this.tray.update(delta, this.level.spinMs)
        this.claw.update(delta, this.level.crossMs)

        const spot = pickUnder(this.tray.reachable(), this.claw.x)
        if (this.mode === 'sweep' || this.mode === 'guide') this.claw.setAim(!!spot)

        if (this.alignWaiter && spot && this.fits(spot)) {
            const resolve = this.alignWaiter
            this.alignWaiter = undefined
            this.setMoving(false)
            resolve(spot)
        }
    }

    private shutdownScene() {
        this.gen++
        this.alignWaiter = undefined
        this.grabWaiter?.()
        this.grabWaiter = undefined
        this.guide?.destroy()
        this.sorting?.destroy()
        this.box?.destroy()
        this.claw?.destroy()
        this.tray?.destroy()
        this.visor?.destroy()
        this.hud?.destroy()
        this.cabinet?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private fits(spot: Spot): boolean {
        const view = this.tray.view(spot.index)
        return !!view && matches(view, this.current.rule)
    }

    private setMoving(on: boolean) {
        this.tray.setSpinning(on)
        this.claw.setSweeping(on)
        this.audio.rail(on)
        if (!on) this.claw.setAim(false)
    }

    private resume() {
        this.mode = 'sweep'
        this.setMoving(true)
        this.hud.setShowcaseEnabled(true)
        this.hud.setHelpEnabled(!this.guiding)
    }

    private applyGlow() {
        const ids = piecesOf(this.current)
            .filter(piece => matches(piece, this.current.rule))
            .map(piece => piece.def.id)
        this.tray.setGlow(this.level.glowFromStart ? ids : [])
    }

    private async startBox(index: number) {
        const gen = ++this.gen
        this.boxIndex = index
        this.filled = 0
        this.mode = 'intro'
        this.setMoving(false)
        this.hud.setShowcaseEnabled(false)
        this.hud.setHelpEnabled(false)

        this.hud.setPhase(index)
        this.box.reset(this.current.perBox)
        this.tray.clear()
        this.tray.setItems(shuffled(piecesOf(this.current)))
        this.applyGlow()

        await this.visor.show(this.current.rule)
        if (gen !== this.gen) return

        const guideKey = this.current.guide
        if (guideKey && !this.registry.get(guideKey)) {
            void this.runGuide(gen, guideKey)
            return
        }

        this.resume()
    }

    private aligned(): Promise<Spot> {
        this.mode = 'guide'
        this.setMoving(true)
        return new Promise(resolve => {
            this.alignWaiter = resolve
        })
    }

    private async runGuide(gen: number, key: string) {
        this.mode = 'guide'
        this.guiding = true
        this.hud.setShowcaseEnabled(true)

        const childGrab = new Promise<void>(resolve => {
            this.grabWaiter = resolve
        })

        await this.guide.play({
            aligned: () => this.aligned(),
            grab: () => this.grab(false),
            childGrab,
        }, { drawNot: this.current.rule.not })
        this.guiding = false
        if (gen !== this.gen || this.over) return

        this.registry.set(key, true)
        this.hud.setHelpEnabled(true)
    }

    private onTap() {
        if (this.mode === 'sweep') void this.grab(true)
    }

    private async grab(counts: boolean) {
        const gen = this.gen
        const training = counts && this.guiding
        this.mode = 'busy'
        this.setMoving(false)
        this.hud.setHelpEnabled(false)
        this.audio.tap()

        const spot = pickUnder(this.tray.reachable(), this.claw.x)
        await this.claw.drop(spot ? spot.y : TRAY.cy + TRAY.ry)
        if (gen !== this.gen) return

        if (!spot) {
            await this.claw.grab(null)
            if (gen !== this.gen) return
            this.audio.empty()
            await this.claw.rise()
            if (gen !== this.gen) return
            if (counts) this.childGrabbed()
            this.resume()
            return
        }

        const view = this.tray.take(spot.index)
        this.audio.clac()
        await this.claw.grab(view ?? null)
        if (gen !== this.gen) return
        await this.claw.rise()
        if (gen !== this.gen) return

        if (!view) {
            if (counts) this.childGrabbed()
            this.resume()
            return
        }

        const ok = matches(view, this.current.rule)
        if (!ok && training) {
            this.audio.empty()
            await this.claw.drop(spot.y)
            if (gen !== this.gen) return
            const back = this.claw.give()
            if (back) await this.tray.putBack(spot.index, back)
            if (gen !== this.gen) return
            await this.claw.rise()
            if (gen !== this.gen) return
            this.resume()
            return
        }
        if (counts) this.childGrabbed()

        await this.claw.swing()
        if (gen !== this.gen) return

        const held = this.claw.give()
        if (held) {
            this.audio.whoosh()
            await this.box.catch(held, this.filled, ok, this.current.rule)
            if (gen !== this.gen) return
        }

        if (ok) await this.scoreHit(gen, counts)
        else this.lose()
    }

    private childGrabbed() {
        const resolve = this.grabWaiter
        this.grabWaiter = undefined
        resolve?.()
    }

    private async scoreHit(gen: number, counts: boolean) {
        this.audio.plim(this.filled)
        this.filled += 1

        if (counts) {
            this.score += POINTS
            this.hits += 1
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER',
                gameId: GAME_ID,
                pointsEarned: POINTS,
                stage: this.level.level,
            })
        }

        await this.claw.home()
        if (gen !== this.gen) return

        if (this.filled >= this.current.perBox) {
            await this.finishBox(gen)
            return
        }

        this.resume()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.setMoving(false)
        this.hud.setShowcaseEnabled(false)
        this.hud.setHelpEnabled(false)
        this.claw.setSad(true)
        this.audio.lose()

        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.hud.lives.loseAll()
        this.livesLeft = this.hud.lives.remaining
    }

    private async finishBox(gen: number) {
        this.mode = 'panel'
        this.setMoving(false)
        this.hud.setShowcaseEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.fanfare()

        await this.box.tie()
        if (gen !== this.gen) return

        this.boxesDone += 1
        this.emitCheckpoint()
        void this.hud.celebrate(this.boxIndex)

        await this.sorting.show(this.current.rule)
        if (gen !== this.gen) return
        await this.sorting.hide()
        if (gen !== this.gen) return

        const next = this.boxIndex + 1
        if (next < this.level.boxes.length) void this.startBox(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.setMoving(false)
        this.hud.setShowcaseEnabled(false)
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        this.audio.win()
        void FX.confetti(this, { colors: [C.gold, C.green, C.amber, C.white] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.gold,
            panelColor: 0xf6efff,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            title: 'Grupos prontos!',
            stars: 3,
            progress: { total: this.level.boxes.length, current: this.level.boxes.length },
            ...(this.level.level < LEVELS.length
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () =>
                              this.scene.restart({
                                  level: this.level.level + 1,
                                  points: this.score,
                                  lives: this.livesLeft,
                              }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.gold,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private async explain() {
        if (this.mode !== 'sweep' || this.guiding) return
        const gen = this.gen
        this.mode = 'busy'
        this.hud.setHelpEnabled(false)
        this.hud.setShowcaseEnabled(false)

        await this.guide.replay({ aligned: () => this.aligned() }, { drawNot: this.current.rule.not })
        if (gen !== this.gen) return

        this.resume()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.boxesDone / this.level.boxes.length) * 100),
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
