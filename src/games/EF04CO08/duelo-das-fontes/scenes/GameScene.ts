import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, tutorialDone, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'

import {
    LEVELS, TOTAL_HEADLINES, correctChoice, decisive, pointsFor, validateLevels,
} from '../data/levels'
import { byId } from '../data/cast'
import { BUTTONS, DEPTH, H, HUD, W } from '../data/layout'
import { C } from '../data/theme'
import type { Choice, Headline, LevelDef, Neighbour, Phase } from '../types'

import { createCounter, type Counter } from './counter'
import { createHud, type Hud } from './hud'
import { createRobot, type Robot } from './robot'
import { createSlip, type Slip } from './slip'
import { createSpeech, type Speech } from './speech'
import { createNeighbour, type NeighbourView } from './neighbour'
import { createChoiceButton, type ChoiceButton } from './buttons'
import { createAudio, type Audio } from './audio'
import { TEX } from './BootScene'

const GAME_ID = 'duelo-das-fontes'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A ORDEM DAS FALAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * As frases não podem chegar todas juntas nem em ordem qualquer: cada uma só
 * faz sentido depois da anterior. A rodada conta uma história, e cada tempo
 * entra junto com a peça que ele explica:
 *
 *   0. a apresentação →  quem ele é, e quem manda aqui   (só no nível 1)
 *   1. ele anuncia    →  "Escuta só essa que chegou!"    (vem coisa aí)
 *   2. o papel cai    →  a etiqueta NOTÍCIA é colada     (o que é isso)
 *   3. os vizinhos sobem                                 (quem está aqui)
 *   4. ele reclama    →  o `meet` do nível               (eles atrapalham ele)
 *   5. eles se apresentam →  cada um diz do que entende  (quem pode saber)
 *   6. ele pergunta   →  "Posso espalhar isso?"          (o que ele quer)
 *   7. o tutorial     →  o `hint` do nível               (o que este nível estreia)
 *
 * As falas de história PARAM e esperam o CONTINUAR. Nada corre no tempo do
 * jogo: quem lê devagar não perde nada, e um toque durante a escrita completa
 * a frase na hora.
 *
 * A PERGUNTA é DELE, sai do balão dele e aponta para ele. Uma pergunta solta no
 * meio da tela não é pergunta: a criança não sabe quem perguntou nem para quem.
 * E os dois botões respondem exatamente essa frase: PODE e NÃO PODE.
 */

/**
 * As falas cabem numa linha da faixa (até ~34 caracteres com o CONTINUAR ao
 * lado). Duas linhas espremem o corpo do texto e é o começo da tela confusa.
 */
const FOUND_LINES = [
    'Escuta só essa que chegou!',
    'Me contaram uma agora!',
    'Olha o que apareceu aqui!',
]

const ASK = 'Posso espalhar isso?'

/**
 * A apresentação, uma vez por partida, antes da primeira notícia.
 *
 * Sem ela a criança nunca descobre a coisa mais importante do jogo: **quem
 * manda no alto-falante do bairro é ela**. O robô aparece, diz quem é, e diz
 * que precisa da autorização dela — e só depois disso chega o primeiro papel.
 */
