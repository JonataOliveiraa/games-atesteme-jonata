type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    tap(): void
    swap(): void
    play(): void
    meow(): void
    splash(): void
    crash(): void
    sizzle(): void
    trip(): void
    run(): void
    seal(): void
    rewind(): void
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

    return {
        tap() {
            tone(660, 0.08, { wave: 'triangle', gain: 0.07 })
        },
        swap() {
            tone(420, 0.22, { wave: 'sine', gain: 0.06, to: 840 })
            noise(0.12, 2200, 0.03, 0.02, 1.5)
        },
        play() {
            MELODY.slice(0, 3).forEach((f, i) => fat(f, 0.14, { wave: 'triangle', gain: 0.08, delay: i * 0.08 }))
        },
        meow() {
            tone(700, 0.18, { wave: 'triangle', gain: 0.06, to: 980 })
            tone(980, 0.28, { wave: 'triangle', gain: 0.05, delay: 0.16, to: 620 })
        },
        splash() {
            noise(0.4, 900, 0.12, 0, 0.9, 'lowpass', 300)
            tone(520, 0.2, { wave: 'sine', gain: 0.05, to: 200, delay: 0.05 })
        },
        crash() {
            noise(0.3, 1400, 0.16, 0, 0.7)
            tone(160, 0.3, { wave: 'triangle', gain: 0.14, to: 70, attack: 0.004 })
            tone(1800, 0.12, { wave: 'square', gain: 0.02, delay: 0.06, to: 900 })
        },
        sizzle() {
            noise(0.9, 4200, 0.06, 0, 0.6, 'highpass')
            tone(300, 0.6, { wave: 'sawtooth', gain: 0.02, to: 260 })
        },
        trip() {
            tone(300, 0.3, { wave: 'triangle', gain: 0.08, to: 140 })
            noise(0.12, 700, 0.06, 0.1, 1)
        },
        run() {
            for (let i = 0; i < 6; i++) noise(0.05, 900, 0.05, i * 0.12, 1.8)
        },
        seal() {
            fat(988, 0.12, { wave: 'triangle', gain: 0.07 })
            fat(1319, 0.2, { wave: 'triangle', gain: 0.06, delay: 0.09 })
        },
        rewind() {
            tone(1200, 0.5, { wave: 'sine', gain: 0.04, to: 300 })
            noise(0.5, 1600, 0.03, 0, 2, 'bandpass', 500)
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
