type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    crunch(): void
    swish(): void
    crumb(): void
    pick(): void
    bonk(): void
    snap(): void
    whole(): void
    gust(): void
    blow(): void
    order(): void
    press(): void
    whoosh(): void
    step(): void
    lose(): void
    win(): void
    scrub(): void
    wake(): void
    heavy(): void
    yuck(): void
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

    const noise = (ms: number, gainValue: number, delay = 0, freq = 1800, type: BiquadFilterType = 'highpass', sweep?: number) => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.floor((audio.sampleRate * ms) / 1000)
        const buffer = audio.createBuffer(1, length, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < length; i++) {
            const env = Math.min(1, i / 400, (length - i) / 1200)
            data[i] = (Math.random() * 2 - 1) * env
        }
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = type
        const t0 = audio.currentTime + delay / 1000
        filter.frequency.setValueAtTime(freq, t0)
        if (sweep) filter.frequency.exponentialRampToValueAtTime(sweep, t0 + ms / 1000)
        const gain = audio.createGain()
        gain.gain.value = gainValue
        src.connect(filter)
        filter.connect(gain)
        gain.connect(bus)
        src.start(t0)
    }

    const notes = (freqs: number[], step: number, o: ToneOpts = {}) =>
        freqs.forEach((f, i) => tone(f, step * 1.5, { ...o, delay: (o.delay ?? 0) + i * step }))

    return {
        crunch() {
            noise(90, 0.26, 0, 2600)
            noise(70, 0.2, 60, 3400)
            tone(900, 60, { wave: 'triangle', gain: 0.06, to: 500 })
        },
        swish() {
            noise(160, 0.05, 0, 1200, 'bandpass', 3000)
        },
        crumb() {
            tone(520, 120, { wave: 'sine', gain: 0.08, to: 700 })
            tone(700, 100, { wave: 'sine', gain: 0.06, delay: 90, to: 480 })
        },
        pick() {
            tone(480, 90, { wave: 'sine', gain: 0.11, to: 820 })
        },
        bonk() {
            tone(240, 160, { wave: 'triangle', gain: 0.13, to: 150 })
            tone(320, 220, { wave: 'sine', gain: 0.06, delay: 160, to: 260 })
        },
        snap() {
            noise(30, 0.16, 0, 3000)
            tone(988, 90, { wave: 'triangle', gain: 0.1 })
            tone(1319, 140, { wave: 'triangle', gain: 0.08, delay: 70 })
        },
        whole() {
            notes([523, 659, 784, 1047], 110, { wave: 'triangle', gain: 0.12 })
        },
        gust() {
            noise(700, 0.06, 0, 400, 'bandpass', 1400)
        },
        blow() {
            noise(900, 0.1, 0, 500, 'bandpass', 2600)
            tone(500, 600, { wave: 'sine', gain: 0.06, to: 1200 })
        },
        order() {
            tone(660, 110, { wave: 'sine', gain: 0.1, to: 880 })
            tone(880, 140, { wave: 'sine', gain: 0.08, delay: 110 })
        },
        press() {
            notes([392, 523], 80, { wave: 'triangle', gain: 0.1 })
        },
        whoosh() {
            tone(300, 260, { wave: 'sine', gain: 0.07, to: 900 })
        },
        step() {
            tone(180 + Math.random() * 40, 40, { wave: 'sine', gain: 0.025, to: 120 })
        },
        lose() {
            notes([392, 330, 262], 170, { wave: 'triangle', gain: 0.1 })
        },
        win() {
            notes([523, 659, 784, 1047, 1319], 120, { wave: 'triangle', gain: 0.12 })
        },
        scrub() {
            noise(70, 0.07, 0, 2200, 'bandpass', 3600)
        },
        wake() {
            tone(440, 140, { wave: 'sine', gain: 0.08, to: 330 })
            notes([523, 784], 90, { wave: 'triangle', gain: 0.09, delay: 160 })
        },
        heavy() {
            tone(150, 260, { wave: 'triangle', gain: 0.14, to: 110 })
            tone(200, 200, { wave: 'sine', gain: 0.06, delay: 220, to: 160 })
        },
        yuck() {
            tone(300, 220, { wave: 'sawtooth', gain: 0.05, to: 200 })
            tone(240, 320, { wave: 'sawtooth', gain: 0.05, delay: 200, to: 150 })
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
