import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

import { C, CSS } from '../data/theme'
import { BAGUNCA, BANDEJA, DEPTH, DUPLA, H, HUD, W, afastarDoTuca, tamanhoNaFila } from '../data/layout'
import { IMAGES, TUCA_F, has } from '../data/files'
import { ABERTURA, ABERTURA_DUPLA, LEVELS, NOME } from '../data/levels'
import { criarPrateleira, type Posto, type Prateleira } from './prateleira'
import { criarCoisa, criarFichinha, criarFio, criarValorCampo } from './pecas'
import { criarTuca, type Tuca } from './tuca'
import { criarAudio, type Audio } from './audio'
import { buracoDaPeca, type Estrutura, type Fase, type LevelConfig, type Peca } from '../types'

const GAME_ID = 'o-misterio-do-arquivo-vivo'


/** Uma peça solta na bagunça, com o container dela e o lugar de onde saiu. */
interface Solta {
    dado: Peca
    obj: Phaser.GameObjects.Container
    casa: { x: number; y: number }
    guardada: boolean
}

export class GameScene extends Phaser.Scene {
    private level!: LevelConfig
    private fase!: Fase
    private iFase = 0
    private score = 0
    private errors = 0
    private livesTotal = 3
    private livesLeft = 3
    private lives!: Lives

    private tuca!: Tuca
    private audio!: Audio
    private prateleiras: Prateleira[] = []
    private soltas: Solta[] = []
    private naMao?: Solta

