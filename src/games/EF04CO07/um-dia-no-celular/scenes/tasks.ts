import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PHONE, REMOTE, W } from '../data/layout'
import { T } from '../data/timing'
import { DEMO, DEMO2, DEMO3, DIARY, FUNNY, MURAL, PARTY, PASSWORD, PERMISSION } from '../data/words'
import type { AppId, Kid, Message, Mood, Sender, Shot, TaskId } from '../types'
import { paintShot, paintWallpaper, thingImage } from './art'
import type { Audio } from './audio'
import type { Header } from './header'
import type { Phone } from './phone'
import type { Picker } from './picker'
import type { Camera, Chat, Gallery, GalleryAction, Home, Screen } from './screens'
import type { ContactScreen, Lamp, MapScreen, Permission, PetScreen, PosterScreen, ShareSheet } from './screens2'
import { coins, flashlight, flyPhotos, forwardFace, forwardList, forwardNumber, forwardPhoto, map, poster } from './tasks2'
import type { Talk } from './talk'
import type { World } from './world'

export type Outcome = 'ok' | 'fail'

export interface Kit {
    scene: Phaser.Scene
    world: World
    talk: Talk
    phone: Phone
    picker: Picker
    header: Header
    audio: Audio
    guard<V>(value: Promise<V> | V): Promise<V>
    wait(ms: number): Promise<void>
    press(ids: string[]): Promise<string>
    choose(ids: string[]): Promise<string>
    order(sender: Sender, line: string): Promise<void>
    say(who: Kid, line: string): Promise<void>
    notify(sender: Sender, line: string, alert?: boolean, tap?: boolean): Promise<{ hide(): Promise<void> }>
    home(wallpaper?: string | null): Promise<Home>
    chat(contact: Sender): Promise<Chat>
    camera(shot: Shot): Promise<Camera>
    gallery(photo: string, actions?: GalleryAction[]): Promise<Gallery>
    share(dest: Sender, owner: Sender | null): Promise<ShareSheet>
    contact(who: Kid): Promise<ContactScreen>
    doc(): Promise<Screen>
    permission(app: AppId, line: string): Promise<Permission>
    lamp(): Promise<Lamp>
    map(): Promise<MapScreen>
    poster(): Promise<PosterScreen>
    pet(): Promise<PetScreen>
    stock(shot: Shot, key: string): string
    post(contact: Sender, message: Message, by?: Sender): Promise<void>
    shoot(camera: Camera, shot: Shot): Promise<string>
    photos(): string[]
    shotOf(photo: string): Shot | null
    forget(photo: string): void
    silly(): string
}

export const kid = (who: Kid, mood: Mood, place: Shot['place']): Shot => ({ kind: 'kid', who, mood, place })

function act(k: Kit, camera: Camera, who: Kid, mood: Mood, place: Shot['place']) {
    k.world.mood(mood)
    camera.show(kid(who, mood, place))
}

export async function openFromBanner(k: Kit, sender: Sender, line: string) {
    const banner = await k.guard(k.notify(sender, line, false, true))
    await k.press(['banner'])
    await k.guard(banner.hide())
}

export async function speak(k: Kit, who: Kid, line: string) {
    await k.guard(k.say(who, line))
    await k.wait(T.short)
}

async function sendPhoto(k: Kit, contact: Sender, photo: string, reply: string, by?: Sender) {
    await k.wait(T.afterShot)
    await k.guard(k.chat(contact))
    await k.wait(T.short)
    await k.guard(k.post(contact, { from: 'me', photo }))
    await k.wait(T.reply)
    await k.guard(k.post(contact, { from: 'them', text: reply }, by))
    await k.wait(T.short)
}

export type DemoBeat = 'banner' | 'chat' | 'camera' | 'done' | 'gallery' | 'dialog'

export async function runDemo(k: Kit, narrate: (beat: DemoBeat) => Promise<void>) {
    const shot: Shot = { kind: 'thing', thing: 'drawing', place: 'quarto' }
    await k.guard(k.order('vovo', DEMO.order))
    await k.wait(T.short)
    const banner = await k.guard(k.notify('vovo', DEMO.banner, false, true))
    await k.wait(T.long)
    await k.guard(narrate('banner'))
    await k.press(['banner'])
    await k.guard(banner.hide())
    await k.guard(k.chat('vovo'))
    await k.wait(T.beat)
    await k.guard(k.post('vovo', { from: 'them', text: DEMO.banner }))
    await k.wait(T.long)
    await k.guard(narrate('chat'))
    await k.press(['chat:camera'])
    const camera = await k.guard(k.camera(shot))
    await k.wait(T.long)
    await k.guard(narrate('camera'))
    await k.press(['cam:shutter'])
    const photo = await k.guard(k.shoot(camera, shot))
    await k.wait(T.long)
    await k.guard(k.chat('vovo'))
    await k.wait(T.beat)
    await k.guard(k.post('vovo', { from: 'me', photo }))
    await k.wait(T.long + T.beat)
    await k.guard(k.post('vovo', { from: 'them', text: DEMO.thanks }))
    await k.wait(T.long)
    await k.guard(narrate('done'))
}

