import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, MissionConfig, GameItem, DeliveryStation, ChannelType } from '../types'
import { LEVELS, STATIONS, CONCEPTS } from '../data/levels'

const GAME_ID = 'correio-multimidia'

type SceneState = 'map' | 'registering' | 'transmitting' | 'comparing'

const INSTRUCTIONS_BY_MODE: Record<string, string> = {
  single: 'Escolha a estação certa e registre a mensagem!',
  dual: 'Envie a mesma mensagem pelos dois caminhos indicados!',
  mastery: 'Escolha o melhor caminho pra essa situação!'
}

export class GameScene extends Phaser.Scene {
  private currentLevelIndex = 0
  private currentMissionIndex = 0
  private levelConfig!: LevelConfig
  private currentMission!: MissionConfig
  private points = 0
  private state: SceneState = 'map'
  private drawingRT?: Phaser.GameObjects.RenderTexture
  private accumulatedBadges: Phaser.GameObjects.Image[] = []

  private stationSprites: Map<ChannelType, Phaser.GameObjects.Image> = new Map()
  private originPanelIcon?: Phaser.GameObjects.Image
  private resultContainer!: Phaser.GameObjects.Container
  private registerContainer!: Phaser.GameObjects.Container
  private overlay?: Phaser.GameObjects.Rectangle

  private completedChannelsThisRound: Set<ChannelType> = new Set()
  private pulseTween?: Phaser.Tweens.Tween
  private isDrawing = false
  private removeCommandListener!: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  private createThemedButton(width: number, height: number, text: string): Phaser.GameObjects.Container {
    const w = width
    const h = height
    const radius = 12
    const borderColor = 0x000f00
    const shadowColor = 0x4e9b35
    const fillColor = 0x87d251
    const borderWidth = 3
    const shadowWidth = 4

    const bg = this.add.graphics()
    // Sombra interna (fundo maior)
    bg.fillStyle(shadowColor, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    // Preenchimento principal
    bg.fillStyle(fillColor, 1)
    bg.fillRoundedRect(
      -w / 2 + shadowWidth,
      -h / 2 + shadowWidth,
      w - shadowWidth * 2,
      h - shadowWidth * 2,
      radius - 2
    )
    // Borda
    bg.lineStyle(borderWidth, borderColor, 1)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',       // texto branco para contraste
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10)

    const container = this.add.container(0, 0, [bg, label])
    container.setSize(w, h)
    container.setData('bg', bg)   // guardamos referência para mudar cor depois

    return container
  }

  private createModalBackground(width: number, height: number): Phaser.GameObjects.Graphics {
    const g = this.add.graphics()
    const w = width
    const h = height
    const radius = 20
    const borderColor = 0x000f00
    const shadowColor = 0x4e9b35
    const fillColor = 0x87d251
    const borderWidth = 4
    const shadowWidth = 6   // espessura da faixa de sombra interna

    // Desenha a sombra interna (retângulo arredondado maior)
    g.fillStyle(shadowColor, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)

    // Desenha o preenchimento principal (retângulo arredondado ligeiramente menor)
    g.fillStyle(fillColor, 1)
    g.fillRoundedRect(
      -w / 2 + shadowWidth,
      -h / 2 + shadowWidth,
      w - shadowWidth * 2,
      h - shadowWidth * 2,
      radius - 2
    )

    // Desenha a borda externa
    g.lineStyle(borderWidth, borderColor, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)

    return g
  }

