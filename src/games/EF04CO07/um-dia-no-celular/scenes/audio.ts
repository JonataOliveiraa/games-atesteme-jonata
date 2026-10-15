type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    tap(): void
    plim(): void
    alert(): void
    shutter(): void
    send(): void
    receive(): void
    whoosh(): void
    crumple(): void
    power(): void
    good(): void
    lose(): void
    win(): void
    pop(): void
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
        tap() {
            tone(880, 50, { wave: 'triangle', gain: 0.08 })
        },
        plim() {
            tone(1046, 140, { wave: 'sine', gain: 0.12 })
            tone(1568, 220, { wave: 'sine', gain: 0.1, delay: 110 })
        },
        alert() {
            tone(740, 120, { wave: 'square', gain: 0.05 })
            tone(740, 120, { wave: 'square', gain: 0.05, delay: 180 })
            tone(554, 200, { wave: 'triangle', gain: 0.08, delay: 360 })
        },
        shutter() {
            noise(60, 0.35, 0, 2400)
            noise(70, 0.28, 90, 1600)
            tone(1800, 30, { wave: 'square', gain: 0.04 })
        },
        send() {
            tone(420, 180, { wave: 'sine', gain: 0.09, to: 1200 })
        },
        receive() {
            tone(988, 90, { wave: 'sine', gain: 0.1 })
            tone(1319, 120, { wave: 'sine', gain: 0.08, delay: 80 })
        },
        whoosh() {
            tone(300, 260, { wave: 'sine', gain: 0.08, to: 900 })
        },
        crumple() {
            noise(180, 0.25, 0, 900)
            noise(120, 0.2, 140, 1400)
        },
        power() {
            notes([392, 523, 659, 784], 90, { wave: 'sine', gain: 0.09 })
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
        pop() {
            tone(700, 80, { wave: 'sine', gain: 0.1, to: 1000 })
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
