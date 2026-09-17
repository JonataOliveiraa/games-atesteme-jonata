import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../../shared/effects/FX'
import { DEPTH, H, W } from '../../data/layout'
import { C, CSS, FONT } from '../../data/theme'
import { THING_SHEET } from '../../data/parts'
import type { Audio } from '../audio'

export const fx = (o: unknown) => o as unknown as FxTarget

/** O desafio toma a tela inteira. A área abaixo é o que sobra para o jogo. */
export const AREA = {
    x: 40,
    y: 152,
    w: 1200,
    h: 536,
    cx: 640,
    cy: 420,
} as const

export const TITLE_Y = 58
export const NOTE_Y = 112

export interface TrialCtx {
    scene: Phaser.Scene
    layer: Phaser.GameObjects.Container
    audio: Audio
    /** No nível 3 o desafio vem ANTES da pergunta: nada pode entregar a peça. */
    quiet: boolean
    alive(): boolean
    wait(ms: number): Promise<void>
    tap(x: number, y: number, w: number, h: number, onTap: () => void): Phaser.GameObjects.Zone
    drag(
        target: Phaser.GameObjects.Container,
        w: number,
        h: number,
        handlers: {
            onStart?(): void
            onMove?(x: number, y: number): void
            onDrop(x: number, y: number): void
        },
    ): Phaser.GameObjects.Zone
    setTapsEnabled(on: boolean): void
    note(text: string): void
}

export type Trial = (ctx: TrialCtx) => Promise<void>

export interface TrialDef {
    /** O que a máquina fala antes de o desafio abrir. Vira o título do palco. */
    prompt: string
    run: Trial
}

