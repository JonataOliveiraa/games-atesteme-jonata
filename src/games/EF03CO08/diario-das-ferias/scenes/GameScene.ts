import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { AIM, DEPTH, DIARY, DUDA, FOCUS, H, WORLD } from '../data/layout'
import { LEVELS, POINTS, guideKey, pagesOf } from '../data/levels'
import { THINGS, canKeep, contains, isActive } from '../data/things'
import { C, CSS } from '../data/theme'
import { HELP, TEACH } from '../data/words'
import type { LevelDef, Mode, Moment, Page, ThingId, Tool } from '../types'

import { createAudio, type Audio } from './audio'
import { showBanner } from './banner'
import { photoCard, snapPhoto, soundCard, type Card } from './cards'
import { createDiary, type Diary } from './diary'
import { createDuda, type Duda } from './duda'
import { createEdges, type Edges } from './edges'
import { createCoach, spot, teach, union, type Coach, type Rect } from './guide'
import { createHud, type Hud } from './hud'
import { createJoystick, type Joystick } from './joystick'
import { createStage, type Stage } from './stage'
import { createThing, type ThingView } from './things'
import { createTools, type Tools } from './tools'
import { createView, type View } from './view'
import { createLens, type Lens } from './viewfinder'

const SAMPLES = Object.fromEntries(
    Object.entries(
        import.meta.glob('../../../../assets/games/EF03CO08/diario-das-ferias/*.mp3', { eager: true, import: 'default' }) as Record<string, string>,
    ).map(([path, url]) => [path.split('/').pop()?.replace(/\.mp3$/i, '') ?? '', url]),
) as Partial<Record<ThingId, string>>

const GAME_ID = 'diario-das-ferias'
const SHOW_MS = 650
const ERROR_MS = 1500
const RECORD_MS = 1400
/** até onde o som de uma coisa chega na mira do microfone */
const HEAR_RANGE = 420
/** até onde a criança escuta a coisa, mesmo sem o microfone */
const SING_RANGE = 760

