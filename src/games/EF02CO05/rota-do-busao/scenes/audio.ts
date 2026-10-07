import type { Glyph } from '../types'

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    drive(seconds: number): void
    brake(): void
    plim(): void
    hop(): void
    step(i: number): void
    act(glyph: Glyph): void
    bell(): void
    door(): void
    honk(): void
    fail(): void
    lose(): void
    pop(i: number): void
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
    detune?: number
}

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

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
        if (o.detune) osc.detune.setValueAtTime(o.detune, at)
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

    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.5, detune: 8 })
    }

    const ACT: Record<Glyph, () => void> = {
        clock: () => [0, 0.18, 0.36].forEach(d => noise(0.04, 3200, 0.07, d, 6)),
        flake: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.3, { wave: 'sine', gain: 0.04, delay: i * 0.07 })),
        note: () => [523, 659, 784, 659].forEach((f, i) => fat(f, 0.18, { wave: 'triangle', gain: 0.07, delay: i * 0.12 })),
        ring: () => [0, 0.16].forEach(d => tone(1320, 0.12, { wave: 'square', gain: 0.025, delay: d, detune: 30 })),
        star: () => [784, 1047, 1319].forEach((f, i) => tone(f, 0.16, { wave: 'triangle', gain: 0.06, delay: i * 0.06 })),
        heat: () => tone(180, 0.6, { wave: 'sawtooth', gain: 0.03, to: 220 }),
        light: () => {
            noise(0.12, 4000, 0.06, 0, 0.7, 'highpass')
            tone(1760, 0.2, { wave: 'sine', gain: 0.05 })
        },
        drop: () => [0, 0.12, 0.24].forEach((d, i) => tone(900 + i * 120, 0.08, { wave: 'sine', gain: 0.06, delay: d, to: 400 })),
    }

    const honk = (delay = 0) => {
        fat(392, 0.16, { wave: 'square', gain: 0.035, delay })
        fat(330, 0.22, { wave: 'square', gain: 0.035, delay: delay + 0.18 })
    }

    return {
        drive(seconds) {
            const steps = Math.floor(seconds / 0.16)
            for (let i = 0; i < steps; i++) noise(0.1, 220, 0.05, i * 0.16, 1, 'lowpass')
            tone(70, seconds, { wave: 'sawtooth', gain: 0.025, to: 90 })
        },
        brake() {
            noise(0.35, 2200, 0.04, 0, 2, 'bandpass', 1400)
        },
        plim() {
            tone(1047, 0.16, { wave: 'triangle', gain: 0.07 })
            tone(1568, 0.22, { wave: 'triangle', gain: 0.05, delay: 0.08 })
        },
        hop() {
            tone(260, 0.2, { wave: 'triangle', gain: 0.08, to: 520 })
        },
        step(i) {
            tone(i % 2 ? 330 : 392, 0.07, { wave: 'triangle', gain: 0.05, to: i % 2 ? 260 : 300 })
        },
        act(glyph) {
            ACT[glyph]()
        },
        bell() {
            ;[1760, 1760].forEach((f, i) => fat(f, 0.5, { wave: 'sine', gain: 0.07, delay: i * 0.16 }))
            tone(2637, 0.4, { wave: 'sine', gain: 0.03, delay: 0.05 })
        },
        door() {
            noise(0.3, 1800, 0.06, 0, 0.9, 'highpass', 600)
        },
        honk() {
            honk()
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
            tone(660 + i * 90, 0.12, { wave: 'triangle', gain: 0.07 })
        },
        win() {
            honk()
            ;[523, 659, 784, 1047].forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: 0.45 + i * 0.11 }))
            fat(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.95 })
        },
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : 0.85
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