export async function runTrial(
    scene: Phaser.Scene,
    options: { trial: Trial; title: string; audio: Audio; quiet?: boolean; alive(): boolean },
): Promise<void> {
    const layer = scene.add.container(0, 0).setDepth(DEPTH.trial).setAlpha(0)
    const zones: Phaser.GameObjects.Zone[] = []

    const back = scene.add.graphics()
    back.fillStyle(C.ink, 1)
    back.fillRect(0, 0, W, H)
    back.fillStyle(C.inkSoft, 0.55)
    back.fillRect(0, 0, W, 148)
    for (let y = 160; y < H; y += 9) {
        back.fillStyle(C.cyan, 0.03)
        back.fillRect(0, y, W, 2)
    }
    back.fillStyle(C.cyan, 1)
    back.fillRect(0, 144, W, 4)
    layer.add(back)

    const title = scene.add
        .text(W / 2, TITLE_Y, options.title, {
            fontFamily: FONT.black,
            fontSize: '38px',
            color: CSS.cream,
            align: 'center',
            wordWrap: { width: W - 160 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    title.setStroke(CSS.ink, 7)
    layer.add(title)

    const note = scene.add
        .text(W / 2, NOTE_Y, '', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.gold,
            align: 'center',
            wordWrap: { width: W - 160 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    note.setStroke(CSS.ink, 6)
    layer.add(note)

    const ctx: TrialCtx = {
        scene,
        layer,
        audio: options.audio,
        quiet: options.quiet ?? false,
        alive: options.alive,
        wait: ms => FX.wait(scene, ms),

        tap: (x, y, w, h, onTap) => {
            const zone = scene.add
                .zone(x, y, w, h)
                .setOrigin(0.5)
                .setDepth(DEPTH.trial + 2)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', onTap)
            zones.push(zone)
            return zone
        },

        drag: (target, w, h, handlers) => {
            const zone = scene.add
                .zone(target.x, target.y, w, h)
                .setOrigin(0.5)
                .setDepth(DEPTH.trial + 2)
                .setInteractive({ useHandCursor: true, draggable: true })
            scene.input.setDraggable(zone)

            zone.on('dragstart', () => handlers.onStart?.())
            zone.on('drag', (_p: Phaser.Input.Pointer, x: number, y: number) => {
                zone.setPosition(x, y)
                handlers.onMove?.(x, y)
            })
            zone.on('dragend', () => handlers.onDrop(zone.x, zone.y))

            zones.push(zone)
            return zone
        },

        setTapsEnabled: on => {
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = on
            })
        },

        note: text => note.setText(text),
    }

    layer.setScale(1.06)
    await FX.all(
        FX.to(scene, layer, { alpha: 1 }, { duration: 260, ease: Ease.smooth }),
        FX.to(scene, layer, { scale: 1 }, { duration: 320, ease: Ease.back(1.2) }),
    )

    const ended = new Promise<void>(resolve => {
        scene.events.once('shutdown', () => resolve())
    })

    try {
        await Promise.race([options.trial(ctx), ended])
    } finally {
        ctx.setTapsEnabled(false)
        if (options.alive()) await FX.to(scene, layer, { alpha: 0 }, { duration: 260 })
        zones.forEach(zone => zone.destroy())
        FX.kill(scene, layer)
        layer.destroy(true)
    }
}

/* ────────────────────────────── peças do palco ─────────────────────────── */

export interface ButtonSpec {
    x: number
    y: number
    w: number
    h: number
    label: string
    tone: number
    textColor?: string
    size?: number
    round?: number
    onTap(): void
}

export interface TrialButton {
    container: Phaser.GameObjects.Container
    shake(): Promise<void>
    press(): Promise<void>
}

export function trialButton(ctx: TrialCtx, spec: ButtonSpec): TrialButton {
    const holder = ctx.scene.add.container(spec.x, spec.y)
    ctx.layer.add(holder)

    const round = spec.round ?? 18
    const plate = ctx.scene.add.graphics()
    plate.fillStyle(C.shadow, 0.4)
    plate.fillRoundedRect(-spec.w / 2, -spec.h / 2 + 9, spec.w, spec.h, round)
    plate.fillStyle(C.ink, 1)
    plate.fillRoundedRect(-spec.w / 2, -spec.h / 2 + 5, spec.w, spec.h, round)
    plate.fillStyle(spec.tone, 1)
    plate.fillRoundedRect(-spec.w / 2, -spec.h / 2, spec.w, spec.h, round)
    plate.fillStyle(C.white, 0.26)
    plate.fillRoundedRect(-spec.w / 2 + 6, -spec.h / 2 + 5, spec.w - 12, spec.h * 0.32, round - 6)
    holder.add(plate)

    const label = ctx.scene.add
        .text(0, 0, spec.label, {
            fontFamily: FONT.black,
            fontSize: `${spec.size ?? 44}px`,
            color: spec.textColor ?? CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    holder.add(label)

    ctx.tap(spec.x, spec.y, spec.w + 20, spec.h + 20, spec.onTap)

    return {
        container: holder,
        shake: async () => {
            await FX.to(ctx.scene, holder, { x: spec.x - 10 }, { duration: 60 })
            await FX.to(ctx.scene, holder, { x: spec.x + 10 }, { duration: 80 })
            await FX.to(ctx.scene, holder, { x: spec.x }, { duration: 80 })
        },
        press: () => FX.press(ctx.scene, holder),
    }
}

export const THING = THING_SHEET
export const THING_FRAME = { desenho: 0, foto: 1, musica: 2, texto: 3 } as const
const THING_TONE = [0x63c35c, 0xfcb336, 0xa085f2, 0x57affa]

/** Um objeto que o computador manipula. Com a folha, é a arte; sem ela, um cartão. */
export function thing(
    ctx: TrialCtx,
    x: number,
    y: number,
    frame: number,
    size = 118,
): Phaser.GameObjects.Container {
    const holder = ctx.scene.add.container(x, y)
    ctx.layer.add(holder)

    const shadow = ctx.scene.add.graphics()
    shadow.fillStyle(C.shadow, 0.3)
    shadow.fillEllipse(0, size * 0.48, size * 0.8, size * 0.16)
    holder.add(shadow)

    if (ctx.scene.textures.exists(THING.key)) {
        const art = ctx.scene.add.image(0, 0, THING.key, frame).setOrigin(0.5)
        art.setDisplaySize(size, size)
        holder.add(art)
        return holder
    }

    const plate = ctx.scene.add.graphics()
    plate.fillStyle(C.cream, 1)
    plate.fillRoundedRect(-size / 2, -size / 2, size, size, 16)
    plate.fillStyle(THING_TONE[frame % THING_TONE.length], 1)
    plate.fillRoundedRect(-size / 2 + 10, -size / 2 + 10, size - 20, size - 20, 12)
    holder.add(plate)
    return holder
}

/** Troca o desenho de um objeto criado por `thing`. */
export function setThingFrame(ctx: TrialCtx, holder: Phaser.GameObjects.Container, frame: number) {
    if (!ctx.scene.textures.exists(THING.key)) return
    const art = holder.list.find(o => o.type === 'Image') as Phaser.GameObjects.Image | undefined
    art?.setFrame(frame)
}
