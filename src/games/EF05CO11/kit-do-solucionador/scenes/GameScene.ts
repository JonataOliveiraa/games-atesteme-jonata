import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { CASA_POR_ID, H, HUD, NO_POR_ID, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import { LEVELS, existeRota, jogar, pontoDePlanta, trechosAoAlcance } from '../data/levels'
import { NAO_AVISA, ferramenta } from '../data/ferramentas'
import type { Dia, Ferramenta, LevelDef, Modo, Problema } from '../types'
import { createVila, type Vila } from './vila'
import { createCorrida, type Corrida } from './corrida'
import { createKit, type Kit } from './kit'
import { createFecho, type Fecho } from './fecho'
import { createAbertura, type Abertura } from './abertura'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'kit-do-solucionador'

interface Grab {
    x: number
    sx: number
    moved: boolean
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private diaIndex = 0
    private probIndex = 0
    private modo: Modo = 'abertura'
    private gen = 0

    private kitAtual: string[] = []
    private usadas: string[] = []
    private escolhida: string | null = null
    private errosNoProblema = 0
    private perdeuVidaNoProblema = false
    private solRestante = 0

    private score = 0
    private hits = 0
    private errors = 0
    private problemasFeitos = 0
    private totalProblemas = 0

    private grab: Grab | null = null
    private seguindo = false

    private vila!: Vila
    private corrida!: Corrida
    private kit!: Kit
    private fecho!: Fecho
    private abertura!: Abertura
    private hud!: Hud
    private audio!: Audio

    private moldura!: Phaser.GameObjects.Graphics
    private unsubPlatform?: () => void

    private get dia(): Dia {
        return this.level.dias[this.diaIndex]
    }

    private get problema(): Problema {
        return this.dia.problemas[this.probIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const numero = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length)
        this.level = LEVELS[numero - 1]

        this.diaIndex = 0
        this.probIndex = 0
        this.modo = 'abertura'
        this.kitAtual = []
        this.usadas = []
        this.escolhida = null
        this.errosNoProblema = 0
        this.perdeuVidaNoProblema = false
        this.solRestante = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.problemasFeitos = 0
        this.grab = null
        this.seguindo = false
        this.totalProblemas = this.level.dias.reduce((n, d) => n + d.problemas.length, 0)
    }

    create() {
        this.input.topOnly = true
        this.cameras.main.setBackgroundColor(C.ceu)
        this.cameras.main.setBounds(0, 0, WORLD.w, WORLD.h)

        this.audio = createAudio(this)
        this.vila = createVila(this)
        this.corrida = createCorrida(this)
        this.kit = createKit(this, {
            onPick: id => this.preverEscolha(id),
            onConfirm: () => void this.confirmar(),
        })
        this.fecho = createFecho(this)
        this.abertura = createAbertura(this)
        this.hud = createHud(this, {
            nivel: this.level.level,
            onHelp: () => this.replayTutorial(),
        })
        this.hud.setDias(this.level.dias.length, 0)

        this.moldura = this.add.graphics().setDepth(500).setScrollFactor(0)

        this.bindPan()
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
            size: 30,
            tint: C.coral,
            depth: 402,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.comecarDia(0)
    }

    private shutdownScene() {
        this.gen++
        this.corrida?.destroy()
        this.fecho?.destroy()
        this.abertura?.destroy()
        this.kit?.destroy()
        this.vila?.destroy()
        this.hud?.destroy()
        this.moldura?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────── a câmera e o dedo

    /**
     * Arrastar o mapa anda com a câmera, só no eixo x.
     *
     * A `panZone` fica embaixo de tudo, então carta, bifurcação e `?` roubam o
     * toque antes dela (`input.topOnly`). Enquanto o dedo arrasta, o cabeçalho
     * e o kit somem: o que importa naquele instante é para onde se está indo.
     */
    private bindPan() {
        this.vila.panZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.podeArrastar()) return
            this.grab = { x: pointer.x, sx: this.cameras.main.scrollX, moved: false }
        })

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.grab) return
            const dx = pointer.x - this.grab.x
            if (!this.grab.moved && Math.abs(dx) > 10) {
                this.grab.moved = true
                this.esconderInterface(true)
            }
            if (!this.grab.moved) return
            this.cameras.main.setScroll(this.grab.sx - dx, 0)
            this.vila.atualizarCeu(this.cameras.main.scrollX)
        })

        this.input.on('pointerup', () => {
            if (!this.grab) return
            const moved = this.grab.moved
            this.grab = null
            if (moved) this.esconderInterface(false)
        })
    }

    private podeArrastar() {
        return this.modo === 'lendo' || this.modo === 'travado' || this.modo === 'bifurcacao'
    }

    /**
     * O CABEÇALHO E AS VIDAS SÃO A MESMA FAIXA para quem olha, e somem juntos.
     *
     * As vidas moram fora do `hud` (quem as desenha é o `createLives`), e na
     * primeira versão disto elas ficavam boiando sozinhas em cima da vila
     * durante a abertura. `imediato` existe só para o primeiro quadro: tween de
     * 190 ms na hora de abrir o jogo É o piscado que a gente quer tirar.
     */
    private mostrarHud(v: boolean, imediato = false) {
        this.hud.setOculto(!v, imediato)
        const vidas = this.lives?.container
        if (!vidas) return
        this.tweens.killTweensOf(vidas)
        if (imediato) {
            vidas.setAlpha(v ? 1 : 0)
            return
        }
        this.tweens.add({ targets: vidas, alpha: v ? 1 : 0, duration: 190 })
    }

    private esconderInterface(v: boolean) {
        this.mostrarHud(!v)
        if (v) this.kit.descer()
        else if (this.modo === 'lendo' || this.modo === 'travado') {
            this.kit.subir()
            this.kit.setEnabled(true)
        }
    }

    /** Leva a câmera até um ponto do mundo, com folga nas bordas. */
    private olharPara(x: number, duracao = 600) {
        const alvo = Phaser.Math.Clamp(x - W / 2, 0, Math.max(0, WORLD.w - W))
        this.tweens.add({
            targets: this.cameras.main,
            scrollX: alvo,
            duration: duracao,
            ease: 'Cubic.easeInOut',
            onUpdate: () => this.vila.atualizarCeu(this.cameras.main.scrollX),
        })
    }

    update() {
        if (!this.seguindo) return
        const p = this.corrida.pos()
        if (!p) return
        const camera = this.cameras.main
        const alvo = Phaser.Math.Clamp(p.x - W / 2, 0, Math.max(0, WORLD.w - W))
        camera.setScroll(Phaser.Math.Linear(camera.scrollX, alvo, 0.08), 0)
        this.vila.atualizarCeu(camera.scrollX)
    }

    // ─────────────────────────────────────────────────────────── o dia

    /**
     * A ABERTURA, uma vez por nível, antes de qualquer regra.
     *
     * São três batidas, e nenhuma delas é opcional para quem chega sem saber de
     * nada: QUEM a criança é (a recadista da vila), ONDE ela está (um mapa de
     * 3600 px, do qual a tela mostra um terço) e O QUE ela vai fazer (escolher
     * no kit a coisa que ALCANÇA quem precisa saber).
     *
     * Antes daqui só existia a volta de câmera, com um cartaz escrito "A vila".
     * Dizia onde, e mais nada — e o primeiro minuto do jogo virava adivinhação.
     * Cada cartão sai com um toque, e a volta também.
     */
    private async apresentarVila() {
        const gen = this.gen
        const camera = this.cameras.main
        const fim = Math.max(0, WORLD.w - W)

        camera.setScroll(0, 0)
        this.vila.atualizarCeu(0)

        await this.abertura.cartao({
            titulo: 'Você é quem leva recado na vila.',
            linha: 'Quando chega uma notícia, é você que faz todo mundo saber dela — e ninguém pode ficar sem.',
            folha: 'ferramentas',
            frame: 3,
        })
        if (gen !== this.gen) return

        this.abertura.legenda('A vila tem doze casas, e ela não cabe na tela.')

        /*
         * O PULO PRECISA RESOLVER A PROMESSA ELE MESMO.
         *
         * `killTweensOf` mata o tween SEM chamar o `onComplete`, e a primeira
         * versão disto ficava esperando para sempre um `resolve` que nunca
         * vinha: quem pulasse a abertura travava o jogo na vila vazia. Agora o
         * `resolve` mora numa variável, e tanto o fim do tween quanto o dedo
         * chamam o mesmo.
         */
        let pulado = false
        let soltar: (() => void) | null = null

        const pular = this.add
            .zone(W / 2, H / 2, W, H)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(470)
            .setInteractive()
        pular.once('pointerdown', () => {
            pulado = true
            this.tweens.killTweensOf(camera)
            soltar?.()
        })

        await new Promise<void>(resolve => {
            let pronto = false
            soltar = () => {
                if (pronto) return
                pronto = true
                resolve()
            }
            this.tweens.add({
                targets: camera,
                scrollX: fim,
                duration: 2600,
                ease: 'Sine.easeInOut',
                onUpdate: () => this.vila.atualizarCeu(camera.scrollX),
                onComplete: () => soltar?.(),
            })
        })
        soltar = null

        pular.destroy()
        this.abertura.limparLegenda()
        if (gen !== this.gen) return
        if (!pulado) await FX.wait(this, 320)
        if (gen !== this.gen) return

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: camera,
                scrollX: 0,
                duration: pulado ? 320 : 1400,
                ease: 'Cubic.easeInOut',
                onUpdate: () => this.vila.atualizarCeu(camera.scrollX),
                onComplete: () => resolve(),
            })
        })
        if (gen !== this.gen) return

        await this.abertura.cartao({
            titulo: 'O Sr. Exagero traz um kit por dia.',
            linha: 'Escolha a coisa que ALCANÇA quem precisa saber. Nem sempre é a maior, e nem sempre é a mais moderna.',
            folha: 'exagero',
            frame: 0,
        })
    }

    private async comecarDia(index: number) {
        const gen = ++this.gen
        this.diaIndex = index
        this.kitAtual = [...this.dia.kit]
        this.usadas = []

        this.hud.setTitulo(this.dia.titulo)
        this.hud.setDias(this.level.dias.length, index)
        this.hud.mostrarSol(false)
        this.vila.apagarTudo()
        this.vila.limparRastro()

        /*
         * NADA DE INTERFACE ANTES DA VILA.
         *
         * A ordem aqui era: some o cabeçalho, roda a volta da vila, VOLTA o
         * cabeçalho, entra o kit com o Sr. Exagero — e aí o problema escondia
         * tudo de novo para fazer o zoom. Duas entradas e uma saída em três
         * segundos: era isso que piscava. Agora a interface entra UMA vez, e
         * entra depois de a criança já ter visto quem precisa saber.
         */
        this.mostrarHud(false, index === 0)
        this.kit.descer()

        if (index === 0) {
            await this.apresentarVila()
            if (gen !== this.gen) return
        }

        void this.comecarProblema(0)
    }

    /**
     * A ENTRADA DO PROBLEMA É VISTA, NÃO LIDA.
     *
     * Havia um painel de duas linhas com o rosto do vizinho, e ele parava o
     * jogo para ser lido. Saiu. No lugar: a câmera fecha um pouco no grupo de
     * quem precisa saber, abre de volta, e as casas acendem a porta UMA A UMA,
     * com o morador aparecendo e a luz caindo no chão. O que o problema pede
     * está nas casas, e aí a criança lê a vila, não o texto.
     *
     * É AQUI que a interface entra, e é a única vez no dia: o painel sobe e o
     * Sr. Exagero chega com o kit depois de as casas terem acendido.
     */
    private async comecarProblema(index: number) {
        const gen = ++this.gen
        this.probIndex = index
        this.errosNoProblema = 0
        this.perdeuVidaNoProblema = false
        this.escolhida = null

        const camera = this.cameras.main

        this.vila.apagarTudo()
        this.vila.limparRastro()
        this.vila.limparPreview()
        this.vila.esconderCirculo()
        this.vila.calar()
        this.vila.limparRecado()
        this.vila.fecharPergunta()
        this.hud.setBandeiras(this.dia.problemas.length, index, index)
        this.hud.mostrarSol(false)
        this.kit.limparEsmaecidos()
        this.kit.pararPulso()
        this.kit.selecionar(null)
        this.kit.descer()
        this.mostrarHud(false)

        /* O meio de quem precisa saber — nunca o canto do mundo. */
        const xs = this.problema.marcadas.map(id => CASA_POR_ID[id].x)
        const centro = (Math.min(...xs) + Math.max(...xs)) / 2

        camera.setZoom(1.14)
        camera.centerOn(centro, 372)
        this.vila.atualizarCeu(camera.scrollX)

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: camera,
                zoom: 1,
                duration: 1000,
                ease: 'Cubic.easeOut',
                onUpdate: () => {
                    camera.centerOn(centro, 372)
                    this.vila.atualizarCeu(camera.scrollX)
                },
                onComplete: () => resolve(),
            })
        })
        if (gen !== this.gen) return
        camera.setZoom(1)
        camera.centerOn(centro, 360)
        this.vila.atualizarCeu(camera.scrollX)

        await this.vila.apresentar(this.problema.marcadas, i => this.audio.casa(i))
        if (gen !== this.gen) return

        this.mostrarHud(true)
        this.kit.subir()

        /* No primeiro problema do dia, o kit ainda nem existe: ele chega agora. */
        if (index === 0) {
            this.audio.tec()
            await this.kit.montar(this.dia.kit, this.dia.falaExagero)
            if (gen !== this.gen) return
        }

        this.vila.recado(this.problema.fala)
        this.modo = 'lendo'
        this.kit.setEnabled(true)

        if (this.diaIndex === 0 && index === 0) this.runTutorial(false)
    }

    // ───────────────────────────────────── a previsão, e só depois a corrida

    /**
     * Tocar numa carta NÃO manda a ferramenta embora: desenha o círculo dela no
     * mapa, no tamanho de verdade, e acende o botão. A criança vê até onde
     * aquilo chega antes de gastar — que era a parte que faltava.
     */
    private preverEscolha(id: string) {
        if (this.modo !== 'lendo') return
        const f = ferramenta(id)
        this.audio.tec()
        this.escolhida = id
        this.kit.selecionar(id)
        this.vila.calar()
        /* A notícia do dia já foi lida: daqui em diante a pergunta é o alcance. */
        this.vila.limparRecado()

        const ponto = f.andar === 'planta' ? pontoDePlanta(f) : NO_POR_ID.p
        /* Quem anda pela estrada mostra tambem ATE ONDE o sol dela leva. */
        const caminho = f.andar === 'estrada' ? trechosAoAlcance(f.sol) : []
        this.vila.previewCirculo(ponto.x, ponto.y, f, caminho)
        this.olharPara(ponto.x, 420)
    }

    private async confirmar() {
        if (this.modo !== 'lendo' || !this.escolhida) return
        const gen = this.gen
        const id = this.escolhida
        const f = ferramenta(id)

        const aindaVem = this.dia.problemas.slice(this.probIndex + 1)
        const veredito = jogar(f, this.problema, this.kitAtual, aindaVem)

        if (veredito.tipo !== 'pode') {
            this.vila.limparPreview()
            this.kit.tremer(id)
            this.audio.trava()
            this.piscarMoldura(C.warn)

            if (veredito.tipo === 'naoAvisa') {
                this.kit.esmaecer(id)
                this.kit.selecionar(null)
                this.escolhida = null
                this.vila.falar(
                    '',
                    NAO_AVISA[id] ?? 'Isso não avisa ninguém sozinho.',
                    'aviso',
                    this.problema.vizinho,
                )
                this.cobrarErro()
                return
            }

            const orfao = this.dia.problemas.findIndex(p => p.id === veredito.para)
            this.hud.balancarBandeira(orfao)
            this.vila.falar(
                '',
                'Funciona! Mas ele é um só, e olha ali o dia que ainda vai precisar dele.',
                'aviso',
                this.problema.vizinho,
            )
            return
        }

        this.modo = 'correndo'
        this.kit.setEnabled(false)
        this.kit.selecionar(null)
        this.vila.calar()
        this.vila.limparPreview()
        this.kit.descer()
        this.hud.mostrarSol(true)
        this.seguindo = true
        await FX.wait(this, 280)
        if (gen !== this.gen) return

        const acesas = await this.corrida.rodar(f, this.problema.marcadas, {
            onAcende: (casa, indice) => {
                this.vila.acender(casa)
                this.audio.casa(indice)
            },
            onSol: (restante, total) => {
                this.solRestante = restante
                this.hud.setSol(restante, total)
                this.audio.sol()
            },
            onPos: (x, y, raio) => {
                this.vila.circulo(x, y, raio)
                this.vila.somaRastro(x, y)
            },
            pedirRumo: opcoes =>
                new Promise(resolve => {
                    this.modo = 'bifurcacao'
                    this.seguindo = false
                    this.vila.perguntar(opcoes, chave => {
                        this.vila.fecharPergunta()
                        this.modo = 'correndo'
                        this.seguindo = true
                        this.audio.tec()
                        resolve(chave)
                    })
                }),
            onAndando: (fer, andando) => {
                if (fer.andar === 'voo') this.audio.drone(andando)
                else if (fer.id === 'carro') this.audio.motor(andando)
                else if (fer.id === 'bicicleta') this.audio.pedal()
                else this.audio.passo()
            },
        })

        if (gen !== this.gen) return
        this.seguindo = false
        this.audio.motor(false)
        this.audio.drone(false)

        const escuras = this.problema.marcadas.filter(x => !acesas.has(x))
        if (!escuras.length) await this.acertou(f)
        else await this.falhou(f, escuras)
    }

    private async acertou(f: Ferramenta) {
        const gen = this.gen
        this.modo = 'fechando'
        this.escolhida = null
        this.audio.resolveu()
        this.piscarMoldura(C.ok)
        this.vila.falar('', 'Todo mundo soube!', 'bom', this.problema.vizinho)

        this.score += this.errosNoProblema === 0 ? 10 : 5
        this.hits++
        this.problemasFeitos++

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            stage: this.level.level,
            pointsEarned: this.errosNoProblema === 0 ? 10 : 5,
        })

        await FX.wait(this, 1000)
        if (gen !== this.gen) return

        this.corrida.limpar()
        this.vila.esconderCirculo()
        this.vila.calar()
        this.kit.subir()

        if (f.gasta) {
            await this.kit.gastar(f.id)
            this.kitAtual = this.kitAtual.filter(x => x !== f.id)
            this.usadas.push(f.id)
        } else {
            this.kit.piscar(f.id)
            if (!this.usadas.includes(f.id)) this.usadas.push(f.id)
        }
        if (gen !== this.gen) return

        this.hud.setBandeiras(this.dia.problemas.length, this.probIndex, this.probIndex + 1)
        this.emitCheckpoint()

        await FX.wait(this, 420)
        if (gen !== this.gen) return

        if (this.probIndex + 1 < this.dia.problemas.length) {
            void this.comecarProblema(this.probIndex + 1)
            return
        }
        void this.terminarDia()
    }

    private async falhou(f: Ferramenta, escuras: string[]) {
        const gen = this.gen
        this.modo = 'travado'
        this.escolhida = null
        this.errosNoProblema++
        this.audio.trava()
        this.piscarMoldura(C.warn)
        this.vila.congelarRastro()
        this.vila.esconderCirculo()

        /* Olha quem ficou no escuro: a câmera vai até lá antes de qualquer texto. */
        const xs = escuras.map(id => CASA_POR_ID[id].x)
        this.olharPara((Math.min(...xs) + Math.max(...xs)) / 2, 560)
        await FX.wait(this, 520)
        if (gen !== this.gen) return
        this.vila.pulsarEscuras(escuras)

        const daria = existeRota(f, this.problema.marcadas)

        /*
         * A regra mais importante do jogo: caminho ruim não é julgamento ruim.
         * Se a ferramenta conseguiria, o rastro que ficou na tela já é a
         * correção — e nenhuma vida cai por explorar a vila.
         */
        if (!daria && !this.perdeuVidaNoProblema) {
            this.perdeuVidaNoProblema = true
            this.errors++
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER',
                gameId: GAME_ID,
                stage: this.level.level,
                pointsEarned: 0,
            })
            this.lives.lose()
            this.livesLeft = this.lives.remaining
        }

        this.vila.falar('', this.frasePorQue(f, daria), 'aviso', this.problema.vizinho)

        await FX.wait(this, 1600)
        if (gen !== this.gen) return

        this.corrida.limpar()
        this.hud.mostrarSol(false)
        this.vila.marcar(this.problema.marcadas)
        this.kit.subir()
        if (!daria) this.kit.esmaecer(f.id)

        if (this.errosNoProblema >= 2) {
            const certa = this.kitAtual.find(id =>
                existeRota(ferramenta(id), this.problema.marcadas),
            )
            if (certa) this.kit.pulsar(certa)
        }

        this.modo = 'lendo'
        this.kit.setEnabled(true)
    }

    /** Nunca diz qual serve: fala da que veio. */
    private frasePorQue(f: Ferramenta, daria: boolean): string {
        if (daria) return 'Essa dava, sim! Só que por este caminho ela não passou perto de todos.'
        if (f.andar === 'planta') {
            return 'Isso fica parado onde foi posto. Quem mora longe teria de vir até aqui.'
        }
        if (f.so === 'uma-casa') return 'Um bilhete avisa uma casa só. As outras ficaram esperando.'
        if (this.solRestante <= 0) return 'O sol acabou no meio do caminho, e esse povo não soube.'
        return 'Ela passou perto, mas não o bastante. Olha quem ficou no escuro.'
    }

    private cobrarErro() {
        this.errosNoProblema++
        if (this.perdeuVidaNoProblema) return
        this.perdeuVidaNoProblema = true
        this.errors++
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            stage: this.level.level,
            pointsEarned: 0,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    // ─────────────────────────────────────────────────────────── os fechos

    private async terminarDia() {
        const gen = this.gen
        this.modo = 'fechando'
        this.kit.setEnabled(false)
        this.vila.calar()
        this.hud.mostrarSol(false)
        this.kit.exageroFrame(2)

        const sobraram = this.kitAtual.filter(id => !this.usadas.includes(id) && id !== 'palpite')
        this.audio.moedas()
        await this.fecho.dia(this.usadas, sobraram, this.dia.titulo)
        if (gen !== this.gen) return

        this.hud.setDias(this.level.dias.length, this.diaIndex + 1)

        if (this.diaIndex + 1 < this.level.dias.length) {
            this.kit.descer()
            await FX.wait(this, 280)
            if (gen !== this.gen) return
            void this.comecarDia(this.diaIndex + 1)
            return
        }

        void this.terminarNivel()
    }

    private async terminarNivel() {
        const gen = this.gen
        this.modo = 'fim'
        this.kit.descer()
        this.hud.setTitulo('')

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfarra()
        await this.fecho.cartaz()
        if (gen !== this.gen) return

        const feito = this.level.level

        if (feito < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.nome}: feito!`,
                subtitle: 'Nesta vila ninguém ficou sem saber.',
                accent: C.warn,
                panelColor: C.card,
                overlayColor: C.ink,
                depth: 5000,
                progress: { total: LEVELS.length, current: feito, size: 9 },
                autoAdvance: {
                    delay: 2600,
                    label: `${LEVELS[feito].nome}...`,
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
            title: 'A vila toda soube!',
            subtitle: 'Para cada recado você achou a coisa que alcançava quem precisava.',
            accent: C.warn,
            panelColor: C.card,
            overlayColor: C.ink,
            depth: 5000,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 9 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () =>
                        this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                { label: 'Escolher jogo', color: C.azul, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }

    private piscarMoldura(cor: number) {
        this.moldura.clear()
        this.moldura.lineStyle(14, cor, 0.9)
        this.moldura.strokeRect(7, 7, W - 14, 720 - 14)
        this.moldura.setAlpha(1)
        this.tweens.add({ targets: this.moldura, alpha: 0, duration: 520 })
    }

    // ─────────────────────────────────────────────────────────── tutorial

    private replayTutorial() {
        if (this.modo === 'fim' || this.modo === 'pausado') return
        this.runTutorial(true)
    }

    private runTutorial(forcar: boolean) {
        const antes = this.modo
        this.modo = 'pausado'
        this.kit.setEnabled(false)
        this.kit.calarExagero()

        createTutorial(this, {
            key: `ef05co11kds-l${this.level.level}`,
            once: !forcar,
            accent: C.warn,
            safeTop: HUD.h + 10,
            textSize: 30,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.modo = antes === 'pausado' ? 'lendo' : antes
                if (this.modo === 'lendo') this.kit.setEnabled(true)
            },
        })
    }

    /**
     * Três frases curtas, e o dedo mostrando o gesto em duas delas.
     *
     * Cada uma aponta para uma coisa que ESTÁ na tela naquele instante: a luz da
     * porta, o mapa, a carta. O passo do botão IR saiu por isso mesmo — ele só
     * existe depois de a criança tocar numa carta, e recorte em cima de coisa
     * que não está na tela ensina o nada.
     */
    private tutorialSteps() {
        const primeira = this.kit.posDa(this.kitAtual[0] ?? '')

        return [
            {
                text: 'Porta aberta e luz no chão: esta casa ainda não sabe.',
                shape: 'none' as const,
                balloonY: 452,
            },
            {
                text: 'Arraste o mapa com o dedo para ver o resto da vila.',
                shape: 'none' as const,
                balloonY: 452,
                pointer: { fromX: 900, fromY: 330, toX: 420, toY: 330 },
            },
            {
                text: 'Toque numa coisa: o círculo mostra até onde ela avisa. Depois, IR!',
                shape: 'circle' as const,
                x: primeira.x,
                y: primeira.y,
                w: 250,
                h: 190,
                balloonY: 330,
                pointer: {
                    fromX: primeira.x,
                    fromY: primeira.y,
                    toX: primeira.x,
                    toY: primeira.y,
                    tap: true,
                },
            },
        ]
    }

    // ─────────────────────────────────────────────────────────── plataforma

    private emitCheckpoint(completo = false) {
        const feitos = completo ? this.totalProblemas : this.problemasFeitos
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(feitos, this.totalProblemas) / this.totalProblemas) * 100),
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
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
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

