import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, POINTS, TRAINING, check, guideKey, order, sameRule } from '../data/levels'
import { BUILD_MISS, MISS, TEACH, ruleWord } from '../data/words'
import { C, CSS, HUE } from '../data/theme'
import type { LevelDef, Mode, PhaseDef, Toy } from '../types'

import { createAudio, type Audio } from './audio'
import { createBelt, type Belt } from './belt'
import { createBox, type Box } from './box'
import { createBuilder, type Builder } from './builder'
import { createFactory } from './factory'
import { createFinale, type Finale } from './finale'
import { tutorialDone } from '../../../../shared/tutorial/createTutorial'
import { spot, tapAt, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createStamp, type Stamp } from './stamp'
import type { ToyView } from './toy'

const GAME_ID = 'fabrica-de-carimbos'
const PASS_PAUSE = 900
const ZONE_BALLOON_Y = 190
const FINALE_MS = 1600

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false

    private score = 0
    private hits = 0
    private errors = 0
    private approved = 0
    private approvedToys: Toy[] = []
    private done: { phase: PhaseDef; toys: Toy[] }[] = []

    private audio!: Audio
    private factory!: { destroy(): void }
    private belt!: Belt
    private stamp!: Stamp
    private box!: Box
    private builder!: Builder
    private hud!: Hud
    private finale!: Finale

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get total() {
        return this.level.target * this.level.phases.length
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
        this.mode = 'intro'
        this.guiding = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.approved = 0
        this.approvedToys = []
        this.done = []
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.factory = createFactory(this)
        this.belt = createBelt(this, this.level)
        this.box = createBox(this, this.level.target)
        this.stamp = createStamp(this)
        this.builder = createBuilder(this)
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

        this.bindInput()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(1)
        if (this.level.build || this.registry.get(key)) void this.startPhase(0)
        else {
            this.registry.set(key, true)
            void this.runGuide()
        }
    }

    update(_time: number, delta: number) {
        this.belt.update(delta)
        this.stamp.update()
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.hud?.destroy()
        this.finale?.destroy()
        this.builder?.destroy()
        this.stamp?.destroy()
        this.box?.destroy()
        this.belt?.destroy()
        this.factory?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private bindInput() {
        const zone = this.belt.zoneRect
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            const inside = Math.abs(pointer.x - zone.x) <= zone.w / 2 && Math.abs(pointer.y - zone.y) <= zone.h / 2
            if (inside) this.tap()
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') this.tap()
    }

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.approvedToys = []
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.box.reset()

        const phase = this.phase
        if (this.level.build) {
            if (!(await this.buildStamp(gen))) return
            this.belt.set(order(phase))
            await this.belt.appear()
        } else {
            this.belt.set(order(phase))
            await Promise.all([this.stamp.show(phase.stamp, phase.collection), this.belt.appear()])
        }
        if (gen !== this.gen) return
        this.run()
    }

    private async buildStamp(gen: number): Promise<boolean> {
        const phase = this.phase
        const note = phase.note
        const options = phase.options
        if (!note || !options) return false

        this.mode = 'build'
        await Promise.all([this.builder.showNote(note), this.stamp.showEmpty(phase.stamp.length, phase.collection)])
        if (gen !== this.gen) return false

        for (let k = 0; k < phase.stamp.length; k++) {
            this.stamp.focus(k)
            const list = Phaser.Utils.Array.Shuffle([...options[k]])
            const pick = this.builder.ask(list, phase.collection)
            const key = guideKey(this.level.level)
            if (k === 0 && !this.registry.get(key)) {
                this.registry.set(key, true)
                this.guiding = true
                await teach(this, key, this.buildSteps())
                this.guiding = false
                if (gen !== this.gen) return false
            }
            this.hud.setHelpEnabled(true)
            const index = await pick
            if (gen !== this.gen) return false
            this.hud.setHelpEnabled(false)

            const rule = list[index]
            this.audio.press()
            await this.builder.send(index, this.stamp.windowPoint(k))
            if (gen !== this.gen) return false

            const right = sameRule(rule, phase.stamp[k])
            this.stamp.fill(k, rule, right)
            if (!right) {
                const extra = !phase.stamp.some(r => r.attribute === rule.attribute)
                this.stamp.say(extra ? BUILD_MISS.extra : BUILD_MISS.wrong)
                this.audio.fail()
                void this.builder.pulseNote()
                await this.stamp.blink(k)
                if (gen !== this.gen) return false
                this.lose()
                return false
            }
            this.audio.yes()
            this.score += POINTS
            this.hits += 1
            runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
            await FX.wait(this, 260)
            if (gen !== this.gen) return false
        }

        this.audio.toBox()
        await FX.wait(this, 450)
        if (gen !== this.gen) return false
        this.stamp.clearMarks()
        return true
    }

    private run() {
        tutorialDone(this)
        this.mode = 'run'
        this.belt.setMoving(true)
        this.hud.setHelpEnabled(!this.guiding)
    }

    private tap() {
        if (this.mode !== 'run') return
        const index = this.belt.lit()
        if (index === null) {
            this.audio.tap()
            return
        }
        void this.judge(index)
    }

    private async inspect(gen: number, toy: ToyView) {
        const results = check(this.phase.stamp, toy.toy)
        this.audio.press()
        await this.stamp.press(toy, results, ok => (ok ? this.audio.yes() : this.audio.no()))
        return gen === this.gen ? results : undefined
    }

    private async judge(index: number) {
        const gen = this.gen
        this.mode = 'check'
        this.belt.setMoving(false)
        this.hud.setHelpEnabled(false)

        const toy = this.belt.toy(index)
        if (!toy) {
            this.run()
            return
        }
        const results = await this.inspect(gen, toy)
        if (!results) return

        if (results.every(Boolean)) await this.approve(gen, index, toy)
        else await this.reject(gen, results)
    }

    private async stampAndBox(gen: number, index: number, toy: ToyView) {
        this.audio.thump()
        await this.stamp.approve(toy)
        if (gen !== this.gen) return false
        this.belt.take(index)
        this.audio.toBox()
        await Promise.all([this.box.add(toy), this.stamp.lift()])
        return gen === this.gen
    }

    private async approve(gen: number, index: number, toy: ToyView) {
        this.score += POINTS
        this.hits += 1
        this.approved += 1
        this.approvedToys.push(toy.toy)
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: POINTS,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        if (!(await this.stampAndBox(gen, index, toy))) return
        if (this.box.count >= this.level.target) {
            await this.finishPhase(gen)
            return
        }
        this.run()
    }

    private async reject(gen: number, results: boolean[]) {
        const miss = results.indexOf(false)
        this.stamp.say(MISS[this.phase.stamp[miss].attribute])
        this.audio.fail()
        await this.stamp.blink(miss)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.belt.setMoving(false)
        this.builder.cancel()
        this.hud.setHelpEnabled(false)
        this.audio.lose()

        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: -5,
            stage: this.level.level,
        })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    private async finishPhase(gen: number) {
        this.mode = 'swap'
        this.audio.ribbon()
        this.done.push({ phase: this.phase, toys: [...this.approvedToys] })
        void this.hud.celebrate(this.phaseIndex)
        await Promise.all([this.box.close(), this.belt.vanish(), this.stamp.hide(), this.builder.hideNote()])
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) {
            void this.startPhase(next)
            return
        }
        void this.endLevel()
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)

        const first = this.level.phases[0]
        this.belt.set(TRAINING)
        await Promise.all([this.stamp.show(first.stamp, first.collection), this.belt.appear()])
        if (gen !== this.gen) return

        const key = guideKey(1)
        const zone = this.belt.zoneRect
        await teach(this, key, [{ ...this.modelStep(), buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return

        const centered = this.belt.waitCentered(0)
        this.belt.setMoving(true)
        await centered
        if (gen !== this.gen) return
        await teach(this, key, [{ text: TEACH.pass, ...spot(zone), balloonY: ZONE_BALLOON_Y, buttonLabel: 'Ok' }])
        if (gen !== this.gen) return

        const match = this.belt.waitCentered(1)
        this.belt.setMoving(true)
        await match
        if (gen !== this.gen) return
        await teach(this, key, [{ text: TEACH.tap, ...spot(zone), balloonY: ZONE_BALLOON_Y, pointer: tapAt(zone), buttonLabel: 'Ver' }])
        if (gen !== this.gen) return

        const toy = this.belt.toy(1)
        if (toy) {
            const results = await this.inspect(gen, toy)
            if (!results) return
            await this.stampAndBox(gen, 1, toy)
            if (gen !== this.gen) return
        }
        await FX.wait(this, PASS_PAUSE)
        if (gen !== this.gen) return

        await Promise.all([this.belt.vanish(), this.stamp.hide()])
        if (gen !== this.gen) return
        this.guiding = false
        void this.startPhase(0)
    }

    private async explain() {
        if ((this.mode !== 'run' && this.mode !== 'build') || this.guiding) return
        const gen = this.gen
        const back = this.mode
        this.mode = 'panel'
        this.guiding = true
        this.belt.setMoving(false)
        this.hud.setHelpEnabled(false)

        const key = `${guideKey(this.level.level)}-help`
        if (back === 'build') await teach(this, key, this.buildSteps())
        else {
            const help = { text: TEACH.help, ...spot(this.belt.zoneRect), balloonY: ZONE_BALLOON_Y, buttonLabel: 'Continuar' }
            await teach(this, key, this.level.build ? [help] : [this.modelStep(), help])
        }
        this.guiding = false
        if (gen !== this.gen) return
        if (back === 'run') {
            this.run()
            return
        }
        this.mode = 'build'
        this.hud.setHelpEnabled(true)
    }

    private modelStep() {
        return { text: TEACH.model(this.phase.stamp.map(ruleWord)), ...spot(this.stamp.rect) }
    }

    private buildSteps() {
        return [
            { text: TEACH.note, ...spot(this.builder.noteRect) },
            { text: TEACH.build, ...spot(union(this.stamp.rect, this.builder.chipsRect)), buttonLabel: 'Entendi' },
        ]
    }

    private onShowTutorial() {
        void this.explain()
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
        await this.finale.play(this.done)
        if (gen !== this.gen) return
        void FX.confetti(this, { colors: [HUE.blue, HUE.red, HUE.yellow, C.mint, C.lilac] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.mint,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: this.level.level < LEVELS.length ? `Nível ${this.level.level} completo!` : 'Fábrica completa!',
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
                              color: C.mint,
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
            progress: Math.round((this.approved / this.total) * 100),
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
