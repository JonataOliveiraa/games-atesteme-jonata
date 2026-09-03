import Phaser from 'phaser'
import { ISLAND } from '../data/island'
import type { Code, Word } from '../types'

const BEAT_GAP = 0.22

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

    function noise(o: {
        dur: number
        from: number
        to: number
        gain?: number
        delay?: number
        q?: number
    }) {
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
        band.Q.value = o.q ?? 1.1
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

    const drumHit = (delay: number) => {
        note({ freq: 178, to: 56, dur: 0.3, type: 'sine', gain: 0.15, cutoff: 620, delay })
        noise({ dur: 0.05, from: 1900, to: 620, gain: 0.035, delay })
    }

    const voices = {
        chocalho() {
            noise({ dur: 0.09, from: 6200, to: 4200, gain: 0.05, q: 2.2 })
            noise({ dur: 0.09, from: 5400, to: 3800, gain: 0.045, q: 2.2, delay: 0.07 })
            noise({ dur: 0.12, from: 5000, to: 3200, gain: 0.04, q: 2.2, delay: 0.14 })
        },
        splash() {
            noise({ dur: 0.32, from: 2400, to: 300, gain: 0.075, q: 0.9 })
            note({ freq: 540, to: 170, dur: 0.28, type: 'sine', gain: 0.05, cutoff: 900 })
        },
        tambor() {
            drumHit(0)
        },
    }

    return {
        setMuted(value: boolean) {
            muted = value
        },

        beats(count: number) {
            for (let i = 0; i < count; i++) drumHit(i * BEAT_GAP)
            return Math.round(count * BEAT_GAP * 1000) + 120
        },

        speak(word: Word, code: Code) {
            if (code === 'batidas') return this.beats(ISLAND[word].beats)
            if (code === 'som') {
                voices[ISLAND[word].instrument]()
                return 340
            }
            note({ freq: 640, to: 880, dur: 0.08, type: 'triangle', gain: 0.05 })
            return 220
        },

        tap() {
            note({ freq: 720, dur: 0.035, type: 'triangle', gain: 0.05 })
        },

        pick() {
            note({ freq: 540, to: 780, dur: 0.09, type: 'triangle', gain: 0.06 })
        },

        open() {
            noise({ dur: 0.18, from: 900, to: 260, gain: 0.05 })
            ;[523, 659, 784].forEach((freq, i) => {
                note({ freq, dur: 0.2, type: 'triangle', gain: 0.075, delay: 0.06 + i * 0.08 })
            })
        },

        streak(count: number) {
            const base = 660 + Math.min(count, 4) * 90
            ;[base, base * 1.25, base * 1.5].forEach((freq, i) => {
                note({ freq, dur: 0.14, type: 'triangle', gain: 0.055, delay: i * 0.06 })
            })
        },

        wrong() {
            noise({ dur: 0.22, from: 1500, to: 320, gain: 0.045 })
            note({ freq: 190, to: 88, dur: 0.3, type: 'square', gain: 0.05, cutoff: 700 })
        },

        fanfare() {
            [523, 659, 784, 1047].forEach((freq, i) => {
                note({ freq, dur: 0.22, type: 'triangle', gain: 0.1, delay: i * 0.11 })
            })
            note({ freq: 1047, dur: 0.9, type: 'sine', gain: 0.05, delay: 0.44 })
        },
    }
}
