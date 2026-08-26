import Phaser from 'phaser'

import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { LevelConfig, MissionConfig, GameItem, DeliveryStation, ChannelType } from '../types'
import { LEVELS, STATIONS, CONCEPTS } from '../data/levels'
import { EventBus } from '../../../../shared/EventBus'

import { createTutorial } from '../../../../shared/tutorial/createTutorial';
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
const GAME_ID = 'correio-multimidia'

type SceneState = 'tutorial' | 'map' | 'registering' | 'transmitting' | 'comparing'

const POINTS_PER_CHANNEL = 5
const WRONG_CHANNEL_PENALTY = 5
const ACTION_ICON = 104
const MODAL_WAVE_H = 30   // altura da faixa (era ~86)
const MODAL_WAVE_R = 18   // raio das bolinhas (era 42)
const ORIGIN_X = 200, ORIGIN_Y = 250
const DEST_X = 1080, DEST_Y = 250
const REQUEST_Y = 458
const STATION_Y = 618
const MODAL_X = 640, MODAL_Y = 380
const MODAL_W = 600, MODAL_H = 640   // ← modal maior, cabe tudo sem apertar
const BRUSH_KEY = 'brush_dot'
const MIN_STROKES = 55
const INTERFACE_BLUE = 0xa2cefe
const INTERFACE_BLUE_DARK = 0x2d6fb7
const INTERFACE_BLUE_LIGHT = 0xdcf1ff
const TEXT_STROKE = '#071827'

// paleta das alternativas
const OPTION_COLORS = [
  { fill: 0xf9ce5d, dark: 0xb8902c },  // amarelo
  { fill: 0x85b47e, dark: 0x57804f },  // verde
  { fill: 0xea6f67, dark: 0xa94840 },  // vermelho
  { fill: 0x5882ac, dark: 0x365b80 },  // azul
]

const BUTTON_DEFAULT = { fill: 0x63b5f8, dark: INTERFACE_BLUE_DARK }

// título com bg próprio, diferente do azul do modal
const TITLE_BG = 0x5882ac
const TITLE_BG_DARK = 0x365b80

const SOUND_COLORS = [
  { fill: 0xffd166, border: 0xd98a00 }, // amarelo
  { fill: 0xff9aa2, border: 0xd6455a }, // rosa
  { fill: 0x9ae6b4, border: 0x2f855a }, // verde
  { fill: 0xa5b4fc, border: 0x4c51bf }, // roxo (reserva p/ 4 opções)
]

export class GameScene extends Phaser.Scene {
  private currentLevelIndex = 0
  private currentMissionIndex = 0
  private levelConfig!: LevelConfig
  private currentMission!: MissionConfig
  private points = 0
  private state: SceneState = 'map'
  private accumulatedBadges: Phaser.GameObjects.Image[] = []

  private stationSprites: Map<ChannelType, Phaser.GameObjects.Image> = new Map()
  private originPanelIcon?: Phaser.GameObjects.Image
  private resultContainer!: Phaser.GameObjects.Container
  private registerContainer!: Phaser.GameObjects.Container
  private overlay?: Phaser.GameObjects.Rectangle

  private requestIndicatorContainer!: Phaser.GameObjects.Container
  private requestBadges: Map<ChannelType, Phaser.GameObjects.Image> = new Map()

  private drawMask?: Phaser.GameObjects.RenderTexture
  private revealImage?: Phaser.GameObjects.Image
  private strokeCount = 0
  private isDrawing = false
  private optionsCache: Map<string, string[]> = new Map()

  private completedChannelsThisRound: Set<ChannelType> = new Set()
  private removeCommandListener!: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.buildHelperTextures()

