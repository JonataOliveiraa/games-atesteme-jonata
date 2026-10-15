import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { PIECE_SHEET } from '../data/files'
import { COMPUTER_PORT, LEVELS, POINTS, buildPlay, decode, distance, entryOf, guideKey, lookOf, phaseTable, totalSends, wordOf } from '../data/levels'
import { DEPTH, DESK, DIVE, DRIVE, PLAY } from '../data/layout'
import { BIT_COLOR, C, CSS, FONT, SIZE } from '../data/theme'
import { HELP, SAY, TEACH } from '../data/words'
import type { Bit, Entry, LevelDef, Mode } from '../types'

import { fit } from './art'
import { createAudio, type Audio } from './audio'
import { showBanner } from './banner'
import { createCar, type Car } from './car'
import { createControls, type Controls } from './controls'
import { createDesk, type Desk } from './desk'
import { spot, teach, union } from './guide'
import { createHeader } from './header'
import { createHud, type Hud } from './hud'
import { createOrder, type Order } from './order'
import { createRace, type Race } from './race'
import { createTable, type Table } from './table'
import { createTube, type Tube } from './tube'

const GAME_ID = 'corrida-no-cabo'
const ERROR_MS = 2600
const FINALE_MS = 1600
/** o fio de 7 px vira o tubo de 150 px */
const ZOOM = PLAY.tube / DESK.cable

