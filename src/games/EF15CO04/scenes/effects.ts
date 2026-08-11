import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { C, A, hex } from '../data/theme'
import { W, H, CARD, STAGE, TIMELINE } from '../data/layout'

export interface MissionSceneView {
    container: Phaser.GameObjects.Container
    toStage: (onDone?: () => void) => void
    toCorner: (x: number, y: number, scale: number, onDone?: () => void) => void
    reveal: (ratio: number, onDone?: () => void) => void
    celebrate: (onDone?: () => void) => void
    worldPoint: () => { x: number; y: number }
    destroy: () => void
}

export interface TornCard {
    container: Phaser.GameObjects.Container
    tear: (pieces: number, onDone?: () => void) => void
    fadeOut: (onDone?: () => void) => void
}

export function createMissionScene(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    beforeKey: string,
    afterKey: string,
): MissionSceneView {
    const container = scene.add.container(STAGE.x, STAGE.y)

    const frame = scene.add.graphics()
    const before = scene.add.image(0, 0, beforeKey)
    const after = scene.add.image(0, 0, afterKey).setAlpha(0)

    const scale = Math.min(STAGE.w / before.width, STAGE.h / before.height)
    before.setScale(scale)
    after.setScale(scale)

    const boxW = before.width * scale
    const boxH = before.height * scale

    frame.fillStyle(C.shadow, 0.3)
    frame.fillRoundedRect(-boxW / 2 + 5, -boxH / 2 + 12, boxW, boxH, 22)
    frame.lineStyle(7, C.paperEdge, 1)
    frame.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 22)

    const mask = scene.make.graphics({})
    const applyMask = () => {
        mask.clear()
        mask.fillStyle(0xffffff, 1)
        mask.fillRoundedRect(
            container.x - (boxW / 2) * container.scaleX,
            container.y - (boxH / 2) * container.scaleY,
            boxW * container.scaleX,
            boxH * container.scaleY,
            22 * container.scaleX,
        )
    }
    applyMask()
    before.setMask(mask.createGeometryMask())
    after.setMask(mask.createGeometryMask())

    const glow = scene.add.graphics()
    const paintGlow = (alpha: number) => {
        glow.clear()
        if (alpha <= 0) return
        glow.fillStyle(C.gold, alpha * 0.22)
        glow.fillRoundedRect(-boxW / 2 - 26, -boxH / 2 - 26, boxW + 52, boxH + 52, 34)
    }
    paintGlow(0)

    container.add([glow, frame, before, after])
    layer.add(container)

    let follow: Phaser.Tweens.Tween | undefined

    const trackMask = () => {
        follow?.remove()
        follow = scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 760,
            onUpdate: applyMask,
            onComplete: applyMask,
        })
    }

    return {
        container,

        toStage: (onDone) => {
            scene.tweens.add({
                targets: container,
                x: STAGE.x,
                y: STAGE.y,
                scale: 1,
                duration: 700,
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    applyMask()
                    onDone?.()
                },
            })
            trackMask()
        },

        toCorner: (x, y, s, onDone) => {
            scene.tweens.add({
                targets: container,
                x,
                y,
                scale: s,
                duration: 700,
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    applyMask()
                    onDone?.()
                },
            })
            trackMask()
        },

        reveal: (ratio, onDone) => {
            const target = Phaser.Math.Clamp(ratio, 0, 1)
            scene.tweens.add({
                targets: after,
                alpha: target,
                duration: 620,
                ease: 'Sine.easeInOut',
                onComplete: () => onDone?.(),
            })
            scene.tweens.add({
                targets: { v: 0 },
                v: 1,
                duration: 620,
                onUpdate: (_tw, t) => paintGlow(t.v * target * 0.8),
            })
        },

        celebrate: (onDone) => {
            after.setAlpha(1)
            scene.tweens.add({
                targets: container,
                scaleX: container.scaleX * 1.04,
                scaleY: container.scaleY * 0.97,
                duration: 180,
                yoyo: true,
                ease: 'Sine.easeOut',
                onUpdate: applyMask,
            })
            scene.tweens.add({
                targets: { v: 0 },
                v: 1,
                duration: 420,
                onUpdate: (_tw, t) => paintGlow(0.4 + Math.sin(t.v * Math.PI) * 0.5),
            })
            EventBus.emit('sparks', { x: container.x, y: container.y, color: C.gold, count: 34, spread: 280 })
            EventBus.emit('stage-flash', C.paper)
            scene.time.delayedCall(620, () => onDone?.())
        },

        worldPoint: () => ({ x: container.x, y: container.y }),

        destroy: () => {
            follow?.remove()
            mask.destroy()
            container.destroy()
        },
    }
}

