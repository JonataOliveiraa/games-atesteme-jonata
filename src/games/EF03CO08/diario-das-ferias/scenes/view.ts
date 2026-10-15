import Phaser from 'phaser'
import { AIM, H, SWAY, W, WORLD, ZOOM } from '../data/layout'
import type { Tool } from '../types'
import type { Rect } from './guide'

/**
 * Duas câmeras. A do MUNDO passeia pela praia e dá zoom quando a câmera do
 * tablet sai; a da TELA desenha HUD, botões, balões e painéis sem zoom nenhum.
 * Tudo nasce na tela; o que é do mundo passa por `world()`.
 */
export interface View {
    readonly aim: { x: number; y: number }
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    moveAim(dx: number, dy: number): void
    setAim(x: number, y: number): void
    /** zoom e tremidinho de cada jeito de segurar o tablet */
    hold(tool: Tool | null): Promise<void>
    update(delta: number): void
    toScreen(x: number, y: number): { x: number; y: number }
    toScreenRect(r: Rect): Rect
    /** a caixa do mundo que cabe num retângulo da tela centrado na mira */
    worldBox(w: number, h: number): Rect
    onScreen(x: number, y: number, pad?: number): boolean
    reset(): void
    destroy(): void
}

export function createView(scene: Phaser.Scene): View {
    const main = scene.cameras.main
    main.setBounds(0, 0, WORLD.w, WORLD.h)
    const ui = scene.cameras.add(0, 0, W, H)
    ui.setName('ui')

    const toUi = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter |= main.id
    }
    const onAdded = (obj: Phaser.GameObjects.GameObject) => toUi(obj)
    scene.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
    scene.children.list.forEach(toUi)

    const aim: { x: number; y: number } = { x: AIM.startX, y: AIM.startY }
    const center: { x: number; y: number } = { x: AIM.startX, y: H / 2 }
    let zoom = 1
    let swayOn = false
    let clock = 0
    let zoomTween: Phaser.Tweens.Tween | undefined
    let zoomDone: (() => void) | undefined

    const half = () => ({ w: W / (2 * zoom), h: H / (2 * zoom) })
    const clampCenter = (x: number, y: number) => {
        const { w, h } = half()
        return { x: Phaser.Math.Clamp(x, w, WORLD.w - w), y: Phaser.Math.Clamp(y, h, WORLD.h - h) }
    }
    const apply = () => {
        main.setZoom(zoom)
        const c = clampCenter(center.x, center.y)
        main.setScroll(c.x - W / 2, c.y - H / 2)
    }
    const left = () => clampCenter(center.x, center.y).x - half().w
    const top = () => clampCenter(center.x, center.y).y - half().h

    const view: View = {
        aim,
        world(obj) {
            obj.cameraFilter = ui.id
            return obj
        },
        moveAim(dx, dy) {
            view.setAim(aim.x + dx, aim.y + dy)
        },
        setAim(x, y) {
            aim.x = Phaser.Math.Clamp(x, AIM.minX, AIM.maxX)
            aim.y = Phaser.Math.Clamp(y, AIM.minY, AIM.maxY)
        },
        hold(tool) {
            swayOn = tool === 'photo'
            const target = tool === 'photo' ? ZOOM.photo : tool === 'sound' ? ZOOM.sound : ZOOM.free
            zoomTween?.stop()
            zoomDone?.()
            const from = zoom
            const k = { t: 0 }
            return new Promise<void>(resolve => {
                zoomDone = resolve
                zoomTween = scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: ZOOM.ms,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        zoom = Phaser.Math.Linear(from, target, k.t)
                    },
                    onComplete: () => {
                        zoomDone = undefined
                        resolve()
                    },
                    onStop: () => {
                        zoomDone = undefined
                        resolve()
                    },
                })
            })
        },
        update(delta) {
            clock += delta
            const ease = 1 - Math.exp(-delta / AIM.follow)
            const sx = swayOn ? Math.sin(clock / SWAY.msX) * SWAY.x : 0
            const sy = swayOn ? Math.cos(clock / SWAY.msY) * SWAY.y : 0
            center.x += (aim.x + sx - center.x) * ease
            center.y += (aim.y + sy - center.y) * ease
            apply()
        },
        toScreen(x, y) {
            return { x: (x - left()) * zoom, y: (y - top()) * zoom }
        },
        toScreenRect(r) {
            const p = view.toScreen(r.x, r.y)
            return { x: p.x, y: p.y, w: r.w * zoom, h: r.h * zoom }
        },
        worldBox(w, h) {
            return { x: aim.x, y: aim.y, w: w / zoom, h: h / zoom }
        },
        onScreen(x, y, pad = 0) {
            const p = view.toScreen(x, y)
            return p.x >= -pad && p.x <= W + pad && p.y >= -pad && p.y <= H + pad
        },
        reset() {
            zoomTween?.stop()
            zoom = 1
            swayOn = false
            view.setAim(AIM.startX, AIM.startY)
            center.x = aim.x
            center.y = H / 2
            apply()
        },
        destroy() {
            zoomTween?.stop()
            zoomDone?.()
            scene.sys.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
            scene.cameras.remove(ui)
            main.setZoom(1).setScroll(0, 0)
        },
    }
    apply()
    return view
}
