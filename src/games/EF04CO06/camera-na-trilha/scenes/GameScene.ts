import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CAMERA, DEPTH, FRAME, HEADER, LIGHT, VIDEO } from '../data/layout'
import { LEVELS, POINTS, guideKey, ordersOf } from '../data/levels'
import { MAPS, buildWalk, frameAt, inEllipse, spotOf, within, type Walk } from '../data/maps'
import { SUBJECTS } from '../data/subjects'
import { C, CSS } from '../data/theme'
import { HELP, SAY, TEACH, TEACH2, TEACH3 } from '../data/words'
import type { Capture, Circle, Fault, LevelDef, MapDef, Mode, Order, Rect, Spot, State, Tool, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createCameraApp, type CameraApp } from './cameraApp'
import { filmCard, photoCard, snap, type Card } from './capture'
import { createDarkness, type Darkness } from './darkness'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createHero, type Hero } from './hero'
import { createHud, type Hud } from './hud'
import { createJoystick, type Joystick } from './joystick'
import { createMinimap, type Minimap } from './minimap'
import { openMural } from './mural'
import { createOrderCard, type OrderCard } from './order'
import { createSubjects, type SubjectView } from './subjects'
import { createView, type View } from './view'
import { createViewfinder, type Viewfinder } from './viewfinder'
import { createWorld, type World } from './world'

const GAME_ID = 'camera-na-trilha'
const ERROR_MS = 1900
const CHEER_MS = 900
const FINALE_MS = 1300
const FILM_HOLD = 1100
const ZOOM_PACE = 0.6

interface Recording {
    gen: number
    tracked: SubjectView | null
    frames: string[]
    elapsed: number
    lost: number
    finish: (lost: boolean) => void
}

