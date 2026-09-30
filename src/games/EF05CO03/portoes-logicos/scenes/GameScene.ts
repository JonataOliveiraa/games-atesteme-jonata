import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'

import { criaturaDe, portaoCerto } from '../data/criaturas'
import {
    NIVEIS,
    balaoDoErro,
    criaturasNoNivel,
    pontosPor,
    validarNiveis,
} from '../data/ondas'
import { CURRAL, DEPTH, HUD, LANE_Y, PLACA, PORTAO, W } from '../data/layout'
import { C } from '../data/theme'
import type { Criatura, Lane, NivelDef, Onda } from '../types'

import { createField, type Field } from './field'
import { createPlaca, type Placa } from './placa'
import { createPortao, type Portao } from './portao'
import { createCurral, type Curral } from './curral'
import { createAtor, type Ator, type Marcha } from './criatura'
import { createFila, type Fila } from './fila'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { runDemo, type Demo } from './demo'
import { CORES_CONFETE } from './fila'

const GAME_ID = 'portoes-logicos'

/** Quanto a criaturinha leva da entrada até a bifurcação. Teto do tempo de pensar. */
const MARCHA_MS = 6000

/**
 * Até onde ela entra no braço antes de a placa julgar: a soleira do portão.
 *
 * 0,93 e não 0,82 porque em 0,82 ela parava EM CIMA da tábua e tapava o segundo
 * termo justo no instante em que a placa ia julgá-lo. Aqui ela para no vão do
 * portão, com a frase inteira livre ao lado dela.
 */
const SOLEIRA = 0.93

/** Tempo do braço INTEIRO. Cada trecho leva a fração dele, para a velocidade não mudar. */
const MS_BRACO = 1300

const LANES: Lane[] = ['cima', 'baixo']

