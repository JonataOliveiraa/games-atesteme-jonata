import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { DEPTH, HUD, U } from '../data/layout'
import { C } from '../data/theme'
import { ptext, ptextShadow } from './art'
import { Pix, bakePanel, bakePix, cellPix } from './pixelart'

export interface Hud {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export interface HudOptions {
    phases: number
    level: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

/** a faixa 1 do cabeçalho, em pixel art: a placa rosa do nível, as fases em quadradinhos e o ? ciano */
export function createHud(scene: Phaser.Scene, opts: HudOptions): Hud {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)
    const plateKey = bakePanel(scene, 'plate', HUD.plateW / U, HUD.plateH / U, { fill: C.pink, light: C.pinkLight, shade: C.pinkDark })
    const plate = scene.add.image(HUD.plateX + HUD.plateW / 2, HUD.y, plateKey).setScale(U)
    const label = ptextShadow(scene, `Nível ${opts.level}`, 3).setPosition(plate.x, HUD.y)
    root.add([plate, label])

    const pipKeys = {
        done: bakePix(scene, 'pip-done', cellPix(HUD.pip / U, C.lime)),
        now: bakePix(scene, 'pip-now', cellPix(HUD.pipNow / U, C.lit)),
        next: bakePix(scene, 'pip-next', hollow(HUD.pip / U)),
    }
    const pips = Array.from({ length: opts.phases }, (_, i) => scene.add.image(HUD.pipsX + i * HUD.pipGap, HUD.y, pipKeys.next).setScale(U))
    root.add(pips)
    let current = 0
    const paint = () => pips.forEach((pip, i) => pip.setTexture(i < current ? pipKeys.done : i === current ? pipKeys.now : pipKeys.next))
    paint()

    const lives = createLives(scene, {
        total: opts.livesTotal,
        remaining: opts.livesLeft,
        gameId: opts.gameId,
        x: HUD.livesX,
        y: HUD.livesY,
        size: HUD.livesSize,
        stage: opts.stage,
        depth: DEPTH.hud + 1,
    })
    lives.container.setVisible(false)

    const helpKey = bakePanel(scene, 'help', HUD.help / U, HUD.help / U, { fill: C.cyan, light: C.cyanLight, shade: C.cyanDark })
    const help = scene.add.container(HUD.helpX, HUD.y, [scene.add.image(0, 0, helpKey).setScale(U), ptext(scene, 0, 2, '?', 4, 'dark')])
    root.add(help)
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.y, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = true
    const askHelp = () => {
        if (!helpOn) return
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', askHelp)
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'h' || event.key === 'H') askHelp()
    }
    scene.input.keyboard?.on('keydown', onKey)

    const setPhase = (index: number) => {
        current = Phaser.Math.Clamp(index, 0, opts.phases)
        paint()
    }

    return {
        lives,
        setPhase,
        async celebrate(index) {
            setPhase(index + 1)
            const pip = pips[index]
            if (pip) await FX.to(scene, pip, { y: HUD.y - 8 }, { duration: 140, yoyo: true })
        },
        setHelpEnabled(on) {
            helpOn = on
            if (helpZone.input) helpZone.input.enabled = on
            help.setAlpha(on ? 1 : 0.4)
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            lives.destroy()
            root.destroy()
        },
    }
}

/** a fase que ainda vem: um quadradinho vazado */
function hollow(n: number) {
    const p = new Pix(n, n)
    p.rect(0, 0, n, n, C.outline)
    p.rect(1, 1, n - 2, n - 2, C.rimLight)
    p.rect(2, 2, n - 4, n - 4, C.panelDark)
    return p
}
