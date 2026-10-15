type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    blip(): void
    tic(): void
    step(i: number): void
    hop(): void
    knock(): void
    nhec(): void
    beep(): void
    creak(): void
    shut(): void
    whoosh(): void
    bump(): void
    door(): void
    keys(): void
    flash(): void
    voice(): void
    melody(): void
    wind(): void
    bloom(): void
    land(): void
    plim(): void
    print(): void
    fizz(): void
    cheer(): void
    blom(): void
    fail(): void
    lose(): void
    pop(i: number): void
    win(): void
    /** o motor do carro em loop: `sound` escolhe a gravação (cada carro tem a sua); null desliga */
    engineOn(sound: number | null): void
    /** 0 parado … 1 velocidade máxima: o motor sobe o tom e o volume */
    engineSpeed(speed: number): void
    setMuted(on: boolean): void
    destroy(): void
}

interface ToneOpts {
    wave?: Wave
    gain?: number
    delay?: number
    to?: number
    attack?: number
}

const ENGINE_FILES = Object.fromEntries(
    Object.entries(
        import.meta.glob('../../../../assets/games/EF04CO01/manobrista-da-matriz/car*.mp3', { eager: true, import: 'default' }) as Record<string, string>,
    ).map(([path, url]) => [path.split('/').pop()?.replace(/\.mp3$/i, '') ?? '', url]),
)

