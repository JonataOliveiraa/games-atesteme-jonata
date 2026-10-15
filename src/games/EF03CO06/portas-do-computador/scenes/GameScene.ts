import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEVICES, INFO, WISH } from '../data/devices'
import { LEVELS, POINTS, answerIn, answerOut, guideKey } from '../data/levels'
import { DEPTH, H, OUT_SPOT, SHOT, W, WALK_MS, WINDOW } from '../data/layout'
import { C, CSS } from '../data/theme'
import { FINALE, HELP, LAST_TITLE, SAY, TEACH } from '../data/words'
import type { DeviceId, InfoId, LevelDef, Mission, Mode, Side } from '../types'

import { createAudio, type Audio } from './audio'
import { infoImage } from './art'
import { showBanner } from './banner'
import { createComputer, type Computer } from './computer'
import { createDoors, type DoorView, type Doors } from './doors'
import { createFinale, type Finale, type FinaleRow } from './finale'
import { spot, teach, union, type Rect } from './guide'
import { createHint, type Hint } from './hint'
import { createHud, type Hud } from './hud'
import { createWalker, type Walker } from './info'
import { createPerson, type PersonView } from './person'

const GAME_ID = 'portas-do-computador'
const HOP_MS = 560
const WORK_MS = 800
const NEXT_MS = 500
const ERROR_MS = 1900
const FINALE_MS = 2400
const WIRE_MS = 320
const PERSON_MS = 1100
const INSIDE = { fromX: WINDOW.x - 134, toX: WINDOW.x - 100, feet: WINDOW.y + 62, scale: 0.6 }

type Shot = { x: number; y: number; zoom: number }
type Phase = 'in' | 'out'

