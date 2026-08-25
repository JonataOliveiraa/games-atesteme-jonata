import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'
import { formatTime } from '../../../../shared/hud/createTimeBar'

import { NIVEIS, TOTAL_FASES, tempoDaFase } from '../data/casos'
import {
    DISPOSITIVOS, PROGRAMAS, avaliarPedido, blocosLivres, criarMaquina,
    fecharPrograma, abrirPrograma, inicioDe, ocupar, porQueNao,
    tickMaquina, usandoQual, type MaquinaEstado,
} from '../data/maquina'
import { C, TINTA } from '../data/theme'
import { HUD, ESTAB, MEM, FILA, RODAPE, PECAS } from '../data/layout'
import type {
    DispositivoId, EstadoCena, FaseDef, NivelDef, PedidoDef, ProgramaId,
} from '../types'
import {
    createCenario, createChapa, createHud, createEstabilidade, createHardware,
    createMemoria, createFicha, createMensagem, createBigButton, createPausa,
    type Estabilidade, type Ficha, type Hardware, type Hud, type Memoria,
    type Mensagem, type BigButton, type Pausa, type PecaVista,
} from './effects'

const GAME_ID = 'sistema-operacional'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A CENA É UM RELÓGIO, NÃO UM QUESTIONÁRIO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A versão anterior era um laço de perguntas: mostrava um pedido, esperava um
 * toque, comparava com o campo `answer`, mostrava o próximo. Nada acontecia
 * entre um toque e outro — e é justamente ENTRE os toques que mora tudo o que a
 * habilidade pede: a impressora terminando, a paciência de quem espera
 * escorrendo, o terceiro pedido chegando enquanto o segundo ainda não foi
 * resolvido.
 *
 * Por isso o coração desta cena é o `update`, e não um `async` de perguntas. Ele
 * faz quatro coisas, sempre nesta ordem:
 *
 *   1. o relógio da fase anda, e pedidos ENTRAM quando chega a hora deles
 *   2. a paciência de cada ficha na fila escorre — e quem zera, desiste
 *   3. os dispositivos contam o tempo de uso, e quem termina VAGA
 *   4. quem vagou serve o primeiro da fila daquela peça, sozinho
 *
 * O passo 4 é o que faz "esperar" ser uma resposta e não um castigo. A criança
 * encaixa um pedido numa peça ocupada, a peça se vira, e o pedido é atendido
 * sem ela precisar voltar lá. Isso É um sistema operacional.
 */

const PONTOS = {
    atendido: 20,
    /** Negar certo vale mais: exige perceber que NÃO tem jeito. */
    negado: 25,
    erro: -5,
    desistiu: -8,
}

/**
 * A ESTABILIDADE, em pontos.
 *
 * Perder é mais rápido que ganhar, de propósito — senão dava para errar à
 * vontade e repor errando menos. Mas a recuperação existe: uma fase não fica
 * perdida por causa de dois erros no começo, o que importa é o saldo do turno.
 */
const ESTABILIDADE = {
    ganhoAtender: 6,
    ganhoNegar: 8,
    /** Toque no lugar errado: leu o pedido com pressa. */
    perdaLeve: 7,
    /** Negou o que dava para atender: decisão errada, não distração. */
    perdaGrave: 14,
    /** Deixou alguém desistir: o pior, porque ninguém foi atendido. */
    perdaDesistiu: 16,
}

/** Um pedido que está na fila da mesa, agora. */
interface Ticket {
    def: PedidoDef
    ficha: Ficha
    restaMs: number
    /** Em que peça ele está esperando vaga, se estiver. */
    esperandoEm?: DispositivoId
}

export class GameScene extends Phaser.Scene {

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private faseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private ended = false
    private estado: EstadoCena = 'rodando'

    /** Todo callback atrasado captura este valor e desiste se ele mudou. */
    private gen = 0

    /* ── a fase em andamento ───────────────────────────────────────── */

    private maquina!: MaquinaEstado
    /** Quanto tempo DE JOGO já passou nesta fase. */
    private relogioFase = 0
    private porChegar: PedidoDef[] = []
    private fila: Ticket[] = []
    private selecionado: string | null = null
    private estabilidade = 100
    private resolvidos = 0
    private atendidos = 0
    private tempoTotal = 0
    private relogioLigado = false

    /* ── interface ─────────────────────────────────────────────────── */

    private hud!: Hud
    private estab!: Estabilidade
    private mensagem!: Mensagem
    private pausa!: Pausa
    private btPausa!: BigButton
    private btNegar!: BigButton

    /** Estes dois nascem e morrem a cada fase: a fase troca o hardware. */
    private hardware?: Hardware
    private memoria?: Memoria

