import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CREW_CELL, KART_CELL } from '../data/files'
import { CREW, DEPTH, GROUND, H, KART, LAP, RIVAL, W } from '../data/layout'
import { LEVELS, POINTS, guideKey, stopsOf } from '../data/levels'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { WEATHERS, branchFor, branchOfTire, tireFor } from '../data/weather'
import { HELP, LABEL, SAY, TEACH } from '../data/words'
import type { LevelDef, State, TireId, Vec, Weather } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBubble, type Bubble } from './bubble'
import { createCarts, type Carts } from './carts'
import { createCrew, type Crew } from './crew'
import { createEffects, type Effects } from './effects'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createKart, type Kart } from './kart'
import { createRule, type RuleBoard } from './rule'
import { createSky, type Sky } from './sky'
import { createTrack, type Track } from './track'
import { createView, type View } from './view'

const GAME_ID = 'pit-stop-da-chuva'

const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2
const easeIn = (t: number) => t * t
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)

type RivalMode = 'off' | 'lap' | 'pass'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private choose: ((tire: TireId | null) => void) | null = null
    private rivalMode: RivalMode = 'off'
    private overtook = false
    private wet = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private sky!: Sky
    private track!: Track
    private crew!: Crew
    private rival!: Kart
    private kart!: Kart
    private effects!: Effects
    private header!: Header
    private rule!: RuleBoard
    private carts!: Carts
    private bubble!: Bubble
    private banner!: Banner

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
        this.choose = null
        this.rivalMode = 'off'
        this.overtook = false
        this.wet = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.view = createView(this, W, 1, H / 2)
        this.audio = createAudio()
        this.sky = createSky(this, this.view)
        this.track = createTrack(this, this.view)
        this.crew = createCrew(this, this.view, this.audio)
        this.track.attach(this.crew)
        this.rival = createKart(this, this.view, -2000, RIVAL.ground, { rival: true, scale: RIVAL.scale, depth: DEPTH.rival })
        this.kart = createKart(this, this.view, KART.x, GROUND)
        this.effects = createEffects(this, this.view)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.races.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.rule = createRule(this, this.level.rule)
        this.carts = createCarts(this, this.level.carts, tire => this.onPick(tire))
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.controlsOff()

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
        const choose = this.choose
        this.choose = null
        choose?.(null)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.banner?.destroy()
        this.bubble?.destroy()
        this.carts?.destroy()
        this.rule?.destroy()
        this.header?.destroy()
        this.effects?.destroy()
        this.kart?.destroy()
        this.rival?.destroy()
        this.crew?.destroy()
        this.track?.destroy()
        this.sky?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(time: number, deltaMs: number) {
        if (!this.track) return
        const delta = Math.min(deltaMs, 50)
        const step = this.track.update(delta)
        this.kart.roll(step.dd)
        if (this.state !== 'error') this.kart.jiggle(time, this.state === 'lap' && this.track.moving ? 1.8 : 0)
        this.sky.update(delta, step.dd)
        this.moveRival(delta, step.dd)
        this.effects.update(delta, this.kart, step.speed, this.wet)
        step.crossed.forEach(() => this.onPuddle())
        this.view.update(delta, W / 2)
    }

    private moveRival(delta: number, dd: number) {
        if (this.rivalMode === 'lap') {
            const k = (this.track.d - RIVAL.startD) / (RIVAL.endD - RIVAL.startD)
            if (k < 0 || k > 1) this.rival.place(-2000)
            else this.rival.place(Phaser.Math.Linear(RIVAL.fromX, RIVAL.toX, k))
            this.rival.roll(dd * 0.75)
            if (!this.overtook && k > 0 && this.rival.x < KART.x) {
                this.overtook = true
                this.audio.cheer()
            }
        } else if (this.rivalMode === 'pass') this.rival.roll(delta * 1.1)
    }

    private onPuddle() {
        if (!this.wet) return
        this.audio.splash()
        this.effects.splash({ x: KART.x + 60, y: LAP.puddleY })
    }

    // ───────────────────────────────────────────── estados

    private controlsOff() {
        this.carts.setEnabled(false)
        this.header.setHelpEnabled(false)
    }

    private ui(on: boolean) {
        this.header.visible(on)
        this.rule.visible(on)
        this.carts.visible(on)
    }

    private screenOf(at: Vec): Vec {
        return this.view.toScreen(at.x, at.y)
    }

    private betoSays(text: string, button?: string) {
        const head = this.crew.betoHead()
        return this.bubble.say(text, this.screenOf({ x: head.x + 70, y: head.y - 30 }), button)
    }

    private async weather(gen: number, w: Weather) {
        if (w === this.sky.weather) return
        const raining = WEATHERS[w].raining
        if (raining !== this.wet) this.audio.rain(raining)
        if (!raining) this.wet = false
        await FX.all(this.sky.change(w), this.track.setWet(raining, TIMING.weather))
        if (gen !== this.gen) return
        this.wet = raining
    }

    private setWeather(w: Weather) {
        this.sky.set(w)
        this.wet = WEATHERS[w].raining
        void this.track.setWet(this.wet, 0)
        this.audio.rain(this.wet)
    }

    // ───────────────────────────────────────────── nível

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.controlsOff()
        this.header.setPhase(0)
        this.track.home()
        this.kart.place(KART.x, GROUND)
        this.kart.setTire('liso')
        this.kart.reset()
        this.crew.beto(CREW_CELL.beto)
        this.setWeather(this.introduce ? this.level.demo[0] : this.level.races[0].stops[0])
        if (this.introduce) {
            await this.intro(gen)
            if (gen !== this.gen) return
        } else this.ui(true)
        await this.runRaces(gen)
    }

    private async intro(gen: number) {
        this.ui(false)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.view.lean(true, { x: (CREW.betoX + KART.x) / 2, y: 470 })
        if (gen !== this.gen) return
        this.crew.beto(CREW_CELL.betoTalk)
        await this.betoSays(SAY.hello, 'Próximo')
        if (gen !== this.gen) return
        this.crew.beto(CREW_CELL.beto)
        await this.view.lean(false, { x: W / 2, y: 0 })
        if (gen !== this.gen) return
        this.header.visible(true)
        this.audio.pop()
        await this.rule.big()
        if (gen !== this.gen) return
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.rule, ...spot(this.rule.rect()), balloonY: 440, buttonLabel: 'Próximo' },
            { text: TEACH.ifRain, ...spot(this.rule.blockRect('then')), balloonY: 440, buttonLabel: 'Próximo' },
            { text: TEACH.otherwise, ...spot(this.rule.blockRect('else')), balloonY: 440, buttonLabel: 'Próximo' },
        ])
        if (gen !== this.gen) return
        await this.rule.dock()
        if (gen !== this.gen) return
        this.carts.visible(true)
        await this.demo(gen)
    }

    private async demo(gen: number) {
        this.state = 'demo'
        const [first, second] = this.level.demo
        for (const w of [first, second]) {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            const fresh = w !== this.sky.weather
            await this.weather(gen, w)
            if (gen !== this.gen) return
            await teach(this, guideKey(this.level.level), [
                { text: fresh ? TEACH.started : TEACH.look, ...spot(this.sky.rect()), balloonY: 420, buttonLabel: 'Ver' },
            ])
            if (gen !== this.gen) return
            const tire = tireFor(this.level.rule, w)
            const branch = branchFor(this.level.rule, w)
            await this.carts.press(tire)
            this.rule.light(branch)
            this.audio.branch(branch)
            await this.crew.swap(this.kart, tire)
            if (gen !== this.gen) return
            await teach(this, guideKey(this.level.level), [
                { text: branch === 'then' ? TEACH.rain : TEACH.noRain, ...spot(this.rule.blockRect(branch)), balloonY: 170, buttonLabel: 'Próximo' },
            ])
            if (gen !== this.gen) return
            await this.lap(gen, false)
            if (gen !== this.gen) return
            this.rule.light(null)
        }
    }

    private async runRaces(gen: number) {
        const races = this.level.races
        for (let r = 0; r < races.length; r++) {
            this.header.setPhase(r)
            const race = races[r]
            for (let s = 0; s < race.stops.length; s++) {
                const w = race.stops[s]
                await FX.wait(this, TIMING.beat)
                if (gen !== this.gen) return
                await this.weather(gen, w)
                if (gen !== this.gen) return
                if (this.introduce && r === 0 && s === 0) {
                    await teach(this, guideKey(this.level.level), [{ text: TEACH.go, ...spot(this.carts.both()), balloonY: 300, buttonLabel: 'Vamos!' }])
                    if (gen !== this.gen) return
                }
                const tire = await this.pick()
                if (tire === null || gen !== this.gen) return
                const ok = await this.stop(gen, w, tire, s === race.stops.length - 1)
                if (!ok || gen !== this.gen) return
            }
            await this.finishRace(gen, r)
            if (gen !== this.gen) return
        }
        void this.endLevel()
    }

    // ───────────────────────────────────────────── a parada

    private pick(): Promise<TireId | null> {
        this.state = 'pick'
        this.carts.setEnabled(true)
        this.header.setHelpEnabled(true)
        return new Promise(resolve => {
            this.choose = resolve
        })
    }

    private onPick(tire: TireId) {
        if (this.state !== 'pick') return
        const choose = this.choose
        this.choose = null
        this.header.setHelpEnabled(false)
        this.audio.press()
        choose?.(tire)
    }

    private async stop(gen: number, w: Weather, tire: TireId, last: boolean) {
        this.state = 'swap'
        this.controlsOff()
        const rule = this.level.rule
        const branch = branchOfTire(rule, tire)
        this.rule.light(branch)
        this.audio.branch(branch)
        await this.crew.swap(this.kart, tire)
        if (gen !== this.gen) return false
        if (tire !== tireFor(rule, w)) {
            await this.crash(gen, w)
            return false
        }
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await this.lap(gen, last)
        if (gen !== this.gen) return false
        this.rule.light(null)
        return true
    }

    private async lap(gen: number, last: boolean) {
        this.state = 'lap'
        this.kart.pose(KART_CELL.race)
        this.audio.vroom()
        this.overtook = false
        this.rivalMode = 'lap'
        if (last)
            void FX.wait(this, TIMING.lap * 0.7).then(() => {
                if (gen === this.gen) this.crew.beto(CREW_CELL.betoFlag)
            })
        void FX.wait(this, TIMING.lap * 0.82).then(() => {
            if (gen === this.gen) this.audio.brake()
        })
        const ok = await this.track.drive(LAP.length, TIMING.lap, easeInOut)
        this.rivalMode = 'off'
        this.rival.place(-2000)
        if (!ok || gen !== this.gen) return
        this.kart.pose(last ? KART_CELL.cheer : KART_CELL.idle)
    }

    private async finishRace(gen: number, r: number) {
        this.audio.cheer()
        this.audio.good()
        const head = this.screenOf(this.kart.head())
        void FX.sparks(this, head.x, head.y - 40, { color: C.yellow, count: 18, spread: 140, depth: DEPTH.fx })
        await this.header.celebrate(r)
        if (gen !== this.gen) return
        await this.betoSays(this.level.races[r].cheer, 'Próximo')
        if (gen !== this.gen) return
        this.crew.beto(CREW_CELL.beto)
        this.kart.pose(KART_CELL.idle)
    }

    // ───────────────────────────────────────────── erro

    private async crash(gen: number, w: Weather) {
        this.state = 'error'
        this.controlsOff()
        this.kart.pose(KART_CELL.race)
        this.audio.vroom()
        const raining = WEATHERS[w].raining
        if (raining) {
            await this.track.drive(LAP.crash, TIMING.crashDrive, easeIn)
            if (gen !== this.gen) return
            this.audio.skid()
            this.kart.pose(KART_CELL.worried)
            void this.track.drive(LAP.crash + LAP.slide, TIMING.spin, easeOut)
            await this.kart.spin(36, LAP.hayY - 8 - GROUND, TIMING.spin)
            if (gen !== this.gen) return
            this.audio.thump()
            FX.shakeCam(this, 'leve')
            this.kart.pose(KART_CELL.dizzy)
            this.effects.dizzy(true)
        } else {
            const at = LAP.crash - 260
            await this.track.drive(at, TIMING.crashDrive, easeIn)
            if (gen !== this.gen) return
            this.audio.sizzle()
            this.kart.pose(KART_CELL.worried)
            void this.track.drive(at + 240, TIMING.melt, easeOut)
            for (let i = 0; i < 6; i++) {
                ;[0, 1].forEach(k => this.effects.smoke(this.kart.wheel(k as 0 | 1), true))
                await FX.wait(this, TIMING.melt / 8)
                if (gen !== this.gen) return
            }
            await this.kart.melt()
            if (gen !== this.gen) return
        }
        this.rivalPass()
        void this.rule.shake(branchFor(this.level.rule, w))
        this.banner.say(raining ? LABEL.whyRain : LABEL.whyDry)
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private rivalPass() {
        this.rivalMode = 'pass'
        this.rival.place(RIVAL.toX)
        this.audio.whoosh()
        const k = { x: RIVAL.toX }
        this.tweens.add({
            targets: k,
            x: RIVAL.fromX,
            duration: FX.ms(this, TIMING.rivalPass),
            onUpdate: () => this.rival.place(k.x),
        })
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.controlsOff()
        this.audio.rain(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'pick') return
        const gen = this.gen
        this.state = 'help'
        this.carts.setEnabled(false)
        this.header.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP.rule, ...spot(this.rule.rect()), balloonY: 200, buttonLabel: 'Continuar' },
        ])
        if (gen !== this.gen) return
        this.state = 'pick'
        this.carts.setEnabled(true)
        this.header.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.controlsOff()
        this.audio.rain(false)
        this.audio.win()
        this.kart.pose(KART_CELL.cheer)
        this.crew.beto(CREW_CELL.betoFlag)
        void FX.confetti(this, { colors: [C.yellow, C.team, C.lilac, C.coral, C.pink] })
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
            progress: { total: this.level.races.length, current: this.level.races.length },
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
            progress: Math.min(100, Math.round((this.done / stopsOf(this.level)) * 100)),
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
        if (!muted) this.audio.rain(this.wet)
    }
}