export function buildProblemCard(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    title: string,
    text: string,
): TornCard {
    const container = scene.add.container(CARD.cx, CARD.cy)
    const w = CARD.w
    const h = CARD.h

    const paintSheet = (g: Phaser.GameObjects.Graphics, pw: number, ph: number) => {
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-pw / 2 + 4, -ph / 2 + 10, pw, ph, CARD.r)
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, CARD.r)
        g.fillStyle(C.paperSoft, 1)
        g.fillRoundedRect(-pw / 2, -ph / 2, pw, 44, { tl: CARD.r, tr: CARD.r, bl: 0, br: 0 })
        g.lineStyle(5, C.paperEdge, 1)
        g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, CARD.r)
        g.fillStyle(C.amber, 1)
        g.fillCircle(-pw / 2 + 30, -ph / 2 + 22, 7)
        g.fillCircle(pw / 2 - 30, -ph / 2 + 22, 7)
    }

    const sheet = scene.add.graphics()
    paintSheet(sheet, w, h)

    const titleText = scene.add.text(0, CARD.titleDY, title, {
        fontFamily: 'Arial Black, Arial',
        fontSize: CARD.titleSize,
        color: hex(C.inkSoft),
    }).setOrigin(0.5).setResolution(2)

    const bodyText = scene.add.text(0, CARD.textDY, text, {
        fontFamily: 'Arial Black, Arial',
        fontSize: CARD.textSize,
        color: hex(C.ink),
        align: 'center',
        wordWrap: { width: w - 70 },
    }).setOrigin(0.5).setResolution(2)

    container.add([sheet, titleText, bodyText])
    layer.add(container)

    container.setAlpha(0).setScale(0.86)
    scene.tweens.add({ targets: container, alpha: 1, scale: 1, duration: 480, ease: 'Back.easeOut' })

    const tear = (pieces: number, onDone?: () => void) => {
        scene.tweens.add({
            targets: container,
            x: CARD.cx + 6,
            duration: 52,
            yoyo: true,
            repeat: 4,
            onComplete: () => container.setX(CARD.cx),
        })

        scene.time.delayedCall(340, () => {
            const line = scene.add.graphics().setDepth(60)
            const cut = { v: 0 }

            scene.tweens.add({
                targets: cut,
                v: 1,
                duration: 260,
                ease: 'Cubic.easeIn',
                onUpdate: () => {
                    line.clear()
                    line.fillStyle(C.white, 1)
                    line.fillRect(CARD.cx - 4, CARD.cy - (h / 2) * cut.v, 8, h * cut.v)
                },
                onComplete: () => {
                    line.destroy()
                    if (!scene.sys?.isActive()) return
                    EventBus.emit('paper-dust', { x: CARD.cx, y: CARD.cy, count: 24, spread: 170 })

                    titleText.destroy()
                    bodyText.destroy()
                    sheet.destroy()

                    const pieceW = w / pieces
                    for (let i = 0; i < pieces; i++) {
                        const frag = scene.add.graphics()
                        const cx = -w / 2 + pieceW / 2 + i * pieceW
                        frag.fillStyle(C.paper, 1)
                        frag.fillRoundedRect(cx - pieceW / 2 + 5, -h / 2, pieceW - 10, h, 12)
                        frag.lineStyle(4, C.paperEdge, 1)
                        frag.strokeRoundedRect(cx - pieceW / 2 + 5, -h / 2, pieceW - 10, h, 12)
                        container.add(frag)

                        const dir = i - (pieces - 1) / 2
                        scene.tweens.add({
                            targets: frag,
                            x: dir * CARD.tornOffset,
                            y: Phaser.Math.Between(-14, 22),
                            angle: dir * 9,
                            alpha: 0,
                            duration: 560,
                            delay: 60,
                            ease: 'Back.easeIn',
                            onComplete: () => frag.destroy(),
                        })
                    }

                    scene.time.delayedCall(600, () => onDone?.())
                },
            })
        })
    }

    const fadeOut = (onDone?: () => void) => {
        scene.tweens.add({
            targets: container,
            alpha: 0,
            scale: 0.9,
            duration: 300,
            ease: 'Sine.easeIn',
            onComplete: () => {
                container.destroy()
                onDone?.()
            },
        })
    }

    return { container, tear, fadeOut }
}

