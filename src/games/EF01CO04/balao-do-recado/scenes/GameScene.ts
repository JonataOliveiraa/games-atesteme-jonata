import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import {
    CHOICE_GUIDE_KEY,
    CHOICE_POINTS,
    DELIVER_LEAD,
    FALLS_SHORT,
    GUIDE_KEY,
    LEVELS,
    RETRY_POINTS,
    RING_POINTS,
    SLOW_AFTER_STRIKES,
    SLOW_FACTOR,
    birdAt,
    choiceForms,
    failOf,
    hitsBird,
    passes,
    rewindTo,
    shuffled,
} from '../data/levels'
import { ARRIVAL_CAPTION, FAIL_CAPTION } from '../data/captions'
import { BIRD, W } from '../data/layout'
import { messageAt } from '../data/messages'
import { C, CSS } from '../data/theme'
import type { Form, LegDef, LevelDef, Message, Mode, Ring } from '../types'

import { createArrival, type Arrival } from './arrival'
import { createAudio, type Audio } from './audio'
import { createDelivery, type Delivery } from './delivery'
import { createBalloon, type Balloon } from './balloon'
import { createBird, type Bird } from './bird'
import { createCaption, type Caption } from './caption'
import { createCard, type Card } from './card'
import { createChoice, type Choice } from './choice'
import { createFlightGuide, type FlightGuide } from './guide'
import { createHud, type Hud } from './hud'
import { createMural, type Mural } from './mural'
import { createRings, type Rings } from './rings'
import { createSky, type Sky } from './sky'
import { createWindow, type RecipientWindow } from './window'

const GAME_ID = 'balao-do-recado'
const REWIND_SPEED = 5
const GLIDE_MS = 1500
const FAIL_MS = 1500

export class GameScene extends Phaser.Scene {
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private messageIndex = 0
    private legIndex = 0
    private mode: Mode = 'intro'
    private gen = 0

    private t = 0
    private y = 0
    private vy = 0
    private holding = false
    private guideHold = false
    private burning = false
    private ringIndex = 0
    private strikes: number[] = []
    private locked = false
    private rewindTarget?: Ring
    private rewindDone?: () => void
    private holdWaiter?: () => void
    private choiceWaiter?: () => void
    private forms: Form[] = []

    private score = 0
    private hits = 0
    private firstTry = 0
    private errors = 0
    private legsDone = 0
    private guiding = false

    private audio!: Audio
    private sky!: Sky
    private rings!: Rings
    private balloon!: Balloon
    private window!: RecipientWindow
    private choice!: Choice
    private mural!: Mural
    private card!: Card
    private hud!: Hud
    private guide!: FlightGuide
    private arrival!: Arrival
    private delivery!: Delivery
    private bird!: Bird
    private caption!: Caption

    private unsubPlatform?: () => void

    private get leg(): LegDef {
        return this.level.legs[this.legIndex]
    }

    private get message(): Message {
        return messageAt(this.messageIndex)
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number; message?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.messageIndex = data?.message ?? 0

        this.legIndex = 0
        this.mode = 'intro'
        this.t = 0
        this.y = this.level.flight.startY
        this.vy = 0
        this.holding = false
        this.guideHold = false
        this.burning = false
        this.ringIndex = 0
        this.strikes = []
        this.locked = false
        this.rewindTarget = undefined
        this.rewindDone = undefined
        this.holdWaiter = undefined
        this.choiceWaiter = undefined
        this.forms = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.firstTry = 0
        this.errors = 0
        this.legsDone = 0
        this.guiding = false
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.sky = createSky(this)
        this.rings = createRings(this)
        this.window = createWindow(this)
        this.balloon = createBalloon(this)
        this.bird = createBird(this)
        this.choice = createChoice(this, { balloon: this.balloon, window: this.window })
        this.mural = createMural(this)
        this.card = createCard(this)
        this.caption = createCaption(this)
        this.hud = createHud(this, {
            phases: this.level.legs.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.arrival = createArrival(this, { balloon: this.balloon, window: this.window, card: this.card })
        this.delivery = createDelivery(this, { balloon: this.balloon, window: this.window })
        this.guide = createFlightGuide(this, {
            card: this.card,
            balloon: this.balloon,
            window: this.window,
            choice: this.choice,
            arrival: this.arrival,
        })

        this.choice.onTap(slot => this.onChoice(slot))
        this.bindInput()

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startLeg(0)
    }

    update(_time: number, delta: number) {
        const dt = delta / 1000
        if (this.mode === 'fly') {
            this.steer(dt, this.holding)
            this.advance(dt, delta)
        } else if (this.mode === 'guide') {
            this.steer(dt, this.guideHold || this.holding)
        } else if (this.mode === 'stuck' && this.rewindTarget) {
            this.rewindStep(dt, delta, this.rewindTarget)
        }
    }

    private shutdownScene() {
        this.gen++
        this.holdWaiter?.()
        this.holdWaiter = undefined
        this.choiceWaiter?.()
        this.choiceWaiter = undefined
        this.rewindDone?.()
        this.rewindDone = undefined
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.input.keyboard?.off('keyup', this.onKeyUp, this)
        this.guide?.destroy()
        this.arrival?.destroy()
        this.delivery?.destroy()
        this.hud?.destroy()
        this.caption?.destroy()
        this.card?.destroy()
        this.mural?.destroy()
        this.choice?.destroy()
        this.balloon?.destroy()
        this.bird?.destroy()
        this.window?.destroy()
        this.rings?.destroy()
        this.sky?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private bindInput() {
        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            this.press(true)
        })
        this.input.on('pointerup', () => this.press(false))
        this.input.on('gameout', () => this.press(false))
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
        this.input.keyboard?.on('keyup', this.onKeyUp, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space' || event.code === 'ArrowUp') this.press(true)
    }

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === 'Space' || event.code === 'ArrowUp') this.press(false)
    }

