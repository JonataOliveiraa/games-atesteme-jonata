type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth'

export interface Audio {
    pick(): void
    /** As duas notas do SE: o ENTÃO é grave, o SENÃO é agudo. */
    branch(kind: 'then' | 'else'): void
    step(): void
    duck(): void
    wake(): void
    caught(): void
    stall(): void
    win(): void
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

    const tone = (freq: number, dur: number, wave: Wave = 'sine', gain = 0.12, delay = 0) => {
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

    const noise = (dur: number, from: number, to: number, gain = 0.16) => {
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

    return {
        pick: () => tone(660, 0.1, 'triangle', 0.1),

        branch: kind => {
            if (kind === 'then') tone(262, 0.12, 'triangle', 0.11)
            else tone(784, 0.1, 'triangle', 0.09)
        },

        step: () => noise(0.07, 1400, 600, 0.08),
        duck: () => noise(0.14, 700, 220, 0.12),
        wake: () => tone(880, 0.1, 'square', 0.05),

        caught: () => {
            tone(520, 0.1, 'square', 0.08)
            tone(392, 0.14, 'square', 0.08, 0.1)
            tone(294, 0.22, 'square', 0.08, 0.22)
        },

        stall: () => {
            tone(240, 0.18, 'sine', 0.1)
            tone(190, 0.26, 'sine', 0.1, 0.16)
        },

        win: () => {
            [659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.12, i * 0.09))
        },

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
