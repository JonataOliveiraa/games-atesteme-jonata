import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    DATA_BOX,
    dataFrame,
    DATA_SHEET,
    DEST_BOX,
    DEST_SHEET,
    destFrame,
    fitInside,
    originOf,
    SHEET,
} from '../data/art'
import { DEPTH, GROUND, MOTION, SIGN, SIGN_BY_COUNT, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Movement, TargetCard } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS PLACAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Uma placa de madeira pendurada por dois fios no quadro da sala. Ela balança
 * sozinha, recebe a bolinha de papel e, quando é a suspeita, os fios
 * arrebentam e ela CAI.
 *
 * ── POR QUE O CONTAINER MORA NO PIVÔ ─────────────────────────────────────
 *
 * `root` fica onde os fios prendem e `hang` é o corpo, pendurado abaixo. Assim
 * `root.angle` balança a placa inteira em torno do prego (que é como coisa
 * pendurada se move) e `hang.angle` a gira em torno do próprio centro (que é
 * como coisa solta cai). Duas rotações independentes, nenhum tween gêmeo.
 *
 * Todo o desenho de `hang` acontece em torno de (0, 0) — é o que deixa
 * `FX.impact` e a queda escalarem a peça sem ela sair voando da sala.
 *
 * ── A ZONA VAI DENTRO ────────────────────────────────────────────────────
 *
 * A placa se move o tempo todo, então a zona é filha do container e o Phaser
 * resolve o toque pela transformação do pai. Zona solta precisaria de um tween
 * gêmeo em cada balanço, e o primeiro esquecido deixaria a placa tocável onde
 * ela não está mais.
 */

interface Slot {
    card: TargetCard
    root: Phaser.GameObjects.Container
    hang: Phaser.GameObjects.Container
    cords: Phaser.GameObjects.Graphics
    ring: Phaser.GameObjects.Graphics
    cover?: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    sway?: Phaser.Tweens.Tween
    /** Onde a placa mora quando não está se mexendo. */
    baseX: number
    fallen: boolean
    revealed: boolean
}

/** A tampa do nível 3: a placa existe, mas o que está escrito nela não se lê. */
function paintCover(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    const hw = w / 2
    const hh = h / 2
    g.clear()
    g.fillStyle(C.blueDeep, 1)
    g.fillRoundedRect(-hw, -hh, w, h - 7, 13)
    g.fillStyle(C.blue, 0.5)
    for (let i = 0; i < 5; i++) {
        const y = -hh + 30 + i * ((h - 60) / 5)
        const inset = 30 + (i % 3) * 22
        g.fillRoundedRect(-hw + inset, y, w - inset * 2 - (i % 2) * 26, 9, 5)
    }
    g.fillStyle(C.ink, 0.22)
    g.fillCircle(4, 6, 46)
    g.fillStyle(C.cyan, 1)
    g.fillCircle(0, 0, 46)
}

const matrix = new Phaser.GameObjects.Components.TransformMatrix()

function paintCords(g: Phaser.GameObjects.Graphics, w: number, cut: boolean) {
    const dx = w / 2 + SIGN.edge - 22
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillCircle(-dx, 0, 8)
    g.fillCircle(dx, 0, 8)
    g.fillStyle(C.paperDeep, 1)
    g.fillCircle(-dx, -2, 3)
    g.fillCircle(dx, -2, 3)
    if (cut) {
        // as duas pontas soltas: é o que diz que a placa não está mais presa
        g.lineStyle(6, C.inkSoft, 1)
        g.lineBetween(-dx, 0, -dx - 7, 19)
        g.lineBetween(dx, 0, dx + 7, 19)
        return
    }
    g.lineStyle(6, C.inkSoft, 1)
    g.lineBetween(-dx, 0, -dx, SIGN.cord)
    g.lineBetween(dx, 0, dx, SIGN.cord)
}

/**
 * A placa: moldura de madeira grossa por fora, papel por dentro.
 *
 * A moldura precisa ser LARGA. Com 9 px ela lia como a borda de um cartão, e a
 * tela virava dois retângulos brancos flutuando — o que o jogo quer mostrar é
 * um objeto pendurado, capaz de ser derrubado.
 */
