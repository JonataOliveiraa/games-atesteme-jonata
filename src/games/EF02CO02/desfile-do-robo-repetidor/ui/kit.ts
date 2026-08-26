import Phaser from "phaser"

export const W = 1280
export const H = 720

/** Paleta de desfile: fundo profundo, painéis de papel quente, acentos festivos. */
export const C = {
    deep: 0x152744,
    deepSoft: 0x24406b,

    header: 0x4536a0,
    headerDeep: 0x2e2472,
    headerGlow: 0x6a55d6,

    paper: 0xfffaf0,
    paperEdge: 0xf7e3c3,
    paperShade: 0xe6cba0,

    ink: 0x1d3557,
    inkSoft: 0x5b7899,

    sky: 0x3fa9f5, skyDeep: 0x1a6fb0,
    mint: 0x4ecb8a, mintDeep: 0x2b9463,
    sun: 0xffc94d, sunDeep: 0xd99a1e,
    coral: 0xff7a6b, coralDeep: 0xd9503f,
    grape: 0xa87bf5, grapeDeep: 0x7a4fd0,

    white: 0xffffff,
    shadow: 0x0a1626,
}

export const hex = (n: number) => "#" + n.toString(16).padStart(6, "0")

type Weight = "black" | "bold"

export function label(
    scene: Phaser.Scene, x: number, y: number, text: string,
    { size = 20, color = C.ink, weight = "black" as Weight, wrap = 0, align = "center" as const } = {},
) {
    return scene.add.text(x, y, text, {
        fontFamily: weight === "black" ? "'DynaPuff Black', 'Arial Black', Arial, sans-serif" : "DynaPuff, Arial, sans-serif",
        fontStyle: weight === "bold" ? "bold" : undefined,
        fontSize: `${size}px`,
        color: hex(color),
        align,
        wordWrap: wrap ? { width: wrap, useAdvancedWrap: true } : undefined,
        lineSpacing: 4,
    }).setOrigin(0.5).setResolution(2)
}

/** Cartão de papel com moldura quente. Base de todos os painéis. */
export function paperCard(
    scene: Phaser.Scene, cx: number, cy: number, w: number, h: number,
    { radius = 28, fill = C.paper, edge = C.paperEdge } = {},
) {
    const g = scene.add.graphics()
    const x = cx - w / 2, y = cy - h / 2
    for (const [dy, a, grow] of [[20, 0.14, 8], [10, 0.16, 3]] as const) {
        g.fillStyle(C.shadow, a)
        g.fillRoundedRect(x - grow, y + dy, w + grow * 2, h, radius + grow)
    }
    g.fillStyle(edge, 1); g.fillRoundedRect(x, y, w, h, radius)
    g.fillStyle(fill, 1); g.fillRoundedRect(x + 6, y + 6, w - 12, h - 14, radius - 5)
    return g
}

/** Faixa colorida no topo de um cartão. A altura precisa ser ≥ o raio. */
export function headerBand(
    scene: Phaser.Scene, cx: number, topY: number, w: number, h: number,
    tint: number, deep: number, radius = 23,
) {
    const g = scene.add.graphics()
    const x = cx - w / 2
    g.fillStyle(deep, 1)
    g.fillRoundedRect(x, topY, w, h, { tl: radius, tr: radius, bl: 0, br: 0 })
    g.fillStyle(tint, 1)
    g.fillRoundedRect(x + 4, topY + 4, w - 8, h - 4, { tl: radius - 3, tr: radius - 3, bl: 0, br: 0 })
    g.fillStyle(C.white, 0.24)
    g.fillRoundedRect(x + 18, topY + 9, w - 36, h * 0.3, 10)
    return g
}

export interface Btn {
    root: Phaser.GameObjects.Container
    setEnabled: (on: boolean) => void
}