/** cada carro usa uma gravação; o nível iguala o volume das três (o car1 é bem mais alto) */
const ENGINE_SOUNDS = [
    { key: 'car1', level: 0.32 },
    { key: 'car2', level: 0.5 },
    { key: 'car3', level: 0.5 },
]
export const ENGINE_VOICES = ENGINE_SOUNDS.length

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false
    let buffers: Array<AudioBuffer | undefined> = []
    let loading: Promise<void> | undefined
    let voice: { src: AudioBufferSourceNode; gain: GainNode; level: number } | undefined
    let wanted: number | null = null
    let speed = 0

    const applyVoice = (audio: AudioContext, smooth = 0.08) => {
        if (!voice) return
        voice.gain.gain.setTargetAtTime(voice.level * (0.5 + 0.5 * speed), audio.currentTime, smooth)
        voice.src.playbackRate.setTargetAtTime(0.85 + 0.35 * speed, audio.currentTime, smooth)
    }

    const startVoice = (audio: AudioContext, sound: number) => {
        const spec = ENGINE_SOUNDS[sound % ENGINE_SOUNDS.length]
        const buffer = buffers[sound % ENGINE_SOUNDS.length]
        if (!buffer || !bus) return
        const src = audio.createBufferSource()
        src.buffer = buffer
        src.loop = true
        const gain = audio.createGain()
        gain.gain.value = 0
        src.connect(gain).connect(bus)
        src.start(audio.currentTime, Math.random() * buffer.duration)
        voice = { src, gain, level: spec.level }
        applyVoice(audio, 0.15)
    }

    const stopVoice = (audio: AudioContext) => {
        if (!voice) return
        const { src, gain } = voice
        voice = undefined
        gain.gain.setTargetAtTime(0, audio.currentTime, 0.12)
        src.stop(audio.currentTime + 0.6)
    }

    const loadEngine = async (audio: AudioContext) => {
        buffers = await Promise.all(
            ENGINE_SOUNDS.map(async ({ key }) => {
                const url = ENGINE_FILES[key]
                if (!url) return undefined
                const res = await fetch(url)
                return audio.decodeAudioData(await res.arrayBuffer())
            }),
        )
    }

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            const master = ctx.createGain()
            master.gain.value = 0.85
            master.connect(ctx.destination)
            bus = master
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (freq: number, dur: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, at)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(bus)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0, q = 1.4, type: Filter = 'bandpass', to?: number) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + delay
        const frames = Math.max(1, Math.floor(audio.sampleRate * dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        const src = audio.createBufferSource()
        src.buffer = buffer
        const band = audio.createBiquadFilter()
        band.type = type
        band.frequency.setValueAtTime(freq, at)
        if (to) band.frequency.exponentialRampToValueAtTime(to, at + dur)
        band.Q.value = q
        const vol = audio.createGain()
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.008)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(bus)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    return {
        blip() {
            ;[0, 0.1].forEach((d, i) => tone(i ? 1175 : 880, 0.08, { wave: 'square', gain: 0.035, delay: d }))
        },
        tic() {
            tone(1400, 0.05, { wave: 'triangle', gain: 0.06 })
        },
        step(i) {
            tone(i % 2 ? 520 : 440, 0.05, { wave: 'triangle', gain: 0.035 })
        },
        nhec() {
            noise(0.18, 3200, 0.06, 0, 3, 'bandpass', 2200)
            tone(1200, 0.12, { wave: 'triangle', gain: 0.04, to: 900 })
        },
        beep() {
            tone(740, 0.09, { wave: 'square', gain: 0.03 })
            tone(740, 0.09, { wave: 'square', gain: 0.03, delay: 0.14 })
        },
        knock() {
            ;[0, 0.16, 0.32].forEach(d => {
                noise(0.06, 260, 0.2, d, 1, 'lowpass')
                tone(150, 0.08, { wave: 'sine', gain: 0.12, delay: d, to: 110 })
            })
        },
        creak() {
            tone(220, 0.35, { wave: 'triangle', gain: 0.04, to: 330 })
        },
        shut() {
            noise(0.07, 300, 0.16, 0, 1, 'lowpass')
            tone(120, 0.14, { wave: 'sine', gain: 0.1, to: 80 })
        },
        whoosh() {
            noise(0.45, 700, 0.08, 0, 0.9, 'bandpass', 2600)
        },
        hop() {
            tone(330, 0.16, { wave: 'sine', gain: 0.08, to: 880 })
        },
        bump() {
            noise(0.08, 400, 0.14, 0, 1.2, 'lowpass')
            tone(160, 0.25, { wave: 'sine', gain: 0.1, to: 90 })
        },
        door() {
            tone(660, 0.08, { wave: 'triangle', gain: 0.06 })
            tone(990, 0.12, { wave: 'triangle', gain: 0.05, delay: 0.06 })
        },
        keys() {
            ;[0, 0.09, 0.18, 0.27].forEach(d => noise(0.04, 2600, 0.08, d, 4))
        },
        flash() {
            noise(0.05, 4000, 0.08, 0, 2)
            tone(1800, 0.25, { wave: 'sine', gain: 0.04, to: 600, delay: 0.03 })
        },
        voice() {
            ;[0, 0.12, 0.24].forEach((d, i) => tone(392 + i * 98, 0.12, { wave: 'sine', gain: 0.06, delay: d }))
        },
        plim() {
            tone(1319, 0.2, { wave: 'triangle', gain: 0.08 })
            tone(1760, 0.25, { wave: 'triangle', gain: 0.05, delay: 0.08 })
        },
        print() {
            ;[0, 0.14, 0.28, 0.42].forEach(d => noise(0.08, 900, 0.07, d, 2))
        },
        fizz() {
            noise(0.6, 3000, 0.05, 0, 0.6, 'highpass')
        },
        cheer() {
            ;[659, 784, 1047].forEach((f, i) => tone(f, 0.16, { wave: 'triangle', gain: 0.07, delay: i * 0.09 }))
        },
        wind() {
            noise(0.9, 500, 0.09, 0, 0.8, 'bandpass', 1800)
        },
        bloom() {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, { wave: 'sine', gain: 0.07, delay: i * 0.07 }))
        },
        land() {
            tone(880, 0.12, { wave: 'triangle', gain: 0.06 })
            tone(1175, 0.16, { wave: 'triangle', gain: 0.05, delay: 0.06 })
        },
        melody() {
            ;[523, 659, 784, 659, 1047].forEach((f, i) => tone(f, 0.18, { wave: 'triangle', gain: 0.08, delay: i * 0.16 }))
        },
        blom() {
            tone(130, 0.3, { wave: 'sine', gain: 0.12, to: 90 })
        },
        fail() {
            tone(392, 0.2, { wave: 'triangle', gain: 0.08, to: 330 })
            tone(294, 0.35, { wave: 'triangle', gain: 0.07, delay: 0.2, to: 262 })
        },
        lose() {
            tone(349, 0.26, { wave: 'triangle', gain: 0.07, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.06, delay: 0.22, to: 233 })
        },
        pop(i) {
            tone(660 + (i % 6) * 90, 0.1, { wave: 'triangle', gain: 0.06 })
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            tone(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        engineOn(sound) {
            wanted = sound
            const audio = get()
            if (!audio) return
            stopVoice(audio)
            if (sound === null) return
            loading ??= loadEngine(audio)
            void loading.then(() => {
                if (wanted === sound && !voice && ctx) startVoice(ctx, sound)
            })
        },
        engineSpeed(s) {
            speed = clamp01(s)
            if (ctx) applyVoice(ctx)
        },
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            if (ctx) stopVoice(ctx)
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
