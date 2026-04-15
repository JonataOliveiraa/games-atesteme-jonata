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

/**
 * GameScene — lógica principal do jogo Base dos Classificadores.
 *
 * Responsabilidades:
 * - Renderizar a esteira animada (TileSprite)
 * - Criar itens arrastáveis no topo da esteira
 * - Criar bases receptoras na parte inferior
 * - Validar drops: acerto → tween ilumina base | erro → item retorna
 * - Emitir 'round-complete' via EventBus ao zerar todos os itens
 * - Emitir 'update-progress' para UIScene atualizar a barra
 */
export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private conveyor!: Phaser.GameObjects.TileSprite
  private bases: Phaser.GameObjects.Container[] = []
  private itemSprites: DraggableItem[] = []
  private hits = 0
  private errors = 0
  private streak = 0
  private currentPoints = 0
  

  constructor() {
    super({ key: 'GameScene' })
  }

 init(data: { level?: number; points?: number }) {
  const lvl = (data?.level ?? 1) as 1 | 2 | 3
  this.levelConfig = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
  this.hits = 0
  this.errors = 0
  this.streak = 0
  this.currentPoints = data?.points ?? 0
}

  create() {


  this.createBackground()
  this.createConveyor()
  this.createBases()
  this.createItems()
  this.setupDrag()

  EventBus.on(
    "set-level",
    (data: { level: number; points: number }) => {
      this.scene.restart({ level: data.level, points: data.points })
    },
    this,
  )

  EventBus.emit("scene-ready", { levelConfig: this.levelConfig })
}

  update() {
    // Anima a esteira movendo a textura para a direita
    if (this.conveyor) {
      this.conveyor.tilePositionX += 1.5
    }
  }

  shutdown() {
    EventBus.off('set-level', undefined, this)
  }

  // ─── Criação de elementos ─────────────────────────────────────────────────

  private createBackground() {
    this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e)

    // Faixa de título
    this.add.rectangle(640, 40, 1280, 80, 0x2d1b69)
    this.add.text(640, 40, 'Base dos Classificadores', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)
  }

  private createConveyor() {
    // Esteira como retângulo texturizado (TileSprite com textura gerada)
    const gfx = this.add.graphics()
    gfx.fillStyle(0x4a3f6b, 1)
    gfx.fillRect(0, 0, 64, 40)
    gfx.lineStyle(2, 0x7c3aed, 1)
    gfx.strokeRect(0, 0, 64, 40)
    // Linhas da esteira
    for (let x = 0; x < 64; x += 16) {
      gfx.lineBetween(x, 0, x, 40)
    }
    gfx.generateTexture('conveyor-tile', 64, 40)
    gfx.destroy()

    this.conveyor = this.add.tileSprite(640, 460, 1280, 40, 'conveyor-tile')
  }

  private createBases() {
    this.bases = []
    for (const baseData of this.levelConfig.bases) {
      const container = this.createBase(baseData)
      this.bases.push(container)
    }
  }

  private createBase(baseData: ClassifierBase): Phaser.GameObjects.Container {
    const w = 160
    const h = 120

    const bg = this.add.rectangle(0, 0, w, h, 0x2d1b69, 0.9)
    bg.setStrokeStyle(3, 0x7c3aed)

    const label = this.add.text(0, 20, baseData.labelKey, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const icon = this.add.text(0, -20, this.getAttributeIcon(baseData.rule.attribute, baseData.rule.value), {
      fontSize: '28px',
    }).setOrigin(0.5)

    const zone = this.add.zone(0, 0, w, h)
    zone.setRectangleDropZone(w, h)

    const container = this.add.container(baseData.x, baseData.y, [bg, icon, label, zone])
    container.setData('baseData', baseData)

    return container
  }

  private createItems() {
    this.itemSprites = []
    const items = this.levelConfig.items
    const startX = 640 - ((items.length - 1) * 110) / 2

    items.forEach((item, i) => {
      const x = startX + i * 110
      const y = 280
      const textureKey = `item-${item.color}-${item.shape}-${item.size}`

      const sprite = this.add.image(x, y, textureKey) as DraggableItem
      sprite.itemData  = item
      sprite.originX_  = x
      sprite.originY_  = y
      sprite.setInteractive()

      this.input.setDraggable(sprite)
      this.itemSprites.push(sprite)
    })
  }

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  private setupDrag() {
    this.input.on('drag', (_: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      obj.setPosition(dragX, dragY)
      obj.setDepth(10)
    })

    this.input.on('dragend', (_: Phaser.Input.Pointer, obj: DraggableItem, dropped: boolean) => {
      obj.setDepth(0)
      if (!dropped) {
        this.returnItem(obj)
      }
    })

    this.input.on('drop', (_: Phaser.Input.Pointer, obj: DraggableItem, zone: Phaser.GameObjects.Zone) => {
      const container = zone.parentContainer
      if (!container) {
        this.returnItem(obj)
        return
      }
      const baseData = container.getData('baseData') as ClassifierBase
      this.validateDrop(obj, container, baseData)
    })
  }

  private validateDrop(
  item: DraggableItem,
  baseContainer: Phaser.GameObjects.Container,
  base: ClassifierBase,
) {
  const attrValue = this.getItemAttrValue(item.itemData, base.rule.attribute)
  const correct = attrValue === base.rule.value

  if (correct) {
    this.hits++
    this.streak++
    this.currentPoints += 5

    EventBus.emit("game-event", {
      type: "CORRECT_ANSWER",
      gameId: "EF01CO01",
      stage: this.levelConfig.level,
      pointsEarned: 5,
    })

    if (this.streak > 0 && this.streak % 3 === 0) {
      this.currentPoints += 5

      EventBus.emit("game-event", {
        type: "STREAK_BONUS",
        gameId: "EF01CO01",
        stage: this.levelConfig.level,
        pointsEarned: 5,
      })
    }

    this.onCorrectDrop(item, baseContainer)
  } else {
    this.errors++
    this.streak = 0

    if (this.currentPoints <= 5) {
      this.currentPoints = 0

      EventBus.emit("game-event", {
        type: "WRONG_ANSWER",
        gameId: "EF01CO01",
        stage: this.levelConfig.level,
        pointsEarned: -5,
      })

      EventBus.emit("game-event", {
        type: "GAME_OVER",
        gameId: "EF01CO01",
        stage: this.levelConfig.level,
        pointsEarned: 0,
      })

      return
    }

    this.currentPoints -= 5

    EventBus.emit("game-event", {
      type: "WRONG_ANSWER",
      gameId: "EF01CO01",
      stage: this.levelConfig.level,
      pointsEarned: -5,
    })

    this.onWrongDrop(item, baseContainer)
  }
}

  private onCorrectDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    item.setVisible(false)
    item.disableInteractive()

    // Tween de iluminação da base
    const bg = baseContainer.list[0] as Phaser.GameObjects.Rectangle
    this.tweens.add({
      targets: bg,
      alpha: { from: 1, to: 0.4 },
      yoyo: true,
      duration: 150,
      repeat: 2,
      onComplete: () => bg.setAlpha(1),
    })

    // Scale bounce na base
    this.tweens.add({
      targets: baseContainer,
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      yoyo: true,
      duration: 120,
    })

    // TODO: this.sound.play('sfx-hit') quando o áudio existir

    this.emitProgress()
    this.checkRoundComplete()
  }

  private onWrongDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    this.returnItem(item)

    // Shake na base
    this.tweens.add({
      targets: baseContainer,
      x: { from: baseContainer.x - 8, to: baseContainer.x + 8 },
      yoyo: true,
      duration: 60,
      repeat: 3,
      onComplete: () => baseContainer.setPosition(
        this.levelConfig.bases.find(b => b.id === (baseContainer.getData('baseData') as ClassifierBase).id)?.x ?? baseContainer.x,
        baseContainer.y,
      ),
    })

    // TODO: this.sound.play('sfx-miss') quando o áudio existir
  }

  private returnItem(item: DraggableItem) {
    this.tweens.add({
      targets: item,
      x: item.originX_,
      y: item.originY_,
      ease: 'Back.Out',
      duration: 350,
    })
  }


  // ─── Fim de rodada ────────────────────────────────────────────────────────

  private checkRoundComplete() {
    const remaining = this.itemSprites.filter(s => s.visible).length
    if (remaining === 0) {
      this.endRound()
    }
  }