/** Botão com espessura real: a face afunda sobre a base escura. */
export function chunkyButton(
    scene: Phaser.Scene, x: number, y: number, w: number, h: number, text: string,
    tone: number, deep: number, onTap: () => void,
    { size = 22, textColor = C.white, labelX = 0, wrap = 0 }: {
        size?: number; textColor?: number; labelX?: number; wrap?: number
    } = {},
): Btn {
    const drop = 7
    const r = Math.min(22, h / 2)
    const root = scene.add.container(x, y)
    const g = scene.add.graphics()
    const txt = label(scene, labelX, -drop / 2, text, { size, color: textColor, wrap })

    let enabled = true
    let pressed = false

    const paint = () => {
        g.clear()
        const a = enabled ? 1 : 0.38
        const dy = pressed ? drop : 0
        g.fillStyle(deep, a); g.fillRoundedRect(-w / 2, -h / 2, w, h + drop, r)
        g.fillStyle(tone, a); g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, r)
        g.fillStyle(C.white, 0.26 * a)
        g.fillRoundedRect(-w / 2 + 12, -h / 2 + dy + 8, w - 24, h * 0.3, r - 6)
        txt.setY(-drop / 2 + dy)
    }
    paint()

    const hit = scene.add.zone(0, drop / 2, w, h + drop).setInteractive({ useHandCursor: true })
    hit.on("pointerdown", () => { if (enabled) { pressed = true; paint() } })
    hit.on("pointerout", () => { if (pressed) { pressed = false; paint() } })
    hit.on("pointerup", () => {
        if (!enabled || !pressed) return
        pressed = false; paint(); onTap()
    })

    root.add([g, txt, hit])
    return { root, setEnabled: (on) => { enabled = on; paint() } }
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
    hit.on("pointerover", () => scene.tweens.add({ targets: root, scale: 1.1, duration: 120 }))
    hit.on("pointerout", () => scene.tweens.add({ targets: root, scale: 1, duration: 120 }))
    hit.on("pointerdown", () => {
        scene.tweens.add({ targets: root, scale: 0.9, duration: 70, yoyo: true })
        onTap()
    })
    root.add([g, hit])
    return root
}

/** Balão que sobe e some. Substitui os toasts de barra inteira. */
export function floatingNote(
    scene: Phaser.Scene, x: number, y: number, text: string,
    { tone = C.mint, deep = C.mintDeep, depth = 900 } = {},
) {
    const root = scene.add.container(x, y).setDepth(depth)
    const t = label(scene, 0, 0, text, { size: 21, color: C.white, wrap: 620 })
    const w = t.width + 52, h = t.height + 28

    const g = scene.add.graphics()
    g.fillStyle(deep, 1); g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, h / 2)
    g.fillStyle(tone, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.fillStyle(C.white, 0.26); g.fillRoundedRect(-w / 2 + 12, -h / 2 + 6, w - 24, h * 0.3, h / 4)

    root.add([g, t])
    root.setScale(0.7).setAlpha(0)
    scene.tweens.add({ targets: root, scale: 1, alpha: 1, duration: 220, ease: "Back.easeOut" })
    scene.tweens.add({
        targets: root, y: y - 58, alpha: 0, delay: 1400, duration: 480, ease: "Sine.easeIn",
        onComplete: () => root.destroy(),
    })
    return root
}

export function confetti(scene: Phaser.Scene, count = 60) {
    const colors = [C.sun, C.mint, C.coral, C.sky, C.grape]
    for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(0, W)
        const piece = scene.add.rectangle(
            x, -30, Phaser.Math.Between(8, 16), Phaser.Math.Between(12, 22),
            Phaser.Utils.Array.GetRandom(colors),
        ).setDepth(940).setAngle(Phaser.Math.Between(0, 360))

        scene.tweens.add({
            targets: piece, angle: piece.angle + Phaser.Math.Between(360, 900),
            scaleX: { from: 1, to: -1 }, duration: Phaser.Math.Between(600, 1100),
            repeat: -1, yoyo: true,
        })
        scene.tweens.add({
            targets: piece, y: H + 40, x: x + Phaser.Math.Between(-140, 140),
            duration: Phaser.Math.Between(1800, 2800), delay: Phaser.Math.Between(0, 700),
            ease: "Quad.easeIn", onComplete: () => piece.destroy(),
        })
    }
}