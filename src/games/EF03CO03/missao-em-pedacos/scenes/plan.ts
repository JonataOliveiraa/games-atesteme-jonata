import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, FOCUS, H, PLAN, W } from '../data/layout'
import { tripSlots } from '../data/rules'
import { C, CSS, FONT } from '../data/theme'
import type { Item, Task, Trip } from '../types'

export interface PlanState {
    /** Os itens que ainda estão na mesa. */
    shelf: Item[]
    trips: Trip[]
    /** O item que a criança pegou e ainda não pôs em painel nenhum. */
    picked: string | null
    done: boolean[]
    mode: 'cutting' | 'choosing' | 'idle'
}

export interface PlanCallbacks {
    onItem: (item: Item) => void
    onTripItem: (tripIndex: number, item: Item) => void
    onTrip: (tripIndex: number) => void
    onGo: () => void
}

/**
 * O CORTE, em dois toques: toque no objeto, toque no painel.
 *
 * Cada metade da tarefa mora num PAINEL de borda pontilhada com quatro lugares
 * em fila. Antes era um caixote, e antes disso uma mochila desenhada em
 * `Graphics`. O painel ganhou porque ele não finge ser objeto nenhum: é uma
 * superfície onde as coisas são postas, e a criança lê os quatro lugares de
 * relance.
 *
 * NADA PULSA AQUI. O objeto na mão fica levantado e com a etiqueta dourada; o
 * painel que aceita ganha uma setinha em cima. Anel amarelo piscando em cima do
 * objeto E do painel ao mesmo tempo dizia "olhe para os dois" — que é o oposto
 * de indicar para onde ir.
 */
