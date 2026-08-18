import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { vehicleById } from '../data/vehicles'
import type { LevelConfig, SelectionMission, Vehicle } from '../types'

const GAME_ID = 'hangar-dos-transportes'
const W = 1280
const H = 720

const C = {
  sky: 0x071426,
  panel: 0x0f2238,
  panelSoft: 0x142b45,
  border: 0x2e5275,
  ink: 0xf4f8ff,
  inkSoft: 0xb8c8d9,
  blue: 0x4ea1ff,
  blueDark: 0x0a1d33,
  blueSoft: 0x193a5c,
  green: 0x47c978,
  greenSoft: 0x173b2d,
  amber: 0xf2b044,
  amberSoft: 0x3d3019,
  red: 0xf06a5f,
  redSoft: 0x3f2024,
  grey: 0x7f94aa,
  greySoft: 0x8da0b5,
  white: 0xffffff,
  shadow: 0x02070d,
}

const A = {
  veil: 0.42,
  shadow: 0.16,
  gloss: 0.2,
  overlay: 0.55,
}

const HEADER = { chipX: 36, chipW: 230, chipH: 66, textX: 292, titleY: 38, subY: 76 }
const MISSION = { x: 46, y: 106, w: 1188, h: 124, cx: 640 }
const GRID = { x: 54, y: 246, w: 1172, h: 386, cardW: 356, cardH: 88 }
const FOOTER = { y: 672, hintX: 64, hintW: 710, btnX: 1042, btnW: 332, btnH: 70 }

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

type CardView = {
  container: Phaser.GameObjects.Container
  vehicle: Vehicle
  bg: Phaser.GameObjects.Graphics
  check: Phaser.GameObjects.Text
  selected: boolean
}

export class GameScene extends Phaser.Scene {
  private levelIdx = 0
  private missionIdx = 0
  private points = 0
  private locked = true
  private ended = false

  private headerLayer!: Phaser.GameObjects.Container
  private missionLayer!: Phaser.GameObjects.Container
  private cardLayer!: Phaser.GameObjects.Container
  private footerLayer!: Phaser.GameObjects.Container

