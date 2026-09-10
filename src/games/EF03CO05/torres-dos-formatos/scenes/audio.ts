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

    return {
        setMuted(value: boolean) {
            muted = value
        },

        /** Leitor selecionado na bandeja. */
        pick() {
            note({ freq: 520, dur: 0.09, type: 'triangle', gain: 0.05 })
        },

        /** O disfarce cai. */
        reveal() {
            noise({ dur: 0.26, from: 3200, to: 400, gain: 0.06 })
            note({ freq: 240, to: 880, dur: 0.26, type: 'triangle', gain: 0.07 })
        },

        /** O arquivo escorrega uma pista. */
        slide() {
            note({ freq: 720, to: 900, dur: 0.07, type: 'triangle', gain: 0.045 })
        },

        drop() {
            note({ freq: 460, to: 300, dur: 0.13, type: 'triangle', gain: 0.05 })
        },

        /** A prévia abre: uma nota por estrutura que vem na onda. */
        preview(count: number) {
            for (let i = 0; i < count; i++) {
                note({ freq: 520 + i * 130, dur: 0.14, type: 'triangle', gain: 0.06, delay: i * 0.12 })
            }
        },

        /** Cada leitor lê do seu jeito: o som conta qual mecanismo trabalhou. */
        read(format: 'date' | 'image' | 'text' | 'audio') {
            if (format === 'date') {
                [660, 790, 940].forEach((freq, i) =>
                    note({ freq, dur: 0.1, type: 'triangle', gain: 0.06, delay: i * 0.07 }),
                )
                return
            }
            if (format === 'image') {
                [880, 1050, 1250, 1480].forEach((freq, i) =>
                    note({ freq, dur: 0.09, type: 'sine', gain: 0.05, delay: i * 0.05 }),
                )
                return
            }
            if (format === 'text') {
                for (let i = 0; i < 4; i++) noise({ dur: 0.04, from: 2200, to: 900, gain: 0.03, delay: i * 0.06 })
                return
            }
            note({ freq: 300, to: 620, dur: 0.24, type: 'sawtooth', gain: 0.05, cutoff: 900 })
        },

        /** Conteúdo guardado na gaveta. */
        store() {
            note({ freq: 990, dur: 0.11, type: 'triangle', gain: 0.06 })
        },

        /** Caixa errada: baque neutro, sem alarme. */
        wrong() {
            note({ freq: 190, to: 110, dur: 0.3, type: 'square', gain: 0.05, cutoff: 520 })
            noise({ dur: 0.3, from: 620, to: 140, gain: 0.04 })
        },

        unlock() {
            [420, 620, 880].forEach((freq, i) =>
                note({ freq, dur: 0.18, type: 'triangle', gain: 0.07, delay: i * 0.08 }),
            )
        },

        /** Onda fechada. */
        wave() {
            [660, 830, 990].forEach((freq, i) =>
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.07, delay: i * 0.09 }),
            )
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
