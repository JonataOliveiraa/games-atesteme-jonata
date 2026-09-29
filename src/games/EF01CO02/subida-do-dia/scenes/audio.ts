type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    tap(): void
    steps(): void
    climb(rung: number): void
    puff(): void
    fly(): void
    boing(): void
    slide(): void
    oops(): void
    fanfare(): void
    replay(index: number): void
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

const SCALE = [523, 587, 659, 784, 880, 1047]

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
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(bus)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0, q = 1.4) => {
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
        band.type = 'bandpass'
        band.frequency.setValueAtTime(freq, at)
        band.Q.value = q
        const vol = audio.createGain()
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.01)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(bus)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.5, detune: 8 })
    }

    const wood = (freq: number, delay = 0) => {
        noise(0.05, freq * 3, 0.06, delay, 3)
        tone(freq, 0.09, { wave: 'triangle', gain: 0.07, delay, to: freq * 0.8 })
    }

    return {
        tap() {
            tone(640, 0.07, { wave: 'triangle', gain: 0.06 })
        },
        steps() {
            ;[0, 0.16, 0.32].forEach((d, i) => noise(0.04, i % 2 ? 900 : 700, 0.05, d, 2))
        },
        climb(rung) {
            const f = SCALE[Math.min(SCALE.length - 1, rung)]
            wood(f / 2)
            tone(f, 0.14, { wave: 'triangle', gain: 0.06, delay: 0.03 })
        },
        puff() {
            noise(0.18, 1400, 0.06)
            tone(900, 0.12, { wave: 'sine', gain: 0.04, to: 1400 })
        },
        fly() {
            noise(0.4, 1100, 0.05)
            tone(420, 0.36, { wave: 'sine', gain: 0.05, to: 880 })
        },
        boing() {
            tone(180, 0.45, { wave: 'sine', gain: 0.11, to: 420 })
            tone(420, 0.3, { wave: 'triangle', gain: 0.05, delay: 0.18, to: 200 })
            wood(260, 0.02)
        },
        slide() {
            tone(880, 0.6, { wave: 'triangle', gain: 0.07, to: 220 })
            tone(1320, 0.55, { wave: 'sine', gain: 0.03, delay: 0.04, to: 330 })
        },
        oops() {
            tone(392, 0.16, { wave: 'triangle', gain: 0.07 })
            tone(330, 0.26, { wave: 'triangle', gain: 0.07, delay: 0.16, to: 311 })
        },
        fanfare() {
            ;[659, 784, 1047].forEach((f, i) => fat(f, 0.2, { wave: 'triangle', gain: 0.09, delay: i * 0.1 }))
        },
        replay(index) {
            const f = SCALE[Math.min(SCALE.length - 1, index)]
            fat(f, 0.18, { wave: 'triangle', gain: 0.07 })
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            fat(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        lose() {
            tone(440, 0.22, { wave: 'triangle', gain: 0.08, to: 392 })
            tone(349, 0.26, { wave: 'triangle', gain: 0.08, delay: 0.2, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.07, delay: 0.42, to: 233 })
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
