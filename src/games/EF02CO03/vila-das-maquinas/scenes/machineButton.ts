import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MACHINES } from '../data/machines'
import { CREW, DEPTH, SHED, STAGE, crewHomeY, stripHomeY } from '../data/layout'
import { C } from '../data/theme'
import { createPlaque, type Plaque } from './plaque'
import type { MachineDef, MachineId, Point } from '../types'

const SHEET = 'maquinas'

export function machineImage(scene: Phaser.Scene, machine: MachineDef, height: number) {
    if (scene.textures.exists(SHEET)) {
        const sprite = scene.add.sprite(0, 0, SHEET, machine.frame)
        sprite.setScale(height / sprite.height)
        return sprite
    }

    const g = scene.add.graphics()
    g.fillStyle(machine.dark, 1)
    g.fillRoundedRect(-height / 2, -height / 2, height, height, 22)
    g.fillStyle(machine.color, 1)
    g.fillRoundedRect(-height / 2 + 6, -height / 2 + 6, height - 12, height - 20, 18)
    return g
}

export interface MachineButtonOptions {
    machine: MachineId
    x: number
    onTap: (machine: MachineId) => void
}

/** As plaquinhas nunca passam da borda do palco. */
const stripInStage = (at: Point): Point => {
    const half = CREW.plaqueDX + CREW.plaqueW / 2
    return {
        x: Phaser.Math.Clamp(at.x, STAGE.left + half + 10, STAGE.right - half - 10),
        y: at.y,
    }
}

