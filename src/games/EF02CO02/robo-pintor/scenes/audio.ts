type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    toc(): void
    bip(): void
    loopNote(k: number): void
    paint(): void
    step(): void
    meow(): void
    purr(): void
    fomfom(): void
    puzzled(): void
    whoosh(): void
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
}

const LOOP_NOTES = [523, 587, 659, 698, 784, 880, 988]

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            bus = ctx.createGain()
            bus.gain.value = 0.85
            bus.connect(ctx.destination)
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
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(bus)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0, q = 1.4, to?: number) => {
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
        if (to) band.frequency.exponentialRampToValueAtTime(to, at + dur)
        band.Q.value = q
        const vol = audio.createGain()
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.01)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(bus)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    return {
        toc() {
            tone(520, 0.08, { gain: 0.12, to: 320, attack: 0.003 })
        },
        bip() {
            tone(880, 0.07, { wave: 'square', gain: 0.04 })
            tone(1175, 0.09, { wave: 'square', gain: 0.04, delay: 0.1 })
        },
        loopNote(k) {
            tone(LOOP_NOTES[Math.min(k, LOOP_NOTES.length - 1)], 0.16, { wave: 'triangle', gain: 0.08 })
        },
        paint() {
            noise(0.22, 1400, 0.1, 0, 0.9, 500)
        },
        step() {
            tone(300, 0.05, { gain: 0.08, attack: 0.003 })
            tone(260, 0.05, { gain: 0.08, attack: 0.003, delay: 0.16 })
        },
        meow() {
            tone(700, 0.18, { wave: 'triangle', gain: 0.09, to: 1100 })
            tone(1100, 0.3, { wave: 'triangle', gain: 0.08, to: 520, delay: 0.16 })
        },
        purr() {
            for (let i = 0; i < 8; i++) noise(0.08, 160, 0.06, i * 0.1, 3)
        },
        fomfom() {
            tone(233, 0.28, { wave: 'triangle', gain: 0.1, to: 220, attack: 0.03 })
            tone(175, 0.5, { wave: 'triangle', gain: 0.1, delay: 0.3, to: 156, attack: 0.03 })
        },
        puzzled() {
            tone(660, 0.12, { wave: 'square', gain: 0.035 })
            tone(520, 0.18, { wave: 'square', gain: 0.035, delay: 0.14 })
        },
        whoosh() {
            noise(0.35, 900, 0.04, 0, 1.2, 2400)
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            tone(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
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