  create() {
    this.removeCommandListener = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type === 'START_GAME' && cmd.gameId === GAME_ID) {
        this.startGame(cmd.stage, cmd.points)
      }
    })

    this.startGame(1, 0)
  }

  private startGame(stage: number, initialPoints: number) {
    this.points = initialPoints
    this.currentLevelIndex = Math.max(0, LEVELS.findIndex(l => l.level === stage))
    this.currentMissionIndex = 0

    this.children.removeAll()
    this.stationSprites.clear()
    this.buildEnvironment()
    this.startMission()
  }

  private buildEnvironment() {
    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, 'bg_mapa').setDisplaySize(width, height)

    const origemPanel = this.add.image(200, 250, 'painel_origem')
    origemPanel.setScale(320 / origemPanel.width)

    this.originPanelIcon = this.add.image(200, 250, 'info_cachorro') // y = 250 (mesmo do painel)
    this.originPanelIcon.setScale(80 / this.originPanelIcon.width)

    const destinoPanel = this.add.image(1080, 250, 'painel_destino')
    destinoPanel.setScale(320 / destinoPanel.width)

    this.buildStations()

    this.resultContainer = this.add.container(1080, 250).setAlpha(0)
    this.registerContainer = this.add.container(640, 420).setAlpha(0)
  }

  private buildStations() {
    const marginX = 260
    const usableWidth = 1280 - marginX * 2
    const count = STATIONS.length

    STATIONS.forEach((station, i) => {
      const x = marginX + (usableWidth / (count - 1)) * i
      const sprite = this.add.image(x, 600, station.textureKey)
      const baseScale = 170 / sprite.width
      sprite.setScale(baseScale)
      sprite.setData('station', station)
      sprite.setData('baseScale', baseScale)

      sprite.on('pointerover', () => {
        if (this.state !== 'map') return
        sprite.setScale(baseScale * 1.08)
      })
      sprite.on('pointerout', () => sprite.setScale(baseScale))
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
    this.drawingRT = undefined
    this.accumulatedBadges = []

    if (this.currentMissionIndex >= this.levelConfig.missions.length) {
      this.advanceLevel()
      return
    }

    this.currentMission = this.levelConfig.missions[this.currentMissionIndex]
    this.completedChannelsThisRound = new Set()
    this.state = 'map'

    this.resultContainer.setAlpha(0)
    this.resultContainer.removeAll(true)
    this.registerContainer.setAlpha(0)
    this.registerContainer.removeAll(true)

    if (this.originPanelIcon) {
      this.originPanelIcon.setTexture(this.currentMission.item.textureKey)
      this.originPanelIcon.setScale(80 / this.originPanelIcon.width)
    }

    this.registry.set('instructionText', INSTRUCTIONS_BY_MODE[this.levelConfig.mode])
    this.registry.set('roundTotal', this.levelConfig.missions.length)
    this.registry.set('roundIndex', this.currentMissionIndex)

    if (this.overlay) {
      this.overlay.destroy()
      this.overlay = undefined
    }

    this.updateStationAvailability()
  }

  private updateStationAvailability() {
    if (this.pulseTween) {
      this.pulseTween.stop()
      this.pulseTween = undefined
    }

    const item = this.currentMission.item
    const mode = this.levelConfig.mode

    this.stationSprites.forEach((sprite, channel) => {
      const station = sprite.getData('station') as DeliveryStation
      const baseScale = sprite.getData('baseScale') as number

      let selectable: boolean
      if (mode === 'single') {
        selectable = this.currentMission.requiredChannels.includes(channel)
      } else if (mode === 'dual') {
        selectable = this.currentMission.requiredChannels.includes(channel) && !this.completedChannelsThisRound.has(channel)
      } else {
        selectable = item.validChannels.includes(channel)
      }

      sprite.setScale(baseScale)
      sprite.setAlpha(selectable ? 1 : 0.35)
      sprite.disableInteractive()
      if (selectable) sprite.setInteractive({ cursor: 'pointer' })

      sprite.setTexture(channel === 'audio' && !item.soundKey ? 'microfone_indisponivel' : station.textureKey)
    })

    if (mode === 'single') {
      const targetChannel = this.currentMission.requiredChannels[0]
      const targetSprite = this.stationSprites.get(targetChannel)
      if (targetSprite) {
        const baseScale = targetSprite.getData('baseScale') as number
        this.pulseTween = this.tweens.add({
          targets: targetSprite,
          scale: baseScale * 1.12,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut'
        })
      }
    }
  }

  private onStationClicked(station: DeliveryStation, sprite: Phaser.GameObjects.Image) {
    if (this.state !== 'map') return

    const item = this.currentMission.item

    if (station.channel === 'audio' && !item.soundKey) {
      this.cameras.main.shake(150, 0.002)
      return
    }

    if (this.pulseTween) {
      this.pulseTween.stop()
      this.pulseTween = undefined
    }
    sprite.setScale(sprite.getData('baseScale'))

    this.sound.play('som_click_ui')
    this.state = 'registering'
    this.openRegistration(station)
  }

  private openRegistration(station: DeliveryStation) {
    this.registerContainer.removeAll(true)
    this.registerContainer.setAlpha(0)
    this.registerContainer.y = 460

    // Overlay escuro (já existente)
    if (this.overlay) this.overlay.destroy()
    this.overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5)
      .setInteractive()
      .setDepth(10)

    // Fundo estilizado com bordas arredondadas, sombra e borda
    const modalBg = this.createModalBackground(540, 550)
    modalBg.setDepth(0)
    this.registerContainer.add(modalBg)

    // Interação específica do canal
    if (station.channel === 'image') this.buildDrawingInteraction()
    else if (station.channel === 'text') this.buildWordSelectionInteraction()
    else this.buildSoundInteraction()

    this.registerContainer.setDepth(20)

    this.tweens.add({
      targets: this.registerContainer,
      alpha: 1,
      y: 420,
      duration: 350,
      ease: 'Back.out'
    })
  }

  private buildDrawingInteraction() {
    const item = this.currentMission.item

    const instructionText = this.add.text(0, -200, `Desenhe um(a) ${item.nameKey} para sua amiga`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#1a3b1a',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 460 }
    }).setOrigin(0.5, 2.5).setDepth(10)

    // Quadro de desenho (movido um pouco para baixo para dar espaço ao texto)
    const boardY = -20
    const board = this.add.image(0, boardY, 'quadro_desenho')
    const boardScale = 420 / board.width
    board.setScale(boardScale)

    const rt = this.add.renderTexture(0, boardY, board.width, board.height)
    rt.setScale(boardScale)

    const brushKey = 'brush_dot'
    if (!this.textures.exists(brushKey)) {
      const g = this.add.graphics()
      g.fillStyle(0x333333, 1)
      g.fillCircle(4, 4, 4)
      g.generateTexture(brushKey, 8, 8)
      g.destroy()
    }

    const hitZone = this.add.zone(0, boardY, board.width * boardScale, board.height * boardScale)
    hitZone.setInteractive({ cursor: 'crosshair' })

    const draw = (pointer: Phaser.Input.Pointer) => {
      const matrix = board.getWorldTransformMatrix()
      const point = matrix.applyInverse(pointer.worldX, pointer.worldY)
      rt.draw(brushKey, point.x + board.width / 2, point.y + board.height / 2)
    }

    hitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDrawing = true
      draw(pointer)
    })
    hitZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDrawing) draw(pointer)
    })
    this.input.on('pointerup', () => { this.isDrawing = false })

    // Botões movidos para baixo proporcionalmente
    const confirmBtn = this.buildConfirmButton(0, 200, () => this.completeRegistration('image'))
    const backBtn = this.buildBackButton(-190, 200, () => this.cancelRegistration())

    this.registerContainer.add([instructionText, board, rt, hitZone, confirmBtn, backBtn])
    this.drawingRT = rt
  }

  private buildWordSelectionInteraction() {
    const item = this.currentMission.item
    const options = this.buildWordOptions(item)

    const label = this.add.text(0, -110, 'Escolha a palavra certa:', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',        // texto claro sobre fundo verde
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10)

    const spacing = 160
    const startX = -((options.length - 1) * spacing) / 2
    const buttons: Phaser.GameObjects.Container[] = []

    options.forEach((word, i) => {
      const btn = this.createThemedButton(140, 50, word)
      btn.setPosition(startX + i * spacing, -40)
      btn.setInteractive({ cursor: 'pointer' })

      btn.on('pointerdown', () => {
        if (word === item.nameKey) {
          this.sound.play('som_click_ui')
          this.completeRegistration('text')
        } else {
          this.cameras.main.shake(120, 0.0015)
          // Feedback visual de erro: troca o preenchimento para tom avermelhado
          const bg = btn.getData('bg') as Phaser.GameObjects.Graphics
          if (bg) {
            bg.clear()
            const w = 140, h = 50, radius = 12
            // Redesenha com cor de erro mantendo borda e sombra
            bg.fillStyle(0x4e9b35, 1)  // sombra ainda igual
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
            bg.fillStyle(0xff6b6b, 1)  // vermelho claro para erro
            bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, radius - 2)
            bg.lineStyle(3, 0x000f00, 1)
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)
          }
          this.time.delayedCall(300, () => {
            // Restaura o original
            const bg2 = btn.getData('bg') as Phaser.GameObjects.Graphics
            if (bg2) {
              bg2.clear()
              this.redrawThemedButtonBg(bg2, 140, 50)
            }
          })
        }
      })

      buttons.push(btn)
    })

    const backBtn = this.buildBackButton(0, 60, () => this.cancelRegistration())

    this.registerContainer.add([label, ...buttons, backBtn])
  }

  private redrawThemedButtonBg(graphics: Phaser.GameObjects.Graphics, width: number, height: number) {
    const w = width, h = height, radius = 12
    graphics.fillStyle(0x4e9b35, 1)
    graphics.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    graphics.fillStyle(0x87d251, 1)
    graphics.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, radius - 2)
    graphics.lineStyle(3, 0x000f00, 1)
    graphics.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)
  }

  private buildWordOptions(item: GameItem): string[] {
    const others = Object.values(CONCEPTS)
      .map(c => c.nameKey)
      .filter(name => name !== item.nameKey)
    const distractor = Phaser.Utils.Array.GetRandom(others)
    return Phaser.Utils.Array.Shuffle([item.nameKey, distractor])
  }

  private buildSoundInteraction() {
    const item = this.currentMission.item

    const instructionText = this.add.text(0, -120, `Ouça o som do(a) ${item.nameKey}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10).setDepth(10)

    const micIcon = this.add.image(0, -20, 'estacao_microfone_ativa')
    micIcon.setScale(140 / micIcon.width)
    micIcon.setInteractive({ cursor: 'pointer' })
    micIcon.on('pointerdown', () => {
      if (item.soundKey) this.sound.play(item.soundKey)
      this.tweens.add({ targets: micIcon, scale: micIcon.scale * 1.15, yoyo: true, duration: 150 })
    })

    const hint = this.add.text(0, 60, 'Toque para ouvir o som', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(10).setDepth(10)

    const confirmBtn = this.buildConfirmButton(0, 150, () => this.completeRegistration('audio'))
    const backBtn = this.buildBackButton(-190, 150, () => this.cancelRegistration())

    this.registerContainer.add([instructionText, micIcon, hint, confirmBtn, backBtn])
  }

  private buildConfirmButton(x: number, y: number, onClick: () => void): Phaser.GameObjects.Image {
    const btn = this.add.image(x, y, 'botao_confirmar')
    btn.setScale(120 / btn.width)
    btn.setInteractive({ cursor: 'pointer' })
    btn.on('pointerdown', onClick)
    return btn
  }

  private buildBackButton(x: number, y: number, onClick: () => void): Phaser.GameObjects.Image {
    const btn = this.add.image(x, y, 'botao_avancar')
    const scale = 90 / btn.width
    btn.setScale(-scale, scale)
    btn.setInteractive({ cursor: 'pointer' })
    btn.on('pointerdown', onClick)
    return btn
  }

  private completeRegistration(channel: ChannelType) {
    this.sound.play('som_transmissao')

    if (this.overlay) {
      this.overlay.destroy()
      this.overlay = undefined
    }

    let drawKey: string | undefined
    if (channel === 'image' && this.drawingRT) {
      drawKey = 'draw_' + this.currentMission.id + '_' + Date.now()
      this.drawingRT.saveTexture(drawKey)
      this.drawingRT = undefined
    }

    this.tweens.add({
      targets: this.registerContainer,
      alpha: 0,
      y: this.registerContainer.y - 30,
      duration: 250,
      onComplete: () => {
        this.registerContainer.removeAll(true)
        this.completedChannelsThisRound.add(channel)
        this.playTransmission(channel, drawKey)
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
        this.registerContainer.removeAll(true)
        this.state = 'map'
        this.updateStationAvailability()
      }
    })
  }

  private playTransmission(channel: ChannelType, drawKey?: string) {
    this.state = 'transmitting'
    if (channel === 'audio') {
      this.playAudioTransmission()
    } else if (channel === 'image') {
      this.playImageTransmission(drawKey)
    } else if (channel === 'text') {
      this.playTextTransmission()
    }
  }

  private playAudioTransmission() {
    const item = this.currentMission.item
    const stationSprite = this.stationSprites.get('audio')!

    const icon = this.add.image(stationSprite.x, stationSprite.y, item.textureKey)
    icon.setScale(50 / icon.width)
    icon.setDepth(50)

    this.tweens.add({
      targets: icon,
      x: 320,
      y: 250,
      duration: 500,
      ease: 'Cubic.inOut',
      onComplete: () => {
        icon.destroy()

        const speaker = this.add.image(320, 250, 'estacao_alto_falante_ativa')
          .setScale(0.01).setAlpha(0).setDepth(50)

        this.tweens.add({
          targets: speaker,
          scale: 70 / speaker.width,  // menor (antes 90)
          alpha: 1,
          duration: 300,
          ease: 'Back.out',
          onComplete: () => {
            this.emitSoundWaves(320, 250, item.soundKey, () => {
              speaker.destroy()
              this.evaluateDelivery('audio')
            })
          }
        })
      }
    })
  }

  private emitSoundWaves(x: number, y: number, soundKey?: string, onComplete?: () => void) {
    let soundPlayed = false
    const waveCount = 3
    let completedWaves = 0

    for (let i = 0; i < waveCount; i++) {
      this.time.delayedCall(i * 300, () => {
        const wave = this.add.image(x, y, 'onda_de_som')
          .setAlpha(0).setScale(0.1).setDepth(50)

        this.tweens.add({
          targets: wave,
          x: 1080,
          alpha: { from: 0.8, to: 0 },
          scaleX: 1.8,
          scaleY: 1.8,
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
            completedWaves++
            if (completedWaves === waveCount && onComplete) {
              this.time.delayedCall(200, onComplete)
            }
          }
        })
      })
    }
  }

  private playImageTransmission(drawKey?: string) {
    if (!drawKey) {
      this.time.delayedCall(100, () => this.evaluateDelivery('image'))
      return
    }

    // Papel desenhado sai da ORIGEM e vai para o destino
    const paper = this.add.image(200, 250, 'papel_desenhado')
      .setScale(60 / 200)
      .setDepth(50)

    this.tweens.add({
      targets: paper,
      x: 1080,
      y: 250,
      duration: 800,
      ease: 'Cubic.inOut',
      onComplete: () => {
        paper.destroy()

        // --- Cena de análise ---
        const analysisOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7)
          .setDepth(40).setInteractive()

        // Container para centralizar os dois elementos
        const analysisGroup = this.add.container(0, 0).setDepth(41)

        // Personagem (esquerda)
        const personagem = this.add.image(0, 0, 'destino_analisa_desenho')
          .setScale(0.6)

        // Quadro + desenho (direita)
        const board = this.add.image(0, 0, 'quadro_desenho')
        const boardScale = 0.5  // ajuste fino conforme necessário
        board.setScale(boardScale)

        const desenho = this.add.image(0, 0, drawKey)
          .setScale(boardScale)  // mesma escala do quadro

        // Agrupa o quadro e o desenho em um sub-container para manter alinhamento
        const drawingGroup = this.add.container(0, 0, [board, desenho])

        analysisGroup.add([personagem, drawingGroup])

        const spacing = 450  // espaço entre o centro do personagem e o centro do quadro
        personagem.setX(-spacing / 2)
        drawingGroup.setX(spacing / 2)

        // Centraliza o grupo inteiro na tela
        analysisGroup.setX(680)
        analysisGroup.setY(290)

        this.time.delayedCall(2000, () => {
          analysisOverlay.destroy()
          analysisGroup.destroy()
          this.textures.remove(drawKey)

          this.evaluateDelivery('image')
        })
      }
    })
  }

  private showChannelBadge(channel: ChannelType) {
    const station = STATIONS.find(s => s.channel === channel)!
    const count = this.accumulatedBadges.length
    const spacing = 70                    // distância entre centros
    const startX = -(spacing * (this.currentMission.requiredChannels.length - 1)) / 2
    const xOffset = startX + count * spacing
    const yOffset = 0                     // centralizado verticalmente no destino
    const badge = this.add.image(xOffset, yOffset, station.textureKey)
    const badgeScale = 60 / badge.width   // escala maior, visível
    badge.setScale(badgeScale)
    badge.setDepth(15)

    this.accumulatedBadges.push(badge)
    this.resultContainer.add(badge)
    this.resultContainer.setAlpha(1)
  }

  private playTextTransmission() {
    const envelope = this.add.image(200, 250, 'estacao_envelope')
      .setScale(35 / 200)   // envelope menor, antes 80
      .setDepth(50)

    this.tweens.add({
      targets: envelope,
      x: 1080,
      y: 250,
      duration: 700,
      ease: 'Cubic.inOut',
      onComplete: () => {
        envelope.destroy()
        this.evaluateDelivery('text')
      }
    })
  }
  private evaluateDelivery(channel: ChannelType) {
    const item = this.currentMission.item
    const mode = this.levelConfig.mode

    if (mode === 'dual') {
      this.showChannelBadge(channel)

      const bothDone = this.currentMission.requiredChannels.every(c => this.completedChannelsThisRound.has(c))
      if (!bothDone) {
        this.state = 'map'
        this.updateStationAvailability()
        return
      }

      this.state = 'transmitting'
      this.time.delayedCall(1500, () => {
        this.clearAccumulatedBadges()
        this.showSuccessComparison()
      })
      return
    }

    const success = mode === 'mastery' ? item.validChannels.includes(channel) : true

    if (success) this.showSuccessComparison()
    else this.showLossComparison()
  }

  private clearAccumulatedBadges() {
    this.accumulatedBadges.forEach(badge => badge.destroy())
    this.accumulatedBadges = []
  }

  private showSuccessComparison() {
    this.state = 'comparing'
    const item = this.currentMission.item

    this.resultContainer.removeAll(true)

    const starburst = this.add.image(0, 0, 'efeito_starburst').setAlpha(0)
    starburst.setScale(280 / starburst.width)

    const destinoIcon = this.add.image(0, 0, item.textureKey).setAlpha(0)
    const targetScale = 90 / destinoIcon.width
    destinoIcon.setScale(0)

    this.resultContainer.add([starburst, destinoIcon])
    this.resultContainer.y = 250
    this.resultContainer.setAlpha(1)

    this.sound.play('som_sucesso')

    this.tweens.add({ targets: starburst, alpha: 1, duration: 300, ease: 'Back.out' })
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

    const destinoIcon = this.add.image(0, 0, item.textureKey)
    destinoIcon.setScale(90 / destinoIcon.width)
    destinoIcon.setTint(0x999999)

    const lossIcon = this.add.image(0, -60, 'indicador_perda').setAlpha(0)
    lossIcon.setScale(50 / lossIcon.width)

    this.resultContainer.add([destinoIcon, lossIcon])
    this.resultContainer.y = 250
    this.resultContainer.setAlpha(1)

    this.sound.play('som_perda')

    this.tweens.add({
      targets: destinoIcon,
      angle: { from: -4, to: 4 },
      duration: 90,
      yoyo: true,
      repeat: 3
    })

    this.tweens.add({
      targets: lossIcon,
      alpha: 1,
      duration: 300,
      delay: 200,
      onComplete: () => this.time.delayedCall(1600, () => this.finishMission())
    })
  }

  private showDualComparison() {
    this.state = 'comparing'
    const item = this.currentMission.item
    const channels = this.currentMission.requiredChannels

    this.resultContainer.removeAll(true)

    const title = this.add.text(0, -90, 'Mesma mensagem, dois caminhos!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#333333',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#ffffffcc',
      padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(10)

    const positions = [-60, 60]
    const elements: Phaser.GameObjects.GameObject[] = [title]

    channels.forEach((channel, i) => {
      const station = STATIONS.find(s => s.channel === channel)!
      const icon = this.add.image(positions[i], -10, item.textureKey)
      icon.setScale(60 / icon.width)
      const badge = this.add.image(positions[i], 30, station.textureKey)
      badge.setScale(36 / badge.width)
      elements.push(icon, badge)
    })

    const preserved = this.add.text(0, 75, 'A ideia continua a mesma!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#2f7a3d',
      fontStyle: 'bold',
      backgroundColor: '#ffffffcc',
      padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(10)
    elements.push(preserved)

    this.resultContainer.add(elements)
    this.resultContainer.y = 250
    this.resultContainer.setAlpha(1)
    this.resultContainer.setScale(0.9)

    this.sound.play('som_sucesso')

    this.tweens.add({
      targets: this.resultContainer,
      scale: 1,
      duration: 300,
      ease: 'Back.out',
      onComplete: () => this.time.delayedCall(1800, () => this.finishMission())
    })
  }

  private finishMission() {
    const pointsEarned = this.levelConfig.mode === 'dual' ? 10 : 5
    this.points += pointsEarned

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      pointsEarned,
      stage: this.levelConfig.level
    })

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
  }

  shutdown() {
    if (this.removeCommandListener) this.removeCommandListener()
  }
}