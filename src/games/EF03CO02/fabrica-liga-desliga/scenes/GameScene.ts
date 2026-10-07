import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { IDLE_HINT_MS, LEVELS, POINTS, SPARK_MS, TRAY_CAP, WARN_MS, guideKey } from '../data/levels'
import { BALLOON, CHEF, DEPTH, SWITCH, W } from '../data/layout'
import { RULES, running } from '../data/rules'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { CHANGE, FINALE, HELP, LEVEL_INTRO, TEACH } from '../data/words'
import type { LevelDef, Mode, PhaseDef, Rule, StepDef, Track } from '../types'

import { createAudio, type Audio } from './audio'
import { createCard, type Card } from './card'
import { createChef, type Chef } from './chef'
import { createFactory, type Factory } from './factory'
import { createFinale, type Finale } from './finale'
import { spot, teach, union, type Rect } from './guide'
import { createHud, type Hud } from './hud'
import { createLine, type Line } from './line'
import { createOven, type Oven } from './oven'
import { createSwitch, type Switch } from './switch'
import { createTray, type Tray } from './tray'

const GAME_ID = 'fabrica-liga-desliga'
const SHOW_ERROR_MS = 800
const FINALE_MS = 2400
const DEMO_MS = 3300
const CHANGE_MS = 1300
const TOP_BALLOON = { balloonY: 150 }
const SWITCH_BALLOON = { balloonY: 300 }
const LOW_BALLOON = { balloonY: 568 }