type Waiter = { gen: number; done: () => boolean; resolve: () => void }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private momentIndex = 0
    private left = 0
    private mode: Mode = 'intro'
    private gen = 0
    private introduce = false
    private guiding = false
    private tool: Tool | null = null
    private lock: ThingId | null = null
    private coachOn: { thing: ThingId; tool: Tool } | null = null
    private allowed: Record<Tool, boolean> = { photo: true, sound: true }
    private kept?: (id: ThingId) => void
    private waiters: Waiter[] = []

    private pages: Page[] = []
    private shots = 0
    private score = 0
    private hits = 0
    private errors = 0

    private view!: View
    private bg!: Phaser.GameObjects.Image
    private things: ThingView[] = []
    private audio!: Audio
    private hud!: Hud
    private diary!: Diary
    private lens!: Lens
    private edges!: Edges
    private joystick!: Joystick
    private tools!: Tools
    private coach!: Coach
    private duda!: Duda
    private stage!: Stage
    private card?: Card
    private banner?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    private get moment(): Moment {
        return this.level.moments[this.momentIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.momentIndex = 0
        this.left = 0
        this.mode = 'intro'
        this.introduce = false
        this.guiding = false
        this.tool = null
        this.lock = null
        this.coachOn = null
        this.allowed = { photo: true, sound: true }
        this.kept = undefined
        this.waiters = []
        this.pages = []
        this.shots = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.things = []
        this.card = undefined
        this.banner = undefined
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.view = createView(this)
        this.bg = this.view.world(this.add.image(WORLD.w / 2, H / 2, this.level.bg).setDisplaySize(WORLD.w, H).setDepth(DEPTH.bg))
        this.audio = createAudio(SAMPLES)
        this.diary = createDiary(this, pagesOf(this.level))
        this.lens = createLens(this)
        this.edges = createEdges(this)
        this.joystick = createJoystick(this)
        this.tools = createTools(this, { onTool: tool => this.onTool(tool), onAction: () => this.onAction() })
        this.coach = createCoach(this, DEPTH.controls + 5)
        this.duda = createDuda(this)
        this.stage = createStage(this, this.audio)
        this.hud = createHud(this, {
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.controls(false)

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

    private shutdownScene() {
        this.gen++
        this.waiters = []
        this.things.forEach(t => t.destroy())
        this.things = []
        this.card?.destroy()
        this.banner?.destroy()
        this.stage?.destroy()
        this.duda?.destroy()
        this.coach?.destroy()
        this.tools?.destroy()
        this.joystick?.destroy()
        this.edges?.destroy()
        this.lens?.destroy()
        this.diary?.destroy()
        this.hud?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        for (let i = 0; i < this.shots; i++) if (this.textures.exists(this.photoKey(i))) this.textures.remove(this.photoKey(i))
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(_time: number, delta: number) {
        if (this.mode === 'finale' || this.mode === 'done') return
        if (this.mode !== 'panel') this.things.forEach(t => t.update(delta))

        if (this.mode === 'play') {
            const v = this.joystick.vector()
            if (v.x || v.y) this.view.moveAim((v.x * AIM.speed * delta) / 1000, (v.y * AIM.speed * delta) / 1000)
        }
        this.view.update(delta)

        const aim = this.view.toScreen(this.view.aim.x, this.view.aim.y)
        const level = this.loudness()
        this.lens.update(aim.x, aim.y, !!this.target(), this.tool === 'sound' ? level : 0, delta)
        this.tools.level(level, delta)
        this.edges.update(this.things.map(t => this.view.toScreen(t.def.x, t.def.y)))

        if (this.coachOn) {
            const { thing, tool } = this.coachOn
            if (this.tool !== tool) this.coach.ring(this.tools.rect(tool))
            else if (this.target()?.def.id === thing) this.coach.ring(this.tools.actionRect())
            else this.coach.ring(this.view.toScreenRect(this.thingRect(thing)))
        }

        if (this.waiters.length) {
            const ready = this.waiters.filter(w => w.gen !== this.gen || w.done())
            this.waiters = this.waiters.filter(w => !ready.includes(w))
            ready.forEach(w => w.resolve())
        }
    }

    /** a coisa sob a mira que dá para guardar agora */
    private target(): ThingView | undefined {
        const { x, y } = this.view.aim
        return this.things.find(t => contains(t.def, x, y) && isActive(t.beat()))
    }

    /** quanto som chega na mira agora (0 a 1): é o que o medidor do microfone mostra */
    private loudness(): number {
        const { x, y } = this.view.aim
        return this.things.reduce((max, t) => {
            if (!t.beat().hear) return max
            const near = 1 - Math.hypot(t.def.x - x, t.def.y - y) / HEAR_RANGE
            return Math.max(max, near)
        }, 0)
    }

    private sing(id: ThingId) {
        if (this.mode === 'finale' || this.mode === 'done' || this.mode === 'panel') return
        const def = THINGS[id]
        const near = Math.max(0, 1 - Math.hypot(def.x - this.view.aim.x, def.y - this.view.aim.y) / SING_RANGE)
        const boost = this.tool === 'sound' ? 1.25 : this.tool === 'photo' ? 0.8 : 1
        this.audio.thing(id, Math.min(1, (0.08 + 0.92 * near * near) * boost))
    }

    private waitFor(done: () => boolean): Promise<void> {
        return new Promise(resolve => this.waiters.push({ gen: this.gen, done, resolve }))
    }

    private controls(on: boolean) {
        this.joystick.setEnabled(on)
        this.tools.setEnabled('photo', on && this.allowed.photo)
        this.tools.setEnabled('sound', on && this.allowed.sound)
        this.tools.setActionEnabled(on)
        this.hud.setHelpEnabled(on && !this.guiding)
    }

    private photoKey(i: number) {
        return `ddf-photo-${i}`
    }

    private thingRect(id: ThingId): Rect {
        const def = THINGS[id]
        return { x: def.x, y: def.y, w: def.w, h: def.h }
    }

    // ───────────────────────────────────────────── sacar e guardar

    private onTool(tool: Tool) {
        if (this.mode !== 'play' || !this.allowed[tool]) return
        this.hold(this.tool === tool ? null : tool)
    }

    private hold(tool: Tool | null) {
        this.tool = tool
        this.tools.setHeld(tool)
        this.lens.setTool(tool)
        this.audio.hold(tool)
        void this.view.hold(tool)
    }

    // ───────────────────────────────────────────── nível e momentos

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        await this.spawn(0)
        if (gen !== this.gen) return

        if (this.introduce) {
            await this.duda.show('talk')
            if (gen !== this.gen) return
            await this.lesson(gen, [{ text: this.level.goal, ...spot(this.duda.rect()), balloonX: 880, balloonY: 300, buttonLabel: 'Vamos lá!' }])
            if (gen !== this.gen) return
            await this.duda.hide()
            if (gen !== this.gen) return
        }

        if (this.introduce && this.moment.guided) {
            await this.guidedMoment(gen)
            return
        }
        if (!(await this.debut(gen))) return
        this.play()
    }

    /** estreia de uma ideia nova: a câmera vai até a coisa e um balão explica */
    private async debut(gen: number): Promise<boolean> {
        const lesson = this.moment.lesson
        if (!this.introduce || !lesson) return true
        const view = this.things.find(t => t.def.id === lesson.thing)
        if (!view) return true
        this.view.setAim(view.def.x, view.def.y + 40)
        await FX.wait(this, 900)
        if (gen !== this.gen) return false
        const rect = this.view.toScreenRect(view.rect())
        await this.lesson(gen, [{ text: lesson.text, ...spot(rect), balloonX: 640, balloonY: rect.y > 400 ? 200 : 600, buttonLabel: 'Ok' }])
        return gen === this.gen
    }

    private async spawn(index: number) {
        this.momentIndex = index
        this.left = this.moment.pages
        this.things = this.moment.things.map(id =>
            createThing(this, THINGS[id], { sing: thing => this.sing(thing), world: obj => this.view.world(obj) }),
        )
        await Promise.all(this.things.map((t, i) => FX.wait(this, i * 180).then(() => t.enter())))
    }

    private play() {
        this.lock = null
        this.coachOn = null
        this.coach.ring(null)
        this.allowed = { photo: true, sound: true }
        this.mode = 'play'
        this.controls(true)
    }

    /** o 1º momento do 1º nível: olhar, sacar a câmera, clicar; sacar o microfone, gravar */
    private async guidedMoment(gen: number) {
        this.guiding = true
        const lesson = (step: Parameters<typeof teach>[2][number]) => this.lesson(gen, [step])
        const center = { balloonX: 640, balloonY: 380, buttonLabel: 'Ok' }

        this.allowed = { photo: false, sound: false }
        this.controls(true)
        await lesson({ text: TEACH.look, ...spot(this.joystick.rect()), ...center })
        if (gen !== this.gen) return
        this.mode = 'play'
        const start = { ...this.view.aim }
        await this.waitFor(() => Math.hypot(this.view.aim.x - start.x, this.view.aim.y - start.y) > 180)
        if (gen !== this.gen) return

        this.allowed = { photo: true, sound: false }
        this.controls(true)
        await lesson({ text: TEACH.pullPhoto, ...spot(this.tools.rect('photo')), ...center })
        if (gen !== this.gen) return
        this.mode = 'play'
        await this.waitFor(() => this.tool === 'photo')
        if (gen !== this.gen) return

        this.lock = 'rainbow'
        this.allowed = { photo: false, sound: false }
        this.controls(true)
        await lesson({ text: TEACH.shoot, ...spot(this.tools.actionRect()), ...center })
        if (gen !== this.gen) return
        this.coachOn = { thing: 'rainbow', tool: 'photo' }
        this.mode = 'play'
        await this.nextKeep()
        if (gen !== this.gen) return

        this.coachOn = null
        this.coach.ring(null)
        await lesson({ text: TEACH.listen, ...spot(this.diary.rect()), balloonY: 300, buttonLabel: 'Próximo' })
        if (gen !== this.gen) return

        this.lock = null
        this.allowed = { photo: false, sound: true }
        this.controls(true)
        await lesson({ text: TEACH.pullSound, ...spot(this.tools.rect('sound')), ...center })
        if (gen !== this.gen) return
        this.mode = 'play'
        await this.waitFor(() => this.tool === 'sound')
        if (gen !== this.gen) return

        this.lock = 'bird'
        this.allowed = { photo: false, sound: false }
        this.controls(true)
        await lesson({ text: TEACH.record, ...spot(this.tools.actionRect()), ...center })
        if (gen !== this.gen) return
        this.coachOn = { thing: 'bird', tool: 'sound' }
        this.mode = 'play'
        await this.nextKeep()
        if (gen !== this.gen) return

        this.coachOn = null
        this.coach.ring(null)
        this.guiding = false
        await lesson({ text: TEACH.yourTurn, ...spot(this.diary.rect()), balloonY: 300, buttonLabel: 'Vamos jogar!' })
        if (gen !== this.gen) return
        void this.nextMoment()
    }

    private nextKeep(): Promise<ThingId> {
        return new Promise(resolve => {
            this.kept = id => {
                this.kept = undefined
                resolve(id)
            }
        })
    }

    private async nextMoment() {
        const gen = ++this.gen
        this.mode = 'intro'
        this.controls(false)
        const old = this.things
        this.things = []
        await Promise.all(old.map(t => t.leave()))
        old.forEach(t => t.destroy())
        if (gen !== this.gen) return

        if (this.momentIndex + 1 >= this.level.moments.length) {
            void this.endLevel()
            return
        }
        await this.spawn(this.momentIndex + 1)
        if (gen !== this.gen) return
        if (!(await this.debut(gen))) return
        this.play()
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.mode
        this.mode = 'guide'
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps)
        if (gen !== this.gen) return
        this.mode = before
    }

    // ───────────────────────────────────────────── guardar

    private onAction() {
        if (this.mode !== 'play' || !this.tool) return
        const view = this.target()
        if (!view || (this.lock && view.def.id !== this.lock)) {
            this.audio.tic()
            this.lens.nudge()
            return
        }
        void this.capture(view, this.tool)
    }

    private async capture(view: ThingView, tool: Tool) {
        const gen = this.gen
        this.mode = 'capture'
        this.controls(false)
        const coached = this.coachOn
        this.coachOn = null
        this.coach.ring(null)
        const beat = view.beat()
        const ok = canKeep(beat, tool)
        let page: Page

        if (tool === 'photo') {
            const key = snapPhoto(this, this.photoKey(this.shots++), this.view.worldBox(FOCUS.w, FOCUS.h), [
                this.bg,
                ...this.things.flatMap(t => t.photoParts()),
            ])
            this.audio.shutter()
            await this.lens.blink()
            if (gen !== this.gen) return
            void FX.flash(this, C.white, { duration: 260, peak: 0.7 })
            this.card = photoCard(this, key)
            page = { tool: 'photo', thing: view.def.id, key }
        } else {
            this.audio.rec()
            await this.tools.record(beat.hear, RECORD_MS)
            if (gen !== this.gen) return
            if (ok) {
                const card = soundCard(this, view.def.label)
                card.dance(true)
                this.card = card
            }
            page = { tool: 'sound', thing: view.def.id }
        }

        if (!ok) {
            void this.jam(view, tool)
            return
        }

        view.react(tool)
        await FX.wait(this, SHOW_MS)
        if (gen !== this.gen) return
        const index = this.pages.length
        const slot = this.diary.slot(index)
        this.audio.whoosh()
        await this.card?.flyTo(slot.x, slot.y, DIARY.w)
        this.card = undefined
        if (gen !== this.gen) return
        this.diary.fill(index, page)
        this.pages.push(page)
        this.audio.pop(index)
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()

        this.things = this.things.filter(t => t !== view)
        void view.leave().then(() => view.destroy())
        this.left -= 1

        if (this.kept) {
            this.kept(view.def.id)
            return
        }
        if (coached) this.coachOn = coached
        if (this.left <= 0) void this.nextMoment()
        else this.play()
    }

    // ───────────────────────────────────────────── erro

    private async jam(view: ThingView, tool: Tool) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.controls(false)
        this.audio.blom()
        const reason = tool === 'photo' ? view.def.noPhoto : view.def.noSound
        this.banner = showBanner(this, reason ?? 'Esse jeito não guarda isso!')
        void this.duda.show('oops', { x: DUDA.oopsX, feet: DUDA.feet, h: DUDA.oopsH })
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.controls(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.mode !== 'play' || this.guiding) return
        const gen = this.gen
        this.mode = 'panel'
        this.controls(false)
        const both = union(this.tools.rect('photo'), this.tools.rect('sound'))
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP.look, ...spot(this.joystick.rect()), balloonX: 640, balloonY: 380, buttonLabel: 'Próximo' },
            { text: HELP.tools, ...spot(both), balloonX: 640, balloonY: 380, buttonLabel: 'Próximo' },
            ...(this.tool ? [{ text: HELP.action, ...spot(this.tools.actionRect()), balloonX: 640, balloonY: 380, buttonLabel: 'Próximo' }] : []),
            { text: HELP.goal, ...spot(this.diary.rect()), balloonY: 300, buttonLabel: 'Continuar' },
        ])
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.controls(false)
        this.edges.clear()
        if (this.tool) this.hold(null)
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.audio.win()
        await FX.wait(this, 500)
        if (gen !== this.gen) return

        const captions = this.level.captions ? (page: Page) => THINGS[page.thing].captions?.[page.tool] ?? null : undefined
        await this.stage.play(
            this.pages,
            this.level.titles,
            () => {
                this.hud.show(false)
                this.diary.show(false)
            },
            captions,
        )
        if (gen !== this.gen) return

        this.mode = 'done'
        void FX.confetti(this, { colors: [C.coral, C.mint, C.butter, C.lilac, C.peach] })
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: last ? 'Que diário lindo!' : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.pages.length, current: this.pages.length },
            ...(!last
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
                              color: C.accent,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private emitCheckpoint() {
        const total = pagesOf(this.level)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.min(100, Math.round((this.pages.length / total) * 100)),
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
