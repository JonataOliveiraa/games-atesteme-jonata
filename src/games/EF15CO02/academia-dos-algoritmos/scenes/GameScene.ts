import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { FX } from '../../../../shared/effects/FX'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { ACOES, NIVEIS, simular, TOTAL_CASOS } from '../data/casos'
import { C, RITMO } from '../data/theme'
import { BANCADA, CENA, COLUNA, PRATELEIRA, TRILHA } from '../data/layout'
import {
  createAviso,
  createBancada,
  createCena,
  createColuna,
  createHud,
  createPrateleira,
  createTrilha,
  voarAteATrilha,
  type Aviso,
  type Cena,
  type Coluna,
  type Hud,
  type Prateleira,
  type Trilha,
} from './effects'
import type { Caso, Mundo, Nivel, Peca, Resultado } from '../types'

const GAME_ID = '043'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A ORQUESTRAÇÃO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Esta cena NÃO desenha nada: se ela precisar de um `fillRoundedRect`, falta
 * um painter em `effects.ts`. Aqui só mora o estado da partida e a ordem das
 * coisas.
 *
 * ── O CICLO ──────────────────────────────────────────────────────────────
 *
 *   ler o pedido → montar a trilha → EXECUTAR → ver o que acontece → ajustar
 *
 * O quarto passo é o que essa habilidade pede de verdade. A criança não erra
 * "a resposta": o algoritmo dela TRAVA num passo, ela vê qual acendeu coral,
 * lê o motivo no estado do objeto lá em cima, e conserta. É depuração.
 */
export class GameScene extends Phaser.Scene {
  private nivel!: Nivel
  private casoIdx = 0
  private pontos = 0
  private acertos = 0
  private erros = 0

  /**
   * A GERAÇÃO.
   *
   * Todo `await` desta cena é seguido de `if (gen !== this.gen) return`. Sem
   * isso, uma animação que estava no meio do caminho quando a criança trocou
   * de caso termina em cima do caso novo — e o bug aparece como "às vezes o
   * jogo mostra a mensagem errada", que ninguém consegue reproduzir.
   */
  private gen = 0

  /** Estado de MOMENTO: zerado no começo de todo caso. */
  private travado = false
  private executando = false

  private mundo!: Mundo
  private caso!: Caso

  private hud!: Hud
  private cena!: Cena
  private coluna!: Coluna
  private trilha!: Trilha
  private prateleira!: Prateleira
  private aviso!: Aviso

