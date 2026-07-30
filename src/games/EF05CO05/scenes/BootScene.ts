import Phaser from 'phaser'
import { C, CSS } from '../data/theme'
import { W, H } from '../data/layout'
import type { BBox } from '../types'

import bgOficinaUrl from '../../../assets/games/EF05CO05/bg-oficina.png'
import layerMesaUrl from '../../../assets/games/EF05CO05/layer-mesa.png'

import layerGabineteUrl from '../../../assets/games/EF05CO05/layer-gabinete.png'
import layerPlacaMaeUrl from '../../../assets/games/EF05CO05/layer-placa-mae.png'
import layerFonteUrl from '../../../assets/games/EF05CO05/layer-fonte.png'
import layerProcessadorUrl from '../../../assets/games/EF05CO05/layer-processador.png'
import layerRamUrl from '../../../assets/games/EF05CO05/layer-ram.png'
import layerHdUrl from '../../../assets/games/EF05CO05/layer-hd.png'

import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

import layerMonitorUrl from '../../../assets/games/EF05CO05/layer-monitor.png'
import layerMonitorLigadoUrl from '../../../assets/games/EF05CO05/layer-monitor-ligado.png'
import layerTecladoUrl from '../../../assets/games/EF05CO05/layer-teclado.png'
import layerMouseUrl from '../../../assets/games/EF05CO05/layer-mouse.png'
import layerSomEsqUrl from '../../../assets/games/EF05CO05/layer-som-esq.png'
import layerSomDirUrl from '../../../assets/games/EF05CO05/layer-som-dir.png'

import iconeGabineteUrl from '../../../assets/games/EF05CO05/icone-gabinete.png'
import iconePlacaMaeUrl from '../../../assets/games/EF05CO05/icone-placa-mae.png'
import iconeFonteUrl from '../../../assets/games/EF05CO05/icone-fonte.png'
import iconeProcessadorUrl from '../../../assets/games/EF05CO05/icone-processador.png'
import iconeRamUrl from '../../../assets/games/EF05CO05/icone-ram.png'
import iconeHdUrl from '../../../assets/games/EF05CO05/icone-hd.png'
import iconeMonitorUrl from '../../../assets/games/EF05CO05/icone-monitor.png'
import iconeTecladoUrl from '../../../assets/games/EF05CO05/icone-teclado.png'
import iconeMouseUrl from '../../../assets/games/EF05CO05/icone-mouse.png'
import iconeSomUrl from '../../../assets/games/EF05CO05/icone-som.png'
import iconePowerUrl from '../../../assets/games/EF05CO05/icone-power.png'

import seloOkUrl from '../../../assets/games/EF05CO05/selo-ok.png'
import seloXUrl from '../../../assets/games/EF05CO05/selo-x.png'

const BASES: Array<[string, string]> = [
    ['bg-oficina', bgOficinaUrl],
    ['layer-mesa', layerMesaUrl],
]

const LAYERS: Array<[string, string]> = [
    ['layer-gabinete', layerGabineteUrl],
    ['layer-placa-mae', layerPlacaMaeUrl],
    ['layer-fonte', layerFonteUrl],
    ['layer-processador', layerProcessadorUrl],
    ['layer-ram', layerRamUrl],
    ['layer-hd', layerHdUrl],
    ['layer-monitor', layerMonitorUrl],
    ['layer-teclado', layerTecladoUrl],
    ['layer-mouse', layerMouseUrl],
    ['layer-som-esq', layerSomEsqUrl],
    ['layer-som-dir', layerSomDirUrl],
]

const EXTRAS: Array<[string, string]> = [
    ['layer-monitor-ligado', layerMonitorLigadoUrl],
    ['icone-gabinete', iconeGabineteUrl],
    ['icone-placa-mae', iconePlacaMaeUrl],
    ['icone-fonte', iconeFonteUrl],
    ['icone-processador', iconeProcessadorUrl],
    ['icone-ram', iconeRamUrl],
    ['icone-hd', iconeHdUrl],
    ['icone-monitor', iconeMonitorUrl],
    ['icone-teclado', iconeTecladoUrl],
    ['icone-mouse', iconeMouseUrl],
    ['icone-som', iconeSomUrl],
    ['icone-power', iconePowerUrl],
    ['selo-ok', seloOkUrl],
    ['selo-x', seloXUrl],
]

export const BBOXES: Record<string, BBox> = {}

export const CANVAS = { w: 1024, h: 768 }

export function layerBBox(key: string): BBox {
    return BBOXES[key] ?? { x: 0, y: 0, w: CANVAS.w, h: CANVAS.h }
}

