import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private progressIcons: Phaser.GameObjects.Image[] = []

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.instructionText = this.add.text(640, 50, this.registry.get('instructionText') || '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#333333',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 700 },
      backgroundColor: '#ffffffcc',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)

    this.buildProgressIndicator(this.registry.get('roundTotal') ?? 0)
    this.updateProgress(this.registry.get('roundIndex') ?? 0)

    this.registry.events.on('changedata-instructionText', (_parent: unknown, value: string) => {
      this.instructionText.setText(value)
    })

    this.registry.events.on('changedata-roundTotal', (_parent: unknown, value: number) => {
      this.buildProgressIndicator(value)
      this.updateProgress(this.registry.get('roundIndex') ?? 0)
    })

    this.registry.events.on('changedata-roundIndex', (_parent: unknown, value: number) => {
      this.updateProgress(value)
    })
  }

  private buildProgressIndicator(total: number) {
    this.progressIcons.forEach(icon => icon.destroy())
    this.progressIcons = []

    if (total <= 0) return

    const spacing = 34
    const startX = 1250 - (total - 1) * spacing

    for (let i = 0; i < total; i++) {
      const icon = this.add.image(startX + i * spacing, 30, 'indicador_progresso')
      icon.setScale(24 / icon.width)
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