export class Camera {
    constructor(width, height) {
        this.x = 0
        this.y = 0
        this.width = width
        this.height = height
        this.shakeIntensity = 0
        this.shakeDecay = 5 // Decay rate per second
    }

    follow(target) {
        // Center the target
        this.x = target.x - this.width / 2
        this.y = target.y - this.height / 2
    }

    shake(intensity = 10) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity)
    }

    update(dt) {
        // Decay shake over time
        if (this.shakeIntensity > 0) {
            this.shakeIntensity -= this.shakeDecay * dt
            if (this.shakeIntensity < 0) this.shakeIntensity = 0
        }
    }

    getShakeOffset() {
        if (this.shakeIntensity <= 0) return { x: 0, y: 0 }
        
        return {
            x: (Math.random() - 0.5) * this.shakeIntensity,
            y: (Math.random() - 0.5) * this.shakeIntensity
        }
    }
}
