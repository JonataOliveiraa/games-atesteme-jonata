import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { LEVELS } from '../data/levels'
import { ALL_SECURITY_ITEMS } from '../data/items'
import type { ChecklistRound, GameSceneData, LevelConfig, SecurityItem } from '../types'
import {
  W, H, C, hex, label, paperCard, headerBand,
  chunkyButton, floatingNote, confetti, type Btn,
} from '../ui/kit'

const GAME_ID = 'checklist-do-jogador-seguro'

const HUD_BOTTOM = 190
const GRID = { top: 206, bottom: 590 }
const CARD_W = 220, CARD_H = 178, CARD_GAP = 22
const CONFIRM_Y = 640

type CardState = 'idle' | 'correct' | 'wrong'

interface CardView {
  root: Phaser.GameObjects.Container
  itemId: string
  isOn: () => boolean
  paint: (state: CardState) => void
  lock: (v: boolean) => void
}

export class GameScene extends Phaser.Scene {
  private levelIdx = 0
  private roundIdx = 0
  private score = 0
  private hits = 0
  private errors = 0
  private attempts = 0

  private locked = true
  private ended = false
  private bonusLost = false

  private cards: CardView[] = []
  private confirmBtn!: Btn

  private delayedTimer?: Phaser.Time.TimerEvent
  private awaitingRisk = false

  private unsubPlatform?: () => void
  private muted = false

  constructor() { super({ key: 'GameScene' }) }

  init(data: GameSceneData) {
    this.levelIdx = Phaser.Math.Clamp((data?.level ?? 1) - 1, 0, LEVELS.length - 1)
    this.roundIdx = Phaser.Math.Clamp(data?.round ?? 0, 0, this.level.rounds.length - 1)
    this.score = data?.score ?? 0
    this.hits = data?.hits ?? 0
    this.errors = data?.errors ?? 0

    this.attempts = 0
    this.locked = true
    this.ended = false
    this.cards = []
    this.delayedTimer = undefined
    this.awaitingRisk = false
    this.bonusLost = false
  }

  private get level(): LevelConfig { return LEVELS[this.levelIdx] }
  private get round(): ChecklistRound { return this.level.rounds[this.roundIdx] }

  create() {
    this.dimHud(false)

    this.buildBackground()
    this.buildConfirm()
    this.buildRound()
    this.registerEvents()

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMission()
    this.emitCheckpoint()

    if (this.levelIdx === 0 && this.roundIdx === 0) {
      this.runTutorial(true, () => this.startRound())
    } else {
      this.startRound()
    }
  }

  private dimHud(on: boolean) { EventBus.emit('hud-dim', on) }

  private broadcastMission() {
    EventBus.emit('mission-update', {
      instruction: this.round.question,
      hint: this.round.hint,
      roundIndex: this.roundIdx,
      totalRounds: this.level.rounds.length,
      level: this.level.level,
    })
  }

  private buildBackground() {
    this.add.image(W / 2, H / 2, 'bg-device')
      .setDisplaySize(W, H).setDepth(-100).setTint(0x8ea8c0)
  }

  private buildConfirm() {
    this.confirmBtn = chunkyButton(this, W / 2, CONFIRM_Y, 380, 68, 'Conferir checklist',
      C.mint, C.mintDeep, () => this.confirm(), { size: 24 })
    this.confirmBtn.root.setDepth(10)
  }

  // ═════════════════════════════════════════════════ rodada

  /** Linhas centradas individualmente: com 5 itens, a última fica no meio. */
  private slots(count: number) {
    const cols = count <= 3 ? count : count <= 4 ? 2 : 3
    const rows = Math.ceil(count / cols)
    const blockH = rows * CARD_H + (rows - 1) * CARD_GAP
    const top = GRID.top + ((GRID.bottom - GRID.top) - blockH) / 2

    const out: Array<{ x: number; y: number }> = []
    for (let r = 0; r < rows; r++) {
      const inRow = Math.min(cols, count - r * cols)
      const rowW = inRow * CARD_W + (inRow - 1) * CARD_GAP
      const x0 = W / 2 - rowW / 2 + CARD_W / 2
      for (let c = 0; c < inRow; c++) {
        out.push({
          x: x0 + c * (CARD_W + CARD_GAP),
          y: top + r * (CARD_H + CARD_GAP) + CARD_H / 2,
        })
      }
    }
    return out
  }

