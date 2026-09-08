import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, buildsInLevel } from '../data/levels'
import { GOAL_ASK, fits, item, outcomeOf, wrongLine } from '../data/items'
import { DEPTH, HUD, MACHINE, RACK } from '../data/layout'
import { C, SLOT_PHRASE } from '../data/theme'
import type { Build, ItemKind, LabItem, LevelDef, LevelNumber, Phase, Slot } from '../types'
import { createLab } from './lab'
import { createShelf, type Shelf } from './shelf'
import { createMascot, type Mascot } from './mascot'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { createMachine, type Machine } from './machine'
import { createRack, type Rack } from './rack'
import { createItemIcon } from './itemIcon'
import { playResult, playWrong } from './results'
import { showTrava, type TravaSpec } from './trava'
import { createTuner } from './tuner'

const GAME_ID = 'fuga-do-laboratorio'

const SLOT_OF: Record<ItemKind, Slot> = { hardware: 'tray', software: 'reader' }

/** Onde o resultado do TESTAR acontece: em cima da máquina, não no meio da tela. */
const STAGE = { x: MACHINE.cx, y: MACHINE.cy - 30 }

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private buildIndex = 0
    private mistakes = 0
    private buildsDone = 0

    private phase: Phase = 'intro'
    private busy = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0

    private lab!: ReturnType<typeof createLab>
    private shelf!: Shelf
    private mascot!: Mascot
    private hud!: Hud
    private audio!: Audio
    private machine!: Machine
    private rack!: Rack

    private chosen: string | null = null
    private loaded: Record<Slot, string | null> = { tray: null, reader: null }

    private unsubPlatform?: () => void

    private get build(): Build {
        return this.level.builds[this.buildIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.buildIndex = 0
        this.mistakes = 0
        this.buildsDone = 0
        this.phase = 'intro'
        this.busy = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.chosen = null
        this.loaded = { tray: null, reader: null }
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        this.lab = createLab(this)
        this.shelf = createShelf(this, this.level.builds.length)
        this.mascot = createMascot(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            onHelp: () => this.replayTutorial(),
        })
        this.machine = createMachine(this, {
            onSlot: slot => void this.onSlot(slot),
            onRun: () => void this.onRun(),
        })
        this.rack = createRack(this, {
            onTap: id => this.onPick(id),
        })
        this.machine.setEnabled(false)
        this.rack.setEnabled(false)

        if (import.meta.env.DEV) {
            const stopTuner = createTuner(this, this.machine, on => {
                const playing = on && this.phase === 'playing' && !this.busy
                this.machine.setEnabled(playing)
                this.rack.setEnabled(playing)
            })
            this.events.once('shutdown', stopTuner)
        }

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
            tint: C.warn,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playBuild(0)
    }

    private shutdownScene() {
        this.gen++
        this.rack?.destroy()
        this.machine?.destroy()
        this.hud?.destroy()
        this.mascot?.destroy()
        this.shelf?.destroy()
        this.lab?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── montagem

    private async playBuild(index: number) {
        const gen = ++this.gen
        this.buildIndex = index
        this.mistakes = 0
        this.chosen = null
        this.loaded = { tray: null, reader: null }
        this.phase = 'intro'
        this.busy = false

        this.machine.setEnabled(false)
        this.rack.setEnabled(false)
        this.machine.setRunReady(false)
        this.machine.setSlot('tray', null)
        this.machine.setSlot('reader', null)
        this.machine.setBody('off')
        this.machine.setGoal(null)
        this.mascot.setPose('idle')

        this.hud.setTitle(`Máquina ${index + 1} de ${this.level.builds.length}`)
        this.hud.setHint(this.ask())

        await this.rack.load(this.build.shelf)
        if (gen !== this.gen) return

        this.machine.setBody('idle')
        this.machine.setGoal(this.build.goal)
        void this.mascot.point()

        await FX.wait(this, 240)
        if (gen !== this.gen) return

        if (index === 0) {
            this.phase = 'tutorial'
            await this.runTutorial(true)
            if (gen !== this.gen) return
        }

        this.phase = 'playing'
        this.machine.setEnabled(true)
        this.rack.setEnabled(true)
    }

    private ask() {
        return `Faça esta máquina ${GOAL_ASK[this.build.goal]}.`
    }

    // ─────────────────────────────────────────────── toque

    private onPick(id: string) {
        if (this.phase !== 'playing' || this.busy) return

        this.audio.pick()
        this.chosen = this.chosen === id ? null : id
        this.rack.setChosen(this.chosen)

        if (!this.chosen) {
            this.hud.setHint(this.ask())
            return
        }

        const target = item(this.chosen)
        this.hud.say(target.label)

        // A regra ensinada uma vez, e só no nível 1: a entrada certa pisca.
        if (this.level.teach && this.buildIndex === 0) {
            void this.machine.hintSlot(SLOT_OF[target.kind])
        }
    }

    private async onSlot(slot: Slot) {
        if (this.phase !== 'playing' || this.busy) return

        /*
         * Tocar numa entrada CHEIA devolve o que está lá, sem custo nenhum.
         *
         * Mudar de ideia não é errar. Sem esta saída, a criança que encaixa a
         * coisa certa no lugar errado de propósito — e com 7 anos isso é
         * exploração, não desatenção — ficaria presa até apertar o TESTAR e
         * perder uma vida por curiosidade.
         */
        const current = this.loaded[slot]
        if (current) {
            this.busy = true
            const gen = this.gen
            this.audio.pick()
            this.machine.setSlot(slot, null)
            this.loaded[slot] = null
            this.updateRun()
            await this.rack.give(current)
            if (gen !== this.gen) return
            this.busy = false
            return
        }

        if (!this.chosen) {
            this.audio.pick()
            this.hud.say('Escolha uma coisa lá embaixo.')
            void this.mascot.point()
            return
        }

        const target = item(this.chosen)
        this.busy = true
        const gen = this.gen

        if (!fits(target, slot)) {
            this.audio.refuse()
            await this.machine.refuse(slot)
            if (gen !== this.gen) return
            await this.trava({ kind: 'slot', slot, target }, SLOT_PHRASE[slot])
            if (gen !== this.gen) return
            if (this.mistakes >= 2) void this.machine.hintSlot(SLOT_OF[target.kind])
            this.busy = false
            return
        }

        if (slot === 'tray') this.audio.tray()
        else this.audio.reader()

        const from = this.rack.tileAt(target.id)
        this.rack.take(target.id)
        this.chosen = null
        this.rack.setChosen(null)

        await this.flyIn(target, from, this.machine.slotPoint(slot))
        if (gen !== this.gen) return

        this.machine.setSlot(slot, target)
        this.loaded[slot] = target.id
        this.updateRun()
        this.busy = false
    }

    /** A ficha atravessa a tela: é ela que liga o rack à máquina no olho. */
    private async flyIn(
        target: LabItem,
        from: { x: number; y: number },
        to: { x: number; y: number },
    ) {
        const icon = createItemIcon(this, target, RACK.icon)
        icon.setPosition(from.x, from.y).setDepth(DEPTH.fly)
        await FX.arcTo(this, icon, to, { height: 150, duration: 460 })
        icon.destroy()
    }

    private updateRun() {
        const ready = !!this.loaded.tray && !!this.loaded.reader
        this.machine.setRunReady(ready)
        if (ready) {
            this.audio.arm()
            this.hud.setHint('Agora aperte o botão verde!')
            return
        }
        this.hud.setHint(this.ask())
    }

    // ─────────────────────────────────────────────── o TESTAR

    private async onRun() {
        if (this.phase !== 'playing' || this.busy) return
        const hardwareId = this.loaded.tray
        const softwareId = this.loaded.reader
        if (!hardwareId || !softwareId) return

        this.busy = true
        this.phase = 'running'
        const gen = this.gen

        this.machine.setEnabled(false)
        this.rack.setEnabled(false)
        this.machine.setRunReady(false)

        await this.machine.pressRun()
        if (gen !== this.gen) return

        this.audio.run()
        await this.machine.rumble()
        if (gen !== this.gen) return

        if (outcomeOf(this.build, hardwareId, softwareId) !== 'ok') {
            await this.runWrong(hardwareId, softwareId, gen)
            return
        }

        this.machine.setBody('work')
        this.audio.works()
        void this.mascot.happy()
        await playResult(this, this.build.goal, STAGE.x, STAGE.y)
        if (gen !== this.gen) return

        this.machine.setSlot('tray', null)
        this.machine.setSlot('reader', null)
        this.loaded = { tray: null, reader: null }

        this.audio.trophy()
        // a peça do troféu é a que ELA encaixou, não uma resposta de gabarito
        await this.shelf.place(this.buildIndex, item(hardwareId), this.build.goal)
        if (gen !== this.gen) return

        this.award()
        this.buildsDone++
        this.emitCheckpoint()

        const next = this.buildIndex + 1
        if (next < this.level.builds.length) {
            await FX.wait(this, 340)
            if (gen !== this.gen) return
            await this.playBuild(next)
            return
        }

        this.endLevel()
    }

    /**
     * A máquina obedeceu direitinho — a uma ordem que não era daquela peça.
     *
     * O erro não é buzina: é a máquina fazendo besteira na frente da criança e,
     * depois, as duas coisas lado a lado com o motivo. As duas voltam para o
     * rack e a MESMA montagem recomeça limpa.
     */
    private async runWrong(hardwareId: string, softwareId: string, gen: number) {
        this.machine.setBody('wrong')
        this.audio.wrong()
        await playWrong(this, STAGE.x, STAGE.y)
        if (gen !== this.gen) return

        const line = wrongLine(hardwareId, softwareId)
        await this.trava(
            {
                kind: 'run',
                hardware: item(hardwareId),
                software: item(softwareId),
                line,
            },
            line,
        )
        if (gen !== this.gen) return

        this.machine.setSlot('tray', null)
        this.machine.setSlot('reader', null)
        this.loaded = { tray: null, reader: null }
        await Promise.all([this.rack.give(hardwareId), this.rack.give(softwareId)])
        if (gen !== this.gen) return

        this.machine.setBody('idle')
        this.updateRun()
        this.phase = 'playing'
        this.machine.setEnabled(true)
        this.rack.setEnabled(true)
        this.busy = false
    }

    private async trava(spec: TravaSpec, message: string) {
        const gen = this.gen

        this.errors++
        this.mistakes++
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.hud.flash(C.warn)
        this.hud.alert(message)
        void this.mascot.think()

        await showTrava(this, spec)
        if (gen !== this.gen) return

        this.mascot.setPose('idle')
        this.emitCheckpoint()
    }

    private award() {
        this.hits++
        const earned = this.mistakes === 0 ? 10 : 5
        this.score += earned
        this.mistakes = 0
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })
    }

    // ─────────────────────────────────────────────── fim

    private endLevel() {
        this.gen++
        this.phase = 'done'

        this.machine.setEnabled(false)
        this.rack.setEnabled(false)
        this.hud.setEnabled(false)
        this.hud.setTitle('Laboratório ligado!')
        this.hud.setHint('')

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name} ligado!`,
                subtitle: 'Cada máquina ganhou uma peça e um programa.',
                accent: C.hard,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 2600,
                    label: 'Outra bancada apagada apareceu...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: (done + 1) as LevelNumber,
                        points: this.score,
                    }),
                },
            })
            return
        }

        void FX.confetti(this, { colors: [C.gold, C.hard, C.soft, C.ok] })
        showLevelComplete(this, {
            title: 'Laboratório ligado!',
            subtitle: 'A peça a gente toca; o programa manda nela.',
            accent: C.hard,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal,
                        level: 1,
                        points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.soft,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── tutorial

    /** Um toque parado no alvo — o traço de A para B ensinaria a arrastar. */
    private tapAt(at: { x: number; y: number }) {
        return { fromX: at.x, fromY: at.y, toX: at.x, toY: at.y, tap: true }
    }

    /**
     * ══════════════════════════════════════════════════════════════════════
     *  O TUTORIAL MOSTRA, E QUASE NÃO FALA
     * ══════════════════════════════════════════════════════════════════════
     *
     * Eram cinco falas no nível 1 e duas em cada um dos outros — texto demais
     * para quem tem 7 anos e ainda soletra cada palavra. São três no 1 e uma
     * nos outros, e quem carrega a explicação é o DEDO: cada passo acende um
     * lugar só e bate nele, na ordem exata do gesto — escolhe, encaixa, liga.
     *
     * A regra das cores saiu do texto e foi para o desenho. Desde que as
     * gravuras viraram a folha `tipos.png`, a bandeja mostra um punhado de
     * coisas que se pega e o leitor mostra tiles de app: quem olha, vê. E o
     * que o desenho não disser, a TRAVA diz na hora do erro, que é quando a
     * criança quer saber.
     */
    private tutorialSteps(): TutorialStep[] {
        const display = this.machine.displayBounds()

        // nos níveis 2 e 3 a máquina já foi montada três vezes: uma fala basta
        if (this.level.level > 1) {
            return [{
                text: this.level.level === 2
                    ? 'Mais de um par funciona. Faça o que o visor pediu.'
                    : 'Quem decide é o programa, não a peça.',
                shape: 'rect',
                x: display.x, y: display.y, w: display.w, h: display.h,
                balloonX: 640,
                buttonLabel: 'Vamos lá!',
            }]
        }

        const rack = this.rack.bounds()
        const button = this.machine.buttonBounds()

        const firstId = this.build.shelf[0]
        const firstTile = this.rack.tileAt(firstId)

        /*
         * O dedo bate na entrada que serve para a PRIMEIRA ficha do rack, e o
         * holofote acende as duas: a criança vê a escolha e vê o alvo dela na
         * mesma imagem.
         */
        const target = this.machine.slotBounds(SLOT_OF[item(firstId).kind])
        const tray = this.machine.slotBounds('tray')
        const reader = this.machine.slotBounds('reader')
        const left = Math.min(tray.x - tray.w / 2, reader.x - reader.w / 2)
        const right = Math.max(tray.x + tray.w / 2, reader.x + reader.w / 2)
        const top = Math.min(tray.y - tray.h / 2, reader.y - reader.h / 2)
        const bottom = Math.max(tray.y + tray.h / 2, reader.y + reader.h / 2)

        return [
            {
                text: 'Escolha uma coisa aqui.',
                shape: 'rect',
                x: rack.x, y: rack.y, w: rack.w, h: rack.h,
                balloonX: 640,
                pointer: this.tapAt(firstTile),
            },
            {
                text: 'E toque onde ela entra.',
                shape: 'rect',
                x: (left + right) / 2,
                y: (top + bottom) / 2,
                w: right - left + 24,
                h: bottom - top + 24,
                balloonX: 640,
                pointer: this.tapAt(target),
            },
            {
                text: 'Com as duas cheias, aperte o verde!',
                shape: 'rect',
                x: button.x, y: button.y, w: button.w, h: button.h,
                balloonX: 640,
                pointer: this.tapAt(button),
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: `ef02co04-fuga-l${this.level.level}`,
                once,
                accent: C.hard,
                safeTop: HUD.h + 10,
                steps: this.tutorialSteps(),
                onFinish: () => resolve(),
            })
        })
    }

    private replayTutorial() {
        if (this.phase !== 'playing' || this.busy) return
        const gen = this.gen

        this.phase = 'tutorial'
        this.hud.setEnabled(false)
        this.machine.setEnabled(false)
        this.rack.setEnabled(false)

        void this.runTutorial(false).then(() => {
            if (gen !== this.gen) return
            this.phase = 'playing'
            this.hud.setEnabled(true)
            this.machine.setEnabled(true)
            this.rack.setEnabled(true)
        })
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = buildsInLevel(this.level)
        const done = complete ? total : this.buildsDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
            score: Math.max(0, this.score),
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
