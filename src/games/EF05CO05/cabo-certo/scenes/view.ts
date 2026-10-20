import Phaser from 'phaser'
import { H, VIEW, W, WORLD } from '../data/layout'
import type { Rect, Vec } from '../types'

/**
 * Duas câmeras. A principal é a janela sobre o mapa, abaixo do cabeçalho: anda
 * quando a criança arrasta o chão e dá zoom na demonstração. A de cima (ui)
 * desenha o cabeçalho, as legendas e a mãozinha sem andar. Tudo nasce na ui; o
 * que é do mapa passa por `world()`.
 */
export interface View {
    readonly zoom: number
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    /** Anda o mapa em pixels de tela. */
    pan(dx: number, dy: number): void
    panTo(at: Vec, ms: number): Promise<void>
    /** Leva o centro da janela até o ponto e muda o zoom junto. */
    zoomTo(at: Vec, zoom: number, ms: number): Promise<void>
    center(): Vec
    toScreen(at: Vec): Vec
    toScreenRect(r: Rect): Rect
    toWorld(x: number, y: number): Vec
    inView(at: Vec, pad?: number): boolean
    /** O ponto de tela está dentro da janela do mapa? */
    onMap(x: number, y: number): boolean
    destroy(): void
}

export function createView(scene: Phaser.Scene, home: Vec): View {
    const main = scene.cameras.main
    main.setViewport(VIEW.x, VIEW.y, VIEW.w, VIEW.h)
    const ui = scene.cameras.add(0, 0, W, H)
    ui.setName('ui')

    const toUi = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter |= main.id
    }
    const onAdded = (obj: Phaser.GameObjects.GameObject) => toUi(obj)
    scene.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
    scene.children.list.forEach(toUi)

    // O contêiner confere o filtro de cada filho na hora de desenhar: os filhos
    // também precisam sair da ui, senão o contêiner aparece vazio no mapa.
    const intoWorld = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter = ui.id
        if (obj instanceof Phaser.GameObjects.Container) obj.list.forEach(intoWorld)
    }

    // O centro da janela, no mapa. Com zoom, a janela mostra VIEW / zoom do mapa.
    const center = { x: home.x, y: home.y }
    let zoom = 1
    let tween: Phaser.Tweens.Tween | undefined

    const clamp = () => {
        const hw = VIEW.w / (2 * zoom)
        const hh = VIEW.h / (2 * zoom)
        center.x = Phaser.Math.Clamp(center.x, hw, WORLD.w - hw)
        center.y = Phaser.Math.Clamp(center.y, hh, WORLD.h - hh)
    }
    const apply = () => {
        clamp()
        main.setZoom(zoom)
        main.setScroll(center.x - VIEW.w / 2, center.y - VIEW.h / 2)
    }

    const view: View = {
        get zoom() {
            return zoom
        },
        world(obj) {
            intoWorld(obj)
            return obj
        },
        pan(dx, dy) {
            tween?.stop()
            center.x -= dx / zoom
            center.y -= dy / zoom
            apply()
        },
        panTo: (at, ms) => view.zoomTo(at, zoom, ms),
        zoomTo(at, to, ms) {
            tween?.stop()
            const from = { x: center.x, y: center.y, z: zoom }
            const k = { t: 0 }
            return new Promise<void>(resolve => {
                tween = scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: ms,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        zoom = Phaser.Math.Linear(from.z, to, k.t)
                        center.x = Phaser.Math.Linear(from.x, at.x, k.t)
                        center.y = Phaser.Math.Linear(from.y, at.y, k.t)
                        apply()
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
        },
        center: () => ({ ...center }),
        toScreen: at => ({
            x: VIEW.x + VIEW.w / 2 + (at.x - center.x) * zoom,
            y: VIEW.y + VIEW.h / 2 + (at.y - center.y) * zoom,
        }),
        toScreenRect(r) {
            const pt = view.toScreen(r)
            return { x: pt.x, y: pt.y, w: r.w * zoom, h: r.h * zoom }
        },
        toWorld: (x, y) => ({
            x: center.x + (x - VIEW.x - VIEW.w / 2) / zoom,
            y: center.y + (y - VIEW.y - VIEW.h / 2) / zoom,
        }),
        inView(at, pad = 0) {
            const s = view.toScreen(at)
            return s.x > VIEW.x + pad && s.x < VIEW.x + VIEW.w - pad && s.y > VIEW.y + pad && s.y < VIEW.y + VIEW.h - pad
        },
        onMap: (x, y) => x >= VIEW.x && x <= VIEW.x + VIEW.w && y >= VIEW.y && y <= VIEW.y + VIEW.h,
        destroy() {
            tween?.stop()
            scene.sys.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
            scene.cameras.remove(ui)
            main.setViewport(0, 0, W, H).setZoom(1).setScroll(0, 0)
        },
    }
    apply()
    return view
}
