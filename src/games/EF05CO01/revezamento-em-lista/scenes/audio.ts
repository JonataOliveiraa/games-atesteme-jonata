type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    pick(): void
    drop(): void
    step(i: number): void
    whistle(): void
    dive(): void
    wall(): void
    crowd(): void
    wrong(): void
    locked(): void
    fanfare(): void
    setMuted(on: boolean): void
    destroy(): void
}

/** Tudo sintetizado em WebAudio, sem arquivo. É o padrão do projeto. */
export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let muted = false

    const get = () => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor = window.AudioContext
                ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (freq: number, dur: number, wave: Wave = 'sine', gain = 0.14, delay = 0) => {
        const audio = get()
        if (!audio) return
        const at = audio.currentTime + delay
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = wave
        osc.frequency.setValueAtTime(freq, at)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.012)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(audio.destination)
        osc.start(at)
        osc.stop(at + dur + 0.02)
    }

    /** Água, areia, atrito: ruído passa-banda com envelope curto. */
    const noise = (dur: number, from: number, to: number, gain = 0.18) => {
        const audio = get()
        if (!audio) return
        const at = audio.currentTime
        const frames = Math.floor(audio.sampleRate * dur)
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
        const src = audio.createBufferSource()
        src.buffer = buffer
        const filter = audio.createBiquadFilter()
        filter.type = 'bandpass'
        filter.Q.value = 1.4
        filter.frequency.setValueAtTime(from, at)
        filter.frequency.exponentialRampToValueAtTime(Math.max(60, to), at + dur)
        const vol = audio.createGain()
        vol.gain.setValueAtTime(gain, at)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(filter).connect(vol).connect(audio.destination)
        src.start(at)
    }

    const SCALE = [523, 587, 659, 740, 831, 932]

    return {
        pick: () => tone(660, 0.1, 'triangle', 0.1),
        drop: () => {
            tone(330, 0.09, 'triangle', 0.12)
            noise(0.12, 1600, 500, 0.1)
        },
        /** A renumeração tem som próprio: uma nota por ficha, subindo. */
        step: i => tone(SCALE[Math.min(i, SCALE.length - 1)], 0.16, 'sine', 0.1),
        whistle: () => {
            tone(2100, 0.3, 'square', 0.07)
            tone(2680, 0.28, 'square', 0.05, 0.02)
        },
        dive: () => noise(0.24, 900, 260, 0.2),
        wall: () => {
            noise(0.1, 3200, 900, 0.16)
            tone(150, 0.1, 'sine', 0.12)
        },
        crowd: () => noise(0.7, 700, 240, 0.16),
        wrong: () => {
            tone(260, 0.16, 'sine', 0.12)
            tone(190, 0.26, 'sine', 0.12, 0.14)
        },
        locked: () => tone(150, 0.13, 'square', 0.1),
        fanfare: () => {
            [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.14, i * 0.11))
        },
        setMuted: on => {
            muted = on
        },
        destroy: () => {
            void ctx?.close()
            ctx = undefined
        },
    }
}