  private isMuted = false

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { nivel?: number; caso?: number; points?: number }) {
    const idx = Phaser.Math.Clamp(data.nivel ?? 1, 1, NIVEIS.length) - 1
    this.nivel = NIVEIS[idx]
    this.casoIdx = Phaser.Math.Clamp(data.caso ?? 0, 0, this.nivel.casos.length - 1)
    this.pontos = data.points ?? 0
    this.acertos = 0
    this.erros = 0
    this.gen = 0
    this.executando = false
  }

  create() {
    createBancada(this)
    this.cena = createCena(this)
    this.trilha = createTrilha(this, (i) => this.aoTocarEspaco(i))
    this.prateleira = createPrateleira(this, (p, i) => void this.aoTocarBloco(p, i))
    this.aviso = createAviso(this)
    this.coluna = createColuna(this, () => void this.executar())
    this.hud = createHud(this, this.replayTutorial)

    this.cena.vestir(this.nivel)
    this.coluna.setHumor('normal')
    this.hud.setNivel(this.nivel.numero, this.nivel.ideia)

    EventBus.on('mute-audio', this.aoMutar, this)
    EventBus.on('show-tutorial', this.replayTutorial, this)
    this.events.once('shutdown', this.shutdownScene, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.emitirCheckpoint()

    void this.playCase(this.casoIdx === 0)
  }

  /* ─────────────────────────────────────── o ciclo do caso ─────── */

  private async playCase(comTutorial: boolean) {
    const gen = ++this.gen

    this.caso = this.nivel.casos[this.casoIdx]
    this.mundo = this.caso.mundoInicial()
    this.travado = false
    this.executando = false

    this.aviso.esvaziar()
    this.coluna.setPedido(this.caso.pedido)
    this.coluna.setHumor('normal')
    this.hud.setProgresso(this.casoIdx, this.nivel.casos.length)

    /*
     * O TABULEIRO ENTRA ANTES DO TUTORIAL.
     *
     * Se o tutorial abrir primeiro, o recorte dele ilumina tela vazia e a
     * criança lê uma explicação sobre coisas que ainda não existem.
     */
    this.trilha.montar(this.caso.espacos)
    this.prateleira.montar(this.caso.oferta)
    this.cena.montar(this.objetosDoCaso(), this.mundo)
    this.atualizarBotao()

    await FX.wait(this, 260)
    if (gen !== this.gen) return

    if (comTutorial) this.runTutorial(this.passosDoTutorial(), false, () => {})
  }

  /**
   * OS OBJETOS DA CENA SÃO OS DO PROBLEMA, E MAIS NENHUM.
   *
   * Um por textura, sem repetir. Eles não são enfeite: cada um mostra embaixo
   * de si o que já é verdade sobre ele, e é lendo isso que a criança entende
   * por que um passo travou.
   */
  private objetosDoCaso(): string[] {
    const vistos = new Set<string>()

    for (const p of this.caso.oferta) {
      const ids =
        p.tipo === 'acao' ? [p.acao] : p.tipo === 'repetir' ? [p.acao] : [p.entao, p.senao ?? '']
      for (const id of ids) {
        const tex = ACOES[id]?.textura
        if (tex) vistos.add(tex)
      }
    }
    return [...vistos]
  }

  /* ─────────────────────────────────────── os toques ─────── */

  private async aoTocarBloco(peca: Peca, indice: number) {
    if (this.travado || this.executando) return

    const vazio = this.trilha.primeiroVazio()
    if (vazio < 0) {
      /* trilha cheia não é erro, é informação — e a frase diz COMO resolver */
      void this.aviso.mostrar('A trilha está cheia. Toque num passo para tirar.', 'erro')
      this.tom(240, 0.1, 'sine')
      return
    }

    this.aviso.esvaziar()
    this.tom(660, 0.06, 'triangle')

    /*
     * O BLOCO VOA ATÉ O ESPAÇO.
     *
     * Sem isso ele simplesmente APARECE na trilha, e quem tocou não tem
     * certeza de que foi o toque dela que fez aquilo — ainda mais numa tela
     * com dois lugares parecidos. O voo amarra causa e efeito.
     */
    await voarAteATrilha(
      this,
      peca,
      this.prateleira.posDoCartao(indice),
      this.trilha.posDoEspaco(vazio)
    )

    this.trilha.por(vazio, peca)
    this.atualizarBotao()
  }

  private aoTocarEspaco(i: number) {
    if (this.travado || this.executando) return
    if (!this.trilha.tirar(i)) return

    this.aviso.esvaziar()
    this.tom(420, 0.06, 'sine')
    this.atualizarBotao()
  }

  /** O botão só acende com pelo menos um passo montado. */
  private atualizarBotao() {
    const temAlgo = this.trilha.pecas().some((p) => p !== null)
    this.coluna.setBotao(temAlgo && !this.executando)
  }

  /* ─────────────────────────────────────── a execução ─────── */

  /**
   * SIMULAR ANTES DE ANIMAR.
   *
   * A lógica resolve o caso inteiro de uma vez e devolve as batidas; a
   * animação só encena essa lista. É o que impede a tela de contar uma
   * história diferente da que o jogo registrou.
   */
  private async executar() {
    if (this.executando || this.travado) return
    const gen = ++this.gen

    this.executando = true
    this.trilha.setAtiva(false)
    this.prateleira.setAtiva(false)
    this.coluna.setBotao(false)
    this.coluna.setHumor('pensando')
    this.aviso.esvaziar()

    /* o mundo volta ao começo: executar de novo é começar de novo */
    this.mundo = this.caso.mundoInicial()
    this.cena.montar(this.objetosDoCaso(), this.mundo)

    const { resultado, batidas } = simular(this.trilha.pecas(), this.caso, this.mundo)

    for (const b of batidas) {
      await this.trilha.acender(b.espaco, b.volta)
      if (gen !== this.gen) return

      await this.cena.encenar(ACOES[b.acao]?.textura ?? '', !b.erro)
      if (gen !== this.gen) return

      this.cena.atualizar(this.mundo)

      if (b.erro) break
      await FX.wait(this, RITMO.batida * 0.2)
      if (gen !== this.gen) return
    }

    if (resultado.fim === 'chegou') {
      await this.venceu(gen)
      return
    }
    await this.falhou(gen, resultado)
  }

  private async venceu(gen: number) {
    this.acertos += 1
    this.pontos += 10
    this.coluna.setHumor('feliz')

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      stage: this.nivel.numero,
      pointsEarned: 10,
    })

    await this.trilha.celebrar()
    if (gen !== this.gen) return

    await this.aviso.mostrar('Funcionou!', 'certo')
    this.fanfarra()
    await this.cena.festejar()
    if (gen !== this.gen) return

    await FX.wait(this, 800)
    if (gen !== this.gen) return

    this.emitirCheckpoint()

    if (this.casoIdx + 1 < this.nivel.casos.length) {
      this.casoIdx += 1
      void this.playCase(false)
      return
    }
    this.terminarNivel()
  }

  /**
   * ERRAR NÃO EMPURRA A FASE PARA A FRENTE.
   *
   * A criança volta para a MESMA trilha, com o que ela montou ainda lá — não
   * para uma tela limpa. É o que torna isto depuração: ela olha o passo que
   * acendeu coral, troca ele, e executa de novo.
   *
   * Sem limite de tentativas e sem tirar pontos. Errar barato é o caminho.
   */
  private async falhou(gen: number, resultado: Resultado) {
    this.erros += 1
    this.coluna.setHumor('pensando')

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      stage: this.nivel.numero,
      pointsEarned: 0,
    })

    if (resultado.fim === 'travou') {
      await this.trilha.travar(resultado.emEspaco)
      if (gen !== this.gen) return

      /* a frase diz QUAL passo e O QUÊ — nunca "tente de novo" */
      await this.aviso.mostrar(`Passo ${resultado.emEspaco + 1}: ${resultado.motivo}`, 'erro')
    } else if (resultado.fim === 'faltou') {
      await this.aviso.mostrar(resultado.motivo, 'erro')
    }

    this.tom(200, 0.18, 'sawtooth')
    if (gen !== this.gen) return

    this.executando = false
    this.trilha.setAtiva(true)
    this.prateleira.setAtiva(true)
    this.atualizarBotao()
    this.emitirCheckpoint()
  }

  private terminarNivel() {
    const proximo = NIVEIS[this.nivel.numero]

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.nivel.numero,
      totalStages: NIVEIS.length,
      isFinalStage: this.nivel.numero >= NIVEIS.length,
      score: this.pontos,
      errors: this.erros,
    })

    if (proximo) {
      showLevelComplete(this, {
        title: `Nível ${this.nivel.numero} completo!`,
        subtitle: `${this.acertos} de ${this.nivel.casos.length} algoritmos`,
        message: 'Agora vem um bloco novo.',
        accent: C.latao,
        panelColor: C.creme,
        overlayColor: C.ink,
        progress: { total: NIVEIS.length, current: this.nivel.numero },
        autoAdvance: {
          delay: 2400,
          label: 'Preparando o próximo treino...',
          onComplete: () =>
            this.scene.restart({ nivel: this.nivel.numero + 1, caso: 0, points: this.pontos }),
        },
      })
      return
    }

    void FX.confetti(this, { colors: [C.latao, C.verde, C.creme] })

    showLevelComplete(this, {
      title: 'Você é treinador de algoritmos!',
      subtitle: `${this.pontos} pontos`,
      message: 'Um algoritmo é uma ordem de passos. Você montou três.',
      accent: C.verde,
      panelColor: C.creme,
      overlayColor: C.ink,
      progress: { total: NIVEIS.length, current: NIVEIS.length },
      buttons: [
        {
          label: 'Jogar de novo',
          color: C.latao,
          onClick: () => this.scene.restart({ nivel: 1, caso: 0, points: 0 }),
        },
        { label: 'Escolher jogo', color: C.fosco, onClick: () => EventBus.emit('exit-game') },
      ],
    })
  }

  /* ─────────────────────────────────────── o tutorial ─────── */

  private passosDoTutorial(): TutorialStep[] {
    const tocar = (x: number, y: number) => ({ fromX: x, fromY: y, toX: x, toY: y, tap: true })
    const meio = BANCADA.x + BANCADA.w / 2

    return [
      {
        text: 'O treinador pede uma coisa. Leia aqui.',
        shape: 'rect' as const,
        x: COLUNA.cx, y: COLUNA.balao.cy, w: COLUNA.balao.w + 24, h: COLUNA.balao.hMax,
        balloonX: 480, balloonY: 320,
      },
      {
        text: 'Embaixo de cada coisa está o estado dela.',
        shape: 'rect' as const,
        x: meio, y: CENA.objeto.cy + 30, w: CENA.w, h: 190,
        balloonX: 470, balloonY: 560,
      },
      {
        text: 'Toque num bloco para pôr ele na trilha.',
        shape: 'rect' as const,
        x: meio, y: PRATELEIRA.cy, w: CENA.w, h: PRATELEIRA.altura + 30,
        balloonX: 470, balloonY: 300,
        pointer: tocar(meio, PRATELEIRA.cy),
      },
      {
        text: 'A ordem importa! Toque num passo para tirar.',
        shape: 'rect' as const,
        x: meio, y: TRILHA.cy, w: CENA.w, h: TRILHA.alturaEspaco + 30,
        balloonX: 470, balloonY: 230,
      },
      {
        text: 'Aperte EXECUTAR e veja o que acontece.',
        shape: 'rect' as const,
        x: COLUNA.cx, y: COLUNA.botao.cy, w: COLUNA.botao.w + 30, h: COLUNA.botao.h + 30,
        balloonX: 480, balloonY: 300,
        pointer: tocar(COLUNA.cx, COLUNA.botao.cy),
      },
    ]
  }

  private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
    this.travado = true
    this.trilha.setAtiva(false)
    this.prateleira.setAtiva(false)

    createTutorial(this, {
      key: `ef15co02-n${this.nivel.numero}`,
      once: !force,
      accent: C.latao,
      safeTop: 80,
      steps,
      onFinish: () => {
        this.travado = false
        this.trilha.setAtiva(true)
        this.prateleira.setAtiva(true)
        this.atualizarBotao()
        onFinish()
      },
    })
  }

  private replayTutorial = () => {
    if (this.executando) return
    this.runTutorial(this.passosDoTutorial(), true, () => {})
  }

  /* ─────────────────────────────────────── a plataforma ─────── */

  private emitirCheckpoint() {
    const antes = NIVEIS.slice(0, this.nivel.numero - 1).reduce((n, nv) => n + nv.casos.length, 0)
    const feitos = antes + this.casoIdx

    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress: Math.round((feitos / TOTAL_CASOS) * 100),
      score: this.pontos,
      stage: this.nivel.numero,
      hits: this.acertos,
      errors: this.erros,
    })
  }

  /* ─────────────────────────────────────── o som ─────── */

  private ctx: AudioContext | null = null

  private audio(): AudioContext | null {
    if (this.isMuted) return null
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    return this.ctx
  }

  private tom(freq: number, dur: number, tipo: OscillatorType, ganho = 0.05) {
    const ctx = this.audio()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const vol = ctx.createGain()
    osc.type = tipo
    osc.frequency.value = freq
    vol.gain.value = ganho
    osc.connect(vol).connect(ctx.destination)
    osc.start()
    vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    osc.stop(ctx.currentTime + dur)
  }

  private fanfarra() {
    ;[523, 659, 784, 1047].forEach((f, i) =>
      window.setTimeout(() => this.tom(f, 0.16, 'triangle'), i * 110)
    )
  }

  private aoMutar = (mudo: boolean) => {
    this.isMuted = mudo
  }

  /* ─────────────────────────────────────── a saída ─────── */

  private shutdownScene() {
    /* a geração avança: toda animação pendente vira no-op */
    this.gen++

    EventBus.off('mute-audio', this.aoMutar, this)
    EventBus.off('show-tutorial', this.replayTutorial, this)

    this.hud?.destroy()
    this.cena?.destroy()
    this.coluna?.destroy()
    this.trilha?.destroy()
    this.prateleira?.destroy()
    this.aviso?.destroy()

    this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}