export function flyToSlot(
    scene: Phaser.Scene,
    piece: Phaser.GameObjects.Container,
    to: { x: number; y: number },
    onDone?: () => void,
) {
    const from = { x: piece.x, y: piece.y }
    const peak = Math.min(from.y, to.y) - 90
    const t = { v: 0 }

    scene.tweens.add({
        targets: t,
        v: 1,
        duration: 480,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
            const inv = 1 - t.v
            piece.x = inv * inv * from.x + 2 * inv * t.v * ((from.x + to.x) / 2) + t.v * t.v * to.x
            piece.y = inv * inv * from.y + 2 * inv * t.v * peak + t.v * t.v * to.y
            piece.setScale(1 - t.v * 0.14)
            piece.setAngle(Math.sin(t.v * Math.PI) * 7)
        },
        onComplete: () => {
            piece.setAngle(0)
            onDone?.()
        },
    })
}

export function stampApproved(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    x: number,
    y: number,
    onDone?: () => void,
) {
    const stamp = scene.add.container(x, y).setDepth(80)
    const g = scene.add.graphics()

    g.lineStyle(7, C.green, 1)
    g.strokeCircle(0, 0, 44)
    g.lineStyle(4, C.green, 0.75)
    g.strokeCircle(0, 0, 52)
    g.lineStyle(9, C.green, 1)
    g.lineBetween(-17, 3, -5, 16)
    g.lineBetween(-5, 16, 20, -15)

    stamp.add(g)
    layer.add(stamp)

    stamp.setScale(2.6).setAlpha(0).setAngle(-22)
    scene.tweens.add({
        targets: stamp,
        scale: 1,
        alpha: 1,
        angle: -12,
        duration: 220,
        ease: 'Back.easeIn',
        onComplete: () => {
            scene.cameras.main.shake(90, 0.003)
            EventBus.emit('sparks', { x, y, color: C.green, count: 12, spread: 110 })
            scene.tweens.add({
                targets: stamp,
                alpha: 0,
                scale: 1.2,
                duration: 420,
                delay: 340,
                onComplete: () => {
                    stamp.destroy()
                    onDone?.()
                },
            })
        },
    })
}

export function rejectShake(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container,
    onDone?: () => void,
) {
    const baseX = target.x
    scene.tweens.add({
        targets: target,
        x: baseX + 13,
        duration: 58,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => {
            target.setX(baseX)
            onDone?.()
        },
    })
    scene.tweens.add({
        targets: target,
        angle: -5,
        duration: 58,
        yoyo: true,
        repeat: 3,
        onComplete: () => target.setAngle(0),
    })
}

export function foldIntoModule(
    scene: Phaser.Scene,
    source: Phaser.GameObjects.Container,
    to: { x: number; y: number },
    tone: number,
    onDone?: () => void,
) {
    scene.tweens.add({
        targets: source,
        scaleY: 0.12,
        duration: 260,
        ease: 'Cubic.easeIn',
        onComplete: () => {
            const chip = scene.add.container(source.x, source.y).setDepth(90)
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.24)
            g.fillRoundedRect(-88, -24, 176, 56, 16)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-88, -30, 176, 56, 16)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-80, -25, 160, 16, 8)
            chip.add(g)

            source.destroy()

            scene.tweens.add({
                targets: chip,
                x: to.x,
                y: to.y,
                scale: 0.9,
                duration: 520,
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    scene.tweens.add({
                        targets: chip,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => {
                            chip.destroy()
                            onDone?.()
                        },
                    })
                },
            })
        },
    })
}

export function popFromBox(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    from: { x: number; y: number },
    to: { x: number; y: number },
    label: string,
    onDone?: () => void,
) {
    const chip = scene.add.container(from.x, from.y).setDepth(90)
    const g = scene.add.graphics()
    g.fillStyle(C.gold, 0.3)
    g.fillRoundedRect(-104, -34, 208, 68, 20)
    g.fillStyle(C.violet, 1)
    g.fillRoundedRect(-96, -28, 192, 56, 16)
    g.fillStyle(C.white, A.gloss)
    g.fillRoundedRect(-88, -23, 176, 16, 8)

    const t = scene.add.text(0, 0, label, {
        fontFamily: 'Arial Black, Arial',
        fontSize: '19px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 170 },
    }).setOrigin(0.5).setResolution(2)

    chip.add([g, t])
    layer.add(chip)

    chip.setScale(0.4).setAlpha(0)
    scene.tweens.add({ targets: chip, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' })

    scene.time.delayedCall(420, () => {
        EventBus.emit('sparks', { x: from.x, y: from.y, color: C.gold, count: 10, spread: 90 })
        scene.tweens.add({
            targets: chip,
            x: to.x,
            y: to.y,
            scale: 0.86,
            duration: 560,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                scene.tweens.add({
                    targets: chip,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        chip.destroy()
                        onDone?.()
                    },
                })
            },
        })
    })
}

