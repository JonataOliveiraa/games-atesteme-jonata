import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BACKDROPS } from '../data/files'
import { DEPTH, H, PERSON, PHONE, REMOTE, W } from '../data/layout'
import { C, CSS, FONT, KID_TONE, SIZE } from '../data/theme'
import { T } from '../data/timing'
import { NAME } from '../data/words'
import type { Kid, Mood, Place, Rect, Thing } from '../types'
import { SHADOW, kidImage, paintGlow, paintImage, paintRemote, paintStranger, setKid, thingImage } from './art'

export interface World {
    place(place: Place, night: boolean, instant?: boolean): Promise<void>
    focus(on: boolean): void
    enter(who: Kid, mood: Mood, from?: 'left' | 'right'): Promise<void>
    mood(mood: Mood, bounce?: boolean): void
    leave(to?: 'left' | 'right'): Promise<void>
    shake(): Promise<void>
    who(): Kid | null
    headTop(): { x: number; y: number }
    personRect(): Rect
    prop(thing: Thing, x: number, y: number, size: number): Phaser.GameObjects.Image
    clearProps(): void
    showRemote(who: Kid | 'unknown', mood: Mood): Promise<void>
    blackout(): Promise<void>
    lightUp(): Promise<void>
    remoteMood(mood: Mood): void
    hideRemote(): Promise<void>
    remoteRect(): Rect
    destroy(): void
}