export async function runForwardDemo(k: Kit, narrate: (beat: DemoBeat) => Promise<void>) {
    const cake = k.stock({ kind: 'thing', thing: 'cake', place: 'festa' }, 'cel-photo-n2-cake')
    await k.guard(k.order('vovo', DEMO2.order))
    await k.wait(T.short)
    const banner = await k.guard(k.notify('vovo', DEMO2.banner, false, true))
    await k.wait(T.long)
    await k.guard(narrate('banner'))
    await k.press(['banner'])
    await k.guard(banner.hide())
    await k.guard(k.gallery(cake, ['forward']))
    await k.wait(T.long)
    await k.guard(narrate('gallery'))
    await k.press(['gal:forward'])
    const sheet = await k.guard(k.share('vovo', null))
    await k.guard(sheet.show(['send']))
    await k.wait(T.beat)
    await k.press(['share:send'])
    sheet.status('sent')
    await k.guard(flyPhotos(k, cake, 1))
    await k.wait(T.short)
    await k.guard(sheet.close())
    await k.guard(k.notify('vovo', DEMO2.thanks))
    await k.wait(T.long)
    await k.guard(narrate('done'))
}

export async function runPermissionDemo(k: Kit, narrate: (beat: DemoBeat) => Promise<void>) {
    const room: Shot = { kind: 'place', place: 'quarto' }
    await k.guard(k.order('mae', DEMO3.order))
    await k.wait(T.short)
    const banner = await k.guard(k.notify('mae', DEMO3.banner, false, true))
    await k.wait(T.long)
    await k.press(['banner'])
    await k.guard(banner.hide())
    await k.wait(T.short)
    await k.press(['app:camera'])
    const camera = await k.guard(k.camera(room))
    const dialog = await k.guard(k.permission('camera', PERMISSION.camera))
    await k.wait(T.long)
    await k.guard(narrate('dialog'))
    await k.press(['perm:allow'])
    await k.guard(dialog.close())
    await k.wait(T.beat)
    await k.press(['cam:shutter'])
    await k.guard(k.shoot(camera, room))
    await k.wait(T.long)
    await k.guard(narrate('done'))
}

export function runTask(k: Kit, id: TaskId): Promise<Outcome> {
    switch (id) {
        case 'mural':
            return mural(k)
        case 'diary':
            return diary(k)
        case 'password':
            return password(k)
        case 'party':
            return party(k)
        case 'funny':
            return funny(k)
        case 'forwardPhoto':
            return forwardPhoto(k)
        case 'forwardFace':
            return forwardFace(k)
        case 'forwardNumber':
            return forwardNumber(k)
        case 'forwardList':
            return forwardList(k)
        case 'map':
            return map(k)
        case 'poster':
            return poster(k)
        case 'coins':
            return coins(k)
        case 'flashlight':
            return flashlight(k)
    }
}

async function mural(k: Kit): Promise<Outcome> {
    await k.guard(k.world.enter('nina', 'idle'))
    await k.wait(T.beat)
    await k.guard(k.order('prof', MURAL.order))
    await k.wait(T.short)
    await openFromBanner(k, 'turma', MURAL.banner)
    await k.guard(k.chat('turma'))
    await k.wait(T.short)
    await k.guard(k.post('turma', { from: 'them', text: MURAL.banner }, 'prof'))
    await k.wait(T.beat)
    await k.press(['chat:camera'])
    const camera = await k.guard(k.camera(kid('nina', 'idle', 'sala')))
    await k.wait(T.beat)
    const [ask] = k.talk.offer([MURAL.ask])
    const pick = await k.choose(['cam:shutter', ask])
    if (pick === 'cam:shutter') {
        k.talk.clear()
        act(k, camera, 'nina', 'cover', 'sala')
        await k.guard(k.shoot(camera, kid('nina', 'cover', 'sala')))
        await k.wait(T.short)
        await k.guard(k.say('nina', MURAL.oops))
        act(k, camera, 'nina', 'hurt', 'sala')
        await k.guard(k.world.shake())
        return 'fail'
    }
    await k.guard(k.talk.keep(ask))
    act(k, camera, 'nina', 'pose', 'sala')
    await speak(k, 'nina', MURAL.yes)
    await k.press(['cam:shutter'])
    const photo = await k.guard(k.shoot(camera, kid('nina', 'pose', 'sala')))
    await sendPhoto(k, 'turma', photo, MURAL.thanks, 'prof')
    k.world.mood('wave')
    await k.guard(k.say('nina', MURAL.happy))
    return 'ok'
}