  private buildRound() {
    const round = this.round
    const total = round.items.length + (round.delayedItem ? 1 : 0)
    const pos = this.slots(total)

    round.items.forEach((state, i) => {
      const item = ALL_SECURITY_ITEMS.find(it => it.id === state.itemId)!
      this.cards.push(this.makeCard(item, state.initialOn, pos[i].x, pos[i].y, i))
    })

    this.broadcastMission()

    if (round.delayedItem) {
      this.awaitingRisk = true
      const slot = pos[round.items.length]
      this.delayedTimer = this.time.delayedCall(round.delayedItem.appearAfterMs, () => {
        if (this.ended) return
        const item = ALL_SECURITY_ITEMS.find(it => it.id === round.delayedItem!.itemId)!
        const delayedCard = this.makeCard(
          item,
          round.delayedItem!.initialOn,
          slot.x,
          slot.y,
          0,
          true,
        )

        this.cards.push(delayedCard)
        this.awaitingRisk = false

        delayedCard.lock(this.locked || this.ended)

        this.refreshConfirm()
        this.showRiskAlert(round.delayedItem!.alertText)
        this.playAlert()
      })
    }
  }

  private makeCard(
    item: SecurityItem, initialOn: boolean, cx: number, cy: number,
    order: number, urgent = false,
  ): CardView {
    const root = this.add.container(cx, cy).setDepth(5)
    let on = initialOn
    let locked = true

    const body = this.add.graphics()
    const icon = this.add.image(0, -50, item.iconKey).setDisplaySize(72, 72)
    const name = label(this, 0, 8, item.label, { size: 17, color: C.ink, wrap: CARD_W - 34 })
    const toggle = this.add.graphics()
    const toggleTxt = label(this, 0, 56, '', { size: 16, color: C.white })
    const badge = this.add.graphics()

    // Interruptor desenhado: o texto dentro dele é o que garante leitura no celular
    const paintToggle = () => {
      const tw = 158, th = 46
      toggle.clear()
      toggle.fillStyle(on ? C.mintDeep : C.slateDeep, 1)
      toggle.fillRoundedRect(-tw / 2, 56 - th / 2, tw, th, th / 2)
      toggle.fillStyle(on ? C.mint : C.slate, 1)
      toggle.fillRoundedRect(-tw / 2, 56 - th / 2, tw, th - 4, th / 2)
      const kx = on ? tw / 2 - 20 : -tw / 2 + 20
      toggle.fillStyle(C.shadow, 0.12); toggle.fillCircle(kx, 59, 15)
      toggle.fillStyle(C.white, 1); toggle.fillCircle(kx, 54, 15)
      toggleTxt.setText(on ? 'LIGADO' : 'DESLIGADO')
      toggleTxt.setX(on ? -18 : 20)
    }

    const paint = (state: CardState) => {
      const edge = state === 'correct' ? C.mint : state === 'wrong' ? C.coral : C.paperShade
      const width = state === 'idle' ? 3 : 6
      body.clear()
      body.fillStyle(C.shadow, 0.14)
      body.fillRoundedRect(-CARD_W / 2, -CARD_H / 2 + 8, CARD_W, CARD_H, 20)
      body.fillStyle(C.paper, 1)
      body.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20)
      body.lineStyle(width, edge, 1)
      body.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20)

