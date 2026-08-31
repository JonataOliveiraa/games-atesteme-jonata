import Phaser from 'phaser'

/**
 * Sem arquivo de áudio: tudo é WebAudio. Um metrônomo precisa de contador em
 * milissegundos, não de `seek` em arquivo — é isso que faz a retomada depois
 * da trava cair no tempo certo em vez de "mais ou menos ali".
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

        /**
         * O pulso do jogo é um RELÓGIO, não uma música. A batida de bateria
         * fazia o jogo parecer duas coisas grudadas — um quarto de brinquedo
         * em cima de um jogo de ritmo. Tique-taque combina com "a rotina do
         * dia" e some do primeiro plano em vez de disputar com ele.
         */
        tick(beat: number) {
            if (beat % 2 !== 0) return
            note({ freq: 1180, dur: 0.035, type: 'sine', gain: 0.022 })
            note({ freq: 720, dur: 0.05, type: 'sine', gain: 0.014, delay: 0.02 })
        },

        /** O tambor é brinquedo de verdade: grave, curto e gostoso. */
        drum() {
            note({ freq: 190, to: 84, dur: 0.24, type: 'sine', gain: 0.13, cutoff: 620 })
            noise({ dur: 0.06, from: 2200, to: 700, gain: 0.035 })
        },

        refuse() {
            note({ freq: 420, to: 300, dur: 0.12, type: 'triangle', gain: 0.07 })
            noise({ dur: 0.1, from: 1800, to: 900, gain: 0.03 })
        },

        /** Três seguidos: um arpejo curto que premia a sequência. */
        streak() {
            [880, 1108, 1318, 1760].forEach((freq, i) => {
                note({ freq, dur: 0.12, type: 'triangle', gain: 0.06, delay: i * 0.055 })
            })
        },

        reward() {
            note({ freq: 784, dur: 0.1, type: 'triangle', gain: 0.07, delay: 0.04 })
            note({ freq: 1175, dur: 0.16, type: 'sine', gain: 0.05, delay: 0.1 })
        },

        wrong() {
            noise({ dur: 0.24, from: 1400, to: 300, gain: 0.05 })
            note({ freq: 220, to: 104, dur: 0.3, type: 'square', gain: 0.05, cutoff: 800 })
        },

        unlock() {
            note({ freq: 440, dur: 0.1, type: 'triangle', gain: 0.06 })
            note({ freq: 660, dur: 0.16, type: 'triangle', gain: 0.05, delay: 0.08 })
        },

        fanfare() {
            [523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        },
    }
}
