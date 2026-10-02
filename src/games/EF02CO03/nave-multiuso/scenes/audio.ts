type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    tick(): void
    swap(): void
    blow(): void
    splash(): void
    pull(): void
    plim(step: number): void
    fomfom(): void
    wave(): void
    whoosh(): void
    powerUp(): void
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

const STEP_NOTES = [659, 740, 784, 880, 988, 1047]

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
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.02)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(bus)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    return {
        tick() {
            tone(880, 0.05, { wave: 'triangle', gain: 0.06 })
        },
        swap() {
            tone(520, 0.05, { wave: 'square', gain: 0.04 })
            tone(780, 0.07, { wave: 'triangle', gain: 0.07, delay: 0.05 })
            noise(0.05, 3000, 0.04, 0, 2)
        },
        blow() {
            noise(0.45, 700, 0.09, 0, 0.8, 2600)
        },
        splash() {
            noise(0.5, 2200, 0.07, 0, 1.2, 900)
            for (let i = 0; i < 4; i++) tone(900 + i * 140, 0.06, { gain: 0.04, delay: 0.25 + i * 0.07 })
        },
        pull() {
            tone(220, 0.55, { wave: 'sine', gain: 0.09, to: 880 })
            tone(330, 0.55, { wave: 'triangle', gain: 0.04, to: 1320 })
        },
        plim(step) {
            const f = STEP_NOTES[Math.min(step, STEP_NOTES.length - 1)]
            tone(f, 0.2, { wave: 'triangle', gain: 0.09 })
            tone(f * 1.5, 0.24, { gain: 0.05, delay: 0.05 })
        },
        fomfom() {
            tone(233, 0.28, { wave: 'triangle', gain: 0.1, to: 220, attack: 0.03 })
            tone(175, 0.5, { wave: 'triangle', gain: 0.1, delay: 0.3, to: 156, attack: 0.03 })
        },
        wave() {
            ;[659, 784, 988].forEach((f, i) => tone(f, 0.18, { wave: 'triangle', gain: 0.08, delay: i * 0.09 }))
        },
        powerUp() {
            tone(90, 1.1, { wave: 'sawtooth', gain: 0.05, to: 320, attack: 0.3 })
            noise(1.1, 200, 0.05, 0, 0.8, 900)
        },
        whoosh() {
            noise(1.4, 300, 0.07, 0, 0.9, 3200)
            tone(110, 1.4, { wave: 'sawtooth', gain: 0.03, to: 440, attack: 0.2 })
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
