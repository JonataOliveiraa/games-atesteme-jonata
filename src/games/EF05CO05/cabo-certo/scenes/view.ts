import Phaser from 'phaser'
import { H, VIEW, W, WORLD } from '../data/layout'
import type { Rect, Vec } from '../types'

/**
 * Duas câmeras. A principal desenha o mapa na tela inteira (ele continua por
 * baixo do cabeçalho), anda quando a criança arrasta o chão e dá zoom nas
 * animações. A de cima (ui) desenha o cabeçalho, as legendas e a vinheta sem
 * andar. Tudo nasce na ui; o que é do mapa passa por `world()`.
 *
 * A janela do mapa (`rect`) é a parte da tela que não está sob o cabeçalho.
 * Quando o cabeçalho sobe no foco, ela vai até o alto (`setTop`), e o centro
 * dela é o centro da tela.
 */
export interface View {
    readonly zoom: number
    /** A câmera está indo para algum lugar (zoom ou panorâmica). */
    readonly busy: boolean
    world<T extends Phaser.GameObjects.GameObject>(obj: T): T
    /** Anda o mapa em pixels de tela. */
    pan(dx: number, dy: number): void
    panTo(at: Vec, ms: number): Promise<void>
    /** Leva o centro da janela até o ponto e muda o zoom junto. */
    zoomTo(at: Vec, zoom: number, ms: number): Promise<void>
    /** Onde começa a janela do mapa na tela (embaixo do cabeçalho, ou 0). */
    setTop(top: number): void
    /** A janela do mapa, em pixels de tela (canto e tamanho). */
    rect(): Rect
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
    main.setViewport(0, 0, W, H)
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

    const port: Rect = { x: VIEW.x, y: VIEW.y, w: VIEW.w, h: VIEW.h }
    const mid = () => ({ x: port.x + port.w / 2, y: port.y + port.h / 2 })

    // O ponto do mapa que fica no meio da janela. Com zoom, a tela mostra W / zoom do mapa.
    const center = { x: home.x, y: home.y }
    let zoom = 1
    let tween: Phaser.Tweens.Tween | undefined

    const clamp = () => {
        // A câmera desenha a tela inteira: é ela toda que não pode passar da borda do mapa.
        const m = mid()
        center.x = Phaser.Math.Clamp(center.x, m.x / zoom, WORLD.w - (W - m.x) / zoom)
        center.y = Phaser.Math.Clamp(center.y, m.y / zoom, WORLD.h - (H - m.y) / zoom)
    }
    const apply = () => {
        clamp()
        const m = mid()
        main.setZoom(zoom)
        main.setScroll(center.x - W / 2 - (m.x - W / 2) / zoom, center.y - H / 2 - (m.y - H / 2) / zoom)
    }

    const view: View = {
        get zoom() {
            return zoom
        },
        get busy() {
            return Boolean(tween?.isPlaying())
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
        setTop(top) {
            if (top === port.y) return
            const before = mid().y
            port.y = top
            port.h = H - top
            // Com a câmera parada, o mapa fica parado na tela: só o cabeçalho sai
            // de cima dele. Com ela andando, quem decide o centro é o zoom.
            if (!view.busy) center.y += (mid().y - before) / zoom
            apply()
        },
        rect: () => ({ ...port }),
        center: () => ({ ...center }),
        toScreen(at) {
            const m = mid()
            return { x: m.x + (at.x - center.x) * zoom, y: m.y + (at.y - center.y) * zoom }
        },
        toScreenRect(r) {
            const pt = view.toScreen(r)
            return { x: pt.x, y: pt.y, w: r.w * zoom, h: r.h * zoom }
        },
        toWorld(x, y) {
            const m = mid()
            return { x: center.x + (x - m.x) / zoom, y: center.y + (y - m.y) / zoom }
        },
        inView(at, pad = 0) {
            const s = view.toScreen(at)
            return s.x > port.x + pad && s.x < port.x + port.w - pad && s.y > port.y + pad && s.y < port.y + port.h - pad
        },
        onMap: (x, y) => x >= port.x && x <= port.x + port.w && y >= port.y && y <= port.y + port.h,
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
