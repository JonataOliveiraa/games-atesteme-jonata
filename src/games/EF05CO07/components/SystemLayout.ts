import Phaser from 'phaser'

import { ALPHA, C, STROKE } from '../data/theme'
import type { SystemLayout as SystemLayoutVariant } from '../types'

export interface SystemLayoutConfig {
    scene: Phaser.Scene
    x: number
    y: number
    layout: SystemLayoutVariant
    width?: number
    height?: number
}

/**
 * Miniatura de uma interface de sistema operacional construída pelo Phaser.
 *
 * O componente é apenas visual: seleção, foco e validação da resposta ficam
 * sob responsabilidade da cena que o utiliza.
 */
export class SystemLayout extends Phaser.GameObjects.Container {
    private readonly graphics: Phaser.GameObjects.Graphics
    private readonly previewWidth: number
    private readonly previewHeight: number

    constructor({
        scene,
        x,
        y,
        layout,
        width = 216,
        height = 176,
    }: SystemLayoutConfig) {
        super(scene, x, y)

        this.previewWidth = width
        this.previewHeight = height
        this.graphics = scene.add.graphics()

        this.add(this.graphics)
        this.drawFrame()
        this.draw(layout)
        scene.add.existing(this)
    }

    private drawFrame(): void {
        const { graphics, previewWidth: width, previewHeight: height } = this

        graphics.fillStyle(C.shadow, ALPHA.shadow)
        graphics.fillRoundedRect(-width / 2, -height / 2 + 5, width, height, 7)
        graphics.lineStyle(STROKE.glow, C.cyan, 0.08)
        graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 7)
        graphics.fillStyle(C.panelDeep, 1)
        graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 7)
        graphics.lineStyle(2, C.cyanDeep, 1)
        graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 7)
        graphics.lineStyle(1, C.borderSoft, 1)
        graphics.strokeRoundedRect(-width / 2 + 5, -height / 2 + 5, width - 10, height - 10, 4)
        graphics.fillStyle(C.cyan, 0.8)
        graphics.fillRect(-width / 2 + 12, -height / 2, 42, 3)
        graphics.fillStyle(C.violet, 0.72)
        graphics.fillRect(width / 2 - 42, height / 2 - 3, 30, 3)
    }

    private draw(layout: SystemLayoutVariant): void {
        switch (layout) {
            case 'menu-janelas':
                this.drawMenuAndWindows()
                break
            case 'barra-lateral':
                this.drawSidebar()
                break
            case 'dock-inferior':
                this.drawBottomDock()
                break
        }
    }

    private drawMenuAndWindows(): void {
        const graphics = this.graphics

        this.drawTopBar(C.cyan)

        graphics.fillStyle(C.elevated, 0.92)
        graphics.fillRoundedRect(-88, -48, 104, 76, 8)
        graphics.lineStyle(2, C.cyan, 0.8)
        graphics.strokeRoundedRect(-88, -48, 104, 76, 8)

        graphics.fillStyle(C.surface, 1)
        graphics.fillRoundedRect(-5, -20, 80, 62, 8)
        graphics.lineStyle(2, C.violet, 0.8)
        graphics.strokeRoundedRect(-5, -20, 80, 62, 8)

        graphics.fillStyle(C.cyan, 1)
        graphics.fillRoundedRect(-96, 58, 32, 18, 6)
        this.drawAppRow(-45, 58, 5, C.textMuted)
    }

    private drawSidebar(): void {
        const graphics = this.graphics

        graphics.fillStyle(C.violet, 0.2)
        graphics.fillRoundedRect(-100, -74, 36, 148, 8)
        this.drawAppColumn(-82, -50, 5)

        graphics.fillStyle(C.elevated, 1)
        graphics.fillRoundedRect(-52, -60, 140, 28, 7)
        graphics.fillStyle(C.surface, 1)
        graphics.fillRoundedRect(-52, -20, 140, 82, 8)
        graphics.lineStyle(2, C.violet, 0.85)
        graphics.strokeRoundedRect(-52, -20, 140, 82, 8)
        this.drawLines(-36, -2, 4, 96, C.textMuted)
    }

    private drawBottomDock(): void {
        const graphics = this.graphics

        this.drawTopBar(C.green)

        graphics.fillStyle(C.surface, 1)
        graphics.fillRoundedRect(-78, -46, 156, 88, 9)
        graphics.lineStyle(2, C.green, 0.8)
        graphics.strokeRoundedRect(-78, -46, 156, 88, 9)
        this.drawLines(-58, -22, 4, 116, C.textMuted)

        graphics.fillStyle(C.elevated, 1)
        graphics.fillRoundedRect(-76, 52, 152, 28, 12)
        graphics.lineStyle(1, C.green, 0.62)
        graphics.strokeRoundedRect(-76, 52, 152, 28, 12)
        this.drawAppRow(-57, 66, 6, C.cyan)
    }

    private drawTopBar(accent: number): void {
        const { graphics, previewWidth: width, previewHeight: height } = this

        graphics.fillStyle(C.elevated, 1)
        graphics.fillRoundedRect(-width / 2 + 8, -height / 2 + 8, width - 16, 22, 7)
        graphics.lineStyle(1, accent, 0.7)
        graphics.strokeRoundedRect(-width / 2 + 8, -height / 2 + 8, width - 16, 22, 7)
        graphics.fillStyle(accent, 1)
        graphics.fillCircle(-width / 2 + 22, -height / 2 + 19, 4)
        graphics.fillStyle(C.textMuted, 0.7)
        graphics.fillRoundedRect(-width / 2 + 34, -height / 2 + 16, 52, 6, 3)
    }

    private drawAppRow(startX: number, y: number, count: number, color: number): void {
        for (let index = 0; index < count; index += 1) {
            this.graphics.fillStyle(index % 2 ? C.violet : color, 0.92)
            this.graphics.fillRoundedRect(startX + index * 23, y - 7, 14, 14, 4)
        }
    }

    private drawAppColumn(x: number, startY: number, count: number): void {
        for (let index = 0; index < count; index += 1) {
            this.graphics.fillStyle(index % 2 ? C.cyan : C.violet, 0.94)
            this.graphics.fillRoundedRect(x - 7, startY + index * 24, 14, 14, 4)
        }
    }

    private drawLines(
        x: number,
        startY: number,
        count: number,
        maxWidth: number,
        color: number,
    ): void {
        for (let index = 0; index < count; index += 1) {
            this.graphics.fillStyle(color, 0.48)
            this.graphics.fillRoundedRect(x, startY + index * 15, maxWidth - index * 12, 6, 3)
        }
    }
}
