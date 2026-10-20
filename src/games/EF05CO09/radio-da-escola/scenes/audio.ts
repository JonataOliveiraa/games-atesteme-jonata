import { freq } from '../data/song'
import type { Lane } from '../types'

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    kick(): void
    hat(): void
    drum(lane: Lane): void
    bass(midi: number): void
    melody(midi: number): void
    jingle(): void
    scratch(): void
    tick(): void
    pop(): void
    whoosh(): void
    clack(): void
    ding(): void
    heart(): void
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
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (hz: number, ms: number, o: ToneOpts = {}) => {
        const audio = get()
        if (!audio || !bus) return
        const t0 = audio.currentTime + (o.delay ?? 0) / 1000
        const t1 = t0 + ms / 1000
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(hz, t0)
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

    const noise = (ms: number, gainValue: number, delay = 0, high = 1800, type: BiquadFilterType = 'highpass') => {
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
        kick() {
            tone(130, 140, { wave: 'sine', gain: 0.22, to: 48 })
        },
        hat() {
            noise(40, 0.05, 0, 6500)
        },
        drum(lane) {
            if (lane === 0) {
                tone(150, 220, { wave: 'sine', gain: 0.32, to: 42 })
                tone(70, 160, { wave: 'triangle', gain: 0.12 })
            }
            if (lane === 1) {
                noise(170, 0.24, 0, 1800, 'bandpass')
                tone(220, 110, { wave: 'triangle', gain: 0.12, to: 160 })
            }
            if (lane === 2) {
                noise(45, 0.22, 0, 1300, 'bandpass')
                noise(70, 0.2, 22, 1300, 'bandpass')
            }
            if (lane === 3) noise(900, 0.11, 0, 7000)
        },
        bass(midi) {
            tone(freq(midi), 260, { wave: 'triangle', gain: 0.1 })
        },
        melody(midi) {
            tone(freq(midi), 300, { wave: 'triangle', gain: 0.16 })
            tone(freq(midi + 12), 180, { wave: 'sine', gain: 0.05 })
        },
        jingle() {
            notes([784, 988, 1175, 1568], 120, { wave: 'triangle', gain: 0.11 })
        },
        scratch() {
            noise(90, 0.22, 0, 900, 'bandpass')
            tone(620, 220, { wave: 'sawtooth', gain: 0.05, to: 90 })
            noise(70, 0.18, 120, 1400, 'bandpass')
            tone(420, 260, { wave: 'square', gain: 0.03, delay: 120, to: 60 })
        },
        tick() {
            tone(900, 40, { wave: 'sine', gain: 0.04 })
        },
        pop() {
            tone(700, 80, { wave: 'sine', gain: 0.1, to: 1000 })
        },
        whoosh() {
            tone(300, 300, { wave: 'sine', gain: 0.08, to: 900 })
        },
        clack() {
            noise(50, 0.16, 0, 1200)
            tone(240, 90, { wave: 'triangle', gain: 0.08, to: 160 })
        },
        ding() {
            tone(988, 120, { wave: 'sine', gain: 0.12 })
            tone(1319, 220, { wave: 'sine', gain: 0.1, delay: 110 })
        },
        heart() {
            tone(1318, 70, { wave: 'sine', gain: 0.035 })
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
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
