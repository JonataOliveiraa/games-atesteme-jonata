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
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'


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
        createLoadingScreen(this, {
            title: 'Missão',
            subtitle: 'ARQUIVO SEGURO',
            description: 'Preparando os arquivos...',
            theme: {
                background: { kind: 'stripes', base: C.fundo, color: C.creme, angle: 'diagonal', alpha: 0.08 },
                card: C.fundo,
                cardShadow: C.preto,
                cardBorder: C.ouro,
                title: C.creme,
                subtitle: C.ouro,
                description: C.creme,
                titleStroke: C.preto,
                progressTrack: C.preto,
                progressBorder: C.creme,
                progressFill: C.ouro,
            },
        })
        ASSETS.forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        this.buildGlowTexture()
        this.buildSparkTexture()
        this.buildShadowTexture()

        this.scene.launch('UIScene')
        this.time.delayedCall(0, () => this.scene.start('GameScene', { level: 1, phase: 0 }))
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
}