type Segment = 'lead' | 'lit' | 'out'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private stepIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private demo = false

    private clock = 0
    private stepClock = 0
    private segment: Segment = 'lead'
    private segmentLeft = 0
    private sparked = false
    private lit = false
    private belt = false
    private whistled = false
    private warned = false
    private holds = false
    private wrongFor = 0
    private idleFor = 0
    private ranThisRun = false
    private beltOffset = 0
    private stepBaked = 0
    private totalBaked = 0
    private track: Track = { rule: [], belt: [], end: 0 }
    private tracks: Track[] = []

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private factory!: Factory
    private oven!: Oven
    private line!: Line
    private tray!: Tray
    private switcher!: Switch
    private card!: Card
    private chef!: Chef
    private hud!: Hud
    private finale!: Finale
    private balloon?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get step(): StepDef {
        return this.phase.steps[this.stepIndex]
    }

    private get rule(): Rule {
        return RULES[this.step.rule]
    }

    private get totalSteps() {
        return this.level.phases.reduce((sum, phase) => sum + phase.steps.length, 0)
    }

    private get conditionHolds() {
        return running(this.rule, {
            lit: this.lit,
            trayCount: this.tray.held,
            trayCap: TRAY_CAP,
            whistled: this.whistled,
        })
    }

    private get stepGoalMet() {
        return this.rule.watch !== 'oven' || this.stepBaked >= (this.step.quota ?? 0)
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
        this.stepIndex = 0
        this.mode = 'intro'
        this.guiding = false
        this.demo = false
        this.belt = false
        this.lit = false
        this.beltOffset = 0
        this.totalBaked = 0
        this.tracks = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.balloon = undefined
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.factory = createFactory(this)
        this.line = createLine(this, this.level.spacing, () => {
            this.factory.shakeFunnel()
            this.audio.plop()
        })
        this.oven = createOven(this)
        this.tray = createTray(this)
        this.switcher = createSwitch(this)
        this.card = createCard(this)
        this.chef = createChef(this)
        this.finale = createFinale(this)
        this.hud = createHud(this, {
            phases: this.level.phases.length,
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
        if (this.registry.get(key)) void this.startPhase(0, false)
        else {
            this.registry.set(key, true)
            if (this.level.level === 1) void this.runGuide()
            else void this.startPhase(0, true)
        }
    }

    update(_time: number, delta: number) {
        const dt = Math.min(delta, 50)
        if (this.demo) {
            this.moveBelt(dt)
            return
        }
        if (this.mode !== 'play') return
        this.clock += dt
        this.stepClock += dt
        if (this.rule.watch === 'oven') this.runSchedule(dt)
        if (this.rule.watch === 'whistle') this.runWhistle()
        if (this.belt) this.moveBelt(dt)

        const holds = this.conditionHolds
        if (holds !== this.holds) {
            this.holds = holds
            this.track.rule.push({ t: this.clock, on: holds })
        }
        if (this.belt && !holds) {
            this.wrongFor += dt
            if (this.wrongFor >= this.level.grace) {
                void this.jam()
                return
            }
        } else this.wrongFor = 0

        if (!this.belt && holds) this.idleFor += dt
        else this.idleFor = 0
        const hint = this.idleFor > IDLE_HINT_MS
        this.card.pulse(hint)
        this.switcher.hint(hint)

        if (!this.belt && !holds && this.stepGoalMet) void this.completeStep()
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.hud?.destroy()
        this.finale?.destroy()
        this.balloon?.destroy()
        this.chef?.destroy()
        this.card?.destroy()
        this.switcher?.destroy()
        this.tray?.destroy()
        this.line?.destroy()
        this.oven?.destroy()
        this.factory?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private bindInput() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            if (this.switcher.contains(pointer.x, pointer.y)) this.toggle()
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
            event.preventDefault()
            this.toggle()
        }
    }

    private startSegment(kind: Segment) {
        const step = this.step
        this.segment = kind
        this.segmentLeft = kind === 'lead' ? (step.lead ?? 0) : kind === 'lit' ? (step.lit ?? 0) : (step.out ?? 0)
        this.sparked = false
    }

    private runSchedule(dt: number) {
        this.segmentLeft -= dt
        if (!this.sparked && this.segmentLeft <= SPARK_MS) {
            this.sparked = true
            this.oven.spark()
            this.audio.spark()
        }
        if (this.segmentLeft > 0) return
        const next: Segment = this.segment === 'lit' ? 'out' : 'lit'
        this.setOven(next === 'lit')
        this.startSegment(next)
    }

    private runWhistle() {
        const at = this.step.whistleAt ?? 0
        if (!this.warned && this.stepClock >= at - WARN_MS) {
            this.warned = true
            void this.chef.arrive()
        }
        if (!this.whistled && this.stepClock >= at) {
            this.whistled = true
            this.chef.whistle()
            this.audio.whistle()
        }
    }

    private setOven(on: boolean) {
        this.lit = on
        this.oven.setLit(on)
        if (on) {
            this.audio.ignite()
            if (this.rule.watch === 'oven') this.ranThisRun = false
        } else this.audio.douse()
    }

    private setBelt(on: boolean) {
        this.belt = on
        this.switcher.setOn(on)
        this.switcher.press()
        this.audio.click(on)
        this.audio.hum(on)
        this.track.belt.push({ t: this.clock, on })
    }

    private updateCounter() {
        if (this.rule.watch === 'oven') this.tray.setCount(this.stepBaked, this.step.quota ?? 0)
        else if (this.rule.watch === 'tray') this.tray.setCount(this.tray.held, TRAY_CAP)
    }

    private moveBelt(dt: number) {
        const dx = (this.level.speed * dt) / 1000
        this.beltOffset += dx
        this.factory.setOffset(this.beltOffset)
        const step = this.line.advance(dx)
        if (step.baked) {
            this.stepBaked += step.baked
            this.totalBaked += step.baked
            this.audio.bake()
            this.emitCheckpoint()
        }
        step.delivered.forEach(g => void this.tray.receive(g))
        if (step.baked || step.delivered.length) this.updateCounter()
        if (this.mode === 'play' && this.conditionHolds) this.ranThisRun = true
    }

    private toggle() {
        if (this.mode !== 'play') return
        this.setBelt(!this.belt)
        if (this.belt || this.conditionHolds || !this.ranThisRun) return
        this.ranThisRun = false
        this.score += POINTS
        this.hits += 1
        this.switcher.ok()
        this.audio.stopOk()
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
    }

    private resetPlant() {
        this.belt = false
        this.lit = false
        this.switcher.setOn(false)
        this.switcher.hint(false)
        this.card.pulse(false)
        this.audio.hum(false)
        this.oven.setLit(false, false)
        this.line.clear()
        this.line.prefill()
        this.clock = 0
        this.track = { rule: [{ t: 0, on: false }], belt: [{ t: 0, on: false }], end: 0 }
        this.holds = false
    }

    private async startPhase(index: number, introduce: boolean) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.guiding = false
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.resetPlant()
        await this.tray.reset()
        if (gen !== this.gen) return
        await this.startStep(0, gen, introduce)
    }

    private async startStep(index: number, gen: number, introduce = false) {
        this.stepIndex = index
        this.mode = 'intro'
        this.hud.setHelpEnabled(false)
        this.stepClock = 0
        this.stepBaked = 0
        this.whistled = false
        this.warned = false
        this.wrongFor = 0
        this.idleFor = 0
        this.ranThisRun = false

        if (index > 0) {
            this.audio.swap()
            this.say(CHANGE)
            await this.card.wobble()
            if (gen !== this.gen) return
        }
        if (this.tray.held > 0) {
            await this.tray.slideOut()
            await this.tray.reset()
            if (gen !== this.gen) return
        }
        if (this.rule.watch !== 'whistle') void this.chef.leave()
        this.tray.showCounter(this.rule.watch !== 'whistle')
        this.updateCounter()

        if (this.rule.watch === 'oven') {
            if (this.lit) this.setOven(false)
            this.startSegment('lead')
        } else if (!this.lit) {
            this.oven.spark()
            this.audio.spark()
            this.setOven(true)
        }

        await this.card.show(this.step.rule)
        if (gen !== this.gen) return
        if (index > 0) await FX.wait(this, CHANGE_MS - 600)
        this.balloon?.destroy()
        this.balloon = undefined

        const intro = LEVEL_INTRO[this.level.level]
        if (introduce && intro) {
            this.mode = 'guide'
            this.guiding = true
            const target = this.rule.watch === 'tray' ? union(this.card.rect(), this.tray.rect()) : this.card.rect()
            await teach(this, guideKey(this.level.level), [{ text: intro, ...spot(target) }])
            this.guiding = false
            if (gen !== this.gen) return
        }

        this.holds = this.conditionHolds
        this.track.rule.push({ t: this.clock, on: this.holds })
        this.mode = 'play'
        this.hud.setHelpEnabled(true)
    }

    private async completeStep() {
        const gen = this.gen
        this.mode = 'shift'
        this.hud.setHelpEnabled(false)
        this.card.pulse(false)
        this.switcher.hint(false)
        if (this.stepIndex + 1 < this.phase.steps.length) {
            await this.startStep(this.stepIndex + 1, gen)
            return
        }
        await this.endPhase(gen)
    }

    private async jam() {
        const gen = ++this.gen
        this.mode = 'jam'
        this.card.pulse(false)
        this.switcher.hint(false)
        this.audio.jam()
        const scene =
            this.rule.watch === 'oven'
                ? this.line.rawOut()
                : this.rule.watch === 'tray'
                  ? this.line.dropToFloor()
                  : this.chef.shake()
        await Promise.all([this.factory.shake(), scene, this.card.flash()])
        if (gen !== this.gen) return
        this.say(this.rule.jam)
        this.audio.fail()
        await FX.wait(this, SHOW_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private say(text: string) {
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
        bg.fillTriangle(-12, -h / 2 + 2, 12, -h / 2 + 2, 0, -h / 2 - 18)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        const cx = Phaser.Math.Clamp(BALLOON.x, w / 2 + 12, W - w / 2 - 12)
        this.balloon = this.add.container(cx, BALLOON.y, [bg, label]).setDepth(DEPTH.balloon).setScale(0.8).setAlpha(0)
        void FX.to(this, this.balloon, { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.audio.hum(false)
        this.audio.lose()

        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    private async endPhase(gen: number) {
        this.track.end = this.clock
        this.tracks.push(this.track)

        if (this.rule.watch !== 'tray') for (const g of this.line.takeBaked()) await this.tray.receive(g)
        if (gen !== this.gen) return
        void this.hud.celebrate(this.phaseIndex)
        void this.chef.leave()
        await FX.wait(this, 400)
        await this.tray.slideOut()
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 < this.level.phases.length) {
            void this.startPhase(this.phaseIndex + 1, false)
            return
        }
        void this.endLevel()
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.phaseIndex = 0
        this.stepIndex = 0
        this.resetPlant()
        await this.tray.reset()
        this.updateCounter()
        await this.card.show(this.step.rule)
        if (gen !== this.gen) return
        const key = guideKey(this.level.level)
        const sw = this.switcher.rect()
        const tap = { fromX: SWITCH.x, fromY: SWITCH.y, toX: SWITCH.x, toY: SWITCH.y, tap: true }

        await teach(this, key, [{ text: TEACH.rule, ...spot(this.card.rect()), buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return

        this.oven.spark()
        this.audio.spark()
        await FX.wait(this, 900)
        this.setOven(true)
        await FX.wait(this, 400)
        if (gen !== this.gen) return

        await teach(this, key, [
            { text: TEACH.on, ...spot(union(this.oven.rect(), sw)), ...TOP_BALLOON, pointer: tap, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return
        this.setBelt(true)
        this.demo = true
        await FX.wait(this, DEMO_MS)
        this.demo = false
        if (gen !== this.gen) return

        this.oven.spark()
        this.audio.spark()
        await teach(this, key, [{ text: TEACH.spark, ...spot(this.oven.rect()), ...LOW_BALLOON, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        this.setOven(false)
        await FX.wait(this, 300)

        await teach(this, key, [{ text: TEACH.off, ...spot(sw), ...SWITCH_BALLOON, pointer: tap, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        this.setBelt(false)
        this.switcher.ok()
        this.audio.stopOk()
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        await teach(this, key, [{ text: TEACH.raw, ...spot(this.oven.rect()), ...LOW_BALLOON }])
        if (gen !== this.gen) return
        this.totalBaked = 0
        void this.startPhase(0, false)
    }

    private ruleSentence() {
        if (this.rule.id === 'ovenLit') return TEACH.rule
        return `A regra: ${this.rule.text[0]} ${this.rule.text[1]}.`
    }

    private helpTarget(): Rect {
        if (this.rule.watch === 'tray') return union(this.tray.rect(), this.switcher.rect())
        if (this.rule.watch === 'whistle') return { x: CHEF.x, y: CHEF.y, w: CHEF.size + 40, h: CHEF.size + 40 }
        return union(this.oven.rect(), this.switcher.rect())
    }

    private async explain() {
        if (this.mode !== 'play' || this.guiding) return
        const gen = this.gen
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.audio.hum(false)

        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: this.ruleSentence(), ...spot(this.card.rect()) },
            {
                text: HELP[this.rule.watch],
                ...spot(this.helpTarget()),
                ...(this.rule.watch === 'oven' ? TOP_BALLOON : {}),
                buttonLabel: 'Continuar',
            },
        ])
        this.guiding = false
        if (gen !== this.gen) return
        this.wrongFor = 0
        this.idleFor = 0
        this.audio.hum(this.belt)
        this.mode = 'play'
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.hud.setHelpEnabled(false)
        this.audio.hum(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        const onlyOven = this.level.phases.every(phase => phase.steps.every(step => step.rule === 'ovenLit'))
        await this.finale.show(this.tracks, this.totalBaked, onlyOven ? FINALE.oven : FINALE.rule, i => this.audio.pop(i))
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.cookie, C.coral, C.mint, C.yellow, C.lilac] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        this.mode = 'done'
        showLevelComplete(this, {
            accent: C.coral,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: this.level.level < LEVELS.length ? `Nível ${this.level.level} completo!` : 'Fornada pronta!',
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
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
                              color: C.coral,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private emitCheckpoint() {
        const done = this.level.phases.slice(0, this.phaseIndex).reduce((sum, phase) => sum + phase.steps.length, 0) + this.stepIndex
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.min(100, Math.round((done / this.totalSteps) * 100)),
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