    private press(on: boolean) {
        this.holding = on
        if (!on) return
        const resolve = this.holdWaiter
        this.holdWaiter = undefined
        resolve?.()
    }

    private setBurn(on: boolean) {
        if (on === this.burning) return
        this.burning = on
        this.balloon.burner(on)
        this.audio.burner(on)
    }

    private steer(dt: number, on: boolean) {
        const f = this.level.flight
        this.vy = on ? Math.max(this.vy - f.liftAccel * dt, -f.lift) : Math.min(this.vy + f.sinkAccel * dt, f.sink)
        this.y += this.vy * dt
        if (this.y < f.ceiling) {
            this.y = f.ceiling
            this.vy = Math.max(this.vy, 0)
        }
        if (this.y > f.floor) {
            this.y = f.floor
            this.vy = Math.min(this.vy, 0)
        }
        this.balloon.setY(this.y)
        this.setBurn(on)
    }

    private advance(dt: number, delta: number) {
        const f = this.level.flight
        const ring = this.leg.rings[this.ringIndex]
        const pace = ring && this.strikes[this.ringIndex] >= SLOW_AFTER_STRIKES ? SLOW_FACTOR : 1

        this.t += dt * pace
        this.sky.update(delta, f.scroll * pace)
        this.rings.update(this.t * f.scroll)
        this.placeBird()

        if (this.leg.bird && hitsBird(this.leg.bird, this.t, this.y, f)) {
            this.missRing(true)
            return
        }
        if (ring && this.t >= ring.t) {
            if (passes(ring, this.y, f.slack)) this.hitRing()
            else this.missRing()
            return
        }
        if (!ring && this.t >= this.leg.windowT - DELIVER_LEAD) void this.deliver(this.gen)
    }

    private hitRing() {
        const index = this.ringIndex
        const retried = this.strikes[index] > 0
        const points = retried ? RETRY_POINTS : RING_POINTS
        this.ringIndex += 1

        void this.rings.light(index)
        this.audio.ring(index)
        if (!retried) this.firstTry += 1
        if (this.locked) {
            this.locked = false
            this.balloon.setLocked(false)
            this.audio.unlock()
        }

        this.score += points
        this.hits += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
    }

    private placeBird() {
        const { bird } = this.leg
        if (!bird) return
        const p = birdAt(bird, this.t, this.level.flight)
        if (p.x < -BIRD.size || p.x > W + BIRD.size) {
            this.bird.hide()
            return
        }
        this.bird.show()
        this.bird.place(p.x, p.y)
    }

    private missRing(byBird = false) {
        this.mode = 'stuck'
        this.strikes[this.ringIndex] += 1
        this.locked = true
        this.vy = 0
        this.setBurn(false)
        this.balloon.setLocked(true)
        this.hud.setHelpEnabled(false)
        this.audio.blow()
        if (byBird) void this.bird.hit()
        void this.rewind(this.gen, rewindTo(this.leg, this.ringIndex, this.level.flight))
    }