interface Shot {
    subject: SubjectView | null
    card: Card | null
    dark: boolean
    washed: boolean
    zoom: boolean
}

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private map!: MapDef
    private phaseIndex = 0
    private orderIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private shots = 0
    private focused = false
    private light = false
    private zoomed = false
    private recording: Recording | null = null
    private album: Capture[] = []
    private headerDy = 0
    private headerHidden = false
    private moveMs = 0
    private stillMs = 0

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private walk!: Walk
    private world!: World
    private darkness: Darkness | null = null
    private subjects: SubjectView[] = []
    private hero!: Hero
    private frame!: Viewfinder
    private joystick!: Joystick
    private app!: CameraApp
    private order!: OrderCard
    private minimap!: Minimap
    private hud!: Hud
    private header!: Header
    private banner!: Banner
    private audio!: Audio
    private loose: Card[] = []

    private unsubPlatform?: () => void

    private get current(): Order {
        return this.level.phases[this.phaseIndex].orders[this.orderIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.map = MAPS[this.level.map]
        this.phaseIndex = 0
        this.orderIndex = 0
        this.state = 'intro'
        this.introduce = false
        this.shots = 0
        this.focused = false
        this.light = false
        this.zoomed = false
        this.recording = null
        this.album = []
        this.headerDy = 0
        this.headerHidden = false
        this.moveMs = 0
        this.stillMs = 0
        this.darkness = null
        this.subjects = []
        this.loose = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.view = createView(this, this.map.w, this.map.h)
        this.walk = buildWalk(this.map)
        this.audio = createAudio()
        this.world = createWorld(this, this.view, this.map)
        this.subjects = createSubjects(this, this.view, this.map)
        this.hero = createHero(this, this.view, this.map.start, this.map.startFace)
        this.darkness = createDarkness(this, this.view, this.map)
        this.frame = createViewfinder(this, this.view)
        this.joystick = createJoystick(this)
        this.app = createCameraApp(this, {
            tools: this.level.tools,
            onToggle: () => this.onToggle(),
            onShutter: () => this.onShutter(),
            onTool: tool => this.onTool(tool),
        })
        this.header = createHeader(this)
        this.order = createOrderCard(this)
        this.minimap = createMinimap(this, this.map)
        this.banner = createBanner(this)
        this.hud = createHud(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.controls(false)

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
        this.view.snap(this.lookAt())
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.recording = null
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.loose.forEach(c => c.destroy())
        this.loose = []
        this.hud?.destroy()
        this.header?.destroy()
        this.banner?.destroy()
        this.minimap?.destroy()
        this.order?.destroy()
        this.app?.destroy()
        this.joystick?.destroy()
        this.frame?.destroy()
        this.darkness?.destroy()
        this.hero?.destroy()
        this.subjects.forEach(s => s.destroy())
        this.subjects = []
        this.world?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        this.album.flatMap(c => c.keys).forEach(k => {
            if (this.textures.exists(k)) this.textures.remove(k)
        })
        this.album = []
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(_time: number, deltaMs: number) {
        if (!this.hero) return
        const delta = Math.min(deltaMs, 50)
        this.subjects.forEach(s => s.update(delta))
        this.world.update(delta, this.hero.rect())
        const walking = this.state === 'play' || (this.state === 'capture' && this.recording !== null && this.recording.gen === this.gen)
        const input = walking ? this.joystick.vector() : { x: 0, y: 0 }
        const pace = this.zoomed ? ZOOM_PACE : 1
        this.hero.update(delta, { x: input.x * pace, y: input.y * pace }, (x, y) => this.walk.free(x, y))
        const rect = this.frameRect()
        const focused = !!this.inFrame(rect)
        if (focused && !this.focused && this.state === 'play') this.audio.focus()
        this.focused = focused
        this.frame.place(rect, focused)
        this.view.update(delta, this.lookAt())
        this.lightUp(rect)
        this.slideHeader(delta, walking)
        this.minimap.update(this.hero.pos, this.hero.face)
        if (this.recording) this.tickRecording(delta, rect)
    }

    private slideHeader(delta: number, walking: boolean) {
        if (walking && this.hero.moving) {
            this.moveMs += delta
            this.stillMs = 0
        } else {
            this.stillMs += delta
            this.moveMs = 0
        }
        if (!walking || this.stillMs > HEADER.showAfter) this.headerHidden = false
        else if (this.moveMs > HEADER.hideAfter) this.headerHidden = true
        const away = -(HEADER.h + 18)
        const target = this.headerHidden ? away : 0
        if (Math.abs(target - this.headerDy) < 0.2 && this.headerDy === target) return
        this.headerDy += (target - this.headerDy) * (1 - Math.exp(-delta / HEADER.ease))
        if (Math.abs(target - this.headerDy) < 0.2) this.headerDy = target
        const alpha = 1 - 0.4 * (this.headerDy / away)
        this.header.setOffset(this.headerDy, alpha)
        this.hud.setOffset(this.headerDy, alpha)
        this.order.setCompact(this.headerDy / away)
    }

    private frameRect(): Rect {
        return frameAt(this.hero.pos, this.hero.face, this.zoomed)
    }

    private inFrame(rect: Rect): SubjectView | null {
        return this.subjects.find(s => within(rect, s.focus())) ?? null
    }

    private lookAt(): Vec {
        const rect = this.frameRect()
        if (this.zoomed) return { x: rect.x, y: rect.y }
        const body = { x: this.hero.pos.x, y: this.hero.pos.y - 60 }
        return { x: body.x + (rect.x - body.x) * CAMERA.lookAhead, y: body.y + (rect.y - body.y) * CAMERA.lookAhead }
    }

    private beam(rect: Rect): Circle | null {
        return this.light ? { x: rect.x, y: rect.y, r: rect.w * LIGHT.beam } : null
    }

    private lightsNow(rect: Rect): Circle[] {
        const beam = this.beam(rect)
        return [
            ...(this.map.lights ?? []),
            ...(this.map.sparks ?? []),
            { x: this.hero.pos.x, y: this.hero.pos.y - 60, r: this.light ? LIGHT.auraOn : LIGHT.aura },
            ...(beam ? [beam] : []),
            ...this.subjects.flatMap(s => s.glow()),
        ]
    }

    private lightUp(rect: Rect) {
        const beam = this.beam(rect)
        this.subjects.forEach(s => {
            if (!s.def.glows) return
            const at = s.focus()
            s.setWashed(!!beam && Math.hypot(at.x - beam.x, at.y - beam.y) < beam.r * 0.95)
        })
        this.darkness?.update(this.lightsNow(rect))
    }

    private inDark(at: Vec) {
        const dark = this.map.dark
        if (!dark) return false
        if (!dark.areas) return true
        return dark.areas.some(a => inEllipse(a, at.x, at.y))
    }

    private isDark(subject: SubjectView | null, rect: Rect) {
        if (!subject || subject.def.glows) return false
        const at = subject.focus()
        if (!this.inDark(at)) return false
        return !this.lightsNow(rect).some(l => Math.hypot(at.x - l.x, at.y - l.y) < l.r * 0.8)
    }

    private controls(on: boolean) {
        this.joystick.setEnabled(on)
        this.app.setEnabled(on, on)
        this.hud.setHelpEnabled(on)
    }

    private ui(on: boolean) {
        this.header.visible(on)
        this.hud.visible(on)
        this.order.visible(on)
        this.minimap.visible(on)
        this.app.visible(on)
        this.joystick.visible(on)
        this.frame.show(on)
    }

    private play() {
        this.state = 'play'
        this.controls(true)
    }

    // ───────────────────────────────────────────── nível

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.controls(false)
        const first = this.introduce && this.level.level === 1
        if (!first) this.app.setMode(this.level.startMode)
        if (first) {
            this.ui(false)
            this.hero.turn({ x: 0, y: 1 })
            const head = { x: this.hero.pos.x, y: this.hero.pos.y - 34 }
            await this.view.close(true, head)
            if (gen !== this.gen) return
            const teo = this.view.toScreenRect(this.hero.rect())
            await this.lesson(gen, [
                { text: TEACH.hello, ...spot(teo, 10), balloonY: 586, buttonLabel: 'Próximo' },
                { text: TEACH.fair, ...spot(teo, 10), balloonY: 586, buttonLabel: 'Ver' },
            ])
            if (gen !== this.gen) return
            await this.view.close(false, this.lookAt())
            if (gen !== this.gen) return
            this.ui(true)
            await this.demo(gen)
            if (gen !== this.gen) return
            const ahead = { x: this.hero.pos.x + 220, y: this.hero.pos.y }
            const stroll = this.walk.route(this.hero.pos, ahead) ?? []
            await FX.all(this.joystick.nudge({ x: 1, y: 0 }, 1100), this.hero.drive(stroll))
            if (gen !== this.gen) return
            await this.lesson(gen, [
                { text: TEACH.walk, ...spot(this.joystick.rect()), buttonLabel: 'Próximo' },
                { text: TEACH.check, ...spot(this.app.modeRect(), 8), balloonY: 236, buttonLabel: 'Vamos começar!' },
            ])
            if (gen !== this.gen) return
        } else {
            this.ui(true)
            await FX.wait(this, 500)
            if (gen !== this.gen) return
            if (this.introduce && this.level.level === 2) await this.teachLight(gen)
            if (this.introduce && this.level.level === 3) await this.teachZoom(gen)
            if (gen !== this.gen) return
        }
        this.hud.setPhase(0)
        await this.order.show(this.current)
        if (gen !== this.gen) return
        this.audio.pop()
        this.play()
    }

    private async demo(gen: number) {
        for (let i = 0; i < this.level.demo.length; i++) {
            const order = this.level.demo[i]
            this.audio.whoosh()
            await this.order.show(order)
            if (gen !== this.gen) return
            if (i === 0) {
                await this.lesson(gen, [{ text: TEACH.read, ...spot(this.order.rect()), buttonLabel: 'Ver' }])
                if (gen !== this.gen) return
            }
            if (this.app.mode !== order.mode) {
                await this.lesson(gen, [{ text: TEACH.toVideo, ...spot(this.app.modeRect(), 8), balloonY: 236, buttonLabel: 'Ver' }])
                if (gen !== this.gen) return
                await this.app.press('mode')
                this.setMode(order.mode)
                await FX.wait(this, 400)
                if (gen !== this.gen) return
            }
            if (!(await this.goTo(gen, spotOf(this.map, order.subject)))) return
            if (order.mode === 'photo') {
                await this.lesson(gen, [{ text: TEACH.photo, ...spot(this.app.shutterRect(), 8), balloonY: 236, buttonLabel: 'Ver' }])
                if (gen !== this.gen) return
            }
            await this.app.press('shutter')
            const shot = order.mode === 'photo' ? await this.takePhoto() : await this.takeVideo(gen)
            if (gen !== this.gen) return
            if (!shot.card) continue
            await this.stick(shot.card, order.mode === 'video' ? FILM_HOLD : 0)
            if (gen !== this.gen) return
            shot.subject?.react()
            this.audio.good()
            if (order.mode === 'video') {
                await this.lesson(gen, [{ text: TEACH.video, ...spot(this.order.rect()), buttonLabel: 'Próximo' }])
                if (gen !== this.gen) return
            } else {
                await FX.wait(this, 1100)
                if (gen !== this.gen) return
            }
            await this.order.leave()
            if (gen !== this.gen) return
        }
    }

    private async goTo(gen: number, place: Spot) {
        const route = this.walk.route(this.hero.pos, place.view) ?? [place.view]
        await this.hero.drive(route)
        if (gen !== this.gen) return false
        this.hero.turn(place.face)
        await FX.wait(this, 450)
        return gen === this.gen
    }

    private cardRect(card: Card): Rect {
        const b = card.box.getBounds()
        return { x: b.centerX, y: b.centerY, w: b.width + 16, h: b.height + 16 }
    }

    private async demoShot(gen: number, text: string, button: string) {
        await this.app.press('shutter')
        const shot = await this.takePhoto()
        if (gen !== this.gen || !shot.card) return false
        await FX.wait(this, 350)
        if (gen !== this.gen) return false
        const card = shot.card
        await this.lesson(gen, [{ text, ...spot(this.cardRect(card)), balloonY: 600, buttonLabel: button }])
        if (gen !== this.gen) return false
        this.loose = this.loose.filter(c => c !== card)
        await card.drop()
        return gen === this.gen
    }

    private async useTool(gen: number, tool: Tool, on: boolean) {
        await this.app.press(tool)
        if (tool === 'light') this.setLight(on)
        else this.setZoom(on)
        await FX.wait(this, 700)
        return gen === this.gen
    }

    private async teachLight(gen: number) {
        await this.lesson(gen, [{ text: TEACH2.dark, balloonY: 330, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        if (!(await this.goTo(gen, spotOf(this.map, this.level.demo[0].subject)))) return
        if (!(await this.demoShot(gen, TEACH2.black, 'Ver'))) return
        if (!(await this.useTool(gen, 'light', true))) return
        if (!(await this.demoShot(gen, TEACH2.lit, 'Próximo'))) return
        await this.lesson(gen, [{ text: TEACH2.key, ...spot(this.app.toolRect('light'), 8), balloonY: 236, buttonLabel: 'Vamos começar!' }])
    }

    private async teachGlow(gen: number) {
        const place = spotOf(this.map, this.level.demo[1].subject)
        if (!(await this.goTo(gen, place))) return
        if (this.light && !(await this.useTool(gen, 'light', false))) return
        const at = this.view.toScreenRect({ x: place.at.x, y: place.at.y, w: 170, h: 150 })
        await this.lesson(gen, [{ text: TEACH2.glow, ...spot(at), balloonY: 236, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        if (!(await this.useTool(gen, 'light', true))) return
        if (!(await this.demoShot(gen, TEACH2.washed, 'Ver'))) return
        if (!(await this.useTool(gen, 'light', false))) return
        await this.demoShot(gen, TEACH2.shine, 'Vamos lá!')
    }

    private async teachZoom(gen: number) {
        await this.lesson(gen, [{ text: TEACH3.small, balloonY: 330, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        if (!(await this.goTo(gen, spotOf(this.map, this.level.demo[0].subject)))) return
        if (!(await this.demoShot(gen, TEACH3.tiny, 'Ver'))) return
        if (!(await this.useTool(gen, 'zoom', true))) return
        if (!(await this.demoShot(gen, TEACH3.close, 'Próximo'))) return
        if (!(await this.goTo(gen, spotOf(this.map, this.level.demo[1].subject)))) return
        const frame = this.view.toScreenRect(this.frameRect())
        await this.lesson(gen, [{ text: TEACH3.big, ...spot(frame, 10), balloonY: 600, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        if (!(await this.demoShot(gen, TEACH3.cut, 'Ver'))) return
        if (!(await this.useTool(gen, 'zoom', false))) return
        if (!(await this.demoShot(gen, TEACH3.whole, 'Próximo'))) return
        await this.lesson(gen, [{ text: TEACH3.key, ...spot(this.app.toolRect('zoom'), 8), balloonY: 236, buttonLabel: 'Vamos começar!' }])
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.state
        this.state = 'guide'
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps)
        if (gen !== this.gen) return
        this.state = before
    }

    // ───────────────────────────────────────────── o app da câmera

    private setMode(mode: Mode) {
        this.app.setMode(mode)
        this.audio.toggle()
    }

    private setLight(on: boolean) {
        this.light = on
        this.app.setTool('light', on)
        this.audio.light(on)
    }

    private setZoom(on: boolean) {
        this.zoomed = on
        this.app.setTool('zoom', on)
        this.audio.zoom(on)
        void this.view.zoomTo(on ? 1 / FRAME.zoom : 1)
    }

    private onToggle() {
        if (this.state !== 'play') return
        this.setMode(this.app.mode === 'photo' ? 'video' : 'photo')
    }

    private onTool(tool: Tool) {
        if (this.state !== 'play') return
        if (tool === 'light') this.setLight(!this.light)
        else this.setZoom(!this.zoomed)
    }

    private onShutter() {
        if (this.state !== 'play') return
        if (this.app.mode === 'photo') void this.shootPhoto()
        else void this.shootVideo()
    }

    private snapNow(rect: Rect, key: string) {
        const parts = [...this.world.parts, ...this.subjects.flatMap(s => s.parts), ...this.hero.parts]
        if (this.darkness) parts.push(this.darkness.part)
        return snap(this, key, rect, parts)
    }

    private context(rect: Rect, subject: SubjectView | null) {
        return { dark: this.isDark(subject, rect), washed: !!subject?.washed, zoom: this.zoomed }
    }

    private async takePhoto(): Promise<Shot> {
        const rect = this.frameRect()
        const subject = this.inFrame(rect)
        const context = this.context(rect, subject)
        const key = this.snapNow(rect, `cnt-shot-${this.shots++}`)
        this.hero.raise(true)
        this.audio.shutter()
        void this.frame.blink()
        void FX.flash(this, C.white, { duration: 240, peak: 0.45 })
        const card = photoCard(this, key, this.view.toScreenRect(rect))
        this.loose.push(card)
        await FX.wait(this, 420)
        this.hero.raise(false)
        return { subject, card, ...context }
    }

    private takeVideo(gen: number): Promise<Shot & { lost: boolean }> {
        const rect = this.frameRect()
        const tracked = this.inFrame(rect)
        const context = this.context(rect, tracked)
        this.hero.raise(true)
        this.frame.recording(true)
        this.app.progress(0)
        this.audio.recStart()
        return new Promise(resolve => {
            const rec: Recording = {
                gen,
                tracked,
                frames: [],
                elapsed: 0,
                lost: 0,
                finish: lost => {
                    this.recording = null
                    this.frame.recording(false)
                    this.app.progress(null)
                    this.hero.raise(false)
                    if (lost || gen !== this.gen) {
                        rec.frames.forEach(k => {
                            if (this.textures.exists(k)) this.textures.remove(k)
                        })
                        resolve({ subject: tracked, card: null, lost: true, ...context })
                        return
                    }
                    this.audio.recEnd()
                    const card = filmCard(this, rec.frames, this.view.toScreenRect(this.frameRect()))
                    this.loose.push(card)
                    resolve({ subject: tracked, card, lost: false, ...context })
                },
            }
            this.recording = rec
            this.tickRecording(0, rect)
        })
    }

    private tickRecording(delta: number, rect: Rect) {
        const rec = this.recording
        if (!rec) return
        if (rec.gen !== this.gen) {
            rec.finish(true)
            return
        }
        rec.elapsed += delta
        const every = VIDEO.ms / VIDEO.frames
        while (rec.frames.length < VIDEO.frames && rec.elapsed >= rec.frames.length * every) {
            rec.frames.push(this.snapNow(rect, `cnt-video-${this.shots}-${rec.frames.length}`))
            if (rec.frames.length > 1) this.audio.recTick()
        }
        this.app.progress(Math.min(1, rec.elapsed / VIDEO.ms))
        if (rec.tracked && !within(rect, rec.tracked.focus(), 0)) rec.lost += delta
        else rec.lost = 0
        if (rec.lost > VIDEO.lostMs) {
            rec.finish(true)
            return
        }
        if (rec.elapsed >= VIDEO.ms) {
            this.shots++
            rec.finish(false)
        }
    }

    private async stick(card: Card, hold = 0) {
        if (hold) await FX.wait(this, hold)
        this.audio.whoosh()
        const slot = this.order.slot()
        await card.flyTo(slot.x, slot.y, slot.w)
        this.loose = this.loose.filter(c => c !== card)
        this.order.keep(card)
        this.audio.stick()
    }

    // ───────────────────────────────────────────── jogar

    private async shootPhoto() {
        const gen = this.gen
        this.state = 'capture'
        this.controls(false)
        const shot = await this.takePhoto()
        if (gen !== this.gen) return
        await this.judge(gen, shot, 'photo')
    }

    private async shootVideo() {
        const gen = this.gen
        this.state = 'capture'
        this.app.setEnabled(false, false)
        this.hud.setHelpEnabled(false)
        const shot = await this.takeVideo(gen)
        if (gen !== this.gen) return
        if (shot.lost) {
            this.audio.soft()
            this.banner.say(SAY.left, 'soft', 1400)
            this.play()
            return
        }
        this.joystick.setEnabled(false)
        await this.judge(gen, shot, 'video')
    }

    private fault(shot: Shot, used: Mode, want: Order): Fault | null {
        if (used !== want.mode) return 'mode'
        if (shot.dark) return 'dark'
        if (shot.washed) return 'washed'
        if (want.show === 'detail' && !shot.zoom) return 'small'
        if (want.show === 'whole' && shot.zoom) return 'cut'
        return null
    }

    private async judge(gen: number, shot: Shot, used: Mode) {
        const want = this.current
        const card = shot.card
        if (!card) {
            this.play()
            return
        }
        if (!shot.subject || shot.subject.def.id !== want.subject) {
            this.audio.soft()
            this.banner.say(SAY.notThis(SUBJECTS[want.subject]), 'soft', 1500)
            this.loose = this.loose.filter(c => c !== card)
            await card.drop()
            if (gen !== this.gen) return
            this.play()
            return
        }
        const fault = this.fault(shot, used, want)
        if (fault) {
            void this.jam(gen, card, used, fault)
            return
        }
        this.album.push({ order: want, mode: used, keys: card.adopt() })
        await this.stick(card, used === 'video' ? FILM_HOLD : 0)
        if (gen !== this.gen) return
        this.audio.good()
        shot.subject.react()
        this.hero.act('cheer')
        const slot = this.order.slot()
        void FX.sparks(this, slot.x, slot.y, { color: C.butter, count: 16, spread: 90, size: 9, duration: 560, depth: DEPTH.card + 1 })
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await FX.wait(this, CHEER_MS)
        if (gen !== this.gen) return
        this.hero.act(null)
        await this.nextOrder(gen)
    }

    private async nextOrder(gen: number) {
        await this.order.leave()
        if (gen !== this.gen) return
        this.orderIndex += 1
        if (this.orderIndex >= this.level.phases[this.phaseIndex].orders.length) {
            this.audio.pop()
            await this.hud.celebrate(this.phaseIndex)
            if (gen !== this.gen) return
            this.phaseIndex += 1
            this.orderIndex = 0
            if (this.phaseIndex >= this.level.phases.length) {
                void this.endLevel()
                return
            }
            this.hud.setPhase(this.phaseIndex)
            if (this.introduce && this.level.level === 2 && this.phaseIndex === 1) {
                this.state = 'intro'
                await this.teachGlow(gen)
                if (gen !== this.gen) return
            }
        }
        this.audio.whoosh()
        await this.order.show(this.current)
        if (gen !== this.gen) return
        this.play()
    }

    // ───────────────────────────────────────────── erro

    private async jam(gen: number, card: Card, used: Mode, fault: Fault) {
        this.state = 'error'
        this.controls(false)
        const def = SUBJECTS[this.current.subject]
        await this.stick(card, used === 'video' ? FILM_HOLD : 0)
        if (gen !== this.gen) return
        this.audio.blom()
        if (fault === 'mode') void this.order.shakeMode()
        if (fault === 'dark' || fault === 'washed') void this.app.shake('light')
        if (fault === 'small' || fault === 'cut') void this.app.shake('zoom')
        this.hero.act('oops')
        const text = {
            mode: used === 'photo' ? SAY.wantVideo(def) : SAY.wantPhoto,
            dark: SAY.dark,
            washed: SAY.washed,
            small: SAY.small,
            cut: SAY.cut(def),
        }[fault]
        this.banner.say(text, 'oops')
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.controls(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        this.controls(false)
        const frame = this.view.toScreenRect(this.frameRect())
        const tools = this.level.tools.map(tool => ({
            text: HELP[tool],
            ...spot(this.app.toolRect(tool), 6),
            balloonY: 236,
            buttonLabel: 'Próximo',
        }))
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP.order, ...spot(this.order.rect()), buttonLabel: 'Próximo' },
            { text: HELP.frame, ...spot(frame, 12), balloonY: frame.y < 396 ? 600 : 148, buttonLabel: 'Próximo' },
            { text: HELP.app, ...spot(this.app.rect(), 6), buttonLabel: 'Próximo' },
            ...tools,
            { text: HELP.walk, ...spot(this.joystick.rect()), buttonLabel: 'Continuar' },
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
        this.state = 'finale'
        this.controls(false)
        this.audio.win()
        this.hero.act('cheer')
        void FX.confetti(this, { colors: [C.sun, C.mint, C.lilac, C.coral, C.butter] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return
        await openMural(this, this.album, this.level.title, { pop: () => this.audio.pop(), whoosh: () => this.audio.whoosh() })
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
        const total = ordersOf(this.level).length
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.min(100, Math.round((this.done / total) * 100)),
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
