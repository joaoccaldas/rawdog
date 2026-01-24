import { UITheme } from './UITheme.js'

export class NotificationManager {
    constructor(renderer) {
        this.renderer = renderer
        this.notifications = []
        this.nextId = 0
        this.maxNotifications = 3 // Limit visible notifications
    }

    show(message, duration = 3000, color = '#4aff4a') {
        // Prevent duplicate notifications with same message
        const exists = this.notifications.some(n => n.message === message)
        if (exists) return
        
        const notification = {
            id: this.nextId++,
            message,
            color,
            duration,
            elapsed: 0,
            alpha: 1
        }
        this.notifications.push(notification)
        
        // Limit total notifications
        while (this.notifications.length > this.maxNotifications) {
            this.notifications.shift()
        }
        
        console.log(`[Notification] ${message}`)
    }

    update(dt) {
        this.notifications = this.notifications.filter(notif => {
            notif.elapsed += dt * 1000

            // Fade out in last 500ms
            if (notif.elapsed > notif.duration - 500) {
                notif.alpha = 1 - ((notif.elapsed - (notif.duration - 500)) / 500)
            }

            return notif.elapsed < notif.duration
        })
    }

    draw() {
        const ctx = this.renderer.ctx
        const w = this.renderer.canvas.width
        const centerX = w / 2
        let y = 100

        this.notifications.forEach(notif => {
            ctx.save()
            ctx.globalAlpha = notif.alpha

            // Background
            UITheme.drawPanel(ctx, centerX - 200, y - 30, 400, 60, { alpha: notif.alpha * 0.9 })

            // Text
            ctx.fillStyle = notif.color // Keep original color but maybe map to theme?
            // Actually let's use theme font
            ctx.font = `bold ${UITheme.font.size.normal}px ${UITheme.font.main}`
            ctx.textAlign = 'center'
            ctx.shadowColor = 'black'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 1
            ctx.shadowOffsetY = 1
            ctx.fillText(notif.message, centerX, y + 10)

            ctx.restore()
            y += 70
        })

        ctx.textAlign = 'left' // Reset
    }
}
