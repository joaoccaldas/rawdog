import { UITheme } from '../ui/UITheme.js'

export class WeatherSystem {
    constructor(renderer) {
        this.renderer = renderer
        this.weatherTypes = ['sunny', 'rain', 'storm', 'snow']
        this.currentWeather = 'sunny'
        this.intensity = 0 // 0 to 1
        this.timer = 0
        this.rainParticles = []
        
        // Lighting
        this.globalLight = 1.0 // 1.0 = Day, 0.3 = Night
        // Start at noon (0.5 position in day cycle = brightest)
        this.dayCycleTimer = 300 * 1000 // Start at midday
        this.dayDuration = 600 * 1000 // 10 minutes per full day
        this.lightSources = [] // {x, y, radius, color, flicker}
    }

    update(dt, player) {
        // Day/Night Cycle
        this.dayCycleTimer += dt * 1000
        const cyclePos = (this.dayCycleTimer % this.dayDuration) / this.dayDuration
        
        // Cosine wave for smooth day/night transition
        // 0.5 is noon (1.0 light), 0.0/1.0 is midnight (0.3 light for visibility)
        this.globalLight = 0.3 + 0.7 * Math.max(0, Math.sin(cyclePos * Math.PI))
        
        // Weather Change Logic
        this.timer += dt
        if (this.timer > 60 && Math.random() < 0.001) { // Chance to change every frame after 1 min
            this.changeWeather()
            this.timer = 0
        }

        // Update Particles
        if (this.currentWeather === 'rain' || this.currentWeather === 'storm') {
            this.spawnRain(player)
        }
        
        this.updateParticles(dt)
    }

    changeWeather() {
        const r = Math.random()
        if (r < 0.6) this.currentWeather = 'sunny'
        else if (r < 0.85) this.currentWeather = 'rain'
        else if (r < 0.95) this.currentWeather = 'storm'
        else this.currentWeather = 'snow'
        
        console.log(`[Weather] Changed to ${this.currentWeather}`)
    }

    spawnRain(player) {
        // Spawn rain around camera view
        for (let i = 0; i < 5; i++) {
            this.rainParticles.push({
                x: player.x - 400 + Math.random() * 800,
                y: player.y - 300 + Math.random() * 600,
                vx: -2 + Math.random() * 1,
                vy: 10 + Math.random() * 5,
                life: 1.0
            })
        }
    }

    updateParticles(dt) {
        this.rainParticles.forEach(p => {
            p.x += p.vx
            p.y += p.vy
            p.life -= dt
        })
        this.rainParticles = this.rainParticles.filter(p => p.life > 0)
    }

    draw(camera) {
        const ctx = this.renderer.ctx
        const { width, height } = this.renderer.canvas

        // 1. Draw Weather Particles
        if (this.currentWeather === 'rain' || this.currentWeather === 'storm') {
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)'
            ctx.lineWidth = 1
            ctx.beginPath()
            this.rainParticles.forEach(p => {
                const screenX = p.x - camera.x
                const screenY = p.y - camera.y
                ctx.moveTo(screenX, screenY)
                ctx.lineTo(screenX + p.vx * 2, screenY + p.vy * 2)
            })
            ctx.stroke()
        }

        // 2. Immersive Lighting Overlay (Fog of War / Night)
        // Only apply darkness when it's actually dark (night time or storm)
        if (this.globalLight < 0.5) {
            let darkness = (1.0 - this.globalLight) * 0.5 // 50% of calculated darkness
            if (this.currentWeather === 'storm') darkness = Math.min(0.6, darkness + 0.1)
            
            // Create offscreen buffer or just draw large rect with composite operation
            // For performance in this 2D engine, we'll use a radial gradient hack on the player
            // But a full "darkness" mask is better
            
            ctx.save()
            ctx.globalCompositeOperation = 'source-over'
            ctx.fillStyle = `rgba(10, 5, 20, ${Math.min(0.95, darkness)})`
            ctx.fillRect(0, 0, width, height)
            
            // Cut out holes for lights
            ctx.globalCompositeOperation = 'destination-out'
            
            // Player Light
            this.drawLightHole(ctx, width/2, height/2, 150) // Player is always center screen
            
            // Other lights (torches, etc)
            this.lightSources.forEach(src => {
                this.drawLightHole(ctx, src.x - camera.x, src.y - camera.y, src.radius)
            })
            
            ctx.restore()
        }
    }
    
    drawLightHole(ctx, x, y, radius) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
        g.addColorStop(0, 'rgba(0,0,0,1)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
    }
    
    // UI Widget
    drawUI(ctx, x, y) {
        // Temperature/Weather icon
        const icons = { sunny: '☀️', rain: '🌧️', storm: '⚡', snow: '❄️' }
        const currentIcon = icons[this.currentWeather]
        
        ctx.font = '24px Arial'
        ctx.fillStyle = '#fff'
        ctx.shadowColor = 'black'; ctx.shadowBlur = 2;
        ctx.fillText(currentIcon, x, y)
        
        // Clock/Day Cycle
        const hour = Math.floor((this.dayCycleTimer % this.dayDuration) / (this.dayDuration) * 24)
        const timeStr = `${hour.toString().padStart(2, '0')}:00`
        ctx.font = `18px ${UITheme.font.main}`
        ctx.fillStyle = UITheme.colors.warning
        ctx.fillText(timeStr, x + 30, y)
    }
}