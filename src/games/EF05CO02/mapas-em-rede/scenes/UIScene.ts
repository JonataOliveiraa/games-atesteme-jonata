import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import { W, HUD, SUB } from '../data/layout'

/**
 * O HEADER.
 *
 * ── O QUE ESTAVA ERRADO ──────────────────────────────────────────────────
 *
 * O enunciado era um texto centrado em W/2 com quebra de 1120px: ele começava
 * em x=100 e terminava em x=1180, ou seja, passava POR BAIXO do relógio
 * (x 862..1186) e do botão `?` (x 1208..1260), e por cima do "NÍVEL 1" da
 * esquerda. Frase curta não batia; frase longa batia — e o jogo parecia ter a
 * UI desalinhada por acaso, quando na verdade os três blocos disputavam o
 * mesmo espaço.
 *
 * Agora a faixa é de ponta a ponta e tem três zonas que não se cruzam: nível e
 * fases à esquerda, tempo e ajuda à direita, e o enunciado no vão livre do
 * meio, com largura própria. Se a frase não couber, ELA encolhe — nunca invade
 * o vizinho.
 */
interface HudData {
  instruction: string
  sub: string
  level: number
  phase: number
  totalPhases: number
}

/**
 * Encolhe o texto até caber em `maxLinhas`.
 *
 * O `wordWrap` do estilo continua mandando na largura; o que muda é o corpo da
 * letra. Sem isto, a única saída de uma frase comprida é quebrar em mais uma
 * linha — que é exatamente o defeito que se está consertando.
 */
