import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, stagesInLevel } from '../data/levels'
import {
    belongsToRun,
    fits,
    hasStations,
    planReady,
    runLocked,
    stationFed,
    stationReady,
    stepReady,
    tripFull,
} from '../data/rules'
import { DEPTH, HUD, PAD, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { Item, LevelDef, LevelNumber, Mode, Station, Task, Trip } from '../types'
import { createRoom, type Room } from './room'
import { createIntro, type Intro } from './intro'
import { createPlan, type Plan } from './plan'
import { createFinale, type Finale } from './finale'
import { createWorld, type World } from './world'
import { createHero, type Hero } from './hero'
import { createPickups, type Pickups } from './pickups'
import { createHazards, type Hazards } from './hazards'
import { createBench, type Bench } from './bench'
import { createStations, type Stations } from './stations'
import { createPad, type Pad } from './pad'
import { createHud, type Hud } from './hud'
import { createLock, type Lock } from './lock'
import { createCurtain, type Curtain } from './curtain'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'missao-em-pedacos'

/** A instrução do topo muda com o momento: é ela que diz o que fazer agora. */
const LINE = {
    pick: 'Toque numa coisa da mesa.',
    drop: 'Agora toque no painel que leva isso.',
    ready: 'Tudo guardado! Toque em VAMOS!',
    choose: 'Escolha por onde começar.',
    run: 'Pegue só o que é desta viagem!',
    carry: 'Leve tudo até a bancada!',
    /** A mesma hora, na tarefa que acontece no mapa. */
    carryStations: 'Agora leve cada dupla até o lugar dela!',
    finale: 'Agora faça a tarefa: toque no que vem agora.',
    done: 'Tudo pronto!',
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private taskIndex = 0
    private mode: Mode = 'intro'
    private gen = 0

    private trips: Trip[] = []
    private shelf: Item[] = []
    private picked: string | null = null
    private tripDone: boolean[] = []
    private delivered = new Set<string>()

    private runTrip = 0
    private carried: Item[] = []
    private checkpoint = WORLD.startX
    private hazardCooldown = 0
    private steps = new Set<string>()
    private stationsDone = new Set<string>()
    private stationHint: string | null = null

    private planTutorialPending = true
    private runTutorialPending = true
    private finaleTutorialPending = true

    private score = 0
    private hits = 0
    private errors = 0
    private stagesDone = 0

    private room!: Room
    private intro!: Intro
    private plan!: Plan
    private finale!: Finale
    private world!: World
    private hero!: Hero
    private pickups!: Pickups
    private hazards!: Hazards
    private bench!: Bench
    private stations!: Stations
    private pad!: Pad
    private hud!: Hud
    private lock!: Lock
    private curtain!: Curtain
    private audio!: Audio

    private unsubPlatform?: () => void

    private get task(): Task {
        return this.level.tasks[this.taskIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.taskIndex = 0
        this.mode = 'intro'
        this.trips = []
        this.shelf = []
        this.picked = null
        this.tripDone = []
        this.delivered = new Set()
        this.carried = []
        this.steps = new Set()
        this.planTutorialPending = number === 1
        this.runTutorialPending = number === 1
        this.finaleTutorialPending = number === 1
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.stagesDone = 0
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        this.world = createWorld(this)
        this.room = createRoom(this)
        this.intro = createIntro(this)
        this.plan = createPlan(this, {
            onItem: item => this.onItem(item),
            onTripItem: (tripIndex, item) => this.onTripItem(tripIndex, item),
            onTrip: tripIndex => this.onTrip(tripIndex),
            onGo: () => this.onGo(),
        })
        this.finale = createFinale(this, { onTap: id => void this.onFinaleTap(id) })
        this.hero = createHero(this, {
            onStep: () => this.audio.step(),
            onJump: () => this.audio.jump(),
            onLand: () => this.audio.land(),
            onFall: () => this.onFall(),
        })
        this.pickups = createPickups(this)
        this.hazards = createHazards(this)
        this.bench = createBench(this)
        this.stations = createStations(this)
        this.pad = createPad(this)
        this.lock = createLock(this)
        this.curtain = createCurtain(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            onHelp: () => this.replayTutorial(),
        })

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 30,
            tint: C.coral,
            depth: DEPTH.hud + 2,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startTask(0)
    }

    private shutdownScene() {
        this.gen++
        this.curtain?.destroy()
        this.lock?.destroy()
        this.pad?.destroy()
        this.stations?.destroy()
        this.bench?.destroy()
        this.hazards?.destroy()
        this.pickups?.destroy()
        this.hero?.destroy()
        this.world?.destroy()
        this.finale?.destroy()
        this.plan?.destroy()
        this.intro?.destroy()
        this.room?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── o corte

    private async startTask(index: number) {
        const gen = ++this.gen
        this.taskIndex = index
        this.mode = 'plan'
        this.delivered = new Set()
        this.steps = new Set()
        this.picked = null

        const task = this.task
        this.trips = [[], []]
        this.tripDone = [false, false]
        this.shelf = [...task.items]

        this.cameras.main.setScroll(0, 0)
        this.world.clear()
        this.pickups.clear()
        this.hazards.clear()
        this.bench.clear()
        this.finale.hide()
        this.hero.setVisible(false)
        this.pad.setEnabled(false)
        this.hud.setTitle(LINE.pick)
        this.hud.hideSlots()
        this.lock.hide()

        this.room.show(`fundo-n${this.level.level}`)
        this.room.setSceneryVisible(true)
        this.room.setHeroFrame(0)
        this.room.setVisible(true)
        this.plan.show(task, task.sheetKey)
        this.plan.setVisible(true)
        this.renderPlan()
        this.plan.showGo(false)

        await this.intro.show(task, task.sheetKey, { badge: 'TAREFA', line: task.brief })
        if (gen !== this.gen) return

        await this.curtain.open()
        if (gen !== this.gen) return

        if (this.planTutorialPending && index === 0) {
            this.planTutorialPending = false
            this.runTutorial('plan', false)
        }
    }

    private renderPlan() {
        this.plan.render({
            shelf: this.shelf,
            trips: this.trips,
            picked: this.picked,
            done: this.tripDone,
            mode: this.mode === 'plan' ? 'cutting' : this.mode === 'choose' ? 'choosing' : 'idle',
        })
    }

    /** Primeiro toque: escolher o objeto. Tocar nele de novo desfaz a escolha. */
    private onItem(item: Item) {
        if (this.mode !== 'plan') return
        this.picked = this.picked === item.id ? null : item.id
        this.audio.select()
        this.hud.setTitle(this.picked ? LINE.drop : LINE.pick)
        this.renderPlan()
    }

    /** Segundo toque: escolher o painel. É aqui que a criança corta a tarefa. */
    private onTrip(tripIndex: number) {
        if (this.mode === 'choose') {
            if (this.tripDone[tripIndex] || this.refuseOrder(tripIndex)) return
            void this.startRun(tripIndex)
            return
        }
        if (this.mode !== 'plan') return

        const item = this.shelf.find(other => other.id === this.picked)
        if (!item) {
            this.hud.setTitle(LINE.pick)
            return
        }

        const trip = this.trips[tripIndex]
        if (tripFull(trip)) {
            this.audio.tripOut()
            void this.plan.refuse(tripIndex)
            return
        }
        if (!fits(this.task, tripIndex, item)) {
            void this.refusePlan(tripIndex, item)
            return
        }

        const from = this.plan.shelfPos(item)
        const to = this.plan.slotPos(tripIndex, trip.length)
        this.shelf = this.shelf.filter(other => other.id !== item.id)
        trip.push(item)
        this.picked = null
        this.audio.tripIn(trip.length - 1)
        this.renderPlan()
        void this.plan.fly(item, from, to)

        if (planReady(this.trips, this.task)) {
            this.hud.setTitle(LINE.ready)
            this.plan.showGo(true)
        } else {
            this.hud.setTitle(LINE.pick)
        }
    }

    private onTripItem(tripIndex: number, item: Item) {
        if (this.mode !== 'plan') return
        this.trips[tripIndex] = this.trips[tripIndex].filter(other => other.id !== item.id)
        this.shelf.push(item)
        this.picked = null
        this.audio.tripOut()
        this.plan.showGo(false)
        this.hud.setTitle(LINE.pick)
        this.renderPlan()
    }

    private onGo() {
        if (this.mode !== 'plan' || !planReady(this.trips, this.task)) return
        this.mode = 'choose'
        this.picked = null
        this.audio.go()
        this.hud.setTitle(LINE.choose)
        this.room.setHeroFrame(7)
        this.plan.showGo(false)
        this.renderPlan()
    }

    /**
     * A ORDEM ENTRE AS DUAS METADES, QUANDO ELA EXISTE.
     *
     * O bolo e o café aceitam começar por qualquer painel. A fogueira não: não
     * se assa marshmallow sem fogo, e não se faz a cama sem barraca em pé.
     * Quando o painel escolhido depende do outro, o jogo diz qual vem antes e
     * devolve a escolha — sem custar vida, porque é justamente a ordem que ele
     * veio ensinar, e o erro aqui é a pergunta certa feita cedo demais.
     */
    private refuseOrder(tripIndex: number) {
        const doneJobs = new Set(
            this.task.jobs.filter((_, index) => this.tripDone[index]).map(job => job.id),
        )
        if (!runLocked(this.trips[tripIndex], this.task, doneJobs)) return false

        const needed = this.task.jobs[tripIndex].requires
        const first = this.task.jobs.find(job => job.id === needed)
        this.audio.tripOut()
        void this.plan.refuse(tripIndex)
        this.hud.setTitle(`Antes disso: ${first?.name ?? 'a outra metade'}.`)
        return true
    }

    /** Misturar as metades: o único erro de cabeça do corte. */
    private async refusePlan(tripIndex: number, item: Item) {
        const gen = this.gen
        this.mode = 'trava'
        this.errors += 1
        this.audio.wrong()
        this.hud.flash(C.coral)

        const job = this.task.jobs[tripIndex]
        const line = `${item.label} não é ${job?.partOf ?? 'deste painel'} — vai no outro.`

        void this.plan.refuse(tripIndex)
        this.lock.show(this.plan.shelfPos(item), line)

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        await FX.wait(this, 1700)
        if (gen !== this.gen) return
        this.lock.hide()
        this.mode = 'plan'
        this.hud.setTitle(LINE.drop)
        this.renderPlan()
    }

    // ─────────────────────────────────────────────── a viagem

    private async startRun(tripIndex: number) {
        const gen = ++this.gen
        this.mode = 'intro'
        await this.curtain.close(this.task.jobs[tripIndex].name)
        if (gen !== this.gen) return
        this.runTrip = tripIndex
        this.carried = []
        this.hazardCooldown = 0
        this.mode = 'run'

        const task = this.task
        const map = task.map
        const trip = this.trips[tripIndex]

        this.plan.hide()
        this.room.setVisible(false)
        this.hud.setTitle(LINE.run)
        this.world.build(map, `fundo-n${this.level.level}`)
        this.world.setVisible(true)

        // Só o que ela veio buscar nasce no mapa. O resto das vagas é lixo.
        const entries = trip.map((item, i) => {
            const spot = map.tripSpots[i % map.tripSpots.length]
            return { item, x: spot.x, y: spot.y }
        })
        this.pickups.spawn(entries, task.sheetKey)
        this.hazards.spawn(map.trash)

        // Metade com estação não usa bancada: a viagem acaba na última estação.
        const stations = task.jobs[tripIndex].stations ?? []
        this.stationsDone = new Set()
        this.stations.clear()
        this.bench.clear()
        if (stations.length) this.stations.spawn(stations, task.finalKey)
        else this.bench.place(map.benchX)

        this.checkpoint = map.checkpoints[0] ?? WORLD.startX
        this.hero.spawn(this.checkpoint)
        this.hero.setPose(null)
        this.hero.setFrozen(false)
        this.hero.setVisible(true)
        this.hud.setSlots(trip, task.sheetKey)
        this.pad.setEnabled(true)
        this.cameras.main.setScroll(0, 0)
        this.world.update(0)

        await this.curtain.open()
        if (gen !== this.gen) return

        if (this.runTutorialPending) {
            this.runTutorialPending = false
            this.runTutorial('run', false)
        }
    }

    update(_time: number, delta: number) {
        if (this.mode !== 'run') return
        const dt = Math.min(delta, 50) / 1000

        this.hero.update(
            dt,
            {
                left: this.pad.left,
                right: this.pad.right,
                jump: this.pad.jumpHeld || this.pad.consumeJump(),
            },
            this.world.solids(),
            this.world.blocks(),
            this.world.length(),
        )

        const scroll = Phaser.Math.Clamp(
            this.hero.x - WORLD.cameraLead,
            0,
            Math.max(0, this.world.length() - W),
        )
        this.cameras.main.setScroll(scroll, 0)
        this.world.update(scroll)

        this.task.map.checkpoints.forEach(point => {
            if (this.hero.x > point && point > this.checkpoint) this.checkpoint = point
        })

        if (this.hazardCooldown > 0) this.hazardCooldown -= delta

        const touched = this.pickups.touching(this.hero.x, this.hero.y)
        if (touched) this.onPickup(touched.item)

        const trash = this.hazards.touching(this.hero.x, this.hero.y)
        if (trash && this.hazardCooldown <= 0) void this.onHazard(trash)

        const stations = this.task.jobs[this.runTrip].stations ?? []
        if (stations.length) {
            const at = this.stations.touching(this.hero.x)
            if (at) void this.onStation(at)
            return
        }

        if (this.bench.reached(this.hero.x)) {
            if (this.carried.length === this.trips[this.runTrip].length) void this.finishRun()
            else this.bench.hint(true)
        } else {
            this.bench.hint(false)
        }
    }

    /**
     * A viagem só carrega o que é dela: no mapa não nasce mais item da outra
     * metade, e por isso não existe mais trava aqui. `belongsToRun` fica como
     * guarda — se um dia nascer algo que não é desta viagem, o jogo ignora em
     * vez de punir.
     */
    private onPickup(item: Item) {
        const trip = this.trips[this.runTrip]
        if (!belongsToRun(trip, item)) return
        this.carried.push(item)
        this.audio.pick(this.carried.length - 1)
        this.hud.fillSlot(item.id)
        void this.pickups.take(item.id, this.hud.slotPosition(item.id))
        if (this.carried.length === trip.length)
            this.hud.setTitle(this.viaStations ? LINE.carryStations : LINE.carry)
    }

    /**
     * O LIXO É FATAL. Encostar numa meia fedida, numa barata ou num peixe morto
     * custa UMA VIDA e devolve a criança ao último ponto, com as mãos vazias:
     * tudo o que ela já tinha juntado volta para as vagas.
     *
     * Por isso o mapa tem só dois deles, os dois em pista aberta, com pelo menos
     * 400 px de aproximação e nada por cima — hazard que mata precisa ser visto
     * de longe. E é por isso, também, que a bancada fica no fim de uma reta
     * limpa: ninguém deve perder a viagem a um passo de entregar.
     */
    private async onHazard(at: { x: number; y: number }) {
        const gen = this.gen
        this.mode = 'trava'
        this.hazardCooldown = 1600
        this.pad.setEnabled(false)
        this.audio.eca()
        this.audio.wrong()
        this.hazards.puff(at.x, at.y)
        this.hud.flash(C.coral)
        FX.shakeCam(this, 'leve')
        this.hero.setFrozen(true)
        this.hero.setPose(8)
        this.dropAll()

        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        await FX.wait(this, 900)
        if (gen !== this.gen) return
        this.hero.setPose(null)
        this.hero.spawn(this.checkpoint)
        this.hero.setFrozen(false)
        this.pad.setEnabled(true)
        this.hud.setTitle(LINE.run)
        this.mode = 'run'
    }

    private onFall() {
        if (this.mode !== 'run') return
        this.audio.fall()
        this.dropOne()
        this.hero.spawn(this.checkpoint)
        this.hud.flash(C.warn)
    }

    /**
     * A ESTAÇÃO ACONTECE: a criança chegou com o que ela pede.
     *
     * Chegar sem os itens, ou fora de ordem, não custa nada — a estação balança
     * e o topo diz o que falta. O erro de cabeça desta tarefa já foi cobrado no
     * corte; aqui o que se aprende é a ORDEM, e ordem se aprende tentando.
     */
    private async onStation(station: Station) {
        if (this.mode !== 'run') return

        if (!stationReady(station, this.stationsDone) || !stationFed(station, this.carried)) {
            if (this.stationHint === station.id) return
            this.stationHint = station.id
            this.hud.setTitle(station.hint)
            this.audio.tripOut()
            void this.stations.refuse(station.id)
            return
        }

        const gen = this.gen
        this.mode = 'trava'
        this.stationHint = null
        this.stationsDone.add(station.id)

        station.needs.forEach(id => {
            this.carried = this.carried.filter(item => item.id !== id)
            this.hud.emptySlot(id)
        })

        this.audio.deliver(this.stationsDone.size - 1)
        this.hud.setTitle(station.line)
        this.pad.setEnabled(false)
        this.hero.setFrozen(true)
        this.hero.setPose(9)

        await this.stations.complete(station.id)
        if (gen !== this.gen) return

        if (this.stations.allDone()) {
            void this.finishRun()
            return
        }

        this.hero.setPose(null)
        this.hero.setFrozen(false)
        this.pad.setEnabled(true)
        this.mode = 'run'
    }

    /** O buraco derruba UM. O lixo derruba TUDO. */
    private dropOne() {
        const item = this.carried.pop()
        if (!item) return
        this.audio.drop()
        this.hud.emptySlot(item.id)
        this.pickups.restore(item.id)
        this.hud.setTitle(LINE.run)
    }

    private dropAll() {
        if (!this.carried.length) return
        this.audio.drop()
        this.carried.forEach(item => {
            this.hud.emptySlot(item.id)
            this.pickups.restore(item.id)
        })
        this.carried = []
    }

    // ─────────────────────────────────────────────── a bancada

    private async finishRun() {
        const gen = this.gen
        this.mode = 'bench'
        this.pad.setEnabled(false)
        this.hero.setFrozen(true)
        this.hero.setPose(9)
        this.bench.hint(false)

        const trip = this.trips[this.runTrip]
        const viaStations = !!this.task.jobs[this.runTrip].stations?.length

        if (!viaStations) {
            await this.bench.deliver(
                trip,
                this.task.sheetKey,
                item => this.hud.slotPosition(item.id),
                index => this.audio.deliver(index),
            )
        }
        if (gen !== this.gen) return

        trip.forEach(item => this.delivered.add(item.id))
        this.tripDone[this.runTrip] = true
        this.hero.setPose(7)
        const showAt = viaStations ? this.hero.x : this.bench.x
        void FX.stars(this, showAt - this.cameras.main.scrollX, 340, { count: 16 })

        const points = 10
        this.score += points
        this.hits += 1
        this.stagesDone += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const last = this.tripDone.every(Boolean)
        const finale = last && !hasStations(this.task)
        await this.curtain.close(
            last ? (finale ? 'Agora faça a tarefa!' : 'Pronto!') : 'Falta a outra metade!',
        )
        if (gen !== this.gen) return

        this.hud.hideSlots()
        this.hero.setVisible(false)
        this.world.setVisible(false)
        this.pickups.clear()
        this.hazards.clear()
        this.bench.clear()
        this.stations.clear()
        this.cameras.main.setScroll(0, 0)

        if (finale) {
            await this.startFinale()
            return
        }

        // Tarefa com estação não tem fase final: a receita aconteceu no mundo.
        if (last) {
            this.room.setVisible(true)
            this.room.setSceneryVisible(true)
            this.room.setHeroFrame(7)
            await this.curtain.open()
            await this.finishTask(gen)
            return
        }

        this.mode = 'choose'
        this.room.setHeroFrame(7)
        this.room.setVisible(true)
        this.plan.setVisible(true)
        this.hud.setTitle(LINE.choose)
        this.renderPlan()
        await this.curtain.open()
    }

    // ─────────────────────────────────────────────── a fase final

    private async startFinale() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.steps = new Set()

        this.plan.hide()
        this.room.setVisible(true)
        this.room.setSceneryVisible(false)
        this.hud.setTitle(LINE.finale)
        this.finale.show(this.task, this.task.sheetKey, this.task.items)
        this.refreshFinale()
        await this.curtain.open()
        if (gen !== this.gen) return

        this.audio.reveal()
        await FX.wait(this, 200)
        if (gen !== this.gen) return

        if (this.finaleTutorialPending) {
            this.finaleTutorialPending = false
            this.runTutorial('finale', false)
        }
    }

    private readySteps() {
        return this.task.steps.filter(
            step => !this.steps.has(step.itemId) && stepReady(step, this.steps),
        )
    }

    private refreshFinale() {
        this.finale.setReady(this.readySteps().map(step => step.itemId))
    }

    private async onFinaleTap(itemId: string) {
        if (this.mode !== 'finale') return
        const step = this.task.steps.find(other => other.itemId === itemId)
        if (!step || this.steps.has(itemId)) return

        if (!stepReady(step, this.steps)) {
            this.audio.tripOut()
            this.hud.setTitle(step.hint || LINE.finale)
            void this.finale.refuse(itemId)
            return
        }

        const gen = this.gen
        this.mode = 'trava'
        this.steps.add(itemId)
        this.audio.deliver(this.steps.size - 1)
        this.hud.setTitle(step.line)
        await this.finale.use(itemId)
        if (gen !== this.gen) return
        this.finale.setState(this.task.states[this.steps.size] ?? this.task.states[0])

        if (this.steps.size === this.task.steps.length) {
            await this.finishTask(gen)
            return
        }

        this.mode = 'finale'
        this.refreshFinale()
    }

    private async finishTask(gen: number) {
        this.mode = 'done'
        this.score += 10
        this.hits += 1
        this.stagesDone += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 10,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.hud.setTitle(this.task.finalLine)
        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.gold, C.ok, C.warn, C.blue] })
        const at = hasStations(this.task) ? { x: 640, y: 320 } : this.finale.benchPoint()
        void FX.stars(this, at.x, at.y, { count: 18 })

        await FX.wait(this, 1200)
        if (gen !== this.gen) return

        await this.intro.show(this.task, this.task.sheetKey, {
            badge: 'PRONTO!',
            line: this.task.finalLine,
            tone: C.ok,
        })
        if (gen !== this.gen) return

        const next = this.taskIndex + 1
        if (next < this.level.tasks.length) {
            await this.curtain.close(this.level.tasks[next].name)
            if (gen !== this.gen) return
            this.finale.hide()
            await this.startTask(next)
            return
        }
        this.finale.hide()
        await this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setEnabled(false)
        this.hud.setTitle(LINE.done)
        this.plan.hide()
        this.finale.hide()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 600)
        if (gen !== this.gen) return

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name}: feito!`,
                subtitle: 'Você cortou, buscou e fez a tarefa!',
                accent: C.warn,
                panelColor: C.card,
                overlayColor: C.ink,
                depth: 5000,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 2600,
                    label: `${LEVELS[done].name}...`,
                    onComplete: () =>
                        this.scene.restart({
                            lives: this.livesLeft,
                            level: (done + 1) as LevelNumber,
                            points: this.score,
                        }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Tarefa inteira!',
            subtitle: 'Você cortou, buscou e fez a tarefa!',
            accent: C.warn,
            panelColor: C.card,
            overlayColor: C.ink,
            depth: 5000,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.blue,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── tutorial

    private replayTutorial() {
        if (this.mode === 'plan') this.runTutorial('plan', true)
        else if (this.mode === 'run') this.runTutorial('run', true)
        else if (this.mode === 'finale') this.runTutorial('finale', true)
    }

    private runTutorial(kind: 'plan' | 'run' | 'finale', force: boolean) {
        const back = this.mode
        this.mode = 'intro'
        this.pad.setEnabled(false)
        this.hero.setFrozen(true)

        const steps = this.tutorialSteps(kind)

        createTutorial(this, {
            key: `ef03co03-${kind}-l${this.level.level}`,
            once: !force,
            accent: C.warn,
            safeTop: HUD.h + 10,
            steps,
            onFinish: () => {
                this.mode = back
                this.hero.setFrozen(false)
                if (back === 'run') this.pad.setEnabled(true)
            },
        })
    }

    private tutorialSteps(kind: 'plan' | 'run' | 'finale') {
        if (kind === 'plan') {
            const first = this.plan.shelfPos(this.task.items[0])
            const trip = this.plan.tripPos(0)
            return [
                {
                    text: 'Toque numa coisa da mesa.',
                    shape: 'rect' as const,
                    x: first.x,
                    y: first.y,
                    w: 150,
                    h: 150,
                    balloonX: 640,
                    balloonY: 470,
                    pointer: { fromX: first.x, fromY: first.y, toX: first.x, toY: first.y, tap: true },
                },
                {
                    text: 'Agora toque no painel que leva isso. Cada painel é uma metade da tarefa.',
                    shape: 'rect' as const,
                    x: trip.x,
                    y: trip.y - 20,
                    w: 400,
                    h: 300,
                    balloonX: 700,
                    balloonY: 200,
                    pointer: { fromX: trip.x, fromY: trip.y, toX: trip.x, toY: trip.y, tap: true },
                },
            ]
        }

        if (kind === 'run') {
            return [
                {
                    text: 'Use os botões para andar e pular.',
                    shape: 'circle' as const,
                    x: PAD.jump.x,
                    y: PAD.jump.y,
                    w: PAD.jump.r * 2 + 40,
                    h: PAD.jump.r * 2 + 40,
                    balloonX: 560,
                    balloonY: 250,
                    pointer: {
                        fromX: PAD.jump.x,
                        fromY: PAD.jump.y,
                        toX: PAD.jump.x,
                        toY: PAD.jump.y,
                        tap: true,
                    },
                },
                {
                    text: this.viaStations
                        ? 'Pegue as quatro coisas e leve cada dupla até o lugar marcado no fim do mapa.'
                        : 'Pegue só o que é desta viagem e leve até a bancada.',
                    shape: 'rect' as const,
                    x: this.runFirstItemX(),
                    y: 470,
                    w: 220,
                    h: 220,
                    balloonX: 640,
                    balloonY: 230,
                },
            ]
        }

        const ready = this.readySteps()[0]
        const bounds = this.finale.trayBounds(ready?.itemId ?? this.task.items[0].id)
        return [
            {
                text: 'Agora faça a tarefa: toque no que vem agora.',
                shape: 'rect' as const,
                x: bounds.x,
                y: bounds.y,
                w: bounds.w,
                h: bounds.h,
                balloonX: 640,
                balloonY: 250,
                pointer: { fromX: bounds.x, fromY: bounds.y, toX: bounds.x, toY: bounds.y, tap: true },
            },
        ]
    }

    /** Se a viagem de agora acaba nas estações, e não na bancada. */
    private get viaStations() {
        return !!this.task?.jobs[this.runTrip]?.stations?.length
    }

    private runFirstItemX() {
        const item = this.trips[this.runTrip]?.[0]
        if (!item) return 520
        const position = this.pickups.position(item.id)
        return Phaser.Math.Clamp(position.x - this.cameras.main.scrollX, 160, W - 160)
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = stagesInLevel(this.level)
        const done = complete ? total : this.stagesDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(done, total) / total) * 100),
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
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
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
