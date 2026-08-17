import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { LEVELS } from '../data/levels'
import { ALL_TECH } from '../data/tech'
import type { CityLocation, LevelConfig, Situation } from '../types'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'

const GAME_ID = 'cidade-das-tecnologias'

const LAYOUT = {
  streetY: 640,          // centro vertical da faixa de rua
  streetH: 130,          // altura da faixa de rua
  streetW: 1150,
  buildingBottomY: 600,  // linha do "chão" onde os prédios apoiam
  buildingW: 185,        // largura de cada prédio
  buildingH: 210,        // altura de cada prédio
  buildingGap: 42,       // espaço entre prédios
  firstBuildingX: 240,   // centro X do primeiro prédio (casa)
  labelOffsetY: 22,      // distância do rótulo abaixo do prédio
}
const BUILDING_ORDER = ['house', 'school', 'store', 'bank']
// ─────────────────────────────────────────────────────────────────

interface LocationSprite {
  location: CityLocation
  base: Phaser.GameObjects.Image
  select: Phaser.GameObjects.Image
  done: boolean
}

export class GameScene extends Phaser.Scene {
  private levelIdx = 0
  private levelConfig!: LevelConfig
  private answered = new Set<string>()
  private gameEnded = false

  private locationSprites: LocationSprite[] = []
  private panelContainer?: Phaser.GameObjects.Container
  private panelTimerEvent?: Phaser.Time.TimerEvent
  private panelTimerBar?: Phaser.GameObjects.Rectangle

