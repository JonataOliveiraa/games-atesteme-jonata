import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import { tutorialDone, type TutorialStep } from '../../../../shared/tutorial/createTutorial'

import { ERAS } from '../data/eras'
import { INVENT_SHEET, MARKET, TALK, VILA_FRAME, cellKey } from '../data/files'
import { GOAL, HUD, MARKET_BUBBLE, SPEAR_SHORT, VILA, WATER, WATER_HINT, ZONES } from '../data/layout'
import { INVENTIONS, LEVELS, POINTS, guideKey } from '../data/levels'
import { fishOutcome, sendOutcome } from '../data/rules'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL, NOT_THIS, NOT_TO, STORY, STORY2, STORY3 } from '../data/words'
import type { FishKind, Gadget, LevelDef, Outcome, PhaseDef, Question, Sent, State, Target, Tool, Vec, Want } from '../types'

import { createAudio, type Audio } from './audio'
import { createBadge, type Badge } from './badge'
import { createBanner, createCaption, type Banner, type Caption } from './caption'
import { createCards, type Cards } from './cards'
import { createFisher, type Fisher } from './fisher'
import { createHeader, type Header } from './header'
import { createTap, spot, teach, union, type Tap } from './guide'
import { createInventions, type Inventions } from './inventions'
import { createPicker, type Picker } from './picker'
import { createRecado, type Recado } from './recado'
import { createSonar, type Sonar } from './sonar'
import { createToolbox, type Toolbox } from './toolbox'
import { createWorld, type Fish, type World } from './world'

const GAME_ID = 'pescadores-do-tempo'

const TOOL_LINE: Record<Tool, string> = {
    lanca: 'A LANÇA DO BISAVÔ!',
    vara: 'A VARA DO VOVÔ!',
    sonar: 'O CELULAR DA NETA!',
}

const WATER_RECT = { x: WATER.left, y: WATER.y, w: 830, h: 240 }

