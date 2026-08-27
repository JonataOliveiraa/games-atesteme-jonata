import Phaser from 'phaser'
import bgGardenUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/bg-garden.png'
import shelfWoodUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/shelf-wood.png'
import sunUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/sun.png'
import planterBoxUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box.png'
import planterBoxRedUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-red.png'
import planterBoxBlueUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-blue.png'
import planterBoxGreenUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-green.png'
import planterBoxYellowUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-yellow.png'
import planterBoxPurpleCircleUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-purple-circle.png'
import planterBoxRedSquareUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-red-square.png'
import planterBoxBlueTriangleUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-blue-triangle.png'
import planterBoxGreenRectangleUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/planter-box-green-rectangle.png'
import woodSignUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/wood-sign.png'
import flowerIconUrl from '../../../../assets/games/EF01CO01/base-dos-classificadores/flower-icon.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { DEV_START_LEVEL } from './GameScene'

/**
 * BootScene — carrega todos os assets e gera texturas programáticas.
 *
 * Texturas geradas: `item-{cor}-{forma}-{tamanho}`
 *   ex: `item-vermelho-circulo-medio`
 *
 * Cada textura tem:
 *   1. Sombra (cor escura, deslocamento +5, +5)
 *   2. Preenchimento sólido com a cor do item
 *   3. Contorno preto espesso (4 px)
 *   4. Brilho branco semi-transparente (canto superior-esquerdo)
 *
 * Tamanhos base (px no canvas 1280×720):
 *   pequeno → 56 | medio → 76 | grande → 100
 *
 * TODO: substituir por atlas real em public/assets/images/ quando disponível.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // this.createLoadingBar()
    createLoadingScreen(this, { background: 0xB0E8FF, accent: 0x2ECC71 })

    this.load.image('bg-garden', bgGardenUrl)
    this.load.image('shelf-wood', shelfWoodUrl)
    this.load.image('sun', sunUrl)
    this.load.image('planter-box', planterBoxUrl)
    this.load.image('planter-box-red',              planterBoxRedUrl)
    this.load.image('planter-box-blue',             planterBoxBlueUrl)
    this.load.image('planter-box-green',            planterBoxGreenUrl)
    this.load.image('planter-box-yellow',           planterBoxYellowUrl)
    this.load.image('planter-box-purple-circle',    planterBoxPurpleCircleUrl)
    this.load.image('planter-box-red-square',       planterBoxRedSquareUrl)
    this.load.image('planter-box-blue-triangle',    planterBoxBlueTriangleUrl)
    this.load.image('planter-box-green-rectangle',  planterBoxGreenRectangleUrl)
    this.load.image('wood-sign', woodSignUrl)
    this.load.image('flower-icon', flowerIconUrl)

    // TODO: atlas de itens
    // this.load.atlas('items', 'assets/images/items.png', 'assets/images/items.json')

    // TODO: áudios (.ogg + .mp3) — descomentar quando os arquivos existirem
    // this.load.audio('sfx-hit',             ['assets/audio/hit.ogg',             'assets/audio/hit.mp3'])
    // this.load.audio('sfx-miss',            ['assets/audio/miss.ogg',            'assets/audio/miss.mp3'])
    // this.load.audio('sfx-level',           ['assets/audio/level.ogg',           'assets/audio/level.mp3'])
    // this.load.audio('narr-cor-vermelho',   ['assets/audio/narr-cor-vermelho.ogg',   'assets/audio/narr-cor-vermelho.mp3'])
    // this.load.audio('narr-cor-azul',       ['assets/audio/narr-cor-azul.ogg',       'assets/audio/narr-cor-azul.mp3'])
    // this.load.audio('narr-cor-verde',      ['assets/audio/narr-cor-verde.ogg',      'assets/audio/narr-cor-verde.mp3'])
    // this.load.audio('narr-cor-amarelo',    ['assets/audio/narr-cor-amarelo.ogg',    'assets/audio/narr-cor-amarelo.mp3'])
    // this.load.audio('narr-forma-circulo',  ['assets/audio/narr-forma-circulo.ogg',  'assets/audio/narr-forma-circulo.mp3'])
    // this.load.audio('narr-forma-quadrado', ['assets/audio/narr-forma-quadrado.ogg', 'assets/audio/narr-forma-quadrado.mp3'])
    // this.load.audio('narr-forma-triangulo',['assets/audio/narr-forma-triangulo.ogg','assets/audio/narr-forma-triangulo.mp3'])
  }

  create() {
    this.generateItemTextures()
    this.removeWhiteBackground('shelf-wood')
    this.removeWhiteBackground('wood-sign')
    this.removeWhiteBackground('flower-icon')
    // A plataforma manda ?stage=N; fora do embed vale o padrao de sempre.
    this.scene.start('GameScene', { level: faseInicial(this, DEV_START_LEVEL) })
  }

  // ── Barra de carregamento ────────────────────────────────────────────────

  private createLoadingBar() {
    const cx = 640
    const cy = 360
    const w  = 500
    const h  = 28

    // Fundo amigável (céu claro)
    this.add.rectangle(640, 360, 1280, 720, 0xB0E8FF)

    // Sol decorativo
    this.add.circle(100, 100, 55, 0xFFD700)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x1 = 100 + Math.cos(angle) * 65
      const y1 = 100 + Math.sin(angle) * 65
      const x2 = 100 + Math.cos(angle) * 85
      const y2 = 100 + Math.sin(angle) * 85
      const ray = this.add.graphics()
      ray.lineStyle(4, 0xFFD700)
      ray.lineBetween(x1, y1, x2, y2)
    }

    // Barra de loading
    this.add.rectangle(cx, cy, w + 8, h + 8, 0x2C3E50, 0.6).setStrokeStyle(3, 0x3498DB)
    this.add.rectangle(cx - w / 2, cy, 0, h, 0xECF0F1).setOrigin(0, 0.5)  // placeholder
    const bar = this.add.rectangle(cx - w / 2, cy, 4, h, 0x2ECC71)
    bar.setOrigin(0, 0.5)

    this.add.text(cx, cy - 36, '🎮 Preparando o jogo...', {
      fontSize: '24px',
      color: '#2C3E50',
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      stroke: '#FFFFFF',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      bar.setSize(Math.max(4, w * value), h)
    })
  }

  // ── Texturas de itens ────────────────────────────────────────────────────

  /**
   * Gera textura para cada combinação cor × forma × tamanho.
   * Chave: `item-{cor}-{forma}-{tamanho}`
   *
   * Tamanho do canvas de textura = baseSize + 20
   *   (5 px pad + 5 px shadow + 5 px margin em cada lado)
   */
  private generateItemTextures() {
    const colorMap: Record<string, number> = {
      vermelho: 0xE53935,
      azul:     0x1E88E5,
      verde:    0x43A047,
      amarelo:  0xFDD835,
      roxo:     0x8E24AA,
    }

    const sizeMap: Record<string, number> = {
      pequeno: 56,
      medio:   76,
      grande:  100,
    }

    const cores    = ['vermelho', 'azul', 'verde', 'amarelo', 'roxo']
    const formas   = ['circulo', 'quadrado', 'triangulo', 'retangulo']
    const tamanhos = ['pequeno', 'medio', 'grande']

    // Formas geométricas (todos os níveis)
    for (const cor of cores) {
      for (const forma of formas) {
        for (const tamanho of tamanhos) {
          const key  = `item-${cor}-${forma}-${tamanho}`
          if (this.textures.exists(key)) continue

          const size    = sizeMap[tamanho]
          const fill    = colorMap[cor]
          const canvasW = size + 20
          const canvasH = size + 20

          const gfx = this.add.graphics()
          this.drawEnhancedShape(gfx, forma, size, fill)
          gfx.generateTexture(key, canvasW, canvasH)
          gfx.destroy()
        }
      }
    }

    // Manchas de cor puras para o nível 1 (sem ênfase em forma)
    for (const cor of cores) {
      for (const tamanho of tamanhos) {
        const key = `item-${cor}-swatch-${tamanho}`
        if (this.textures.exists(key)) continue

        const size    = sizeMap[tamanho]
        const fill    = colorMap[cor]
        const canvasW = size + 20
        const canvasH = size + 20

        const gfx = this.add.graphics()
        this.drawColorSwatch(gfx, size, fill)
        gfx.generateTexture(key, canvasW, canvasH)
        gfx.destroy()
      }
    }
  }

  private drawColorSwatch(gfx: Phaser.GameObjects.Graphics, size: number, fill: number) {
    const half   = size / 2
    const cx     = half + 7
    const cy     = half + 7
    const radius = Math.round(size * 0.30)  // gel: very rounded

    // Drop shadow
    gfx.fillStyle(0x000000, 0.22)
    gfx.fillRoundedRect(cx - half + 6, cy - half + 7, size, size, radius)

    // Main gel body
    gfx.fillStyle(fill, 1)
    gfx.fillRoundedRect(cx - half, cy - half, size, size, radius)

    // Subtle border
    gfx.lineStyle(2, 0x000000, 0.14)
    gfx.strokeRoundedRect(cx - half, cy - half, size, size, radius)

    // Large soft highlight (gel look)
    gfx.fillStyle(0xFFFFFF, 0.36)
    gfx.fillRoundedRect(cx - half + 6, cy - half + 5, size * 0.52, size * 0.34, radius * 0.65)

    // Specular dot (top-left)
    gfx.fillStyle(0xFFFFFF, 0.65)
    gfx.fillCircle(cx - half * 0.44, cy - half * 0.44, size * 0.10)
  }

  // ── Desenho de formas ────────────────────────────────────────────────────

  /**
   * Desenha uma forma com:
   *   1. Sombra escura (offset +5, +5)
   *   2. Preenchimento com a cor recebida
   *   3. Contorno preto espesso
   *   4. Brilho branco superior-esquerdo
   *
   * Coordenada central: (cx, cy) = (size/2 + 7, size/2 + 7)
   * Isso garante que sombra (cx+5, cy+5) + meio raio caibam no canvas.
   */
  private drawEnhancedShape(
    gfx: Phaser.GameObjects.Graphics,
    forma: string,
    size: number,
    fill: number,
  ) {
    const half   = size / 2
    const cx     = half + 7
    const cy     = half + 7
    const shadow = 0x000000

    switch (forma) {
      case 'circulo': {
        gfx.fillStyle(shadow, 0.28)
        gfx.fillCircle(cx + 5, cy + 6, half)
        gfx.fillStyle(fill, 1)
        gfx.fillCircle(cx, cy, half)
        gfx.lineStyle(4, 0x000000, 0.50)
        gfx.strokeCircle(cx, cy, half)
        // Gel highlight — large soft area
        gfx.fillStyle(0xFFFFFF, 0.35)
        gfx.fillCircle(cx - half * 0.18, cy - half * 0.22, half * 0.40)
        // Specular dot
        gfx.fillStyle(0xFFFFFF, 0.65)
        gfx.fillCircle(cx - half * 0.30, cy - half * 0.30, half * 0.14)
        break
      }

      case 'quadrado': {
        const x0 = cx - half
        const y0 = cy - half
        const r  = Math.round(size * 0.18)
        gfx.fillStyle(shadow, 0.28)
        gfx.fillRoundedRect(x0 + 5, y0 + 5, size, size, r)
        gfx.fillStyle(fill, 1)
        gfx.fillRoundedRect(x0, y0, size, size, r)
        gfx.lineStyle(4, 0x000000, 0.50)
        gfx.strokeRoundedRect(x0, y0, size, size, r)
        // Gel highlight
        gfx.fillStyle(0xFFFFFF, 0.40)
        gfx.fillRoundedRect(x0 + 6, y0 + 5, size * 0.40, size * 0.28, r * 0.5)
        gfx.fillStyle(0xFFFFFF, 0.55)
        gfx.fillCircle(x0 + size * 0.22, y0 + size * 0.22, size * 0.09)
        break
      }

      case 'triangulo': {
        const t = [
          { x: cx,        y: cy - half },
          { x: cx - half, y: cy + half },
          { x: cx + half, y: cy + half },
        ]
        gfx.fillStyle(shadow, 0.28)
        gfx.fillTriangle(t[0].x+5, t[0].y+5, t[1].x+5, t[1].y+5, t[2].x+5, t[2].y+5)
        gfx.fillStyle(fill, 1)
        gfx.fillTriangle(t[0].x, t[0].y, t[1].x, t[1].y, t[2].x, t[2].y)
        gfx.lineStyle(4, 0x000000, 0.55)
        gfx.strokeTriangle(t[0].x, t[0].y, t[1].x, t[1].y, t[2].x, t[2].y)
        gfx.fillStyle(0xFFFFFF, 0.45)
        gfx.fillCircle(cx, cy - half * 0.1, half * 0.2)
        break
      }

      case 'retangulo': {
        const rh = size * 0.55
        const rx = cx - half
        const ry = cy - rh / 2
        const rr = Math.round(rh * 0.22)
        gfx.fillStyle(shadow, 0.28)
        gfx.fillRoundedRect(rx + 5, ry + 5, size, rh, rr)
        gfx.fillStyle(fill, 1)
        gfx.fillRoundedRect(rx, ry, size, rh, rr)
        gfx.lineStyle(4, 0x000000, 0.50)
        gfx.strokeRoundedRect(rx, ry, size, rh, rr)
        // Gel highlight
        gfx.fillStyle(0xFFFFFF, 0.40)
        gfx.fillRoundedRect(rx + 6, ry + 5, size * 0.38, rh * 0.36, rr * 0.5)
        gfx.fillStyle(0xFFFFFF, 0.55)
        gfx.fillCircle(rx + size * 0.20, ry + rh * 0.25, rh * 0.14)
        break
      }
    }
  }

  // Remove pixels brancos/quase-brancos de uma textura carregada,
  // substituindo-a por uma versão com canal alpha transparente nessas áreas.
  private removeWhiteBackground(key: string, threshold = 230) {
    if (!this.textures.exists(key)) return

    const source = this.textures.get(key).getSourceImage() as HTMLImageElement
    const canvas = document.createElement('canvas')
    canvas.width  = source.naturalWidth
    canvas.height = source.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(source, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = imageData.data
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > threshold && d[i + 1] > threshold && d[i + 2] > threshold) {
        d[i + 3] = 0   // torna transparente
      }
    }
    ctx.putImageData(imageData, 0, 0)

    this.textures.remove(key)
    this.textures.addCanvas(key, canvas)
  }
}
