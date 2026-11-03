import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { guideKey, LEVELS, POINTS, shuffled } from '../data/levels'
import { H, KID, WORLD, cloudYFor, rungYs } from '../data/layout'
import { frameArt } from '../data/problems'
import { stepArt } from '../data/steps'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Choice, LevelDef, Mode, PhaseDef, RungDef } from '../types'

import { createAudio, type Audio } from './audio'
import { createCam, type Cam } from './camera'
import { createTap, spot, teach, type Tap } from './guide'
import { createHud, type Hud } from './hud'
import { groundView, phaseIntro, zoomIntro } from './intro'
import { createKid, type Kid } from './kid'
import { createLadder, type Ladder } from './ladder'
import { createOptions, type Options } from './options'
import { createPanel, type Panel } from './panel'
import { createReplay, type Replay } from './replay'
import { createWorld, type World } from './world'

const GAME_ID = 'subida-do-dia'

const TEACH = {
    goal: 'Esta é a meta.',
    now: 'Agora está assim.',
    which: 'Qual passo vem agora?',
    wrong: 'Fora da ordem, dá errado!',
    right: 'Na ordem, dá certo!',
    turn: 'Sua vez!',
    start: 'Olhe bem o começo!',
    skip: 'Não pule nenhum passo!',
    stray: 'Um destes é de outra tarefa!',
    notHere: 'Esse não é daqui!',
}

