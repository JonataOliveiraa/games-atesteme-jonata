import type { ThingId, Tool } from '../types'

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    /** o som da coisa; `level` de 0 a 1 (mais forte com o visor perto) */
    thing(id: ThingId, level?: number): void
    shutter(): void
    /** sacar a câmera, sacar o microfone ou guardar */
    hold(tool: Tool | null): void
    rec(): void
    tic(): void
    pop(i: number): void
    whoosh(): void
    blom(): void
    lose(): void
    clap(): void
    win(): void
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

/** quanto de cada gravação toca por vez (o resto some num fade) */
const SAMPLE_MAX: Partial<Record<ThingId, number>> = {}
/** volume de cada gravação (1 = como veio) */
const SAMPLE_GAIN: Partial<Record<ThingId, number>> = { bird: 0.32 }
const SAMPLE_FADE = 0.25

/** `samples`: gravações de verdade por coisa (o nome do arquivo é o id); quem não tem usa o som sintetizado */
export function createAudio(samples: Partial<Record<ThingId, string>> = {}): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false
    let alive = true
    const raw: Partial<Record<ThingId, ArrayBuffer>> = {}
    const buffers: Partial<Record<ThingId, AudioBuffer>> = {}
    const decoding = new Set<ThingId>()

    const decode = () => {
        if (!ctx) return
        const audio = ctx
        ;(Object.keys(raw) as ThingId[]).forEach(id => {
            const data = raw[id]
            if (!data || buffers[id] || decoding.has(id)) return
            decoding.add(id)
            audio
                .decodeAudioData(data.slice(0))
                .then(buffer => {
                    if (alive) buffers[id] = buffer
                })
                .catch(() => undefined)
        })
    }

    ;(Object.entries(samples) as [ThingId, string][]).forEach(([id, url]) => {
        fetch(url)
            .then(r => r.arrayBuffer())
            .then(data => {
                if (!alive) return
                raw[id] = data
                decode()
            })
            .catch(() => undefined)
    })

    const playSample = (id: ThingId, level: number) => {
        const audio = get()
        const buffer = buffers[id]
        if (!audio || !bus || !buffer) return false
        const at = audio.currentTime
        const dur = Math.min(buffer.duration, SAMPLE_MAX[id] ?? buffer.duration)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const vol = audio.createGain()
        const peak = Math.max(0.0002, 0.9 * level * (SAMPLE_GAIN[id] ?? 1))
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(peak, at + 0.03)
        vol.gain.setValueAtTime(peak, Math.max(at + 0.03, at + dur - SAMPLE_FADE))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(vol).connect(bus)
        src.start(at, 0, dur + 0.02)
        return true
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
            decode()
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
        vol.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain ?? 0.1), at + (o.attack ?? 0.012))
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
        vol.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.02)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(bus)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    const sounds: Partial<Record<ThingId, (v: number) => void>> = {
        bird: v => {
            ;[0, 0.22, 0.5, 0.72, 1.05].forEach((d, i) =>
                tone(i % 2 ? 2900 : 2300, 0.13, { wave: 'sine', gain: 0.09 * v, delay: d, to: i % 2 ? 2200 : 3300 }),
            )
        },
        icecream: v => {
            ;[0, 0.36].forEach(d => {
                tone(523, 0.26, { wave: 'square', gain: 0.045 * v, delay: d })
                tone(659, 0.26, { wave: 'square', gain: 0.03 * v, delay: d })
            })
        },
        music: v => {
            ;[523, 659, 784, 659, 880, 784].forEach((f, i) => tone(f, 0.24, { wave: 'triangle', gain: 0.08 * v, delay: i * 0.3 }))
        },
        dolphin: v => {
            tone(1500, 0.18, { wave: 'sine', gain: 0.06 * v, to: 2400 })
            noise(0.45, 900, 0.16 * v, 1.15, 0.9, 'lowpass', 220)
        },
        wave: v => {
            noise(1.1, 700, 0.2 * v, 0, 0.8, 'lowpass', 260)
            noise(0.6, 2400, 0.05 * v, 0.1, 0.8, 'bandpass', 900)
        },
        frog: v => croak(v),
        pondFrog: v => croak(v * 0.8, 0.85),
        rooster: v => {
            tone(520, 0.16, { wave: 'sawtooth', gain: 0.035 * v, to: 700 })
            tone(700, 0.16, { wave: 'sawtooth', gain: 0.035 * v, delay: 0.17, to: 760 })
            tone(760, 0.55, { wave: 'sawtooth', gain: 0.04 * v, delay: 0.34, to: 520 })
        },
        cow: v => {
            tone(150, 1.1, { wave: 'sawtooth', gain: 0.05 * v, to: 118, attack: 0.15 })
            tone(300, 1.1, { wave: 'triangle', gain: 0.02 * v, to: 236, attack: 0.15 })
        },
        dog: v => {
            ;[0, 0.32, 0.9, 1.2].forEach(d => {
                noise(0.09, 700, 0.12 * v, d, 1.5)
                tone(380, 0.11, { wave: 'square', gain: 0.03 * v, delay: d, to: 260 })
            })
        },
        bees: v => {
            for (let i = 0; i < 6; i++) tone(210 + (i % 2) * 14, 0.34, { wave: 'sawtooth', gain: 0.018 * v, delay: i * 0.3, attack: 0.08 })
        },
        duck: v => {
            ;[0, 0.28, 0.85].forEach(d => tone(420, 0.16, { wave: 'square', gain: 0.03 * v, delay: d, to: 330 }))
        },
        tractor: v => {
            noise(2.0, 180, 0.12 * v, 0, 0.7, 'lowpass')
            for (let i = 0; i < 14; i++) tone(68, 0.1, { wave: 'square', gain: 0.03 * v, delay: i * 0.14 })
        },
        owl: v => {
            tone(410, 0.32, { wave: 'sine', gain: 0.09 * v, to: 380, attack: 0.06 })
            tone(380, 0.5, { wave: 'sine', gain: 0.09 * v, delay: 0.5, to: 350, attack: 0.06 })
        },
        cricket: v => {
            for (let k = 0; k < 3; k++) for (let i = 0; i < 5; i++) tone(4300, 0.025, { wave: 'sine', gain: 0.03 * v, delay: k * 0.6 + i * 0.04 })
        },
        campfire: v => {
            for (let i = 0; i < 9; i++) noise(0.03, 1800 + Math.random() * 2000, 0.09 * v, Math.random() * 1.4, 2)
            noise(1.4, 400, 0.03 * v, 0, 0.6, 'lowpass')
        },
    }

    function croak(v: number, pitch = 1) {
        ;[0, 0.45, 1.0].forEach(d => {
            tone(140 * pitch, 0.16, { wave: 'square', gain: 0.04 * v, delay: d, to: 110 * pitch })
            tone(280 * pitch, 0.12, { wave: 'triangle', gain: 0.02 * v, delay: d + 0.02, to: 210 * pitch })
        })
    }

    return {
        thing(id, level = 1) {
            const v = Math.max(0.05, Math.min(1, level))
            if (!playSample(id, v)) sounds[id]?.(v)
        },
        shutter() {
            noise(0.04, 3600, 0.12, 0, 2)
            noise(0.05, 2400, 0.1, 0.07, 2)
            tone(1800, 0.2, { wave: 'sine', gain: 0.03, to: 700, delay: 0.04 })
        },
        hold(tool) {
            if (tool === 'photo') {
                noise(0.12, 2600, 0.04, 0, 1, 'bandpass', 5200)
                tone(420, 0.32, { wave: 'triangle', gain: 0.035, to: 760, delay: 0.05 })
                noise(0.03, 3800, 0.06, 0.36, 2)
            } else if (tool === 'sound') {
                tone(660, 0.08, { wave: 'sine', gain: 0.05 })
                tone(990, 0.16, { wave: 'sine', gain: 0.04, delay: 0.07 })
                noise(0.2, 300, 0.03, 0.05, 0.8, 'lowpass')
            } else noise(0.18, 2200, 0.035, 0, 0.8, 'bandpass', 900)
        },
        rec() {
            tone(880, 0.09, { wave: 'sine', gain: 0.05 })
            tone(1320, 0.12, { wave: 'sine', gain: 0.05, delay: 0.09 })
        },
        tic() {
            tone(1400, 0.05, { wave: 'triangle', gain: 0.05 })
        },
        pop(i) {
            tone(660 + (i % 6) * 90, 0.1, { wave: 'triangle', gain: 0.06 })
        },
        whoosh() {
            noise(0.3, 1200, 0.05, 0, 0.7, 'bandpass', 3000)
        },
        blom() {
            tone(130, 0.3, { wave: 'sine', gain: 0.12, to: 90 })
        },
        lose() {
            tone(349, 0.26, { wave: 'triangle', gain: 0.07, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.06, delay: 0.22, to: 233 })
        },
        clap() {
            for (let i = 0; i < 9; i++) noise(0.05, 1800 + Math.random() * 900, 0.07, i * 0.09 + Math.random() * 0.03, 1.2)
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            tone(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            alive = false
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
