import Phaser from 'phaser'
import { APP_DEFS } from '../types'
import desktopBgUrl from '../../../assets/games/EF01CO06/desktop-bg.png'

/**
 * BootScene — carrega assets e gera texturas programáticas para EF01CO06.
 *
 * Texturas carregadas via arquivo:
 *   `desktop-bg`     → wallpaper do desktop (PNG)
 *
 * Texturas geradas programaticamente (fallback / pendentes de asset):
 *   `icon-{appId}`   → ícone do app (88×88 px, rounded rect + forma específica)
 *   `taskbar-bg`     → fundo da barra de tarefas (1280×60)
 *
 * TODO: substituir ícones por atlas real quando assets estiverem disponíveis.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.createLoadingBar()
    this.load.image('desktop-bg', desktopBgUrl)
    // TODO: this.load.atlas('ef01co06-icons', ..., ...)
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

  // ── Textura de ícone (forma específica por app) ──────────────────────────────

  private generateIconTextures() {
    const SIZE = 88

    for (const app of APP_DEFS) {
      const key = `icon-${app.id}`
      if (this.textures.exists(key)) continue

      const gfx = this.add.graphics()

      // Sombra
      gfx.fillStyle(0x000000, 0.28)
      gfx.fillRoundedRect(4, 6, SIZE, SIZE, 20)

      // Fundo base do ícone (gradiente simulado)
      gfx.fillStyle(app.headerColor, 1)
      gfx.fillRoundedRect(0, 0, SIZE, SIZE, 20)

      // Realce superior (brilho iOS-style)
      gfx.fillStyle(0xFFFFFF, 0.20)
      gfx.fillRoundedRect(0, 0, SIZE, SIZE / 2.2, 20)
      gfx.fillRect(0, SIZE / 2.2 - 2, SIZE, 2)

      // Borda interna sutil
      gfx.lineStyle(1.5, 0xFFFFFF, 0.18)
      gfx.strokeRoundedRect(1, 1, SIZE - 2, SIZE - 2, 19)

      // Desenho específico de cada app
      switch (app.id) {
        case 'camera':      this.drawCameraIcon(gfx);      break
        case 'gravador':    this.drawGravadorIcon(gfx);    break
        case 'desenho':     this.drawDesenhoIcon(gfx);     break
        case 'calculadora': this.drawCalculadoraIcon(gfx); break
        case 'navegador':   this.drawNavegadorIcon(gfx);   break
        case 'player':      this.drawPlayerIcon(gfx);      break
      }

      gfx.generateTexture(key, SIZE + 8, SIZE + 8)
      gfx.destroy()
    }
  }

  // Câmera — lente com anel externo, anel interno e reflexo
  private drawCameraIcon(g: Phaser.GameObjects.Graphics) {
    const cx = 44, cy = 48
    // Corpo branco semitransparente
    g.fillStyle(0xFFFFFF, 0.15)
    g.fillRoundedRect(10, 28, 68, 46, 8)
    // Saliência superior (visor)
    g.fillStyle(0xFFFFFF, 0.15)
    g.fillRoundedRect(30, 20, 28, 14, 6)
    // Anel externo da lente
    g.lineStyle(4, 0xFFFFFF, 0.85)
    g.strokeCircle(cx, cy, 17)
    // Anel interno
    g.lineStyle(2, 0xFFFFFF, 0.55)
    g.strokeCircle(cx, cy, 12)
    // Centro da lente
    g.fillStyle(0x000000, 0.40)
    g.fillCircle(cx, cy, 9)
    // Reflexo
    g.fillStyle(0xFFFFFF, 0.70)
    g.fillCircle(cx - 5, cy - 5, 3)
    // Flash LED
    g.fillStyle(0xFFFF99, 0.90)
    g.fillCircle(66, 30, 4)
    g.lineStyle(1.5, 0xFFFFFF, 0.5)
    g.strokeCircle(66, 30, 4)
  }

  // Gravador — microfone com corpo + base
  private drawGravadorIcon(g: Phaser.GameObjects.Graphics) {
    const cx = 44, cy = 44
    // Corpo do microfone (cápsula arredondada)
    g.fillStyle(0xFFFFFF, 0.88)
    g.fillRoundedRect(cx - 11, cy - 26, 22, 36, 11)
    g.lineStyle(2, 0xFFFFFF, 0.55)
    g.strokeRoundedRect(cx - 11, cy - 26, 22, 36, 11)
    // Grade do microfone (linhas horizontais)
    g.lineStyle(1.5, 0xFFFFFF, 0.30)
    for (let i = 0; i < 4; i++) {
      const y = cy - 18 + i * 8
      g.lineBetween(cx - 9, y, cx + 9, y)
    }
    // Arco de som (arcadas)
    g.lineStyle(2.5, 0xFFFFFF, 0.75)
    g.beginPath(); g.arc(cx, cy + 3, 20, Math.PI + 0.3, Math.PI * 2 - 0.3, false); g.strokePath()
    g.lineStyle(2, 0xFFFFFF, 0.50)
    g.beginPath(); g.arc(cx, cy + 3, 27, Math.PI + 0.5, Math.PI * 2 - 0.5, false); g.strokePath()
    // Haste e base
    g.fillStyle(0xFFFFFF, 0.85)
    g.fillRect(cx - 1.5, cy + 23, 3, 10)
    g.fillRect(cx - 12, cy + 33, 24, 4)
    g.fillRoundedRect(cx - 14, cy + 33, 28, 5, 2)
  }

  // Desenho — paleta de artista com furos e pincéis
  private drawDesenhoIcon(g: Phaser.GameObjects.Graphics) {
    const cx = 44, cy = 46
    // Paleta (elipse branca)
    g.fillStyle(0xFFFFFF, 0.88)
    g.fillEllipse(cx, cy, 54, 48)
    g.lineStyle(2, 0xFFFFFF, 0.45)
    g.strokeEllipse(cx, cy, 54, 48)
    // Furo do polegar
    g.fillStyle(0x000000, 0.25)
    g.fillCircle(cx - 12, cy + 8, 6)
    // Blobs de tinta colorida
    const cores = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6]
    const posicoes = [
      { x: cx - 16, y: cy - 12 },
      { x: cx + 4,  y: cy - 16 },
      { x: cx + 18, y: cy - 4  },
      { x: cx + 14, y: cy + 12 },
      { x: cx - 4,  y: cy + 14 },
    ]
    cores.forEach((c, i) => {
      g.fillStyle(c, 0.92)
      g.fillCircle(posicoes[i].x, posicoes[i].y, 7)
    })
    // Pincel
    g.lineStyle(3, 0xFFFFFF, 0.80)
    g.lineBetween(cx + 18, cy - 20, cx + 28, cy - 36)
    g.fillStyle(0xF39C12, 0.90)
    g.fillTriangle(cx + 18, cy - 20, cx + 14, cy - 24, cx + 24, cy - 28)
  }

  // Calculadora — tela + grade de botões
  private drawCalculadoraIcon(g: Phaser.GameObjects.Graphics) {
    const left = 16, top = 14, w = 56, h = 60
    // Corpo
    g.fillStyle(0xFFFFFF, 0.15)
    g.fillRoundedRect(left, top, w, h, 8)
    // Tela
    g.fillStyle(0x000000, 0.45)
    g.fillRoundedRect(left + 4, top + 4, w - 8, 18, 4)
    g.fillStyle(0x2ECC71, 0.90)
    // Número na tela
    g.fillRect(left + 32, top + 8, 12, 4)
    g.fillRect(left + 32, top + 14, 16, 4)
    // Grid de botões 4×3
    const bw = 10, bh = 8, gap = 3
    const gLeft = left + 5, gTop = top + 28
    const colors = [0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xE74C3C,
                    0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF,
                    0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0x2ECC71]
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const idx = r * 4 + c
        g.fillStyle(colors[idx], 0.80)
        g.fillRoundedRect(gLeft + c * (bw + gap), gTop + r * (bh + gap), bw, bh, 2)
      }
    }
  }

  // Navegador — globo com meridianos e paralelos
  private drawNavegadorIcon(g: Phaser.GameObjects.Graphics) {
    const cx = 44, cy = 46, r = 28
    // Fundo do globo
    g.fillStyle(0xFFFFFF, 0.15)
    g.fillCircle(cx, cy, r)
    // Contorno
    g.lineStyle(2.5, 0xFFFFFF, 0.80)
    g.strokeCircle(cx, cy, r)
    // Meridiano central (linha vertical)
    g.lineStyle(1.5, 0xFFFFFF, 0.55)
    g.lineBetween(cx, cy - r, cx, cy + r)
    // Elipses de meridianos
    g.lineStyle(1.5, 0xFFFFFF, 0.40)
    g.strokeEllipse(cx, cy, r * 0.9, r * 2)
    g.strokeEllipse(cx, cy, r * 1.7, r * 2)
    // Paralelos (linhas horizontais)
    g.lineStyle(1.5, 0xFFFFFF, 0.40)
    g.lineBetween(cx - r, cy, cx + r, cy)
    g.lineBetween(cx - r * 0.84, cy - r * 0.5, cx + r * 0.84, cy - r * 0.5)
    g.lineBetween(cx - r * 0.84, cy + r * 0.5, cx + r * 0.84, cy + r * 0.5)
    // Pino de localização
    g.fillStyle(0xFFFFFF, 0.95)
    g.fillCircle(cx + 10, cy - 10, 5)
    g.fillTriangle(cx + 10, cy - 1, cx + 6, cy - 12, cx + 14, cy - 12)
  }

  // Player — triângulo play + ondas de som
  private drawPlayerIcon(g: Phaser.GameObjects.Graphics) {
    const cx = 44, cy = 44
    // Círculo de fundo
    g.fillStyle(0xFFFFFF, 0.15)
    g.fillCircle(cx, cy, 28)
    g.lineStyle(2, 0xFFFFFF, 0.50)
    g.strokeCircle(cx, cy, 28)
    // Triângulo Play (preenchido, branco)
    g.fillStyle(0xFFFFFF, 0.92)
    g.fillTriangle(cx - 9, cy - 17, cx - 9, cy + 17, cx + 18, cy)
    // Nota musical flutuando
    g.fillStyle(0xFFFFFF, 0.70)
    g.fillCircle(cx + 18, cy - 16, 4)
    g.fillRect(cx + 21, cy - 28, 2.5, 13)
    g.fillRect(cx + 21, cy - 28, 10, 2.5)
  }

  // ── Wallpaper ────────────────────────────────────────────────────────────────

  private generateDesktopBg() {
    if (this.textures.exists('desktop-bg')) return

    const gfx = this.add.graphics()

    // Gradiente azul escuro → azul médio
    for (let y = 0; y < 660; y += 4) {
      const t = y / 660
      const r = Math.round(Phaser.Math.Linear(0x0A, 0x1A, t))
      const g2 = Math.round(Phaser.Math.Linear(0x14, 0x3A, t))
      const b = Math.round(Phaser.Math.Linear(0x2E, 0x6A, t))
      const color = (r << 16) | (g2 << 8) | b
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