      badge.clear()
      if (state === 'idle') return
      const bx = CARD_W / 2 - 24, by = -CARD_H / 2 + 24
      badge.fillStyle(state === 'correct' ? C.mintDeep : C.coralDeep, 1)
      badge.fillCircle(bx, by, 17)
      badge.lineStyle(4, C.white, 1)
      if (state === 'correct') {
        badge.lineBetween(bx - 7, by, bx - 2, by + 6)
        badge.lineBetween(bx - 2, by + 6, bx + 8, by - 6)
      } else {
        badge.lineBetween(bx - 6, by - 6, bx + 6, by + 6)
        badge.lineBetween(bx + 6, by - 6, bx - 6, by + 6)
      }
    }

    paintToggle()
    paint('idle')

    const hit = this.add.zone(0, 0, CARD_W, CARD_H).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', () => {
      if (locked || this.ended) return
      on = !on
      paintToggle()
      paint('idle')
      this.playTick()
      this.tweens.add({ targets: root, scale: 0.96, duration: 80, yoyo: true })
    })

    root.add([body, icon, name, toggle, toggleTxt, badge, hit])

    if (urgent) {
      root.setAlpha(0).setScale(0.5)
      this.tweens.add({ targets: root, alpha: 1, scale: 1, duration: 380, ease: 'Back.easeOut' })
      const ring = this.add.graphics({ x: cx, y: cy }).setDepth(6)
      ring.lineStyle(6, C.coral, 1)
      ring.strokeRoundedRect(-CARD_W / 2 - 6, -CARD_H / 2 - 6, CARD_W + 12, CARD_H + 12, 24)
      this.tweens.add({
        targets: ring, alpha: 0.15, duration: 500, yoyo: true, repeat: 4,
        onComplete: () => ring.destroy(),
      })
    } else {
      root.setAlpha(0).setScale(0.8)
      this.tweens.add({
        targets: root, alpha: 1, scale: 1,
        duration: 340, delay: order * 70, ease: 'Back.easeOut',
      })
    }

    return { root, itemId: item.id, isOn: () => on, paint, lock: (v) => { locked = v } }
  }

  private showRiskAlert(text: string) {
    const root = this.add.container(W / 2, 250).setDepth(300)
    const t = label(this, 18, 0, text, { size: 21, color: C.white, wrap: 660 })
    const w = Math.max(520, t.width + 110), h = t.height + 34

    const g = this.add.graphics()
    g.fillStyle(C.coralDeep, 1); g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
    g.fillStyle(C.coral, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(C.white, 0.24); g.fillRoundedRect(-w / 2 + 14, -h / 2 + 6, w - 28, h * 0.3, h / 4)
    // Sinal de atenção desenhado, sem depender de glifo
    g.fillStyle(C.white, 1); g.fillCircle(-w / 2 + 36, 0, 16)
    g.fillStyle(C.coralDeep, 1)
    g.fillRoundedRect(-w / 2 + 34, -9, 4, 12, 2)
    g.fillCircle(-w / 2 + 36, 8, 2.8)

    root.add([g, t])
    root.setAlpha(0).setY(210)
    this.tweens.add({ targets: root, alpha: 1, y: 250, duration: 300, ease: 'Back.easeOut' })
    this.tweens.add({
      targets: root, alpha: 0, y: 210, delay: 3200, duration: 300,
      onComplete: () => root.destroy(),
    })
    this.cameras.main.shake(200, 0.004)
  }

  private startRound() {
    this.locked = false
    this.cards.forEach(c => c.lock(false))
    this.refreshConfirm()
    EventBus.emit('timer-start', this.level.timeLimit)
  }

  private refreshConfirm() {
    if (this.awaitingRisk) {
      this.confirmBtn.setLabel('Analisando o sistema...')
      this.confirmBtn.setEnabled(false)
      return
    }
    this.confirmBtn.setLabel('Conferir checklist')
    this.confirmBtn.setEnabled(!this.locked && !this.ended)
  }

  // ═════════════════════════════════════════════════ conferência

  private confirm() {
    if (this.locked || this.ended || this.awaitingRisk) return

    this.locked = true
    this.attempts += 1
    EventBus.emit('timer-pause')
    this.cards.forEach(c => c.lock(true))
    this.confirmBtn.setEnabled(false)

    const wrong: SecurityItem[] = []
    this.cards.forEach((card) => {
      const item = ALL_SECURITY_ITEMS.find(it => it.id === card.itemId)!
      const ok = card.isOn() === item.shouldBeOn
      card.paint(ok ? 'correct' : 'wrong')
      if (!ok) {
        wrong.push(item)
        const homeX = card.root.x
        this.tweens.add({
          targets: card.root, x: homeX + 8,
          duration: 60, yoyo: true, repeat: 2,
          onComplete: () => card.root.setX(homeX),
        })
      }
    })

    if (!wrong.length) { this.succeed(); return }

    this.errors += wrong.length
    this.playError()
    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level,
    })
    this.emitCheckpoint()

    // Não avança: explica, devolve os cartões e espera a correção.
    this.time.delayedCall(900, () => this.showReviewPanel(wrong))
  }

  private showReviewPanel(wrong: SecurityItem[]) {
    this.dimHud(true)

    const shown = wrong.slice(0, 4)
    const rowH = 82
    const MH = 226 + shown.length * rowH
    const MW = 720

    const dim = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.66)
      .setDepth(320).setInteractive()
    const modal = this.add.container(W / 2, H / 2).setDepth(321)

    modal.add(paperCard(this, 0, 0, MW, MH, { edge: C.coral }))
    modal.add(headerBand(this, 0, -MH / 2 + 6, MW - 12, 46, C.coral, C.coralDeep, 20))
    modal.add(label(this, 0, -MH / 2 + 29, 'VAMOS REVISAR', { size: 19, color: C.white }))
    modal.add(label(this, 0, -MH / 2 + 90,
      shown.length === 1 ? 'Um item ficou fora do lugar' : `${shown.length} itens ficaram fora do lugar`,
      { size: 27, color: C.ink }))

    shown.forEach((item, i) => {
      const y = -MH / 2 + 148 + i * rowH
      const strip = this.add.graphics()
      strip.fillStyle(C.paperEdge, 1)
      strip.fillRoundedRect(-MW / 2 + 34, y - 32, MW - 68, 68, 16)
      modal.add(strip)
      modal.add(this.add.image(-MW / 2 + 74, y, item.iconKey).setDisplaySize(46, 46))

      const state = label(this, -MW / 2 + 112, y - 15,
        item.shouldBeOn ? 'DEVE FICAR LIGADO' : 'DEVE FICAR DESLIGADO',
        { size: 15, color: item.shouldBeOn ? C.mintDeep : C.coralDeep })
      state.setOrigin(0, 0.5)
      modal.add(state)

      const why = label(this, -MW / 2 + 112, y + 12, item.why,
        { size: 15, color: C.inkSoft, weight: 'bold', wrap: MW - 190, align: 'left' })
      why.setOrigin(0, 0.5)
      modal.add(why)
    })

    const close = () => {
      this.tweens.add({
        targets: [modal, dim], alpha: 0, duration: 200,
        onComplete: () => {
          modal.destroy(); dim.destroy()
          this.dimHud(false)
          // Só os errados continuam sinalizados; os certos voltam ao neutro
          this.cards.forEach((card) => {
            const item = ALL_SECURITY_ITEMS.find(it => it.id === card.itemId)!
            card.paint(card.isOn() === item.shouldBeOn ? 'idle' : 'wrong')
          })
          this.locked = false
          EventBus.emit('timer-resume')
          this.cards.forEach(c => c.lock(false))
          this.refreshConfirm()
          floatingNote(this, W / 2, 340, 'Corrija os itens marcados e confira de novo',
            { tone: C.sky, deep: C.skyDeep })
        },
      })
    }

    modal.add(chunkyButton(this, 0, MH / 2 - 58, 300, 62, 'Vou corrigir',
      C.sky, C.skyDeep, close, { size: 22 }).root)

    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private succeed() {
    this.hits += 1
    const clean = this.attempts === 1
    const gained = 10 + (clean ? 5 : 0) + (this.bonusLost ? 0 : 3)
    this.score += gained

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: gained, stage: this.level.level,
    })
    this.emitCheckpoint()
    this.playCorrect()
    EventBus.emit('timer-stop')

    this.cards.forEach((card, i) => {
      const homeY = card.root.y
      this.tweens.add({
        targets: card.root, y: homeY - 14,
        duration: 200, delay: i * 60, yoyo: true, ease: 'Sine.easeOut',
      })
    })

    floatingNote(this, W / 2, 340,
      clean ? `Checklist perfeito de primeira. +${gained}` : `Agora sim. +${gained}`,
      { tone: C.mint, deep: C.mintDeep })

    this.time.delayedCall(1500, () => this.advance())
  }

  private advance() {
    const lastRound = this.roundIdx + 1 >= this.level.rounds.length
    const lastLevel = this.levelIdx + 1 >= LEVELS.length

    if (!lastRound) {
      this.scene.restart({ 
        level: this.level.level, round: this.roundIdx + 1,
        score: this.score, hits: this.hits, errors: this.errors,
      } satisfies GameSceneData)
      return
    }

    this.ended = true
    this.dimHud(true)

    if (!lastLevel) {
      runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
      showLevelComplete(this, {
        subtitle: `Nível ${this.level.level} concluído`,
        message: LEVELS[this.levelIdx + 1].objective,
        accent: C.sky,
        overlayColor: C.deep,
        titleColor: hex(C.ink),
        subtitleColor: hex(C.skyDeep),
        progress: { total: LEVELS.length, current: this.level.level },
        autoAdvance: {
          delay: 2600,
          onComplete: () => this.scene.restart({ 
            level: this.level.level + 1, round: 0,
            score: this.score, hits: this.hits, errors: this.errors,
          } satisfies GameSceneData),
        },
      })
      return
    }

    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
    confetti(this)
    this.playFanfare()
    showLevelComplete(this, {
      title: 'Jogador seguro',
      subtitle: `${this.score} pontos`,
      message: 'Você sabe reconhecer o que proteger e o que desligar antes de jogar.',
      accent: C.mint,
      overlayColor: C.deep,
      titleColor: hex(C.ink),
      subtitleColor: hex(C.mintDeep),
      progress: { total: LEVELS.length, current: LEVELS.length },
      buttons: [
        {
          label: 'Jogar de novo', color: C.mintDeep,
          onClick: () => this.scene.restart({ level: 1, round: 0, score: 0, hits: 0, errors: 0 }),
        },
        { label: 'Outros jogos', color: C.skyDeep, onClick: () => EventBus.emit('exit-game') },
      ],
    })
  }

  // ═════════════════════════════════════════════════ tutorial

  private runTutorial(once: boolean, onDone: () => void) {
    const first = this.cards[0]
    this.dimHud(true)

    const steps: TutorialStep[] = [
      {
        text: 'Cada cartão é uma configuração do aparelho. Toque nele para ligar ou desligar.',
        shape: 'rect',
        x: first?.root.x ?? W / 2, y: first?.root.y ?? 400,
        w: CARD_W + 26, h: CARD_H + 26,
        balloonX: 940, balloonY: 300,
      },
      {
        text: 'Senha forte e perfil privado ficam ligados. Câmera, localização, compras e conversa com estranhos ficam desligados.',
        shape: 'none', balloonY: 380,
      },
      {
        text: 'No topo da tela o jogo diz o que fazer em cada rodada. Quando terminar, toque em Conferir.',
        shape: 'rect', x: W / 2, y: CONFIRM_Y, w: 400, h: 90,
        balloonY: 300, buttonLabel: 'Entendi',
      },
    ]

    createTutorial(this, {
      key: `checklist-l${this.level.level}`, once, accent: C.sky,
      safeTop: 20, steps,
      onFinish: () => { this.dimHud(false); onDone() },
    })
  }

  // ═════════════════════════════════════════════════ plataforma e áudio

  private registerEvents() {
    EventBus.on('mute-audio', this.onMute, this)
    EventBus.on('timer-end', this.onTimerEnd, this)
    EventBus.on('show-tutorial', this.onShowTutorial, this)

    this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type !== 'START_GAME' || cmd.gameId !== GAME_ID) return
      if (cmd.stage === this.level.level) return
      this.scene.restart({ level: cmd.stage, round: 0, score: this.score })
    })

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('mute-audio', this.onMute, this)
      EventBus.off('timer-end', this.onTimerEnd, this)
      EventBus.off('show-tutorial', this.onShowTutorial, this)
      this.delayedTimer?.remove()
      this.unsubPlatform?.()
    })
  }

  private onMute = (m: boolean) => { this.muted = m }

  private onTimerEnd = () => {
    this.bonusLost = true
    floatingNote(this, W / 2, 340, 'O bônus de tempo acabou. Confira com calma.',
      { tone: C.sun, deep: C.sunDeep })
  }

  private onShowTutorial = () => {
    if (this.locked || this.ended) return
    const wasLocked = this.locked
    this.runTutorial(false, () => { this.locked = wasLocked })
  }

  private emitCheckpoint() {
    const total = LEVELS.reduce((n, l) => n + l.rounds.length, 0)
    const before = LEVELS.slice(0, this.levelIdx).reduce((n, l) => n + l.rounds.length, 0)
    runtimeGameBridge.emit({
      type: 'CHECKPOINT', gameId: GAME_ID, stage: this.level.level,
      progress: Math.round(((before + this.roundIdx) / total) * 100),
      score: this.score, hits: this.hits, errors: this.errors,
    })
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.16, delay = 0) {
    if (this.muted) return
    const ctx = (this.sound as Phaser.Sound.WebAudioSoundManager).context
    if (!ctx) return
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur + 0.01)
  }
  private playTick() { this.tone(520, 0.05, 'sine', 0.1) }
  private playError() { this.tone(300, 0.16, 'square', 0.13); this.tone(210, 0.22, 'square', 0.1, 0.14) }
  private playAlert() { this.tone(740, 0.1, 'square', 0.18); this.tone(740, 0.1, 'square', 0.18, 0.16) }
  private playCorrect() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.16, 'sine', 0.2, i * 0.1)) }
  private playFanfare() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.2, 'sine', 0.24, i * 0.12)) }
}