import { Ease, FX } from '../../../../../shared/effects/FX'
import { C, CSS, FONT, TONE } from '../../data/theme'
import { SHEET } from '../../data/parts'
import { AREA, fx, setThingFrame, thing, type TrialDef } from './stage'

/** Disco: acertar o baú é a brincadeira; ficar lá depois de desligar é a lição. */
export const diskTrial: TrialDef = {
    prompt: 'Guarde os arquivos no baú.',

    run: async ctx => {
        const need = 3
        let stored = 0
        let busy = false

        ctx.note('Toque na tela quando o arquivo estiver entre as setas.')

        const boxCy = AREA.y + AREA.h - 130
        const boxW = 300
        const boxH = 170
        /** A meia-largura da janela de acerto. As setas desenham exatamente ela. */
        const laneHalf = boxW / 2 - 40

        const box = ctx.scene.add.graphics()
        ctx.layer.add(box)
        const lid = ctx.scene.add.container(AREA.cx, boxCy - boxH / 2)
        ctx.layer.add(lid)

        const lidArt = ctx.scene.add.graphics()
        lidArt.fillStyle(0x3c6f46, 1)
        lidArt.fillRoundedRect(-boxW / 2 - 10, -34, boxW + 20, 46, 12)
        lidArt.fillStyle(TONE.armazenamento, 1)
        lidArt.fillRoundedRect(-boxW / 2 - 10, -38, boxW + 20, 40, 12)
        lidArt.fillStyle(C.white, 0.22)
        lidArt.fillRoundedRect(-boxW / 2 - 2, -34, boxW + 4, 12, 6)
        lid.add(lidArt)

        const paintBox = (glow: boolean) => {
            box.clear()
            box.fillStyle(C.shadow, 0.4)
            box.fillRoundedRect(AREA.cx - boxW / 2, boxCy - boxH / 2 + 12, boxW, boxH, 20)
            box.fillStyle(glow ? 0x2f7f55 : 0x23413a, 1)
            box.fillRoundedRect(AREA.cx - boxW / 2, boxCy - boxH / 2, boxW, boxH, 20)
            box.lineStyle(6, TONE.armazenamento, glow ? 1 : 0.8)
            box.strokeRoundedRect(AREA.cx - boxW / 2, boxCy - boxH / 2, boxW, boxH, 20)
            box.fillStyle(C.ink, 0.9)
            box.fillRoundedRect(AREA.cx - boxW / 2 + 24, boxCy - boxH / 2 + 22, boxW - 48, 62, 12)
            box.fillStyle(C.gold, glow ? 1 : 0.7)
            box.fillRoundedRect(AREA.cx - 26, boxCy + 36, 52, 26, 8)
        }
        paintBox(false)

        const counter = ctx.scene.add.graphics()
        ctx.layer.add(counter)
        const paintCounter = () => {
            counter.clear()
            for (let i = 0; i < need; i++) {
                const x = AREA.cx + (i - (need - 1) / 2) * 52
                counter.fillStyle(i < stored ? TONE.armazenamento : C.bay, 1)
                counter.fillCircle(x, AREA.y + AREA.h - 18, 15)
            }
        }
        paintCounter()

        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        const dropCy = AREA.y + 120

        const rail = ctx.scene.add.graphics()
        ctx.layer.add(rail)
        rail.fillStyle(C.cyan, 0.16)
        rail.fillRoundedRect(AREA.x + 120, dropCy - 7, AREA.w - 240, 14, 7)

        /*
         * O corredor de queda, desenhado com a mesma conta do acerto: duas
         * bordas tracejadas e três setas descendo para dentro do baú. Elas
         * acendem quando o arquivo entra no corredor — é o aviso de soltar.
         */
        const chestTop = boxCy - boxH / 2
        const laneTop = dropCy + 24
        const chevronY = [laneTop + 40, laneTop + 80, laneTop + 120]

        const arrows = ctx.scene.add.graphics()
        ctx.layer.add(arrows)

        const paintArrows = (hot: boolean, tick: number) => {
            arrows.clear()
            const tone = TONE.armazenamento

            arrows.fillStyle(tone, hot ? 0.18 : 0.07)
            arrows.fillRect(AREA.cx - laneHalf, laneTop, laneHalf * 2, chestTop - laneTop)

            arrows.fillStyle(tone, hot ? 0.95 : 0.4)
            for (let y = laneTop; y < chestTop - 12; y += 28) {
                arrows.fillRect(AREA.cx - laneHalf - 3, y, 6, 16)
                arrows.fillRect(AREA.cx + laneHalf - 3, y, 6, 16)
            }

            chevronY.forEach((y, i) => {
                const lead = tick % chevronY.length === i
                const alpha = hot ? (lead ? 1 : 0.5) : lead ? 0.7 : 0.32
                arrows.fillStyle(C.shadow, alpha * 0.35)
                arrows.fillTriangle(AREA.cx - 42, y - 13, AREA.cx + 42, y - 13, AREA.cx, y + 25)
                arrows.fillStyle(tone, alpha)
                arrows.fillTriangle(AREA.cx - 42, y - 18, AREA.cx + 42, y - 18, AREA.cx, y + 20)
            })
        }
        paintArrows(false, 0)

        const file = thing(ctx, AREA.cx, dropCy, 0, 130)

        let tick = 0
        const beat = ctx.scene.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                if (!ctx.alive()) {
                    beat.remove()
                    return
                }
                tick += 1
                paintArrows(Math.abs(file.x - AREA.cx) < laneHalf, tick)
            },
        })

        const slide = ctx.scene.tweens.add({
            targets: file,
            x: AREA.x + AREA.w - 190,
            duration: 1300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
        file.setX(AREA.x + 190)

        ctx.tap(AREA.cx, AREA.cy, AREA.w, AREA.h, () => {
            if (busy || stored >= need) return
            busy = true
            slide.pause()
            ctx.audio.tap()

            const hit = Math.abs(file.x - AREA.cx) < laneHalf
            void (async () => {
                await FX.all(
                    FX.to(ctx.scene, file, { y: boxCy - 30 }, { duration: 340, ease: Ease.smooth }),
                    FX.to(ctx.scene, lid, { angle: hit ? -22 : 0 }, { duration: 220 }),
                )
                if (!ctx.alive()) return

                if (hit) {
                    stored += 1
                    ctx.audio.drop()
                    paintBox(true)
                    paintCounter()
                    await FX.to(ctx.scene, file, { y: boxCy + 20, alpha: 0, scale: 0.55 }, { duration: 240 })
                    if (!ctx.alive()) return
                    await FX.to(ctx.scene, lid, { angle: 0 }, { duration: 180 })
                    if (!ctx.alive()) return
                    paintBox(false)
                    ctx.note(stored >= need ? 'Tudo guardado!' : 'Guardado! Vai o próximo.')
                } else {
                    ctx.audio.wrong()
                    ctx.note('Caiu fora do baú. Espere ele chegar entre as setas.')
                    await FX.to(ctx.scene, file, { y: dropCy }, { duration: 320, ease: Ease.back(1.4) })
                }

                if (!ctx.alive()) return

                if (stored >= need) {
                    ctx.setTapsEnabled(false)
                    done?.()
                    return
                }

                file.setAlpha(1).setScale(1).setY(dropCy)
                setThingFrame(ctx, file, stored % 4)
                slide.resume()
                busy = false
            })()
        })

        await finished
        slide.remove()
        beat.remove()
        arrows.clear()
        if (!ctx.alive()) return

        ctx.note('Agora a máquina desliga...')
        ctx.audio.forget()
        void FX.flash(ctx.scene, C.ink, { duration: 300, peak: 0.7 })
        await ctx.wait(800)
        if (!ctx.alive()) return

        paintBox(true)
        ctx.audio.right()
        void FX.sparks(ctx.scene, AREA.cx, boxCy, { color: TONE.armazenamento, count: 22, spread: 260 })
        ctx.note('E os arquivos continuam lá dentro. É isso que ele faz.')
        await ctx.wait(1300)
    },
}

