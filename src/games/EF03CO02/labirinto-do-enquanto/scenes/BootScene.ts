import Phaser from 'phaser'
import { C } from '../data/theme'

import bgOficinaUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/bg-oficina.png'
import bgCampoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/bg-campo.png'

import robotUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/robot.png'

import badgeVerdadeiroUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/badge-verdadeiro.png'
import badgeFalsoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/badge-falso.png'
import badgeBatidaUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/badge-batida.png'

import tilePisoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/tile-piso.png'
import tileParedeUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/tile-parede.png'
import tileObjetivoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/tile-objetivo.png'
import tilePartidaUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/tile-partida.png'
import tileOcultoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/tile-oculto.png'

import chipCondicaoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/chip-condicao.png'
import cardAcaoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/card-acao.png'

import iconAvancarUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/icon-avancar.png'
import iconVirarDirUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/icon-virar-dir.png'
import iconVirarEsqUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/icon-virar-esq.png'

import iconCondCaminhoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/icon-cond-caminho.png'
import iconCondObjetivoUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/icon-cond-objetivo.png'
import iconCondPassosUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/icon-cond-passos.png'

import marcaRastroUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/marca-rastro.png'
import marcaPalpiteUrl from '../../../../assets/games/EF03CO02/labirinto-do-enquanto/marca-palpite.png'

const ASSETS: Array<[string, string]> = [
    ['bg-oficina', bgOficinaUrl],
    ['bg-campo', bgCampoUrl],
    ['robot', robotUrl],
    ['badge-verdadeiro', badgeVerdadeiroUrl],
    ['badge-falso', badgeFalsoUrl],
    ['badge-batida', badgeBatidaUrl],
    ['tile-piso', tilePisoUrl],
    ['tile-parede', tileParedeUrl],
    ['tile-objetivo', tileObjetivoUrl],
    ['tile-partida', tilePartidaUrl],
    ['tile-oculto', tileOcultoUrl],
    ['chip-condicao', chipCondicaoUrl],
    ['card-acao', cardAcaoUrl],
    ['icon-avancar', iconAvancarUrl],
    ['icon-virar-dir', iconVirarDirUrl],
    ['icon-virar-esq', iconVirarEsqUrl],
    ['icon-cond-caminho', iconCondCaminhoUrl],
    ['icon-cond-objetivo', iconCondObjetivoUrl],
    ['icon-cond-passos', iconCondPassosUrl],
    ['marca-rastro', marcaRastroUrl],
    ['marca-palpite', marcaPalpiteUrl],
]

/** Medidas do halo gerado por código, no lugar do fx-brilho. */
export const GLOW = { size: 256 }

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

        this.scene.launch('UIScene')
        this.scene.start('GameScene', { level: 1 })
    }

    /**
     * fx-brilho: halo radial branco, gerado por código.
     * É tingido em verde, vermelho ou amarelo pelas cenas conforme o estado.
     */
    private buildGlowTexture() {
        if (this.textures.exists('fx-brilho')) return

        const s = GLOW.size
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

    /** fx-faisca: partícula quadrada de cantos macios, também gerada aqui. */
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
        this.add.rectangle(640, 360, 1280, 720, C.borda).setDepth(0)

        const grid = this.add.graphics().setDepth(1).setAlpha(0.16)
        grid.lineStyle(1, C.claro)
        for (let x = 0; x <= 1280; x += 96) grid.lineBetween(x, 0, x, 720)
        for (let y = 0; y <= 720; y += 96) grid.lineBetween(0, y, 1280, y)

        this.add.text(640, 292, 'Labirinto do Enquanto', {
            fontSize: '52px',
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
            color: '#f3e7d3',
            stroke: '#2d2319',
            strokeThickness: 7,
            align: 'center',
        }).setOrigin(0.5).setDepth(2).setResolution(2)

        this.add.text(640, 366, 'Ligando o robô...', {
            fontSize: '26px',
            fontFamily: 'DynaPuff, Arial, sans-serif',
            color: '#dda21c',
        }).setOrigin(0.5).setDepth(2).setResolution(2)

        const barW = 560
        const track = this.add.graphics().setDepth(2)
        track.fillStyle(C.escuro, 1)
        track.fillRoundedRect(640 - barW / 2, 442, barW, 26, 13)
        track.lineStyle(3, C.claro, 0.8)
        track.strokeRoundedRect(640 - barW / 2, 442, barW, 26, 13)

        const fill = this.add.graphics().setDepth(3)
        this.load.on('progress', (v: number) => {
            fill.clear()
            fill.fillStyle(C.amarelo, 1)
            fill.fillRoundedRect(640 - barW / 2 + 4, 446, Math.max(8, (barW - 8) * v), 18, 9)
        })
    }
}