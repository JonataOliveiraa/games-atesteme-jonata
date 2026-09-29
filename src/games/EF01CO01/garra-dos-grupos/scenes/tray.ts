import Phaser from 'phaser'
import { ITEMS, TRAY_TEX } from '../data/files'
import { DEPTH, ITEM, TRAY } from '../data/layout'
import { A, C, PAINT } from '../data/theme'
import { SIZE_SCALE } from '../data/items'
import type { ItemDef, Piece, Size, Spot } from '../types'

export interface ItemView {
    readonly def: ItemDef
    readonly size: Size
    readonly container: Phaser.GameObjects.Container
    setGlow(on: boolean): void
    destroy(): void
}

export interface TrayView {
    readonly container: Phaser.GameObjects.Container
    setItems(pieces: Piece[]): void
    update(dtMs: number, spinMs: number): void
    setSpinning(on: boolean): void
    reachable(): Spot[]
    outside(): Spot[]
    view(index: number): ItemView | undefined
    take(index: number): ItemView | undefined
    putBack(index: number, view: ItemView): Promise<void>
    setGlow(ids: string[]): void
    setHop(on: boolean): void
    clear(): void
    destroy(): void
}

const TAU = Math.PI * 2

function paintFallback(g: Phaser.GameObjects.Graphics, def: ItemDef) {
    const fill = PAINT[def.color]
    g.lineStyle(5, C.ink, 1)
    g.fillStyle(fill, 1)
    const both = (draw: () => void, stroke: () => void) => {
        draw()
        stroke()
    }
    switch (def.kind) {
        case 'circle':
            both(() => g.fillCircle(0, 0, 46), () => g.strokeCircle(0, 0, 46))
            break
        case 'square':
            both(() => g.fillRoundedRect(-44, -44, 88, 88, 14), () => g.strokeRoundedRect(-44, -44, 88, 88, 14))
            break
        case 'triangle':
            both(() => g.fillTriangle(0, -50, 50, 40, -50, 40), () => g.strokeTriangle(0, -50, 50, 40, -50, 40))
            break
        case 'cherry':
            g.lineStyle(5, C.ink, 1)
            g.lineBetween(-18, 10, 4, -44)
            g.lineBetween(20, 10, 4, -44)
            both(() => g.fillCircle(-20, 18, 24), () => g.strokeCircle(-20, 18, 24))
            both(() => g.fillCircle(22, 18, 24), () => g.strokeCircle(22, 18, 24))
            break
        case 'banana':
            g.lineStyle(34, C.ink, 1)
            g.beginPath()
            g.arc(0, -36, 58, Math.PI * 0.2, Math.PI * 0.8)
            g.strokePath()
            g.lineStyle(24, fill, 1)
            g.beginPath()
            g.arc(0, -36, 58, Math.PI * 0.22, Math.PI * 0.78)
            g.strokePath()
            break
        case 'pear':
            both(() => g.fillCircle(0, 16, 40), () => g.strokeCircle(0, 16, 40))
            both(() => g.fillCircle(0, -24, 26), () => g.strokeCircle(0, -24, 26))
            g.fillStyle(fill, 1)
            g.fillCircle(0, 16, 37)
            g.fillCircle(0, -24, 23)
            break
        case 'grape':
            for (const [x, y] of [[-24, -22], [0, -26], [24, -22], [-12, 2], [12, 2], [0, 26]] as const) {
                both(() => g.fillCircle(x, y, 18), () => g.strokeCircle(x, y, 18))
            }
            break
        case 'strawberry':
            both(() => g.fillTriangle(-44, -20, 44, -20, 0, 50), () => g.strokeTriangle(-44, -20, 44, -20, 0, 50))
            both(() => g.fillEllipse(0, -20, 88, 50), () => g.strokeEllipse(0, -20, 88, 50))
            g.fillStyle(fill, 1)
            g.fillTriangle(-40, -18, 40, -18, 0, 45)
            break
        default:
            both(() => g.fillCircle(0, 4, 44), () => g.strokeCircle(0, 4, 44))
            g.lineStyle(6, C.ink, 1)
            g.lineBetween(0, -38, 6, -54)
    }
    g.fillStyle(C.ink, 1)
    g.fillCircle(-12, 2, 5)
    g.fillCircle(12, 2, 5)
    g.lineStyle(3, C.ink, 1)
    g.beginPath()
    g.arc(0, 10, 7, 0.15 * Math.PI, 0.85 * Math.PI)
    g.strokePath()
}

