import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, POINTS, decode, entryOf, guideKey, phaseTable, phaseTime, symbolAt, totalPixels } from '../data/levels'
import { DEPTH, PLAY, TABLET, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import { HELP, ORDER, ORDER_LETTERS, SAY, TEACH, TEACH2, TEACH3, YOUR_TURN } from '../data/words'
import type { Bit, Entry, LevelDef, Mode, PhaseDef } from '../types'

import { createAim, type Aim } from './aim'
import { createAudio, type Audio } from './audio'
import { showBanner } from './banner'
import { createBlaster, type Blaster } from './blaster'
import { createControls, type Controls } from './controls'
import { spot, teach, union } from './guide'
import { createHeader } from './header'
import { createHud, type Hud } from './hud'
import { createOrder, type Order } from './order'
import { createStopwatch, type Stopwatch } from './stopwatch'
import { createSubpixels, type Subpixels } from './subpixels'
import { createSwarm, type Fujao, type Swarm } from './swarm'
import { createTable, type Table } from './table'
import { createTablet, type Tablet } from './tablet'

const GAME_ID = 'pixels-fujoes'
const ERROR_MS = 2400
const FINALE_MS = 1600
/** balão estreito, ao lado da figurinha */
const SIDE = { x: 1060, w: 400 } as const
/** onde os fujões flutuam: o recorte dos balões com fujão na tela */
const ARENA = { x: 640, y: 360, w: 1010, h: 340 } as const
const ARENA_BALLOON = { balloonX: 640, balloonY: 568 } as const
/** o número do cartão começa a pular um pouco depois de o balão abrir */
const WAVE_DELAY = 450

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private introduce = false
    private returned = 0
    private lookX = 0
    private lookY = 0
    private lastTarget: Fujao | null = null
    private focus: Fujao | null = null

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private tablet!: Tablet
    private swarm!: Swarm
    private aim!: Aim
    private blaster!: Blaster
    private controls!: Controls
    private table!: Table
    private order!: Order
    private hud!: Hud
    private stopwatch!: Stopwatch
    private header?: { destroy(): void }
    private banner?: Phaser.GameObjects.Container
    private subpixels?: Subpixels

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get kind() {
        return this.level.kind
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
        this.mode = 'intro'
        this.returned = 0
        this.lookX = 0
        this.lookY = 0
        this.lastTarget = null
        this.focus = null
        this.banner = undefined
        this.header = undefined
        this.subpixels = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.tablet = createTablet(this, this.kind, this.level.view, this.level.given)
        this.swarm = createSwarm(this, this.tablet, this.kind, this.level.view)
        this.swarm.onDodge = () => this.audio.dodge()
        this.blaster = createBlaster(this)
        this.aim = createAim(this)
        this.controls = createControls(this, ['0', '1'])
        this.controls.onPress(bit => this.onPress(bit))
        this.header = createHeader(this)
        this.table = createTable(this, this.kind, this.level.given)
        this.order = createOrder(this)
        this.stopwatch = createStopwatch(this, { onDanger: () => this.audio.hurry(), onEmpty: () => void this.timeUp() })
        if (this.kind === 'rgb') this.subpixels = createSubpixels(this)
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
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.hud?.destroy()
        this.banner?.destroy()
        this.subpixels?.destroy()
        this.stopwatch?.destroy()
        this.controls?.destroy()
        this.order?.destroy()
        this.table?.destroy()
        this.header?.destroy()
        this.aim?.destroy()
        this.blaster?.destroy()
        this.swarm?.destroy()
        this.tablet?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(_time: number, deltaMs: number) {
        if (!this.tablet) return
        const dt = Math.min(deltaMs, 50) / 1000
        const zoomed = this.tablet.zoomed
        const tx = zoomed ? Phaser.Math.Clamp((this.aim.x - W / 2) * PLAY.look, -PLAY.lookMax, PLAY.lookMax) : 0
        const ty = zoomed ? Phaser.Math.Clamp((this.aim.y - TABLET.playY) * PLAY.look, -PLAY.lookMax, PLAY.lookMax) : 0
        const e = 1 - Math.exp(-6 * dt)
        this.lookX += (tx - this.lookX) * e
        this.lookY += (ty - this.lookY) * e
        this.tablet.setLook(this.lookX, this.lookY)
        this.aim.update(dt, this.swarm)
        this.swarm.update(dt, this.lookX, this.lookY)
        this.blaster.update(dt, this.aim.x, this.aim.y)
        const target = this.aim.target
        if (target && target !== this.lastTarget && this.mode === 'play') this.audio.lock()
        this.lastTarget = target
        if (this.kind === 'ascii') this.trackLetter(target)
        this.stopwatch.setRunning(this.mode === 'play' && this.swarm.list.some(f => f.state === 'free' || f.state === 'held'))
        this.stopwatch.tick(dt * 1000)
    }

    /**
     * O código da letra é comprido: o cartão dela acende enquanto ela está na mira (ou fisgada, com o raio
     * voando), e os números que ela já tem ficam ciano. O próximo a mandar é o primeiro branco.
     */
    private trackLetter(target: Fujao | null) {
        const keep = (f: Fujao | null) => !!f && (f.state === 'held' || (f.state === 'free' && f.sent.length > this.level.given))
        if (target) this.focus = target
        else if (!keep(this.focus)) this.focus = null
        this.table.track(this.focus?.entry.id ?? null, this.focus?.sent.length ?? 0)
    }

    // ───────────────────────────────────────────── fases

    private async openLevel() {
        this.preparePhase(0)
        this.tablet.show(this.phase.rows)
        void this.startPhase()
    }

    private preparePhase(f: number) {
        this.phaseIndex = f
        this.returned = 0
        this.swarm.configure(this.phase.speed, this.phase.dash, this.phase.dodge)
        this.table.setEntries(phaseTable(this.level, this.phase))
        this.order.set(this.phase.escaped.length, this.kind === 'ascii' ? ORDER_LETTERS : ORDER)
        this.stopwatch.reset(phaseTime(this.level, this.phase))
        this.hud.setPhase(f)
    }

    private async startPhase() {
        const gen = ++this.gen
        this.mode = 'intro'
        const phase = this.phase
        const first = this.introduce && this.phaseIndex === 0
        await FX.wait(this, first ? 1200 : 600)
        if (gen !== this.gen) return
        this.audio.zoom(true)
        await this.tablet.zoom(true)
        if (gen !== this.gen) return

        if (first) {
            await this.introBefore(gen)
            if (gen !== this.gen) return
        }

        const entries = phase.escaped.map(cell => entryOf(this.kind, symbolAt(phase.rows, cell)) as Entry)
        await this.swarm.spawn(phase.escaped, entries, this.level.given, i => this.audio.escape(i))
        if (gen !== this.gen) return

        await this.gearUp(true)
        if (gen !== this.gen) return

        if (first) {
            await this.introAfter(gen)
            if (gen !== this.gen) return
        }

        this.play()
    }

    /** a primeira vez de cada nível, antes de os fujões saírem: o que a figura guarda e como vira número */
    private async introBefore(gen: number) {
        const picture = this.tablet.pictureRect()
        if (this.kind === 'bit') {
            await this.lesson(gen, [{ text: TEACH.pixels, ...spot(picture), balloonX: SIDE.x, balloonY: 330, buttonLabel: 'Próximo' }], SIDE.w)
            if (gen !== this.gen) return
            void this.table.bump()
            await this.tablet.xray(true, row => this.audio.scan(row))
            if (gen !== this.gen) return
            await this.lesson(gen, [{ text: TEACH.numbers, ...spot(union(picture, this.table.rect())), balloonX: SIDE.x, balloonY: 400, buttonLabel: 'Próximo' }], SIDE.w)
            if (gen !== this.gen) return
            await this.tablet.xray(false)
            if (gen !== this.gen) return
            await FX.wait(this, 250)
            return
        }
        if (this.kind === 'rgb' && this.subpixels) {
            const lupa = this.subpixels
            await this.lesson(gen, [{ text: TEACH2.colors, ...spot(picture), balloonX: SIDE.x, balloonY: 330, buttonLabel: 'Próximo' }], SIDE.w)
            if (gen !== this.gen) return
            await lupa.show()
            if (gen !== this.gen) return
            await this.lesson(gen, [{ text: TEACH2.lights, ...spot(lupa.rect()), balloonX: 640, balloonY: 600, buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
            this.soon(gen, () => {
                void this.table.bump('Y')
                void lupa.wave()
                void this.table.wave('Y')
            })
            await this.lesson(gen, [{ text: TEACH2.code, ...spot(union(lupa.rect(), this.table.rect())), balloonX: 640, balloonY: 600, buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
            await lupa.hide()
            return
        }
        this.soon(gen, () => void this.table.bump())
        await this.lesson(gen, [{ text: TEACH3.letters, ...spot(union(picture, this.table.rect())), balloonX: 640, balloonY: 560, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        this.soon(gen, () => void this.table.wave(undefined, this.level.given))
        await this.lesson(gen, [{ text: TEACH3.prefix, ...spot(this.table.rect()), balloonX: 640, balloonY: 330, buttonLabel: 'Próximo' }])
    }

    /** a animação que acompanha o balão começa depois de ele abrir */
    private soon(gen: number, run: () => void) {
        void FX.wait(this, WAVE_DELAY).then(() => {
            if (gen === this.gen) run()
        })
    }

    /** a primeira vez de cada nível, com os fujões na tela: o próprio jogo devolve o primeiro, sem balão */
    private async introAfter(gen: number) {
        const opening = this.kind === 'bit' ? TEACH.escaped : this.kind === 'rgb' ? TEACH2.three : TEACH3.smart
        this.swarm.paused = true
        await this.lesson(gen, [{ text: opening, ...spot(ARENA), ...ARENA_BALLOON, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.demo(gen)
        if (gen !== this.gen) return
        this.swarm.paused = true
        await this.lesson(gen, [{ text: YOUR_TURN, ...spot(ARENA), ...ARENA_BALLOON, buttonLabel: 'Vamos começar!' }])
        this.swarm.paused = false
    }

    private play() {
        this.mode = 'play'
        this.swarm.paused = false
        this.aim.setEnabled(true)
        this.controls.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    /** o codificador, a mira, o joystick e os botões entram (ou saem) juntos */
    private async gearUp(on: boolean) {
        if (on) this.aim.reset()
        await FX.all(this.blaster.setShown(on), this.controls.setShown(on), this.aim.setShown(on))
    }

    // ───────────────────────────────────────────── o raio

    private onPress(bit: Bit) {
        if (this.mode !== 'play') return
        void this.shoot(bit, this.aim.target)
    }

    /**
     * Cada raio leva um número, e o fujão espera o próximo do código dele. Número certo que não fecha o
     * código entra na caixinha; o que fecha transforma o fujão no código, que volta e o tablet lê. Número
     * errado em qualquer raio fecha o código assim mesmo, e o tablet lê outra coisa.
     */
    private async shoot(bit: Bit, target: Fujao | null) {
        const gen = this.gen
        this.audio.fire(bit)
        const to = () => (target ? { x: target.sx, y: target.sy } : { x: 0, y: 0 })
        if (!target) {
            const at = { x: this.aim.x, y: this.aim.y }
            await this.blaster.fire(bit, () => at)
            this.audio.fizz()
            void FX.sparks(this, at.x, at.y, { color: C.cyan, count: 8, spread: 40, size: 8, duration: 360, depth: DEPTH.fx })
            return
        }
        const code = target.entry.code
        const i = target.sent.length
        const right = bit === code[i]
        if (right && i + 1 < code.length) {
            this.swarm.hold(target)
            await this.blaster.fire(bit, to)
            if (gen !== this.gen) return
            this.audio.crack()
            this.swarm.hit(target, bit)
            return
        }
        const sent = right ? code : target.sent + bit + code.slice(i + 1)
        this.swarm.claim(target)
        await this.blaster.fire(bit, to)
        if (gen !== this.gen) return
        this.swarm.convert(target, sent)
        this.audio.convert()
        await this.swarm.home(target)
        if (gen !== this.gen) return
        const got = right ? target.entry : decode(this.kind, sent)
        this.audio.read()
        await this.tablet.read(target.cell, got, sent)
        if (gen !== this.gen) return
        if (!right) {
            if (this.mode !== 'error') void this.jam(target, got, sent)
            return
        }
        if (this.mode === 'error' || this.mode === 'done') return
        this.good(target)
    }

    private good(target: Fujao) {
        this.hits += 1
        this.done += 1
        this.returned += 1
        this.score += POINTS
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        this.audio.good()
        const p = this.tablet.cellPos(target.cell)
        void FX.sparks(this, p.x, p.y, { color: C.lit, count: 14, spread: 90, size: 8, duration: 520, depth: DEPTH.fx })
        void this.order.fill(target.entry)
        if (this.returned >= this.phase.escaped.length) void this.endPhase()
    }

    /** o próprio jogo devolve o primeiro fujão, com os outros parados: mira, acha no combinado e manda número por número */
    private async demo(gen: number) {
        const f = this.swarm.list.find(b => b.index === 0 && b.state === 'free')
        if (!f) return
        this.swarm.paused = true
        await this.aim.drive(() => ({ x: f.sx, y: f.sy }), 1000)
        if (gen !== this.gen) return
        if (this.phase.dodge > 0) {
            await FX.wait(this, 450)
            if (gen !== this.gen) return
            this.swarm.dodge(f)
            this.audio.dodge()
            await FX.wait(this, 1000)
            if (gen !== this.gen) return
            await this.aim.drive(() => ({ x: f.sx, y: f.sy }), 260)
            if (gen !== this.gen) return
        }
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await this.table.bump(f.entry.id)
        if (gen !== this.gen) return
        await FX.wait(this, 250)
        if (gen !== this.gen) return
        const code = f.entry.code
        for (let i = f.sent.length; i < code.length; i++) {
            const bit = code[i] as Bit
            this.controls.show(bit)
            void this.controls.ring(bit)
            await this.shoot(bit, f)
            if (gen !== this.gen) return
            if (i === code.length - 1) break
            await FX.wait(this, 420)
            if (gen !== this.gen) return
            await this.aim.drive(() => ({ x: f.sx, y: f.sy }), 220)
            if (gen !== this.gen) return
        }
        await FX.wait(this, 400)
    }

    // ───────────────────────────────────────────── fim da fase

    private async endPhase() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.aim.setEnabled(false)
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        await FX.wait(this, 350)
        if (gen !== this.gen) return
        await this.gearUp(false)
        if (gen !== this.gen) return
        this.audio.cheer()
        if (this.kind === 'bit') {
            await this.tablet.xray(true, row => this.audio.scan(row))
            if (gen !== this.gen) return
            await FX.wait(this, 520)
            if (gen !== this.gen) return
            await this.tablet.xray(false)
            if (gen !== this.gen) return
        } else {
            const r = this.tablet.pictureRect()
            void FX.sparks(this, r.x, r.y, { color: C.lit, count: 26, spread: r.w * 0.6, size: 10, duration: 700, depth: DEPTH.fx })
            await FX.wait(this, 600)
            if (gen !== this.gen) return
        }
        await this.tablet.hop()
        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        this.swarm.clear()
        this.audio.zoom(false)
        await this.tablet.zoom(false)
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 < this.level.phases.length) {
            this.preparePhase(this.phaseIndex + 1)
            await this.tablet.slideTo(this.phase.rows)
            if (gen !== this.gen) return
            void this.startPhase()
            return
        }
        this.emitCheckpoint()
        void this.endLevel()
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2], balloonWidth?: number) {
        const before = this.mode
        this.mode = 'guide'
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps, balloonWidth)
        if (gen !== this.gen) return
        this.mode = before
    }

    // ───────────────────────────────────────────── erro

    /** o código errado voltou e o tablet mostrou o que ele significa: a figura (ou a mensagem) ficou errada */
    private async jam(target: Fujao, got: Entry, code: string) {
        const gen = this.gen
        this.mode = 'error'
        this.aim.setEnabled(false)
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.blom()
        void this.order.fill(got, true)
        await this.tablet.mark(target.cell)
        if (gen !== this.gen) return
        this.banner = showBanner(this, SAY.wrong(this.kind, target.entry, got, code))
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.audio.fail()
        this.lose()
    }

    /** o cronômetro zerou com fujão ainda solto: o raio que estiver voando não conta mais, e a partida acaba */
    private async timeUp() {
        if (this.mode !== 'play') return
        const gen = ++this.gen
        this.mode = 'error'
        this.swarm.paused = true
        this.aim.setEnabled(false)
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.blom()
        this.banner = showBanner(this, SAY.timeUp)
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
        this.aim.setEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.mode !== 'play') return
        const gen = this.gen
        this.mode = 'help'
        this.swarm.paused = true
        this.aim.setEnabled(false)
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.soon(gen, () => void this.table.bump())
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP[this.kind], ...spot(this.table.rect()), balloonY: 300, buttonLabel: 'Continuar' },
        ])
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim do nível

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
        this.audio.win()
        void FX.confetti(this, { colors: [C.lit, C.cyan, C.pink, C.lime, C.text] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        this.mode = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.pink,
            panelColor: C.panel,
            overlayColor: C.shadow,
            titleColor: CSS.text,
            subtitleColor: CSS.cyan,
            messageColor: CSS.textSoft,
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
                              color: C.pink,
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
            progress: Math.min(100, Math.round((this.done / totalPixels(this.level)) * 100)),
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
