import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX, type FxTarget } from '../../../../shared/effects/FX'

import { A, C, CSS } from '../data/theme'
import { DEPTH, H, HUD, PLAQUE, POSTO, SIGN_Y, W } from '../data/layout'
import { IMAGES, has } from '../data/files'
import {
    LEVELS,
    agradecimento,
    artistNamed,
    dicaDoAutor,
    falhaTexto,
    palavraDaAssinatura,
    pointsFor,
    verboDoNivel,
} from '../data/levels'
import {
    POSE,
    avaliar,
    avaliarPropria,
    signFrom,
    signLength,
    type Falha,
    type LevelDef,
    type Mode,
    type PhaseDef,
    type Piece,
    // `Sign` dos tipos é a ASSINATURA; o `Sign` de './sign' é o aviso âmbar
    // da tela. Os dois nomes colidiriam aqui, então a assinatura entra com
    // o nome que ela tem na cabeça de quem joga.
    type Sign as Assinatura,
} from '../types'

import { createArtwork, type Artwork } from './artwork'
import { createPlaque, type Plaque } from './plaque'
import { createTray, type Tray, type TrayItem } from './tray'
import { createMural, type Mural } from './mural'
import { createArtist, type Artist } from './artist'
import { createSign, type Sign } from './sign'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { dica } from './dica'
import { createVeu, type Veu } from './veu'

const GAME_ID = 'guilda-dos-criadores'
const fx = (o: unknown) => o as unknown as FxTarget

/** O que a bandeja está mostrando agora. Nunca os dois ao mesmo tempo. */
type Step = 'nada' | 'campainha' | 'carimbo' | 'assinatura'

