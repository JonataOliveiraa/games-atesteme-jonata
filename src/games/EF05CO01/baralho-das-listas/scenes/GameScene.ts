import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES, novoCuringa, tempoDoCaso } from '../data/levels'
import { C, TINTA } from '../data/theme'
import { HUD, OBJETIVO, TRILHO, VIZINHOS, FOCO } from '../data/layout'
import {
    cartaDoPasso, posicaoCerta, rotuloDe, vizinhosDaCarta, vizinhosDoGap,
    vizinhosNaBusca, ROTULO_FOCO,
    type Caso, type CaseState, type Level, type Passo,
} from '../types'

import { formatTime } from '../../../../shared/hud/createTimeBar'
import {
    createMesa, createHud, createObjetivo, createTrilho, createVizinhos,
    createFoco, createBalao, createPersonagem, createBigButton,
    type Balao, type BigButton, type Foco, type Hud, type Objetivo,
    type Personagem, type Trilho, type Vizinhos,
} from './effects'

const GAME_ID = 'baralho-das-listas'

const POINTS = {
    /** Caso resolvido. */
    caso: 25,
    /**
     * E sem gastar ação à toa.
     *
     * É o "pontuação considera ordem preservada e número de ações" do briefing.
     * Sem este bônus, tentar espaço por espaço até acertar valeria o mesmo que
     * localizar a posição — e localizar a posição é o que a habilidade pede.
     */
    eficiente: 10,
    erro: -5,
} as const

export class GameScene extends Phaser.Scene {

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private caseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private state: CaseState = 'jogando'
    private locked = false
    private ended = false

    /** Todo callback atrasado captura este valor e desiste se ele mudou. */
    private gen = 0

    /* ── o caso em andamento ───────────────────────────────────────── */

    private passoIdx = 0
    /** Quantas ações a criança gastou neste caso, erradas incluídas. */
    private acoes = 0
    /** Busca linear: até onde já conferiu. */
    private buscaIdx = 0
    /** Quantos casos foram resolvidos no número mínimo de ações. */
    private eficientes = 0

    /* ── o relógio ─────────────────────────────────────────────────── */

    /** Soma dos tempos de todos os casos, para o relatório de fim de nível. */
    private tempoTotal = 0
    private relogioLigado = false

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private objetivo!: Objetivo
    private vizinhos!: Vizinhos
    private personagem!: Personagem
    /**
     * A coluna da direita e a fala da menina são MÓVEIS DA TELA.
     *
     * Antes as duas eram descartáveis — a carta na mão nascia e morria a cada
     * passo, e o aviso era uma faixa que passava voando. O resultado era uma
     * tela em que metade das coisas aparecia e sumia, e nada tinha endereço
     * fixo. Agora as duas nascem com a cena e só trocam de conteúdo.
     */
    private foco!: Foco
    private balao!: Balao

    /* ── o que nasce e morre a cada caso ───────────────────────────── */

    private trilho?: Trilho
    private botao?: BigButton
    /** A tela de "tempo esgotado". Fica guardada porque o botão dela a fecha. */
    private telaPerdeu?: LevelCompleteHandle

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
    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.caseIdx = Phaser.Math.Clamp(
            data?.phase ?? 0, 0, LEVELS[this.levelIdx].cases.length - 1,
        )
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.isMuted = false
        this.state = 'jogando'
        this.locked = false
        this.ended = false
        this.gen = 0
        this.passoIdx = 0
        this.acoes = 0
        this.buscaIdx = 0
        this.eficientes = 0
        this.tempoTotal = 0
        this.relogioLigado = false
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        // a mesa muda no Nível 3; se `bg-table-2` não estiver na pasta, o
        // `createMesa` cai de volta na mesa 1 sozinho
        createMesa(this, this.level.level >= 3 ? 'bg-table-2' : 'bg-table-1')

