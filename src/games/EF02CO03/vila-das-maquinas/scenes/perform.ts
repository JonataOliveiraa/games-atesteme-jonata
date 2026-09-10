import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { DEPTH, HOOK_DY, STAGE } from '../data/layout'
import { C } from '../data/theme'
import { commandIcon } from './plaque'
import type { Audio } from './audio'
import type { Cinema } from './cinema'
import type { MachineButton } from './machineButton'
import type { ProblemHandle } from './problems'
import type { Command, Point } from '../types'

export interface PerformContext {
    scene: Phaser.Scene
    audio: Audio
    button: MachineButton
    problem: ProblemHandle
    cinema: Cinema
    /** Qual etapa da missão está rodando. O problema decide o que fazer nela. */
    step: number
}

const clampToStage = (point: Point) => ({
    x: Phaser.Math.Clamp(point.x, STAGE.left + 90, STAGE.right - 90),
    y: Phaser.Math.Clamp(point.y, STAGE.top + 60, STAGE.bottom - 60),
})

/** O enquadramento fechado em cima da própria máquina. */
const onMachine = (ctx: PerformContext, zoom = 1.75) => ({
    at: { x: ctx.button.crew.x, y: ctx.button.crew.y - 20 },
    zoom,
})

async function warmGlow(scene: Phaser.Scene, at: Point) {
    void FX.ping(scene, at.x, at.y, C.ovenLight, { radius: 128, duration: 620 })
    await FX.wait(scene, 180)
    void FX.ping(scene, at.x, at.y, C.oven, { radius: 154, duration: 700 })
}

async function lookUp(scene: Phaser.Scene, at: Point) {
    const arrow = scene.add.graphics().setDepth(DEPTH.fx)
    arrow.fillStyle(C.grey, 0.9)
    arrow.fillTriangle(at.x, at.y - 118, at.x - 22, at.y - 86, at.x + 22, at.y - 86)
    arrow.fillRoundedRect(at.x - 8, at.y - 90, 16, 30, 6)
    arrow.setAlpha(0)
    await FX.to(scene, arrow, { alpha: 1, y: -18 }, { duration: 320 })
    await FX.to(scene, arrow, { alpha: 0 }, { duration: 300 })
    arrow.destroy()
}

/** Poeirinha sob a máquina, para o movimento ter peso. */
function dust(scene: Phaser.Scene, at: Point, count = 8) {
    void FX.sparks(scene, at.x, at.y, {
        color: C.sandDark,
        count,
        spread: 90,
        size: 8,
        duration: 520,
    })
}

