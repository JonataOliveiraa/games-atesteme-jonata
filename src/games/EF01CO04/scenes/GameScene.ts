import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, MissionConfig, GameItem, DeliveryStation, ChannelType } from '../types'
import { LEVELS, STATIONS, CONCEPTS } from '../data/levels'
import { EventBus } from '../../../shared/EventBus'

const GAME_ID = 'correio-multimidia'

type SceneState = 'tutorial' | 'map' | 'registering' | 'transmitting' | 'comparing'

const POINTS_PER_CHANNEL = 5
const WRONG_CHANNEL_PENALTY = 5

const ORIGIN_X = 200, ORIGIN_Y = 250
const DEST_X = 1080, DEST_Y = 250
const REQUEST_Y = 458
const STATION_Y = 618
const MODAL_X = 640, MODAL_Y = 380
const BRUSH_KEY = 'brush_dot'
const MASK_CIRCLE = 'tut_mask_circle'
const MASK_RECT = 'tut_mask_rect'
const MIN_STROKES = 55

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



  private tutorialObjects: Phaser.GameObjects.GameObject[] = []
  private tutorialDone = false

  private drawMask?: Phaser.GameObjects.RenderTexture
  private revealImage?: Phaser.GameObjects.Image
  private strokeCount = 0
  private isDrawing = false

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

  private buildHelperTextures() {
    if (!this.textures.exists(BRUSH_KEY)) {
      const g = this.add.graphics()
      g.fillStyle(0xffffff, 1)
      g.fillCircle(15, 15, 15)
      g.generateTexture(BRUSH_KEY, 30, 30)
      g.destroy()
    }
    if (!this.textures.exists(MASK_CIRCLE)) {
      const g = this.add.graphics()
      g.fillStyle(0xffffff, 1)
      g.fillCircle(100, 100, 100)
      g.generateTexture(MASK_CIRCLE, 200, 200)
      g.destroy()
    }
    if (!this.textures.exists(MASK_RECT)) {
      const g = this.add.graphics()
      g.fillStyle(0xffffff, 1)
      g.fillRoundedRect(0, 0, 200, 200, 40)
      g.generateTexture(MASK_RECT, 200, 200)
      g.destroy()
    }
  }

  //ciclo do jogo (nao meche)
  private startGame(stage: number, initialPoints: number) {
    this.points = initialPoints
    this.currentLevelIndex = Math.max(0, LEVELS.findIndex(l => l.level === stage))
    this.currentMissionIndex = 0
    this.tutorialObjects = []

    this.children.removeAll()
    this.stationSprites.clear()
    this.buildEnvironment()
    this.startMission()

    if (!this.tutorialDone && this.currentLevelIndex === 0) {
      this.tutorialDone = true
      this.showTutorial()
    }
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
    const cardH = 118
    const headerH = 38

    const card = this.add.graphics()
    card.fillStyle(0x000000, 0.18)
    card.fillRoundedRect(-cardW / 2 + 5, -cardH / 2 + 6, cardW, cardH, 20)
    card.fillStyle(0xffffff, 0.97)
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
    card.lineStyle(4, 0x4e9b35, 1)
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20)
    card.fillStyle(0x87d251, 1)
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, headerH, { tl: 20, tr: 20, bl: 0, br: 0 })

    const label = this.add.text(0, -cardH / 2 + headerH / 2, 'QUER RECEBER POR', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '17px',
      color: '#ffffff'
    }).setOrigin(0.5).setResolution(2)

    this.requestIndicatorContainer.add([card, label])

    channels.forEach((channel, i) => {
      const station = STATIONS.find(s => s.channel === channel)!
      const badge = this.fitted(startX + i * spacing, 22, station.textureKey, 58)
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

  /** Escurece a tela e abre um recorte (círculo ou retângulo) sem borda. */
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

  private showTutorial() {
    this.state = 'tutorial'

    this.tut(this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.001).setDepth(299).setInteractive())
    const spot = this.tut(this.add.renderTexture(0, 0, 1280, 720).setOrigin(0).setDepth(300))

    const balloon = this.tut(this.add.container(640, 0).setDepth(320))
    const balloonBg = this.add.graphics()
    const balloonTxt = this.add.text(0, 0, '', {
      fontFamily: 'Arial Black, Arial',
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

  // ── Registro da mensagem ───────────────────────────────────────────────

  private openRegistration(station: DeliveryStation) {
    this.registerContainer.removeAll(true)
    this.registerContainer.setAlpha(0).setScale(0.9)

    if (this.overlay) this.overlay.destroy()
    this.overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5)
      .setInteractive()
      .setDepth(10)

    this.registerContainer.add(this.createModalBackground(600, 600))

    if (station.channel === 'image') this.buildDrawingInteraction()
    else if (station.channel === 'text') this.buildPhraseInteraction()
    else this.buildSoundInteraction()

    this.registerContainer.setDepth(20)
    this.tweens.add({
      targets: this.registerContainer,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.out'
    })
  }

  /** Desenho por revelação: o pincel descobre a figura escondida no quadro. */
  private buildDrawingInteraction() {
    const item = this.currentMission.item
    this.strokeCount = 0

    const title = this.add.text(0, -252, `Passe o pincel e revele o(a) ${item.nameKey}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#1a3b1a',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 480 }
    }).setOrigin(0.5)

    const boardY = -40
    const board = this.fitted(0, boardY, 'quadro_desenho', 380)

    const ART = 230
    const guide = this.fitted(0, boardY, item.textureKey, ART).setAlpha(0.16)

    const reveal = this.fitted(0, boardY, item.textureKey, ART)
    const maskRT = this.make.renderTexture(
      { x: MODAL_X, y: MODAL_Y + boardY, width: ART, height: ART }, false
    )

    this.drawMask = maskRT
    this.revealImage = reveal
    maskRT.setOrigin(0.5)
    reveal.setMask(maskRT.createBitmapMask())
    this.drawMask = maskRT

    const hitZone = this.add.zone(0, boardY, ART, ART).setInteractive({ cursor: 'crosshair' })

    const confirmBtn = this.buildConfirmButton(60, 220, () => {
      if (this.strokeCount < MIN_STROKES) return
      this.completeRegistration('image')
    })
    confirmBtn.setAlpha(0.35)

    const paint = (pointer: Phaser.Input.Pointer) => {
      const lx = pointer.worldX - MODAL_X
      const ly = pointer.worldY - (MODAL_Y + boardY)
      if (Math.abs(lx) > ART / 2 || Math.abs(ly) > ART / 2) return
      maskRT.draw(BRUSH_KEY, lx + ART / 2, ly + ART / 2)
      this.strokeCount++
      if (this.strokeCount === MIN_STROKES) {
        this.tweens.add({ targets: confirmBtn, alpha: 1, duration: 250 })
      }
    }

    hitZone.on('pointerdown', (p: Phaser.Input.Pointer) => { this.isDrawing = true; paint(p) })
    hitZone.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.isDrawing) paint(p) })
    this.input.on('pointerup', () => { this.isDrawing = false })

    const backBtn = this.buildBackButton(-150, 220, () => this.cancelRegistration())

    this.registerContainer.add([title, board, guide, reveal, hitZone, confirmBtn, backBtn])
  }

  private disposeDrawMask() {
    this.revealImage?.clearMask(true)
    this.revealImage = undefined
    this.drawMask?.destroy()
    this.drawMask = undefined
  }

  // Escolha de frase: uma descreve a mensagem, as outras não
  private buildPhraseInteraction() {
    const item = this.currentMission.item
    const options = this.buildPhraseOptions(item)

    const title = this.add.text(0, -230, 'Qual frase conta a mesma mensagem?', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 480 }
    }).setOrigin(0.5)

    const icon = this.fitted(0, -140, item.textureKey, 90)

    const buttons: Phaser.GameObjects.Container[] = []
    options.forEach((phrase, i) => {
      const btn = this.createThemedButton(470, 62, phrase)
      btn.setPosition(0, -30 + i * 82)
      btn.setInteractive({ cursor: 'pointer' })

      btn.on('pointerdown', () => {
        if (phrase === item.phrase) {
          this.playTick()
          this.completeRegistration('text')
          return
        }
        this.cameras.main.shake(120, 0.0015)
        this.flashButtonError(btn, 470, 62)
      })

      buttons.push(btn)
    })

    const backBtn = this.buildBackButton(0, 230, () => this.cancelRegistration())

    this.registerContainer.add([title, icon, ...buttons, backBtn])
  }

  private buildPhraseOptions(item: GameItem): string[] {
    const others = Object.values(CONCEPTS)
      .filter(c => c.id !== item.id)
      .map(c => c.phrase)
    const distractors = Phaser.Utils.Array.Shuffle(others).slice(0, 2)
    return Phaser.Utils.Array.Shuffle([item.phrase, ...distractors])
  }

  /** Escolha de som: o jogador ouve e identifica o som certo. */
  private buildSoundInteraction() {
    const item = this.currentMission.item
    const options = this.buildSoundOptions(item)
    let selected: string | null = null

    const title = this.add.text(0, -230, 'Ouça e escolha o som certo', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    const icon = this.fitted(0, -140, item.textureKey, 90)

    const spacing = 160
    const startX = -((options.length - 1) * spacing) / 2
    const rings: Phaser.GameObjects.Graphics[] = []

    const confirmBtn = this.buildConfirmButton(60, 200, () => {
      if (!selected) return
      if (selected !== item.soundKey) {
        this.cameras.main.shake(120, 0.002)
        this.playError()
        return
      }
      this.playTick()
      this.completeRegistration('audio')
    })
    confirmBtn.setAlpha(0.35)

    const drawRing = (g: Phaser.GameObjects.Graphics, x: number, on: boolean) => {
      g.clear()
      g.fillStyle(on ? 0xffe08a : 0xffffff, 0.95)
      g.fillCircle(x, 20, 52)
      g.lineStyle(5, on ? 0xffb703 : 0x4e9b35, 1)
      g.strokeCircle(x, 20, 52)
    }

    options.forEach((soundKey, i) => {
      const x = startX + i * spacing
      const ring = this.add.graphics()
      drawRing(ring, x, false)
      rings.push(ring)

      const label = this.add.text(x, 20, `Som ${i + 1}`, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '18px',
        color: '#1a3b1a'
      }).setOrigin(0.5)

      const hit = this.add.zone(x, 20, 110, 110).setInteractive({ cursor: 'pointer' })
      hit.on('pointerdown', () => {
        this.sound.play(soundKey)
        selected = soundKey
        rings.forEach((r, ri) => drawRing(r, startX + ri * spacing, ri === i))
        confirmBtn.setAlpha(1)
      })

      this.registerContainer.add([ring, label, hit])
    })

    const hint = this.add.text(0, 110, 'Toque em cada som para ouvir', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const backBtn = this.buildBackButton(-150, 200, () => this.cancelRegistration())

    this.registerContainer.add([title, icon, hint, confirmBtn, backBtn])
  }

  private buildSoundOptions(item: GameItem): string[] {
    const others = Object.values(CONCEPTS)
      .filter(c => c.soundKey && c.soundKey !== item.soundKey)
      .map(c => c.soundKey!)
    const distractors = Phaser.Utils.Array.Shuffle(others).slice(0, 2)
    return Phaser.Utils.Array.Shuffle([item.soundKey!, ...distractors])
  }

  private flashButtonError(btn: Phaser.GameObjects.Container, w: number, h: number) {
    const bg = btn.getData('bg') as Phaser.GameObjects.Graphics
    if (!bg) return
    bg.clear()
    bg.fillStyle(0x4e9b35, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
    bg.fillStyle(0xff6b6b, 1)
    bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 10)
    this.time.delayedCall(300, () => this.redrawThemedButtonBg(bg, w, h))
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

  // DEPOIS
  private advanceLevel() {
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.currentLevelIndex++
      this.currentMissionIndex = 0
      this.startMission()
      return
    }

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.levelConfig.level
    })

    this.showGameCompleteScreen()
  }

  private showGameCompleteScreen() {
    this.state = 'comparing'

    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.62)
      .setDepth(400).setInteractive()

    const panel = this.add.container(640, 360).setDepth(401)
    panel.add(this.createModalBackground(620, 380))

    const title = this.add.text(0, -110, 'Jogo concluído!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#1a3b1a',
      strokeThickness: 5
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -50, 'Você entregou todas as mensagens!', {
      fontFamily: 'Arial, sans-serif',
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

  private createThemedButton(width: number, height: number, text: string) {
    const bg = this.add.graphics()
    this.redrawThemedButtonBg(bg, width, height)

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 30 }
    }).setOrigin(0.5).setResolution(2)

    const container = this.add.container(0, 0, [bg, label])
    container.setSize(width, height)
    container.setData('bg', bg)
    return container
  }

  private redrawThemedButtonBg(g: Phaser.GameObjects.Graphics, width: number, height: number) {
    const w = width, h = height, radius = 12
    g.clear()
    g.fillStyle(0x4e9b35, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.fillStyle(0x87d251, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, radius - 2)
    g.lineStyle(3, 0x000f00, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)
  }

  private createModalBackground(width: number, height: number) {
    const g = this.add.graphics()
    const w = width, h = height, radius = 20, shadow = 6

    g.fillStyle(0x4e9b35, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.fillStyle(0x87d251, 1)
    g.fillRoundedRect(-w / 2 + shadow, -h / 2 + shadow, w - shadow * 2, h - shadow * 2, radius - 2)
    g.lineStyle(4, 0x000f00, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)

    return g
  }

  private buildConfirmButton(x: number, y: number, onClick: () => void) {
    const btn = this.fitted(x, y, 'botao_confirmar', 120)
    btn.setInteractive({ cursor: 'pointer' })
    btn.on('pointerdown', onClick)
    return btn
  }

  private buildBackButton(x: number, y: number, onClick: () => void) {
    const btn = this.fitted(x, y, 'botao_avancar', 90)
    btn.setScale(-btn.scaleX, btn.scaleY)
    btn.setInteractive({ cursor: 'pointer' })
    btn.on('pointerdown', onClick)
    return btn
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