  private muted = false

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { levelIndex?: number }) {
    this.levelIdx = data.levelIndex ?? 0
    this.levelConfig = LEVELS[this.levelIdx]
    this.answered = new Set()
    this.gameEnded = false
    this.locationSprites = []
    this.panelContainer = undefined
  }

  create() {
    this.add.image(640, 360, 'bg-city-map').setDisplaySize(1280, 720)
    this.buildCornerControls()

    this.showLevelIntro()
    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
  }


  private buildCornerControls() {
    this.makeIconButton(1238, 42, '?', () => this.runTutorial(true))
  }

  private makeIconButton(x: number, y: number, label: string, onDown: () => void) {
    const container = this.add.container(x, y).setDepth(90)
    const bg = this.add.graphics()
    const paint = (hover: boolean) => {
      bg.clear()
      bg.fillStyle(hover ? 0x2E7D32 : 0x07251c, 0.92)
      bg.fillRoundedRect(-24, -24, 48, 48, 14)
      bg.lineStyle(3, 0xE8F5E9, 0.95)
      bg.strokeRoundedRect(-24, -24, 48, 48, 14)
    }
    paint(false)

    const text = this.add.text(0, 0, label, {
      fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#E8F5E9',
      stroke: '#07251c', strokeThickness: 4,
    }).setOrigin(0.5)
    const hit = this.add.rectangle(0, 0, 56, 56, 0xffffff, 0.01).setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => paint(true))
    hit.on('pointerout', () => paint(false))
    hit.on('pointerdown', () => {
      this.playClick()
      this.tweens.add({ targets: container, scale: 0.92, duration: 70, yoyo: true })
      onDown()
    })
    container.add([bg, text, hit])
    return container
  }

  // ─── Introdução do nível ─────────────────────────────────────
  private showLevelIntro() {
    const container = this.add.container(0, 0).setDepth(500)
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e, 0.82).setInteractive()

    const introPanel = this.add.graphics()
    introPanel.fillStyle(0x031b15, 0.34)
    introPanel.fillRoundedRect(334, 156, 620, 392, 30)
    introPanel.fillStyle(0x0c3b2e, 0.96)
    introPanel.fillRoundedRect(243, 144, 800, 392, 30)
    introPanel.fillStyle(0x1b5e20, 0.72)
    introPanel.fillRoundedRect(243, 144, 800, 84, 30)
    introPanel.lineStyle(5, 0xA5D6A7, 0.9)
    introPanel.strokeRoundedRect(243, 144, 800, 392, 30)

    const title = this.add.text(640, 220, this.levelConfig.title, {
      fontSize: '46px', fontFamily: 'Arial Black, Arial', color: '#E8F5E9',
      stroke: '#07251c', strokeThickness: 7,
    }).setOrigin(0.5).setY(192)

    const objective = this.add.text(640, 300, this.levelConfig.objective, {
      fontSize: '35px', fontFamily: 'Arial', color: '#C8E6C9',
      align: 'center', wordWrap: { width: 760 },
    }).setOrigin(0.5)

    const tip = this.add.text(640, 400, this.levelConfig.tip, {
      fontSize: '24px', fontFamily: 'Arial', color: '#A5D6A7',
    }).setOrigin(0.5)

    const timerNote = this.levelConfig.perSituationTimer
      ? this.add.text(640, 430, `Tempo: ${this.levelConfig.perSituationTimer}s para cada resposta`, {
        fontSize: '24px', fontFamily: 'Arial Black', color: '#FFD54F',
      }).setOrigin(0.5)
      : null

    const btn = this.makeButton(640, 520, 280, 66, 'Explorar', 0x2E7D32, () => {
      this.playClick()
      this.tweens.add({
        targets: container, alpha: 0, duration: 280,
        onComplete: () => { container.destroy(); this.buildCity() },
      })
    })

    const parts: Phaser.GameObjects.GameObject[] = [overlay, introPanel, title, objective, tip, btn]
    if (timerNote) parts.push(timerNote)
    container.add(parts)
  }

  // ─── Montagem do cenário ─────────────────────────────────────
  private buildCity() {
    this.buildStreet()
    this.buildBuildings()
    this.updateProgressBadge()

    if (this.levelIdx === 0) this.runTutorial(false)
  }

  private runTutorial(force = true) {
    const buildingCx = LAYOUT.firstBuildingX
    const buildingCy = LAYOUT.buildingBottomY - LAYOUT.buildingH / 2

    const steps: TutorialStep[] = [
      {
        text: 'Toque nos lugares da cidade para descobrir uma situação.',
        shape: 'rect', x: buildingCx, y: buildingCy, w: 260, h: 280,
      },
      {
        text: 'Toque em um prédio para ver a situação daquele lugar.',
        shape: 'rect', x: buildingCx, y: buildingCy, w: 260, h: 280,
      },
      {
        text: 'Leia a pergunta, escolha a tecnologia certa entre as opções e toque em Confirmar.',
        shape: 'none', balloonY: 400, buttonLabel: 'Entendi!',
      },
    ]

    createTutorial(this, {
      key: 'cidade-l1',
      accent: 0x2E7D32,
      safeTop: 0,
      once: !force,
      onFinish: () => { /* nada a liberar: o overlay já bloqueia toques durante a tutorial */ },
      steps,
    })
  }

  private buildStreet() {
    const streetLoc = this.levelConfig.locations?.find(l => l.id === 'street')

    const base = this.add.image(640, LAYOUT.streetY, 'location-street')
      .setDisplaySize(LAYOUT.streetW, LAYOUT.streetH).setDepth(2)
    const select = this.add.image(640, LAYOUT.streetY, 'location-street-select')
      .setDisplaySize(LAYOUT.streetW, LAYOUT.streetH).setDepth(3).setAlpha(0)

    if (!streetLoc) return

    const entry: LocationSprite = { location: streetLoc, base, select, done: false }
    this.locationSprites.push(entry)
    this.makeLocationInteractive(entry)

    this.add.text(640, LAYOUT.streetY + LAYOUT.streetY / 2 + 18, 'Rua', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#E8F5E9',
      stroke: '#07251c', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(4)
  }

  private buildBuildings() {
    const activeIds = new Set((this.levelConfig.locations ?? []).map(l => l.id))
    const visible = BUILDING_ORDER.filter(id => activeIds.has(id))

    visible.forEach((id, i) => {
      const loc = this.levelConfig.locations!.find(l => l.id === id)!
      const cx = LAYOUT.firstBuildingX + i * (LAYOUT.buildingW + LAYOUT.buildingGap)
      const cy = LAYOUT.buildingBottomY - LAYOUT.buildingH / 2

      const base = this.add.image(cx, cy, loc.textureKey)
        .setDisplaySize(LAYOUT.buildingW, LAYOUT.buildingH).setDepth(3)
      const select = this.add.image(cx, cy, `${loc.textureKey}-select`)
        .setDisplaySize(LAYOUT.buildingW, LAYOUT.buildingH).setDepth(4).setAlpha(0)

      this.add.text(cx, LAYOUT.buildingBottomY - LAYOUT.buildingH - LAYOUT.labelOffsetY, loc.label, {
        fontSize: '20px', fontFamily: 'Arial Black', color: '#E8F5E9',
        stroke: '#07251c', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(4)

      const entry: LocationSprite = { location: loc, base, select, done: false }
      this.locationSprites.push(entry)
      this.makeLocationInteractive(entry)
    })
  }

  private makeLocationInteractive(entry: LocationSprite) {
    entry.base.setInteractive({ useHandCursor: true })

    entry.base.on('pointerover', () => {
      if (!entry.done && !this.panelContainer) entry.select.setAlpha(1)
    })
    entry.base.on('pointerout', () => {
      if (!entry.done) entry.select.setAlpha(0)
    })
    entry.base.on('pointerdown', () => {
      if (entry.done || this.panelContainer || this.gameEnded) return
      this.playClick()
      entry.select.setAlpha(1)
      const situation = this.levelConfig.situations.find(s => s.id === entry.location.situationId)
      if (situation) this.openSituationPanel(entry, situation)
    })
  }

  private markLocationDone(entry: LocationSprite) {
    entry.done = true
    entry.base.disableInteractive()
    entry.select.setAlpha(0)
    entry.base.setTint(0x9eb89e)
  }

  // ─── Painel da situação ──────────────────────────────────────
  private openSituationPanel(entry: LocationSprite, situation: Situation) {
    const container = this.add.container(0, 0).setDepth(600)
    this.panelContainer = container

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.56).setInteractive()

    const PW = 980, PH = 560
    const panel = this.add.graphics()
    panel.fillStyle(0x000000, 0.22)
    panel.fillRoundedRect(640 - PW / 2 + 10, 380 - PH / 2 + 14, PW, PH, 24)
    panel.fillStyle(0x0c3b2e, 0.98)
    panel.fillRoundedRect(640 - PW / 2, 380 - PH / 2, PW, PH, 24)
    panel.fillStyle(0x1B5E20, 0.78)
    panel.fillRoundedRect(640 - PW / 2, 380 - PH / 2, PW, 115, 24)
    panel.lineStyle(5, 0xA5D6A7, 0.95)
    panel.strokeRoundedRect(640 - PW / 2, 380 - PH / 2, PW, PH, 24)
    panel.lineStyle(2, 0xC8E6C9, 0.28)

    const prompt = this.add.text(640, 165, situation.prompt, {
      fontSize: '25px', fontFamily: 'Arial Black, Arial', color: '#E8F5E9',
      stroke: '#07251c', strokeThickness: 4,
      align: 'center', wordWrap: { width: PW - 120 },
    }).setOrigin(0.5)

    container.add([overlay, panel, prompt])

    let selectedId: string | null = null
    let resolved = false
    const cards: { id: string; ring: Phaser.GameObjects.Graphics; cx: number; cy: number }[] = []

    const CARD_W = 200, CARD_H = 230, CARD_GAP = 26
    const IMG = 130
    const n = situation.options.length
    const totalW = n * CARD_W + (n - 1) * CARD_GAP
    const startX = 640 - totalW / 2 + CARD_W / 2
    const cardY = 388

    const drawRing = (ring: Phaser.GameObjects.Graphics, cx: number, cy: number, color: number, thickness: number) => {
      ring.clear()
      ring.fillStyle(0x000000, 0.14)
      ring.fillRoundedRect(cx - CARD_W / 2 + 5, cy - CARD_H / 2 + 7, CARD_W, CARD_H, 18)
      ring.fillStyle(0xffffff, 0.98)
      ring.fillRoundedRect(cx - CARD_W / 2, cy - CARD_H / 2, CARD_W, CARD_H, 18)
      ring.fillStyle(0xE8F5E9, 0.5)
      ring.fillRoundedRect(cx - CARD_W / 2 + 8, cy - CARD_H / 2 + 8, CARD_W - 16, 58, 14)
      ring.lineStyle(thickness, color, 1)
      ring.strokeRoundedRect(cx - CARD_W / 2, cy - CARD_H / 2, CARD_W, CARD_H, 18)
    }

    const confirmBtn = this.makeButton(640, 580, 260, 62, 'Confirmar', 0x2E7D32, () => {
      if (resolved || !selectedId) return
      resolved = true
      this.resolveAnswer(entry, situation, selectedId, cards, drawRing, container, confirmBtn)
    })
    confirmBtn.setAlpha(0.45)

    situation.options.forEach((optId, i) => {
      const tech = ALL_TECH.find(t => t.id === optId)!
      const cx = startX + i * (CARD_W + CARD_GAP)

      const ring = this.add.graphics()
      drawRing(ring, cx, cardY, 0xB0BEC5, 3)

      const img = this.add.image(cx, cardY - 28, tech.textureKey).setDisplaySize(IMG, IMG)
      const label = this.add.text(cx, cardY + 76, tech.label, {
        fontSize: '18px', fontFamily: 'Arial Black, Arial', color: '#1B5E20',
        align: 'center', wordWrap: { width: CARD_W - 24 },
      }).setOrigin(0.5)

      const hit = this.add.rectangle(cx, cardY, CARD_W, CARD_H, 0xffffff, 0.01)
        .setInteractive({ useHandCursor: true })

      hit.on('pointerdown', () => {
        if (resolved) return
        this.playClick()
        selectedId = optId
        cards.forEach(c => drawRing(c.ring, c.cx, c.cy, c.id === optId ? 0xFFC107 : 0xB0BEC5, c.id === optId ? 6 : 3))
        confirmBtn.setAlpha(1)
      })

      cards.push({ id: optId, ring, cx, cy: cardY })
      container.add([ring, img, label, hit])
    })

    container.add(confirmBtn)

    if (this.levelConfig.perSituationTimer) {
      this.startPanelTimer(container, () => {
        if (resolved) return
        resolved = true
        this.resolveAnswer(entry, situation, null, cards, drawRing, container, confirmBtn)
      })
    }

    container.setAlpha(0)
    this.tweens.add({ targets: container, alpha: 1, duration: 220 })
  }

  private startPanelTimer(container: Phaser.GameObjects.Container, onTimeout: () => void) {
    const seconds = this.levelConfig.perSituationTimer!
    const BAR_W = 500

    const barBg = this.add.rectangle(640, 118, BAR_W + 6, 18, 0x07251c)
      .setStrokeStyle(2, 0xA5D6A7)
    this.panelTimerBar = this.add.rectangle(640 - BAR_W / 2, 118, BAR_W, 12, 0xA5D6A7).setOrigin(0, 0.5)
    container.add([barBg, this.panelTimerBar])

    this.tweens.add({
      targets: this.panelTimerBar, width: 0, duration: seconds * 1000, ease: 'Linear',
      onUpdate: () => {
        const pct = this.panelTimerBar!.width / BAR_W
        this.panelTimerBar!.setFillStyle(pct > 0.5 ? 0xA5D6A7 : pct > 0.25 ? 0xFFD54F : 0xEF5350)
      },
    })
    this.panelTimerEvent = this.time.delayedCall(seconds * 1000, onTimeout)
  }

  private resolveAnswer(
    entry: LocationSprite,
    situation: Situation,
    chosenId: string | null,
    cards: { id: string; ring: Phaser.GameObjects.Graphics; cx: number; cy: number }[],
    drawRing: (ring: Phaser.GameObjects.Graphics, cx: number, cy: number, color: number, thickness: number) => void,
    container: Phaser.GameObjects.Container,
    confirmBtn: Phaser.GameObjects.Container,
  ) {
    confirmBtn.destroy()
    this.panelTimerEvent?.remove()
    this.tweens.killTweensOf(this.panelTimerBar)

    const correct = chosenId === situation.correctId

    cards.forEach(c => {
      if (c.id === situation.correctId) drawRing(c.ring, c.cx, c.cy, 0x2E7D32, 7)
      else if (c.id === chosenId) drawRing(c.ring, c.cx, c.cy, 0xC62828, 6)
      else drawRing(c.ring, c.cx, c.cy, 0xB0BEC5, 3)
    })

    if (correct) {
      this.playCorrect()
      runtimeGameBridge.emit({
        type: 'CORRECT_ANSWER', gameId: GAME_ID,
        pointsEarned: 5, stage: this.levelConfig.level,
      })
    } else {
      this.cameras.main.shake(150, 0.006)
      this.playWrong()
      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER', gameId: GAME_ID,
        pointsEarned: -2, stage: this.levelConfig.level,
      })
    }

    const feedback = this.add.text(640, 529,
      (correct ? 'Muito bem! ' : chosenId === null ? 'O tempo acabou! ' : 'Tente outra vez. ') + situation.justification, {
      fontSize: '20px', fontFamily: 'Arial', color: correct ? '#A5D6A7' : '#FFCDD2',
      align: 'center', wordWrap: { width: 860 },
    }).setOrigin(0.5)

    const nextBtn = this.makeButton(640, 585, 240, 58, 'Continuar', 0x1565C0, () => {
      this.playClick()
      this.tweens.add({
        targets: container, alpha: 0, duration: 200,
        onComplete: () => {
          container.destroy()
          this.panelContainer = undefined
          this.answered.add(situation.id)
          this.markLocationDone(entry)
          this.updateProgressBadge()
          this.checkLevelComplete()
        },
      })
    })

    container.add([feedback, nextBtn])
  }

  // ─── Progresso / fim de nível ────────────────────────────────
  private updateProgressBadge() {
    const old = this.children.getByName('progress-badge')
    old?.destroy()

    const label = `${this.answered.size}/${this.levelConfig.situations.length}`
    const container = this.add.container(1190, 670).setDepth(80).setName('progress-badge')
    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.22)
    bg.fillRoundedRect(-76, -30, 152, 60, 18)
    bg.fillStyle(0x07251c, 0.88)
    bg.fillRoundedRect(-80, -34, 152, 60, 18)
    bg.lineStyle(3, 0xA5D6A7, 0.9)
    bg.strokeRoundedRect(-80, -34, 152, 60, 18)

    const caption = this.add.text(-4, -14, 'Missões', {
      fontSize: '13px', fontFamily: 'Arial Black, Arial', color: '#A5D6A7',
    }).setOrigin(0.5)
    const text = this.add.text(-4, 12, label, {
      fontSize: '24px', fontFamily: 'Arial Black, Arial', color: '#E8F5E9',
      stroke: '#0c3b2e', strokeThickness: 4,
    }).setOrigin(0.5)

    container.add([bg, caption, text])
  }

  private checkLevelComplete() {
    if (this.answered.size < this.levelConfig.situations.length) return
    this.gameEnded = true

    runtimeGameBridge.emit({
      type: 'CHECKPOINT', gameId: GAME_ID,
      stage: this.levelConfig.level, progress: 100, score: this.answered.size * 5,
    })

    const isLast = this.levelIdx + 1 >= LEVELS.length
    const container = this.add.container(0, 0).setDepth(700)
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e, 0.9).setInteractive()

    const title = this.add.text(640, 250, isLast ? 'Cidade Completa!' : 'Nível Concluído!', {
      fontSize: '46px', fontFamily: 'Arial Black', color: '#E8F5E9',
      stroke: '#07251c', strokeThickness: 7,
    }).setOrigin(0.5)

    // DEPOIS
    if (isLast) {
      runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })

      const subtitle = this.add.text(640, 330, 'Você explorou toda a cidade!', {
        fontSize: '24px', fontFamily: 'Arial', color: '#C8E6C9',
      }).setOrigin(0.5)

      const againBtn = this.makeButton(640, 440, 340, 66, 'Jogar de novo', 0x2E7D32, () => {
        this.playClick()
        this.scene.restart({ levelIndex: 0 })
      })

      const exitBtn = this.makeButton(640, 530, 340, 66, 'Outros jogos', 0x1565C0, () => {
        this.playClick()
        EventBus.emit('exit-game')
      })

      container.add([overlay, title, subtitle, againBtn, exitBtn])
    } else {
      const nextBtn = this.makeButton(640, 460, 300, 66, 'Próximo nível', 0x2E7D32, () => {
        this.playClick()
        this.scene.restart({ levelIndex: this.levelIdx + 1 })
      })

      container.add([overlay, title, nextBtn])
    }
  }

  // ─── Utilitários ─────────────────────────────────────────────
  private makeButton(x: number, y: number, w: number, h: number, label: string, color: number, onDown: () => void) {
    const container = this.add.container(x, y)
    const bg = this.add.graphics()
    bg.fillStyle(0x07251c, 0.5)
    bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, 16)
    bg.fillStyle(color, 1)
    bg.lineStyle(3, 0xE8F5E9, 0.9)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16)

    const text = this.add.text(0, 0, label, {
      fontSize: '22px', fontFamily: 'Arial Black, Arial', color: '#ffffff',
    }).setOrigin(0.5)

    const hit = this.add.rectangle(0, 0, w, h, 0xffffff, 0.01).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', () => {
      this.tweens.add({ targets: container, scaleX: 0.94, scaleY: 0.94, duration: 70, yoyo: true })
      onDown()
    })

    container.add([bg, text, hit])
    return container
  }

  private getAudioContext(): AudioContext | null {
    if (!('context' in this.sound)) return null
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.2, delay = 0) {
    if (this.muted) return
    const ctx = this.getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur + 0.01)
  }

  private playClick() { this.playTone(580, 0.06, 'sine', 0.12) }
  private playCorrect() { this.playTone(880, 0.12, 'triangle', 0.18); this.playTone(1180, 0.14, 'triangle', 0.14, 0.08) }
  private playWrong() { this.playTone(140, 0.3, 'sawtooth', 0.18) }
}