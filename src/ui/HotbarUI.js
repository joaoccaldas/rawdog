import { UITheme } from './UITheme.js'

export class HotbarUI {
    constructor(inventory, toolSystem, renderer, input) {
        this.inventory = inventory
        this.toolSystem = toolSystem
        this.renderer = renderer
        this.input = input

        this.slotSize = 50
        this.gap = 4
        this.slots = 9 // 1-9
    }

    update(dt) {
        // Handle number keys
        for (let i = 1; i <= 9; i++) {
            if (this.input.keys.has(i.toString())) {
                this.selectSlot(i - 1)
                this.input.keys.delete(i.toString())
            }
        }
    }

    selectSlot(index) {
        const slot = this.inventory.slots[index]
        if (slot) {
            this.toolSystem.equipTool(slot.id)
        } else {
            this.toolSystem.equipTool('HAND')
        }
    }

    draw() {
        const ctx = this.renderer.ctx
        const screenW = this.renderer.canvas.width
        const screenH = this.renderer.canvas.height

        const width = this.slots * (this.slotSize + this.gap) + 20
        const startX = (screenW - width) / 2
        const startY = screenH - this.slotSize - 20

        UITheme.drawPanel(ctx, startX, startY, width, this.slotSize + 20, { alpha: 0.9 })

        for (let i = 0; i < this.slots; i++) {
            const x = startX + 10 + i * (this.slotSize + this.gap)
            const y = startY + 10

            const slot = this.inventory.slots[i] // Map first 9 slots to hotbar
            const isActive = false // TODO: Track active hotbar slot index, or infer from equipped tool
            // Inferring from equipped tool is tricky if duplicate items exist. 
            // Better to track selectedHotbarIndex in this class.

            // Draw Slot
            ctx.fillStyle = 'rgba(0,0,0,0.3)'
            ctx.fillRect(x, y, this.slotSize, this.slotSize)

            ctx.strokeStyle = UITheme.colors.border
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, this.slotSize, this.slotSize)

            // Key shortcut
            ctx.fillStyle = '#aaa'
            ctx.font = '10px monospace'
            ctx.textAlign = 'left'
            ctx.fillText(i + 1, x + 2, y + 10)

            // Item
            if (slot) {
                // Reuse icon logic or simplified
                let color = '#fff'
                if (slot.id === this.toolSystem.equippedTool) {
                    ctx.strokeStyle = '#fff'
                    ctx.lineWidth = 2
                    ctx.strokeRect(x, y, this.slotSize, this.slotSize)
                }

                ctx.fillStyle = color
                ctx.font = '20px Arial'
                ctx.textAlign = 'center'
                ctx.fillText(slot.id.substring(0, 2), x + this.slotSize / 2, y + 32)

                if (slot.count > 1) {
                    ctx.fillStyle = '#fff'
                    ctx.font = '12px monospace'
                    ctx.textAlign = 'right'
                    ctx.fillText(slot.count, x + this.slotSize - 2, y + this.slotSize - 2)
                }
            }
        }
    }
}
