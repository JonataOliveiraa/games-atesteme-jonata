type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'
type Filter = 'bandpass' | 'lowpass' | 'highpass'

export interface Audio {
    roll(on: boolean): void
    bip(): void
    plof(): void
    cheer(): void
    pop(i: number): void
    toot(): void
    lever(): void
    stamp(): void
    flip(): void
    blom(): void
    fail(): void
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
    attack?: number
}

const MASTER = 0.85
const ROLL_BEAT = 560

export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let bus: GainNode | undefined
    let muted = false
    let beat: number | undefined

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
            const master = ctx.createGain()
            master.gain.value = MASTER
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
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(o.gain ?? 0.1, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(bus)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noiseBuffer = (audio: AudioContext, dur: number) => {
        const frames = Math.max(1, Math.floor(audio.sampleRate * dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        return buffer
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0, q = 1.4, type: Filter = 'bandpass', to?: number) => {
        const audio = get()
        if (!audio || !bus) return
        const at = audio.currentTime + delay
        const src = audio.createBufferSource()
        src.buffer = noiseBuffer(audio, dur)
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

    const chug = () => {
        ;[0, 0.14].forEach(d => {
            noise(0.07, 900, 0.045, d, 1.2, 'bandpass')
            tone(95, 0.08, { wave: 'sine', gain: 0.05, delay: d, to: 70 })
        })
    }

    const stopRoll = () => {
        if (beat === undefined) return
        window.clearInterval(beat)
        beat = undefined
    }

    return {
        roll(on) {
            if (!on) return stopRoll()
            if (beat !== undefined || !get()) return
            chug()
            beat = window.setInterval(chug, ROLL_BEAT)
        },
        bip() {
            tone(1568, 0.09, { wave: 'square', gain: 0.035 })
            tone(2093, 0.12, { wave: 'square', gain: 0.03, delay: 0.1 })
        },
        plof() {
            noise(0.16, 380, 0.16, 0, 1, 'lowpass')
            tone(180, 0.18, { wave: 'sine', gain: 0.12, to: 110 })
        },
        cheer() {
            ;[659, 784, 1047].forEach((f, i) => tone(f, 0.16, { wave: 'triangle', gain: 0.07, delay: i * 0.09 }))
        },
        pop(i) {
            tone(660 + (i % 6) * 90, 0.1, { wave: 'triangle', gain: 0.06 })
        },
        toot() {
            tone(784, 0.2, { wave: 'triangle', gain: 0.08, attack: 0.03 })
            tone(1175, 0.16, { wave: 'sine', gain: 0.03, attack: 0.03 })
            tone(659, 0.34, { wave: 'triangle', gain: 0.08, delay: 0.22, attack: 0.03, to: 622 })
            tone(988, 0.3, { wave: 'sine', gain: 0.03, delay: 0.22, attack: 0.03, to: 932 })
            noise(0.5, 1800, 0.012, 0, 0.8)
        },
        lever() {
            noise(0.05, 2400, 0.09, 0, 2.2)
            tone(210, 0.12, { wave: 'square', gain: 0.035, to: 140 })
            noise(0.06, 1300, 0.08, 0.07, 2)
            tone(160, 0.14, { wave: 'triangle', gain: 0.06, delay: 0.07, to: 110 })
        },
        stamp() {
            tone(150, 0.16, { wave: 'sine', gain: 0.16, to: 70 })
            noise(0.09, 600, 0.09, 0, 1, 'lowpass')
            tone(880, 0.07, { wave: 'triangle', gain: 0.04, delay: 0.1 })
            tone(1175, 0.09, { wave: 'triangle', gain: 0.035, delay: 0.16 })
        },
        flip() {
            noise(0.22, 900, 0.05, 0, 0.9, 'bandpass', 3200)
            tone(523, 0.1, { wave: 'triangle', gain: 0.06, delay: 0.05 })
            tone(784, 0.14, { wave: 'triangle', gain: 0.06, delay: 0.16 })
        },
        blom() {
            tone(130, 0.3, { wave: 'sine', gain: 0.12, to: 90 })
        },
        fail() {
            tone(392, 0.2, { wave: 'triangle', gain: 0.08, to: 330 })
            tone(294, 0.35, { wave: 'triangle', gain: 0.07, delay: 0.2, to: 262 })
        },
        lose() {
            tone(349, 0.26, { wave: 'triangle', gain: 0.07, to: 311 })
            tone(262, 0.5, { wave: 'sine', gain: 0.06, delay: 0.22, to: 233 })
        },
        win() {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
            tone(1319, 0.4, { wave: 'triangle', gain: 0.08, delay: 0.5 })
        },
        setMuted(on) {
            muted = on
            if (bus) bus.gain.value = on ? 0 : MASTER
        },
        destroy() {
            stopRoll()
            void ctx?.close()
            ctx = undefined
            bus = undefined
        },
    }
}