function paintFace(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    const hw = w / 2
    const hh = h / 2
    const edge = SIGN.edge
    g.clear()

    g.fillStyle(C.ink, 0.24)
    g.fillRoundedRect(-hw - edge + 10, -hh - edge + 16, w + edge * 2, h + edge * 2, 26)

    g.fillStyle(C.amberDeep, 1)
    g.fillRoundedRect(-hw - edge, -hh - edge, w + edge * 2, h + edge * 2, 26)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-hw - edge, -hh - edge, w + edge * 2, h + edge * 2 - 9, 24)

    g.fillStyle(C.amberDeep, 0.32)
    for (let i = 0; i < 4; i++) {
        const y = -hh - edge + 14 + i * ((h + edge * 2) / 4)
        g.fillRoundedRect(-hw - edge + 9, y, w + edge * 2 - 18, 3, 2)
    }

    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-hw - 4, -hh - 4, w + 8, h + 8, 16)
    g.fillStyle(C.paperDeep, 1)
    g.fillRoundedRect(-hw, -hh, w, h, 13)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-hw, -hh, w, h - 7, 13)
    g.fillStyle(C.white, 0.55)
    g.fillRoundedRect(-hw + 16, -hh + 11, w - 32, 9, 5)

    g.fillStyle(C.paperDeep, 1)
    ;[-1, 1].forEach(sx =>
        [-1, 1].forEach(sy => {
            g.fillCircle(sx * (hw + edge / 2 + 1), sy * (hh + edge / 2 + 1), 6)
            g.fillStyle(C.amberDeep, 0.7)
            g.fillCircle(sx * (hw + edge / 2 + 1), sy * (hh + edge / 2 + 1), 3)
            g.fillStyle(C.paperDeep, 1)
        }),
    )
}

function paintStrip(g: Phaser.GameObjects.Graphics, w: number, top: number, h: number) {
    const hw = w / 2
    g.clear()
    g.lineStyle(3, C.ink, 0.14)
    g.lineBetween(-hw + 22, top - 14, hw - 22, top - 14)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-hw + 16, top, w - 32, h, h / 2)
    g.fillStyle(C.wall, 1)
    g.fillRoundedRect(-hw + 19, top + 3, w - 38, h - 8, h / 2 - 3)
}

function paintLock(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.lineStyle(7, C.ink, 1)
    g.beginPath()
    g.arc(0, -8, 12, Math.PI, 0)
    g.strokePath()
    g.lineStyle(4, C.amber, 1)
    g.beginPath()
    g.arc(0, -8, 12, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-20, -10, 40, 32, 8)
    g.fillStyle(C.amber, 1)
    g.fillRoundedRect(-17, -7, 34, 26, 6)
    g.fillStyle(C.amberDeep, 1)
    g.fillCircle(0, 3, 5)
    g.fillRect(-2, 3, 4, 9)
}

