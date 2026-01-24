import { UITheme } from './UITheme.js'

export class FloatingText {
    constructor() {
        this.texts = []
        this.nextId = 0
    }

    add(text, x, y, color = '#fff', duration = 1000) {
        this.texts.push({
            id: this.nextId++,
            text,
            x,
            y: y - 10, // Start slightly above
            color,
            duration,
            elapsed: 0,
            alpha: 1,
            velocity: -40 // Pixels per second upward
        })
    }

    update(dt) {
        this.texts = this.texts.filter(floater => {
            floater.elapsed += dt * 1000
            floater.y += floater.velocity * dt

            // Fade out in last 300ms
            if (floater.elapsed > floater.duration - 300) {
                floater.alpha = 1 - ((floater.elapsed - (floater.duration - 300)) / 300)
            }

            return floater.elapsed < floater.duration
        })
    }

    draw(renderer, camera) {
        const ctx = renderer.ctx

        this.texts.forEach(floater => {
            ctx.save()
            ctx.globalAlpha = floater.alpha
            ctx.fillStyle = floater.color
            ctx.font = `bold ${UITheme.font.size.small}px ${UITheme.font.main}`
            ctx.textAlign = 'center'
            ctx.shadowColor = 'black'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 1
            ctx.shadowOffsetY = 1
            ctx.fillText(floater.text, floater.x - camera.x, floater.y - camera.y)
            ctx.restore()
        })
    }
}
