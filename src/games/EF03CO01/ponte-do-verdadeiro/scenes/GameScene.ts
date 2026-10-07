import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CRITTERS, LEVELS, POINTS, guideKey, isTrue, wrongOnes } from '../data/levels'
import { BALLOON, CROSS } from '../data/layout'
import { C, CSS } from '../data/theme'
import { TEACH, WORD_INTRO, fixLine, hotWord, wrongLine } from '../data/words'
import type { HotWord, LevelDef, Mode, PhaseDef, Rect } from '../types'

import { createAudio, type Audio } from './audio'
import { createBridge, type Bridge } from './bridge'
import { createCritters, type Critters } from './critters'
import { spot, teach } from './guide'
import { createHud, type Hud } from './hud'
import { createCastor, createLever, type Castor, type Lever } from './keeper'
import { createSign, type Sign } from './sign'
import { createBalloon, createBoard, createCoach, type Balloon, type Board, type Coach } from './ui'

const GAME_ID = 'ponte-do-verdadeiro'
const ARM_MS = 600
const ERROR_HOLD_MS = 450
const DEMO_HOLD_MS = 1500
const FLIP_PAUSE_MS = 380
const FINALE_MS = 2000
const STAGE: Rect = { x: 640, y: 400, w: 1240, h: 560 }
const TIP_SPOT = { balloonX: 760, balloonY: 400 }

const grow = (r: Rect, by: number): Rect => ({ x: r.x, y: r.y, w: r.w + by * 2, h: r.h + by * 2 })