export function sweepTimeline(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Graphics,
    totalMinutes: number,
    laneCount: number,
    onTick: (minute: number) => void,
    onDone?: () => void,
) {
    const state = { m: 0 }
    const height = laneCount * TIMELINE.laneH + (laneCount - 1) * TIMELINE.laneGap
    let last = -1

    scene.tweens.add({
        targets: state,
        m: totalMinutes,
        duration: Math.max(1400, totalMinutes * 46),
        ease: 'Linear',
        onUpdate: () => {
            const x = TIMELINE.x + state.m * TIMELINE.unit
            layer.clear()
            layer.fillStyle(C.gold, 0.16)
            layer.fillRect(TIMELINE.x, TIMELINE.y - 14, x - TIMELINE.x, height + 28)
            layer.fillStyle(C.amber, 1)
            layer.fillRect(x - 3, TIMELINE.y - 20, 6, height + 40)
            layer.fillStyle(C.gold, 1)
            layer.fillCircle(x, TIMELINE.y - 24, 10)

            const minute = Math.floor(state.m)
            if (minute === last) return
            last = minute
            onTick(minute)
        },
        onComplete: () => {
            layer.clear()
            onDone?.()
        },
    })
}

export function drawClockHand(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    r: number,
    ratio: number,
) {
    g.clear()
    g.fillStyle(C.shadow, 0.24)
    g.fillCircle(cx, cy + 5, r)
    g.fillStyle(C.paper, 1)
    g.fillCircle(cx, cy, r)
    g.lineStyle(5, C.paperEdge, 1)
    g.strokeCircle(cx, cy, r)

    for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12 - Math.PI / 2
        g.lineStyle(i % 3 === 0 ? 4 : 2, C.inkSoft, i % 3 === 0 ? 1 : 0.5)
        g.lineBetween(
            cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12),
            cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5),
        )
    }

    const angle = ratio * Math.PI * 2 - Math.PI / 2
    g.lineStyle(6, C.coral, 1)
    g.lineBetween(cx, cy, cx + Math.cos(angle) * (r - 18), cy + Math.sin(angle) * (r - 18))
    g.fillStyle(C.coral, 1)
    g.fillCircle(cx, cy, 7)
    g.fillStyle(C.paper, 1)
    g.fillCircle(cx, cy, 3)
}

export function pinBoard(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, r: number, pinR: number) {
    g.clear()
    g.fillStyle(C.shadow, 0.28)
    g.fillRoundedRect(x + 5, y + 12, w, h, r)
    g.fillStyle(C.cork, 1)
    g.fillRoundedRect(x, y, w, h, r)
    g.fillStyle(C.corkDark, 0.28)
    for (let i = 0; i < 90; i++) {
        const px = x + Phaser.Math.Between(14, w - 14)
        const py = y + Phaser.Math.Between(14, h - 14)
        g.fillCircle(px, py, Phaser.Math.Between(2, 5))
    }
    g.lineStyle(9, C.woodDark, 1)
    g.strokeRoundedRect(x, y, w, h, r)
    g.lineStyle(4, C.wood, 1)
    g.strokeRoundedRect(x + 6, y + 6, w - 12, h - 12, r - 6)

    const pins: Array<[number, number]> = [
        [x + 30, y + 28],
        [x + w - 30, y + 28],
        [x + 30, y + h - 28],
        [x + w - 30, y + h - 28],
    ]
    pins.forEach(([px, py]) => {
        g.fillStyle(C.shadow, 0.3)
        g.fillCircle(px + 2, py + 4, pinR)
        g.fillStyle(C.coral, 1)
        g.fillCircle(px, py, pinR)
        g.fillStyle(C.white, 0.6)
        g.fillCircle(px - 3, py - 4, pinR * 0.36)
    })
}

export function fadeLayer(
    scene: Phaser.Scene,
    layer: Phaser.GameObjects.Container,
    to: number,
    duration = 380,
    onDone?: () => void,
) {
    if (to > 0) layer.setVisible(true)
    scene.tweens.add({
        targets: layer,
        alpha: to,
        duration,
        ease: to > 0 ? 'Sine.easeOut' : 'Sine.easeIn',
        onComplete: () => {
            if (to <= 0) layer.setVisible(false)
            onDone?.()
        },
    })
}

export function veilIn(scene: Phaser.Scene, onDone?: () => void) {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.night, 1).setDepth(880)
    scene.tweens.add({
        targets: veil,
        alpha: 0,
        duration: 380,
        ease: 'Sine.easeOut',
        onComplete: () => {
            veil.destroy()
            onDone?.()
        },
    })
}