    private travado = false
    private acabou = false
    private errosNaFase = 0
    private faltam = 0
    private dots: Phaser.GameObjects.Arc[] = []

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        const n = data.level ?? 1
        this.level = LEVELS.find(l => l.level === n) ?? LEVELS[0]
        this.score = data.points ?? 0
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data.lives ?? this.livesTotal
        this.iFase = 0
        this.errors = 0
        this.acabou = false
        this.soltas = []
        this.naMao = undefined
    }

    create() {
        if (has(this, IMAGES.fundo)) {
            this.add.image(W / 2, H / 2, IMAGES.fundo).setDisplaySize(W, H).setDepth(DEPTH.fundo)
        } else {
            this.add.rectangle(W / 2, H / 2, W, H, C.papel).setDepth(DEPTH.fundo)
        }

        this.audio = criarAudio()
        this.tuca = criarTuca(this)
        this.hud()

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.livesY,
            size: 26,
            tint: C.coral,
            color: CSS.creme,
            stroke: CSS.tinta,
            strokeThickness: 5,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })

        this.input.on('pointerdown', this.aoTocar, this)
        this.events.once('shutdown', () => {
            this.lives.destroy()
            this.tuca.destroy()
            this.prateleiras.forEach(p => p.destroy())
            this.audio.destroy()
        })

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        void this.abrirFase()
    }

    /* ────────────────────────────── cabeçalho ─────────────────────────── */

    /** O nível numa pílula, as cinco bolinhas das fases e o `?`. */
    private hud() {
        const g = this.add.graphics().setDepth(DEPTH.hud - 1)
        g.fillStyle(C.tinta, 0.8)
        g.fillRoundedRect(-24, -34, W + 48, 96, 24)

        g.fillStyle(C.ambar, 1)
        g.fillRoundedRect(HUD.nivelX, HUD.y - HUD.nivelH / 2, HUD.nivelW, HUD.nivelH, HUD.nivelH / 2)
        this.add.text(HUD.nivelX + HUD.nivelW / 2, HUD.y + 1, `NÍVEL ${this.level.level}`, {
            fontFamily: FONT_JOGO.black, fontSize: '22px', color: CSS.tinta,
        }).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)

        this.dots = this.level.fases.map((_, i) =>
            this.add.circle(HUD.dotsX + i * HUD.dotStep, HUD.y, 10, C.creme, 0.3)
                .setDepth(DEPTH.hud),
        )

        const ajuda = this.add.circle(HUD.helpX, HUD.y, 25, C.ambar)
            .setDepth(DEPTH.hud).setInteractive({ useHandCursor: true })
        this.add.text(HUD.helpX, HUD.y + 1, '?', {
            fontFamily: FONT_JOGO.black, fontSize: '30px', color: CSS.tinta,
        }).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)

        ajuda.on('pointerdown', (p: Phaser.Input.Pointer) => {
            p.event.stopPropagation()
            this.mostrarAjuda()
        })
    }

    private marcarDots() {
        this.dots.forEach((d, i) => {
            d.setFillStyle(C.creme, i < this.iFase ? 1 : i === this.iFase ? 0.8 : 0.3)
        })
    }

    /* ──────────────────────────────── a fase ──────────────────────────── */

    private async abrirFase() {
        this.fase = this.level.fases[this.iFase]
        this.errosNaFase = 0
        this.faltam = this.fase.pecas.length
        this.travado = true
        this.marcarDots()

        this.prateleiras.forEach(p => p.destroy())
        this.prateleiras = this.fase.estruturas.map((est, i) =>
            criarPrateleira(this, est, this.postoDe(i)),
        )

        this.tuca.pose(TUCA_F.acenando)
        await FX.all(...this.prateleiras.map(p => p.entrar()))
        await this.espalhar()

        /* A REGRA DA FASE, DITA DE DOIS JEITOS: o Tuca fala, e a prateleira
           mostra — a escadinha com a seta, na fila; as etiquetas de linha e
           coluna, na grade; o rótulo ao lado do buraco, na ficha; o fio
           pontilhado, na teia. Quem não lê tem o desenho. */
        this.tuca.pose(TUCA_F.apontando)
        await this.faixa(
            this.prateleiras.length > 1
                ? ABERTURA_DUPLA
                : ABERTURA[this.fase.estruturas[0].forma],
            2200,
        )

        this.tuca.pose(TUCA_F.esperando)
        this.travado = false

        /* Na PRIMEIRA fase de cada nível, a mão fantasma mostra o gesto uma
           vez. Depois disso nunca mais: quem já sabe não precisa ver de novo. */
        if (this.iFase === 0) await this.demonstrar()
    }

    /**
     * ONDE CADA PRATELEIRA NASCE.
     *
     * Sozinha, ela fica no centro e no tamanho cheio. **Em dupla, as duas
     * encolhem e vão para as laterais** — e é só isso que o nível 3 precisou
     * mudar no jogo, porque as quatro estruturas falam a mesma interface.
     */
    private postoDe(i: number): Posto {
        const est = this.fase.estruturas[i]
        const posto: Posto = this.fase.estruturas.length === 1
            ? { cx: W / 2, escala: 1 }
            : { cx: i === 0 ? DUPLA.esqX : DUPLA.dirX, cy: DUPLA.y, escala: DUPLA.escala }
        if (est.forma !== 'fila') return posto
        return { ...posto, ...afastarDoTuca(est.fila ?? 4, posto.cx, posto.escala) }
    }

    /**
     * A BAGUNÇA.
     *
     * As peças caem do alto, embaralhadas, e ficam tortas. Na fila elas vêm em
     * tamanhos diferentes — e o tamanho é a informação: é comparando que a
     * criança descobre a ordem.
     */
    private async espalhar() {
        this.soltas.forEach(s => s.obj.destroy())
        this.soltas = []

        const embaralhadas = Phaser.Utils.Array.Shuffle([...this.fase.pecas])
        const n = embaralhadas.length
        const objs = embaralhadas.map(dado => this.criarPeca(dado, n))

        /**
         * O ESPAÇAMENTO SAI DA PEÇA MAIS LARGA DA FASE.
         *
         * Um passo fixo funcionava quando as peças eram todas iguais. No nível
         * 3 a bagunça mistura tamanhos — uma coisa de 158 px ao lado de uma
         * fichinha de 104 —, e um passo fixo de 118 fazia elas se montarem umas
         * nas outras.
         */
        const maisLarga = Math.max(...objs.map(o => o.width), BANDEJA.ficha)
        const passo = Math.max(BANDEJA.passo, maisLarga + 26)
        const cabe = Math.min(passo, (BAGUNCA.xFim - BAGUNCA.xIni) / Math.max(1, n - 1))
        const usar = n > 1 ? Math.max(cabe, maisLarga * 0.82) : passo
        const x0 = W / 2 - ((n - 1) * usar) / 2

        /* Coisas de tamanhos diferentes ficam tortas, como bagunça de verdade;
           peças iguais ficam retas, como uma bandeja. */
        const torto = embaralhadas.some(p => p.ordem !== undefined)
        const jobs: Array<Promise<unknown>> = []

        embaralhadas.forEach((dado, i) => {
            const obj = objs[i]
            const x = x0 + i * usar
            const y = torto ? BAGUNCA.y : BANDEJA.y

            obj.setPosition(x, -180).setDepth(DEPTH.solta).setAngle(Phaser.Math.Between(-16, 16))
            this.soltas.push({ dado, obj, casa: { x, y }, guardada: false })

            jobs.push(new Promise<void>(res => {
                this.time.delayedCall(i * 90, () => {
                    this.audio.cair()
                    this.tweens.add({
                        targets: obj,
                        y,
                        angle: torto ? Phaser.Math.Between(-10, 10) : 0,
                        duration: 560,
                        ease: 'Bounce.easeOut',
                        onComplete: () => res(),
                    })
                })
            }))
        })

        await FX.all(...jobs)
    }

    /**
     * O DESENHO DA PEÇA SAI DA ESTRUTURA A QUE ELA PERTENCE.
     *
     * E é isso que faz o nível 3 funcionar: as quatro peças têm formatos
     * diferentes — objeto solto, fichinha colorida, cartão quadrado, cartão
     * comprido com duas pontas. A criança vê de longe qual prateleira pede
     * qual, sem precisar de legenda.
     */
    private criarPeca(dado: Peca, n: number): Phaser.GameObjects.Container {
        const est = this.estruturaDe(dado)
        switch (est.forma) {
            case 'grade':
                return criarFichinha(this, dado.linha ?? 0, dado.coluna ?? 0, BANDEJA.ficha)
            case 'ficha':
                return criarValorCampo(this, dado.tipo ?? 'bicho', dado.valor ?? 0, BANDEJA.ficha)
            case 'teia': {
                const nos = est.teia?.nos ?? []
                return criarFio(this, nos[dado.de ?? 0], nos[dado.para ?? 0], BANDEJA.ficha)
            }
            default: {
                /* Na fila o tamanho vem da quantidade de peças DAQUELA fila, e
                   não do total da fase: no nível 3 a bagunça mistura as duas. */
                const daFila = this.fase.pecas.filter(p => (p.alvo ?? 0) === (dado.alvo ?? 0)).length
                return criarCoisa(this, dado.objeto ?? 0, tamanhoNaFila(dado.ordem ?? 0, daFila || n))
            }
        }
    }

    private estruturaDe(dado: Peca): Estrutura {
        return this.fase.estruturas[dado.alvo ?? 0]
    }

    private prateleiraDe(dado: Peca): Prateleira {
        return this.prateleiras[dado.alvo ?? 0]
    }

    /** A mão fantasma: toca a peça certa, toca o buraco certo, e sai. Sem texto. */
    private async demonstrar() {
        const alvo = this.proximaCerta()
        if (!alvo) return
        const buraco = this.buracoDe(alvo.dado)
        if (buraco === undefined) return
        const onde = this.prateleiraDe(alvo.dado).buracos.find(b => b.indice === buraco)
        if (!onde) return

        this.travado = true
        const mao = this.add.graphics().setDepth(DEPTH.naMao + 10)
        mao.fillStyle(0xffffff, 0.45)
        mao.lineStyle(7, C.tinta, 0.9)
        mao.fillCircle(0, 0, 30)
        mao.strokeCircle(0, 0, 30)
        mao.setPosition(alvo.obj.x, alvo.obj.y)

        const bater = async () => {
            await FX.to(this, mao, { scale: 0.7 }, { duration: 160 })
            await FX.to(this, mao, { scale: 1 }, { duration: 160 })
        }

        await FX.wait(this, 260)
        await bater()
        await FX.to(this, mao, { x: onde.x, y: onde.y }, { duration: 620, ease: 'Sine.easeInOut' })
        await bater()
        await FX.to(this, mao, { alpha: 0 }, { duration: 220 })
        mao.destroy()
        this.travado = false
    }

    /* ──────────────────────────────── toque ───────────────────────────── */

    private aoTocar(p: Phaser.Input.Pointer) {
        if (this.acabou || this.travado) return

        if (!this.naMao) {
            const alvo = this.acharSolta(p.x, p.y)
            if (alvo) this.pegar(alvo)
            return
        }

        /* O buraco é procurado em TODAS as prateleiras da fase: tocar na
           errada não é toque perdido, é uma escolha — e ela precisa chegar ao
           `encaixar` para virar erro com explicação. */
        for (let i = 0; i < this.prateleiras.length; i++) {
            const b = this.prateleiras[i].acharBuraco(p.x, p.y)
            if (b) { void this.encaixar(i, b.indice); return }
        }

        /* Tocar fora larga a peça de volta, sem erro nenhum: mudar de ideia não
           pode custar vida. */
        this.largar()
    }

    private acharSolta(x: number, y: number): Solta | undefined {
        let melhor: Solta | undefined
        let dist = Infinity
        for (const s of this.soltas) {
            if (s.guardada) continue
            const raio = Math.max(s.obj.width, s.obj.height) / 2 + 16
            const d = Phaser.Math.Distance.Between(x, y, s.obj.x, s.obj.y)
            if (d <= raio && d < dist) { dist = d; melhor = s }
        }
        return melhor
    }

    /** A peça sobe, cresce e fica pulsando; os buracos que a aceitam acendem. */
    private pegar(s: Solta) {
        this.naMao = s
        this.audio.pegar()
        s.obj.setDepth(DEPTH.naMao)

        FX.kill(this, s.obj)
        this.tweens.add({
            targets: s.obj,
            scale: 1.16,
            angle: 0,
            duration: 200,
            ease: 'Back.easeOut',
        })
        FX.breathe(this, s.obj, { grow: 1.05, duration: 760 })

        /* Na fila só o próximo buraco aceita, então só ele acende — a criança
           nunca erra ONDE, só decide QUAL peça vem agora. */
        const pr = this.prateleiraDe(s.dado)
        const quais = pr.forma === 'fila'
            ? pr.buracos.filter(b => b.aberto && !b.cheio).map(b => b.indice)
            : pr.buracos.filter(b => !b.cheio).map(b => b.indice)
        pr.destacar(quais)
    }

    private largar() {
        const s = this.naMao
        if (!s) return
        this.naMao = undefined
        FX.kill(this, s.obj)
        this.prateleiras.forEach(p => p.apagar())
        this.tweens.add({
            targets: s.obj,
            x: s.casa.x, y: s.casa.y, scale: 1,
            duration: 240,
            ease: 'Quad.easeOut',
        })
        s.obj.setDepth(DEPTH.solta)
    }

    /** Onde esta peça mora — derivado dela mesma, nunca escrito no dado. */
    private buracoDe(p: Peca): number | undefined {
        return buracoDaPeca(this.estruturaDe(p), p)
    }

    /** A menor peça que ainda não foi guardada — o alvo da demonstração. */
    private proximaCerta(): Solta | undefined {
        const livres = this.soltas.filter(s => !s.guardada)
        const daFila = livres.filter(s => s.dado.ordem !== undefined)
        if (daFila.length) {
            return daFila.sort((a, b) => (a.dado.ordem ?? 0) - (b.dado.ordem ?? 0))[0]
        }
        return livres[0]
    }

    private async encaixar(qualPrateleira: number, indice: number) {
        const s = this.naMao
        if (!s) return
        const certo = this.buracoDe(s.dado)
        const daPeca = s.dado.alvo ?? 0

        this.naMao = undefined
        FX.kill(this, s.obj)
        this.prateleiras.forEach(p => p.apagar())

        /* Prateleira errada conta igual a buraco errado: nos dois casos a
           criança disse "é aqui" e não era. */
        if (qualPrateleira !== daPeca || indice !== certo) {
            await this.errar(s)
            return
        }

        this.travado = true
        const onde = this.prateleiras[daPeca].encher(indice)
        this.audio.encaixar()

        /**
         * A PEÇA ENCOLHE AO ENCAIXAR.
         *
         * Ela é grande na bagunça, porque é lá que a criança compara e decide;
         * no buraco ela assume a escala daquela prateleira. Sem isto, no nível
         * 3 — onde as duas prateleiras encolhem — uma coisa de 158 px entraria
         * num buraco de 112 e vazaria por fora dele.
         */
        const esc = this.postoDe(daPeca).escala
        await FX.to(this, s.obj, { x: onde.x, y: onde.y, scale: esc }, { duration: 260, ease: 'Back.easeIn' })
        s.obj.setDepth(DEPTH.encaixada)
        s.guardada = true

        /* O TRANCO DO ENCAIXE. É o que faz a peça parecer que CRAVOU, e é o
           momento mais gostoso do jogo — vale os 90 ms. */
        await FX.to(this, s.obj, { scale: esc * 1.14 }, { duration: 90 })
        await FX.to(this, s.obj, { scale: esc }, { duration: 130, ease: 'Bounce.easeOut' })

        this.tuca.pose(TUCA_F.feliz)
        this.time.delayedCall(600, () => {
            if (!this.acabou) this.tuca.pose(TUCA_F.esperando)
        })

        const primeira = this.errosNaFase === 0
        this.score += primeira ? 10 : 5
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            stage: this.level.level,
            pointsEarned: primeira ? 10 : 5,
        })

        this.faltam -= 1
        this.travado = false
        if (this.faltam <= 0) void this.fecharFase()
    }

    /**
     * O ERRO.
     *
     * A peça **volta para onde estava**, e a dica é um DESTAQUE, não uma frase:
     * na fila as peças menores piscam; na grade a linha e a coluna certas
     * acendem e se cruzam. A frase só aparece no segundo erro da fase.
     *
     * O Tuca fica **curioso**, nunca bravo.
     */
    private async errar(s: Solta) {
        this.travado = true
        this.errosNaFase += 1
        this.errors += 1
        this.audio.recusar()

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            stage: this.level.level,
            pointsEarned: 0,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.tuca.pose(TUCA_F.curioso)

        const x0 = s.obj.x
        await new Promise<void>(res => {
            this.tweens.add({
                targets: s.obj,
                x: { from: x0 - 14, to: x0 + 14 },
                duration: 70, yoyo: true, repeat: 2,
                onComplete: () => { s.obj.x = x0; res() },
            })
        })
    }

    /* ─────────────────────────── fim de fase/nível ────────────────────── */

    /**
     * A ESTRUTURA GANHA VIDA, e só então o nome aparece.
     *
     * A BNCC pede os nomes — lista, matriz. Eles saem **depois** de a criança
     * ter montado a coisa com a mão dela. Nome sem experiência é decoreba.
     */
    private async fecharFase() {
        this.travado = true
        this.audio.completar()

        /* Uma onda passa pelas peças encaixadas, na ordem em que elas moram:
           é a estrutura inteira se apresentando como uma coisa só. */
        const postas = this.soltas
            .filter(s => s.guardada)
            .sort((a, b) => (this.buracoDe(a.dado) ?? 0) - (this.buracoDe(b.dado) ?? 0))

        for (const s of postas) {
            const base = s.obj.scale
            void FX.to(this, s.obj, { scale: base * 1.18 }, { duration: 110 })
                .then(() => FX.to(this, s.obj, { scale: base }, { duration: 160, ease: 'Bounce.easeOut' }))
            await FX.wait(this, 80)
        }

        await this.tuca.comemorar()
        for (const est of this.fase.estruturas) await this.faixaDoNome(est)

        this.iFase += 1
        this.marcarDots()

        if (this.iFase < this.level.fases.length) {
            await this.limparFase()
            void this.abrirFase()
            return
        }
        void this.fecharNivel()
    }

    private async limparFase() {
        const jobs = this.soltas.map(s =>
            FX.to(this, s.obj, { alpha: 0, scale: 0.7 }, { duration: 260 }),
        )
        await FX.all(...jobs)
        this.soltas.forEach(s => s.obj.destroy())
        this.soltas = []
    }

    private async faixaDoNome(est: Estrutura) {
        const { kid, tec } = NOME[est.forma]
        await this.faixa(`isso é uma ${kid}`, 1900, `em computação: ${tec}`)
    }

    /**
     * A FAIXA DO RODAPÉ.
     *
     * **Toda palavra do jogo sai por aqui**, e não num balão ao lado do Tuca:
     * o balão caía por cima da prateleira em toda fase, e a prateleira é
     * justamente o que a frase manda olhar. O rodapé está sempre livre —
     * nenhuma peça e nenhum buraco moram lá.
     */
    private async faixa(texto: string, ms: number, abaixo?: string) {
        const c = this.add.container(W / 2, H + 90).setDepth(DEPTH.faixa)

        const t = this.add.text(0, abaixo ? -16 : 0, texto, {
            fontFamily: FONT_JOGO.black, fontSize: '34px', color: CSS.creme,
        }).setOrigin(0.5).setResolution(2)

        const larg = Math.max(420, t.width + 92)
        const alt = abaixo ? 104 : 84
        const g = this.add.graphics()
        g.fillStyle(C.tinta, 0.94)
        g.fillRoundedRect(-larg / 2, -alt / 2, larg, alt, 26)
        c.add([g, t])

        if (abaixo) {
            c.add(this.add.text(0, 22, abaixo, {
                fontFamily: FONT_JOGO.body, fontSize: '24px', color: CSS.ambar,
            }).setOrigin(0.5).setResolution(2))
        }

        await FX.to(this, c, { y: H - 74 }, { duration: 320, ease: 'Back.easeOut' })
        await FX.wait(this, ms)
        await FX.to(this, c, { y: H + 90 }, { duration: 280 })
        c.destroy()
    }

    private async fecharNivel() {
        this.acabou = true
        this.tuca.pose(TUCA_F.comemorando)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })

        this.audio.fanfarra()
        void FX.confetti(this, { colors: [C.ambar, C.teal, C.coral, C.creme] })
        await FX.wait(this, 900)

        const ultimo = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            title: 'Tudo no lugar!',
            accent: C.ambar,
            panelColor: C.creme,
            titleColor: CSS.tinta,
            progress: { total: LEVELS.length, current: this.level.level },
            ...(ultimo
                ? {
                      buttons: [
                          {
                              label: 'Jogar de novo',
                              color: C.ambar,
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

    /* ──────────────────────────────── ajuda ──────────────────────────── */

    /** O `?` repete a mão fantasma, que é o tutorial inteiro deste jogo. */
    private mostrarAjuda() {
        if (this.acabou || this.travado || this.naMao) return
        void this.demonstrar()
    }
}
