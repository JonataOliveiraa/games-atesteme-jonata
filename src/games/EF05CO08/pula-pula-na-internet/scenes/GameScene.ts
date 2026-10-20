import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { buildCourse } from '../data/course'
import { CAMERA, COLUMN, H, ITEM } from '../data/layout'
import { LEVELS, POINTS, guideKey, trusts } from '../data/levels'
import { PHONE, PHYS, speedFor } from '../data/physics'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL } from '../data/words'
import type { Course, ItemDef, LevelDef, Platform, State } from '../types'

import { createAudio, type Audio } from './audio'
import { createCaption, type Caption } from './caption'
import { createCard, type Card } from './card'
import { createControls, type Controls } from './controls'
import { createHand, type Hand } from './hand'
import { createHeader, type Header } from './header'
import { createPhone, type Phone } from './phone'
import { createView, type View } from './view'
import { createWorld, type World } from './world'

const GAME_ID = 'pula-pula-na-internet'

const approach = (v: number, to: number, step: number) => (v < to ? Math.min(to, v + step) : Math.max(to, v - step))

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private course!: Course
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private target = 0

    private x = 0
    private y = 0
    private vx = 0
    private vy = 0
    private lastLand!: Platform
    private lastOffset = 0

    private demoDir = 0
    private demoing = false
    private skip = false
    private idleSince = 0

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private world!: World
    private phone!: Phone
    private controls!: Controls
    private header!: Header
    private card!: Card
    private caption!: Caption
    private hand!: Hand

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.state = 'intro'
        this.introduce = false
        this.target = 0
        this.vx = 0
        this.vy = 0
        this.lastOffset = 0
        this.demoDir = 0
        this.demoing = false
        this.skip = false
        this.idleSince = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.course = buildCourse(this.level.course)
        this.view = createView(this, -CAMERA.start)
        this.audio = createAudio()
        this.world = createWorld(this, this.view, this.course, this.level.items)
        this.phone = createPhone(this, this.view)
        this.controls = createControls(this)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.items.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.card = createCard(this, { tick: () => this.audio.tick() })
        this.caption = createCaption(this)
        this.hand = createHand(this)
        this.header.setHelpEnabled(false)
        this.header.ask(this.goal())

        const ground = this.course.platforms[0]
        this.lastLand = ground
        this.x = ground.x
        this.y = ground.y
        this.vy = -speedFor(PHYS.jump)
        this.phone.place(this.x, this.y, 0, this.vy)

        this.input.on('pointerdown', this.onDown, this)
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
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.input.off('pointerdown', this.onDown, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.hand?.destroy()
        this.caption?.destroy()
        this.card?.destroy()
        this.header?.destroy()
        this.controls?.destroy()
        this.phone?.destroy()
        this.world?.destroy()
        this.view?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(time: number, deltaMs: number) {
        if (!this.world) return
        this.world.update(time)
        const moving = this.state === 'play' || this.state === 'help' || this.state === 'intro'
        if (moving) this.step(Math.min(deltaMs, 34) / 1000, time)
        else this.controls.show(0)
        this.phone.place(this.x, this.y, this.vx, this.vy)
        if (this.state === 'play' && time - this.idleSince > TIMING.idle) {
            this.idleSince = time
            this.nudge()
        }
    }

    private step(dt: number, time: number) {
        const dir = this.state === 'play' ? this.controls.dir() : this.state === 'help' ? this.demoDir : 0
        this.controls.show(dir)
        if (dir && this.state === 'play') this.idleSince = time

        this.vx = approach(this.vx, dir * PHYS.run, (dir ? PHYS.accel : PHYS.brake) * dt)
        this.x += this.vx * dt
        const lo = COLUMN.left + PHONE.w / 2
        const hi = COLUMN.right - PHONE.w / 2
        if (this.x < lo || this.x > hi) {
            this.x = Phaser.Math.Clamp(this.x, lo, hi)
            this.vx = 0
        }

        const prevY = this.y
        this.vy = Math.min(this.vy + PHYS.gravity * dt, PHYS.maxFall)
        this.y += this.vy * dt

        if (this.vy < 0) this.hitClouds(prevY)
        if (this.vy > 0) this.tryLand(prevY)
        if (this.state !== 'play' && this.state !== 'help' && this.state !== 'intro') return

        if (this.state === 'play') this.touchItem()
        this.follow(dt)
        if (this.y - this.view.top() > H + CAMERA.fall) this.respawn()
        if (this.vy < 0 || this.y < this.lastLand.y + 140) this.phone.pose('up')
        else this.phone.pose('fall')
    }

    private hitClouds(prevY: number) {
        for (const cloud of this.course.clouds) {
            if (!this.world.cloudClosed(cloud.item)) continue
            const head = this.y - PHONE.h
            if (prevY - PHONE.h >= cloud.bottom && head < cloud.bottom) {
                this.y = cloud.bottom + PHONE.h
                this.vy = 160
                this.world.bumpCloud(cloud.item)
                this.audio.bump()
                return
            }
        }
    }

    private tryLand(prevY: number) {
        let best: { p: Platform; px: number } | null = null
        for (const p of this.course.platforms) {
            if (prevY > p.y + 1 || this.y < p.y) continue
            const px = this.world.platformX(p)
            if (Math.abs(this.x - px) > p.w / 2 + PHONE.foot) continue
            if (!best || p.y < best.p.y) best = { p, px }
        }
        if (best) this.land(best.p, best.px)
    }

    private land(p: Platform, px: number) {
        this.y = p.y
        this.lastLand = p
        this.lastOffset = this.x - px
        this.phone.land()
        this.world.landed(p)
        this.audio.boing()
        if (p.kind === 'topo' && this.state === 'play' && this.target >= this.level.items.length) {
            this.vy = 0
            void this.finish()
            return
        }
        this.vy = -speedFor(PHYS.jump)
        if (p.kind === 'parada' && p.item === this.target && this.state === 'play' && !this.world.itemTaken(p.item)) {
            void this.collect(p.item)
        }
    }

    private touchItem() {
        const i = this.target
        if (i >= this.level.items.length || this.world.itemTaken(i)) return
        const at = this.world.itemAt(i)
        const d = Phaser.Math.Distance.Between(this.x, this.y - PHONE.h / 2, at.x, at.y)
        if (d < ITEM.reach + PHONE.w / 2) void this.collect(i)
    }

    private follow(dt: number) {
        const top = this.view.top()
        const want = this.y - CAMERA.anchor
        if (want >= top) return
        this.view.setTop(top + (want - top) * Math.min(1, dt / CAMERA.follow))
    }

    private respawn() {
        const p = this.lastLand
        const px = this.world.platformX(p)
        const room = Math.max(0, p.w / 2 - PHONE.w / 2)
        this.x = px + Phaser.Math.Clamp(this.lastOffset, -room, room)
        this.y = p.y
        this.vx = 0
        this.vy = -speedFor(PHYS.jump)
        if (p.y - this.view.top() > H - 120) this.view.setTop(p.y - CAMERA.respawn)
        this.audio.glitch()
        void this.phone.glitch()
    }

    private onDown() {
        if (this.demoing) {
            this.skip = true
            return
        }
        this.idleSince = this.time.now
        this.hand.stop()
    }

    private goal() {
        const item = this.level.items[this.target]
        return item ? LABEL.goTo(item.kind) : LABEL.goTop
    }

    private item(i: number): ItemDef {
        return this.level.items[i]
    }

    private checkpoint(i: number): Platform {
        return this.course.platforms.find(p => p.item === i) ?? this.lastLand
    }

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        if (this.introduce) {
            this.state = 'help'
            await this.demo(gen)
            if (gen !== this.gen) return
        }
        this.play()
    }

    private play() {
        this.state = 'play'
        this.idleSince = this.time.now
        this.header.setHelpEnabled(true)
        this.header.ask(this.goal())
    }

    private async demo(gen: number) {
        this.demoing = true
        this.skip = false
        this.header.setHelpEnabled(false)
        this.hand.stop()
        const on = () => gen === this.gen && !this.skip
        try {
            this.caption.say(CAPTION.move)
            for (const dir of [1, -1] as const) {
                const hold = this.hand.hold(this.controls.pad(dir), TIMING.demoHold)
                await FX.wait(this, 300)
                if (!on()) return
                this.demoDir = dir
                await hold
                this.demoDir = 0
                if (!on()) return
            }
            this.hand.stop()
            const next = this.level.items[this.target]
            if (next) {
                this.caption.say(CAPTION.climb(next.kind))
                this.world.pingItem(this.target)
                await FX.wait(this, TIMING.caption + 400)
                if (!on()) return
            }
            this.audio.pick()
            this.caption.say(CAPTION.yourTurn, C.yes)
            await FX.wait(this, TIMING.caption)
        } finally {
            if (gen === this.gen) {
                this.demoDir = 0
                this.hand.stop()
                this.caption.hide()
                this.demoing = false
                this.skip = false
            }
        }
    }

    private nudge() {
        const next = this.target < this.level.items.length ? this.world.itemAt(this.target) : this.course.summit
        const dir = Math.abs(next.x - this.x) < 60 ? 1 : next.x < this.x ? -1 : 1
        void this.hand.hold(this.controls.pad(dir), 700).then(() => this.hand.stop())
        this.world.pingItem(this.target)
    }

    private async collect(i: number) {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'card'
        this.controls.show(0)
        this.header.setHelpEnabled(false)
        this.hand.stop()
        this.caption.hide()
        this.vx = 0
        this.vy = 0
        this.y = this.checkpoint(i).y
        this.phone.place(this.x, this.y, 0, 0)
        this.phone.pose('read')
        this.audio.collect()
        await this.world.takeItem(i, { x: this.x, y: this.y - PHONE.h * 0.6 })
        if (gen !== this.gen) return
        this.header.ask(LABEL.trustAsk, true)
        this.audio.open()
        await this.card.open(this.item(i), this.phone.screen(), trust => void this.answer(gen, i, trust))
    }

    private async answer(gen: number, i: number, trust: boolean) {
        if (gen !== this.gen || this.state !== 'card') return
        this.audio.pick()
        const item = this.item(i)
        if (trust !== trusts(item)) {
            await this.wrong(gen, item)
            return
        }
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.audio.good()
        this.phone.pose('happy')
        await this.card.verdict(item, true)
        await FX.wait(this, TIMING.read)
        if (gen !== this.gen) return
        if (trust) {
            this.audio.save()
            await this.card.keep(this.phone.screen())
        } else {
            this.audio.block()
            await this.card.block()
        }
        if (gen !== this.gen) return
        this.done += 1
        this.target = i + 1
        this.emitCheckpoint()
        void this.header.celebrate(i)
        this.header.ask(this.goal())
        const look = this.checkpoint(i).y - CAMERA.reveal
        if (look < this.view.top()) await this.view.panTo(look, TIMING.pan)
        if (gen !== this.gen) return
        this.audio.cloud()
        await this.world.openCloud(i)
        if (gen !== this.gen) return
        this.vy = -speedFor(PHYS.boost)
        this.play()
    }

    private async wrong(gen: number, item: ItemDef) {
        this.state = 'error'
        this.audio.oops()
        this.phone.pose('sad')
        void this.card.shake()
        await this.card.verdict(item, false)
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        await this.demo(gen)
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async finish() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.controls.show(0)
        this.phone.pose('happy')
        this.caption.say(CAPTION.top, C.gold)
        this.audio.win()
        void this.phone.cheer()
        void FX.confetti(this, { colors: [C.gold, C.phone, C.summitLight, C.yes, C.dotRed] })
        await FX.wait(this, TIMING.finale)
        if (gen !== this.gen) return
        this.caption.hide()
        this.endLevel()
    }

    private endLevel() {
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
            progress: { total: this.level.items.length, current: this.done },
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
            progress: Math.min(100, Math.round((this.done / this.level.items.length) * 100)),
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
