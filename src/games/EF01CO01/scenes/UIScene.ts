import Phaser from 'phaser'

/**
 * UIScene — apenas o letreiro "Energia do Jardim".
 * O timer bar fica no GameScene (tween-based, estilo CO03).
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createLetreiro()
  }

  private createLetreiro() {
    const SIGN_CY = 50
    const SIGN_DW = 920
    const SIGN_DH = 199

    if (this.textures.exists('wood-sign')) {
      this.add.image(640, SIGN_CY, 'wood-sign')
        .setDisplaySize(SIGN_DW, SIGN_DH)
        .setOrigin(0.5)
    } else {
      const signW = 680
      const signH = 82
      const signX = 640 - signW / 2
      const g = this.add.graphics()
      g.fillStyle(0x000000, 0.25)
      g.fillRoundedRect(signX + 4, SIGN_CY - signH / 2 + 5, signW, signH, 14)
      g.fillStyle(0xC8872A, 1)
      g.fillRoundedRect(signX, SIGN_CY - signH / 2, signW, signH, 12)
      g.fillStyle(0xE5A84E, 0.7)
      g.fillRoundedRect(signX + 3, SIGN_CY - signH / 2 + 3, signW - 6, signH * 0.42, { tl: 10, tr: 10, bl: 0, br: 0 })
      g.lineStyle(4, 0x7A4A10, 1)
      g.strokeRoundedRect(signX, SIGN_CY - signH / 2, signW, signH, 12)
    }

    this.add.text(640, SIGN_CY - 5, 'Energia do Jardim', {
      fontSize: '30px',
      fontFamily: 'Arial Black, Arial',
      color: '#4A2000',
      stroke: '#F5D99B',
      strokeThickness: 2,
    }).setOrigin(0.5)
  }
}
