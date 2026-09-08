import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { H, W } from '../data/layout'
import type { Point } from '../types'

export interface Shot {
    at: Point
    zoom: number
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O MODO CENA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Quando a máquina começa a trabalhar, a interface some e a câmera fecha em
 * cima da ação. É o momento em que a criança precisa VER o comando acontecer,
 * e nível, selos, botões e o painel do pedido só disputam atenção com ele.
 *
 * ── A CÂMERA NUNCA MOSTRA O VAZIO ────────────────────────────────────────
 *
 * O `bg-vila.png` cobre exatamente 1280 x 720. Um enquadramento que passe da
 * borda mostraria faixa preta, então todo alvo é preso ao retângulo que ainda
 * cabe naquele zoom — e é o `clamp` que garante isso, não a escolha do número
 * em `problems.ts`.
 */
export function createCinema(scene: Phaser.Scene) {
    const cam = scene.cameras.main
    const home: Point = { x: W / 2, y: H / 2 }
    let live = false

    /** Com menos movimento pedido, a câmera chega perto de menos. */
    const zoomOf = (value: number) => (FX.reducedMotion() ? 1 + (value - 1) * 0.3 : value)

    const clamp = (at: Point, zoom: number): Point => ({
        x: Phaser.Math.Clamp(at.x, W / 2 / zoom, W - W / 2 / zoom),
        y: Phaser.Math.Clamp(at.y, H / 2 / zoom, H - H / 2 / zoom),
    })

    const move = (at: Point, zoom: number, ms: number) => {
        const z = zoomOf(zoom)
        const spot = clamp(at, z)
        const time = FX.ms(scene, ms)
        cam.pan(spot.x, spot.y, time, 'Sine.easeInOut')
        cam.zoomTo(z, time, 'Sine.easeInOut')
    }

    return {
        get live() {
            return live
        },

        async enter(shot: Shot, ms = 620) {
            live = true
            move(shot.at, shot.zoom, ms)
            await FX.wait(scene, ms)
        },

        /** Muda o enquadramento e espera chegar. */
        async look(shot: Shot, ms = 520) {
            if (!live) return
            move(shot.at, shot.zoom, ms)
            await FX.wait(scene, ms)
        },

        /** Acompanha um deslocamento: a câmera anda junto e não espera. */
        track(shot: Shot, ms: number) {
            if (!live) return
            move(shot.at, shot.zoom, ms)
        },

        async exit(ms = 560) {
            if (!live) return
            live = false
            move(home, 1, ms)
            await FX.wait(scene, ms)
        },

        /** Volta ao enquadramento normal na hora, sem animar. */
        reset() {
            live = false
            cam.panEffect.reset()
            cam.zoomEffect.reset()
            cam.setZoom(1)
            cam.centerOn(home.x, home.y)
        },
    }
}

export type Cinema = ReturnType<typeof createCinema>
