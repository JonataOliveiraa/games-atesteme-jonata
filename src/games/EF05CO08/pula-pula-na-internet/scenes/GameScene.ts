import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { altAt, buildCourse } from '../data/course'
import { ITEM_CELL, ITEM_SHEET, cellKey } from '../data/files'
import { CAMERA, COLUMN, DEPTH, H, ITEM, MISS, W } from '../data/layout'
import { LEVELS, POINTS, guideKey, trusts } from '../data/levels'
import { PHONE, PHYS, feelAt, speedFor } from '../data/physics'
import { BANNERS } from '../data/scenery'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL, TUTOR } from '../data/words'
import type { Course, DemoDef, ItemDef, LevelDef, Platform, State } from '../types'

import { createAudio, type Audio } from './audio'
import { createBackdrop, type Backdrop } from './backdrop'
import { createCaption, type Caption } from './caption'
import { createCard, type Card } from './card'
import { createControls, type Controls } from './controls'
import { seen, spot, teach } from './guide'
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
    private frozen = false
    private target = 0
    private warning = false
    private crossed = new Set<number>()
    private knots: Course['knots'] = []
    private worlds: World[] = []

    private x = 0
    private y = 0
    private vx = 0
    private vy = 0
    private lastLand!: Platform
    private lastOffset = 0

    private demoDir = 0
    private idleSince = 0
    private bannerTimer?: Phaser.Time.TimerEvent

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private backdrop!: Backdrop
    private audio!: Audio
    private world!: World
    private phone!: Phone
    private controls!: Controls
    private header!: Header
    private card!: Card
    private caption!: Caption

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
        this.frozen = false
        this.target = 0
        this.warning = false
        this.crossed = new Set(BANNERS.filter(b => b.at <= this.level.altitude).map(b => b.at))
        this.vx = 0
        this.vy = 0
        this.lastOffset = 0
        this.demoDir = 0
        this.idleSince = 0
        this.bannerTimer = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
        this.knots = []
        this.worlds = []
    }

    create() {
        this.input.topOnly = true
        this.course = buildCourse(this.level.course, this.level.altitude)
        this.view = createView(this, -CAMERA.start)
        this.knots = [...this.course.knots]
        this.backdrop = createBackdrop(this, y => this.alt(y))
        this.audio = createAudio()
        this.world = createWorld(this, this.view, this.course, this.level)
        this.worlds = [this.world]
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
        this.header.setHelpEnabled(false)
        this.header.ask(this.goal())

        const ground = this.course.platforms[0]
        this.lastLand = ground
        this.x = ground.x
        this.y = ground.y
        this.phone.place(this.x, this.y, 0, 0)
        this.backdrop.update(this.view.top(), 0)

        this.input.on('pointerdown', this.onDown, this)
        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.introduce = this.level.level === 1 && !seen(this, guideKey(1))
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.bannerTimer?.remove()
        this.input.off('pointerdown', this.onDown, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.caption?.destroy()
        this.card?.destroy()
        this.header?.destroy()
        this.controls?.destroy()
        this.phone?.destroy()
        this.worlds.forEach(w => w.destroy())
        this.backdrop?.destroy()
        this.view?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private alt(y: number) {
        return altAt({ knots: this.knots }, y)
    }

    private moving() {
        return this.state === 'play' || ((this.state === 'help' || this.state === 'intro') && !this.frozen)
    }

    update(time: number, deltaMs: number) {
        if (!this.world) return
        this.worlds.forEach(w => w.update(time))
        if (this.moving()) this.step(Math.min(deltaMs, 34) / 1000, time)
        else this.controls.show(0)
        this.phone.place(this.x, this.y, this.vx, this.vy)
        this.backdrop.update(this.view.top(), time)
        if (this.state !== 'play') return
        this.watchItem()
        this.watchBanners()
        if (time - this.idleSince > TIMING.idle) {
            this.idleSince = time
            this.nudge()
        }
    }

    private step(dt: number, time: number) {
        const feel = feelAt(this.alt(this.y))
        const dir = this.state === 'play' ? this.controls.dir() : this.demoDir
        this.controls.show(dir)
        if (dir && this.state === 'play') this.idleSince = time

        this.vx = approach(this.vx, dir * PHYS.run, (dir ? feel.accel : feel.brake) * dt)
        this.x += this.vx * dt
        const lo = COLUMN.left + PHONE.w / 2
        const hi = COLUMN.right - PHONE.w / 2
        if (this.x < lo || this.x > hi) {
            this.x = Phaser.Math.Clamp(this.x, lo, hi)
            this.vx = 0
        }

        const prevY = this.y
        this.vy = Math.min(this.vy + feel.gravity * dt, PHYS.maxFall)
        this.y += this.vy * dt
        if (this.vy > 0) this.tryLand(prevY)
        if (!this.moving()) return

        if (this.state === 'play') this.touchItem()
        this.follow(dt)
        if (this.y - this.view.top() > H + CAMERA.fall) this.respawn()
        if (this.vy < 0 || this.y < this.lastLand.y + 140) this.phone.pose('up')
        else this.phone.pose('fall')
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
        this.vy = -speedFor(feelAt(p.alt))
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
        this.vy = -speedFor(feelAt(p.alt))
        if (p.y - this.view.top() > H - 120) this.view.setTop(p.y - CAMERA.respawn)
        this.audio.glitch()
        void this.phone.glitch()
    }

    private watchItem() {
        const i = this.target
        if (i >= this.level.items.length || this.world.itemTaken(i)) return
        const at = this.world.itemAt(i)
        const sy = at.y - this.view.top()
        if (sy > H + ITEM.size * 0.6) {
            void this.missed(i)
            return
        }
        const danger = sy > H - ITEM.warn && this.y < at.y
        if (danger === this.warning) return
        this.warning = danger
        this.world.alarm(i, danger)
        this.header.ask(danger ? LABEL.hurry(this.item(i).kind) : this.goal(), danger)
        if (danger) this.audio.oops()
    }

    private watchBanners() {
        const alt = this.alt(this.y)
        BANNERS.forEach(b => {
            if (this.crossed.has(b.at) || alt < b.at) return
            this.crossed.add(b.at)
            this.audio.zone()
            this.caption.say(b.text, C.butter)
            this.bannerTimer?.remove()
            this.bannerTimer = this.time.delayedCall(TIMING.banner, () => this.caption.hide())
        })
    }

    private onDown() {
        this.idleSince = this.time.now
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

    private nextStep(): Platform | undefined {
        const options = this.course.links.filter(([from]) => from === this.lastLand.id).map(([, to]) => this.course.platforms[to])
        return options.find(p => p.item === this.target && !this.world.itemTaken(this.target)) ?? options.find(p => p.y < this.lastLand.y)
    }

    private nudge() {
        const next = this.nextStep()
        if (next) {
            const dx = this.world.platformX(next) - this.x
            if (Math.abs(dx) > 40) this.controls.ping(dx < 0 ? -1 : 1)
        }
        this.world.pingItem(this.target)
    }

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.frozen = this.introduce
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        if (this.introduce) {
            this.state = 'help'
            await this.intro(gen)
            if (gen !== this.gen) return
        }
        this.frozen = false
        this.play()
    }

    private play() {
        this.state = 'play'
        this.idleSince = this.time.now
        this.header.setHelpEnabled(true)
        this.header.ask(this.goal())
    }

    private async intro(gen: number) {
        const key = guideKey(this.level.level)
        const alive = () => gen === this.gen
        this.frozen = true

        const startTop = this.view.top()
        const at = this.world.itemAt(0)
        await this.view.panTo(at.y - CAMERA.peek, TIMING.pan)
        if (!alive()) return
        const itemRect = { x: at.x, y: at.y - this.view.top(), w: ITEM.size + 50, h: ITEM.size + 50 }
        await teach(this, key, [{ text: TUTOR.collect, ...spot(itemRect), buttonLabel: TUTOR.see, balloonY: 520 }])
        if (!alive()) return
        await this.view.panTo(startTop, TIMING.pan)
        if (!alive()) return

        await this.showDemo(gen, this.level.demos[0])
        if (!alive()) return

        this.frozen = false
        for (const dir of [1, -1] as const) {
            this.controls.ping(dir)
            this.demoDir = dir
            await FX.wait(this, TIMING.demoHold)
            this.demoDir = 0
            if (!alive()) return
        }
        this.audio.pick()
        await teach(this, key, [{ text: TUTOR.yourTurn, shape: 'none' }])
    }

    private async showDemo(gen: number, demo: DemoDef) {
        const key = guideKey(this.level.level)
        const alive = () => gen === this.gen
        const trust = trusts(demo.item)
        this.phone.pose('read')
        this.audio.open()
        await this.card.open(demo.item, this.phone.screen(), undefined, true)
        if (!alive()) return
        await this.card.mark()
        if (!alive()) return
        await teach(this, key, [{ text: demo.text, ...spot(this.card.cluesRect()), buttonLabel: TUTOR.see, balloonY: 575 }])
        if (!alive()) return
        this.audio.pick()
        await this.card.press(trust)
        if (!alive()) return
        if (trust) {
            this.audio.save()
            await this.card.keep(this.phone.screen())
        } else {
            this.audio.block()
            await this.card.block()
        }
        this.phone.pose('up')
    }

    private async collect(i: number) {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'card'
        this.warning = false
        this.world.alarm(i, false)
        this.controls.show(0)
        this.header.setHelpEnabled(false)
        this.caption.hide()
        const check = this.checkpoint(i)
        this.vx = 0
        this.vy = 0
        this.x = Phaser.Math.Clamp(this.x, check.x - check.w / 2 + 24, check.x + check.w / 2 - 24)
        this.y = check.y
        this.lastLand = check
        this.lastOffset = this.x - check.x
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
            await this.wrong(gen, item, trust)
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
        this.phone.pose('up')
        this.vy = -speedFor(feelAt(this.lastLand.alt))
        this.play()
    }

    private async wrong(gen: number, item: ItemDef, trust: boolean) {
        this.state = 'error'
        this.audio.oops()
        this.phone.pose('sad')
        void this.card.shake()
        await this.card.verdict(item, false)
        if (trust) await this.card.spread()
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private async missed(i: number) {
        const gen = ++this.gen
        this.state = 'error'
        this.header.setHelpEnabled(false)
        this.controls.show(0)
        this.phone.pose('sad')
        this.audio.oops()
        const item = this.item(i)
        this.header.ask(LABEL.missed(item.kind), true)
        this.showMiss(item)
        await FX.wait(this, TIMING.miss)
        if (gen !== this.gen) return
        this.lose()
    }

    private showMiss(item: ItemDef) {
        const veil = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.55).setDepth(DEPTH.card - 1).setAlpha(0)
        void FX.to(this, veil, { alpha: 1 }, { duration: 240 })
        const label = this.add
            .text(0, 70, LABEL.missed(item.kind), { fontFamily: FONT.black, fontSize: `${SIZE.miss}px`, color: CSS.ink, align: 'center' })
            .setOrigin(0.5)
            .setResolution(2)
        const w = Math.max(560, label.width + 100)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-w / 2 + 8, -150 + 12, w, 300, 40)
        g.fillStyle(C.card, 1)
        g.fillRoundedRect(-w / 2, -150, w, 300, 40)
        g.fillStyle(C.oops, 1)
        g.fillRoundedRect(-w / 2, 128, w, 22, { tl: 0, tr: 0, bl: 40, br: 40 })
        const icon = this.add.image(0, -50, ITEM_SHEET.key, cellKey(ITEM_CELL[item.kind])).setScale(0.75)
        const box = this.add.container(MISS.x, MISS.y, [g, icon, label]).setDepth(DEPTH.card).setScale(0.7).setAlpha(0)
        void FX.to(this, box, { scale: 1, alpha: 1 }, { duration: 280, ease: 'Back.easeOut' })
        void FX.to(this, icon, { y: 10, alpha: 0.25, angle: 25 }, { duration: 900, delay: 300, ease: 'Cubic.easeIn' })
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
        this.frozen = true
        this.header.setHelpEnabled(false)
        this.controls.show(0)
        await this.showDemo(gen, this.level.demos[0])
        if (gen !== this.gen) return
        this.frozen = false
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
        this.bannerTimer?.remove()
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
        const before = new Set(this.children.list)
        const panel = showLevelComplete(this, {
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
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.accent,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }
                : {}),
        })
        if (last) return
        const shown = this.children.list.filter(o => !before.has(o)) as Phaser.GameObjects.Container[]
        const gen = this.gen
        this.time.delayedCall(TIMING.panel, async () => {
            if (gen !== this.gen) return
            await FX.to(this, shown, { alpha: 0 }, { duration: TIMING.panelOut })
            panel.destroy()
            if (gen === this.gen) this.advance()
        })
    }

    private advance() {
        const from = this.course.summit
        this.level = LEVELS[this.level.level]
        this.course = buildCourse(this.level.course, this.level.altitude, { y: from.y, w: from.w })
        this.knots = [...this.knots, ...this.course.knots]
        this.world = createWorld(this, this.view, this.course, this.level, true)
        this.worlds.push(this.world)
        this.lastLand = this.course.platforms[0]
        this.lastOffset = this.x - from.x
        this.target = 0
        this.done = 0
        this.warning = false
        this.phone.pose('up')
        this.header.setLevel(this.level.level)
        this.header.ask(this.goal())
        this.emitCheckpoint()
        this.introduce = false
        void this.openLevel()
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
