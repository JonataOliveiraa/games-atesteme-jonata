import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { BG } from '../data/files'
import { LEVELS, POINTS_SCORE, buildOrder, guideKey } from '../data/levels'
import { DEPTH, H, PALLETS, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import { NEEDS_SAY, SAY, TEACH } from '../data/words'
import type { LevelDef, Mode, ModuleDef, ModuleId, PhaseDef, Rect } from '../types'

import { createAudio, type Audio } from './audio'
import { createBench, type Bench } from './bench'
import { ensureArt } from './fallback'
import { tutorialDone } from '../../../../shared/tutorial/createTutorial'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createNina, type Nina } from './nina'
import { createRobot, type Robot } from './robot'
import { createBalloon, createCoach, createFinale, type Balloon, type Coach, type Finale } from './ui'

const GAME_ID = 'robo-em-pedacos'
const SHOW_ERROR_MS = 800
const PHASE_PAUSE_MS = 1100
const FINALE_MS = 1800

const grow = (r: Rect, by: number): Rect => ({ x: r.x, y: r.y, w: r.w + by * 2, h: r.h + by * 2 })

type Wait = { match: (key: string) => boolean; resolve: () => void }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private teaching = false
    private guiding = false
    private waitFor?: Wait

    private current?: ModuleDef
    private fixedPoints = new Set<number>()
    private fixed = new Set<ModuleId>()
    private attached: ModuleId[] = []

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0

    private audio!: Audio
    private robot!: Robot
    private bench!: Bench
    private nina!: Nina
    private balloon!: Balloon
    private coach!: Coach
    private finale!: Finale
    private hud!: Hud

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get bases(): Partial<Record<ModuleId, ModuleId>> {
        const out: Partial<Record<ModuleId, ModuleId>> = {}
        Object.entries(this.level.needs).forEach(([id, needs]) => {
            if (needs?.length) out[id as ModuleId] = needs[needs.length - 1]
        })
        return out
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.phaseIndex = 0
        this.mode = 'intro'
        this.teaching = false
        this.guiding = false
        this.waitFor = undefined
        this.current = undefined
        this.fixedPoints = new Set()
        this.fixed = new Set()
        this.attached = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cleared = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        ensureArt(this)
        this.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg)

        this.audio = createAudio()
        this.robot = createRobot(
            this,
            id => this.tapPallet(id),
            () => void this.tapPlug(),
        )
        this.bench = createBench(this, i => void this.tapPoint(i))
        this.nina = createNina(this)
        this.balloon = createBalloon(this)
        this.coach = createCoach(this)
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
        this.waitFor = undefined
        this.hud?.destroy()
        this.finale?.destroy()
        this.coach?.destroy()
        this.balloon?.destroy()
        this.nina?.destroy()
        this.bench?.destroy()
        this.robot?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private waitTap(key: string): Promise<void> {
        return new Promise(resolve => {
            this.waitFor = { match: k => k === key, resolve }
        })
    }

    private claimWait(key: string): boolean {
        if (!this.waitFor) return false
        if (this.waitFor.match(key)) {
            const done = this.waitFor.resolve
            this.waitFor = undefined
            done()
        }
        return true
    }

    private say(text: string, pose: 'talk' | 'cheer' | 'scared' = 'talk') {
        this.nina.pose(pose)
        return this.balloon.say(this.nina.mouth(), text, pose === 'scared' ? 'oops' : 'ok')
    }

    private unfixed() {
        return this.phase.modules.map(m => m.id).filter(id => !this.fixed.has(id))
    }

    private unattached() {
        return this.phase.modules.map(m => m.id).filter(id => !this.attached.includes(id))
    }

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.fixed = new Set()
        this.attached = []
        this.current = undefined
        this.robot.load(this.phase, this.bases)
        this.nina.pose('idle')
        await FX.wait(this, 400)
        if (gen !== this.gen) return

        if (this.teaching) {
            await teach(this, guideKey(this.level.level), [{ text: TEACH.broke, ...spot(grow(this.robot.robotRect(), 10)), buttonLabel: 'Ver' }])
            if (gen !== this.gen) return
        } else {
            void this.say(SAY.broke)
        }
        this.mode = 'split'
        this.audio.split()
        await this.robot.split()
        if (gen !== this.gen) return
        this.balloon.hide()
        this.nina.pose('idle')

        if (this.teaching) {
            await this.teachFirstRepair(gen)
            return
        }
        this.openRepair()
    }

    private openRepair() {
        tutorialDone(this)
        this.mode = 'repair'
        this.robot.enablePallets(this.unfixed())
        this.hud.setHelpEnabled(true)
    }

    private tapPallet(id: ModuleId) {
        if (this.claimWait(`pallet:${id}`)) return
        if (this.mode === 'repair' && !this.fixed.has(id)) void this.openBench(id)
        else if (this.mode === 'build' && !this.attached.includes(id)) void this.tryAttach(id)
    }

    private async openBench(id: ModuleId) {
        const mod = this.phase.modules.find(m => m.id === id)
        if (!mod) return
        const gen = this.gen
        this.mode = 'bench'
        this.robot.enablePallets([])
        this.hud.setHelpEnabled(false)
        this.current = mod
        this.fixedPoints = new Set()
        this.audio.open()
        const sprite = this.robot.sprite(id)
        const from = this.robot.pallet(id)
        this.robot.hide(id)
        await this.bench.open(mod, from, sprite?.scale ?? PALLETS.moduleScale)
        if (gen !== this.gen) return
        this.bench.enable(mod.points.map((_, i) => i))
        if (!this.guiding) this.hud.setHelpEnabled(true)
    }

    private async tapPoint(i: number) {
        if (this.claimWait(`point:${i}`)) return
        if (this.mode !== 'bench' || !this.current) return
        const mod = this.current
        const pt = mod.points[i]
        if (!pt || this.fixedPoints.has(i)) return
        const gen = this.gen

        if (!pt.loose) {
            if (this.guiding) {
                this.audio.tap()
                void this.bench.nudge(i)
                void this.balloon.say({ x: this.bench.pointRect(i).x, y: this.bench.pointRect(i).y - 90 }, SAY.firmGuide)
                return
            }
            this.mode = 'busy'
            this.bench.enable([])
            this.hud.setHelpEnabled(false)
            this.audio.slip()
            await this.bench.slip(i)
            if (gen !== this.gen) return
            const r = this.bench.pointRect(i)
            await this.balloon.say({ x: r.x, y: r.y - 100 }, SAY.firm, 'oops')
            this.nina.pose('scared')
            await this.fail(gen)
            return
        }

        this.fixedPoints.add(i)
        this.balloon.hide()
        this.audio.nhec()
        this.bench.enable(mod.points.map((_, k) => k).filter(k => !this.fixedPoints.has(k)))
        await this.bench.fix(i)
        if (gen !== this.gen) return
        if (mod.points.some((p, k) => p.loose && !this.fixedPoints.has(k))) return
        await this.finishModule(gen, mod)
    }

    private async finishModule(gen: number, mod: ModuleDef) {
        this.bench.enable([])
        this.hud.setHelpEnabled(false)
        this.audio.lit()
        await this.bench.light()
        if (gen !== this.gen) return
        this.robot.setLit(mod.id, true)
        await this.bench.close(this.robot.pallet(mod.id), PALLETS.moduleScale)
        if (gen !== this.gen) return
        this.robot.show(mod.id)
        this.robot.markDone(mod.id)
        this.fixed.add(mod.id)
        this.current = undefined
        if (this.guiding) return
        if (this.unfixed().length === 0) {
            await this.startBuild(gen)
            return
        }
        this.openRepair()
    }

    private async startBuild(gen: number) {
        this.mode = 'build'
        this.robot.enablePallets([])
        this.robot.showGhosts(true)
        await this.say(SAY.build)
        if (gen !== this.gen) return
        if (this.teaching) {
            this.hud.setHelpEnabled(false)
            const ids = this.phase.modules.map(m => m.id)
            const order = buildOrder(this.level.needs, ids) ?? ids
            this.balloon.hide()
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.build, ...spot(grow(this.robot.robotRect(), 10)), buttonLabel: 'Próximo' },
                { text: TEACH.bottom, ...spot(grow(this.robot.palletRect(order[0]), 8)), buttonLabel: 'Ok' },
            ])
            if (gen !== this.gen) return
        }
        this.robot.enablePallets(this.unattached())
        this.hud.setHelpEnabled(true)
    }

    private async tryAttach(id: ModuleId) {
        const gen = this.gen
        this.mode = 'busy'
        this.robot.enablePallets([])
        this.hud.setHelpEnabled(false)
        this.balloon.hide()
        const needs = this.level.needs[id] ?? []
        if (needs.every(n => this.attached.includes(n))) {
            await this.robot.attach(id)
            this.audio.clac()
            if (gen !== this.gen) return
            this.attached.push(id)
            if (this.unattached().length === 0) {
                await this.startPlug(gen)
                return
            }
            this.mode = 'build'
            this.robot.enablePallets(this.unattached())
            this.hud.setHelpEnabled(true)
            return
        }
        const fell = await this.robot.drop(id)
        this.audio.clank()
        if (gen !== this.gen) return
        this.nina.pose('scared')
        await this.balloon.say({ x: fell.x, y: fell.y - 40 }, NEEDS_SAY[id], 'oops')
        await this.fail(gen)
    }

    private async startPlug(gen: number) {
        this.mode = 'plug'
        this.robot.showGhosts(false)
        this.robot.setPlug(true)
        if (this.teaching) {
            const r = this.robot.plugRect()
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.plug, ...spot(grow(r, 12)), buttonLabel: 'Ok' },
            ])
            if (gen !== this.gen) return
            this.teaching = false
        } else {
            void this.say(SAY.plug)
        }
        this.hud.setHelpEnabled(true)
    }

    private async tapPlug() {
        if (this.mode !== 'plug') return
        const gen = this.gen
        this.mode = 'walk'
        this.hud.setHelpEnabled(false)
        this.balloon.hide()
        this.audio.power()
        await this.robot.powerUp()
        if (gen !== this.gen) return
        this.audio.step()
        await this.robot.walk()
        if (gen !== this.gen) return
        this.audio.win()
        await this.say(SAY.walk, 'cheer')
        if (gen !== this.gen) return

        this.score += POINTS_SCORE
        this.hits += 1
        this.cleared += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS_SCORE, stage: this.level.level })
        this.emitCheckpoint()
        await this.hud.celebrate(this.phaseIndex)
        await FX.wait(this, PHASE_PAUSE_MS)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        await FX.curtain(
            this,
            () => {
                this.balloon.hide()
                this.phaseIndex = next
                this.robot.load(this.level.phases[next], this.bases)
            },
            C.white,
        )
        void this.startPhase(next)
    }

    private async fail(gen: number) {
        await FX.wait(this, SHOW_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.robot.enablePallets([])
        this.bench.enable([])
        this.hud.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    private async teachFirstRepair(gen: number) {
        const key = guideKey(this.level.level)
        this.guiding = true
        const first = this.phase.modules[0].id
        await teach(this, key, [{ text: TEACH.parts, ...spot(grow(this.robot.palletsRect(), 6)), buttonLabel: 'Ok' }])
        if (gen !== this.gen) return
        const pallet = this.robot.palletRect(first)
        this.mode = 'repair'
        this.robot.enablePallets([first])
        tutorialDone(this)
        this.coach.show(grow(pallet, 6), { x: pallet.x, y: pallet.y })
        await this.waitTap(`pallet:${first}`)
        if (gen !== this.gen) return
        this.coach.hide()
        await this.openBench(first)
        if (gen !== this.gen) return
        this.hud.setHelpEnabled(false)

        const mod = this.current
        if (!mod) return
        const loose = mod.points.findIndex(p => p.loose)
        const firm = mod.points.findIndex(p => !p.loose)
        const lr = this.bench.pointRect(loose)
        this.bench.enable([])
        await teach(this, key, [
            {
                text: TEACH.loose,
                ...spot(grow(lr, 8)),
                balloonY: lr.y > 400 ? 150 : 560,
                buttonLabel: 'Ok',
            },
        ])
        if (gen !== this.gen) return
        this.bench.enable([loose])
        tutorialDone(this)
        this.coach.show(grow(lr, 8), { x: lr.x, y: lr.y })
        await this.waitTap(`point:${loose}`)
        if (gen !== this.gen) return
        this.coach.hide()
        await this.tapPoint(loose)
        if (gen !== this.gen) return

        const fr = this.bench.pointRect(firm)
        await teach(this, key, [{ text: TEACH.firm, ...spot(grow(fr, 8)), balloonY: fr.y > 400 ? 150 : 560, buttonLabel: 'Ok' }])
        if (gen !== this.gen) return
        this.bench.enable(mod.points.map((_, k) => k).filter(k => !this.fixedPoints.has(k)))

        await new Promise<void>(resolve => {
            const check = () => {
                if (gen !== this.gen) return resolve()
                if (this.fixed.has(first)) return resolve()
                this.time.delayedCall(120, check)
            }
            check()
        })
        if (gen !== this.gen) return
        this.guiding = false
        await teach(this, key, [{ text: TEACH.others, ...spot(grow(this.robot.palletsRect(), 6)), buttonLabel: 'Vamos lá!' }])
        if (gen !== this.gen) return
        this.openRepair()
    }

    private async explain() {
        if (!['repair', 'bench', 'build', 'plug'].includes(this.mode) || this.guiding) return
        const gen = this.gen
        const back = this.mode
        this.mode = 'panel'
        this.hud.setHelpEnabled(false)
        this.robot.enablePallets([])
        this.bench.enable([])
        const steps =
            back === 'bench'
                ? [{ text: TEACH.helpLoose, ...spot(grow(this.bench.moduleRect(), 10)), buttonLabel: 'Continuar' }]
                : [
                      { text: TEACH.helpRepair, ...spot(grow(this.robot.palletsRect(), 6)) },
                      { text: TEACH.helpLoose, ...spot(grow(this.robot.palletsRect(), 6)) },
                      { text: TEACH.helpBuild, ...spot(union(grow(this.robot.robotRect(), 10), grow(this.robot.plugRect(), 10))), buttonLabel: 'Continuar' },
                  ]
        await teach(this, `${guideKey(this.level.level)}-help`, steps)
        if (gen !== this.gen) return
        this.mode = back
        this.hud.setHelpEnabled(true)
        if (back === 'repair') this.robot.enablePallets(this.unfixed())
        if (back === 'build') this.robot.enablePallets(this.unattached())
        if (back === 'bench' && this.current) this.bench.enable(this.current.points.map((_, k) => k).filter(k => !this.fixedPoints.has(k)))
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
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
        await this.finale.show(this.attached)
        if (gen !== this.gen) return
        void FX.confetti(this, { colors: [C.blue, C.yellow, C.orange, C.purple] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.blue,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.blueDark,
            messageColor: CSS.inkSoft,
            title: last ? 'Robô consertado!' : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.blue,
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
