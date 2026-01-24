import { UITheme } from '../ui/UITheme.js'
import { audioManager } from '../core/AudioManager.js'


export class MainMenu {
    constructor(renderer, input) {
        this.renderer = renderer
        this.input = input
        this.selectedGender = 'male' // 'male' or 'female'
        this.isActive = true
        this.onStart = null
        this.pulseTimer = 0
    }

    update(dt) {
        if (!this.isActive) return

        this.pulseTimer += dt
        const w = this.renderer.canvas.width
        const h = this.renderer.canvas.height
        const mouse = this.input.getMouse()

        // Mouse Interaction
        if (mouse.clicked) {
            // Male Option (Center at w/2 - 150, h/2. Size 160x140)
            if (mouse.x > w / 2 - 150 - 80 && mouse.x < w / 2 - 150 + 80 &&
                mouse.y > h / 2 - 70 && mouse.y < h / 2 + 70) {
                this.selectedGender = 'male'
                audioManager.play('ui_select')
            }

            // Female Option (Center at w/2 + 150, h/2)
            if (mouse.x > w / 2 + 150 - 80 && mouse.x < w / 2 + 150 + 80 &&
                mouse.y > h / 2 - 70 && mouse.y < h / 2 + 70) {
                this.selectedGender = 'female'
                audioManager.play('ui_select')
            }

            // Start Game (Bottom area)
            if (mouse.y > h - 150) {
                this.start()
            }
        }

        // Toggle selection with arrow keys
        if (this.input.keys.has('ArrowLeft') || this.input.keys.has('ArrowRight') || this.input.keys.has('KeyA') || this.input.keys.has('KeyD')) {
            this.selectedGender = this.selectedGender === 'male' ? 'female' : 'male'

            // Clear all relevant keys to prevent rapid toggling
            this.input.keys.delete('ArrowLeft')
            this.input.keys.delete('ArrowRight')
            this.input.keys.delete('KeyA')
            this.input.keys.delete('KeyD')

            audioManager.play('ui_select') // Use static import now
        }

        // Start game with Space or Enter
        if (this.input.keys.has('Space') || this.input.keys.has('Enter')) {
            this.input.keys.delete('Space')
            this.input.keys.delete('Enter')
            this.start()
        }
    }

    draw() {
        if (!this.isActive) return

        const ctx = this.renderer.ctx
        const w = this.renderer.canvas.width
        const h = this.renderer.canvas.height

        // Background
        ctx.fillStyle = UITheme.colors.backgroundDark
        ctx.fillRect(0, 0, w, h)

        // Title with nice shadow
        ctx.fillStyle = UITheme.colors.warning
        ctx.font = `bold ${UITheme.font.size.huge}px ${UITheme.font.main}`
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 4
        ctx.shadowOffsetY = 4
        ctx.fillText('THE PROGENITOR', w / 2, h / 4)

        ctx.font = `${UITheme.font.size.large}px ${UITheme.font.main}`
        ctx.fillStyle = UITheme.colors.textDim
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.fillText('300,000 BCE - The First Conscious Human', w / 2, h / 4 + 40)

        // Character selection
        ctx.font = `${UITheme.font.size.large}px ${UITheme.font.main}`
        ctx.fillStyle = UITheme.colors.textLight
        ctx.fillText('Choose Your Character', w / 2, h / 2 - 80)

        // Male option
        const maleX = w / 2 - 150
        const femaleX = w / 2 + 150
        const optionY = h / 2

        // Draw selection boxes
        this.drawCharacterOption(ctx, maleX, optionY, 'male', '♂', 'Male')
        this.drawCharacterOption(ctx, femaleX, optionY, 'female', '♀', 'Female')

        // Pulse effect for start prompt
        const alpha = 0.5 + Math.sin(this.pulseTimer * 5) * 0.5
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
        ctx.fillText('PRESS SPACE OR CLICK TO START', w / 2, h - 100)

        ctx.fillStyle = UITheme.colors.textDim
        ctx.font = `${UITheme.font.size.small}px ${UITheme.font.main}`
        ctx.fillText('← → to select', w / 2, h - 70)

        ctx.textAlign = 'left' // Reset
    }

    drawCharacterOption(ctx, x, y, type, symbol, label) {
        const isSelected = this.selectedGender === type

        if (isSelected) {
            ctx.fillStyle = type === 'male' ? UITheme.colors.info : '#ff6b9d'
            ctx.shadowBlur = 20
            ctx.shadowColor = type === 'male' ? UITheme.colors.info : '#ff6b9d'
        } else {
            ctx.fillStyle = '#222'
            ctx.shadowBlur = 0
        }

        // Card background
        ctx.fillRect(x - 80, y - 70, 160, 140)

        // Border
        ctx.strokeStyle = isSelected ? '#fff' : '#444'
        ctx.lineWidth = isSelected ? 4 : 2
        ctx.strokeRect(x - 80, y - 70, 160, 140)

        // Symbol
        ctx.fillStyle = '#fff'
        ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        ctx.font = '50px Arial'
        ctx.fillText(symbol, x, y)

        // Label
        ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
        ctx.fillText(label, x, y + 40)

        // Reset shadow
        ctx.shadowBlur = 0
    }

    start() {
        console.log(`[Menu] Starting game as ${this.selectedGender}`)
        audioManager.play('ui_confirm')
        this.isActive = false
        if (this.onStart) {
            this.onStart(this.selectedGender)
        }
    }
}
