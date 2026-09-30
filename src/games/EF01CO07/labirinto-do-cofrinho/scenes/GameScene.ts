import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import {
    add,
    canStep,
    dirBetween,
    exitOf,
    fieldOwner,
    GUIDE_KEY,
    inField,
    isOpen,
    LEVELS,
    magnetsOf,
    POINTS,
    reachable,
    routeTo,
    safePath,
    same,
    startOf,
    trapDoor,
    trapOf,
} from '../data/levels'
import { BIA, cellAt, CHOOSE, cellCenter, DEPTH, GRID, H, PERSON, SLOTS, spanRect, TRAP, W } from '../data/layout'
import { PEOPLE, TRAP_LINE } from '../data/people'
import { C, CSS } from '../data/theme'
import type { Dir, LevelDef, MazeDef, Mode, Slot, Spot } from '../types'

import { createAudio, type Audio } from './audio'
import { createBia, type BiaView } from './bia'
import { playFinale } from './finale'
import { createGarden, type Garden } from './garden'
import { createMazeGuide, type MazeGuide } from './guide'
import { createHud, type Hud } from './hud'
import { createUiCamera, framed, moveCamera, resetCamera, WIDE, type Shot, type UiCamera } from './camera'
import { createPrompt, type Prompt } from './prompt'
import { playIntro } from './intro'
import { createMagnet, type MagnetView } from './magnet'
import { createMazeView, type MazeView } from './maze'
import { createPerson, personFeet, type PersonView } from './people'
import { createRoute, type RouteView } from './route'
import { createVault, type VaultView } from './vault'

