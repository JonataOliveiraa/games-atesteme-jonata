import type { ObjectId } from '../types'

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    ding(): void
    pop(): void
    whoosh(): void
    place(): void
    pour(id: ObjectId): void
    drip(): void
    button(): void
    blend(ms: number): void
    splat(): void
    boing(): void
    nope(): void
    bite(): void
    good(): void
    lose(): void
    win(): void
    setMuted(on: boolean): void
    destroy(): void
}

interface ToneOpts {
    wave?: Wave
    gain?: number
    delay?: number
    to?: number
}

const MASTER = 0.5

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            bus = ctx.createGain()
            bus.gain.value = MASTER
            bus.connect(ctx.destination)
        }
        if (ctx.state === 'suspended') ctx.resume().catch(() => undefined)
        return ctx
    }

    const tone = (freq: number, ms: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const t0 = audio.currentTime + (o.delay ?? 0) / 1000
        const t1 = t0 + ms / 1000
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t1)
        const peak = o.gain ?? 0.14
        gain.gain.setValueAtTime(0.0001, t0)
        gain.gain.linearRampToValueAtTime(peak, t0 + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, t1)
        osc.connect(gain)
        gain.connect(bus)
        osc.start(t0)
        osc.stop(t1 + 0.02)
    }

    const noise = (ms: number, gainValue: number, delay = 0, high = 1800) => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.floor((audio.sampleRate * ms) / 1000)
        const buffer = audio.createBuffer(1, length, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.value = high
        const gain = audio.createGain()
        gain.gain.value = gainValue
        src.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        src.start(audio.currentTime + delay / 1000)
    }

    const notes = (freqs: number[], step: number, o: ToneOpts = {}) =>
        freqs.forEach((f, i) => tone(f, step * 1.5, { ...o, delay: (o.delay ?? 0) + i * step }))

    return {
        ding() {
            tone(988, 120, { gain: 0.12 })
            tone(1319, 220, { gain: 0.1, delay: 110 })
        },
        pop() {
            tone(700, 80, { gain: 0.1, to: 1000 })
        },
        whoosh() {
            tone(300, 240, { gain: 0.07, to: 800 })
        },
        place() {
            tone(520, 80, { wave: 'triangle', gain: 0.14, to: 300 })
            noise(50, 0.12, 0, 900)
        },
        pour(id) {
            if (id === 'cereal') {
                ;[0, 60, 120, 180, 240].forEach(d => noise(40, 0.12, d, 2600))
                return
            }
            if (id === 'ketchup') {
                tone(180, 240, { wave: 'sawtooth', gain: 0.05, to: 90 })
                noise(120, 0.06, 40, 700)
                return
            }
            ;[0, 110, 220].forEach(d => tone(340, 90, { gain: 0.1, delay: d, to: 620 }))
        },
        drip() {
            noise(50, 0.1, 0, 1100)
            tone(300, 70, { gain: 0.05, to: 150 })
        },
        button() {
            tone(900, 50, { wave: 'square', gain: 0.07 })
        },
        blend(ms) {
            tone(120, ms, { wave: 'sawtooth', gain: 0.07, to: 150 })
            tone(240, ms, { wave: 'square', gain: 0.025, to: 300 })
        },
        splat() {
            noise(180, 0.3, 0, 500)
            tone(220, 200, { gain: 0.14, to: 90 })
        },
        boing() {
            tone(180, 300, { wave: 'triangle', gain: 0.16, to: 620 })
        },
        nope() {
            tone(240, 140, { wave: 'triangle', gain: 0.1, to: 180 })
        },
        bite() {
            noise(70, 0.28, 0, 1200)
            noise(60, 0.22, 140, 1500)
        },
        good() {
            notes([523, 659, 784, 1047], 110, { wave: 'triangle', gain: 0.12 })
        },
        lose() {
            notes([392, 330, 262], 170, { wave: 'triangle', gain: 0.1 })
        },
        win() {
            notes([523, 659, 784, 1047, 1319], 120, { wave: 'triangle', gain: 0.12 })
        },
        setMuted(on) {
            muted = on
        },
        destroy() {
            ctx?.close().catch(() => undefined)
            ctx = undefined
            bus = undefined
        },
    }
}
