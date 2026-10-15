import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { BUBBLE, DEPTH, W } from '../data/layout'
import { LEVELS, POINTS, fallers, guideKey, roundsOf } from '../data/levels'
import { SPECIES, speciesOf, wrongFamily } from '../data/people'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { HELP, TALK, TEACH, YARD_TALK } from '../data/words'
import type { FamilyDef, LevelDef, PhaseDef, Rect, Role, Species, State, Vec } from '../types'

import { backdrop, treeImage } from './art'
import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBasket, type Basket } from './basket'
import { createBoard, type Board, type SlotTouch } from './board'
import { createBubble, type Bubble } from './bubble'
import type { Card } from './card'
import { around, spot, teach } from './guide'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { createHeader, type Header } from './header'
import { crashWave } from './wave'
import { blowWind } from './wind'
import { createYard, type Yard } from './yard'

const GAME_ID = 'arvore-da-familia'

const SPECIES_ORDER: Species[] = ['cat', 'dog', 'rabbit']

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private round = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private selected: Card | null = null
    private queue: Card[] = []

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private backdrop?: Phaser.GameObjects.GameObject
    private tree?: Phaser.GameObjects.Image
    private header!: Header
    private banner!: Banner
    private bubble!: Bubble
    private board?: Board
    private yard?: Yard
    private basket?: Basket

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.index]
    }

    private get family(): Board {
        return this.board as Board
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.index = 0
        this.round = 0
        this.state = 'intro'
        this.introduce = false
        this.selected = null
        this.queue = []
        this.board = undefined
        this.yard = undefined
        this.basket = undefined
        this.backdrop = undefined
        this.tree = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.cameras.main.setScroll(0, 0)
        this.audio = createAudio()
        if (this.level.stage === 'yard') {
            this.yard = createYard(this, moving => this.onPan(moving))
            this.basket = createBasket(this, () => this.audio.pop())
        } else {
            this.backdrop = backdrop(this, this.level.stage)
            ;(this.backdrop as Phaser.GameObjects.Image).setDepth(DEPTH.sky)
            if (this.level.stage === 'park') this.tree = treeImage(this).setDepth(DEPTH.tree)
        }
        this.header = createHeader(this, {
            level: this.level.level,
            goal: this.level.goal,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.banner = createBanner(this)
        this.bubble = createBubble(this)
        this.input.on('pointerup', this.onBackground, this)

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
        this.selected = null
        this.queue = []
        this.input.off('pointerup', this.onBackground, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.board?.destroy()
        this.board = undefined
        this.basket?.destroy()
        this.yard?.destroy()
        this.bubble?.destroy()
        this.banner?.destroy()
        this.header?.destroy()
        this.tree?.destroy()
        this.backdrop?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── estados

    private hold(state: State) {
        this.state = state
        this.board?.setLoosePickable(false, false)
        this.board?.setSlotTargets(false)
        this.header.setHelpEnabled(false)
        this.yard?.setEnabled(state === 'fly')
    }

    private ready() {
        this.state = 'pick'
        this.family.setLoosePickable(true, !this.selected)
        this.family.setSlotTargets(!!this.selected)
        this.header.setHelpEnabled(true)
        this.header.setShown(!this.selected)
        this.yard?.setEnabled(true)
    }

    private async until(gen: number, done: () => boolean) {
        while (!done()) {
            await FX.wait(this, 150)
            if (gen !== this.gen) return false
        }
        return gen === this.gen
    }

    // ───────────────────────────────────────────── falas

    private get me(): Vec {
        return this.family.slot(this.family.homeOf('me'))
    }

    private beside(): { at: Vec; tail: Vec } {
        const w = this.level.card.w
        const right = Math.max(...this.phase.slots.map(s => s.x)) + w / 2
        const me = this.me
        return {
            at: { x: Math.min(W - BUBBLE.w / 2 - 16, right + 40 + BUBBLE.w / 2), y: me.y - 70 },
            tail: { x: me.x + w / 2 + 4, y: me.y - 24 },
        }
    }

    private below(): { at: Vec; tail: Vec } {
        const { w, h } = this.level.card
        const me = this.me
        return {
            at: { x: me.x + w / 2 + 30 + BUBBLE.w / 2, y: 630 },
            tail: { x: me.x + 24, y: me.y + h / 2 + 4 },
        }
    }

    private talkPlace() {
        return this.level.stage === 'park' ? this.beside() : this.below()
    }

    private talk(text: string, button: string) {
        const place = this.talkPlace()
        return this.bubble.say(text, place.at, place.tail, button)
    }

    private think(text: string, ms: number) {
        const place = this.below()
        return this.bubble.think(text, place.at, place.tail, ms)
    }

    private sayFrom(card: Card, text: string, button?: string) {
        const yard = this.yard as Yard
        const p = yard.toScreen({ x: card.box.x, y: card.box.y })
        const at = { x: p.x + card.size.w / 2 + 30 + BUBBLE.w / 2, y: p.y }
        const tail = { x: p.x + card.size.w / 2 + 4, y: p.y }
        return button ? this.bubble.say(text, at, tail, button) : this.bubble.think(text, at, tail, 1300)
    }

    // ───────────────────────────────────────────── nível e fases

    private async openLevel() {
        const gen = ++this.gen
        this.header.setPhase(0)
        await this.startPhase(gen, this.introduce)
    }

    private async startPhase(gen: number, tutorial: boolean) {
        this.hold('intro')
        this.selected = null
        this.banner.clear()
        this.header.setShown(true)
        if (this.board) {
            await this.board.leave()
            if (gen !== this.gen) return
            this.board.destroy()
        }
        this.board = createBoard(this, this.level, this.phase, {
            onCard: card => this.onCard(card),
            onSlot: (slot, touch) => this.onSlot(slot, touch),
        })
        this.round = 0
        if (this.level.stage === 'yard') {
            const down = fallers(this.phase)
            this.family.strip(down)
            this.queue = this.order(down)
        }
        await FX.wait(this, TIMING.beat / 2)
        if (gen !== this.gen) return
        await this.family.enter(() => this.audio.pop())
        if (gen !== this.gen) return
        if (this.level.stage === 'yard') await this.openYard(gen, tutorial)
        else await this.runRound(gen, tutorial)
    }

    private order(roles: Role[]): Card[] {
        const bySpecies = SPECIES_ORDER.map(sp => Phaser.Utils.Array.Shuffle(roles.filter(r => speciesOf(r) === sp)))
        const out: Role[] = []
        while (bySpecies.some(list => list.length)) {
            Phaser.Utils.Array.Shuffle(bySpecies.slice()).forEach(list => {
                const r = list.shift()
                if (r) out.push(r)
            })
        }
        return out.map(r => this.family.card(r))
    }

    private async runRound(gen: number, tutorial: boolean) {
        const talk = TALK[this.level.stage as 'park' | 'beach']
        const first = this.round === 0
        const me = this.family.card('me')
        me.setFace('talk')
        if (first && tutorial) await this.talk(talk.home, 'Próximo')
        else if (first && this.phase.news) await this.think(this.phase.news, 1300)
        if (gen !== this.gen) return
        me.setFace('scared')
        await this.think(first && tutorial ? talk.coming : talk.again, 700)
        if (gen !== this.gen) return
        const roles = roundsOf(this.phase)[this.round]
        if (this.level.stage === 'park') await this.wind(gen, roles)
        else await this.wave(gen, roles)
        if (gen !== this.gen) return
        if (tutorial && first) {
            me.setFace('worried')
            await this.talk(talk.fallen, 'Próximo')
            if (gen !== this.gen) return
            me.setFace('talk')
            await this.talk(talk.help, 'Vamos!')
            if (gen !== this.gen) return
            me.setFace('calm')
            await this.demo(gen)
            if (gen !== this.gen) return
        } else {
            me.setFace('calm')
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
        }
        this.ready()
    }

    private async wind(gen: number, roles: Role[]) {
        this.audio.wind(TIMING.gust)
        if (this.tree) this.tweens.add({ targets: this.tree, angle: { from: -1.6, to: 1.6 }, duration: 260, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' })
        await FX.all(
            blowWind(this, TIMING.gust),
            FX.wait(this, 250).then(() => this.family.knock(roles, 'wind', () => this.audio.fall())),
        )
        if (gen !== this.gen || !this.tree) return
        this.tweens.killTweensOf(this.tree)
        await FX.to(this, this.tree, { angle: 0 }, { duration: 240 })
    }

    private async wave(gen: number, roles: Role[]) {
        this.audio.wave()
        await FX.all(crashWave(this), this.family.knock(roles, 'wave', () => this.audio.fall()))
        if (gen !== this.gen) return
        await FX.wait(this, 200)
    }

    private async demo(gen: number) {
        this.state = 'demo'
        const role: Role = this.level.stage === 'beach' ? 'grandmaM' : 'dad'
        const card = this.family.card(role)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.family.lift(card)
        this.audio.lift()
        this.header.setShown(false)
        this.family.setSlotTargets(true)
        await FX.wait(this, TIMING.demoHold)
        if (gen !== this.gen) return
        this.family.setSlotTargets(false)
        await this.family.attach(card, this.family.homeOf(role))
        if (gen !== this.gen) return
        this.audio.snap()
        this.header.setShown(true)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        const beach = this.level.stage === 'beach'
        const focus = this.family.rectOf([this.family.homeOf(role), beach ? this.family.homeOf('mom') : this.family.homeOf('me')])
        await teach(this, guideKey(this.level.level), [
            { text: beach ? TEACH.link : TEACH.parents, ...around(focus), buttonLabel: 'Próximo' },
            { text: TEACH.go, buttonLabel: 'Vamos!' },
        ])
    }

    // ───────────────────────────────────────────── o quintal (N3)

    private async openYard(gen: number, tutorial: boolean) {
        const yard = this.yard as Yard
        const kids = SPECIES_ORDER.map(sp => this.family.card(`${sp}.kid`))
        if (tutorial) {
            for (let i = 0; i < kids.length; i++) {
                await yard.focus(i, TIMING.tour)
                if (gen !== this.gen) return
                void kids[i].hop()
                await this.sayFrom(kids[i], YARD_TALK.hello(SPECIES[SPECIES_ORDER[i]].kid), 'Próximo')
                if (gen !== this.gen) return
            }
            await yard.focus(1, TIMING.tour)
            if (gen !== this.gen) return
        } else if (this.phase.news) {
            await yard.focus(1)
            if (gen !== this.gen) return
            await this.sayFrom(kids[1], this.phase.news)
            if (gen !== this.gen) return
        }
        void this.feed(gen)
        if (tutorial) {
            await this.demoYard(gen)
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
        }
        this.ready()
    }

    private async feed(gen: number) {
        const basket = this.basket as Basket
        while (this.queue.length) {
            const ok = await this.until(gen, () => basket.free() > 0 && !['help', 'alive', 'error', 'done', 'finale'].includes(this.state))
            if (!ok) return
            const card = this.queue.shift() as Card
            this.audio.flap()
            await basket.deliver(card)
            if (gen !== this.gen) return
            this.family.addLoose(card)
            if (this.state === 'pick') this.family.setLoosePickable(true, !this.selected)
            await FX.wait(this, TIMING.pigeonGap)
            if (gen !== this.gen) return
        }
    }

    private async demoYard(gen: number) {
        this.state = 'demo'
        const basket = this.basket as Basket
        const yard = this.yard as Yard
        if (!(await this.until(gen, () => basket.cards().length > 0))) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        const card = basket.cards()[0]
        const sp = speciesOf(card.role) as Species
        this.family.lift(card)
        this.audio.lift()
        this.header.setShown(false)
        await yard.focus(SPECIES_ORDER.indexOf(sp))
        if (gen !== this.gen) return
        this.family.setSlotTargets(true)
        await FX.wait(this, TIMING.demoHold)
        if (gen !== this.gen) return
        this.family.setSlotTargets(false)
        basket.take(card)
        await this.family.attach(card, this.family.homeOf(card.role))
        if (gen !== this.gen) return
        this.audio.snap()
        this.header.setShown(true)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        const ids = this.phase.slots.filter(s => s.id.startsWith(`${sp}-`)).map(s => s.id)
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.family, ...around(yard.screenRect(this.family.rectOf(ids))), buttonLabel: 'Próximo' },
            { text: TEACH.go, buttonLabel: 'Vamos!' },
        ])
    }

    private onPan(moving: boolean) {
        this.basket?.setDim(moving)
        if (moving) this.board?.setLoosePickable(false, false)
        else if (this.state === 'pick') this.family.setLoosePickable(true, !this.selected)
    }

    // ───────────────────────────────────────────── os toques

    private onBackground(_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) {
        if (this.state !== 'pick' || !this.selected || over.length || this.yard?.panned()) return
        this.release()
    }

    private onCard(card: Card) {
        if (this.state !== 'pick' || !this.family.loose().includes(card)) return
        if (this.selected === card) {
            this.release()
            return
        }
        this.selected = card
        this.family.lift(card)
        this.audio.lift()
        this.family.setLoosePickable(true, false)
        this.family.setSlotTargets(true)
        this.header.setShown(false)
    }

    private release() {
        this.selected = null
        this.family.lift(null)
        this.audio.put()
        this.family.setLoosePickable(true, true)
        this.family.setSlotTargets(false)
        this.header.setShown(true)
    }

    private onSlot(slot: string, touch: SlotTouch) {
        if (this.state !== 'pick' || !this.selected || !this.family.emptySlots().includes(slot)) return
        if (this.yard ? touch !== 'up' || this.yard.panned() : touch !== 'down') return
        void this.place(this.gen, this.selected, slot)
    }

    private async place(gen: number, card: Card, slot: string) {
        this.selected = null
        this.header.setShown(true)
        this.hold('fly')
        this.basket?.take(card)
        if (!this.family.slot(slot).accepts.includes(card.role)) {
            void this.wrong(gen, card, slot)
            return
        }
        await this.family.attach(card, slot)
        if (gen !== this.gen) return
        this.audio.snap()
        if (this.family.complete()) {
            if (this.level.stage !== 'yard' && this.round < roundsOf(this.phase).length - 1) void this.nextRound(gen)
            else void this.complete(gen)
            return
        }
        this.ready()
    }

    private async nextRound(gen: number) {
        this.hold('intro')
        this.round += 1
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.runRound(gen, false)
    }

    // ───────────────────────────────────────────── fim da fase

    private async complete(gen: number) {
        this.hold('alive')
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        if (this.level.stage !== 'yard') this.family.card('me').setFace('cheer')
        this.audio.cheer()
        await this.family.celebrate()
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.cheer)
        if (gen !== this.gen) return
        await this.header.celebrate(this.index)
        if (gen !== this.gen) return
        this.index += 1
        if (this.index >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        this.header.setPhase(this.index)
        await this.startPhase(gen, false)
    }

    // ───────────────────────────────────────────── erro

    private why(card: Card, slot: string) {
        const person = card.person
        if (this.level.stage === 'yard') {
            const want = speciesOf(this.family.slot(slot).accepts[0])
            if (want !== person.species) return wrongFamily(card.role)
        }
        return this.level.links ? person.whyLink ?? person.why : person.why
    }

    private async wrong(gen: number, card: Card, slot: string) {
        this.hold('error')
        this.audio.blom()
        if (this.level.stage !== 'yard') this.family.card('me').setFace('worried')
        const text = this.why(card, slot)
        const fall = this.family.reject(card, slot)
        await FX.wait(this, TIMING.fly + 80)
        if (gen !== this.gen) return
        this.banner.say(text)
        await fall
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.yard?.setEnabled(false)
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
        if (this.selected) this.release()
        this.hold('help')
        const stage = this.level.stage
        let area: Rect
        if (this.yard) {
            const sp = SPECIES_ORDER[this.yard.nearest()]
            area = this.yard.screenRect(this.family.rectOf(this.phase.slots.filter(s => s.id.startsWith(`${sp}-`)).map(s => s.id)))
        } else {
            const home = this.family.homeOf('me')
            const fam = this.phase.families.find(f => f.children.includes(home)) as FamilyDef
            area = this.family.rectOf([...fam.parents, ...fam.children])
        }
        const loose = this.family.loose()
        const first: TutorialStep =
            stage === 'beach' && loose.length
                ? { text: HELP.link, ...this.looseFocus(loose), buttonLabel: 'Próximo' }
                : { text: stage === 'park' ? HELP.lines : HELP.family, ...around(area, 6), buttonLabel: 'Próximo' }
        await teach(this, `${guideKey(this.level.level)}-help`, [first, { text: HELP.parents, ...around(area, 6), buttonLabel: 'Continuar' }])
        if (gen !== this.gen) return
        this.ready()
    }

    private looseFocus(cards: Card[]): Pick<TutorialStep, 'shape' | 'x' | 'y' | 'w' | 'h' | 'balloonX' | 'balloonY'> {
        const { w, h } = this.level.card
        const x0 = Math.min(...cards.map(c => c.box.x)) - w / 2
        const x1 = Math.max(...cards.map(c => c.box.x)) + w / 2
        const y = cards[0].box.y
        const r = { x: (x0 + x1) / 2, y, w: x1 - x0, h }
        return { ...spot(r, 12), balloonX: W / 2, balloonY: y - h / 2 - 150 }
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.audio.win()
        if (this.yard) {
            this.yard.setEnabled(false)
            await this.yard.focus(1)
            if (gen !== this.gen) return
        }
        void FX.confetti(this, { colors: [C.accent, C.butter, C.leaf, C.petal, C.lilac] })
        await FX.wait(this, TIMING.finale)
        if (gen !== this.gen) return
        this.yard?.reset()

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
            accent: C.accentDark,
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
                              color: C.accentDark,
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

