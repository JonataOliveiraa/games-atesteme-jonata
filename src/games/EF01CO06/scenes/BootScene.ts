import Phaser from 'phaser'
import { APP_DEFS } from '../types'

/**
 * BootScene — gera texturas programáticas para EF01CO06.
 *
 * Texturas geradas:
 *   `icon-{appId}`   → ícone do app (88×88 px, rounded rect colorido)
 *   `desktop-bg`     → wallpaper do desktop (1280×720)
 *   `taskbar-bg`     → fundo da barra de tarefas (1280×60)
 *
 * TODO: substituir por atlas real quando assets estiverem disponíveis.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.createLoadingBar()
    // TODO: this.load.atlas('ef01co06-icons', 'assets/images/ef01co06/icons.png', 'assets/images/ef01co06/icons.json')
    // TODO: this.load.audio('sfx-open',    ['assets/audio/window-open.ogg', 'assets/audio/window-open.mp3'])
    // TODO: this.load.audio('sfx-close',   ['assets/audio/window-close.ogg','assets/audio/window-close.mp3'])
    // TODO: this.load.audio('sfx-success', ['assets/audio/success.ogg',     'assets/audio/success.mp3'])
  }

  create() {
    this.generateIconTextures()
    this.generateDesktopBg()
    this.generateTaskbarBg()
    this.scene.start('GameScene')
  }

  // ── Loading bar ─────────────────────────────────────────────────────────────

  private createLoadingBar() {
    const cx = 640, cy = 360, w = 500, h = 28

    this.add.rectangle(640, 360, 1280, 720, 0x1A2035)
    this.add.rectangle(640, 280, 200, 200, 0x2C3E6A, 0.4)

    // Monitor icon
    const mon = this.add.graphics()
    mon.lineStyle(6, 0x5DADE2)
    mon.strokeRect(490, 200, 300, 180)
    mon.fillStyle(0x1B4F72)
    mon.fillRect(496, 206, 288, 168)
    mon.fillStyle(0x5DADE2)
    mon.fillRect(615, 380, 50, 16)
    mon.fillRect(580, 394, 120, 8)

    this.add.text(640, 295, '🖥️', { fontSize: '48px' }).setOrigin(0.5)

    this.add.text(640, 440, 'Preparando o Desktop...', {
      fontSize: '22px', color: '#AED6F1', fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5)

    this.add.rectangle(cx, cy + 100, w + 8, h + 8, 0x1B2A4A).setStrokeStyle(2, 0x5DADE2)
    const bar = this.add.rectangle(cx - w / 2, cy + 100, 4, h, 0x5DADE2).setOrigin(0, 0.5)

    this.load.on('progress', (v: number) => bar.setSize(Math.max(4, w * v), h))
  }

  // ── Textura de ícone ─────────────────────────────────────────────────────────

  private generateIconTextures() {
    const SIZE = 88
    const CANVAS = SIZE + 12

    for (const app of APP_DEFS) {
      const key = `icon-${app.id}`
      if (this.textures.exists(key)) continue

      const gfx = this.add.graphics()

      // Sombra
      gfx.fillStyle(0x000000, 0.22)
      gfx.fillRoundedRect(5, 5, SIZE, SIZE, 18)

      // Corpo
      gfx.fillStyle(app.headerColor, 1)
      gfx.fillRoundedRect(0, 0, SIZE, SIZE, 18)

      // Gradiente: destaque superior
      gfx.fillStyle(0xFFFFFF, 0.18)
      gfx.fillRoundedRect(0, 0, SIZE, SIZE / 2, 18)
      gfx.fillRect(0, SIZE / 2 - 4, SIZE, 4)

      // Borda sutil
      gfx.lineStyle(2, 0xFFFFFF, 0.15)
      gfx.strokeRoundedRect(0, 0, SIZE, SIZE, 18)

      gfx.generateTexture(key, CANVAS, CANVAS)
      gfx.destroy()
    }
  }

  // ── Wallpaper ────────────────────────────────────────────────────────────────

  private generateDesktopBg() {
    if (this.textures.exists('desktop-bg')) return

    const gfx = this.add.graphics()

    // Gradiente azul escuro → azul médio (simulado com retângulos sobrepostos)
    for (let y = 0; y < 660; y += 4) {
      const t = y / 660
      const r = Math.round(Phaser.Math.Linear(0x0A, 0x1A, t))
      const g = Math.round(Phaser.Math.Linear(0x14, 0x3A, t))
      const b = Math.round(Phaser.Math.Linear(0x2E, 0x6A, t))
      const color = (r << 16) | (g << 8) | b
      gfx.fillStyle(color, 1)
      gfx.fillRect(0, y, 1280, 5)
    }

    // Estrelas decorativas
    const rng = new Phaser.Math.RandomDataGenerator(['ef01co06'])
    for (let i = 0; i < 40; i++) {
      const x = rng.between(0, 1280)
      const y = rng.between(0, 400)
      const r = rng.between(1, 3)
      gfx.fillStyle(0xFFFFFF, rng.realInRange(0.2, 0.7))
      gfx.fillCircle(x, y, r)
    }

    // Montanhas suaves
    gfx.fillStyle(0x0D2137, 0.7)
    gfx.fillTriangle(0, 660, 200, 460, 400, 660)
    gfx.fillTriangle(300, 660, 550, 400, 800, 660)
    gfx.fillTriangle(700, 660, 950, 430, 1200, 660)
    gfx.fillTriangle(1050, 660, 1280, 480, 1280, 660)

    gfx.generateTexture('desktop-bg', 1280, 660)
    gfx.destroy()
  }

  // ── Taskbar ──────────────────────────────────────────────────────────────────

  private generateTaskbarBg() {
    if (this.textures.exists('taskbar-bg')) return

    const gfx = this.add.graphics()
    gfx.fillStyle(0x0D1B2A, 0.95)
    gfx.fillRect(0, 0, 1280, 60)
    gfx.lineStyle(2, 0x2E86C1, 0.6)
    gfx.lineBetween(0, 0, 1280, 0)
    gfx.generateTexture('taskbar-bg', 1280, 60)
    gfx.destroy()
  }
}
