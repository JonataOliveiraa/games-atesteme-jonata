import Phaser from 'phaser'

/** Sem arquivo de som: tudo sai do WebAudio e respeita o mudo da plataforma. */
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
        amp.gain.exponentialRampToValueAtTime(o.gain ?? 0.07, t0 + 0.012)
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
        band.Q.value = 1.2
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

    let foot = 0

    return {
        setMuted(value: boolean) {
            muted = value
        },

        /** Passos macios alternados. */
        step() {
            foot = 1 - foot
            noise({ dur: 0.06, from: 620 + foot * 200, to: 180, gain: 0.02 })
        },

        /** Picareta na pedra: um baque seco, sem nota. */
        pickaxe() {
            noise({ dur: 0.12, from: 1400, to: 240, gain: 0.06 })
            note({ freq: 150, to: 90, dur: 0.12, type: 'square', gain: 0.04, cutoff: 500 })
        },

        /** A pedra abriu e a palavra apareceu. */
        crack() {
            noise({ dur: 0.2, from: 2600, to: 700, gain: 0.05 })
            note({ freq: 880, to: 1480, dur: 0.22, type: 'triangle', gain: 0.07 })
        },

        /** Plim ascendente: a palavra entrou na bolsa. */
        collect() {
            note({ freq: 660, to: 1180, dur: 0.16, type: 'triangle', gain: 0.07 })
        },

        /** Uma nota por ficha que sobe ao encaixe. */
        pick(index: number) {
            note({ freq: 520 + index * 130, dur: 0.12, type: 'triangle', gain: 0.06 })
        },

        drop() {
            note({ freq: 520, to: 330, dur: 0.14, type: 'triangle', gain: 0.05 })
        },

        /** Duas batidas neutras: falta dado, e isso não é erro. */
        incomplete() {
            note({ freq: 400, dur: 0.1, type: 'sine', gain: 0.05, cutoff: 900 })
            note({ freq: 400, dur: 0.1, type: 'sine', gain: 0.05, cutoff: 900, delay: 0.16 })
        },

        /** Acorde crescente: os pedaços viraram uma informação. */
        fuse() {
            ;[523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.26, type: 'triangle', gain: 0.075, delay: i * 0.09 })
            })
        },

        /** Rangido de pedra e o vão de luz. */
        door() {
            noise({ dur: 0.7, from: 260, to: 90, gain: 0.05 })
            note({ freq: 130, to: 90, dur: 0.7, type: 'sawtooth', gain: 0.035, cutoff: 420 })
            note({ freq: 880, dur: 0.5, type: 'sine', gain: 0.05, delay: 0.5 })
        },

        /** Baque abafado: a fusão quebrou no dado alheio. */
        smoke() {
            note({ freq: 260, to: 130, dur: 0.28, type: 'square', gain: 0.055, cutoff: 620 })
            noise({ dur: 0.34, from: 520, to: 130, gain: 0.04 })
        },

        unlock() {
            note({ freq: 420, to: 760, dur: 0.2, type: 'triangle', gain: 0.06 })
        },

        /** Acorde cavernoso curto: a galeria entrou. */
        enter() {
            note({ freq: 196, dur: 0.5, type: 'sine', gain: 0.05, cutoff: 700 })
            note({ freq: 294, dur: 0.45, type: 'sine', gain: 0.04, delay: 0.1 })
        },

        fanfare() {
            ;[523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
