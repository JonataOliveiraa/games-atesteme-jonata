import Phaser from 'phaser'
import { Ease, FX } from '../../../../../shared/effects/FX'
import { C, TONE } from '../../data/theme'
import { AREA, type TrialCtx, type TrialDef } from './stage'

interface Plug {
    tone: number
    holder: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    root: { x: number; y: number }
    home: { x: number; y: number }
    placed: boolean
}

const COLORS = [TONE.entrada, C.gold, 0xe36a5c]

/** O plugue TAMPA o buraco: ele é um tico maior que a boca da tomada. */
const SOCKET = { w: 148, h: 112 } as const
const PLUG = { w: 156, h: 120, neck: 26 } as const

function drawCable(
    g: Phaser.GameObjects.Graphics,
    tone: number,
    from: { x: number; y: number },
    to: { x: number; y: number },
) {
    const midX = (from.x + to.x) / 2
    const sag = Math.min(150, 60 + Math.abs(to.x - from.x) * 0.22)
    const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(from.x, from.y),
        new Phaser.Math.Vector2(midX, Math.max(from.y, to.y) + sag),
        new Phaser.Math.Vector2(to.x, to.y),
    )
    g.lineStyle(26, C.ink, 1)
    curve.draw(g, 32)
    g.lineStyle(18, tone, 1)
    curve.draw(g, 32)
    g.lineStyle(5, C.white, 0.22)
    curve.draw(g, 32)
}

/**
 * O fecho de cada máquina: energia não é informação.
 *
 * Aqui o gesto é ARRASTAR — é o único do jogo, e é de propósito: ligar um cabo
 * é puxar e encaixar, não apontar. O cabo acompanha o dedo com barriga.
 */
