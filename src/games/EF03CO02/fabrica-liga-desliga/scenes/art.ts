import Phaser from 'phaser'
import { PIECE_FRAME, PIECES_SHEET, frameKey, type PieceName } from '../data/files'
import type { IconId } from '../types'

export const ICON: Record<IconId, PieceName> = {
    flame: 'iconFlame',
    belt: 'iconBelt',
    tray: 'iconTray',
    whistle: 'iconWhistle',
}

export function piece(scene: Phaser.Scene, name: PieceName, size: number) {
    const [, , w, h] = PIECE_FRAME[name]
    return scene.add.image(0, 0, PIECES_SHEET, frameKey(name)).setScale(size / Math.max(w, h))
}

export function setPiece(image: Phaser.GameObjects.Image, name: PieceName, size: number) {
    const [, , w, h] = PIECE_FRAME[name]
    return image.setFrame(frameKey(name)).setScale(size / Math.max(w, h))
}