export function createWorld(scene: Phaser.Scene): World {
    let currentPlace: Place = 'quarto'
    let back = scene.add.image(W / 2, H / 2, BACKDROPS.quarto).setDisplaySize(W, H).setDepth(DEPTH.bg)
    const night = scene.add.rectangle(W / 2, H / 2, W, H, C.night, 1).setDepth(DEPTH.night).setAlpha(0)
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.veil, 0.3).setDepth(DEPTH.veil)
    const dim = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 1).setDepth(DEPTH.dim).setAlpha(0)
    const shadow = scene.add.image(PERSON.x, PERSON.feet - 18, SHADOW).setDepth(DEPTH.shadow).setAlpha(0).setScale(0.9, 0.7)

    let person: Phaser.GameObjects.Image | null = null
    let current: Kid | null = null
    let props: Phaser.GameObjects.Image[] = []

    let ring: Phaser.GameObjects.Image | null = null
    const remote = scene.add.image(REMOTE.x, REMOTE.y, '__WHITE').setDepth(DEPTH.person).setVisible(false)
    const remoteName = scene.add
        .text(REMOTE.x, REMOTE.nameY, '', { fontFamily: FONT.black, fontSize: `${SIZE.remoteName}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.person)
        .setVisible(false)
    const waves: Phaser.GameObjects.Arc[] = []
    let remoteWho: Kid | 'unknown' | null = null
    let glow: Phaser.GameObjects.Image | null = null
    let waveTimer: Phaser.Time.TimerEvent | null = null

    const paintRing = (tone: number) => {
        ring?.destroy()
        const r = REMOTE.r + 12
        const pillW = Math.max(120, remoteName.width + 44)
        const ny = REMOTE.nameY - REMOTE.y
        ring = paintImage(
            scene,
            r * 2 + 12,
            ny + 26 + r,
            g => {
                g.fillStyle(C.shadow, 0.2)
                g.fillCircle(6, 10, r)
                g.fillStyle(C.white, 1)
                g.fillCircle(0, 0, r)
                g.lineStyle(6, tone, 1)
                g.strokeCircle(0, 0, r)
                g.fillStyle(tone, 1)
                g.fillRoundedRect(-pillW / 2, ny - 22, pillW, 44, 22)
            },
            r,
            r,
        )
            .setPosition(REMOTE.x, REMOTE.y)
            .setDepth(DEPTH.person - 0.5)
        return ring
    }

    const sendWave = () => {
        const fromX = REMOTE.x + REMOTE.r + 30
        const toX = PHONE.cx - PHONE.w / 2 - 10
        const y = REMOTE.y - 40
        for (let k = 0; k < 3; k++) {
            const tone = remoteWho && remoteWho !== 'unknown' ? KID_TONE[remoteWho] : C.inkSoft
            const dot = scene.add.circle(fromX, y, 7, tone, 0.9).setDepth(DEPTH.person)
            waves.push(dot)
            void FX.wait(scene, k * 160).then(() =>
                FX.to(scene, dot, { x: toX, alpha: 0 }, { duration: 900, ease: 'Sine.easeIn' }).then(() => {
                    const i = waves.indexOf(dot)
                    if (i >= 0) waves.splice(i, 1)
                    dot.destroy()
                }),
            )
        }
    }

    return {
        async place(place, isNight, instant = false) {
            const nightAlpha = isNight ? 0.5 : 0
            const veilAlpha = isNight ? 0.15 : 1
            if (glow) {
                const old = glow
                glow = null
                void FX.to(scene, old, { alpha: 0 }, { duration: T.place }).then(() => old.destroy())
            }
            if (instant || place === currentPlace) {
                if (place !== currentPlace) back.setTexture(BACKDROPS[place]).setDisplaySize(W, H)
                currentPlace = place
                if (instant) {
                    night.setAlpha(nightAlpha)
                    veil.setAlpha(veilAlpha)
                } else await FX.all(FX.to(scene, night, { alpha: nightAlpha }, { duration: T.place }), FX.to(scene, veil, { alpha: veilAlpha }, { duration: T.place }))
                return
            }
            const next = scene.add.image(W / 2, H / 2, BACKDROPS[place]).setDisplaySize(W, H).setDepth(DEPTH.bg).setAlpha(0)
            currentPlace = place
            await FX.all(
                FX.to(scene, next, { alpha: 1 }, { duration: T.place }),
                FX.to(scene, night, { alpha: nightAlpha }, { duration: T.place }),
                FX.to(scene, veil, { alpha: veilAlpha }, { duration: T.place }),
            )
            back.destroy()
            back = next
        },
        focus(on) {
            scene.tweens.killTweensOf(dim)
            void FX.to(scene, dim, { alpha: on ? 0.3 : 0 }, { duration: T.focus })
        },
        async enter(who, mood, from = 'left') {
            person?.destroy()
            current = who
            person = kidImage(scene, who, mood, PERSON.h).setDepth(DEPTH.person)
            const startX = from === 'left' ? PERSON.x - PERSON.slide : PERSON.x + PERSON.slide
            person.setPosition(startX, PERSON.feet)
            shadow.setX(startX)
            await FX.all(
                FX.to(scene, person, { x: PERSON.x }, { duration: T.enter, ease: 'Cubic.easeOut' }),
                FX.to(scene, shadow, { x: PERSON.x, alpha: 0.22 }, { duration: T.enter, ease: 'Cubic.easeOut' }),
            )
            const base = person.scaleY
            await FX.to(scene, person, { scaleY: base * 0.96 }, { duration: 90, yoyo: true })
        },
        mood(mood, bounce = true) {
            if (!person || !current) return
            setKid(scene, person, current, mood, PERSON.h)
            if (!bounce) return
            const base = person.scaleY
            const img = person
            void FX.to(scene, img, { scaleY: base * 1.05 }, { duration: 110, yoyo: true }).then(() => img.active && img.setScale(img.scaleX, base))
        },
        async leave(to = 'left') {
            if (!person) return
            const img = person
            person = null
            current = null
            const x = to === 'left' ? PERSON.x - PERSON.slide : PERSON.x + PERSON.slide
            await FX.all(
                FX.to(scene, img, { x }, { duration: T.leave, ease: 'Cubic.easeIn' }),
                FX.to(scene, shadow, { x, alpha: 0 }, { duration: T.leave, ease: 'Cubic.easeIn' }),
            )
            img.destroy()
        },
        async shake() {
            if (!person) return
            await FX.shake(scene, person, { amount: 10, times: 4 })
        },
        who: () => current,
        headTop() {
            if (!person) return { x: PERSON.x, y: 260 }
            return { x: PERSON.x, y: PERSON.feet - person.displayHeight }
        },
        personRect() {
            const h = person?.displayHeight ?? PERSON.h
            const w = person?.displayWidth ?? 300
            return { x: PERSON.x, y: PERSON.feet - h / 2, w: w + 20, h }
        },
        prop(thing, x, y, size) {
            const image = thingImage(scene, thing, size).setPosition(x, y).setDepth(DEPTH.person - 1)
            props.push(image)
            return image
        },
        clearProps() {
            props.forEach(p => p.destroy())
            props = []
        },
        async showRemote(who, mood) {
            remoteWho = who
            const art = who === 'unknown' ? paintStranger(scene) : paintRemote(scene, who, mood, currentPlace)
            remote.setTexture(art).setDisplaySize(REMOTE.r * 2, REMOTE.r * 2).setVisible(true)
            remoteName.setText(NAME[who]).setVisible(true)
            const parts = [paintRing(who === 'unknown' ? C.inkSoft : KID_TONE[who]), remote, remoteName]
            parts.forEach(p => p.setAlpha(0))
            remote.setScale(remote.scaleX * 0.7)
            const scale = (REMOTE.r * 2) / remote.frame.width
            await FX.all(FX.to(scene, parts, { alpha: 1 }, { duration: T.short }), FX.to(scene, remote, { scale }, { duration: T.short + 160, ease: 'Back.easeOut' }))
            sendWave()
            waveTimer?.remove()
            waveTimer = scene.time.addEvent({ delay: 2600, loop: true, callback: sendWave })
        },
        remoteMood(mood) {
            if (!remoteWho || remoteWho === 'unknown') return
            remote.setTexture(paintRemote(scene, remoteWho, mood, currentPlace)).setDisplaySize(REMOTE.r * 2, REMOTE.r * 2)
            const base = remote.scaleX
            void FX.to(scene, remote, { scale: base * 1.05 }, { duration: 110, yoyo: true }).then(() => remote.active && remote.setScale(base))
        },
        async hideRemote() {
            waveTimer?.remove()
            waveTimer = null
            if (!remoteWho) return
            remoteWho = null
            const parts: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Text> = [remote, remoteName]
            if (ring) parts.push(ring)
            await FX.to(scene, parts, { alpha: 0 }, { duration: T.leave })
            remote.setVisible(false)
            remoteName.setVisible(false)
            ring?.destroy()
            ring = null
        },
        async blackout() {
            scene.tweens.killTweensOf([night, veil])
            await FX.all(FX.to(scene, night, { alpha: 0.82 }, { duration: T.place }), FX.to(scene, veil, { alpha: 0 }, { duration: T.place }))
        },
        async lightUp() {
            glow?.destroy()
            glow = scene.add.image(560, 400, paintGlow(scene)).setDepth(DEPTH.veil).setScale(5).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD)
            await FX.all(FX.to(scene, night, { alpha: 0.45 }, { duration: T.place }), FX.to(scene, glow, { alpha: 0.8 }, { duration: T.place }))
        },
        remoteRect: () => ({ x: REMOTE.x, y: REMOTE.y + 30, w: REMOTE.r * 2 + 40, h: REMOTE.r * 2 + 110 }),
        destroy() {
            waveTimer?.remove()
            waves.forEach(w => w.destroy())
            props.forEach(p => p.destroy())
            person?.destroy()
            ring?.destroy()
            glow?.destroy()
            ;[back, night, veil, dim, shadow, remote, remoteName].forEach(o => o.destroy())
        },
    }
}
