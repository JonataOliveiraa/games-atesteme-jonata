export interface Audio {
    /** A obra pousa na mesa. */
    land(): void
    /** A virada: papel grosso. */
    flip(): void
    /** O carimbo — o som mais cheio do jogo, e o único com peso. */
    stamp(): void
    /** Cada letra sobe uma nota: o nome tem melodia. */
    letter(i: number): void
    /** A plaquinha fecha. */
    lock(): void
    /** A plaquinha não gruda: nota baixa e abafada, decepção e não bronca. */
    slip(): void
    /** A obra sobe para o mural. */
    rise(): void
    fanfare(): void
    setMuted(on: boolean): void
    destroy(): void
}

/**
 * Sem arquivo de som: WebAudio direto, como nos outros jogos. Sem narração.
 * Os tons codificam informação — grave é carimbo (peso, permanência), e a
 * escada de agudos é o nome sendo montado.
 */
export function createAudio(): Audio {
    let ctx: AudioContext | undefined
    let muted = false

    const get = (): AudioContext | undefined => {
        if (muted) return undefined
        if (!ctx) {
            const Ctor =
                window.AudioContext ??
                (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            if (!Ctor) return undefined
            ctx = new Ctor()
        }
        if (ctx.state === 'suspended') void ctx.resume()
        return ctx
    }

    const tone = (
        freq: number,
        dur: number,
        type: OscillatorType = 'sine',
        gain = 0.08,
        delay = 0,
    ) => {
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
        osc.stop(t0 + dur + 0.04)
    }

    /** Ruído curto e filtrado: papel, madeira, coisa seca. */
    const noise = (dur: number, freq: number, q = 6, gain = 0.09) => {
        const ac = get()
        if (!ac) return
        const frames = Math.max(1, Math.floor(ac.sampleRate * dur))
        const buf = ac.createBuffer(1, frames, ac.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < frames; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2
        }
        const src = ac.createBufferSource()
        src.buffer = buf
        const bp = ac.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = freq
        bp.Q.value = q
        const amp = ac.createGain()
        amp.gain.value = gain
        src.connect(bp).connect(amp).connect(ac.destination)
        src.start()
    }

    return {
        land() { noise(0.14, 900, 4, 0.07) },
        flip() { noise(0.2, 1500, 3, 0.09) },
        stamp() {
            noise(0.09, 320, 2, 0.14)
            tone(120, 0.16, 'triangle', 0.13)
        },
        letter(i) { tone(523 + i * 98, 0.12, 'sine', 0.07) },
        lock() {
            tone(784, 0.1, 'sine', 0.08)
            tone(1047, 0.16, 'sine', 0.08, 0.09)
        },
        slip() { tone(196, 0.3, 'sine', 0.09) },
        rise() { noise(0.3, 2200, 2, 0.05) },
        fanfare() {
            [523, 659, 784, 1047].forEach((f, i) =>
                tone(f, 0.24, 'triangle', 0.09, i * 0.11))
        },
        setMuted(on) {
            muted = on
            if (on && ctx) void ctx.suspend()
            if (!on && ctx) void ctx.resume()
        },
        destroy() {
            void ctx?.close()
            ctx = undefined
        },
    }
}
