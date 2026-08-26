import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import { FX } from '../../../../shared/effects/FX'

import {
    NIVEIS, PROGRAMAS, USO_MS, ENTRE_PEDIDOS_MS, LUZES_INICIAIS, AJUDA_MS,
} from '../data/niveis'
import { C, TEMPO_TEMA } from '../data/theme'
import { AJUDA, PECAS, PEDIDO, BOTAO, TEMPO } from '../data/layout'
import type { EstadoCena, NivelDef, PecaId, Pedido, ProgramaId } from '../types'
import {
    createCenario, createLuzes, createPedido, createPecas, createFila,
    createEncaixes, createRedondo, createBotaoNaoDa, ondinha, travar,
    type Botao, type Encaixes, type FilaView, type Fileira, type ItemFila,
    type Luzes, type PainelPedido,
} from './effects'

const GAME_ID = 'sistema-operacional'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A TELA NÃO ANDA SEM VOCÊ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Os TRÊS níveis usam esta mesma cena e este mesmo layout. Cada um acrescenta
 * exatamente uma ideia:
 *
 *   N1  um programa pede uma peça e espera para sempre
 *   N2  entra a MEMÓRIA: abrir ocupa lugar, e o lugar acaba
 *   N3  entram DOIS pedidos ao mesmo tempo, e você escolhe a ordem
 *
 * ── AS DUAS FORMAS DE PERDER UMA LUZ ─────────────────────────────────────
 *
 *   · tocar numa peça que NÃO é a pedida
 *   · dizer NÃO DÁ quando dava
 *
 * As duas são coisas que a criança FEZ. Existia uma terceira — deixar um
 * programa esperando até a paciência acabar — e ela saiu junto com o relógio do
 * Nível 3: perder por demorar não ensina nada sobre sistema operacional, e os
 * três relógios daquele nível estouravam todos no mesmo segundo.
 *
 * Todo o resto é de graça, e de propósito:
 *
 *   · tocar na peça certa enquanto outro programa a usa → "ainda não"
 *   · tocar na peça certa que está sem energia → o botão NÃO DÁ pulsa
 *   · tocar na memória cheia → os encaixes pulsam
 *   · fechar um programa, ou trocar de quem atender → sempre grátis
 *
 * Os casos "de graça" são justamente os que a criança precisa DESCOBRIR.
 * Cobrar por explorar é a forma mais rápida de fazer alguém parar de explorar.
 */

const PONTOS = { acerto: 20, erro: -5 }

export class GameScene extends Phaser.Scene {

    /* ── partida ───────────────────────────────────────────────────── */

    private nivelIdx = 0
    private pontos = 0
    private acertos = 0
    private erros = 0
    private luzesRestantes = LUZES_INICIAIS
    private mudo = false
    private estado: EstadoCena = 'pedindo'

    /** Todo callback atrasado captura este valor e desiste se ele mudou. */
    private gen = 0

    /**
     * Os pedidos que ainda não foram resolvidos, na ordem.
     *
     * Os `ativos` primeiros estão VIVOS: aceitam toque. Um deles é o
     * `selecionado`, que está no balcão com a frase na tela; o outro espera no
     * trilho, aceso e com halo. O resto da lista ainda nem chegou.
     */
    private restantes: number[] = []
    private selecionado: number | null = null
    /** Quanto falta para cada peça em uso ficar livre. */
    private ocupacao = new Map<PecaId, number>()
    /** Quem está aberto em cada encaixe da memória. Vazio no Nível 1. */
    private abertos: Array<ProgramaId | null> = []
    /** Há quanto tempo a criança está parada olhando o mesmo pedido. */
    private ocioso = 0
    private ajudou = { releia: false, mostra: false }

    /* ── interface ─────────────────────────────────────────────────── */

