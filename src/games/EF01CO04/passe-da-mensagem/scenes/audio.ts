import Phaser from 'phaser'

/**
 * Sem arquivo de áudio: tudo é WebAudio, como nos jogos irmãos. O que separa
 * um "bip" de um som de jogo é o ENVELOPE e o FILTRO — ataque curto, queda
 * exponencial, e ruído passa-banda para o que é ar e terra.
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
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.08, t0 + 0.01)
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
        band.Q.value = 1.1
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

        /** O assobio do passe: ar cortando, subindo e sumindo. */
        pass() {
            noise({ dur: 0.26, from: 900, to: 2600, gain: 0.05 })
            note({ freq: 420, to: 760, dur: 0.22, type: 'sine', gain: 0.05 })
        },

        /** O "pop" da chegada, e a mensagem trocando de linguagem. */
        land() {
            note({ freq: 660, dur: 0.09, type: 'triangle', gain: 0.09 })
            note({ freq: 990, dur: 0.13, type: 'sine', gain: 0.06, delay: 0.06 })
        },

        tap() {
            note({ freq: 520, to: 380, dur: 0.07, type: 'triangle', gain: 0.06 })
        },

        /** A buzina boba do robô: errar aqui é piada, não castigo. */
        robot() {
            note({ freq: 300, to: 190, dur: 0.16, type: 'square', gain: 0.07, cutoff: 900 })
            note({ freq: 220, to: 150, dur: 0.2, type: 'square', gain: 0.06, cutoff: 700, delay: 0.14 })
            noise({ dur: 0.12, from: 1400, to: 500, gain: 0.035, delay: 0.02 })
        },

        /** Torcida curta: ruído em ondas, que é como multidão soa de longe. */
        crowd() {
            for (let i = 0; i < 4; i++) {
                noise({ dur: 0.34, from: 700 + i * 120, to: 400, gain: 0.045, delay: i * 0.12 })
            }
            [523, 659, 784].forEach((freq, i) => {
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.07, delay: i * 0.1 })
            })
        },

        fanfare() {
            [523, 659, 784, 1047, 1319].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.55 })
        },
    }
}
