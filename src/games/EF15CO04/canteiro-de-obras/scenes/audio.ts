type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    /** A serra do corte. */
    saw(): void
    /** Um toque em qualquer coisa. */
    tap(): void
    /** A peça afunda no lugar. O som mais cheio do jogo. */
    toc(step: number): void
    /** O pedaço inteiro fica pronto. */
    chunkDone(): void
    /** A peça é de outro pedaço. Nunca agressivo. */
    wrong(): void
    /** A linha pontilhada entra. */
    tick(): void
    /** A câmera aproxima ou afasta. */
    whoosh(up: boolean): void
    fanfare(): void
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

/** Tudo sintetizado, sem arquivo e sem narração. */
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

    const out = () => bus ?? ctx?.destination

    const tone = (freq: number, dur: number, o: ToneOpts = {}) => {
        const audio = get()
        const dest = out()
        if (!audio || !dest) return
        const at = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = o.wave ?? 'sine'
        osc.frequency.setValueAtTime(freq, at)
        if (o.detune) osc.detune.setValueAtTime(o.detune, at)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), at + dur)
        const peak = o.gain ?? 0.1
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(peak, at + (o.attack ?? 0.012))
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(dest)
        osc.start(at)
        osc.stop(at + dur + 0.03)
    }

    const noise = (dur: number, freq: number, gain = 0.08, delay = 0) => {
        const audio = get()
        const dest = out()
        if (!audio || !dest) return
        const at = audio.currentTime + delay
        const frames = Math.floor(audio.sampleRate * dur)
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
        const src = audio.createBufferSource()
        src.buffer = buffer
        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.setValueAtTime(freq, at)
        band.Q.value = 1.4
        const vol = audio.createGain()
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.01)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(band).connect(vol).connect(dest)
        src.start(at)
        src.stop(at + dur + 0.02)
    }

    const fat = (freq: number, dur: number, o: ToneOpts = {}) => {
        tone(freq, dur, o)
        tone(freq, dur, { ...o, gain: (o.gain ?? 0.1) * 0.5, detune: 8 })
    }

    return {
        saw() {
            noise(0.16, 1400, 0.1)
            noise(0.14, 900, 0.07, 0.12)
            tone(180, 0.14, { wave: 'triangle', gain: 0.05, to: 120, delay: 0.16 })
        },
        tap() {
            tone(640, 0.07, { wave: 'triangle', gain: 0.06 })
        },
        toc(step) {
            tone(150, 0.16, { wave: 'triangle', gain: 0.12, to: 96 })
            noise(0.09, 600, 0.05)
            tone(523 + step * 110, 0.14, { wave: 'triangle', gain: 0.08, delay: 0.06 })
        },
        chunkDone() {
            fat(659, 0.16, { wave: 'triangle', gain: 0.1 })
            fat(880, 0.2, { wave: 'triangle', gain: 0.09, delay: 0.1 })
        },
        wrong() {
            tone(280, 0.22, { wave: 'sine', gain: 0.08, to: 214 })
        },
        tick() {
            tone(940, 0.05, { wave: 'square', gain: 0.03 })
        },
        whoosh(up) {
            noise(0.26, up ? 700 : 420, 0.045)
            tone(up ? 320 : 240, 0.2, { wave: 'sine', gain: 0.04, to: up ? 480 : 180 })
        },
        fanfare() {
            const notes = [523, 659, 784, 1047]
            notes.forEach((f, i) => fat(f, 0.24, { wave: 'triangle', gain: 0.1, delay: i * 0.11 }))
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
