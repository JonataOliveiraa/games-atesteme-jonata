import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'
import type { TextureKey } from '../types'
import { C } from '../data/theme'

import bgAcademiaHubUrl from '../../../assets/games/EF15CO02/bg-academia-hub.png'
import bgSalaTreinoUrl from '../../../assets/games/EF15CO02/bg-sala-treino.png'
import avatarCriancaUrl from '../../../assets/games/EF15CO02/avatar-crianca.png'

import treinadorNormalUrl from '../../../assets/games/EF15CO02/treinador-normal.png'
import treinadorFelizUrl from '../../../assets/games/EF15CO02/treinador-feliz.png'
import treinadorPensandoUrl from '../../../assets/games/EF15CO02/treinador-pensando.png'

import itemBlocoMontarUrl from '../../../assets/games/EF15CO02/item-bloco-montar.png'
import itemBrinquedoUrl from '../../../assets/games/EF15CO02/item-brinquedo.png'
import itemCadernoUrl from '../../../assets/games/EF15CO02/item-caderno.png'
import itemEscovaUrl from '../../../assets/games/EF15CO02/item-escova.png'
import itemLancheUrl from '../../../assets/games/EF15CO02/item-lanche.png'
import itemMochilaUrl from '../../../assets/games/EF15CO02/item-mochila.png'
import itemPastaDenteUrl from '../../../assets/games/EF15CO02/item-pasta-dente.png'
import itemPlantaUrl from '../../../assets/games/EF15CO02/item-planta.png'
import itemPocaUrl from '../../../assets/games/EF15CO02/item-poca.png'
import itemRegadorUrl from '../../../assets/games/EF15CO02/item-regador.png'

import personagemCaioUrl from '../../../assets/games/EF15CO02/personagem-caio.png'
import personagemLiaUrl from '../../../assets/games/EF15CO02/personagem-lia.png'
import personagemNinaUrl from '../../../assets/games/EF15CO02/personagem-nina.png'

const ASSETS: Array<[TextureKey, string]> = [
  ['bg-academia-hub', bgAcademiaHubUrl],
  ['bg-sala-treino', bgSalaTreinoUrl],
  ['avatar-crianca', avatarCriancaUrl],
  ['treinador-normal', treinadorNormalUrl],
  ['treinador-feliz', treinadorFelizUrl],
  ['treinador-pensando', treinadorPensandoUrl],
  ['item-bloco-montar', itemBlocoMontarUrl],
  ['item-brinquedo', itemBrinquedoUrl],
  ['item-caderno', itemCadernoUrl],
  ['item-escova', itemEscovaUrl],
  ['item-lanche', itemLancheUrl],
  ['item-mochila', itemMochilaUrl],
  ['item-pasta-dente', itemPastaDenteUrl],
  ['item-planta', itemPlantaUrl],
  ['item-poca', itemPocaUrl],
  ['item-regador', itemRegadorUrl],
  ['personagem-caio', personagemCaioUrl],
  ['personagem-lia', personagemLiaUrl],
  ['personagem-nina', personagemNinaUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Academia',
      subtitle: 'DOS ALGORITMOS',
      description: 'Preparando blocos, missoes e simulacoes',
      theme: {
        background: { kind: 'stripes', base: C.bg, color: C.accent, alpha: 0.1, size: 24, gap: 52, angle: 'diagonal' },
        card: C.panel,
        cardShadow: C.shadow,
        cardHighlight: C.white,
        cardBorder: C.accent,
        title: C.ink,
        subtitle: C.condition,
        description: C.muted,
        titleStroke: C.white,
        progressTrack: C.bgDeep,
        progressBorder: C.white,
        progressFill: C.accent,
        progressHighlight: C.white,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.createGeneratedTextures()
    EventBus.emit('ef15co02-assets-ready')

    this.scene.launch('UIScene')
    this.time.delayedCall(0, () => this.scene.start('GameScene', { level: 1, phase: 0 }))
  }

  private createGeneratedTextures() {
    this.createGlowTexture()
    this.createShadowTexture()
    this.createBlockSlotTexture()
    this.createCheckTexture()
    this.createErrorTexture()
  }

  private createGlowTexture() {
    if (this.textures.exists('algoritmos-fx-glow')) return

    const size = 256
    const tex = this.textures.createCanvas('algoritmos-fx-glow', size, size)
    if (!tex) return

    const ctx = tex.getContext()
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,255,255,0.95)')
    grad.addColorStop(0.45, 'rgba(255,178,63,0.34)')
    grad.addColorStop(1, 'rgba(255,178,63,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    tex.refresh()
  }

  private createShadowTexture() {
    if (this.textures.exists('algoritmos-fx-shadow')) return

    const w = 220
    const h = 110
    const tex = this.textures.createCanvas('algoritmos-fx-shadow', w, h)
    if (!tex) return

    const ctx = tex.getContext()
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    grad.addColorStop(0, 'rgba(0,0,0,0.38)')
    grad.addColorStop(0.62, 'rgba(0,0,0,0.16)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.scale(1, 0.42)
    ctx.translate(-w / 2, -h / 2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
    tex.refresh()
  }

  private createBlockSlotTexture() {
    if (this.textures.exists('algoritmos-slot')) return

    const w = 310
    const h = 64
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(0xffffff, 0.76)
    g.fillRoundedRect(0, 0, w, h, 18)
    g.lineStyle(4, C.accent, 0.82)
    g.strokeRoundedRect(3, 3, w - 6, h - 6, 16)
    g.generateTexture('algoritmos-slot', w, h)
    g.destroy()
  }

  private createCheckTexture() {
    if (this.textures.exists('algoritmos-check')) return

    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.lineStyle(8, C.success, 1)
    g.beginPath()
    g.moveTo(10, 28)
    g.lineTo(24, 42)
    g.lineTo(54, 12)
    g.strokePath()
    g.generateTexture('algoritmos-check', 64, 64)
    g.destroy()
  }

  private createErrorTexture() {
    if (this.textures.exists('algoritmos-error')) return

    const g = this.make.graphics({ x: 0, y: 0 }, false)
    g.lineStyle(8, C.error, 1)
    g.lineBetween(14, 14, 50, 50)
    g.lineBetween(50, 14, 14, 50)
    g.generateTexture('algoritmos-error', 64, 64)
    g.destroy()
  }
}
