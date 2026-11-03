import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { Ease, FX } from '../../../../shared/effects/FX'

import { answers, FIND, matches, whyWrong } from '../data/finds'
import { LEVELS, POINTS_SCORE, guideKey } from '../data/levels'
import { AIR, CLIENT, DEPTH, DOCK, H, HANDOVER, setWorld, SUB, SURFACE, W, WORLD } from '../data/layout'
import { FINDS, SUB_FRAME } from '../data/files'
import { C, CSS } from '../data/theme'
import { SAY, TEACH } from '../data/words'
import type { FindDef, LevelDef, Mode, PhaseDef, Rect, Request, Vec } from '../types'

import { createArrows, type Arrows } from './arrows'
import { createAudio, type Audio } from './audio'
import { createCard, type Card } from './card'
import { createClient, type Client } from './client'
import { hideScreen, moveCamera, resetCamera } from './close'
import { createControls, type Controls } from './controls'
import { ensureArt } from './fallback'
import { tutorialDone } from '../../../../shared/tutorial/createTutorial'
import { beckon, spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { banner, createAirBar, createAsk, createBag, createMinimap, pin, screenCurtain, type AirBar, type Ask, type Bag, type Minimap } from './overlay'
import { createSonar, type Sonar } from './sonar'
import { createSub, type Sub } from './sub'
import { createMural, type Mural } from './ui'
import { createWorld, type World } from './world'

const GAME_ID = 'mergulho-da-pesquisa'
const SHOW_ERROR_MS = 700
const PHASE_PAUSE_MS = 900
const FINALE_MS = 2400
const MOVE_TO_LEARN = 220
const DEMO_LOOK_MS = 1700

const grow = (r: Rect, by: number): Rect => ({ x: r.x, y: r.y, w: r.w + by * 2, h: r.h + by * 2 })

type Expect = { match: (key: string) => boolean; resolve: () => void }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private teaching = false
    private guiding = false
    private warnPick = false
    private expect?: Expect
    private delivered: FindDef[] = []
    private carried: FindDef[] = []
    private air: number = AIR.max
    private touched = -1
    private warnedAir = false
    private airDemo?: Phaser.Tweens.Tween
    private gifts: Phaser.GameObjects.Image[] = []

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0

    private audio!: Audio
    private world!: World
    private sub!: Sub
    private controls!: Controls
    private sonar!: Sonar
    private arrows!: Arrows
    private airBar!: AirBar
    private minimap!: Minimap
    private bag!: Bag
    private ask!: Ask
    private card!: Card
    private client!: Client
    private mural!: Mural
    private hud!: Hud

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        setWorld(this.level.world)
        this.phaseIndex = 0
        this.mode = 'intro'
        this.teaching = false
        this.guiding = false
        this.warnPick = false
        this.expect = undefined
        this.delivered = []
        this.carried = []
        this.air = AIR.max
        this.touched = -1
        this.airDemo = undefined
        this.gifts = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cleared = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        ensureArt(this)
        this.audio = createAudio()
        this.world = createWorld(this)
        this.sub = createSub(this, (x, y, r) => this.world.push(x, y, r))
        this.client = createClient(this)
        this.controls = createControls(this)
        this.controls.onBoost(() => {
            this.audio.move()
            this.claim('boost')
        })
        this.sonar = createSonar(this, word => this.onToggle(word), this.level.single)
        this.arrows = createArrows(this)
        this.airBar = createAirBar(this)
        this.minimap = createMinimap(this, this.world.fogTexture())
        this.bag = createBag(this)
        this.ask = createAsk(this)
        this.card = createCard(this)
        this.mural = createMural(this)
        this.hud = pin(this, () =>
            createHud(this, {
                phases: this.level.phases.length,
                level: this.level.level,
                livesTotal: this.livesTotal,
                livesLeft: this.livesLeft,
                gameId: GAME_ID,
                stage: () => this.level.level,
                onHelp: () => void this.explain(),
            }),
        )

        this.cameras.main.setBounds(0, 0, WORLD.w, WORLD.h).startFollow(this.sub.sprite, true, 0.12, 0.12)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.teaching = !this.registry.get(key)
        this.registry.set(key, true)
        void this.startPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.expect = undefined
        this.hud?.destroy()
        this.mural?.destroy()
        this.card?.destroy()
        this.ask?.destroy()
        this.minimap?.destroy()
        this.bag?.destroy()
        this.airBar?.destroy()
        this.arrows?.destroy()
        this.sonar?.destroy()
        this.controls?.destroy()
        this.client?.destroy()
        this.sub?.destroy()
        this.world?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(_: number, delta: number) {
        const at = this.sub.at()
        const cam = this.cameras.main
        this.world.shine(cam.scrollX, cam.scrollY, at)
        this.minimap.update(at, this.litPoints(), this.homeward())
        if (this.mode !== 'play') return
        const dt = Math.min(0.05, delta / 1000)
        const now = this.time.now
        const boosting = this.controls.boosting(now)
        this.sub.step(dt, this.controls.vector, boosting)
        const pos = this.sub.at()
        this.world.reveal(pos)
        this.arrows.update(this.cameras.main, this.homeward() ? [{ x: DOCK.x, y: DOCK.y }] : this.litPoints())
        if (this.sub.moved() > MOVE_TO_LEARN) this.claim('move')

        const atDock = pos.x < DOCK.right + 80 && pos.y < SURFACE + 150
        if (atDock) this.air = Math.min(AIR.max, this.air + AIR.dockRefill * dt)
        else if (!this.guiding) this.air -= (this.level.drain + (boosting ? AIR.boostDrain : 0)) * dt
        if (this.world.pickup(pos)) {
            this.air = Math.min(AIR.max, this.air + AIR.pickup)
            this.audio.pop()
            this.minimap.setMarks(this.world.marks())
        }
        this.airBar.set(this.air)
        if (this.air < AIR.low && !this.warnedAir) {
            this.warnedAir = true
            this.audio.wrong()
            void this.ask.set(SAY.lowAir, 'oops')
            this.time.delayedCall(2600, () => {
                if (this.mode === 'play') void this.ask.set(this.askNow())
            })
        }
        if (this.air > AIR.low + 10) this.warnedAir = false
        if (this.air <= 0) {
            void this.airOut(this.gen)
            return
        }

        if (this.homeward()) {
            if (atDock) void this.deliver(this.gen)
            return
        }

        if (this.touched >= 0 && Phaser.Math.Distance.BetweenPoints(pos, this.world.spot(this.touched)) > SUB.retouch) this.touched = -1
        const i = this.world.touching(pos, SUB.touch)
        if (i >= 0 && i !== this.touched) {
            this.touched = i
            if (this.world.lit().includes(i)) void this.openSpot(this.gen, i)
            else this.sealed(i)
        }
    }

    private waitFor(key: string): Promise<void> {
        return new Promise(resolve => {
            this.expect = { match: k => k === key, resolve }
        })
    }

    private claim(key: string) {
        if (!this.expect?.match(key)) return
        const done = this.expect.resolve
        this.expect = undefined
        done()
    }

    private litPoints(): Vec[] {
        return this.world.lit().map(i => this.world.spot(i))
    }

    private remaining(): Request[] {
        const left = [...this.phase.requests]
        this.carried.forEach(f => {
            const k = left.findIndex(r => answers(f, r))
            if (k >= 0) left.splice(k, 1)
        })
        return left
    }

    private homeward(): boolean {
        return this.carried.length > 0 && this.remaining().length === 0
    }

    private askNow(): string {
        return this.homeward() ? SAY.home : this.phase.ask
    }

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.world.load(this.phase.map, this.phase.spots)
        this.minimap.setMap(this.phase.map)
        this.minimap.setMarks(this.world.marks())
        this.gifts.forEach(g => {
            this.tweens.killTweensOf(g)
            g.destroy()
        })
        this.gifts = []
        this.sub.reset()
        resetCamera(this)
        this.cameras.main.startFollow(this.sub.sprite, true, 0.12, 0.12)
        this.world.reveal(SUB.start)
        this.air = AIR.max
        this.airBar.set(this.air)
        this.touched = -1
        this.carried = []
        this.bag.load(this.phase.requests.length)
        this.arrows.clear()
        this.sonar.load(this.phase.chips)
        this.sonar.setEnabled('none')
        this.controls.setEnabled(false)
        void this.ask.set(this.phase.ask)
        await this.client.load(this.phase.client)
        if (gen !== this.gen) return
        this.client.pose('wait')
        if (this.teaching) {
            if (this.level.level === 1) await this.teachFirst(gen)
            else await this.teachIntro(gen)
            return
        }
        const boostKey = `${guideKey(this.level.level)}-boost`
        if (this.level.level === 1 && index === 1 && !this.registry.get(boostKey)) {
            this.registry.set(boostKey, true)
            if (!(await this.say(gen, [{ text: TEACH.boost, ...spot(this.controls.boostRect()), balloonY: 330, buttonLabel: 'Ok' }]))) return
        }
        this.play()
    }

    private play() {
        tutorialDone(this)
        this.mode = 'play'
        this.controls.setEnabled(true)
        this.sonar.setEnabled('all')
        if (!this.guiding) this.hud.setHelpEnabled(true)
    }

    private hold() {
        this.mode = 'busy'
        this.controls.setEnabled(false)
        this.sonar.setEnabled('none')
        this.hud.setHelpEnabled(false)
        this.sub.stop()
    }

    private onToggle(word: string) {
        if (this.mode !== 'play' && !this.expect?.match(`chip:${word}`)) return
        this.search()
        this.claim(`chip:${word}`)
    }

    private search() {
        const words = this.sonar.selected()
        const lit = this.phase.spots.map((s, i) => (matches(FIND[s.find], words) ? i : -1)).filter(i => i >= 0)
        this.audio.chip()
        if (words.length) {
            this.audio.ping()
            void this.world.ping(this.sub.at())
        }
        this.world.light(lit, this.sub.at())
        this.arrows.update(this.cameras.main, lit.map(i => this.world.spot(i)))
    }

    private showAir(from: number, to: number, ms: number) {
        this.airDemo?.stop()
        const shown = { v: from }
        this.airDemo = this.tweens.add({
            targets: shown,
            v: to,
            duration: ms,
            ease: 'Sine.easeInOut',
            onUpdate: () => this.airBar.set(shown.v),
            onComplete: () => this.airBar.set(to),
        })
    }

    private sealed(i: number) {
        const gen = this.gen
        this.audio.chip()
        this.world.nudge(i)
        this.sub.bounce(this.world.spot(i))
        void this.ask.set(SAY.sealed, 'oops')
        this.time.delayedCall(2000, () => {
            if (gen === this.gen && this.mode === 'play') void this.ask.set(this.askNow())
        })
    }

    private async openSpot(gen: number, i: number) {
        this.hold()
        this.mode = 'card'
        const find = FIND[this.phase.spots[i].find]
        const p = this.world.spot(i)
        const cam = this.cameras.main
        this.audio.open()
        await this.card.open(find, { x: p.x - cam.scrollX, y: p.y - cam.scrollY })
        if (gen !== this.gen) return
        if (this.warnPick) {
            this.warnPick = false
            await teach(this, guideKey(this.level.level), [{ text: TEACH.deliver, ...spot(this.card.deliverRect()), balloonY: 92, buttonLabel: 'Ok' }])
            if (gen !== this.gen) return
        }
        const choice = await this.card.choose()
        if (gen !== this.gen) return
        const right = this.remaining().some(r => answers(find, r))
        if (choice === 'back' || (!right && this.guiding)) {
            await this.card.close()
            if (gen !== this.gen) return
            if (choice !== 'back') {
                void this.ask.set(SAY.notThis, 'oops')
                this.time.delayedCall(1800, () => {
                    if (gen === this.gen) void this.ask.set(this.phase.ask)
                })
            }
            this.sub.bounce(p)
            this.play()
            return
        }
        if (right) await this.collect(gen, i, find)
        else await this.wrong(gen, find)
    }

    private async collect(gen: number, i: number, find: FindDef) {
        this.hold()
        this.audio.stamp()
        await this.card.close()
        if (gen !== this.gen) return
        this.carried.push(find)
        this.world.take(i)
        this.bag.fill(this.carried)
        this.sonar.reset()
        this.world.light([], this.sub.at())
        this.arrows.clear()
        if (this.homeward()) {
            void this.ask.set(SAY.home)
            if (this.guiding && !(await this.say(gen, [{ text: TEACH.home, ...spot(this.minimap.rect()), balloonY: 380, buttonLabel: 'Ok' }]))) return
        } else {
            void this.ask.set(SAY.oneMore)
            this.time.delayedCall(2400, () => {
                if (gen === this.gen && this.mode === 'play' && !this.homeward()) void this.ask.set(this.phase.ask)
            })
        }
        this.play()
    }

    private async deliver(gen: number) {
        this.hold()
        this.guiding = false
        this.teaching = false
        this.arrows.clear()
        if (!(await this.handOver(gen))) return
        this.delivered.push(...this.carried)
        this.score += POINTS_SCORE
        this.hits += 1
        this.cleared += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS_SCORE, stage: this.level.level })
        this.emitCheckpoint()
        await pin(this, () => this.hud.celebrate(this.phaseIndex))
        await FX.wait(this, PHASE_PAUSE_MS)
        if (gen !== this.gen) return
        const next = this.phaseIndex + 1
        if (next >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        await screenCurtain(this, () => {
            this.client.hush()
            const upcoming = this.level.phases[next]
            this.world.load(upcoming.map, upcoming.spots)
            this.minimap.setMap(upcoming.map)
            this.minimap.setMarks(this.world.marks())
        })
        void this.startPhase(next)
    }

    private async handOver(gen: number): Promise<boolean> {
        const standX = DOCK.right - HANDOVER.standIn
        const sub = this.sub.sprite
        const subAt = { x: DOCK.right + HANDOVER.subOut, y: SURFACE + HANDOVER.subDip }
        const showUi = await hideScreen(this)
        if (gen !== this.gen) return false
        sub.setFrame(SUB_FRAME.yellow.move).setFlipX(true).setAngle(0)
        await FX.all(
            moveCamera(this, { x: (standX + subAt.x) / 2, y: HANDOVER.lookY, zoom: HANDOVER.zoom }, HANDOVER.zoomMs),
            FX.to(this, sub, { x: subAt.x, y: subAt.y }, { duration: HANDOVER.zoomMs, ease: Ease.smooth }),
            this.client.walkTo(standX),
        )
        if (gen !== this.gen) return false
        sub.setFrame(SUB_FRAME.yellow.idle)
        this.client.pose('wait')
        void FX.float(this, sub, { amount: 5, duration: 1400 })
        await FX.wait(this, 250)
        if (gen !== this.gen) return false

        const hands = { x: standX + HANDOVER.handX, y: CLIENT.foot - HANDOVER.handY }
        await FX.all(
            ...this.carried.map(async (find, i) => {
                await FX.wait(this, i * HANDOVER.staggerMs)
                const gift = this.add
                    .image(sub.x - 16, sub.y - 24, FINDS, find.frame)
                    .setScale(0.04)
                    .setDepth(DEPTH.clientBalloon - 1)
                this.gifts.push(gift)
                this.audio.pop()
                await FX.to(this, gift, { y: sub.y - 96, scale: HANDOVER.giftScale }, { duration: 340, ease: Ease.back(1.6) })
                await FX.arcTo(this, gift, hands, { height: 70, duration: 520 })
                this.audio.stamp()
                this.client.pose('happy')
                void FX.sparks(this, hands.x, hands.y, { color: C.glow, count: 14, spread: 90, size: 7 })
                void this.client.hop()
                const rest = { x: standX + HANDOVER.handX - i * HANDOVER.restGap, y: CLIENT.foot - HANDOVER.restY }
                await FX.to(this, gift, rest, { duration: 300, ease: Ease.smooth })
                void FX.float(this, gift, { amount: 6, duration: 1500, delay: i * 200 })
            }),
        )
        if (gen !== this.gen) return false
        this.audio.win()
        await this.client.say(SAY.thanks)
        await FX.wait(this, HANDOVER.holdMs)
        if (gen !== this.gen) return false
        this.client.hush()
        await moveCamera(this, { x: W / 2, y: H / 2, zoom: 1 }, HANDOVER.backMs)
        if (gen !== this.gen) return false
        await showUi()
        return gen === this.gen
    }

    private async wrong(gen: number, find: FindDef) {
        this.hold()
        this.audio.wrong()
        await this.card.close()
        if (gen !== this.gen) return
        this.client.pose('point')
        const left = this.remaining()
        const why = whyWrong(find, left.find(r => r.topic === find.topic) ?? left[0])
        void this.ask.set(why, 'oops')
        await banner(this, SAY.wrongTitle, why)
        await this.fail(gen)
    }

    private async airOut(gen: number) {
        this.hold()
        this.client.pose('point')
        await banner(this, SAY.airTitle, SAY.airLine)
        await this.fail(gen)
    }

    private async fail(gen: number) {
        await FX.wait(this, SHOW_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.controls.setEnabled(false)
        this.sonar.setEnabled('none')
        this.hud.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    private async say(gen: number, steps: Parameters<typeof teach>[2]) {
        this.hold()
        await teach(this, guideKey(this.level.level), steps)
        return gen === this.gen
    }

    private async teachFirst(gen: number) {
        this.guiding = true
        const { topic, kind } = this.phase.requests[0]
        const client: Rect = { x: CLIENT.x, y: CLIENT.foot - 70, w: 170, h: 170 }
        if (
            !(await this.say(gen, [
                { text: TEACH.ask, ...spot(union(grow(this.ask.rect(), 4), client)), balloonY: 330, buttonLabel: 'Próximo' },
                { text: TEACH.filter, ...spot(grow(this.sonar.rect(), 4)), balloonY: 330, buttonLabel: 'Ver' },
            ]))
        )
            return

        if (!(await this.demoPress(gen, topic))) return
        if (!(await this.demoPress(gen, kind))) return
        this.clearSearch()
        if (!(await this.say(gen, [{ text: TEACH.yourTurn, ...spot(grow(this.sonar.rect(), 4)), balloonY: 330, buttonLabel: 'Ok' }]))) return
        if (!(await this.guideTap(gen, topic))) return
        if (!(await this.guideTap(gen, kind))) return

        this.showAir(AIR.max, 15, 1500)
        const refill = this.time.delayedCall(1700, () => {
            this.audio.pop()
            this.showAir(15, AIR.max, 700)
        })
        const shown = await this.say(gen, [{ text: TEACH.air, ...spot(grow(this.airBar.rect(), 6)), balloonY: 300, buttonLabel: 'Ok' }])
        refill.remove(false)
        this.airDemo?.stop()
        this.airBar.set(this.air)
        if (!shown) return

        if (!(await this.say(gen, [{ text: TEACH.go, ...spot({ x: 640, y: 380, w: 1220, h: 300 }), balloonY: 330, buttonLabel: 'Vamos lá!' }]))) return
        this.warnPick = true
        this.play()
        this.controls.hint(true)
        const stop = beckon(this, this.controls.stickRect(), true)
        await this.waitFor('move')
        stop()
        this.controls.hint(false)
    }

    private clearSearch() {
        this.sonar.reset()
        this.world.light([], this.sub.at())
        this.arrows.clear()
    }

    private async demoPress(gen: number, word: string) {
        const r = this.sonar.chipRect(word)
        void pin(this, () => FX.ping(this, r.x, r.y, C.lemon, { radius: 86, duration: 520 }))
        this.sonar.press(word)
        this.search()
        await FX.wait(this, DEMO_LOOK_MS)
        return gen === this.gen
    }

    private async guideTap(gen: number, word: string) {
        tutorialDone(this)
        this.sonar.setEnabled([word])
        const stop = beckon(this, grow(this.sonar.chipRect(word), 6))
        await this.waitFor(`chip:${word}`)
        stop()
        this.sonar.setEnabled('none')
        if (gen !== this.gen) return false
        await FX.wait(this, DEMO_LOOK_MS)
        return gen === this.gen
    }

    private async teachIntro(gen: number) {
        const steps = this.level.single
            ? [
                  { text: TEACH.single, ...spot(grow(this.sonar.rect(), 4)), balloonY: 380, buttonLabel: 'Ok' },
                  { text: TEACH.deep, ...spot(this.minimap.rect()), balloonY: 380, buttonLabel: 'Vamos lá!' },
              ]
            : [
                  { text: TEACH.two, ...spot(grow(this.bag.rect(), 4)), balloonY: 330, buttonLabel: 'Ok' },
                  { text: TEACH.maze, ...spot(this.minimap.rect()), balloonY: 380, buttonLabel: 'Vamos lá!' },
              ]
        if (!(await this.say(gen, steps))) return
        this.teaching = false
        this.play()
    }

    private async explain() {
        if (this.mode !== 'play' || this.guiding) return
        const gen = this.gen
        this.hold()
        this.mode = 'panel'
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: TEACH.helpPilot, ...spot(union(this.controls.stickRect(), this.controls.boostRect())), balloonY: 330 },
            { text: this.level.single ? TEACH.helpSingle : TEACH.helpWords, ...spot(this.sonar.rect()), balloonY: 380 },
            { text: TEACH.helpMap, ...spot(this.minimap.rect()), balloonY: 380 },
            { text: TEACH.helpCarry, ...spot(grow(this.bag.rect(), 4)), balloonY: 330 },
            { text: TEACH.helpPick, ...spot(grow(this.ask.rect(), 4)), balloonY: 300, buttonLabel: 'Continuar' },
        ])
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.controls.setEnabled(false)
        this.sonar.setEnabled('none')
        this.hud.setHelpEnabled(false)
        this.cameras.main.stopFollow()
        this.cameras.main.setScroll(0, 0)
        this.client.hush()
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()
        await this.mural.show(this.delivered)
        if (gen !== this.gen) return
        void this.ask.set(SAY.summary)
        void FX.confetti(this, { colors: [C.pink, C.aqua, C.lemon, C.violet] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.pink,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.pink,
            messageColor: CSS.inkSoft,
            title: last ? 'Mergulhador!' : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.pink,
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
