import Phaser from 'phaser'

/**
 * BootScene — carrega todos os assets do jogo antes de iniciar.
 *
 * Como ainda não temos arquivos de áudio/imagem reais, esta Scene:
 * - Exibe uma barra de progresso programática
 * - Marca os loads de áudio como TODO para quando os arquivos existirem
 * - Gera as texturas dos itens programaticamente via Graphics
 *   (formas geométricas coloridas desenhadas diretamente no canvas)
 *
 * TODO: substituir os blocos marcados por assets reais em:
 *   public/assets/audio/  (.ogg + .mp3)
 *   public/assets/images/ (atlas PNG + JSON)
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.createLoadingBar()

    // TODO: carregar atlas de itens quando existir
    // this.load.atlas('items', 'assets/images/items.png', 'assets/images/items.json')

    // TODO: carregar áudios quando os arquivos existirem
    // this.load.audio('sfx-hit',            ['assets/audio/hit.ogg',            'assets/audio/hit.mp3'])
    // this.load.audio('sfx-miss',           ['assets/audio/miss.ogg',           'assets/audio/miss.mp3'])
    // this.load.audio('sfx-level',          ['assets/audio/level.ogg',          'assets/audio/level.mp3'])
    // this.load.audio('narr-cor-vermelho',  ['assets/audio/narr-cor-vermelho.ogg',  'assets/audio/narr-cor-vermelho.mp3'])
    // this.load.audio('narr-cor-azul',      ['assets/audio/narr-cor-azul.ogg',      'assets/audio/narr-cor-azul.mp3'])
    // this.load.audio('narr-cor-verde',     ['assets/audio/narr-cor-verde.ogg',     'assets/audio/narr-cor-verde.mp3'])
    // this.load.audio('narr-cor-amarelo',   ['assets/audio/narr-cor-amarelo.ogg',   'assets/audio/narr-cor-amarelo.mp3'])
    // this.load.audio('narr-forma-circulo', ['assets/audio/narr-forma-circulo.ogg', 'assets/audio/narr-forma-circulo.mp3'])
    // this.load.audio('narr-forma-quadrado',['assets/audio/narr-forma-quadrado.ogg','assets/audio/narr-forma-quadrado.mp3'])
    // this.load.audio('narr-forma-triangulo',['assets/audio/narr-forma-triangulo.ogg','assets/audio/narr-forma-triangulo.mp3'])
  }

  create() {
    this.generateItemTextures()
    this.scene.start('GameScene')
  }

  // ─── Barra de loading ──────────────────────────────────────────────────────

  private createLoadingBar() {
    const cx = 640
    const cy = 360
    const w  = 400
    const h  = 20

    const bg  = this.add.rectangle(cx, cy, w, h, 0x333344)
    const bar = this.add.rectangle(cx - w / 2, cy, 0, h, 0x7c3aed)
    bar.setOrigin(0, 0.5)

    this.add.text(cx, cy - 40, 'Carregando…', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    bg.setVisible(true)

    this.load.on('progress', (value: number) => {
      bar.setSize(w * value, h)
    })
  }

  // ─── Texturas programáticas ────────────────────────────────────────────────

  /**
   * Gera texturas para cada combinação cor×forma×tamanho via Graphics.
   * Chave de textura: `item-{cor}-{forma}-{tamanho}` (ex: `item-vermelho-circulo-medio`)
   *
   * Tamanhos em pixels no canvas 1280×720:
   *   pequeno → 60px | medio → 80px | grande → 104px
   */
  private generateItemTextures() {
    const colorMap: Record<string, number> = {
      vermelho: 0xe53935,
      azul:     0x1e88e5,
      verde:    0x43a047,
      amarelo:  0xfdd835,
    }

    const sizeMap: Record<string, number> = {
      pequeno: 60,
      medio:   80,
      grande:  104,
    }

    const cores   = ['vermelho', 'azul', 'verde', 'amarelo']
    const formas  = ['circulo', 'quadrado', 'triangulo', 'retangulo']
    const tamanhos = ['pequeno', 'medio', 'grande']

    for (const cor of cores) {
      for (const forma of formas) {
        for (const tamanho of tamanhos) {
          const key  = `item-${cor}-${forma}-${tamanho}`
          const size = sizeMap[tamanho]
          const fill = colorMap[cor]

          if (this.textures.exists(key)) continue

          const gfx = this.add.graphics()
          gfx.fillStyle(fill, 1)
          gfx.lineStyle(3, 0x000000, 0.3)

          this.drawShape(gfx, forma, size)

          gfx.generateTexture(key, size + 10, size + 10)
          gfx.destroy()
        }
      }
    }
  }

  private drawShape(gfx: Phaser.GameObjects.Graphics, forma: string, size: number) {
    const half = size / 2
    const pad  = 5 // margem interna

    switch (forma) {
      case 'circulo':
        gfx.fillCircle(half + pad, half + pad, half)
        gfx.strokeCircle(half + pad, half + pad, half)
        break

      case 'quadrado':
        gfx.fillRect(pad, pad, size, size)
        gfx.strokeRect(pad, pad, size, size)
        break

      case 'triangulo': {
        const pts = [
          { x: half + pad, y: pad },
          { x: pad,        y: size + pad },
          { x: size + pad, y: size + pad },
        ]
        gfx.fillTriangle(pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y)
        gfx.strokeTriangle(pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y)
        break
      }

      case 'retangulo':
        gfx.fillRect(pad, pad + size * 0.2, size, size * 0.6)
        gfx.strokeRect(pad, pad + size * 0.2, size, size * 0.6)
        break
    }
  }
}
