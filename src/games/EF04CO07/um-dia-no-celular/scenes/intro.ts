import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { AppId, Kid } from '../types'
import { paintAvatar, paintShot, thingImage } from './art'
import type { Audio } from './audio'
import type { Home } from './screens'

function polaroid(scene: Phaser.Scene) {
    const key = paintShot(scene, 'cel-photo-intro', { kind: 'kid', who: 'nina', mood: 'wave', place: 'sala' })
    const frame = scene.add.graphics()
    frame.fillStyle(C.shadow, 0.2)
    frame.fillRoundedRect(-50, -74, 108, 150, 8)
    frame.fillStyle(C.white, 1)
    frame.fillRoundedRect(-54, -80, 108, 150, 8)
    const photo = scene.add.image(0, -12, key).setDisplaySize(90, 120)
    return scene.add.container(0, 0, [frame, photo])
}

function note(scene: Phaser.Scene) {
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(-58, -36, 120, 76, 26)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-62, -42, 120, 76, 26)
    g.fillTriangle(-34, 30, -12, 30, -42, 56)
    g.fillStyle(C.accent, 1)
    ;[-30, -2, 26].forEach(x => g.fillCircle(x, -4, 9))
    return scene.add.container(0, 0, [g])
}

export async function showData(scene: Phaser.Scene, home: Home, audio: Audio) {
    const tokens: Array<{ box: Phaser.GameObjects.Container | Phaser.GameObjects.Image; from: [number, number]; to: AppId }> = [
        { box: polaroid(scene), from: [190, 300], to: 'gallery' },
        { box: note(scene), from: [470, 230], to: 'chat' },
        { box: thingImage(scene, 'key', 120), from: [360, 480], to: 'pet' },
    ]
    tokens.forEach(({ box, from }, i) => {
        box.setPosition(from[0], from[1]).setDepth(DEPTH.fly).setScale(0).setAngle(i % 2 ? 8 : -8)
    })
    await FX.all(
        ...tokens.map(({ box }, i) =>
            FX.wait(scene, i * 280).then(() => {
                audio.pop()
                return FX.to(scene, box, { scale: 1 }, { duration: 460, ease: 'Back.easeOut' })
            }),
        ),
    )
    await FX.wait(scene, 1000)
    await FX.all(
        ...tokens.map(({ box, to }, i) =>
            FX.wait(scene, i * 360).then(async () => {
                const target = home.iconRect(to)
                audio.whoosh()
                await FX.arcTo(scene, box, { x: target.x, y: target.y }, { height: 120, duration: 820 })
                await FX.to(scene, box, { scale: 0.1, alpha: 0 }, { duration: 160 })
                box.destroy()
                audio.receive()
                void FX.sparks(scene, target.x, target.y, { color: C.butter, count: 10, spread: 60, size: 7, duration: 420, depth: DEPTH.fly })
            }),
        ),
    )
}

export async function showOwners(scene: Phaser.Scene, home: Home, audio: Audio) {
    const owners: Array<[AppId, Kid]> = [
        ['gallery', 'nina'],
        ['chat', 'caio'],
    ]
    const badges = owners.map(([app, who]) => {
        const r = home.iconRect(app)
        const ring = scene.add.circle(0, 0, 25, C.white)
        const face = scene.add.image(0, 0, paintAvatar(scene, who)).setDisplaySize(44, 44)
        return scene.add
            .container(r.x + r.w / 2 - 10, r.y - r.h / 2 + 8, [ring, face])
            .setDepth(DEPTH.fly)
            .setScale(0)
    })
    await FX.all(
        ...badges.map((badge, i) =>
            FX.wait(scene, i * 420).then(() => {
                audio.pop()
                return FX.to(scene, badge, { scale: 1 }, { duration: 460, ease: 'Back.easeOut' })
            }),
        ),
    )
    return {
        async clear() {
            await FX.to(scene, badges, { scale: 0, alpha: 0 }, { duration: 220 })
            badges.forEach(b => b.destroy())
        },
    }
}