    private telaPerdeu?: LevelCompleteHandle
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    /**
     * `level` é 1-based e `phase` é 0-based, como nos outros jogos do conjunto.
     * Os dois são grampeados ao que existe: um `phase: 7` numa etapa de três
     * fases faria `this.fase` devolver `undefined`, e o estouro apareceria três
     * telas adiante sem pista nenhuma de que veio daqui.
     */
    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, NIVEIS.length) - 1
        this.faseIdx = Phaser.Math.Clamp(
            data?.phase ?? 0, 0, NIVEIS[this.levelIdx].fases.length - 1,
        )
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.isMuted = false
        this.ended = false
        this.estado = 'rodando'
        this.gen = 0
        this.relogioFase = 0
        this.porChegar = []
        this.fila = []
        this.selecionado = null
        this.estabilidade = 100
        this.resolvidos = 0
        this.atendidos = 0
        this.tempoTotal = 0
        this.relogioLigado = false
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        // o Nível 3 troca de sala: a mesa vira o corredor dos servidores
        createCenario(this, this.nivel.nivel >= 3 ? 'bg-sistemas' : 'bg-central')
        createChapa(this)

        this.hud = createHud(this, {
            onHelp: () => this.replayTutorial(),
            onDanger: () => this.playTempoCurto(),
            onEmpty: () => this.perderPorTempo(),
        })
        this.hud.setLevel(this.nivel.nivel)
        this.hud.tempo.setRunning(false)

        this.estab = createEstabilidade(this)
        this.mensagem = createMensagem(this)
        this.pausa = createPausa(this, () => this.despausar())

        this.btPausa = createBigButton(this, {
            x: RODAPE.pausaX, y: RODAPE.cy,
            w: RODAPE.pausaW, h: RODAPE.pausaH,
            label: 'PAUSA', tone: C.edge,
            onClick: () => this.alternarPausa(),
        })

        /*
         * NEGAR é vermelho, e isso não é enfeite.
         *
         * Vermelho, nesta tela, quer dizer "não vai dar" — é a cor do aro da
         * peça desligada e do último pedaço da estabilidade. O botão que
         * responde "não vai dar" tem que ser da mesma cor da coisa que ele
         * responde, senão a criança precisa aprender duas linguagens.
         */
        this.btNegar = createBigButton(this, {
            x: RODAPE.negarX, y: RODAPE.cy,
            w: RODAPE.negarW, h: RODAPE.negarH,
            label: 'NEGAR', tone: C.parado,
            onClick: () => this.onNegar(),
        })

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // o tutorial é a abertura do NÍVEL, não de uma fase qualquer
        this.montarFase(this.faseIdx === 0)
    }

    /* ═══════════════════════════════════════════════════ o relógio */

    /**
     * O CORAÇÃO DA CENA.
     *
     * Repare que não há nenhuma checagem de "qual é a resposta certa" aqui: o
     * `update` só faz o mundo andar. Quem decide o que é certo é
     * `avaliarPedido`, chamado no instante do toque — e é por isso que o mundo
     * pode andar sozinho sem nunca discordar do gabarito: não há gabarito.
     */
    update(_time: number, delta: number) {
        if (!this.hud) return

        const deveContar = this.estado === 'rodando' && !this.ended
        if (deveContar !== this.relogioLigado) {
            this.relogioLigado = deveContar
            this.hud.tempo.setRunning(deveContar)
        }
        this.hud.tempo.tick(delta)

        if (!deveContar) return

        this.relogioFase += delta
        this.receberChegadas()
        this.escorrerPaciencia(delta)

        const vagaram = tickMaquina(this.maquina, delta)
        vagaram.forEach(id => this.servirEspera(id))

        this.syncHardware()
    }

    /** Quem chegou a hora de entrar, e tem vaga na bandeja. */
    private receberChegadas() {
        while (
            this.porChegar.length > 0 &&
            this.porChegar[0].entraMs <= this.relogioFase &&
            this.fila.length < FILA.max
        ) {
            this.entrar(this.porChegar.shift() as PedidoDef)
        }
    }

    private escorrerPaciencia(delta: number) {
        // cópia: `desistiu` mexe em `this.fila` no meio do laço
        for (const t of [...this.fila]) {
            /*
             * E a saída no meio do laço não é paranoia: a primeira desistência
             * pode zerar a estabilidade, e aí o turno acabou. Sem esta linha, os
             * outros dois pedidos da bandeja desistiriam em seguida, no mesmo
             * frame, jogando três mensagens de derrota em cima de uma tela que
             * já está mostrando a tela de fim.
             */
            if (this.estado !== 'rodando') return
            t.restaMs -= delta
            t.ficha.setPaciencia(t.restaMs / t.def.pacienciaMs)
            if (t.restaMs <= 0) void this.desistiu(t)
        }
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

    private get nivel(): NivelDef { return NIVEIS[this.levelIdx] }
    private get fase(): FaseDef { return this.nivel.fases[this.faseIdx] }

    private get totalPedidos(): number { return this.fase.pedidos.length }

    private podeAgir(): boolean {
        return this.estado === 'rodando' && !this.ended
    }

    private ticketSelecionado(): Ticket | null {
        return this.fila.find(t => t.def.id === this.selecionado) ?? null
    }

    /** Quem está na fila de espera de uma peça, na ordem em que pediu. */
    private esperandoPor(id: DispositivoId): Ticket[] {
        return this.fila.filter(t => t.esperandoEm === id)
    }

    /* ═══════════════════════════════════════════════════ montar a fase */

    private montarFase(comTutorial: boolean) {
        /*
         * Sobe a geração ANTES de tocar em qualquer coisa: é o que mata o
         * `delayedCall` da fase anterior, o `await` do `encerrar` e o botão da
         * tela de derrota, todos capazes de mexer numa mesa que já não existe.
         */
        this.gen += 1

        this.hardware?.destroy(); this.hardware = undefined
        this.memoria?.destroy(); this.memoria = undefined
        this.telaPerdeu?.destroy(); this.telaPerdeu = undefined
        this.fila.forEach(t => t.ficha.destroy())
        this.fila = []

        const fase = this.fase
        this.maquina = criarMaquina(fase)
        this.relogioFase = 0
        this.resolvidos = 0
        this.atendidos = 0
        this.selecionado = null
        this.estabilidade = this.nivel.estabilidade
        this.estado = 'rodando'

        this.porChegar = [...fase.pedidos].sort((a, b) => a.entraMs - b.entraMs)

        this.hud.setInstr(fase.objetivo)
        this.hud.setProgress(this.faseIdx, this.nivel.fases.length)
        this.hud.tempo.reset(tempoDaFase(fase))
        this.hud.tempo.setRunning(false)
        this.relogioLigado = false
        this.estab.set(this.estabilidade, false)

        this.hardware = createHardware(this, {
            pecas: fase.hardware.map(h => h.id),
            compacto: fase.blocos > 0,
            onPeca: id => this.onPeca(id),
        })

        if (fase.blocos > 0) {
            this.memoria = createMemoria(this, {
                blocos: fase.blocos,
                onBloco: (i, prog) => this.onBloco(i, prog),
            })
            this.syncMemoria()
        }

        this.syncHardware()
        this.mensagem.dizer(fase.dica, TINTA.fala, 'neutro')
        this.emitCheckpoint()

        if (!comTutorial) return

        const steps = this.buildTutorialSteps()
        if (steps.length) this.runTutorial(steps, false)
    }

    /* ═══════════════════════════════════════════════════ desenhar estado */

    private syncHardware() {
        if (!this.hardware) return
        const vistas: PecaVista[] = this.fase.hardware.map(h => {
            const d = this.maquina.dispositivos.get(h.id)
            return {
                id: h.id,
                ligado: d?.ligado !== false,
                usadoPor: d?.usadoPor,
                frac: d && d.duracaoMs > 0 ? d.restaMs / d.duracaoMs : 0,
                esperando: this.esperandoPor(h.id).map(t => t.def.programa),
            }
        })
        this.hardware.sync(vistas)
    }

    private syncMemoria() {
        if (!this.memoria) return
        this.memoria.sync({
            blocos: this.maquina.blocos,
            abertos: this.maquina.abertos.map(id => ({
                id,
                inicio: inicioDe(this.maquina, id),
                tam: PROGRAMAS[id].blocos,
            })),
        })
    }

    /* ═══════════════════════════════════════════════════ a fila */

    private entrar(def: PedidoDef) {
        const t: Ticket = {
            def,
            ficha: createFicha(this, {
                pedido: def,
                slot: this.fila.length,
                onTap: () => this.selecionar(def.id),
            }),
            restaMs: def.pacienciaMs,
        }
        this.fila.push(t)
        this.playChegou()

        // a bandeja nunca fica com um pedido sem ninguém escolhido: no Nível 1,
        // onde só há um por vez, isso transforma dois toques em um
        if (!this.selecionado) this.selecionar(def.id)
    }

    private selecionar(id: string | null) {
        if (!this.podeAgir()) return
        this.selecionado = id
        this.fila.forEach(t => t.ficha.setSelecionada(t.def.id === id))
        if (id) this.playSelecionar()
    }

    private reordenar() {
        this.fila.forEach((t, i) => t.ficha.setSlot(i, true))
        if (!this.ticketSelecionado()) {
            this.selecionado = null
            if (this.fila.length) this.selecionar(this.fila[0].def.id)
        }
    }

    /**
     * Tira uma ficha da bandeja e vê se a fase acabou.
     *
     * `ok` só decide a animação de saída (sobe e brilha, ou afunda). Pontos e
     * estabilidade são de quem chamou: quem sabe o que aconteceu é o handler,
     * não este método.
     */
    private async encerrar(t: Ticket, ok: boolean) {
        const gen = this.gen
        const i = this.fila.indexOf(t)
        if (i < 0) return
        this.fila.splice(i, 1)
        this.resolvidos += 1
        void t.ficha.sair(ok)
        this.reordenar()
        this.receberChegadas()
        this.emitCheckpoint()

        if (this.resolvidos >= this.totalPedidos) {
            await FX.wait(this, 700)
            if (gen !== this.gen) return
            this.terminarFase()
        }
    }

    /* ═══════════════════════════════════════════════════ ações */

    /**
     * TOQUE NUMA PEÇA DE HARDWARE.
     *
     * O mesmo gesto faz três coisas diferentes, e é o ESTADO da peça que decide
     * qual — nunca um botão separado:
     *
     *   peça livre    → entrega agora
     *   peça ocupada  → entra na fila dela, e é servido sozinho quando vagar
     *   peça desligada→ recusa, e explica que este é caso de NEGAR
     *
     * Um toque só, com significados diferentes conforme o que está desenhado no
     * aro. É o contrário do jogo antigo, em que o toque tinha um significado só
     * ("esta é minha resposta") e o estado da máquina não existia.
     */
    private onPeca(id: DispositivoId) {
        if (!this.podeAgir()) return

        const t = this.ticketSelecionado()
        if (!t) {
            this.mensagem.dizer('Toque num pedido primeiro.', TINTA.atencao)
            return
        }
        if (t.esperandoEm) {
            this.mensagem.dizer('Este já está na fila. Deixe ele esperar.', TINTA.atencao)
            return
        }

        const quer = t.def.quer
        const nomePrograma = PROGRAMAS[t.def.programa].nome

        if (quer.o !== 'usar') {
            this.errar(
                `${nomePrograma} quer MEMÓRIA, não uma peça.`,
                ESTABILIDADE.perdaLeve,
            )
            this.memoria?.pulsar(C.ciano)
            return
        }

        if (quer.dispositivo !== id) {
            this.errar(
                `${nomePrograma} pediu o ${DISPOSITIVOS[quer.dispositivo].nome}.`,
                ESTABILIDADE.perdaLeve,
            )
            this.hardware?.pulsar(id, C.parado)
            return
        }

        const d = this.maquina.dispositivos.get(id)
        if (!d || !d.ligado) {
            this.errar(porQueNao(t.def, this.maquina), ESTABILIDADE.perdaLeve)
            this.hardware?.pulsar(id, C.parado)
            return
        }

        if (d.usadoPor) {
            /*
             * A FILA DE ESPERA — e ela NÃO é um erro.
             *
             * Este é o momento em que o jogo deixa de ser múltipla escolha. A
             * peça existe, está boa e está ocupada: a resposta certa não é
             * "sim" nem "não", é "agora não, mas guarde a vez". A criança
             * encaixa, vê o disquinho do programa aparecer no canto do soquete,
             * e o atendimento acontece sozinho quando a peça vagar.
             */
            t.esperandoEm = id
            t.ficha.setEspera(DISPOSITIVOS[id].nome)
            this.hardware?.pulsar(id, C.ocupado)
            this.syncHardware()
            this.mensagem.dizer(
                `Na fila do ${DISPOSITIVOS[id].nome}. Ele entra quando vagar.`,
                TINTA.atencao, 'neutro',
            )
            this.playEsperar()
            return
        }

        this.atender(t, id)
    }

    /** Entrega a peça, agora. */
    private atender(t: Ticket, id: DispositivoId) {
        const uso = t.def.usoMs ?? 6_000
        ocupar(this.maquina, id, t.def.programa, uso)
        t.esperandoEm = undefined
        t.ficha.setEspera(null)

        this.acertar(
            `${DISPOSITIVOS[id].nome} para o ${PROGRAMAS[t.def.programa].nome}.`,
            PONTOS.atendido, ESTABILIDADE.ganhoAtender,
        )
        this.atendidos += 1
        this.hardware?.pulsar(id, C.livre)
        this.syncHardware()
        this.playAtender()
        void this.encerrar(t, true)
    }

    /** Uma peça vagou: quem estava na fila dela entra sem ninguém pedir. */
    private servirEspera(id: DispositivoId) {
        this.syncHardware()
        const fila = this.esperandoPor(id)
        if (!fila.length) return
        this.atender(fila[0], id)
    }

    /**
     * TOQUE NA RÉGUA DA MEMÓRIA.
     *
     * Bloco com programa → fecha aquele programa.
     * Bloco vazio        → tenta abrir o pedido que está na mão.
     *
     * Fechar é de graça: não ganha ponto nem perde estabilidade. É a
     * FERRAMENTA da criança, não uma resposta — e ferramenta que cobra pedágio
     * ninguém usa.
     */
    private onBloco(_indice: number, programa: ProgramaId | null) {
        if (!this.podeAgir()) return

        if (programa) { this.fechar(programa); return }

        const t = this.ticketSelecionado()
        if (!t) {
            this.mensagem.dizer('Toque num pedido primeiro.', TINTA.atencao)
            return
        }
        if (t.def.quer.o !== 'abrir') {
            this.errar(
                `${PROGRAMAS[t.def.programa].nome} quer uma PEÇA, não memória.`,
                ESTABILIDADE.perdaLeve,
            )
            return
        }

        if (avaliarPedido(t.def, this.maquina) !== 'liberar') {
            this.errar(porQueNao(t.def, this.maquina), ESTABILIDADE.perdaLeve)
            this.memoria?.pulsar(C.parado)
            return
        }

        abrirPrograma(this.maquina, t.def.programa)
        this.syncMemoria()
        this.memoria?.pulsar(C.livre)
        this.acertar(
            `${PROGRAMAS[t.def.programa].nome} aberto. Sobram ${blocosLivres(this.maquina)} blocos.`,
            PONTOS.atendido, ESTABILIDADE.ganhoAtender,
        )
        this.atendidos += 1
        this.playAtender()
        void this.encerrar(t, true)
    }

    private fechar(programa: ProgramaId) {
        const usando = usandoQual(this.maquina, programa)
        if (usando) {
            /*
             * Fechar um programa no meio do uso não é proibido por capricho: se
             * o editor está com a impressora, matar o editor deixa a impressora
             * num estado que ninguém consegue explicar para uma criança
             * ("imprimiu meio papel?"). A recusa é informativa e não custa nada.
             */
            this.mensagem.dizer(
                `${PROGRAMAS[programa].nome} está usando a ${DISPOSITIVOS[usando].nome}.`,
                TINTA.atencao, 'neutro',
            )
            this.hardware?.pulsar(usando, C.ocupado)
            return
        }

        fecharPrograma(this.maquina, programa)
        this.syncMemoria()
        this.mensagem.dizer(
            `Fechei o ${PROGRAMAS[programa].nome}. Sobram ${blocosLivres(this.maquina)} blocos.`,
            TINTA.fala, 'neutro',
        )
        this.playFechar()
    }

    /**
     * NEGAR.
     *
     * Só está certo quando `avaliarPedido` diz `negar` — ou seja, quando é
     * impossível AGORA e vai continuar impossível. Negar o que dá para esperar
     * é o erro grave do jogo, e a mensagem sempre diz o que dava para fazer no
     * lugar: a criança tem que sair do erro sabendo a alternativa.
     */
    private onNegar() {
        if (!this.podeAgir()) return

        const t = this.ticketSelecionado()
        if (!t) {
            this.mensagem.dizer('Toque num pedido primeiro.', TINTA.atencao)
            return
        }

        /*
         * Quem já está na fila de uma peça NÃO leva bronca por isso.
         *
         * A criança encaixou, o pedido está esperando vaga — que é a resposta
         * certa — e então ela aperta NEGAR. Cobrar aqui seria punir alguém por
         * ter acertado e depois duvidado. A mesa só lembra o que já está feito.
         */
        if (t.esperandoEm) {
            this.mensagem.dizer(
                `Ele já está na fila do ${DISPOSITIVOS[t.esperandoEm].nome}.`,
                TINTA.atencao, 'neutro',
            )
            return
        }

        const v = avaliarPedido(t.def, this.maquina)
        if (v === 'negar') {
            this.acertar(porQueNao(t.def, this.maquina), PONTOS.negado, ESTABILIDADE.ganhoNegar)
            this.playNegar()
            void this.encerrar(t, true)
            return
        }

        const saida =
            v === 'esperar' ? 'Dá para encaixar e esperar.'
                : v === 'fechar' ? 'Dá para fechar um programa e abrir.'
                    : 'Dá para atender agora.'
        this.errar(`${porQueNao(t.def, this.maquina)} ${saida}`, ESTABILIDADE.perdaGrave)
    }

    /** A paciência zerou: ninguém foi atendido, e a culpa é da mesa. */
    private async desistiu(t: Ticket) {
        if (this.fila.indexOf(t) < 0) return

        this.errors += 1
        this.points += PONTOS.desistiu
        this.mudarEstabilidade(-ESTABILIDADE.perdaDesistiu)
        this.mensagem.dizer(
            `${PROGRAMAS[t.def.programa].nome} cansou de esperar.`,
            TINTA.alerta, 'alerta',
        )
        this.playDesistiu()
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: PONTOS.desistiu, stage: this.nivel.nivel,
        })

        void this.encerrar(t, false)
        this.syncHardware()
    }

    /* ═══════════════════════════════════════════════ acerto e erro */

    private acertar(texto: string, pontos: number, ganho: number) {
        this.hits += 1
        this.points += pontos
        this.mudarEstabilidade(ganho)
        this.mensagem.dizer(texto, TINTA.ok, 'ok')
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: pontos, stage: this.nivel.nivel,
        })
    }

    private errar(texto: string, perda: number) {
        this.errors += 1
        this.points += PONTOS.erro
        this.mudarEstabilidade(-perda)
        this.mensagem.dizer(texto, TINTA.alerta, 'alerta')
        this.playErro()
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: PONTOS.erro, stage: this.nivel.nivel,
        })
        this.emitCheckpoint()
    }

    private mudarEstabilidade(delta: number) {
        const antes = this.estabilidade
        this.estabilidade = Phaser.Math.Clamp(this.estabilidade + delta, 0, 100)
        if (this.estabilidade === antes) return

        this.estab.set(this.estabilidade)
        if (this.estabilidade <= 30 && antes > 30) this.playInstavel()
        if (this.estabilidade <= 0) this.perderPorTravamento()
    }

    /* ═══════════════════════════════════════════════════ pausa */

    private alternarPausa() {
        if (this.ended) return
        if (this.estado === 'pausado') { this.despausar(); return }
        if (this.estado !== 'rodando') return

        this.estado = 'pausado'
        this.hardware?.setAtivo(false)
        this.memoria?.setAtivo(false)
        this.btNegar.setEnabled(false)
        this.btPausa.setLabel('CONTINUAR')
        this.pausa.mostrar()
        this.playPausa()
    }

    private despausar() {
        if (this.estado !== 'pausado') return
        this.estado = 'rodando'
        this.hardware?.setAtivo(true)
        this.memoria?.setAtivo(true)
        this.btNegar.setEnabled(true)
        this.btPausa.setLabel('PAUSA')
        this.pausa.esconder()
    }

    /* ═══════════════════════════════════════════════════ derrotas */

    /**
     * AS DUAS FORMAS DE PERDER, E O QUE ELAS TÊM EM COMUM.
     *
     * ── O QUE A PLATAFORMA FAZ, E O QUE ELA NÃO FAZ ──────────────────────
     *
     * O contrato tem um evento `GAME_OVER`, mas ele só NOTIFICA: nada do lado de
     * fora reinicia fase, desconta vida ou fecha o jogo. Quem faz a derrota
     * acontecer é esta cena. O evento é o aviso; o mecanismo é este método.
     *
     * ── PERDER A FASE, NUNCA O NÍVEL ─────────────────────────────────────
     *
     * A derrota devolve a criança à MESMA fase, com a máquina zerada e a
     * estabilidade cheia. Perder o nível inteiro transformaria um problema de
     * ritmo em castigo, e brigaria com a regra da casa: errar trava até
     * entender, sem empurrar ninguém para a frente. Não há limite de
     * tentativas, e os pontos já ganhos ficam.
     */
    private perderPorTravamento() {
        this.perder(
            'O sistema travou!',
            'A estabilidade chegou a zero. Cada pedido sem resposta derruba um pedaço dela.',
        )
    }

    private perderPorTempo() {
        if (this.resolvidos >= this.totalPedidos) return
        this.perder(
            'O turno acabou!',
            'O expediente terminou com pedidos na fila. Responder rápido é parte do trabalho.',
        )
    }

    private perder(titulo: string, recado: string) {
        if (this.ended || this.estado === 'perdido') return

        // mata tudo que estava no ar: animação pendente, `await` de fase,
        // qualquer callback atrasado que fosse mexer numa mesa que já era
        const gen = ++this.gen
        this.estado = 'perdido'
        this.relogioLigado = false

        this.hud.tempo.setRunning(false)
        this.hud.setHelpEnabled(false)
        this.tempoTotal += this.hud.tempo.elapsed()

        this.hardware?.setAtivo(false)
        this.memoria?.setAtivo(false)
        this.btNegar.setEnabled(false)
        this.btPausa.setEnabled(false)
        this.fila.forEach(t => t.ficha.setSelecionada(false))

        this.mensagem.dizer('Vamos recomeçar este turno.', TINTA.alerta, 'alerta')
        this.playPerdeu()

        runtimeGameBridge.emit({
            type: 'GAME_OVER', gameId: GAME_ID, stage: this.nivel.nivel,
        })
        this.emitCheckpoint()

        void FX.flash(this, C.parado, { duration: 360, peak: 0.16 })

        this.telaPerdeu = showLevelComplete(this, {
            title: titulo,
            subtitle: `Fase ${this.faseIdx + 1} de ${this.nivel.fases.length}  ·  Nível ${this.nivel.nivel}`,
            // a dica do nível, e não uma bronca: a criança volta sabendo mais
            // do que quando entrou
            message: `${recado}\n\n${this.nivel.dica}`,
            accent: C.parado,
            panelColor: C.creme,
            overlayColor: C.ink,
            progress: { total: this.nivel.fases.length, current: this.faseIdx },
            buttons: [
                {
                    label: 'Tentar de novo',
                    color: C.livre,
                    onClick: () => {
                        if (gen !== this.gen) return
                        this.telaPerdeu?.destroy()
                        this.telaPerdeu = undefined
                        this.hud.setHelpEnabled(true)
                        this.btNegar.setEnabled(true)
                        this.btPausa.setEnabled(true)
                        this.montarFase(false)
                    },
                },
                {
                    label: 'Escolher jogo',
                    color: C.edge,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════ avanço */

    private terminarFase() {
        if (this.estado !== 'rodando' || this.ended) return

        this.estado = 'fim'
        this.relogioLigado = false
        this.hud.tempo.setRunning(false)
        this.tempoTotal += this.hud.tempo.elapsed()
        this.hardware?.setAtivo(false)
        this.memoria?.setAtivo(false)

        void FX.sparks(this, 640, MEM.cy, { color: C.livre, count: 26, spread: 320 })

        this.faseIdx += 1
        if (this.faseIdx >= this.nivel.fases.length) {
            this.encerrarNivel()
            return
        }

        this.hud.setProgress(this.faseIdx, this.nivel.fases.length)
        this.mensagem.dizer('Turno fechado. Próxima fase!', TINTA.ok, 'ok')
        this.playFase()
        this.emitCheckpoint()

        const gen = this.gen
        this.time.delayedCall(1200, () => {
            if (gen !== this.gen || this.ended) return
            this.montarFase(false)
        })
    }

    private encerrarNivel() {
        this.ended = true
        this.gen += 1
        this.hud.setProgress(this.nivel.fases.length, this.nivel.fases.length)
        this.hud.setHelpEnabled(false)
        this.hud.tempo.setRunning(false)
        this.btNegar.setEnabled(false)
        this.btPausa.setEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.nivel.nivel,
        })
        this.emitCheckpoint(true)

        const lvl = this.nivel.nivel
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            showLevelComplete(this, {
                title: 'Sistema estável!',
                subtitle: `Nível ${lvl} concluído  ·  ${formatTime(this.tempoTotal)}`,
                message: NIVEIS[lvl].objetivo,
                accent: C.ciano,
                panelColor: C.creme,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Ligando a próxima máquina...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.ciano, C.livre, C.ocupado, C.creme] })
        showLevelComplete(this, {
            title: 'Controlador do Sistema!',
            subtitle: `${this.hits} decisões certas  ·  ${formatTime(this.tempoTotal)}`,
            message:
                'Um sistema operacional não escolhe entre sim e não: ele escolhe entre '
                + 'agora, daqui a pouco e nunca. Você distribuiu teclado, memória e '
                + 'impressora sem deixar a máquina travar.',
            accent: C.livre,
            panelColor: C.creme,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.livre,
                    onClick: () => this.scene.restart({ level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.edge,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════ tutorial */

    /**
     * O TUTORIAL MOSTRA O TOQUE — e toque é bater no lugar, não arrastar.
     *
     * Todo ponteiro é `tap`: fica parado em cima de um alvo e bate, com uma
     * ondinha saindo dali. Foi a correção que o Baralho das Listas precisou —
     * lá o dedo viajava setecentos pixels até a fenda, que é o desenho
     * universal de arrastar, e a criança tentava arrastar num jogo que só
     * aceita toque.
     *
     * E ele é CURTO. Três a cinco falas de uma linha, cada uma apontando para
     * uma coisa desenhada. Uma tela com máquina, memória e fila tem muito o que
     * explicar, e é exatamente por isso que o tutorial não pode explicar tudo:
     * o que sobra a criança descobre errando barato, com a mensagem do rodapé
     * dizendo o motivo.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const cfg = this.fase.blocos > 0 ? PECAS.comMemoria : PECAS.semMemoria
        const banda = {
            x: 640, y: cfg.cy, w: 1180, h: cfg.tile + 40,
        }
        const filaSpot = {
            x: 640, y: FILA.cy, w: 1230, h: FILA.h + 26,
        }
        const estabSpot = {
            x: ESTAB.x + ESTAB.w / 2, y: ESTAB.cy, w: ESTAB.w + 40, h: 54,
        }

        /** O dedo parado em cima de UMA coisa, batendo nela. */
        const tocar = (x: number, y: number) => ({
            fromX: x, fromY: y, toX: x, toY: y, tap: true,
        })

        if (this.nivel.nivel === 2) {
            const m = this.memoria?.pos() ?? { x: 640, y: MEM.cy, w: MEM.w }
            return [
                {
                    text: 'Isto é a MEMÓRIA. Cada quadradinho é um bloco.',
                    shape: 'rect' as const, x: m.x, y: m.y, w: m.w + 40, h: MEM.h + 20,
                    balloonX: 640, balloonY: 200,
                },
                {
                    text: 'Para ABRIR um programa, toque na régua da memória.',
                    shape: 'rect' as const, x: m.x, y: m.y, w: m.w + 40, h: MEM.h + 20,
                    balloonX: 640, balloonY: 200,
                    pointer: tocar(m.x, m.y),
                },
                {
                    text: 'Sem espaço? Toque num programa aberto para fechar.',
                    shape: 'rect' as const, x: m.x, y: m.y, w: m.w + 40, h: MEM.h + 20,
                    balloonX: 640, balloonY: 200,
                },
            ]
        }

        if (this.nivel.nivel === 3) {
            return [
                {
                    text: 'Agora chegam três pedidos ao mesmo tempo.',
                    shape: 'rect' as const, ...filaSpot,
                    balloonX: 640, balloonY: 300,
                },
                {
                    text: 'Comece por quem tem menos paciência na barrinha.',
                    shape: 'rect' as const, ...filaSpot,
                    balloonX: 640, balloonY: 300,
                },
            ]
        }

        /* ── Nível 1 ─────────────────────────────────────────────────── */
        const primeiro = this.fase.pedidos[0]
        const alvo = primeiro && primeiro.quer.o === 'usar'
            ? this.hardware?.posDe(primeiro.quer.dispositivo)
            : undefined

        return [
            {
                text: 'Aqui chegam os PEDIDOS. Toque num para escolher.',
                shape: 'rect' as const, ...filaSpot,
                balloonX: 640, balloonY: 300,
                pointer: tocar(FILA.x0 + FILA.w / 2, FILA.cy),
            },
            {
                text: 'Estas são as PEÇAS. Aro verde quer dizer livre.',
                shape: 'rect' as const, ...banda,
                balloonX: 640, balloonY: 520,
                ...(alvo ? { pointer: tocar(alvo.x, alvo.y) } : {}),
            },
            {
                text: 'A barrinha da ficha é a paciência de quem pediu.',
                shape: 'rect' as const, ...filaSpot,
                balloonX: 640, balloonY: 300,
            },
            {
                text: 'Aqui em cima: a estabilidade. Não deixe ela cair.',
                shape: 'rect' as const, ...estabSpot,
                balloonX: 640, balloonY: 330,
            },
            {
                text: 'Precisa pensar? Toque em PAUSA e o tempo para.',
                shape: 'rect' as const,
                x: RODAPE.pausaX, y: RODAPE.cy,
                w: RODAPE.pausaW + 40, h: RODAPE.pausaH + 34,
                balloonX: 560, balloonY: 440,
                pointer: tocar(RODAPE.pausaX, RODAPE.cy),
            },
        ]
    }

    /**
     * O tutorial PAUSA o jogo, e não só trava o toque.
     *
     * Nos outros jogos bastava `locked = true`: nada andava sozinho, então
     * travar o toque congelava o mundo. Aqui o mundo anda — se o tutorial só
     * travasse o toque, a criança sairia dele com dois pedidos já desistidos e
     * a estabilidade no chão, sem ter feito nada. Entrar no tutorial é entrar
     * em `pausado`, com o mesmo mecanismo do botão PAUSA.
     */
    private runTutorial(steps: TutorialStep[], force: boolean) {
        const voltarPara = this.estado
        this.estado = 'pausado'
        this.hardware?.setAtivo(false)
        this.memoria?.setAtivo(false)
        this.btNegar.setEnabled(false)
        this.btPausa.setEnabled(false)
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef05co07-l${this.nivel.nivel}`,
            once: !force,
            accent: C.ciano,
            safeTop: HUD.h + 12,
            steps,
            onFinish: () => {
                this.estado = voltarPara === 'pausado' ? 'rodando' : voltarPara
                this.hardware?.setAtivo(true)
                this.memoria?.setAtivo(true)
                this.btNegar.setEnabled(true)
                this.btPausa.setEnabled(true)
                this.hud.setHelpEnabled(true)
            },
        })
    }

    private replayTutorial = () => {
        if (this.ended || this.estado !== 'rodando') return
        const steps = this.buildTutorialSteps()
        if (!steps.length) return
        this.runTutorial(steps, true)
    }

    /* ═══════════════════════════════════════════════════ plataforma */

    private emitCheckpoint(forceComplete = false) {
        const antes = NIVEIS.slice(0, this.levelIdx).reduce((s, n) => s + n.fases.length, 0)
        const done = antes + this.faseIdx + (forceComplete ? 1 : 0)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_FASES) * 100),
            score: Math.max(0, this.points),
            stage: this.nivel.nivel,
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

    /** Um pedido chegou na bandeja. */
    private playChegou() { this.playTone(520, 0.09, 'triangle', 0.06) }
    private playSelecionar() { this.playTone(660, 0.05, 'sine', 0.04) }
    /** Entregou o recurso: o clique de encaixe. */
    private playAtender() { this.playTone(784, 0.13, 'triangle', 0.08) }
    /** Entrou na fila: dois tiques iguais, de "guardei sua vez". */
    private playEsperar() {
        [600, 600].forEach((f, i) =>
            this.time.delayedCall(i * 130, () => this.playTone(f, 0.07, 'sine', 0.05)))
    }
    private playNegar() { this.playTone(330, 0.18, 'triangle', 0.07) }
    private playFechar() { this.playTone(300, 0.12, 'sine', 0.06) }
    private playErro() { this.playTone(180, 0.2, 'square', 0.07) }
    private playInstavel() { this.playTone(150, 0.34, 'sawtooth', 0.06) }
    private playDesistiu() {
        [420, 300].forEach((f, i) =>
            this.time.delayedCall(i * 140, () => this.playTone(f, 0.22, 'triangle', 0.07)))
    }
    private playPausa() { this.playTone(440, 0.1, 'sine', 0.05) }
    private playTempoCurto() { this.playTone(700, 0.07, 'sine', 0.05) }
    private playFase() {
        [523, 659, 784].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.16, 'sine', 0.1)))
    }
    /**
     * O sistema travou.
     *
     * Dois tons descendo, e nada de sirene. Perder uma fase aqui não é
     * fracasso: é o jogo dizendo "vamos recomeçar este turno com a cabeça
     * fresca".
     */
    private playPerdeu() {
        [392, 294].forEach((f, i) =>
            this.time.delayedCall(i * 170, () => this.playTone(f, 0.3, 'sine', 0.08)))
    }
}