  private cards: CardView[] = []
  private selected = new Set<string>()
  private tutorialSteps: TutorialStep[] = []
  private tutorialKey = ''

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; mission?: number; points?: number }) {
    this.levelIdx = (data.level ?? 1) - 1
    this.missionIdx = data.mission ?? 0
    this.points = data.points ?? 0
    this.locked = true
    this.ended = false
    this.cards = []
    this.selected.clear()
  }

  private get level(): LevelConfig {
    return LEVELS[this.levelIdx]
  }

  private get mission(): SelectionMission {
    return this.level.missions[this.missionIdx]
  }

  create() {
    this.drawBackground()

    this.headerLayer = this.add.container(0, 0).setDepth(40)
    this.missionLayer = this.add.container(0, 0).setDepth(30)
    this.cardLayer = this.add.container(0, 0).setDepth(20)
    this.footerLayer = this.add.container(0, 0).setDepth(30)

    this.renderAll()
    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })

    EventBus.on('show-tutorial', this.replayTutorial, this)
    this.events.once('shutdown', () => {
      EventBus.off('show-tutorial', this.replayTutorial, this)
    })

    if (this.missionIdx === 0) this.showLevelIntro(() => this.runTutorial())
    else this.runTutorial()
  }

  private drawBackground() {
    const bg = this.add.image(W / 2, H / 2, 'hangar-bg').setDepth(-3)
    bg.setScale(Math.max(W / bg.width, H / bg.height))
    this.tweens.add({ targets: bg, x: W / 2 + 12, duration: 5200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const veil = this.add.graphics().setDepth(-2)
    veil.fillStyle(C.sky, 0.28)
    veil.fillRect(0, 0, W, H)
  }

  private renderAll() {
    this.renderHeader()
    this.renderMissionPanel()
    this.renderCards()
    this.renderFooter('Toque nos veículos que combinam com a pista. Depois confira a resposta.')
  }

  private renderHeader() {
    this.headerLayer.removeAll(true)

    const g = this.add.graphics()
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(HEADER.chipX + 3, 26, HEADER.chipW, HEADER.chipH, 18)
    g.fillStyle(C.blueDark, 1)
    g.fillRoundedRect(HEADER.chipX, 20, HEADER.chipW, HEADER.chipH, 18)
    g.fillStyle(C.white, 0.13)
    g.fillRoundedRect(HEADER.chipX + 10, 28, HEADER.chipW - 20, 15, 8)
    g.fillStyle(C.amber, 1)
    g.fillCircle(HEADER.chipX + 30, 51, 8)

    const level = this.add.text(HEADER.chipX + 50, 40, `NÍVEL ${this.level.level}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0, 0.5).setResolution(2)

    const mission = this.add.text(HEADER.chipX + 50, 64, `Missão ${this.missionIdx + 1} de ${this.level.missions.length}`, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '15px',
      color: hex(C.greySoft),
    }).setOrigin(0, 0.5).setResolution(2)

    const title = this.add.text(HEADER.textX, HEADER.titleY, this.level.title, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '29px',
      color: hex(C.ink),
      stroke: '#071426',
      strokeThickness: 7,
      wordWrap: { width: 690 },
    }).setOrigin(0, 0.5).setResolution(2)

    const score = this.add.text(1190, 50, `${this.points} pts`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: hex(C.ink),
      stroke: '#071426',
      strokeThickness: 6,
    }).setOrigin(1, 0.5).setResolution(2)

    const sub = this.add.text(HEADER.textX, HEADER.subY, this.level.objective, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '22px',
      color: hex(C.inkSoft),
      stroke: '#071426',
      strokeThickness: 5,
      wordWrap: { width: 830 },
    }).setOrigin(0, 0.5).setResolution(2)

    this.headerLayer.add([g, level, mission, title, sub, score])
  }

  private renderMissionPanel() {
    this.missionLayer.removeAll(true)

    const g = this.add.graphics()
    g.fillStyle(C.shadow, A.shadow)
    g.fillRoundedRect(MISSION.x + 5, MISSION.y + 10, MISSION.w, MISSION.h, 26)
    g.fillStyle(C.panel, 1)
    g.fillRoundedRect(MISSION.x, MISSION.y, MISSION.w, MISSION.h, 26)
    g.lineStyle(4, C.border, 1)
    g.strokeRoundedRect(MISSION.x, MISSION.y, MISSION.w, MISSION.h, 26)

    const question = this.add.text(MISSION.x + 95, MISSION.y + 42, this.mission.question, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '34px',
      color: hex(C.white),
      wordWrap: { width: 790 },
    }).setOrigin(0, 0.5).setResolution(2)

    const hint = this.add.text(MISSION.x + 95, MISSION.y + 78, this.mission.hint, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '22px',
      color: hex(C.inkSoft),
      wordWrap: { width: 790 },
    }).setOrigin(0, 0.5).setResolution(2)

    const selected = this.add.text(MISSION.x + MISSION.w - 34, MISSION.y + 58, `${this.selected.size} selecionado${this.selected.size === 1 ? '' : 's'}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: hex(C.blue),
    }).setOrigin(1, 0.5).setResolution(2)

    this.missionLayer.add([g, question, hint, selected])
  }

  private renderCards() {
    this.cardLayer.removeAll(true)
    this.cards = []

    const vehicles = this.level.vehicleIds.map(vehicleById)
    const cols = 3
    const rows = Math.ceil(vehicles.length / cols)
    const gapX = (GRID.w - cols * GRID.cardW) / Math.max(1, cols - 1)
    const gapY = rows <= 2 ? 30 : 12
    const blockH = rows * GRID.cardH + (rows - 1) * gapY
    const startY = GRID.y + (GRID.h - blockH) / 2

    vehicles.forEach((vehicle, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = GRID.x + GRID.cardW / 2 + col * (GRID.cardW + gapX)
      const y = startY + GRID.cardH / 2 + row * (GRID.cardH + gapY)
      const card = this.buildVehicleCard(vehicle, x, y)
      this.cards.push(card)
      this.cardLayer.add(card.container)
    })
  }

  private buildVehicleCard(vehicle: Vehicle, x: number, y: number): CardView {
    const container = this.add.container(x, y)
    const bg = this.add.graphics()
    const img = this.add.image(-112, 0, vehicle.texture)
    const label = this.add.text(-18, -18, vehicle.name, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: hex(C.ink),
      wordWrap: { width: 190 },
    }).setOrigin(0, 0.5).setResolution(2)

    const tags = this.add.text(-18, 22, this.vehicleTags(vehicle), {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '17px',
      color: hex(C.inkSoft),
    }).setOrigin(0, 0.5).setResolution(2)

    const check = this.add.text(GRID.cardW / 2 - 30, -GRID.cardH / 2 + 24, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)

    img.setDisplaySize(82, 82)
    container.add([bg, img, label, tags, check])
    container.setSize(GRID.cardW, GRID.cardH)
    container.setInteractive({ useHandCursor: true })
    container.on('pointerdown', () => this.toggleCard(vehicle.id))
    container.on('pointerover', () => {
      if (!this.locked) this.tweens.add({ targets: container, scale: 1.025, duration: 110 })
    })
    container.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 110 }))

    const card: CardView = { container, vehicle, bg, check, selected: false }
    this.paintCard(card)
    container.setAlpha(0)
    container.y += 18
    this.tweens.add({ targets: container, y, alpha: 1, duration: 240, delay: this.cards.length * 35, ease: 'Back.easeOut' })
    return card
  }

  private paintCard(card: CardView, state: 'idle' | 'selected' | 'correct' | 'wrong' | 'missed' = card.selected ? 'selected' : 'idle') {
    const { bg, check } = card
    const w = GRID.cardW
    const h = GRID.cardH
    const color = state === 'correct' ? C.green : state === 'wrong' ? C.red : state === 'missed' ? C.amber : state === 'selected' ? C.blue : C.border
    const fill = state === 'correct' ? C.greenSoft : state === 'wrong' ? C.redSoft : state === 'missed' ? C.amberSoft : state === 'selected' ? C.blueSoft : C.panel

    bg.clear()
    bg.fillStyle(C.shadow, 0.34)
    bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 18)
    bg.fillStyle(fill, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    bg.lineStyle(4, C.shadow, 0.65)
    bg.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 16)
    bg.lineStyle(state === 'idle' ? 3 : 6, color, 1)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)
    bg.fillStyle(color, state === 'idle' ? 0.65 : 1)
    bg.fillRoundedRect(-w / 2, -h / 2, 14, h, 7)

    check.setText(state === 'wrong' ? '!' : state === 'missed' ? '?' : '')
    check.setColor(state === 'wrong' ? hex(C.red) : state === 'missed' ? hex(C.amber) : '#ffffff')
  }

  private toggleCard(id: string) {
    if (this.locked) return
    const card = this.cards.find(c => c.vehicle.id === id)
    if (!card) return

    card.selected = !card.selected
    if (card.selected) this.selected.add(id)
    else this.selected.delete(id)

    this.paintCard(card)
    this.renderMissionPanel()
    this.tweens.add({ targets: card.container, scale: card.selected ? 1.04 : 1, duration: 110, yoyo: card.selected })
  }

  private confirmSelection() {
    if (this.locked) return
    if (!this.selected.size) {
      this.renderFooter('Selecione pelo menos um veículo antes de conferir.', C.amber)
      this.tweens.add({ targets: this.footerLayer, x: 10, duration: 70, yoyo: true, repeat: 2 })
      return
    }

    this.locked = true
    const correctIds = new Set(this.level.vehicleIds.filter(id => this.matches(vehicleById(id), this.mission)).map(String))
    const selectedIds = [...this.selected]
    const perfect = selectedIds.length === correctIds.size && selectedIds.every(id => correctIds.has(id))
    let selectedCorrect = 0

    this.cards.forEach(card => {
      const should = correctIds.has(card.vehicle.id)
      const was = this.selected.has(card.vehicle.id)
      if (should && was) selectedCorrect++
      this.paintCard(card, should && was ? 'correct' : !should && was ? 'wrong' : should ? 'missed' : 'idle')
      if (!should && was) this.tweens.add({ targets: card.container, x: card.container.x + 8, duration: 70, yoyo: true, repeat: 2 })
      if (should && was) this.tweens.add({ targets: card.container, y: card.container.y - 12, duration: 170, yoyo: true, ease: 'Sine.easeOut' })
    })

    const earned = perfect ? 30 : Math.max(5, selectedCorrect * 8)
    this.points += earned
    runtimeGameBridge.emit({
      type: perfect ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: earned,
      stage: this.level.level,
    })

    this.renderHeader()
    this.renderFooter(perfect ? `Perfeito! +${earned} pontos.` : `Veja os cartões marcados. +${earned} pontos.`, perfect ? C.green : C.amber)
    this.time.delayedCall(perfect ? 1100 : 1800, () => this.nextMission())
  }

  private nextMission() {
    if (this.missionIdx + 1 < this.level.missions.length) {
      this.missionIdx++
      this.selected.clear()
      this.locked = false
      this.renderAll()
      return
    }

    this.completeLevel()
  }

  private completeLevel() {
    const isLastLevel = this.levelIdx + 1 >= LEVELS.length
    if (isLastLevel) {
      this.ended = true
      runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level })
      showLevelComplete(this, {
        title: 'Hangar organizado!',
        subtitle: `${this.points} pontos`,
        message: 'Você classificou veículos por características e pelo meio em que se deslocam.',
        accent: C.green,
        overlayColor: C.shadow,
        titleColor: hex(C.blueDark),
        subtitleColor: hex(C.green),
        progress: { total: LEVELS.length, current: LEVELS.length },
      })
      return
    }

    showLevelComplete(this, {
      subtitle: `Nível ${this.level.level} concluído`,
      message: LEVELS[this.levelIdx + 1].objective,
      accent: C.blue,
      overlayColor: C.shadow,
      titleColor: hex(C.blueDark),
      subtitleColor: hex(C.blue),
      progress: { total: LEVELS.length, current: this.level.level },
      autoAdvance: {
        delay: 2200,
        onComplete: () => this.scene.restart({ level: this.level.level + 1, mission: 0, points: this.points }),
      },
    })
  }

  private renderFooter(text: string, tone = C.blue) {
    this.footerLayer.removeAll(true)
    this.footerLayer.setX(0)

    const hint = this.add.graphics()
    hint.fillStyle(C.panel, 0.98)
    hint.fillRoundedRect(FOOTER.hintX, FOOTER.y - 30, FOOTER.hintW, 60, 18)
    hint.lineStyle(3, tone, 1)
    hint.strokeRoundedRect(FOOTER.hintX, FOOTER.y - 30, FOOTER.hintW, 60, 18)
    hint.fillStyle(tone, 1)
    hint.fillCircle(FOOTER.hintX + 30, FOOTER.y, 14)

    const mark = this.add.text(FOOTER.hintX + 30, FOOTER.y - 1, 'i', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)

    const label = this.add.text(FOOTER.hintX + 56, FOOTER.y, text, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '20px',
      color: hex(C.ink),
      wordWrap: { width: FOOTER.hintW - 78 },
    }).setOrigin(0, 0.5).setResolution(2)

    const btn = this.button(FOOTER.btnX, FOOTER.y, FOOTER.btnW, FOOTER.btnH, 'Conferir', C.blue, () => this.confirmSelection())
    this.footerLayer.add([hint, mark, label, btn])
  }

  private showLevelIntro(onStart: () => void) {
    this.locked = true
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.72).setDepth(180).setInteractive()
    const panel = this.add.container(W / 2, H / 2).setDepth(181)

    const objective = this.add.text(0, 0, this.level.objective, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '24px',
      color: hex(C.ink),
      align: 'center',
      wordWrap: { width: 560 },
    }).setOrigin(0.5).setResolution(2)

    const tip = this.add.text(0, 0, this.level.tip, {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '20px',
      color: hex(C.inkSoft),
      align: 'center',
      wordWrap: { width: 540 },
    }).setOrigin(0.5).setResolution(2)

    const ph = Math.max(390, objective.height + tip.height + 290)
    const top = -ph / 2
    const bg = this.add.graphics()
    bg.fillStyle(C.shadow, 0.34)
    bg.fillRoundedRect(-350, top + 12, 700, ph, 30)
    bg.fillStyle(C.panel, 1)
    bg.fillRoundedRect(-350, top, 700, ph, 30)
    bg.lineStyle(5, C.blue, 1)
    bg.strokeRoundedRect(-350, top, 700, ph, 30)
    bg.fillStyle(C.blue, 1)
    bg.fillRoundedRect(-160, top - 15, 320, 30, 15)

    const badgeBg = this.add.graphics()
    badgeBg.fillStyle(C.blueSoft, 1)
    badgeBg.fillRoundedRect(-88, top + 36, 176, 42, 21)
    badgeBg.lineStyle(3, C.blue, 1)
    badgeBg.strokeRoundedRect(-88, top + 36, 176, 42, 21)

    const badge = this.add.text(0, top + 57, `NÍVEL ${this.level.level}`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '21px',
      color: hex(C.ink),
    }).setOrigin(0.5).setResolution(2)

    const title = this.add.text(0, top + 118, this.level.title, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '38px',
      color: hex(C.ink),
      align: 'center',
      wordWrap: { width: 600 },
    }).setOrigin(0.5).setResolution(2)

    objective.setY(top + 190 + objective.height / 2)
    tip.setY(objective.y + objective.height / 2 + 5 + tip.height / 2)

    const btn = this.button(0, ph / 2 - 54, 320, 70, 'Começar', C.green, () => {
      overlay.destroy()
      panel.destroy()
      onStart()
    }, '24px', true)

    panel.add([bg, badgeBg, badge, title, objective, tip, btn])
    panel.setScale(0.94).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private startMission() {
    this.locked = false
  }

  private runTutorial() {
    this.tutorialSteps = this.buildTutorialSteps()
    this.tutorialKey = `ef02co01-l${this.level.level}`
    EventBus.emit('tutorial-ready')

    if (this.missionIdx !== 0 || !this.tutorialSteps.length) {
      this.startMission()
      return
    }

    EventBus.emit('tutorial-start')
    createTutorial(this, {
      key: this.tutorialKey,
      accent: C.blue,
      safeTop: 112,
      steps: this.tutorialSteps,
      onFinish: () => {
        EventBus.emit('tutorial-end')
        this.startMission()
      },
    })
  }

  private replayTutorial = () => {
    if (this.ended || !this.tutorialSteps.length) return
    const wasLocked = this.locked
    this.locked = true
    EventBus.emit('tutorial-start')
    createTutorial(this, {
      key: this.tutorialKey,
      once: false,
      accent: C.blue,
      safeTop: 112,
      steps: this.tutorialSteps,
      onFinish: () => {
        this.locked = wasLocked
        EventBus.emit('tutorial-end')
      },
    })
  }

  private buildTutorialSteps(): TutorialStep[] {
    return [
      {
        text: 'Leia a missão. Ela diz qual característica você precisa procurar nos veículos.',
        shape: 'rect', x: MISSION.cx, y: MISSION.y + MISSION.h / 2, w: MISSION.w + 26, h: MISSION.h + 24,
      },
      {
        text: 'Toque nos cartões dos veículos que combinam com a pista. O cartão azul está selecionado.',
        shape: 'rect', x: W / 2, y: GRID.y + GRID.h / 2, w: GRID.w + 34, h: GRID.h + 36,
      },
      {
        text: 'Quando terminar, toque em Conferir. O jogo mostra acertos, erros e veículos esquecidos.',
        shape: 'rect', x: FOOTER.btnX, y: FOOTER.y, w: FOOTER.btnW + 34, h: FOOTER.btnH + 28,
      },
    ]
  }

  private matches(vehicle: Vehicle, mission: SelectionMission) {
    return vehicle.attributes[mission.attribute] === mission.value
  }

  private vehicleTags(vehicle: Vehicle) {
    const meio = vehicle.attributes.meio === 'agua' ? 'Água' : vehicle.attributes.meio === 'ar' ? 'Ar' : 'Terra'
    const motor = vehicle.attributes.temMotor ? 'Com Motor' : 'Sem Motor'
    return `${meio} - ${motor}`
  }

  private button(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    color: number,
    onClick: () => void,
    fontSize = '20px',
    ignoreLock = false,
  ) {
    const btn = this.add.container(x, y)
    const g = this.add.graphics()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, 18)
    g.fillStyle(color, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-w / 2 + 10, -h / 2 + 9, w - 20, h * 0.3, 9)

    const t = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial',
      fontSize,
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: w - 30 },
    }).setOrigin(0.5).setResolution(2)

    btn.add([g, t])
    btn.setSize(w, h)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerdown', () => {
      if (!ignoreLock && this.locked) return
      this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
      onClick()
    })
    return btn
  }
}