        this.hud = createHud(this, {
            onHelp: () => this.replayTutorial(),
            onDanger: () => this.playTempoCurto(),
            onEmpty: () => this.perderPorTempo(),
        })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)
        this.hud.tempo.reset(tempoDoCaso(this.caso))
        this.hud.tempo.setRunning(false)

        this.objetivo = createObjetivo(this)
        this.vizinhos = createVizinhos(this)
        this.personagem = createPersonagem(this)
        this.foco = createFoco(this)
        this.balao = createBalao(this)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de um caso qualquer.
        void this.playCase(this.caseIdx === 0)
    }

    /**
     * O relógio anda sozinho, e só quando há o que cronometrar.
     *
     * A condição é lida do estado em vez de guardada numa flag própria: assim
     * é impossível o cronômetro continuar correndo durante um tutorial, uma
     * animação de inserção ou a tela de fim de nível — situações em que a
     * criança não está decidindo nada e seria injusto contar o tempo dela.
     */
    update(_time: number, delta: number) {
        if (!this.hud) return
        const deveContar = this.state === 'jogando' && !this.locked && !this.ended

        // `setRunning` repinta, então só é chamado quando o estado MUDA; o
        // `tick` vai todo frame e a barra ignora sozinha enquanto parada
        if (deveContar !== this.relogioLigado) {
            this.relogioLigado = deveContar
            this.hud.tempo.setRunning(deveContar)
        }
        this.hud.tempo.tick(delta)
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
    private get passo(): Passo { return this.caso.passos[this.passoIdx] }

    private gastarAcao() {
        this.acoes += 1
        this.objetivo.setAcoes(this.acoes, this.caso.acoesMinimas)
    }

    /**
     * Como a carta do passo se chama NA TELA.
     *
     * `passo.valor` é 11 para o valete, e o baralho desenha "J". As frases
     * saíam com "procure o 11" enquanto a criança olhava para um J — um número
     * que não existia em carta nenhuma da mesa.
     */
    private get nomeAlvo(): string {
        const c = cartaDoPasso(this.passo, this.trilho?.lista() ?? [])
        return c ? rotuloDe(c) : `${this.passo.valor ?? ''}`
    }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearPalco() {
        this.trilho?.destroy(); this.trilho = undefined
        this.botao?.destroy(); this.botao = undefined
        this.telaPerdeu?.destroy(); this.telaPerdeu = undefined
        this.foco?.esvaziar()
    }

    private async playCase(withTutorial: boolean) {
        const gen = ++this.gen

        /*
         * `locked` é estado de MOMENTO, não de caso. Sem zerar aqui, o caso que
         * termina bem deixa a trava ligada e o seguinte monta a tela inteira
         * sem aceitar um toque.
         */
        this.locked = false
        this.passoIdx = 0
        this.acoes = 0
        this.buscaIdx = 0
        this.clearPalco()

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.tempo.reset(tempoDoCaso(this.caso))
        this.objetivo.setAcoes(0, this.caso.acoesMinimas)
        this.personagem.setPose('pensando')
        this.emitCheckpoint()

        /*
         * AS CARTAS ENTRAM ANTES DO TUTORIAL.
         *
         * O tutorial recorta a tela e aponta o balão para o recorte. Rodando
         * primeiro, ele recortaria trilho vazio e falaria de cartas que ainda
         * não existem.
         */
        this.trilho = createTrilho(this, {
            cartas: this.caso.lista.map(c => ({ ...c })),
            onCarta: i => void this.onCarta(i),
            onEspaco: g => void this.onEspaco(g),
        })
        this.abrirPasso(0)

        if (withTutorial) this.locked = true

        await this.objetivo.show(this.passo.objetivo)
        if (gen !== this.gen) return

        if (!withTutorial) return

        const steps = this.buildTutorialSteps()
        if (!steps.length) { this.locked = false; return }

        this.runTutorial(steps, false, () => { })
    }

    /**
     * Prepara a tela para um passo.
     *
     * Cada verbo liga uma coisa diferente: inserir liga os ESPAÇOS entre as
     * cartas e põe a carta na mão; remover, substituir e buscar ligam as
     * CARTAS. Nunca os dois ao mesmo tempo — é o que faz um toque no trilho ter
     * um significado só.
     */
    private abrirPasso(i: number) {
        this.passoIdx = i
        this.state = 'jogando'
        this.buscaIdx = 0
        this.botao?.destroy(); this.botao = undefined

        const passo = this.passo
        const t = this.trilho
        if (!t) return

        t.destacarCarta(null)
        t.apontar(null)

        /*
         * A COLUNA DA DIREITA MOSTRA A CARTA DO PASSO. SEMPRE.
         *
         * Era o buraco do Nível 2: procurar o 7 era procurar uma palavra escrita
         * na faixa de cima, contra seis cartas desenhadas embaixo. Comparar
         * desenho com desenho é o que uma criança de 5º ano faz de olho fechado;
         * comparar desenho com número lembrado é outro exercício, e não é este.
         */
        const alvo = cartaDoPasso(passo, t.lista())
        if (alvo) this.foco.mostrar(alvo, ROTULO_FOCO[passo.verbo])
        else this.foco.esvaziar()

        // e a dica do passo, que até agora era dado morto no arquivo de casos,
        // finalmente tem onde morar
        this.balao.dizer(passo.dica, TINTA.fala)

        if (passo.verbo === 'inserir') {
            t.setEspacos(true)
            t.setCartasAtivas(false)
            // a mão ainda não tem vizinhos: as três casas nascem vazias
            this.vizinhos.set({ alvo: passo.carta })
            return
        }

        t.setEspacos(false)
        this.vizinhos.set({})

        if (passo.verbo !== 'buscar') {
            void t.virarTodas(false)
            t.setCartasAtivas(true)
            return
        }

        /*
         * ── A BUSCA ACONTECE COM AS CARTAS DE COSTAS ─────────────────────
         *
         * Com tudo virado para cima a criança VIA o 7 e o jogo mandava conferir
         * uma de cada vez mesmo assim, recusando o toque fora da vez com uma
         * bronca. Do lado de cá isso chama "acesso sequencial"; do lado de lá é
         * proibir de tocar no que está bem ali — e era isso, e não o tutorial,
         * que fazia o Nível 2 não ter sentido.
         *
         * De costas, virar uma de cada vez deixa de ser regra e passa a ser a
         * única coisa possível. E só a carta da vez aceita toque: não existe
         * jeito de errar a ordem, então não existe bronca sobre a ordem.
         *
         * E as cartas só ficam tocáveis DEPOIS de terminarem de virar: um toque
         * durante a virada dispararia a animação de revelar por cima da de
         * esconder, e a carta ficaria com `scaleX` preso em zero — invisível e
         * tocável, no meio da lista.
         */
        const gen = this.gen
        t.setCartasAtivas(false)
        void t.virarTodas(true).then(() => {
            if (gen !== this.gen || this.trilho !== t) return
            t.setCartasAtivas(true, 0)
            t.apontar(0)
        })

        /*
         * O botão NÃO TEM nasce ligado, e é essa a lição.
         *
         * Se ele só acendesse depois de conferir a lista inteira, o próprio
         * botão entregaria a resposta — bastaria esperar ele acender. Ligado
         * desde o começo, dizer "não tem" cedo demais é uma ação errada com
         * consequência, e a criança aprende que só dá para afirmar que algo
         * não está depois de olhar tudo.
         */
        /*
         * O botão é da cor do METAL da interface, e não amarelo.
         *
         * Amarelo já quer dizer O ESPAÇO ONDE UMA CARTA ENTRA. Um botão amarelo
         * embaixo da carta procurada dizia, sem querer, "encaixe aqui" — o
         * contrário do que ele faz. Latão é a cor da moldura, da pílula do nível
         * e do `?`: a família dos controles.
         */
        this.botao = createBigButton(this, {
            x: FOCO.cx, y: FOCO.botaoY, w: FOCO.botaoW, h: FOCO.botaoH,
            label: 'NÃO TEM', tone: C.latao, breathe: false,
            onClick: () => void this.onNaoTem(),
        })
    }

    /* ═══════════════════════════════════════════════════ os espaços */

    private async onEspaco(gap: number) {
        if (this.state !== 'jogando' || this.locked || this.ended) return
        const passo = this.passo
        const carta = passo.carta
        const t = this.trilho
        if (passo.verbo !== 'inserir' || !carta || !t) return

        const lista = t.lista()
        this.gastarAcao()

        if (gap !== posicaoCerta(lista, carta.valor)) {
            /*
             * O erro mostra os vizinhos DAQUELE espaço.
             *
             * É a explicação mais curta possível: a criança vê "8 ← 6 → 10" e
             * entende sozinha que o 6 não cabe entre o 8 e o 10. Uma frase
             * genérica de "tente de novo" faria ela chutar o próximo espaço.
             */
            const v = vizinhosDoGap(lista, gap)
            this.vizinhos.set({ ...v, alvo: carta })
            this.errors += 1
            this.points += POINTS.erro
            this.playErro()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.erro, stage: this.level.level,
            })
            this.emitCheckpoint()

            t.destacarEspaco(gap)
            this.balao.dizer(
                this.porQueNaoCabe(carta.valor, v.anterior?.valor, v.seguinte?.valor),
                TINTA.alerta,
            )
            await t.recusarEspaco(gap)
            return
        }

        this.locked = true
        this.playInserir()
        t.destacarEspaco(null)

        /*
         * A carta some da coluna EXATAMENTE quando a cópia dela levanta voo.
         *
         * Antes a mão só era destruída depois de a animação inteira acabar, e
         * durante um segundo havia duas cartas iguais na tela — a que voava e a
         * que continuava parada no canto.
         */
        const origem = this.foco.pos()
        await t.inserir(gap, carta, origem, () => this.foco.esvaziar())

        this.vizinhos.set(vizinhosDaCarta(t.lista(), gap))
        t.destacarCarta(gap)
        void this.passoConcluido()
    }

    /**
     * "O 6 não fica entre o 8 e o 10." — com as pontas tratadas.
     *
     * Sem o "Aqui não:" da versão anterior: a fenda já tremeu, a carta já
     * voltou, e a frase não precisa gastar duas palavras repetindo o que o
     * movimento disse.
     */
    private porQueNaoCabe(v: number, antes?: number, depois?: number): string {
        if (antes === undefined) return `O ${v} é maior que o ${depois}.`
        if (depois === undefined) return `O ${v} é menor que o ${antes}.`
        return `O ${v} não fica entre o ${antes} e o ${depois}.`
    }

    /* ═══════════════════════════════════════════════════════ as cartas */

    private async onCarta(i: number) {
        if (this.state !== 'jogando' || this.locked || this.ended) return
        const t = this.trilho
        if (!t) return
        const passo = this.passo
        const lista = t.lista()
        const carta = lista[i]
        if (!carta) return

        if (passo.verbo === 'buscar') { await this.onBuscar(i); return }

        if (passo.verbo === 'remover' || passo.verbo === 'substituir') {
            this.gastarAcao()
            this.vizinhos.set(vizinhosDaCarta(lista, i))

            if (carta.valor !== passo.valor) {
                this.errors += 1
                this.points += POINTS.erro
                this.playErro()
                runtimeGameBridge.emit({
                    type: 'WRONG_ANSWER', gameId: GAME_ID,
                    pointsEarned: POINTS.erro, stage: this.level.level,
                })
                this.emitCheckpoint()
                this.balao.dizer(
                    `Essa é o ${rotuloDe(carta)}. Procure o ${this.nomeAlvo}.`,
                    TINTA.alerta,
                )
                await t.recusar(i)
                return
            }

            this.locked = true
            if (passo.verbo === 'remover') {
                this.playRemover()
                await t.remover(i)
            } else {
                this.playTrocar()
                await t.substituir(i, novoCuringa())
            }

            // ainda sobrou alguma carta daquele valor? o passo continua
            const resta = t.lista().some(c => c.naipe !== 'coringa' && c.valor === passo.valor)
            if (resta) {
                this.vizinhos.set({})
                this.balao.dizer(`Ainda tem outro ${this.nomeAlvo}.`, TINTA.atencao)
                this.locked = false
                this.state = 'jogando'
                return
            }
            void this.passoConcluido()
        }
    }

    /**
     * A busca é LINEAR: vira uma, vê o que é, vira a próxima.
     *
     * Não há mais o que recusar — só a carta da vez tem zona de toque. Numa
     * lista não existe "ir direto na quarta": para chegar na quarta é preciso
     * passar pela primeira, e agora isso não é uma regra escrita, é o formato
     * do tabuleiro.
     */
    private async onBuscar(i: number) {
        const t = this.trilho
        const passo = this.passo
        if (!t || i !== this.buscaIdx) return

        const lista = t.lista()
        const carta = lista[i]
        this.locked = true
        this.gastarAcao()
        this.vizinhos.set(vizinhosNaBusca(lista, i))

        if (carta.valor === passo.valor && carta.naipe !== 'coringa') {
            this.playAchou()
            t.apontar(null)
            t.setCartasAtivas(false)
            // a fala vem DEPOIS da virada: dizer "achei" antes de a carta abrir
            // entrega o final e tira da criança o momento que ela ganhou
            await t.revelar(i, true)
            this.balao.dizer(`Achei o ${this.nomeAlvo}!`, TINTA.ok)
            void this.passoConcluido()
            return
        }

        this.playConferir()
        await t.revelar(i, false)
        // curta de propósito: ela troca a cada toque, e frase que troca a cada
        // toque nunca chega a ser lida se for longa
        this.balao.dizer(`${rotuloDe(carta)}. Não é o ${this.nomeAlvo}.`, TINTA.fala)

        this.buscaIdx += 1
        const acabou = this.buscaIdx >= lista.length

        if (acabou) {
            t.apontar(null)
            t.setCartasAtivas(false)
            this.balao.dizer(`Virei todas. Nenhum ${this.nomeAlvo}.`, TINTA.atencao)
        } else {
            t.setCartasAtivas(true, this.buscaIdx)
            t.apontar(this.buscaIdx)
        }
        this.locked = false
    }

    private async onNaoTem() {
        if (this.state !== 'jogando' || this.locked || this.ended) return
        const t = this.trilho
        const passo = this.passo
        if (!t || passo.verbo !== 'buscar') return

        /*
         * DIZER "NÃO TEM" NÃO É UMA AÇÃO — É A RESPOSTA.
         *
         * Contar o botão como ação faria o caminho ótimo da busca vazia gastar
         * seis ações num caso cujo mínimo são cinco cartas conferidas: o
         * contador nasceria estourado e o bônus de eficiência seria impossível
         * de ganhar fazendo tudo certo. Só a conclusão ERRADA gasta ação, e aí
         * gasta com razão.
         */
        if (this.buscaIdx < t.lista().length) {
            this.gastarAcao()
            this.errors += 1
            this.points += POINTS.erro
            this.playErro()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.erro, stage: this.level.level,
            })
            this.emitCheckpoint()
            this.balao.dizer('Ainda tem carta virada. Vire todas.', TINTA.alerta)
            return
        }

        if (passo.existe === false) {
            this.locked = true
            this.playAchou()
            void this.passoConcluido()
            return
        }

        this.gastarAcao()
        this.errors += 1
        this.points += POINTS.erro
        this.playErro()
        this.balao.dizer(`O ${this.nomeAlvo} estava lá!`, TINTA.alerta)
    }

    /* ═══════════════════════════════════════════════ passo concluído */

    private async passoConcluido() {
        const gen = this.gen
        this.locked = true
        this.trilho?.setEspacos(false)
        this.trilho?.setCartasAtivas(false)
        this.trilho?.apontar(null)
        this.botao?.destroy(); this.botao = undefined
        this.personagem.setPose('feliz')
        this.playPasso()

        const ultimo = this.passoIdx >= this.caso.passos.length - 1

        /*
         * Fim da busca: as cartas que sobraram se abrem.
         *
         * É o fecho da lição — a criança vê a lista inteira e confere com os
         * próprios olhos que não tinha mesmo, ou que a que ela achou era a
         * única. A que ela virou continua apagada, com o visto verde.
         */
        if (this.passo.verbo === 'buscar') await this.trilho?.virarTodas(false)
        if (gen !== this.gen) return

        /*
         * Quando ainda há passo pela frente, a menina comenta O QUE ACABOU DE
         * ACONTECER. Quando era o último, ela cala: logo vem a frase de fecho do
         * caso, e duas falas empilhadas seriam exatamente o defeito das faixas.
         */
        if (!ultimo) this.balao.dizer(this.linhaDoPasso(), TINTA.ok)

        // 1500 e não 900: a frase acima precisa ser lida por quem lê devagar
        await FX.wait(this, ultimo ? 900 : 1500)
        if (gen !== this.gen) return

        if (!ultimo) {
            this.personagem.setPose('pensando')
            this.abrirPasso(this.passoIdx + 1)
            this.locked = false
            void this.objetivo.show(this.passo.objetivo)
            return
        }

        void this.fecharCaso()
    }

    /** O que a menina diz quando um passo fecha e ainda vem outro. Curto. */
    private linhaDoPasso(): string {
        const nome = this.nomeAlvo
        switch (this.passo.verbo) {
            case 'inserir': return `O ${nome} entrou no lugar certo.`
            case 'remover': return `O ${nome} saiu. Os vizinhos se juntaram.`
            case 'substituir': return `Curinga no lugar do ${nome}.`
            default: return this.passo.existe === false
                ? 'Não tinha mesmo.'
                : `Achei o ${nome}!`
        }
    }

    private async fecharCaso() {
        const gen = this.gen
        this.state = 'solved'
        this.locked = true
        this.hud.tempo.setRunning(false)
        this.relogioLigado = false
        this.tempoTotal += this.hud.tempo.elapsed()

        const eficiente = this.acoes <= this.caso.acoesMinimas
        if (eficiente) this.eficientes += 1
        const ganho = POINTS.caso + (eficiente ? POINTS.eficiente : 0)
        this.hits += 1
        this.points += ganho

        this.playResolvido()
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: ganho, stage: this.level.level,
        })
        this.emitCheckpoint()

        void this.personagem.comemorar()
        void FX.sparks(this, TRILHO.cx, TRILHO.cy, { color: C.espaco, count: 28, spread: 300 })
        void FX.flash(this, C.white, { duration: 240, peak: 0.14 })

        if (eficiente) this.objetivo.marcarEficiente()
        this.balao.dizer(this.caso.successLine, TINTA.ok)

        await FX.wait(this, 2600)
        if (gen !== this.gen) return

        this.caseIdx += 1
        if (this.caseIdx >= this.level.cases.length) {
            void this.endLevel()
            return
        }
        void this.playCase(false)
    }

    /* ═══════════════════════════════════════════════ derrota por tempo */

    /**
     * A BARRA ZEROU.
     *
     * ── O QUE A PLATAFORMA FAZ, E O QUE ELA NÃO FAZ ──────────────────────
     *
     * O contrato tem um evento `GAME_OVER` (e o `START_GAME` até carrega
     * `lives`), mas ele só NOTIFICA: nada do lado de fora reinicia caso,
     * desconta vida ou fecha o jogo. Quem faz a derrota acontecer é esta cena.
     * O evento é o aviso; o mecanismo é este método.
     *
     * ── PERDER O CASO, NÃO O NÍVEL ───────────────────────────────────────
     *
     * A derrota devolve a criança ao MESMO caso, com a lista de novo no
     * começo e a barra cheia. Perder o nível inteiro — ou o jogo — transformaria
     * um problema de ritmo em castigo, e brigaria com a regra da casa: errar
     * trava até entender, sem empurrar ninguém para a frente. Quem zera a barra
     * é quem travou de verdade, e para essa criança remontar o caso com a tela
     * limpa costuma ser mais útil do que continuar encarando o mesmo tabuleiro.
     *
     * Não há limite de tentativas, e os pontos já ganhos ficam.
     */
    private perderPorTempo() {
        if (this.ended || this.state !== 'jogando') return

        // mata tudo que estava no ar: animação pendente, `await` de passo,
        // qualquer callback atrasado que fosse mexer num tabuleiro que já era
        const gen = ++this.gen
        this.state = 'perdido'
        this.locked = true
        this.relogioLigado = false

        this.hud.tempo.setRunning(false)
        this.hud.setHelpEnabled(false)
        this.tempoTotal += this.hud.tempo.elapsed()

        this.trilho?.setEspacos(false)
        this.trilho?.setCartasAtivas(false)
        this.trilho?.apontar(null)
        this.botao?.destroy(); this.botao = undefined

        this.personagem.setPose('pensando')
        this.balao.dizer('O tempo acabou. Vamos de novo?', TINTA.alerta)
        this.playPerdeu()

        runtimeGameBridge.emit({
            type: 'GAME_OVER', gameId: GAME_ID, stage: this.level.level,
        })
        this.emitCheckpoint()

        // um lampejo rosa e nada mais: a tela do `showLevelComplete` já escurece
        // tudo, e uma vinheta por cima ficaria pendurada na cena para sempre
        void FX.flash(this, C.alerta, { duration: 360, peak: 0.16 })

        this.telaPerdeu = showLevelComplete(this, {
            title: 'O tempo acabou!',
            subtitle: `Caso ${this.caseIdx + 1} de ${this.level.cases.length}  ·  Nível ${this.level.level}`,
            // a dica do nível, e não uma bronca: a criança volta sabendo mais
            // do que quando entrou
            message: this.level.tip,
            accent: C.alerta,
            panelColor: C.creme,
            overlayColor: C.ink,
            progress: { total: this.level.cases.length, current: this.caseIdx },
            buttons: [
                {
                    label: 'Tentar de novo',
                    color: C.ok,
                    onClick: () => {
                        if (gen !== this.gen) return
                        this.telaPerdeu?.destroy()
                        this.telaPerdeu = undefined
                        this.hud.setHelpEnabled(true)
                        void this.playCase(false)
                    },
                },
                {
                    label: 'Escolher jogo',
                    color: C.madeira,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.gen += 1
        this.hud.setProgress(this.level.cases.length, this.level.cases.length)
        this.hud.setHelpEnabled(false)
        this.hud.tempo.setRunning(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null
        const total = this.level.cases.length

        if (next) {
            showLevelComplete(this, {
                title: 'Baralho em ordem!',
                subtitle: `Nível ${lvl} concluído  ·  ${formatTime(this.tempoTotal)}`,
                message: this.level.objective,
                accent: C.espaco,
                panelColor: C.creme,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Separando o próximo monte...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.espaco, C.vizinho, C.ok, C.creme] })
        showLevelComplete(this, {
            title: 'Mestre das listas!',
            subtitle: `${this.eficientes} de ${total} no número mínimo de ações  ·  ${formatTime(this.tempoTotal)}`,
            message: this.eficientes >= total
                ? 'Você não gastou nenhuma ação à toa: em todos os casos localizou a posição antes de mexer. É isso que separa organizar de tentar.'
                : 'Inserir, tirar, trocar e procurar mudam a lista — e a ordem tem que sobreviver a todas elas. Localizar a posição antes de mexer é o que economiza ação.',
            accent: C.ok,
            panelColor: C.creme,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.madeira,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * O tutorial MOSTRA O TOQUE — e toque é bater no lugar, não arrastar até ele.
     *
     * ── O QUE ESTAVA ERRADO ──────────────────────────────────────────────
     *
     * O dedo saía da carta na mão e VIAJAVA até a fenda, num traço contínuo de
     * setecentos pixels. Isso é o desenho universal de arrastar. A criança
     * tentava arrastar, o jogo não aceita arrastar — ele aceita um toque na
     * carta e um toque no destino — e o tutorial passava a ser a instrução
     * errada, entregue com muita clareza.
     *
     * Agora todo ponteiro é `tap`: fica PARADO em cima de um alvo só e bate,
     * com uma ondinha saindo dali. Um gesto por passo, e o gesto é o que o jogo
     * espera. As coordenadas saem do trilho de verdade (`posDoEspaco`,
     * `posDaCarta`), então o dedo aponta para onde a carta está AGORA.
     *
     * Todo passo fixa `balloonX`/`balloonY`. O trilho atravessa a tela na
     * horizontal, então o balão dele só pode ir para BAIXO; a coluna da direita
     * empurra o balão dela para a esquerda.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const t = this.trilho
        const passo = this.passo

        const trilhoSpot = {
            x: TRILHO.cx, y: TRILHO.cy,
            w: TRILHO.w + 20, h: TRILHO.h + 20,
        }
        const vizinhosSpot = {
            x: VIZINHOS.x + VIZINHOS.w / 2, y: VIZINHOS.cy,
            w: VIZINHOS.w + 24, h: VIZINHOS.h + 24,
        }
        const focoSpot = {
            x: FOCO.cx, y: FOCO.cardCY,
            w: FOCO.cardW + 56, h: FOCO.cardH + 56,
        }
        const objetivoSpot = {
            x: OBJETIVO.x + OBJETIVO.w / 2, y: OBJETIVO.y + OBJETIVO.h / 2,
            w: OBJETIVO.w + 16, h: OBJETIVO.h + 20,
        }

        /** O dedo parado em cima de UMA coisa, batendo nela. */
        const tocar = (x: number, y: number) => ({
            fromX: x, fromY: y, toX: x, toY: y, tap: true,
        })

        if (this.level.level === 2) {
            const p0 = t?.posDaCarta(0) ?? { x: 400, y: TRILHO.cy }
            return [
                {
                    text: 'Procure esta carta.',
                    shape: 'rect', ...focoSpot, balloonX: 470, balloonY: 470,
                    pointer: tocar(FOCO.cx, FOCO.cardCY),
                },
                {
                    text: 'As cartas estão VIRADAS. Ninguém sabe onde ela está.',
                    shape: 'rect', ...trilhoSpot, balloonX: 640, balloonY: 520,
                },
                {
                    text: 'Toque na carta levantada para virar. Depois na próxima.',
                    shape: 'rect', x: p0.x, y: p0.y,
                    w: TRILHO.cardW + 44, h: TRILHO.cardH + 44,
                    balloonX: 700, balloonY: 520,
                    pointer: tocar(p0.x, p0.y),
                },
                {
                    text: 'Virou todas e não achou? Só então aperte aqui.',
                    shape: 'rect', x: FOCO.cx, y: FOCO.botaoY,
                    w: FOCO.botaoW + 50, h: FOCO.botaoH + 50,
                    balloonX: 470, balloonY: 470,
                    pointer: tocar(FOCO.cx, FOCO.botaoY),
                },
            ]
        }

        if (this.level.level === 3) {
            return [
                {
                    text: 'Agora cada caso tem 2 ou 3 passos. A faixa de cima diz o passo de agora.',
                    shape: 'rect', ...objetivoSpot, balloonX: 640, balloonY: 400,
                },
                {
                    text: 'Cada passo acontece na lista que o anterior deixou.',
                    shape: 'rect', ...trilhoSpot, balloonX: 640, balloonY: 520,
                },
            ]
        }

        /* ── Nível 1: um toque por passo ─────────────────────────────── */
        const alvo = passo.carta && t
            ? t.posDoEspaco(posicaoCerta(t.lista(), passo.carta.valor))
            : { x: TRILHO.cx, y: TRILHO.cy }

        return [
            {
                text: 'Esta é a LISTA: em ordem, da menor para a maior.',
                shape: 'rect', ...trilhoSpot, balloonX: 640, balloonY: 520,
            },
            {
                text: 'Esta carta está na SUA MÃO. Ela precisa entrar na lista.',
                shape: 'rect', ...focoSpot, balloonX: 470, balloonY: 470,
                pointer: tocar(FOCO.cx, FOCO.cardCY),
            },
            {
                text: 'Toque na FENDA AMARELA onde ela cabe. Só uma serve.',
                shape: 'rect', ...trilhoSpot, balloonX: 640, balloonY: 520,
                pointer: tocar(alvo.x, alvo.y),
            },
            {
                text: 'Aqui embaixo: quem fica ANTES e quem fica DEPOIS.',
                // 225 e não 250: o botão "Próximo" nasce 46px abaixo do balão e
                // tem 58 de altura — a 250 ele pousava em cima do próprio painel
                // que o balão está explicando
                shape: 'rect', ...vizinhosSpot, balloonX: 640, balloonY: 225,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef05co01-l${this.level.level}`,
            once: !force,
            accent: C.espaco,
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
        if (this.state !== 'jogando') return

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

    /** O baque da carta na mesa. */
    private playInserir() { this.playTone(320, 0.1, 'triangle', 0.07) }
    private playRemover() { this.playTone(420, 0.12, 'sine', 0.06) }
    private playTrocar() { this.playTone(660, 0.1, 'triangle', 0.06) }
    /** A busca anda: um tique por carta conferida, sempre igual. */
    private playConferir() { this.playTone(540, 0.05, 'sine', 0.05) }
    private playAchou() { this.playTone(880, 0.14, 'sine', 0.09) }
    private playErro() { this.playTone(200, 0.2, 'square', 0.07) }
    /** A barra entrou na reta final: um tique só, para o olho ir até ela. */
    private playTempoCurto() { this.playTone(660, 0.07, 'sine', 0.05) }
    /**
     * A barra zerou.
     *
     * Dois tons descendo, e nada de sirene. Perder um caso aqui não é fracasso:
     * é o jogo dizendo "vamos recomeçar este com a cabeça fresca".
     */
    private playPerdeu() {
        [392, 294].forEach((f, i) =>
            this.time.delayedCall(i * 170, () => this.playTone(f, 0.3, 'sine', 0.08)))
    }
    private playPasso() { this.playTone(700, 0.12, 'sine', 0.08) }
    private playResolvido() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.12)))
    }
}