async function diary(k: Kit): Promise<Outcome> {
    await k.guard(k.world.enter('duda', 'open'))
    await k.wait(T.beat)
    await k.guard(k.order('duda', DIARY.order))
    await k.wait(T.short)
    await speak(k, 'duda', DIARY.duda)
    let [refuse] = k.talk.offer([DIARY.refuse])
    let pick = await k.choose(['app:camera', refuse])
    let camera: Camera | null = null
    if (pick === 'app:camera') {
        k.talk.clear()
        const shot: Shot = { kind: 'thing', thing: 'diaryOpen', place: 'patio' }
        camera = await k.guard(k.camera(shot))
        await k.wait(T.beat)
        ;[refuse] = k.talk.offer([DIARY.refuse])
        pick = await k.choose(['cam:shutter', refuse])
        if (pick === 'cam:shutter') {
            k.talk.clear()
            await k.guard(k.shoot(camera, shot))
            await k.wait(T.short)
            await k.guard(k.talk.hide())
            await k.guard(k.world.leave('right'))
            await k.guard(k.world.enter('bia', 'hurt'))
            await k.guard(k.say('bia', DIARY.oops))
            await k.guard(k.world.shake())
            return 'fail'
        }
    }
    await k.guard(k.talk.keep(refuse))
    k.world.mood('closed')
    await speak(k, 'duda', DIARY.agree)
    await k.wait(T.short)
    await k.guard(k.talk.hide())
    if (camera) await k.guard(k.home())
    await k.guard(k.world.leave('right'))
    await k.guard(k.world.enter('bia', 'worried'))
    await k.wait(T.short)
    const book = thingImage(k.scene, 'diaryClosed', 110).setPosition(W * 0.62, 520).setDepth(DEPTH.fly)
    k.audio.whoosh()
    await k.guard(FX.arcTo(k.scene, book, { x: 250, y: 470 }, { height: 120, duration: 700 }))
    book.destroy()
    k.world.mood('hug')
    await k.guard(k.say('bia', DIARY.thanks))
    return 'ok'
}

async function password(k: Kit): Promise<Outcome> {
    await k.guard(k.world.showRemote('caio', 'ask'))
    await k.wait(T.beat)
    await k.guard(k.order('caio', PASSWORD.order))
    await k.wait(T.short)
    await openFromBanner(k, 'caio', PASSWORD.banner)
    const chat = await k.guard(k.chat('caio'))
    await k.wait(T.short)
    await k.guard(k.post('caio', { from: 'them', text: PASSWORD.banner }))
    await k.wait(T.beat)
    chat.setReplies([PASSWORD.give, PASSWORD.keep])
    const pick = await k.choose(['reply:0', 'reply:1'])
    chat.setReplies(null)
    if (pick === 'reply:0') {
        await k.guard(k.post('caio', { from: 'me', text: PASSWORD.give }))
        await k.wait(T.short)
        await k.guard(flyKey(k))
        k.world.remoteMood('key')
        await k.wait(T.short)
        await k.guard(k.post('caio', { from: 'them', text: PASSWORD.leak }))
        await k.wait(T.short)
        await k.guard(scatterKeys(k))
        await k.guard(k.notify('pet', PASSWORD.alert, true))
        return 'fail'
    }
    await k.guard(k.post('caio', { from: 'me', text: PASSWORD.keep }))
    await k.wait(T.reply)
    k.world.remoteMood('thumb')
    await k.guard(k.post('caio', { from: 'them', text: PASSWORD.fine }))
    await k.wait(T.short)
    return 'ok'
}

async function flyKey(k: Kit) {
    const key = thingImage(k.scene, 'key', 90).setPosition(PHONE.cx, PHONE.top + 300).setDepth(DEPTH.fly).setAngle(20)
    k.audio.whoosh()
    await FX.arcTo(k.scene, key, { x: REMOTE.x + 60, y: REMOTE.y + 40 }, { height: 160, duration: 900 })
    await FX.to(k.scene, key, { scale: key.scale * 0.6, alpha: 0 }, { duration: 260 })
    key.destroy()
}

