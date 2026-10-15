import type { Branch } from '../types'

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    branch(b: Branch): void
    zzzt(): void
    pop(): void
    vroom(): void
    brake(): void
    splash(): void
    skid(): void
    thump(): void
    sizzle(): void
    cheer(): void
    rain(on: boolean): void
    whoosh(): void
    good(): void
    lose(): void
    win(): void
    press(): void
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
    let rainTimer: number | undefined

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
        if (ctx.state === 'suspended') void ctx.resume()
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
        gain.gain.linearRampToValueAtTime(peak, t0 + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, t1)
        osc.connect(gain)
        gain.connect(bus)
        osc.start(t0)
        osc.stop(t1 + 0.02)
    }

    const noise = (ms: number, gainValue: number, delay = 0, freq = 1800, type: BiquadFilterType = 'highpass') => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.max(1, Math.floor((audio.sampleRate * ms) / 1000))
        const buffer = audio.createBuffer(1, length, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = type
        filter.frequency.value = freq
        const gain = audio.createGain()
        gain.gain.value = gainValue
        src.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        src.start(audio.currentTime + delay / 1000)
    }

    const notes = (freqs: number[], step: number, o: ToneOpts = {}) =>
        freqs.forEach((f, i) => tone(f, step * 1.5, { ...o, delay: (o.delay ?? 0) + i * step }))

    const stopRain = () => {
        if (rainTimer !== undefined) window.clearInterval(rainTimer)
        rainTimer = undefined
    }

    return {
        branch(b) {
            if (b === 'then') notes([659, 988], 120, { wave: 'triangle', gain: 0.13 })
            else notes([784, 523], 120, { wave: 'triangle', gain: 0.13 })
        },
        zzzt() {
            tone(170, 220, { wave: 'square', gain: 0.05, to: 260 })
            noise(200, 0.06, 0, 2600)
        },
        pop() {
            tone(620, 90, { wave: 'sine', gain: 0.1, to: 980 })
        },
        vroom() {
            tone(70, 900, { wave: 'sawtooth', gain: 0.06, to: 230 })
            tone(105, 900, { wave: 'square', gain: 0.025, to: 330 })
        },
        brake() {
            tone(980, 380, { wave: 'sine', gain: 0.05, to: 640 })
        },
        splash() {
            noise(220, 0.18, 0, 700)
        },
        skid() {
            tone(1250, 700, { wave: 'triangle', gain: 0.06, to: 620 })
            tone(1180, 700, { wave: 'sine', gain: 0.04, delay: 90, to: 560 })
        },
        thump() {
            tone(140, 220, { wave: 'sine', gain: 0.22, to: 60 })
            noise(120, 0.14, 0, 300, 'lowpass')
        },
        sizzle() {
            noise(900, 0.08, 0, 3000)
            tone(300, 900, { wave: 'sine', gain: 0.05, to: 110 })
        },
        cheer() {
            noise(900, 0.12, 0, 1100, 'bandpass')
            noise(700, 0.08, 220, 1500, 'bandpass')
        },
        rain(on) {
            stopRain()
            if (!on) return
            noise(1200, 0.05, 0, 4000)
            rainTimer = window.setInterval(() => noise(1100, 0.035, 0, 4200), 1000)
        },
        whoosh() {
            tone(300, 300, { wave: 'sine', gain: 0.07, to: 900 })
        },
        good() {
            notes([523, 659, 784], 90, { wave: 'triangle', gain: 0.1 })
        },
        lose() {
            notes([392, 330, 262], 170, { wave: 'triangle', gain: 0.1 })
        },
        win() {
            notes([523, 659, 784, 1047, 1319], 120, { wave: 'triangle', gain: 0.12 })
        },
        press() {
            tone(440, 70, { wave: 'triangle', gain: 0.1, to: 330 })
        },
        setMuted(on) {
            muted = on
            if (on) stopRain()
        },
        destroy() {
            stopRain()
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
