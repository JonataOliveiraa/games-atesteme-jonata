import Phaser from 'phaser'
import { C, CSS, A } from '../data/theme'
import { W, H } from '../data/layout'

import bgMesaUrl from '../../../assets/games/EF05CO06/bg-mesa.png'
import bgSalaUrl from '../../../assets/games/EF05CO06/bg-sala.png'

import destDiscoUrl from '../../../assets/games/EF05CO06/dest-disco.png'
import destPendriveUrl from '../../../assets/games/EF05CO06/dest-pendrive.png'
import destNuvemUrl from '../../../assets/games/EF05CO06/dest-nuvem.png'
import destCheioUrl from '../../../assets/games/EF05CO06/dest-cheio.png'

import arqTextoUrl from '../../../assets/games/EF05CO06/arq-texto.png'
import arqBoletimUrl from '../../../assets/games/EF05CO06/arq-boletim.png'
import arqFotoUrl from '../../../assets/games/EF05CO06/arq-foto.png'
import arqVideoUrl from '../../../assets/games/EF05CO06/arq-video.png'
import arqDesenhoUrl from '../../../assets/games/EF05CO06/arq-desenho.png'
import arqMusicaUrl from '../../../assets/games/EF05CO06/arq-musica.png'
import arqApresentacaoUrl from '../../../assets/games/EF05CO06/arq-apresentacao.png'
import arqJogoUrl from '../../../assets/games/EF05CO06/arq-jogo.png'

import pastaFotosUrl from '../../../assets/games/EF05CO06/pasta-fotos.png'
import pastaJogosUrl from '../../../assets/games/EF05CO06/pasta-jogos.png'
import pastaTrabalhosUrl from '../../../assets/games/EF05CO06/pasta-trabalhos.png'

import iconeAppUrl from '../../../assets/games/EF05CO06/icone-.png'
import iconeCadeadoUrl from '../../../assets/games/EF05CO06/icone-cadeado.png'
import iconeWifiUrl from '../../../assets/games/EF05CO06/icone-wifi.png'

import seloLocalUrl from '../../../assets/games/EF05CO06/selo-local.png'
import seloRemotoUrl from '../../../assets/games/EF05CO06/selo-remoto.png'
import seloOkUrl from '../../../assets/games/EF05CO06/selo-ok.png'
import seloXUrl from '../../../assets/games/EF05CO06/selo-x.png'

import eventoPendriveUrl from '../../../assets/games/EF05CO06/evento-pendrive-perdido.png'
import eventoDiscoUrl from '../../../assets/games/EF05CO06/evento-disco-quebrado.png'
import eventoInternetUrl from '../../../assets/games/EF05CO06/evento-sem-internet.png'

import contextoUrl from '../../../assets/games/EF05CO06/contexto.png'


const ASSETS: Array<[string, string]> = [
    ['bg-mesa', bgMesaUrl],
    ['bg-sala', bgSalaUrl],
    ['dest-disco', destDiscoUrl],
    ['dest-pendrive', destPendriveUrl],
    ['dest-nuvem', destNuvemUrl],
    ['dest-cheio', destCheioUrl],
    ['arq-texto', arqTextoUrl],
    ['arq-boletim', arqBoletimUrl],
    ['arq-foto', arqFotoUrl],
    ['arq-video', arqVideoUrl],
    ['arq-desenho', arqDesenhoUrl],
    ['arq-musica', arqMusicaUrl],
    ['arq-apresentacao', arqApresentacaoUrl],
    ['arq-jogo', arqJogoUrl],
    ['pasta-fotos', pastaFotosUrl],
    ['pasta-jogos', pastaJogosUrl],
    ['pasta-trabalhos', pastaTrabalhosUrl],
    ['icone-app', iconeAppUrl],
    ['icone-cadeado', iconeCadeadoUrl],
    ['icone-wifi', iconeWifiUrl],
    ['selo-local', seloLocalUrl],
    ['selo-remoto', seloRemotoUrl],
    ['selo-ok', seloOkUrl],
    ['selo-x', seloXUrl],
    ['evento-pendrive-perdido', eventoPendriveUrl],
    ['evento-disco-quebrado', eventoDiscoUrl],
    ['evento-sem-internet', eventoInternetUrl],
    ['contexto', contextoUrl],
]

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        this.createLoadingScreen()
        ASSETS.forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        this.buildGlowTexture()
        this.buildSparkTexture()
        this.buildShadowTexture()

        this.scene.launch('UIScene')
        this.time.delayedCall(0, () => this.scene.start('GameScene', { level: 3, phase: 0 }))
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
        grad.addColorStop(0, 'rgba(19,15,13,0.6)')
        grad.addColorStop(0.6, 'rgba(19,15,13,0.24)')
        grad.addColorStop(1, 'rgba(19,15,13,0)')
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
        this.add.rectangle(W / 2, H / 2, W, H, C.fundo).setDepth(0)

        const grid = this.add.graphics().setDepth(1).setAlpha(0.12)
        grid.lineStyle(2, C.creme)
        for (let x = 0; x <= W; x += 72) grid.lineBetween(x, 0, x, H)
        for (let y = 0; y <= H; y += 72) grid.lineBetween(0, y, W, y)

        const midY = H / 2

        const card = this.add.graphics().setDepth(2)
        card.fillStyle(C.preto, A.sombra)
        card.fillRoundedRect(W / 2 - 340, midY - 130, 680, 280, 30)
        card.fillStyle(C.fundo, 1)
        card.fillRoundedRect(W / 2 - 340, midY - 142, 680, 280, 30)
        card.fillStyle(0xffffff, A.brilho)
        card.fillRoundedRect(W / 2 - 328, midY - 132, 656, 86, 22)
        card.lineStyle(5, C.ouro, 0.95)
        card.strokeRoundedRect(W / 2 - 340, midY - 142, 680, 280, 30)

        this.add.text(W / 2, midY - 86, 'Missão', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: CSS.creme,
            stroke: CSS.preto,
            strokeThickness: 8,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        this.add.text(W / 2, midY - 28, 'ARQUIVO SEGURO', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '48px',
            color: CSS.ouro,
            stroke: CSS.preto,
            strokeThickness: 9,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        this.add.text(W / 2, midY + 28, 'Preparando os arquivos...', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '21px',
            color: CSS.creme,
        }).setOrigin(0.5).setDepth(3).setResolution(2)

        const barW = 540
        const barX = W / 2 - barW / 2
        const barY = midY + 68

        const track = this.add.graphics().setDepth(3)
        track.fillStyle(C.preto, A.trilho)
        track.fillRoundedRect(barX, barY, barW, 32, 16)
        track.lineStyle(4, C.creme, 0.7)
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