const INTRO = [
    'Oi! Eu sou o Espalha-Boato.',
    'Eu grito tudo que me contam!',
    'Mas só grito o que VOCÊ deixar.',
]

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE CUSTA VIDA, E O QUE NÃO CUSTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   perguntar a um vizinho     →  de graça, sem limite. Perguntar é o jogo.
 *   os botões antes da 1ª resposta →  não existem: eles sobem depois dela.
 *   decidir errado             →  TRAVA. Uma vida, uma vez por manchete; o
 *                                 bilhete diz o TIPO, e o segundo erro chama
 *                                 o vizinho que resolve.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private cast: Record<string, Neighbour> = {}
    private roundIndex = 0
    private phase: Phase = 'dealing'
    private gen = 0

    private locked = false
    private askedAny = false
    private buttonsUp = false
    private errorsInRound = 0
    private score = 0
    private hits = 0
    private errors = 0

    private counter!: Counter
    private hud!: Hud
    private robot!: Robot
    private slip!: Slip
    private speech!: Speech
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics
    private neighbours: NeighbourView[] = []
    private buttons: Partial<Record<Choice, ChoiceButton>> = {}

    private unsubPlatform?: () => void

    private get headline(): Headline {
        return this.level.headlines[this.roundIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.cast = byId(this.level.neighbours)

        this.roundIndex = 0
        this.phase = 'dealing'
        this.locked = false
        this.askedAny = false
        this.buttonsUp = false
        this.errorsInRound = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels(LEVELS)
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.counter = createCounter(this)
        this.audio = createAudio()
        this.robot = createRobot(this)
        this.slip = createSlip(this)
        this.speech = createSpeech(this, {
            onTalk: (on, voice) => {
                if (voice === 'robot' || voice === 'question') this.robot.talk(on)
            },
        })

        this.neighbours = this.level.neighbours.map((who, index) =>
            createNeighbour(this, {
                index,
                count: this.level.neighbours.length,
                who,
                onTap: id => void this.ask(id),
            }),
        )

        this.buttons.spread = createChoiceButton(this, {
            choice: 'spread',
            x: BUTTONS.spreadX,
            onPress: choice => void this.decide(choice),
        })
        this.buttons.hold = createChoiceButton(this, {
            choice: 'hold',
            x: BUTTONS.holdX,
            onPress: choice => void this.decide(choice),
        })

        this.hud = createHud(this, {
            level: this.level.level,
            goal: this.level.goal,
            rounds: this.level.headlines.length,
            onHelp: () => this.replayTutorial(),
        })

        this.frame = this.add.graphics().setDepth(DEPTH.frame).setAlpha(0)

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
            size: 28,
            tint: C.band,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startRound(0)
    }

    private shutdownScene() {
        this.gen++
        this.neighbours.forEach(n => n.destroy())
        this.buttons.spread?.destroy()
        this.buttons.hold?.destroy()
        this.hud?.destroy()
        this.speech?.destroy()
        this.slip?.destroy()
        this.robot?.destroy()
        this.counter?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ─────────────────────────────── a rodada ──────────────────────────── */

    private async startRound(index: number) {
        const gen = ++this.gen
        this.roundIndex = index
        this.locked = false
        this.askedAny = false
        this.errorsInRound = 0
        this.phase = 'dealing'

        this.buttonsUp = false
        this.applyInput()
        this.hud.setDone(index)
        this.neighbours.forEach(n => n.reset())
        this.buttons.spread?.lower()
        this.buttons.hold?.lower()

        // A tela entra um tempo de cada vez. Nunca há mais de uma coisa nova
        // por vez, e o que ainda não pode ser usado ainda não está desenhado.

        // 0 — quem é ele, e quem manda aqui (uma vez por partida)
        if (index === 0 && this.level.level === 1) {
            for (const line of INTRO) {
                await this.speech.say(line)
                if (gen !== this.gen) return
            }
        }

        // 1 — ele anuncia a notícia, e SÓ DEPOIS solta o papel. Anunciar antes
        // é o que dá ao papel um motivo de existir quando ele aterrissa.
        await this.speech.say(FOUND_LINES[index % FOUND_LINES.length])
        if (gen !== this.gen) return

        this.audio.deal()
        await FX.all(this.robot.blow(), this.slip.show(this.headline))
        if (gen !== this.gen) return
        this.audio.slap()

        // 2 — os vizinhos sobem, e cada um se apresenta logo depois de chegar:
        // primeiro a pessoa, depois o crachá dizendo de onde ela fala.
        await FX.all(...this.neighbours.map((n, i) => n.enter(i * 150)))
        if (gen !== this.gen) return

        // Na primeira rodada cada um se apresenta na PRÓPRIA voz, um por vez,
        // com o rabinho do balão apontando para ele. É aqui que a criança
        // descobre de que assunto cada um entende.
        if (index === 0) {
            await this.speech.say(this.level.meet)
            if (gen !== this.gen) return

            for (const view of this.neighbours) {
                const who = this.cast[view.id]
                this.audio.reveal()
                void view.jump()
                await this.speech.byNeighbour(who.intro, view.center.x)
                if (gen !== this.gen) return
            }
        }

        // 3 — e só então ele pergunta. A pergunta fica até a rodada acabar.
        await this.speech.ask(ASK)
        if (gen !== this.gen) return

        this.phase = 'asking'
        this.applyInput()
        this.neighbours[0]?.beacon(true)

        // 4 — o que fazer antes de responder
        if (index === 0) this.teachAsk()
    }

    /** Perguntar é de graça: não conta tentativa, não tira vida, não emite nada. */
    private async ask(id: string) {
        if (this.phase !== 'asking' && this.phase !== 'locked') return
        const view = this.neighbours.find(n => n.id === id)
        const answer = this.headline.answers.find(a => a.neighbour === id)
        if (!view || !answer || view.asked) return

        const gen = this.gen
        this.audio.reveal()
        await view.reveal(answer)
        if (gen !== this.gen) return

        this.slip.pulse()
        if (answer.kind === 'offTopic') this.audio.shrug()

        if (!this.askedAny) {
            this.askedAny = true
            this.neighbours.forEach(n => n.beacon(false))
            await this.raiseButtons()
            if (gen !== this.gen) return
        }
        if (this.locked) this.unlockAfterChange()
    }

    /**
     * Os botões nascem fora da tela e só sobem quando há o que decidir. Eles
     * sobem SEM overlay de tutorial: a pergunta já está escrita, e um painel
     * modal por cima de uma peça que acabou de aparecer só atrapalha.
     */
    private async raiseButtons() {
        if (this.buttonsUp) return
        this.buttonsUp = true
        this.audio.tap()
        await FX.all(
            this.buttons.spread?.rise(0) ?? Promise.resolve(),
            this.buttons.hold?.rise(90) ?? Promise.resolve(),
        )
        this.applyInput()
        this.speech.pulse()
    }

    private async decide(choice: Choice) {
        if (this.phase !== 'asking') return
        if (!this.askedAny) return

        const gen = this.gen
        this.phase = 'resolved'
        this.applyInput()

        this.buttons[choice]?.press()

        if (choice === correctChoice(this.headline, this.cast)) {
            await this.right(choice)
            return
        }
        if (gen !== this.gen) return
        await this.wrong()
    }

    private async right(choice: Choice) {
        const gen = this.gen

        const points = pointsFor(this.level, this.locked)
        this.score += points
        this.hits += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        void this.flashFrame(C.green)

        // A cara dele reage ao que ELE queria, que é gritar. Deixou espalhar?
        // Ele comemora — e comemora com razão, porque a notícia era verdade.
        // Barrou? Aí ele foi pego trazendo boato, e é aí que ele murcha.
        if (choice === 'spread') {
            this.audio.spread()
            await this.slip.toPlane()
            if (gen !== this.gen) return
            this.audio.inflate()
            await this.robot.cheer()
        } else {
            this.audio.hold()
            await this.slip.toBall()
            if (gen !== this.gen) return
            this.audio.deflate()
            await this.robot.deflate()
        }
        if (gen !== this.gen) return

        const key = decisive(this.headline, this.cast)
        const who = key ? this.cast[key.neighbour] : undefined
        if (key) {
            const view = this.neighbours.find(n => n.id === key.neighbour)
            void view?.shine()
        }
        await this.speech.close(this.headline.close, who?.icon)
        if (gen !== this.gen) return

        await this.hud.celebrate(this.roundIndex)
        if (gen !== this.gen) return

        const next = this.roundIndex + 1
        if (next < this.level.headlines.length) {
            void this.startRound(next)
            return
        }
        void this.finishLevel()
    }

    private async wrong() {
        const gen = this.gen

        this.loseOnce()
        this.errorsInRound += 1

        this.audio.wrong()
        void this.flashFrame(C.amber)
        await this.slip.shake()
        if (gen !== this.gen) return
    }

    private unlockAfterChange() {
        if (this.phase !== 'locked') return
        this.locked = true
        this.phase = 'asking'
        this.applyInput()
        this.speech.question(ASK)
        this.speech.pulse()
    }

    /** Uma vida por MANCHETE, no primeiro erro dela. Os seguintes, não. */
    private loseOnce() {
        if (this.locked) return
        this.locked = true
        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    /**
     * A TRAVA prende os BOTÕES, nunca as perguntas: perguntar é a saída da
     * trava, e desligar as duas coisas juntas deixaria a fase sem volta.
     */
    private applyInput() {
        const canAsk = this.phase === 'asking' || this.phase === 'locked'
        const canDecide = this.phase === 'asking' && this.buttonsUp
        this.neighbours.forEach(n => n.setEnabled(canAsk))
        this.buttons.spread?.setEnabled(canDecide)
        this.buttons.hold?.setEnabled(canDecide)
    }

    private async flashFrame(color: number) {
        this.frame.clear()
        this.frame.lineStyle(16, color, 1)
        this.frame.strokeRect(8, 8, W - 16, H - 16)
        this.frame.setAlpha(0)
        await FX.to(this, this.frame, { alpha: 1 }, { duration: 80 })
        await FX.to(this, this.frame, { alpha: 0 }, { duration: 380 })
    }

    /* ────────────────────────────── fim do nível ───────────────────────── */

    private async finishLevel() {
        const gen = ++this.gen
        this.phase = 'resolved'
        this.applyInput()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        await FX.all(
            this.buttons.spread?.hide() ?? Promise.resolve(),
            this.buttons.hold?.hide() ?? Promise.resolve(),
        )
        if (gen !== this.gen) return

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.band, C.green, C.sky, C.amber] })

        const last = this.level.level >= LEVELS.length
        const clean = this.errors === 0

        showLevelComplete(this, {
            accent: C.band,
            panelColor: 0xfffdf5,
            overlayColor: C.ink,
            title: last ? 'Você é um verificador!' : 'Nada passou sem conferir!',
            subtitle: clean ? 'Você conferiu tudo antes de decidir.' : 'Da próxima, pergunte antes de responder.',
            progress: { total: LEVELS.length, current: this.level.level },
            // Níveis 1 e 2 seguem sozinhos; o último para e oferece o recomeço.
            ...(last
                ? {
                    buttons: [{
                        label: 'JOGAR DE NOVO',
                        color: C.band,
                        onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesLeft }),
                    }],
                }
                : {
                    autoAdvance: {
                        delay: 2600,
                        label: 'Próximo nível',
                        onComplete: () => this.scene.restart({
                            level: this.level.level + 1,
                            points: this.score,
                            lives: this.livesLeft,
                        }),
                    },
                }),
        })
    }

    /* ─────────────────────────────── tutorial ──────────────────────────── */

    /**
     * UM passo, e só. A pergunta ("Pode espalhar isso?") está escrita na faixa
     * o tempo todo, e os botões respondem a ela palavra por palavra — então o
     * que sobra para o tutorial ensinar é o gesto: **antes de responder, vá
     * perguntar**. Duas telas de texto antes de jogar era o que estava
     * atrapalhando.
     *
     * `x`/`y` do recorte são o CENTRO da área, não o canto.
     */
    private askStep(): TutorialStep {
        const first = this.neighbours[0]
        const box = first.box
        return {
            text: this.level.hint,
            shape: 'rect',
            x: box.x + box.w / 2,
            y: box.y + box.h / 2,
            w: box.w + 14,
            h: box.h + 14,
            // A faixa dos botões ainda está vazia neste momento — é o único
            // lugar da tela onde o balão não cobre nem a notícia, nem a
            // pergunta, nem os vizinhos.
            balloonX: W / 2,
            balloonY: BUTTONS.y - 8,
            buttonLabel: 'OK',
            pointer: {
                fromX: first.center.x, fromY: first.center.y,
                toX: first.center.x, toY: first.center.y,
                tap: true,
                textureKey: TEX.hand,
            },
        }
    }

    private teachAsk(force = false) {
        const back = this.phase === 'paused' ? 'asking' : this.phase
        this.phase = 'paused'
        this.applyInput()
        createTutorial(this, {
            key: `ef04co08df-l${this.level.level}-ask`,
            once: !force,
            accent: C.band,
            safeTop: HUD.h + 10,
            // O padrão do componente é 21px — ~6px reais num celular. Aqui vai
            // 34, que é o corpo de balão de fala que este catálogo já usa.
            textSize: 34,
            balloonWidth: 660,
            steps: [this.askStep()],
            onFinish: () => {
                tutorialDone(this)
                this.phase = back
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.phase === 'paused') return
        this.teachAsk(true)
    }

    /* ─────────────────────────────── plataforma ────────────────────────── */

    private emitCheckpoint(final = false) {
        const done = this.roundIndex + (final ? 1 : 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_HEADLINES) * 100),
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