const SIDE_OF: Record<Phase, Side> = { in: 'input', out: 'output' }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private phase: Phase = 'in'
    private gen = 0
    private guiding = false
    private introduce = false
    private lockTo: DeviceId | null = null
    private active = new Set<DeviceId>()
    private shot: Shot = { ...SHOT.wide }

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private computer!: Computer
    private doors!: Doors
    private walker?: Walker
    private person?: PersonView
    private hint!: Hint
    private finale!: Finale
    private hud!: Hud
    private banner?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    private get mission(): Mission {
        return this.level.missions[this.index]
    }

    private get lightCount() {
        return this.level.missions.length
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
        this.phase = 'in'
        this.guiding = false
        this.introduce = false
        this.lockTo = null
        this.active = new Set(this.level.doors)
        this.shot = { ...SHOT.wide }
        this.walker = undefined
        this.person = undefined
        this.banner = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.cameras.main.setBounds(0, 0, W, H)
        this.audio = createAudio()
        this.computer = createComputer(this, this.lightCount)
        this.doors = createDoors(this)
        this.hint = createHint(this)
        this.finale = createFinale(this)
        this.hud = createHud(this, {
            phases: this.lightCount,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)
        this.hud.show(false, true)

        this.bindInput()
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
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.hud?.destroy()
        this.finale?.destroy()
        this.walker?.destroy()
        this.person?.destroy()
        this.hint?.destroy()
        this.banner?.destroy()
        Object.values(this.doors ?? {}).forEach(d => d.destroy())
        this.computer?.destroy()
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
            const hit = this.liveDoors().find(id => this.doors[id].contains(pointer.worldX, pointer.worldY))
            if (hit) this.tapDoor(hit)
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        const digit = Number(event.key)
        if (digit >= 1 && digit <= 3) {
            const ids = this.liveDoors().sort((a, b) => this.doors[a].y - this.doors[b].y)
            if (ids[digit - 1]) this.tapDoor(ids[digit - 1])
        }
    }

    /** os aparelhos que respondem agora: os do lado da vez, já na tela */
    private liveDoors(): DeviceId[] {
        const side = SIDE_OF[this.phase]
        return (Object.keys(this.doors) as DeviceId[]).filter(id => DEVICES[id].side === side && this.active.has(id) && this.doors[id].visible)
    }

    private wake(side: Side | null, keep?: DeviceId) {
        ;(Object.keys(this.doors) as DeviceId[]).forEach(id =>
            this.doors[id].awake((side !== null && DEVICES[id].side === side && this.active.has(id)) || id === keep),
        )
    }

    private doorsRect(): Rect {
        return this.liveDoors()
            .map(id => this.doors[id].rect())
            .reduce((a, b) => union(a, b))
    }

    private doorPoint(door: DoorView) {
        return { x: door.x + (DEVICES[door.id].side === 'input' ? -8 : 8), y: door.y - 12 }
    }

    private tapDoor(id: DeviceId) {
        if (this.mode !== 'input' || this.guiding) return
        if (this.lockTo && id !== this.lockTo) return
        if (this.phase === 'in') void this.passIn(id)
        else void this.passOut(id)
    }

    // ───────────────────────────────────────────── nível e missão

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        const cam = this.cameras.main
        this.shot = { ...SHOT.open }
        cam.setZoom(SHOT.open.zoom)
        cam.centerOn(SHOT.open.x, SHOT.open.y)

        await FX.wait(this, 250)
        await this.frame(SHOT.wide, 1100)
        if (gen !== this.gen) return
        ;(this.level.dim ?? []).forEach(id => void this.doors[id].show(true))
        for (const id of this.level.doors) {
            void this.doors[id].show(true, true)
            this.audio.door()
            await FX.wait(this, 140)
        }
        if (gen !== this.gen) return
        void this.startMission(0)
    }

    private async startMission(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.phase = this.level.kind === 'out' ? 'out' : 'in'
        this.lockTo = null
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.emitCheckpoint()
        this.wake(null)
        Object.values(this.doors).forEach(d => d.clear())
        const old = this.person
        this.person = undefined
        if (old) void old.leave().then(() => old.destroy())
        const tour = this.introduce && index === 0

        if (tour) {
            if (this.level.kind === 'both') {
                await this.lesson(gen, [{ text: this.level.goal, ...spot(this.computer.rect()), balloonX: 1040, balloonY: 420, buttonLabel: 'Vamos lá!' }])
                if (gen !== this.gen) return
            } else {
                await this.lesson(gen, [{ text: this.level.goal, ...spot(this.computer.rect()), balloonX: 1040, balloonY: 420, buttonLabel: 'Ver' }])
                if (gen !== this.gen) return
                if (this.level.kind === 'in') await this.demoIn(gen)
                else await this.demoOut(gen)
                if (gen !== this.gen) return
                await this.lesson(gen, [{ text: TEACH.yourTurn(this.lightCount), ...spot(this.computer.goalRect()), balloonY: 330, buttonLabel: 'Vamos lá!' }])
                if (gen !== this.gen) return
            }
        }

        if (this.level.kind === 'out') {
            await this.startInside(gen)
            if (gen !== this.gen) return
            await this.outPhase(gen, tour)
            return
        }
        await this.inPhase(gen, tour)
    }

    /** a informação chega pela calçada e espera a criança escolher a entrada */
    private async inPhase(gen: number, tour: boolean) {
        const m = this.mission
        this.phase = 'in'
        this.walker?.destroy()
        const walker = createWalker(this, m.info)
        this.walker = walker
        await walker.arrive(WALK_MS, k => this.audio.step(k))
        if (gen !== this.gen) return
        if (m.debut && DEVICES[m.debut].side === 'input') await this.debut(gen, m.debut)
        if (gen !== this.gen) return

        this.wake('input')
        if (this.introduce && m.guided) {
            const door = this.doors[answerIn(m)]
            await walker.callout()
            if (gen !== this.gen) return
            if (!tour) {
                await this.lesson(gen, [{ text: TEACH.door[m.info], ...spot(union(walker.rect(), door.rect())), balloonX: 820, balloonY: door.y, buttonLabel: 'Ok' }])
                if (gen !== this.gen) return
            }
            this.lockTo = door.id
            this.hint.show(walker.point(), this.doorPoint(door))
        }
        this.mode = 'input'
        this.hud.setHelpEnabled(true)
    }

    /** N2: a informação já está dentro do computador; o processador trabalha e ela vai até a saída */
    private async startInside(gen: number) {
        const m = this.mission
        this.walker?.destroy()
        const walker = createWalker(this, m.info)
        this.walker = walker
        await walker.appear(INSIDE.toX, INSIDE.feet, INSIDE.scale)
        if (gen !== this.gen) return
        this.computer.work(true)
        this.audio.blip()
        await FX.wait(this, 600)
        if (gen !== this.gen) return
        this.computer.work(false)
        await walker.walkTo(OUT_SPOT.x, 420)
    }

    /** quem pediu chega pela direita, e a criança escolhe a saída */
    private async outPhase(gen: number, tour: boolean) {
        const m = this.mission
        if (!m.person || !m.wish) return
        this.phase = 'out'
        this.mode = 'intro'
        const person = createPerson(this, m.person, m.wish)
        this.person = person
        await person.arrive(PERSON_MS, k => this.audio.step(k))
        if (gen !== this.gen) return
        if (m.debut && DEVICES[m.debut].side === 'output') await this.debut(gen, m.debut)
        if (gen !== this.gen) return

        this.wake('output')
        await person.callout()
        if (gen !== this.gen) return
        if (this.introduce && m.guided) {
            const door = this.doors[answerOut(m)]
            if (!tour) {
                await this.lesson(gen, [{ text: TEACH.wish[m.wish], ...spot(union(person.wishRect(), door.rect())), balloonX: 480, balloonY: door.y, buttonLabel: 'Ok' }])
                if (gen !== this.gen) return
            }
            this.lockTo = door.id
            this.hint.show(person.point(), this.doorPoint(door))
        }
        this.mode = 'input'
        this.hud.setHelpEnabled(true)
    }

    private async debut(gen: number, id: DeviceId) {
        const door = this.doors[id]
        await this.close(door.x + (DEVICES[id].side === 'input' ? 60 : -60), door.y - 20)
        if (gen !== this.gen) return
        this.active.add(id)
        this.audio.door()
        await door.show(true, true)
        await FX.wait(this, 350)
        await this.frame(SHOT.wide)
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.mode
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = before
    }

    // ───────────────────────────────────────────── demonstrações (a criança só olha)

    private async demoIn(gen: number) {
        const info = this.mission.info
        const door = this.doors[answerIn(this.mission)]
        const walker = createWalker(this, info)
        this.walker = walker
        this.mode = 'guide'
        await walker.arrive(WALK_MS, k => this.audio.step(k))
        if (gen !== this.gen) return
        this.wake('input')
        await walker.callout()
        if (gen !== this.gen) return
        await this.showTap(gen, walker.point(), door)
        if (gen !== this.gen) return
        this.wake(null, door.id)
        this.audio.hop()
        await Promise.all([walker.hop(door.x, door.y, HOP_MS, 0.6), this.close(door.x + 40, door.y, HOP_MS)])
        if (gen !== this.gen) return
        if (!(await this.carryIn(walker, door, gen, 0))) return
        await this.computer.blink(0)
        walker.destroy()
        this.walker = undefined
        this.wake(null)
    }

    private async demoOut(gen: number) {
        const m = this.mission
        if (!m.person || !m.wish) return
        this.mode = 'guide'
        await this.startInside(gen)
        if (gen !== this.gen) return
        const walker = this.walker
        const person = createPerson(this, m.person, m.wish)
        this.person = person
        await person.arrive(PERSON_MS, k => this.audio.step(k))
        if (gen !== this.gen || !walker) return
        this.wake('output')
        await person.callout()
        if (gen !== this.gen) return
        const door = this.doors[answerOut(m)]
        await this.showTap(gen, person.point(), door)
        if (gen !== this.gen) return
        this.wake(null, door.id)
        if (!(await this.carryOut(walker, door, m.info, gen))) return
        await this.deliver(door, person, m.info, gen)
        if (gen !== this.gen) return
        await this.computer.blink(0)
        walker.destroy()
        this.walker = undefined
        this.person = undefined
        void person.leave().then(() => person.destroy())
        door.clear()
        this.wake(null)
        await FX.wait(this, 500)
    }

    /** a seta anda até o aparelho e ele recebe um "toque" */
    private async showTap(gen: number, from: { x: number; y: number }, door: DoorView) {
        this.hint.show(from, this.doorPoint(door))
        await FX.wait(this, 1500)
        if (gen !== this.gen) return
        this.hint.hide()
        this.hint.tap(door)
        this.audio.tic()
        await FX.wait(this, 250)
    }

    // ───────────────────────────────────────────── a informação ENTRA

    private async passIn(id: DeviceId) {
        const gen = this.gen
        const walker = this.walker
        if (!walker) return
        const m = this.mission
        const door = this.doors[id]
        this.mode = 'send'
        this.lockTo = null
        this.hint.hide()
        this.hud.setHelpEnabled(false)
        this.wake(null, id)
        this.audio.hop()

        await Promise.all([walker.hop(door.x, door.y, HOP_MS, 0.6), this.close(door.x + 40, door.y, HOP_MS)])
        if (gen !== this.gen) return

        if (id !== answerIn(m)) {
            this.audio.bump()
            await Promise.all([door.refuse(), walker.bounceBack()])
            if (gen !== this.gen) return
            await this.jam(SAY.wrongDoor(id, m.info))
            return
        }

        if (this.level.kind === 'both') {
            if (!(await this.carryIn(walker, door, gen, null))) return
            await this.outPhase(gen, false)
            return
        }
        if (!(await this.carryIn(walker, door, gen, this.index))) return
        walker.destroy()
        this.walker = undefined
        this.computer.fill(this.index, m.info)
        this.audio.pop(this.index)
        await this.success(gen)
    }

    /**
     * Aparelho de entrada certo: a informação passa pelo aparelho, pelo fio e pelo
     * processador. Depois voa até a luz (`slot`) ou fica dentro, esperando a saída (`null`).
     */
    private async carryIn(walker: Walker, door: DoorView, gen: number, slot: number | null): Promise<boolean> {
        if (door.id === 'mic') this.audio.voice()
        else if (door.id === 'camera') this.audio.flash()
        else this.audio.keys()
        await Promise.all([door.open(), walker.vanish()])
        if (gen !== this.gen) return false
        await door.pulse(WIRE_MS)
        if (gen !== this.gen) return false

        await this.close(WINDOW.x, WINDOW.y)
        if (gen !== this.gen) return false
        await walker.appear(INSIDE.fromX, INSIDE.feet, INSIDE.scale)
        await walker.walkTo(INSIDE.toX, 360)
        if (gen !== this.gen) return false
        this.computer.work(true)
        this.audio.blip()
        await FX.wait(this, WORK_MS)
        if (gen !== this.gen) return false
        this.computer.work(false)

        if (slot === null) {
            await walker.walkTo(OUT_SPOT.x, 420)
            if (gen !== this.gen) return false
            await this.frame(SHOT.wide)
            return gen === this.gen
        }
        walker.pose('happy')
        this.audio.hop()
        const at = this.computer.slot(slot)
        await Promise.all([this.frame(SHOT.wide), walker.hop(at.x, at.y, 620, 0.28)])
        return gen === this.gen
    }

    // ───────────────────────────────────────────── a informação SAI

    private async passOut(id: DeviceId) {
        const gen = this.gen
        const walker = this.walker
        const person = this.person
        const m = this.mission
        if (!walker || !person || !m.person || !m.wish) return
        const door = this.doors[id]
        this.mode = 'send'
        this.lockTo = null
        this.hint.hide()
        this.hud.setHelpEnabled(false)
        this.wake(null, id)

        if (!(await this.carryOut(walker, door, m.info, gen))) return
        if (id !== answerOut(m)) {
            person.pose('confused')
            await this.jam(SAY.wrongWish(m.person, m.wish))
            return
        }
        await this.deliver(door, person, m.info, gen)
        if (gen !== this.gen) return
        walker.destroy()
        this.walker = undefined
        this.computer.fill(this.index, m.info)
        this.audio.pop(this.index)
        await this.success(gen)
    }

    /** a informação sai pela janela, corre pelo fio e o aparelho faz o que faz com ela */
    private async carryOut(walker: Walker, door: DoorView, info: InfoId, gen: number): Promise<boolean> {
        await this.close(OUT_SPOT.edge - 40, WINDOW.y)
        if (gen !== this.gen) return false
        await walker.walkTo(OUT_SPOT.edge, 260)
        this.audio.tic()
        await walker.vanish()
        if (gen !== this.gen) return false
        await Promise.all([door.pulse(WIRE_MS), this.close(door.x - 70, door.y - 30, WIRE_MS + 120)])
        if (gen !== this.gen) return false
        if (door.id === 'speaker') {
            if (info === 'note') this.audio.melody()
            else this.audio.fizz()
        } else if (door.id === 'screen') this.audio.plim()
        else this.audio.print()
        await door.perform(info)
        if (gen !== this.gen) return false
        await this.frame(SHOT.wide)
        return gen === this.gen
    }

    /** o que o aparelho fez chega até a pessoa, e ela comemora */
    private async deliver(door: DoorView, person: PersonView, info: InfoId, gen: number) {
        const gift = infoImage(this, info, 'happy', 56).setPosition(door.x, door.y).setDepth(DEPTH.fx)
        await FX.to(this, gift, { x: person.x, y: person.y }, { duration: 520, ease: 'Sine.easeInOut' })
        gift.destroy()
        if (gen !== this.gen) return
        this.audio.cheer()
        await person.cheer()
    }

    private async success(gen: number) {
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        await this.hud.celebrate(this.index)
        if (gen !== this.gen) return
        await FX.wait(this, NEXT_MS)
        if (gen !== this.gen) return
        if (this.index + 1 < this.level.missions.length) {
            void this.startMission(this.index + 1)
            return
        }
        this.index += 1
        this.emitCheckpoint()
        void this.endLevel()
    }

    // ───────────────────────────────────────────── erro

    private async jam(reason: string) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        this.audio.blom()
        await this.frame(SHOT.wide)
        if (gen !== this.gen) return
        this.banner = showBanner(this, reason)
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
        if (this.mode !== 'input' || this.guiding || this.shot.zoom !== 1) return
        const gen = this.gen
        const first =
            this.phase === 'in' && this.walker
                ? { text: HELP.info, ...spot(this.walker.rect()), balloonX: 760, balloonY: 560 }
                : this.person
                  ? { text: HELP.wish, ...spot(this.person.wishRect()), balloonX: 640, balloonY: 330 }
                  : undefined
        const steps: Parameters<typeof teach>[2] = []
        if (first) steps.push({ ...first, buttonLabel: 'Próximo' })
        steps.push({ text: HELP.doors, ...spot(this.doorsRect()), balloonX: this.phase === 'in' ? 860 : 420, balloonY: 420, buttonLabel: 'Próximo' })
        steps.push({ text: HELP.goal(this.lightCount), ...spot(this.computer.goalRect()), balloonY: 330, buttonLabel: 'Continuar' })
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = 'input'
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private finaleRows(): FinaleRow[] {
        const missions = this.level.missions
        if (this.level.kind === 'in')
            return missions
                .map(m => m.info)
                .filter((id, i, all) => all.indexOf(id) === i)
                .map(info => ({ info, devices: [INFO[info].door], text: FINALE.lines[info] }))
        if (this.level.kind === 'out')
            return missions
                .map(m => m.wish)
                .filter((w, i, all): w is NonNullable<typeof w> => !!w && all.indexOf(w) === i)
                .map(wish => ({ wish, devices: [WISH[wish].door], text: FINALE.wishes[wish] }))
        return missions.map(m => ({ info: m.info, devices: [answerIn(m), answerOut(m)], text: FINALE.path(m.info, answerOut(m)) }))
    }

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
        const old = this.person
        this.person = undefined
        if (old) void old.leave().then(() => old.destroy())
        this.audio.blip()
        await this.close(this.computer.goalRect().x, this.computer.goalRect().y + 120, 700)
        if (gen !== this.gen) return
        await FX.wait(this, 700)
        await this.frame(SHOT.wide, 700)
        if (gen !== this.gen) return

        const kind = this.level.kind
        await this.finale.show(FINALE.title[kind], this.finaleRows(), FINALE.synth[kind], i => this.audio.pop(i))
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
            title: last ? LAST_TITLE : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.lightCount, current: this.lightCount },
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
            progress: Math.min(100, Math.round((this.index / this.lightCount) * 100)),
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