    private rewindStep(dt: number, delta: number, target: Ring) {
        const f = this.level.flight
        const remaining = this.t - target.t
        const back = Math.min(REWIND_SPEED * dt, remaining)
        if (remaining > 0) this.y += (target.y - this.y) * (back / remaining)
        this.t -= back
        if (dt > 0) this.sky.update(delta, -(back * f.scroll) / dt)
        this.rings.update(this.t * f.scroll)
        this.placeBird()
        this.balloon.setY(this.y)

        if (this.t <= target.t) {
            this.t = target.t
            this.y = target.y
            this.balloon.setY(this.y)
            this.rewindTarget = undefined
            const done = this.rewindDone
            this.rewindDone = undefined
            done?.()
        }
    }

    private async rewind(gen: number, target: Ring) {
        const arrived = new Promise<void>(resolve => {
            this.rewindDone = resolve
        })
        this.rewindTarget = target
        await Promise.all([arrived, this.balloon.blown()])
        if (gen !== this.gen) return

        await this.rings.dotted(this.ringIndex, this.y)
        if (gen !== this.gen) return

        if (this.strikes[this.ringIndex] >= SLOW_AFTER_STRIKES) this.rings.blink(this.ringIndex)
        this.fly()
    }

    private fly() {
        this.mode = 'fly'
        this.vy = 0
        this.audio.wind(true)
        this.hud.setHelpEnabled(!this.guiding)
    }

    private async startLeg(index: number) {
        const gen = ++this.gen
        const f = this.level.flight
        this.legIndex = index
        this.mode = 'intro'
        this.t = 0
        this.y = f.startY
        this.vy = 0
        this.ringIndex = 0
        this.locked = false
        this.rewindTarget = undefined

        const leg = this.leg
        this.strikes = leg.rings.map(() => 0)
        this.setBurn(false)
        this.hud.setHelpEnabled(false)
        this.hud.setPhase(index)
        this.balloon.setLocked(false)
        this.balloon.setY(this.y)
        this.balloon.setMessage(this.message.icon)
        this.card.set(this.message, leg.recipient)
        this.rings.clear()
        leg.rings.forEach((ring, id) => this.rings.spawn(id, ring.t * f.scroll, ring.y))
        this.rings.update(0)
        this.bird.hide()
        this.placeBird()
        this.caption.hide()

        await this.arrival.showDestination(leg.scene)
        if (gen !== this.gen) return

        if (index === 0 && !this.registry.get(GUIDE_KEY)) {
            this.registry.set(GUIDE_KEY, true)
            await this.runGuide()
        } else {
            await FX.wait(this, 700)
        }
        if (gen !== this.gen) return

        this.fly()
    }

    private async runGuide() {
        this.mode = 'guide'
        this.guiding = true
        const childHold = new Promise<void>(resolve => {
            this.holdWaiter = resolve
        })
        await this.guide.play({ press: on => (this.guideHold = on), childHold })
        this.guideHold = false
        this.guiding = false
    }

    private glideTo(y: number): Promise<void> {
        return new Promise(resolve => {
            this.tweens.addCounter({
                from: this.y,
                to: y,
                duration: GLIDE_MS,
                ease: 'Sine.easeInOut',
                onUpdate: tween => {
                    this.y = tween.getValue() ?? y
                    this.balloon.setY(this.y)
                },
                onComplete: () => resolve(),
                onStop: () => resolve(),
            })
        })
    }

    private async deliver(gen: number) {
        this.mode = 'deliver'
        this.vy = 0
        this.setBurn(false)
        this.hud.setHelpEnabled(false)
        this.audio.wind(false)
        this.bird.hide()

        const leg = this.leg
        await Promise.all([this.window.enter(leg.scene, 'wait'), this.glideTo(leg.windowY)])
        if (gen !== this.gen) return

        await this.arrival.focus()
        if (gen !== this.gen) return

        await this.caption.show(ARRIVAL_CAPTION[leg.scene])
        if (gen !== this.gen) return

        await this.arrival.voiceRange()
        if (gen !== this.gen) return

        this.forms = shuffled(choiceForms(leg))
        await this.choice.show(this.forms, this.message)
        if (gen !== this.gen) return

        if (!this.registry.get(CHOICE_GUIDE_KEY)) {
            this.registry.set(CHOICE_GUIDE_KEY, true)
            void this.runChoiceGuide(gen)
            return
        }

        this.choose()
    }

    private choose() {
        this.mode = 'choose'
        this.choice.setEnabled(true)
        this.hud.setHelpEnabled(!this.guiding)
    }

    private async runChoiceGuide(gen: number) {
        this.guiding = true
        const childTap = new Promise<void>(resolve => {
            this.choiceWaiter = resolve
        })
        this.choose()

        await this.guide.choose(childTap)
        this.guiding = false
        if (gen !== this.gen) return
        if (this.mode === 'choose') this.hud.setHelpEnabled(true)
    }

