import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey, type Sheet } from '../data/files'
import { SHADOW } from '../data/layout'
import { C } from '../data/theme'

export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

/** o `size` do `fit` para a célula caber numa caixa w × h */
export function sizeIn(scene: Phaser.Scene, sheet: Sheet, index: number, w: number, h: number) {
    const frame = scene.textures.getFrame(sheet.key, cellKey(index))
    const long = Math.max(frame.width, frame.height)
    return Math.min((w * long) / frame.width, (h * long) / frame.height)
}

export function refit(image: Phaser.GameObjects.Image, index: number, size: number) {
    image.setFrame(cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

const RIM_STEPS = 16

/**
 * A célula com um contorno branco parado de `rim` px na tela (o controle principal), assada uma vez numa
 * textura própria. `size` e a origem valem para o desenho, sem o contorno, como no `fit`.
 */
export function fitRimmed(scene: Phaser.Scene, sheet: Sheet, index: number, size: number, rim: number, originY = 0.5) {
    const frame = scene.textures.getFrame(sheet.key, cellKey(index))
    const w = frame.cutWidth
    const h = frame.cutHeight
    const scale = size / Math.max(w, h)
    const pad = Math.ceil(rim / scale)
    const key = `${sheet.key}-rim${index}-${pad}`
    if (!scene.textures.exists(key)) {
        const source = frame.source.image as CanvasImageSource
        const silhouette = document.createElement('canvas')
        silhouette.width = w
        silhouette.height = h
        const sctx = silhouette.getContext('2d')
        const canvas = document.createElement('canvas')
        canvas.width = w + pad * 2
        canvas.height = h + pad * 2
        const ctx = canvas.getContext('2d')
        if (sctx && ctx) {
            sctx.drawImage(source, frame.cutX, frame.cutY, w, h, 0, 0, w, h)
            sctx.globalCompositeOperation = 'source-in'
            sctx.fillStyle = '#ffffff'
            sctx.fillRect(0, 0, w, h)
            for (let k = 0; k < RIM_STEPS; k++) {
                const a = (k / RIM_STEPS) * Math.PI * 2
                ctx.drawImage(silhouette, pad + Math.cos(a) * pad, pad + Math.sin(a) * pad)
            }
            ctx.drawImage(source, frame.cutX, frame.cutY, w, h, pad, pad, w, h)
        }
        scene.textures.addCanvas(key, canvas)
    }
    return scene.add
        .image(0, 0, key)
        .setScale(scale)
        .setOrigin(0.5, (pad + originY * h) / (h + pad * 2))
}

/** a sombra parada no chão: a mesma imagem chapada de escuro, um pouco abaixo e à direita */
export function shadowOf(scene: Phaser.Scene, image: Phaser.GameObjects.Image) {
    return scene.add
        .image(image.x + SHADOW.x, image.y + SHADOW.y, image.texture.key, image.frame.name)
        .setOrigin(image.originX, image.originY)
        .setScale(image.scaleX, image.scaleY)
        .setRotation(image.rotation)
        .setTintFill(C.shadow)
        .setAlpha(SHADOW.alpha)
}

type Pinnable = Phaser.GameObjects.GameObject & Partial<Phaser.GameObjects.Components.ScrollFactor>

export function pin<T extends Pinnable>(object: T): T {
    object.setScrollFactor?.(0, 0)
    if (object instanceof Phaser.GameObjects.Container) object.list.forEach(child => pin(child as Pinnable))
    return object
}

/** a UI fixa na tela some rápido quando a criança arrasta o pátio, e volta mais devagar quando ele para */
export function fade(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, alpha: number) {
    scene.tweens.killTweensOf(target)
    scene.tweens.add({ targets: target, alpha, duration: FX.ms(scene, alpha > 0 ? 240 : 150) })
}
