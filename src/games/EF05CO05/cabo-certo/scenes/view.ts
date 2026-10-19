import Phaser from 'phaser'
import { H, VIEW, W, WORLD } from '../data/layout'
import type { Rect, Vec } from '../types'

/**
 * Duas câmeras. A principal é a janela sobre o mapa, abaixo do cabeçalho, e
 * anda quando a criança arrasta o chão. A de cima (ui) desenha o cabeçalho, os
 * balões e o tutorial sem andar. Tudo nasce na ui; o que é do mapa passa por
 * `world()`.
 */
export interface View {
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    /** Anda o mapa em pixels de tela. */
    pan(dx: number, dy: number): void
    panTo(at: Vec, ms: number): Promise<void>
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

    const scroll = { x: 0, y: 0 }
    let tween: Phaser.Tweens.Tween | undefined

    const clampX = (x: number) => Phaser.Math.Clamp(x, 0, WORLD.w - VIEW.w)
    const clampY = (y: number) => Phaser.Math.Clamp(y, 0, WORLD.h - VIEW.h)
    const apply = () => {
        scroll.x = clampX(scroll.x)
        scroll.y = clampY(scroll.y)
        main.setScroll(Math.round(scroll.x), Math.round(scroll.y))
    }
    const centerOn = (at: Vec) => {
        scroll.x = at.x - VIEW.w / 2
        scroll.y = at.y - VIEW.h / 2
        apply()
    }

    // O contêiner confere o filtro de cada filho na hora de desenhar: os filhos
    // também precisam sair da ui, senão o contêiner aparece vazio no mapa.
    const intoWorld = (obj: Phaser.GameObjects.GameObject) => {
        obj.cameraFilter = ui.id
        if (obj instanceof Phaser.GameObjects.Container) obj.list.forEach(intoWorld)
    }

    const view: View = {
        world(obj) {
            intoWorld(obj)
            return obj
        },
        pan(dx, dy) {
            tween?.stop()
            scroll.x -= dx
            scroll.y -= dy
            apply()
        },
        panTo(at, ms) {
            tween?.stop()
            const from = { x: scroll.x, y: scroll.y }
            const to = { x: clampX(at.x - VIEW.w / 2), y: clampY(at.y - VIEW.h / 2) }
            if (Math.abs(from.x - to.x) < 2 && Math.abs(from.y - to.y) < 2) return Promise.resolve()
            const k = { t: 0 }
            return new Promise<void>(resolve => {
                tween = scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: ms,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        scroll.x = Phaser.Math.Linear(from.x, to.x, k.t)
                        scroll.y = Phaser.Math.Linear(from.y, to.y, k.t)
                        apply()
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
        },
        center: () => ({ x: scroll.x + VIEW.w / 2, y: scroll.y + VIEW.h / 2 }),
        toScreen: at => ({ x: at.x - scroll.x + VIEW.x, y: at.y - scroll.y + VIEW.y }),
        toScreenRect(r) {
            const pt = view.toScreen(r)
            return { x: pt.x, y: pt.y, w: r.w, h: r.h }
        },
        toWorld: (x, y) => ({ x: x - VIEW.x + scroll.x, y: y - VIEW.y + scroll.y }),
        inView(at, pad = 0) {
            const s = view.toScreen(at)
            return s.x > VIEW.x + pad && s.x < VIEW.x + VIEW.w - pad && s.y > VIEW.y + pad && s.y < VIEW.y + VIEW.h - pad
        },
        onMap: (x, y) => x >= VIEW.x && x <= VIEW.x + VIEW.w && y >= VIEW.y && y <= VIEW.y + VIEW.h,
        destroy() {
            tween?.stop()
            scene.sys.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, onAdded)
            scene.cameras.remove(ui)
            main.setViewport(0, 0, W, H).setScroll(0, 0)
        },
    }
    centerOn(home)
    return view
}
