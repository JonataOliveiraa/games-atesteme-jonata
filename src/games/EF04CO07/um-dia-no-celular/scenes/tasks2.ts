import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, REMOTE, SCREEN } from '../data/layout'
import { T } from '../data/timing'
import { COINS, FWD_FACE, FWD_LIST, FWD_NUMBER, FWD_PHOTO, LIGHT, MAP, NAME, PERMISSION, POSTER } from '../data/words'
import type { Kid, Thing } from '../types'
import { paintAvatar, thingImage } from './art'
import type { ShareSheet } from './screens2'
import { kid, openFromBanner, speak, type Kit, type Outcome } from './tasks'

type ShareResult = 'rushed' | 'sent' | 'overruled' | 'kept'

const phoneMid = () => ({ x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 - 60 })

async function shareDecision(k: Kit, sheet: ShareSheet, answer: () => Promise<void>, allowed: boolean): Promise<ShareResult> {
    await k.guard(sheet.show(['send', 'ask']))
    const first = await k.choose(['share:send', 'share:ask'])
    if (first === 'share:send') return 'rushed'
    sheet.status('waiting')
    await k.wait(T.beat)
    await k.guard(answer())
    sheet.status(allowed ? 'yes' : 'no')
    await k.wait(T.beat)
    if (allowed) {
        await k.guard(sheet.show(['send']))
        await k.press(['share:send'])
        return 'sent'
    }
    await k.guard(sheet.show(['send', 'keep']))
    const second = await k.choose(['share:send', 'share:keep'])
    return second === 'share:send' ? 'overruled' : 'kept'
}

export async function flyPhotos(k: Kit, key: string, count: number) {
    const from = phoneMid()
    k.audio.send()
    await FX.all(
        ...Array.from({ length: count }, (_, i) => {
            const img = k.scene.add.image(from.x, from.y, key).setDisplaySize(66, 94).setDepth(DEPTH.fly)
            const to = { x: -60 - (i % 3) * 30, y: 120 + ((i * 97) % 480) }
            return FX.wait(k.scene, i * 110)
                .then(() => FX.arcTo(k.scene, img, to, { height: 120, duration: 900 }))
                .then(() => img.destroy())
        }),
    )
}

async function flyTo(k: Kit, make: () => Phaser.GameObjects.Image, to: { x: number; y: number }) {
    const from = phoneMid()
    const img = make().setPosition(from.x, from.y).setDepth(DEPTH.fly)
    k.audio.whoosh()
    await FX.arcTo(k.scene, img, to, { height: 140, duration: 900 })
    await FX.to(k.scene, img, { scale: img.scale * 0.5, alpha: 0 }, { duration: 260 })
    img.destroy()
}

async function flyContacts(k: Kit) {
    const who: Kid[] = ['nina', 'caio', 'bia', 'rafa', 'duda']
    const from = phoneMid()
    k.audio.whoosh()
    await FX.all(
        ...who.map((kidId, i) => {
            const img = k.scene.add.image(from.x, from.y, paintAvatar(k.scene, kidId)).setDisplaySize(64, 64).setDepth(DEPTH.fly)
            const to = { x: -50, y: 140 + i * 110 }
            return FX.wait(k.scene, i * 140)
                .then(() => FX.arcTo(k.scene, img, to, { height: 100, duration: 900 }))
                .then(() => img.destroy())
        }),
    )
}

const thingAt = (k: Kit, thing: Thing, size: number) => () => thingImage(k.scene, thing, size)

const notified = (k: Kit, sender: Parameters<Kit['notify']>[0], line: string) => () => k.notify(sender, line).then(() => undefined)

// ───────────────────────────────────────────────────────── N2: passar adiante

