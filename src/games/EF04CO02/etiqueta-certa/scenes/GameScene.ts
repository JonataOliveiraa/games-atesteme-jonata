import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { BG } from '../data/files'
import { DEMO, LEVELS, POINTS, answer, guideKey, ruleAt, stamped, target } from '../data/levels'
import { BANNER, BOARD, DEPTH, H, SIGN, STRIP, TRAIN, W, WIDE_BANNER } from '../data/layout'
import { MAPS, statesFor, type MapDef } from '../data/maps'
import { C, CSS } from '../data/theme'
import { FIELD, HELP, SAY, TEACH, TEACH2, TEACH3 } from '../data/words'
import type { City, Field, LevelDef, Mode, Note, Phase, Rule, Train } from '../types'

import { createAudio, type Audio } from './audio'
import { showBanner } from './banner'
import { createBoard, type Board, type Rect } from './board'
import { createCamera, type Cam } from './camera'
import { createGo, type Go } from './go'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createLevers, type Levers } from './lever'
import { createLink, type Link } from './link'
import { createRails, type Rails } from './rails'
import { createSheds, type Sheds } from './sheds'
import { createSign, type Sign } from './sign'
import { createStampDesk, type StampDesk } from './stamp'
import { createStrip, type Label } from './strip'
import { createTrain, type TrainCar } from './train'

const GAME_ID = 'etiqueta-certa'
const NEXT_MS = 300
const ERROR_MS = 2600
const FINALE_MS = 1600
/** o quanto o trem anda depois da porta, sumindo debaixo do telhado */
const INTO_SHED = TRAIN.loco + TRAIN.gap + TRAIN.wagon
/** N1: todo balão fica à direita da etiqueta, estreito: longe do trem, dos galpões e da linha até a plaquinha */
const BESIDE = { x: 790, y: 300 }
const BALLOON_W = 420
/** no 2º trem a linha desce até o galpão de baixo: o balão sobe */
const ABOVE_Y = 210
/** N2/N3: abaixo da etiqueta comprida */
const WIDE_BALLOON = { x: 760, y: 400 }
const TOUR_WAIT = 500
/** no pátio largo o trem anda mais rápido: a viagem é 2–3 vezes mais longa */
const WIDE_SPEED = 440
/** o chão largo usa a bg sem a faixa da esquerda (o poste): espelhada, a emenda juntaria dois postes */
const WIDE_FLOOR = { frame: 'wide', cut: 220 }
/** o quanto o véu apaga o chão (cerca, flores e pedras recuam; trilho, trem, galpões e etiqueta ficam na frente) */
const WASH_ALPHA = 0.55

