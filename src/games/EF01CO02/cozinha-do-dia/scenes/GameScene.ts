import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { FX } from '../../../../shared/effects/FX'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { tutorialDone, tutorialSkipped } from '../../../../shared/tutorial/createTutorial'

import { CLIENT, DISH, FOCUS } from '../data/layout'
import { LEVELS, POINTS, benchAt, guideKey } from '../data/levels'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { HELP, TEACH, whyLine } from '../data/words'
import type { LevelDef, Mess as MessDef, ObjectId, OrderDef, State, StepDef } from '../types'

import { createActions, type Actions } from './actions'
import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBench, type Bench } from './bench'
import { createClient, type Client } from './client'
import { createDish, type Dish } from './dish'
import { createFocus, type Focus } from './focus'
import { spot, tapAt, teach } from './guide'
import { createHeader, type Header } from './header'
import { createMess, type Mess } from './mess'
import { createPouring, type Pouring } from './pouring'
import { createRecipe, type Recipe } from './recipe'
import { createWorld, type World } from './world'

const GAME_ID = 'cozinha-do-dia'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private orderIndex = 0
    private stepIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private guided = false
    private pourLesson = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private world!: World
    private client!: Client
    private dish!: Dish
    private bench!: Bench
    private recipe!: Recipe
    private mess!: Mess
    private actions!: Actions
    private header!: Header
    private banner!: Banner
    private focus!: Focus
    private pouring!: Pouring

    private unsubPlatform?: () => void

    private get order(): OrderDef {
        return this.level.orders[this.orderIndex]
    }

    private get step(): StepDef {
        return this.order.steps[this.stepIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.orderIndex = 0
        this.stepIndex = 0
        this.state = 'intro'
        this.introduce = false
        this.guided = false
        this.pourLesson = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.world = createWorld(this)
        this.client = createClient(this, this.world.clients)
        this.mess = createMess(this)
        this.dish = createDish(this, (x, y) => this.mess.puff(x, y))
        this.bench = createBench(this)
        this.recipe = createRecipe(this)
        this.actions = createActions(this, { bench: this.bench, dish: this.dish, mess: this.mess, audio: this.audio })
        this.focus = createFocus(this)
        this.pouring = createPouring(this, {
            bench: this.bench,
            dish: this.dish,
            mess: this.mess,
            client: this.client,
            audio: this.audio,
            focus: this.focus,
        })
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.orders.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.banner = createBanner(this)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.startOrder(++this.gen, this.introduce)
    }

    private shutdownScene() {
        this.gen++
        this.banner?.destroy()
        this.header?.destroy()
        this.pouring?.destroy()
        this.focus?.destroy()
        this.actions?.destroy()
        this.recipe?.destroy()
        this.bench?.destroy()
        this.dish?.destroy()
        this.mess?.destroy()
        this.client?.destroy()
        this.world?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── pedido

    private async startOrder(gen: number, tutorial: boolean) {
        const order = this.order
        this.stepIndex = 0
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        this.header.setPhase(this.orderIndex)
        const opening = tutorial && this.level.level === 1
        if (opening) {
            this.header.visible(false)
            this.world.close()
        }
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.audio.ding()
        await this.client.enter(order.animal)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.audio.pop()
        await this.client.think(order.dish, order.goal)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return

        if (opening) {
            const key = guideKey(this.level.level)
            const animal = this.world.toScreen(this.client.rect())
            const goal = this.world.toScreen(this.client.thoughtRect())
            await teach(this, key, [
                { text: TEACH.hungry, ...spot(animal), balloonY: 600, buttonLabel: 'Próximo' },
                { text: TEACH.wants, ...spot(goal), balloonY: 600, buttonLabel: 'Próximo' },
            ])
            if (gen !== this.gen) return
            await this.world.open()
            if (gen !== this.gen) return
            this.header.visible(true)
        }

        if (this.level.choose) {
            const right = await this.pickRecipe(gen, tutorial)
            if (gen !== this.gen) return
            if (!right) {
                this.state = 'error'
                this.header.setHelpEnabled(false)
                await this.playDecoy(gen)
                if (gen !== this.gen) return
                await FX.wait(this, TIMING.error)
                if (gen !== this.gen) return
                this.lose()
                return
            }
        }

        this.dish.show(order.dish, order.start)
        this.audio.pop()
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        if (!this.level.choose) {
            await this.recipe.show(order.steps.map(step => step.object))
            if (gen !== this.gen) return
        }
        await this.bench.setup(benchAt(order, 0))
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return

        if (tutorial && this.level.level === 1) await this.demo(gen)
        else if (tutorial && !this.level.lit) await this.demoTracking(gen)
        else if (this.level.lit) this.recipe.light(this.stepIndex)
        if (gen !== this.gen) return
        this.play()
    }

    private async pickRecipe(gen: number, tutorial: boolean): Promise<boolean> {
        const order = this.order
        const right = order.steps.map(step => step.object)
        const decoy = order.decoy as ObjectId[]
        const lists = order.decoyFirst ? [decoy, right] : [right, decoy]
        const rightIndex = order.decoyFirst ? 1 : 0
        const key = guideKey(this.level.level)

        await this.recipe.offer(lists)
        if (gen !== this.gen) return false

        if (tutorial) {
            this.state = 'demo'
            const strips = { ...spot(this.recipe.offerRect()), balloonY: 500 }
            const goal = { ...spot(this.client.thoughtRect()), balloonY: 500 }
            await teach(this, key, [
                { text: TEACH.two, ...strips, buttonLabel: 'Próximo' },
                { text: TEACH.onlyOne, ...goal, buttonLabel: 'Ver' },
            ])
            if (gen !== this.gen) return false
            const decoyIndex = 1 - rightIndex
            const at = this.recipe.offerRect(decoyIndex)
            await tapAt(this, at.x, at.y)
            if (gen !== this.gen) return false
            await this.recipe.commit(decoyIndex, decoy)
            if (gen !== this.gen) return false
            await this.playDecoy(gen)
            if (gen !== this.gen) return false
            await FX.wait(this, TIMING.error)
            if (gen !== this.gen) return false
            this.banner.clear()
            this.actions.undo()
            this.dish.hide()
            this.bench.clear()
            this.client.pose('wait')
            this.stepIndex = 0
            await this.recipe.offer(lists)
            if (gen !== this.gen) return false
            await teach(this, key, [{ text: TEACH.goPick, ...strips, buttonLabel: 'Vamos!' }])
            if (gen !== this.gen) return false
            this.guided = true
        }

        tutorialDone(this)
        this.state = 'choose'
        this.header.setHelpEnabled(true)
        const index = await new Promise<number>(resolve => {
            this.recipe.armOffer(i => {
                if (this.state !== 'choose' || gen !== this.gen) return
                if (this.guided && i !== rightIndex) {
                    this.audio.nope()
                    void this.recipe.shakeOffer(i)
                    return
                }
                resolve(i)
            })
        })
        if (gen !== this.gen) return false
        this.guided = false
        this.state = 'busy'
        this.header.setHelpEnabled(false)
        this.audio.pop()
        await this.recipe.commit(index, lists[index])
        return index === rightIndex
    }

    private async playDecoy(gen: number) {
        const order = this.order
        const decoy = order.decoy as ObjectId[]
        this.dish.show(order.dish, order.start)
        this.audio.pop()
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.bench.setup(benchAt(order, 0))
        if (gen !== this.gen) return
        this.recipe.light(0)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        for (const id of decoy) {
            const step = this.step
            const at = this.bench.pos(id)
            await tapAt(this, at.x, at.y)
            if (gen !== this.gen) return
            if (id !== step.object) {
                await this.showMess(id, step.messes[id] as MessDef)
                return
            }
            await this.runStep(gen, step, true)
            if (gen !== this.gen) return
        }
    }

    private async demoTracking(gen: number) {
        this.state = 'demo'
        const key = guideKey(this.level.level)
        const recipeSpot = { ...spot(this.recipe.rect()), balloonY: 340 }
        await teach(this, key, [{ text: TEACH.noLight, ...recipeSpot, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        const first = this.step
        const at = this.bench.pos(first.object)
        await tapAt(this, at.x, at.y)
        if (gen !== this.gen) return
        await this.runStep(gen, first)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.demoLook)
        if (gen !== this.gen) return
        await teach(this, key, [
            { text: TEACH.check, ...recipeSpot, buttonLabel: 'Próximo' },
            { text: TEACH.twice, ...recipeSpot, buttonLabel: 'Próximo' },
            { text: TEACH.go, buttonLabel: 'Vamos!' },
        ])
        if (gen !== this.gen) return
        this.guided = true
    }

    private play() {
        tutorialDone(this)
        this.state = 'play'
        this.header.setHelpEnabled(true)
        this.bench.arm(benchAt(this.order, this.stepIndex), id => this.pick(this.gen, id))
    }

    private async demo(gen: number) {
        this.state = 'demo'
        const key = guideKey(this.level.level)
        const recipeSpot = { ...spot(this.recipe.rect()), balloonY: 340 }
        await teach(this, key, [{ text: TEACH.recipe, ...recipeSpot, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        for (let i = 0; i < this.order.steps.length; i++) {
            this.recipe.light(i)
            this.audio.pop()
            void this.bench.hop(this.order.steps[i].object)
            await FX.wait(this, TIMING.wave)
            if (gen !== this.gen) return
        }
        this.recipe.light(-1)

        await teach(this, key, [{ text: TEACH.oneByOne, ...recipeSpot, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        this.recipe.light(0)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        const first = this.step
        const firstAt = this.bench.pos(first.object)
        await tapAt(this, firstAt.x, firstAt.y)
        if (gen !== this.gen) return
        await this.runStep(gen, first)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.demoLook)
        if (gen !== this.gen) return

        await teach(this, key, [{ text: TEACH.outOfOrder, ...recipeSpot, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        const wrong: ObjectId = 'milk'
        const wrongAt = this.bench.pos(wrong)
        await tapAt(this, wrongAt.x, wrongAt.y)
        if (gen !== this.gen) return
        await this.showMess(wrong, this.step.messes[wrong] as MessDef)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return

        this.banner.clear()
        this.actions.undo()
        this.mess.puff(this.dish.mouth().x, this.dish.mouth().y + 20)
        this.dish.set(first.frame)
        this.client.pose('wait')
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await teach(this, key, [{ text: TEACH.go, buttonLabel: 'Vamos!' }])
        if (gen !== this.gen) return
        this.guided = true
        this.pourLesson = !tutorialSkipped(this, key)
    }

    private pick(gen: number, id: ObjectId) {
        if (this.state !== 'play' || gen !== this.gen) return
        const step = this.step
        if (id === step.object) {
            this.guided = false
            this.state = 'busy'
            this.header.setHelpEnabled(false)
            this.bench.disarm()
            void this.finishStep(gen, step)
            return
        }
        if (this.guided) {
            this.audio.nope()
            void this.bench.nope(id)
            void this.recipe.bump(this.stepIndex)
            return
        }
        void this.fail(gen, id, step.messes[id] as MessDef)
    }

    private async runStep(gen: number, step: StepDef, auto = false) {
        if (step.action === 'place') await this.actions.place(step.object, step.frame)
        else if (step.action === 'press') await this.actions.press(step.frame)
        else if (auto) await this.actions.autoPour(step.object, step.frame)
        else await this.pour(gen, step)
        if (gen !== this.gen) return
        void this.recipe.done(this.stepIndex)
        void this.client.hop()
        this.stepIndex += 1
        await FX.wait(this, TIMING.afterStep)
        if (gen !== this.gen) return
        if (this.level.lit && this.stepIndex < this.order.steps.length) this.recipe.light(this.stepIndex)
    }

    private async pour(gen: number, step: StepDef) {
        this.enterFocus(DISH.x, FOCUS.pour.y, FOCUS.pour.r, FOCUS.pour.strength)
        await this.pouring.start(step.object, step.frame, this.order.dish)
        if (gen !== this.gen) return
        if (this.pourLesson) {
            this.pourLesson = false
            await this.teachPour(gen)
            if (gen !== this.gen) return
        }
        this.state = 'pour'
        await this.pouring.play()
        if (gen !== this.gen) return
        this.state = 'busy'
        await this.pouring.finish(step.frame)
        if (gen !== this.gen) return
        if (this.stepIndex + 1 < this.order.steps.length) await this.leaveFocus()
    }

    private async teachPour(gen: number) {
        const key = guideKey(this.level.level)
        const area = { ...spot(this.pouring.toolRect()), balloonY: 620 }
        await teach(this, key, [{ text: TEACH.hold, ...area, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.pouring.demo()
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await teach(this, key, [{ text: TEACH.aim, ...area, buttonLabel: 'Vamos!' }])
    }

    private enterFocus(x: number, y: number, radius: number, strength: number) {
        void this.header.lift(true)
        this.recipe.dim(true)
        this.focus.show(x, y, radius, strength)
    }

    private async leaveFocus() {
        this.recipe.dim(false)
        this.focus.hide()
        await this.header.lift(false)
    }

    private async finishStep(gen: number, step: StepDef) {
        await this.runStep(gen, step)
        if (gen !== this.gen) return
        if (this.stepIndex >= this.order.steps.length) {
            await this.serve(gen)
            return
        }
        this.play()
    }

    // ───────────────────────────────────────────── servir

    private async serve(gen: number) {
        this.state = 'busy'
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.client.hideThought()
        if (gen !== this.gen) return
        this.enterFocus(CLIENT.x + FOCUS.meal.dx, FOCUS.meal.y, FOCUS.meal.r, FOCUS.meal.strength)
        this.audio.whoosh()
        await this.dish.serve()
        if (gen !== this.gen) return
        this.client.pose('eat')
        for (let i = 0; i < 3; i++) {
            this.audio.bite()
            await this.client.chew()
            if (gen !== this.gen) return
        }
        const head = this.client.head()
        this.mess.hearts(head.x, head.y - 60)
        this.audio.good()
        await this.dish.eaten()
        if (gen !== this.gen) return
        await this.client.hop()
        if (gen !== this.gen) return

        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()

        await FX.wait(this, TIMING.afterMeal)
        if (gen !== this.gen) return
        await this.leaveFocus()
        if (gen !== this.gen) return
        await this.header.celebrate(this.orderIndex)
        if (gen !== this.gen) return
        this.recipe.clear()
        this.bench.clear()
        this.mess.clear()
        await this.client.leave()
        if (gen !== this.gen) return
        this.orderIndex += 1
        if (this.orderIndex >= this.level.orders.length) {
            void this.endLevel()
            return
        }
        await this.startOrder(gen, false)
    }

    // ───────────────────────────────────────────── erro

    private async showMess(id: ObjectId, def: MessDef) {
        await this.actions.fail(id, def)
        this.client.pose('yuck')
        this.audio.nope()
        void this.client.shake()
        void this.recipe.shake(this.stepIndex)
        this.banner.say(whyLine(this.step.object))
    }

    private async fail(gen: number, id: ObjectId, def: MessDef) {
        this.state = 'error'
        this.header.setHelpEnabled(false)
        this.bench.disarm()
        await this.showMess(id, def)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'play' && this.state !== 'choose') return
        const gen = this.gen
        const choosing = this.state === 'choose'
        this.state = 'help'
        this.header.setHelpEnabled(false)
        const key = `${guideKey(this.level.level)}-help`
        if (choosing) {
            await teach(this, key, [{ text: HELP.pick, ...spot(this.client.thoughtRect()), balloonY: 500, buttonLabel: 'Continuar' }])
            if (gen !== this.gen) return
            this.state = 'choose'
            this.header.setHelpEnabled(true)
            return
        }
        this.bench.disarm()
        const text = this.level.lit ? HELP.follow : HELP.track
        await teach(this, key, [{ text, ...spot(this.recipe.rect()), balloonY: 340, buttonLabel: 'Continuar' }])
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
        void this.client.parade(this.level.orders.map(order => order.animal))
        void FX.confetti(this, { colors: [C.butter, C.mint, C.lilac, C.coral, C.pink] })
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
            progress: { total: this.level.orders.length, current: this.level.orders.length },
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
            progress: Math.min(100, Math.round((this.done / this.level.orders.length) * 100)),
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
