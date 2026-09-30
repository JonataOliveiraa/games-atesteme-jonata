import Phaser from 'phaser'
import { H, W } from '../data/layout'

export function bake(scene: Phaser.Scene, key: string, draw: (g: Phaser.GameObjects.Graphics) => void): Phaser.GameObjects.Image {
    if (scene.textures.exists(key)) scene.textures.remove(key)
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    draw(g)
    g.generateTexture(key, W, H)
    g.destroy()
    return scene.add.image(0, 0, key).setOrigin(0)
}

export function unbake(scene: Phaser.Scene, image: Phaser.GameObjects.Image) {
    const key = image.texture.key
    image.destroy()
    if (scene.textures.exists(key)) scene.textures.remove(key)
}
