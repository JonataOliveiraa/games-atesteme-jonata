import Phaser from 'phaser'

let serial = 0

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

export function paintImage(
    scene: Phaser.Scene,
    w: number,
    h: number,
    paint: (g: Phaser.GameObjects.Graphics) => void,
): Phaser.GameObjects.Image {
    const key = baked(scene, `cdb-paint-${++serial}`, w, h, paint)
    const image = scene.add.image(0, 0, key)
    image.once(Phaser.GameObjects.Events.DESTROY, () => {
        if (scene.textures.exists(key)) scene.textures.remove(key)
    })
    return image
}

export function dashedRoundRect(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    dash = 14,
    gap = 9,
) {
    const path: Phaser.Math.Vector2[] = []
    const arc = (cx: number, cy: number, a0: number) => {
        for (let k = 0; k <= 6; k++) {
            const a = a0 + (k / 6) * (Math.PI / 2)
            path.push(new Phaser.Math.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r))
        }
    }
    arc(x + w - r, y + r, -Math.PI / 2)
    arc(x + w - r, y + h - r, 0)
    arc(x + r, y + h - r, Math.PI / 2)
    arc(x + r, y + r, Math.PI)
    path.push(path[0].clone())
    let draw = true
    let left = dash
    for (let i = 0; i < path.length - 1; i++) {
        let a = path[i].clone()
        const b = path[i + 1]
        let seg = a.distance(b)
        while (seg > 0) {
            const step = Math.min(left, seg)
            const t = step / a.distance(b)
            const m = new Phaser.Math.Vector2(Phaser.Math.Linear(a.x, b.x, t), Phaser.Math.Linear(a.y, b.y, t))
            if (draw) g.lineBetween(a.x, a.y, m.x, m.y)
            a = m
            seg -= step
            left -= step
            if (left <= 0) {
                draw = !draw
                left = draw ? dash : gap
            }
        }
    }
}