export function createMachineButton(scene: Phaser.Scene, options: MachineButtonOptions) {
    const machine = MACHINES[options.machine]
    const bx = options.x
    const halfW = SHED.btnW / 2
    const halfH = SHED.btnH / 2

    const shell = scene.add.graphics().setDepth(DEPTH.button)
    const paintShell = (down: boolean, spent: boolean) => {
        const drop = down ? 5 : 0
        const face = spent ? C.stoneDark : C.woodLight
        const deep = spent ? C.greyDark : C.woodDark

        shell.clear()
        shell.fillStyle(C.ink, 0.28)
        shell.fillRoundedRect(bx - halfW, SHED.cy - halfH + 14, SHED.btnW, SHED.btnH, SHED.btnR)
        shell.fillStyle(deep, 1)
        shell.fillRoundedRect(bx - halfW, SHED.cy - halfH, SHED.btnW, SHED.btnH, SHED.btnR)
        shell.fillStyle(face, 1)
        shell.fillRoundedRect(
            bx - halfW + 7,
            SHED.cy - halfH + 7 + drop,
            SHED.btnW - 14,
            SHED.btnH - 22,
            SHED.btnR - 7,
        )
        shell.fillStyle(C.white, spent ? 0.1 : 0.22)
        shell.fillRoundedRect(
            bx - halfW + 24,
            SHED.cy - halfH + 18 + drop,
            SHED.btnW - 48,
            18,
            9,
        )
        shell.fillStyle(machine.color, spent ? 0.16 : 0.4)
        shell.fillRoundedRect(bx - halfW + 22, SHED.cy - halfH + 42 + drop, SHED.btnW - 44, 84, 26)
        shell.lineStyle(5, spent ? C.greyDark : C.ink, spent ? 0.5 : 0.85)
        shell.strokeRoundedRect(bx - halfW, SHED.cy - halfH, SHED.btnW, SHED.btnH, SHED.btnR)
    }

    const crew = scene.add.container(bx, crewHomeY).setDepth(DEPTH.machine)
    const sprite = machineImage(scene, machine, CREW.machineH)
    crew.add(sprite)

    const showFrame = (frame: number) => {
        if (sprite instanceof Phaser.GameObjects.Sprite) sprite.setFrame(frame)
    }

    const strip = scene.add.container(bx, stripHomeY).setDepth(DEPTH.strip)
    const plaques: Plaque[] = machine.commands.map((command, i) =>
        createPlaque(scene, {
            command,
            x: i === 0 ? -CREW.plaqueDX : CREW.plaqueDX,
            y: 0,
        }),
    )
    plaques.forEach(plaque => strip.add(plaque.root))

    const zone = scene.add
        .zone(bx, SHED.cy, SHED.btnW, SHED.btnH)
        .setOrigin(0.5)
        .setDepth(DEPTH.button + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = false
    let spent = false
    let hint: Phaser.Tweens.Tween | null = null
    let idle: Phaser.Tweens.Tween | null = null

    paintShell(false, false)

    const stopHint = () => {
        hint?.remove()
        hint = null
        crew.setScale(1)
    }

    const startIdle = () => {
        idle?.remove()
        sprite.setPosition(0, 0).setAngle(0)
        idle = machine.id === 'drone'
            ? FX.float(scene, sprite, { amount: 7, duration: 1700 })
            : FX.wiggle(scene, sprite, { deg: 2.4, duration: 2400 })
    }

    const stopIdle = () => {
        idle?.remove()
        idle = null
        sprite.setPosition(0, 0).setAngle(0)
    }

    zone.on('pointerdown', () => {
        if (!enabled || spent) return
        paintShell(true, spent)
        options.onTap(machine.id)
    })
    zone.on('pointerup', () => paintShell(false, spent))
    zone.on('pointerout', () => paintShell(false, spent))

    startIdle()

    return {
        id: machine.id,
        machine,
        x: bx,
        sprite,
        crew,
        strip,
        plaques,

        get spent() {
            return spent
        },

        setEnabled(on: boolean) {
            enabled = on
            zone.input!.enabled = on && !spent
        },

        /**
         * O modo cena apaga o galpão. `withCrew` fica falso na máquina que
         * está trabalhando: o bay dela some, mas ela e as plaquinhas ficam.
         */
        fade(alpha: number, ms: number, withCrew = true) {
            FX.to(scene, shell, { alpha }, { duration: ms })
            if (withCrew) {
                FX.to(scene, [crew, strip], { alpha: alpha * (spent ? 0.42 : 1) }, { duration: ms })
            }
        },

        async appear(delay: number) {
            crew.setAlpha(0)
            strip.setAlpha(0)
            shell.setAlpha(0)
            await FX.wait(scene, delay)
            FX.to(scene, shell, { alpha: 1 }, { duration: 240 })
            void FX.popIn(scene, crew, { from: 0.7, duration: 380 })
            void FX.popIn(scene, strip, { from: 0.7, delay: 90, duration: 380 })
        },

        /** A máquina sobe para o palco e as plaquinhas param acima dela. */
        async lift(spot: Point, stripAt: Point) {
            stopHint()
            stopIdle()
            showFrame(machine.actionFrame)
            crew.setDepth(DEPTH.machine)
            strip.setDepth(DEPTH.strip)

            await Promise.all([
                FX.arcTo(scene, crew, spot, { height: 130, duration: 520 }),
                FX.arcTo(scene, strip, stripInStage(stripAt), { height: 90, duration: 520 }),
            ])
        },

        /**
         * As plaquinhas acompanham a máquina quando ela atravessa a cena.
         *
         * Sem isso a câmera fechada segue a máquina e deixa os comandos para
         * trás — justo eles, que são o que a criança precisa ver acontecendo.
         */
        trackStrip(to: Point, ms: number) {
            const spot = stripInStage(to)
            return FX.to(scene, strip, { x: spot.x, y: spot.y }, { duration: ms, ease: 'Sine.easeInOut' })
        },

        async land() {
            showFrame(machine.frame)
            crew.setAngle(0)
            await Promise.all([
                FX.arcTo(scene, crew, { x: bx, y: crewHomeY }, { height: 120, duration: 480 }),
                FX.arcTo(scene, strip, { x: bx, y: stripHomeY }, { height: 80, duration: 480 }),
            ])
            plaques.forEach(plaque => plaque.reset())
            startIdle()
        },

        light(index: number) {
            return plaques[index].light()
        },

        async fadeCommands() {
            for (const plaque of plaques) await plaque.fade()
        },

        resetCommands() {
            plaques.forEach(plaque => plaque.reset())
        },

        /** Aquela máquina já mostrou o que sabe: o botão fecha até a próxima missão. */
        setSpent(value: boolean) {
            spent = value
            zone.input!.enabled = enabled && !spent
            paintShell(false, spent)
            stopHint()
            if (value) stopIdle()
            else startIdle()
            FX.to(scene, [crew, strip], { alpha: value ? 0.42 : 1 }, { duration: 260 })
        },

        setHint(on: boolean) {
            if (!on || spent) {
                stopHint()
                return
            }
            if (hint) return
            hint = scene.tweens.add({
                targets: crew,
                scale: 1.08,
                duration: FX.ms(scene, 460),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        press() {
            paintShell(true, spent)
            scene.time.delayedCall(FX.ms(scene, 130), () => paintShell(false, spent))
            return FX.press(scene, crew, 0.94)
        },

        stripBounds() {
            return {
                x: bx,
                y: stripHomeY,
                w: CREW.plaqueDX * 2 + CREW.plaqueW + 18,
                h: CREW.plaqueH + 18,
            }
        },

        buttonBounds() {
            return { x: bx, y: SHED.cy, w: SHED.btnW, h: SHED.btnH }
        },

        destroy() {
            stopHint()
            stopIdle()
            FX.kill(scene, crew)
            FX.kill(scene, strip)
            plaques.forEach(plaque => plaque.destroy())
            zone.destroy()
            crew.destroy(true)
            strip.destroy(true)
            shell.destroy()
        },
    }
}

export type MachineButton = ReturnType<typeof createMachineButton>
