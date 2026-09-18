import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import {
    BACKDROPS,
    DEPTH,
    H,
    PAPER_BOX,
    PEOPLE_BOX,
    POSE,
    POSTMAN,
    SQUARE,
    W,
    type BackdropId,
} from '../data/layout'
import { C } from '../data/theme'
import { has, SHEETS } from '../data/files'
import { groundOf, speedFor } from '../data/levels'
import type { GroupDef, PersonState } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget
const RAD = (SQUARE.angleDeg * Math.PI) / 180

export interface Square {
    setShown(on: boolean): void
    build(groups: GroupDef[], backdrop: BackdropId): void
    setAim(x: number): void
    setAimShown(on: boolean): void
    /** A chegada: aproxima no carteiro e afasta até a praça inteira. */
    arrive(): Promise<void>
    throwTo(x: number): Promise<number[]>
    inform(index: number, state: PersonState): Promise<void>
    turnSour(): Promise<void>
    /** O troco de divulgar o jornal errado: a praça toda chacoalha de bronca. */
    rage(ms: number): Promise<void>
    pending(): number[]
    /** Anda até o próximo grupo fora de alcance. Devolve `true` se andou. */
    walkToPending(): Promise<boolean>
    pose(frame: number): void
    groundY(): number
    groupPos(index: number): { x: number; y: number }
    destroy(): void
}

interface Person {
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics
    baseX: number
    setState(s: PersonState): void
}

interface Group {
    def: GroupDef
    people: Person[]
    state: PersonState
    glow: Phaser.GameObjects.Graphics
}