    private onChoice(slot: number) {
        if (this.mode !== 'choose') return
        const resolve = this.choiceWaiter
        this.choiceWaiter = undefined
        resolve?.()
        void this.pick(slot)
    }

    private async pick(slot: number) {
        const gen = this.gen
        const form = this.forms[slot]
        const fail = failOf(this.leg, form)
        this.mode = 'deliver'
        this.choice.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.arrival.hideRange()
        this.caption.hide()
        this.audio.tap()

        await this.choice.fly(slot, this.window.target, fail !== null && FALLS_SHORT.includes(fail))
        if (gen !== this.gen) return
        void this.choice.clear()

        if (fail) {
            this.window.show('fail', fail)
            this.audio.fail()
            await this.caption.show(FAIL_CAPTION[fail])
            if (gen !== this.gen) return
            await FX.wait(this, FAIL_MS)
            if (gen !== this.gen) return
            await this.delivery.think(null)
            if (gen !== this.gen) return
            this.lose()
            return
        }

        await this.delivered(gen, form)
    }

    private async delivered(gen: number, form: Form) {
        await this.delivery.play(form, this.message)
        if (gen !== this.gen) return
        this.audio.deliver()
        this.balloon.cheer()
        await this.delivery.think(this.message)
        if (gen !== this.gen) return

        this.score += CHOICE_POINTS
        this.hits += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: CHOICE_POINTS,
            stage: this.level.level,
        })
        this.legsDone += 1
        this.emitCheckpoint()
        void this.hud.celebrate(this.legIndex)

        await FX.wait(this, 500)
        if (gen !== this.gen) return

        this.mode = 'mural'
        await this.mural.drop()
        if (gen !== this.gen) return
        this.audio.stamp()
        await this.mural.pin(this.legIndex, this.message, form)
        if (gen !== this.gen) return
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        const next = this.legIndex + 1
        if (next >= this.level.legs.length) {
            void this.endLevel()
            return
        }

        await Promise.all([this.mural.lift(), this.window.leave()])
        if (gen !== this.gen) return
        void this.startLeg(next)
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.setBurn(false)
        this.hud.setHelpEnabled(false)
        this.audio.wind(false)
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

    private stars(): number {
        const total = this.level.legs.reduce((sum, leg) => sum + leg.rings.length, 0)
        const ratio = total ? this.firstTry / total : 1
        if (ratio >= 0.9) return 3
        if (ratio >= 0.7) return 2
        return 1
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
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
        void FX.confetti(this, { colors: [C.coral, C.sun, C.mint, C.lilac] })
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.sun,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: 'Recado entregue!',
            message: 'O que o recado diz não muda. Muda o jeito de viajar.',
            stars: this.stars(),
            progress: { total: this.level.legs.length, current: this.level.legs.length },
            ...(this.level.level < LEVELS.length
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () =>
                              this.scene.restart({
                                  level: this.level.level + 1,
                                  points: this.score,
                                  lives: this.livesLeft,
                                  message: this.messageIndex,
                              }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.sun,
                              onClick: () =>
                                  this.scene.restart({
                                      level: 1,
                                      points: 0,
                                      lives: this.livesTotal,
                                      message: this.messageIndex + 1,
                                  }),
                          },
                      ],
                  }),
        })
    }

    private async explain() {
        if (this.guiding) return
        if (this.mode === 'choose') await this.explainChoice()
        else if (this.mode === 'fly') await this.explainFlight()
    }

    private async explainChoice() {
        const gen = this.gen
        this.mode = 'guide'
        this.guiding = true
        this.choice.setEnabled(false)
        this.hud.setHelpEnabled(false)

        await this.arrival.focus()
        if (gen === this.gen) await this.guide.chooseHint()
        this.guiding = false
        if (gen !== this.gen) return

        this.choose()
    }

    private async explainFlight() {
        const gen = this.gen
        const y = this.y
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.audio.wind(false)

        await this.guide.replay({ press: on => (this.guideHold = on) })
        this.guideHold = false
        this.guiding = false
        if (gen !== this.gen) return

        this.y = y
        this.balloon.setY(y)
        this.setBurn(false)
        this.fly()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.legsDone / this.level.legs.length) * 100),
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
                        message: this.messageIndex,
                    })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') {
                this.holding = false
                this.setBurn(false)
                this.audio.wind(false)
                this.scene.pause()
            }
            if (command.type === 'RESUME_GAME') {
                this.scene.resume()
                if (this.mode === 'fly') this.audio.wind(true)
            }
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
