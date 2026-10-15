import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PART, TRACK_SHEET } from '../data/files'
import { DEPTH, GO, RIM, SIGNAL } from '../data/layout'
import type { MapDef } from '../data/maps'
import { CSS, FONT, SIZE } from '../data/theme'
import { fade, fit, fitRimmed, pin, refit, shadowOf, sizeIn } from './art'
import type { Rect } from './board'

export interface Go {
    onPress(cb: () => void): void
    setEnabled(on: boolean): void
    press(): Promise<void>
    signal(green: boolean): void
    rect(): Rect
    /** some enquanto a criança arrasta o pátio (e o toque passa para o mapa) */
    setShown(on: boolean): void
    destroy(): void
}

const OFF_ALPHA = 0.55

export function createGo(scene: Phaser.Scene, map: MapDef): Go {
    let enabled = false
    let pressed: () => void = () => {}

    const light = fit(scene, TRACK_SHEET, PART.signalRed, SIGNAL.h).setPosition(map.signal.x, map.signal.y).setDepth(DEPTH.lever)
    const post = shadowOf(scene, light).setDepth(DEPTH.shadow)
    const face = fitRimmed(scene, TRACK_SHEET, PART.button, sizeIn(scene, TRACK_SHEET, PART.button, GO.w, GO.h), RIM)
    const label = scene.add
        .text(0, -3, 'PARTIR', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.go}px`,
            color: CSS.white,
            stroke: CSS.ink,
            strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setResolution(2)
    const room = face.displayWidth * 0.8
    if (label.width > room) label.setScale(room / label.width)
    const button = scene.add.container(0, 0, [shadowOf(scene, face), face, label]).setAlpha(OFF_ALPHA)
    /** o some/volta do arrastar mexe só aqui; o alpha do `button` diz se ele está ligado */
    const holder = pin(scene.add.container(GO.x, GO.y, [button]).setDepth(DEPTH.board))
    const zone = scene.add
        .zone(GO.x, GO.y, GO.w + 20, GO.h + 20)
        .setDepth(DEPTH.board + 1)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })

    const signal = (green: boolean) => {
        refit(light, green ? PART.signalGreen : PART.signalRed, SIGNAL.h)
    }

    const sink = async () => {
        scene.tweens.killTweensOf(button)
        button.setScale(1)
        signal(true)
        await FX.to(scene, button, { scale: 0.92 }, { duration: 90, yoyo: true, ease: 'Sine.easeOut' })
        button.setScale(1)
    }

    const fire = () => {
        if (!enabled) return
        enabled = false
        button.setAlpha(OFF_ALPHA)
        void sink()
        pressed()
    }

    zone.on('pointerdown', fire)
    const onKey = (e: KeyboardEvent) => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') fire()
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        onPress(cb) {
            pressed = cb
        },
        setEnabled(on) {
            enabled = on
            button.setAlpha(on ? 1 : OFF_ALPHA)
        },
        press() {
            return sink()
        },
        signal,
        rect() {
            return { x: GO.x, y: GO.y, w: GO.w, h: GO.h }
        },
        setShown(on) {
            fade(scene, holder, on ? 1 : 0)
            if (zone.input) zone.input.enabled = on
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            scene.tweens.killTweensOf([button, holder])
            zone.destroy()
            holder.destroy()
            light.destroy()
            post.destroy()
        },
    }
}
