import Phaser from 'phaser'
import { ALL_VEHICLES } from '../data/vehicles'

/**
 * BootScene — gera texturas programáticas de cada veículo.
 *
 * Chave: `vehicle-{id}`
 * Card: 155×125 px — fundo por categoria (ar/terra/água) com decorações,
 * spotlight para o emoji e banda escura no rodapé para o nome.
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

    this.add.rectangle(640, 360, 1280, 720, 0x1A2340)

    for (let i = 0; i < 5; i++) {
      this.add.circle(180 + i * 230, 80, 18, 0xFFEB3B, 0.7)
      this.add.rectangle(180 + i * 230, 80, 6, 600, 0xFFEB3B, 0.07)
    }

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
    const W    = 155
    const H    = 125
    const TEX_W = W + 12
    const TEX_H = H + 12

    // Cada textura é gerada com offset de 1px para a sombra não cortar
    const OX = 1, OY = 1

    const THEMES: Record<string, {
      base: number; mid: number; top: number; border: number
    }> = {
      ar:    { base: 0x1565C0, mid: 0x42A5F5, top: 0xBBDEFB, border: 0x90CAF9 },
      terra: { base: 0x2E7D32, mid: 0x66BB6A, top: 0xDCEDC8, border: 0xAED581 },
      agua:  { base: 0x006064, mid: 0x00ACC1, top: 0xB2EBF2, border: 0x4DD0E1 },
    }

    for (const vehicle of ALL_VEHICLES) {
      const key = `vehicle-${vehicle.id}`
      if (this.textures.exists(key)) continue

      const g = this.add.graphics()
      const meio = vehicle.attributes.meio
      const theme = THEMES[meio] ?? THEMES['ar']

      // ── Sombra ──────────────────────────────────────────────────────────
      g.fillStyle(0x000000, 0.30)
      g.fillRoundedRect(OX + 4, OY + 5, W, H, 18)

      // ── Fundo base (cor escura da categoria) ─────────────────────────────
      g.fillStyle(theme.base, 1)
      g.fillRoundedRect(OX, OY, W, H, 18)

      // ── Zona média (cor vibrante, ocupa 65% inferior) ─────────────────────
      g.fillStyle(theme.mid, 0.55)
      g.fillRoundedRect(OX, OY + H * 0.38, W, H * 0.62, { tl: 0, tr: 0, bl: 18, br: 18 })

      // ── Zona superior clara (40% do topo) ────────────────────────────────
      g.fillStyle(theme.top, 0.28)
      g.fillRoundedRect(OX, OY, W, H * 0.46, { tl: 18, tr: 18, bl: 0, br: 0 })

      // ── Decorações por categoria ─────────────────────────────────────────
      if (meio === 'ar') {
        this.drawCloud(g, OX + 22, OY + 20, 0.80)
        this.drawCloud(g, OX + W - 34, OY + 28, 0.55)
        // sol pequeno
        g.fillStyle(0xFFEB3B, 0.45)
        g.fillCircle(OX + W - 18, OY + 14, 10)
      } else if (meio === 'terra') {
        // Faixa de estrada
        g.fillStyle(0x37474F, 0.50)
        g.fillRect(OX, OY + H * 0.70, W, 13)
        // Faixas pontilhadas
        g.fillStyle(0xFFFFFF, 0.55)
        for (let x = OX + 8; x < OX + W; x += 26) {
          g.fillRect(x, OY + H * 0.70 + 4, 14, 4)
        }
        // Grama lateral
        g.fillStyle(0x388E3C, 0.35)
        g.fillRect(OX, OY + H * 0.83, W, H * 0.17)
      } else {
        // Ondas do mar
        g.fillStyle(0xFFFFFF, 0.14)
        for (let x = OX - 6; x < OX + W + 10; x += 26) {
          g.fillEllipse(x + 13, OY + H * 0.66, 28, 9, 8)
        }
        g.fillStyle(0xFFFFFF, 0.09)
        for (let x = OX + 6; x < OX + W + 10; x += 26) {
          g.fillEllipse(x + 5, OY + H * 0.77, 22, 7, 8)
        }
        // Brilho superfície
        g.fillStyle(0xB2EBF2, 0.18)
        g.fillRoundedRect(OX, OY, W, H * 0.30, { tl: 18, tr: 18, bl: 0, br: 0 })
      }

      // ── Spotlight atrás do emoji ─────────────────────────────────────────
      const spotX = OX + W / 2
      const spotY = OY + H * 0.40   // ≈ 50px from top, aligns with emoji at y=-16 no container
      g.fillStyle(0xFFFFFF, 0.10)
      g.fillCircle(spotX, spotY, 48)
      g.fillStyle(0xFFFFFF, 0.16)
      g.fillCircle(spotX, spotY, 37)
      g.fillStyle(0xFFFFFF, 0.10)
      g.fillCircle(spotX, spotY, 28)

      // ── Banda escura inferior (nome do veículo) ──────────────────────────
      g.fillStyle(0x000000, 0.50)
      g.fillRoundedRect(OX + 5, OY + H - 29, W - 10, 25, { tl: 0, tr: 0, bl: 13, br: 13 })

      // ── Borda colorida ───────────────────────────────────────────────────
      g.lineStyle(2.5, theme.border, 1)
      g.strokeRoundedRect(OX, OY, W, H, 18)

      // ── Borda interna (highlight) ────────────────────────────────────────
      g.lineStyle(1, 0xFFFFFF, 0.22)
      g.strokeRoundedRect(OX + 3, OY + 3, W - 6, H - 6, 15)

      g.generateTexture(key, TEX_W, TEX_H)
      g.destroy()
    }
  }

  // ── Helpers de decoração ─────────────────────────────────────────────────

  private drawCloud(g: Phaser.GameObjects.Graphics, cx: number, cy: number, alpha: number) {
    g.fillStyle(0xFFFFFF, alpha * 0.60)
    g.fillCircle(cx,      cy,      9)
    g.fillCircle(cx + 11, cy - 4,  13)
    g.fillCircle(cx + 24, cy,      9)
    g.fillCircle(cx + 11, cy + 5,  9)
  }
}