export function createSquare(scene: Phaser.Scene): Square {
    /**
     * TUDO QUE É PRAÇA MORA DENTRO DE UM CONTAINER SÓ.
     *
     * É ele que a chegada aproxima e afasta. Cabeçalho, setas e botão ficam de
     * FORA — quem chega ao lugar é o carteiro, não a interface, e uma HUD que
     * cresce junto entrega que o zoom é um truque de câmera.
     *
     * Aqui a ordem de inserção É a profundidade: dentro de um container o
     * `setDepth` dos filhos não vale.
     */
    const viewRoot = scene.add.container(0, 0).setDepth(DEPTH.bg)
    const bgLayer = scene.add.container(0, 0)
    /** O mundo que corre. Tudo que tem lugar no mapa mora aqui. */
    const stage = scene.add.container(0, 0)
    const aimLayer = scene.add.container(0, 0)
    const manLayer = scene.add.container(0, 0)
    const flyLayer = scene.add.container(0, 0)
    const fxLayer = scene.add.container(0, 0)
    viewRoot.add([bgLayer, stage, aimLayer, manLayer, flyLayer, fxLayer])

    const sky = scene.add.graphics()
    bgLayer.add(sky)
    let backdrop: Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite | null = null
    let tileScale = 1

    const marker = scene.add.graphics()
    const trail = scene.add.graphics()
    aimLayer.add([trail, marker])

    const manScale = SQUARE.postmanH / POSTMAN.cellH
    const manW = SQUARE.postmanH * SQUARE.postmanRatio

    let man: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics
    if (has(scene, SHEETS.postman.key)) {
        man = scene.add
            .sprite(SQUARE.postmanCx, 0, SHEETS.postman.key, POSE.ready)
            .setOrigin(0.5, 1)
            .setDisplaySize(manW, SQUARE.postmanH)
    } else {
        man = scene.add.graphics()
    }
    manLayer.add(man)

    let groups: Group[] = []
    let aimX: number = SQUARE.aimMin
    let ground = groundOf(BACKDROPS.praca.groundFrac)
    let worldX = 0
    let scrolls = false
    const pulse = { v: 0 }

    const manBottom = () => ground + POSTMAN.footPad * manScale
    const muzzle = () => ({
        x: SQUARE.postmanCx + (SQUARE.handFx - 0.5) * manW,
        y: manBottom() - SQUARE.postmanH + SQUARE.handFy * SQUARE.postmanH,
    })

    const paintPlaceholderMan = () => {
        if (!(man instanceof Phaser.GameObjects.Graphics)) return
        man.clear()
        man.fillStyle(C.mustard, 1)
        man.fillRect(SQUARE.postmanCx - manW / 2, manBottom() - SQUARE.postmanH, manW, SQUARE.postmanH)
        man.lineStyle(5, C.ink, 1)
        man.strokeRect(SQUARE.postmanCx - manW / 2, manBottom() - SQUARE.postmanH, manW, SQUARE.postmanH)
    }

    const personScale = SQUARE.personCell / 256

    const makePerson = (type: number, x: number, baseY: number): Person => {
        const box = PEOPLE_BOX[type % PEOPLE_BOX.length]
        let state: PersonState = 0
        if (has(scene, SHEETS.people.key)) {
            const sprite = scene.add
                .sprite(x, baseY + box.footPad * personScale, SHEETS.people.key, type * 3)
                .setOrigin(box.originX, 1)
                .setDisplaySize(SQUARE.personCell, SQUARE.personCell)
            stage.add(sprite)
            return {
                sprite,
                baseX: x,
                setState(s) {
                    state = s
                    sprite.setFrame(type * 3 + s)
                },
            }
        }
        const g = scene.add.graphics()
        const paint = () => {
            g.clear()
            g.fillStyle(state === 0 ? C.grey : state === 1 ? C.mustard : C.amber, 1)
            g.fillRoundedRect(x - 30, baseY - 150, 60, 150, 26)
            g.lineStyle(4, C.ink, 1)
            g.strokeRoundedRect(x - 30, baseY - 150, 60, 150, 26)
        }
        paint()
        stage.add(g)
        return {
            sprite: g,
            baseX: x,
            setState(s) {
                state = s
                paint()
            },
        }
    }

    const paintGlow = (group: Group) => {
        group.glow.clear()
        if (group.state === 0) return
        const colour = group.state === 1 ? C.mustard : C.amber
        const base = ground - (group.def.lift ?? 0)
        group.glow.fillStyle(colour, 0.22)
        group.glow.fillEllipse(group.def.cx, base + 4, 210, 34)
        group.glow.fillStyle(colour, 0.14)
        group.glow.fillCircle(group.def.cx, base - 84, 118)
    }

    const screenX = (g: Group) => g.def.cx - worldX
    const reachable = (g: Group) =>
        g.state !== 1 &&
        screenX(g) >= SQUARE.aimMin - SQUARE.burstR &&
        screenX(g) <= SQUARE.aimMax + SQUARE.burstR

    /**
     * A MIRA.
     *
     * Ela não é um círculo no chão: é um alvo deitado em perspectiva, com a
     * mesma achatada do chão do desenho. Fechada e amarela quando há gente ao
     * alcance, aberta e tracejada em cinza no vazio — é a regra do catálogo,
     * e aqui ela também PULSA, para o olho achar a mira sem procurar.
     */
    const paintMarker = () => {
        const aimY = ground + 16
        const RX = 46
        const RY = 15
        const hot = groups.some(g => g.state !== 1 && Math.abs(screenX(g) - aimX) <= SQUARE.burstR)
        const colour = hot ? C.mustard : C.grey

        marker.clear()
        marker.fillStyle(C.ink, 0.12)
        marker.fillEllipse(aimX, aimY + 7, RX * 2.1, RY * 2.1)

        if (hot) {
            marker.lineStyle(7, C.ink, 1)
            marker.strokeEllipse(aimX, aimY, RX * 2, RY * 2)
            marker.lineStyle(4, colour, 1)
            marker.strokeEllipse(aimX, aimY, RX * 2, RY * 2)

            const p = 0.34 + pulse.v * 0.3
            marker.lineStyle(3, colour, 0.8 - pulse.v * 0.45)
            marker.strokeEllipse(aimX, aimY, RX * 2 * p, RY * 2 * p)

            marker.lineStyle(6, C.ink, 1)
            const tick = 13
            marker.lineBetween(aimX - RX - tick, aimY, aimX - RX + 4, aimY)
            marker.lineBetween(aimX + RX - 4, aimY, aimX + RX + tick, aimY)
            marker.lineBetween(aimX, aimY - RY - tick * 0.7, aimX, aimY - RY + 3)
            marker.lineBetween(aimX, aimY + RY - 3, aimX, aimY + RY + tick * 0.7)

            marker.fillStyle(C.ink, 1)
            marker.fillCircle(aimX, aimY, 7)
            marker.fillStyle(colour, 1)
            marker.fillCircle(aimX, aimY, 4)

            marker.fillStyle(colour, 0.5)
            for (let i = 0; i < 4; i++) marker.fillCircle(aimX, aimY - 30 - i * 16, 3)
        } else {
            /* Aberta: um tracejado, para dizer que ali não tem ninguém. */
            const seg = 14
            for (let i = 0; i < seg; i++) {
                if (i % 2) continue
                const a0 = (i / seg) * Math.PI * 2
                const a1 = ((i + 1) / seg) * Math.PI * 2
                marker.lineStyle(5, C.ink, 0.55)
                marker.lineBetween(
                    aimX + Math.cos(a0) * RX, aimY + Math.sin(a0) * RY,
                    aimX + Math.cos(a1) * RX, aimY + Math.sin(a1) * RY,
                )
            }
        }

        trail.clear()
        const m = muzzle()
        const v = speedFor(aimX, m.x, m.y, ground)
        const steps = 13
        for (let i = 1; i <= steps; i++) {
            const t = i * 0.042
            const x = m.x + v * Math.cos(RAD) * t
            const y = m.y - v * Math.sin(RAD) * t + (SQUARE.gravity * t * t) / 2
            if (y > ground - 24) break
            const k = 1 - i / (steps + 2)
            trail.fillStyle(C.ink, 0.15 + k * 0.4)
            trail.fillCircle(x, y, 2.5 + k * 4.5)
        }
    }

    const setPose = (frame: number) => {
        if (man instanceof Phaser.GameObjects.Sprite) man.setFrame(frame)
    }

    scene.tweens.add({
        targets: pulse,
        v: 1,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
            if (aimLayer.visible) paintMarker()
        },
    })

    /**
     * Quem ficou para trás some devagar.
     *
     * Sem isso, os grupos já informados se empilham em cima do carteiro quando
     * ele anda — e a tela fica cheia de gente que não é mais assunto. A faixa
     * de 120 a 340 é o corpo dele mais uma folga.
     */
    const applyWorld = () => {
        stage.x = -worldX
        if (backdrop instanceof Phaser.GameObjects.TileSprite) {
            backdrop.tilePositionX = worldX / tileScale
        }
        groups.forEach(g => {
            const a = Phaser.Math.Clamp((screenX(g) - 120) / 220, 0, 1)
            g.people.forEach(p => p.sprite.setAlpha(a))
            g.glow.setAlpha(a)
        })
    }

    return {
        setShown(on) {
            viewRoot.setVisible(on)
            if (!on) viewRoot.setScale(1).setPosition(0, 0).setAlpha(1)
        },
        /**
         * A CHEGADA.
         *
         * Escolhido o jornal, a praça abre APROXIMADA no carteiro e afasta até
         * caber inteira. É o que conta que ele SE DESLOCOU até ali, e o que
         * separa uma tela da outra sem um corte seco.
         */
        async arrive() {
            const px = SQUARE.postmanCx
            const py = manBottom() - SQUARE.postmanH * 0.55
            const z = { k: 1.95 }
            const apply = () => {
                viewRoot.setScale(z.k)
                viewRoot.setPosition(px * (1 - z.k), py * (1 - z.k))
            }
            apply()
            viewRoot.setAlpha(0)
            void FX.to(scene, fx(viewRoot), { alpha: 1 }, { duration: 280 })
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: z,
                    k: 1,
                    duration: 900,
                    ease: 'Cubic.easeInOut',
                    onUpdate: apply,
                    onComplete: () => resolve(),
                })
            })
            viewRoot.setScale(1).setPosition(0, 0).setAlpha(1)
        },
        build(defs, id) {
            const spec = BACKDROPS[id]
            const use = has(scene, spec.key) ? spec : BACKDROPS.praca
            ground = groundOf(use.groundFrac)
            scrolls = use.tiles && defs.some(d => d.cx > SQUARE.aimMax)

            backdrop?.destroy()
            backdrop = null
            sky.clear()
            if (has(scene, use.key)) {
                const src = scene.textures.get(use.key).getSourceImage()
                tileScale = W / src.width
                if (use.tiles) {
                    const ts = scene.add.tileSprite(0, 0, W, H, use.key).setOrigin(0)
                    ts.tileScaleX = tileScale
                    ts.tileScaleY = tileScale
                    backdrop = ts
                } else {
                    backdrop = scene.add.image(W / 2, H / 2, use.key).setDisplaySize(W, H)
                }
                bgLayer.add(backdrop)
            } else {
                sky.fillStyle(C.sky, 1).fillRect(0, 0, W, ground)
                sky.fillStyle(C.ground, 1).fillRect(0, ground, W, H - ground)
            }

            man.setY(manBottom())
            paintPlaceholderMan()
            setPose(POSE.ready)

            stage.removeAll(true)
            groups = defs.map(def => {
                const glow = scene.add.graphics()
                stage.add(glow)
                const base = ground - (def.lift ?? 0)
                const n = def.people.length
                const people = def.people.map((type, i) =>
                    makePerson(type, def.cx + (i - (n - 1) / 2) * SQUARE.personGap, base),
                )
                return { def, people, state: 0 as PersonState, glow }
            })
            groups.forEach(paintGlow)
            worldX = 0
            applyWorld()
            aimX = SQUARE.aimMin
            paintMarker()
        },
        setAim(x) {
            aimX = x
            paintMarker()
        },
        setAimShown(on) {
            aimLayer.setVisible(on)
        },
        async throwTo(x) {
            setPose(POSE.windUp)
            await FX.wait(scene, 200)
            setPose(POSE.release)

            const m = muzzle()
            const v = speedFor(x, m.x, m.y, ground)
            const vx = v * Math.cos(RAD)
            const vy = v * Math.sin(RAD)

            const sprite = has(scene, SHEETS.flying.key)
                ? scene.add
                      .sprite(m.x, m.y, SHEETS.flying.key, 0)
                      .setOrigin(PAPER_BOX[0].originX, PAPER_BOX[0].originY)
                      .setDisplaySize(110, 110)
                : scene.add.rectangle(m.x, m.y, 46, 26, C.paper).setStrokeStyle(4, C.ink)
            flyLayer.add(sprite)

            const drop = ground - m.y
            const total = (vy + Math.sqrt(vy * vy + 2 * SQUARE.gravity * drop)) / SQUARE.gravity
            const landed = m.x + vx * total

            void FX.wait(scene, 110).then(() => setPose(POSE.follow))

            const flight = { t: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: flight,
                    t: total,
                    duration: total * 1000,
                    ease: 'Linear',
                    onUpdate: () => {
                        const t = flight.t
                        sprite.x = m.x + vx * t
                        sprite.y = m.y - vy * t + (SQUARE.gravity * t * t) / 2
                        sprite.rotation += 0.18
                    },
                    onComplete: () => resolve(),
                })
            })
            if (sprite.active) sprite.destroy()

            const bits = scene.add.graphics()
            fxLayer.add(bits)
            const pieces = Array.from({ length: 16 }, () => ({
                a: -Math.PI * Math.random(),
                d: 50 + Math.random() * SQUARE.burstR,
                s: 12 + Math.random() * 12,
            }))
            const spread = { k: 0 }
            scene.tweens.add({
                targets: spread,
                k: 1,
                duration: 480,
                ease: 'Cubic.easeOut',
                onUpdate: () => {
                    if (!bits.active) return
                    bits.clear()
                    const a = Math.max(0, 1 - spread.k)
                    bits.fillStyle(C.paper, a)
                    bits.lineStyle(3, C.ink, a)
                    pieces.forEach(p => {
                        const px = landed + Math.cos(p.a) * p.d * spread.k
                        const py = ground - 70 + Math.sin(p.a) * p.d * spread.k * 0.7
                        bits.fillRect(px, py, p.s, p.s * 0.72)
                        bits.strokeRect(px, py, p.s, p.s * 0.72)
                    })
                },
                onComplete: () => bits.destroy(),
            })

            return groups
                .map((g, i) => (Math.abs(screenX(g) - landed) <= SQUARE.burstR ? i : -1))
                .filter(i => i >= 0)
        },
        async inform(index, state) {
            const group = groups[index]
            if (!group) return
            group.state = state
            paintGlow(group)
            await FX.all(
                ...group.people.map((p, i) =>
                    FX.wait(scene, i * 90).then(async () => {
                        p.setState(state)
                        const base = p.sprite.scaleY
                        await FX.to(scene, fx(p.sprite), { scaleY: base * 1.08 }, { duration: 110 })
                        await FX.to(scene, fx(p.sprite), { scaleY: base }, { duration: 110 })
                    }),
                ),
            )
            paintMarker()
        },
        async turnSour() {
            const lit = groups.filter(g => g.state === 1).reverse()
            for (const g of lit) {
                g.state = 2
                paintGlow(g)
                g.people.forEach(p => p.setState(2))
                await FX.wait(scene, 180)
            }
            paintMarker()
        },
        /**
         * A BRONCA.
         *
         * A folha tem três estados, e o terceiro é **chateado com gotinha** —
         * não existe quadro de raiva, e ele não foi pedido de propósito (o
         * negativo de todo prompt bane cara brava: quem errou foi a escolha,
         * não a criança). Então quem carrega a intensidade é o MOVIMENTO:
         * todo mundo treme junto, o halo pisca em âmbar e a tela sacode uma vez.
         */
        async rage(ms) {
            const people = groups.filter(g => g.state === 2).flatMap(g => g.people)
            const lit = groups.filter(g => g.state === 2)
            scene.cameras.main.shake(360, 0.007)
            const t = { v: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: t,
                    v: 1,
                    duration: ms,
                    ease: 'Linear',
                    onUpdate: () => {
                        const decay = 1 - t.v * 0.35
                        people.forEach((p, i) => {
                            if (!p.sprite.active) return
                            p.sprite.x = p.baseX + Math.sin(t.v * 46 + i * 1.7) * 7 * decay
                        })
                        lit.forEach(g => {
                            g.glow.setAlpha(0.55 + Math.sin(t.v * 30) * 0.45)
                        })
                    },
                    onComplete: () => resolve(),
                })
            })
            people.forEach(p => {
                if (p.sprite.active) p.sprite.x = p.baseX
            })
            applyWorld()
        },
        pending() {
            return groups.map((g, i) => (g.state === 1 ? -1 : i)).filter(i => i >= 0)
        },
        /**
         * A CAMINHADA.
         *
         * Sem quadros de andar na folha, quem conta que ele anda é o MUNDO
         * correndo por trás mais um balanço curto no corpo. Num desenho chapado
         * isso lê como passo; um sprite parado sobre fundo correndo, não.
         */
        async walkToPending() {
            if (!scrolls) return false
            const next = groups.filter(g => g.state !== 1)
            if (!next.length) return false
            if (next.some(reachable)) return false

            /*
             * Ele anda ALÉM do necessário: parar assim que o próximo grupo
             * entra no alcance deixava os já informados encostados nele. O
             * limite é não empurrar o próximo grupo para fora da janela de
             * mira — entre os dois, vale o que anda mais.
             */
            const nextCx = Math.min(...next.map(g => g.def.cx))
            const doneCx = groups.filter(g => g.state === 1).map(g => g.def.cx)
            const clearDone = doneCx.length ? Math.max(...doneCx) + SQUARE.walkClear : 0
            const ceiling = nextCx - (SQUARE.aimMin - SQUARE.burstR)
            const target = Phaser.Math.Clamp(
                Math.max(nextCx - SQUARE.walkTo, clearDone),
                0,
                Math.max(0, ceiling),
            )
            const from = worldX
            const dist = Math.abs(target - from)
            if (dist < 4) return false

            setPose(POSE.ready)
            const baseY = manBottom()
            const walk = { x: from, k: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: walk,
                    x: target,
                    k: Math.ceil(dist / 90),
                    duration: (dist / SQUARE.walkSpeed) * 1000,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        worldX = walk.x
                        applyWorld()
                        man.y = baseY - Math.abs(Math.sin(walk.k * Math.PI)) * 9
                        man.setRotation(Math.sin(walk.k * Math.PI * 2) * 0.03)
                    },
                    onComplete: () => resolve(),
                })
            })
            man.y = baseY
            man.setRotation(0)
            worldX = target
            applyWorld()
            paintMarker()
            return true
        },
        pose: setPose,
        groundY: () => ground,
        groupPos(index) {
            const g = groups[index]
            const base = ground - (g?.def.lift ?? 0)
            return { x: g ? screenX(g) : W / 2, y: base - 90 }
        },
        destroy() {
            viewRoot.destroy()
        },
    }
}
