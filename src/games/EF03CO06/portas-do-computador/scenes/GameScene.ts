import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEVICES } from '../data/devices'
import { LEVELS, POINTS, answerOf, guideKey } from '../data/levels'
import { H, SHOT, W, WALK_MS, WINDOW } from '../data/layout'
import { C, CSS } from '../data/theme'
import { HELP, SAY, TEACH } from '../data/words'
import type { DeviceId, InfoId, LevelDef, Mission, Mode } from '../types'

import { createAudio, type Audio } from './audio'
import { showBanner } from './banner'
import { createDoors, type Doors } from './doors'
import { createFinale, type Finale } from './finale'
import { spot, teach, union, type Rect } from './guide'
import { createComputer, type Computer } from './computer'
import { createHud, type Hud } from './hud'
import { createWalker, type Walker } from './info'
import { createKid, type Kid } from './kid'

const GAME_ID = 'portas-do-computador'
const HOP_MS = 560
const WORK_MS = 800
const NEXT_MS = 500
const ERROR_MS = 1900
const FINALE_MS = 2400
const INSIDE = { fromX: WINDOW.x - 128, toX: WINDOW.x - 94, feet: WINDOW.y + 62, scale: 0.6 }
const WIRE_MS = 320

type Shot = { x: number; y: number; zoom: number }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private introduce = false
    private lockTo: DeviceId | null = null
    private shot: Shot = { ...SHOT.wide }

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private computer!: Computer
    private doors!: Doors
    private walker?: Walker
    private kid!: Kid
    private finale!: Finale
    private hud!: Hud
    private banner?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    private get mission(): Mission {
        return this.level.missions[this.index]
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
        this.introduce = false
        this.lockTo = null
        this.shot = { ...SHOT.wide }
        this.walker = undefined
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
        this.computer = createComputer(this, this.level.missions.length)
        this.doors = createDoors(this)
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
        this.kid?.destroy()
        this.walker?.destroy()
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
            const hit = this.inputDoors().find(id => this.doors[id].contains(pointer.worldX, pointer.worldY))
            if (hit) this.tapDoor(hit)
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        const digit = Number(event.key)
        if (digit >= 1 && digit <= 3) {
            const ids = this.inputDoors().sort((a, b) => this.doors[a].y - this.doors[b].y)
            if (ids[digit - 1]) this.tapDoor(ids[digit - 1])
            return
        }
        if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
            event.preventDefault()
            this.kid.advance()
        }
    }

    private inputDoors(): DeviceId[] {
        return (Object.keys(this.doors) as DeviceId[]).filter(id => DEVICES[id].side === 'input' && this.doors[id].visible)
    }

    private wake(on: boolean, keep?: DeviceId) {
        ;(Object.keys(this.doors) as DeviceId[]).forEach(id => this.doors[id].awake((on && DEVICES[id].side === 'input') || id === keep))
    }

    private doorsRect(): Rect {
        return this.inputDoors()
            .map(id => this.doors[id].rect())
            .reduce((a, b) => union(a, b))
    }

    private tapDoor(id: DeviceId) {
        if (this.mode !== 'input' || this.guiding) return
        if (this.lockTo && id !== this.lockTo) return
        void this.pass(id)
    }

    // ───────────────────────────────────────────── nível e missão

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        const cam = this.cameras.main
        this.shot = { ...SHOT.kid }
        cam.setZoom(SHOT.kid.zoom)
        cam.centerOn(SHOT.kid.x, SHOT.kid.y)

        await this.kid.enter('ask')
        if (gen !== this.gen) return
        await this.kid.say(this.level.hello, 'Vamos lá!')
        if (gen !== this.gen) return
        await Promise.all([this.kid.leave(), this.frame(SHOT.wide, 1000)])
        if (gen !== this.gen) return
        for (const id of this.level.doors) {
            void this.doors[id].show(true, true)
            this.audio.door()
            await FX.wait(this, 160)
        }
        if (gen !== this.gen) return
        void this.startMission(0)
    }

    private async startMission(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.lockTo = null
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.emitCheckpoint()
        this.wake(false)
        const m = this.mission
        const tour = this.introduce && index === 0

        if (tour) {
            await this.lesson(gen, [{ text: TEACH.computer, ...spot(this.computer.rect()), balloonX: 1040, balloonY: 420, buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
        }

        this.walker?.destroy()
        const walker = createWalker(this, m.info)
        this.walker = walker
        await walker.arrive(WALK_MS, k => this.audio.step(k))
        if (gen !== this.gen) return

        if (m.debut) {
            const door = this.doors[m.debut]
            await this.close(door.x + 60, door.y - 20)
            if (gen !== this.gen) return
            this.audio.door()
            await door.show(true, true)
            await FX.wait(this, 350)
            await this.frame(SHOT.wide)
            if (gen !== this.gen) return
        }

        this.wake(true)
        if (this.introduce && m.guided) {
            const steps: Parameters<typeof teach>[2] = []
            if (tour) steps.push({ text: TEACH.info(m.info), ...spot(walker.rect()), balloonX: 760, balloonY: 560, buttonLabel: 'Próximo' })
            const door = this.doors[answerOf(m.info)]
            steps.push({ text: TEACH.door[m.info], ...spot(door.rect()), balloonX: 820, balloonY: door.y, buttonLabel: 'Ok' })
            await this.lesson(gen, steps)
            if (gen !== this.gen) return
            this.lockTo = answerOf(m.info)
        }
        this.mode = 'input'
        this.hud.setHelpEnabled(true)
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

    // ───────────────────────────────────────────── a informação passa pela porta

    private async pass(id: DeviceId) {
        const gen = this.gen
        const walker = this.walker
        if (!walker) return
        const m = this.mission
        const door = this.doors[id]
        this.mode = 'send'
        this.lockTo = null
        this.hud.setHelpEnabled(false)
        this.wake(false, id)
        this.audio.hop()

        await Promise.all([walker.hop(door.x, door.y, HOP_MS, 0.6), this.close(door.x + 40, door.y, HOP_MS)])
        if (gen !== this.gen) return

        if (id !== answerOf(m.info)) {
            this.audio.bump()
            await Promise.all([door.refuse(), walker.bounceBack()])
            if (gen !== this.gen) return
            await this.jam(id, m.info)
            return
        }

        if (id === 'mic') this.audio.voice()
        else if (id === 'camera') this.audio.flash()
        else this.audio.keys()
        await Promise.all([door.open(), walker.vanish()])
        if (gen !== this.gen) return
        await door.pulse(WIRE_MS)
        if (gen !== this.gen) return

        await this.close(WINDOW.x, WINDOW.y)
        if (gen !== this.gen) return
        await walker.appear(INSIDE.fromX, INSIDE.feet, INSIDE.scale)
        await walker.walkTo(INSIDE.toX, 360)
        if (gen !== this.gen) return
        this.computer.work(true)
        this.audio.blip()
        await FX.wait(this, WORK_MS)
        if (gen !== this.gen) return
        this.computer.work(false)
        walker.pose('happy')
        this.audio.hop()

        const slot = this.computer.slot(this.index)
        await Promise.all([this.frame(SHOT.wide), walker.hop(slot.x, slot.y, 620, 0.28)])
        if (gen !== this.gen) return
        walker.destroy()
        this.walker = undefined
        this.computer.fill(this.index, m.info)
        this.audio.pop(this.index)
        await this.success(gen)
    }

    private async success(gen: number) {
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        await this.hud.celebrate(this.index)
        if (gen !== this.gen) return
        if (this.introduce && this.index === 0) {
            await this.lesson(gen, [{ text: TEACH.goal, ...spot(this.computer.goalRect()), balloonY: 330, buttonLabel: 'Vamos jogar!' }])
            if (gen !== this.gen) return
        }
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

    private async jam(door: DeviceId, info: InfoId) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        this.audio.blom()
        await this.frame(SHOT.wide)
        if (gen !== this.gen) return
        this.banner = showBanner(this, SAY.wrongDoor(door, info))
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
        if (this.mode !== 'input' || this.guiding || this.shot.zoom !== 1 || !this.walker) return
        const gen = this.gen
        const steps: Parameters<typeof teach>[2] = [
            { text: HELP.info, ...spot(this.walker.rect()), balloonX: 760, balloonY: 560, buttonLabel: 'Próximo' },
            { text: HELP.doors, ...spot(this.doorsRect()), balloonX: 860, balloonY: 420, buttonLabel: 'Próximo' },
            { text: HELP.goal, ...spot(this.computer.goalRect()), balloonY: 330, buttonLabel: 'Continuar' },
        ]
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

        this.wake(false)
        await Promise.all([this.kid.enter('happy'), this.frame(SHOT.kid, 900)])
        if (gen !== this.gen) return
        await this.kid.say(this.level.bye, 'Ok')
        if (gen !== this.gen) return
        await Promise.all([this.kid.leave(), this.frame(SHOT.wide, 800)])
        if (gen !== this.gen) return

        const infos = this.level.missions.map(m => m.info).filter((id, i, all) => all.indexOf(id) === i)
        await this.finale.show(infos, i => this.audio.pop(i))
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
            title: last ? 'Todas as informações entraram!' : `Nível ${this.level.level} completo!`,
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
