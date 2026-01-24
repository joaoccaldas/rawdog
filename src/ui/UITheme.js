// Global UI Styling Constants and Helper Functions
export const UITheme = {
    // Color Palette
    colors: {
        primary: '#e6d6ac',      // Beige text/accents
        secondary: '#bfa57d',    // Darker beige
        background: '#3d251e',   // Dark brown panel bg
        backgroundDark: '#2a1a15', // Darker background
        border: '#6d4e2f',       // Panel border
        borderHighlight: '#8f6840',
        
        success: '#76d16d',      // Green
        warning: '#f2d057',      // Yellow/Gold
        danger: '#d64d4d',       // Red
        info: '#57c7f2',         // Blue
        
        textLight: '#ffffff',
        textDim: '#a89f91',
        textDark: '#1a120b'
    },
    
    // Font Settings
    font: {
        main: '"VT323", monospace',
        size: {
            small: 18,
            normal: 24,
            large: 32,
            title: 48,
            huge: 64
        }
    },
    
    // UI Helpers
    
    // Draw a stylized panel with border and background
    drawPanel(ctx, x, y, width, height, options = {}) {
        const { title, alpha = 0.95 } = options
        
        ctx.save()
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(x + 4, y + 4, width, height)
        
        // Background
        ctx.globalAlpha = alpha
        ctx.fillStyle = this.colors.background
        ctx.fillRect(x, y, width, height)
        
        // Border
        ctx.strokeStyle = this.colors.border
        ctx.lineWidth = 4
        ctx.strokeRect(x, y, width, height)
        
        // Inner Highlight Border (Top/Left)
        ctx.beginPath()
        ctx.strokeStyle = this.colors.borderHighlight
        ctx.lineWidth = 2
        ctx.moveTo(x + 2, y + height - 2)
        ctx.lineTo(x + 2, y + 2)
        ctx.lineTo(x + width - 2, y + 2)
        ctx.stroke()
        
        // Title Header
        if (title) {
            ctx.fillStyle = this.colors.backgroundDark
            ctx.fillRect(x + 4, y + 4, width - 8, 40)
            
            ctx.fillStyle = this.colors.warning
            ctx.font = `${this.font.size.large}px ${this.font.main}`
            ctx.textAlign = 'center'
            ctx.shadowColor = 'black'
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2
            ctx.fillText(title, x + width / 2, y + 32)
        }
        
        ctx.restore()
    },
    
    // Draw a stylized bar (Health, Hunger)
    drawBar(ctx, x, y, width, height, value, max, color, label = '') {
        const percentage = Math.max(0, Math.min(1, value / max))
        
        ctx.save()
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(x, y, width, height)
        
        // Fill
        if (percentage > 0) {
            ctx.fillStyle = color
            ctx.fillRect(x + 2, y + 2, (width - 4) * percentage, height - 4)
            
            // Shininess
            ctx.fillStyle = 'rgba(255,255,255,0.2)'
            ctx.fillRect(x + 2, y + 2, (width - 4) * percentage, (height - 4) / 2)
        }
        
        // Border
        ctx.strokeStyle = this.colors.border
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)
        
        // Label
        if (label) {
            ctx.shadowColor = 'black'
            ctx.shadowBlur = 2
            ctx.font = `bold ${this.font.size.small}px ${this.font.main}`
            ctx.fillStyle = this.colors.textLight
            ctx.textAlign = 'center'
            ctx.fillText(`${label} ${Math.floor(value)}/${max}`, x + width / 2, y + height - 4)
        }
        
        ctx.restore()
    },
    
    // Draw text with shadow
    drawText(ctx, text, x, y, color = '#fff', size = 24, align = 'left') {
        ctx.save()
        ctx.font = `${size}px ${this.font.main}`
        ctx.textAlign = align
        ctx.fillStyle = 'black'
        ctx.fillText(text, x + 2, y + 2)
        ctx.fillStyle = color
        ctx.fillText(text, x, y)
        ctx.restore()
    }
}
