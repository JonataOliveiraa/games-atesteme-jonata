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
import { faseInicial } from '../../../../shared/level/faseInicial'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { preloadLives } from '../../../../shared/hud/createLives'

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
        createLoadingScreen(this, {
            title: 'Labirinto do Enquanto',
            subtitle: 'Enquanto...',
            description: 'Ligando o robô...',
            theme: {
                background: { kind: 'grid', base: C.borda, color: C.claro, alpha: 0.16, size: 96, width: 1 },
                card: C.escuro,
                cardShadow: 0x000000,
                cardHighlight: 0xffffff,
                cardBorder: C.claro,
                title: C.creme,
                subtitle: C.amarelo,
                description: C.creme,
                titleStroke: C.borda,
                progressTrack: C.borda,
                progressBorder: C.claro,
                progressFill: C.amarelo,
                progressHighlight: 0xffffff,
            },
        })
        ASSETS.forEach(([key, url]) => this.load.image(key, url))
        preloadLives(this)
    }

    create() {
        this.buildGlowTexture()
        this.buildSparkTexture()

        this.scene.launch('UIScene')
        this.scene.start('GameScene', { level: faseInicial(this, 1) })
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
}