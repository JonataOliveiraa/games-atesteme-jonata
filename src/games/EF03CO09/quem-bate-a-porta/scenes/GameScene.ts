import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, OPENING_KEY, POINTS, answerOf, guideKey, judge, ownerAllows, spreads, type Verdict } from '../data/levels'
import { DEPTH, DOOR, DOOR_X, FLOOR, SHOT } from '../data/layout'
import { C, CSS } from '../data/theme'
import { HELP, REPLY, SAY, TEACH } from '../data/words'
import type { Action, Choice, DoorId, InfoId, LevelDef, Mode, Request } from '../types'

import { createAudio, type Audio } from './audio'
import { createBalloon, createSay, type Balloon } from './balloon'
import { showBanner } from './banner'
import { createButtons, type Buttons } from './buttons'
import { createEraseCard, type EraseCard } from './erase'
import { spot, teach, union } from './guide'
import { createHall, type Hall } from './hall'
import { createHint, type Hint } from './hint'
import { createHud, type Hud } from './hud'
import { playOpening } from './opening'
import { trail } from './trail'

const GAME_ID = 'quem-bate-a-porta'
const FLY_MS = 620
const HAPPY_MS = 450
const NEXT_MS = 450
const ERROR_MS = 2000
const FINALE_MS = 1800
const DEMO_LOOK_MS = 900
const REPLY_MS = 1700

