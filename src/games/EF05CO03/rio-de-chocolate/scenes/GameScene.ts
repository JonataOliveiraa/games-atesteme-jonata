import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'

import { MEL_CELL } from '../data/files'
import { MEL, MID_LANE } from '../data/layout'
import { LEVELS, OPENING_KEY, POINTS, guideKey, trueParts } from '../data/levels'
import { culprits, has, holds, literals } from '../data/logic'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { HELP, TEACH, why } from '../data/words'
import type { LevelDef, PhaseDef, State, Teach } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBubble, type Bubble } from './bubble'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createMel, type Mel } from './mel'
import { createSign, type Sign } from './sign'
import { createSweets, feetOn, type SweetView, type Sweets } from './sweets'
import { createView, type View } from './view'
import { createWorld, type World } from './world'

const GAME_ID = 'rio-de-chocolate'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private k = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private opening = false

    private score = 0
    private hits = 0
    private errors = 0
    private crossed = 0

    private view!: View
    private world!: World
    private sweets!: Sweets
    private mel!: Mel
    private header!: Header
    private sign!: Sign
    private bubble!: Bubble
    private banner!: Banner
    private audio!: Audio

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
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
        this.k = 0
        this.state = 'intro'
        this.introduce = false
        this.opening = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.crossed = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.view = createView(this)
        this.world = createWorld(this, this.view)
        this.sweets = createSweets(this, this.view)
        this.mel = createMel(this, this.view, () => this.audio.land())
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.sign = createSign(this)
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.header.setHelpEnabled(false)

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
        this.opening = !this.registry.get(OPENING_KEY)
        this.registry.set(OPENING_KEY, true)
        void this.startPhase(++this.gen, 0)
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.banner?.destroy()
        this.bubble?.destroy()
        this.sign?.destroy()
        this.header?.destroy()
        this.mel?.destroy()
        this.sweets?.destroy()
        this.world?.destroy()
        this.view?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(_time: number, delta: number) {
        if (!this.world) return
        this.world.update(Math.min(delta, 50))
        this.view.sort()
    }

    // ───────────────────────────────────────────── travessia

    private async startPhase(gen: number, index: number) {
        this.phaseIndex = index
        const phase = this.phase
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        this.header.setPhase(index)
        this.banner.clear()
        this.world.setColumns(phase.columns.length)
        this.sweets.build(phase.columns)
        this.k = 0
        this.view.setK(0)
        const start = this.world.near(MID_LANE)
        this.mel.place(start.x, start.y)
        this.sign.set(phase.rule)
        this.sign.clearMarks()
        this.sign.visible(false)
        const tutorial = this.introduce && !!phase.teach
        const opened = index === 0 && this.opening

        if (index > 0) {
            await this.fade(false)
            if (gen !== this.gen) return
        }
        if (opened) {
            await this.playOpening(gen)
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
        }

        this.sign.visible(true)
        this.audio.pop()
        await this.sign.showBig()
        if (gen !== this.gen) return
        const steps = this.teachSteps(opened, tutorial ? phase.teach : undefined)
        if (steps.length) await teach(this, guideKey(this.level.level), steps)
        else await FX.wait(this, TIMING.ruleRead)
        if (gen !== this.gen) return
        await this.sign.dock()
        if (gen !== this.gen) return

        if (tutorial) {
            await this.demo(gen)
            if (gen !== this.gen) return
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.go, ...spot(this.sweets.rect(this.k), 4), balloonX: 920, balloonY: 300, buttonLabel: 'Vamos!' },
            ])
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
        }
        this.play()
    }

    private teachSteps(opened: boolean, topic?: Teach): TutorialStep[] {
        const topics: Teach[] = []
        if (opened && topic !== 'rule') topics.push('rule')
        if (topic) topics.push(topic)
        return topics.map((t, i) => ({
            text: TEACH[t],
            ...spot(this.areaOf(t), 10),
            balloonY: 540,
            buttonLabel: i < topics.length - 1 ? 'Próximo' : 'Ver',
        }))
    }

    private areaOf(topic: Teach) {
        if (topic === 'not') return this.sign.notRect() ?? this.sign.rect()
        if (topic === 'and' || topic === 'or') return this.sign.pairRect() ?? this.sign.rect()
        return this.sign.rect()
    }

    private async playOpening(gen: number) {
        this.header.visible(false)
        this.view.setK(this.phase.columns.length + 1)
        await FX.wait(this, 800)
        if (gen !== this.gen) return
        this.audio.whoosh()
        await this.view.scrollTo(0, TIMING.pan)
        if (gen !== this.gen) return
        await this.view.close({ x: this.mel.x + 40, y: this.mel.y - MEL.h * 0.45 })
        if (gen !== this.gen) return
        await this.melSays(TEACH.party, 'Próximo')
        if (gen !== this.gen) return
        this.mel.pose(MEL_CELL.cheer)
        await this.melSays(TEACH.hop, 'Próximo')
        if (gen !== this.gen) return
        this.mel.pose(null)
        await this.view.open()
        if (gen !== this.gen) return
        this.header.visible(true)
    }

    private melSays(text: string, button?: string) {
        const head = this.mel.head()
        const at = this.view.toScreen(head.x + 30, head.y - 40)
        return this.bubble.say(text, { x: at.x + 60, y: at.y }, button)
    }

    private async demo(gen: number) {
        this.state = 'demo'
        const rule = this.phase.rule
        const column = this.sweets.column(this.k)
        const bads = column.filter(s => !holds(rule, s.def))
        const bad = bads.find(s => trueParts(this.phase, s.def) === 1) ?? bads[0]
        const good = column.find(s => holds(rule, s.def))
        if (!bad || !good) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.mel.walkTo(this.world.near(bad.lane))
        if (gen !== this.gen) return
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await this.mel.toe(bad)
        if (gen !== this.gen) return
        await this.conference(gen, bad)
        if (gen !== this.gen) return
        this.audio.glub()
        await FX.all(this.sweets.sink(bad), FX.wait(this, 250).then(() => this.mel.back()))
        if (gen !== this.gen) return
        this.sign.clearMarks()
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.jumpOn(gen, good)
        if (gen !== this.gen) return
        await this.landedWell(gen, good)
    }

    private play() {
        this.state = 'play'
        this.header.setHelpEnabled(true)
        this.sweets.activate(this.k, s => void this.onPick(s))
    }

    private async onPick(s: SweetView) {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'jump'
        this.sweets.deactivate()
        this.header.setHelpEnabled(false)
        await this.jumpOn(gen, s)
        if (gen !== this.gen) return
        const ok = holds(this.phase.rule, s.def)
        await this.conference(gen, s)
        if (gen !== this.gen) return
        if (ok) await this.landedWell(gen, s)
        else await this.sinkWith(gen, s)
    }

    private async jumpOn(gen: number, s: SweetView) {
        this.audio.jump()
        await this.mel.hopTo(feetOn(s))
        if (gen !== this.gen) return
        void this.sweets.dip(s)
        this.mel.pose(MEL_CELL.land)
        await FX.wait(this, TIMING.land)
    }

    private async conference(gen: number, s: SweetView) {
        for (const [i, l] of literals(this.phase.rule).entries()) {
            await FX.all(this.sign.bounce(i), this.sweets.bounce(s))
            if (gen !== this.gen) return
            const value = has(s.def, l.term)
            if (value) this.audio.yes()
            else this.audio.no()
            await this.sign.mark(i, value)
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.mark)
            if (gen !== this.gen) return
            if (l.not) {
                this.audio.flip()
                await this.sign.flip(i, !value)
                if (gen !== this.gen) return
                await FX.wait(this, TIMING.mark)
                if (gen !== this.gen) return
            }
        }
        if (!this.phase.rule.op) return
        this.audio.join()
        const ok = holds(this.phase.rule, s.def)
        await this.sign.join(ok)
        if (gen !== this.gen) return
        if (ok) this.audio.yes()
        else this.audio.no()
        await FX.wait(this, TIMING.mark)
    }

    private async landedWell(gen: number, s: SweetView) {
        const at = this.view.toScreen(s.x, s.y)
        void FX.sparks(this, at.x, at.y, { color: C.yes, count: 16, spread: 120, size: 10, depth: 80 })
        this.audio.ding()
        await this.mel.cheer()
        if (gen !== this.gen) return
        this.mel.pose(null)
        await FX.wait(this, TIMING.settle)
        if (gen !== this.gen) return
        this.sign.clearMarks()
        this.k += 1
        if (this.k > this.phase.columns.length) return
        if (this.k === this.phase.columns.length) {
            await this.view.scrollTo(this.k)
            if (gen !== this.gen) return
            if (this.state !== 'demo') await this.reachParty(gen)
            return
        }
        await this.view.scrollTo(this.k)
        if (gen !== this.gen) return
        if (this.state !== 'demo') this.play()
    }

    private async reachParty(gen: number) {
        this.state = 'jump'
        await FX.wait(this, 250)
        if (gen !== this.gen) return
        this.audio.jump()
        await this.mel.hopTo(this.world.far(), MEL.jump * 1.2)
        if (gen !== this.gen) return
        this.k += 1
        await this.view.scrollTo(this.k, TIMING.scroll * 1.3)
        if (gen !== this.gen) return
        void this.mel.cheer()
        this.audio.good()
        const party = this.view.toScreen(this.world.party().x, this.world.party().y - 140)
        void FX.sparks(this, party.x, party.y, { color: C.butter, count: 22, spread: 170, size: 12, depth: 80 })
        this.score += POINTS
        this.hits += 1
        this.crossed += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await this.header.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.party)
        if (gen !== this.gen) return
        if (this.phaseIndex >= this.level.phases.length - 1) {
            void this.endLevel()
            return
        }
        await this.fade(true)
        if (gen !== this.gen) return
        await this.startPhase(gen, this.phaseIndex + 1)
    }

    private fade(out: boolean) {
        const cam = this.cameras.main
        return new Promise<void>(resolve => {
            const event = out ? Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE : Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE
            cam.once(event, () => resolve())
            if (out) cam.fadeOut(TIMING.fade, 0x2a1f30)
            else cam.fadeIn(TIMING.fade, 0x2a1f30)
        })
    }

    // ───────────────────────────────────────────── erro

    private async sinkWith(gen: number, s: SweetView) {
        this.state = 'error'
        const rule = this.phase.rule
        const all = literals(rule)
        culprits(rule, s.def).forEach(l => this.sign.blame(all.indexOf(l), l.not && has(s.def, l.term)))
        this.banner.say(why(s.def, rule))
        this.audio.glub()
        await FX.all(
            this.sweets.sink(s),
            FX.wait(this, 300)
                .then(() => this.mel.fall({ x: s.x, y: s.y + 24 }))
                .then(() => this.audio.splash()),
        )
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.sweets.deactivate()
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        this.sweets.deactivate()
        this.header.setHelpEnabled(false)
        const rule = this.phase.rule
        const topics: Teach[] = ['rule']
        if (literals(rule).some(l => l.not) && this.sign.notRect()) topics.push('not')
        if (rule.op) topics.push(rule.op === 'e' ? 'and' : 'or')
        await teach(
            this,
            `${guideKey(this.level.level)}-help`,
            topics.map((t, i) => ({
                text: HELP[t],
                ...spot(this.areaOf(t), 6),
                balloonY: 260,
                buttonLabel: i < topics.length - 1 ? 'Próximo' : 'Continuar',
            })),
        )
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.audio.win()
        this.mel.pose(MEL_CELL.cheer)
        void FX.confetti(this, { colors: [C.butter, C.sky, C.lilac, C.rosa, C.verde] })
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
            progress: { total: this.level.phases.length, current: this.level.phases.length },
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
            progress: Math.min(100, Math.round((this.crossed / this.level.phases.length) * 100)),
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

