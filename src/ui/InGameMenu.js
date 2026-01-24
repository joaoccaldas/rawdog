import { UITheme } from './UITheme.js'

export class InGameMenu {
    constructor(renderer, input) {
        this.renderer = renderer
        this.input = input
        this.isOpen = false
        this.selectedTab = 'tutorial' // 'tutorial', 'settings', 'save'
        this.tabs = ['Tutorial', 'Settings', 'Save/Load']
        this.selectedTabIndex = 0
    }

    toggle() {
        this.isOpen = !this.isOpen
    }

    update(dt) {
        if (!this.isOpen) return

        // Tab navigation with arrow keys
        if (this.input.keys.has('ArrowLeft')) {
            this.input.keys.delete('ArrowLeft')
            this.selectedTabIndex = Math.max(0, this.selectedTabIndex - 1)
        }
        if (this.input.keys.has('ArrowRight')) {
            this.input.keys.delete('ArrowRight')
            this.selectedTabIndex = Math.min(this.tabs.length - 1, this.selectedTabIndex + 1)
        }

        // Close with ESC
        if (this.input.keys.has('Escape')) {
            this.input.keys.delete('Escape')
            this.toggle()
        }
    }

    draw() {
        if (!this.isOpen) return

        const ctx = this.renderer.ctx
        const canvas = this.renderer.canvas

        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Main panel
        const panelW = 700
        const panelH = 500
        const panelX = (canvas.width - panelW) / 2
        const panelY = (canvas.height - panelH) / 2

        UITheme.drawPanel(ctx, panelX, panelY, panelW, panelH, { title: 'GAME MENU' })

        // Tabs
        const tabY = panelY + 60
        const tabWidth = 220
        this.tabs.forEach((tab, idx) => {
            const tabX = panelX + 15 + idx * (tabWidth + 5)
            const isSelected = idx === this.selectedTabIndex

            ctx.fillStyle = isSelected ? UITheme.colors.primary : 'rgba(50, 50, 50, 0.7)'
            ctx.fillRect(tabX, tabY, tabWidth, 40)
            
            ctx.strokeStyle = isSelected ? UITheme.colors.secondary : UITheme.colors.border
            ctx.lineWidth = 2
            ctx.strokeRect(tabX, tabY, tabWidth, 40)

            ctx.fillStyle = isSelected ? UITheme.colors.backgroundDark : UITheme.colors.textDim
            ctx.font = `bold ${UITheme.font.size.normal}px ${UITheme.font.main}`
            ctx.textAlign = 'center'
            ctx.fillText(tab, tabX + tabWidth/2, tabY + 28)
        })
        ctx.textAlign = 'left'

        // Content area
        const contentY = tabY + 50
        const contentH = panelH - 140

        // Draw content based on selected tab
        if (this.selectedTabIndex === 0) {
            this.drawTutorial(ctx, panelX + 20, contentY, panelW - 40, contentH)
        } else if (this.selectedTabIndex === 1) {
            this.drawSettings(ctx, panelX + 20, contentY, panelW - 40, contentH)
        } else {
            this.drawSaveLoad(ctx, panelX + 20, contentY, panelW - 40, contentH)
        }

        // Footer
        ctx.fillStyle = '#AAA'
        ctx.font = `${UITheme.font.size.small}px ${UITheme.font.main}`
        ctx.fillText('Press ESC to close | Use ← → to switch tabs', panelX + 20, panelY + panelH - 20)
    }

    drawTutorial(ctx, x, y, w, h) {
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 16px monospace'
        ctx.fillText('🎮 HOW TO PLAY', x, y + 20)

        const sections = [
            { title: '⛏️ Mining', text: 'Click on grass, stone, or trees to gather resources.' },
            { title: '🔧 Crafting', text: 'Press C to open crafting menu. Use ↑↓ to navigate, SPACE to craft.' },
            { title: '🛠️ Tools', text: 'Press 1-5 to switch between tools. Better tools mine harder materials.' },
            { title: '📜 Quests', text: 'Follow quests on the left to progress through history.' },
            { title: '⚡ Skills', text: 'Gain XP in Mining, Crafting, and Building to level up.' },
            { title: '🎯 Goal', text: 'Evolve from 300,000 BCE to modern civilization!' }
        ]

        let offsetY = 50
        sections.forEach(section => {
            ctx.fillStyle = '#FFD700'
            ctx.font = 'bold 13px monospace'
            ctx.fillText(section.title, x, y + offsetY)

            ctx.fillStyle = '#CCC'
            ctx.font = '12px monospace'
            this.wrapText(ctx, section.text, x + 20, y + offsetY + 18, w - 40, 16)

            offsetY += 50
        })
    }

    drawSettings(ctx, x, y, w, h) {
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 16px monospace'
        ctx.fillText('⚙️ SETTINGS', x, y + 20)

        ctx.fillStyle = '#AAA'
        ctx.font = '12px monospace'
        ctx.fillText('Settings coming soon...', x, y + 60)
        ctx.fillText('• Volume controls', x, y + 90)
        ctx.fillText('• Graphics quality', x, y + 110)
        ctx.fillText('• Key bindings', x, y + 130)
    }

    drawSaveLoad(ctx, x, y, w, h) {
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 16px monospace'
        ctx.fillText('💾 SAVE / LOAD', x, y + 20)

        ctx.fillStyle = '#AAA'
        ctx.font = '12px monospace'
        ctx.fillText('Save/Load system coming soon...', x, y + 60)
        ctx.fillText('Progress will auto-save to browser localStorage.', x, y + 90)
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ')
        let line = ''
        let currentY = y

        words.forEach(word => {
            const testLine = line + word + ' '
            const metrics = ctx.measureText(testLine)

            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, x, currentY)
                line = word + ' '
                currentY += lineHeight
            } else {
                line = testLine
            }
        })
        ctx.fillText(line, x, currentY)
    }
}
