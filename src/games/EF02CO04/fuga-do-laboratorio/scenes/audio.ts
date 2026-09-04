import Phaser from 'phaser'

/**
 * Sem arquivo de som: tudo é sintetizado no WebAudio e respeita o `mute-audio`.
 *
 * Os tons codificam a categoria — a bandeja soa como um clique seco de coisa
 * física, e o leitor como um bipe digital. A criança ouve a diferença entre
 * peça e programa antes de saber nomeá-la.
 */
export function createAudio(scene: Phaser.Scene) {
    let muted = false

    const ctx = (): AudioContext | null => {
        if (muted) return null
        try {
            return (scene.sound as Phaser.Sound.WebAudioSoundManager).context ?? null
        } catch {
            return null
        }
    }

    function note(o: {
        freq: number
        dur: number
        type?: OscillatorType
        gain?: number
        to?: number
        delay?: number
        cutoff?: number
    }) {
        const audio = ctx()
        if (!audio) return

        const t0 = audio.currentTime + (o.delay ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()

        osc.type = o.type ?? 'sine'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)

        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.08, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        osc.connect(amp)
        if (o.cutoff) {
            const low = audio.createBiquadFilter()
            low.type = 'lowpass'
            low.frequency.setValueAtTime(o.cutoff, t0)
            amp.connect(low)
            low.connect(audio.destination)
        } else {
            amp.connect(audio.destination)
        }

        osc.start(t0)
        osc.stop(t0 + o.dur + 0.03)
    }

    function noise(o: { dur: number; from: number; to: number; gain?: number; delay?: number }) {
        const audio = ctx()
        if (!audio) return

        const t0 = audio.currentTime + (o.delay ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * o.dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)

        const source = audio.createBufferSource()
        source.buffer = buffer

        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = 1.4
        band.frequency.setValueAtTime(o.from, t0)
        band.frequency.exponentialRampToValueAtTime(Math.max(80, o.to), t0 + o.dur)

        const amp = audio.createGain()
        amp.gain.setValueAtTime(o.gain ?? 0.05, t0)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)

        source.connect(band)
        band.connect(amp)
        amp.connect(audio.destination)
        source.start(t0)
        source.stop(t0 + o.dur)
    }

    return {
        setMuted(value: boolean) {
            muted = value
        },

        /** Pegou uma ficha do rack. */
        pick() {
            note({ freq: 620, to: 880, dur: 0.08, type: 'triangle', gain: 0.05 })
        },

        /** A bandeja fechando: clique seco de coisa física. */
        tray() {
            noise({ dur: 0.1, from: 1500, to: 400, gain: 0.05 })
            note({ freq: 230, to: 150, dur: 0.15, type: 'square', gain: 0.05, cutoff: 900 })
        },

        /** O leitor engolindo o cartão: bipe digital. */
        reader() {
            note({ freq: 900, dur: 0.07, type: 'square', gain: 0.04, cutoff: 2200 })
            note({ freq: 1340, dur: 0.09, type: 'square', gain: 0.035, cutoff: 2600, delay: 0.07 })
        },

        /** Não entrou. Mola macia, nunca buzina. */
        refuse() {
            note({ freq: 330, to: 120, dur: 0.28, type: 'sine', gain: 0.07, cutoff: 700 })
            note({ freq: 180, to: 250, dur: 0.2, type: 'sine', gain: 0.04, delay: 0.12 })
        },

        /** O TESTAR acendeu. */
        arm() {
            note({ freq: 660, dur: 0.1, type: 'triangle', gain: 0.06 })
            note({ freq: 990, dur: 0.14, type: 'triangle', gain: 0.05, delay: 0.08 })
        },

        /** A máquina ligando. */
        run() {
            noise({ dur: 0.4, from: 200, to: 1200, gain: 0.04 })
            note({ freq: 180, to: 420, dur: 0.4, type: 'sawtooth', gain: 0.04, cutoff: 900 })
        },

        /** Funcionou. */
        works() {
            [659, 831, 988, 1319].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.09, delay: i * 0.09 })
            })
        },

        /** Rodou errado: desafina e desce, mas continua engraçado. */
        wrong() {
            [520, 460, 380].forEach((freq, i) => {
                note({ freq, to: freq * 0.7, dur: 0.24, type: 'square', gain: 0.05, cutoff: 800, delay: i * 0.13 })
            })
            noise({ dur: 0.5, from: 900, to: 200, gain: 0.035, delay: 0.1 })
        },

        /** A máquina subindo para a prateleira. */
        trophy() {
            note({ freq: 780, to: 1400, dur: 0.34, type: 'triangle', gain: 0.06 })
            note({ freq: 1560, dur: 0.3, type: 'sine', gain: 0.04, delay: 0.28 })
        },

        fanfare() {
            [523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