function caberEm(
  t: Phaser.GameObjects.Text,
  str: string,
  sizes: number[],
  maxLinhas: number,
) {
  for (let i = 0; i < sizes.length; i += 1) {
    t.setFontSize(sizes[i])
    t.setText(str)
    if (t.getWrappedText(str).length <= maxLinhas) return
  }
}

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private subText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private dots!: Phaser.GameObjects.Graphics

  private tempo!: TimeBar
  private helpBtn!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.buildBar()

    this.instructionText = this.add.text(HUD.instrCX, HUD.cy, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: `${HUD.instrSizes[0]}px`,
      color: '#ffffff',
      stroke: '#0f2547',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: HUD.instrW },
    }).setOrigin(0.5).setDepth(11).setResolution(2)

    this.subText = this.add.text(W / 2, SUB.y, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: `${SUB.sizes[0]}px`,
      color: '#dbeafe',
      stroke: '#0f2547',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: SUB.w },
    }).setOrigin(0.5).setDepth(11).setResolution(2)

    this.levelText = this.add.text(
      HUD.pillX + HUD.pillW / 2, HUD.pillY + HUD.pillH / 2, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(11).setResolution(2)

    this.dots = this.add.graphics().setDepth(11)

    /*
     * A BARRA DE TEMPO é do kit compartilhado.
     *
     * A anterior era uma barra desenhada à mão aqui dentro, movida por um tween
     * de 60s que só existia no Nível 3 — nos Níveis 1 e 2 o jogo simplesmente
     * não tinha tempo nenhum. Agora é o mesmo componente dos outros jogos, e a
     * cena de jogo liga e desliga por evento.
     *
     * Cores do CROMO deste jogo (azul-noite, azul claro, papel), e não da
     * paleta de significado: verde e vermelho aqui são "acertou" e "errou".
     */
    this.tempo = createTimeBar(this, {
      cx: HUD.barCX, cy: HUD.cy, w: HUD.barW, h: HUD.barH,
      duration: 60_000,
      iconDX: HUD.barIconDX,
      iconR: HUD.barIconR,
      depth: 11,
      theme: {
        track: 0x0f2547,
        border: 0x3b82f6,
        borderAlpha: 0.75,
        fill: 0xdbeafe,
        warn: 0xf59e0b,
        danger: 0xef4444,
        idle: 0x64748b,
        icon: 0xdbeafe,
      },
      onEmpty: () => EventBus.emit('timer-end'),
    })
    /*
     * Ela nasce PARADA e invisível.
     *
     * O `tick` roda todo frame desde o primeiro; sem parar a barra aqui, ela
     * contaria durante a tela de abertura e o tutorial e poderia zerar antes de
     * a fase começar — um `timer-end` fantasma que só não estoura porque a cena
     * de jogo está travada nessa hora.
     */
    this.tempo.setRunning(false)
    this.tempo.container.setVisible(false)

    this.registry.events.on('changedata-hud', (_p: unknown, data: HudData) => {
      this.applyHud(data)
    })

    EventBus.on('timer-start', (seconds: number) => this.startTimer(seconds), this)
    EventBus.on('timer-stop', () => this.stopTimer(), this)

    this.helpBtn = this.buildHelpButton(HUD.helpX, HUD.cy)
    this.helpBtn.setVisible(false)

    EventBus.on('tutorial-ready', () => {
      if (this.helpBtn.visible) return
      this.helpBtn.setVisible(true).setAlpha(0)
      this.tweens.add({ targets: this.helpBtn, alpha: 1, duration: 260 })
    }, this)

    const existing = this.registry.get('hud') as HudData | undefined
    if (existing) this.applyHud(existing)
  }

  shutdown() {
    this.stopTimer()
    this.registry.events.off('changedata-hud')
    EventBus.off('timer-start', undefined, this)
    EventBus.off('timer-stop', undefined, this)
    EventBus.off('tutorial-ready', undefined, this)
    EventBus.off('show-tutorial', undefined, this)
  }

  update(_time: number, delta: number) {
    this.tempo?.tick(delta)
  }

  /** A faixa e a pílula do nível: o único desenho fixo do header. */
  private buildBar() {
    const g = this.add.graphics().setDepth(10)
    g.fillStyle(0x0f2547, 0.94)
    g.fillRect(0, 0, W, HUD.h)
    g.fillStyle(0xffffff, 0.05)
    g.fillRect(0, 0, W, 26)
    g.fillStyle(0x3b82f6, 1)
    g.fillRect(0, HUD.h - HUD.linha, W, HUD.linha)
    g.fillStyle(0x000000, 0.28)
    g.fillRect(0, HUD.h, W, 8)

    const pill = this.add.graphics().setDepth(10)
    pill.fillStyle(0x1e3a8a, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(0xffffff, 0.2)
    pill.fillRoundedRect(HUD.pillX + 9, HUD.pillY + 5, HUD.pillW - 18, 11, 6)
  }

  private applyHud(data: HudData) {
    caberEm(this.instructionText, data.instruction, HUD.instrSizes, HUD.instrMaxLinhas)
    caberEm(this.subText, data.sub ?? '', SUB.sizes, SUB.maxLinhas)
    this.levelText.setText(`NÍVEL ${data.level}`)
    this.paintDots(data.phase, data.totalPhases)
  }

  /**
   * As fases viraram BOLINHAS, e não mais "Fase 2 de 4".
   *
   * Quatro pontinhos dizem a mesma coisa que sete palavras, e liberam a linha
   * de baixo da pílula — que é onde o texto do nível ficava espremido contra o
   * enunciado. Um bloco de texto a menos no topo.
   */
  private paintDots(phase: number, total: number) {
    this.dots.clear()
    for (let i = 0; i < total; i += 1) {
      const x = HUD.dotsX + i * HUD.dotGap
      const feito = i < phase - 1
      const atual = i === phase - 1
      this.dots.fillStyle(feito ? 0x22c55e : atual ? 0x93c5fd : 0xffffff, atual ? 1 : feito ? 1 : 0.22)
      if (atual) this.dots.fillRoundedRect(x - 10, HUD.cy - HUD.dotR, 20, HUD.dotR * 2, HUD.dotR)
      else this.dots.fillCircle(x, HUD.cy, HUD.dotR)
    }
  }

  private startTimer(seconds: number) {
    this.tempo.container.setVisible(true)
    this.tempo.reset(seconds * 1000)
    this.tempo.setRunning(true)
  }

  private stopTimer() {
    this.tempo?.setRunning(false)
  }

  private buildHelpButton(x: number, y: number) {
    const s = HUD.helpS
    const box = this.add.container(0, 0).setDepth(40)
    const g = this.add.graphics()

    const paint = (hover: boolean) => {
      g.clear()
      g.fillStyle(0x0f2547, 0.6)
      g.fillRoundedRect(x - s / 2, y - s / 2 + 5, s, s, 16)
      g.fillStyle(hover ? 0x3b82f6 : 0x1e3a8a, 1)
      g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 16)
      g.fillStyle(0xffffff, 0.16)
      g.fillRoundedRect(x - s / 2 + 5, y - s / 2 + 4, s - 10, s * 0.32, 9)
      g.lineStyle(3, 0x93c5fd, 0.95)
      g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 16)
    }
    paint(false)

    const text = this.add.text(x, y, '?', {
      fontFamily: 'Arial Black, Arial', fontSize: '26px',
      color: '#ffffff', stroke: '#0f2547', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const zone = this.add.zone(x, y, s + 10, s + 10)
      .setInteractive({ useHandCursor: true })

    zone.on('pointerover', () => paint(true))
    zone.on('pointerout', () => paint(false))
    zone.on('pointerdown', () => {
      paint(true)
      this.tweens.add({ targets: text, scale: 0.88, duration: 70, yoyo: true })
      EventBus.emit('show-tutorial')
    })
    zone.on('pointerup', () => paint(false))

    box.add([g, text, zone])
    return box
  }
}