export const powerTrial: TrialDef = {
    prompt: 'Ligue os cabos na cor certa.',

    run: async ctx => {
        const pairs = 3
        const tones = COLORS.slice(0, pairs)
        const socketOrder = [1, 2, 0]

        ctx.note('Arraste cada cabo até o buraco da mesma cor.')

        const rootX = AREA.x + 70
        const socketX = AREA.x + AREA.w - 180
        const spread = 160
        const firstY = AREA.cy - spread
        const wallTop = firstY - 100
        const wallH = spread * 2 + 200

        const wall = ctx.scene.add.graphics()
        ctx.layer.add(wall)
        wall.fillStyle(C.shadow, 0.4)
        wall.fillRoundedRect(socketX - 116, wallTop + 6, 236, wallH, 26)
        wall.fillStyle(C.bay, 1)
        wall.fillRoundedRect(socketX - 120, wallTop, 236, wallH, 26)
        wall.lineStyle(5, C.cyan, 0.35)
        wall.strokeRoundedRect(socketX - 120, wallTop, 236, wallH, 26)

        const sockets = tones.map((_, i) => ({
            x: socketX,
            y: firstY + i * spread,
            tone: tones[socketOrder[i]],
            taken: false,
        }))

        const board = ctx.scene.add.graphics()
        ctx.layer.add(board)
        const paintBoard = () => {
            board.clear()
            sockets.forEach(socket => {
                board.fillStyle(C.ink, 1)
                board.fillRoundedRect(socket.x - SOCKET.w / 2, socket.y - SOCKET.h / 2, SOCKET.w, SOCKET.h, 18)
                board.lineStyle(7, socket.tone, socket.taken ? 1 : 0.85)
                board.strokeRoundedRect(socket.x - SOCKET.w / 2, socket.y - SOCKET.h / 2, SOCKET.w, SOCKET.h, 18)
                if (!socket.taken) {
                    board.fillStyle(socket.tone, 0.18)
                    board.fillRoundedRect(socket.x - SOCKET.w / 2 + 12, socket.y - SOCKET.h / 2 + 12, SOCKET.w - 24, SOCKET.h - 24, 12)
                    board.fillStyle(C.ink, 1)
                    board.fillCircle(socket.x - 26, socket.y, 15)
                    board.fillCircle(socket.x + 26, socket.y, 15)
                }
            })
        }
        paintBoard()

        const wires = ctx.scene.add.graphics()
        ctx.layer.add(wires)

        const anchors = ctx.scene.add.graphics()
        ctx.layer.add(anchors)

        let linked = 0
        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        const plugs: Plug[] = []

        const paintWires = () => {
            wires.clear()
            anchors.clear()
            plugs.forEach(plug => {
                const tip = { x: plug.holder.x - PLUG.w / 2 - PLUG.neck + 6, y: plug.holder.y }
                drawCable(wires, plug.tone, plug.root, tip)
                anchors.fillStyle(C.ink, 1)
                anchors.fillRoundedRect(plug.root.x - 34, plug.root.y - 34, 52, 68, 14)
                anchors.fillStyle(plug.tone, 1)
                anchors.fillRoundedRect(plug.root.x - 28, plug.root.y - 28, 44, 56, 10)
            })
        }

        tones.forEach((tone, i) => {
            const home = { x: AREA.x + 330, y: firstY + i * spread }
            const holder = ctx.scene.add.container(home.x, home.y)
            ctx.layer.add(holder)

            const art = ctx.scene.add.graphics()
            const hw = PLUG.w / 2
            const hh = PLUG.h / 2
            art.fillStyle(C.ink, 1)
            art.fillRoundedRect(-hw - PLUG.neck, -22, PLUG.neck + 20, 44, 12)
            art.fillStyle(tone, 1)
            art.fillRoundedRect(-hw - PLUG.neck + 4, -17, PLUG.neck + 14, 34, 9)
            art.fillStyle(C.shadow, 0.35)
            art.fillRoundedRect(-hw + 4, -hh + 8, PLUG.w, PLUG.h, 20)
            art.fillStyle(C.ink, 1)
            art.fillRoundedRect(-hw, -hh, PLUG.w, PLUG.h, 20)
            art.fillStyle(tone, 1)
            art.fillRoundedRect(-hw + 6, -hh + 6, PLUG.w - 12, PLUG.h - 12, 15)
            art.fillStyle(C.white, 0.28)
            art.fillRoundedRect(-hw + 14, -hh + 12, PLUG.w - 28, 22, 10)
            art.fillStyle(C.ink, 0.35)
            art.fillRoundedRect(-14, -hh + 46, 10, 40, 5)
            art.fillRoundedRect(6, -hh + 46, 10, 40, 5)
            holder.add(art)

            const plug: Plug = {
                tone,
                holder,
                zone: undefined as unknown as Phaser.GameObjects.Zone,
                root: { x: rootX, y: home.y },
                home,
                placed: false,
            }

            plug.zone = ctx.drag(holder, 220, 170, {
                onStart: () => {
                    if (plug.placed) return
                    ctx.audio.tap()
                    ctx.layer.bringToTop(holder)
                    void FX.to(ctx.scene, holder, { scale: 1.12 }, { duration: 140 })
                },

                onMove: (x, y) => {
                    if (plug.placed) return
                    holder.setPosition(x, y)
                    paintWires()
                },

                onDrop: (x, y) => {
                    if (plug.placed) return

                    const target = sockets.find(
                        socket =>
                            !socket.taken
                            && Math.abs(socket.x - x) < 150
                            && Math.abs(socket.y - y) < spread / 2,
                    )

                    if (!target) {
                        ctx.audio.wrong()
                        ctx.note('Solte o cabo em cima de um buraco.')
                        void FX.to(ctx.scene, holder, { x: plug.home.x, y: plug.home.y, scale: 1 }, {
                            duration: 320,
                            ease: Ease.back(1.2),
                        }).then(() => {
                            plug.zone.setPosition(plug.home.x, plug.home.y)
                            paintWires()
                        })
                        return
                    }

                    if (target.tone !== plug.tone) {
                        ctx.audio.wrong()
                        ctx.note('Esse buraco é de outra cor.')
                        void FX.to(ctx.scene, holder, { x: plug.home.x, y: plug.home.y, scale: 1 }, {
                            duration: 320,
                            ease: Ease.back(1.2),
                        }).then(() => {
                            plug.zone.setPosition(plug.home.x, plug.home.y)
                            paintWires()
                        })
                        return
                    }

                    plug.placed = true
                    target.taken = true
                    linked += 1
                    if (plug.zone.input) plug.zone.input.enabled = false
                    ctx.audio.plug()
                    paintBoard()

                    void (async () => {
                        await FX.to(ctx.scene, holder, { x: target.x, y: target.y, scale: 1 }, {
                            duration: 240,
                            ease: Ease.back(1.6),
                        })
                        if (!ctx.alive()) return
                        paintWires()
                        void FX.sparks(ctx.scene, target.x, target.y, {
                            color: plug.tone,
                            count: 16,
                            spread: 200,
                        })
                        const left = pairs - linked
                        ctx.note(
                            left === 0
                                ? 'Energia ligada!'
                                : left === 1
                                    ? 'Encaixou! Falta um.'
                                    : `Encaixou! Faltam ${left}.`,
                        )
                        if (linked >= pairs) {
                            ctx.setTapsEnabled(false)
                            done?.()
                        }
                    })()
                },
            })

            plugs.push(plug)
        })

        paintWires()

        await finished
        if (!ctx.alive()) return

        ctx.audio.powerOn()
        ctx.note('Energia não é informação: ela só faz o resto funcionar.')
        await pulseWires(ctx, wires, plugs)
        await ctx.wait(900)
    },
}

async function pulseWires(
    ctx: TrialCtx,
    wires: Phaser.GameObjects.Graphics,
    plugs: Plug[],
): Promise<void> {
    const glow = ctx.scene.add.graphics().setAlpha(0)
    ctx.layer.add(glow)
    plugs.forEach(plug => {
        const tip = { x: plug.holder.x - PLUG.w / 2 - PLUG.neck + 6, y: plug.holder.y }
        drawCable(glow, C.white, plug.root, tip)
    })
    await FX.to(ctx.scene, glow, { alpha: 0.75 }, { duration: 220, yoyo: true, repeat: 1 })
    glow.destroy()
    wires.setAlpha(1)
}