private endRound() {
  if (this.errors === 0) {
    EventBus.emit("game-event", {
      type: "NO_ERROR_BONUS",
      gameId: "EF01CO01",
      stage: this.levelConfig.level,
      pointsEarned: 5,
    })
  }

  const result: RoundResult = {
    gameCode: "EF01CO01",
    level: this.levelConfig.level,
    criterion: this.levelConfig.criterion,
    hits: this.hits,
    errors: this.errors,
    durationMs: Date.now(),
    timestamp: Date.now(),
  }

  EventBus.emit("round-complete", result)
}

  private emitProgress() {
    const total     = this.itemSprites.length
    const remaining = this.itemSprites.filter(s => s.visible).length
    EventBus.emit('update-progress', (total - remaining) / total)
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getItemAttrValue(item: GameItem, attribute: string): string {
    if (attribute === 'cor')     return item.color
    if (attribute === 'forma')   return item.shape
    if (attribute === 'tamanho') return item.size
    return ''
  }

  private getAttributeIcon(attribute: string, value: string): string {
    if (attribute === 'cor') {
      const map: Record<string, string> = {
        vermelho: '🔴', azul: '🔵', verde: '🟢', amarelo: '🟡',
      }
      return map[value] ?? '⬜'
    }
    if (attribute === 'forma') {
      const map: Record<string, string> = {
        circulo: '⭕', quadrado: '⬛', triangulo: '🔺', retangulo: '▬',
      }
      return map[value] ?? '?'
    }
    if (attribute === 'tamanho') {
      const map: Record<string, string> = {
        pequeno: '🔹', medio: '🔷', grande: '💠',
      }
      return map[value] ?? '?'
    }
    return '?'
  }
}