export async function forwardPhoto(k: Kit): Promise<Outcome> {
    const photo = k.stock(kid('nina', 'pose', 'sala'), 'cel-photo-n2-nina')
    await k.guard(k.world.enter('nina', 'idle'))
    await k.wait(T.beat)
    await k.guard(k.order('prof', FWD_PHOTO.order))
    await k.wait(T.short)
    await openFromBanner(k, 'turma', FWD_PHOTO.banner)
    await k.guard(k.gallery(photo, ['forward']))
    await k.wait(T.beat)
    await k.press(['gal:forward'])
    const sheet = await k.guard(k.share('escola', 'nina'))
    const result = await shareDecision(
        k,
        sheet,
        async () => {
            k.world.mood('wave')
            await speak(k, 'nina', FWD_PHOTO.yes)
        },
        true,
    )
    sheet.status('sent')
    await k.guard(flyPhotos(k, photo, 5))
    if (result === 'rushed') {
        k.world.mood('hurt')
        await k.guard(k.say('nina', FWD_PHOTO.oops))
        await k.guard(k.world.shake())
        return 'fail'
    }
    await k.guard(sheet.close())
    await k.guard(k.notify('prof', FWD_PHOTO.thanks))
    await k.wait(T.short)
    return 'ok'
}

export async function forwardFace(k: Kit): Promise<Outcome> {
    const photo = k.stock(kid('bia', 'hurt', 'patio'), 'cel-photo-n2-bia')
    await k.guard(k.world.showRemote('caio', 'thumb'))
    await k.wait(T.beat)
    await k.guard(k.order('caio', FWD_FACE.order))
    await k.wait(T.short)
    await openFromBanner(k, 'caio', FWD_FACE.banner)
    await k.guard(k.gallery(photo, ['forward']))
    await k.wait(T.beat)
    await k.press(['gal:forward'])
    const sheet = await k.guard(k.share('escola', 'bia'))
    const result = await shareDecision(k, sheet, notified(k, 'bia', FWD_FACE.no), false)
    if (result === 'rushed' || result === 'overruled') {
        sheet.status('sent')
        await k.guard(flyPhotos(k, photo, 6))
        await k.guard(k.notify('bia', FWD_FACE.oops, true))
        return 'fail'
    }
    await k.guard(sheet.close())
    k.world.remoteMood('ask')
    await k.guard(k.notify('caio', FWD_FACE.sorry))
    await k.wait(T.long)
    await k.guard(k.notify('bia', FWD_FACE.thanks))
    await k.wait(T.short)
    return 'ok'
}

export async function forwardNumber(k: Kit): Promise<Outcome> {
    await k.guard(k.world.enter('caio', 'ask'))
    await k.wait(T.beat)
    await k.guard(k.order('caio', FWD_NUMBER.order))
    await k.wait(T.short)
    await speak(k, 'caio', FWD_NUMBER.ask)
    await k.press(['app:chat'])
    await k.guard(k.contact('nina'))
    await k.wait(T.beat)
    await k.press(['contact:forward'])
    const sheet = await k.guard(k.share('caio', 'nina'))
    const result = await shareDecision(k, sheet, notified(k, 'nina', FWD_NUMBER.yes), true)
    sheet.status('sent')
    const head = k.world.headTop()
    await k.guard(flyTo(k, () => k.scene.add.image(0, 0, paintAvatar(k.scene, 'nina')).setDisplaySize(70, 70), { x: head.x, y: head.y + 80 }))
    if (result === 'rushed') {
        await k.guard(k.notify('nina', FWD_NUMBER.oops, true))
        return 'fail'
    }
    await k.guard(sheet.close())
    k.world.mood('thumb')
    await k.guard(k.say('caio', FWD_NUMBER.thanks))
    return 'ok'
}

export async function forwardList(k: Kit): Promise<Outcome> {
    await k.guard(k.world.showRemote('unknown', 'idle'))
    await k.wait(T.beat)
    await k.guard(k.order('unknown', FWD_LIST.order))
    await k.wait(T.short)
    await openFromBanner(k, 'unknown', FWD_LIST.banner)
    await k.guard(k.doc())
    await k.wait(T.beat)
    await k.press(['doc:forward'])
    const sheet = await k.guard(k.share('unknown', 'mae'))
    const result = await shareDecision(k, sheet, notified(k, 'mae', FWD_LIST.no), false)
    if (result === 'rushed' || result === 'overruled') {
        sheet.status('sent')
        await k.guard(flyTo(k, thingAt(k, 'list', 120), { x: REMOTE.x, y: REMOTE.y }))
        await k.guard(k.notify('nina', FWD_LIST.oops, true))
        await k.wait(T.beat)
        await k.guard(k.notify('caio', FWD_LIST.oops2, true))
        return 'fail'
    }
    await k.guard(sheet.close())
    await k.guard(k.notify('mae', FWD_LIST.thanks))
    await k.wait(T.short)
    return 'ok'
}