const outra = (lane: Lane): Lane => (lane === 'cima' ? 'baixo' : 'cima')

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private nivel!: NivelDef
    private ondaIndex = 0
    private turma: Criatura[] = []
    private vez = 0

    private modo: 'abertura' | 'marchando' | 'esperando' | 'entrando' | 'travado' | 'foto' | 'fim' = 'abertura'
    private gen = 0

    private errosNaCriatura = 0
    private laneErrada: Lane | null = null
    private escolhaAntecipada: Lane | null = null
    private marcha: Marcha | null = null
    private dicaTimer?: Phaser.Time.TimerEvent
    private tutorialPendente = true
    private demo: Demo | null = null
    private demoPendente = false

    private score = 0
    private hits = 0
    private errors = 0
    private feitas = 0

    private field!: Field
    private placas!: Record<Lane, Placa>
    private portoes!: Record<Lane, Portao>
    private currais!: Record<Lane, Curral>
    private ator!: Ator
    private fila!: Fila
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get onda(): Onda {
        return this.nivel.ondas[this.ondaIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const numero = Phaser.Math.Clamp(data?.level ?? 1, 1, NIVEIS.length)
        this.nivel = NIVEIS[numero - 1]

        this.ondaIndex = 0
        this.vez = 0
        this.modo = 'abertura'
        this.errosNaCriatura = 0
        this.laneErrada = null
        this.escolhaAntecipada = null
        this.marcha = null
        this.demo = null
        this.demoPendente = true
        this.tutorialPendente = true
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.feitas = 0
    }

    create() {
        this.input.topOnly = true

        const problemas = validarNiveis(NIVEIS)
        if (problemas.length) console.error(`[${GAME_ID}]`, problemas)

        this.audio = createAudio(this)
        this.field = createField(this)

        this.placas = {
            cima: createPlaca(this, { lane: 'cima', negada: false }),
            baixo: createPlaca(this, { lane: 'baixo', negada: true }),
        }
        this.portoes = { cima: createPortao(this, 'cima'), baixo: createPortao(this, 'baixo') }
        this.currais = { cima: createCurral(this, 'cima'), baixo: createCurral(this, 'baixo') }

        this.ator = createAtor(this, () => this.audio.passo())
        this.fila = createFila(this)
        this.hud = createHud(this, {
            nivel: this.nivel.nivel,
            ondas: this.nivel.ondas.length,
            onHelp: () => this.repetirTutorial(),
        })

        this.montarZonas()
        this.bindTeclas()
        this.bindPlataforma()

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.repetirTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 28,
            tint: C.nao,
            depth: DEPTH.hud + 1,
            stage: () => this.nivel.nivel,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.iniciarOnda(0)
    }

    private shutdownScene() {
        this.gen++
        this.dicaTimer?.remove()
        this.demo?.cancelar()
        this.marcha?.cancelar()
        LANES.forEach(l => {
            this.placas[l]?.destroy()
            this.portoes[l]?.destroy()
            this.currais[l]?.destroy()
        })
        this.ator?.destroy()
        this.fila?.destroy()
        this.hud?.destroy()
        this.field?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.repetirTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────────────────────── entrada

    /**
     * Uma zona por raia, cobrindo PLACA + PORTÃO juntos.
     *
     * A frase e a porta são a mesma escolha, e obrigar o dedo a acertar só a
     * porta transformaria uma resposta de lógica numa prova de mira. O curral
     * fica de fora: ele é resultado, não botão.
     */
    private montarZonas() {
        const x0 = PLACA.cx - PLACA.w / 2 - 24
        const x1 = PORTAO.cx + 74
        LANES.forEach(lane => {
            this.add
                .zone((x0 + x1) / 2, LANE_Y[lane], x1 - x0, 214)
                .setOrigin(0.5)
                .setDepth(DEPTH.zones)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.escolher(lane))
        })
    }

    private bindTeclas() {
        const keyboard = this.input.keyboard
        if (!keyboard) return
        keyboard.on('keydown-UP', () => this.escolher('cima'))
        keyboard.on('keydown-W', () => this.escolher('cima'))
        keyboard.on('keydown-DOWN', () => this.escolher('baixo'))
        keyboard.on('keydown-S', () => this.escolher('baixo'))
    }

    private escolher(lane: Lane) {
        const c = this.ator.criatura
        if (!c) return

        // Quem já entendeu toca cedo. A criaturinha acelera e a escolha fica
        // guardada — tocar antes da hora nunca pode virar resposta perdida.
        if (this.modo === 'marchando') {
            this.demo?.cancelar()
            this.escolhaAntecipada = lane
            this.marcha?.acelerar()
            this.audio.chegou()
            return
        }

        if (this.modo === 'esperando') {
            if (this.demo && lane !== this.demo.lane) return
            this.demo?.cancelar()
            void this.resolver(lane)
            return
        }

        if (this.modo === 'travado') {
            // Destrava só com a ação correta. Insistir no portão errado não
            // conta erro de novo: o erro já foi cobrado uma vez.
            if (lane === portaoCerto(this.onda.frase, c)) void this.destravar(lane)
            else void this.ator.recuar()
        }
    }

    // ─────────────────────────────────────────────────────────────────── onda

    private async iniciarOnda(index: number) {
        const gen = this.gen
        this.ondaIndex = index
        this.vez = 0

        const onda = this.onda
        this.turma = onda.turma.map(criaturaDe)

        LANES.forEach(lane => {
            this.placas[lane].setFrase(onda.frase)
            this.placas[lane].limpar()
            this.placas[lane].pararPiscar()
            this.portoes[lane].fechar()
            this.currais[lane].vazio()
        })

        this.hud.setTitulo(this.nivel.objetivo)
        this.fila.montar(this.turma)
        await this.field.mostrarMarco(Boolean(onda.marco))
        if (gen !== this.gen) return

        await FX.wait(this, 420)
        if (gen !== this.gen) return
        void this.proximaCriatura()
    }

    private async proximaCriatura() {
        const gen = this.gen
        if (this.vez >= this.turma.length) {
            void this.fimDaOnda()
            return
        }

        const c = this.turma[this.vez]
        this.errosNaCriatura = 0
        this.laneErrada = null
        this.escolhaAntecipada = null

        LANES.forEach(lane => {
            this.placas[lane].limpar()
            this.placas[lane].pararPiscar()
            this.portoes[lane].fechar()
            this.portoes[lane].pararPiscar()
        })
        this.hud.calar()

        await this.fila.chamarPrimeira()
        if (gen !== this.gen) return

        this.ator.entrar(c)

        // O TABULEIRO ENTRA ANTES DO TUTORIAL, e a criaturinha também: recorte
        // sobre trilha vazia explicaria uma coisa que não está na tela.
        if (this.tutorialPendente) {
            this.tutorialPendente = false
            await this.mostrarTutorial()
            if (gen !== this.gen) return
        }

        this.modo = 'marchando'
        this.marcha = this.ator.marchar(MARCHA_MS)
        await this.marcha.pronta
        if (gen !== this.gen) return
        this.marcha = null

        if (this.escolhaAntecipada) {
            const lane = this.escolhaAntecipada
            this.escolhaAntecipada = null
            void this.resolver(lane)
            return
        }

        this.modo = 'esperando'
        this.audio.chegou()
        void this.ator.esperar().then(() => {
            if (this.modo === 'esperando') this.audio.boceja()
        })

        if (this.demoPendente) {
            this.demoPendente = false
            this.rodarDemo(c)
        }
    }

    /** O exemplo animado resolve a primeira criaturinha do nível — e é pulável. */
    private rodarDemo(c: Criatura) {
        const gen = this.gen
        const lane = portaoCerto(this.onda.frase, c)
        this.demo = runDemo(this, lane, this.portoes[lane].boca(), () => {
            if (gen !== this.gen || this.modo !== 'esperando') return
            void this.resolver(lane)
        })
        void this.demo.pronta.then(() => {
            this.demo = null
        })
    }

    // ────────────────────────────────────────────────────────────── a decisão

    private async resolver(lane: Lane) {
        const gen = this.gen
        const c = this.ator.criatura
        if (!c) return

        this.modo = 'entrando'
        this.demo?.cancelar()
        this.dicaTimer?.remove()
        this.hud.calar()
        LANES.forEach(l => {
            this.placas[l].pararPiscar()
            this.portoes[l].pararPiscar()
        })

        const caminho = this.field.caminho(lane)
        this.ator.parar()
        await this.portoes[lane].abrir(() => this.audio.portao())
        if (gen !== this.gen) return

        await this.ator.andarNoBraco(caminho, SOLEIRA, MS_BRACO)
        if (gen !== this.gen) return

        await this.placas[lane].mostrarAvaliacao(c, {
            termo: ok => (ok ? this.audio.termoOk() : this.audio.termoNao()),
            vira: para => this.audio.vira(para),
        })
        if (gen !== this.gen) return

        if (this.placas[lane].valor(c)) await this.acertou(lane, c, caminho)
        else await this.errou(lane, c, caminho)
    }

    private async acertou(lane: Lane, c: Criatura, caminho: Phaser.Curves.Path) {
        const gen = this.gen
        const pontos = pontosPor(this.errosNaCriatura === 0)

        this.audio.festinha()
        this.hud.flash(C.ok)
        await this.ator.comemorar()
        if (gen !== this.gen) return

        await this.ator.andarNoBraco(caminho, 1, MS_BRACO)
        if (gen !== this.gen) return
        await this.ator.atravessar()
        if (gen !== this.gen) return

        this.ator.esconder()
        await this.currais[lane].receber(c)
        if (gen !== this.gen) return

        this.score += pontos
        this.hits += 1
        this.feitas += 1
        this.vez += 1

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: pontos,
            stage: this.nivel.nivel,
        })
        this.emitCheckpoint()

        this.portoes[lane].fechar()
        await FX.wait(this, 320)
        if (gen !== this.gen) return
        void this.proximaCriatura()
    }

    /**
     * A TRAVA. A criaturinha volta calma, o cadeado fecha o portão errado, e o
     * jogo só anda com o toque certo. O balão diz a CAUSA — o que é verdade
     * sobre ela —, nunca qual portão escolher.
     */
    private async errou(lane: Lane, c: Criatura, caminho: Phaser.Curves.Path) {
        const gen = this.gen
        this.modo = 'travado'
        this.laneErrada = lane
        this.errosNaCriatura += 1
        this.errors += 1

        this.audio.erro()
        this.hud.flash(C.nao)
        FX.shakeCam(this, 'leve')
        this.hud.dizer(balaoDoErro(this.onda.frase, c))

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.nivel.nivel,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        await this.ator.recuar()
        if (gen !== this.gen) return
        await this.ator.voltar(caminho)
        if (gen !== this.gen) return

        this.portoes[lane].fechar()
        void this.portoes[lane].travar()

        const certo = outra(lane)
        this.dicaTimer?.remove()
        if (this.errosNaCriatura >= 2) {
            this.darDica(certo)
        } else {
            this.dicaTimer = this.time.delayedCall(2800, () => {
                if (this.modo === 'travado') this.darDica(certo)
            })
        }
    }

    private darDica(certo: Lane) {
        void this.placas[certo].piscar()
        void this.portoes[certo].piscar()
    }

    private async destravar(lane: Lane) {
        const gen = this.gen
        this.dicaTimer?.remove()
        this.hud.calar()
        this.audio.destrava()

        if (this.laneErrada) {
            await this.portoes[this.laneErrada].destravar()
            this.placas[this.laneErrada].limpar()
        }
        if (gen !== this.gen) return

        LANES.forEach(l => {
            this.placas[l].pararPiscar()
            this.portoes[l].pararPiscar()
        })
        this.laneErrada = null

        void this.resolver(lane)
    }

    // ────────────────────────────────────────────────────────── fim da rodada

    /** A foto: os dois currais mostram as turmas separadas, lado a lado. */
    private async fimDaOnda() {
        const gen = this.gen
        this.modo = 'foto'
        this.ator.esconder()

        await this.hud.marcarOnda(this.ondaIndex)
        if (gen !== this.gen) return

        await FX.all(this.currais.cima.celebrar(), this.currais.baixo.celebrar())
        if (gen !== this.gen) return
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        const proxima = this.ondaIndex + 1
        if (proxima < this.nivel.ondas.length) {
            void this.iniciarOnda(proxima)
            return
        }
        void this.fimDoNivel()
    }

    private async fimDoNivel() {
        const gen = ++this.gen
        this.modo = 'fim'
        this.hud.setEnabled(false)
        this.hud.setTitulo('')
        this.hud.calar()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.nivel.nivel,
            totalStages: NIVEIS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfarra()
        void FX.confetti(this, { colors: CORES_CONFETE })
        void FX.stars(this, CURRAL.cx, LANE_Y.cima, { count: 18 })
        void FX.stars(this, CURRAL.cx, LANE_Y.baixo, { count: 18 })
        this.hud.flash(C.ok)

        await FX.wait(this, 1400)
        if (gen !== this.gen) return

        const feito = this.nivel.nivel
        const comum = {
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            depth: DEPTH.overlay,
            progress: { total: NIVEIS.length, current: feito, size: 9 },
        }

        if (feito < NIVEIS.length) {
            showLevelComplete(this, {
                ...comum,
                title: 'Turmas separadas!',
                subtitle: 'O NÃO vira tudo do avesso — e você não caiu nessa.',
                autoAdvance: {
                    delay: 2600,
                    label: `${NIVEIS[feito].nome}...`,
                    onComplete: () =>
                        this.scene.restart({
                            lives: this.livesLeft,
                            level: feito + 1,
                            points: this.score,
                        }),
                },
            })
            return
        }

        showLevelComplete(this, {
            ...comum,
            title: 'Fazendinha organizada!',
            subtitle: 'O E exige os dois; o OU se contenta com um; o NÃO vira tudo do avesso.',
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.azul,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ──────────────────────────────────────────────────────────────── tutorial

    /**
     * Três falas, e cada uma carrega uma AÇÃO ou o objetivo. Nenhuma descreve
     * um objeto que o recorte já está mostrando.
     *
     * O tabuleiro já está montado e a criaturinha já está na trilha quando isto
     * roda — recorte sobre tela vazia não ensina nada.
     */
    private mostrarTutorial(force = false): Promise<void> {
        const alvoCima = this.placas.cima.bounds()
        const alvoBaixo = this.placas.baixo.bounds()
        // Do objeto de verdade, nunca de um número fixo: no replay pelo `?` a
        // criaturinha já saiu do lugar onde nasceu, e um recorte fixo
        // iluminaria grama vazia.
        const alvoCriatura = this.ator.bounds()

        const recorte = (b: { x: number; y: number; w: number; h: number }) =>
            ({ shape: 'rect' as const, x: b.x, y: b.y, w: b.w, h: b.h })

        const tocarCima = {
            pointer: {
                fromX: alvoCima.x,
                fromY: alvoCima.y,
                toX: alvoCima.x,
                toY: alvoCima.y,
                tap: true,
            },
        }

        const passosN1: TutorialStep[] = [
            {
                text: 'Cada criaturinha precisa passar por um portão.',
                ...recorte(alvoCriatura),
                balloonX: W / 2 + 120,
                balloonY: 250,
            },
            {
                text: 'Toque no portão cuja frase for verdadeira para ela.',
                ...recorte(alvoCima),
                balloonX: 420,
                balloonY: 560,
                ...tocarCima,
            },
            {
                text: 'Este é o avesso: vale para quem a frase de cima não descreve.',
                ...recorte(alvoBaixo),
                balloonX: 420,
                balloonY: 250,
            },
        ]

        // O nível 2 não reapresenta o jogo: ele estreia a placa de DUAS partes e
        // a palavra do meio, que é a única coisa nova.
        const alvoOperador = this.placas.cima.operadorBounds() ?? alvoCima
        const passosN2: TutorialStep[] = [
            {
                text: 'Agora a placa pede duas coisas.',
                ...recorte(alvoCima),
                balloonX: 420,
                balloonY: 560,
            },
            {
                text: 'Confira as duas na criaturinha antes de tocar.',
                ...recorte(alvoCriatura),
                balloonX: W / 2 + 160,
                balloonY: 232,
            },
            {
                text: 'O E quer as duas. Ao OU, basta uma.',
                ...recorte(alvoOperador),
                balloonX: 420,
                balloonY: 560,
                ...tocarCima,
            },
        ]

        // O nível 3 estreia o SEGUNDO tipo de NÃO. As três falas existem para
        // separar um do outro — é a única coisa nova, e é a que confunde.
        const alvoNegado = this.placas.cima.termoNegadoBounds() ?? alvoCima
        const alvoNaoDaFrase = this.placas.baixo.naoBounds() ?? alvoBaixo
        const passosN3: TutorialStep[] = [
            {
                text: 'Este NÃO gruda num pedaço só e vira só ele.',
                ...recorte(alvoNegado),
                balloonX: 420,
                balloonY: 560,
            },
            {
                text: 'Este outro fica em cima e vira a frase inteira.',
                ...recorte(alvoNaoDaFrase),
                balloonX: 430,
                balloonY: 232,
            },
            {
                text: 'Resolva cada pedaço, depois junte, e só então decida.',
                ...recorte(alvoCima),
                balloonX: 420,
                balloonY: 560,
                ...tocarCima,
            },
        ]

        const passos = [passosN1, passosN2, passosN3][this.nivel.nivel - 1] ?? passosN1

        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: `ef05co03-portoes-n${this.nivel.nivel}`,
                once: !force,
                safeTop: HUD.h + 12,
                textSize: 34,
                accent: C.gold,
                steps: passos,
                onFinish: () => resolve(),
            })
        })
    }

    /** O `?` PAUSA o jogo e devolve a criaturinha no mesmo ponto da trilha. */
    private repetirTutorial() {
        if (this.modo !== 'marchando' && this.modo !== 'esperando') return
        const voltar = this.modo
        this.modo = 'abertura'
        this.demo?.cancelar()
        this.marcha?.pausar()
        void this.mostrarTutorial(true).then(() => {
            if (this.modo !== 'abertura') return
            this.modo = voltar
            this.marcha?.retomar()
        })
    }

    // ────────────────────────────────────────────────────────────── plataforma

    private emitCheckpoint(completo = false) {
        const total = criaturasNoNivel(this.nivel)
        const feitas = completo ? total : this.feitas
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((feitas / total) * 100),
            score: Math.max(0, this.score),
            stage: this.nivel.nivel,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlataforma() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.nivel.nivel) {
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
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