export function unionBBox(keys: string[]): BBox {
    const boxes = keys.map(layerBBox)
    const x1 = Math.min(...boxes.map(b => b.x))
    const y1 = Math.min(...boxes.map(b => b.y))
    const x2 = Math.max(...boxes.map(b => b.x + b.w))
    const y2 = Math.max(...boxes.map(b => b.y + b.h))
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Monte seu',
            subtitle: 'COMPUTADOR',
            description: 'Preparando a bancada...',
            theme: {
                background: { kind: 'grid', base: C.preto, color: C.medio, size: 64, alpha: 0.2 },
                card: C.escuro,
                cardShadow: C.preto,
                cardBorder: C.medio,
                title: C.creme,
                subtitle: C.ouro,
                description: C.claro,
                titleStroke: C.preto,
                progressTrack: C.preto,
                progressBorder: C.medio,
                progressFill: C.ouro,
            },
        })

        ;[...BASES, ...LAYERS, ...EXTRAS].forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        this.readCanvasSize()
        LAYERS.forEach(([key]) => this.scanBBox(key))

        this.buildGlowTexture()
        this.buildSparkTexture()
        this.buildShadowTexture()

        this.scene.launch('UIScene')
        this.time.delayedCall(0, () => this.scene.start('GameScene', { level: 1 }))
    }

    private readCanvasSize() {
        const tex = this.textures.get('bg-oficina')
        const src = tex.getSourceImage() as { width: number; height: number }
        CANVAS.w = src.width
        CANVAS.h = src.height
    }

    private scanBBox(key: string) {
        if (BBOXES[key]) return

        const src = this.textures.get(key).getSourceImage() as CanvasImageSource & {
            width: number
            height: number
        }

        const w = src.width
        const h = src.height

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
            BBOXES[key] = { x: 0, y: 0, w, h }
            return
        }

        ctx.drawImage(src, 0, 0)

        let data: Uint8ClampedArray
        try {
            data = ctx.getImageData(0, 0, w, h).data
        } catch {
            BBOXES[key] = { x: 0, y: 0, w, h }
            return
        }

        const STEP = 2
        const THRESHOLD = 16

        let minX = w
        let minY = h
        let maxX = -1
        let maxY = -1

        for (let y = 0; y < h; y += STEP) {
            const row = y * w
            for (let x = 0; x < w; x += STEP) {
                if (data[(row + x) * 4 + 3] < THRESHOLD) continue
                if (x < minX) minX = x
                if (x > maxX) maxX = x
                if (y < minY) minY = y
                if (y > maxY) maxY = y
            }
        }

        if (maxX < 0) {
            BBOXES[key] = { x: 0, y: 0, w, h }
            return
        }

        const pad = STEP
        minX = Math.max(0, minX - pad)
        minY = Math.max(0, minY - pad)
        maxX = Math.min(w - 1, maxX + pad)
        maxY = Math.min(h - 1, maxY + pad)

        BBOXES[key] = {
            x: minX,
            y: minY,
            w: maxX - minX + 1,
            h: maxY - minY + 1,
        }
    }

    private buildGlowTexture() {
        if (this.textures.exists('fx-brilho')) return

        const s = 256
        const tex = this.textures.createCanvas('fx-brilho', s, s)
        if (!tex) return

        const ctx = tex.getContext()
        const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
        grad.addColorStop(0, 'rgba(255,255,255,0.95)')
        grad.addColorStop(0.45, 'rgba(255,255,255,0.36)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, s, s)
        tex.refresh()
    }

    private buildShadowTexture() {
        if (this.textures.exists('fx-sombra')) return

        const w = 192
        const h = 96
        const tex = this.textures.createCanvas('fx-sombra', w, h)
        if (!tex) return

        const ctx = tex.getContext()
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
        grad.addColorStop(0, 'rgba(0,0,0,0.6)')
        grad.addColorStop(0.6, 'rgba(0,0,0,0.24)')
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.scale(1, 0.5)
        ctx.translate(-w / 2, -h / 2)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
        tex.refresh()
    }

    private buildSparkTexture() {
        if (this.textures.exists('fx-faisca')) return

        const g = this.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(0xffffff, 1)
        g.fillCircle(16, 16, 9)
        g.fillStyle(0xffffff, 0.45)
        g.fillCircle(16, 16, 15)
        g.generateTexture('fx-faisca', 32, 32)
        g.destroy()
    }

    private createLoadingScreen() {
        this.add.rectangle(W / 2, H / 2, W, H, C.preto).setDepth(0)

        const grid = this.add.graphics().setDepth(1).setAlpha(0.2)
        grid.lineStyle(2, C.medio)
        for (let x = 0; x <= W; x += 64) grid.lineBetween(x, 0, x, H)
        for (let y = 0; y <= H; y += 64) grid.lineBetween(0, y, W, y)

        const midY = H / 2

        const card = this.add.graphics().setDepth(2)
        card.fillStyle(C.preto, 0.55)
        card.fillRoundedRect(W / 2 - 340, midY - 138, 680, 280, 30)
        card.fillStyle(C.escuro, 1)
        card.fillRoundedRect(W / 2 - 340, midY - 146, 680, 280, 30)
        card.fillStyle(0xffffff, 0.06)
        card.fillRoundedRect(W / 2 - 328, midY - 136, 656, 88, 22)
        card.lineStyle(5, C.medio, 1)
        card.strokeRoundedRect(W / 2 - 340, midY - 146, 680, 280, 30)

        this.add.text(W / 2, midY - 88, 'Monte seu', {
            fontSize: '36px',
            fontFamily: 'Arial Black, Arial',
            color: CSS.creme,
            stroke: CSS.preto,
            strokeThickness: 8,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        this.add.text(W / 2, midY - 32, 'COMPUTADOR', {
            fontSize: '50px',
            fontFamily: 'Arial Black, Arial',
            color: CSS.ouro,
            stroke: CSS.preto,
            strokeThickness: 9,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        this.add.text(W / 2, midY + 26, 'Preparando a bancada...', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: CSS.claro,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        const barW = 540
        const barX = W / 2 - barW / 2
        const barY = midY + 68

        const track = this.add.graphics().setDepth(3)
        track.fillStyle(C.preto, 1)
        track.fillRoundedRect(barX, barY, barW, 32, 16)
        track.lineStyle(4, C.medio, 1)
        track.strokeRoundedRect(barX, barY, barW, 32, 16)

        const fill = this.add.graphics().setDepth(4)
        this.load.on('progress', (v: number) => {
            const w = Math.max(14, (barW - 10) * v)
            fill.clear()
            fill.fillStyle(C.ouro, 1)
            fill.fillRoundedRect(barX + 5, barY + 5, w, 22, 11)
            fill.fillStyle(0xffffff, 0.35)
            fill.fillRoundedRect(barX + 9, barY + 8, Math.max(6, w - 8), 7, 4)
        })
    }
}