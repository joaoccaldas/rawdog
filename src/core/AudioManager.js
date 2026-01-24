export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
        this.enabled = true;
    }

    play(type) {
        if (!this.enabled || this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.warn(e));
        }

        // Simple synth sounds based on type
        switch (type) {
            case 'ui_select':
                this.playTone(440, 'triangle', 0.1, 0.1);
                break;
            case 'ui_confirm':
                this.playTone(660, 'square', 0.1, 0.2);
                this.playTone(880, 'square', 0.2, 0.2); // Arpeggio
                break;
            case 'step':
                this.playNoise(0.05, 0.1); // Short noise for step
                break;
            case 'mine_hit':
                this.playTone(150, 'sawtooth', 0.05, 0.1);
                this.playNoise(0.1, 0.05);
                break;
            case 'mine_break':
                this.playTone(100, 'square', 0.1, 0.2);
                this.playNoise(0.2, 0.3); // Longer crunch
                break;
            case 'eat':
                this.playTone(300, 'sine', 0.1, 0.1);
                setTimeout(() => this.playTone(400, 'sine', 0.1, 0.1), 100);
                break;
            case 'damage':
                this.playTone(100, 'sawtooth', 0.1, 0.3);
                break;
        }
    }

    playTone(freq, type, startTime, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playNoise(startTime, duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.masterVolume * 0.5, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        noise.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(this.ctx.currentTime + startTime);
    }
}

export const audioManager = new AudioManager();
