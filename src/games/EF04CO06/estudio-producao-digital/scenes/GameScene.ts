import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES } from '../data/levels'
import { NOME } from '../data/formatos'
import { C } from '../data/theme'
import {
    HUD, PASSOS, PEDIDO, OPCOES, OBRA, PUBLICAR as PUB,
} from '../data/layout'
import type { Caso, CaseState, Formato, Level, Veredito as VereditoData } from '../types'

import {
    createRoom, createHud, createTrilha, createTitulo, createCartaoPedido,
    createLembrete, createOpcoes, createObraMontada, createCarimbos,
    createVeredito, createCards, createBigButton, showToast, ACCENT,
    type BigButton, type Cards, type CartaoPedido, type Carimbos, type Hud,
    type Lembrete, type ObraMontada, type Opcoes, type Titulo, type Trilha,
    type Veredito,
} from './effects'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'estudio-producao-digital'

const POINTS = {
    /** Os jurados aprovaram. */
    publica: 25,
    /** Bônus por ter feito também os passos opcionais. */
    caprichou: 10,
    /** Publicou e voltou para arrumar. */
    revisao: -5,
    /** Escolheu a mídia errada no Nível 3. */
    midia: -5,
} as const

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private caseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private state: CaseState = 'pedido'
    private locked = false
    private ended = false

    /** Todo callback atrasado captura este valor e desiste se ele mudou. */
    private gen = 0

    /* ── o trabalho em andamento ───────────────────────────────────── */

    /** Uma escolha por passo; −1 é passo ainda não feito ou pulado. */
    private escolhas: number[] = []
    /** Em qual espaço a criança está agora. */
    private passo = 0
    /**
     * Voltou por ordem dos jurados.
     *
     * Sem isto, arrumar o passo 1 obrigaria a criança a reconfirmar o 2, o 3 e
     * o 4 — que já estavam certos. Com ele, consertar uma coisa volta direto
     * para a publicação.
     */
    private revisando = false
    /** Os passos que o template já resolveu — a criança pula direto por eles. */
    private prontos = new Set<number>()

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private trilha!: Trilha
    private titulo!: Titulo
    private lembrete!: Lembrete
    private veredito!: Veredito
    private carimbos!: Carimbos

    /* ── o que nasce e morre a cada tela ───────────────────────────── */

    private cartao?: CartaoPedido
    private opcoes?: Opcoes
    private obra?: ObraMontada
    private cards?: Cards
    private botao?: BigButton

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    /**
     * `level` é 1-based e `phase` é 0-based. Os dois são grampeados ao que
     * existe de verdade: um `phase: 7` num nível de três casos faria
     * `this.caso` devolver `undefined`, e o estouro apareceria três telas
     * adiante sem nenhuma pista de que veio daqui.
     */
    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.caseIdx = Phaser.Math.Clamp(
            data?.phase ?? 0, 0, LEVELS[this.levelIdx].cases.length - 1,
        )
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.isMuted = false
        this.state = 'pedido'
        this.locked = false
        this.ended = false
        this.gen = 0
        this.escolhas = []
        this.passo = 0
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createRoom(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)
        this.hud.setHint(this.level.tip)

        this.trilha = createTrilha(this)
        this.titulo = createTitulo(this)
        this.lembrete = createLembrete(this)
        this.veredito = createVeredito(this)
        this.carimbos = createCarimbos(this)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de um trabalho qualquer.
        void this.playCase(this.caseIdx === 0)

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    private shutdownScene() {
        this.gen += 1
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        this.input.setDefaultCursor('default')
    }

    /* ═══════════════════════════════════════════════ atalhos de estado */

    private get level(): Level { return LEVELS[this.levelIdx] }
    private get caso(): Caso { return this.level.cases[this.caseIdx] }
    private get tom(): number { return ACCENT[this.caso.formato] }

    /**
     * Quantas bolinhas a trilha tem, e em qual delas a criança está.
     *
     * Uma pergunta, uma resposta, um lugar. A trilha, o título do passo e a
     * decisão de "acabou?" leem todos daqui — se cada um contasse por conta
     * própria, bastaria um deles somar errado para a trilha mentir.
     *
     *   [pedido] (+ [mídia], no Nível 3) + um por espaço + [publicar]
     */
    private get extras(): number { return this.level.escolhe ? 2 : 1 }
    private get totalPassos(): number { return this.extras + this.caso.slots.length + 1 }
    private get passoNaTrilha(): number {
        if (this.state === 'pedido') return 0
        if (this.state === 'midia') return 1
        if (this.state === 'publicando' || this.state === 'jurados') {
            return this.totalPassos - 1
        }
        return this.extras + this.passo
    }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearPalco() {
        this.cartao?.destroy(); this.cartao = undefined
        this.opcoes?.destroy(); this.opcoes = undefined
        this.obra?.destroy(); this.obra = undefined
        this.cards?.destroy(); this.cards = undefined
        this.botao?.destroy(); this.botao = undefined
    }

    private async playCase(withTutorial: boolean) {
        const gen = ++this.gen
        const caso = this.caso

        /*
         * `locked` é estado de MOMENTO, não de caso. Sem zerar aqui, o trabalho
         * que termina bem deixa a trava ligada e o seguinte monta a tela
         * inteira sem aceitar um toque.
         */
        this.locked = false
        this.clearPalco()
        this.veredito.setVisible(false)
        this.carimbos.container.removeAll(true)

        this.escolhas = caso.slots.map(() => -1)
        this.passo = 0
        this.revisando = false
        this.state = 'pedido'

        /*
         * O template do Nível 1.
         *
         * Ele preenche um passo antes de a criança começar, e esse passo já
         * nasce VERDE na trilha. É o "template pronto" do briefing virando algo
         * que se vê: o trabalho não parte do zero, parte de um exemplo — e ela
         * encontra o exemplo montado quando chegar na publicação.
         */
        this.prontos = new Set((caso.pronto ?? []).map(p => p.slot))
        caso.pronto?.forEach(({ slot, opcao }) => { this.escolhas[slot] = opcao })

        this.hud.setHint(this.level.tip)
        this.hud.setMidia(this.level.escolhe ? null : caso.formato)
        this.trilha.setTom(this.level.escolhe ? C.edge : this.tom)
        this.trilha.setTotal(this.totalPassos)
        this.trilha.setAtual(0)
        this.lembrete.set(caso.briefing, caso.publico)
        this.lembrete.setVisible(false)
        this.emitCheckpoint()

        /*
         * O PALCO ENTRA ANTES DO TUTORIAL.
         *
         * O tutorial recorta a tela e aponta o balão para o recorte. Rodando
         * primeiro, ele recortaria tela vazia e falaria de coisas que ainda não
         * existem.
         */
        this.abrirPedido()
        if (withTutorial) this.locked = true

        await this.cartao?.show(caso.briefing, caso.publico)
        if (gen !== this.gen) return

        if (!withTutorial) return

        const steps = this.buildTutorialSteps()
        if (!steps.length) { this.locked = false; return }

        this.runTutorial(steps, false, () => { })
    }

    private abrirPedido() {
        this.state = 'pedido'
        this.titulo.show('O PEDIDO', C.paper)
        this.cartao = createCartaoPedido(this)
        this.botao = createBigButton(this, {
            x: PEDIDO.cx, y: PEDIDO.botaoY, w: PEDIDO.botaoW, h: PEDIDO.botaoH,
            label: 'COMEÇAR', tone: C.ok,
            onClick: () => this.doPedidoPronto(),
        })
    }

    private doPedidoPronto() {
        if (this.state !== 'pedido' || this.locked || this.ended) return
        this.playPick()
        this.clearPalco()
        if (this.level.escolhe) this.abrirMidias()
        else this.abrirPasso(0)
    }

    /* ═════════════════════════════════════════════════ passo: a mídia */

    private abrirMidias() {
        this.state = 'midia'
        this.trilha.setAtual(this.passoNaTrilha)
        this.titulo.show('QUAL MÍDIA SERVE PARA ESTE PEDIDO?', C.paper)
        this.lembrete.setVisible(true)
        this.cards = createCards(this, { onPick: f => void this.onPickMidia(f) })
    }

    private async onPickMidia(escolhida: Formato) {
        if (this.state !== 'midia' || this.locked || this.ended) return

        const gen = this.gen
        const caso = this.caso

        if (escolhida !== caso.formato) {
            this.locked = true
            this.cards?.setEnabled(false)
            this.errors += 1
            this.points += POINTS.midia
            this.playError()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.midia, stage: this.level.level,
            })
                this.lives.lose(); this.livesLeft = this.lives.remaining
            this.emitCheckpoint()

            await this.cards?.reject(escolhida)
            if (gen !== this.gen) return

            showToast(this, caso.porque?.[escolhida] ?? 'Essa mídia não serve para este pedido.',
                C.warn, 3400)

            await FX.wait(this, 400)
            if (gen !== this.gen) return

            this.locked = false
            this.cards?.setEnabled(true)
            return
        }

        this.locked = true
        this.cards?.setEnabled(false)
        this.playPick()

        this.hud.setMidia(caso.formato)
        this.trilha.setTom(this.tom)

        const cards = this.cards
        if (cards) {
            FX.kill(this, cards.container)
            await FX.to(this, cards.container, { alpha: 0, y: -50 }, { duration: 280 })
        }
        if (gen !== this.gen) return

        this.locked = false
        this.clearPalco()
        this.abrirPasso(0)
    }

    /* ═══════════════════════════════════════════ passo: uma escolha */

    private abrirPasso(inicio: number) {
        const caso = this.caso

        // pula o que o template já resolveu; na revisão, ninguém pula nada
        let i = inicio
        if (!this.revisando) {
            while (i < caso.slots.length && this.prontos.has(i)) i += 1
        }
        if (i >= caso.slots.length) { void this.abrirPublicacao(); return }

        this.passo = i
        this.state = 'passo'
        this.clearPalco()

        const slot = caso.slots[i]
        this.trilha.setAtual(
            this.passoNaTrilha,
            this.revisando ? this.totalPassos - 1 : this.passoNaTrilha,
        )
        this.titulo.show(`ESCOLHA ${this.artigo(slot.papel)}`, this.tom)
        this.lembrete.setVisible(true)

        this.opcoes = createOpcoes(this, {
            slot, tone: this.tom, escolhida: this.escolhas[i],
            onPick: j => this.onPickOpcao(j),
        })

        /*
         * O passo opcional ganha um botão de PULAR, e é ele que dá sentido ao
         * carimbo CAPRICHO: sem uma saída visível, "opcional" seria só uma
         * palavra escrita, e a criança nunca escolheria de verdade.
         */
        if (!slot.opcional) return
        this.botao = createBigButton(this, {
            x: 640, y: OPCOES.pularY, w: OPCOES.pularW, h: OPCOES.pularH,
            label: 'PULAR', tone: C.edge, breathe: false,
            onClick: () => this.onPular(),
        })
    }

    /** "ESCOLHA O TÍTULO" / "ESCOLHA A IMAGEM" — sem artigo errado na tela. */
    private artigo(papel: string): string {
        const femininos = ['IMAGEM', 'CENA', 'CAPA', 'NARRAÇÃO', 'FRASE', 'TRILHA', 'LEGENDA']
        return `${femininos.includes(papel) ? 'A' : 'O'} ${papel}`
    }

    private onPickOpcao(j: number) {
        if (this.state !== 'passo' || this.locked || this.ended) return
        this.escolhas[this.passo] = j
        this.playPlace()
        this.seguir()
    }

    private onPular() {
        if (this.state !== 'passo' || this.locked || this.ended) return
        if (!this.caso.slots[this.passo]?.opcional) return
        this.escolhas[this.passo] = -1
        this.playPick()
        this.seguir()
    }

    /** Na produção normal vai para o próximo passo; na revisão, direto publicar. */
    private seguir() {
        if (this.revisando) {
            this.revisando = false
            void this.abrirPublicacao()
            return
        }
        this.abrirPasso(this.passo + 1)
    }

    /* ═══════════════════════════════════════════ passo: a publicação */

    private async abrirPublicacao() {
        const gen = this.gen
        this.state = 'publicando'
        this.locked = true
        this.clearPalco()

        this.trilha.setAtual(this.passoNaTrilha)
        this.titulo.show(`SEU TRABALHO · ${NOME[this.caso.formato]}`, this.tom)
        this.lembrete.setVisible(true)

        this.obra = createObraMontada(this, {
            formato: this.caso.formato,
            slots: this.caso.slots,
            escolhas: this.escolhas,
        })

        // as peças escolhidas uma a uma se juntam aqui pela primeira vez
        await this.obra.montar()
        if (gen !== this.gen) return

        this.botao = createBigButton(this, {
            x: PUB.cx, y: PUB.cy, w: PUB.w, h: PUB.h,
            label: 'PUBLICAR', tone: C.ok,
            onClick: () => void this.onPublicar(),
        })
        this.locked = false
    }

    /* ═══════════════════════════════════════════════════ os jurados */

    /**
     * O veredito.
     *
     * Os três carimbos são os três critérios do briefing da habilidade, ditos
     * em palavra de criança:
     *
     *   CLARO     → as escolhas de TEXTO dizem o que precisavam dizer
     *   COMBINA   → as escolhas de IMAGEM têm a ver com o assunto
     *   CAPRICHO  → os passos opcionais foram feitos
     *
     * Aprovar depende de CLARO e COMBINA. CAPRICHO não barra: vira bônus,
     * porque passo opcional é escolha e não obrigação — e uma criança que
     * entregou um trabalho correto merece ouvir o que faltou sem ser
     * reprovada por isso.
     */
    private julgar(): VereditoData {
        const caso = this.caso
        let clareza = true
        let adequacao = true
        let recursos = true

        /*
         * Os jurados apontam UM passo — mandar rever quatro coisas de uma vez é
         * o mesmo que não apontar nada. E o obrigatório vem SEMPRE antes do
         * opcional: apontar o enfeite enquanto o título está ilegível mandaria
         * a criança arrumar a coisa errada.
         */
        let revisar = -1
        let critica = ''
        let extraSlot = -1
        let extraCritica = ''

        caso.slots.forEach((slot, i) => {
            const escolha = this.escolhas[i]

            if (escolha < 0) {
                if (slot.opcional) recursos = false
                return
            }

            const opcao = slot.opcoes[escolha]
            if (opcao.bom) return

            if (slot.opcional) {
                recursos = false
                if (extraSlot < 0) { extraSlot = i; extraCritica = opcao.critica ?? '' }
                return
            }

            if (slot.tipo === 'imagem') adequacao = false
            else clareza = false

            if (revisar < 0) { revisar = i; critica = opcao.critica ?? '' }
        })

        if (revisar < 0 && extraSlot >= 0) { revisar = extraSlot; critica = extraCritica }

        const aprovado = clareza && adequacao
        const linha = aprovado
            ? recursos
                ? caso.successLine
                : `${caso.successLine}  ·  ${extraCritica || 'Dava para caprichar no passo opcional.'}`
            : critica

        return { clareza, recursos, adequacao, aprovado, revisar: aprovado ? -1 : revisar, linha }
    }

    private async onPublicar() {
        if (this.state !== 'publicando' || this.locked || this.ended) return

        const gen = this.gen
        this.state = 'jurados'
        this.locked = true
        this.botao?.destroy()
        this.botao = undefined
        this.lembrete.setVisible(false)
        this.titulo.show('OS JURADOS', C.paper)

        // o clarão da publicação: a foto sendo batida
        this.playObturador()
        await this.obra?.flash()
        if (gen !== this.gen) return

        const v = this.julgar()

        await this.carimbos.bater([
            { nome: 'CLARO', verde: v.clareza },
            { nome: 'COMBINA', verde: v.adequacao },
            { nome: 'CAPRICHO', verde: v.recursos },
        ], () => {
            this.obra?.bater()
            this.playCarimbo()
        })
        if (gen !== this.gen) return

        this.veredito.show(v.linha, v.aprovado ? C.okSoft : C.warnSoft)

        if (!v.aprovado) {
            this.playError()
            await FX.wait(this, 3400)
            if (gen !== this.gen) return

            this.errors += 1
            this.points += POINTS.revisao
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.revisao, stage: this.level.level,
            })
                this.lives.lose(); this.livesLeft = this.lives.remaining
            this.emitCheckpoint()

            // a trilha ANDA PARA TRÁS: a criança vê para onde está voltando
            this.veredito.setVisible(false)
            this.carimbos.container.removeAll(true)
            this.locked = false
            this.revisando = true
            this.abrirPasso(Math.max(0, v.revisar))
            return
        }

        this.playAprovado()
        void FX.sparks(this, OBRA.cx, OBRA.cy, { color: C.ok, count: 30, spread: 320 })
        void FX.flash(this, C.white, { duration: 280, peak: 0.2 })

        this.hits += 1
        this.points += POINTS.publica + (v.recursos ? POINTS.caprichou : 0)
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.publica + (v.recursos ? POINTS.caprichou : 0),
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.state = 'solved'
        await FX.wait(this, 3000)
        if (gen !== this.gen) return

        this.caseIdx += 1
        if (this.caseIdx >= this.level.cases.length) {
            void this.endLevel()
            return
        }
        void this.playCase(false)
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.gen += 1
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            showLevelComplete(this, {
                title: 'Publicado!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: ACCENT[this.level.cases[0].formato],
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Abrindo a próxima oficina...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.texto, C.apresentacao, C.video, C.ok] })
        showLevelComplete(this, {
            title: 'Portfólio completo!',
            subtitle: 'Cartaz, apresentação e vídeo: cada pedido com a mídia que dá conta dele',
            message: `Trabalhos: ${this.hits}  ·  Revisões: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.ok,
            panelColor: C.paper,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesLeft, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.apresentacao,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`, e nunca abaixo de 540: o botão "Próximo"
     * nasce 46px ABAIXO do balão, e mais do que isso o joga para fora da tela.
     *
     * E nenhuma palavra em inglês. "Briefing" e "banca" saíram: viraram
     * O PEDIDO e OS JURADOS, que é o que uma criança de nove anos entende sem
     * ninguém traduzir.
     */
    private buildTutorialSteps(): TutorialStep[] {
        /*
         * ── DUAS REGRAS, E AS DUAS VIERAM DE BUG ─────────────────────────
         *
         * 1. O tutorial roda na tela do PEDIDO. Então ele só pode apontar para
         *    o que existe nessa tela: a trilha, o cartão e o botão COMEÇAR.
         *    Antes ele recortava a barra do pedido e as cartas de mídia — que
         *    só nascem depois do COMEÇAR — e a criança via um buraco iluminado
         *    em cima de nada.
         *
         * 2. O balão NUNCA pode cair sobre o próprio recorte. Ele tem uns
         *    120px, mais 46 de folga e mais o botão "Próximo": some 200px de
         *    altura que precisam caber longe do que está sendo apontado. Por
         *    isso o passo do cartão — que ocupa 300px no meio da tela — não
         *    tem recorte nenhum: não existe lugar para o balão que não seja em
         *    cima dele.
         */
        const larguraTrilha =
            Math.min(PASSOS.gap, PASSOS.maxW / Math.max(1, this.totalPassos - 1))
            * (this.totalPassos - 1) + PASSOS.rNow * 2 + 44

        const trilhaSpot = {
            x: 640, y: PASSOS.cy,
            w: larguraTrilha, h: 68,
        }
        const comecarSpot = {
            x: PEDIDO.cx, y: PEDIDO.botaoY,
            w: PEDIDO.botaoW + 40, h: PEDIDO.botaoH + 30,
        }

        if (this.level.level === 2) {
            return [{
                text: 'Alguns passos vêm com o botão PULAR. Dá para entregar sem eles — mas os jurados percebem quando você caprichou.',
                shape: 'rect', ...trilhaSpot, balloonX: 640, balloonY: 400,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Agora quem escolhe a mídia é você. Toque em COMEÇAR e três cartas vão aparecer: cartaz, slides ou vídeo. Olhe quem vai ver, e onde.',
                shape: 'rect', ...comecarSpot, balloonX: 640, balloonY: 320,
            }]
        }

        return [
            {
                text: 'Todo trabalho começa com um pedido: o que a escola quer, e para quem. Leia com calma — todas as suas escolhas saem daqui.',
                shape: 'none', balloonX: 640, balloonY: 330,
            },
            {
                text: 'Estas bolinhas são os passos do trabalho. Você faz um de cada vez, e a bolinha fica verde quando termina.',
                shape: 'rect', ...trilhaSpot, balloonX: 640, balloonY: 400,
            },
            {
                text: 'Em cada passo aparecem opções, e o pedido continua numa faixa embaixo para você conferir. Toque em COMEÇAR.',
                shape: 'rect', ...comecarSpot, balloonX: 640, balloonY: 320,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef04co06-l${this.level.level}`,
            once: !force,
            accent: this.tom,
            safeTop: HUD.y + HUD.h + 12,
            steps,
            onFinish: () => {
                this.locked = false
                this.hud.setHelpEnabled(true)
                onFinish()
            },
        })
    }

    private replayTutorial = () => {
        if (this.ended || this.locked) return
        if (this.state === 'jurados' || this.state === 'solved') return

        const steps = this.buildTutorialSteps()
        if (!steps.length) return
        this.runTutorial(steps, true, () => { })
    }

    /* ═══════════════════════════════════════════════════════ plataforma */

    private emitCheckpoint(forceComplete = false) {
        const before = LEVELS.slice(0, this.levelIdx).reduce((s, l) => s + l.cases.length, 0)
        const done = before + this.caseIdx + (forceComplete ? 1 : 0)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_CASES) * 100),
            score: Math.max(0, this.points),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            this.points = cmd.points ?? this.points
        })
    }

    private onMuteAudio = (muted: boolean) => { this.isMuted = muted }

    /* ═══════════════════════════════════════════════════════════ áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.1) {
        const ctx = this.getAudioCtx()
        if (!ctx) return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.connect(g)
        g.connect(ctx.destination)
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        osc.start()
        osc.stop(ctx.currentTime + dur)
    }

    private playPick() { this.playTone(660, 0.05, 'sine', 0.05) }
    private playPlace() { this.playTone(520, 0.08, 'triangle', 0.06) }
    private playObturador() { this.playTone(1400, 0.05, 'square', 0.04) }
    /** O baque do carimbo: grave e curto, como madeira na mesa. */
    private playCarimbo() { this.playTone(120, 0.13, 'square', 0.09) }
    private playError() { this.playTone(200, 0.2, 'square', 0.07) }
    private playAprovado() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
