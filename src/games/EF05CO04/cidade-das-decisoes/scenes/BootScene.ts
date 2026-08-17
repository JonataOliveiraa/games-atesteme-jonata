import Phaser from 'phaser'
import { C, CSS } from '../data/theme'
import { W, H } from '../data/layout'

import bgCidadeUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/bg-cidade.png'

import chaveUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/chave.png'
import gotaUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/gota.png'
import pedraUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/pedra.png'

import portaAbertaUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/porta-aberta.png'
import portaFechadaUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/porta-fechada.png'

import semaforoVerdeUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/semaforo-verde.png'
import semaforoVermelhoUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/semaforo-vermelho.png'

import tilesetUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/tileset-cidade.png'
import personagemUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/personagem.png'
import itensUrl from '../../../../assets/games/EF05CO04/cidade-das-decisoes/itens.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

const IMAGES: Array<[string, string]> = [
    ['bg-cidade', bgCidadeUrl],
    ['chave', chaveUrl],
    ['gota', gotaUrl],
    ['pedra', pedraUrl],
    ['porta-aberta', portaAbertaUrl],
    ['porta-fechada', portaFechadaUrl],
    ['semaforo-verde', semaforoVerdeUrl],
    ['semaforo-vermelho', semaforoVermelhoUrl],
]

/** Tamanho de um quadro em cada folha. Ajuste aqui se a arte mudar de escala. */
export const SHEET = {
    tileset: 128,
    personagem: 400,
    itens: 256,
}

