import Phaser from 'phaser'

export const W = 1280
export const H = 720

/** Paleta calma: papel quente, azul de confiança, verde e coral para os estados. */
export const C = {
    deep: 0x14263d,
    deepSoft: 0x22405f,

    header: 0x2f5f92,
    headerDeep: 0x1d3f68,
    headerGlow: 0x4d86bd,

    paper: 0xfffaf2,
    paperEdge: 0xf3e4cd,
    paperShade: 0xe1cbaa,

    ink: 0x1b3a52,
    inkSoft: 0x5d7d94,

    sky: 0x46a9e8, skyDeep: 0x1c6fa8,
    mint: 0x4ec98a, mintDeep: 0x2c9a63,
    coral: 0xf4736a, coralDeep: 0xcf4a40,
    sun: 0xffc655, sunDeep: 0xd99a1e,
    slate: 0x8aa4b8, slateDeep: 0x5d7d94,

    white: 0xffffff,
    shadow: 0x081522,
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')

type Weight = 'black' | 'bold'

export function label(
    scene: Phaser.Scene, x: number, y: number, text: string,
    { size = 20, color = C.ink, weight = 'black' as Weight, wrap = 0, align = 'center' as const } = {},
) {
    return scene.add.text(x, y, text, {
        fontFamily: weight === 'black' ? '"DynaPuff Black", "Arial Black", Arial, sans-serif' : 'DynaPuff, Arial, sans-serif',
        fontStyle: weight === 'bold' ? 'bold' : undefined,
        fontSize: `${size}px`,
        color: hex(color),
        align,
        wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined,
        lineSpacing: 3,
    }).setOrigin(0.5).setResolution(2)
}

export function paperCard(
    scene: Phaser.Scene, cx: number, cy: number, w: number, h: number,
    { radius = 26, fill = C.paper, edge = C.paperEdge } = {},
) {
    const g = scene.add.graphics()
    const x = cx - w / 2, y = cy - h / 2
    for (const [dy, a, grow] of [[18, 0.13, 7], [9, 0.15, 3]] as const) {
        g.fillStyle(C.shadow, a)
        g.fillRoundedRect(x - grow, y + dy, w + grow * 2, h, radius + grow)
    }
    g.fillStyle(edge, 1); g.fillRoundedRect(x, y, w, h, radius)
    g.fillStyle(fill, 1); g.fillRoundedRect(x + 6, y + 6, w - 12, h - 14, radius - 5)
    return g
}

/** Faixa colorida no topo de um cartão. Altura precisa ser ≥ o raio do canto. */
export function headerBand(
    scene: Phaser.Scene, cx: number, topY: number, w: number, h: number,
    tint: number, deep: number, radius = 21,
) {
    const g = scene.add.graphics()
    const x = cx - w / 2
    g.fillStyle(deep, 1)
    g.fillRoundedRect(x, topY, w, h, { tl: radius, tr: radius, bl: 0, br: 0 })
    g.fillStyle(tint, 1)
    g.fillRoundedRect(x + 4, topY + 4, w - 8, h - 4, { tl: radius - 3, tr: radius - 3, bl: 0, br: 0 })
    g.fillStyle(C.white, 0.24)
    g.fillRoundedRect(x + 18, topY + 8, w - 36, h * 0.3, 10)
    return g
}

export interface Btn {
    root: Phaser.GameObjects.Container
    setEnabled: (on: boolean) => void
    setLabel: (s: string) => void
}

export function chunkyButton(
    scene: Phaser.Scene, x: number, y: number, w: number, h: number, text: string,
    tone: number, deep: number, onTap: () => void,
    { size = 22, textColor = C.white, wrap = 0 } = {},
): Btn {
    const drop = 7
    const r = Math.min(22, h / 2)
    const root = scene.add.container(x, y)
    const g = scene.add.graphics()
    const txt = label(scene, 0, -drop / 2, text, { size, color: textColor, wrap })

    let enabled = true
    let pressed = false

    const paint = () => {
        g.clear()
        const a = enabled ? 1 : 0.4
        const dy = pressed ? drop : 0
        g.fillStyle(deep, a); g.fillRoundedRect(-w / 2, -h / 2, w, h + drop, r)
        g.fillStyle(tone, a); g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, r)
        g.fillStyle(C.white, 0.26 * a)
        g.fillRoundedRect(-w / 2 + 12, -h / 2 + dy + 8, w - 24, h * 0.3, r - 6)
        txt.setY(-drop / 2 + dy)
    }
    paint()

    const hit = scene.add.zone(0, drop / 2, w, h + drop).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', () => { if (enabled) { pressed = true; paint() } })
    hit.on('pointerout', () => { if (pressed) { pressed = false; paint() } })
    hit.on('pointerup', () => {
        if (!enabled || !pressed) return
        pressed = false; paint(); onTap()
    })

    root.add([g, txt, hit])
    return {
        root,
        setEnabled: (on) => { enabled = on; paint() },
        setLabel: (s) => txt.setText(s),
    }
}