/** os trens do tutorial do N3: um que não é do recado e passa sem carimbo (vai aonde as alavancas do começo já levam), depois o do recado */
const DEMO_NOTE: Note = { name: 'Íris', field: 'to', value: 'Belém' }
const DEMO_PASS: Train = { name: 'Noah', to: 'Manaus', from: 'Recife', weight: 6, order: ['to', 'weight', 'name', 'from'], crate: 2, color: 2 }
const DEMO_TRAIN: Train = { name: 'Íris', to: 'Natal', from: 'Manaus', weight: 4, order: ['from', 'name', 'weight', 'to'], crate: 0, color: 1 }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private map!: MapDef
    private phaseIndex = 0
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private introduce = false
    private guided = false
    /** o campo que a placa mostra agora */
    private rule: Rule = 'to'
    /** o trem parado já levou o carimbo do recado */
    private inked = false

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private cam!: Cam
    private rails!: Rails
    private sheds!: Sheds
    private levers!: Levers
    private go!: Go
    private board!: Board
    private strip?: Label
    private desk?: StampDesk
    private sign!: Sign
    private link!: Link
    private hud!: Hud
    private floor: Phaser.GameObjects.Image[] = []
    private wash?: Phaser.GameObjects.Rectangle
    private banner?: Phaser.GameObjects.Container
    private car?: TrainCar

    private unsubPlatform?: () => void

    private get phase(): Phase {
        return this.level.phases[this.phaseIndex]
    }

    private get train(): Train {
        return this.phase.trains[this.index]
    }

    private get wide() {
        return this.map.width > W
    }

    private get balloon() {
        return this.wide ? WIDE_BALLOON : BESIDE
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.map = MAPS[number - 1]
        this.phaseIndex = 0
        this.index = 0
        this.mode = 'intro'
        this.guided = false
        this.rule = 'to'
        this.inked = false
        this.car = undefined
        this.banner = undefined
        this.floor = []
        this.wash = undefined
        this.strip = undefined
        this.desk = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.paintFloor()
        this.cam = createCamera(this, this.map)
        this.rails = createRails(this, this.map)
        this.sheds = createSheds(this, this.map)
        this.levers = createLevers(this, this.map, this.cam)
        this.levers.onFlip(() => {
            this.audio.lever()
            this.rails.light(this.levers.states)
        })
        this.go = createGo(this, this.map)
        this.go.onPress(() => void this.depart())
        if (this.map.board === 'strip') {
            this.strip = createStrip(this)
            this.board = this.strip
            this.strip.onPick(field => void this.stampField(field))
        } else this.board = createBoard(this)
        if (this.map.booth) {
            this.desk = createStampDesk(this, this.map)
            this.desk.onToggle(armed => this.arm(armed))
        }
        this.sign = createSign(this)
        this.link = createLink(this)
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
        this.cam.onLook(looking => this.showUi(!looking))
        this.setControls(false)

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

    /** o chão: uma tela no N1; no pátio largo, a mesma imagem repetida, espelhada uma sim, outra não, para as emendas casarem */
    private paintFloor() {
        const count = Math.ceil(this.map.width / W)
        const texture = this.textures.get(BG)
        if (this.wide && !texture.has(WIDE_FLOOR.frame)) {
            const source = texture.getSourceImage()
            texture.add(WIDE_FLOOR.frame, 0, WIDE_FLOOR.cut, 0, source.width - WIDE_FLOOR.cut, source.height)
        }
        for (let i = 0; i < count; i++) {
            const tile = this.add
                .image(i * W + W / 2, H / 2, BG, this.wide ? WIDE_FLOOR.frame : undefined)
                .setDisplaySize(W, H)
                .setFlipX(i % 2 === 1)
                .setDepth(DEPTH.floor)
            this.floor.push(tile)
        }
        this.wash = this.add.rectangle(0, 0, this.map.width, H, C.wash, WASH_ALPHA).setOrigin(0).setDepth(DEPTH.wash)
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.hud?.destroy()
        this.banner?.destroy()
        this.car?.destroy()
        this.link?.destroy()
        this.board?.destroy()
        this.desk?.destroy()
        this.sign?.destroy()
        this.go?.destroy()
        this.levers?.destroy()
        this.sheds?.destroy()
        this.rails?.destroy()
        this.cam?.destroy()
        this.floor.forEach(tile => tile.destroy())
        this.wash?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private setControls(on: boolean) {
        this.levers.setEnabled(on)
        this.go.setEnabled(on)
        this.cam.setEnabled(on)
        this.desk?.setEnabled(on && !this.inked)
        if (!on) {
            this.desk?.disarm()
            this.strip?.setPickable(false)
        }
    }

    /** N2/N3: arrastando o pátio, o HUD, a placa, a etiqueta e os botões saem da frente; voltam quando o pátio para */
    private showUi(on: boolean) {
        this.hud.show(on)
        this.sign.setShown(on)
        this.strip?.setShown(on)
        this.link.setShown(on)
        this.go.setShown(on)
        this.desk?.setShown(on)
    }

    /** um retângulo do mundo nas coordenadas da tela (o tutorial e a etiqueta são fixos na tela) */
    private onScreen(r: Rect): Rect {
        return { ...r, x: r.x - this.cameras.main.scrollX }
    }

    private shedOf(city: City) {
        return this.sheds.indexOf(city)
    }

    // ───────────────────────────────────────────── nível, fase e trem

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        if (this.introduce && this.level.level === 1) await this.tutorial(gen)
        if (this.introduce && this.level.level === 3) await this.tutorial3(gen)
        if (gen !== this.gen) return
        this.guided = this.introduce
        void this.startPhase(0)
    }

    private async startPhase(f: number) {
        const gen = ++this.gen
        this.phaseIndex = f
        this.mode = 'arrive'
        this.hud.setPhase(f)
        await this.openPhase(this.phase, gen)
        if (gen !== this.gen) return
        void this.startTrain(0)
    }

    /** as plaquinhas mostram as cidades da fase e as alavancas voltam para o começo; no pátio largo a câmera vai ver os galpões */
    private async openPhase(phase: Phase, gen: number) {
        this.rails.dim()
        if (phase.rule !== this.rule) void this.sign.flip(phase.rule)
        else this.sign.set(phase.rule)
        this.rule = phase.rule
        this.audio.pop(0)
        if (this.wide) await this.cam.panTo(this.map.width - W / 2)
        if (gen !== this.gen) return
        await this.sheds.set(phase.stations)
        if (gen !== this.gen) return
        if (this.levers.states.join() !== phase.start.join()) this.audio.lever()
        await this.levers.set(phase.start, true)
        this.rails.light(phase.start)
        if (this.desk) await this.desk.setNote(phase.note ?? null)
        if (this.wide) {
            await FX.wait(this, TOUR_WAIT)
            if (gen !== this.gen) return
            await this.cam.panTo(W / 2)
        }
    }

    /** o trem entra pela esquerda e para no sinal; a etiqueta salta do caixote para o quadro */
    private async arrive(train: Train, gen: number) {
        this.car?.destroy()
        const car = createTrain(this, train, this.wide ? WIDE_SPEED : TRAIN.speed)
        this.car = car
        const route = this.rails.route(this.levers.states)
        car.place(route, 0)
        this.go.signal(false)
        this.audio.toot()
        this.audio.roll(true)
        if (this.wide) void this.cam.panTo(W / 2)
        await car.run(route, route.stop, 'Cubic.easeOut')
        this.audio.roll(false)
        if (gen !== this.gen) return
        this.audio.pop(1)
        const crate = car.crate()
        await this.board.show(train, { x: crate.x - this.cameras.main.scrollX, y: crate.y })
    }

    private async startTrain(i: number) {
        const gen = ++this.gen
        this.index = i
        this.inked = false
        this.mode = 'arrive'
        this.hud.setHelpEnabled(false)
        this.setControls(false)
        this.emitCheckpoint()

        // N2, fase 3: a placa vira no meio da fase
        const rule = ruleAt(this.phase, i)
        if (rule !== this.rule) {
            this.rule = rule
            this.audio.toot()
            await this.sign.flip(rule)
            if (gen !== this.gen) return
        }
        await this.arrive(this.train, gen)
        if (gen !== this.gen) return

        if (this.introduce && this.level.level === 2 && i === 0) {
            if (this.phaseIndex === 0) await this.tutorial2(gen)
            if (this.phaseIndex === 1)
                await this.lesson(gen, [{ text: TEACH2.flip, ...spot(this.sign.rect()), balloonX: this.balloon.x, balloonY: this.balloon.y, buttonLabel: 'Ok!' }])
            if (gen !== this.gen) return
        }
        if (this.guided) {
            this.guided = false
            await this.lesson(gen, [{ text: TEACH.yourTurn, ...spot(this.board.rect()), balloonX: this.balloon.x, balloonY: this.balloon.y, buttonLabel: 'Vamos começar!' }])
            if (gen !== this.gen) return
            this.sign.glow(true)
            await this.link.draw(this.toField(this.rule))
            if (gen !== this.gen) return
            this.board.glow(this.rule, true)
        }
        this.mode = 'choose'
        this.setControls(true)
        this.hud.setHelpEnabled(true)
    }

    /** o trem segue as alavancas até a porta do galpão; no pátio largo a câmera vai junto */
    private async send(states: number[]) {
        const car = this.car
        if (!car) return
        const route = this.rails.route(states)
        this.audio.toot()
        this.audio.roll(true)
        if (this.wide) this.cam.follow(car.head())
        await car.run(route, route.door, 'Sine.easeInOut')
        this.cam.follow(null)
        this.audio.roll(false)
    }

    /** acertou: o trem entra no galpão e some debaixo do telhado */
    private async park(shed: number, gen: number) {
        const car = this.car
        if (!car) return
        this.audio.cheer()
        void this.board.hide()
        this.rails.dim()
        void this.sheds.cheer(shed)
        const route = this.rails.route(this.levers.states)
        this.audio.roll(true)
        void car.fade((INTO_SHED / (this.wide ? WIDE_SPEED : TRAIN.speed)) * 1000)
        await car.run(route, car.s + INTO_SHED, 'Sine.easeIn')
        this.audio.roll(false)
        if (gen !== this.gen) return
        car.destroy()
        if (this.car === car) this.car = undefined
        this.audio.plof()
    }

    /** a etiqueta que vale agora: com o carimbo, se ele já foi dado */
    private current(): Train {
        const note = this.phase.note
        return this.inked && note ? stamped(this.train, note) : this.train
    }

    private async depart() {
        if (this.mode !== 'choose') return
        const gen = this.gen
        const rule = this.rule
        const states = [...this.levers.states]
        this.mode = 'send'
        this.setControls(false)
        this.hud.setHelpEnabled(false)
        this.link.clear()
        this.sign.glow(false)
        this.board.glow(rule, false)

        const note = this.phase.note
        if (note && note.name === this.train.name && !this.inked) {
            await this.stopAtSignal(SAY.noteMissing(note.name), note.field)
            return
        }

        await this.send(states)
        if (gen !== this.gen) return

        const got = this.rails.route(states).shed
        const want = this.shedOf(target(this.phase, this.index))
        if (got !== want) {
            await this.jam(got, want)
            return
        }
        await this.park(got, gen)
        if (gen !== this.gen) return
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        await FX.wait(this, NEXT_MS)
        if (gen !== this.gen) return
        if (this.index + 1 < this.phase.trains.length) {
            this.rails.light(this.levers.states)
            void this.startTrain(this.index + 1)
            return
        }
        void this.endPhase()
    }

    private async endPhase() {
        const gen = ++this.gen
        this.mode = 'finale'
        await this.hud.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        if (this.phaseIndex + 1 < this.level.phases.length) {
            void this.startPhase(this.phaseIndex + 1)
            return
        }
        this.index = this.phase.trains.length
        this.emitCheckpoint()
        void this.endLevel()
    }

    // ───────────────────────────────────────────── N3: o carimbo

    private arm(armed: boolean) {
        if (this.mode !== 'choose' && this.mode !== 'stamp') return
        this.mode = armed ? 'stamp' : 'choose'
        this.levers.setEnabled(!armed)
        this.go.setEnabled(!armed)
        this.strip?.setPickable(armed)
    }

    /** o carimbo desce no campo tocado; só vale o campo do recado, no trem do recado */
    private async stampField(field: Field) {
        const note = this.phase.note
        if (this.mode !== 'stamp' || !note || !this.strip || !this.desk) return
        const gen = this.gen
        this.mode = 'send'
        this.setControls(false)
        this.hud.setHelpEnabled(false)
        this.audio.stamp()
        await this.strip.stamp(field, note.value, this.desk.origin())
        if (gen !== this.gen) return
        if (note.name !== this.train.name) {
            await this.stopAtSignal(SAY.wrongTrain(note.name), 'name')
            return
        }
        if (field !== note.field) {
            await this.stopAtSignal(SAY.wrongField(FIELD[note.field]), note.field)
            return
        }
        this.inked = true
        this.mode = 'choose'
        this.setControls(true)
        this.hud.setHelpEnabled(true)
    }

    // ───────────────────────────────────────────── tutoriais

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.mode
        this.mode = 'guide'
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps, BALLOON_W)
        if (gen !== this.gen) return
        this.mode = before
    }

    /** N1: o próprio jogo despacha dois trens; o campo se acha pelo nome, não pela linha */
    private async tutorial(gen: number) {
        const demo = DEMO
        await this.openPhase(demo, gen)
        if (gen !== this.gen) return

        // 1. o trem chega e a etiqueta salta para o quadro
        const first = demo.trains[0]
        await this.arrive(first, gen)
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.label, ...spot(this.board.rect()), balloonX: BESIDE.x, balloonY: BESIDE.y, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return

        // 2. cada linha tem um nome: as pílulas acendem uma por uma
        for (const field of first.order) {
            this.board.glow(field, true)
            this.audio.pop(0)
            await this.board.bump(field)
            await FX.wait(this, 380)
            this.board.glow(field, false)
            if (gen !== this.gen) return
        }
        await this.lesson(gen, [{ text: TEACH.names, ...spot(this.board.rect()), balloonX: BESIDE.x, balloonY: BESIDE.y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return

        // 3. da placa ao PARA da etiqueta, e do valor ao galpão
        await this.showMatch(demo.rule, first, gen)
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.match(first.to), ...spot(union(this.sign.rect(), this.board.rect())), balloonX: BESIDE.x, balloonY: BESIDE.y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return

        // 4. a alavanca vira sozinha e o trilho acende; 5. PARTIR
        await this.demoLevers(this.shedOf(answer(first, demo.rule)), gen)
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.lever, ...spot(union(this.levers.rect(0), this.sheds.area())), balloonX: BESIDE.x, balloonY: BESIDE.y, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.go, ...spot(this.go.rect()), balloonX: BESIDE.x, balloonY: BESIDE.y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.demoSend(demo.rule, first, gen)
        if (gen !== this.gen) return

        // 6. o PARA mudou de linha: a linha procura pelo nome, e o DE treme
        const second = demo.trains[1]
        await this.arrive(second, gen)
        if (gen !== this.gen) return
        const decoy = second.order.find(f => f !== 'to') ?? 'name'
        this.sign.glow(true)
        await this.link.draw(this.toField(decoy), 460)
        await FX.wait(this, 200)
        await this.link.retract()
        if (gen !== this.gen) return
        void this.board.shake('from')
        await this.showMatch(demo.rule, second, gen)
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.moved, ...spot(this.board.rect()), balloonX: BESIDE.x, balloonY: ABOVE_Y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.demoLevers(this.shedOf(answer(second, demo.rule)), gen)
        if (gen !== this.gen) return
        await this.demoSend(demo.rule, second, gen)
    }

    /** N2: o pátio é grande (a câmera passeia) e cada alavanca muda um trilho */
    private async tutorial2(gen: number) {
        const at = WIDE_BALLOON
        await this.lesson(gen, [{ text: TEACH2.wide, shape: 'none', balloonX: at.x, balloonY: at.y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        const k = this.map.switches.length - 1
        await this.cam.panTo(this.map.switches[k].lever.x + 260)
        if (gen !== this.gen) return
        // a última alavanca vira e desvira: o trilho aceso muda junto
        const before = [...this.levers.states]
        const flipped = before.map((s, i) => (i === k ? 1 - s : s))
        for (const states of [flipped, before]) {
            await FX.wait(this, 450)
            if (gen !== this.gen) return
            this.audio.lever()
            await this.levers.set(states, true)
            this.rails.light(states)
        }
        await this.lesson(gen, [{ text: TEACH2.levers, ...spot(this.onScreen(this.levers.rect(k))), balloonX: at.x, balloonY: at.y, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        await this.cam.panTo(W / 2)
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH2.drag, shape: 'none', balloonX: at.x, balloonY: at.y, buttonLabel: 'Ok!' }])
    }

    /** N3: o recado é de um NOME só. Um trem de mostra que não é o dele passa sem carimbo; no do recado, o jogo carimba, a etiqueta muda e o trem vai pelo valor novo */
    private async tutorial3(gen: number) {
        const desk = this.desk
        const strip = this.strip
        if (!desk || !strip) return
        const demo: Phase = { ...this.level.phases[0], note: DEMO_NOTE, trains: [DEMO_PASS, DEMO_TRAIN] }
        const at = WIDE_BALLOON
        await this.openPhase(demo, gen)
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH3.note, ...spot(this.onScreen(desk.noteRect())), balloonX: at.x, balloonY: at.y, buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return

        // o NOME não é o do recado: nada de carimbo, o trem segue
        await this.arrive(DEMO_PASS, gen)
        if (gen !== this.gen) return
        this.board.glow('name', true)
        await this.board.bump('name')
        await this.lesson(gen, [{ text: TEACH3.notThis(DEMO_NOTE.name), ...spot(this.board.rect()), balloonX: at.x, balloonY: at.y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        this.board.glow('name', false)
        await this.demoLevers(this.shedOf(answer(DEMO_PASS, demo.rule)), gen)
        if (gen !== this.gen) return
        await this.demoSend(demo.rule, DEMO_PASS, gen)
        if (gen !== this.gen) return

        await this.arrive(DEMO_TRAIN, gen)
        if (gen !== this.gen) return
        this.board.glow('name', true)
        await this.board.bump('name')
        await this.lesson(gen, [{ text: TEACH3.find(DEMO_NOTE.name), ...spot(this.board.rect()), balloonX: at.x, balloonY: at.y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        this.board.glow('name', false)

        await desk.press()
        this.audio.stamp()
        await strip.stamp(DEMO_NOTE.field, DEMO_NOTE.value, desk.origin())
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH3.stamp, ...spot(this.board.rect()), balloonX: at.x, balloonY: at.y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return

        const fixed = stamped(DEMO_TRAIN, DEMO_NOTE)
        this.sign.glow(true)
        await this.link.draw(this.toField(demo.rule))
        this.board.glow(demo.rule, true)
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        await this.demoLevers(this.shedOf(answer(fixed, demo.rule)), gen)
        if (gen !== this.gen) return
        await this.demoSend(demo.rule, fixed, gen)
    }

    /** da pílula da placa até a pílula do campo */
    private toField(field: Field) {
        const from = this.sign.pill()
        const to = this.board.pill(field)
        if (this.map.board === 'strip') {
            const lane = SIGN.y + SIGN.h / 2 + 4
            return [
                { x: from.x, y: from.y + 30 },
                { x: from.x, y: lane },
                { x: to.x, y: lane },
                { x: to.x, y: to.y - STRIP.pillH / 2 - 6 },
            ]
        }
        // N1: contorna a etiqueta pela esquerda para não passar por cima de texto
        const lane = SIGN.y + SIGN.h / 2 + 10
        const side = BOARD.x - BOARD.w / 2 - 22
        return [
            { x: from.x, y: from.y + 34 },
            { x: from.x, y: lane },
            { x: side, y: lane },
            { x: side, y: to.y },
            { x: to.x - BOARD.pillW / 2 - 12, y: to.y },
        ]
    }

    private async showMatch(rule: Rule, train: Train, gen: number) {
        this.sign.glow(true)
        await this.link.draw(this.toField(rule))
        if (gen !== this.gen) return
        this.board.glow(rule, true)
        this.audio.pop(1)
        await FX.wait(this, 250)
        const shed = this.shedOf(answer(train, rule))
        await this.link.draw([this.board.value(rule), this.sheds.plaque(shed)], 620)
    }

    /** o jogo vira as alavancas que faltam (no pátio largo, indo até cada uma) */
    private async demoLevers(shed: number, gen: number) {
        const want = statesFor(this.map, shed, this.levers.states)
        const changes = want.map((s, k) => (s !== this.levers.states[k] ? k : -1)).filter(k => k >= 0)
        if (!changes.length) return
        for (const k of changes) {
            if (this.wide) await this.cam.panTo(this.map.switches[k].lever.x)
            await FX.wait(this, 200)
            if (gen !== this.gen) return
            this.audio.lever()
            const next = this.levers.states.map((s, i) => (i === k ? want[k] : s))
            await this.levers.set(next, true)
            this.rails.light(next)
            await FX.wait(this, 350)
        }
        if (this.wide) await this.cam.panTo(W / 2)
    }

    private async demoSend(rule: Rule, train: Train, gen: number) {
        const want = this.shedOf(answer(train, rule))
        this.link.clear()
        this.sign.glow(false)
        this.board.glow(rule, false)
        this.audio.pop(2)
        await this.go.press()
        if (gen !== this.gen) return
        await this.send(this.levers.states)
        if (gen !== this.gen) return
        await this.park(want, gen)
        if (gen !== this.gen) return
        this.rails.light(this.levers.states)
    }

    // ───────────────────────────────────────────── erro

    /** o trem está na porta do galpão errado: o campo pedido acende, e a linha (ou a câmera) vai até o galpão certo */
    private async jam(got: number, want: number) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        const rule = this.rule
        const train = this.current()
        this.audio.blom()
        void this.sheds.shake(got)
        void this.car?.shake()
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        const decoy: Rule = rule === 'to' ? 'from' : 'to'
        const tookDecoy = this.shedOf(answer(train, decoy)) === got
        if (tookDecoy) void this.board.shake(decoy)
        this.sign.glow(true)
        this.board.glow(rule, true)
        await this.link.draw(this.toField(rule))
        if (gen !== this.gen) return
        const say = tookDecoy ? (rule === 'to' ? SAY.tookFrom : SAY.tookTo) : SAY.other(FIELD[rule], answer(train, rule))
        if (this.wide) {
            this.banner = showBanner(this, say, WIDE_BANNER)
            if (want >= 0) {
                await this.cam.panTo(this.map.sheds[want].x)
                if (gen !== this.gen) return
                await this.sheds.bump(want)
            }
        } else {
            if (want >= 0) await this.link.draw([this.board.value(rule), this.sheds.plaque(want)], 560)
            if (gen !== this.gen) return
            this.banner = showBanner(this, say, BANNER)
        }
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.audio.fail()
        this.lose()
    }

    /** N3: o erro do carimbo; o trem nem sai do sinal */
    private async stopAtSignal(say: string, field: Field) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        this.audio.blom()
        this.go.signal(false)
        void this.car?.shake()
        void this.board.shake(field)
        if (this.wide) await this.cam.panTo(W / 2)
        if (gen !== this.gen) return
        this.banner = showBanner(this, say, WIDE_BANNER)
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.audio.fail()
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.setControls(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.mode !== 'choose') return
        const gen = this.gen
        this.setControls(false)
        this.mode = 'help'
        this.hud.setHelpEnabled(false)
        const at = this.balloon
        const steps: Parameters<typeof teach>[2] = [
            { text: HELP.sign, ...spot(this.sign.rect()), balloonX: at.x, balloonY: at.y, buttonLabel: 'Próximo' },
            { text: HELP.label(FIELD[this.rule]), ...spot(this.board.rect()), balloonX: at.x, balloonY: at.y, buttonLabel: 'Próximo' },
        ]
        if (this.desk) {
            await this.cam.panTo(W / 2)
            if (gen !== this.gen) return
            steps.push({ text: HELP.note, ...spot(this.onScreen(this.desk.noteRect())), balloonX: at.x, balloonY: at.y, buttonLabel: 'Próximo' })
        }
        if (this.wide) steps.push({ text: HELP.levers, ...spot(this.go.rect()), balloonX: at.x, balloonY: at.y, buttonLabel: 'Continuar' })
        else steps.push({ text: HELP.lever, ...spot(union(this.levers.rect(0), this.go.rect())), balloonX: at.x, balloonY: at.y, buttonLabel: 'Continuar' })
        await teach(this, `${guideKey(this.level.level)}-help`, steps, BALLOON_W)
        if (gen !== this.gen) return
        this.mode = 'choose'
        this.setControls(true)
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
        this.setControls(false)
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.audio.toot()
        this.audio.win()
        void FX.confetti(this, { colors: [C.star, C.mint, C.lilac, C.accent, C.coral] })
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
        const phases = this.level.phases
        const done = phases.slice(0, this.phaseIndex).reduce((n, p) => n + p.trains.length, 0) + this.index
        const total = phases.reduce((n, p) => n + p.trains.length, 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.min(100, Math.round((done / total) * 100)),
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
