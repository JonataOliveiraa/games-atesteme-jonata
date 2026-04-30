import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.createLoadingBar()
    // Áudios e atlas serão carregados quando disponíveis
    // this.load.audio('narr-step-1', ['assets/audio/narr-step-1.ogg', 'assets/audio/narr-step-1.mp3']);
    // this.load.atlas('kitchen-items', 'assets/images/kitchen-items.png', 'assets/images/kitchen-items.json');
  }

  create() {
    this.generateThematicTextures()
    this.scene.start('GameScene')
  }

  private createLoadingBar() {
    const cx = 640
    const cy = 360
    const w = 500
    const h = 24

    this.add.rectangle(cx, cy, w + 8, h + 8, 0x2C3E50, 0.6).setStrokeStyle(3, 0x3498DB)
    this.add.rectangle(cx - w / 2, cy, 0, h, 0xECF0F1).setOrigin(0, 0.5)
    const bar = this.add.rectangle(cx - w / 2, cy, 4, h, 0x2ECC71).setOrigin(0, 0.5)

    this.add.text(cx, cy - 36, '🎮 Preparando o jogo...', {
      fontSize: '24px',
      color: '#2C3E50',
      fontFamily: 'Arial Black, Arial',
      stroke: '#FFFFFF',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.tweens.add({
      targets: bar,
      width: w,
      duration: 1200,
      ease: 'Power2',
    })
  }

  private generateThematicTextures() {
    // ── TEXTURA: 'paper' (folha de papel) ──
    const gfxPaper = this.add.graphics()
    gfxPaper.fillStyle(0xFFFFF0) // creme claro
    gfxPaper.fillRect(0, 0, 100, 100)
    gfxPaper.lineStyle(3, 0x000000) // borda preta
    gfxPaper.strokeRect(0, 0, 100, 100)
    gfxPaper.generateTexture('paper', 100, 100)
    gfxPaper.destroy()

    // ── TEXTURA: 'pan' (panela) ──
    const gfxPan = this.add.graphics()
    gfxPan.fillStyle(0x8B4513) // marrom
    gfxPan.fillRoundedRect(0, 0, 80, 40, 12)
    gfxPan.lineStyle(4, 0x000000)
    gfxPan.strokeRoundedRect(0, 0, 80, 40, 12)
    gfxPan.generateTexture('pan', 80, 40)
    gfxPan.destroy()

    // ── TEXTURA: 'fire-off' (fogo apagado) ──
    const gfxFireOff = this.add.graphics()
    gfxFireOff.fillStyle(0x999999) // cinza
    gfxFireOff.fillTriangle(0, 0, 40, 0, 20, -40)
    gfxFireOff.lineStyle(2, 0x666666)
    gfxFireOff.strokeTriangle(0, 0, 40, 0, 20, -40)
    gfxFireOff.generateTexture('fire-off', 40, 40)
    gfxFireOff.destroy()

    // ── TEXTURA: 'fold-line' (linha de dobra) ──
    const gfxFold = this.add.graphics()
    gfxFold.fillStyle(0x3498DB) // azul claro
    gfxFold.fillRect(0, 0, 60, 4)
    gfxFold.lineStyle(2, 0x2980B9)
    gfxFold.strokeRect(0, 0, 60, 4)
    gfxFold.generateTexture('fold-line', 60, 4)
    gfxFold.destroy()
  }
}