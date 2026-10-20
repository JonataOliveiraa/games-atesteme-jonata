type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    wind(): void
    tumble(): void
    step(): void
    join(index: number): void
    buzz(): void
    plant(): void
    pick(): void
    wilt(): void
    trip(): void
    bounce(): void
    ding(): void
    good(): void
    lose(): void
    win(): void
    pop(): void
    chirp(): void
    flap(): void
    stretch(): void
    snap(): void
    whirl(): void
    spit(): void
    bonk(): void
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
const SCALE = [523, 587, 659, 784, 880, 1047]

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

    const noise = (ms: number, gainValue: number, delay = 0, freq = 1800, type: BiquadFilterType = 'highpass', sweepTo?: number) => {
        const audio = get()
        if (!audio || !bus) return
        const length = Math.floor((audio.sampleRate * ms) / 1000)
        const buffer = audio.createBuffer(1, length, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / length)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = type
        const t0 = audio.currentTime + delay / 1000
        filter.frequency.setValueAtTime(freq, t0)
        if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t0 + ms / 1000)
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
        wind() {
            noise(1500, 0.32, 0, 300, 'bandpass', 1400)
            noise(1100, 0.18, 300, 1600, 'bandpass', 500)
        },
        tumble() {
            tone(520, 220, { wave: 'sine', gain: 0.07, to: 260 })
        },
        step() {
            noise(30, 0.05, 0, 3000)
        },
        join(index) {
            const f = SCALE[Math.min(index, SCALE.length - 1)]
            tone(f, 140, { wave: 'triangle', gain: 0.12 })
            tone(f * 1.5, 160, { wave: 'sine', gain: 0.06, delay: 70 })
        },
        buzz() {
            tone(190, 520, { wave: 'sawtooth', gain: 0.035, to: 230 })
            tone(196, 520, { wave: 'square', gain: 0.02, to: 220 })
        },
        plant() {
            tone(300, 90, { wave: 'triangle', gain: 0.12, to: 180 })
            noise(70, 0.08, 0, 600, 'lowpass')
            tone(880, 120, { wave: 'sine', gain: 0.09, delay: 120 })
            tone(1320, 180, { wave: 'sine', gain: 0.07, delay: 200 })
        },
        pick() {
            tone(600, 90, { wave: 'sine', gain: 0.08, to: 900 })
        },
        wilt() {
            tone(440, 600, { wave: 'triangle', gain: 0.1, to: 180 })
        },
        trip() {
            tone(360, 160, { wave: 'triangle', gain: 0.12, to: 200 })
            noise(90, 0.12, 140, 500, 'lowpass')
        },
        bounce() {
            tone(660, 80, { wave: 'sine', gain: 0.08, to: 990 })
        },
        ding() {
            tone(988, 120, { wave: 'sine', gain: 0.12 })
            tone(1319, 220, { wave: 'sine', gain: 0.1, delay: 110 })
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
        chirp() {
            tone(2100, 90, { wave: 'sine', gain: 0.08, to: 2900 })
            tone(2300, 110, { wave: 'sine', gain: 0.07, to: 3200, delay: 130 })
        },
        flap() {
            noise(60, 0.08, 0, 900, 'bandpass')
            noise(60, 0.07, 120, 900, 'bandpass')
            noise(60, 0.06, 240, 900, 'bandpass')
        },
        stretch() {
            tone(330, 520, { wave: 'triangle', gain: 0.07, to: 760 })
            tone(332, 520, { wave: 'sine', gain: 0.04, to: 770 })
        },
        snap() {
            noise(50, 0.2, 0, 2500)
            tone(900, 140, { wave: 'triangle', gain: 0.1, to: 220 })
            tone(500, 420, { wave: 'sine', gain: 0.07, to: 160, delay: 140 })
        },
        whirl() {
            noise(1600, 0.26, 0, 400, 'bandpass', 1800)
            tone(220, 1400, { wave: 'sine', gain: 0.04, to: 440 })
        },
        spit() {
            noise(160, 0.12, 0, 1200, 'bandpass', 2600)
            tone(520, 160, { wave: 'sine', gain: 0.07, to: 880 })
        },
        bonk() {
            tone(200, 120, { wave: 'triangle', gain: 0.14, to: 120 })
            noise(60, 0.1, 0, 400, 'lowpass')
            tone(520, 140, { wave: 'sine', gain: 0.07, to: 700, delay: 160 })
            tone(380, 140, { wave: 'sine', gain: 0.05, to: 500, delay: 330 })
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