    private luzes!: Luzes
    private painel!: PainelPedido
    private fileira!: Fileira
    private fila!: FilaView
    private botao!: Botao
    private ajuda!: Botao
    private tempo!: TimeBar
    private encaixes?: Encaixes

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { nivel?: number; points?: number }) {
        this.nivelIdx = Phaser.Math.Clamp(data?.nivel ?? 1, 1, NIVEIS.length) - 1
        this.pontos = data?.points ?? 0
        this.acertos = 0
        this.erros = 0
        this.luzesRestantes = LUZES_INICIAIS
        this.mudo = false
        this.estado = 'pedindo'
        this.gen = 0
        this.restantes = []
        this.selecionado = null
        this.ocupacao = new Map()
        this.abertos = []
        this.ocioso = 0
        this.ajudou = { releia: false, mostra: false }
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)
        const nivel = this.nivel

        this.restantes = nivel.pedidos.map((_, i) => i)
        this.selecionado = this.restantes[0] ?? null

        createCenario(this, nivel.cenario)

        this.luzes = createLuzes(this, LUZES_INICIAIS)
        this.painel = createPedido(this)
        this.fileira = createPecas(this, {
            pecas: nivel.pecas,
            semEnergia: nivel.semEnergia,
            onPeca: id => this.onPeca(id),
        })
        this.fila = createFila(this, j => this.onTocarFila(j))
        this.botao = createBotaoNaoDa(this, () => this.onNaoDa())
        this.ajuda = createRedondo(this, AJUDA.x, AJUDA.cy, AJUDA.r, '?', () => this.replayTutorial())

        /*
         * A BARRA DE TEMPO.
         *
         * Ela não sabe perder: conta, pinta e avisa. O que zerar SIGNIFICA é
         * decisão desta cena, e chega por `onEmpty` — que aqui é perder o
         * NÍVEL, com a barra cheia de novo em "Tentar de novo". Perder o jogo
         * inteiro por ritmo transformaria um erro de velocidade em castigo.
         */
        this.tempo = createTimeBar(this, {
            cx: TEMPO.cx, cy: TEMPO.cy, w: TEMPO.w, h: TEMPO.h,
            duration: nivel.tempo,
            theme: TEMPO_TEMA,
            warnAt: TEMPO.warnAt,
            dangerAt: TEMPO.dangerAt,
            iconR: TEMPO.iconR,
            iconDX: TEMPO.iconDX,
            depth: 80,
            onDanger: () => this.playTicTac(),
            onEmpty: () => void this.tempoEsgotado(),
        })

        if (nivel.memoria) {
            this.abertos = new Array(nivel.memoria.encaixes).fill(null)
            nivel.memoria.jaAbertos.slice(0, nivel.memoria.encaixes)
                .forEach((p, i) => { this.abertos[i] = p })

            this.encaixes = createEncaixes(this, {
                cx: this.fileira.posDe('memoria').x,
                total: nivel.memoria.encaixes,
                onEncaixe: (i, quem) => this.onEncaixe(i, quem),
            })
            this.encaixes.set(this.abertos)
        }

        /*
         * A ENTRADA DA CENA.
         *
         * As peças caem em sequência, as luzes acendem, o trilho e o botão
         * deslizam. Custa meio segundo e resolve a pergunta "o jogo já começou?"
         * — que numa tela estática a criança faz o tempo todo.
         */
        this.fileira.entrar()
        this.luzes.entrar()
        this.fila.entrar()
        this.encaixes?.entrar()
        this.botao.entrar(700)
        this.ajuda.entrar(820)
        this.tempo.container.setAlpha(0)
        void FX.to(this, this.tempo.container, { alpha: 1 }, { duration: 320, delay: 240 })

        /*
         * A ONDINHA EM QUALQUER TOQUE.
         *
         * Mesmo um toque que não acerta nada produz alguma coisa. Sem isso, errar
         * o alvo por dez pixels é indistinguível de o jogo ter travado.
         */
        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (this.estado === 'travado' || this.estado === 'fim') return
            ondinha(this, p.worldX, p.worldY)
        })

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        /*
         * O TABULEIRO ENTRA ANTES DO TUTORIAL — senão o recorte iluminaria uma
         * tela vazia e falaria de peças que ainda não existem.
         */
        this.time.delayedCall(900, () => void this.mostrarPedido(true))
    }

    /* ═══════════════════════════════════════════════ o que está vivo */

    private get nivel(): NivelDef { return NIVEIS[this.nivelIdx] }
    private get quantosAtivos(): number { return this.nivel.ativos ?? 1 }
    private pedidoDe(i: number): Pedido { return this.nivel.pedidos[i] }
    private get pedido(): Pedido { return this.pedidoDe(this.selecionado ?? 0) }

    /** Os pedidos VIVOS: os primeiros da lista, incluindo o do balcão. */
    private get ativos(): number[] {
        return this.restantes.slice(0, this.quantosAtivos)
    }

    /** Quem aparece no trilho: todos os restantes, menos o que está no balcão. */
    private get noTrilho(): number[] {
        return this.restantes.filter(i => i !== this.selecionado)
    }

    /**
     * O que o trilho mostra.
     *
     * `esperando` separa os dois estados sem legenda nenhuma: quem está entre os
     * `ativos` fica aceso, com halo e tocável; o resto é quem ainda nem chegou.
     *
     * `buraco` deixa a vaga vazia enquanto um ícone voa de volta para ela — sem
     * isso, o mesmo programa aparece duas vezes, pousado e no ar.
     */
    private itensDoTrilho(buraco?: number): ItemFila[] {
        return this.noTrilho.map(i => (
            i === buraco
                ? { textura: '', esperando: false }
                : {
                    textura: PROGRAMAS[this.pedidoDe(i).programa].textura,
                    esperando: this.ativos.includes(i),
                }
        ))
    }

    private redesenharFila(buraco?: number) {
        this.fila.set(this.itensDoTrilho(buraco))
    }

    /* ═══════════════════════════════════════════════════ o relógio */

    /**
     * DUAS coisas andam sozinhas nesta tela, e NENHUMA delas apressa a criança:
     * a peça em uso, que se libera quando o tempo dela acaba, e o contador de
     * inatividade, que decide quando ajudar quem travou.
     *
     * Havia uma terceira — a paciência de quem esperava, no Nível 3 — e era a
     * única que podia CUSTAR alguma coisa. Ela saiu. Nada nesta tela tira uma
     * luz por causa do relógio; o relógio só devolve peças.
     *
     * E a MEMÓRIA nunca teve relógio: um programa aberto fica aberto até alguém
     * fechar. É a diferença entre usar um dispositivo e ocupar memória, e ela
     * aparece sozinha, sem ninguém explicar.
     */
    update(_time: number, delta: number) {
        /*
         * A BARRA SÓ ANDA EM `pedindo`.
         *
         * Antes de qualquer outra coisa, e fora do `return` de baixo: a barra
         * precisa ser ESMAECIDA e congelada também no fim de jogo, senão ela
         * fica acesa e cheia por trás da tela de derrota, como se ainda desse
         * para jogar. `tick` é ignorado enquanto ela está parada, então chamar
         * sempre é de graça.
         */
        this.tempo.setRunning(this.estado === 'pedindo')
        this.tempo.tick(delta)

        if (this.estado === 'travado' || this.estado === 'fim') return

        this.ocupacao.forEach((resta, id) => {
            const falta = resta - delta
            if (falta > 0) { this.ocupacao.set(id, falta); return }
            this.ocupacao.delete(id)
            this.fileira.liberar(id)
            this.playLivre()
        })

        if (this.estado !== 'pedindo') return

        this.ocioso += delta
        if (!this.ajudou.releia && this.ocioso >= AJUDA_MS.releia) {
            this.ajudou.releia = true
            this.painel.releia()
        }
        if (!this.ajudou.mostra && this.ocioso >= AJUDA_MS.mostra) {
            this.ajudou.mostra = true
            this.mostrarCaminho()
        }
    }

    private shutdownScene() {
        this.gen += 1
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        this.input.setDefaultCursor('default')
    }

    /* ═══════════════════════════════════════════════════ o laço */

    /**
     * O PEDIDO SOBE PARA O BALCÃO — E A TELA VOLTA A ACEITAR TOQUE AQUI.
     *
     * `trancar(false)` mora NESTE método, e não em quem chama, porque este é o
     * único lugar do jogo onde a tela volta a ficar jogável depois de uma
     * animação. Enquanto o destravamento estava espalhado pelos chamadores,
     * `onTocarFila` trancava a tela para o programa descer voando e ninguém
     * destrancava: depois de trocar de atendido, a criança tocava numa peça e
     * nada acontecia — nem as peças, nem os encaixes, nem o NÃO DÁ, nem o `?`.
     * O estado dizia `pedindo` e todas as zonas estavam mortas.
     *
     * A regra que sobrou: quem TRANCA não precisa lembrar de destrancar; quem
     * põe um pedido no balcão destranca sempre.
     */
    private async mostrarPedido(comTutorial: boolean, origem?: { x: number; y: number }) {
        const gen = ++this.gen
        this.estado = 'servindo'
        this.ocioso = 0
        this.ajudou = { releia: false, mostra: false }

        if (this.selecionado === null) { void this.terminar(); return }

        /*
         * A fila solta o ícone ANTES do voo.
         *
         * `posDe` é uma coordenada fixa do trilho, então dá para ler o ponto de
         * partida e só então tirar o ícone de lá. Na ordem contrária apareceriam
         * duas cópias do mesmo programa — uma voando e outra parada no trilho.
         */
        const daFila = origem ?? this.fila.posDe(0)
        this.redesenharFila()
        this.emitCheckpoint()

        await this.painel.mostrar(this.pedido, daFila)
        if (gen !== this.gen) return

        // o tutorial destranca sozinho, no `onFinish` do `runTutorial`
        if (comTutorial) {
            this.runTutorial(this.buildTutorialSteps(), false, () => {
                if (gen !== this.gen) return
                this.estado = 'pedindo'
                this.ocioso = 0
            })
            return
        }

        this.trancar(false)
        this.estado = 'pedindo'
        this.ocioso = 0
    }

    /**
     * Tira o pedido resolvido da lista e chama o próximo.
     *
     * A tela fica TRANCADA durante a pausa entre um pedido e outro. Não é
     * capricho: destrancar aqui deixava as peças reagindo ao dedo por um
     * segundo e pouco enquanto o balcão estava vazio — o toque respondia com
     * uma animação e não fazia nada, que é o pior tipo de resposta.
     */
    private async proximo(resolvido: number) {
        const gen = this.gen
        this.restantes = this.restantes.filter(i => i !== resolvido)
        this.selecionado = this.restantes[0] ?? null

        if (this.selecionado === null) { void this.terminar(); return }

        await FX.wait(this, ENTRE_PEDIDOS_MS)
        if (gen !== this.gen) return
        void this.mostrarPedido(false)
    }

    /**
     * TROCAR DE ATENDIDO.
     *
     * O programa que estava no balcão desce voando de volta para a vaga dele, e
     * o escolhido sobe. É esse par de voos que faz "escolher a ordem" ser uma
     * coisa que se VÊ — sem ele, a troca seria um estado interno e a criança
     * teria que confiar que alguma coisa aconteceu.
     *
     * Trocar é DE GRAÇA. É a ferramenta do nível, não uma resposta.
     */
    private async onTocarFila(j: number) {
        if (this.estado !== 'pedindo') return
        const trilho = this.noTrilho
        const novo = trilho[j]
        if (novo === undefined || !this.ativos.includes(novo)) return

        const antigo = this.selecionado
        if (antigo === null || antigo === novo) return

        const gen = ++this.gen
        this.estado = 'servindo'
        this.trancar(true)
        this.playTrocar()

        const origem = this.fila.posDe(j)
        const novoTrilho = this.restantes.filter(i => i !== novo)
        const destino = this.fila.posDe(Math.max(0, novoTrilho.indexOf(antigo)))

        // a vaga do que está voltando fica VAZIA durante o voo, senão ele
        // aparece duas vezes: pousado no trilho e ainda no ar
        this.selecionado = novo
        this.redesenharFila(antigo)

        await this.painel.devolver(destino)
        if (gen !== this.gen) return

        // `mostrarPedido` sobe a geração sozinho, e é isso que invalida qualquer
        // callback atrasado deste voo
        void this.mostrarPedido(false, origem)
    }

    /* ═══════════════════════════════════════════════════ as ações */

    /**
     * TOQUE NUMA PEÇA.
     *
     * O ESTADO da peça decide o que acontece — nunca um botão separado. É o
     * mesmo gesto o tempo todo, e é o tabuleiro que muda de significado.
     */
    private onPeca(id: PecaId) {
        if (this.estado !== 'pedindo' || this.selecionado === null) return
        this.ocioso = 0
        const p = this.pedido

        // peça errada: é o erro de verdade — não leu o pedido
        if (id !== p.peca) {
            this.fileira.erro(id)
            this.painel.negar()
            this.errar()
            return
        }

        // a peça certa, mas sem energia: a resposta está no botão, e o botão
        // pulsa para dizer isso. Não custa luz: descobrir isto é a lição
        if (this.nivel.semEnergia.includes(id)) {
            this.fileira.erro(id)
            this.botao.chamar()
            this.playAviso()
            return
        }

        if (id === 'memoria') { this.abrirNaMemoria(); return }

        /*
         * A peça certa, mas EM USO por outro programa.
         *
         * Não custa luz, e no Nível 3 é a coisa mais importante da tela: é aqui
         * que a criança descobre que a saída não é insistir, é atender outro da
         * fila e voltar depois.
         */
        if (this.ocupacao.has(id)) {
            this.fileira.aguarde(id)
            this.playAguarde()
            /*
             * E o trilho CHAMA: "a saída está aqui embaixo".
             *
             * É a coisa mais importante do Nível 3, e ela não gasta uma palavra:
             * a criança insiste na peça ocupada, a peça responde "ainda não" e o
             * outro programa pula no trilho. Insistir não leva a lugar nenhum;
             * atender o outro leva.
             */
            if (this.quantosAtivos > 1) this.fila.chamar()
            return
        }

        void this.entregar(id)
    }

    /** O programa sai do painel, VOA até a peça e pousa nela. */
    private async entregar(id: PecaId) {
        const gen = this.gen
        const qual = this.selecionado as number
        this.estado = 'servindo'
        this.trancar(true)

        const icone = this.painel.soltarIcone()
        this.fileira.acerto(id)
        this.playAcerto()
        this.marcarAcerto()

        await FX.all(
            this.painel.esconder(true),
            icone ? this.fileira.ocupar(id, icone) : Promise.resolve(),
        )
        if (gen !== this.gen) return

        this.ocupacao.set(id, USO_MS)
        void this.proximo(qual)
    }

    /* ═══════════════════════════════════════════════════ a memória */

    /**
     * ABRIR: pôr o programa num encaixe livre.
     *
     * Se não houver encaixe livre, isto NÃO é erro e NÃO custa luz — os quatro
     * encaixes pulsam em vermelho, que é o jogo dizendo "o problema está aqui".
     * A saída é fechar alguém, e fechar é sempre de graça.
     */
    private abrirNaMemoria() {
        const livre = this.abertos.indexOf(null)
        if (livre < 0) {
            this.encaixes?.cheia()
            this.fileira.erro('memoria')
            this.playAviso()
            return
        }
        void this.abrir(livre)
    }

    private async abrir(i: number) {
        const gen = this.gen
        const qual = this.selecionado as number
        this.estado = 'servindo'
        this.trancar(true)

        const quem = this.pedido.programa
        const icone = this.painel.soltarIcone()
        this.playAcerto()
        this.marcarAcerto()

        await FX.all(
            this.painel.esconder(true),
            icone && this.encaixes
                ? this.encaixes.guardar(i, quem, icone)
                : Promise.resolve(),
        )
        if (gen !== this.gen) return

        this.abertos[i] = quem
        void this.proximo(qual)
    }

    /**
     * TOQUE NUM ENCAIXE.
     *
     * Com programa dentro → fecha. Vazio → é a mesma coisa que tocar na peça de
     * memória, porque é isso que a criança quer dizer com aquele toque.
     *
     * Fechar não dá ponto e não tira luz: é a FERRAMENTA da criança, não uma
     * resposta. E não existe escolha errada de quem fechar — de propósito.
     */
    private onEncaixe(i: number, quem: ProgramaId | null) {
        if (this.estado !== 'pedindo') return
        this.ocioso = 0
        if (!quem) { this.onPeca('memoria'); return }
        void this.fechar(i)
    }

    private async fechar(i: number) {
        const gen = this.gen
        this.estado = 'servindo'
        this.trancar(true)
        this.playFechar()

        await this.encaixes?.soltar(i)
        if (gen !== this.gen) return

        this.abertos[i] = null
        this.trancar(false)
        this.estado = 'pedindo'
        this.ocioso = 0
    }

    /* ═══════════════════════════════════════════════════ o NÃO DÁ */

    private onNaoDa() {
        if (this.estado !== 'pedindo' || this.selecionado === null) return
        this.ocioso = 0

        if (!this.nivel.semEnergia.includes(this.pedido.peca)) {
            /*
             * Disse que não dava, e dava.
             *
             * O erro aponta para a PEÇA que resolvia — não para uma frase. A
             * criança vê a resposta piscando no lugar onde ela mora, que é a
             * forma mais curta de explicar que existia saída.
             */
            this.fileira.apontar(this.pedido.peca)
            if (this.pedido.peca === 'memoria' && this.abertos.indexOf(null) < 0) {
                this.encaixes?.cheia()
            }
            this.errar()
            return
        }

        void this.recusar()
    }

    private async recusar() {
        const gen = this.gen
        const qual = this.selecionado as number
        this.estado = 'servindo'
        this.trancar(true)

        this.playAcerto()
        this.marcarAcerto()
        void FX.sparks(this, PEDIDO.cx, PEDIDO.fraseCY, {
            color: C.verde, count: 18, spread: 200, depth: 25,
        })
        void FX.ping(this, BOTAO.cx, BOTAO.cy, C.verde, { radius: 120 })

        await this.painel.esconder(true)
        if (gen !== this.gen) return

        void this.proximo(qual)
    }

    /* ═══════════════════════════════════════════════ acerto e erro */

    private marcarAcerto() {
        this.acertos += 1
        this.pontos += PONTOS.acerto
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: PONTOS.acerto, stage: this.nivel.numero,
        })
    }

    private errar() {
        /*
         * DEPOIS QUE A ÚLTIMA LUZ APAGA, NADA MAIS CUSTA LUZ.
         *
         * Sem esta linha, dois erros disparados no mesmo punhado de quadros
         * chamavam `travou()` duas vezes: dois véus por cima da sala, dois
         * `showLevelComplete` empilhados, o som de derrota em cima do som de
         * derrota e a tela parada por baixo de tudo. Era exatamente o que
         * acontecia quando os anéis de paciência do Nível 3 estouravam juntos.
         *
         * O relógio já saiu, mas a guarda fica: ela é uma linha, e o custo de
         * não ter é o jogo travado na cara da criança.
         */
        if (this.estado === 'travado' || this.estado === 'fim') return
        this.erros += 1
        this.pontos += PONTOS.erro
        this.luzesRestantes -= 1
        this.luzes.set(this.luzesRestantes)
        this.playErro()
        FX.shakeCam(this, 'leve')
        void FX.flash(this, C.vermelho, { duration: 260, peak: 0.12 })

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: PONTOS.erro, stage: this.nivel.numero,
        })
        this.emitCheckpoint()

        if (this.luzesRestantes <= 0) void this.travou()
    }

    /** A ajuda de quem travou: a peça certa pisca. Sem frase, sem bronca. */
    private mostrarCaminho() {
        if (this.selecionado === null) return
        const alvo = this.pedido.peca
        if (this.nivel.semEnergia.includes(alvo)) { this.botao.chamar(); return }
        if (alvo === 'memoria' && this.abertos.indexOf(null) < 0) {
            this.encaixes?.cheia()
            return
        }
        /*
         * No Nível 3, quando a peça pedida está OCUPADA, apontar para ela seria
         * mandar a criança insistir no que não dá. A ajuda certa ali é mostrar a
         * FILA: existe outro que dá para atender agora.
         */
        if (this.ocupacao.has(alvo) && this.noTrilho.length) {
            this.fileira.aguarde(alvo)
            this.fila.chamar()
            return
        }
        this.fileira.apontar(alvo)
    }

    private trancar(on: boolean) {
        this.fileira.setAtivo(!on)
        this.encaixes?.setAtivo(!on)
        this.fila.setAtivo(!on)
        this.botao.setAtivo(!on)
        this.ajuda.setAtivo(!on)
    }

    /* ═══════════════════════════════════════════════ fim */

    /**
     * AS TRÊS LUZES APAGARAM.
     *
     * A plataforma tem o evento `GAME_OVER`, mas ele só NOTIFICA: nada do lado
     * de fora reinicia nada. Quem faz a derrota acontecer é esta cena.
     *
     * E a derrota devolve a criança ao começo do MESMO nível, com a tela limpa
     * e sem limite de tentativas. Não existe punição além de recomeçar.
     */
    private async travou() {
        const gen = ++this.gen
        this.estado = 'travado'
        this.trancar(true)
        this.playTravou()

        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.nivel.numero })
        this.emitCheckpoint()

        await travar(this)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            title: 'O computador travou!',
            subtitle: 'As três luzes apagaram',
            message: this.nivel.numero === 3
                ? 'Peça ocupada não fica ocupada para sempre. Atenda o outro e volte depois.'
                : 'Cada programa precisa da peça certa. Leia o que ele pede e entregue só ela.',
            accent: C.vermelho,
            panelColor: C.creme,
            overlayColor: C.ink,
            buttons: [
                {
                    label: 'Tentar de novo',
                    color: C.verde,
                    onClick: () => this.scene.restart({ nivel: this.nivel.numero, points: this.pontos }),
                },
                { label: 'Escolher jogo', color: C.fosco, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    /**
     * O TEMPO ACABOU.
     *
     * Não é a mesma coisa que travar o computador, e a tela diz isso: sem
     * vermelho, sem "você errou", e sem tirar luz nenhuma. Perder o NÍVEL — e
     * não o jogo — é o que o `createTimeBar` recomenda para fundamental 1, e é
     * coerente com a casa: recomeçar não é punição, é a segunda tentativa.
     *
     * A guarda do começo é a mesma do `errar()`: depois que a partida acabou,
     * ela não pode acabar de novo. `onEmpty` dispara uma vez por `reset`, mas
     * um `tick` atrasado de um frame já bastaria para empilhar duas telas.
     */
    private async tempoEsgotado() {
        if (this.estado === 'travado' || this.estado === 'fim') return
        const gen = ++this.gen
        this.estado = 'travado'
        this.trancar(true)
        this.playTravou()

        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.nivel.numero })
        this.emitCheckpoint()

        await travar(this)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            title: 'O tempo acabou!',
            subtitle: `${this.acertos} de ${this.nivel.pedidos.length} pedidos atendidos`,
            message: 'O relógio zerou. Comece de novo — a barra volta cheia.',
            accent: C.ciano,
            panelColor: C.creme,
            overlayColor: C.ink,
            buttons: [
                {
                    label: 'Tentar de novo',
                    color: C.verde,
                    onClick: () => this.scene.restart({ nivel: this.nivel.numero, points: this.pontos }),
                },
                { label: 'Escolher jogo', color: C.fosco, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    private async terminar() {
        this.estado = 'fim'
        this.gen += 1
        this.trancar(true)
        this.fila.set([])

        const ultimo = this.nivelIdx >= NIVEIS.length - 1
        if (ultimo) {
            runtimeGameBridge.emit({
                type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.nivel.numero,
            })
        }
        this.emitCheckpoint(true)

        await FX.wait(this, 400)

        const total = this.nivel.pedidos.length
        if (!ultimo) {
            const proximo = NIVEIS[this.nivelIdx + 1]
            showLevelComplete(this, {
                title: `Nível ${this.nivel.numero} completo!`,
                subtitle: `${this.acertos} de ${total} pedidos atendidos`,
                message: proximo.numero === 2
                    ? 'Agora entra a MEMÓRIA: o lugar onde os programas ficam abertos.'
                    : 'Agora DOIS programas pedem ao mesmo tempo. Você escolhe a ordem.',
                accent: C.ciano,
                panelColor: C.creme,
                overlayColor: C.ink,
                progress: { total: NIVEIS.length, current: this.nivel.numero },
                autoAdvance: {
                    delay: 2400,
                    label: proximo.numero === 2 ? 'Ligando a memória...' : 'Abrindo a fila...',
                    onComplete: () => this.scene.restart({
                        nivel: this.nivel.numero + 1, points: this.pontos,
                    }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.ciano, C.verde, C.creme] })
        showLevelComplete(this, {
            title: 'A máquina rodou!',
            subtitle: `${this.acertos} de ${total} pedidos atendidos`,
            message:
                'Nenhum programa liga o teclado sozinho, nenhum abre sem lugar na '
                + 'memória, e nenhum sabe esperar a vez. Quem entrega as peças, guarda '
                + 'o espaço e decide a ordem é o sistema operacional — e nesta rodada o '
                + 'sistema operacional foi você.',
            accent: C.verde,
            panelColor: C.creme,
            overlayColor: C.ink,
            progress: { total: NIVEIS.length, current: NIVEIS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.verde,
                    onClick: () => this.scene.restart({ nivel: 1, points: this.pontos }),
                },
                { label: 'Escolher jogo', color: C.fosco, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════ tutorial */

    /**
     * QUATRO FALAS, UMA LINHA CADA.
     *
     * As FRASES moram em `data/niveis.ts` — é lá que o verificador as mede. A
     * GEOMETRIA mora aqui, porque só a cena sabe onde as peças pousaram.
     *
     * Todo ponteiro é `tap`: o dedo fica parado em cima do alvo e bate. Sem
     * `tap` ele viaja de um ponto a outro, que é o desenho universal de
     * ARRASTAR — e este jogo só aceita toques.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const tocar = (x: number, y: number) => ({ fromX: x, fromY: y, toX: x, toY: y, tap: true })
        const falas = this.nivel.tutorial
        const desligada = this.fileira.posDe(this.nivel.semEnergia[0])

        if (this.nivel.numero === 3) {
            /*
             * QUATRO FALAS, E CADA UMA ILUMINA UM LUGAR SÓ.
             *
             * A versão anterior abria o tutorial iluminando o trilho inteiro
             * para falar de três pedidos simultâneos — um retângulo largo, com
             * ícones acesos e apagados dentro, para explicar uma coisa que a
             * criança ainda não tinha visto acontecer. Agora a sequência segue o
             * olho: quem está pedindo AGORA (o balcão), quem está esperando (um
             * ícone, um círculo), como trazer ele (o dedo bate nele), e o que
             * fazer quando a peça está ocupada (a fileira).
             */
            const naFila = this.fila.posDe(0)
            const noBalcao = {
                shape: 'rect' as const,
                x: PEDIDO.cx, y: PEDIDO.y + PEDIDO.h / 2,
                w: PEDIDO.w + 26, h: PEDIDO.h + 26,
            }
            const naVez = {
                shape: 'circle' as const,
                x: naFila.x, y: naFila.y, w: 112, h: 112,
            }
            return [
                { text: falas[0], ...noBalcao, balloonX: 640, balloonY: 470 },
                { text: falas[1], ...naVez, balloonX: 580, balloonY: 420 },
                {
                    text: falas[2], ...naVez,
                    balloonX: 580, balloonY: 420,
                    pointer: tocar(naFila.x, naFila.y),
                },
                {
                    text: falas[3],
                    shape: 'rect' as const, x: 640, y: PECAS.cy, w: 1180, h: PECAS.alt + 150,
                    balloonX: 640, balloonY: 250,
                },
            ]
        }

        if (this.nivel.numero === 2) {
            const mem = this.fileira.posDe('memoria')
            const encaixe = this.encaixes?.posDe(0) ?? { x: mem.x, y: mem.y - 110 }
            return [
                {
                    text: falas[0],
                    shape: 'rect' as const,
                    x: mem.x, y: (mem.y + encaixe.y) / 2,
                    w: 320, h: (mem.y - encaixe.y) + PECAS.alt + 60,
                    balloonX: 470, balloonY: 250,
                },
                {
                    text: falas[1],
                    shape: 'rect' as const, x: mem.x, y: mem.y, w: 230, h: PECAS.alt + 90,
                    balloonX: 470, balloonY: 250,
                    pointer: tocar(mem.x, mem.y),
                },
                {
                    text: falas[2],
                    shape: 'rect' as const, x: encaixe.x, y: encaixe.y, w: 96, h: 96,
                    balloonX: 560, balloonY: 560,
                    pointer: tocar(encaixe.x, encaixe.y),
                },
                {
                    text: falas[3],
                    shape: 'rect' as const, x: desligada.x, y: PECAS.cy, w: 220, h: PECAS.alt + 90,
                    balloonX: 520, balloonY: 250,
                },
            ]
        }

        const primeira = this.fileira.posDe(this.nivel.pedidos[0].peca)
        return [
            {
                text: falas[0],
                shape: 'rect' as const,
                x: PEDIDO.cx, y: PEDIDO.y + PEDIDO.h / 2,
                w: PEDIDO.w + 26, h: PEDIDO.h + 26,
                balloonX: 640, balloonY: 470,
            },
            {
                text: falas[1],
                shape: 'rect' as const, x: 640, y: PECAS.cy, w: 1180, h: PECAS.alt + 150,
                balloonX: 640, balloonY: 250,
                pointer: tocar(primeira.x, primeira.y),
            },
            {
                text: falas[2],
                shape: 'rect' as const, x: desligada.x, y: PECAS.cy, w: 220, h: PECAS.alt + 90,
                balloonX: 520, balloonY: 250,
            },
            {
                text: falas[3],
                shape: 'rect' as const, x: BOTAO.cx, y: BOTAO.cy, w: BOTAO.w + 40, h: BOTAO.h + 40,
                balloonX: 620, balloonY: 430,
                pointer: tocar(BOTAO.cx, BOTAO.cy),
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.estado = 'servindo'
        this.trancar(true)
        createTutorial(this, {
            key: `ef05co07-n${this.nivel.numero}`,
            once: !force,
            accent: C.ciano,
            safeTop: 96,
            steps,
            onFinish: () => {
                this.trancar(false)
                onFinish()
            },
        })
    }

    private replayTutorial = () => {
        if (this.estado !== 'pedindo') return
        this.runTutorial(this.buildTutorialSteps(), true, () => {
            this.estado = 'pedindo'
            this.ocioso = 0
        })
    }

    /* ═══════════════════════════════════════════════════ plataforma */

    private emitCheckpoint(completo = false) {
        const antes = NIVEIS.slice(0, this.nivelIdx).reduce((s, n) => s + n.pedidos.length, 0)
        const totalGeral = NIVEIS.reduce((s, n) => s + n.pedidos.length, 0)
        const feitosNoNivel = this.nivel.pedidos.length - this.restantes.length
        const feitos = antes + (completo ? this.nivel.pedidos.length : feitosNoNivel)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((feitos / totalGeral) * 100),
            score: Math.max(0, this.pontos),
            stage: this.nivel.numero,
            hits: this.acertos,
            errors: this.erros,
        })
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            this.pontos = cmd.points ?? this.pontos
        })
    }

    private onMute = (muted: boolean) => { this.mudo = muted }

    /* ═══════════════════════════════════════════════════════ áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.mudo) return null
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
        osc.connect(g); g.connect(ctx.destination)
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        osc.start(); osc.stop(ctx.currentTime + dur)
    }

    private playAcerto() {
        [660, 880].forEach((f, i) =>
            this.time.delayedCall(i * 90, () => this.playTone(f, 0.14, 'triangle', 0.08)))
    }
    private playErro() { this.playTone(180, 0.22, 'square', 0.07) }
    /** "Ainda não" — dois tiques iguais, nada de bronca. */
    private playAguarde() {
        [600, 600].forEach((f, i) =>
            this.time.delayedCall(i * 130, () => this.playTone(f, 0.06, 'sine', 0.05)))
    }
    private playAviso() { this.playTone(420, 0.16, 'triangle', 0.06) }
    /**
     * A barra entrou na faixa crítica.
     *
     * Um tique curto, e SÓ UM: a barra já pulsa sozinha, e o som aqui é
     * reforço, não alarme. Um alarme repetido em cima de uma criança que está
     * pensando é a forma mais rápida de fazer ela parar de pensar.
     */
    private playTicTac() { this.playTone(880, 0.06, 'sine', 0.05) }
    /** A peça vagou. */
    private playLivre() { this.playTone(760, 0.09, 'sine', 0.05) }
    /** Um programa fechou: um tom que desce, como uma tela apagando. */
    private playFechar() {
        [520, 330].forEach((f, i) =>
            this.time.delayedCall(i * 80, () => this.playTone(f, 0.12, 'sine', 0.06)))
    }
    /** A troca de atendido: um deslize curto, sem peso — trocar é de graça. */
    private playTrocar() { this.playTone(520, 0.08, 'sine', 0.05) }
    private playTravou() {
        [392, 294, 196].forEach((f, i) =>
            this.time.delayedCall(i * 160, () => this.playTone(f, 0.32, 'sine', 0.08)))
    }
}
