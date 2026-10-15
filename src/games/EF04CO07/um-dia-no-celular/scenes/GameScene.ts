import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEPTH, H, PHONE, W, ZOOM } from '../data/layout'
import { LEVELS, POINTS, guideKey } from '../data/levels'
import { C, CSS, KID_TONE } from '../data/theme'
import { T } from '../data/timing'
import { HELP, NAME, TEACH, TEACH2, TEACH3 } from '../data/words'
import type { Kid, LevelDef, Message, Rect, Sender, Shot, State, Task } from '../types'

import { HEART, paintAvatar, paintShot } from './art'
import { createAudio, type Audio } from './audio'
import { spot, teach, union } from './guide'
import { createHeader, type Header } from './header'
import { createHud, type Hud } from './hud'
import { showData, showOwners } from './intro'
import { createPhone, type Phone } from './phone'
import { createPicker, type Picker } from './picker'
import { createCamera, createChat, createGallery, createHome, createLock, showBanner, type Banner, type Chat, type Home } from './screens'
import { createContact, createDoc, createLamp, createMap, createPet, createPoster, openPermission, openShare } from './screens2'
import { createTalk, type Talk } from './talk'
import { paintSilly, runDemo, runForwardDemo, runPermissionDemo, runTask, type DemoBeat, type Kit } from './tasks'
import { createWorld, type World } from './world'

const GAME_ID = 'um-dia-no-celular'
const NIGHT_CLOCK = '21:00'

class Stale extends Error {}

type Entry = { message: Message; by?: Sender }

