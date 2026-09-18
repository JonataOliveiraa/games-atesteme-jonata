export interface Audio {
    drop(): void
    swish(): void
    burst(): void
    inform(step: number): void
    turn(): void
    fanfare(): void
    setMuted(on: boolean): void
    destroy(): void
}

export function createAudio(): Audio {
    let ctx: AudioContext | null = null
    let muted = false

    const get = () => {
        if (muted) return null
        if (!ctx) {
            const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return null
            ctx = new Ctor()
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.16, delay = 0) => {
        const ac = get()
        if (!ac) return
        const t0 = ac.currentTime + delay
        const osc = ac.createOscillator()
        const amp = ac.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, t0)
        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
        osc.connect(amp).connect(ac.destination)
        osc.start(t0)
        osc.stop(t0 + dur + 0.02)
    }

    const noise = (dur: number, freq: number, q: number, gain = 0.2) => {
        const ac = get()
        if (!ac) return
        const frames = Math.floor(ac.sampleRate * dur)
        const buf = ac.createBuffer(1, frames, ac.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
        const src = ac.createBufferSource()
        src.buffer = buf
        const filter = ac.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = freq
        filter.Q.value = q
        const amp = ac.createGain()
        amp.gain.value = gain
        src.connect(filter).connect(amp).connect(ac.destination)
        src.start()
    }

    return {
        drop: () => noise(0.14, 900, 1.2, 0.16),
        swish: () => noise(0.32, 1800, 0.8, 0.1),
        burst: () => noise(0.22, 1300, 0.5, 0.26),
        inform: step => tone(523 + step * 118, 0.2, 'sine', 0.18),
        turn: () => {
            tone(494, 0.18, 'triangle', 0.14, 0)
            tone(415, 0.18, 'triangle', 0.14, 0.16)
            tone(349, 0.28, 'triangle', 0.14, 0.32)
        },
        fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, 'triangle', 0.16, i * 0.11)),
        setMuted: on => {
            muted = on
        },
        destroy: () => {
            void ctx?.close()
            ctx = null
        },
    }
}
