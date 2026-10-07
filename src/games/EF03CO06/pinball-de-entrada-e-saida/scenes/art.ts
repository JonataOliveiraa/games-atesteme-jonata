import Phaser from 'phaser'
import { CONTENT_CELL, DEVICES_SHEET, DEVICE_CELL, KID_SHEET, PIECES_SHEET, POSE_CELL, cellKey, type Sheet } from '../data/files'
import { C, CSS, FONT } from '../data/theme'
import type { ContentId, DeviceId, PoseId } from '../types'

const refOf = (scene: Phaser.Scene, sheet: Sheet) =>
    (scene.textures.get(sheet.key).customData as { ref?: number }).ref ?? sheet.cellH

/** Figura em pé: origem no pé, escala comum à folha. */
export function figure(scene: Phaser.Scene, sheet: Sheet, index: number, height: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index)).setOrigin(0.5, 1)
    return image.setScale(height / refOf(scene, sheet))
}

/** Peça solta: origem no centro, cabe num quadrado de `size`. */
export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export const deviceImage = (scene: Phaser.Scene, id: DeviceId, size: number) => fit(scene, DEVICES_SHEET, DEVICE_CELL[id], size)
export const pieceImage = (scene: Phaser.Scene, index: number, size: number) => fit(scene, PIECES_SHEET, index, size)
export const kidImage = (scene: Phaser.Scene, pose: PoseId, height: number) => figure(scene, KID_SHEET, POSE_CELL[pose], height)
export const setKidPose = (image: Phaser.GameObjects.Image, pose: PoseId) => image.setFrame(cellKey(POSE_CELL[pose]))

const WRITTEN: Partial<Record<ContentId, string>> = { letters: 'A B C', name: 'LILY' }

/** O conteúdo que a bola carrega (ícone da folha; letras e nome escritos por cima). */
export function contentView(scene: Phaser.Scene, id: ContentId, size: number) {
    const parts: Phaser.GameObjects.GameObject[] = [fit(scene, PIECES_SHEET, CONTENT_CELL[id], size)]
    const text = WRITTEN[id]
    if (text)
        parts.push(
            scene.add
                .text(0, id === 'name' ? size * 0.12 : 0, text, {
                    fontFamily: FONT.black,
                    fontSize: `${Math.round(size * (id === 'name' ? 0.22 : 0.25))}px`,
                    color: id === 'name' ? CSS.ink : CSS.process,
                })
                .setOrigin(0.5)
                .setResolution(2),
        )
    return scene.add.container(0, 0, parts)
}

/** Selo vazio, cinza, com "?": a informação que não entrou. */
export function emptyView(scene: Phaser.Scene, size: number) {
    const g = scene.add.graphics()
    g.fillStyle(C.asleep, 1)
    g.fillCircle(0, 0, size * 0.42)
    const q = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${Math.round(size * 0.5)}px`, color: CSS.inkSoft })
        .setOrigin(0.5)
        .setResolution(2)
    return scene.add.container(0, 0, [g, q])
}