type Target = number | 'lever'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private teaching = false
    private introduced = new Set<HotWord>()
    private tip?: string
    private waitFor?: { id: Target; resolve: () => void }

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0

    private audio!: Audio
    private bridge!: Bridge
    private critters!: Critters
    private castor!: Castor
    private lever!: Lever
    private sign!: Sign
    private balloon!: Balloon
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
        this.teaching = false
        this.introduced = new Set()
        this.tip = undefined
        this.waitFor = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cleared = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.bridge = createBridge(
            this,
            ms => this.audio.creak(ms),
            () => this.audio.thump(),
            () => this.audio.clank(),
        )
        this.castor = createCastor(this)
        this.lever = createLever(this, () => this.pullLever())
        this.critters = createCritters(this, i => this.tapCritter(i))
        this.sign = createSign(this)
        this.balloon = createBalloon(this)
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
        if (this.registry.get(key)) void this.begin()
        else {
            this.registry.set(key, true)
            this.teaching = true
            void this.runGuide()
        }
    }

    update() {
        this.bridge.update()
        this.critters.update()
    }

    private shutdownScene() {
        this.gen++
        this.waitFor = undefined
        this.hud?.destroy()
        this.board?.destroy()
        this.coach?.destroy()
        this.balloon?.destroy()
        this.sign?.destroy()
        this.critters?.destroy()
        this.lever?.destroy()
        this.castor?.destroy()
        this.bridge?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private arrange(index: number) {
        this.phaseIndex = index
        this.hud.setPhase(index)
        const { sentence, start } = this.phase
        this.critters.reset()
        this.critters.setAll(start, sentence.item)
        this.sign.set(sentence)
        this.bridge.setRaised()
        void this.bridge.showLock(false)
        this.lever.reset()
        this.castor.pose('talk')
        this.balloon.hide()
    }

    private async begin() {
        const gen = ++this.gen
        await this.sign.reveal()
        if (gen !== this.gen) return
        await this.openPhase(gen)
    }

    private async openPhase(gen: number) {
        const s = this.phase.sentence
        const word = hotWord(s)
        const key = guideKey(this.level.level)
        if (this.teaching && word && this.level.fresh.includes(word) && !this.introduced.has(word)) {
            this.introduced.add(word)
            this.mode = 'guide'
            this.closeSetup()
            const hot = this.sign.hotRect()
            await teach(this, key, [{ text: WORD_INTRO[word](s), ...(hot ? spot(grow(hot, 6)) : {}), buttonLabel: 'Ok' }])
            if (gen !== this.gen) return
        }
        if (this.tip) {
            const text = this.tip
            this.tip = undefined
            this.mode = 'guide'
            this.closeSetup()
            await teach(this, key, [{ text, ...spot(grow(this.sign.faceRect(), 8)) }])
            if (gen !== this.gen) return
        }
        this.openSetup(gen)
    }

    private openSetup(gen: number) {
        this.mode = 'setup'
        this.critters.enable([0, 1, 2])
        this.hud.setHelpEnabled(true)
        this.lever.setEnabled(false)
        this.time.delayedCall(ARM_MS, () => {
            if (gen === this.gen && this.mode === 'setup') this.lever.setEnabled(true)
        })
    }

    private closeSetup() {
        this.critters.enable([])
        this.lever.setEnabled(false)
        this.hud.setHelpEnabled(false)
    }

    private flip(i: number) {
        const has = !this.critters.states()[i]
        this.audio.tap()
        if (has) this.audio.put()
        else this.audio.take()
        this.critters.set(i, has, true)
    }

    private release(id: Target): boolean {
        if (!this.waitFor) return false
        if (this.waitFor.id === id) {
            const done = this.waitFor.resolve
            this.waitFor = undefined
            done()
        }
        return true
    }

    private tapCritter(i: number) {
        if (this.release(i)) return
        if (this.mode !== 'setup') return
        this.flip(i)
    }

    private pullLever() {
        if (this.release('lever')) return
        if (this.mode !== 'setup') return
        void this.judge()
    }

    private waitTap(id: Target): Promise<void> {
        return new Promise(resolve => {
            this.waitFor = { id, resolve }
        })
    }

    private async judge() {
        const gen = ++this.gen
        this.mode = 'open'
        this.closeSetup()
        this.lever.pull()
        this.audio.lever()
        const state = this.critters.states()
        if (isTrue(this.phase.sentence, state)) await this.pass(gen)
        else await this.fail(gen, state)
    }

    private async pass(gen: number) {
        await this.bridge.lower()
        if (gen !== this.gen) return
        this.audio.verdict(true)
        this.castor.pose('yay')

        this.score += POINTS
        this.hits += 1
        this.cleared += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        void this.hud.celebrate(this.phaseIndex)

        this.critters.cross(() => this.audio.hop())
        await FX.wait(this, CROSS.hold)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        this.audio.whoosh()
        await FX.curtain(this, () => this.arrange(next), C.night)
        if (gen !== this.gen) return
        await this.sign.reveal()
        if (gen !== this.gen) return
        await this.openPhase(gen)
    }

    private async showWrong(gen: number, state: boolean[]): Promise<boolean> {
        const s = this.phase.sentence
        const wrong = wrongOnes(s, state)[0]
        await this.bridge.jam()
        if (gen !== this.gen) return false
        this.audio.lock()
        void this.bridge.showLock(true)
        this.audio.verdict(false)
        void this.critters.shake(wrong)
        this.castor.pose('worried')
        await this.balloon.say(BALLOON.at, wrongLine(CRITTERS[wrong], state[wrong], s.item), 'oops')
        return gen === this.gen
    }

    private async fail(gen: number, state: boolean[]) {
        if (!(await this.showWrong(gen, state))) return
        await FX.wait(this, ERROR_HOLD_MS)
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

    private async demoFalse(gen: number): Promise<boolean> {
        await this.coach.demo(this.lever.tapPoint())
        if (gen !== this.gen) return false
        this.lever.pull()
        this.audio.lever()
        if (!(await this.showWrong(gen, this.critters.states()))) return false
        await FX.wait(this, DEMO_HOLD_MS)
        if (gen !== this.gen) return false
        this.balloon.hide()
        this.audio.rewind()
        await FX.flash(this, C.white, { duration: 420, peak: 0.85 })
        void this.bridge.showLock(false)
        this.lever.reset()
        this.castor.pose('talk')
        await this.bridge.raise(500)
        return gen === this.gen
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.guiding = true
        this.closeSetup()
        const key = guideKey(this.level.level)
        const s = this.phase.sentence
        const first = this.level.level === 1

        if (first) {
            await teach(this, key, [
                { text: TEACH.hello, ...spot(grow(this.castor.rect(), 12)), buttonLabel: 'Próximo' },
                { text: TEACH.goal, ...spot(grow(this.sign.faceRect(), 8)), buttonLabel: 'Próximo' },
                { text: TEACH.look, ...spot(STAGE), balloonX: 330, balloonY: 470, buttonLabel: 'Ver' },
            ])
            if (gen !== this.gen) return
            if (!(await this.demoFalse(gen))) return
        } else {
            const word = hotWord(s)
            const hot = this.sign.hotRect()
            if (word) {
                this.introduced.add(word)
                await teach(this, key, [{ text: WORD_INTRO[word](s), ...(hot ? spot(grow(hot, 6)) : {}), buttonLabel: 'Ok' }])
                if (gen !== this.gen) return
            }
        }

        const wrong = wrongOnes(s, this.critters.states())
        for (const [k, i] of wrong.entries()) {
            const r = this.critters.hit(i)
            if (k === 0 && first) {
                await teach(this, key, [
                    {
                        text: fixLine(CRITTERS[i], this.critters.states()[i], s.item),
                        ...spot(grow(r, 14)),
                        pointer: { fromX: r.x, fromY: r.y, toX: r.x, toY: r.y + 20, tap: true },
                        ...TIP_SPOT,
                        buttonLabel: 'Ok',
                    },
                ])
                if (gen !== this.gen) return
            }
            this.coach.show(grow(r, 16), { x: r.x, y: r.y + 20 })
            this.critters.enable([i])
            await this.waitTap(i)
            if (gen !== this.gen) return
            this.coach.hide()
            this.critters.enable([])
            this.flip(i)
            await FX.wait(this, FLIP_PAUSE_MS)
            if (gen !== this.gen) return
        }

        const lever = this.lever.rect()
        const at = this.lever.tapPoint()
        await teach(this, key, [
            {
                text: first ? TEACH.lever : TEACH.leverShort,
                ...spot(lever),
                pointer: { fromX: at.x, fromY: at.y, toX: at.x, toY: at.y, tap: true },
                ...TIP_SPOT,
                buttonLabel: 'Ok',
            },
        ])
        if (gen !== this.gen) return
        this.lever.setEnabled(true)
        this.coach.show(lever, at)
        await this.waitTap('lever')
        if (gen !== this.gen) return
        this.coach.hide()
        this.guiding = false
        if (first) this.tip = TEACH.check
        void this.judge()
    }

    private async explain() {
        if (this.mode !== 'setup' || this.guiding) return
        const gen = this.gen
        this.mode = 'panel'
        this.guiding = true
        this.closeSetup()
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: TEACH.goal, ...spot(grow(this.sign.faceRect(), 8)) },
            { text: TEACH.toggle, ...spot(grow(this.critters.all(), 14)) },
            { text: TEACH.ask, ...spot(this.lever.rect()), ...TIP_SPOT, buttonLabel: 'Continuar' },
        ])
        this.guiding = false
        if (gen !== this.gen) return
        this.openSetup(gen)
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.closeSetup()
        this.balloon.hide()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        await this.board.show(this.level.phases.map(p => p.sentence))
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.pink, C.cyan, C.lavender, C.yellow] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.pink,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.hot,
            messageColor: CSS.inkSoft,
            title: last ? 'Só a verdade passou!' : `Nível ${this.level.level} completo!`,
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