export function createSigns(scene: Phaser.Scene, onPick: (index: number) => void) {
    let slots: Slot[] = []
    let enabled = false
    let width = SIGN_BY_COUNT[2].w
    let movement: Movement = 'still'
    let covered = false
    let clock = 0

    const dust = scene.add.graphics().setDepth(DEPTH.dust)
    const lock = scene.add.graphics().setDepth(DEPTH.signFx).setVisible(false)
    paintLock(lock)

    const place = (total: number) => SIGN_BY_COUNT[total] ?? SIGN_BY_COUNT[3]

    /** A volta inteira do carrossel: a tela mais uma placa. */
    const lap = () => W + width + SIGN.edge * 2

    const startX = (index: number, total: number) => {
        const spot = place(total)
        if (movement !== 'carousel') return spot.xs[index]
        // espaçadas por um terço da volta, para nunca sumir tudo ao mesmo tempo
        return (-width / 2 + (lap() * index) / total + 120) % lap()
    }

    const build = (card: TargetCard, index: number, total: number): Slot => {
        const spot = place(total)
        const w = spot.w
        const h = SIGN.h
        const narrow = w < 330
        const root = scene.add.container(startX(index, total), SIGN.pivotY).setDepth(DEPTH.sign)

        const cords = scene.add.graphics()
        paintCords(cords, w, false)
        root.add(cords)

        const hang = scene.add.container(0, SIGN.cord + h / 2)
        root.add(hang)

        const ring = scene.add.graphics().setAlpha(0)
        ring.lineStyle(9, C.cyan, 1)
        ring.strokeRoundedRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 32)
        hang.add(ring)

        const face = scene.add.graphics()
        paintFace(face, w, h)
        hang.add(face)

        /*
         * O MIOLO DA PLACA TEM DUAS PLANTAS, e a largura escolhe.
         *
         * Larga (duas placas): pictograma à esquerda, frase ao lado, na altura
         * dele. Estreita (três placas): pictograma em cima, frase embaixo,
         * ancorada pelo TOPO — com a frase centrada verticalmente, três linhas
         * cresciam para os dois lados e entravam na tira de destino, e foi
         * assim que o nível 2 nasceu com o texto cortado.
         */
        const top = -h / 2
        const peer = card.owner === 'peer'
        const iconSize = narrow ? 62 : 92
        const iconX = narrow ? 0 : -w / 2 + 72
        const iconY = narrow ? top + (peer ? 76 : 50) : top + 104
        const textX = narrow ? 0 : iconX + 62
        const textTop = top + (peer ? 116 : 88)
        const textY = narrow ? textTop : iconY
        const textWrap = narrow ? w - 30 : w - 148

        if (peer) {
            const tagW = narrow ? w - 34 : 168
            const tag = scene.add.graphics()
            tag.fillStyle(C.purple, 1)
            tag.fillRoundedRect(-tagW / 2, top + 11, tagW, 30, 15)
            hang.add(tag)
            const tagText = scene.add
                .text(0, top + 26, 'DE UM COLEGA', {
                    fontFamily: FONT.black,
                    fontSize: '17px',
                    color: CSS.white,
                })
                .setOrigin(0.5)
                .setResolution(2)
            hang.add(tagText)
        }

        if (scene.textures.exists(SHEET.data)) {
            const box = DATA_BOX[dataFrame(card.kind)]
            const icon = scene.add.image(iconX, iconY, SHEET.data, dataFrame(card.kind))
            const origin = originOf(box, DATA_SHEET.frameWidth, DATA_SHEET.frameHeight)
            icon.setOrigin(origin.x, origin.y)
            icon.setScale(fitInside(box, iconSize, iconSize))
            hang.add(icon)
        } else {
            const g = scene.add.graphics()
            g.fillStyle(C.blue, 1)
            g.fillRoundedRect(iconX - iconSize / 2, iconY - iconSize / 2, iconSize, iconSize, 16)
            hang.add(g)
        }

        const message = scene.add
            .text(textX, textY, card.message, {
                fontFamily: FONT.body,
                fontStyle: 'bold',
                fontSize: narrow ? '17px' : '21px',
                color: CSS.ink,
                align: narrow ? 'center' : 'left',
                wordWrap: { width: textWrap },
                lineSpacing: narrow ? 2 : 4,
            })
            .setOrigin(narrow ? 0.5 : 0, narrow ? 0 : 0.5)
            .setResolution(2)
        hang.add(message)

        const stripH = narrow ? 58 : 72
        const stripTop = h / 2 - stripH - (narrow ? 16 : 20)
        const strip = scene.add.graphics()
        paintStrip(strip, w, stripTop, stripH)
        hang.add(strip)

        const stripCy = stripTop + stripH / 2
        let destX = -w / 2 + 34
        if (scene.textures.exists(SHEET.destinations)) {
            const frame = destFrame(card.audience)
            const box = DEST_BOX[frame]
            const icon = scene.add.image(-w / 2 + 58, stripCy, SHEET.destinations, frame)
            const origin = originOf(box, DEST_SHEET.frameWidth, DEST_SHEET.frameHeight)
            icon.setOrigin(origin.x, origin.y)
            icon.setScale(fitInside(box, 52, 52))
            hang.add(icon)
            destX = -w / 2 + 92
        }

        const destination = scene.add
            .text(destX, stripCy, card.destination, {
                fontFamily: FONT.black,
                fontSize: narrow ? '16px' : '19px',
                color: CSS.ink,
                align: 'left',
                wordWrap: { width: w - (destX + w / 2) - 24 },
                lineSpacing: 2,
            })
            .setOrigin(0, 0.5)
            .setResolution(2)
        hang.add(destination)

        let cover: Phaser.GameObjects.Container | undefined
        if (covered) {
            cover = scene.add.container(0, 0)
            const face = scene.add.graphics()
            paintCover(face, w, h)
            cover.add(face)
            const mark = scene.add
                .text(0, 2, '?', {
                    fontFamily: FONT.black,
                    fontSize: '64px',
                    color: CSS.white,
                })
                .setOrigin(0.5)
                .setResolution(2)
            cover.add(mark)
            hang.add(cover)
        }

        const zone = scene.add.zone(0, 0, w + 26, h + 26).setOrigin(0.5)
        zone.setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (enabled) onPick(index)
        })
        hang.add(zone)

        return {
            card,
            root,
            hang,
            cords,
            ring,
            cover,
            zone,
            baseX: spot.xs[index],
            fallen: false,
            revealed: !covered,
        }
    }

    const startSway = (slot: Slot, index: number) => {
        slot.sway?.remove()
        slot.root.setAngle(0)
        slot.sway = scene.tweens.add({
            targets: slot.root,
            angle: { from: -SIGN.sway, to: SIGN.sway },
            duration: FX.ms(scene, 2200 + index * 260),
            delay: FX.ms(scene, index * 380),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    /** Devolve a placa ao prumo: `FX.kill` sozinho a deixaria torta para sempre. */
    const stopSway = (slot: Slot) => {
        slot.sway?.remove()
        slot.sway = undefined
        scene.tweens.killTweensOf(slot.root)
        slot.root.setAngle(0)
    }

    const puff = (x: number, y: number) => {
        dust.clear()
        dust.setAlpha(1)
        for (let i = 0; i < 9; i++) {
            const a = Math.PI + (Math.PI * i) / 8
            dust.fillStyle(C.paperDeep, 0.8)
            dust.fillCircle(x + Math.cos(a) * (30 + i * 9), y + Math.sin(a) * 12, 7 + (i % 3) * 3)
        }
        return FX.to(scene, dust as unknown as Phaser.GameObjects.Container, { alpha: 0 }, { duration: 520 })
    }

    const clear = () => {
        slots.forEach(slot => {
            stopSway(slot)
            scene.tweens.killTweensOf([slot.root, slot.hang, slot.ring])
            slot.zone.destroy()
            slot.root.destroy(true)
        })
        slots = []
        scene.tweens.killTweensOf(lock)
        lock.setVisible(false).setAlpha(1).setScale(1)
        dust.clear()
        dust.setAlpha(1)
    }

    return {
        /** Como esta onda se mexe, e se as placas chegam cobertas. */
        setMode(kind: Movement, hidden: boolean) {
            movement = kind
            covered = hidden
            clock = 0
        },

        /**
         * ─────────────────────────────────────────────────────────────────
         *  O MOVIMENTO
         * ─────────────────────────────────────────────────────────────────
         *
         * Chamado todo quadro pela cena. O vaivém é em BLOCO — as três placas
         * compartilham o mesmo deslocamento, porque com 14 px entre uma e outra
         * qualquer defasagem faria elas se atravessarem.
         *
         * A placa que já caiu não anda mais: ela saiu do carrossel no instante
         * em que os fios arrebentaram.
         */
        update(delta: number) {
            if (movement === 'still' || !slots.length) return
            clock += delta

            if (movement === 'horizontal') {
                const shift = Math.sin((clock / MOTION.swayMs) * Math.PI * 2) * MOTION.swayAmp
                slots.forEach(slot => {
                    if (slot.fallen) return
                    slot.root.x = slot.baseX + shift
                })
                return
            }

            const speed = covered ? MOTION.coveredSpeed : MOTION.carouselSpeed
            const span = lap()
            const edge = width / 2 + SIGN.edge
            slots.forEach(slot => {
                if (slot.fallen) return
                slot.root.x += speed * (delta / 1000)
                if (slot.root.x > W + edge) slot.root.x -= span
            })
        },

        isRevealed(index: number) {
            return slots[index]?.revealed ?? true
        },

        /**
         * A placa vira e mostra o que estava escrito.
         *
         * Quem chama isto é o arremesso que ACERTOU uma placa ainda coberta —
         * e esse arremesso não é resposta nenhuma, é a criança abrindo para
         * ler. Só depois de aberta a placa pode ser acusada.
         */
        async reveal(index: number) {
            const slot = slots[index]
            if (!slot || slot.revealed) return
            slot.revealed = true
            await FX.to(scene, slot.hang, { scaleX: 0.04 }, { duration: 190, ease: 'Quad.easeIn' })
            if (!slot.hang.active) return
            slot.cover?.setVisible(false)
            await FX.to(scene, slot.hang, { scaleX: 1 }, { duration: 300, ease: 'Back.easeOut' })
        },

        async show(cards: TargetCard[]) {
            clear()
            width = place(cards.length).w
            slots = cards.map((card, index) => build(card, index, cards.length))
            slots.forEach(slot => {
                slot.root.setAlpha(0)
                slot.hang.setY(slot.hang.y - 150)
            })
            await FX.all(
                ...slots.map((slot, index) =>
                    FX.wait(scene, index * 140).then(() =>
                        FX.all(
                            FX.to(scene, slot.root, { alpha: 1 }, { duration: 260 }),
                            FX.to(
                                scene,
                                slot.hang,
                                { y: SIGN.cord + SIGN.h / 2 },
                                { duration: 620, ease: 'Bounce.easeOut' },
                            ),
                        ).then(() => startSway(slot, index)),
                    ),
                ),
            )
        },

        /** O centro REAL, com o balanço aplicado — é para cá que a bolinha vai. */
        centerOf(index: number) {
            const slot = slots[index]
            if (!slot) return { x: 640, y: 300 }
            slot.hang.getWorldTransformMatrix(matrix)
            return { x: matrix.tx, y: matrix.ty }
        },

        /**
         * Que placa ocupa este ponto agora, se alguma.
         *
         * Responde pela posição do INSTANTE, não pela posição de largada: é
         * isto que a mira consulta a cada quadro e o que a bolinha pergunta
         * enquanto voa. Quando as placas passarem a andar, o acerto vai
         * depender daqui e de mais nada.
         *
         * O balanço é de menos de dois graus, então o teste usa o retângulo
         * alinhado em torno do centro real. Uma placa girada de verdade pediria
         * a matriz inversa; esta não gira o bastante para a diferença caber num
         * pixel.
         */
        hitAt(px: number, py: number): number | null {
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i]
                if (slot.fallen || slot.root.alpha < 0.5) continue
                slot.hang.getWorldTransformMatrix(matrix)
                const halfW = (width / 2 + SIGN.edge) * slot.hang.scaleX
                const halfH = (SIGN.h / 2 + SIGN.edge) * slot.hang.scaleY
                if (Math.abs(px - matrix.tx) <= halfW && Math.abs(py - matrix.ty) <= halfH) return i
            }
            return null
        },

        /** Onde cada placa está agora. */
        targets() {
            return slots
                .filter(slot => !slot.fallen && slot.root.alpha > 0.5)
                .map(slot => {
                    slot.hang.getWorldTransformMatrix(matrix)
                    return { index: slots.indexOf(slot), x: matrix.tx, y: matrix.ty }
                })
        },

        width() {
            return width
        },

        /** A placa que a mira está segurando acende; as outras apagam. */
        aimAt(index: number | null) {
            slots.forEach((slot, i) => {
                const on = i === index && !slot.fallen
                scene.tweens.killTweensOf(slot.ring)
                slot.ring.setAlpha(on ? 1 : 0)
                scene.tweens.killTweensOf(slot.hang)
                slot.hang.setScale(on ? 1.04 : 1)
            })
        },

        async shake(index: number) {
            const slot = slots[index]
            if (!slot) return
            stopSway(slot)
            await FX.to(scene, slot.root, { angle: 7 }, { duration: 90 })
            await FX.to(scene, slot.root, { angle: 0 }, { duration: 900, ease: 'Elastic.easeOut' })
            startSway(slot, index)
        },

        /**
         * ─────────────────────────────────────────────────────────────────
         *  A QUEDA
         * ─────────────────────────────────────────────────────────────────
         *
         * Os fios arrebentam, a placa tomba de lado, acelera até o chão,
         * quica uma vez e assenta. É `hang` quem cai: com `root` no prumo, as
         * coordenadas dele já são as da tela deslocadas pelo pivô.
         */
        async fall(index: number, onLand?: () => void) {
            const slot = slots[index]
            if (!slot) return
            slot.fallen = true
            slot.zone.destroy()
            stopSway(slot)
            scene.tweens.killTweensOf(slot.ring)
            slot.ring.setAlpha(0)
            slot.hang.setScale(1)

            paintCords(slot.cords, width, true)
            await FX.to(scene, slot.hang, { angle: -5, y: slot.hang.y - 12 }, { duration: 130 })

            // encolher na queda vale por perspectiva: a placa sai da parede e
            // vai para o chão, que está mais longe da câmera
            const floor = GROUND.y - SIGN.pivotY
            const tilt = Phaser.Math.Between(0, 1) ? 1 : -1
            await FX.to(
                scene,
                slot.hang,
                { y: floor, angle: tilt * 62, x: tilt * 26, scale: 0.66 },
                { duration: 470, ease: 'Quad.easeIn' },
            )
            if (!slot.hang.active) return

            onLand?.()
            slot.hang.getWorldTransformMatrix(matrix)
            void puff(matrix.tx, matrix.ty + SIGN.h / 4)
            void FX.shakeCam(scene, 'leve')

            await FX.to(scene, slot.hang, { y: floor - 42, angle: tilt * 78 }, { duration: 190, ease: 'Quad.easeOut' })
            await FX.to(scene, slot.hang, { y: floor + 12, angle: tilt * 88, scale: 0.6 }, { duration: 230, ease: 'Quad.easeIn' })
            await FX.to(scene, slot.hang, { y: floor + 20, angle: tilt * 92 }, { duration: 140, ease: 'Quad.easeOut' })
        },

        async sink(index: number) {
            const slot = slots[index]
            if (!slot) return
            await FX.all(
                FX.to(scene, slot.hang, { alpha: 0, scale: 0.84 }, { duration: 420 }),
                FX.to(scene, slot.cords, { alpha: 0 }, { duration: 300 }),
            )
        },

        showLock(index: number) {
            const slot = slots[index]
            if (!slot) return
            slot.hang.getWorldTransformMatrix(matrix)
            scene.tweens.killTweensOf(lock)
            lock
                .setPosition(matrix.tx + width / 2 - 16, matrix.ty - SIGN.h / 2 + 14)
                .setVisible(true)
                .setScale(0.3)
            void FX.to(scene, lock, { scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        hideLock() {
            scene.tweens.killTweensOf(lock)
            lock.setVisible(false).setAlpha(1).setScale(1)
        },

        pulse(index: number) {
            const slot = slots[index]
            if (!slot) return
            scene.tweens.killTweensOf(slot.ring)
            slot.ring.setAlpha(0)
            scene.tweens.add({
                targets: slot.ring,
                alpha: 1,
                duration: FX.ms(scene, 620),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        /** As placas seguras seguem para o destino delas. */
        async deliver() {
            const alive = slots.filter(slot => !slot.fallen && slot.root.active && slot.root.alpha > 0)
            await FX.all(
                ...alive.map((slot, i) =>
                    FX.wait(scene, i * 110).then(() => {
                        stopSway(slot)
                        paintCords(slot.cords, width, true)
                        return FX.all(
                            FX.to(scene, slot.hang, { y: slot.hang.y - 64, angle: 4 }, { duration: 460, ease: 'Cubic.easeIn' }),
                            FX.to(scene, slot.root, { alpha: 0 }, { duration: 460 }),
                        )
                    }),
                ),
            )
        },

        setEnabled(value: boolean, dim = false) {
            enabled = value
            slots.forEach(slot => {
                if (slot.zone.active && slot.zone.input) slot.zone.input.enabled = value && !slot.fallen
                if (!slot.fallen && slot.root.alpha > 0) slot.root.setAlpha(dim ? 0.82 : 1)
            })
        },

        bounds() {
            const spot = place(slots.length || 2)
            const reach = spot.w / 2 + SIGN.edge + 10
            const left = spot.xs[0] - reach
            const right = spot.xs[spot.xs.length - 1] + reach
            return {
                x: (left + right) / 2,
                y: SIGN.pivotY + SIGN.cord + SIGN.h / 2,
                w: right - left,
                h: SIGN.h + SIGN.cord + SIGN.edge * 2 + 24,
            }
        },

        clear,

        destroy() {
            clear()
            lock.destroy()
            dust.destroy()
        },
    }
}

export type Signs = ReturnType<typeof createSigns>