export function circleButton(
    scene: Phaser.Scene, x: number, y: number, r: number,
    tone: number, deep: number, onTap: () => void,
) {
    const root = scene.add.container(x, y)
    const g = scene.add.graphics()
    g.fillStyle(deep, 1); g.fillCircle(0, 5, r)
    g.fillStyle(tone, 1); g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.28); g.fillEllipse(0, -r * 0.35, r * 1.2, r * 0.5)

    const hit = scene.add.zone(0, 0, r * 2 + 14, r * 2 + 14).setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => scene.tweens.add({ targets: root, scale: 1.1, duration: 120 }))
    hit.on('pointerout', () => scene.tweens.add({ targets: root, scale: 1, duration: 120 }))
    hit.on('pointerdown', () => {
        scene.tweens.add({ targets: root, scale: 0.9, duration: 70, yoyo: true })
        onTap()
    })
    root.add([g, hit])
    return root
}

export function floatingNote(
    scene: Phaser.Scene, x: number, y: number, text: string,
    { tone = C.mint, deep = C.mintDeep, depth = 900 } = {},
) {
    const root = scene.add.container(x, y).setDepth(depth)
    const t = label(scene, 0, 0, text, { size: 21, color: C.white, wrap: 640 })
    const w = t.width + 52, h = t.height + 28

    const g = scene.add.graphics()
    g.fillStyle(deep, 1); g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, h / 2)
    g.fillStyle(tone, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(C.white, 0.26); g.fillRoundedRect(-w / 2 + 12, -h / 2 + 6, w - 24, h * 0.3, h / 4)

    root.add([g, t])
    root.setScale(0.7).setAlpha(0)
    scene.tweens.add({ targets: root, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' })
    scene.tweens.add({
        targets: root, y: y - 56, alpha: 0, delay: 1500, duration: 460, ease: 'Sine.easeIn',
        onComplete: () => root.destroy(),
    })
    return root
}

export function confetti(scene: Phaser.Scene, count = 56) {
    const colors = [C.sun, C.mint, C.coral, C.sky]
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(0, W)
        const piece = scene.add.rectangle(
            x, -30, Phaser.Math.Between(8, 15), Phaser.Math.Between(12, 20),
            Phaser.Utils.Array.GetRandom(colors),
        ).setDepth(940).setAngle(Phaser.Math.Between(0, 360))
        scene.tweens.add({
            targets: piece, angle: piece.angle + Phaser.Math.Between(360, 800),
            scaleX: { from: 1, to: -1 }, duration: Phaser.Math.Between(600, 1100),
            repeat: -1, yoyo: true,
        })
        scene.tweens.add({
            targets: piece, y: H + 40, x: x + Phaser.Math.Between(-130, 130),
            duration: Phaser.Math.Between(1800, 2700), delay: Phaser.Math.Between(0, 700),
            ease: 'Quad.easeIn', onComplete: () => piece.destroy(),
        })
    }
}