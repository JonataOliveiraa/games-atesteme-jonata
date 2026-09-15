import Phaser from 'phaser'

/**
 * Tudo em WebAudio, sem arquivo.
 *
 * O §12 do planejamento proíbe alarme e susto: o encaixe é um clique macio, o
 * erro é um toque neutro e a cápsula é metal leve. Nada aqui imita perigo, e
 * todo efeito tem um equivalente visual — som é reforço, nunca a única
 * informação.
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

    function note(o: { freq: number; dur: number; type?: OscillatorType; gain?: number; to?: number; at?: number }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()
        osc.type = o.type ?? 'sine'
        osc.frequency.setValueAtTime(o.freq, t0)
        if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + o.dur)
        amp.gain.setValueAtTime(0.0001, t0)
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.06, t0 + 0.012)
        amp.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
        osc.connect(amp)
        amp.connect(audio.destination)
        osc.start(t0)
        osc.stop(t0 + o.dur + 0.05)
    }

    function noise(o: { dur: number; freq: number; q?: number; gain?: number; at?: number }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const frames = Math.max(1, Math.floor(audio.sampleRate * o.dur))
        const buffer = audio.createBuffer(1, frames, audio.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
        const source = audio.createBufferSource()
        source.buffer = buffer
        const band = audio.createBiquadFilter()
        band.type = 'bandpass'
        band.Q.value = o.q ?? 1.1
        band.frequency.value = o.freq
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

        /** A criatura chegando ao aro: uma bolha curta. */
        arrive() {
            note({ freq: 320, to: 620, dur: 0.18, type: 'sine', gain: 0.045 })
            noise({ dur: 0.1, freq: 1800, q: 1.6, gain: 0.02, at: 0.06 })
        },

        /** Etiqueta escolhida. */
        pick() {
            note({ freq: 620, dur: 0.06, type: 'triangle', gain: 0.045 })
        },

        /** Etiqueta solta. */
        drop() {
            note({ freq: 420, dur: 0.06, type: 'triangle', gain: 0.035 })
        },

        /** O encaixe macio: duas notas subindo e um clique de fecho. */
        snap() {
            note({ freq: 620, dur: 0.1, type: 'triangle', gain: 0.05 })
            note({ freq: 930, dur: 0.14, type: 'triangle', gain: 0.045, at: 0.08 })
            noise({ dur: 0.06, freq: 2600, q: 2.2, gain: 0.03, at: 0.08 })
        },

        /** A troca de valor: duas notas, o velho saindo e o novo entrando. */
        swap() {
            note({ freq: 520, to: 400, dur: 0.14, type: 'sine', gain: 0.045 })
            note({ freq: 700, to: 880, dur: 0.18, type: 'triangle', gain: 0.05, at: 0.14 })
        },

        /** O campo que recusa: toque neutro, nunca alarme. */
        refuse() {
            note({ freq: 260, to: 200, dur: 0.16, type: 'square', gain: 0.03 })
        },

        /** A bandeja pedindo a vez. */
        nudge() {
            note({ freq: 500, dur: 0.08, type: 'sine', gain: 0.03 })
            note({ freq: 620, dur: 0.08, type: 'sine', gain: 0.03, at: 0.09 })
        },

        /** O ferrolho girando: metal leve. */
        bolt() {
            note({ freq: 300, to: 180, dur: 0.16, type: 'sine', gain: 0.045 })
            noise({ dur: 0.12, freq: 1100, q: 1.4, gain: 0.035 })
        },

        /** A porta redonda abrindo. */
        door() {
            note({ freq: 180, to: 300, dur: 0.5, type: 'sine', gain: 0.04 })
            noise({ dur: 0.4, freq: 700, q: 0.7, gain: 0.03 })
        },

        fanfare() {
            ;[523, 659, 784, 1047].forEach((freq, i) =>
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.09, at: i * 0.11 }),
            )
            for (let i = 0; i < 16; i++) {
                noise({
                    dur: 0.1,
                    freq: 1400 + Math.random() * 1200,
                    q: 0.6,
                    gain: 0.022,
                    at: 0.4 + Math.random() * 1.2,
                })
            }
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