async function scatterKeys(k: Kit) {
    const keys = [0, 1, 2].map(i =>
        thingImage(k.scene, 'key', 64)
            .setPosition(REMOTE.x, REMOTE.y)
            .setDepth(DEPTH.fly)
            .setAngle(-20 + i * 20),
    )
    k.audio.whoosh()
    await FX.all(
        ...keys.map((key, i) =>
            FX.wait(k.scene, i * 180).then(() => FX.arcTo(k.scene, key, { x: -80, y: 160 + i * 170 }, { height: 80, duration: 800 })),
        ),
    )
    keys.forEach(key => key.destroy())
}

async function party(k: Kit): Promise<Outcome> {
    k.world.prop('cake', 688, 420, 168)
    await k.guard(k.world.enter('rafa', 'eat'))
    await k.wait(T.beat)
    await k.guard(k.order('mae', PARTY.order))
    await k.wait(T.short)
    await openFromBanner(k, 'mae', PARTY.banner)
    await k.guard(k.chat('mae'))
    await k.wait(T.short)
    await k.guard(k.post('mae', { from: 'them', text: PARTY.banner }))
    await k.wait(T.beat)
    await k.press(['chat:camera'])
    const camera = await k.guard(k.camera(kid('rafa', 'eat', 'festa')))
    await k.wait(T.beat)
    const [ask] = k.talk.offer([PARTY.ask])
    let pick = await k.choose(['cam:shutter', ask])
    if (pick === 'cam:shutter') {
        k.talk.clear()
        act(k, camera, 'rafa', 'no', 'festa')
        await k.guard(k.shoot(camera, kid('rafa', 'no', 'festa')))
        await k.wait(T.short)
        await k.guard(k.say('rafa', PARTY.oopsFirst))
        act(k, camera, 'rafa', 'hurt', 'festa')
        await k.guard(k.world.shake())
        return 'fail'
    }
    await k.guard(k.talk.keep(ask))
    act(k, camera, 'rafa', 'no', 'festa')
    await speak(k, 'rafa', PARTY.no)
    const [respect] = k.talk.offer([PARTY.respect])
    pick = await k.choose(['cam:shutter', respect])
    if (pick === 'cam:shutter') {
        k.talk.clear()
        await k.guard(k.shoot(camera, kid('rafa', 'no', 'festa')))
        await k.wait(T.short)
        act(k, camera, 'rafa', 'hurt', 'festa')
        await k.guard(k.say('rafa', PARTY.oopsAfter))
        await k.guard(k.world.shake())
        return 'fail'
    }
    await k.guard(k.talk.keep(respect))
    act(k, camera, 'rafa', 'thumb', 'festa')
    await speak(k, 'rafa', PARTY.thanks)
    const cake: Shot = { kind: 'thing', thing: 'cake', place: 'festa' }
    await k.guard(camera.pan(cake))
    await k.wait(T.short)
    await k.press(['cam:shutter'])
    const photo = await k.guard(k.shoot(camera, cake))
    await k.guard(k.talk.hide())
    await sendPhoto(k, 'mae', photo, PARTY.mom)
    return 'ok'
}

async function funny(k: Kit): Promise<Outcome> {
    const silly = k.silly()
    await k.guard(k.world.showRemote('nina', 'cover'))
    await k.wait(T.beat)
    await k.guard(k.order('nina', FUNNY.order))
    await k.wait(T.short)
    await openFromBanner(k, 'nina', FUNNY.banner)
    const gallery = await k.guard(k.gallery(silly))
    await k.wait(T.beat)
    const pick = await k.choose(['gal:erase', 'gal:wall'])
    if (pick === 'gal:wall') {
        k.audio.whoosh()
        await k.guard(k.home(paintWallpaper(k.scene, silly)))
        await k.wait(T.short)
        k.world.remoteMood('hurt')
        await k.wait(T.short)
        await k.guard(k.notify('nina', FUNNY.oops, true))
        return 'fail'
    }
    k.audio.crumple()
    await k.guard(gallery.crumple())
    k.forget(silly)
    await k.wait(T.short)
    const rest = k.photos()
    const nice = rest.find(key => {
        const shot = k.shotOf(key)
        return shot?.kind === 'kid' && shot.who === 'nina' && shot.mood === 'pose'
    })
    await k.guard(gallery.setPhoto(nice ?? rest[rest.length - 1] ?? null))
    await k.wait(T.short)
    k.world.remoteMood('wave')
    await k.wait(T.short)
    await k.guard(k.notify('nina', FUNNY.thanks))
    return 'ok'
}

export function paintSilly(scene: Phaser.Scene): string {
    return paintShot(scene, 'cel-photo-silly', { kind: 'kid', who: 'nina', mood: 'silly', place: 'sala' })
}
