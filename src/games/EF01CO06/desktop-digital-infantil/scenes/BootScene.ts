import Phaser from 'phaser'
import { APP_DEFS } from '../types'
import desktopBgUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/desktop-bg.png'
import iconGravadorUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/icon-gravador.png'
import iconPastaUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/icon-pasta.png'
import iconDesenhoUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/icon-desenho.png'
import iconCalculadoraUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/icon-calculadora.png'
import iconPlayerUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/icon-player.png'
import iconRelogioUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/icon-relogio.png'
import albumArtUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/album-art.png'
import desenhoCanvasUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/desenho-canvas.png'
import calcBgUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/calculadora-bg.png'
import pastaDocMatUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/pasta-doc-matematica.png'
import pastaDocLeitUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/pasta-doc-leitura.png'
import pastaDocArteUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/pasta-doc-arte.png'
import iconPowerUrl from '../../../../assets/games/EF01CO06/desktop-digital-infantil/icon-power.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Desktop Digital Infantil',
      subtitle: 'Área de trabalho',
      description: 'Preparando o Desktop...',
      theme: {
        background: { kind: 'grid', base: 0x0d1628, color: 0x2e86c1, alpha: 0.14, size: 72 },
        card: 0x0a1f38,
        cardShadow: 0x05101f,
        cardHighlight: 0xffffff,
        cardBorder: 0x2e86c1,
        title: 0xffffff,
        subtitle: 0xaed6f1,
        description: 0x85c1e9,
        titleStroke: 0x05101f,
        progressTrack: 0x071428,
        progressBorder: 0x2e86c1,
        progressFill: 0x2980b9,
        progressHighlight: 0x5dade2,
      },
    })

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('❌ Falha ao carregar asset:', file.key, '->', file.url);
    });

    this.load.image('desktop-bg', desktopBgUrl)
    this.load.image('icon-pasta', iconPastaUrl)
    this.load.image('icon-gravador', iconGravadorUrl)
    this.load.image('icon-desenho', iconDesenhoUrl)
    this.load.image('icon-calculadora', iconCalculadoraUrl)
    this.load.image('icon-player', iconPlayerUrl)
    this.load.image('icon-relogio', iconRelogioUrl)
    this.load.image('album-art', albumArtUrl)
    this.load.image('desenho-canvas', desenhoCanvasUrl)
    this.load.image('calc-bg', calcBgUrl)
    this.load.image('pasta-doc-matematica', pastaDocMatUrl)
    this.load.image('pasta-doc-leitura', pastaDocLeitUrl)
    this.load.image('pasta-doc-arte', pastaDocArteUrl)
    this.load.image('icon-power', iconPowerUrl)

    // TODO: this.load.audio('sfx-open',    ['assets/audio/window-open.ogg', 'assets/audio/window-open.mp3'])
    // TODO: this.load.audio('sfx-success', ['assets/audio/success.ogg',     'assets/audio/success.mp3'])
  }

  create() {
    this.generateIconTextures()
    this.generateDesktopBg()
    this.generateTaskbarBg()
    this.scene.start('GameScene')
  }
  private generateIconTextures() {
  const SIZE = 88

  for (const app of APP_DEFS) {
    const key = `icon-${app.id}`
    if (this.textures.exists(key)) continue

    const gfx = this.add.graphics()

    // Sombra
    gfx.fillStyle(0x000000, 0.28)
    gfx.fillRoundedRect(4, 6, SIZE, SIZE, 20)

    // Fundo base
    gfx.fillStyle(app.headerColor, 1)
    gfx.fillRoundedRect(0, 0, SIZE, SIZE, 20)

    // Realce iOS-style
    gfx.fillStyle(0xFFFFFF, 0.20)
    gfx.fillRoundedRect(0, 0, SIZE, SIZE / 2.2, 20)
    gfx.fillRect(0, SIZE / 2.2 - 2, SIZE, 2)

    // Borda interna
    gfx.lineStyle(1.5, 0xFFFFFF, 0.18)
    gfx.strokeRoundedRect(1, 1, SIZE - 2, SIZE - 2, 19)

    switch (app.id) {
      case 'relogio': this.drawRelogioIcon(gfx); break
      case 'gravador': this.drawGravadorIcon(gfx); break
      case 'desenho': this.drawDesenhoIcon(gfx); break
      case 'calculadora': this.drawCalculadoraIcon(gfx); break
      case 'pasta': this.drawPastaIcon(gfx); break
      case 'player': this.drawPlayerIcon(gfx); break
      case 'power': this.drawPowerIcon(gfx); break
    }

    gfx.generateTexture(key, SIZE + 8, SIZE + 8)
    gfx.destroy()
  }
}

  // ── Ícone Relógio ─────────────────────────────────────────────────────────

  private drawRelogioIcon(g: Phaser.GameObjects.Graphics) {
  const cx = 44, cy = 46, r = 28
  // Mostrador do relógio
  g.fillStyle(0xFFFFFF, 0.15)
  g.fillCircle(cx, cy, r)
  g.lineStyle(3.5, 0xFFFFFF, 0.90)
  g.strokeCircle(cx, cy, r)
  // Marcas das horas (4 principais)
  g.lineStyle(2.5, 0xFFFFFF, 0.8)
  g.lineBetween(cx, cy - r + 5, cx, cy - r + 12)  // 12h
  g.lineBetween(cx + r - 5, cy, cx + r - 12, cy)        // 3h
  g.lineBetween(cx, cy + r - 5, cx, cy + r - 12)  // 6h
  g.lineBetween(cx - r + 5, cy, cx - r + 12, cy)        // 9h
  // Ponteiros: 9:00
  const hAngle = (9 / 12 * 360 - 90) * Math.PI / 180
  const mAngle = -90 * Math.PI / 180  // minutos em 12 (0 min)
  g.lineStyle(4, 0xFFFFFF, 0.95)
  g.lineBetween(cx, cy, cx + Math.cos(hAngle) * 16, cy + Math.sin(hAngle) * 16)
  g.lineStyle(3, 0xAED6F1, 0.9)
  g.lineBetween(cx, cy, cx + Math.cos(mAngle) * 22, cy + Math.sin(mAngle) * 22)
  // Centro
  g.fillStyle(0xFFFFFF, 1)
  g.fillCircle(cx, cy, 3.5)
  // Coroa do relógio (topo)
  g.fillStyle(0xFFFFFF, 0.7)
  g.fillRect(cx - 4, cy - r - 8, 8, 8)
  g.fillRoundedRect(cx - 5, cy - r - 4, 10, 6, 3)
}

  // ── Ícone Pasta ───────────────────────────────────────────────────────────

  private drawPastaIcon(g: Phaser.GameObjects.Graphics) {
  // Aba superior da pasta
  g.fillStyle(0xFFFFFF, 0.88)
  g.fillRoundedRect(10, 20, 28, 12, 4)
  // Corpo da pasta
  g.fillStyle(0xFFFFFF, 0.82)
  g.fillRoundedRect(8, 28, 72, 46, 6)
  g.lineStyle(1.5, 0xFFFFFF, 0.40)
  g.strokeRoundedRect(8, 28, 72, 46, 6)
  // Divisória interna (linhas de documentos)
  g.lineStyle(2, 0xB7770D, 0.40)
  g.lineBetween(20, 40, 68, 40)
  g.lineBetween(20, 50, 68, 50)
  g.lineBetween(20, 60, 55, 60)
  // Ícone de documento dentro da pasta
  g.fillStyle(0xF9E79F, 0.70)
  g.fillRoundedRect(30, 35, 28, 34, 3)
  g.fillStyle(0xB7770D, 0.50)
  g.fillRect(34, 42, 20, 3)
  g.fillRect(34, 49, 20, 3)
  g.fillRect(34, 56, 14, 3)
  // Símbolo "+" (novo arquivo)
  g.lineStyle(3, 0xFFFFFF, 0.90)
  g.lineBetween(62, 46, 72, 46)
  g.lineBetween(67, 41, 67, 51)
}

  // ── Ícone Power ───────────────────────────────────────────────────────────

  private drawPowerIcon(g: Phaser.GameObjects.Graphics) {
  const cx = 44, cy = 46
  // Círculo aberto (power symbol)
  g.lineStyle(7, 0xFFFFFF, 0.90)
  g.beginPath()
  g.arc(cx, cy + 4, 22, Math.PI * 0.25 + 0.1, Math.PI * 1.75 - 0.1, false)
  g.strokePath()
  // Linha vertical do topo
  g.lineStyle(7, 0xFFFFFF, 0.95)
  g.lineBetween(cx, cy - 22, cx, cy - 8)
  // Brilho central
  g.fillStyle(0xFFFFFF, 0.25)
  g.fillCircle(cx, cy + 4, 12)
}

  // ── Ícones reutilizados ───────────────────────────────────────────────────

  private drawGravadorIcon(g: Phaser.GameObjects.Graphics) {
  const cx = 44, cy = 44
  g.fillStyle(0xFFFFFF, 0.88)
  g.fillRoundedRect(cx - 11, cy - 26, 22, 36, 11)
  g.lineStyle(2, 0xFFFFFF, 0.55)
  g.strokeRoundedRect(cx - 11, cy - 26, 22, 36, 11)
  g.lineStyle(1.5, 0xFFFFFF, 0.30)
  for (let i = 0; i < 4; i++) {
    const y = cy - 18 + i * 8
    g.lineBetween(cx - 9, y, cx + 9, y)
  }
  g.lineStyle(2.5, 0xFFFFFF, 0.75)
  g.beginPath(); g.arc(cx, cy + 3, 20, Math.PI + 0.3, Math.PI * 2 - 0.3, false); g.strokePath()
  g.lineStyle(2, 0xFFFFFF, 0.50)
  g.beginPath(); g.arc(cx, cy + 3, 27, Math.PI + 0.5, Math.PI * 2 - 0.5, false); g.strokePath()
  g.fillStyle(0xFFFFFF, 0.85)
  g.fillRect(cx - 1.5, cy + 23, 3, 10)
  g.fillRoundedRect(cx - 14, cy + 33, 28, 5, 2)
}

  private drawDesenhoIcon(g: Phaser.GameObjects.Graphics) {
  const cx = 44, cy = 46
  g.fillStyle(0xFFFFFF, 0.88)
  g.fillEllipse(cx, cy, 54, 48)
  g.lineStyle(2, 0xFFFFFF, 0.45)
  g.strokeEllipse(cx, cy, 54, 48)
  g.fillStyle(0x000000, 0.25)
  g.fillCircle(cx - 12, cy + 8, 6)
  const cores = [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12, 0x9B59B6]
  const posicoes = [
    { x: cx - 16, y: cy - 12 }, { x: cx + 4, y: cy - 16 },
    { x: cx + 18, y: cy - 4 }, { x: cx + 14, y: cy + 12 }, { x: cx - 4, y: cy + 14 },
  ]
  cores.forEach((c, i) => { g.fillStyle(c, 0.92); g.fillCircle(posicoes[i].x, posicoes[i].y, 7) })
  g.lineStyle(3, 0xFFFFFF, 0.80)
  g.lineBetween(cx + 18, cy - 20, cx + 28, cy - 36)
  g.fillStyle(0xF39C12, 0.90)
  g.fillTriangle(cx + 18, cy - 20, cx + 14, cy - 24, cx + 24, cy - 28)
}

  private drawCalculadoraIcon(g: Phaser.GameObjects.Graphics) {
  const left = 16, top = 14, w = 56, h = 60
  g.fillStyle(0xFFFFFF, 0.15)
  g.fillRoundedRect(left, top, w, h, 8)
  g.fillStyle(0x000000, 0.45)
  g.fillRoundedRect(left + 4, top + 4, w - 8, 18, 4)
  g.fillStyle(0x2ECC71, 0.90)
  g.fillRect(left + 32, top + 8, 12, 4)
  g.fillRect(left + 32, top + 14, 16, 4)
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

  private drawPlayerIcon(g: Phaser.GameObjects.Graphics) {
  const cx = 44, cy = 44
  g.fillStyle(0xFFFFFF, 0.15)
  g.fillCircle(cx, cy, 28)
  g.lineStyle(2, 0xFFFFFF, 0.50)
  g.strokeCircle(cx, cy, 28)
  g.fillStyle(0xFFFFFF, 0.92)
  g.fillTriangle(cx - 9, cy - 17, cx - 9, cy + 17, cx + 18, cy)
  g.fillStyle(0xFFFFFF, 0.70)
  g.fillCircle(cx + 18, cy - 16, 4)
  g.fillRect(cx + 21, cy - 28, 2.5, 13)
  g.fillRect(cx + 21, cy - 28, 10, 2.5)
}

  // ── Wallpaper fallback ────────────────────────────────────────────────────

  private generateDesktopBg() {
  if (this.textures.exists('desktop-bg')) return
  const gfx = this.add.graphics()
  for (let y = 0; y < 660; y += 4) {
    const t = y / 660
    const r = Math.round(Phaser.Math.Linear(0x0A, 0x1A, t))
    const g2 = Math.round(Phaser.Math.Linear(0x14, 0x3A, t))
    const b = Math.round(Phaser.Math.Linear(0x2E, 0x6A, t))
    gfx.fillStyle((r << 16) | (g2 << 8) | b, 1)
    gfx.fillRect(0, y, 1280, 5)
  }
  const rng = new Phaser.Math.RandomDataGenerator(['ef01co06'])
  for (let i = 0; i < 40; i++) {
    gfx.fillStyle(0xFFFFFF, rng.realInRange(0.2, 0.7))
    gfx.fillCircle(rng.between(0, 1280), rng.between(0, 400), rng.between(1, 3))
  }
  gfx.generateTexture('desktop-bg', 1280, 660)
  gfx.destroy()
}

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