    this.removeCommandListener = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type === 'START_GAME' && cmd.gameId === GAME_ID) {
        this.startGame(cmd.stage, cmd.points)
      }
    })

    this.startGame(1, 0)
  }

  shutdown() {
    if (this.removeCommandListener) this.removeCommandListener()
  }

  private srcSize(key: string) {
    const src = this.textures.get(key).getSourceImage() as { width: number; height: number }
    return { w: src.width, h: src.height }
  }

  private fitted(x: number, y: number, key: string, targetW: number) {
    const { w, h } = this.srcSize(key)
    return this.add.image(x, y, key).setDisplaySize(targetW, (h / w) * targetW)
  }

  // DEPOIS
  private buildHelperTextures() {
    if (!this.textures.exists(BRUSH_KEY)) {
      const g = this.add.graphics()
      g.fillStyle(0xffffff, 1)
      g.fillCircle(15, 15, 15)
      g.generateTexture(BRUSH_KEY, 30, 30)
      g.destroy()
    }
  }

  private runLevelTutorial() {
    const level = this.levelConfig.level
    const back = () => {
      this.state = 'map'
      this.updateStationAvailability()
    }

    if (level === 1) {
      this.state = 'tutorial'
      const target = this.stationSprites.get(this.currentMission.requiredChannels[0])

      createTutorial(this, {
        key: 'correio-l1',
        accent: 0x4e9b35,
        onFinish: back,
        steps: [
          {
            text: 'Esta é a mensagem que você precisa enviar.',
            shape: 'circle', x: ORIGIN_X, y: ORIGIN_Y, w: 330, h: 330,
          },
          {
            text: 'O destino mostra aqui por qual caminho quer receber.',
            shape: 'rect', x: DEST_X, y: REQUEST_Y, w: 400, h: 170,
          },
          {
            text: 'Toque na estação que combina com o pedido do destino.',
            shape: 'rect', x: 640, y: STATION_Y, w: 940, h: 210,
            pointer: target
              ? { fromX: 640, fromY: 440, toX: target.x, toY: STATION_Y - 20, textureKey: 'cursor_tutorial' }
              : undefined,
          },
        ],
      })
      return
    }

    if (level === 2) {
      this.state = 'tutorial'
      createTutorial(this, {
        key: 'correio-l2',
        accent: 0x4e9b35,
        onFinish: back,
        steps: [
          {
            text: 'Agora o destino pede DOIS caminhos ao mesmo tempo!',
            shape: 'rect', x: DEST_X, y: REQUEST_Y, w: 440, h: 180,
          },
          {
            text: 'Envie por um caminho e depois pelo outro. A estação já usada fica apagada.',
            shape: 'rect', x: 640, y: STATION_Y, w: 940, h: 210,
          },
        ],
      })
    }

    if (level === 3) {
      this.state = 'tutorial'
      createTutorial(this, {
        key: 'correio-l3',
        accent: 0x4e9b35,
        onFinish: back,
        steps: [
          {
            text: 'Atenção: agora muda a cada rodada. Às vezes o destino pede um caminho, às vezes dois.',
            shape: 'rect', x: DEST_X, y: REQUEST_Y, w: 440, h: 180,
          },
        ],
      })
      return
    }
  }

  private startGame(stage: number, initialPoints: number) {
    this.points = initialPoints
    this.currentLevelIndex = Math.max(0, LEVELS.findIndex(l => l.level === stage))
    this.currentMissionIndex = 0

    this.children.removeAll()
    this.stationSprites.clear()
    this.buildEnvironment()
    this.startMission()
    this.runLevelTutorial()
    this.optionsCache.clear()
  }

  private buildEnvironment() {
    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, 'bg_mapa').setDisplaySize(width, height)

    this.fitted(ORIGIN_X, ORIGIN_Y, 'painel_origem', 300)
    this.originPanelIcon = this.fitted(ORIGIN_X, ORIGIN_Y, 'info_cachorro', 95)
    this.fitted(DEST_X, DEST_Y, 'painel_destino', 280)

    this.buildStations()

    this.resultContainer = this.add.container(DEST_X, DEST_Y).setAlpha(0)
    this.registerContainer = this.add.container(MODAL_X, MODAL_Y).setAlpha(0)
    this.requestIndicatorContainer = this.add.container(DEST_X, REQUEST_Y).setDepth(5)
  }

  private buildStations() {
    const marginX = 260
    const usableWidth = 1280 - marginX * 2
    const count = STATIONS.length

    STATIONS.forEach((station, i) => {
      const x = count === 1 ? 640 : marginX + (usableWidth / (count - 1)) * i
      const sprite = this.fitted(x, STATION_Y, station.textureKey, 160)
      const baseScale = sprite.scaleX
      sprite.setData('station', station)
      sprite.setData('baseScale', baseScale)

      sprite.on('pointerover', () => {
        if (this.state !== 'map') return
        sprite.setTexture(station.activeTextureKey)
        sprite.setScale(baseScale * 1.08)
      })
      sprite.on('pointerout', () => {
        sprite.setTexture(station.textureKey)
        sprite.setScale(baseScale)
      })
      sprite.on('pointerdown', () => this.onStationClicked(station, sprite))

      this.tweens.add({
        targets: sprite,
        y: sprite.y - 6,
        duration: 1400 + i * 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      })

      this.stationSprites.set(station.channel, sprite)
    })
  }

  private startMission() {
    this.levelConfig = LEVELS[this.currentLevelIndex]
    this.accumulatedBadges = []

    if (this.currentMissionIndex >= this.levelConfig.missions.length) {
      this.advanceLevel()
      return
    }

    this.currentMission = this.levelConfig.missions[this.currentMissionIndex]
    this.completedChannelsThisRound = new Set()
    if (this.state !== 'tutorial') this.state = 'map'

    this.resultContainer.setAlpha(0).removeAll(true)
    this.registerContainer.setAlpha(0).removeAll(true)

    if (this.originPanelIcon) {
      this.originPanelIcon.setTexture(this.currentMission.item.textureKey)
      const { w, h } = this.srcSize(this.currentMission.item.textureKey)
      this.originPanelIcon.setDisplaySize(95, (h / w) * 95)
    }

    this.registry.set('roundTotal', this.levelConfig.missions.length)
    this.registry.set('roundIndex', this.currentMissionIndex)

    if (this.overlay) {
      this.overlay.destroy()
      this.overlay = undefined
    }

    this.buildRequestIndicator()
    this.updateStationAvailability()
  }

  // ── Pedido do destino ──────────────────────────────────────────────────

  private buildRequestIndicator() {
    this.requestIndicatorContainer.removeAll(true)
    this.requestBadges.clear()

    const channels = this.currentMission.requiredChannels
    const spacing = 86
    const startX = -(spacing * (channels.length - 1)) / 2
    const cardW = Math.max(280, channels.length * spacing + 80)
    const cardH = 122
    const headerH = 40
    const r = 22

    const card = this.add.graphics()

    // sombra
    card.fillStyle(0x000000, 0.20)
    card.fillRoundedRect(-cardW / 2 + 5, -cardH / 2 + 7, cardW, cardH, r)

    // moldura escura + corpo claro (mesmo esquema do modal)
    card.fillStyle(INTERFACE_BLUE_DARK, 1)
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, r)
    card.fillStyle(0xffffff, 0.97)
    card.fillRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH - 10, r - 4)

    // cabeçalho azul
    card.fillStyle(INTERFACE_BLUE_DARK, 1)
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, headerH + 5, { tl: r, tr: r, bl: 0, br: 0 })
    card.fillStyle(0x63b5f8, 1)
    card.fillRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, headerH, { tl: r - 4, tr: r - 4, bl: 0, br: 0 })
    card.fillStyle(0xffffff, 0.22)
    card.fillRoundedRect(-cardW / 2 + 16, -cardH / 2 + 9, cardW - 32, 15, 8)

    // faixa clara atrás dos ícones
    card.fillStyle(INTERFACE_BLUE_LIGHT, 1)
    card.fillRoundedRect(-cardW / 2 + 14, -cardH / 2 + headerH + 14, cardW - 28, cardH - headerH - 28, 16)

    const label = this.add.text(0, -cardH / 2 + 5 + headerH / 2, 'QUER RECEBER POR', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      stroke: TEXT_STROKE,
      strokeThickness: 4
    }).setOrigin(0.5).setResolution(2)

    this.requestIndicatorContainer.add([card, label])

    const badgeY = -cardH / 2 + headerH + (cardH - headerH) / 2 + 2
    channels.forEach((channel, i) => {
      const station = STATIONS.find(s => s.channel === channel)!
      const badge = this.fittedContain(startX + i * spacing, badgeY, station.textureKey, 58, 54)
      this.requestIndicatorContainer.add(badge)
      this.requestBadges.set(channel, badge)
    })

    this.requestIndicatorContainer.setAlpha(0).setScale(0.85)
    this.tweens.add({
      targets: this.requestIndicatorContainer,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.out'
    })
  }

  private markRequestFulfilled(channel: ChannelType) {
    const badge = this.requestBadges.get(channel)
    if (!badge) return
    badge.setAlpha(0.3)
    this.tweens.add({ targets: badge, scale: badge.scaleX * 1.15, yoyo: true, duration: 160 })
  }

  private updateStationAvailability() {
    this.stationSprites.forEach((sprite, channel) => {
      const station = sprite.getData('station') as DeliveryStation
      const baseScale = sprite.getData('baseScale') as number
      const alreadySent = this.completedChannelsThisRound.has(channel)

      sprite.setTexture(station.textureKey)
      sprite.setScale(baseScale)
      sprite.setAlpha(alreadySent ? 0.35 : 1)
      sprite.disableInteractive()
      if (!alreadySent) sprite.setInteractive({ cursor: 'pointer' })
    })
  }

  private onStationClicked(station: DeliveryStation, sprite: Phaser.GameObjects.Image) {
    if (this.state !== 'map') return

    sprite.setTexture(station.textureKey)
    sprite.setScale(sprite.getData('baseScale'))

    this.playTick()
    this.state = 'registering'
    this.openRegistration(station)
  }

  // ── Tutorial ───────────────────────────────────────────────────────────

  private tut<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.tutorialObjects.push(obj)
    return obj
  }

  private clearTutorial() {
    this.tutorialObjects.forEach(o => o.destroy())
    this.tutorialObjects = []
  }

  private spotlight(
    rt: Phaser.GameObjects.RenderTexture,
    shape: 'circle' | 'rect',
    x: number, y: number, w: number, h: number,
  ) {
    rt.clear()
    rt.fill(0x0b1220, 0.8)
    const cut = this.make.image({ key: shape === 'circle' ? MASK_CIRCLE : MASK_RECT }, false)
    cut.setDisplaySize(w, h)
    rt.erase(cut, x, y)
    cut.destroy()
  }

  private showLevelIntro(onStart: () => void) {
    this.state = 'tutorial'
    const level = this.levelConfig

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.62)
      .setDepth(600).setInteractive()
    const panel = this.add.container(640, 360).setDepth(601)
    panel.add(this.createModalBackground(620, 470))

    // ── selo "NÍVEL X DE Y": texto claro sobre pílula escura ──
    const badgeTxt = this.add.text(0, -168, `NÍVEL ${level.level} DE ${LEVELS.length}`, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5).setResolution(2)

    const bw = badgeTxt.width + 46
    const bh = badgeTxt.height + 18
    const badgeBg = this.add.graphics()
    badgeBg.fillStyle(0x000000, 0.16); badgeBg.fillRoundedRect(-bw / 2, -168 - bh / 2 + 4, bw, bh, bh / 2)
    badgeBg.fillStyle(TITLE_BG_DARK, 1); badgeBg.fillRoundedRect(-bw / 2, -168 - bh / 2, bw, bh, bh / 2)
    badgeBg.fillStyle(0xffffff, 0.20); badgeBg.fillRoundedRect(-bw / 2 + 10, -168 - bh / 2 + 4, bw - 20, bh * 0.34, bh * 0.2)

    // ── textos escuros sobre o azul claro ──
    const title = this.add.text(0, -100, level.title, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '32px', color: '#123b5e',
      align: 'center', wordWrap: { width: 500 }
    }).setOrigin(0.5).setResolution(2)

    const objective = this.add.text(0, -20, level.objective, {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '19px', color: '#24506f',
      align: 'center', wordWrap: { width: 480 }
    }).setOrigin(0.5).setResolution(2)

    const phaseLabel = this.add.text(0, 56, `${level.missions.length} fases neste nível`, {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '15px', color: '#365b80'
    }).setOrigin(0.5).setResolution(2)

    // ── bolinhas de progresso com contorno, pra lerem sobre o azul ──
    const dots = this.add.graphics()
    const gap = 30
    const startX = -((level.missions.length - 1) * gap) / 2
    level.missions.forEach((_, i) => {
      const cx = startX + i * gap
      dots.fillStyle(i === 0 ? TITLE_BG_DARK : 0xffffff, i === 0 ? 1 : 0.85)
      dots.fillCircle(cx, 88, 9)
      dots.lineStyle(3, TITLE_BG_DARK, 1)
      dots.strokeCircle(cx, 88, 9)
    })

    const btn = this.createThemedButton(300, 60, 'Começar')
    btn.setPosition(0, 156)
    btn.setInteractive({ cursor: 'pointer' })
    btn.on('pointerdown', () => {
      this.playTick()
      this.tweens.add({
        targets: [overlay, panel], alpha: 0, duration: 240,
        onComplete: () => { overlay.destroy(); panel.destroy(); onStart() }
      })
    })

    panel.add([badgeBg, badgeTxt, title, objective, phaseLabel, dots, btn])
    panel.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.out' })
  }

  private showTutorial() {
    this.state = 'tutorial'

    this.tut(this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.001).setDepth(299).setInteractive())
    const spot = this.tut(this.add.renderTexture(0, 0, 1280, 720).setOrigin(0).setDepth(300))

    const balloon = this.tut(this.add.container(640, 0).setDepth(320))
    const balloonBg = this.add.graphics()
    const balloonTxt = this.add.text(0, 0, '', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '21px',
      color: '#1a3b1a',
      align: 'center',
      wordWrap: { width: 520 }
    }).setOrigin(0.5).setResolution(2)
    balloon.add([balloonBg, balloonTxt])

    const setBalloon = (text: string, x: number, y: number) => {
      balloonTxt.setText(text)
      const w = 580
      const h = Math.max(80, balloonTxt.height + 44)
      balloonBg.clear()
      balloonBg.fillStyle(0x000000, 0.18)
      balloonBg.fillRoundedRect(-w / 2 + 5, -h / 2 + 6, w, h, 20)
      balloonBg.fillStyle(0xffffff, 0.98)
      balloonBg.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
      balloon.setPosition(x, y).setAlpha(0)
      this.tweens.add({ targets: balloon, alpha: 1, duration: 200 })
    }

    const nextBtn = this.tut(this.createThemedButton(280, 56, 'Próximo').setDepth(321))
    nextBtn.setInteractive({ cursor: 'pointer' })
    const nextLabel = nextBtn.getAt(1) as Phaser.GameObjects.Text

    const setNext = (x: number, y: number, label: string, action: () => void) => {
      nextBtn.setPosition(x, y)
      nextLabel.setText(label)
      nextBtn.removeAllListeners('pointerdown')
      nextBtn.on('pointerdown', () => {
        this.playTick()
        action()
      })
    }

    const step1 = () => {
      this.spotlight(spot, 'circle', ORIGIN_X, ORIGIN_Y, 330, 330)
      setBalloon('Esta é a mensagem que você precisa enviar.', 700, 200)
      setNext(700, 310, 'Próximo', step2)
    }

    const step2 = () => {
      this.spotlight(spot, 'rect', DEST_X, REQUEST_Y, 360, 160)
      setBalloon('O destino mostra aqui por qual caminho quer receber.', 520, 250)
      setNext(520, 360, 'Próximo', step3)
    }

    const step3 = () => {
      this.spotlight(spot, 'rect', 640, STATION_Y, 940, 200)
      setBalloon('Toque na estação que combina com o pedido do destino.', 640, 230)
      setNext(640, 340, 'Vamos começar!', finish)

      const target = this.stationSprites.get(this.currentMission.requiredChannels[0])
      if (!target) return

      const cursor = this.tut(this.fitted(640, 450, 'cursor_tutorial', 60).setDepth(322))
      this.tweens.add({
        targets: cursor,
        x: target.x,
        y: target.y + 30,
        duration: 1100,
        ease: 'Sine.easeInOut',
        repeat: -1,
        repeatDelay: 600,
        hold: 400,
        onRepeat: () => cursor.setPosition(640, 450)
      })
    }

    const finish = () => {
      this.tweens.add({
        targets: this.tutorialObjects,
        alpha: 0,
        duration: 250,
        onComplete: () => {
          this.clearTutorial()
          this.state = 'map'
          this.updateStationAvailability()
        }
      })
    }

    step1()
  }

  private openRegistration(station: DeliveryStation) {
    this.registerContainer.removeAll(true)
    this.registerContainer.setAlpha(0).setScale(0.9)

    if (this.overlay) this.overlay.destroy()
    this.overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5).setInteractive().setDepth(10)

    this.registerContainer.add(this.createModalBackground(MODAL_W, MODAL_H))

    if (station.channel === 'image') this.buildDrawingInteraction()
    else if (station.channel === 'text') this.buildPhraseInteraction()
    else this.buildSoundInteraction()

    this.registerContainer.setDepth(20)
    this.tweens.add({ targets: this.registerContainer, alpha: 1, scale: 1, duration: 300, ease: 'Back.out' })
  }

  private buildDrawingInteraction() {
    const item = this.currentMission.item
    this.strokeCount = 0

    const title = this.createInterfaceTitle('Passe o pincel e revele o:', 0, 470, item.nameKey)
    const contentTop = this.layoutTitle(title)

    // espaço livre entre o título e a linha dos botões
    const areaTop = contentTop
    const areaBottom = this.actionRowY - ACTION_ICON / 2 - 14
    const areaH = areaBottom - areaTop

    const board = this.fittedContain(0, 0, 'quadro_desenho', 430, areaH)
    const boardY = areaTop + board.displayHeight / 2
    board.setY(boardY)

    // arte proporcional ao quadro real, não a um número fixo
    const ART = Math.round(Math.min(board.displayWidth, board.displayHeight) * 0.62)

    const guide = this.fittedContain(0, boardY, item.textureKey, ART, ART).setAlpha(0.16)
    const reveal = this.fittedContain(0, boardY, item.textureKey, ART, ART)

    const maskRT = this.make.renderTexture(
      { x: MODAL_X, y: MODAL_Y + boardY, width: ART, height: ART }, false
    )
    maskRT.setOrigin(0.5)
    reveal.setMask(maskRT.createBitmapMask())
    this.drawMask = maskRT
    this.revealImage = reveal

    const hitZone = this.add.zone(0, boardY, ART, ART).setInteractive({ cursor: 'crosshair' })

    const confirmBtn = this.buildConfirmButton(78, this.actionRowY, () => {
      if (this.strokeCount < MIN_STROKES) return
      this.completeRegistration('image')
    })
    this.setActionEnabled(confirmBtn, false)

    const paint = (pointer: Phaser.Input.Pointer) => {
      const lx = pointer.worldX - MODAL_X
      const ly = pointer.worldY - (MODAL_Y + boardY)
      if (Math.abs(lx) > ART / 2 || Math.abs(ly) > ART / 2) return
      maskRT.draw(BRUSH_KEY, lx + ART / 2, ly + ART / 2)
      this.strokeCount++
      if (this.strokeCount === MIN_STROKES) this.setActionEnabled(confirmBtn, true)
    }

    hitZone.on('pointerdown', (p: Phaser.Input.Pointer) => { this.isDrawing = true; paint(p) })
    hitZone.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.isDrawing) paint(p) })
    this.input.on('pointerup', () => { this.isDrawing = false })

    const backBtn = this.buildBackButton(-92, this.actionRowY, () => this.cancelRegistration())

    this.registerContainer.add([title, board, guide, reveal, hitZone, confirmBtn, backBtn])
  }

  private disposeDrawMask() {
    this.revealImage?.clearMask(true)
    this.revealImage = undefined
    this.drawMask?.destroy()
    this.drawMask = undefined
  }

  private buildPhraseInteraction() {
    const item = this.currentMission.item
    const options = this.buildPhraseOptions(item)

    const title = this.createInterfaceTitle('Qual frase conta a mesma mensagem?', 0, 470)
    const contentTop = this.layoutTitle(title)

    const showcase = this.createItemShowcase(contentTop + 90, 140)
    const box = showcase.getData('box') as number

    const areaTop = showcase.y + box / 2 + 20
    const areaBottom = this.actionRowY - ACTION_ICON / 2 - 10
    const step = (areaBottom - areaTop) / options.length
    const btnH = Math.min(60, step - 6)

    const buttons: Phaser.GameObjects.Container[] = []
    options.forEach((phrase, i) => {
      const btn = this.createThemedButton(470, btnH, phrase, OPTION_COLORS[i % OPTION_COLORS.length])
      btn.setPosition(0, areaTop + step * i + step / 2)
      btn.setInteractive({ cursor: 'pointer' })
      btn.on('pointerdown', () => {
        if (phrase === item.phrase) { this.playTick(); this.completeRegistration('text'); return }
        this.cameras.main.shake(120, 0.0015)
        this.flashButtonError(btn, 470, btnH)
      })
      buttons.push(btn)
    })

    const backBtn = this.buildBackButton(0, this.actionRowY, () => this.cancelRegistration())

    this.registerContainer.add([title, showcase, ...buttons, backBtn])
  }

  private buildPhraseOptions(item: GameItem): string[] {
    const key = `p:${this.levelConfig.level}:${this.currentMissionIndex}:${item.id}`
    const cached = this.optionsCache.get(key)
    if (cached) return cached

    const others = Object.values(CONCEPTS)
      .filter(c => c.id !== item.id)
      .map(c => c.phrase)
    const distractors = Phaser.Utils.Array.Shuffle(others).slice(0, 2)
    const result = Phaser.Utils.Array.Shuffle([item.phrase, ...distractors])

    this.optionsCache.set(key, result)
    return result
  }

  private buildSoundInteraction() {
    const item = this.currentMission.item
    const options = this.buildSoundOptions(item)
    let selected: string | null = null

    const title = this.createInterfaceTitle('Ouça e escolha o som certo', 0, 470)
    const contentTop = this.layoutTitle(title)

    const showcase = this.createItemShowcase(contentTop + 95, 150)
    const ringsY = showcase.y + (showcase.getData('box') as number) / 2 + 74

    const spacing = 160
    const startX = -((options.length - 1) * spacing) / 2
    const redraws: Array<(on: boolean) => void> = []

    const confirmBtn = this.buildConfirmButton(78, this.actionRowY, () => {
      if (!selected) return
      if (selected !== item.soundKey) { this.cameras.main.shake(120, 0.002); this.playError(); return }
      this.completeRegistration('audio')
    })
    this.setActionEnabled(confirmBtn, false)

    options.forEach((soundKey, i) => {
      const c = SOUND_COLORS[i % SOUND_COLORS.length]
      const R = 54

      const g = this.add.graphics()
      const draw = (on: boolean) => {
        g.clear()
        g.fillStyle(0x000000, 0.18); g.fillCircle(4, 6, R + 2)
        g.fillStyle(c.fill, 1); g.fillCircle(0, 0, R)
        g.fillStyle(0xffffff, 0.34); g.fillEllipse(-12, -22, R * 1.15, R * 0.55)
        g.lineStyle(on ? 10 : 6, c.border, 1); g.strokeCircle(0, 0, R)
        if (on) { g.lineStyle(4, 0xffffff, 0.92); g.strokeCircle(0, 0, R - 11) }
      }
      draw(false)
      redraws.push(draw)

      const icon = this.fittedContain(0, 0, 'icone_som', 58, 58)   // ← no lugar do "Som N"

      const opt = this.add.container(startX + i * spacing, ringsY, [g, icon])
      opt.setSize(R * 2 + 12, R * 2 + 12)
      opt.setInteractive({ cursor: 'pointer' })

      opt.on('pointerover', () => this.tweens.add({ targets: opt, scale: 1.07, duration: 120 }))
      opt.on('pointerout', () => this.tweens.add({ targets: opt, scale: 1, duration: 120 }))
      opt.on('pointerdown', () => {
        this.sound.play(soundKey)
        selected = soundKey
        redraws.forEach((fn, ri) => fn(ri === i))
        // pulsinho no ícone, reforça que "tocou"
        this.tweens.add({ targets: icon, scale: icon.scale * 1.18, yoyo: true, duration: 130 })
        this.tweens.add({ targets: opt, scale: 0.9, duration: 90, yoyo: true })
        this.setActionEnabled(confirmBtn, true)
      })

      this.registerContainer.add(opt)
    })

    const hint = this.add.text(0, ringsY + 100, 'Toque em cada som para ouvir', {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontSize: '22px', color: '#ffffff',
      fontStyle: 'bold', stroke: TEXT_STROKE, strokeThickness: 4
    }).setOrigin(0.5).setResolution(2)

    const backBtn = this.buildBackButton(-92, this.actionRowY, () => this.cancelRegistration())

    this.registerContainer.add([title, showcase, hint, confirmBtn, backBtn])
  }

  private buildSoundOptions(item: GameItem): string[] {
    const key = `s:${this.levelConfig.level}:${this.currentMissionIndex}:${item.id}`
    const cached = this.optionsCache.get(key)
    if (cached) return cached

    const others = Object.values(CONCEPTS)
      .filter(c => c.soundKey && c.soundKey !== item.soundKey)
      .map(c => c.soundKey!)
    const distractors = Phaser.Utils.Array.Shuffle(others).slice(0, 2)
    const result = Phaser.Utils.Array.Shuffle([item.soundKey!, ...distractors])

    this.optionsCache.set(key, result)
    return result
  }

  private flashButtonError(btn: Phaser.GameObjects.Container, w: number, h: number) {
    const bg = btn.getData('bg') as Phaser.GameObjects.Graphics
    if (!bg) return
    const pal = (btn.getData('palette') ?? BUTTON_DEFAULT) as { fill: number; dark: number }
    bg.clear()
    const radius = Math.min(28, h / 2)
    bg.fillStyle(0xa02f2f, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    bg.fillStyle(0xff6b6b, 1)
    bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, radius - 4)
    this.time.delayedCall(300, () => this.redrawThemedButtonBg(bg, w, h, pal))
  }

  private completeRegistration(channel: ChannelType) {
    this.playSend();

    if (this.overlay) {
      this.overlay.destroy()
      this.overlay = undefined
    }

    this.tweens.add({
      targets: this.registerContainer,
      alpha: 0,
      scale: 0.9,
      duration: 250,
      onComplete: () => {
        this.disposeDrawMask()
        this.registerContainer.removeAll(true)
        this.playTransmission(channel)
      }
    })
  }

  private cancelRegistration() {
    if (this.overlay) {
      this.overlay.destroy()
      this.overlay = undefined
    }

    this.tweens.add({
      targets: this.registerContainer,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.disposeDrawMask()
        this.registerContainer.removeAll(true)
        this.state = 'map'
        this.updateStationAvailability()
      }
    })
  }

  private playTransmission(channel: ChannelType) {
    this.state = 'transmitting'
    if (channel === 'audio') this.playAudioTransmission()
    else if (channel === 'image') this.playImageTransmission()
    else this.playTextTransmission()
  }

  private playAudioTransmission() {
    const item = this.currentMission.item
    const stationSprite = this.stationSprites.get('audio')!

    const icon = this.fitted(stationSprite.x, stationSprite.y, item.textureKey, 50).setDepth(50)

    this.tweens.add({
      targets: icon,
      x: ORIGIN_X + 60,
      y: ORIGIN_Y,
      duration: 500,
      ease: 'Cubic.inOut',
      onComplete: () => {
        this.tweens.add({
          targets: icon,
          alpha: 0,
          duration: 260,
          onComplete: () => icon.destroy()
        })
        this.emitSoundWaves(ORIGIN_X + 90, ORIGIN_Y, item.soundKey, () => {
          this.evaluateDelivery('audio')
        })
      }
    })
  }

  private emitSoundWaves(x: number, y: number, soundKey: string | undefined, onComplete: () => void) {
    let soundPlayed = false
    const waveCount = 3
    let completed = 0

    for (let i = 0; i < waveCount; i++) {
      this.time.delayedCall(i * 300, () => {
        const wave = this.fitted(x, y, 'onda_de_som', 90).setAlpha(0).setDepth(50)

        this.tweens.add({
          targets: wave,
          x: DEST_X,
          alpha: { from: 0.8, to: 0 },
          duration: 900,
          ease: 'Linear',
          onUpdate: () => {
            if (!soundPlayed && wave.x >= 950 && soundKey) {
              this.sound.play(soundKey)
              soundPlayed = true
            }
          },
          onComplete: () => {
            wave.destroy()
            completed++
            if (completed === waveCount) this.time.delayedCall(200, onComplete)
          }
        })
      })
    }
  }

  private playImageTransmission() {
    const paper = this.fitted(ORIGIN_X, ORIGIN_Y, 'papel_desenhado', 60).setDepth(50)

    this.tweens.add({
      targets: paper,
      x: DEST_X,
      y: DEST_Y,
      duration: 800,
      ease: 'Cubic.inOut',
      onComplete: () => {
        paper.destroy()
        this.showDrawingAnalysis()
      }
    })
  }

  private showDrawingAnalysis() {
    const item = this.currentMission.item

    const analysisOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7)
      .setDepth(40).setInteractive()

    const group = this.add.container(640, 360).setDepth(41)

    const personagem = this.fitted(-230, 0, 'destino_analisa_desenho', 300)
    const board = this.fitted(230, 0, 'quadro_desenho', 330)
    const art = this.fitted(230, 0, item.textureKey, 200)

    group.add([personagem, board, art])
    group.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: group, alpha: 1, scale: 1, duration: 260, ease: 'Back.out' })

    this.time.delayedCall(2000, () => {
      analysisOverlay.destroy()
      group.destroy()
      this.evaluateDelivery('image')
    })
  }

  private playTextTransmission() {
    const envelope = this.fitted(ORIGIN_X, ORIGIN_Y, 'estacao_envelope', 60).setDepth(50)

    this.tweens.add({
      targets: envelope,
      x: DEST_X,
      y: DEST_Y,
      duration: 700,
      ease: 'Cubic.inOut',
      onComplete: () => {
        envelope.destroy()
        this.evaluateDelivery('text')
      }
    })
  }

  // ── Avaliação ──────────────────────────────────────────────────────────

  private evaluateDelivery(channel: ChannelType) {
    if (!this.currentMission.requiredChannels.includes(channel)) {
      this.registerWrongDelivery()
      return
    }

    this.completedChannelsThisRound.add(channel)
    this.markRequestFulfilled(channel)

    const allDone = this.currentMission.requiredChannels.every(
      c => this.completedChannelsThisRound.has(c)
    )

    if (!allDone) {
      this.showChannelBadge(channel)
      this.state = 'map'
      this.updateStationAvailability()
      return
    }

    if (this.currentMission.requiredChannels.length > 1) {
      this.state = 'transmitting'
      this.time.delayedCall(1500, () => {
        this.clearAccumulatedBadges()
        this.registerCorrectDelivery()
      })
      return
    }

    this.registerCorrectDelivery()
  }

  private showChannelBadge(channel: ChannelType) {
    const station = STATIONS.find(s => s.channel === channel)!
    const count = this.accumulatedBadges.length
    const spacing = 70
    const startX = -(spacing * (this.currentMission.requiredChannels.length - 1)) / 2
    const badge = this.fitted(startX + count * spacing, 0, station.textureKey, 60).setDepth(15)

    this.accumulatedBadges.push(badge)
    this.resultContainer.add(badge)
    this.resultContainer.setAlpha(1)
  }

  private clearAccumulatedBadges() {
    this.accumulatedBadges.forEach(badge => badge.destroy())
    this.accumulatedBadges = []
  }

  private registerCorrectDelivery() {
    const pointsEarned = POINTS_PER_CHANNEL * this.currentMission.requiredChannels.length

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      pointsEarned,
      stage: this.levelConfig.level
    })

    this.points += pointsEarned
    this.showSuccessComparison()
  }

  private registerWrongDelivery() {
    this.clearAccumulatedBadges()

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: -WRONG_CHANNEL_PENALTY,
      stage: this.levelConfig.level
    })

    this.points = Math.max(0, this.points - WRONG_CHANNEL_PENALTY)
    this.showLossComparison()
  }

  private showSuccessComparison() {
    this.state = 'comparing'
    const item = this.currentMission.item

    this.resultContainer.removeAll(true)

    const destinoIcon = this.fitted(0, 0, item.textureKey, 90).setAlpha(0)
    const targetScale = destinoIcon.scaleX
    destinoIcon.setScale(0)

    this.resultContainer.add(destinoIcon)
    this.resultContainer.setAlpha(1)

    this.playSuccess()

    this.tweens.add({
      targets: destinoIcon,
      alpha: 1,
      scale: targetScale,
      duration: 300,
      delay: 150,
      ease: 'Back.out',
      onComplete: () => this.time.delayedCall(1500, () => this.finishMission())
    })
  }

  private showLossComparison() {
    this.state = 'comparing'
    const item = this.currentMission.item

    this.resultContainer.removeAll(true)

    const destinoIcon = this.fitted(0, 0, item.textureKey, 90).setTint(0x999999)

    const cross = this.add.graphics().setAlpha(0)
    cross.lineStyle(11, 0xc62828, 1)
    cross.lineBetween(-30, -30, 30, 30)
    cross.lineBetween(30, -30, -30, 30)
    cross.setPosition(0, -78)

    this.resultContainer.add([destinoIcon, cross])
    this.resultContainer.setAlpha(1)

    this.playError()

    this.tweens.add({
      targets: destinoIcon,
      angle: { from: -4, to: 4 },
      duration: 90,
      yoyo: true,
      repeat: 3
    })

    this.tweens.add({
      targets: cross,
      alpha: 1,
      scale: { from: 0.6, to: 1 },
      duration: 300,
      delay: 200,
      ease: 'Back.out',
      onComplete: () => this.time.delayedCall(1600, () => this.finishMission())
    })
  }

  private finishMission() {
    this.currentMissionIndex++
    this.registry.set('roundIndex', this.currentMissionIndex)

    this.tweens.add({
      targets: this.resultContainer,
      alpha: 0,
      duration: 250,
      onComplete: () => this.startMission()
    })
  }

  private advanceLevel() {
    const finishedLevel = this.levelConfig.level
    this.state = 'comparing'

    if (this.currentLevelIndex < LEVELS.length - 1) {
      showLevelComplete(this, {
        subtitle: `Nível ${finishedLevel} concluído`,
        message: LEVELS[this.currentLevelIndex + 1].objective,
        accent: TITLE_BG_DARK,
        overlayColor: 0x0f2c47,
        titleColor: '#123b5e',
        subtitleColor: '#2b5d85',
        progress: { total: LEVELS.length, current: finishedLevel },
        autoAdvance: {
          delay: 2300,
          onComplete: () => {
            this.currentLevelIndex++
            this.currentMissionIndex = 0
            this.startMission()
            this.showLevelIntro(() => this.runLevelTutorial())
          },
        },
      })
      return
    }

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.levelConfig.level
    })

    showLevelComplete(this, {
      title: 'Jogo concluído!',
      subtitle: 'Você entregou todas as mensagens',
      accent: TITLE_BG_DARK,
      overlayColor: 0x0f2c47,
      titleColor: '#123b5e',
      subtitleColor: '#2b5d85',
      progress: { total: LEVELS.length, current: LEVELS.length },
      buttons: [
        { label: 'Jogar novamente', color: TITLE_BG_DARK, onClick: () => this.startGame(1, 0) },
        { label: 'Outros jogos', color: TITLE_BG, onClick: () => EventBus.emit('exit-game') },
      ],
    })
  }

  private showGameCompleteScreen() {
    this.state = 'comparing'

    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.62)
      .setDepth(400).setInteractive()

    const panel = this.add.container(640, 360).setDepth(401)
    panel.add(this.createModalBackground(620, 380))

    const title = this.add.text(0, -110, 'Jogo concluído!', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#1a3b1a',
      strokeThickness: 5
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -50, 'Você entregou todas as mensagens!', {
      fontFamily: 'DynaPuff, Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5).setResolution(2)

    const againBtn = this.createThemedButton(360, 62, 'Jogar novamente')
    againBtn.setPosition(0, 40)
    againBtn.setInteractive({ cursor: 'pointer' })
    againBtn.on('pointerdown', () => {
      this.playTick()
      panel.destroy()
      this.startGame(1, 0)
    })

    const exitBtn = this.createThemedButton(360, 62, 'Outros jogos')
    exitBtn.setPosition(0, 120)
    exitBtn.setInteractive({ cursor: 'pointer' })
    exitBtn.on('pointerdown', () => {
      this.playTick()
      EventBus.emit('exit-game')
    })

    panel.add([title, subtitle, againBtn, exitBtn])
    panel.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.out' })
  }

  private createInterfaceTitle(text: string, y: number, width = 470, highlight?: string) {
    const container = this.add.container(0, y)
    const w = width

    const label = this.add.text(0, 0, text, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#1e3category',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: w - 96 }
    }).setOrigin(0.5).setResolution(2)

    const chip = highlight ? this.createHighlightChip(highlight, w - 70) : undefined
    const chipH = chip ? (chip.getData('h') as number) * (chip.getData('base') as number) : 0

    const h = Math.max(72, label.height + chipH + (chip ? 42 : 34))
    const r = Math.min(28, h / 2)

    const bg = this.add.graphics()
    bg.fillStyle(0x000000, 0.18); bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 7, w, h, r)
    bg.fillStyle(TITLE_BG_DARK, 1); bg.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    bg.fillStyle(TITLE_BG, 1); bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, Math.max(4, r - 4))
    bg.fillStyle(0xffffff, 0.18); bg.fillRoundedRect(-w / 2 + 18, -h / 2 + 9, w - 36, 22, 14)

    // posiciona texto e chip empilhados
    label.setY(-h / 2 + 16 + label.height / 2)
    chip?.setY(label.y + label.height / 2 + 8 + chipH / 2)

    container.add(chip ? [bg, label, chip] : [bg, label])
    container.setData('height', h)
    return container
  }

  private createHighlightChip(word: string, maxW: number) {
    const label = this.add.text(0, 0, word.toUpperCase(), {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '27px',
      color: '#4a3400'
    }).setOrigin(0.5).setResolution(2)

    const cw = label.width + 52
    const ch = label.height + 20
    const r = ch / 2

    const g = this.add.graphics()
    g.fillStyle(0xb8902c, 1); g.fillRoundedRect(-cw / 2, -ch / 2 + 4, cw, ch, r)
    g.fillStyle(0xf9ce5d, 1); g.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, r)
    g.fillStyle(0xffffff, 0.42); g.fillRoundedRect(-cw / 2 + 10, -ch / 2 + 5, cw - 20, ch * 0.34, r * 0.6)

    const c = this.add.container(0, 0, [g, label])
    const base = cw > maxW ? maxW / cw : 1
    c.setScale(base)
    c.setData('h', ch + 4)
    c.setData('base', base)

    this.tweens.add({
      targets: c, scale: base * 1.05,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut'
    })

    return c
  }

  private createItemShowcase(y: number, size = 150) {
    const box = size + 40
    const g = this.add.graphics()
    g.fillStyle(0x000000, 0.18); g.fillRoundedRect(-box / 2 + 4, -box / 2 + 7, box, box, 30)
    g.fillStyle(INTERFACE_BLUE_DARK, 1); g.fillRoundedRect(-box / 2, -box / 2, box, box, 30)
    g.fillStyle(0xffffff, 0.96); g.fillRoundedRect(-box / 2 + 7, -box / 2 + 7, box - 14, box - 14, 24)
    g.fillStyle(INTERFACE_BLUE_LIGHT, 1)
    g.fillRoundedRect(-box / 2 + 7, -box / 2 + 7, box - 14, (box - 14) * 0.52, { tl: 24, tr: 24, bl: 0, br: 0 })
    g.lineStyle(4, 0x071827, 1); g.strokeRoundedRect(-box / 2, -box / 2, box, box, 30)

    const icon = this.fittedContain(0, 0, this.currentMission.item.textureKey, size, size)
    const c = this.add.container(0, y, [g, icon])
    c.setData('box', box)
    return c
  }

  private layoutTitle(title: Phaser.GameObjects.Container) {
    const h = title.getData('height') as number
    title.setY(-MODAL_H / 2 + 34 + h / 2)
    return title.y + h / 2 + 16
  }

  private get actionRowY() { return MODAL_H / 2 - 58 }  // = 262

  private createThemedButton(
    width: number, height: number, text: string,
    palette: { fill: number; dark: number } = BUTTON_DEFAULT
  ) {
    const bg = this.add.graphics()
    this.redrawThemedButtonBg(bg, width, height, palette)

    const label = this.add.text(0, 0, text, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 34 },
      stroke: '#' + palette.dark.toString(16).padStart(6, '0'),
      strokeThickness: 5
    }).setOrigin(0.5).setResolution(2)

    const container = this.add.container(0, 0, [bg, label])
    container.setSize(width, height)
    container.setData('bg', bg)
    container.setData('palette', palette)
    return container
  }

  private redrawThemedButtonBg(
    g: Phaser.GameObjects.Graphics, width: number, height: number,
    palette: { fill: number; dark: number } = BUTTON_DEFAULT
  ) {
    const w = width, h = height, radius = Math.min(28, h / 2)
    g.clear()
    g.fillStyle(0x000000, 0.18)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, radius)
    g.fillStyle(palette.dark, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.fillStyle(palette.fill, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, radius - 4)
    g.fillStyle(0xffffff, 0.26)
    g.fillRoundedRect(-w / 2 + 14, -h / 2 + 9, w - 28, h * 0.34, radius - 8)
  }


  private createModalBackground(width: number, height: number) {
    const g = this.add.graphics()
    const w = width, h = height, radius = 44, shadow = 8
    const left = -w / 2
    const top = -h / 2
    const bottom = h / 2

    // ── corpo do painel ──────────────────────────────────────────────
    g.fillStyle(0x000000, 0.22)
    g.fillRoundedRect(left + shadow, top + shadow + 3, w, h, radius)
    g.fillStyle(INTERFACE_BLUE_DARK, 1)
    g.fillRoundedRect(left, top, w, h, radius)
    g.fillStyle(INTERFACE_BLUE, 1)
    g.fillRoundedRect(left + 6, top + 6, w - 12, h - 12, radius - 6)

    // ── nuvens decorativas do topo ───────────────────────────────────
    g.fillStyle(0xffffff, 0.72)
    g.fillCircle(left + 82, top + 84, 28)
    g.fillCircle(left + 112, top + 72, 38)
    g.fillCircle(left + 150, top + 88, 30)
    g.fillRoundedRect(left + 70, top + 88, 105, 24, 12)

    g.fillStyle(0xffffff, 0.58)
    g.fillCircle(w / 2 - 170, top + 118, 22)
    g.fillCircle(w / 2 - 142, top + 106, 32)
    g.fillCircle(w / 2 - 106, top + 120, 24)
    g.fillRoundedRect(w / 2 - 188, top + 120, 104, 20, 10)

    g.fillStyle(0xffffff, 0.24)
    g.fillRoundedRect(left + 28, top + 24, w - 56, 42, 22)

    // ── faixa de bolinhas do rodapé ──────────────────────────────────
    const innerR = radius - 2                                   // raio interno do painel
    const bandTop = bottom - 6 - MODAL_WAVE_H
    const cornerR = Math.min(innerR, MODAL_WAVE_H / 2)

    const waveStart = left + innerR                             // ← início do monte
    const waveEnd = w / 2 - innerR                              // ← fim do monte
    const step = MODAL_WAVE_R * 1.9                             // ← espaçamento

    g.fillStyle(0x5aaef0, 0.7)
    g.fillRoundedRect(left + 6, bandTop, w - 12, MODAL_WAVE_H, {
      tl: 0, tr: 0, bl: cornerR, br: cornerR
    })
    for (let x = waveStart; x <= waveEnd; x += step) {
      g.fillCircle(x, bandTop, MODAL_WAVE_R)
    }

    g.fillStyle(0x2d6fb7, 0.28)
    for (let x = waveStart + step / 2; x <= waveEnd; x += step * 1.2) {
      g.fillCircle(x, bandTop + 9, MODAL_WAVE_R * 0.65)
    }

    // ── contornos ────────────────────────────────────────────────────
    g.lineStyle(5, 0x071827, 1)
    g.strokeRoundedRect(left, top, w, h, radius)
    g.lineStyle(2, 0xffffff, 0.65)
    g.strokeRoundedRect(left + 11, top + 11, w - 22, h - 22, radius - 10)

    return g
  }

  private fittedContain(x: number, y: number, key: string, maxW: number, maxH = maxW) {
    const { w, h } = this.srcSize(key)
    const k = Math.min(maxW / w, maxH / h)
    return this.add.image(x, y, key).setDisplaySize(w * k, h * k)
  }

  private buildConfirmButton(x: number, y: number, onClick: () => void) {
    const btn = this.createIconButton('aceitar', ACTION_ICON).setPosition(x, y)
    btn.on('pointerdown', () => { if (btn.getData('enabled') !== false) onClick() })
    return btn
  }

  private buildBackButton(x: number, y: number, onClick: () => void) {
    const btn = this.createIconButton('voltar', ACTION_ICON).setPosition(x, y)
    btn.on('pointerdown', onClick)
    return btn
  }

  private createIconButton(textureKey: string, size: number) {
    const icon = this.fittedContain(0, 0, textureKey, size, size)
    const container = this.add.container(0, 0, [icon])
    container.setSize(icon.displayWidth, icon.displayHeight) // setSize ANTES de setInteractive
    container.setData('enabled', true)
    container.setInteractive({ cursor: 'pointer' })

    container.on('pointerover', () => {
      if (container.getData('enabled') === false) return
      this.tweens.add({ targets: container, scale: 1.08, duration: 120, ease: 'Sine.out' })
    })
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 120, ease: 'Sine.out' })
    })
    container.on('pointerdown', () => {
      if (container.getData('enabled') === false) return
      this.playTick()
      this.tweens.add({ targets: container, scale: 0.9, duration: 80, yoyo: true })
    })

    return container
  }

  private setActionEnabled(btn: Phaser.GameObjects.Container, enabled: boolean) {
    btn.setData('enabled', enabled)
    this.tweens.add({ targets: btn, alpha: enabled ? 1 : 0.35, duration: 200 })
    if (enabled) btn.setInteractive({ cursor: 'pointer' })
    else btn.disableInteractive()
  }




  private getAudioCtx(): AudioContext | null {
    try {
      return (this.sound as Phaser.Sound.WebAudioSoundManager).context
    } catch { return null }
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.25) {
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

  private playTick() { this.playTone(520, 0.04, 'sine', 0.08) }

  private playSuccess() {
    this.playTone(523, 0.10, 'sine', 0.22)
    this.time.delayedCall(100, () => this.playTone(659, 0.10, 'sine', 0.22))
    this.time.delayedCall(200, () => this.playTone(784, 0.18, 'sine', 0.26))
  }

  private playError() {
    this.playTone(311, 0.16, 'square', 0.16)
    this.time.delayedCall(150, () => this.playTone(233, 0.26, 'square', 0.14))
  }

  private playSend() {
    this.playTone(660, 0.07, 'sine', 0.14)
    this.time.delayedCall(70, () => this.playTone(880, 0.10, 'sine', 0.12))
  }
}