// ───────────────────────────────────────────────────────── N3: apps e autoria

export async function map(k: Kit): Promise<Outcome> {
    await k.guard(k.world.enter('nina', 'idle'))
    await k.wait(T.beat)
    await k.guard(k.order('prof', MAP.order))
    await k.wait(T.short)
    await openFromBanner(k, 'turma', MAP.banner)
    const screen = await k.guard(k.map())
    await k.wait(T.short)
    const dialog = await k.guard(k.permission('map', PERMISSION.map))
    const pick = await k.choose(['perm:allow', 'perm:deny'])
    await k.guard(dialog.close())
    if (pick === 'perm:deny') {
        await k.guard(screen.lose())
        k.world.mood('cover')
        await k.guard(k.say('nina', MAP.lost))
        await k.guard(k.world.shake())
        return 'fail'
    }
    await k.guard(screen.locate())
    k.world.mood('wave')
    await k.guard(k.say('nina', MAP.found))
    return 'ok'
}

export async function poster(k: Kit): Promise<Outcome> {
    await k.guard(k.world.enter('caio', 'thumb'))
    await k.wait(T.beat)
    await k.guard(k.order('prof', POSTER.order))
    await k.wait(T.short)
    await speak(k, 'caio', POSTER.caio)
    await openFromBanner(k, 'turma', POSTER.banner)
    const screen = await k.guard(k.poster())
    await k.wait(T.beat)
    const pick = await k.choose(['poster:credit', 'poster:mine'])
    if (pick === 'poster:mine') {
        await k.guard(screen.sign(POSTER.me))
        k.world.mood('ask')
        await k.guard(k.say('caio', POSTER.oops))
        await k.guard(k.world.shake())
        return 'fail'
    }
    await k.guard(screen.sign(NAME.caio))
    k.world.mood('thumb')
    await k.guard(k.say('caio', POSTER.thanks))
    return 'ok'
}

export async function coins(k: Kit): Promise<Outcome> {
    await k.guard(k.order('pet', COINS.order))
    await k.wait(T.short)
    await openFromBanner(k, 'pet', COINS.banner)
    const screen = await k.guard(k.pet())
    await k.wait(T.beat)
    await k.guard(screen.showOffer())
    const pick = await k.choose(['pet:allow', 'pet:deny'])
    if (pick === 'pet:allow') {
        await k.guard(screen.coinsVanish())
        await k.guard(flyContacts(k))
        await k.guard(k.notify('nina', COINS.oops, true))
        await k.wait(T.beat)
        await k.guard(k.notify('caio', COINS.oops2, true))
        return 'fail'
    }
    await k.guard(screen.keepHappy())
    await k.wait(T.short)
    return 'ok'
}

export async function flashlight(k: Kit): Promise<Outcome> {
    await k.guard(k.world.blackout())
    await k.wait(T.beat)
    await k.guard(k.order('mae', LIGHT.order))
    await k.wait(T.short)
    const banner = await k.guard(k.notify('mae', LIGHT.banner))
    await k.wait(T.beat)
    await k.press(['app:flashlight'])
    await k.guard(banner.hide())
    const lamp = await k.guard(k.lamp())
    await k.wait(T.short)
    const dialog = await k.guard(k.permission('flashlight', PERMISSION.flashlight))
    const pick = await k.choose(['perm:allow', 'perm:deny'])
    await k.guard(dialog.close())
    if (pick === 'perm:allow') {
        await k.guard(flyContacts(k))
        await k.guard(k.notify('nina', LIGHT.oops, true))
        return 'fail'
    }
    await k.wait(T.short)
    await k.press(['lamp:on'])
    await k.guard(lamp.on())
    await k.guard(k.world.lightUp())
    await k.wait(T.short)
    await k.guard(k.notify('mae', LIGHT.thanks))
    await k.wait(T.short)
    return 'ok'
}