/** Os gestos de verdade que o guia sabe esperar. */
type Gesto = 'virar' | 'campainha' | 'carimbo'

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
    /**
     * O autor JÁ ATENDEU a campainha nesta fase.
     *
     * É o estado que faz a mesma obra mudar de resposta: fechada, ela recusa
     * o carimbo; depois do sim do autor, ela aceita. Zera a cada fase — a
     * licença é daquela obra, não do nível.
     */
    private licensed = false
    /**
     * A MARCA DELA, escolhida na primeira obra do nível de CRIAR.
     *
     * Vive no NÍVEL, e não na fase: é justamente por durar as três obras que
     * ela vira uma assinatura. Fica `undefined` até a primeira fechar.
     */
    private mine?: Assinatura
    private picked: Piece[] = []
    /** A criança já viu o verso? Sem isso a bandeja não abre. */
    private seen = false
    /** As peças que já deram errado NESTA fase, para reaparecerem esmaecidas. */
    private wrongPieces: number[] = []
    /** Os índices das peças tocadas nesta tentativa, na ordem. */
    private pickedIdx: number[] = []

    /**
     * O GUIA ESTÁ NO AR? — e o que ele está esperando.
     *
     * Enquanto ele está no ar a bandeja não se abre sozinha: quem abre é o
     * passo do guia, na hora em que a fala pede aquele gesto. Sem isso a
     * criança toca no carimbo antes de a Lia explicar o ©, e a explicação
     * chega depois da ação — que é a ordem errada para tudo.
     */
    private guiando = false
    private aguardando: { gesto: Gesto; feito: () => void } | null = null
    /**
     * OS GESTOS QUE JÁ ACONTECERAM NESTA FASE.
     *
     * A obra continua tocável enquanto a Lia fala — e tem de continuar: mandar
     * a criança esperar o balão acabar para poder tocar é o oposto do que este
     * guia é. Só que ela pode virar a obra ANTES de a fala que pede a virada
     * terminar, e aí o guia ia esperar por um gesto que já passou — e travar
     * para sempre, com a bandeja fechada.
     *
     * Por isso o gesto fica registrado, e não só sinalizado: `esperar` olha
     * primeiro se aquilo já foi feito e, se foi, segue direto.
     */
    private feitos = new Set<Gesto>()
    /** O escuro do guia. Só existe enquanto ele conduz. */
    private veu?: Veu

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
        this.veu?.destroy()
        this.veu = undefined
        this.apagarDicaFinal()
        this.aguardando?.feito()
        this.aguardando = null
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
        this.licensed = false
        this.picked = []
        this.seen = false
        this.wrongPieces = []
        this.pickedIdx = []
        this.feitos.clear()
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
        const guiaVaiFalar = index === 0 && this.level.level === 1 && !this.tutorialJaVisto()

        /**
         * O ESCURO COMEÇA NA PRIMEIRA FALA, E NÃO NO MEIO DO CAMINHO.
         *
         * Ele entrava só quando o guia começava, ou seja DEPOIS da
         * apresentação — e a criança via as três primeiras falas com a sala
         * acesa e o resto do tutorial com a sala escura. Dois tutoriais com
         * duas caras, no mesmo minuto:
         *
         *   *"na primeira cena do tutorial da personagem, não tem fundo meio
         *   preto como o resto."*
         *
         * Aqui ele sobe SEM BURACO: a mesa ainda está vazia, e a única coisa
         * que há para olhar é a menina falando. O buraco nasce fechado no meio
         * da mesa, então a luz do passo 1 do guia ABRE em cima da figura que
         * acabou de pousar, em vez de acender do nada.
         */
        if (guiaVaiFalar) {
            this.veu = createVeu(this, { depth: DEPTH.fly - 2 })
            await this.veu.abrir()
            if (gen !== this.gen) return
        }

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
           obra é tocável, e a frase diz o que fazer — sem custar uma vida.

           No guia a frase sai: quem pede para virar é a Lia, com o halo em
           cima da obra, e duas instruções ao mesmo tempo é uma a mais. */
        await this.tray.show([], guiaVaiFalar ? undefined : 'Quem fez esta figura?  Vire e veja atrás.')
        if (gen !== this.gen) return

        this.mode = 'frente'
        this.art.setEnabled(true)

        /* A PRIMEIRA FASE DO NÍVEL 1 É ENSINADA FAZENDO, e só na primeira vez.
           Depois disso o lembrete é o botão `?`, que é curto de propósito. */
        if (index === 0 && this.level.level === 1 && !this.tutorialJaVisto()) {
            await this.guiar(gen)
        }
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
            /* No guia a bandeja continua VAZIA depois da virada: o carimbo
               aparece na fala que pede o carimbo. Peça visível e desligada é
               um toque que não responde — e "o jogo travou" é a leitura da
               criança, não "ainda não é a hora". */
            if (!this.guiando) await this.showStep()
            if (gen !== this.gen) return
            this.cumprir('virar')
        } else if (this.seen) {
            this.tray.setEnabled(!this.guiando)
            this.plaque.setEnabled(this.picked.length > 0)
        }
    }

    /** O verbo deste nível, tirado do selo das obras. */
    private get verbo() { return verboDoNivel(this.level) }

    /**
     * A bandeja mostra SÓ o que a plaquinha precisa agora.
     *
     * A ordem dos passos é a ordem do assunto de cada nível: creditar é
     * carimbo → assinatura; pedir põe a CAMPAINHA na frente dos dois; criar
     * troca o carimbo do crédito pelo selo dela. Três níveis, uma bandeja.
     */
    private async showStep(): Promise<void> {
        const gen = this.gen
        if (this.verbo === 'pedir' && !this.licensed) {
            this.step = 'campainha'
            await this.tray.show([{ kind: 'campainha' }] as TrayItem[])
        } else if (!this.stamped) {
            this.step = 'carimbo'
            const carimbo: TrayItem = { kind: this.verbo === 'criar' ? 'minha' : 'carimbo' }
            await this.tray.show([carimbo])
        } else {
            this.step = 'assinatura'
            await this.tray.show(this.phase.tray as TrayItem[])
        }
        if (gen !== this.gen) return
        /* Com o guia no ar a bandeja nasce desligada: ela abre na fala que
           pede aquele gesto, e não no instante em que tem peça dentro. */
        this.tray.setEnabled(!this.guiando)
        this.plaque.setEnabled(this.picked.length > 0)
    }

    /* ────────────────────────────── a bandeja ─────────────────────────── */

    private async onPick(index: number) {
        if (this.mode !== 'verso' && this.mode !== 'frente') return
        if (!this.seen) return
        const gen = this.gen
        this.apagarDicaFinal()

        /*
         * A CAMPAINHA.
         *
         * Ela não põe nada na plaquinha: o que ela faz é CHAMAR alguém. O
         * autor aparece, diz que sim, e é a fala dele que solta o carimbo —
         * a licença é uma resposta de gente, não um objeto que se cola.
         */
        if (this.step === 'campainha') {
            this.tray.setEnabled(false)
            this.audio.stamp()
            await this.tray.launch(index, this.art.pos())
            if (gen !== this.gen) return

            const autor = this.phase.obra.author
            if (autor !== null) {
                await this.artist.beat(
                    autor, POSE.agradecendo,
                    'Pode usar sim! Só não esquece de pôr de quem é.',
                    'Combinado',
                )
                if (gen !== this.gen) return
            }

            this.licensed = true
            await this.showStep()
            if (gen !== this.gen) return
            this.cumprir('campainha')
            return
        }

        if (this.step === 'carimbo') {
            this.tray.setEnabled(false)
            this.audio.stamp()
            await this.tray.launch(index, this.plaque.stampPos())
            if (gen !== this.gen) return
            await this.plaque.ink()
            if (gen !== this.gen) return
            this.stamped = true
            /* Mesma regra da virada: no guia as peças da assinatura entram
               junto com a fala que manda procurar a marca, e não antes. */
            if (!this.guiando) await this.showStep()
            if (gen !== this.gen) return
            this.cumprir('carimbo')
            return
        }

        if (this.step !== 'assinatura') return

        const peça = this.phase.tray[index]
        const alvo = this.alvoDaAssinatura(peça)
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

    /**
     * QUAL ASSINATURA ESTA FASE ESPERA.
     *
     * Nas obras dos outros é a do verso. Na obra da criança é a marca dela —
     * e na PRIMEIRA do nível, quando ela ainda não tem uma, é a peça que ela
     * acabou de tocar: aquele toque não está acertando nada, está decidindo.
     */
    private alvoDaAssinatura(peça: Piece): Assinatura {
        const doVerso = this.phase.obra.sign
        if (doVerso) return doVerso
        if (this.mine) return this.mine
        return peça.kind === 'marca'
            ? { kind: 'marca', id: peça.id }
            : { kind: 'letras', text: peça.ch }
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
        const propria = this.verbo === 'criar'

        const falha = propria
            ? avaliarPropria({ stamp: this.stamped ? 'minha' : null, sign: montada }, this.mine ?? null)
            : avaliar(
                { stamp: this.stamped ? 'credito' : null, sign: montada },
                obra,
                this.licensed,
            )

        if (!falha) {
            // A primeira obra dela É a escolha da marca: daqui em diante o
            // nível cobra esta, e não outra.
            if (propria && !this.mine) this.mine = montada
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
                agradecimento(this.phase.obra.sign),
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
        falha: Falha,
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
                    dicaDoAutor(this.phase.obra.sign), 'Entendi',
                )
                if (gen !== this.gen) return
            }
        }
        if (gen !== this.gen) return

        await this.sign.show(
            falhaTexto(falha, this.phase.obra.sign ?? this.mine ?? null, this.verbo === 'criar'),
            SIGN_Y,
        )
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
            /* A espera encolheu de 340 para 80: o agradecimento agora são três
               pulos de verdade, e são eles que ocupam o tempo. Somar pausa a
               gesto é o que faz um desfile de três virar fila de banco. */
            await FX.wait(this, 80)
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
                ? 'Toda figura do mural tem o nome de quem fez.'
                : 'Tem figura nova chegando na caixa.',
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

    /**
     * ══════════════════════════════════════════════════════════════════════
     *  O GUIA DA PRIMEIRA FASE — ENSINAR FAZENDO, NÃO CONTANDO
     * ══════════════════════════════════════════════════════════════════════
     *
     * Antes, a fase 1.1 abria com três cartelas escuras do `createTutorial`:
     * a criança lia "toque na obra", "copie aqui", "a obra sobe", tocava em
     * Próximo três vezes e só ENTÃO começava — com tudo já esquecido, porque
     * ler sobre um gesto não é o mesmo que fazê-lo. O dono do projeto pediu o
     * contrário: *"ela deveria já ensinar a criança em interação real como
     * fazer todo processo."*
     *
     * Agora a Lia conduz a fase inteira, e cada instrução dela PARA até o
     * gesto de verdade acontecer. Ela fala, sai, a criança faz, ela volta e
     * comenta o que apareceu na tela. É a ordem de uma aula: mostra-se o que
     * a pessoa acabou de fazer, nunca o que ela ainda vai fazer.
     *
     * ── O © É EXPLICADO AQUI, E SÓ AQUI ──────────────────────────────────
     *
     * A legenda do verso ("pode usar dando o crédito") é o lembrete que fica.
     * Mas um símbolo que a criança nunca viu não entra por uma legenda de 19
     * px: ele precisa de alguém apontando e dizendo o que é, uma vez, na hora
     * em que ele aparece na tela pela primeira vez. Isso é a fala 2 e 3.
     *
     * ── O QUE O GUIA NÃO FAZ ─────────────────────────────────────────────
     *
     * Ele nunca aponta para a resposta na bandeja. No passo da assinatura o
     * halo fica em cima do VERSO — "a resposta está aí, procure" —, porque
     * apontar a peça certa transformaria a única decisão do jogo num toque
     * ditado. Ensinar o caminho não é andar por ela.
     */
    private async guiar(gen: number) {
        this.guiando = true
        /* O `?` abre a cartela escura, que BLOQUEIA o toque — e o guia está
           justamente esperando um toque. Os dois no ar ao mesmo tempo é uma
           tela travada, então o botão dorme enquanto a Lia conduz. */
        this.hud.setHelpEnabled(false)
        /* O guia substitui o tutorial do nível, então é ele que marca a chave
           como vista — senão a apresentação e as cartelas voltariam na próxima
           partida, como se nada tivesse acontecido. */
        this.marcarTutorialVisto()

        const fim = () => {
            this.guiando = false
            this.aguardando = null
            this.hud.setHelpEnabled(true)
            /* A SALA ACENDE JUNTO COM O FIM DO GUIA. A escolha da assinatura é
               entre seis peças, e um véu com buraco em cima de uma delas seria
               o jogo apontando a resposta. */
            void this.veu?.fechar().then(() => {
                this.veu?.destroy()
                this.veu = undefined
            })
        }

        const obra = this.art.box()

        /**
         * ELA NÃO SAI DE CENA ATÉ O FIM DO GUIA.
         *
         * A primeira versão usava `beat` — falar e sumir — a cada instrução, e
         * a menina piscava para dentro e para fora da tela cinco vezes. Uma
         * professora não desaparece quando a criança começa a fazer: ela fica
         * ali, respirando, olhando. E é por ficar que o ANDAR dela pode ser
         * visto acontecendo.
         *
         * `speak` deixa o balão aberto com o botão já tocado; `hideBalloon`
         * tira o balão e mantém a menina.
         */
        const falarEFicar = async (pose: number, texto: string, label?: string) => {
            await this.artist.speak(0, pose, texto, label)
            this.artist.hideBalloon()
        }

        /* 1 · VIRAR — a luz ABRE na figura (o escuro já está de pé desde a
           apresentação), e a bandeja continua fechada. */
        await this.veu?.focar(obra)
        if (gen !== this.gen) return fim()
        let pararDica = dica(this, obra.x, obra.y, { raio: 150 })
        await falarEFicar(POSE.explicando, 'Toque na figura para ver o que tem atrás.', 'Vou tocar!')
        if (gen !== this.gen) return fim()
        await this.esperar('virar')
        pararDica()
        if (gen !== this.gen) return fim()

        /* 2 · O © — ela CHEGA PERTO, e a luz encolhe da figura inteira para o
           selo. Quem explica se aproxima do que está explicando, e a luz
           escorregando até lá diz "é ali" antes de a frase começar. */
        const selo = this.art.seloPos()
        await FX.all(
            this.artist.moveTo(POSTO.perto),
            this.veu!.focar({ x: selo.x, y: selo.y, w: 96, h: 96 }),
        )
        if (gen !== this.gen) return fim()
        pararDica = dica(this, selo.x, selo.y, { raio: 62 })
        await this.artist.speak(0, POSE.explicando, 'Achou este ©? Ele diz que a figura tem dono.')
        if (gen !== this.gen) return fim()
        await this.artist.speak(0, POSE.explicando, 'Pode usar, sim — mas dizendo quem fez. Isso é dar o crédito.')
        pararDica()
        if (gen !== this.gen) return fim()

        /* 3 · DE QUEM É — o outro campo, e a luz atravessa o cartão até ele. */
        const assinatura = this.art.signPos()
        await this.veu?.focar({ x: assinatura.x, y: assinatura.y, w: 110, h: 110 })
        if (gen !== this.gen) return fim()
        pararDica = dica(this, assinatura.x, assinatura.y, { raio: 70 })
        await this.artist.speak(0, POSE.explicando,
            `E deste lado fica ${palavraDaAssinatura(this.phase.obra.sign)} de quem fez.`)
        pararDica()
        if (gen !== this.gen) return fim()

        /* 4 · CARIMBAR — A TRAVESSIA. O trabalho deixa de ser em cima, na
           figura, e passa a ser embaixo: ela atravessa a sala INTEIRA e
           reaparece do outro lado, e a luz desce junto até a bandeja. Ir para
           o posto de casa aqui seria o caminho curto — e o caminho curto não
           faz ninguém virar a cabeça. */
        const plaq = this.plaque.box()
        await this.artist.moveTo(POSTO.esquerda)
        if (gen !== this.gen) return fim()
        await falarEFicar(POSE.explicando, 'Agora copie na plaquinha. Comece pelo carimbo.', 'Ok!')
        if (gen !== this.gen) return fim()
        /* O carimbo entra na bandeja AGORA, junto com a fala que o pede. */
        await this.showStep()
        if (gen !== this.gen) return fim()
        const peca = this.tray.posOf(0)
        await this.veu?.focar({ x: peca.x, y: peca.y, w: 160, h: 96 })
        if (gen !== this.gen) return fim()
        this.tray.setEnabled(true)
        pararDica = dica(this, peca.x, peca.y, { raio: 86 })
        await this.esperar('carimbo')
        pararDica()
        if (gen !== this.gen) return fim()

        /* 5 · ASSINAR — a luz vai para o carimbo que ACABOU de pousar, que é a
           coisa que a criança fez, e ela volta para casa pelo mesmo caminho. */
        await FX.all(
            this.veu!.focar({ x: plaq.x + PLAQUE.stampDX, y: plaq.y, w: 76, h: 76 }),
            this.artist.moveTo(POSTO.casa),
        )
        if (gen !== this.gen) return fim()
        await this.artist.speak(0, POSE.agradecendo, 'Isso! O carimbo já diz que a figura tem dono.')
        if (gen !== this.gen) return fim()
        /* "a marca" ou "o nome", conforme a fase — o guia roda na 1.1, que é
           de marca, mas a frase sai do dado e não da lembrança de quem a
           escreveu. Foi exatamente esse descuido que pôs "ficou escrito LIA"
           numa fase em que nada se escreve. */
        const palavra = palavraDaAssinatura(this.phase.obra.sign)
        await this.artist.beat(0, POSE.explicando,
            `Falta ${palavra}. Olhe atrás e ache na bandeja.`, 'Achei!')
        if (gen !== this.gen) return fim()
        /* AQUI ela sai: a escolha da marca é da criança, e alguém em pé ao
           lado esperando é plateia, não ajuda. */
        await this.showStep()
        if (gen !== this.gen) return fim()

        /* O guia ACABA AQUI: a escolha da assinatura é a primeira decisão de
           verdade do jogo, e ela é da criança. O halo fica no VERSO, onde
           está a resposta para ler — nunca na peça certa da bandeja. */
        fim()
        this.tray.setEnabled(true)
        this.pararDicaFinal = dica(this, assinatura.x, assinatura.y, { raio: 70, intervalo: 2600 })
    }

    /**
     * A ÚLTIMA DICA, QUE O PRIMEIRO TOQUE APAGA.
     *
     * Ela sobrevive ao fim do guia porque a criança ainda está procurando a
     * marca. Assim que ela toca em QUALQUER peça, já está procurando de
     * verdade — e halo que continua depois disso deixa de ser ajuda e vira
     * cobrança.
     */
    private pararDicaFinal?: () => void

    private apagarDicaFinal() {
        this.pararDicaFinal?.()
        this.pararDicaFinal = undefined
    }

    /** Espera um gesto DE VERDADE — ou segue, se ele já aconteceu. */
    private esperar(gesto: Gesto): Promise<void> {
        if (this.feitos.has(gesto)) return Promise.resolve()
        return new Promise<void>(feito => { this.aguardando = { gesto, feito } })
    }

    /** O gesto aconteceu. Fica registrado, e solta quem estava esperando. */
    private cumprir(gesto: Gesto) {
        this.feitos.add(gesto)
        if (this.aguardando?.gesto !== gesto) return
        const { feito } = this.aguardando
        this.aguardando = null
        feito()
    }

    /**
     * MARCA O TUTORIAL DO NÍVEL COMO VISTO.
     *
     * Escreve no MESMO conjunto do `registry` que o `createTutorial` usa — o
     * que o `tutorialJaVisto()` lê logo acima. Duas memórias para a mesma
     * pergunta é como a apresentação e o tutorial se desencontram.
     */
    private marcarTutorialVisto() {
        let vistos = this.registry.get('__tutorialsSeen') as Set<string> | undefined
        if (!vistos) {
            vistos = new Set<string>()
            this.registry.set('__tutorialsSeen', vistos)
        }
        vistos.add(`ef05co09-l${this.level.level}`)
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
                text: 'Toque na figura para ver o que tem atrás.',
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
                /* O lembrete nomeia o © de novo: quem aperta o `?` é quem não
                   lembra, e "o carimbo" sozinho não diz qual nem por quê.

                   E a segunda palavra sai da FASE: o `?` é tocável em todas
                   elas, então esta frase falava de "a marca do dono" em cima
                   de uma fase de letras — o mesmo erro do "ficou escrito LIA",
                   só que no caminho de quem já estava perdido. */
                text: `Atrás estão o © e ${palavraDaAssinatura(this.phase.obra.sign)} do dono. Copie os dois aqui.`,
                shape: 'rect',
                x: plaq.x, y: plaq.y, w: plaq.w, h: plaq.h,
                balloonX: W / 2, balloonY: 300,
            },
            {
                text: 'Com a plaquinha pronta, a figura sobe para o mural.',
                shape: 'rect',
                x: vao.x, y: vao.y, w: vao.w, h: vao.h,
                balloonX: W / 2, balloonY: 430,
            },
        ]
    }

    /**
     * O LEMBRETE DO BOTÃO `?`.
     *
     * Três cartelas curtas, e só isso — quem ensina o jogo é o guia da
     * primeira fase. Este é o caminho de quem já jogou e esqueceu a ordem, e
     * por isso ele roda SEMPRE que o `?` é tocado, sem `once`.
     */
    private runTutorial() {
        this.art.setEnabled(false)
        createTutorial(this, {
            key: 'ef05co09-l1',
            steps: this.steps(),
            once: false,
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
        /* O `show-tutorial` chega da plataforma, e ela não sabe do guia. */
        if (this.guiando) return
        this.tray.setEnabled(false)
        this.runTutorial()
    }
}

