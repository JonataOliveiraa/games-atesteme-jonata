export interface Audio {
    /** O Tuca aparece e acena. */
    oi(): void
    /** Uma coisa bate no chão. */
    cair(): void
    /** A prateleira chega. */
    chegar(): void
    /** A criança pega uma peça. */
    pegar(): void
    /** A peça crava no buraco — o som mais gostoso do jogo. */
    encaixar(): void
    /** Não era ali: nota grave e curta, nunca agressiva. */
    recusar(): void
    /** Prateleira cheia. */
    completar(): void
    fanfarra(): void
    setMuted(on: boolean): void
    destroy(): void
}

/** Sem arquivo de som: WebAudio direto, como nos outros jogos. Sem narração. */
export function criarAudio(): Audio {
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
        gain = 0.07,
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

    const slide = (de: number, para: number, dur: number, gain = 0.07, delay = 0) => {
        const ac = get()
        if (!ac) return
        const t0 = ac.currentTime + delay
        const osc = ac.createOscillator()
        const amp = ac.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(de, t0)
        osc.frequency.exponentialRampToValueAtTime(para, t0 + dur)
        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
        osc.connect(amp).connect(ac.destination)
        osc.start(t0)
        osc.stop(t0 + dur + 0.04)
    }

    /** Ruído curto e filtrado: madeira, pano, coisa seca. */
    const noise = (dur: number, freq: number, q = 6, gain = 0.08) => {
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
        oi() { tone(660, 0.12, 'sine', 0.06); tone(880, 0.14, 'sine', 0.05, 0.1) },
        cair() { noise(0.18, 260, 2, 0.08) },
        chegar() { slide(220, 440, 0.34, 0.06) },
        pegar() { tone(880, 0.09, 'sine', 0.06); tone(1320, 0.08, 'sine', 0.035, 0.05) },
        encaixar() {
            noise(0.07, 1400, 8, 0.07)
            tone(523, 0.1, 'triangle', 0.06)
            tone(784, 0.14, 'triangle', 0.06, 0.07)
        },
        recusar() { slide(300, 160, 0.26, 0.06) },
        completar() {
            ;[523, 659, 784].forEach((f, i) => tone(f, 0.2, 'triangle', 0.06, i * 0.09))
        },
        fanfarra() {
            ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.07, i * 0.12))
        },
        setMuted(on) {
            muted = on
            if (on && ctx) void ctx.suspend()
        },
        destroy() {
            if (ctx) void ctx.close()
            ctx = undefined
        },
    }
}