const GAME_ID = 'labirinto-do-cofrinho'
const STEP_SOUND_MS = 170
const STRANGER_MS = 1300
const SHOW_LOSS_MS = 1300
const NEXT_MAZE_MS = 900
const FINALE_MS = 1400
const CELEBRATE_MS = 700
const RECOIL_DELAY = 160
const RECOIL_SPEED = 420
const KEYS: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private mazeIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private slots: Record<'trusted' | 'stranger', Slot> = { trusted: 'top', stranger: 'bottom' }

    private score = 0
    private hits = 0
    private errors = 0
    private mazesDone = 0

    private at: Spot = { c: 0, r: 0 }
    private prev: Spot = { c: 0, r: 0 }
    private to: Spot | null = null
    private t = 0
    private moved = 0
    private walkerWalking = false
    private stepSoundMs = 0
    private edgeSince = 0
    private insist = false
    private path: Spot[] = []
    private lastTap: Spot | null = null
    private pointerId: number | null = null

    private audio!: Audio
    private garden!: Garden
    private hud!: Hud
    private guide!: MazeGuide
    private route!: RouteView
    private ui!: UiCamera
    private prompt!: Prompt
    private shot: Shot = WIDE
    private bia!: BiaView
    private vault!: VaultView
    private mazeView: MazeView | null = null
    private magnets: MagnetView[] = []
    private carer: PersonView | null = null
    private asker: PersonView | null = null
    private askZone: Phaser.GameObjects.Zone | null = null
    private askDone = false
    private offerReady = false
    private stranger: PersonView | null = null
    private zones: Partial<Record<Slot, Phaser.GameObjects.Zone>> = {}

    private unsubPlatform?: () => void

    private get maze(): MazeDef {
        return this.level.mazes[this.mazeIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 1)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.mazeIndex = 0
        this.mode = 'intro'
        this.guiding = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.mazesDone = 0
        this.to = null
        this.t = 0
        this.moved = 0
        this.walkerWalking = false
        this.stepSoundMs = 0
        this.edgeSince = 0
        this.insist = false
        this.path = []
        this.lastTap = null
        this.pointerId = null
        this.mazeView = null
        this.magnets = []
        this.carer = null
        this.stranger = null
        this.asker = null
        this.askZone = null
        this.askDone = false
        this.offerReady = false
        this.zones = {}
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        resetCamera(this)
        this.shot = WIDE
        this.ui = createUiCamera(this)
        this.prompt = createPrompt(this)

        this.audio = createAudio()
        this.garden = createGarden(this)
        this.vault = createVault(this)
        this.bia = createBia(this)
        this.hud = createHud(this, {
            phases: this.level.mazes.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.guide = createMazeGuide(this)
        this.route = createRoute(this)
        this.ui.own(this.hud.parts)
        this.createZones()

        this.bindInput()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startMaze(0)
    }

    update(_time: number, delta: number) {
        this.magnets.forEach(m => m.update(delta))
        this.tickWalker(delta)
    }

    private shutdownScene() {
        this.gen++
        this.audio?.hum(false)
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.clearStage()
        Object.values(this.zones).forEach(z => z?.destroy())
        this.zones = {}
        this.guide?.destroy()
        this.route?.destroy()
        this.prompt?.destroy()
        this.ui?.destroy()
        this.hud?.destroy()
        this.bia?.destroy()
        this.vault?.destroy()
        this.garden?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private clearStage() {
        this.magnets.forEach(m => m.destroy())
        this.magnets = []
        this.mazeView?.destroy()
        this.mazeView = null
        this.carer?.destroy()
        this.carer = null
        this.stranger?.destroy()
        this.stranger = null
        this.asker?.destroy()
        this.asker = null
        this.askZone?.destroy()
        this.askZone = null
    }

    private createZones() {
        ;(['top', 'bottom'] as Slot[]).forEach(slot => {
            const { x, y } = SLOTS[slot]
            const zone = this.add
                .zone(x, y, PERSON.hitW, PERSON.hitH)
                .setDepth(DEPTH.hud - 1)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => this.pick(slot))
            this.zones[slot] = zone
        })
        this.setZones(false)
    }

    private setZones(on: boolean) {
        Object.values(this.zones).forEach(z => {
            if (z?.input) z.input.enabled = on
        })
    }

    private bindInput() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            if (this.mode === 'offer') {
                const spot = cellAt(pointer.worldX, pointer.worldY)
                if (this.offerReady && spot && isOpen(this.maze, spot)) void this.refuse(spot)
                return
            }
            if (this.mode !== 'walk' && this.mode !== 'edge') return
            this.pointerId = pointer.id
            this.lastTap = null
            this.tapAt(pointer.worldX, pointer.worldY, true)
        })
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.id !== this.pointerId || !pointer.isDown) return
            if (this.mode !== 'walk' && this.mode !== 'edge') return
            this.tapAt(pointer.worldX, pointer.worldY, false)
        })
        const up = (pointer: Phaser.Input.Pointer) => {
            if (pointer.id === this.pointerId) this.pointerId = null
        }
        this.input.on('pointerup', up)
        this.input.on('pointerupoutside', up)
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        const dir = KEYS[event.code]
        if (dir) {
            if (this.mode === 'offer') {
                const next = add(this.at, dir)
                if (this.offerReady && isOpen(this.maze, next)) void this.refuse(next)
                return
            }
            if (this.mode !== 'walk' && this.mode !== 'edge') return
            const to = add(this.to ?? this.at, dir)
            if (isOpen(this.maze, to)) this.goTo(to, !event.repeat)
            else if (!event.repeat) this.bia.bump()
            return
        }
        if (event.code === 'Digit1' || event.code === 'Numpad1') this.pick('top')
        if (event.code === 'Digit2' || event.code === 'Numpad2') this.pick('bottom')
    }

    private tapAt(x: number, y: number, fresh: boolean) {
        const spot = cellAt(x, y)
        if (!spot) {
            if (fresh) this.bia.pulse()
            return
        }
        if (!fresh && this.lastTap && same(this.lastTap, spot)) return
        this.lastTap = spot
        this.goTo(spot, fresh)
    }

    private goTo(spot: Spot, fresh: boolean) {
        const base = this.to ?? this.at
        if (!this.to && same(spot, base)) {
            this.clearRoute()
            return
        }
        const path = isOpen(this.maze, spot) ? routeTo(this.maze, base, spot, this.level.reach) : null
        if (!path) {
            if (fresh) this.route.deny(spot)
            return
        }
        const settled = this.time.now - this.edgeSince >= this.level.edgeHoldMs
        if (this.mode === 'edge' && fresh && settled && inField(this.maze, path[0])) this.insist = true
        this.path = path
        this.route.showPath(base, path, s => inField(this.maze, s))
        if (fresh) this.audio.tap()
    }

    private clearRoute() {
        this.path = []
        this.insist = false
        this.route.clear()
    }

    private releaseFinger() {
        this.pointerId = null
        this.lastTap = null
        this.clearRoute()
        this.route.hideReach()
    }

    private async startMaze(index: number) {
        const gen = ++this.gen
        this.mazeIndex = index
        this.mode = 'intro'
        this.releaseFinger()
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.setZones(false)
        this.prompt.hide()
        this.clearStage()
        resetCamera(this)
        this.shot = WIDE

        const maze = this.maze
        const trustedTop = Math.random() < 0.5
        this.slots = trustedTop ? { trusted: 'top', stranger: 'bottom' } : { trusted: 'bottom', stranger: 'top' }

        this.mazeView = createMazeView(this, maze)
        this.magnets = magnetsOf(maze).map(m => createMagnet(this, maze, m))
        this.askDone = false
        this.offerReady = false
        this.placeAsker(maze)
        this.carer = createPerson(this, maze.trusted, 0, 0)
        this.carer.container.setAlpha(0)
        this.vault.setOpen(false)

        this.at = startOf(maze)
        this.prev = this.at
        this.to = null
        this.t = 0
        const start = cellCenter(this.at)
        this.bia.place(start.x, start.y)
        this.bia.setPose('idle')
        this.bia.face('right')
        this.bia.setWalking(false)
        this.bia.resetCard()
        this.bia.container.setAlpha(1)

        await this.mazeView.fadeIn()
        if (gen !== this.gen) return

        const told = await playIntro(this, {
            bia: this.bia,
            carer: this.carer,
            vault: this.vault,
            magnets: this.magnets,
            audio: this.audio,
            slot: SLOTS[this.slots.trusted],
            live: () => gen === this.gen,
        })
        if (!told || gen !== this.gen) return

        if (index === 0 && !this.registry.get(GUIDE_KEY)) {
            this.registry.set(GUIDE_KEY, true)
            await this.runGuide(gen)
            if (gen !== this.gen) return
        }
        this.walk()
    }

    private walk() {
        if (this.mode !== 'edge') this.mode = 'walk'
        this.hud.setHelpEnabled(!this.guiding)
    }

    private async demoWalk(view: BiaView, from: Spot, path: Spot[]) {
        this.route.hideReach()
        this.route.showPath(from, path, s => inField(this.maze, s))
        for (const cell of path) {
            await view.walkTo([cellCenter(cell)], this.level.speed)
            this.route.consume(cell)
        }
        this.route.clear()
    }

    private async runGuide(gen: number) {
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        try {
            const magnet = this.magnets[0]
            if (!magnet || !(await this.guide.magnet(magnet))) return
            if (gen !== this.gen) return

            const path = (safePath(this.maze) ?? []).slice(1, 3)
            if (path.length < 2) return
            const from = this.at
            const shown = await this.guide.walk({
                at: cellCenter(from),
                to: cellCenter(path[1]),
                walk: async () => {
                    await this.demoWalk(this.bia, from, path)
                    if (gen !== this.gen) return
                    this.at = path[path.length - 1]
                    this.moved += path.length
                },
            })
            if (!shown || gen !== this.gen) return

            this.mode = 'walk'
            const before = this.moved
            const area = spanRect([this.at, ...reachable(this.maze, this.at, this.level.reach)], 4)
            await this.guide.practice({ area, until: () => this.moved > before })
        } finally {
            await this.guide.hide()
            this.guiding = false
        }
    }

    private tickWalker(delta: number) {
        if (this.to) {
            this.t += (this.level.speed * delta) / 1000 / GRID.cell
            const a = cellCenter(this.at)
            const b = cellCenter(this.to)
            const k = Math.min(1, this.t)
            this.bia.setPosition(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)
            this.route.follow(this.bia.x, this.bia.y)
            this.stepSoundMs += delta
            if (this.stepSoundMs >= STEP_SOUND_MS) {
                this.stepSoundMs = 0
                this.audio.step()
            }
            if (this.t < 1) return
            this.at = this.to
            this.to = null
            this.t = 0
            this.moved += 1
            this.route.consume(this.at)
            if (this.onCell()) return
        }

        if (this.mode !== 'walk' && this.mode !== 'edge') {
            this.stopWalker()
            return
        }

        const next = this.path[0]
        if (!next) {
            this.stopWalker()
            this.leaveEdge()
            this.route.showReach(reachable(this.maze, this.at, this.level.reach), this.at)
            return
        }
        this.route.hideReach()
        if (!canStep(this.maze, this.at, next)) {
            this.clearRoute()
            return
        }
        const dir = dirBetween(this.at, next)
        if (inField(this.maze, next) && !this.insist) {
            this.atEdge(next, dir)
            return
        }
        this.insist = false
        this.leaveEdge()
        this.path.shift()
        this.beginStep(next, dir)
    }

    private beginStep(to: Spot, dir: Dir) {
        this.prev = this.at
        this.to = to
        this.t = 0
        this.bia.face(dir)
        this.bia.setWalking(true)
        this.walkerWalking = true
    }

    private stopWalker() {
        if (!this.walkerWalking) return
        this.walkerWalking = false
        this.bia.setWalking(false)
    }

    private magnetFor(spot: Spot): MagnetView | undefined {
        const owner = fieldOwner(this.maze, spot)
        return owner ? this.magnets.find(m => same(m.spot, owner)) : undefined
    }

    private atEdge(to: Spot, dir: Dir) {
        this.stopWalker()
        if (this.mode === 'edge') return
        this.mode = 'edge'
        this.edgeSince = this.time.now
        this.bia.face(dir)
        this.bia.tremble(true)
        this.magnetFor(to)?.setEdge(true)
        this.audio.hum(true)
    }

    private leaveEdge() {
        if (this.mode !== 'edge') return
        this.mode = 'walk'
        this.bia.tremble(false)
        this.magnets.forEach(m => m.setEdge(false))
        this.audio.hum(false)
    }

    private onCell(): boolean {
        if (inField(this.maze, this.at)) {
            void this.caughtByMagnet()
            return true
        }
        const door = trapDoor(this.maze)
        if (door && !this.askDone && same(this.at, door)) {
            void this.offer()
            return true
        }
        if (same(this.at, exitOf(this.maze)) && (this.mode === 'walk' || this.mode === 'edge')) {
            void this.arrive()
            return true
        }
        return false
    }

    private placeAsker(maze: MazeDef) {
        const cell = trapOf(maze)
        if (!maze.trap || !cell) return
        const c = cellCenter(cell)
        this.asker = createPerson(this, maze.trap, c.x, c.y + TRAP.foot - personFeet(TRAP.scale), TRAP.scale)
        this.askZone = this.add.zone(c.x, c.y, TRAP.hit, TRAP.hit).setInteractive({ useHandCursor: true })
        this.askZone.on('pointerdown', () => {
            if (this.mode === 'offer' && this.offerReady) void this.accept()
        })
    }

    private async offer() {
        const gen = this.gen
        const asker = this.asker
        const cell = trapOf(this.maze)
        if (!asker || !cell) return
        this.mode = 'offer'
        this.offerReady = false
        this.releaseFinger()
        this.stopWalker()
        this.hud.setHelpEnabled(false)
        this.bia.face(dirBetween(this.at, cell))
        this.audio.bell()
        asker.setGift(true)
        await asker.say(TRAP_LINE)
        if (gen !== this.gen) return
        this.offerReady = true
    }

    private async refuse(next: Spot) {
        const asker = this.asker
        this.offerReady = false
        this.askDone = true
        this.score += POINTS.refuse
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS.refuse, stage: this.level.level })
        asker?.clear()
        asker?.setGift(false)
        asker?.setPose('worry')
        this.audio.nope()
        this.mode = 'walk'
        this.hud.setHelpEnabled(true)
        this.goTo(next, true)
        await this.bia.shakeHead()
    }

    private async accept() {
        const gen = this.gen
        const asker = this.asker
        if (!asker) return
        this.mode = 'vault'
        this.offerReady = false
        asker.setGift(false)
        this.bia.setPose('show')
        const card = this.bia.takeCard()
        this.audio.whoosh()
        await asker.hold(card)
        if (gen !== this.gen) return
        this.audio.fail()
        await asker.think(['home', 'school'])
        if (gen !== this.gen) return
        this.bia.setPose('oops')
        await FX.wait(this, SHOW_LOSS_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private async caughtByMagnet() {
        const gen = ++this.gen
        this.mode = 'done'
        this.releaseFinger()
        this.stopWalker()
        this.hud.setHelpEnabled(false)
        this.bia.tremble(false)
        this.audio.hum(false)

        const magnet = this.magnetFor(this.at)
        const from = this.bia.cardWorld()
        const card = this.bia.takeCard()
        this.audio.pull()
        const recoil = FX.wait(this, RECOIL_DELAY).then(() => this.bia.walkTo([cellCenter(this.prev)], RECOIL_SPEED))
        await Promise.all([magnet?.steal(card, from, () => this.audio.plim()), recoil])
        if (gen !== this.gen) return
        this.bia.setPose('oops')
        this.audio.fail()
        await FX.wait(this, SHOW_LOSS_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private async arrive() {
        const gen = this.gen
        this.mode = 'arrive'
        this.releaseFinger()
        this.stopWalker()
        this.hud.setHelpEnabled(false)

        this.score += POINTS.cross
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS.cross, stage: this.level.level })

        await this.bia.walkTo([BIA.stop], this.level.speed)
        if (gen !== this.gen) return
        this.bia.setPose('idle')
        this.bia.face('right')

        const slot = SLOTS[this.slots.stranger]
        this.stranger = createPerson(this, this.maze.stranger, PERSON.enterX, slot.y)
        this.audio.bell()
        await Promise.all([this.stranger.walk([slot], STRANGER_MS, undefined, true), this.zoomTo(CHOOSE.shot)])
        if (gen !== this.gen) return

        for (const who of this.bySlot()) {
            await who.say(PEOPLE[who.id].line)
            if (gen !== this.gen) return
        }
        this.choose()
    }

    private bySlot(): PersonView[] {
        const top = this.slots.trusted === 'top' ? this.carer : this.stranger
        const bottom = this.slots.trusted === 'top' ? this.stranger : this.carer
        return [top, bottom].filter((p): p is PersonView => !!p)
    }

    private choose() {
        this.mode = 'choose'
        this.setZones(true)
        this.hud.setHelpEnabled(true)
        this.bySlot().forEach(who => who.setCallout(true))
        void this.prompt.show(CHOOSE.prompt, this.viewCorner(), CHOOSE.promptFont, CHOOSE.promptTop)
    }

    private viewCorner() {
        const { x, y, zoom } = this.shot
        return { left: x - W / 2 / zoom, top: y - H / 2 / zoom, zoom }
    }

    private async zoomTo(shot: Shot) {
        const from = this.shot
        this.shot = framed(shot)
        await moveCamera(this, from, this.shot, CHOOSE.zoomMs)
    }

    private endChoice() {
        this.prompt.hide()
        this.bySlot().forEach(who => who.setCallout(false))
    }

    private pick(slot: Slot) {
        if (this.mode !== 'choose' || this.guiding) return
        this.mode = 'vault'
        this.setZones(false)
        this.hud.setHelpEnabled(false)
        this.endChoice()
        this.audio.tap()
        if (slot === this.slots.trusted) void this.keepSafe()
        else void this.showStranger()
    }

    private async keepSafe() {
        const gen = this.gen
        const carer = this.carer
        if (!carer) return
        this.score += POINTS.person
        this.hits += 1
        this.mazesDone += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS.person, stage: this.level.level })
        this.emitCheckpoint()

        carer.clear()
        this.stranger?.clear()
        carer.setPose('cheer')
        this.bia.setPose('show')
        const card = this.bia.takeCard()
        this.audio.whoosh()
        void FX.to(this, card.container, { scale: 0.24 }, { duration: 400 })
        await this.vault.receive(card, carer.hands, () => this.audio.clac())
        if (gen !== this.gen) return

        this.audio.fanfare()
        this.bia.setPose('happy')
        void this.bia.hop()
        this.magnets.forEach(m => m.sleep())
        void FX.wait(this, 500).then(() => gen === this.gen && this.audio.yawn())
        const leaving = this.stranger
        if (leaving) void leaving.walk([{ x: PERSON.enterX, y: leaving.container.y }], 1000)
        await FX.wait(this, CELEBRATE_MS)
        if (gen !== this.gen) return
        await this.zoomTo(WIDE)
        if (gen !== this.gen) return
        await this.hud.celebrate(this.mazeIndex)
        if (gen !== this.gen) return
        await FX.wait(this, NEXT_MAZE_MS)
        if (gen !== this.gen) return

        const next = this.mazeIndex + 1
        if (next < this.level.mazes.length) {
            await this.fadeStage()
            if (gen !== this.gen) return
            void this.startMaze(next)
            return
        }
        void this.endLevel()
    }

    private async fadeStage() {
        const people = [this.carer, this.stranger].filter((p): p is PersonView => !!p).map(p => p.container)
        await Promise.all([
            this.mazeView?.fadeOut(),
            FX.to(this, [...people, this.bia.container], { alpha: 0 }, { duration: 320 }),
        ])
    }

    private async showStranger() {
        const gen = this.gen
        const stranger = this.stranger
        if (!stranger) return
        this.carer?.clear()
        stranger.clear()
        this.bia.setPose('show')
        const card = this.bia.takeCard()
        this.audio.whoosh()
        await stranger.hold(card)
        if (gen !== this.gen) return
        this.audio.fail()
        await stranger.think(['home', 'school'])
        if (gen !== this.gen) return
        this.carer?.setPose('worry')
        this.bia.setPose('oops')
        await FX.wait(this, SHOW_LOSS_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.releaseFinger()
        this.setZones(false)
        this.hud.setHelpEnabled(false)

        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level })
        this.hud.lives.loseAll()
        this.livesLeft = this.hud.lives.remaining
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.hud.setVisible(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        await playFinale(this, this.audio, () => gen === this.gen)
        if (gen !== this.gen) return
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.aqua,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: 'Cofre fechado!',
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.mazes.length, current: this.level.mazes.length },
            ...(this.level.level < LEVELS.length
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
                              color: C.aqua,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private async explain() {
        if (this.guiding) return
        if (this.mode === 'walk' || this.mode === 'edge') return this.explainMaze()
        if (this.mode === 'choose') return this.explainPeople()
    }

    private async explainMaze() {
        const gen = this.gen
        this.releaseFinger()
        this.leaveEdge()
        this.stopWalker()
        if (this.to) return
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        const ghost = createBia(this)
        ghost.container.setAlpha(0).setDepth(DEPTH.bia - 1)
        ghost.setTrail(false)
        try {
            const magnet = this.magnets[0]
            if (!magnet || !(await this.guide.magnet(magnet))) return
            const path = (safePath(this.maze) ?? []).slice(0, 3)
            if (path.length < 3) return
            const start = cellCenter(path[0])
            ghost.place(start.x, start.y)
            ghost.face('right')
            await FX.to(this, ghost.container, { alpha: 0.6 }, { duration: 200 })
            await this.guide.walk({
                at: start,
                to: cellCenter(path[2]),
                walk: () => this.demoWalk(ghost, path[0], path.slice(1)),
            })
        } finally {
            await this.guide.hide()
            ghost.destroy()
            this.guiding = false
        }
        if (gen !== this.gen) return
        this.walk()
    }

    private async explainPeople() {
        const gen = this.gen
        const people = this.bySlot()
        if (people.length < 2) return
        this.mode = 'panel'
        this.guiding = true
        this.setZones(false)
        this.hud.setHelpEnabled(false)
        this.endChoice()
        try {
            for (const who of people) {
                await who.repeat()
                if (gen !== this.gen) return
            }
        } finally {
            this.guiding = false
        }
        if (gen !== this.gen) return
        this.choose()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.mazesDone / this.level.mazes.length) * 100),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.level.level) {
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.scene.pause()
            if (command.type === 'RESUME_GAME') this.scene.resume()
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