/** Pendrive: guarda igual ao disco, e ainda vai junto no bolso. */
export const stickTrial: TrialDef = {
    prompt: 'Copie os arquivos para levar.',

    run: async ctx => {
        const frames = [1, 0, 3]
        let copied = 0

        ctx.note('Toque em cada arquivo para copiar.')

        const portX = AREA.x + AREA.w - 230
        const portCy = AREA.cy + 40

        const port = ctx.scene.add.graphics()
        ctx.layer.add(port)
        port.fillStyle(C.shadow, 0.4)
        port.fillRoundedRect(portX - 20, portCy - 106, 200, 216, 18)
        port.fillStyle(C.bay, 1)
        port.fillRoundedRect(portX - 24, portCy - 110, 200, 216, 18)
        port.lineStyle(5, C.cyan, 0.4)
        port.strokeRoundedRect(portX - 24, portCy - 110, 200, 216, 18)
        port.fillStyle(C.ink, 1)
        port.fillRoundedRect(portX - 6, portCy - 34, 64, 68, 8)

        const stick = ctx.scene.add.container(portX + 40, portCy)
        ctx.layer.add(stick)

        if (ctx.quiet) {
            const blank = ctx.scene.add.graphics()
            blank.fillStyle(C.dim, 1)
            blank.fillRoundedRect(-30, -56, 120, 112, 16)
            blank.fillStyle(C.inkSoft, 1)
            blank.fillRoundedRect(-58, -26, 40, 52, 6)
            stick.add(blank)
        } else {
            const art = ctx.scene.add.image(0, 0, SHEET.key, 7).setOrigin(0.506, 0.551).setScale(1.05)
            stick.add(art)
        }

        const shelfCy = AREA.y + 190

        const shelf = ctx.scene.add.graphics()
        ctx.layer.add(shelf)
        shelf.fillStyle(C.bay, 1)
        shelf.fillRoundedRect(AREA.x + 120, shelfCy + 92, 660, 22, 11)

        const cards = frames.map((frame, i) => thing(ctx, AREA.x + 230 + i * 220, shelfCy, frame, 150))

        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        cards.forEach(card => {
            const zone = ctx.tap(card.x, card.y, 190, 190, () => {
                if (zone.input) zone.input.enabled = false
                ctx.audio.tap()
                void (async () => {
                    ctx.audio.whoosh()
                    await FX.arcTo(ctx.scene, card, { x: stick.x, y: stick.y }, { height: 150, duration: 520 })
                    if (!ctx.alive()) return
                    await FX.to(ctx.scene, card, { scale: 0.08, alpha: 0 }, { duration: 220 })
                    if (!ctx.alive()) return
                    copied += 1
                    ctx.audio.drop()
                    void FX.to(ctx.scene, stick, { scale: 1.14 }, { duration: 130, yoyo: true })
                    const left = frames.length - copied
                    ctx.note(
                        left === 0
                            ? 'Tudo copiado!'
                            : left === 1
                                ? 'Copiado! Falta um.'
                                : `Copiado! Faltam ${left}.`,
                    )
                    if (copied >= frames.length) {
                        ctx.setTapsEnabled(false)
                        done?.()
                    }
                })()
            })
        })

        await finished
        if (!ctx.alive()) return

        ctx.audio.right()
        ctx.note('E ele leva tudo junto, no bolso.')

        const bye = ctx.scene.add
            .text(stick.x, stick.y - 130, 'tchau!', {
                fontFamily: FONT.black,
                fontSize: '40px',
                color: CSS.cream,
            })
            .setOrigin(0.5)
            .setResolution(2)
        bye.setStroke(CSS.ink, 8)
        ctx.layer.add(bye)

        ctx.audio.whoosh()
        await FX.all(
            FX.to(ctx.scene, stick, { x: AREA.x + AREA.w + 180 }, { duration: 820, ease: Ease.smooth }),
            FX.to(ctx.scene, fx(bye), { x: AREA.x + AREA.w + 180, alpha: 0 }, { duration: 820 }),
        )
        await ctx.wait(360)
    },
}
