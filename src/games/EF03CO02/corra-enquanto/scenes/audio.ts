import Phaser from 'phaser'

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
        band.Q.value = 1.3
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

    let loop: { osc: OscillatorNode; amp: GainNode } | null = null
    let foot = 0

    const stopLoop = () => {
        if (!loop) return
        const audio = ctx()
        const now = audio?.currentTime ?? 0
        try {
            loop.amp.gain.cancelScheduledValues(now)
            loop.amp.gain.setValueAtTime(loop.amp.gain.value, now)
            loop.amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
            loop.osc.stop(now + 0.12)
        } catch {
            /* o contexto já morreu */
        }
        loop = null
    }

    return {
        setMuted(value: boolean) {
            muted = value
            if (value) stopLoop()
        },

        /** O som do laço rodando: começa no dedo e para no dedo. */
        loopStart() {
            if (loop) return
            const audio = ctx()
            if (!audio) return
            const osc = audio.createOscillator()
            const amp = audio.createGain()
            const low = audio.createBiquadFilter()
            low.type = 'lowpass'
            low.frequency.setValueAtTime(900, audio.currentTime)
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(196, audio.currentTime)
            amp.gain.setValueAtTime(0.0001, audio.currentTime)
            amp.gain.exponentialRampToValueAtTime(0.045, audio.currentTime + 0.09)
            osc.connect(amp)
            amp.connect(low)
            low.connect(audio.destination)
            osc.start()
            loop = { osc, amp }
        },

        loopStop: stopLoop,

        step() {
            foot = 1 - foot
            noise({ dur: 0.06, from: 760 + foot * 220, to: 200, gain: 0.022 })
        },

        /** A condição virou. Precisa ser o som mais audível do jogo. */
        change() {
            note({ freq: 880, dur: 0.16, type: 'square', gain: 0.07, cutoff: 2200 })
            note({ freq: 587, dur: 0.24, type: 'square', gain: 0.07, cutoff: 1800, delay: 0.15 })
        },

        reflex() {
            note({ freq: 990, dur: 0.12, type: 'triangle', gain: 0.08 })
            note({ freq: 1480, dur: 0.16, type: 'sine', gain: 0.06, delay: 0.09 })
        },

        pick() {
            note({ freq: 620, to: 880, dur: 0.1, type: 'triangle', gain: 0.06 })
        },

        wrong() {
            note({ freq: 300, to: 150, dur: 0.3, type: 'square', gain: 0.06, cutoff: 700 })
            noise({ dur: 0.26, from: 700, to: 160, gain: 0.04 })
        },

        unlock() {
            note({ freq: 420, to: 760, dur: 0.2, type: 'triangle', gain: 0.06 })
        },

        arrive() {
            [659, 831, 988].forEach((freq, i) => {
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.08, delay: i * 0.08 })
            })
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
