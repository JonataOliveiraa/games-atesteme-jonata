import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { formatTime } from '../../../../shared/hud/createTimeBar'
import { FX } from '../../../../shared/effects/FX'
import {
    ALGORITHM_LINE, LEVELS, PHASE_CHEER, TOTAL_MARKS,
    fallSentence, ghostLine, marksBefore, marksInLevel, solves,
} from '../data/levels'
import { C } from '../data/theme'
import { CARD, GO, MEDAL, PARK, SCROLL, SKATER, W } from '../data/layout'
import type { LevelDef, LevelNumber, PhaseDef, PlayState, TrickKind } from '../types'
import { createAudio } from './audio'
import { createFocus } from './focus'
import { createHelpButton, createHud } from './hud'
import { createPlan } from './plan'
import { createPalette } from './palette'
import { createPark } from './park'
import { createReplay } from './replay'
import { createTalk } from './talk'

const GAME_ID = 'maratona-do-algoritmo'
const MAX_STEP_MS = 34

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelDef!: LevelDef
    private phaseIndex = 0
    private phase!: PhaseDef

    private state: PlayState = 'intro'
    private paused = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private resolved = 0
    private phaseClean = true
    /** Tombos por espaço nesta fase: dois no mesmo e a carta certa pisca. */
    private slotFalls: number[] = []

    /** O relógio conta para cima e NÃO aparece na tela: ele mede, não empurra. */
    private elapsed = 0
    private clockOn = false

    private park!: ReturnType<typeof createPark>
    private plan!: ReturnType<typeof createPlan>
    private hud!: ReturnType<typeof createHud>
    private palette!: ReturnType<typeof createPalette>
    private focus!: ReturnType<typeof createFocus>
    private talk!: ReturnType<typeof createTalk>
    private replay!: ReturnType<typeof createReplay>
    private help!: ReturnType<typeof createHelpButton>
    private audio!: ReturnType<typeof createAudio>

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.levelDef = LEVELS[number - 1]
        this.phaseIndex = 0
        this.phase = this.levelDef.phases[0]

        this.state = 'intro'
        this.paused = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.resolved = 0
        this.phaseClean = true
        this.slotFalls = []
        this.elapsed = 0
        this.clockOn = false
    }

    create() {
        this.input.topOnly = true

        this.talk = createTalk(this)
        this.replay = createReplay(this)
        this.audio = createAudio(this)
        this.help = createHelpButton(this, () => this.replayTutorial())
        this.bindDrag()
        this.hud = createHud(this, this.levelDef.phases.length)
        this.hud.setPhase(0)

        this.buildPhase()
        this.bindPlatform()

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.state = 'intro'
        void this.openLevel()

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 19,
            y: 179,
            size: 30,
            stage: () => this.levelDef.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    update(_time: number, delta: number) {
        if (this.paused) return
        const step = Math.min(delta, MAX_STEP_MS)
        this.talk.update(step)
        this.plan?.update(step)
        this.focus?.update(step)
        this.plan?.follow()
        if (this.focus?.active) this.focus.follow(this.park.actorX())
        if (this.clockOn) this.elapsed += step
    }

    private shutdownScene() {
        this.gen++
        this.park?.destroy()
        this.plan?.destroy()
        this.palette?.destroy()
        this.focus?.destroy()
        this.hud?.destroy()
        this.talk?.destroy()
        this.replay?.destroy()
        this.help?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────────────────── as fases

    private buildPhase() {
        this.phase = this.levelDef.phases[this.phaseIndex]
        this.slotFalls = this.phase.marks.map(() => 0)
        this.phaseClean = true

        this.park?.destroy()
        this.plan?.destroy()
        this.palette?.destroy()
        this.focus?.destroy()

        this.park = createPark(this, this.phase.marks)
        this.focus = createFocus(this, this.park.root, this.park.worldW)
        /* O plano é desenhado DENTRO do parque: a linha pontilhada e os
         * medalhões entram no mesmo container, então o foco os aproxima
         * junto com o mundo em vez de deixá-los descolados dele. */
        this.plan = createPlan(
            this,
            this.park.root,
            this.park.marksX,
            this.park.exitX,
            index => this.onTapSlot(index),
        )
        this.hud.setPhase(this.phaseIndex)
        this.palette = createPalette(
            this,
            this.phase.palette,
            kind => this.onCard(kind),
            () => void this.run(),
        )
        this.palette.setReady(false)
        this.help.setEnabled(true)
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     *  A ABERTURA — apresentar antes de pedir
     * ═══════════════════════════════════════════════════════════════════
     *
     * A primeira versão abria com o tutorial dizendo "Olhe o que ele faz"
     * sobre um parque parado. Duas coisas erradas de uma vez: **não havia
     * nenhum "ele" na tela** para a frase apontar, e não havia nada
     * acontecendo para olhar. A criança lia uma instrução sobre o vazio.
     *
     * Agora a ordem é a de quem recebe alguém: primeiro o skatista CHEGA
     * rolando e diz o nome dele; depois diz "Vamos fazer assim!", e o
     * fantasma aparece e FAZ o percurso — ele é o "assim", não um segundo
     * personagem a apresentar; e só então o tutorial pede alguma coisa.
     * Ninguém é instruído antes de ter visto.
     */
    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.clockOn = false
        this.palette.setEnabled(false)
        this.help.setEnabled(false)

        this.park.reset()
        await this.park.enter()
        if (gen !== this.gen) return

        await this.talk.say('Oi! Meu nome é Téo.', C.ok, 2400, SKATER.startX + 60)
        await FX.wait(this, 1700)
        if (gen !== this.gen) return

        // o fantasma não é apresentado como outra pessoa: ele é o "assim" da
        // frase, o jeito certo de fazer, e entra enquanto ela é dita
        void this.talk.say('Vamos fazer assim!', C.ok, 2200, SKATER.startX + 150)
        await this.park.summonGhost()
        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        await this.runGhost()
        if (gen !== this.gen) return

        await this.talk.say('Agora faça igual!', C.warn, 2600, W / 2)
        await FX.wait(this, 1400)
        if (gen !== this.gen) return
        this.talk.hush()

        this.state = 'tutorial'
        this.runTutorial(true, () => this.toBuilding())
    }

    /** A demonstração: o fantasma percorre o caminho certo da fase. */
    private async runGhost() {
        await this.focus.enter(SKATER.startX)
        await this.park.ghostRun(ghostLine(this.phase.marks))
        await this.focus.exit()
        this.park.reset()
    }

    /**
     * O parque é mais largo que a tela: o espaço que vai receber a próxima
     * carta tem de estar à vista antes de a carta voar. Ele fica a um terço
     * da tela, para dar para ver também o que vem logo depois.
     */
    private showSlot(index: number) {
        if (index < 0) return
        const x = this.park.marksX[index]
        const onScreen = x + this.focus.planX
        if (onScreen >= SCROLL.keep && onScreen <= W - SCROLL.keep) return
        void this.focus.view(x + W * 0.15)
    }

    /** Onde o dedo desceu e onde o parque estava; `null` sem dedo no parque. */
    private dragFrom: { x: number; planX: number } | null = null
    /** O dedo andou mais que `SCROLL.slop`: o que ele fizer ao subir não é toque. */
    private dragMoved = false

    /**
     * ═══════════════════════════════════════════════════════════════════
     *  ARRASTAR PARA VER O TRAJETO
     * ═══════════════════════════════════════════════════════════════════
     *
     * Enquanto monta, arrastar o parque para os lados mostra o percurso
     * inteiro. É olhar, não jogar: nenhuma carta é posta ou tirada pelo
     * arrasto, e errar o arrasto não custa nada.
     *
     * Os eventos são os da CENA, e não de uma zona: o dedo pode descer em
     * cima de um espaço e ainda assim arrastar. Por isso o espaço responde
     * no `pointerup`, e só se o dedo não tiver andado — assim um toque tira a
     * carta e um arrasto que começou em cima dela não tira.
     */
    private bindDrag() {
        const inPark = (y: number) => y >= PARK.top && y <= PARK.bottom
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.dragMoved = false
            if (this.state !== 'building' || this.focus.active || !inPark(p.y)) return
            this.dragFrom = { x: p.x, planX: this.focus.planX }
        })
        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.dragFrom || !p.isDown) return
            const dx = p.x - this.dragFrom.x
            if (!this.dragMoved && Math.abs(dx) < SCROLL.slop) return
            this.dragMoved = true
            this.focus.drag(this.dragFrom.planX + dx)
        })
        const release = () => {
            this.dragFrom = null
        }
        this.input.on('pointerup', release)
        this.input.on('pointerupoutside', release)
    }

    private toBuilding() {
        this.showSlot(this.plan.firstEmpty())
        this.state = 'building'
        this.clockOn = true
        this.palette.setEnabled(true)
        this.palette.setReady(this.plan.isFull())
        this.help.setEnabled(true)
    }

    /**
     * As fases seguintes não repetem a apresentação: o Téo já se apresentou,
     * e refazer isso a cada fase viraria pedágio.
     */
    private async startPhase() {
        const gen = ++this.gen
        this.state = 'ghost'
        this.clockOn = false
        this.palette.setEnabled(false)
        this.help.setEnabled(false)

        await this.runGhost()
        if (gen !== this.gen) return

        this.toBuilding()
    }

    private async finishPhase() {
        const gen = ++this.gen
        this.state = 'replay'
        this.clockOn = false
        this.palette.setEnabled(false)
        this.help.setEnabled(false)
        this.plan.idle()
        this.talk.flash(C.ok)
        this.audio.fanfare()
        void FX.confetti(this)

        await this.replay.play(
            this.plan.program.filter(Boolean) as TrickKind[],
            PHASE_CHEER[this.phaseIndex % PHASE_CHEER.length],
            ALGORITHM_LINE,
        )
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 >= this.levelDef.phases.length) {
            void this.endLevel()
            return
        }

        this.phaseIndex += 1
        this.buildPhase()
        this.emitCheckpoint()
        void this.startPhase()
    }

    // ──────────────────────────────────────────────────────────── montar

    private onCard(kind: TrickKind) {
        if (this.paused || this.state !== 'building') return
        const slot = this.plan.firstEmpty()
        if (slot < 0) return

        this.audio.snap()
        this.showSlot(slot)
        void this.plan.place(slot, kind, this.palette.at(kind))
        this.showSlot(this.plan.firstEmpty())

        /*
         * O VAI acende AGORA, e não quando o voo da carta terminar. O botão
         * principal do jogo não pode depender de um tween acabar: basta a aba
         * perder o foco no meio do voo para o caminho ficar cheio e o botão
         * apagado.
         */
        this.palette.setReady(this.plan.isFull())
    }

    /**
     * Tocar num espaço cheio devolve a manobra. É a REORGANIZAÇÃO, e ela vale
     * a qualquer momento em que se esteja montando — não só depois de cair.
     */
    private onTapSlot(index: number) {
        if (this.paused || this.state !== 'building' || this.dragMoved) return
        if (!this.plan.program[index]) return
        this.audio.unsnap()
        this.plan.clear(index)
        this.palette.setReady(this.plan.isFull())
        this.talk.hush()
    }

    // ───────────────────────────────────────────────────────────── descer

    private async run() {
        if (this.state !== 'building' || !this.plan.isFull()) return
        const gen = ++this.gen

        this.state = 'running'
        this.palette.setEnabled(false)
        this.palette.setReady(false)
        this.talk.hush()
        this.audio.go()
        this.park.reset()

        /* O foco entra ANTES do primeiro empurrão: a criança acabou de
         * montar, e a tela inteira passa a dizer "agora olhe". */
        await this.focus.enter(SKATER.startX)
        if (gen !== this.gen) return

        const marks = this.phase.marks
        const program = this.plan.program as TrickKind[]

        for (let i = 0; i < marks.length; i++) {
            this.plan.setActive(i)
            this.park.highlight(i)

            await this.park.rollTo(this.park.approachX(i, program[i]))
            if (gen !== this.gen) return

            if (!solves(marks[i], program[i])) {
                void this.fall(i)
                return
            }

            if (program[i] === 'subir') this.audio.ramp()
            else if (program[i] === 'pular') this.audio.ollie()
            else this.audio.push()

            await this.park.act(program[i], i)
            if (gen !== this.gen) return

            this.hits += 1
            this.resolved += 1
        }

        this.plan.idle()
        this.park.highlight(-1)
        await this.park.rollTo(this.park.exitX)
        if (gen !== this.gen) return

        const points = this.phaseClean ? 10 * marks.length : 5 * marks.length
        this.score += points
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.levelDef.level,
        })
        this.emitCheckpoint()

        await this.park.cheer()
        if (gen !== this.gen) return
        await this.focus.exit()
        if (gen !== this.gen) return
        void this.finishPhase()
    }

    /**
     * A TRAVA, e ela é sobre UM ESPAÇO. O mundo para, o espaço culpado ganha
     * cadeado e tremor, e o balão diz o que estava ali — nunca "tente de
     * novo" e nunca a resposta. Só trocar aquela manobra destrava.
     */
    private async fall(index: number) {
        const gen = this.gen
        this.state = 'locked'
        this.clockOn = false
        this.errors += 1
        this.phaseClean = false
        this.slotFalls[index] += 1

        this.audio.fall()
        this.talk.flash(C.bad)
        FX.shakeCam(this, 'leve')

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        await this.park.fall(index)
        if (gen !== this.gen) return

        // a saída do foco já para em cima do espaço culpado, e não no começo
        void this.focus.view(this.park.marksX[index] + W * 0.15)
        await this.focus.exit()
        if (gen !== this.gen) return

        void this.talk.say(fallSentence(this.phase.marks[index]), C.bad)
        await this.plan.blame(index)
        if (gen !== this.gen) return

        if (this.slotFalls[index] >= 2) {
            const right = this.phase.palette.find(kind => solves(this.phase.marks[index], kind))
            if (right) this.palette.hint(right)
        }

        /*
         * A manobra errada sai do espaço sozinha. Deixá-la ali obrigaria a
         * criança a descobrir que precisa tocar nela primeiro — e o que ela
         * precisa descobrir é o passo, não a interface.
         */
        this.plan.clear(index)
        this.park.reset()
        this.state = 'building'
        this.clockOn = true
        this.palette.setEnabled(true)
        this.palette.setReady(this.plan.isFull())
        this.help.setEnabled(true)
    }

    // ─────────────────────────────────────────────────────────── tutorial

    /**
     * TRÊS PASSOS, e o texto de cada um cabe num fôlego.
     *
     * O passo "Olhe o que ele faz" saiu daqui: quem apresenta o fantasma
     * agora é a ABERTURA, com ele entrando em cena enquanto a frase é dita.
     * O tutorial só fala do que a criança tem de FAZER.
     *
     * O tutorial aponta e bate no lugar certo — `pointer.tap` desenha um
     * toque, não um trajeto, porque trajeto é o desenho universal de
     * ARRASTAR e aqui nada se arrasta. A frase é legenda do dedo, não
     * explicação; quem ainda não lê entende pelo ponteiro sozinho.
     *
     * **Nenhuma palavra difícil.** A primeira versão dizia "Olhe a linha
     * dele", "Ela pousa neste anel" e "Linha pronta? DROP!" — três frases com
     * três palavras que uma criança de 6 anos não conhece. Aqui não há termo
     * de skate nem de programação: só "igual", "aqui" e "vai".
     */
    private tutorialSteps(): TutorialStep[] {
        const ceu = 300
        const primeiro = this.park.marksX[0]
        return [
            {
                text: 'Toque para fazer igual.',
                shape: 'rect',
                x: (CARD.xs[0] + CARD.xs[2]) / 2, y: CARD.cy,
                w: CARD.xs[2] - CARD.xs[0] + CARD.w + 40, h: CARD.h + 40,
                balloonX: W / 2, balloonY: ceu,
                pointer: { fromX: CARD.xs[0], fromY: CARD.cy, toX: CARD.xs[0], toY: CARD.cy, tap: true },
            },
            {
                text: 'A figura fica aqui.',
                shape: 'circle', x: primeiro, y: MEDAL.y,
                w: MEDAL.size * 2.2, h: MEDAL.size * 2.2,
                balloonX: Math.min(W - 320, primeiro + 300), balloonY: ceu + 40,
            },
            {
                text: 'Cheio? Aperte VAI!',
                shape: 'circle', x: GO.x, y: GO.y, w: GO.r * 2.8, h: GO.r * 2.8,
                balloonX: W / 2 - 160, balloonY: ceu,
                pointer: { fromX: GO.x, fromY: GO.y, toX: GO.x, toY: GO.y, tap: true },
                buttonLabel: 'Vamos!',
            },
        ]
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        // o tutorial aponta para o primeiro espaço: o parque volta ao começo
        void this.focus.view(0, 0)
        createTutorial(this, {
            key: `ef15co02-maratona-l${this.levelDef.level}`,
            once,
            accent: C.ok,
            safeTop: 12,
            textSize: 36,
            balloonWidth: 560,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    private replayTutorial() {
        if (this.state !== 'building' && this.state !== 'locked') return
        const previous = this.state
        this.state = 'tutorial'
        this.clockOn = false
        this.help.setEnabled(false)
        this.palette.setEnabled(false)
        this.runTutorial(false, () => {
            this.state = previous
            this.clockOn = true
            this.help.setEnabled(true)
            this.palette.setEnabled(true)
        })
    }

    // ─────────────────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.clockOn = false
        this.help.setEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.levelDef.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)
        if (gen !== this.gen) return

        const level = this.levelDef.level

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: `Nível ${level} completo!`,
                subtitle: `Três caminhos que deram certo  ·  ${formatTime(this.elapsed)}`,
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2600,
                    label: 'Arrumando o próximo parque...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft, level: next, points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Caminho perfeito!',
            subtitle: `Você montou os seus algoritmos!  ·  ${formatTime(this.elapsed)}`,
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal, level: 1, points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.board,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ──────────────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = marksInLevel(this.levelDef)
        const partial = marksBefore(this.levelDef.level)
            + (complete ? total : Math.min(this.resolved, total))
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((partial / TOTAL_MARKS) * 100),
            score: Math.max(0, this.score),
            stage: this.levelDef.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.levelDef.level) {
                    this.scene.restart({
                        lives: this.livesLeft, level: command.stage, points: this.score,
                    })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.setPaused(true)
            if (command.type === 'RESUME_GAME') this.setPaused(false)
        })
    }

    private setPaused(paused: boolean) {
        if (this.paused === paused) return
        this.paused = paused
        if (paused) this.scene.pause()
        else this.scene.resume()
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
