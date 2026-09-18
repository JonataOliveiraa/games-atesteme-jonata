import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX, type FxTarget } from '../../../../shared/effects/FX'

import { A, C, CSS } from '../data/theme'
import { DEPTH, H, HUD, SIGN_Y, W } from '../data/layout'
import { IMAGES, has } from '../data/files'
import { FALHA_TEXT, LEVELS, artistNamed, pointsFor } from '../data/levels'
import {
    ARTIST_NAMES,
    POSE,
    avaliar,
    signFrom,
    signLength,
    type LevelDef,
    type Mode,
    type PhaseDef,
    type Piece,
} from '../types'

import { createArtwork, type Artwork } from './artwork'
import { createPlaque, type Plaque } from './plaque'
import { createTray, type Tray, type TrayItem } from './tray'
import { createMural, type Mural } from './mural'
import { createArtist, type Artist } from './artist'
import { createSign, type Sign } from './sign'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'guilda-dos-criadores'
const fx = (o: unknown) => o as unknown as FxTarget

/** O que a bandeja está mostrando agora. Nunca os dois ao mesmo tempo. */
type Step = 'nada' | 'carimbo' | 'assinatura'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'entrando'
    private step: Step = 'nada'
    private gen = 0

    private score = 0
    private errors = 0
    private attemptsHere = 0
    private chargedHere = false

    /** O que a plaquinha tem agora. Zerado a cada fase E a cada erro. */
    private stamped = false
    private picked: Piece[] = []
    /** A criança já viu o verso? Sem isso a bandeja não abre. */
    private seen = false
    /** As peças que já deram errado NESTA fase, para reaparecerem esmaecidas. */
    private wrongPieces: number[] = []
    /** Os índices das peças tocadas nesta tentativa, na ordem. */
    private pickedIdx: number[] = []

    private art!: Artwork
    private plaque!: Plaque
    private tray!: Tray
    private mural!: Mural
    private artist!: Artist
    private sign!: Sign
    private hud!: Hud
    private audio!: Audio
    private frame!: Phaser.GameObjects.Graphics

    constructor() {
        super({ key: 'GameScene' })
    }

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        const index = Phaser.Math.Clamp(data.level ?? 1, 1, LEVELS.length) - 1
        this.level = LEVELS[index]
        this.score = data.points ?? 0
        this.phaseIndex = 0
        this.mode = 'entrando'
        this.step = 'nada'
        this.errors = 0
        this.attemptsHere = 0
        this.chargedHere = false
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data.lives ?? this.livesTotal
    }

    create() {
        this.paintRoom()

        this.audio = createAudio()
        this.mural = createMural(this)
        this.art = createArtwork(this, { onTap: () => void this.onFlip() })
        this.plaque = createPlaque(this, { onTap: () => this.onErase() })
        this.tray = createTray(this, { onPick: i => void this.onPick(i) })
        this.artist = createArtist(this)
        this.sign = createSign(this)
        this.hud = createHud(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            onHelp: () => this.replayTutorial(),
        })
        this.frame = this.add.graphics().setDepth(DEPTH.frame).setAlpha(0)

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.livesY,
            size: 28,
            tint: C.amber,
            color: CSS.cream,
            stroke: CSS.header,
            strokeThickness: 6,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        /* Só no dev server: o Browser pane não tem como alcançar a cena de
           outro jeito, e conferir jogando é o único jeito de achar fase sem
           saída. Não existe no build. */
        if (import.meta.env.DEV) {
            ;(window as unknown as { __guilda?: GameScene }).__guilda = this
        }

        void this.startPhase(0)
    }

    /** O salão. O fundo tem de virar fundo sem parecer apagado. */
    private paintRoom() {
        if (has(this, IMAGES.salao)) {
            const bg = this.add.image(W / 2, H / 2, IMAGES.salao).setDepth(DEPTH.bg)
            bg.setDisplaySize(W, H)
            bg.preFX?.addBlur(0, 2, 2, A.blur)
            this.add.rectangle(W / 2, H / 2, W, H, C.wall, A.veil).setDepth(DEPTH.bg + 1)
            return
        }
        const g = this.add.graphics().setDepth(DEPTH.bg)
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.wood, 1)
        g.fillRect(0, 536, W, H - 536)
    }

    private shutdownScene() {
        this.gen++
        this.art?.destroy()
        this.plaque?.destroy()
        this.tray?.destroy()
        this.mural?.destroy()
        this.artist?.destroy()
        this.sign?.destroy()
        this.hud?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }

    /* ─────────────────────────────── a fase ───────────────────────────── */

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.attemptsHere = 0
        this.chargedHere = false
        this.stamped = false
        this.picked = []
        this.seen = false
        this.wrongPieces = []
        this.pickedIdx = []
        this.step = 'nada'
        this.mode = 'entrando'

        this.hud.setPhase(index)
        this.hud.setPrompt(this.level.prompt)
        this.sign.hide()
        this.artist.hide()
        this.plaque.reset()
        if (index === 0) this.mural.build(this.level.phases.length)

        await this.tray.show([])
        if (gen !== this.gen) return

        /**
         * A APRESENTAÇÃO DO JOGO — onde estou, o que falta, o que eu faço.
         *
         * Só na fase 0 e só na primeira partida: repetir a apresentação a cada
         * recomeço é o jeito mais rápido de ensinar a criança a tocar em
         * Próximo sem ler.
         */
        if (index === 0 && this.level.opening && !this.tutorialJaVisto()) {
            const falas = this.level.opening
            for (let i = 0; i < falas.length; i++) {
                const ultima = i === falas.length - 1
                await this.artist.speak(
                    falas[i].who, falas[i].pose, falas[i].text,
                    ultima ? 'Vamos lá!' : 'Próximo',
                )
                if (gen !== this.gen) return
            }
            await this.artist.exit()
            if (gen !== this.gen) return
        }

        /* A FALA DA FASE. Um artista entra, diz uma linha e sai — antes de a
           obra pousar, porque depois ela roubaria a cena. Nem toda fase tem
           uma, de propósito: uma fala em toda fase vira ritual e a criança
           passa a tocar em Próximo sem ler. */
        const intro = this.phase.intro
        if (intro) {
            await this.artist.beat(intro.who, intro.pose, intro.text)
            if (gen !== this.gen) return
        }

        this.audio.land()
        await this.art.deal(this.phase.obra)
        if (gen !== this.gen) return

        /* A BANDEJA VAZIA É A RECUSA DO JOGO. Antes da primeira virada só a
           obra é tocável, e a frase diz o que fazer — sem custar uma vida. */
        await this.tray.show([], 'De quem é isso?  Vire a obra.')
        if (gen !== this.gen) return

        this.mode = 'frente'
        this.art.setEnabled(true)

        if (index === 0 && this.level.level === 1) this.runTutorial(false)
    }

    /* ─────────────────────────────── virar ────────────────────────────── */

    private async onFlip() {
        if (this.mode !== 'frente' && this.mode !== 'verso') return
        const gen = this.gen
        this.art.setEnabled(false)
        this.tray.setEnabled(false)
        this.sign.hide()
        this.audio.flip()

        const lado = await this.art.flip()
        if (gen !== this.gen) return

        this.mode = lado === 'verso' ? 'verso' : 'frente'
        this.art.setEnabled(true)

        /* Conferir é de graça e não tem limite: virar e desvirar não muda
           estado nenhum. O que a primeira virada faz é ABRIR a bandeja. */
        if (lado === 'verso' && !this.seen) {
            this.seen = true
            await this.showStep()
            if (gen !== this.gen) return
        } else if (this.seen) {
            this.tray.setEnabled(true)
            this.plaque.setEnabled(this.picked.length > 0)
        }
    }

    /** A bandeja mostra SÓ o que a plaquinha precisa agora. */
    private async showStep(): Promise<void> {
        const gen = this.gen
        if (!this.stamped) {
            this.step = 'carimbo'
            await this.tray.show([{ kind: 'carimbo' }] as TrayItem[])
        } else {
            this.step = 'assinatura'
            await this.tray.show(this.phase.tray as TrayItem[])
        }
        if (gen !== this.gen) return
        this.tray.setEnabled(true)
        this.plaque.setEnabled(this.picked.length > 0)
    }

    /* ────────────────────────────── a bandeja ─────────────────────────── */

    private async onPick(index: number) {
        if (this.mode !== 'verso' && this.mode !== 'frente') return
        if (!this.seen) return
        const gen = this.gen

        if (this.step === 'carimbo') {
            this.tray.setEnabled(false)
            this.audio.stamp()
            await this.tray.launch(index, this.plaque.stampPos())
            if (gen !== this.gen) return
            await this.plaque.ink()
            if (gen !== this.gen) return
            this.stamped = true
            await this.showStep()
            return
        }

        if (this.step !== 'assinatura') return

        const peça = this.phase.tray[index]
        const alvo = this.phase.obra.sign!
        const falta = signLength(alvo) - this.picked.length
        if (falta <= 0) return

        this.tray.setEnabled(false)
        this.audio.letter(this.picked.length)
        await this.tray.launch(index, this.plaque.signPos())
        if (gen !== this.gen) return

        this.picked.push(peça)
        this.pickedIdx.push(index)
        this.plaque.setDraft(this.picked)
        this.plaque.setEnabled(true)

        const montada = signFrom(this.picked, alvo)
        if (!montada) {
            this.tray.setEnabled(true)
            return
        }
        await this.julgar(montada, gen)
    }

    /** Tirar a última peça. Sem botão de apagar, sem confirmação, sem custo. */
    private onErase() {
        if (this.step !== 'assinatura' || !this.picked.length) return
        if (this.mode !== 'verso' && this.mode !== 'frente') return
        this.picked.pop()
        this.plaque.setDraft(this.picked)
        this.plaque.setEnabled(this.picked.length > 0)
        this.audio.slip()
    }

    /* ───────────────────────────── o veredito ─────────────────────────── */

    private async julgar(montada: NonNullable<ReturnType<typeof signFrom>>, gen: number) {
        const obra = this.phase.obra
        const falha = avaliar(
            { stamp: this.stamped ? 'credito' : null, sign: montada },
            obra,
            false,
        )

        if (!falha) {
            await this.acertou(gen)
            return
        }
        await this.errou(falha, montada, gen)
    }

    private async acertou(gen: number) {
        this.mode = 'subindo'
        this.tray.setEnabled(false)
        this.plaque.setEnabled(false)
        this.art.setEnabled(false)
        /* O aviso do erro anterior não pode assistir ao acerto. */
        this.sign.hide()

        this.audio.lock()
        await this.plaque.lock()
        if (gen !== this.gen) return

        const ganho = pointsFor(this.level, this.attemptsHere === 0)
        this.score += ganho
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: ganho,
            stage: this.level.level,
        })

        await this.tray.show([])
        if (gen !== this.gen) return

        this.audio.rise()
        const destino = this.mural.slotPos(this.phaseIndex)
        await FX.all(
            this.art.riseTo(destino.x, destino.y, this.mural.slotScale),
            FX.to(this, fx(this.plaque.container),
                { x: destino.x, y: destino.y + 60, scaleX: 0.3, scaleY: 0.3, alpha: 0 },
                { duration: 620, ease: 'Cubic.easeInOut' }),
        )
        if (gen !== this.gen) return

        await this.mural.hang(this.phaseIndex, this.phase.obra)
        if (gen !== this.gen) return

        void FX.sparks(this, destino.x, destino.y, { color: C.gold, count: 18 })
        await this.hud.celebrate(this.phaseIndex)
        this.emitCheckpoint()

        /* O AGRADECIMENTO ESPERA O TOQUE. Ele vem depois das faíscas e da
           bolinha da fase, para a criança já ter visto o mural crescer quando
           o autor aparece — e ele só sai quando ela mandar. */
        const autor = this.phase.obra.author
        if (autor !== null) {
            await this.artist.beat(
                autor, POSE.agradecendo,
                `Valeu! Ficou escrito ${ARTIST_NAMES[autor]} lá no mural.`,
                'Continuar',
            )
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, 700)
        }
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 >= this.level.phases.length) {
            await this.endLevel()
            return
        }
        void this.startPhase(this.phaseIndex + 1)
    }

    private async errou(
        falha: keyof typeof FALHA_TEXT,
        montada: { kind: string; text?: string },
        gen: number,
    ) {
        this.mode = 'travado'
        this.tray.setEnabled(false)
        this.plaque.setEnabled(false)
        this.art.setEnabled(false)

        this.attemptsHere += 1
        this.chargeOnce()
        this.marcarErradas()

        this.audio.slip()
        await this.plaque.drop()
        if (gen !== this.gen) return

        /* A PIADA DO NOME ERRADO. Se o que ela montou é o nome de OUTRO
           artista da casa, é ele quem aparece — a criança vê o crédito indo
           para a pessoa errada, que é o estrago que o crédito errado causa. */
        const outro = montada.text ? artistNamed(montada.text) : null
        if (outro !== null && outro !== this.phase.obra.author) {
            await this.artist.beat(outro, POSE.confuso, 'Eu? Eu não fiz isso!', 'Ops!')
            if (gen !== this.gen) return
        } else {
            const autor = this.phase.obra.author
            if (autor !== null) {
                await this.artist.beat(
                    autor, POSE.explicando,
                    'Dá uma olhada no verso: está escrito lá.', 'Entendi',
                )
                if (gen !== this.gen) return
            }
        }
        if (gen !== this.gen) return

        await this.sign.show(FALHA_TEXT[falha], SIGN_Y)
        if (gen !== this.gen) return

        /* O verso pulsa: o jogo aponta para onde a resposta ESTÁ escrita,
           nunca para a peça que a resolveria. */
        if (this.art.facing === 'verso') await this.art.pulseVerso()
        void this.flashFrame(C.amber)

        this.picked = []
        this.pickedIdx = []
        this.plaque.setDraft([])
        /* A plaquinha caiu inteira, mas o carimbo NÃO foi o erro: ele volta
           calado, senão a criança tem de recarimbar a cada tentativa e o
           jogo cobra duas vezes pela mesma coisa. */
        if (this.stamped) await this.plaque.ink(true)
        this.mode = this.art.facing === 'verso' ? 'verso' : 'frente'
        this.art.setEnabled(true)
        await this.showStep()
        if (gen !== this.gen) return

        /* A peça errada reaparece ESMAECIDA — a bandeja é reconstruída a cada
           trava, então o esmaecido tem de ser reaplicado depois dela. */
        this.wrongPieces.forEach(i => this.tray.dim(i))

        /* Só depois do SEGUNDO erro a peça certa brilha. */
        if (this.attemptsHere >= 2) {
            const alvo = this.phase.obra.sign!
            const i = this.phase.tray.findIndex(p =>
                alvo.kind === 'marca'
                    ? p.kind === 'marca' && p.id === alvo.id
                    : p.kind === 'letra' && p.ch === alvo.text[0])
            if (i >= 0) void this.tray.shine(i)
        }
    }

    /**
     * ESMAECER SÓ O QUE ESTÁ REALMENTE FORA.
     *
     * Não é "a última peça tocada": numa assinatura de letras a tentativa
     * inteira é que deu errado, e apagar só a última acusaria uma letra que
     * pode até estar certa. Some da bandeja a peça que NÃO existe na
     * assinatura do verso — `LIA` contra `TOM` apaga as três; `TOA` contra
     * `TOM` apaga só o `A`. É dica de verdade, e não entrega a resposta.
     */
    private marcarErradas() {
        const alvo = this.phase.obra.sign
        if (!alvo) return
        this.pickedIdx.forEach((idx, i) => {
            const peça = this.picked[i]
            if (!peça) return
            const dentro =
                alvo.kind === 'letras'
                    ? peça.kind === 'letra' && alvo.text.includes(peça.ch)
                    : peça.kind === 'marca' && peça.id === alvo.id
            if (!dentro && !this.wrongPieces.includes(idx)) this.wrongPieces.push(idx)
        })
    }

    /* ───────────────────────────── fim do nível ───────────────────────── */

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'fim'
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

        this.hud.setPrompt('Mural completo!')
        await this.mural.celebrate()
        if (gen !== this.gen) return

        /* A GUILDA AGRADECE. Os autores das obras do mural passam um a um,
           na mesma janelinha — é o pagamento pelo trabalho, e é a única hora
           em que eles aparecem em sequência. */
        const autores = [...new Set(
            this.level.phases.map(f => f.obra.author).filter((a): a is number => a !== null),
        )]
        for (const quem of autores) {
            /* SEM BALÃO, logo sem botão. A regra é essa: botão onde há palavra
               para ler, nada onde há só um gesto. Três acenos com "Próximo"
               no fim do nível seriam três toques para não ler nada. */
            await this.artist.show(quem, POSE.agradecendo)
            await FX.wait(this, 340)
            await this.artist.exit(200)
            if (gen !== this.gen) return
        }

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.gold, C.green, C.amber, C.cream] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            title: 'Criador de Confiança!',
            subtitle: last
                ? 'Toda obra do mural tem o nome de quem fez.'
                : 'Tem obra nova chegando na caixa.',
            accent: C.gold,
            panelColor: C.cream,
            titleColor: CSS.header,
            progress: { total: LEVELS.length, current: this.level.level },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.gold,
                              onClick: () =>
                                  this.scene.restart({ level: 1, points: 0, lives: this.livesLeft }),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2200,
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
        if (this.chargedHere) return
        this.chargedHere = true
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    private emitCheckpoint(done = false) {
        const total = this.level.phases.length
        const doneCount = done ? total : this.phaseIndex
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((doneCount / total) * 100),
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
    }

    private async flashFrame(colour: number) {
        this.frame.clear()
        this.frame.lineStyle(14, colour, 1)
        this.frame.strokeRect(7, 7, W - 14, H - 14)
        this.frame.setAlpha(0)
        await FX.to(this, fx(this.frame), { alpha: 1 }, { duration: 90 })
        await FX.to(this, fx(this.frame), { alpha: 0 }, { duration: 340 })
    }

    /**
     * O tutorial deste nível já rodou nesta sessão?
     *
     * A apresentação e o tutorial contam a mesma história por caminhos
     * diferentes, e as duas só valem na primeira vez. O `createTutorial` guarda
     * as chaves vistas no `registry` da cena — ler de lá é o que mantém as duas
     * sincronizadas sem uma segunda memória para desencontrar.
     */
    private tutorialJaVisto(): boolean {
        const vistos = this.registry.get('__tutorialsSeen') as Set<string> | undefined
        return vistos?.has(`ef05co09-l${this.level.level}`) ?? false
    }

    /* ───────────────────────────── tutorial ───────────────────────────── */

    private steps(): TutorialStep[] {
        const obra = this.art.box()
        const plaq = this.plaque.box()
        const vao = this.mural.slotBox(0)
        return [
            {
                /* A apresentação já disse que a obra não é dela. Este passo é
                   só o GESTO — repetir a frase faz a criança parar de ler. */
                text: 'Toque na obra para ver o verso.',
                shape: 'rect',
                x: obra.x, y: obra.y, w: obra.w, h: obra.h,
                balloonX: W / 2, balloonY: 620,
                pointer: { fromX: obra.x, fromY: obra.y, toX: obra.x, toY: obra.y, tap: true },
            },
            {
                /* O recorte é SÓ a plaquinha, e o texto diz "aqui".
                   Recortar a obra junto mostrava a FRENTE dela enquanto a
                   frase falava do verso — a criança via o contrário do que
                   estava escrito. */
                text: 'O verso diz de quem é. Copie aqui: o carimbo e o nome.',
                shape: 'rect',
                x: plaq.x, y: plaq.y, w: plaq.w, h: plaq.h,
                balloonX: W / 2, balloonY: 300,
            },
            {
                text: 'Com a plaquinha pronta, a obra sobe para o mural.',
                shape: 'rect',
                x: vao.x, y: vao.y, w: vao.w, h: vao.h,
                balloonX: W / 2, balloonY: 430,
            },
        ]
    }

    private runTutorial(force: boolean) {
        this.art.setEnabled(false)
        createTutorial(this, {
            key: 'ef05co09-l1',
            steps: this.steps(),
            once: !force,
            accent: C.gold,
            textSize: 34,
            safeTop: HUD.h + HUD.accent + 12,
            onFinish: () => {
                if (this.mode === 'frente' || this.mode === 'verso') {
                    this.art.setEnabled(true)
                    this.tray.setEnabled(this.seen)
                }
            },
        })
    }

    private replayTutorial() {
        if (this.mode === 'fim' || this.mode === 'subindo') return
        this.tray.setEnabled(false)
        this.runTutorial(true)
    }
}

