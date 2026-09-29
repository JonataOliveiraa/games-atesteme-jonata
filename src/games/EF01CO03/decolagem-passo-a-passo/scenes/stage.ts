import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { BG, KID, KID_CELL, SCENE, SCENE2, SCENE2_CELL, SCENE_CELL } from '../data/files'
import { COUNT, DEPTH, H, PAD, PLACES, PROPS, STAGE, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { MissionDef } from '../types'
import { sound } from './audio'

export interface Stage {
    readonly rect: GuideRect
    readonly hero: Phaser.GameObjects.Container | undefined
    show(mission: MissionDef): Promise<void>
    perform(stepId: string): Promise<void>
    fail(sceneId: string): Promise<void>
    launch(mission: MissionDef): Promise<void>
    clear(): void
    destroy(): void
}

type PieceName = keyof typeof SCENE_CELL
type PropName = keyof typeof SCENE2_CELL
type Pose = keyof typeof KID_CELL
type KiteState = 'ground' | 'tied' | 'fly'

const KID_SCALE = STAGE.kidH / STAGE.kidBody
const FOOT = STAGE.sceneFoot / STAGE.cell
const FLAME_TOP = STAGE.flameTop / STAGE.cell
const BALLOON = PLACES.balloon
const ROCKET = PLACES.rocket
const KITE = PLACES.kite

function paintPad(g: Phaser.GameObjects.Graphics) {
    const w = PAD.w
    const h = PAD.h
    g.fillStyle(C.shadow, 0.18)
    g.fillEllipse(0, h + 2, w + 30, 20)
    g.fillStyle(C.padDark, 1)
    g.fillRect(-w / 2 + 22, 10, 16, h - 6)
    g.fillRect(w / 2 - 38, 10, 16, h - 6)
    g.fillStyle(C.pad, 1)
    g.fillRoundedRect(-w / 2, 0, w, 16, 8)
    g.lineStyle(4, C.padDark, 1)
    g.strokeRoundedRect(-w / 2, 0, w, 16, 8)
}

function paintRopes(g: Phaser.GameObjects.Graphics) {
    const top = -BALLOON.rim - BALLOON.rope / BALLOON.basketScale
    g.lineStyle(7, C.wicker, 1)
    g.lineBetween(-BALLOON.ropeX, -BALLOON.rim, -BALLOON.ropeX - 6, top)
    g.lineBetween(BALLOON.ropeX, -BALLOON.rim, BALLOON.ropeX + 6, top)
}

export function createStage(scene: Phaser.Scene): Stage {
    const bg = scene.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg)

    let pieces = new Map<string, Phaser.GameObjects.Container>()
    let extras: Phaser.GameObjects.GameObject[] = []
    let kid: Phaser.GameObjects.Container | undefined
    let hero: Phaser.GameObjects.Container | undefined
    let counted = false
    let where: MissionDef['scene'] = 'rocket'
    let tailOn = true
    let kiteState: KiteState = 'ground'

    const art = (name: PieceName, originY = FOOT) =>
        scene.add.image(0, 0, SCENE, SCENE_CELL[name]).setOrigin(0.5, originY)

    const piece = (key: string, name: PieceName, x: number, scale: number, y: number = STAGE.groundY) => {
        const c = scene.add.container(x, y, [art(name)]).setScale(scale).setDepth(DEPTH.stage)
        pieces.set(key, c)
        return c
    }

    const imageOf = (key: string) => {
        const image = pieces.get(key)?.list[0]
        return image instanceof Phaser.GameObjects.Image ? image : undefined
    }

    const swap = (key: string, name: PieceName) => imageOf(key)?.setFrame(SCENE_CELL[name])

    const hasProps = () => scene.textures.exists(SCENE2)

    const propArt = (name: PropName): Phaser.GameObjects.GameObject => {
        if (hasProps()) return scene.add.image(0, 0, SCENE2, SCENE2_CELL[name]).setOrigin(0.5, FOOT)
        const g = scene.add.graphics()
        g.fillStyle(C.gold, 1)
        g.fillCircle(0, 0, 90)
        g.lineStyle(8, C.ink, 1)
        g.strokeCircle(0, 0, 90)
        return g
    }

    const holdProp = (name: PropName, spot: { x: number; y: number }, scale: number) => {
        if (!kid) return undefined
        const prop = scene.add.container(spot.x, spot.y, [propArt(name)]).setScale(0)
        kid.add(prop)
        void FX.to(scene, prop, { scale }, { duration: 320, ease: 'Back.easeOut' })
        return prop
    }

    const inHand = async (name: 'umbrella' | 'icecream' | 'toothbrush', shake = false) => {
        const spot = PROPS[name]
        setPose(spot.pose)
        const prop = holdProp(name, spot, spot.scale)
        await FX.wait(scene, 220)
        if (prop && shake) await FX.to(scene, prop, { x: prop.x + 24 }, { duration: 90, yoyo: true, repeat: 5 })
        await FX.wait(scene, shake ? 300 : PROPS.holdMs)
        if (prop) await FX.to(scene, prop, { alpha: 0 }, { duration: 160 })
    }

    const setKite = (state: KiteState) => {
        kiteState = state
        const image = imageOf('hero')
        if (!image) return
        if (!tailOn && hasProps()) {
            image.setTexture(SCENE2, state === 'ground' ? SCENE2_CELL.kiteBare : SCENE2_CELL.kiteBareTied)
            return
        }
        const cell = state === 'ground' ? SCENE_CELL.kiteGround : state === 'tied' ? SCENE_CELL.kiteTied : SCENE_CELL.kiteFly
        image.setTexture(SCENE, cell)
    }

    const puff = (name: PieceName, x: number, y: number, scale: number, rise = 40) => {
        const c = scene.add.container(x, y, [art(name)]).setScale(scale * 0.5).setDepth(DEPTH.fx).setAlpha(0.95)
        extras.push(c)
        return FX.to(scene, c, { scale, y: y - rise, alpha: 0 }, { duration: 700, ease: 'Sine.easeOut' })
    }

    let helmet: Phaser.GameObjects.Container | undefined

    const setPose = (pose: Pose) => {
        const image = kid?.list[0]
        if (image instanceof Phaser.GameObjects.Image) image.setFrame(KID_CELL[pose])
        const head = PROPS.head[pose]
        helmet?.setPosition(head.x, head.y)
    }

    const makeKid = (x: number) => {
        const body = scene.add.image(0, 0, KID, KID_CELL.idle).setOrigin(0.5, STAGE.kidFoot / STAGE.kidCell)
        kid = scene.add.container(x, STAGE.groundY, [body]).setScale(KID_SCALE).setDepth(DEPTH.kid)
    }

    const makePad = (x: number) => {
        const g = scene.add.graphics()
        paintPad(g)
        pieces.set('pad', scene.add.container(x, PAD.top, [g]).setDepth(DEPTH.stage - 2))
    }

    const makeFlame = (key: string, x: number, y: number, scale: number, up = false) => {
        const c = scene.add
            .container(x, y, [art('flame', FLAME_TOP)])
            .setScale(scale)
            .setAngle(up ? 180 : 0)
            .setDepth(up ? DEPTH.stage + 0.5 : DEPTH.stage - 1)
        pieces.set(key, c)
        return c
    }

    const flicker = (c: Phaser.GameObjects.Container, scale: number) =>
        scene.tweens.add({ targets: c, scaleY: scale * 1.2, duration: 120, yoyo: true, repeat: -1 })

    const kidTo = (x: number, ms = 500) =>
        kid ? FX.to(scene, kid, { x }, { duration: ms, ease: 'Sine.easeInOut' }) : Promise.resolve()

    const walkTo = async (x: number) => {
        if (!kid) return
        setPose('run')
        kid.setScale(x < kid.x ? -KID_SCALE : KID_SCALE, KID_SCALE)
        await kidTo(x, Math.max(260, Math.abs(x - kid.x) * 1.6))
        kid.setScale(KID_SCALE)
        setPose('idle')
    }

    const shake = (c: Phaser.GameObjects.Container | undefined, times = 4) =>
        c ? FX.to(scene, c, { x: c.x + 4 }, { duration: 50, yoyo: true, repeat: times }) : Promise.resolve()

    const hand = () => ({ x: (kid?.x ?? KITE.runTo) + KITE.handX, y: STAGE.groundY - KITE.handY })

    const kiteScale = (scale: number) =>
        Math.min(scale, (KITE.maxX - hand().x) / KITE.kiteRight, (hand().y - KITE.minTop) / KITE.kiteTop)

    const clear = () => {
        pieces.forEach(c => {
            scene.tweens.killTweensOf(c)
            c.destroy()
        })
        pieces = new Map()
        extras.forEach(o => o.destroy())
        extras = []
        if (kid) {
            scene.tweens.killTweensOf(kid)
            kid.destroy()
        }
        kid = undefined
        hero = undefined
        helmet = undefined
    }

    const countdown = async () => {
        for (const n of [3, 2, 1]) {
            const text = scene.add
                .text(COUNT.x, COUNT.y, String(n), {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.count}px`,
                    color: CSS.count,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setStroke(CSS.ink, 12)
                .setDepth(DEPTH.count)
                .setScale(0.4)
            extras.push(text)
            sound()?.count(n)
            await FX.to(scene, text, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
            await FX.to(scene, text, { alpha: 0, scale: 1.3 }, { duration: 380, delay: 200 })
        }
        sound()?.count(0)
    }

    const smokeTrail = (x: number, y: number, times: number, gap: number) =>
        FX.all(
            ...Array.from({ length: times }, (_, i) =>
                FX.wait(scene, i * gap).then(() => puff('smoke', x + Phaser.Math.Between(-40, 40), y, 0.5, 60)),
            ),
        )

    const oops = async () => {
        setPose('oops')
        await FX.wait(scene, 250)
    }

    const boardBasket = async (x: number) => {
        if (!kid) return
        kid.setDepth(DEPTH.stage + 0.5)
        await FX.to(
            scene,
            kid,
            { x, y: STAGE.groundY - BALLOON.ride, scale: KID_SCALE * BALLOON.kidScale },
            { duration: 380, ease: 'Back.easeOut' },
        )
        setPose('cheer')
    }

    const fails: Record<string, () => Promise<void>> = {
        'door-hose': async () => {
            swap('hero', 'rocketClosed')
            await FX.wait(scene, 180)
            await puff('splash', ROCKET.pump + 70, STAGE.groundY - 120, 0.6, 20)
            await oops()
        },
        'cough-empty': async () => {
            await FX.all(shake(hero), smokeTrail(hero?.x ?? ROCKET.hero, PAD.top, 2, 260))
            await oops()
        },
        'smoke-door': async () => {
            void shake(hero)
            await smokeTrail(hero?.x ?? ROCKET.hero, PAD.top - ROCKET.doorY - 60, 3, 160)
            setPose('sooty')
            await FX.wait(scene, 400)
        },
        'flat-cover': async () => {
            const x = kid?.x ?? BALLOON.kid
            hero?.setDepth(DEPTH.kid + 1)
            if (hero) await FX.to(scene, hero, { x: x + 40 }, { duration: 420, ease: 'Quad.easeIn' })
            void puff('dust', x, STAGE.groundY, 0.5, 10)
            await oops()
        },
        'flat-nothing': async () => {
            const stakes = pieces.get('stakes')
            if (stakes) void puff('dust', stakes.x, STAGE.groundY, 0.5, 10)
            if (hero) await FX.to(scene, hero, { scaleY: hero.scaleY * 0.85 }, { duration: 160, yoyo: true })
            await oops()
        },
        'fly-alone': async () => {
            const stakes = pieces.get('stakes')
            if (stakes) void FX.to(scene, stakes, { alpha: 0 }, { duration: 300 })
            const burner = pieces.get('burner')
            const flying = [hero, burner].filter((c): c is Phaser.GameObjects.Container => !!c)
            await FX.to(scene, flying, { y: '-=860' }, { duration: 900, ease: 'Sine.easeIn' })
            setPose('wave')
            await FX.wait(scene, 300)
        },
        'run-alone': async () => {
            setPose('run')
            await kidTo(KITE.runTo, 450)
            await oops()
        },
        'kite-away': async () => {
            setKite('fly')
            if (hero) await FX.to(scene, hero, { x: KITE.maxX - 60, y: -160, angle: 30 }, { duration: 850, ease: 'Sine.easeIn' })
            await oops()
        },
        'kite-drop': async () => {
            setKite('fly')
            if (hero) {
                await FX.to(scene, hero, { y: STAGE.groundY - 120 }, { duration: 300, ease: 'Quad.easeOut' })
                await FX.to(scene, hero, { y: STAGE.groundY }, { duration: 260, ease: 'Bounce.easeOut' })
            }
            setKite('ground')
            void puff('dust', hero?.x ?? KITE.hero, STAGE.groundY, 0.5, 10)
            await oops()
        },
        'kite-spin': async () => {
            setPose('run')
            const run = kidTo(KITE.runTo, 520)
            if (hero) {
                await FX.to(scene, hero, { x: KITE.dragX, y: STAGE.groundY - 160, angle: 540 }, { duration: 620, ease: 'Sine.easeOut' })
                await FX.to(scene, hero, { y: STAGE.groundY, angle: 720 }, { duration: 360, ease: 'Bounce.easeOut' })
                void puff('dust', hero.x, STAGE.groundY, 0.5, 10)
            }
            await run
            await oops()
        },
        umbrella: async () => {
            await inHand('umbrella')
            await oops()
        },
        toothbrush: async () => {
            await inHand('toothbrush', true)
            await oops()
        },
        icecream: async () => {
            await inHand('icecream')
            await oops()
        },
        bonk: async () => {
            const basket = pieces.get('basket')
            const target = where === 'balloon' && basket ? basket.x - BALLOON.beside : ROCKET.hero - 50
            await walkTo(target)
            if (kid) {
                await FX.to(scene, kid, { x: kid.x - 40 }, { duration: 160, ease: 'Quad.easeOut' })
                void FX.stars(scene, kid.x, STAGE.groundY - STAGE.kidH, { count: 6, rise: 30, duration: 600, depth: DEPTH.fx })
            }
            await oops()
        },
    }

    const steps: Record<string, () => Promise<void>> = {
        fuel: async () => {
            swap('pump', 'pumpFull')
            const pump = pieces.get('pump')
            if (pump) await FX.press(scene, pump, 1.06)
            void FX.stars(scene, ROCKET.pump, STAGE.groundY - 120, { count: 6, rise: 40, duration: 600, depth: DEPTH.fx })
        },
        door: async () => {
            await walkTo(ROCKET.hero)
            if (kid) {
                kid.setDepth(DEPTH.stage + 1)
                await FX.to(
                    scene,
                    kid,
                    { y: PAD.top - ROCKET.doorY + 40, scale: KID_SCALE * 0.4, alpha: 0 },
                    { duration: 420, ease: 'Sine.easeIn' },
                )
                kid.setVisible(false)
            }
            swap('hero', 'rocketClosed')
            if (hero) await FX.to(scene, hero, { scaleX: hero.scaleX * 1.04 }, { duration: 100, yoyo: true })
        },
        button: async () => {
            await FX.all(shake(hero, 6), smokeTrail(hero?.x ?? ROCKET.hero, PAD.top + 10, 2, 180))
        },
        count: async () => {
            void shake(hero, 6)
            await countdown()
            counted = true
        },
        helmet: async () => {
            setPose('idle')
            helmet = holdProp('helmet', PROPS.head.idle, PROPS.helmetScale)
            await FX.wait(scene, 380)
        },
        fill: async () => {
            swap('hero', 'balloonFull')
            if (hero) {
                const s = hero.scaleX
                hero.setScale(s, s * 0.3)
                const burnerY = STAGE.groundY - BALLOON.lift - BALLOON.mouth + BALLOON.burnerGap
                const burner = makeFlame('burner', hero.x, burnerY, BALLOON.burnerScale, true)
                flicker(burner, BALLOON.burnerScale)
                await FX.to(scene, hero, { scaleY: s, y: STAGE.groundY - BALLOON.lift }, { duration: 620, ease: 'Back.easeOut' })
            }
        },
        basket: async () => {
            const basket = pieces.get('basket')
            if (!basket) return
            await FX.to(scene, basket, { x: BALLOON.hero }, { duration: 520, ease: 'Sine.easeInOut' })
            const ropes = basket.getData('ropes') as Phaser.GameObjects.Graphics | undefined
            if (ropes) void FX.to(scene, ropes, { alpha: 1 }, { duration: 220 })
            await walkTo(BALLOON.hero - 70)
            await boardBasket(BALLOON.hero)
        },
        ropes: async () => {
            const stakes = pieces.get('stakes')
            if (stakes) {
                void puff('dust', stakes.x, STAGE.groundY, 0.5, 10)
                await FX.to(scene, stakes, { alpha: 0 }, { duration: 320 })
            }
        },
        knot: async () => {
            setKite('tied')
            if (hero) await FX.to(scene, hero, { angle: 6 }, { duration: 120, yoyo: true })
        },
        tail: async () => {
            tailOn = true
            setKite(kiteState)
            if (hero) await FX.press(scene, hero, 1.08)
        },
        run: async () => {
            setPose('run')
            await FX.all(
                kidTo(KITE.runTo, 520),
                hero
                    ? FX.to(scene, hero, { x: KITE.dragX, y: STAGE.groundY - 30, angle: -8 }, { duration: 520 })
                    : Promise.resolve(),
            )
        },
        release: async () => {
            setPose('cheer')
            const image = imageOf('hero')
            if (!hero || !image) return
            setKite('fly')
            image.setOrigin(KITE.lineX / STAGE.cell, FOOT)
            const at = hand()
            hero.setPosition(at.x, at.y).setAngle(0).setScale(KITE.flyScale * 0.4).setDepth(DEPTH.kid + 1)
            await FX.to(scene, hero, { scale: kiteScale(KITE.flyScale) }, { duration: 620, ease: 'Back.easeOut' })
        },
    }

    const launchRocket = async () => {
        if (!hero) return
        const nozzleY = hero.y - STAGE.nozzle
        const flame = makeFlame('flame', hero.x, nozzleY, ROCKET.flameStart)
        const both = [hero, flame]
        void smokeTrail(hero.x, PAD.top, 6, 140)
        await FX.to(scene, both, { y: `-=${ROCKET.lift}` }, { duration: 450, ease: 'Sine.easeOut' })
        await FX.all(
            FX.to(scene, both, { y: `-=${ROCKET.climb}` }, { duration: 350, ease: 'Linear' }),
            FX.to(scene, flame, { scale: STAGE.flameLaunch }, { duration: 350, ease: 'Linear' }),
        )
        await FX.to(scene, both, { y: '-=900' }, { duration: 1100, ease: 'Quad.easeIn' })
    }

    const launchBalloon = async () => {
        if (!hero) return
        const riders = [hero, pieces.get('burner'), pieces.get('basket'), kid].filter((c): c is Phaser.GameObjects.Container => !!c)
        await FX.to(scene, riders, { y: '-=820' }, { duration: 2000, ease: 'Sine.easeIn' })
    }

    const launchKite = async () => {
        if (!hero) return
        await FX.to(scene, hero, { scale: kiteScale(KITE.launchScale) }, { duration: 1000, ease: 'Sine.easeOut' })
        scene.tweens.add({ targets: hero, angle: -6, duration: 400, yoyo: true, repeat: 2 })
    }

    return {
        rect: { x: STAGE.cx, y: STAGE.cy, w: STAGE.w, h: STAGE.h },
        get hero() {
            return hero
        },
        async show(mission) {
            clear()
            const id = mission.scene
            counted = false
            where = id
            tailOn = !mission.steps.some(step => step.id === 'tail')
            kiteState = 'ground'
            if (id === 'rocket') {
                makePad(ROCKET.hero)
                piece('pump', 'pumpEmpty', ROCKET.pump, ROCKET.pumpScale)
                hero = piece('hero', 'rocketOpen', ROCKET.hero, ROCKET.heroScale, PAD.top)
                makeKid(ROCKET.kid)
            } else if (id === 'balloon') {
                piece('stakes', 'stakes', BALLOON.hero, BALLOON.stakesScale).setDepth(DEPTH.stage - 1)
                hero = piece('hero', 'balloonFlat', BALLOON.hero, BALLOON.heroScale)
                const basket = piece('basket', 'basket', BALLOON.basket, BALLOON.basketScale).setDepth(DEPTH.stage + 1)
                const ropes = scene.add.graphics().setAlpha(0)
                paintRopes(ropes)
                basket.addAt(ropes, 0).setData('ropes', ropes)
                makeKid(BALLOON.kid)
            } else {
                hero = piece('hero', 'kiteGround', KITE.hero, KITE.heroScale)
                setKite('ground')
                makeKid(KITE.kid)
            }
            const all = [...pieces.values(), ...(kid ? [kid] : [])]
            await FX.all(...all.map((c, i) => FX.popIn(scene, c, { delay: i * 90 })))
        },
        async perform(stepId) {
            await steps[stepId]?.()
        },
        async fail(sceneId) {
            sound()?.sfx(sceneId)
            await (fails[sceneId]?.() ?? FX.wait(scene, 1000))
        },
        async launch(mission) {
            const id = mission.scene
            if (!counted) await countdown()
            sound()?.whoosh()
            if (id !== 'rocket') setPose('cheer')
            if (id === 'rocket') await launchRocket()
            else if (id === 'balloon') await launchBalloon()
            else await launchKite()
            void FX.stars(scene, STAGE.cx, STAGE.cy - 100, { count: 14, rise: 160, duration: 1100, depth: DEPTH.fx })
            await FX.wait(scene, 500)
        },
        clear,
        destroy() {
            clear()
            bg.destroy()
        },
    }
}
