import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEVICES } from '../data/devices'
import { LEVELS, POINTS, choosesOutput, guideKey, outputsOf } from '../data/levels'
import { BALL, FLIPPER, H, POPS, PROCESSOR, SHOT, SLOT, TABLE, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import { HELP, SAY, TEACH } from '../data/words'
import type { DeviceId, LevelDef, Mission, Mode, Row } from '../types'

import { createAudio, type Audio } from './audio'
import { createBall, type Ball } from './ball'
import { createDevices, type Devices } from './devices'
import { createFinale, type Finale } from './finale'
import { spot, teach, union, type Rect } from './guide'
import { createHud, type Hud } from './hud'
import { createKid, type Kid } from './kid'
import { createProcessor, type Processor } from './processor'
import { createTable, type Side, type Table } from './table'
import { createVisor, type Visor } from './visor'

const GAME_ID = 'pinball-de-entrada-e-saida'
const RESULT_MS = 900
const ERROR_MS = 1800
const FINALE_MS = 2400
const RESPAWN_MS = 600
const KICK_WINDOW = 150
const STUCK_MS = 1600
const HINT_MS = 2200
const WIRE_MS = 760
const READ_MS = 900
const LOW = { balloonY: 600 }
const HIGH = { balloonY: 130 }

type Shot = { x: number; y: number; zoom: number }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private tour = false
    private launched: DeviceId | null = null
    private inputOk = false
    private processed = false
    private chipBusy = false
    private armed: DeviceId | null = null
    private drains = 0
    private stuckFor = 0
    private kickUntil: Record<Side, number> = { left: 0, right: 0 }
    private waitArm?: () => void
    private shot: Shot = { ...SHOT.wide }

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private table!: Table
    private devices!: Devices
    private processor!: Processor
    private ball!: Ball
    private visor!: Visor
    private kid!: Kid
    private finale!: Finale
    private hud!: Hud

    private unsubPlatform?: () => void

    private get mission(): Mission {
        return this.level.missions[this.index]
    }

    private get outputs(): DeviceId[] {
        return outputsOf(this.level, this.mission)
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
        this.mode = 'intro'
        this.guiding = false
        this.tour = false
        this.launched = null
        this.armed = null
        this.processed = false
        this.chipBusy = false
        this.drains = 0
        this.waitArm = undefined
        this.shot = { ...SHOT.wide }
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.cameras.main.setBounds(0, 0, W, H)
        this.audio = createAudio()
        this.table = createTable(this)
        this.devices = createDevices(this)
        this.processor = createProcessor(this)
        this.ball = createBall(this)
        this.visor = createVisor(this)
        this.kid = createKid(this)
        this.finale = createFinale(this)
        this.hud = createHud(this, {
            phases: this.level.missions.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)
        this.hud.show(false, true)

        this.matter.world.on('collisionstart', this.onCollide, this)
        this.bindInput()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        const introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.openLevel(introduce)
    }

    update(_time: number, delta: number) {
        this.table.update()
        this.ball.sync()
        if (this.mode !== 'play' || !this.ball.body || !this.matter.world.enabled) return
        const now = this.time.now
        ;(['left', 'right'] as Side[]).forEach(side => {
            if (now > this.kickUntil[side]) return
            const t = this.table.onFlipper(side, this.ball.x, this.ball.y)
            if (t === null) return
            this.kickUntil[side] = 0
            this.kick(side, t)
        })
        if (this.ball.y > TABLE.bottom + BALL.r) {
            void this.drain()
            return
        }
        this.stuckFor = this.ball.speed < 0.25 ? this.stuckFor + delta : 0
        if (this.stuckFor > STUCK_MS) {
            this.stuckFor = 0
            this.ball.kick(Phaser.Math.Between(-3, 3), -4)
        }
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.matter.world?.off('collisionstart', this.onCollide, this)
        this.hud?.destroy()
        this.finale?.destroy()
        this.kid?.destroy()
        this.visor?.destroy()
        this.ball?.destroy()
        this.processor?.destroy()
        Object.values(this.devices ?? {}).forEach(d => d.destroy())
        this.table?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── câmera

    private frame(to: Shot, ms: number = SHOT.ms): Promise<void> {
        const from = { ...this.shot }
        this.shot = { ...to }
        const cam = this.cameras.main
        const wide = to.zoom === 1
        if (!wide) this.hud.show(false)
        const k = { t: 0 }
        return new Promise(resolve => {
            this.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(this, ms),
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    cam.setZoom(Phaser.Math.Linear(from.zoom, to.zoom, k.t))
                    cam.centerOn(Phaser.Math.Linear(from.x, to.x, k.t), Phaser.Math.Linear(from.y, to.y, k.t))
                },
                onComplete: () => {
                    if (wide) this.hud.show(true)
                    resolve()
                },
                onStop: () => resolve(),
            })
        })
    }

    private close(x: number, y: number, ms?: number) {
        return this.frame({ x, y, zoom: SHOT.zoom }, ms)
    }

    // ───────────────────────────────────────────── toques

    private bindInput() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            const hit = (Object.keys(this.devices) as DeviceId[]).find(id => this.devices[id].contains(pointer.worldX, pointer.worldY))
            if (hit && this.tapDevice(hit)) return
            if (this.mode === 'play') this.flip(pointer.worldX < TABLE.cx ? 'left' : 'right')
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        if (['ArrowLeft', 'KeyA', 'KeyZ'].includes(event.code)) {
            if (this.mode === 'play') this.flip('left')
            return
        }
        if (['ArrowRight', 'KeyD', 'KeyM'].includes(event.code)) {
            if (this.mode === 'play') this.flip('right')
            return
        }
        const digit = Number(event.key)
        if (digit >= 1 && digit <= 3) {
            const row: Row = this.mode === 'input' ? 'input' : 'output'
            const ids = this.rowIds(row).sort((a, b) => SLOT[a].y - SLOT[b].y)
            if (ids[digit - 1]) this.tapDevice(ids[digit - 1])
            return
        }
        if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
            event.preventDefault()
            this.kid.advance()
        }
    }

    private flip(side: Side) {
        this.table.flip(side)
        this.audio.flip()
        this.kickUntil[side] = this.time.now + KICK_WINDOW
    }

    private kick(side: Side, t: number) {
        const sign = side === 'left' ? 1 : -1
        let vx = sign * Phaser.Math.Linear(7, -3, t)
        let vy = -BALL.kick
        if (this.armed) {
            const door = this.devices[this.armed].mouth()
            const gravity = this.matter.world.localWorld.gravity
            const step = 1000 / 60
            const fall = gravity.y * gravity.scale * step * step
            const steps = (Math.hypot(door.x - this.ball.x, door.y - this.ball.y) / BALL.kick) * 1.1
            const dx = door.x - this.ball.x
            const dy = door.y - 0.5 * fall * steps * steps - this.ball.y
            const len = Math.hypot(dx, dy) || 1
            const assist = this.tour ? 1 : 0.5
            vx = Phaser.Math.Linear(vx, (dx / len) * BALL.kick, assist)
            vy = Phaser.Math.Linear(vy, (dy / len) * BALL.kick, assist)
        }
        this.ball.kick(vx, vy)
    }

    private rowIds(row: Row): DeviceId[] {
        return row === 'input' ? this.level.inputs.slice() : this.outputs.slice()
    }

    /** o aparelho com o fio até a parede */
    private plugRect(id: DeviceId): Rect {
        const { from, to } = this.devices[id].wire()
        const wire = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2, w: Math.abs(from.x - to.x) + 50, h: Math.abs(from.y - to.y) + 60 }
        return union(this.devices[id].rect(), wire)
    }

    private rowRect(row: Row): Rect {
        return this.rowIds(row)
            .map(id => this.plugRect(id))
            .reduce((a, b) => union(a, b))
    }

    private flipperRect(): Rect {
        return { x: TABLE.cx, y: FLIPPER.y + 20, w: FLIPPER.rightX - FLIPPER.leftX + 90, h: 110 }
    }

    private doorRect(): Rect {
        const door = this.devices[this.armed ?? this.mission.output].mouth()
        return { x: door.x, y: door.y, w: 90, h: 110 }
    }

    private chipRect(): Rect {
        return { x: PROCESSOR.x, y: PROCESSOR.y + 10, w: 230, h: 190 }
    }

    private wake(row: Row | null, keep?: DeviceId) {
        ;(Object.keys(this.devices) as DeviceId[]).forEach(id => {
            this.devices[id].awake(DEVICES[id].row === row || id === keep)
        })
    }

    private doors() {
        this.outputs.forEach(id => this.devices[id].door(!this.processed ? 'off' : this.armed === id ? 'open' : 'closed'))
    }

    /** devolve true se o toque foi usado pelo aparelho */
    private tapDevice(id: DeviceId): boolean {
        const device = DEVICES[id]
        if (this.mode === 'input' && device.row === 'input' && this.level.inputs.includes(id)) {
            void this.sendIn(id)
            return true
        }
        if (device.row !== 'output' || !this.outputs.includes(id) || !this.processed) return false
        if (this.mode !== 'play' && this.mode !== 'choose') return false
        if (!choosesOutput(this.level, this.mission)) return true
        if (this.tour && id !== this.mission.output) return true
        this.arm(id)
        return true
    }

    private arm(id: DeviceId) {
        const first = !this.armed
        this.armed = id
        this.doors()
        this.wake('output')
        this.table.light('output', true)
        this.audio.tic()
        if (first) this.visor.restore()
        const wait = this.waitArm
        this.waitArm = undefined
        wait?.()
    }

    // ───────────────────────────────────────────── nível e missão

    private async openLevel(introduce: boolean) {
        const gen = ++this.gen
        this.mode = 'intro'
        const cam = this.cameras.main
        this.shot = { ...SHOT.kid }
        cam.setZoom(SHOT.kid.zoom)
        cam.centerOn(SHOT.kid.x, SHOT.kid.y)
        this.matter.world.pause()

        await this.kid.enter('ask')
        if (gen !== this.gen) return
        await this.kid.say(this.level.hello, 'Vamos lá!')
        if (gen !== this.gen) return
        await Promise.all([this.kid.leave(), this.frame(SHOT.wide, 1000)])
        if (gen !== this.gen) return
        this.matter.world.resume()
        void this.startMission(0, introduce)
    }

    private async layout(pop: boolean) {
        const shown = [...this.level.inputs, ...this.outputs]
        ;(Object.keys(this.devices) as DeviceId[]).forEach(id => {
            this.devices[id].door('off')
            if (!shown.includes(id)) void this.devices[id].show(false)
        })
        const fresh = shown.filter(id => !this.devices[id].visible)
        for (const id of fresh) {
            void this.devices[id].show(true, pop || id === this.mission.debut)
            if (pop) await FX.wait(this, 90)
        }
    }

    private async startMission(index: number, introduce: boolean) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.armed = null
        this.launched = null
        this.processed = false
        this.chipBusy = false
        this.drains = 0
        this.tour = introduce && this.level.level === 1 && index === 0
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.ball.remove()
        ;(['input', 'process', 'output'] as const).forEach(b => this.table.light(b, false))
        Object.values(this.devices).forEach(d => d.clear())
        this.emitCheckpoint()

        const m = this.mission
        await this.layout(index === 0)
        this.wake(null)
        await FX.wait(this, 300)
        if (gen !== this.gen) return

        if (this.tour) {
            await this.lesson(gen, [
                { text: TEACH.table, ...spot(this.table.rect()), balloonX: 1010, balloonY: 610, buttonLabel: 'Próximo' },
                { text: TEACH.sides, ...spot(this.plugRect('keyboard')), balloonX: 780, balloonY: 300, buttonLabel: 'Próximo' },
            ])
            if (gen !== this.gen) return
        }
        if (introduce && this.level.level === 2) {
            this.wake('input')
            await this.lesson(gen, [
                { text: TEACH.inputs, ...spot(this.rowRect('input')), balloonX: 760, balloonY: 420, buttonLabel: 'Próximo' },
                { text: TEACH.keyboard, ...spot(this.devices.keyboard.rect()), balloonX: 760, balloonY: 258, buttonLabel: 'Próximo' },
                { text: TEACH.mic, ...spot(this.devices.mic.rect()), balloonX: 760, balloonY: 414, buttonLabel: 'Próximo' },
                { text: TEACH.camera, ...spot(this.devices.camera.rect()), balloonX: 760, balloonY: 570, buttonLabel: 'Próximo' },
            ])
            this.wake(null)
            if (gen !== this.gen) return
        }
        if (introduce && this.level.level === 3) {
            await this.lesson(gen, [
                { text: TEACH.both, ...spot(union(this.rowRect('input'), this.rowRect('output'))), ...LOW, buttonLabel: 'Vamos jogar!' },
            ])
            if (gen !== this.gen) return
        }
        if (m.debut) {
            this.wake(null, m.debut)
            await this.close(this.devices[m.debut].x - 120, this.devices[m.debut].y - 30)
            await FX.wait(this, 300)
            await this.frame(SHOT.wide)
            if (gen !== this.gen) return
            await this.lesson(gen, [{ text: TEACH.printer, ...spot(this.devices[m.debut].rect()), balloonX: 560, balloonY: 470, buttonLabel: 'Ok' }])
            this.wake(null)
            if (gen !== this.gen) return
        }

        this.mode = 'ask'
        await this.frame(SHOT.visor)
        if (gen !== this.gen) return
        await this.visor.write(m.ask)
        await FX.wait(this, READ_MS)
        if (gen !== this.gen) return
        await this.frame(SHOT.wide)
        if (gen !== this.gen) return
        if (this.tour) {
            await this.lesson(gen, [{ text: TEACH.visor, ...spot(this.visor.rect()), balloonY: 300, buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
        }
        if (introduce && this.level.level === 2) {
            await this.lesson(gen, [{ text: TEACH.chooseInput, ...spot(this.visor.rect()), balloonY: 300, buttonLabel: 'Vamos jogar!' }])
            if (gen !== this.gen) return
        }

        this.wake('input')
        if (this.tour) {
            await this.lesson(gen, [{ text: TEACH.input, ...spot(this.plugRect('keyboard')), balloonX: 780, balloonY: 300, buttonLabel: 'Ok' }])
            if (gen !== this.gen) return
        }
        this.mode = 'input'
        this.hud.setHelpEnabled(true)
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.mode
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.matter.world.pause()
        await teach(this, guideKey(this.level.level), steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = before
        if (before === 'play' && !this.chipBusy) this.matter.world.resume()
    }

    // ───────────────────────────────────────────── a informação entra

    private async sendIn(id: DeviceId) {
        const gen = this.gen
        const m = this.mission
        this.mode = 'send'
        this.hud.setHelpEnabled(false)
        this.launched = id
        this.inputOk = id === m.input
        this.wake(null, id)
        this.audio.tic()
        const device = this.devices[id]
        const content = this.inputOk ? m.carries : null
        const wire = device.wire()

        await this.close(device.x + 90, device.y - 30)
        if (gen !== this.gen) return
        await device.use(content)
        if (gen !== this.gen) return
        this.table.light('input', true)
        this.audio.spring()
        await Promise.all([device.travel(content, WIRE_MS), this.close(wire.to.x + 60, wire.to.y + 40, WIRE_MS)])
        if (gen !== this.gen) return

        this.matter.world.pause()
        const mouth = device.mouth()
        this.ball.carry(content)
        this.ball.spawn(mouth.x, mouth.y, 3, 0)
        await this.frame(SHOT.wide)
        if (gen !== this.gen) return
        this.mode = 'play'
        this.matter.world.resume()
        this.hud.setHelpEnabled(true)
    }

    private onCollide(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
        const ball = this.ball.body
        if (!ball) return
        event.pairs.forEach(pair => {
            const other = pair.bodyA === ball ? pair.bodyB : pair.bodyB === ball ? pair.bodyA : null
            if (!other) return
            if (other.label === 'chip') {
                const side = Math.abs(this.ball.x - other.position.x) < 4 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(this.ball.x - other.position.x)
                this.ball.kick(side * 6, 2)
                void this.onChip()
            } else if (other.label === 'pop') {
                this.bounce(other.position.x, other.position.y, 9, 0)
                const i = POPS.findIndex(p => Math.abs(p.x - other.position.x) < 2)
                this.table.pop(i)
                this.audio.tic()
            } else if (other.label.startsWith('door-')) {
                const id = other.label.slice(5) as DeviceId
                if (this.mode === 'play' && this.processed && this.armed === id) void this.sendOut(id)
            }
        })
    }

    private bounce(x: number, y: number, speed: number, down: number) {
        const dx = this.ball.x - x
        const dy = this.ball.y - y
        const len = Math.hypot(dx, dy) || 1
        const sx = Math.abs(dx) < 4 ? (Math.random() < 0.5 ? -1 : 1) * 0.5 : dx / len
        this.ball.kick(sx * speed, (dy / len) * speed + down)
    }

    // ───────────────────────────────────────────── processa

    private async onChip() {
        if (this.mode !== 'play' || this.chipBusy) return
        const gen = this.gen
        if (!this.inputOk) {
            this.chipBusy = true
            this.matter.world.pause()
            await this.close(PROCESSOR.x, PROCESSOR.y)
            if (gen !== this.gen) return
            await this.processor.fail()
            if (gen === this.gen && this.launched) await this.jam('input', this.launched)
            return
        }
        this.table.light('process', true)
        this.audio.blip()
        if (this.processed) {
            void this.processor.work(300)
            return
        }
        this.chipBusy = true
        this.matter.world.pause()
        this.hud.setHelpEnabled(false)
        if (this.tour) {
            await this.lesson(gen, [{ text: TEACH.process, ...spot(this.chipRect()), ...LOW, buttonLabel: 'Ver' }])
            if (gen !== this.gen) return
        }
        await this.close(PROCESSOR.x, PROCESSOR.y)
        if (gen !== this.gen) return
        this.processor.hold(true)
        await FX.wait(this, 350)
        await this.ball.transform(this.mission.becomes)
        if (gen !== this.gen) return
        await FX.wait(this, 450)
        this.processor.hold(false)
        this.processed = true
        await this.frame(SHOT.wide)
        if (gen !== this.gen) return

        if (!choosesOutput(this.level, this.mission)) {
            this.arm(this.mission.output)
        } else {
            this.doors()
            this.wake('output')
            this.mode = 'choose'
            if (this.tour) {
                await this.lesson(gen, [{ text: TEACH.output, ...spot(this.rowRect('output')), balloonX: 520, balloonY: 420, buttonLabel: 'Ok' }])
                if (gen !== this.gen) return
            } else void this.visor.write(SAY.pickOutput, 'hint')
            this.hud.setHelpEnabled(true)
            await new Promise<void>(resolve => (this.waitArm = resolve))
            if (gen !== this.gen) return
            this.hud.setHelpEnabled(false)
            if (this.tour) {
                await this.lesson(gen, [{ text: TEACH.flippers, ...spot(union(this.flipperRect(), this.doorRect())), ...HIGH, buttonLabel: 'Vamos lá!' }])
                if (gen !== this.gen) return
            }
        }
        this.mode = 'play'
        this.chipBusy = false
        this.matter.world.resume()
        this.hud.setHelpEnabled(true)
    }

    private async drain() {
        const gen = this.gen
        this.ball.remove()
        this.drains += 1
        this.audio.boing()
        if (this.drains >= 2 && this.processed) {
            void this.visor.write(this.armed ? SAY.aim : SAY.pickOutput, 'hint')
            this.time.delayedCall(HINT_MS, () => {
                if (gen === this.gen && this.mode === 'play') this.visor.restore()
            })
        }
        await FX.wait(this, RESPAWN_MS)
        if (gen !== this.gen || this.mode !== 'play' || !this.launched) return
        this.audio.spring()
        if (this.processed) {
            this.ball.spawn(TABLE.cx, TABLE.top + 36, Phaser.Math.FloatBetween(-0.5, 0.5), 0)
            return
        }
        const mouth = this.devices[this.launched].mouth()
        this.ball.spawn(mouth.x, mouth.y, 3, 0)
    }

    // ───────────────────────────────────────────── a informação sai

    private async sendOut(target: DeviceId) {
        const gen = this.gen
        const m = this.mission
        this.mode = 'result'
        this.hud.setHelpEnabled(false)
        this.matter.world.pause()
        this.ball.remove()
        this.wake(null, target)
        this.table.light('output', true)
        const device = this.devices[target]
        const wire = device.wire()

        this.audio.spring()
        await this.close(wire.from.x - 60, wire.from.y, 520)
        if (gen !== this.gen) return
        await Promise.all([device.travel(m.becomes, WIRE_MS), this.close(device.x - 40, device.y - 40, WIRE_MS)])
        if (gen !== this.gen) return
        if (target === 'speaker') {
            if (['music', 'voice', 'story'].includes(m.becomes)) this.audio.melody()
            else this.audio.fizz()
        } else if (target === 'screen') this.audio.plim()
        else this.audio.print()
        await device.perform(m.becomes)
        if (gen !== this.gen) return
        await FX.wait(this, 700)
        if (gen !== this.gen) return
        if (target !== m.output) {
            await this.jam('output', target)
            return
        }
        await this.success(gen)
    }

    private async success(gen: number) {
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        void this.visor.write(SAY.yay, 'yay')
        await this.frame(SHOT.wide)
        if (gen !== this.gen) return
        await this.hud.celebrate(this.index)
        await FX.wait(this, RESULT_MS)
        if (gen !== this.gen) return
        if (this.tour) {
            await this.lesson(gen, [{ text: TEACH.flow, ...spot(this.table.rect()), balloonX: 1010, balloonY: 610, buttonLabel: 'Vamos jogar!' }])
            if (gen !== this.gen) return
        }
        if (this.index + 1 < this.level.missions.length) {
            void this.startMission(this.index + 1, false)
            return
        }
        this.index += 1
        this.emitCheckpoint()
        void this.endLevel()
    }

    // ───────────────────────────────────────────── erro

    private async jam(kind: Row, device: DeviceId) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        this.matter.world.pause()
        const m = this.mission
        this.audio.blom()
        await this.frame(SHOT.wide)
        if (gen !== this.gen) return
        await this.visor.write(kind === 'input' ? SAY.wrongInput(device, m.carries) : SAY.wrongOutput(m.output), 'oops')
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.audio.fail()
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (!['input', 'play', 'choose'].includes(this.mode) || this.guiding || this.shot.zoom !== 1) return
        if (this.mode === 'play' && this.chipBusy) return
        const gen = this.gen
        const before = this.mode
        const steps: Parameters<typeof teach>[2] = [{ text: HELP.ask, ...spot(this.visor.rect()), balloonY: 300, buttonLabel: 'Próximo' }]
        if (before === 'input') steps.push({ text: HELP.input, ...spot(this.rowRect('input')), balloonX: 760, balloonY: 420, buttonLabel: 'Próximo' })
        if (choosesOutput(this.level, this.mission))
            steps.push({ text: HELP.output, ...spot(this.rowRect('output')), balloonX: 520, balloonY: 420, buttonLabel: 'Próximo' })
        steps.push({ text: HELP.flippers, ...spot(this.flipperRect()), ...HIGH })
        steps[steps.length - 1].buttonLabel = 'Continuar'
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.matter.world.pause()
        await teach(this, `${guideKey(this.level.level)}-help`, steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = before
        if (before === 'play') this.matter.world.resume()
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.hud.setHelpEnabled(false)
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })

        this.wake(null)
        this.visor.off()
        await Promise.all([this.kid.enter('happy'), this.frame(SHOT.kid, 900)])
        if (gen !== this.gen) return
        await this.kid.say(this.level.bye, 'Ok')
        if (gen !== this.gen) return
        await Promise.all([this.kid.leave(), this.frame(SHOT.wide, 800)])
        if (gen !== this.gen) return

        await this.finale.show(this.level.missions, i => this.audio.pop(i))
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.input, C.output, C.process, C.star, C.mint] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        this.mode = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: last ? 'O computador conversa com o mundo!' : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.missions.length, current: this.level.missions.length },
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
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.min(100, Math.round((this.index / this.level.missions.length) * 100)),
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
