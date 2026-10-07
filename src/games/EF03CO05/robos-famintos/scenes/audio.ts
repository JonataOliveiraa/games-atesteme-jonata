import type { Format } from '../types'

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    stretch(k: number): void
    launch(): void
    pop(): void
    nhac(): void
    play(format: Format, samples?: number[]): void
    yuck(): void
    thud(): void
    knock(): void
    win(): void
    lose(): void
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

    const MELODY = [523, 659, 784, 1047]
    const SCALE = [392, 440, 523, 587, 659, 784, 880, 1047]
    let lastStretch = 0

    return {
        stretch(k) {
            const now = performance.now()
            if (now - lastStretch < 70) return
            lastStretch = now
            tone(180 + k * 260, 0.06, { wave: 'triangle', gain: 0.025 })
        },
        launch() {
            tone(220, 0.22, { wave: 'triangle', gain: 0.08, to: 520 })
            noise(0.3, 1200, 0.05, 0.02, 0.8, 'bandpass', 3200)
        },
        pop() {
            tone(500, 0.1, { wave: 'sine', gain: 0.06, to: 900 })
        },
        nhac() {
            noise(0.07, 900, 0.12, 0, 1.2)
            tone(260, 0.1, { wave: 'square', gain: 0.04, to: 160, attack: 0.003 })
            noise(0.06, 1100, 0.08, 0.12, 1.2)
        },
        play(format, samples = []) {
            if (format === 'music') {
                samples.slice(0, 8).forEach((s, i) => fat(SCALE[Math.min(SCALE.length - 1, Math.floor(s * SCALE.length))], 0.16, { wave: 'triangle', gain: 0.07, delay: 0.1 + i * 0.12 }))
                return
            }
            if (format === 'photo') {
                noise(0.05, 4000, 0.1, 0.08, 2)
                tone(1400, 0.08, { wave: 'square', gain: 0.03, delay: 0.1 })
                tone(1800, 0.25, { wave: 'sine', gain: 0.04, delay: 0.16, to: 2400 })
                return
            }
            if (format === 'text') {
                for (let i = 0; i < 5; i++) noise(0.03, 3000, 0.08, 0.08 + i * 0.09, 3)
                return
            }
            for (let i = 0; i < 6; i++) noise(0.04, 1500, 0.05, 0.05 + i * 0.07, 2)
            fat(659, 0.3, { wave: 'triangle', gain: 0.05, delay: 0.45 })
        },
        yuck() {
            tone(300, 0.35, { wave: 'triangle', gain: 0.06, to: 140 })
            tone(310, 0.35, { wave: 'triangle', gain: 0.04, to: 150, detune: 30 })
            noise(0.16, 700, 0.07, 0.4, 1)
        },
        thud() {
            tone(140, 0.18, { wave: 'sine', gain: 0.1, to: 70, attack: 0.004 })
            noise(0.1, 600, 0.06, 0, 1)
        },
        knock() {
            for (let i = 0; i < 3; i++) {
                tone(200 - i * 30, 0.12, { wave: 'square', gain: 0.04, delay: i * 0.1, to: 90 })
                noise(0.06, 900, 0.07, i * 0.1, 1.2)
            }
        },
        win() {
            MELODY.forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            fat(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        lose() {
            tone(349, 0.26, { wave: 'triangle', gain: 0.07, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.06, delay: 0.22, to: 233 })
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