/** O pictograma do comando que faltou pulsa em cima do problema. */
export async function pulseRequired(scene: Phaser.Scene, command: Command, at: Point) {
    const spot = clampToStage(at)
    const icon = commandIcon(scene, command, 104)
    const base = icon.scale
    icon.setPosition(spot.x, spot.y - 46).setDepth(DEPTH.fx).setAlpha(0).setScale(base * 0.5)

    void FX.ping(scene, spot.x, spot.y - 46, C.oven, { radius: 88 })
    await FX.to(scene, icon, { alpha: 1, scale: base }, { duration: 240, ease: Ease.back(2.2) })
    await FX.to(scene, icon, { scale: base * 1.2 }, { duration: 260, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
    await FX.to(scene, icon, { alpha: 0, y: spot.y - 96 }, { duration: 300 })
    icon.destroy()
}

/**
 * O giro é uma volta no próprio eixo, feita com `scaleX`. Rodar o `angle`
 * deixava a vassoura de cabeça para baixo no meio do movimento, que é a única
 * pose que um robô de chão nunca faz.
 */
async function sweeperSpin(ctx: PerformContext) {
    const { scene, button } = ctx
    const crew = button.crew
    ctx.audio.machine('sweeper')
    dust(scene, { x: crew.x, y: crew.y + 40 }, 10)
    for (let i = 0; i < 4; i++) {
        await FX.to(scene, crew, { scaleX: i % 2 === 0 ? -1 : 1 }, { duration: 165, ease: 'Sine.easeInOut' })
    }
    crew.setScale(1)
}

export async function performCorrect(ctx: PerformContext) {
    const { scene, audio, button, problem, cinema } = ctx
    const crew = button.crew

    if (button.id === 'sweeper') {
        await cinema.look(onMachine(ctx, 1.8), 440)
        audio.command(0)
        await button.light(0)
        await sweeperSpin(ctx)

        audio.command(1)
        await button.light(1)
        audio.machine('sweeper')

        const to = problem.workTo ?? { x: crew.x + 300, y: crew.y }
        cinema.track(problem.detail, 950)
        await Promise.all([
            FX.to(scene, crew, { x: to.x }, { duration: 950, ease: 'Sine.easeInOut' }),
            button.trackStrip({ x: to.x, y: problem.anchors.strip.y }, 950),
            problem.solve(ctx.step),
        ])
        dust(scene, { x: crew.x, y: crew.y + 40 }, 12)
        return
    }

    if (button.id === 'drone') {
        await cinema.look(onMachine(ctx, 1.8), 440)
        audio.command(0)
        await button.light(0)
        audio.machine('drone')

        const hover = problem.hover ?? { x: crew.x + 200, y: crew.y - 120 }
        const parcel = problem.parcel

        if (parcel) {
            await FX.to(scene, parcel, { x: crew.x, y: crew.y + HOOK_DY }, { duration: 260 })
            void FX.to(scene, parcel, { angle: 9 }, { duration: 340, yoyo: true, repeat: 2 })
        }

        /* A tira fica onde pousou: subindo junto, ela bateria no balão do desejo. */
        cinema.track(problem.detail, 860)
        await Promise.all([
            FX.arcTo(scene, crew, hover, { height: 54, duration: 860 }),
            parcel
                ? FX.arcTo(scene, parcel, { x: hover.x, y: hover.y + HOOK_DY }, { height: 54, duration: 860 })
                : Promise.resolve(),
        ])

        audio.command(1)
        await button.light(1)
        audio.drop()

        if (parcel && problem.parcelLand) {
            parcel.setAngle(0)
            void FX.to(scene, crew, { y: crew.y - 22 }, { duration: 320, ease: Ease.back(1.6) })
            await FX.arcTo(scene, parcel, problem.parcelLand, { height: 22, duration: 480 })
            await FX.impact(scene, parcel, 0.3)
            void FX.ping(scene, problem.parcelLand.x, problem.parcelLand.y, C.white, { radius: 64 })
        }

        await problem.solve(ctx.step)
        return
    }

    await cinema.look(onMachine(ctx, 1.8), 440)
    audio.command(0)
    await button.light(0)
    audio.machine('oven')
    void warmGlow(scene, { x: crew.x, y: crew.y })
    void FX.to(scene, crew, { scaleX: 1.07, scaleY: 0.94 }, { duration: 260, yoyo: true, repeat: 1 })

    await cinema.look(problem.detail, 480)
    await problem.solve(ctx.step)

    audio.command(1)
    await button.light(1)
    audio.beep()
    void FX.ping(scene, crew.x, crew.y - 40, C.ovenLight, { radius: 92 })
    await FX.to(scene, crew, { y: crew.y - 16 }, { duration: 130, yoyo: true, repeat: 1, ease: Ease.back(2.4) })
}

export async function performWrong(ctx: PerformContext, required: Command) {
    const { scene, audio, button, problem, cinema } = ctx
    const crew = button.crew

    await cinema.look(onMachine(ctx, 1.8), 440)

    if (button.id === 'sweeper') {
        audio.command(0)
        await button.light(0)
        await sweeperSpin(ctx)

        audio.command(1)
        await button.light(1)
        audio.machine('sweeper')
        dust(scene, { x: crew.x, y: crew.y + 40 })
        await FX.to(scene, crew, { x: crew.x + 90 }, { duration: 420, yoyo: true, ease: 'Sine.easeInOut' })
        await lookUp(scene, { x: crew.x, y: crew.y })
    } else if (button.id === 'drone') {
        audio.command(0)
        await button.light(0)
        audio.machine('drone')

        const up = { x: crew.x + 190, y: crew.y - 96 }
        cinema.track({ at: { x: up.x, y: up.y + 30 }, zoom: 1.6 }, 620)
        await Promise.all([
            FX.arcTo(scene, crew, up, { height: 44, duration: 620 }),
            button.trackStrip({ x: up.x - 150, y: 244 }, 620),
            problem.hoist ? problem.hoist({ x: up.x, y: up.y + 56 }) : Promise.resolve(),
        ])

        audio.command(1)
        await button.light(1)
        audio.drop()
        await (problem.settle ? problem.settle() : problem.nudge())
    } else {
        audio.command(0)
        await button.light(0)
        audio.machine('oven')
        await warmGlow(scene, { x: crew.x, y: crew.y })

        audio.command(1)
        await button.light(1)
        audio.beep()
        void FX.ping(scene, crew.x, crew.y - 40, C.ovenLight, { radius: 88 })
        await problem.nudge()
    }

    audio.wrong()
    FX.shakeCam(scene, 'leve')
    await button.fadeCommands()

    await cinema.look(problem.detail, 420)
    await pulseRequired(scene, required, problem.anchors.focus)
}
