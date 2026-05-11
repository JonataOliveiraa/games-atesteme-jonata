import Phaser from 'phaser'
import { ALL_VEHICLES } from '../data/vehicles'

/**
 * BootScene — gera texturas programáticas de cada veículo.
 *
 * Chave: `vehicle-{id}`
 * Card: 160×130 px — fundo arredondado na cor do veículo, emoji centralizado,
 * nome do veículo na parte inferior.
 *
 * TODO: substituir por atlas real em public/assets/images/ quando disponível.
 * TODO: descomentar load.audio quando os arquivos .ogg + .mp3 existirem.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.createLoadingBar()

    // TODO: atlas de veículos
    // this.load.atlas('vehicles', 'assets/images/vehicles.png', 'assets/images/vehicles.json')

    // TODO: áudios
    // this.load.audio('sfx-hit',      ['assets/audio/hit.ogg',      'assets/audio/hit.mp3'])
    // this.load.audio('sfx-miss',     ['assets/audio/miss.ogg',     'assets/audio/miss.mp3'])
    // this.load.audio('sfx-fanfare',  ['assets/audio/fanfare.ogg',  'assets/audio/fanfare.mp3'])
    // this.load.audio('narr-voa-sim', ['assets/audio/narr-voa-sim.ogg', 'assets/audio/narr-voa-sim.mp3'])
    // this.load.audio('narr-voa-nao', ['assets/audio/narr-voa-nao.ogg', 'assets/audio/narr-voa-nao.mp3'])
  }

  create() {
    this.generateVehicleTextures()
    this.scene.start('GameScene')
  }

  // ── Barra de carregamento ────────────────────────────────────────────────

  private createLoadingBar() {
    const cx = 640, cy = 360, w = 500, h = 28

    // Fundo: hangar noturno
    this.add.rectangle(640, 360, 1280, 720, 0x1A2340)

    // Luzes do hangar
    for (let i = 0; i < 5; i++) {
      this.add.circle(180 + i * 230, 80, 18, 0xFFEB3B, 0.7)
      this.add.rectangle(180 + i * 230, 80, 6, 600, 0xFFEB3B, 0.07)
    }

    // Barra de loading
    this.add.rectangle(cx, cy, w + 8, h + 8, 0x0D1B2A).setStrokeStyle(3, 0x4FC3F7)
    const bar = this.add.rectangle(cx - w / 2, cy, 4, h, 0x4FC3F7).setOrigin(0, 0.5)

    this.add.text(cx, cy - 38, '✈️  Preparando o Hangar...', {
      fontSize: '24px',
      color: '#E3F2FD',
      fontFamily: 'Arial Black, Arial',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      bar.setSize(Math.max(4, w * value), h)
    })
  }

  // ── Texturas de veículos ─────────────────────────────────────────────────

  private generateVehicleTextures() {
    const CARD_W = 160
    const CARD_H = 130

    for (const vehicle of ALL_VEHICLES) {
      const key = `vehicle-${vehicle.id}`
      if (this.textures.exists(key)) continue

      const gfx = this.add.graphics()

      // Sombra
      gfx.fillStyle(0x000000, 0.22)
      gfx.fillRoundedRect(5, 5, CARD_W, CARD_H, 18)

      // Corpo principal
      gfx.fillStyle(vehicle.bodyColor, 1)
      gfx.fillRoundedRect(0, 0, CARD_W, CARD_H, 18)

      // Brilho superior
      gfx.fillStyle(0xFFFFFF, 0.22)
      gfx.fillRoundedRect(6, 6, CARD_W - 12, 42, { tl: 12, tr: 12, bl: 0, br: 0 })

      // Contorno
      gfx.lineStyle(3, 0xFFFFFF, 0.6)
      gfx.strokeRoundedRect(0, 0, CARD_W, CARD_H, 18)

      gfx.generateTexture(key, CARD_W + 10, CARD_H + 10)
      gfx.destroy()
    }
  }
}