export function createPlan(scene: Phaser.Scene, callbacks: PlanCallbacks) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.plan).setScrollFactor(0)

    // O véu da escolha entra ANTES dos painéis: eles ficam por cima dele.
    const veil = scene.add
        .rectangle(W / 2, H / 2, W, H, C.ink, FOCUS.veil)
        .setScrollFactor(0)
        .setVisible(false)
    const shadows = scene.add.graphics().setScrollFactor(0)
    const marks = scene.add.graphics().setScrollFactor(0)
    root.add([shadows, veil, marks])

    const focusTitle = scene.add
        .text(W / 2, FOCUS.titleY, 'Qual você vai fazer primeiro?', {
            fontFamily: FONT.black,
            fontSize: '42px',
            color: CSS.white,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setScrollFactor(0)
        .setVisible(false)
    focusTitle.setStroke(CSS.ink, 9)
    root.add(focusTitle)

    const goButton = scene.add.container(PLAN.go.cx, PLAN.go.cy).setScrollFactor(0)
    const goFace = scene.add.graphics()
    const goLabel = scene.add
        .text(0, -6, 'VAMOS!', {
            fontFamily: FONT.black,
            fontSize: '36px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    goLabel.setStroke(CSS.ink, 7)

    const paintGo = () => {
        const w = PLAN.go.w
        const h = PLAN.go.h
        goFace.clear()
        goFace.fillStyle(C.ink, 1)
        goFace.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 28)
        goFace.fillStyle(C.okDark, 1)
        goFace.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
        goFace.fillStyle(C.ok, 1)
        goFace.fillRoundedRect(-w / 2, -h / 2, w, h - 13, 24)
        goFace.fillStyle(C.white, 0.3)
        goFace.fillRoundedRect(-w / 2 + 16, -h / 2 + 11, w - 32, 16, 8)
        goFace.fillStyle(C.ink, 1)
        goFace.fillTriangle(10, h / 2 - 2, 66, h / 2 - 2, 30, h / 2 + 38)
        goFace.fillStyle(C.okDark, 1)
        goFace.fillTriangle(16, h / 2 - 6, 58, h / 2 - 6, 32, h / 2 + 28)
    }
    paintGo()
    goButton.add([goFace, goLabel])
    goButton.setVisible(false)
    root.add(goButton)

    let task: Task | null = null
    let sheet = ''
    let state: PlanState = { shelf: [], trips: [], picked: null, done: [], mode: 'idle' }
    let lastMode: PlanState['mode'] = 'idle'
    let tripArt: Phaser.GameObjects.Container[] = []
    let shelfArt: Phaser.GameObjects.GameObject[] = []
    let flying: Phaser.GameObjects.Image[] = []
    let zones: Phaser.GameObjects.Zone[] = []

    const focused = () => state.mode === 'choosing'

    const tripCenter = (index: number) => {
        const count = state.trips.length || 2
        if (focused()) {
            const width = PLAN.panels.w * FOCUS.scale
            const total = count * width + (count - 1) * FOCUS.gap
            const x0 = W / 2 - total / 2 + width / 2
            return { x: x0 + index * (width + FOCUS.gap), y: FOCUS.cy }
        }
        const total = count * PLAN.panels.w + (count - 1) * PLAN.panels.gap
        const x0 = PLAN.panels.cx - total / 2 + PLAN.panels.w / 2
        return { x: x0 + index * (PLAN.panels.w + PLAN.panels.gap), y: PLAN.panels.cy }
    }

    /** O nome do grupo, escrito na tarja de cima do painel. */
    const paintTitle = (
        g: Phaser.GameObjects.Graphics,
        text: Phaser.GameObjects.Text,
        name: string,
        done: boolean,
    ) => {
        const w = PLAN.panels.w
        const h = PLAN.panels.h
        const { rise, h: tabH, face } = PLAN.tab
        const top = -h / 2 - rise
        g.clear()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-w / 2 + 30, top, w - 60, tabH, 16)
        g.fillStyle(done ? C.okDark : C.warnDark, 1)
        g.fillRoundedRect(-w / 2 + 34, top + 4, w - 68, tabH - 8, 13)
        g.fillStyle(done ? C.ok : C.warn, 1)
        g.fillRoundedRect(-w / 2 + 34, top + 4, w - 68, face, 13)
        // no meio da face clara, que é a parte que aparece
        text.setText(name.toUpperCase()).setPosition(0, top + 4 + face / 2)
    }

    /** Quantos lugares o painel tem: um por objeto da metade (o bolo tem dois). */
    const slotsOf = (tripIndex: number) => (task ? tripSlots(task, tripIndex) : 4)

    /** Os lugares, em fila e centrados dentro do painel. */
    const slotLocal = (tripIndex: number, slotIndex: number) => {
        const count = slotsOf(tripIndex)
        const span = count * PLAN.panels.slot + (count - 1) * PLAN.panels.slotGap
        return {
            x:
                -span / 2 +
                PLAN.panels.slot / 2 +
                slotIndex * (PLAN.panels.slot + PLAN.panels.slotGap),
            y: 0,
        }
    }

    const slotCenter = (tripIndex: number, slotIndex: number) => {
        const trip = tripCenter(tripIndex)
        const local = slotLocal(tripIndex, slotIndex)
        const scale = focused() ? FOCUS.scale : 1
        return { x: trip.x + local.x * scale, y: trip.y + local.y * scale }
    }

    /** O lugar do objeto na mesa é FIXO: sai de um painel, volta para o mesmo. */
    const shelfCenter = (index: number) => {
        const count = task?.items.length ?? 8
        const x0 = PLAN.table.cx - ((count - 1) * PLAN.shelf.pitch) / 2
        return { x: x0 + index * PLAN.shelf.pitch, y: PLAN.shelf.cy }
    }

    const clearZones = () => {
        zones.forEach(zone => zone.destroy())
        zones = []
    }

    const clearFlying = () => {
        flying.forEach(image => {
            scene.tweens.killTweensOf(image)
            image.destroy()
        })
        flying = []
    }

    const paintPanel = (g: Phaser.GameObjects.Graphics, done: boolean, tripIndex: number) => {
        const w = PLAN.panels.w
        const h = PLAN.panels.h
        const edge = done ? C.okDark : C.ink
        g.clear()

        g.fillStyle(edge, 1)
        g.fillRoundedRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 24)
        g.fillStyle(done ? 0xe8f7ee : C.card, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
        g.fillStyle(C.white, 0.7)
        g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, 10, 5)

        const s = PLAN.panels.slot
        for (let i = 0; i < slotsOf(tripIndex); i++) {
            const local = slotLocal(tripIndex, i)
            g.fillStyle(C.ink, 0.1)
            g.fillRoundedRect(local.x - s / 2, local.y - s / 2, s, s, 14)
            g.lineStyle(3, C.ink, 0.22)
            g.strokeRoundedRect(local.x - s / 2, local.y - s / 2, s, s, 14)
        }

        if (!done) return
        g.fillStyle(C.ink, 0.25)
        g.fillCircle(w / 2 - 12, -h / 2 + 6, 30)
        g.fillStyle(C.ok, 1)
        g.fillCircle(w / 2 - 14, -h / 2 + 2, 30)
        g.lineStyle(8, C.white, 1)
        g.beginPath()
        g.moveTo(w / 2 - 30, -h / 2 + 2)
        g.lineTo(w / 2 - 19, -h / 2 + 14)
        g.lineTo(w / 2 + 1, -h / 2 - 12)
        g.strokePath()
    }

    const buildTrips = () => {
        tripArt.forEach(container => {
            scene.tweens.killTweensOf(container)
            container.destroy(true)
        })
        tripArt = state.trips.map(() => {
            const container = scene.add.container(0, 0).setScrollFactor(0)
            const body = scene.add.graphics()
            const items = scene.add.container(0, 0)
            const titleBar = scene.add.graphics()
            const title = scene.add
                .text(0, 0, '', {
                    fontFamily: FONT.black,
                    fontSize: '22px',
                    color: CSS.white,
                })
                .setOrigin(0.5)
                .setResolution(2)
            title.setStroke(CSS.ink, 5)
            container.add([titleBar, title, body, items])
            container.setData('body', body)
            container.setData('items', items)
            container.setData('titleBar', titleBar)
            container.setData('title', title)
            root.add(container)
            return container
        })
    }

    /** A setinha que diz "põe aqui". Estática: indicador, não pulso. */
    const paintMarks = () => {
        marks.clear()
        if (state.mode !== 'cutting' || !state.picked) return
        state.trips.forEach((trip, index) => {
            if (trip.length >= slotsOf(index)) return
            const center = tripCenter(index)
            // acima da tarja, com a mesma folga de antes
            const y = center.y - PLAN.panels.h / 2 - PLAN.tab.rise - 22
            marks.fillStyle(C.ink, 1)
            marks.fillTriangle(center.x - 26, y - 30, center.x + 26, y - 30, center.x, y + 6)
            marks.fillStyle(C.gold, 1)
            marks.fillTriangle(center.x - 20, y - 28, center.x + 20, y - 28, center.x, y - 2)
        })
    }

    const renderTrips = () => {
        const scale = focused() ? FOCUS.scale : 1
        state.trips.forEach((trip, index) => {
            const container = tripArt[index]
            if (!container) return
            const center = tripCenter(index)
            const changed = lastMode !== state.mode

            if (changed) {
                void FX.to(
                    scene,
                    container,
                    { x: center.x, y: center.y, scale },
                    { duration: 340, ease: 'Cubic.easeOut' },
                )
            } else {
                container.setPosition(center.x, center.y).setScale(scale)
            }
            container.setAlpha(focused() && state.done[index] ? 0.55 : 1)

            paintPanel(container.getData('body') as Phaser.GameObjects.Graphics, state.done[index], index)
            paintTitle(
                container.getData('titleBar') as Phaser.GameObjects.Graphics,
                container.getData('title') as Phaser.GameObjects.Text,
                task?.jobs[index]?.name ?? '',
                state.done[index],
            )

            const items = container.getData('items') as Phaser.GameObjects.Container
            items.removeAll(true)
            if (!scene.textures.exists(sheet)) return
            trip.forEach((item, slotIndex) => {
                const local = slotLocal(index, slotIndex)
                items.add(
                    scene.add
                        .image(local.x, local.y, sheet, item.frame)
                        .setDisplaySize(PLAN.panels.slot - 14, PLAN.panels.slot - 14),
                )
            })
        })
    }

    /**
     * A etiqueta com o nome, pendurada na BEIRADA da mesa. Quando o objeto está
     * na mão dela, a etiqueta fica dourada: é assim que o jogo diz "este aqui",
     * sem nada piscando.
     */
    const makeCaption = (x: number, text: string, picked: boolean) => {
        const container = scene.add.container(x, PLAN.caption.cy).setScrollFactor(0)
        const w = PLAN.caption.w
        const h = PLAN.caption.h
        const face = scene.add.graphics()
        face.fillStyle(C.ink, 1)
        face.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 13)
        face.fillStyle(picked ? C.warn : C.card, 1)
        face.fillRoundedRect(-w / 2, -h / 2, w, h, 10)
        face.fillStyle(picked ? C.gold : C.warn, 1)
        face.fillRoundedRect(-w / 2, -h / 2, w, 6, 3)
        const label = scene.add
            .text(0, 2, text, {
                fontFamily: FONT.black,
                fontSize: `${PLAN.caption.font}px`,
                color: picked ? CSS.white : CSS.ink,
                align: 'center',
                wordWrap: { width: PLAN.caption.wrap },
            })
            .setOrigin(0.5)
            .setResolution(2)
        if (picked) label.setStroke(CSS.ink, 4)
        container.add([face, label])
        return container
    }

    const renderShelf = () => {
        shelfArt.forEach(art => art.destroy())
        shelfArt = []
        shadows.clear()
        if (!task) return

        state.trips.forEach((_, index) => {
            if (focused()) return
            const center = tripCenter(index)
            shadows.fillStyle(C.ink, 0.18)
            shadows.fillEllipse(center.x + 6, center.y + PLAN.panels.h / 2 + 12, PLAN.panels.w, 26)
        })

        state.shelf.forEach(item => {
            const index = task!.items.findIndex(other => other.id === item.id)
            const pos = shelfCenter(index)
            const picked = state.picked === item.id

            shadows.fillStyle(C.ink, 0.14)
            shadows.fillEllipse(pos.x, pos.y + PLAN.shelf.size * 0.52, PLAN.shelf.size * 0.54, 12)

            const caption = makeCaption(pos.x, item.name, picked)
            root.add(caption)
            shelfArt.push(caption)

            if (!scene.textures.exists(sheet)) return
            const size = PLAN.shelf.size * (picked ? 1.14 : 1)
            const image = scene.add
                .image(pos.x, pos.y - (picked ? 22 : 0), sheet, item.frame)
                .setDisplaySize(size, size)
                .setScrollFactor(0)
            root.add(image)
            shelfArt.push(image)
        })
    }

    /**
     * As zonas mudam com o momento, e é isso que tira a ambiguidade: com um
     * objeto na mão, o painel INTEIRO é alvo de guardar; sem nada na mão, só o
     * que já está dentro é alvo, para tirar de volta.
     */
    const buildZones = () => {
        clearZones()
        if (!task) return

        const add = (x: number, y: number, w: number, h: number, action: () => void) => {
            const zone = scene.add
                .zone(x, y, w, h)
                .setOrigin(0.5)
                .setDepth(DEPTH.zones)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', action)
            zones.push(zone)
        }

        if (state.mode === 'cutting') {
            state.shelf.forEach(item => {
                const index = task!.items.findIndex(other => other.id === item.id)
                const pos = shelfCenter(index)
                add(pos.x, (pos.y + PLAN.caption.cy) / 2, PLAN.shelf.pitch, 170, () =>
                    callbacks.onItem(item),
                )
            })

            state.trips.forEach((trip, tripIndex) => {
                const center = tripCenter(tripIndex)
                if (state.picked) {
                    add(center.x, center.y, PLAN.panels.w, PLAN.panels.h + 40, () =>
                        callbacks.onTrip(tripIndex),
                    )
                    return
                }
                trip.forEach((item, slotIndex) => {
                    const pos = slotCenter(tripIndex, slotIndex)
                    add(pos.x, pos.y, PLAN.panels.slot, PLAN.panels.slot, () =>
                        callbacks.onTripItem(tripIndex, item),
                    )
                })
            })
        }

        if (state.mode === 'choosing') {
            state.trips.forEach((_, tripIndex) => {
                if (state.done[tripIndex]) return
                const center = tripCenter(tripIndex)
                add(
                    center.x,
                    center.y,
                    PLAN.panels.w * FOCUS.scale + 20,
                    PLAN.panels.h * FOCUS.scale + 40,
                    () => callbacks.onTrip(tripIndex),
                )
            })
        }

        if (goButton.visible) {
            add(PLAN.go.cx, PLAN.go.cy, PLAN.go.w + 40, PLAN.go.h + 40, () => {
                void FX.press(scene, goButton)
                callbacks.onGo()
            })
        }
    }

    const applyFocus = () => {
        const on = focused()
        focusTitle.setVisible(on)
        if (!on) {
            veil.setVisible(false)
            return
        }
        if (!veil.visible) {
            veil.setVisible(true).setAlpha(0)
            void FX.to(scene, veil, { alpha: 1 }, { duration: 300 })
            focusTitle.setAlpha(0)
            void FX.to(scene, focusTitle, { alpha: 1 }, { duration: 340, delay: 120 })
        }
    }

    return {
        show(next: Task, sheetKey: string) {
            task = next
            sheet = sheetKey
            root.setVisible(true)
        },

        render(next: PlanState) {
            clearFlying()
            const rebuild = next.trips.length !== tripArt.length
            state = next
            if (rebuild) {
                buildTrips()
                lastMode = state.mode
            }
            applyFocus()
            renderTrips()
            renderShelf()
            paintMarks()
            buildZones()
            lastMode = state.mode
        },

        showGo(visible: boolean) {
            goButton.setVisible(visible)
            scene.tweens.killTweensOf(goButton)
            if (visible) {
                goButton.setScale(1)
                void FX.popIn(scene, goButton, { from: 0.7 })
            }
            buildZones()
        },

        async fly(item: Item, from: { x: number; y: number }, to: { x: number; y: number }) {
            if (!scene.textures.exists(sheet)) return
            const image = scene.add
                .image(from.x, from.y, sheet, item.frame)
                .setDisplaySize(PLAN.shelf.size, PLAN.shelf.size)
                .setDepth(DEPTH.zones)
                .setScrollFactor(0)
            flying.push(image)
            await FX.arcTo(scene, image, to, { duration: 340, height: 130 })
            image.destroy()
            flying = flying.filter(other => other !== image)
        },

        async refuse(tripIndex: number) {
            const container = tripArt[tripIndex]
            if (!container) return
            void FX.ping(scene, container.x, container.y, C.coral, { radius: 190, depth: DEPTH.fx })
            await FX.shake(scene, container, { amount: 16 })
        },

        shelfPos(item: Item) {
            const index = task?.items.findIndex(other => other.id === item.id) ?? 0
            return shelfCenter(index)
        },

        tripPos(tripIndex: number) {
            return tripCenter(tripIndex)
        },

        slotPos(tripIndex: number, slotIndex: number) {
            return slotCenter(tripIndex, slotIndex)
        },

        goBounds() {
            return { x: PLAN.go.cx, y: PLAN.go.cy, w: PLAN.go.w + 40, h: PLAN.go.h + 40 }
        },

        setVisible(value: boolean) {
            root.setVisible(value)
            if (!value) clearZones()
            else buildZones()
        },

        hide() {
            root.setVisible(false)
            goButton.setVisible(false)
            veil.setVisible(false)
            focusTitle.setVisible(false)
            marks.clear()
            clearZones()
            clearFlying()
        },

        destroy() {
            clearZones()
            clearFlying()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Plan = ReturnType<typeof createPlan>