type Point = { x: number; y: number }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private introduce = false
    private lockTo: Action | null = null
    private asked = false
    private eraseTap?: () => void

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private hall!: Hall
    private buttons!: Buttons
    private balloon?: Balloon
    private say?: { destroy(): void }
    private eraseCard?: EraseCard
    private hint!: Hint
    private hud!: Hud
    private banner?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    private get request(): Request {
        return this.level.requests[this.index]
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
        this.asked = false
        this.eraseTap = undefined
        this.balloon = undefined
        this.say = undefined
        this.eraseCard = undefined
        this.banner = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.hall = createHall(this)
        this.hall.jump(SHOT.wide)
        this.buttons = createButtons(this)
        this.hint = createHint(this)
        this.hud = createHud(this, {
            phases: this.level.requests.length,
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
        this.balloon?.destroy()
        this.say?.destroy()
        this.eraseCard?.destroy()
        this.hint?.destroy()
        this.banner?.destroy()
        this.buttons?.destroy()
        this.hall?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── toques

    private bindInput() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            if (this.mode === 'erase' && this.eraseCard?.hitTrash(pointer.x, pointer.y)) {
                this.eraseTap?.()
                return
            }
            const hit = this.buttons.hit(pointer.x, pointer.y)
            if (hit) this.choose(hit)
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === 'ArrowLeft') this.choose('send')
        else if (event.code === 'ArrowRight') this.choose('keep')
        else if (event.code === 'ArrowUp') this.choose('ask')
    }

    private choose(action: Action) {
        if (this.mode !== 'input' || this.guiding) return
        if (this.lockTo && action !== this.lockTo) return
        if (action === 'ask') {
            if (this.request.owner && !this.asked) void this.onAsk()
            return
        }
        void this.play(action)
    }

    // ───────────────────────────────────────────── nível e pedidos

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        if (this.level.level === 1 && !this.registry.get(OPENING_KEY)) {
            this.registry.set(OPENING_KEY, true)
            await playOpening(this, this.hall)
            if (gen !== this.gen) return
        } else await FX.wait(this, 300)
        this.hud.show(true)
        this.audio.pop(0)
        await this.buttons.show()
        if (gen !== this.gen) return
        void this.startRequest(0)
    }

    private async startRequest(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.lockTo = null
        this.asked = false
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.buttons.enable(false)
        this.emitCheckpoint()

        if (this.introduce && index === 0) {
            const goalSpot = this.level.level === 2 ? this.doorRect('davi') : this.hall.rowRect()
            await this.lesson(gen, [{ text: this.level.goal, ...spot(goalSpot), balloonX: 640, balloonY: 560, buttonLabel: 'Ver' }])
            if (gen !== this.gen) return
            if (this.level.erase) {
                await this.eraseDemo(gen, this.level.erase)
                if (gen !== this.gen) return
            }
            for (const r of this.level.demo) {
                await this.demo(gen, r)
                if (gen !== this.gen) return
            }
            this.hall.reset()
            this.asked = false
            await this.buttons.setAsk(!!this.request.owner)
            await this.lesson(gen, [{ text: TEACH.yourTurn, ...spot(this.buttons.rect()), balloonY: 470, buttonLabel: 'Vamos lá!' }])
            if (gen !== this.gen) return
        }

        await FX.wait(this, 300)
        if (gen !== this.gen) return
        const r = this.request
        await this.buttons.setAsk(!!r.owner)
        if (gen !== this.gen) return
        const balloon = await this.knockOpen(r, gen)
        if (!balloon) return
        this.buttons.enable(true)
        if (this.introduce && r.guided) this.point(balloon, r)
        this.mode = 'input'
        this.hud.setHelpEnabled(true)
    }

    /** primeiras jogadas: a seta mostra o próximo toque certo (perguntar, ou a resposta) */
    private point(balloon: Balloon, r: Request) {
        const target: Action = r.owner && !this.asked ? 'ask' : answerOf(r)
        this.lockTo = target
        this.hint.show(balloon.iconPoint(), this.buttonTop(target))
    }

    private buttonTop(action: Action) {
        const c = this.buttons.center(action)
        return { x: c.x, y: c.y - 58 }
    }

    private doorRect(id: DoorId) {
        const a = this.hall.toScreen({ x: DOOR_X[id] - DOOR.half - 12, y: FLOOR - DOOR.h - 12 })
        const b = this.hall.toScreen({ x: DOOR_X[id] + DOOR.half + 12, y: FLOOR + 4 })
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: b.x - a.x, h: b.y - a.y }
    }

    private personRect(id: DoorId) {
        const door = this.hall.doorScreen(id)
        return { x: door.x, y: (door.top + door.bottom) / 2, w: door.half * 2 + 24, h: door.bottom - door.top + 24 }
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

    /** toc, toc: a câmera vai até a porta, ela abre e a pessoa pede */
    private async knockOpen(r: Request, gen: number): Promise<Balloon | undefined> {
        const door = this.hall.doors[r.asker]
        this.audio.knock()
        await door.knock()
        if (gen !== this.gen) return undefined
        await this.hall.frame(this.hall.doorShot(r.asker), 700)
        if (gen !== this.gen) return undefined
        this.audio.creak()
        void this.hall.focus(r.asker)
        await door.open('ask')
        if (gen !== this.gen) return undefined
        const balloon = createBalloon(this, r, this.hall.doorScreen(r.asker))
        this.balloon = balloon
        this.audio.voice()
        await balloon.show()
        if (gen !== this.gen) return undefined
        return balloon
    }

    /** o próprio jogo joga um pedido: a explicação, a seta, o "toque" e o resultado, sem contar ponto */
    private async demo(gen: number, r: Request) {
        if (r.owner) {
            await this.demoOwned(gen, r)
            return
        }
        this.mode = 'guide'
        await this.buttons.setAsk(false)
        const balloon = await this.knockOpen(r, gen)
        if (!balloon) return
        const answer = answerOf(r)
        const low = { balloonX: 640, balloonY: 560 }
        await this.lesson(gen, [
            { text: TEACH.who[r.asker], ...spot(this.personRect(r.asker)), ...low, buttonLabel: 'Próximo' },
            { text: TEACH.ask(r), ...spot(balloon.rect()), ...low, buttonLabel: 'Próximo' },
            { text: TEACH.why(r, answer), ...spot(balloon.rect()), ...low, buttonLabel: 'Próximo' },
            { text: TEACH.then(answer), ...spot(this.buttons.rect(answer)), balloonX: 640, balloonY: 440, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return
        this.mode = 'guide'
        await this.demoTap(balloon, answer, gen)
        if (gen !== this.gen) return
        await this.act(answer, r, balloon, gen)
        if (gen !== this.gen) return
        await this.hall.frame(SHOT.wide)
        await FX.wait(this, 400)
    }

    /** N2: a informação é do Davi. Primeiro perguntar, depois decidir pelo que ele disse. */
    private async demoOwned(gen: number, r: Request) {
        this.mode = 'guide'
        this.asked = false
        await this.buttons.setAsk(true)
        const balloon = await this.knockOpen(r, gen)
        if (!balloon) return
        const low = { balloonX: 640, balloonY: 560 }
        await this.lesson(gen, [
            { text: TEACH.who[r.asker], ...spot(this.personRect(r.asker)), ...low, buttonLabel: 'Próximo' },
            { text: TEACH.ask(r), ...spot(balloon.rect()), ...low, buttonLabel: 'Próximo' },
            { text: TEACH.owner, ...spot(balloon.rect()), ...low, buttonLabel: 'Próximo' },
            { text: TEACH.askFirst, ...spot(this.buttons.rect('ask')), balloonX: 640, balloonY: 440, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return
        this.mode = 'guide'
        await this.demoTap(balloon, 'ask', gen)
        if (gen !== this.gen) return
        const next = await this.askOwner(r, gen)
        if (!next) return
        const answer = answerOf(r)
        await this.lesson(gen, [
            { text: TEACH.replied(ownerAllows(r)), ...spot(next.rect()), ...low, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return
        this.mode = 'guide'
        await this.demoTap(next, answer, gen)
        if (gen !== this.gen) return
        await this.act(answer, r, next, gen)
        if (gen !== this.gen) return
        await this.hall.frame(SHOT.wide)
        await FX.wait(this, 400)
    }

    private async demoTap(balloon: Balloon, action: Action, gen: number) {
        this.hint.show(balloon.iconPoint(), this.buttonTop(action))
        await FX.wait(this, DEMO_LOOK_MS)
        if (gen !== this.gen) return
        this.hint.hide()
        this.hint.tap(this.buttons.center(action))
        this.buttons.press(action)
        this.audio.tic()
        await FX.wait(this, 250)
    }

    // ───────────────────────────────────────────── perguntar ao Davi (N2)

    private async onAsk() {
        const gen = this.gen
        const r = this.request
        this.mode = 'act'
        this.lockTo = null
        this.hint.hide()
        this.hud.setHelpEnabled(false)
        this.buttons.enable(false)
        this.buttons.press('ask')
        this.audio.tic()
        const balloon = await this.askOwner(r, gen)
        if (!balloon) return
        this.buttons.enable(true)
        if (this.introduce && r.guided) this.point(balloon, r)
        this.mode = 'input'
        this.hud.setHelpEnabled(true)
    }

    /** a Nina bate na porta do Davi; ele responde, e a resposta fica escrita no balão de quem pediu */
    private async askOwner(r: Request, gen: number): Promise<Balloon | undefined> {
        const owner = r.owner
        if (!owner) return undefined
        const davi = this.hall.doors[owner]
        const yes = ownerAllows(r)
        const old = this.balloon
        this.balloon = undefined
        if (old) await old.hide()
        if (gen !== this.gen) return undefined
        void this.hall.focus(null)
        await this.hall.frame(this.hall.doorShot(owner), 700)
        if (gen !== this.gen) return undefined
        this.audio.knock()
        await davi.knock()
        if (gen !== this.gen) return undefined
        this.audio.creak()
        void this.hall.focus(owner)
        await davi.open(yes ? 'happy' : 'ask')
        if (gen !== this.gen) return undefined
        const say = createSay(this, 'DAVI', yes ? REPLY.yes : REPLY.no, this.hall.doorScreen(owner))
        this.say = say
        this.audio.voice()
        await say.show()
        await FX.wait(this, REPLY_MS)
        if (gen !== this.gen) return undefined
        await say.hide()
        this.say = undefined
        void this.hall.focus(null)
        this.audio.shut()
        await davi.close()
        if (gen !== this.gen) return undefined
        await this.hall.frame(this.hall.doorShot(r.asker), 700)
        if (gen !== this.gen) return undefined
        void this.hall.focus(r.asker)
        this.asked = true
        this.buttons.enableAsk(false)
        const balloon = createBalloon(this, r, this.hall.doorScreen(r.asker), yes)
        this.balloon = balloon
        await balloon.show()
        if (gen !== this.gen) return undefined
        return balloon
    }

    // ───────────────────────────────────────────── apagar (abertura do N3)

    /** "ontem" a Nina mandou a foto; a criança apaga, e a foto continua nas portas dos outros */
    private async eraseDemo(gen: number, info: InfoId) {
        this.hall.doors.stranger.receive(info)
        this.hall.lightFar(info)
        await this.buttons.hide()
        if (gen !== this.gen) return
        const card = createEraseCard(this, info)
        this.eraseCard = card
        await card.show()
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.erase.sent(info), ...spot(union(card.rect(), this.hall.farRect())), balloonX: 640, balloonY: 150, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return

        this.mode = 'erase'
        this.hint.show({ x: card.trashAt.x - 170, y: card.trashAt.y - 190 }, { x: card.trashAt.x, y: card.trashAt.y - 54 })
        await new Promise<void>(resolve => (this.eraseTap = resolve))
        this.eraseTap = undefined
        if (gen !== this.gen) return
        this.mode = 'guide'
        this.hint.hide()
        this.audio.tic()
        await card.wipe()
        if (gen !== this.gen) return
        await this.hall.frame(SHOT.forward, 900)
        if (gen !== this.gen) return
        this.audio.fizz()
        await this.hall.pulseFar()
        if (gen !== this.gen) return
        const far = this.hall.farRect()
        await this.lesson(gen, [
            { text: TEACH.erase.still, ...spot(far), balloonX: 640, balloonY: 560, buttonLabel: 'Próximo' },
            { text: TEACH.erase.rule, ...spot(far), balloonX: 640, balloonY: 560, buttonLabel: 'Próximo' },
        ])
        if (gen !== this.gen) return
        card.destroy()
        this.eraseCard = undefined
        await this.hall.frame(SHOT.wide)
        if (gen !== this.gen) return
        await this.buttons.show()
    }

    // ───────────────────────────────────────────── enviar ou não

    private async play(choice: Choice) {
        const gen = this.gen
        const balloon = this.balloon
        if (!balloon) return
        const r = this.request
        this.mode = 'act'
        this.lockTo = null
        this.hint.hide()
        this.hud.setHelpEnabled(false)
        this.buttons.enable(false)
        this.buttons.press(choice)
        this.audio.tic()

        const verdict = await this.act(choice, r, balloon, gen)
        if (gen !== this.gen) return
        if (verdict !== 'ok') {
            await this.jam(this.reason(r, verdict))
            return
        }
        await this.hall.frame(SHOT.wide)
        if (gen !== this.gen) return
        await this.success(gen)
    }

    private reason(r: Request, verdict: Verdict) {
        if (verdict === 'unasked') return SAY.unasked(r)
        if (verdict === 'refused') return SAY.refused()
        if (verdict === 'missed') return SAY.missed(r, this.asked)
        return SAY.forwarded(r)
    }

    /** a informação sai do balão: entra pela porta ou volta para o botão, e o efeito acontece */
    private async act(choice: Choice, r: Request, balloon: Balloon, gen: number): Promise<Verdict> {
        const door = this.hall.doors[r.asker]
        const verdict = judge(r, choice, this.asked)
        const icon = balloon.takeIcon()
        void balloon.hide()
        this.balloon = undefined

        if (choice === 'send') {
            this.audio.whoosh()
            await this.fly(icon, this.hall.toScreen(door.chest()), 0.35, C.glow)
            void FX.ping(this, icon.x, icon.y, C.glow, { radius: 60, duration: 360, depth: DEPTH.fx })
            icon.destroy()
            if (gen !== this.gen) return 'ok'
            if (verdict !== 'ok') {
                this.audio.blom()
                if (r.asker === 'stranger') await door.boast()
                else await door.cheer()
                if (gen !== this.gen) return 'ok'
                if (spreads(r)) {
                    void this.hall.focus(r.asker, true)
                    await this.hall.frame(r.asker === 'stranger' ? SHOT.forward : SHOT.wide, 800)
                    if (gen !== this.gen) return 'ok'
                    this.audio.fizz()
                    await this.hall.spread(r.asker, r.info)
                    if (gen !== this.gen) return 'ok'
                }
                if (r.owner) await this.ownerSad(r.owner, gen)
                return verdict
            }
            door.receive(r.info)
            this.audio.cheer()
            await door.cheer()
            if (gen !== this.gen) return 'ok'
            await FX.wait(this, HAPPY_MS)
            if (gen !== this.gen) return 'ok'
            this.audio.shut()
            void this.hall.focus(null)
            await door.close()
            return 'ok'
        }

        this.audio.hop()
        const home = this.buttons.center('keep')
        await this.fly(icon, home, 0.3, C.mint)
        void FX.ping(this, home.x, home.y, C.mint, { radius: 70, duration: 380, depth: DEPTH.fx })
        this.buttons.press('keep')
        icon.destroy()
        if (gen !== this.gen) return 'ok'
        if (verdict !== 'ok') {
            this.audio.blom()
            await door.mourn()
            if (gen !== this.gen) return 'ok'
            await FX.wait(this, 300)
            return verdict
        }
        await FX.wait(this, 250)
        if (gen !== this.gen) return 'ok'
        this.audio.shut()
        void this.hall.focus(null)
        await door.close()
        return 'ok'
    }

    /** o dono da informação aparece triste na porta dele */
    private async ownerSad(owner: DoorId, gen: number) {
        await FX.wait(this, 400)
        if (gen !== this.gen) return
        void this.hall.focus(null)
        await this.hall.frame(this.hall.doorShot(owner), 700)
        if (gen !== this.gen) return
        void this.hall.focus(owner)
        this.audio.creak()
        await this.hall.doors[owner].open('sad')
        if (gen !== this.gen) return
        await this.hall.doors[owner].mourn()
    }

    private fly(img: Phaser.GameObjects.Image, to: Point, endScale: number, color: number) {
        const from = { x: img.x, y: img.y }
        const s0 = img.scaleX
        const k = { t: 0 }
        let stop: (() => void) | undefined
        return new Promise<void>(resolve =>
            this.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(this, FLY_MS),
                ease: 'Sine.easeInOut',
                onStart: () => {
                    stop = trail(this, img, color, dot => dot.setDepth(DEPTH.flying - 1))
                },
                onUpdate: () => {
                    img.setPosition(Phaser.Math.Linear(from.x, to.x, k.t), Phaser.Math.Linear(from.y, to.y, k.t) - Math.sin(k.t * Math.PI) * 110)
                    const pop = 1 + Math.sin(Math.min(1, k.t * 3) * Math.PI) * 0.25
                    img.setScale(s0 * Phaser.Math.Linear(1, endScale, k.t) * pop)
                    img.setAngle(Math.sin(k.t * Math.PI * 2) * 14)
                },
                onComplete: () => {
                    stop?.()
                    resolve()
                },
                onStop: () => {
                    stop?.()
                    resolve()
                },
            }),
        )
    }

    private async success(gen: number) {
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        await this.hud.celebrate(this.index)
        if (gen !== this.gen) return
        await FX.wait(this, NEXT_MS)
        if (gen !== this.gen) return
        if (this.index + 1 < this.level.requests.length) {
            void this.startRequest(this.index + 1)
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
        if (this.mode !== 'input' || this.guiding || !this.balloon) return
        const gen = this.gen
        const steps: Parameters<typeof teach>[2] = [
            { text: HELP.balloon, ...spot(this.balloon.rect()), balloonY: 620, buttonLabel: 'Próximo' },
            { text: HELP.buttons, ...spot(this.buttons.rect()), balloonY: 470, buttonLabel: 'Continuar' },
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

    // ───────────────────────────────────────────── fim do nível: o corredor inteiro

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

        await this.hall.frame(SHOT.wide, 700)
        if (gen !== this.gen) return
        let i = 0
        for (const door of Object.values(this.hall.doors)) {
            if (!(await door.shine())) continue
            this.audio.pop(i++)
            if (gen !== this.gen) return
        }
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.star, C.mint, C.lilac, C.accent, 0xffffff] })
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
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.requests.length, current: this.level.requests.length },
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
            progress: Math.min(100, Math.round((this.index / this.level.requests.length) * 100)),
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