const LABEL = {
    next: 'Próximo',
    see: 'Ver',
    go: 'Vamos começar!',
    back: 'Continuar',
}

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private rungIndex = 0
    private slots: Choice[] = []
    private ys: number[] = []
    private cloudY = 0
    private mode: Mode = 'intro'
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private phasesDone = 0

    private audio!: Audio
    private world!: World
    private ladder!: Ladder
    private kid!: Kid
    private panel!: Panel
    private options!: Options
    private cam!: Cam
    private replay!: Replay
    private hud!: Hud
    private tap!: Tap

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get rung(): RungDef {
        return this.phase.rungs[this.rungIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 1)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.rungIndex = 0
        this.slots = []
        this.mode = 'intro'
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.phasesDone = 0
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.cam = createCam(this)
        this.world = createWorld(this)
        this.ladder = createLadder(this)
        this.kid = createKid(this)
        this.panel = createPanel(this, this.audio)
        this.options = createOptions(this, this.level.options)
        this.replay = createReplay(this, { panel: this.panel, ladder: this.ladder, audio: this.audio, cam: this.cam })
        this.hud = createHud(this, {
            phases: this.level.phases.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.tap = createTap(this)

        this.options.onTap(slot => this.onTap(slot))

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.tap?.destroy()
        this.replay?.destroy()
        this.options?.destroy()
        this.panel?.destroy()
        this.kid?.destroy()
        this.ladder?.destroy()
        this.world?.destroy()
        this.hud?.destroy()
        this.cam?.stop()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private art(id: string) {
        return frameArt(this.phase.problem, id)
    }

    private stepOf(choice: Choice, rung: RungDef = this.rung) {
        if (choice === 'right') return rung.right
        if (choice === 'wrong') return rung.wrong
        return rung.stray ?? rung.wrong
    }

    private stateBefore(index: number) {
        return index === 0 ? this.phase.start : this.phase.rungs[index - 1].state
    }

    private view(index: number) {
        const y = this.ys[index] ?? (this.ys[this.ys.length - 1] ?? WORLD.groundY) - WORLD.rungGap
        return y + 50
    }

    private lock() {
        this.options.setEnabled(false)
        this.hud.setHelpEnabled(false)
    }

    private choose() {
        this.mode = 'choose'
        this.options.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private alive(gen: number) {
        return () => gen === this.gen
    }

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.lock()
        this.hud.setPhase(index)

        const phase = this.phase
        this.ys = rungYs(phase.rungs.length)
        this.cloudY = cloudYFor(phase.rungs.length)
        this.cam.setTop(this.cloudY - WORLD.viewAbove)
        const start = this.art(phase.start)
        const goal = this.art(phase.goal)
        const deps = { cam: this.cam, kid: this.kid, panel: this.panel, world: this.world }

        this.hud.setVisible(false)
        this.panel.setVisible(false)
        this.world.setGoal(goal, this.cloudY)

        if (index === 0) {
            this.kid.place(KID.startX, WORLD.groundY)
            void this.ladder.build(this.ys, this.cloudY)
            await zoomIntro(this, deps, start, goal, this.cloudY, this.alive(gen))
        } else {
            void this.ladder.build(this.ys, this.cloudY)
            await phaseIntro(this, deps, start, goal, this.cloudY, this.alive(gen))
        }
        if (gen !== this.gen) return

        this.hud.setVisible(true)
        await this.askRung(gen, 0)
    }

    private async askRung(gen: number, index: number, before?: () => Promise<void>) {
        this.rungIndex = index
        this.mode = 'busy'
        this.lock()
        this.ladder.glow(index)
        await this.cam.look(this.view(index), TIMING.camera)
        if (gen !== this.gen) return

        const kinds: Choice[] = this.level.options === 3 ? ['right', 'wrong', 'stray'] : ['right', 'wrong']
        this.slots = shuffled(kinds)
        await this.options.show(this.slots.map(choice => stepArt(this.stepOf(choice))))
        if (gen !== this.gen) return

        if (before) {
            this.mode = 'guide'
            await before()
            if (gen !== this.gen) return
        } else if (this.phaseIndex === 0 && index === 0 && !this.registry.get(guideKey(this.level.level))) {
            this.registry.set(guideKey(this.level.level), true)
            this.mode = 'guide'
            const goOn = await this.introduce(gen)
            if (gen !== this.gen || !goOn) return
        }

        this.choose()
    }

    private slotOf(choice: Choice) {
        return Math.max(0, this.slots.indexOf(choice))
    }

    private async demoTap(gen: number, choice: Choice) {
        const at = this.options.point(this.slotOf(choice))
        void this.tap.press(at.x, at.y)
        await FX.wait(this, 320 + TIMING.tapDown)
        return gen === this.gen
    }

    private async introduce(gen: number): Promise<boolean> {
        const level = this.level.level
        const key = guideKey(level)
        const panel = this.panel
        const all = spot(this.options.allRect, 6)

        if (level === 1) {
            await teach(this, key, [
                { text: TEACH.goal, ...spot(panel.goalRect, 8), buttonLabel: LABEL.next },
                { text: TEACH.now, ...spot(panel.stateRect, 8), buttonLabel: LABEL.next },
                { text: TEACH.which, ...all, buttonLabel: LABEL.see },
            ])
            if (gen !== this.gen) return false
            if (!(await this.demoTap(gen, 'wrong'))) return false
            if (!(await this.run(gen, this.slotOf('wrong')))) return false
            if (!(await this.fallDown(gen))) return false
            await teach(this, key, [{ text: TEACH.wrong, ...spot(panel.stateRect, 8), buttonLabel: LABEL.next }])
            if (gen !== this.gen) return false
            if (!(await this.rewind(gen))) return false
            if (!(await this.demoTap(gen, 'right'))) return false
            if (!(await this.run(gen, this.slotOf('right')))) return false
            await teach(this, key, [{ text: TEACH.right, ...spot(panel.stateRect, 8), buttonLabel: LABEL.next }])
            if (gen !== this.gen) return false
            await this.advance(gen, () => teach(this, key, [{ text: TEACH.turn, ...spot(this.options.allRect, 6), buttonLabel: LABEL.go }]))
            return false
        }

        if (level === 2) {
            await teach(this, key, [
                { text: TEACH.start, ...spot(panel.stateRect, 8), buttonLabel: LABEL.next },
                { text: TEACH.skip, ...all, buttonLabel: LABEL.go },
            ])
            return gen === this.gen
        }

        await teach(this, key, [{ text: TEACH.stray, ...all, buttonLabel: LABEL.see }])
        if (gen !== this.gen) return false
        if (!(await this.demoTap(gen, 'stray'))) return false
        if (!(await this.run(gen, this.slotOf('stray')))) return false
        this.kid.oops()
        this.audio.oops()
        await teach(this, key, [{ text: TEACH.notHere, ...spot(panel.stateRect, 8), buttonLabel: LABEL.next }])
        if (gen !== this.gen) return false
        if (!(await this.rewind(gen))) return false
        await teach(this, key, [{ text: TEACH.turn, ...all, buttonLabel: LABEL.go }])
        return gen === this.gen
    }

    private async rewind(gen: number) {
        const index = this.rungIndex
        this.ladder.empty(index)
        this.kid.place(index === 0 ? KID.startX : this.ladder.stand(index - 1).x, index === 0 ? WORLD.groundY : this.ladder.stand(index - 1).y)
        await this.panel.setState(this.art(this.stateBefore(index)), false)
        if (gen !== this.gen) return false
        this.ladder.glow(index)
        await this.cam.look(this.view(index), TIMING.camera)
        if (gen !== this.gen) return false
        await this.options.show(this.slots.map(choice => stepArt(this.stepOf(choice))))
        return gen === this.gen
    }

    private onTap(slot: number) {
        if (this.mode !== 'choose') return
        void this.pick(slot)
    }

    private async run(gen: number, slot: number): Promise<boolean> {
        const index = this.rungIndex
        const rung = this.rung
        const choice = this.slots[slot]
        const step = stepArt(this.stepOf(choice))
        this.mode = 'busy'
        this.lock()
        this.audio.tap()
        this.options.press(slot)

        const target = this.ladder.rungPoint(index)
        this.audio.fly()
        await this.options.fly(slot, { x: target.x, y: this.cam.screenY(target.y) })
        if (gen !== this.gen) return false
        this.ladder.glow(-1)
        void this.options.clear()

        if (choice === 'stray') {
            this.audio.boing()
            await this.ladder.reject(index, step)
            if (gen !== this.gen) return false
            await this.panel.act(step, undefined, 'stray')
            return gen === this.gen
        }

        await this.ladder.fill(index, step)
        if (gen !== this.gen) return false
        if (index === 0) {
            this.audio.steps()
            await this.kid.walkTo(this.ladder.foot().x)
            if (gen !== this.gen) return false
        }
        this.audio.climb(index)
        await FX.all(this.kid.climbTo(this.ladder.stand(index)), this.cam.look(this.view(index + 1), KID.climbMs))
        if (gen !== this.gen) return false

        if (choice === 'wrong') {
            await this.panel.act(step, this.art(rung.fail), 'fail')
            return gen === this.gen
        }
        await this.panel.act(step, this.art(rung.state), 'ok')
        if (gen !== this.gen) return false
        this.ladder.light(index)
        return true
    }

    private async fallDown(gen: number) {
        if (this.kid.container.y < WORLD.groundY - 4) {
            this.audio.slide()
            await FX.all(this.kid.slideDown(this.ladder.foot()), this.cam.look(groundView(), KID.slideMs))
            if (gen !== this.gen) return false
        }
        this.audio.oops()
        this.kid.oops()
        return true
    }

    private async pick(slot: number) {
        const gen = this.gen
        const choice = this.slots[slot]
        if (!(await this.run(gen, slot))) return

        if (choice !== 'right') {
            if (!(await this.fallDown(gen))) return
            this.lose()
            return
        }
        await this.advance(gen)
    }

    private async advance(gen: number, before?: () => Promise<void>) {
        const next = this.rungIndex + 1
        if (next < this.phase.rungs.length) await this.askRung(gen, next, before)
        else await this.reachTop(gen)
    }

    private async reachTop(gen: number) {
        const phase = this.phase
        this.mode = 'busy'
        this.lock()
        this.ladder.glow(-1)
        await FX.all(
            this.kid.jumpTo({ x: KID.cloudX, y: this.cloudY + KID.cloudFeet }),
            this.cam.look(this.cloudY + 150, TIMING.camera),
        )
        if (gen !== this.gen) return

        const last = phase.rungs[phase.rungs.length - 1]
        if (last.state !== phase.goal) {
            this.audio.puff()
            await this.panel.setState(this.art(phase.goal))
            if (gen !== this.gen) return
        }

        this.audio.fanfare()
        await FX.all(this.kid.cheer(), this.world.celebrate(), this.panel.celebrate())
        if (gen !== this.gen) return

        await this.finishPhase(gen)
    }

    private async finishPhase(gen: number) {
        this.mode = 'replay'
        this.lock()

        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: POINTS,
            stage: this.level.level,
        })

        this.phasesDone += 1
        this.emitCheckpoint()
        void this.hud.celebrate(this.phaseIndex)

        const phase = this.phase
        await this.replay.play(
            this.art(phase.start),
            phase.rungs.map(rung => this.art(rung.state)),
            this.alive(gen),
        )
        if (gen !== this.gen) return
        if (phase.rungs[phase.rungs.length - 1].state !== phase.goal) {
            await this.panel.setState(this.art(phase.goal))
            if (gen !== this.gen) return
        }
        await this.cam.look(this.cloudY + 150, TIMING.camera)
        if (gen !== this.gen) return

        this.mode = 'panel'
        await this.replay.waitNext()
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) void this.startPhase(next)
        else void this.endLevel()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.lock()
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

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.lock()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        this.cam.setTop(0)
        await this.cam.look(H / 2, TIMING.camera)
        if (gen !== this.gen) return

        this.audio.win()
        void FX.confetti(this, { colors: [C.gold, C.green, C.sky, C.white] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.gold,
            panelColor: C.paperLight,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            title: 'Chegou lá em cima!',
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
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
        if (this.mode !== 'choose') return
        const gen = this.gen
        this.mode = 'guide'
        this.lock()

        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: TEACH.goal, ...spot(this.panel.goalRect, 8), buttonLabel: LABEL.next },
            { text: TEACH.now, ...spot(this.panel.stateRect, 8), buttonLabel: LABEL.next },
            { text: TEACH.which, ...spot(this.options.allRect, 6), buttonLabel: LABEL.back },
        ])
        if (gen !== this.gen) return

        this.choose()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.phasesDone / this.level.phases.length) * 100),
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
