export class ParticleSystem {
    constructor() {
        this.particles = []
    }

    emit(x, y, type, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200 - 100,
                life: 1.0,
                maxLife: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 4,
                color: this.getColor(type),
                gravity: 300
            })
        }
    }

    getColor(type) {
        const colors = {
            stone: ['#808080', '#A9A9A9', '#696969'],
            grass: ['#90EE90', '#228B22', '#32CD32'],
            wood: ['#8B4513', '#A0522D', '#D2691E'],
            blood: ['#8B0000', '#DC143C', '#FF0000'],
            sparkle: ['#FFD700', '#FFA500', '#FFFF00'],
            dust: ['#D2B48C', '#F5DEB3', '#DEB887']
        }
        const palette = colors[type] || colors.dust
        return palette[Math.floor(Math.random() * palette.length)]
    }

    update(dt) {
        this.particles = this.particles.filter(p => {
            p.vy += p.gravity * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            p.life -= dt / p.maxLife
            return p.life > 0
        })
    }

    draw(renderer, camera) {
        this.particles.forEach(p => {
            const screenX = p.x - camera.x
            const screenY = p.y - camera.y

            renderer.ctx.save()
            renderer.ctx.globalAlpha = p.life
            renderer.ctx.fillStyle = p.color
            renderer.ctx.fillRect(screenX, screenY, p.size, p.size)
            renderer.ctx.restore()
        })
    }

    clear() {
        this.particles = []
    }
}