const START_HISTORY: Array<[Sender, Entry[]]> = [
    ['turma', [{ message: { from: 'them', text: 'Bom dia, turma!' }, by: 'prof' }]],
    ['caio', [{ message: { from: 'them', text: 'Bora jogar Bichinho mais tarde?' } }]],
    ['mae', [{ message: { from: 'them', text: 'Divirta-se na festa!' } }]],
    ['vovo', [{ message: { from: 'them', text: 'Bom dia, meu amor!' } }]],
]

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private taskIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private demoMode = false
    private barHidden = false
    private leaning: Phaser.Tweens.Tween | null = null
    private leanIds: string[] | null = null

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private world!: World
    private talk!: Talk
    private phone!: Phone
    private picker!: Picker
    private header!: Header
    private hud!: Hud
    private audio!: Audio

    private screen: { destroy(): void } | null = null
    private chatWith: Sender | null = null
    private history = new Map<Sender, Entry[]>()
    private shots: string[] = []
    private shotInfo = new Map<string, Shot>()
    private shotCount = 0
    private banners: Banner[] = []
    private wallpaper: string | null = null
    private kit!: Kit

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.taskIndex = Phaser.Math.Clamp(data?.phase ?? 0, 0, this.level.tasks.length - 1)
        this.state = 'intro'
        this.introduce = false
        this.demoMode = false
        this.barHidden = false
        this.leaning = null
        this.leanIds = null
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.screen = null
        this.chatWith = null
        this.history = new Map(START_HISTORY.map(([who, list]) => [who, [...list]]))
        this.shots = []
        this.shotInfo = new Map()
        this.shotCount = 0
        this.banners = []
        this.wallpaper = null
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.cameras.main.setZoom(1).setScroll(0, 0)
        this.audio = createAudio()
        this.world = createWorld(this)
        this.picker = createPicker(this, () => this.audio.tap())
        this.talk = createTalk(this, this.picker)
        const firstClock = this.level.tasks[this.taskIndex]?.clock ?? this.level.demo.clock
        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        this.phone = createPhone(this, this.introduce ? this.level.demo.clock : firstClock)
        this.header = createHeader(this)
        this.hud = createHud(this, {
            level: this.level.level,
            phases: this.level.tasks.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.kit = this.makeKit()

        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()
        void this.begin()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.banners.forEach(b => b.destroy())
        this.banners = []
        this.picker?.destroy()
        this.screen?.destroy()
        this.screen = null
        this.talk?.destroy()
        this.hud?.destroy()
        this.header?.destroy()
        this.phone?.destroy()
        this.world?.destroy()
        this.audio?.destroy()
        ;[...this.shots, 'cel-photo-silly', 'cel-photo-intro', 'cel-vf', 'cel-wall', 'cel-photo-n2-cake', 'cel-photo-n2-nina', 'cel-photo-n2-bia'].forEach(k => {
            if (this.textures.exists(k)) this.textures.remove(k)
        })
        this.shots = []
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── a ponte que as tarefas usam

    private guard = <T>(value: Promise<T> | T): Promise<T> => {
        const gen = this.gen
        return Promise.resolve(value).then(v => {
            if (gen !== this.gen) throw new Stale()
            return v
        })
    }

    private async swap<T extends { layer: Phaser.GameObjects.Container; dark: boolean; destroy(): void }>(make: () => T): Promise<T> {
        this.chatWith = null
        const next = await this.phone.swap(make)
        this.screen = next
        return next
    }

    private makeKit(): Kit {
        return {
            scene: this,
            world: this.world,
            talk: this.talk,
            phone: this.phone,
            picker: this.picker,
            header: this.header,
            audio: this.audio,
            guard: v => this.guard(v),
            wait: ms => this.guard(FX.wait(this, ms)),
            press: async ids => {
                const pending = this.picker.wait(ids, !this.demoMode)
                if (this.demoMode) await this.picker.ghost(ids[0])
                else {
                    this.hud.setHelpEnabled(true)
                    const rects = ids.map(i => this.picker.rect(i))
                    if (rects.every(r => r && r.w < ZOOM.small && r.h < ZOOM.small)) this.lean(ids)
                }
                const id = await this.guard(pending)
                this.hud.setHelpEnabled(false)
                if (this.leanIds) this.lean(null)
                return id
            },
            choose: async ids => {
                this.world.focus(true)
                this.topBar(false)
                const pending = this.picker.wait(ids, true)
                const taught = `${guideKey(this.level.level)}-choice`
                if (!this.demoMode && !this.registry.get(taught)) {
                    this.registry.set(taught, true)
                    const rects = ids.map(id => this.picker.rect(id)).filter((r): r is Rect => r !== null)
                    await this.guard(FX.wait(this, T.short))
                    await this.guard(teach(this, taught, [{ text: TEACH.choose, ...spot(union(...rects), 12), balloonX: 560, balloonY: 330, buttonLabel: 'Ok' }]))
                }
                if (!this.demoMode) this.lean(ids)
                const id = await this.guard(pending)
                this.lean(null)
                this.world.focus(false)
                this.topBar(true)
                return id
            },
            order: (sender, line) => this.header.setOrder(sender, line),
            say: (who, line) => {
                const head = this.world.headTop()
                return this.talk.say(NAME[who], KID_TONE[who], line, { x: head.x + 36, y: head.y + 16 })
            },
            notify: async (sender, line, alert = false, tap = false) => {
                if (alert) this.audio.alert()
                else this.audio.plim()
                void this.phone.nudge()
                const below = [...this.banners]
                const banner = await showBanner(this, this.picker, sender, line, alert, tap)
                below.forEach(b => b.box.active && b.box.setVisible(false))
                this.banners.push(banner)
                return {
                    hide: async () => {
                        this.banners = this.banners.filter(b => b !== banner)
                        await banner.hide()
                    },
                }
            },
            home: wallpaper => {
                if (wallpaper !== undefined) this.wallpaper = wallpaper
                return this.swap(() => createHome(this, this.picker, this.level.apps, this.phone.clock(), this.level.day, this.wallpaper))
            },
            chat: async contact => {
                const chat = await this.swap(() => createChat(this, this.picker, contact, this.history.get(contact) ?? []))
                this.chatWith = contact
                return chat
            },
            camera: shot => this.swap(() => createCamera(this, this.picker, shot, this.shots[this.shots.length - 1] ?? null)),
            gallery: (photo, actions) => this.swap(() => createGallery(this, this.picker, photo, actions)),
            share: (dest, owner) => openShare(this, this.picker, dest, owner),
            contact: who => this.swap(() => createContact(this, this.picker, who)),
            doc: () => this.swap(() => createDoc(this, this.picker)),
            permission: (app, line) => openPermission(this, this.picker, app, line),
            lamp: () => this.swap(() => createLamp(this, this.picker)),
            map: () => this.swap(() => createMap(this)),
            poster: () => this.swap(() => createPoster(this, this.picker)),
            pet: () => this.swap(() => createPet(this, this.picker)),
            stock: (shot, key) => {
                paintShot(this, key, shot)
                if (!this.shots.includes(key)) this.shots.push(key)
                this.shotInfo.set(key, shot)
                return key
            },
            post: async (contact, message, by) => {
                const list = this.history.get(contact) ?? []
                list.push({ message, by })
                this.history.set(contact, list)
                if (this.chatWith !== contact || !this.screen) return
                if (message.from === 'me') this.audio.send()
                else this.audio.receive()
                await (this.screen as Chat).push(message, by)
            },
            shoot: async (camera, shot) => {
                this.audio.shutter()
                const key = this.snap(shot)
                await camera.flash()
                camera.setThumb(key)
                return key
            },
            photos: () => [...this.shots],
            shotOf: photo => this.shotInfo.get(photo) ?? null,
            forget: photo => {
                this.shots = this.shots.filter(s => s !== photo)
            },
            silly: () => {
                const key = paintSilly(this)
                if (!this.shots.includes(key)) this.shots.unshift(key)
                return key
            },
        }
    }

    private snap(shot: Shot): string {
        this.shotCount += 1
        const key = `cel-photo-${this.shotCount}`
        paintShot(this, key, shot)
        this.shots.push(key)
        this.shotInfo.set(key, shot)
        return key
    }

    // ───────────────────────────────────────────── a partida

    private async begin() {
        try {
            if (this.introduce) await this.intro()
            else {
                const first = this.level.tasks[this.taskIndex]
                await this.guard(this.world.place(first.place, first.night, true))
                await this.guard(this.kit.home(null))
            }
            this.state = 'play'
            while (this.taskIndex < this.level.tasks.length) {
                const task = this.level.tasks[this.taskIndex]
                const outcome = await this.playTask(task)
                if (outcome === 'fail') {
                    await this.guard(FX.wait(this, T.fail))
                    this.lose()
                    return
                }
                await this.succeed()
                this.taskIndex += 1
                await this.tidy()
            }
            await this.finale()
        } catch (error) {
            if (error instanceof Stale) return
            throw error
        }
    }

    private async playTask(task: Task) {
        this.hud.setPhase(this.taskIndex)
        this.phone.setClock(task.clock)
        const atHome = this.screen && 'iconRect' in this.screen
        if (!atHome) await this.guard(this.kit.home(this.wallpaper))
        else (this.screen as Home).setClock(task.clock)
        await this.guard(this.world.place(task.place, task.night))
        await this.guard(FX.wait(this, T.short))
        return runTask(this.kit, task.id)
    }

    private async succeed() {
        this.audio.good()
        this.hits += 1
        this.done += 1
        this.score += POINTS
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await this.guard(this.hud.celebrate(this.taskIndex))
        await this.guard(FX.wait(this, T.next))
        const next = this.talk.next()
        await this.kit.press([next])
        this.talk.clear()
    }

    private async tidy() {
        this.header.clearOrder()
        await this.guard(this.talk.hide())
        this.talk.clear()
        await Promise.all(this.banners.map(b => b.hide()))
        this.banners = []
        await this.guard(this.world.leave('left'))
        await this.guard(this.world.hideRemote())
        this.world.clearProps()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.picker.cancel()
        this.hud.setHelpEnabled(false)
        this.topBar(true)
        this.lean(null)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── abertura

    private async intro() {
        this.state = 'intro'
        const key = guideKey(this.level.level)
        const demo = this.level.demo
        await this.guard(this.world.place(demo.place, false, true))
        if (demo.kind === 'photo') this.world.prop('drawing', 708, 342, 112)
        this.phone.powerOff()
        const home = await this.guard(this.kit.home(null))
        home.layer.setAlpha(1)
        const phone = this.phone.rect()
        const side = { balloonX: 400, balloonY: 300 }
        const opening = demo.kind === 'photo' ? TEACH.phone : demo.kind === 'forward' ? TEACH2.day : TEACH3.day

        await this.guard(FX.wait(this, T.beat))
        await this.guard(teach(this, `${key}-1`, [{ text: opening, ...spot(phone, 6), ...side, buttonLabel: TEACH.phoneButton }]))
        this.audio.power()
        await this.guard(this.phone.powerOn())
        await this.guard(home.popIcons())
        await this.guard(FX.wait(this, T.long))
        if (demo.kind === 'forward') return this.introForward(key, phone, side)
        if (demo.kind === 'permission') return this.introPermission(key, phone, side)

        await this.guard(teach(this, `${key}-2`, [{ text: TEACH.data, ...spot(phone, 6), ...side, buttonLabel: 'Ver' }]))
        await this.guard(showData(this, home, this.audio))
        await this.guard(FX.wait(this, T.beat))

        await this.guard(teach(this, `${key}-3`, [{ text: TEACH.friends, ...spot(phone, 6), ...side, buttonLabel: 'Ver' }]))
        const owners = await this.guard(showOwners(this, home, this.audio))
        await this.guard(FX.wait(this, 2200))
        await this.guard(owners.clear())
        await this.guard(FX.wait(this, T.short))

        await this.guard(teach(this, `${key}-4`, [{ text: TEACH.asks, ...spot(phone, 6), ...side, buttonLabel: 'Ver' }]))
        this.demoMode = true
        this.picker.setAuto(true)
        await runDemo(this.kit, beat => this.narrate(beat))
        this.demoMode = false
        this.picker.setAuto(false)

        this.header.clearOrder()
        await this.guard(this.kit.home(null))
        this.world.clearProps()
        await this.guard(FX.wait(this, T.beat))
        await this.guard(teach(this, `${key}-care`, [{ text: TEACH.care, ...spot(phone, 6), ...side, buttonLabel: 'Ok' }]))
        await this.guard(teach(this, `${key}-5`, [{ text: TEACH.go, balloonX: 400, balloonY: 330, buttonLabel: TEACH.goButton }]))
    }

    private async introForward(key: string, phone: Rect, side: { balloonX: number; balloonY: number }) {
        await this.guard(teach(this, `${key}-2`, [{ text: TEACH2.forward, ...spot(phone, 6), ...side, buttonLabel: 'Ver' }]))
        await this.demo(() => runForwardDemo(this.kit, beat => this.narrate(beat)))
        await this.guard(teach(this, `${key}-care`, [{ text: TEACH2.care, ...spot(phone, 6), ...side, buttonLabel: 'Ok' }]))
        await this.guard(teach(this, `${key}-5`, [{ text: TEACH.go, balloonX: 400, balloonY: 330, buttonLabel: TEACH.goButton }]))
    }

    private async introPermission(key: string, phone: Rect, side: { balloonX: number; balloonY: number }) {
        await this.guard(teach(this, `${key}-2`, [{ text: TEACH3.apps, ...spot(phone, 6), ...side, buttonLabel: 'Ver' }]))
        await this.demo(() => runPermissionDemo(this.kit, beat => this.narrate(beat)))
        await this.guard(teach(this, `${key}-5`, [{ text: TEACH.go, balloonX: 400, balloonY: 330, buttonLabel: TEACH.goButton }]))
    }

    private async demo(run: () => Promise<void>) {
        this.demoMode = true
        this.picker.setAuto(true)
        await run()
        this.demoMode = false
        this.picker.setAuto(false)
        this.header.clearOrder()
        await Promise.all(this.banners.map(b => b.hide()))
        this.banners = []
        await this.guard(this.kit.home(null))
        await this.guard(FX.wait(this, T.beat))
    }

    private narrate(beat: DemoBeat): Promise<void> {
        const key = `${guideKey(this.level.level)}-demo-${beat}`
        const screen = this.phone.screenRect()
        const side = { balloonX: 400, balloonY: 300 }
        const banner = this.picker.rect('banner')
        const drawing = { x: 708, y: 342, w: 140, h: 120 }
        const kind = this.level.demo.kind
        const lines: Record<DemoBeat, string> = {
            banner: kind === 'forward' ? TEACH2.demoBanner : TEACH.demoBanner,
            chat: TEACH.demoChat,
            camera: TEACH.demoCamera,
            gallery: TEACH2.demoGallery,
            dialog: TEACH3.demoDialog,
            done: kind === 'forward' ? TEACH2.demoDone : kind === 'permission' ? TEACH3.demoDone : TEACH.demoDone,
        }
        const area = beat === 'banner' ? (banner ?? screen) : beat === 'camera' ? union(drawing, screen) : screen
        const step = { text: lines[beat], ...spot(area, 8), ...(beat === 'camera' ? { balloonX: 400, balloonY: 560 } : side) }
        return teach(this, key, [{ ...step, buttonLabel: beat === 'done' ? 'Próximo' : 'Ver' }])
    }

    // ───────────────────────────────────────────── ajuda

    private topBar(shown: boolean) {
        this.barHidden = !shown
        this.header.setShown(shown)
        this.hud.setShown(shown)
    }

    private lean(ids: string[] | null) {
        const cam = this.cameras.main
        const target = ids ? this.leanFrame(ids) : null
        if (ids && !target) return
        this.leaning?.stop()
        this.leanIds = target ? ids : null
        this.phone.showHand(!target)
        const zoom = target?.zoom ?? 1
        const scrollX = target ? target.x - W / 2 : 0
        const scrollY = target ? target.y - H / 2 : 0
        this.leaning = this.tweens.add({ targets: cam, zoom, scrollX, scrollY, duration: T.lean, ease: 'Sine.easeInOut' })
    }

    private leanFrame(ids: string[]) {
        const screen = this.phone.screenRect()
        const slack = 16
        const inside = (r: Rect) =>
            r.x - r.w / 2 >= screen.x - screen.w / 2 - slack &&
            r.x + r.w / 2 <= screen.x + screen.w / 2 + slack &&
            r.y - r.h / 2 >= screen.y - screen.h / 2 - slack &&
            r.y + r.h / 2 <= screen.y + screen.h / 2 + slack
        const rects = ids.map(id => this.picker.rect(id)).filter((r): r is Rect => r !== null)
        if (rects.length === 0 || !rects.every(inside)) return null
        const wanted = union(...rects)
        const screenTop = screen.y - screen.h / 2
        const top = Math.max(screenTop, wanted.y - wanted.h / 2 - ZOOM.context)
        const bottom = wanted.y + wanted.h / 2 + 12
        const frame = union(
            { x: screen.x, y: (top + bottom) / 2, w: screen.w, h: bottom - top },
            ...this.banners.filter(b => b.box.active && b.box.visible).map(b => b.rect),
        )
        const zoom = Phaser.Math.Clamp(Math.min(H / (frame.h + ZOOM.pad * 2), W / (frame.w + ZOOM.pad * 2)), 1, ZOOM.max)
        const halfW = W / (2 * zoom)
        const halfH = H / (2 * zoom)
        return {
            zoom,
            x: Phaser.Math.Clamp(frame.x, halfW, W - halfW),
            y: Phaser.Math.Clamp(frame.y, halfH, H - halfH),
        }
    }

    private async explain() {
        if (this.state !== 'play' || this.picker.waiting().length === 0) return
        this.state = 'help'
        this.hud.setHelpEnabled(false)
        const choosing = this.barHidden
        const leaned = this.leanIds
        if (leaned) this.lean(null)
        if (choosing) this.topBar(true)
        if (choosing || leaned) await FX.wait(this, T.lean)
        const area = this.world.who() ? this.world.personRect() : this.world.remoteRect()
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP.order, ...spot(this.header.orderRect(), 4), balloonX: 400, balloonY: 300, buttonLabel: 'Próximo' },
            { text: HELP.care, ...spot(union(area, this.phone.rect()), 4), balloonX: 640, balloonY: 200, buttonLabel: 'Continuar' },
        ])
        if (this.state !== 'help') return
        this.state = 'play'
        if (choosing) this.topBar(false)
        else this.hud.setHelpEnabled(true)
        if (leaned) this.lean(leaned)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async finale() {
        this.state = 'finale'
        this.hud.setHelpEnabled(false)
        await this.guard(this.world.place('quarto', true))
        this.phone.setClock(NIGHT_CLOCK)
        await this.swap(() => createLock(this, NIGHT_CLOCK))
        this.audio.win()
        const friends: Kid[] = ['nina', 'bia', 'rafa', 'caio']
        const left = PHONE.cx - PHONE.w / 2
        const spots = [
            { x: left - 90, y: 170 },
            { x: left - 150, y: 320 },
            { x: left - 90, y: 470 },
            { x: left - 170, y: 610 },
        ]
        const faces = friends.map((who, i) => {
            const ring = this.add.circle(0, 0, 44, C.white)
            const face = this.add.image(0, 0, paintAvatar(this, who)).setDisplaySize(80, 80)
            const heart = this.add.image(30, -30, HEART).setTint(C.coral).setScale(0.55)
            return this.add
                .container(spots[i].x, spots[i].y, [ring, face, heart])
                .setDepth(DEPTH.fly)
                .setScale(0)
        })
        await this.guard(
            FX.all(
                ...faces.map((face, i) =>
                    FX.wait(this, i * 180).then(() => {
                        this.audio.pop()
                        return FX.to(this, face, { scale: 1 }, { duration: 380, ease: 'Back.easeOut' })
                    }),
                ),
            ),
        )
        faces.forEach((face, i) => FX.float(this, face, { amount: 8, duration: 1500, delay: i * 120 }))
        void FX.confetti(this, { colors: [C.accent, C.mint, C.coral, C.butter, C.lilac] })
        await this.guard(FX.wait(this, 2200))
        this.endLevel()
    }

    private endLevel() {
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
            panelColor: C.paper,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.accent,
            messageColor: CSS.inkSoft,
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.tasks.length, current: this.level.tasks.length },
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
            progress: Math.min(100, Math.round((this.done / this.level.tasks.length) * 100)),
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
