import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  private progressIcons: Phaser.GameObjects.Image[] = []

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.buildProgressIndicator(this.registry.get('roundTotal') ?? 0)
    this.updateProgress(this.registry.get('roundIndex') ?? 0)

    this.registry.events.on('changedata-roundTotal', (_p: unknown, value: number) => {
      this.buildProgressIndicator(value)
      this.updateProgress(this.registry.get('roundIndex') ?? 0)
    })

    this.registry.events.on('changedata-roundIndex', (_p: unknown, value: number) => {
      this.updateProgress(value)
    })
  }

  private buildProgressIndicator(total: number) {
    this.progressIcons.forEach(icon => icon.destroy())
    this.progressIcons = []
    if (total <= 0) return

    const src = this.textures.get('indicador_progresso').getSourceImage() as { width: number }
    const spacing = 34
    const startX = 1250 - (total - 1) * spacing

    for (let i = 0; i < total; i++) {
      const icon = this.add.image(startX + i * spacing, 30, 'indicador_progresso')
      icon.setScale(24 / src.width)
      icon.setAlpha(0.35)
      this.progressIcons.push(icon)
    }
  }

  private updateProgress(currentIndex: number) {
    this.progressIcons.forEach((icon, i) => {
      icon.setAlpha(i < currentIndex ? 1 : 0.35)
    })
  }
}