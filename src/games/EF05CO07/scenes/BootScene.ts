import Phaser from 'phaser'

import bgCentralUrl from '../../../assets/games/EF05CO07/bg-central.png'
import bgSistemasUrl from '../../../assets/games/EF05CO07/bg-sistemas.png'
import iconeAppUrl from '../../../assets/games/EF05CO07/icone-app.png'

import programaEditorUrl from '../../../assets/games/EF05CO07/programa-editor.png'
import programaFotosUrl from '../../../assets/games/EF05CO07/programa-fotos.png'
import programaImpressaoUrl from '../../../assets/games/EF05CO07/programa-impressao.png'
import programaJogoUrl from '../../../assets/games/EF05CO07/programa-jogo.png'
import programaNavegadorUrl from '../../../assets/games/EF05CO07/programa-navegador.png'
import programaPlayerUrl from '../../../assets/games/EF05CO07/programa-player.png'

import recursoArquivosUrl from '../../../assets/games/EF05CO07/recurso-arquivos.png'
import recursoImpressoraUrl from '../../../assets/games/EF05CO07/recurso-impressora.png'
import recursoMemoriaUrl from '../../../assets/games/EF05CO07/recurso-memoria.png'
import recursoMonitorUrl from '../../../assets/games/EF05CO07/recurso-monitor.png'
import recursoMouseUrl from '../../../assets/games/EF05CO07/recurso-mouse.png'
import recursoTecladoUrl from '../../../assets/games/EF05CO07/recurso-teclado.png'

import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

type AssetEntry = readonly [key: string, url: string]

/**
 * As chaves deste catálogo são as mesmas usadas em programs.ts,
 * resources.ts e levels.ts.
 */
const ASSETS = [
    ['icone-app', iconeAppUrl],
    ['bg-central', bgCentralUrl],
    ['bg-sistemas', bgSistemasUrl],

    ['programa-navegador', programaNavegadorUrl],
    ['programa-editor', programaEditorUrl],
    ['programa-jogo', programaJogoUrl],
    ['programa-player', programaPlayerUrl],
    ['programa-fotos', programaFotosUrl],
    ['programa-impressao', programaImpressaoUrl],

    ['recurso-memoria', recursoMemoriaUrl],
    ['recurso-arquivos', recursoArquivosUrl],
    ['recurso-teclado', recursoTecladoUrl],
    ['recurso-mouse', recursoMouseUrl],
    ['recurso-monitor', recursoMonitorUrl],
    ['recurso-impressora', recursoImpressoraUrl],
] as const satisfies readonly AssetEntry[]

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload(): void {
        createLoadingScreen(this, {
            title: 'Controlador do Sistema',
            subtitle: 'CENTRAL DE CONTROLE',
            description: 'Ligando os sistemas...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.background,
                    color: C.cyan,
                    angle: 'diagonal',
                    alpha: 0.06,
                },
                card: C.surface,
                cardShadow: C.shadow,
                cardBorder: C.border,
                title: C.text,
                subtitle: C.cyan,
                description: C.textMuted,
                titleStroke: C.shadow,
                progressTrack: C.background,
                progressBorder: C.border,
                progressFill: C.cyan,
            },
        })

        ASSETS.forEach(([key, url]) => this.load.image(key, url))
    }

    create(): void {
        this.buildGlowTexture()
        this.buildShadowTexture()
        this.buildParticleTexture()

        this.scene.launch('UIScene')
        this.time.delayedCall(0, () => {
            this.scene.start('GameScene', {
                level: 1,
                phase: 0,
                score: 0,
            })
        })
    }

    /** Brilho suave usado em seleção, acerto e conexão entre elementos. */
    private buildGlowTexture(): void {
        const key = 'fx-brilho'
        if (this.textures.exists(key)) return

        const size = 256
        const texture = this.textures.createCanvas(key, size, size)
        if (!texture) return

        const context = texture.getContext()
        const gradient = context.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2,
        )

        gradient.addColorStop(0, 'rgba(34, 211, 238, 0.92)')
        gradient.addColorStop(0.42, 'rgba(34, 211, 238, 0.30)')
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)')

        context.fillStyle = gradient
        context.fillRect(0, 0, size, size)
        texture.refresh()
    }

    /** Sombra elíptica leve para cards e ilustrações flutuantes. */
    private buildShadowTexture(): void {
        const key = 'fx-sombra'
        if (this.textures.exists(key)) return

        const width = 192
        const height = 96
        const texture = this.textures.createCanvas(key, width, height)
        if (!texture) return

        const context = texture.getContext()
        const gradient = context.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            width / 2,
        )

        gradient.addColorStop(0, 'rgba(2, 6, 23, 0.58)')
        gradient.addColorStop(0.62, 'rgba(2, 6, 23, 0.22)')
        gradient.addColorStop(1, 'rgba(2, 6, 23, 0)')

        context.save()
        context.translate(width / 2, height / 2)
        context.scale(1, 0.5)
        context.translate(-width / 2, -height / 2)
        context.fillStyle = gradient
        context.fillRect(0, 0, width, height)
        context.restore()
        texture.refresh()
    }

    /** Partícula simples para pulsos de confirmação e transições. */
    private buildParticleTexture(): void {
        const key = 'fx-particula'
        if (this.textures.exists(key)) return

        const graphics = this.make.graphics({ x: 0, y: 0 }, false)
        graphics.fillStyle(C.text, 1)
        graphics.fillCircle(16, 16, 7)
        graphics.fillStyle(C.cyan, 0.38)
        graphics.fillCircle(16, 16, 14)
        graphics.generateTexture(key, 32, 32)
        graphics.destroy()
    }
}