/** Quadros do personagem, na ordem em que estão na folha. */
export const POSE = {
    parado: 0,
    andarA: 1,
    andarB: 2,
    pensativo: 3,
    confuso: 4,
    feliz: 5,
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Cidade das',
            subtitle: 'DECISÕES',
            description: 'Acendendo os semáforos...',
            theme: {
                background: { kind: 'stripes', base: C.borda, color: C.claro, angle: 'diagonal', alpha: 0.1 },
                card: C.escuro,
                cardShadow: 0x000000,
                cardBorder: C.claro,
                title: C.creme,
                subtitle: C.amarelo,
                description: C.claro,
                titleStroke: C.borda,
                progressTrack: C.borda,
                progressBorder: C.claro,
                progressFill: C.amarelo,
            },
        })

        IMAGES.forEach(([key, url]) => this.load.image(key, url))

        this.load.spritesheet('tileset-cidade', tilesetUrl, {
            frameWidth: SHEET.tileset,
            frameHeight: SHEET.tileset,
        })
        this.load.spritesheet('personagem', personagemUrl, {
            frameWidth: SHEET.personagem,
            frameHeight: SHEET.personagem,
        })
        this.load.spritesheet('itens', itensUrl, {
            frameWidth: SHEET.itens,
            frameHeight: SHEET.itens,
        })
    }

    create() {
        this.buildGlowTexture()
        this.buildSparkTexture()
        this.buildArrowTexture()
        this.buildShadowTexture()

        this.anims.create({
            key: 'andar',
            frames: [{ key: 'personagem', frame: POSE.andarA }, { key: 'personagem', frame: POSE.andarB }],
            frameRate: 7,
            repeat: -1,
        })

        this.scene.launch('UIScene')
        this.scene.start('GameScene', { level: 1 })
    }

    /** Halo radial branco — tingido de verde, vermelho ou amarelo pelas cenas. */
    private buildGlowTexture() {
        if (this.textures.exists('fx-brilho')) return

        const s = 256
        const tex = this.textures.createCanvas('fx-brilho', s, s)
        if (!tex) return

        const ctx = tex.getContext()
        const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
        grad.addColorStop(0, 'rgba(255,255,255,0.95)')
        grad.addColorStop(0.45, 'rgba(255,255,255,0.38)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, s, s)
        tex.refresh()
    }

    /** Sombra elíptica achatada, colocada sob personagem, prédios e pedra. */
    private buildShadowTexture() {
        if (this.textures.exists('fx-sombra')) return

        const w = 192
        const h = 96
        const tex = this.textures.createCanvas('fx-sombra', w, h)
        if (!tex) return

        const ctx = tex.getContext()
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
        grad.addColorStop(0, 'rgba(0,0,0,0.55)')
        grad.addColorStop(0.6, 'rgba(0,0,0,0.22)')
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

    /** Seta apontando para cima, com contorno grosso. Girada por setAngle nos ícones. */
    private buildArrowTexture() {
        if (this.textures.exists('icon-seta')) return

        const s = 64
        const g = this.make.graphics({ x: 0, y: 0 }, false)

        const shape = [
            { x: 32, y: 8 }, { x: 56, y: 34 }, { x: 42, y: 34 },
            { x: 42, y: 56 }, { x: 22, y: 56 }, { x: 22, y: 34 },
            { x: 8, y: 34 },
        ]

        g.fillStyle(C.borda, 1)
        g.fillPoints(shape.map(p => ({ x: p.x, y: p.y + 3 })), true)
        g.fillStyle(0xffffff, 1)
        g.fillPoints(shape, true)
        g.lineStyle(4, C.borda, 1)
        g.strokePoints(shape, true, true)
        g.fillStyle(0xffffff, 0.55)
        g.fillTriangle(32, 14, 44, 32, 32, 32)

        g.generateTexture('icon-seta', s, s)
        g.destroy()
    }

    private createLoadingScreen() {
        this.add.rectangle(W / 2, H / 2, W, H, C.borda).setDepth(0)

        const grid = this.add.graphics().setDepth(1).setAlpha(0.14)
        grid.lineStyle(2, C.claro)
        for (let x = 0; x <= W; x += 90) grid.lineBetween(x, 0, x, H)
        for (let y = 0; y <= H; y += 90) grid.lineBetween(0, y, W, y)

        const midY = H / 2 - 60

        const card = this.add.graphics().setDepth(2)
        card.fillStyle(0x000000, 0.3)
        card.fillRoundedRect(W / 2 - 300, midY - 130, 600, 300, 32)
        card.fillStyle(C.escuro, 1)
        card.fillRoundedRect(W / 2 - 300, midY - 138, 600, 300, 32)
        card.fillStyle(0xffffff, 0.12)
        card.fillRoundedRect(W / 2 - 288, midY - 128, 576, 92, 24)
        card.lineStyle(5, C.claro, 0.85)
        card.strokeRoundedRect(W / 2 - 300, midY - 138, 600, 300, 32)

        this.add.text(W / 2, midY - 72, 'Cidade das', {
            fontSize: '42px',
            fontFamily: 'Arial Black, Arial',
            color: CSS.creme,
            stroke: CSS.borda,
            strokeThickness: 8,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        this.add.text(W / 2, midY - 16, 'DECISÕES', {
            fontSize: '54px',
            fontFamily: 'Arial Black, Arial',
            color: CSS.amarelo,
            stroke: CSS.borda,
            strokeThickness: 9,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        this.add.text(W / 2, midY + 42, 'Acendendo os semáforos...', {
            fontSize: '21px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: CSS.claro,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        const barW = 480
        const barX = W / 2 - barW / 2
        const barY = midY + 92

        const track = this.add.graphics().setDepth(3)
        track.fillStyle(C.borda, 1)
        track.fillRoundedRect(barX, barY, barW, 34, 17)
        track.lineStyle(4, C.claro, 0.9)
        track.strokeRoundedRect(barX, barY, barW, 34, 17)

        const fill = this.add.graphics().setDepth(4)
        this.load.on('progress', (v: number) => {
            const w = Math.max(14, (barW - 10) * v)
            fill.clear()
            fill.fillStyle(C.amarelo, 1)
            fill.fillRoundedRect(barX + 5, barY + 5, w, 24, 12)
            fill.fillStyle(0xffffff, 0.4)
            fill.fillRoundedRect(barX + 9, barY + 8, Math.max(6, w - 8), 8, 4)
        })
    }
}