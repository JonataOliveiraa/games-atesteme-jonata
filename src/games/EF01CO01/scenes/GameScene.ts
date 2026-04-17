import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import type { RoundResult } from '../../../shared/types/game'
import type { GameItem, LevelConfig, ClassifierBase } from '../types'
import { LEVELS } from '../data/levels'

interface DraggableItem extends Phaser.GameObjects.Image {
  itemData: GameItem
  originX_: number
  originY_: number
}

// Posições Y fixas no layout
const ITEM_Y      = 270
const TIMER_BAR_Y = 100   // abaixo do HUD do UIScene (y=0-90)
const TIMER_BAR_W = 900

/**
 * GameScene — lógica e renderização principal do jogo Base dos Classificadores.
 *
 * Design para crianças e neurodivergentes:
 *  - Fundo céu azul + grama verde (visual amigável e reconhecível)
 *  - Bases com bordas coloridas que combinam com a regra
 *  - Feedback visual claro: estrelas explodindo no acerto, tremor no erro
 *  - Introdução de nível com contagem regressiva (3-2-1)
 *  - Celebração ao completar a rodada antes de emitir round-complete
 *  - Timer visual depletando (nível 3)
 */
export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private bases: Phaser.GameObjects.Container[] = []
  private itemSprites: DraggableItem[] = []
  private hits  = 0
  private errors = 0

  // Timer para nível 3
  private timerEvent?: Phaser.Time.TimerEvent
  private timerBar?: Phaser.GameObjects.Rectangle
  private timerBarBg?: Phaser.GameObjects.Rectangle

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
    this.hits   = 0
    this.errors = 0
  }

  create() {
    this.createBackground()
    this.createClouds()
    this.createItemTray()
    this.createBases()
    this.createItems()        // criados invisíveis — revelados após intro
    this.setupDrag()

    // Timer apenas no nível 3
    if (this.levelConfig.timeLimit) {
      this.createTimerBar()
    }

    // Listener para troca de nível vinda do GameLauncher
    EventBus.on('set-level', this.handleSetLevel, this)

    // Inicia a intro e emite scene-ready ao finalizar
    this.showLevelIntro()
  }

  update() {
    // Atualiza barra de tempo em modo contínuo (mais suave do que eventos)
    if (this.timerEvent && this.timerBar && this.timerBarBg) {
      const remaining = this.timerEvent.getRemaining()
      const total     = (this.levelConfig.timeLimit ?? 90) * 1000
      const pct       = Math.max(0, remaining / total)
      this.timerBar.setSize(TIMER_BAR_W * pct, 22)

      if (pct > 0.5)      this.timerBar.setFillStyle(0x2ECC71)   // verde
      else if (pct > 0.25) this.timerBar.setFillStyle(0xF39C12)  // laranja
      else                 this.timerBar.setFillStyle(0xE74C3C)   // vermelho
    }
  }

  shutdown() {
    EventBus.off('set-level', this.handleSetLevel, this)
    this.timerEvent?.destroy()
  }

  // ── Listener arrow (permite remover com referência exata) ───────────────

  private handleSetLevel = (data: { level: number }) => {
    if (data.level === this.levelConfig.level) return
    this.scene.restart({ level: data.level })
  }

  // ── Introdução de nível ─────────────────────────────────────────────────

  private showLevelIntro() {
    this.input.enabled = false

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.65).setDepth(50)

    // Estrelas do nível
    const starsStr = '★'.repeat(this.levelConfig.level) + '☆'.repeat(3 - this.levelConfig.level)
    this.add.text(640, 200, starsStr, {
      fontSize: '52px', color: '#FFD700',
    }).setOrigin(0.5).setDepth(51)

    // Título do nível
    const lvlLabel = this.add.text(640, 280, `NÍVEL  ${this.levelConfig.level}`, {
      fontSize: '82px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(51)

    // Regra do nível
    const ruleMap: Record<string, string> = {
      cor:     '🎨  Separe por COR!',
      forma:   '🔷  Separe por FORMA!',
      tamanho: '📏  Separe por TAMANHO!',
    }
    this.add.text(640, 380, ruleMap[this.levelConfig.criterion] ?? '', {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFF9C4',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(51)

    // Contagem regressiva
    let count = 3
    const countText = this.add.text(640, 490, '3', {
      fontSize: '96px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF6B35',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(51)

    this.tweens.add({ targets: countText, scaleX: 1.25, scaleY: 1.25, yoyo: true, duration: 400 })

    const countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--
        if (count > 0) {
          countText.setText(String(count))
          this.tweens.add({ targets: countText, scaleX: 1.25, scaleY: 1.25, yoyo: true, duration: 400 })
        } else {
          // Fade out de toda a intro
          const introObjects = [overlay, lvlLabel, countText]
          this.tweens.add({
            targets: introObjects,
            alpha: 0,
            duration: 350,
            onComplete: () => {
              introObjects.forEach(o => o.destroy())
              countdownEvent.destroy()
              this.input.enabled = true
              this.revealItems()
              // Emite scene-ready DEPOIS da intro para que UIScene veja o levelConfig correto
              EventBus.emit('scene-ready', { levelConfig: this.levelConfig })
              // Inicia timer (se nível 3)
              if (this.levelConfig.timeLimit) {
                this.startTimer()
              }
            },
          })
          // Os textos extras (estrelas, regra) também somem
          this.children.list
            .filter(o => (o as { depth?: number }).depth === 51 && o !== lvlLabel && o !== countText)
            .forEach(o => this.tweens.add({ targets: o, alpha: 0, duration: 350 }))
        }
      },
    })
  }

  // ── Revelar itens (após intro) ──────────────────────────────────────────

  private revealItems() {
    this.itemSprites.forEach((sprite, i) => {
      this.tweens.add({
        targets: sprite,
        alpha: 1,
        scaleX: { from: 0.4, to: 1 },
        scaleY: { from: 0.4, to: 1 },
        y:      { from: sprite.originY_ + 30, to: sprite.originY_ },
        delay:  i * 85,
        duration: 320,
        ease: 'Back.Out',
      })
    })
  }

  // ── Fundo ────────────────────────────────────────────────────────────────

  private createBackground() {
    // Céu
    this.add.rectangle(640, 240, 1280, 480, 0x87CEEB)
    // Gradiente superior (azul mais claro)
    this.add.rectangle(640, 80, 1280, 160, 0xB3E5FC, 0.5)

    // Grama
    this.add.rectangle(640, 600, 1280, 240, 0x66BB6A)
    // Faixa escura no topo da grama (detalhe de chão)
    this.add.rectangle(640, 482, 1280, 8, 0x388E3C)

    // Sol (canto superior direito)
    this.add.circle(1180, 72, 48, 0xFFD700)
    // Raios do sol
    const sunGfx = this.add.graphics()
    sunGfx.lineStyle(5, 0xFFD700, 0.8)
    for (let i = 0; i < 8; i++) {
      const a  = (i / 8) * Math.PI * 2
      const r1 = 58, r2 = 78
      sunGfx.lineBetween(
        1180 + Math.cos(a) * r1, 72 + Math.sin(a) * r1,
        1180 + Math.cos(a) * r2, 72 + Math.sin(a) * r2,
      )
    }

    // Flores decorativas na grama
    const flowerColors = [0xFF8F00, 0xE91E63, 0x9C27B0, 0xF44336]
    for (let i = 0; i < 8; i++) {
      const x = 80 + i * 155 + Phaser.Math.Between(-20, 20)
      const y = 510 + Phaser.Math.Between(0, 20)
      const color = flowerColors[i % flowerColors.length]
      this.add.circle(x, y,      10, color)
      this.add.circle(x - 8, y,  7,  color)
      this.add.circle(x + 8, y,  7,  color)
      this.add.circle(x, y - 8,  7,  color)
      this.add.circle(x, y + 8,  7,  color)
      this.add.circle(x, y,      6,  0xFFFF88)  // centro amarelo
      this.add.rectangle(x, y + 20, 3, 18, 0x388E3C)
    }
  }

  // ── Nuvens ───────────────────────────────────────────────────────────────

  private createClouds() {
    const positions = [
      { x: 130, y: 120 }, { x: 380, y: 90 },
      { x: 660, y: 140 }, { x: 950, y: 100 },
    ]

    positions.forEach((pos, i) => {
      const scale = 0.7 + (i % 2) * 0.3
      const gfx = this.add.graphics()
      gfx.fillStyle(0xFFFFFF, 0.88)

      // Nuvem: 3 elipses sobrepostas
      gfx.fillEllipse(0,   0,  120 * scale, 50 * scale)
      gfx.fillEllipse(-32 * scale, 6 * scale,  72 * scale, 44 * scale)
      gfx.fillEllipse( 32 * scale, 6 * scale,  72 * scale, 44 * scale)

      gfx.setPosition(pos.x, pos.y)

      // Movimento suave (drift)
      this.tweens.add({
        targets: gfx,
        x: pos.x + 22,
        duration: 5000 + i * 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    })
  }

  // ── Bandeja de itens (estática) ──────────────────────────────────────────

  private createItemTray() {
    // Plataforma de madeira onde os itens ficam
    const trayY = ITEM_Y + 40
    const gfx = this.add.graphics()

    // Sombra da bandeja
    gfx.fillStyle(0x000000, 0.15)
    gfx.fillRect(30, trayY + 6, 1220, 30)

    // Plataforma principal (madeira)
    gfx.fillStyle(0xA0522D, 1)
    gfx.fillRect(30, trayY, 1220, 28)

    // Faixa mais clara no topo (reflexo)
    gfx.fillStyle(0xC4813A, 1)
    gfx.fillRect(30, trayY, 1220, 8)

    // Faixa mais escura na base
    gfx.fillStyle(0x7B3F1A, 1)
    gfx.fillRect(30, trayY + 22, 1220, 6)

    // Parafusos decorativos
    gfx.fillStyle(0x8B6914, 1)
    for (let x = 80; x < 1220; x += 160) {
      gfx.fillCircle(x, trayY + 14, 6)
      gfx.fillStyle(0xD4AF37, 0.6)
      gfx.fillCircle(x, trayY + 14, 4)
      gfx.fillStyle(0x8B6914, 1)
    }
  }

  // ── Bases receptoras ─────────────────────────────────────────────────────

  private createBases() {
    this.bases = []
    for (const baseData of this.levelConfig.bases) {
      this.bases.push(this.createBase(baseData))
    }
  }

  private createBase(baseData: ClassifierBase): Phaser.GameObjects.Container {
    const w = 210
    const h = 145
    const borderColor = this.getBaseColor(baseData)
    const headerY = -h / 2 + 22

    const shadow = this.add.rectangle(5, 5, w, h, 0x000000, 0.18)

    const panel = this.add.rectangle(0, 0, w, h, 0xFFFFFF, 0.95)
    panel.setStrokeStyle(6, borderColor)

    // Cabeçalho totalmente opaco (sem alpha)
    const header = this.add.rectangle(0, headerY, w, 44, borderColor)

    // Rótulo no cabeçalho (texto branco sobre cor viva)
    const headerLabel = this.add.text(0, headerY, baseData.labelKey, {
      fontSize: '19px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5)

    // Ícone desenhado com Graphics no painel branco
    const iconGfx = this.drawBaseIcon(baseData)
    iconGfx.setPosition(0, 10)

    const arrow = this.add.text(0, h / 2 - 14, '▼', {
      fontSize: '16px', color: '#888888',
    }).setOrigin(0.5)

    const zone = this.add.zone(0, 0, w, h)
    zone.setRectangleDropZone(w, h)

    const container = this.add.container(baseData.x, baseData.y, [shadow, panel, header, headerLabel, iconGfx, arrow, zone])
    container.setData('baseData', baseData)
    return container
  }

  private drawBaseIcon(baseData: ClassifierBase): Phaser.GameObjects.Graphics {
    const gfx = this.add.graphics()
    const { attribute, value } = baseData.rule
    const sz = 18
    const themeColor = this.getBaseColor(baseData)

    if (attribute === 'cor') {
      const colorMap: Record<string, number> = {
        vermelho: 0xE53935, azul: 0x1E88E5, verde: 0x43A047, amarelo: 0xFDD835,
      }
      const fill = colorMap[value] ?? 0x9E9E9E
      // Mini item idêntico aos itens do jogo: sombra + preenchimento + contorno + brilho
      gfx.fillStyle(0x000000, 0.22)
      gfx.fillCircle(3, 3, sz)
      gfx.fillStyle(fill, 1)
      gfx.fillCircle(0, 0, sz)
      gfx.lineStyle(3, 0x000000, 0.5)
      gfx.strokeCircle(0, 0, sz)
      gfx.fillStyle(0xFFFFFF, 0.45)
      gfx.fillCircle(-sz * 0.28, -sz * 0.28, sz * 0.25)
      return gfx
    }

    if (attribute === 'forma') {
      // Forma desenhada com a cor temática da base
      const fill = themeColor
      switch (value) {
        case 'circulo':
          gfx.fillStyle(0x000000, 0.22)
          gfx.fillCircle(3, 3, sz)
          gfx.fillStyle(fill, 1)
          gfx.fillCircle(0, 0, sz)
          gfx.lineStyle(3, 0x000000, 0.5)
          gfx.strokeCircle(0, 0, sz)
          gfx.fillStyle(0xFFFFFF, 0.45)
          gfx.fillCircle(-sz * 0.28, -sz * 0.28, sz * 0.25)
          break

        case 'quadrado':
          gfx.fillStyle(0x000000, 0.22)
          gfx.fillRect(3 - sz, 3 - sz, sz * 2, sz * 2)
          gfx.fillStyle(fill, 1)
          gfx.fillRect(-sz, -sz, sz * 2, sz * 2)
          gfx.lineStyle(3, 0x000000, 0.5)
          gfx.strokeRect(-sz, -sz, sz * 2, sz * 2)
          gfx.fillStyle(0xFFFFFF, 0.45)
          gfx.fillRect(-sz + 4, -sz + 4, sz * 0.55, sz * 0.55)
          break

        case 'triangulo': {
          gfx.fillStyle(0x000000, 0.22)
          gfx.fillTriangle(3, -sz + 3, -sz + 3, sz + 3, sz + 3, sz + 3)
          gfx.fillStyle(fill, 1)
          gfx.fillTriangle(0, -sz, -sz, sz, sz, sz)
          gfx.lineStyle(3, 0x000000, 0.5)
          gfx.strokeTriangle(0, -sz, -sz, sz, sz, sz)
          gfx.fillStyle(0xFFFFFF, 0.45)
          gfx.fillCircle(0, -sz * 0.1, sz * 0.22)
          break
        }
      }
    }

    return gfx
  }

  // ── Itens arrastáveis ────────────────────────────────────────────────────

  private createItems() {
    this.itemSprites = []
    const items  = Phaser.Utils.Array.Shuffle([...this.levelConfig.items])
    const n      = items.length
    const gap    = Math.min(125, Math.floor(1100 / Math.max(1, n - 1)))
    const startX = 640 - ((n - 1) * gap) / 2

    items.forEach((item, i) => {
      const x   = startX + i * gap
      const key = `item-${item.color}-${item.shape}-${item.size}`

      const sprite = this.add.image(x, ITEM_Y, key) as DraggableItem
      sprite.itemData  = item
      sprite.originX_  = x
      sprite.originY_  = ITEM_Y
      sprite.setAlpha(0)    // revelado em revealItems()
      sprite.setInteractive()
      this.input.setDraggable(sprite)
      this.itemSprites.push(sprite)
    })
  }

  // ── Timer (nível 3) ──────────────────────────────────────────────────────

  private createTimerBar() {
    // Chamado em create() antes da intro, mas a barra só aparece visível no startTimer()
    this.timerBarBg = this.add.rectangle(640, TIMER_BAR_Y, TIMER_BAR_W + 8, 30, 0x263238, 0.5)
      .setStrokeStyle(2, 0x546E7A)
      .setDepth(5)
      .setAlpha(0)  // visível após intro

    this.timerBar = this.add.rectangle(640 - TIMER_BAR_W / 2, TIMER_BAR_Y, 0, 22, 0x2ECC71)
      .setOrigin(0, 0.5)
      .setDepth(5)
      .setAlpha(0)
  }

  private startTimer() {
    if (!this.timerBar || !this.timerBarBg) return

    this.timerBarBg.setAlpha(1)
    this.timerBar.setAlpha(1).setSize(TIMER_BAR_W, 22)

    const timeLimit = this.levelConfig.timeLimit ?? 90
    this.timerEvent = this.time.addEvent({
      delay: timeLimit * 1000,
      callback: this.onTimeUp,
      callbackScope: this,
    })
  }

  private onTimeUp() {
    this.endRound()
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────

  private setupDrag() {
    this.input.on('dragstart', (_: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image) => {
      obj.setDepth(10)
      this.tweens.add({ targets: obj, scaleX: 1.15, scaleY: 1.15, duration: 120 })
    })

    this.input.on('drag', (_: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      obj.setPosition(dragX, dragY)
      // Leve inclinação enquanto arrasta
      obj.setAngle(7)
    })

    this.input.on('dragend', (_: Phaser.Input.Pointer, obj: DraggableItem, dropped: boolean) => {
      obj.setDepth(0).setAngle(0)
      this.tweens.add({ targets: obj, scaleX: 1, scaleY: 1, duration: 120 })
      if (!dropped) this.returnItem(obj)
    })

    this.input.on('drop', (_: Phaser.Input.Pointer, obj: DraggableItem, zone: Phaser.GameObjects.Zone) => {
      const container = zone.parentContainer
      if (!container) { this.returnItem(obj); return }
      const baseData = container.getData('baseData') as ClassifierBase
      this.validateDrop(obj, container, baseData)
    })
  }

  // ── Validação de drop ─────────────────────────────────────────────────────

  private validateDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container, base: ClassifierBase) {
    const attrValue = this.getItemAttrValue(item.itemData, base.rule.attribute)
    const correct   = attrValue === base.rule.value

    if (correct) {
      this.hits++
      EventBus.emit('game-event', {
        type: 'CORRECT_ANSWER',
        gameId: 'EF01CO01',
        stage: this.levelConfig.level,
        pointsEarned: 10,
      })
      this.onCorrectDrop(item, baseContainer)
    } else {
      this.errors++
      EventBus.emit('game-event', {
        type: 'WRONG_ANSWER',
        gameId: 'EF01CO01',
        stage: this.levelConfig.level,
        pointsEarned: -5,
      })
      this.onWrongDrop(item, baseContainer)
    }
  }

  private onCorrectDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    item.setVisible(false)
    item.disableInteractive()

    // Iluminação da base (borda dourada temporária)
    const panel = baseContainer.list[1] as Phaser.GameObjects.Rectangle
    const originalStroke = this.getBaseColor(baseContainer.getData('baseData') as ClassifierBase)
    panel.setStrokeStyle(8, 0xFFD700)
    this.time.delayedCall(500, () => panel.setStrokeStyle(6, originalStroke))

    // Scale bounce
    this.tweens.add({
      targets: baseContainer,
      scaleX: { from: 1, to: 1.12 },
      scaleY: { from: 1, to: 1.12 },
      yoyo: true,
      duration: 140,
    })

    // Explosão de estrelas no ponto do item
    this.showCorrectEffect(item.originX_, item.originY_)

    this.emitProgress()
    this.checkRoundComplete()
  }

  private onWrongDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    this.returnItem(item)

    // Shake rápido na base
    const origX = (baseContainer.getData('baseData') as ClassifierBase).x
    this.tweens.add({
      targets:  baseContainer,
      x:        { from: origX - 10, to: origX + 10 },
      yoyo:     true,
      duration: 55,
      repeat:   4,
      onComplete: () => baseContainer.setX(origX),
    })

    // Símbolo "X" flutuando
    const xText = this.add.text(item.x, item.y - 20, '✖', {
      fontSize: '36px', color: '#E74C3C', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20)
    this.tweens.add({
      targets: xText, y: item.y - 70, alpha: { from: 1, to: 0 }, duration: 600,
      onComplete: () => xText.destroy(),
    })

    this.emitProgress()
  }

  private returnItem(item: DraggableItem) {
    this.tweens.add({
      targets: item,
      x: item.originX_,
      y: item.originY_,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      ease: 'Back.Out',
      duration: 380,
    })
  }

  // ── Efeito de acerto ──────────────────────────────────────────────────────

  private showCorrectEffect(x: number, y: number) {
    const emojis = ['⭐', '✨', '🌟']
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const dist  = 55 + Math.random() * 45
      const star  = this.add.text(x, y, emojis[i % emojis.length], {
        fontSize: `${18 + Math.floor(Math.random() * 14)}px`,
      }).setOrigin(0.5).setDepth(20)

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 1, to: 0.2 },
        scaleY: { from: 1, to: 0.2 },
        duration: 550 + Math.random() * 250,
        ease: 'Power2',
        onComplete: () => star.destroy(),
      })
    }

    // Checkmark flutuante
    const check = this.add.text(x, y - 10, '✅', { fontSize: '42px' })
      .setOrigin(0.5).setDepth(20)
    this.tweens.add({
      targets: check,
      y: y - 70,
      alpha: { from: 1, to: 0 },
      duration: 700,
      ease: 'Power2.easeOut',
      onComplete: () => check.destroy(),
    })
  }

  // ── Fim de rodada ─────────────────────────────────────────────────────────

  private checkRoundComplete() {
    const remaining = this.itemSprites.filter(s => s.visible).length
    if (remaining === 0) this.endRound()
  }

  private endRound() {
    this.input.enabled = false
    this.timerEvent?.destroy()

    if (this.errors === 0) {
      EventBus.emit('game-event', {
        type: 'NO_ERROR_BONUS', gameId: 'EF01CO01',
        stage: this.levelConfig.level, pointsEarned: 10,
      })
    }

    this.showRoundComplete()

    // Emite o resultado após a animação de celebração
    this.time.delayedCall(1800, () => {
      const result: RoundResult = {
        gameCode: 'EF01CO01',
        level: this.levelConfig.level,
        criterion: this.levelConfig.criterion,
        hits: this.hits,
        errors: this.errors,
        durationMs: Date.now(),
        timestamp: Date.now(),
      }
      EventBus.emit('round-complete', result)
    })
  }

  // ── Celebração de rodada completa ─────────────────────────────────────────

  private showRoundComplete() {
    // Overlay escuro
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.55).setDepth(45)

    // Texto principal
    const mainText = this.add.text(640, 290, 'INCRÍVEL! 🌟', {
      fontSize: '78px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 9,
    }).setOrigin(0.5).setDepth(46).setAlpha(0)

    this.tweens.add({
      targets:  mainText,
      alpha:    1,
      scaleX:   { from: 0.4, to: 1 },
      scaleY:   { from: 0.4, to: 1 },
      duration: 380,
      ease:     'Back.Out',
    })

    // Resultado
    const resultText = this.add.text(
      640, 400,
      `✅  ${this.hits}   ✖  ${this.errors}`,
      { fontSize: '38px', color: '#FFFFFF', stroke: '#000', strokeThickness: 5 },
    ).setOrigin(0.5).setDepth(46).setAlpha(0)

    this.tweens.add({ targets: resultText, alpha: 1, delay: 300, duration: 300 })

    // Estrelas caindo do topo
    const starEmojis = ['⭐', '🌟', '✨', '💫']
    for (let i = 0; i < 22; i++) {
      const sx = Phaser.Math.Between(60, 1220)
      const sy = Phaser.Math.Between(-60, -10)
      const em = starEmojis[i % starEmojis.length]
      const sz = `${Phaser.Math.Between(20, 44)}px`

      const star = this.add.text(sx, sy, em, { fontSize: sz }).setDepth(46)
      this.tweens.add({
        targets: star,
        y:       Phaser.Math.Between(380, 680),
        x:       sx + Phaser.Math.Between(-80, 80),
        alpha:   { from: 1, to: 0.1 },
        angle:   Phaser.Math.Between(-45, 45),
        duration: Phaser.Math.Between(900, 1800),
        delay:    Phaser.Math.Between(0, 600),
        onComplete: () => star.destroy(),
      })
    }

    // Limpa overlay após animação (round-complete já foi emitido por endRound)
    this.time.delayedCall(2200, () => {
      overlay.destroy()
      mainText.destroy()
      resultText.destroy()
    })
  }

  // ── Progresso ─────────────────────────────────────────────────────────────

  private emitProgress() {
    const total     = this.itemSprites.length
    const remaining = this.itemSprites.filter(s => s.visible).length
    EventBus.emit('update-progress', {
      pct:    (total - remaining) / total,
      hits:   this.hits,
      errors: this.errors,
    })
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private getItemAttrValue(item: GameItem, attribute: string): string {
    if (attribute === 'cor')     return item.color
    if (attribute === 'forma')   return item.shape
    if (attribute === 'tamanho') return item.size
    return ''
  }

  /** Cor da borda/cabeçalho da base, mapeada ao valor da regra */
  private getBaseColor(baseData: ClassifierBase): number {
    const { attribute, value } = baseData.rule

    if (attribute === 'cor') {
      const map: Record<string, number> = {
        vermelho: 0xE53935,
        azul:     0x1E88E5,
        verde:    0x43A047,
        amarelo:  0xFDD835,
      }
      return map[value] ?? 0x9E9E9E
    }

    if (attribute === 'forma') {
      const map: Record<string, number> = {
        circulo:   0xAB47BC,
        quadrado:  0xFF7043,
        triangulo: 0x26C6DA,
        retangulo: 0x8BC34A,
      }
      return map[value] ?? 0x9E9E9E
    }

    return 0xFFB300
  }

}