type Img = Phaser.GameObjects.Image

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private state: State = 'intro'
    private gen = 0
    private index = 0
    private era = 0
    private night = false
    private want!: Want
    private idleAt = 0
    private picked: Tool | null = null
    private gadget: Gadget | null = null
    private twisted = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private world!: World
    private fisher!: Fisher
    private sonar!: Sonar
    private badge!: Badge
    private cards!: Cards
    private header!: Header
    private caption!: Caption
    private banner!: Banner
    private tap!: Tap
    private recado?: Recado
    private picker?: Picker
    private toolbox?: Toolbox
    private inventions?: Inventions

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
        this.index = 0
        this.era = this.level.phases[0].start
        this.night = false
        this.want = this.level.phases[0].want
        this.idleAt = 0
        this.picked = null
        this.gadget = null
        this.twisted = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.recado = undefined
        this.picker = undefined
        this.toolbox = undefined
        this.inventions = undefined
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.world = createWorld(this, this.era)
        this.fisher = createFisher(this, this.audio, this.era)
        this.sonar = createSonar(this, this.fisher.phone(), kind => this.pickBlip(kind))
        this.badge = createBadge(this, this.era, this.level.uses)
        this.cards = createCards(this, this.audio)
        if (this.level.mode === 'recado') this.recado = createRecado(this, this.audio)
        if (this.level.mode === 'amanha') {
            this.picker = createPicker(this, this.audio)
            this.toolbox = createToolbox(this, this.audio, tool => this.onTool(tool))
            this.inventions = createInventions(this, this.audio, {
                trash: () => this.world.trash(),
                clean: ms => this.world.setDirty(false, ms),
                bigBack: from => this.world.bigBack(from),
            })
        }
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.caption = createCaption(this)
        this.banner = createBanner(this)
        this.tap = createTap(this)

        this.input.on('pointerdown', this.onPointer, this)
        this.input.keyboard?.on('keydown', this.onKey, this)
        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()
        void this.openPhase(0)
    }

    update(time: number, delta: number) {
        this.world?.update(time, Math.min(delta, 50))
        if (this.state === 'play' && !this.tap.on && time - this.idleAt > TIMING.idle) this.hint()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.input.off('pointerdown', this.onPointer, this)
        this.input.keyboard?.off('keydown', this.onKey, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.tap?.destroy()
        this.banner?.destroy()
        this.caption?.destroy()
        this.header?.destroy()
        this.cards?.destroy()
        this.inventions?.destroy()
        this.toolbox?.destroy()
        this.picker?.destroy()
        this.recado?.destroy()
        this.badge?.destroy()
        this.sonar?.destroy()
        this.fisher?.destroy()
        this.world?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private phase(): PhaseDef {
        return this.level.phases[this.index]
    }

    private tool(): Tool {
        return this.picked ?? ERAS[this.era].tool
    }

    private fish(): FishKind {
        return this.want.fish ?? 'small'
    }

    private first(step: string) {
        const key = guideKey(this.level.level, step)
        const was = !this.registry.get(key)
        this.registry.set(key, true)
        return was
    }

    private story(step: string, steps: TutorialStep[]) {
        if (!this.first(step)) return Promise.resolve()
        this.caption.hide()
        return teach(this, guideKey(this.level.level, `${step}-steps`), steps)
    }

    private play() {
        tutorialDone(this)
        this.state = 'play'
        this.idleAt = this.time.now
        this.header.setHelpEnabled(true)
        this.toolbox?.setEnabled(!!this.phase().toolbox)
    }

    private busy() {
        this.state = 'busy'
        this.tap.stop()
        this.header.setHelpEnabled(false)
        this.toolbox?.setEnabled(false)
    }

    private hint() {
        this.tap.follow(() => this.target())
    }

    private vilaSpot(): Vec {
        return { x: VILA.x, y: VILA.y - 64 }
    }

    private target(): Vec | null {
        if (this.recado) return this.want.to === 'mercado' ? this.recado.center() : this.vilaSpot()
        if (this.toolbox && this.phase().toolbox && !this.picked) {
            const r = this.toolbox.rect()
            return { x: r.x + r.w / 2, y: r.y + r.h / 2 }
        }
        if (this.sonar.open) return this.sonar.posOf(this.fish())
        if (this.tool() === 'sonar' || this.night) return WATER_HINT
        const fish = this.world.find(this.fish())
        return fish ? { x: fish.img.x, y: fish.img.y } : null
    }

    private marketFrame(era: number, busy: boolean) {
        if (era <= 1) return busy ? MARKET.jucaBusy : MARKET.jucaIdle
        return busy ? MARKET.biaBusy : MARKET.biaIdle
    }

    private async askVila(want: Want) {
        this.want = want
        this.caption.say(CAPTION.asks, C.white)
        await this.world.call(want.icon, { x: GOAL.x - 160, y: HUD.y })
        this.caption.hide()
        this.header.goal(want.icon, want.goal)
        this.audio.tick()
    }

    private async announce(want: Want, line: string) {
        this.want = want
        this.caption.say(line, C.butter)
        this.audio.tick()
        await FX.wait(this, TIMING.read)
        this.caption.hide()
        this.header.goal(want.icon, want.goal)
    }

    private async openPhase(index: number) {
        const gen = ++this.gen
        this.busy()
        this.index = index
        const phase = this.phase()
        this.want = phase.want
        this.picked = null
        this.gadget = null
        this.twisted = false
        this.header.setPhase(index)
        if (this.era !== phase.start) {
            this.era = phase.start
            this.world.setEra(this.era)
            this.fisher.setEra(this.era)
            this.badge.set(this.era, true)
        }
        this.world.populate(this.era, phase.want.fish)
        this.world.setVila(VILA_FRAME.idle)
        if (this.recado) {
            if (phase.want.to === 'mercado') void this.recado.showMarket(this.marketFrame(this.era, !!phase.busy))
            else void this.recado.hideMarket()
        }
        if (this.toolbox) {
            this.toolbox.select(null)
            if (phase.toolbox) void this.toolbox.show()
            else void this.toolbox.hide()
        }
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return

        if (phase.night !== this.night) {
            this.night = phase.night
            this.caption.say(phase.night ? CAPTION.night : CAPTION.morning, C.time)
            await this.world.setNight(phase.night, TIMING.night)
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.read)
            if (gen !== this.gen) return
        }

        if (this.level.mode === 'recado') await this.openRecado(gen, index)
        else if (this.level.mode === 'amanha') await this.openAmanha(gen, index)
        else await this.openPesca(gen, index)
        if (gen !== this.gen) return

        this.play()
        if (index === 0 && this.first('first-try')) {
            this.caption.say(CAPTION.yourTurn, C.yes)
            this.hint()
        }
    }

    private async openPesca(gen: number, index: number) {
        const phase = this.phase()
        if (index === 0) {
            await this.story('intro', [
                { text: STORY.vila, ...spot(this.world.vilaRect()), buttonLabel: 'Próximo' },
                { text: STORY.family, ...spot(this.fisher.rect()), buttonLabel: 'Próximo' },
                { text: STORY.badge, ...spot(this.badge.rect()), buttonLabel: 'Próximo' },
            ])
            if (gen !== this.gen) return
        }
        await this.askVila(phase.want)
        if (gen !== this.gen) return
        if (index === 0)
            await this.story('fish', [
                { text: STORY.goal, ...spot(this.header.goalRect()), balloonY: 250, buttonLabel: 'Próximo' },
                { text: STORY.fish, ...spot(ZONES.small), buttonLabel: 'Ok' },
            ])
        if (phase.night) await this.story('night', [{ text: STORY.night, ...spot(WATER_RECT), buttonLabel: 'Ok' }])
    }

    private async openRecado(gen: number, index: number) {
        const phase = this.phase()
        if (index === 0) {
            await this.story('intro', [{ text: STORY2.fresh, ...spot(union(this.badge.rect(), this.fisher.rect())), buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
        }
        await this.announce(phase.want, CAPTION.fresh)
        if (gen !== this.gen) return
        if (index === 0)
            await this.story('target', [
                { text: STORY2.goal, ...spot(this.header.goalRect()), balloonY: 250, buttonLabel: 'Próximo' },
                { text: STORY2.target, ...spot(this.world.vilaRect()), buttonLabel: 'Ok' },
            ])
        if (phase.want.to === 'mercado' && this.recado) await this.story('market', [{ text: STORY2.market, ...spot(this.recado.rect()), buttonLabel: 'Ok' }])
    }

    private async openAmanha(gen: number, index: number) {
        const phase = this.phase()
        if (index === 0) {
            await this.story('intro', [{ text: STORY3.start, ...spot(union(this.badge.rect(), this.fisher.rect())), buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
        }
        await this.askVila(phase.want)
        if (gen !== this.gen) return
        if (index === 0) await this.story('sonar', [{ text: STORY.sonar, ...spot(WATER_RECT), buttonLabel: 'Ok' }])
        if (phase.toolbox && this.toolbox) {
            await this.story('tools', [
                { text: STORY3.tools, ...spot(this.toolbox.rect()), buttonLabel: 'Próximo' },
                { text: STORY3.fish, ...spot(WATER_RECT), buttonLabel: 'Ok' },
            ])
            if (gen !== this.gen) return
            this.caption.say(CAPTION.pickTool, C.white)
        }
    }

    private onPointer(pointer: Phaser.Input.Pointer) {
        if (this.state !== 'play') return
        const { x, y } = pointer
        if (this.recado) {
            const r = this.world.vilaRect()
            const to: Target | null = this.recado.hits(x, y) ? 'mercado' : x > r.x - 30 && x < r.x + r.w + 30 && y > r.y - 30 && y < r.y + r.h + 30 ? 'vila' : null
            if (!to) return
            this.idleAt = this.time.now
            if (to !== this.want.to) this.wrongTarget()
            else void this.send(to)
            return
        }
        if (this.sonar.open) return
        if (y < WATER.y - 20 || x < WATER.left) return
        this.idleAt = this.time.now
        if (this.phase().toolbox && !this.picked) {
            this.tap.stop()
            this.audio.miss()
            this.caption.say(CAPTION.pickTool, C.oops)
            return
        }
        if (this.tool() === 'sonar') {
            void this.useSonar(x)
            return
        }
        if (this.night) {
            void this.tryFish(null, { x, y })
            return
        }
        const fish = this.world.fishAt(x, y)
        if (!fish) return
        if (fish.kind !== this.fish()) this.notThis()
        else void this.tryFish(fish, { x, y })
    }

    private onKey(event: KeyboardEvent) {
        if (event.key !== ' ' && event.key !== 'Enter') return
        if (this.state !== 'play') return
        this.idleAt = this.time.now
        if (this.recado) {
            if (this.want.to) void this.send(this.want.to)
            return
        }
        if (this.phase().toolbox && !this.picked) return
        if (this.sonar.open) this.pickBlip(this.fish())
        else if (this.tool() === 'sonar') void this.useSonar(WATER_HINT.x)
        else if (this.night) void this.tryFish(null, WATER_HINT)
        else {
            const fish = this.world.find(this.fish())
            if (fish) void this.tryFish(fish, { x: fish.img.x, y: fish.img.y })
        }
    }

    private onTool(tool: Tool) {
        if (this.state !== 'play' || !this.phase().toolbox || this.sonar.open) return
        this.idleAt = this.time.now
        this.tap.stop()
        this.picked = tool
        this.toolbox?.select(tool)
        this.audio.click()
        this.caption.say(TOOL_LINE[tool], C.white)
    }

    private notThis() {
        this.tap.stop()
        this.audio.miss()
        this.caption.say(NOT_THIS[this.fish()], C.oops)
    }

    private wrongTarget() {
        this.tap.stop()
        this.audio.miss()
        if (this.want.to) this.caption.say(NOT_TO[this.want.to], C.oops)
    }

    private async tryFish(fish: Fish | null, at: Vec) {
        const gen = this.gen
        this.busy()
        this.caption.hide()
        const outcome = fishOutcome(this.tool(), ERAS[this.era], this.fish(), this.night)
        const img = outcome === 'ok' && fish ? this.world.take(fish) : null
        let caught: Img | null
        if (this.tool() === 'lanca') {
            const miss = outcome === 'reach' ? SPEAR_SHORT : { x: Phaser.Math.Clamp(at.x, 520, 660), y: Phaser.Math.Clamp(at.y, 500, 540) }
            caught = await this.fisher.throwSpear(img, miss)
        } else {
            const goal = img ? { x: img.x, y: img.y } : fish ? { x: fish.img.x, y: fish.img.y } : at
            caught = await this.fisher.castLine(goal, img)
        }
        if (gen !== this.gen) return
        if (caught) await this.success(gen, caught)
        else if (this.picked) await this.toolRetry(gen, outcome)
        else await this.toolFails(gen, outcome)
    }

    private failLine(outcome: Outcome) {
        if (outcome === 'reach') return CAPTION.reach
        return this.tool() === 'lanca' ? CAPTION.darkSpear : CAPTION.dark
    }

    private async toolRetry(gen: number, outcome: Outcome) {
        this.caption.say(this.failLine(outcome), C.oops)
        await FX.wait(this, TIMING.caption)
        if (gen !== this.gen) return
        await this.fisher.release(null)
        if (!this.toolbox) return
        await this.story('other', [{ text: STORY3.other, ...spot(this.toolbox.rect()), buttonLabel: 'Ok' }])
        if (gen !== this.gen) return
        this.picked = null
        this.toolbox.select(null)
        this.caption.say(CAPTION.otherTool, C.white)
        this.play()
    }

    private async toolFails(gen: number, outcome: Outcome) {
        this.caption.say(this.failLine(outcome), C.oops)
        await FX.wait(this, TIMING.caption)
        if (gen !== this.gen) return
        await this.fisher.release(null)
        if (outcome === 'reach') await this.story('reach', [{ text: STORY.reach, ...spot(this.fisher.rect()), buttonLabel: 'Ver' }])
        else await this.story('dark', [{ text: STORY.dark, ...spot(this.fisher.rect()), buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.travel(gen, this.era + 1)
        if (gen !== this.gen) return
        if (this.era === 1) await this.story('vovo', [{ text: STORY.vovo, ...spot(union(this.badge.rect(), this.fisher.rect())), buttonLabel: 'Ok' }])
        if (this.era === 2)
            await this.story('hoje', [
                { text: STORY.hoje, ...spot(union(this.badge.rect(), this.fisher.rect())), buttonLabel: 'Próximo' },
                { text: STORY.sonar, ...spot(WATER_RECT), buttonLabel: 'Ok' },
            ])
        if (gen !== this.gen) return
        this.caption.say(CAPTION.tryAgain, C.yes)
        this.play()
    }

    private async travel(gen: number, to: number, dirty = false) {
        this.caption.say(CAPTION.passed, C.time)
        this.audio.forward()
        await this.world.travel(to, 1, () => {
            this.era = to
            void this.fisher.swap(to)
            this.world.populate(to, this.want.fish, dirty)
            if (dirty) void this.world.setDirty(true, 0)
            this.badge.set(to, true)
            this.recado?.clear()
            if (this.recado?.shown) this.recado.setMarket(this.marketFrame(to, !!this.phase().busy))
        })
        if (gen !== this.gen) return
        this.audio.wake()
        this.caption.say(ERAS[to].arrive, C.time)
        await FX.wait(this, TIMING.caption)
    }

    private async send(to: Target) {
        const gen = this.gen
        const recado = this.recado
        if (!recado) return
        this.busy()
        this.caption.hide()
        const phase = this.phase()
        const gadget = this.gadget ?? ERAS[this.era].gadget
        const outcome = sendOutcome(gadget, to, !!phase.busy, !!phase.twist && !this.twisted)
        const dest = to === 'mercado' ? recado.center() : this.vilaSpot()
        const edge = to === 'mercado' ? { x: dest.x - MARKET_BUBBLE.r, y: dest.y } : dest
        this.fisher.talk(TALK[gadget])
        if (gadget === 'buzio' || gadget === 'voz') {
            if (gadget === 'buzio') this.audio.horn()
            else this.audio.voice()
            await recado.shout(this.fisher.mouth(), edge, outcome !== 'far')
        } else if (gadget === 'telefone') {
            await recado.wire(this.fisher.mouth(), edge)
            if (gen !== this.gen) return
            if (outcome === 'busy') await recado.ring()
            else {
                this.audio.ring()
                await FX.wait(this, TIMING.ring)
                recado.setMarket(MARKET.jucaPhone)
            }
        } else {
            const chip = await recado.sendAudio(this.fisher.mouth(), to === 'mercado' ? { x: dest.x - MARKET_BUBBLE.r * 0.8, y: dest.y - MARKET_BUBBLE.r * 0.8 } : { x: dest.x + 70, y: dest.y - 60 })
            if (gen !== this.gen) return
            if (to === 'mercado') {
                this.fisher.still()
                this.caption.say(CAPTION.waiting, C.white)
                await FX.wait(this, TIMING.wait)
                if (gen !== this.gen) return
                this.caption.hide()
                recado.setMarket(MARKET.biaListen)
                await recado.play(chip)
            } else {
                this.world.setVila(VILA_FRAME.phones)
                await recado.play(chip)
            }
        }
        if (gen !== this.gen) return
        this.fisher.still()
        if (outcome === 'ok') await this.success(gen, null)
        else if (outcome === 'nophone') await this.noPhone(gen)
        else await this.sendFails(gen, outcome)
    }

    private async sendFails(gen: number, outcome: Sent) {
        this.audio.miss()
        this.caption.say(outcome === 'far' ? CAPTION.far : CAPTION.busy, C.oops)
        await FX.wait(this, TIMING.caption)
        if (gen !== this.gen) return
        if (outcome === 'far') await this.story('far', [{ text: STORY2.far, ...spot(union(this.fisher.rect(), this.recado!.rect())), buttonLabel: 'Ver' }])
        else await this.story('busy', [{ text: STORY2.busy, ...spot(this.recado!.rect()), buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.travel(gen, this.era + 1)
        if (gen !== this.gen) return
        if (this.era === 1) await this.story('vovo', [{ text: STORY2.vovo, ...spot(union(this.badge.rect(), this.fisher.rect())), buttonLabel: 'Ok' }])
        if (this.era === 2) await this.story('hoje', [{ text: STORY2.hoje, ...spot(union(this.badge.rect(), this.fisher.rect())), buttonLabel: 'Ok' }])
        if (gen !== this.gen) return
        this.caption.say(CAPTION.tryAgain, C.yes)
        this.play()
    }

    private async noPhone(gen: number) {
        const next = this.phase().twist
        if (!next) return
        this.audio.miss()
        this.caption.say(CAPTION.nophone, C.oops)
        await FX.wait(this, TIMING.caption)
        if (gen !== this.gen) return
        await this.story('nophone', [
            { text: STORY2.nophone, ...spot(this.world.vilaRect()), buttonLabel: 'Próximo' },
            { text: STORY2.voice, ...spot(union(this.fisher.rect(), this.world.vilaRect())), buttonLabel: 'Ok' },
        ])
        if (gen !== this.gen) return
        this.recado?.clear()
        this.world.setVila(VILA_FRAME.idle)
        this.twisted = true
        this.gadget = 'voz'
        this.header.goal(next.icon, next.goal)
        this.want = next
        this.audio.tick()
        this.play()
    }

    private async useSonar(x: number) {
        const gen = this.gen
        this.busy()
        this.caption.hide()
        await this.fisher.dropSonar({ x: Phaser.Math.Clamp(x, 580, 1180), y: WATER.y })
        if (gen !== this.gen) return
        const missing: FishKind | null = this.world.present(this.fish()) ? null : this.fish()
        await this.sonar.show(this.world.blips(), missing)
        if (gen !== this.gen) return
        if (missing && this.phase().invent) {
            await this.tomorrow(gen)
            return
        }
        if (missing) {
            await this.twist(gen)
            if (gen !== this.gen) return
        } else await this.story('screen', [{ text: STORY.screen, ...spot(this.sonar.rect()), buttonLabel: 'Ok' }])
        if (gen !== this.gen) return
        this.sonar.pickable(true)
        this.play()
    }

    private async twist(gen: number) {
        const next = this.phase().twist
        if (!next) return
        this.audio.miss()
        this.caption.say(CAPTION.gone, C.oops)
        await FX.wait(this, TIMING.caption)
        if (gen !== this.gen) return
        await this.story('gone', [
            { text: STORY.gone, ...spot(this.sonar.rect()), buttonLabel: 'Próximo' },
            { text: STORY.twist, ...spot(this.world.vilaRect()), buttonLabel: 'Ok' },
        ])
        if (gen !== this.gen) return
        await this.sonar.hide()
        await this.askVila(next)
        if (gen !== this.gen) return
        await this.sonar.show(this.world.blips(), null)
    }

    private async tomorrow(gen: number) {
        const phase = this.phase()
        const picker = this.picker
        const inventions = this.inventions
        if (!phase.invent || !picker || !inventions) return
        this.audio.miss()
        this.caption.say(CAPTION.gone, C.oops)
        await FX.wait(this, TIMING.caption)
        if (gen !== this.gen) return
        await this.story('gone', [{ text: STORY3.gone, ...spot(this.sonar.rect()), buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.sonar.hide()
        void this.fisher.liftSonar()
        this.caption.say(CAPTION.tomorrow, C.time)
        await FX.wait(this, TIMING.read)
        if (gen !== this.gen) return
        await this.travel(gen, 3, true)
        if (gen !== this.gen) return
        await this.story('bisneta', [{ text: STORY3.bisneta, ...spot(union(this.badge.rect(), this.fisher.rect())), buttonLabel: 'Ok' }])
        if (gen !== this.gen) return
        await this.askVila(phase.invent)
        if (gen !== this.gen) return
        await picker.show(
            'Invente o amanhã!',
            INVENTIONS.map(inv => ({ art: { key: INVENT_SHEET.key, frame: cellKey(inv.frame) }, label: inv.name })),
        )
        if (gen !== this.gen) return
        await this.story('invent', [{ text: STORY3.invent, ...spot(picker.rect()), balloonY: 160, buttonLabel: 'Ok' }])
        if (gen !== this.gen) return
        const choice = await picker.choose()
        if (gen !== this.gen) return
        await picker.hide()
        const inv = INVENTIONS[choice]
        await inventions.play(inv.id)
        if (gen !== this.gen) return
        this.want = phase.want
        this.audio.cheer()
        void this.world.cheer()
        this.caption.say(phase.after, C.yes)
        await FX.wait(this, TIMING.cheer)
        if (gen !== this.gen) return
        this.caption.hide()
        await this.finish(gen, inv.question)
    }

    private pickBlip(kind: FishKind) {
        if (this.state !== 'play') return
        this.idleAt = this.time.now
        if (kind !== this.fish()) {
            this.sonar.nope(kind)
            this.notThis()
            return
        }
        void this.reelFromSonar(kind)
    }

    private async reelFromSonar(kind: FishKind) {
        const gen = this.gen
        this.busy()
        this.caption.hide()
        this.sonar.pickable(false)
        const fish = this.world.find(kind)
        if (!fish) return
        const img = this.world.take(fish)
        await this.sonar.hide()
        void this.fisher.liftSonar()
        const caught = await this.fisher.castLine({ x: img.x, y: img.y }, img)
        if (gen !== this.gen || !caught) return
        await this.success(gen, caught)
    }

    private async success(gen: number, fish: Img | null) {
        const phase = this.phase()
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.audio.cheer()
        if (this.want.to !== 'mercado') void this.world.cheer()
        this.caption.say(phase.after, phase.id === 'festa' ? C.butter : C.yes)
        await FX.wait(this, TIMING.cheer)
        if (gen !== this.gen) return
        await this.fisher.release(fish)
        if (gen !== this.gen) return
        this.caption.hide()
        this.recado?.clear()
        await this.finish(gen, phase.question)
    }

    private async finish(gen: number, question?: Question) {
        if (question) {
            const ok = await this.ask(gen, question)
            if (!ok || gen !== this.gen) return
        }
        this.done += 1
        await this.header.celebrate(this.index)
        if (gen !== this.gen) return
        this.emitCheckpoint()
        if (this.index + 1 < this.level.phases.length) void this.openPhase(this.index + 1)
        else void this.endLevel()
    }

    private async ask(gen: number, q: Question) {
        await this.cards.show(q)
        if (gen !== this.gen) return false
        await this.story(q.free ? 'keep' : 'question', [
            { text: q.free ? STORY3.keep : STORY.question, ...spot(this.cards.rect()), balloonY: 180, buttonLabel: 'Ok' },
        ])
        if (gen !== this.gen) return false
        const ok = await this.cards.choose()
        if (gen !== this.gen) return false
        if (ok) {
            if (!q.free) {
                this.score += POINTS
                runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
            }
            await this.cards.hide()
            return true
        }
        this.banner.say(`${LABEL.oops} ${LABEL.right} "${q.right}"`)
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return false
        this.lose()
        return false
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.tap.stop()
        this.header.setHelpEnabled(false)
        this.toolbox?.setEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.busy()
        this.caption.hide()
        const text = this.level.mode === 'recado' ? STORY2.help : this.level.mode === 'amanha' ? STORY3.help : STORY.help
        await teach(this, guideKey(this.level.level, 'help'), [{ text, ...spot(this.header.goalRect()), balloonY: 250, buttonLabel: 'Continuar' }])
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.toolbox?.setEnabled(false)
        this.audio.win()
        void this.world.cheer()
        void FX.confetti(this, { colors: [C.yes, C.time, C.butter, C.scarf, C.accent] })
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
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.time,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: '#6c3fb0',
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
                              color: C.time,
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
            progress: Math.min(100, Math.round((this.done / this.level.phases.length) * 100)),
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
