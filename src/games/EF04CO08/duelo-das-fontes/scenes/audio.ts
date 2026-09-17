type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    deal(): void
    slap(): void
    reveal(): void
    shrug(): void
    tap(): void
    locked(): void
    spread(): void
    hold(): void
    deflate(): void
    inflate(): void
    wrong(): void
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

    const tone = (freq: number, dur: number, wave: Wave = 'sine', gain = 0.16, delay = 0) => {
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

    const slide = (from: number, to: number, dur: number, wave: Wave = 'sine', gain = 0.14) => {
        const audio = get()
        if (!audio) return
        const at = audio.currentTime
        const osc = audio.createOscillator()
        const vol = audio.createGain()
        osc.type = wave
        osc.frequency.setValueAtTime(from, at)
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), at + dur)
        vol.gain.setValueAtTime(0.0001, at)
        vol.gain.exponentialRampToValueAtTime(gain, at + 0.02)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        osc.connect(vol).connect(audio.destination)
        osc.start(at)
        osc.stop(at + dur + 0.02)
    }

    /** Ar saindo: ruído passa-banda descendo. É o "pfff" do robô murchando. */
    const air = (dur: number, from: number, to: number, gain = 0.2) => {
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
        filter.Q.value = 1.6
        filter.frequency.setValueAtTime(from, at)
        filter.frequency.exponentialRampToValueAtTime(Math.max(60, to), at + dur)
        const vol = audio.createGain()
        vol.gain.setValueAtTime(gain, at)
        vol.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        src.connect(filter).connect(vol).connect(audio.destination)
        src.start(at)
    }

    return {
        deal: () => air(0.4, 1800, 400, 0.14),
        slap: () => {
            air(0.09, 3200, 900, 0.22)
            tone(120, 0.1, 'sine', 0.16)
        },
        reveal: () => {
            tone(180, 0.07, 'square', 0.1)
            tone(880, 0.16, 'sine', 0.13, 0.06)
        },
        shrug: () => {
            tone(420, 0.1, 'triangle', 0.09)
            tone(360, 0.12, 'triangle', 0.08, 0.09)
        },
        tap: () => tone(520, 0.06, 'square', 0.07),
        locked: () => tone(150, 0.13, 'square', 0.1),
        spread: () => slide(520, 1250, 0.4, 'triangle', 0.14),
        hold: () => {
            air(0.2, 2400, 700, 0.12)
            tone(160, 0.16, 'sine', 0.16, 0.16)
        },
        deflate: () => air(0.75, 1500, 180, 0.22),
        inflate: () => slide(220, 620, 0.5, 'sawtooth', 0.1),
        wrong: () => {
            tone(240, 0.14, 'sine', 0.13)
            tone(190, 0.22, 'sine', 0.12, 0.13)
        },
        fanfare: () => {
            [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.15, i * 0.11))
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
