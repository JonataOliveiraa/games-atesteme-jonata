import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, POINTS, TRAINING, guideKey } from '../data/levels'
import { BALLOON, CARD, DEPTH, H, RIDER, STOP, W } from '../data/layout'
import { RIDERS } from '../data/riders'
import { SITUATIONS, isRight } from '../data/situations'
import { A, C, CSS, FONT, SIZE } from '../data/theme'
import { LEVEL_INTRO, TEACH } from '../data/words'
import type { LevelDef, Mode, RiderId, SituationId, StopDef } from '../types'

import { act } from './action'
import type { Rect } from './art'
import { createAudio, type Audio } from './audio'
import { createBus, type Bus } from './bus'
import { createCard, type Card } from './card'
import { createFinale, type Finale } from './finale'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createStop, type RiderView, type StopView } from './stop'
import { createStreet, type Street } from './street'

const GAME_ID = 'rota-do-busao'
const SHOW_ERROR_MS = 800
const FINALE_MS = 2400
const SIDE_BALLOON = { balloonX: 380, balloonY: 300 }
const HOP = { stride: 95, height: 34, ms: 300, wait: 70, climb: 60 }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private stopIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private travel = 0

    private score = 0
    private hits = 0
    private errors = 0
    private served = 0

    private audio!: Audio
    private street!: Street
    private bus!: Bus
    private card!: Card
    private hud!: Hud
    private finale!: Finale
    private current?: StopView
    private walkers: Phaser.GameObjects.Container[] = []
    private balloon?: Phaser.GameObjects.Container
    private focus!: Phaser.GameObjects.Rectangle

    private unsubPlatform?: () => void

    private get stop(): StopDef {
        return this.level.stops[this.stopIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.stopIndex = 0
        this.mode = 'intro'
        this.guiding = false
        this.travel = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.served = 0
        this.current = undefined
        this.walkers = []
        this.balloon = undefined
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.street = createStreet(this, this.level.scenery)
        this.bus = createBus(this)
        this.card = createCard(this)
        this.focus = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.focus)
        this.finale = createFinale(this)
        this.hud = createHud(this, {
            phases: this.level.stops.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)

        this.bindInput()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        if (this.registry.get(key)) void this.startLevel(false)
        else {
            this.registry.set(key, true)
            if (this.level.level === 1) void this.runGuide()
            else void this.startLevel(true)
        }
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.hud?.destroy()
        this.finale?.destroy()
        this.balloon?.destroy()
        this.walkers.forEach(w => w.destroy())
        this.current?.destroy()
        this.card?.destroy()
        this.bus?.destroy()
        this.street?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private bindInput() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length || this.mode !== 'choose' || !this.current) return
            const index = this.current.riderAt(pointer.x, pointer.y)
            if (index >= 0) this.pick(index)
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        const index = ['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].indexOf(event.code) % 3
        if (index >= 0 && this.current && index < this.current.riders.length) this.pick(index)
    }

    private driveTo(next: StopView): Promise<void> {
        const old = this.current
        this.current = next
        const start = this.travel
        const proxy = { v: 0 }
        old?.group.setDepth(DEPTH.stop)
        this.bus.drive(true)
        this.audio.drive(STOP.driveMs / 1000)
        old?.wave()
        return new Promise(resolve => {
            this.tweens.add({
                targets: proxy,
                v: STOP.travel,
                duration: STOP.driveMs,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    this.street.setOffset(start + proxy.v)
                    if (old) old.group.x = STOP.x - proxy.v
                    next.group.x = STOP.x + STOP.travel - proxy.v
                },
                onComplete: () => {
                    this.travel = start + STOP.travel
                    old?.destroy()
                    this.bus.drive(false)
                    this.audio.brake()
                    resolve()
                },
            })
        })
    }

    private async arriveAt(def: StopDef) {
        const next = createStop(this, def, STOP.x + STOP.travel)
        await this.driveTo(next)
        await this.card.show(def.situation)
        this.audio.plim()
    }

    private async startLevel(introduce: boolean) {
        const gen = ++this.gen
        this.guiding = false
        this.stopIndex = 0
        this.hud.setPhase(0)
        await this.nextStop(gen, introduce)
    }

    private async nextStop(gen: number, introduce = false) {
        this.mode = 'drive'
        this.hud.setHelpEnabled(false)
        await this.card.hide()
        if (gen !== this.gen) return
        await this.arriveAt(this.stop)
        if (gen !== this.gen) return
        const intro = LEVEL_INTRO[this.level.level]
        if (introduce && intro && this.current) {
            this.mode = 'guide'
            this.guiding = true
            await teach(this, guideKey(this.level.level), [
                { text: intro, ...spot(this.ridersRect(this.current)), ...SIDE_BALLOON },
            ])
            this.guiding = false
            if (gen !== this.gen) return
        }
        this.mode = 'choose'
        this.current?.group.setDepth(DEPTH.stopFocus)
        this.setFocus(true)
        this.hud.setHelpEnabled(true)
    }

    private setFocus(on: boolean) {
        this.tweens.killTweensOf(this.focus)
        void FX.to(this, this.focus, { fillAlpha: on ? A.focus : 0 }, { duration: on ? 320 : 240 })
    }

    private pick(index: number) {
        if (this.mode !== 'choose' || !this.current) return
        this.mode = 'act'
        this.hud.setHelpEnabled(false)
        const rider = this.current.take(index)
        this.walkers.push(rider.container)
        void this.resolve(rider)
    }

    private async tryRider(rider: RiderView, ok: boolean) {
        const c = rider.container
        this.audio.hop()
        await FX.to(this, c, { y: c.y - 46 }, { duration: 170, ease: 'Quad.easeOut', yoyo: true })
        this.audio.act(RIDERS[rider.id].glyph)
        await act(this, RIDERS[rider.id].glyph, { x: c.x, y: c.y - RIDER.size * 0.6 }, { x: CARD.x, y: CARD.y }, ok)
        if (ok) this.audio.plim()
        await this.card.mark(ok)
    }

    private async hopTo(c: Phaser.GameObjects.Container, x: number, y: number) {
        const fromX = c.x
        const fromY = c.y
        const hops = Math.max(2, Math.ceil(Math.abs(x - fromX) / HOP.stride))
        for (let i = 1; i <= hops; i++) {
            const t = i / hops
            const nx = fromX + (x - fromX) * t
            const ny = fromY + (y - fromY) * t
            this.audio.step(i)
            await FX.to(this, c, { x: (c.x + nx) / 2, y: Math.min(c.y, ny) - HOP.height, angle: -6 }, { duration: HOP.ms / 2, ease: 'Quad.easeOut' })
            await FX.to(this, c, { x: nx, y: ny, angle: 0 }, { duration: HOP.ms / 2, ease: 'Quad.easeIn' })
            void FX.impact(this, c, 0.08)
        }
    }

    private async board(rider: RiderView) {
        const c = rider.container
        const art = c.list[0] as Phaser.GameObjects.Image
        c.list.slice(1).forEach(part => (part as Phaser.GameObjects.Graphics).setVisible(false))
        const foot = this.bus.doorFoot()
        const door = this.bus.doorCenter()

        await this.hopTo(c, foot.x + HOP.wait, foot.y)
        this.audio.door()
        await this.bus.openDoor()

        await FX.to(this, art, { angle: -14 }, { duration: 110 })
        await FX.to(this, art, { angle: 14 }, { duration: 160, yoyo: true, repeat: 1 })
        art.setAngle(0)

        this.audio.hop()
        await FX.to(this, c, { x: door.x + 10, y: foot.y - HOP.climb, scale: 0.8 }, { duration: 260, ease: 'Back.easeOut' })
        void this.bus.honk()
        await FX.to(this, c, { x: door.x, y: door.y + 30, scaleX: 0.1, scaleY: 0.6, alpha: 0 }, { duration: 240, ease: 'Quad.easeIn' })
        c.destroy()
        this.walkers = this.walkers.filter(w => w !== c)
        void this.bus.closeDoor()
        this.audio.bell()
        await this.bus.seat(rider.id)
    }

    private async resolve(rider: RiderView) {
        const gen = this.gen
        const ok = isRight(this.stop.situation, rider.id)
        await this.tryRider(rider, ok)
        if (gen !== this.gen) return

        if (!ok) {
            await this.fail(gen, rider)
            return
        }

        this.score += POINTS
        this.hits += 1
        this.served += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()

        this.setFocus(false)
        await this.board(rider)
        if (gen !== this.gen) return
        void this.hud.celebrate(this.stopIndex)
        this.audio.honk()
        void this.bus.honk()

        if (this.stopIndex + 1 < this.level.stops.length) {
            this.stopIndex += 1
            await this.nextStop(gen)
            return
        }
        void this.endLevel()
    }

    private async fail(gen: number, rider: RiderView) {
        const c = rider.container
        this.say(c.x, c.y - RIDER.size + BALLOON.dy, RIDERS[rider.id].line)
        this.audio.fail()
        void FX.shake(this, c, { amount: 6, times: 2 })
        await FX.wait(this, SHOW_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private say(x: number, y: number, text: string) {
        this.balloon?.destroy()
        const label = this.add
            .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const w = Math.max(BALLOON.minW, label.width + 44)
        const h = BALLOON.h
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.16)
        bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        const cx = Phaser.Math.Clamp(x, w / 2 + 12, W - w / 2 - 12)
        const tail = Phaser.Math.Clamp(x - cx, -w / 2 + 30, w / 2 - 30)
        bg.fillTriangle(tail - 12, h / 2 - 2, tail + 12, h / 2 - 2, tail, h / 2 + 18)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        this.balloon = this.add.container(cx, y, [bg, label]).setDepth(DEPTH.balloon).setScale(0.8).setAlpha(0)
        void FX.to(this, this.balloon, { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.audio.lose()

        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    private signStep(stop: StopView) {
        return { text: TEACH.sign, ...spot(union(this.card.rect(), stop.signRect())), ...SIDE_BALLOON }
    }

    private ridersRect(stop: StopView): Rect {
        return stop.riders.map((_, i) => stop.riderRect(i)).reduce(union)
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)

        await this.arriveAt(TRAINING)
        if (gen !== this.gen || !this.current) return
        const stop = this.current
        const key = guideKey(this.level.level)

        await teach(this, key, [
            this.signStep(stop),
            { text: TEACH.riders, ...spot(this.ridersRect(stop)), ...SIDE_BALLOON, buttonLabel: 'Próximo' },
        ])
        if (gen !== this.gen) return

        const target = stop.riderRect(0)
        await teach(this, key, [
            {
                text: TEACH.demo,
                ...spot(union(this.card.rect(), target)),
                ...SIDE_BALLOON,
                pointer: { fromX: target.x, fromY: target.y, toX: target.x, toY: target.y, tap: true },
                buttonLabel: 'Ver',
            },
        ])
        if (gen !== this.gen) return

        const rider = stop.take(0)
        this.walkers.push(rider.container)
        await this.tryRider(rider, true)
        if (gen !== this.gen) return
        await this.board(rider)
        if (gen !== this.gen) return

        await teach(this, key, [{ text: TEACH.window, ...spot(this.bus.windowRect(0)) }])
        if (gen !== this.gen) return
        await this.bus.unseat()
        if (gen !== this.gen) return
        void this.startLevel(false)
    }

    private async explain() {
        if (this.mode !== 'choose' || this.guiding || !this.current) return
        const gen = this.gen
        const stop = this.current
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)

        await teach(this, `${guideKey(this.level.level)}-help`, [
            this.signStep(stop),
            { text: TEACH.riders, ...spot(this.ridersRect(stop)), ...SIDE_BALLOON },
            { text: TEACH.help, ...spot(this.ridersRect(stop)), ...SIDE_BALLOON, buttonLabel: 'Continuar' },
        ])
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = 'choose'
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
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

        await this.card.hide()
        if (gen !== this.gen) return
        await this.driveTo(createStop(this, null, STOP.x + STOP.travel))
        if (gen !== this.gen) return
        this.audio.win()
        this.bus.cheer()
        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const pairs = this.level.stops.map(
            stop => [stop.situation, SITUATIONS[stop.situation].owner] as [SituationId, RiderId],
        )
        await this.finale.map(pairs, i => this.audio.pop(i))
        if (gen !== this.gen) return
        void FX.confetti(this, { colors: [C.yellow, C.mint, C.coral, C.lilac, C.drop] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        this.mode = 'done'
        showLevelComplete(this, {
            accent: C.yellow,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: this.level.level < LEVELS.length ? `Nível ${this.level.level} completo!` : 'Fim da linha!',
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.stops.length, current: this.level.stops.length },
            ...(this.level.level < LEVELS.length
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () =>
                              this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.yellow,
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
            progress: Math.round((this.served / this.level.stops.length) * 100),
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
