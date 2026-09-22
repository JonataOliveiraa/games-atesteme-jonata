import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'

import {
    LEVELS,
    cardOf,
    evaluate,
    fieldOf,
    litTerms,
    pointsFor,
    termHolds,
    termsOf,
} from '../data/levels'
import { critterOf } from '../data/critters'
import { DEPTH, H, HAND, HUD, POSTER, RULER, STAND, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import type { CardDef, CaseDef, CritterDef, LevelDef, Phase, Value } from '../types'

import { drawRuler } from './art'
import { createCritter, type Critter } from './critter'
import { createPoster, type Poster } from './poster'
import { createHand, type Hand } from './hand'
import { createHud, type Hud } from './hud'
import { createClerk, type Clerk } from './clerk'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'achados-e-perdidos'

/** O chão do céu. Acima é praça, abaixo é grama. */
const GROUND_Y = 452

/**
 * A dica do erro fala do que a carta disse, nunca do que a criança deveria
 * ter jogado. Uma linha, e ela cabe no balão sem quebrar.
 */
const NOT_TEXT: Record<Value, string> = {
    blue: 'ele não é azul',
    green: 'ele não é verde',
    red: 'ele não é vermelho',
    yellow: 'ele não é amarelo',
    hat: 'ele não tem chapéu',
    glasses: 'ele não tem óculos',
    big: 'ele não é grande',
    small: 'ele não é pequeno',
}

const IS_TEXT: Record<Value, string> = {
    blue: 'mas ele é azul!',
    green: 'mas ele é verde!',
    red: 'mas ele é vermelho!',
    yellow: 'mas ele é amarelo!',
    hat: 'mas ele tem chapéu!',
    glasses: 'mas ele tem óculos!',
    big: 'mas ele é grande!',
    small: 'mas ele é pequeno!',
}

/** O OU só é falso quando os DOIS lados são falsos — e é o que ele diz. */
const OR_TEXT = 'nenhum dos dois vale'

const LEVEL_SUB: Record<number, string> = {
    1: 'Você disse só a verdade sobre eles.',
    2: 'O E quer as duas. O OU se contenta com uma.',
    3: 'Você leu a carta inteira antes de pendurar.',
}

const LEVEL_MSG: Record<number, string> = {
    1: 'Dizer o que ele NÃO é também é dizer a verdade.',
    2: 'Uma carta com E acende dois campos de uma vez.',
    3: 'O NÃO troca o termo, e só o termo.',
}

/**
 * A dica fala do que a carta DISSE, nunca do que a criança deveria ter
 * jogado. Num E, ela nomeia o termo que falhou — que é exatamente o que
 * derrubou a carta inteira. Num OU, os dois falharam, e ela diz isso.
 */
function hintFor(card: CardDef, critter: CritterDef): string {
    if (card.op === 'ou') return OR_TEXT
    const failed = termsOf(card).find(term => !termHolds(term, critter)) ?? card.term
    return failed.negated ? IS_TEXT[failed.value] : NOT_TEXT[failed.value]
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private caseIndex = 0
    private phase: Phase = 'intro'
    private gen = 0

    private cards: CardDef[] = []
    private missedHere = false

    private score = 0
    private hits = 0
    private errors = 0
    private casesDone = 0

    private critter!: Critter
    private poster!: Poster
    private hand!: Hand
    private hud!: Hud
    private audio!: Audio

    private clerk!: Clerk

    private unsubPlatform?: () => void

    private get case(): CaseDef {
        return this.level.cases[this.caseIndex]
    }

    private get subject(): CritterDef {
        return critterOf(this.case.critter)
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.caseIndex = 0
        this.phase = 'intro'
        this.cards = []
        this.missedHere = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.casesDone = 0
    }

    create() {
        this.input.topOnly = true

        this.buildBackground()

        this.audio = createAudio()
        this.clerk = createClerk(this)
        this.critter = createCritter(this)
        this.poster = createPoster(this)
        this.hand = createHand(this, { onPick: index => void this.pick(index) })
        this.hud = createHud(this, {
            cases: this.level.cases.length,
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
            y: HUD.livesY,
            size: 30,
            tint: C.coral,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startCase(0)
    }

    /* ─────────────────────────────── cenário ───────────────────────────── */

    private buildBackground() {
        if (this.textures.exists('bg-praca')) {
            this.add.image(W / 2, H / 2, 'bg-praca').setDisplaySize(W, H).setDepth(DEPTH.bg)
        } else {
            const g = this.add.graphics().setDepth(DEPTH.bg)
            g.fillGradientStyle(C.sky, C.sky, C.skyLow, C.skyLow, 1)
            g.fillRect(0, 0, W, GROUND_Y)
            g.fillStyle(C.grassDark, 1)
            g.fillRect(0, GROUND_Y, W, 10)
            g.fillStyle(C.grass, 1)
            g.fillRect(0, GROUND_Y + 10, W, H - GROUND_Y - 10)
        }

        /* o balcão é `Graphics`, e é de propósito: o pé do bichinho e o tampo
           saem da MESMA conta. Pintado num PNG, a arte passaria a ter um
           contrato de alinhamento para cumprir. */
        const stand = this.add.graphics().setDepth(DEPTH.stand)
        const left = STAND.cx - STAND.topW / 2
        stand.fillStyle(C.counterDark, 1)
        stand.fillRoundedRect(left + 30, STAND.topY + 16, STAND.topW - 60, STAND.legH, 8)
        stand.lineStyle(6, C.line, 1)
        stand.strokeRoundedRect(left + 30, STAND.topY + 16, STAND.topW - 60, STAND.legH, 8)
        stand.fillStyle(C.counter, 1)
        stand.fillRoundedRect(left, STAND.topY - 4, STAND.topW, STAND.topH, 10)
        stand.lineStyle(6, C.line, 1)
        stand.strokeRoundedRect(left, STAND.topY - 4, STAND.topW, STAND.topH, 10)

        /**
         * A régua só existe quando alguma carta do nível fala de tamanho —
         * régua sem pergunta de tamanho é mobília, e a validação dos dados
         * garante que os dois andam juntos.
         */
        if (this.level.ruler) {
            const ruler = this.add.graphics().setPosition(RULER.x, RULER.baseY).setDepth(DEPTH.stand + 1)
            drawRuler(ruler, { h: RULER.h, w: RULER.w, markFromBase: RULER.baseY - RULER.markY })
        }
    }

    private shutdownScene() {
        this.gen++
        this.clerk?.destroy()
        this.hand?.destroy()
        this.poster?.destroy()
        this.critter?.destroy()
        this.hud?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    /* ──────────────────────────────── o cartaz ─────────────────────────── */

    private async startCase(index: number) {
        const gen = ++this.gen
        this.caseIndex = index
        this.missedHere = false
        this.phase = 'intro'

        const def = this.case
        this.cards = def.hand.map(cardOf)

        this.audio.arrive()
        await this.critter.show(this.subject)
        if (gen !== this.gen) return

        await this.poster.show(this.subject, def.fields)
        if (gen !== this.gen) return

        await this.hand.deal(this.cards)
        if (gen !== this.gen) return

        /* o tabuleiro entra ANTES do tutorial, senão o recorte ilumina tela vazia */
        if (index === 0) {
            this.runTutorial(true, () => this.beginPlay())
            return
        }
        this.beginPlay()
    }

    private beginPlay() {
        if (this.phase === 'done') return
        this.phase = 'playing'
        this.hand.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private async pick(index: number) {
        if (this.phase !== 'playing') return
        const gen = this.gen

        this.phase = 'judging'
        this.hand.setEnabled(false)
        this.hand.calm()
        this.audio.tap()

        const card = this.cards[index]
        const critter = this.subject
        const ok = evaluate(card, critter)

        await this.hand.lift(index)
        if (gen !== this.gen) return

        /* a conferência acontece no bichinho, TERMO A TERMO, nunca numa tabela */
        for (const term of termsOf(card)) {
            const holds = termHolds(term, critter)
            await this.critter.highlight(fieldOf(term.value), holds)
            if (gen !== this.gen) return
            if (holds) this.audio.right()
            else this.audio.wrong()
        }

        await this.hand.stamp(index, ok)
        if (gen !== this.gen) return

        if (ok) {
            const lit = litTerms(card, critter)
            await this.hand.flyTo(index, this.poster.fieldWorld(fieldOf(lit[0].value)))
            if (gen !== this.gen) return

            for (const term of lit) {
                this.audio.snap()
                await this.poster.fill(fieldOf(term.value), term.value, term.negated)
                if (gen !== this.gen) return
            }

            /* a correção do OU exclusivo, feita com festa e não com bronca */
            if (card.op === 'ou' && lit.length === 2) {
                await this.clerk.say('os dois! o OU aceita os dois', 'cheer')
                if (gen !== this.gen) return
            }

            this.hits += 1
            if (this.case.fields.every(f => this.poster.isFilled(f))) {
                await this.finishCase(gen)
                return
            }
            this.beginPlay()
            return
        }

        this.chargeOnce()
        await this.hand.drop(index)
        if (gen !== this.gen) return

        await this.clerk.say(hintFor(card, critter), 'think')
        if (gen !== this.gen) return

        /* depois de uma carta falsa, a certa respira: onde olhar, não o que fazer */
        const help = this.cards.findIndex(
            c => evaluate(c, critter) && !this.poster.isFilled(fieldOf(c.term.value)),
        )
        if (help >= 0) this.hand.breatheAt(help)

        this.beginPlay()
    }

    private async finishCase(gen: number) {
        this.phase = 'done'
        this.hand.setEnabled(false)
        this.casesDone += 1

        const points = pointsFor(this.missedHere)
        this.score += points
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.clerk.setMood('cheer')
        await this.critter.celebrate()
        if (gen !== this.gen) return

        await this.hud.celebrate(this.caseIndex)
        if (gen !== this.gen) return

        this.audio.fanfare()
        await this.poster.complete()
        if (gen !== this.gen) return

        this.clerk.setMood('calm')
        await FX.all(this.hand.clear(), this.critter.leave())
        if (gen !== this.gen) return

        const next = this.caseIndex + 1
        if (next < this.level.cases.length) void this.startCase(next)
        else void this.endLevel()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.phase = 'done'
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        void FX.confetti(this, { colors: [C.coral, C.green, C.sky, C.white] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.coral,
            panelColor: 0xfffaf0,
            overlayColor: 0x2f3a46,
            titleColor: CSS.ink,
            subtitleColor: CSS.orange,
            messageColor: CSS.inkSoft,
            title: this.errors === 0 ? 'Nenhum cartaz mentiu!' : 'Todos os bichinhos acharam o dono!',
            subtitle: LEVEL_SUB[this.level.level],
            message: LEVEL_MSG[this.level.level],
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                    buttons: [
                        {
                            label: 'JOGAR DE NOVO',
                            color: C.coral,
                            onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                        },
                    ],
                }
                : {
                    autoAdvance: {
                        delay: 2600,
                        label: 'Próximo nível',
                        onComplete: () =>
                            this.scene.restart({
                                level: this.level.level + 1,
                                points: this.score,
                                lives: this.livesLeft,
                            }),
                    },
                }),
        })
    }

    private chargeOnce() {
        this.errors += 1
        if (this.missedHere) return
        this.missedHere = true
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    /* ─────────────────────────────── tutorial ──────────────────────────── */

    private tutorialSteps(): TutorialStep[] {
        const card = { x: HAND.xs[0], y: HAND.cy }
        const hand = { shape: 'rect' as const, x: W / 2, y: HAND.cy, w: W - 40, h: HAND.cardH + 40 }

        if (this.level.level === 2) {
            return [
                {
                    ...hand,
                    text: 'Agora a carta diz DUAS coisas.',
                    balloonX: 640,
                    balloonY: 240,
                },
                {
                    ...hand,
                    text: 'O E quer as duas certas. O OU se contenta com uma.',
                    balloonX: 640,
                    balloonY: 240,
                },
                {
                    text: 'A régua diz quem é grande e quem é pequeno.',
                    shape: 'rect',
                    x: RULER.x,
                    y: RULER.baseY - RULER.h / 2,
                    w: 150,
                    h: RULER.h + 40,
                    balloonX: 820,
                    balloonY: 560,
                    buttonLabel: 'Vamos lá!',
                },
            ]
        }

        if (this.level.level === 3) {
            return [
                {
                    ...hand,
                    text: 'Agora as cartas misturam o NÃO com o E e o OU.',
                    balloonX: 640,
                    balloonY: 240,
                },
                {
                    ...hand,
                    text: 'Leia a carta inteira antes de pendurar.',
                    balloonX: 640,
                    balloonY: 240,
                    buttonLabel: 'Vamos lá!',
                },
            ]
        }

        return [
            {
                text: 'Este bichinho se perdeu.',
                shape: 'circle',
                x: STAND.cx,
                y: STAND.topY - 110,
                w: 340,
                h: 340,
                balloonX: 820,
                balloonY: 560,
            },
            {
                text: 'O cartaz só pode dizer a VERDADE sobre ele.',
                shape: 'rect',
                x: POSTER.x + POSTER.w / 2,
                y: POSTER.y + POSTER.hSmall / 2,
                w: POSTER.w + 24,
                h: POSTER.hSmall + 24,
                balloonX: 420,
                balloonY: 560,
            },
            {
                text: 'Toque numa carta que seja verdade. Ela sobe no cartaz.',
                shape: 'rect',
                x: W / 2,
                y: HAND.cy,
                w: W - 40,
                h: HAND.cardH + 40,
                balloonX: 640,
                balloonY: 240,
                buttonLabel: 'Vamos lá!',
                pointer: { fromX: card.x, fromY: card.y, toX: card.x, toY: card.y, tap: true },
            },
        ]
    }

    private runTutorial(force: boolean, then?: () => void) {
        const resume = this.phase === 'playing'
        this.phase = 'intro'
        this.hand.setEnabled(false)
        this.hand.calm()
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef15co03ap-l${this.level.level}`,
            once: !force,
            accent: C.coral,
            safeTop: HUD.h + 10,
            textSize: 32,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.hud.setHelpEnabled(true)
                if (this.phase === 'done') return
                if (then) {
                    then()
                    return
                }
                if (resume) this.beginPlay()
            },
        })
    }

    private replayTutorial() {
        if (this.phase === 'done' || this.phase === 'judging') return
        this.runTutorial(true)
    }

    /* ────────────────────────────── plataforma ─────────────────────────── */

    private emitCheckpoint(final = false) {
        const total = this.level.cases.length
        const done = final ? total : this.casesDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
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