export function createItemView(scene: Phaser.Scene, def: ItemDef, size: Size = 'big'): ItemView {
    const glow = scene.add.graphics()
    glow.fillStyle(0xfff3a8, 0.35)
    glow.fillCircle(0, 0, 70)
    glow.fillStyle(0xfff9d6, 0.5)
    glow.fillCircle(0, 0, 56)
    glow.setVisible(false)

    const art: Phaser.GameObjects.GameObject[] = [glow]
    if (scene.textures.exists(ITEMS)) {
        const image = scene.add.image(0, 0, ITEMS, def.cell).setScale(ITEM.front / ITEM.cell)
        if (def.tray === 'shapes') image.setTint(PAINT[def.color])
        art.push(image)
    } else {
        const g = scene.add.graphics().setScale(ITEM.front / 120)
        paintFallback(g, def)
        art.push(g)
    }

    const container = scene.add.container(0, 0, art).setDepth(DEPTH.tray)
    let glowTween: Phaser.Tweens.Tween | undefined

    return {
        def,
        size,
        container,
        setGlow(on) {
            if (on === glow.visible) return
            glowTween?.remove()
            glowTween = undefined
            glow.setVisible(on).setAlpha(1).setScale(1)
            if (on) {
                glowTween = scene.tweens.add({
                    targets: glow,
                    alpha: 0.45,
                    scale: 1.12,
                    duration: 700,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            }
        },
        destroy() {
            glowTween?.remove()
            container.destroy()
        },
    }
}

export function createTray(scene: Phaser.Scene): TrayView {
    const shadow = scene.add.graphics().setDepth(DEPTH.trayBack - 1)
    shadow.fillStyle(C.shadow, A.shadow)
    shadow.fillEllipse(TRAY.cx, TRAY.cy + 22, TRAY.rx * 2 + 30, TRAY.ry * 2 + 20)

    const hasArt = scene.textures.exists(TRAY_TEX)
    const size = hasArt ? TRAY.disc : 768
    const container = scene.add
        .container(TRAY.cx, TRAY.cy)
        .setDepth(DEPTH.trayBack)
        .setScale((TRAY.rx * 2) / size, (TRAY.ry * 2) / size)

    let disc: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    if (hasArt) {
        disc = scene.add.image(0, 0, TRAY_TEX)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.trayRim, 1)
        g.fillCircle(0, 0, size / 2)
        g.fillStyle(C.tray, 1)
        g.fillCircle(0, 0, size / 2 - 34)
        g.lineStyle(10, C.trayDark, 1)
        for (let i = 0; i < 8; i++) {
            const a = (i * TAU) / 8
            g.lineBetween(0, 0, Math.cos(a) * (size / 2 - 40), Math.sin(a) * (size / 2 - 40))
        }
        g.fillStyle(C.trayDark, 1)
        g.fillCircle(0, 0, 60)
        disc = g
    }
    container.add(disc)

    let slots: (ItemView | undefined)[] = []
    let base = 0
    let spinning = true
    const homing = new Set<number>()
    let pop: { v: number }[] = []
    let glowIds = new Set<string>()
    let hopFrom = -1

    const angleOf = (index: number) => base + (index * TAU) / Math.max(1, slots.length)

    const place = (index: number) => {
        const a = angleOf(index)
        const sin = Math.sin(a)
        const t = (sin + 1) / 2
        const size = SIZE_SCALE[slots[index]?.size ?? 'big']
        const scale = Phaser.Math.Linear(ITEM.back / ITEM.front, 1, t) * size
        const x = TRAY.cx + Math.cos(a) * TRAY.ringRx
        const y = TRAY.cy + sin * TRAY.ringRy - ITEM.footDy * scale
        return { x, y, scale, sin, depth: DEPTH.tray + t }
    }

    const layout = () => {
        disc.setRotation(base)
        slots.forEach((view, index) => {
            if (!view || homing.has(index)) return
            const p = place(index)
            const hop = hopFrom < 0 ? 0 : Math.max(0, Math.sin((scene.time.now - hopFrom) / 180 - index * 0.9)) ** 2 * 26
            view.container.setPosition(p.x, p.y - hop).setScale(p.scale * (pop[index]?.v ?? 1)).setDepth(p.depth)
            view.container.setAlpha(p.sin < 0 ? A.back + (1 - A.back) * (1 + p.sin) : 1)
        })
    }

    const spotsWhere = (test: (sin: number) => boolean): Spot[] =>
        slots.flatMap((view, index) => {
            if (!view || homing.has(index)) return []
            const p = place(index)
            return test(p.sin) ? [{ index, id: view.def.id, x: p.x, y: p.y }] : []
        })

    const clear = () => {
        scene.tweens.killTweensOf(pop)
        slots.forEach(view => view?.destroy())
        slots = []
        pop = []
        homing.clear()
    }

    return {
        container,
        setItems(pieces) {
            clear()
            base = Math.random() * TAU
            slots = pieces.map(({ def, size }) => {
                const view = createItemView(scene, def, size)
                view.setGlow(glowIds.has(def.id))
                return view
            })
            pop = slots.map(() => ({ v: 0 }))
            pop.forEach((p, i) =>
                scene.tweens.add({ targets: p, v: 1, duration: 320, delay: i * 60, ease: 'Back.easeOut' }),
            )
            layout()
        },
        update(dtMs, spinMs) {
            if (spinning && spinMs > 0) base = (base + (dtMs / spinMs) * TAU) % TAU
            layout()
        },
        setSpinning(on) {
            spinning = on
        },
        reachable: () => spotsWhere(sin => sin > TRAY.reachSin),
        outside: () => spotsWhere(() => true),
        view: index => slots[index],
        take(index) {
            const view = slots[index]
            if (!view) return undefined
            slots[index] = undefined
            view.setGlow(false)
            return view
        },
        putBack(index, view) {
            homing.add(index)
            slots[index] = view
            const p = place(index)
            return new Promise(resolve => {
                scene.tweens.add({
                    targets: view.container,
                    x: p.x,
                    y: p.y,
                    scale: p.scale,
                    duration: 260,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        homing.delete(index)
                        view.container.setDepth(p.depth)
                        view.setGlow(glowIds.has(view.def.id))
                        layout()
                        resolve()
                    },
                })
            })
        },
        setGlow(ids) {
            glowIds = new Set(ids)
            slots.forEach(view => view?.setGlow(glowIds.has(view.def.id)))
        },
        setHop(on) {
            hopFrom = on ? scene.time.now : -1
            layout()
        },
        clear,
        destroy() {
            clear()
            container.destroy()
            shadow.destroy()
        },
    }
}