const smooth = (t: number) => t * t * (3 - 2 * t)

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private introduce = false
    private demoing = false
    private guideNext = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private desk!: Desk
    private tube!: Tube
    private car!: Car
    private race!: Race
    private table!: Table
    private order!: Order
    private controls!: Controls
    private hud!: Hud
    private header?: { destroy(): void }
    private banner?: Phaser.GameObjects.Container
    /** o combinado da fase (nas palavras, só as letras dela) */
    private combinado: Entry[] = []
    private watchers: Array<{ test: () => boolean; resolve: () => void }> = []

    private unsubPlatform?: () => void

    private get want(): Entry {
        return entryOf(this.level, this.level.phases[this.phaseIndex][this.index])
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.phaseIndex = 0
        this.index = 0
        this.mode = 'intro'
        this.demoing = false
        this.guideNext = false
        this.banner = undefined
        this.watchers = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        const bits = this.level.bits
        this.audio = createAudio()
        this.desk = createDesk(this, bits)
        this.desk.root.setDepth(DEPTH.desk)
        this.tube = createTube(this, this.level.gap)
        this.tube.setAlpha(0)
        this.car = createCar(this, this.tube.carLayer)
        this.race = createRace(this.tube, this.car, { bits, cruise: this.level.cruise }, {
            pending: (i, bit) => {
                this.order.setSlot(i, bit, false)
                this.audio.choose()
            },
            pass: (i, bit) => this.onPass(i, bit),
            waiting: on => {
                if (on) this.audio.brake()
                this.car.ask(on)
            },
            arrived: () => void this.arrive(),
        })
        this.header = createHeader(this)
        this.combinado = phaseTable(this.level, 0)
        this.table = createTable(this, this.combinado)
        this.order = createOrder(this, bits, this.level.kind)
        this.controls = createControls(this)
        this.controls.onPress(bit => this.onPress(bit))
        this.hud = createHud(this, {
            phases: this.level.phases.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)

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
        this.watchers.forEach(w => w.resolve())
        this.watchers = []
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.hud?.destroy()
        this.banner?.destroy()
        this.controls?.destroy()
        this.order?.destroy()
        this.table?.destroy()
        this.header?.destroy()
        this.race?.stop()
        this.car?.destroy()
        this.tube?.destroy()
        this.desk?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(_time: number, deltaMs: number) {
        if (!this.race) return
        this.race.update(Math.min(deltaMs, 50) / 1000)
        if (this.race.running) this.audio.engineSpeed(this.race.speed / (this.level.cruise + DRIVE.flowMax * DRIVE.flowStep))
        if (this.watchers.length) {
            this.watchers = this.watchers.filter(w => {
                if (!w.test()) return true
                w.resolve()
                return false
            })
        }
    }

    private until(test: () => boolean): Promise<void> {
        if (test()) return Promise.resolve()
        return new Promise(resolve => this.watchers.push({ test, resolve }))
    }

    private tween(ms: number, onUpdate: (t: number) => void): Promise<void> {
        return new Promise(resolve => {
            const s = { t: 0 }
            this.tweens.add({
                targets: s,
                t: 1,
                duration: FX.ms(this, ms),
                ease: 'Linear',
                onUpdate: () => onUpdate(s.t),
                onComplete: () => {
                    onUpdate(1)
                    resolve()
                },
                onStop: () => resolve(),
            })
        })
    }

    // ───────────────────────────────────────────── nível, fase e envio

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        this.preparePhase(0)
        this.desk.setShape(this.level.shapes[0])
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        void this.startSend(0)
    }

    private preparePhase(f: number) {
        this.phaseIndex = f
        this.hud.setPhase(f)
        this.tube.build(buildPlay(this.level, this.level.shapes[f]), this.level.bits)
        this.combinado = phaseTable(this.level, f)
        if (f > 0) this.table.setEntries(this.combinado)
    }

    /** na mesa: o pedido, o sinal sai do notebook e a câmera mergulha no fio */
    private async startSend(i: number) {
        const gen = ++this.gen
        this.index = i
        this.mode = 'ask'
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.emitCheckpoint()
        this.desk.rest()
        this.tube.setAlpha(0)
        this.tube.dimAll()
        this.desk.clearRead()
        const want = this.want
        this.desk.sending(lookOf(want))
        this.audio.pop(0)
        const word = wordOf(this.level, this.phaseIndex)
        if (word && i > 0) this.desk.show({ glyph: word.slice(0, i) })
        await this.order.set(want, word || undefined, i)
        if (gen !== this.gen) return

        const first = this.introduce && this.phaseIndex === 0 && i === 0
        if (first) this.introduce = false
        if (first && this.level.level === 1) {
            this.demoing = true
            await this.story(gen, want)
            if (gen !== this.gen) return
        } else {
            if (first) await this.levelIntro(gen, word)
            if (gen !== this.gen) return
            await this.encode(gen, want)
            if (gen !== this.gen) return
            if (first && this.level.level === 2) {
                const where = union(union(this.table.cardRect(want.id), this.desk.laptopRect()), this.order.rect())
                await this.lesson(gen, [{ text: TEACH.letterCode, ...spot(where), balloonX: 880, balloonY: 420, buttonLabel: 'Vamos!' }])
                if (gen !== this.gen) return
            }
        }

        await FX.wait(this, 250)
        if (gen !== this.gen) return
        this.audio.whoosh()
        await this.desk.spark(DIVE.from, DIVE.spark)
        if (gen !== this.gen) return
        await this.diveIn()
        if (gen !== this.gen) return

        if (this.guideNext) {
            this.guideNext = false
            await this.lesson(gen, [{ text: TEACH.yourTurn, ...spot(this.controls.rect()), balloonX: 520, balloonY: 520, buttonLabel: 'Vamos começar!' }])
            if (gen !== this.gen) return
        }

        const start = this.tube.pose(this.tube.startS)
        this.audio.engine(true)
        await this.car.emerge(start.x, start.y, start.angle)
        if (gen !== this.gen) return
        if (this.demoing) {
            const p = this.tube.toScreen(start)
            await this.lesson(gen, [{ text: TEACH.car, ...spot({ x: p.x, y: p.y, w: 200, h: 150 }), balloonX: 800, balloonY: 300, buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
        }
        this.race.start()
        this.order.focus(0)
        this.mode = 'race'
        if (this.demoing) {
            void this.demo(gen)
            return
        }
        this.controls.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    /** o fio da mesa cresce até virar o tubo; no fim, o tubo aparece por cima */
    private async diveIn() {
        const d = this.desk.poseAt(DIVE.from)
        this.tube.startView()
        const startPose = this.tube.pose(this.tube.startS)
        const q = this.tube.toScreen(startPose)
        const turn = startPose.angle - d.angle
        await this.tween(DIVE.inMs, t => {
            const e = smooth(t)
            this.desk.view(d.x, d.y, Phaser.Math.Linear(d.x, q.x, e), Phaser.Math.Linear(d.y, q.y, e), Math.pow(ZOOM, e), turn * e)
            const k = Phaser.Math.Clamp((t - DIVE.fadeAt) / (1 - DIVE.fadeAt), 0, 1)
            this.desk.root.setAlpha(1 - k)
            this.tube.setAlpha(k)
        })
        this.desk.root.setVisible(false)
        this.tube.setAlpha(1)
        void this.controls.setShown(true)
    }

    /** do conector do tubo de volta para a mesa, no computador que recebe */
    private async diveOut() {
        this.tube.endView()
        const endPose = this.tube.pose(this.tube.endS)
        const e0 = this.tube.toScreen(endPose)
        const c = this.desk.endPose()
        const turn = endPose.angle - c.angle
        this.desk.root.setVisible(true).setAlpha(0)
        await this.tween(DIVE.outMs, t => {
            const e = smooth(t)
            this.desk.view(c.x, c.y, Phaser.Math.Linear(e0.x, c.x, e), Phaser.Math.Linear(e0.y, c.y, e), Math.pow(ZOOM, 1 - e), turn * (1 - e))
            const k = Phaser.Math.Clamp(t / (1 - DIVE.fadeAt), 0, 1)
            this.desk.root.setAlpha(k)
            this.tube.setAlpha(1 - k)
        })
        this.desk.rest()
        this.tube.setAlpha(0)
    }

    private onPress(bit: Bit) {
        if (this.mode !== 'race') return
        this.race.press(bit)
    }

    private onPass(i: number, bit: Bit) {
        this.tube.light(i, bit)
        this.audio.bit(bit)
        this.order.setSlot(i, bit, true)
        this.order.focus(i + 1)
        const p = this.tube.toScreen(this.tube.lanePoint(this.tube.gates[i], bit === '1' ? PLAY.lane : -PLAY.lane))
        void FX.sparks(this, p.x, p.y, { color: BIT_COLOR[bit], count: 12, spread: 90, size: 9, depth: DEPTH.fx })
    }

    // ───────────────────────────────────────────── chegada: guardar, ler, desenhar

    private async arrive() {
        const gen = ++this.gen
        this.mode = 'arrive'
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.engine(false)
        void this.controls.setShown(false)
        this.order.focus(null)
        const end = this.tube.pose(this.tube.dockS + 60)
        await this.car.dock(end.x, end.y)
        if (gen !== this.gen) return
        this.audio.plug()
        await this.diveOut()
        if (gen !== this.gen) return
        void FX.ping(this, COMPUTER_PORT.x, COMPUTER_PORT.y, C.one, { radius: 46, depth: DEPTH.fx })

        const sent = this.race.sent
        await this.desk.store(sent, bit => this.audio.bit(bit))
        if (gen !== this.gen) return
        await FX.wait(this, 180)
        const got = decode(sent, this.combinado)
        await this.read(got, gen)
        if (gen !== this.gen) return

        if (!got || got.id !== this.want.id) {
            await this.jam(sent, got, gen)
            return
        }
        this.audio.cheer()
        void FX.sparks(this, this.desk.showSpot().x, this.desk.showSpot().y, { color: C.one, count: 16, spread: 120, depth: DEPTH.fx })
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        if (this.demoing) {
            this.demoing = false
            const screen = this.desk.computerScreen()
            await this.lesson(gen, [{ text: TEACH.read, ...spot({ ...screen, w: screen.w + 30, h: screen.h + 30 }), balloonX: 420, balloonY: 330, buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
            this.guideNext = true
        }
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        if (this.index + 1 < this.level.phases[this.phaseIndex].length) {
            void this.startSend(this.index + 1)
            return
        }
        void this.endPhase()
    }

    /** o computador procura o código no combinado, cartão por cartão */
    private async read(got: Entry | null, gen: number) {
        for (const entry of this.combinado) {
            this.audio.tic()
            await this.table.bump(entry.id)
            if (gen !== this.gen) return
            if (got && entry.id === got.id) break
        }
        if (got) {
            const card = this.table.cardRect(got.id)
            void FX.ping(this, card.x, card.y, C.one, { radius: 90, depth: DEPTH.fx })
            this.audio.appear()
            const from = this.table.figurePos(got.id)
            const to = this.desk.showSpot()
            const flyer = got.glyph
                ? this.add
                      .text(from.x, from.y, got.glyph, { fontFamily: FONT.black, fontSize: `${SIZE.glyph}px`, color: CSS.accent, stroke: CSS.white, strokeThickness: 6 })
                      .setOrigin(0.5)
                      .setResolution(2)
                : fit(this, PIECE_SHEET, got.frame ?? 4, 46)
            flyer.setPosition(from.x, from.y).setDepth(DEPTH.fx)
            await FX.all(FX.arcTo(this, flyer, to, { height: 60, duration: 520 }), FX.to(this, flyer, { scale: flyer.scale * 2 }, { duration: 520 }))
            flyer.destroy()
            if (gen !== this.gen) return
            const word = wordOf(this.level, this.phaseIndex)
            this.desk.show(got.glyph ? { glyph: word.slice(0, this.index) + got.glyph } : lookOf(got))
            return
        }
        await FX.all(...this.combinado.map(e => this.table.shake(e.id)))
        if (gen !== this.gen) return
        this.audio.noise()
        await this.desk.noise()
    }

    private async endPhase() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.audio.cheer()
        await this.desk.party()
        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        if (this.phaseIndex + 1 < this.level.phases.length) {
            const next = this.phaseIndex + 1
            this.desk.clearRead()
            this.desk.sending(null)
            this.order.clearSlots()
            this.audio.whoosh()
            this.preparePhase(next)
            await this.desk.swapShape(this.level.shapes[next])
            if (gen !== this.gen) return
            await FX.wait(this, 350)
            if (gen !== this.gen) return
            void this.startSend(0)
            return
        }
        this.emitCheckpoint()
        void this.endLevel()
    }

    // ───────────────────────────────────────────── tutorial do N1

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.mode
        this.mode = 'guide'
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps)
        if (gen !== this.gen) return
        this.mode = before
    }

    /** a primeira vez: o fio liga os dois, a figura não passa nele, e só passa o código dela */
    private async story(gen: number, want: Entry) {
        await this.lesson(gen, [{ text: TEACH.cable, ...spot({ x: 640, y: 470, w: 1240, h: 440 }), balloonY: 225, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        await this.desk.bounce()
        this.audio.blom()
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.stuck(want.id), ...spot(this.desk.laptopRect()), balloonX: 800, balloonY: 420, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        await this.encode(gen, want)
        if (gen !== this.gen) return
        const where = union(union(this.table.cardRect(want.id), this.desk.laptopRect()), this.order.rect())
        await this.lesson(gen, [{ text: TEACH.code(want.id), ...spot(where), balloonX: 880, balloonY: 420, buttonLabel: 'Ver' }])
    }

    /** N2 e N3 começam dizendo o que mudou: agora é palavra; agora é o código de verdade */
    private async levelIntro(gen: number, word: string) {
        if (this.level.level === 2) {
            await this.lesson(gen, [{ text: TEACH.word(word), ...spot(this.order.rect()), balloonY: 260, buttonLabel: 'Próximo' }])
            return
        }
        if (this.level.level === 3) {
            this.combinado.forEach(e => [0, 1, 2].forEach(k => this.table.markDigit(e.id, k, true)))
            await this.lesson(gen, [
                { text: TEACH.ascii, ...spot(this.table.rect()), balloonY: 300, buttonLabel: 'Próximo' },
                { text: TEACH.everyone, ...spot(this.table.rect()), balloonY: 300, buttonLabel: 'Vamos!' },
            ])
            this.combinado.forEach(e => [0, 1, 2].forEach(k => this.table.markDigit(e.id, k, false)))
        }
    }

    /** em todo envio: o cartão pula, o código voa para o notebook (a figura vira 1 e 0) e fica à vista no visor */
    private async encode(gen: number, want: Entry) {
        await this.table.bump(want.id)
        if (gen !== this.gen) return
        const spots = this.desk.codeSpots(want.code.length)
        await FX.all(
            ...[...want.code].map((d, k) =>
                this.flyDigit(want.id, k, d as Bit, spots[k], k * 140).then(() => {
                    if (gen === this.gen) this.order.ghost(k, d as Bit)
                }),
            ),
        )
        if (gen !== this.gen) return
        this.desk.showCode(want.code)
        this.audio.appear()
    }

    /** um número do cartão voa até a tela do notebook */
    private async flyDigit(id: string, k: number, d: Bit, to: { x: number; y: number }, delay: number) {
        await FX.wait(this, delay)
        const from = this.table.digitPos(id, k)
        const t = this.add
            .text(from.x, from.y, d, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.code}px`,
                color: Phaser.Display.Color.IntegerToColor(BIT_COLOR[d]).rgba,
                stroke: CSS.ink,
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setDepth(DEPTH.fx)
        this.audio.bit(d)
        await FX.all(FX.arcTo(this, t, to, { height: 80, duration: 640 }), FX.to(this, t, { scale: 1.45 }, { duration: 640 }))
        t.destroy()
    }

    /** o próprio jogo dirige o primeiro envio, porta por porta */
    private async demo(gen: number) {
        const code = this.want.code
        for (let i = 0; i < code.length; i++) {
            const bit = code[i] as Bit
            if (i === 0) {
                await this.until(() => this.race.isWaiting)
                if (gen !== this.gen) return
                const g = this.tube.toScreen(this.tube.pose(this.tube.gates[0]))
                const gate = { x: g.x, y: g.y, w: 170, h: 330 }
                await this.lesson(gen, [{ text: TEACH.gate, ...spot(union(gate, this.controls.rect())), balloonX: 1000, balloonY: 300, buttonLabel: 'Ver' }])
            } else await this.until(() => this.race.gate >= i)
            if (gen !== this.gen) return
            await FX.wait(this, i === 0 ? 450 : 140)
            if (gen !== this.gen) return
            this.controls.show(bit)
            void this.controls.ring(bit)
            this.race.press(bit)
        }
    }

    // ───────────────────────────────────────────── erro

    /** chegou outra figura, ou nada: os números trocados tremem no visor, na memória e no cartão pedido */
    private async jam(sent: string, got: Entry | null, gen: number) {
        this.mode = 'error'
        this.hud.setHelpEnabled(false)
        const want = this.want
        this.audio.blom()
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        void this.table.bump(want.id)
        ;[...sent].forEach((d, i) => {
            if (d === want.code[i]) return
            void this.order.shakeSlot(i)
            void this.desk.shakeMemory(i)
            this.table.markDigit(want.id, i, true)
        })
        const text = !got
            ? SAY.unknown(sent)
            : distance(sent, want.code) === 1
              ? SAY.flipped(want.id, got.id)
              : SAY.other(want.id, got.id, want.code)
        this.banner = showBanner(this, text)
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.audio.fail()
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.controls.setEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.mode !== 'race' || this.demoing) return
        const gen = this.gen
        this.mode = 'help'
        this.race.paused = true
        this.audio.engine(false)
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP.code, ...spot(this.order.rect()), balloonY: 260, buttonLabel: 'Próximo' },
            { text: HELP.gates, ...spot(this.controls.rect()), balloonX: 520, balloonY: 520, buttonLabel: 'Continuar' },
        ])
        if (gen !== this.gen) return
        this.mode = 'race'
        this.race.paused = false
        this.audio.engine(true)
        this.controls.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.hud.setHelpEnabled(false)
        this.controls.setEnabled(false)
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.audio.win()
        void FX.confetti(this, { colors: [C.one, C.zero, C.lilac, C.mint, C.heart] })
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
            progress: { total: this.level.phases.length, current: this.level.phases.length },
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
            progress: Math.min(100, Math.round((this.done / totalSends(this.level)) * 100)),
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
