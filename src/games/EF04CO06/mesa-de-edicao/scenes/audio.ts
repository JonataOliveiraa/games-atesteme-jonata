import Phaser from 'phaser'

/**
 * Tudo em WebAudio, sem arquivo.
 *
 * Os tons carregam informação: o clique da ferramenta sobe com o passo da
 * letra, então dá para ouvir que o título cresceu sem tirar o olho do cartaz.
 * O erro é um "hm?" grave e curto — nunca alarme, porque aqui errar é palpite
 * de trabalho, não infração.
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
        at?: number
    }) {
        const audio = ctx()
        if (!audio) return
        const t0 = audio.currentTime + (o.at ?? 0)
        const osc = audio.createOscillator()
        const amp = audio.createGain()
        osc.type = o.type ?? 'triangle'
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

        /** Tecla de máquina de escrever. Sobe com o passo da letra. */
        tool(step = 1) {
            noise({ dur: 0.05, freq: 2100, q: 1.4, gain: 0.05 })
            note({ freq: 420 + step * 70, dur: 0.09, type: 'square', gain: 0.025 })
        },

        /** O título mudando de tamanho: um sopro curto. */
        grow(step: number) {
            note({ freq: 300 + step * 80, dur: 0.16, type: 'sine', gain: 0.04, to: 520 + step * 90 })
        },

        deliver() {
            noise({ dur: 0.2, freq: 900, q: 0.6, gain: 0.05 })
            note({ freq: 360, dur: 0.16, gain: 0.05, to: 600 })
        },

        approve() {
            note({ freq: 660, dur: 0.16, gain: 0.05 })
            note({ freq: 880, dur: 0.24, gain: 0.05, at: 0.1 })
        },

        /** O "hm?" do cliente: grave, curto e sem susto. */
        hmm() {
            note({ freq: 300, dur: 0.22, type: 'sine', gain: 0.05, to: 210 })
        },

        lock() {
            noise({ dur: 0.12, freq: 340, q: 1.6, gain: 0.05 })
        },

        pin() {
            noise({ dur: 0.1, freq: 1600, q: 1.2, gain: 0.05 })
        },

        fanfare() {
            const melody = [523, 659, 784, 1047]
            melody.forEach((freq, i) => note({ freq, dur: 0.32, gain: 0.06, at: i * 0.11 }))
        },

        destroy() {
            muted = true
        },
    }
}

export type Audio = ReturnType<typeof createAudio>
