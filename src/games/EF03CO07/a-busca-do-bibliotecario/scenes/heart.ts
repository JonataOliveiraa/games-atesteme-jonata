import Phaser from 'phaser'

export function paintHeart(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    color: number,
) {
    const r = size * 0.27
    g.fillStyle(color, 1)
    g.fillCircle(x - r, y - r * 0.35, r)
    g.fillCircle(x + r, y - r * 0.35, r)
    g.fillTriangle(x - r * 1.93, y + r * 0.05, x + r * 1.93, y + r * 0.05, x, y + r * 2.05)
}
