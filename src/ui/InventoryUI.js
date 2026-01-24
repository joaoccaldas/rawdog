import { UITheme } from './UITheme.js'

export class InventoryUI {
    constructor(inventory, renderer, input) {
        this.inventory = inventory
        this.renderer = renderer
        this.input = input
        this.isOpen = false
        this.draggedSlot = null // Index of slot currently being dragged
        this.hoveredSlot = null

        // Layout
        this.cols = 6
        this.rows = 5
        this.slotSize = 50
        this.gap = 8
        this.padding = 20

        this.width = this.padding * 2 + this.cols * (this.slotSize + this.gap) - this.gap
        this.height = this.padding * 2 + this.rows * (this.slotSize + this.gap) - this.gap
    }

    toggle() {
        this.isOpen = !this.isOpen
    }

    update(dt) {
        if (!this.isOpen) return

        const mouse = this.input.getMouse()
        const screenW = this.renderer.canvas.width
        const screenH = this.renderer.canvas.height

        const startX = (screenW - this.width) / 2
        const startY = (screenH - this.height) / 2

        // Check hover
        this.hoveredSlot = null
        if (mouse.x >= startX && mouse.x <= startX + this.width &&
            mouse.y >= startY && mouse.y <= startY + this.height) {

            const relX = mouse.x - startX - this.padding
            const relY = mouse.y - startY - this.padding

            const col = Math.floor(relX / (this.slotSize + this.gap))
            const row = Math.floor(relY / (this.slotSize + this.gap))

            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                this.hoveredSlot = row * this.cols + col
            }
        }

        // Drag Start
        if (mouse.clicked && this.hoveredSlot !== null) {
            if (this.inventory.slots[this.hoveredSlot]) {
                this.draggedSlot = this.hoveredSlot
            }
        }

        // Drag End
        if (!mouse.down && this.draggedSlot !== null) {
            if (this.hoveredSlot !== null && this.hoveredSlot !== this.draggedSlot) {
                this.inventory.swap(this.draggedSlot, this.hoveredSlot)
            }
            this.draggedSlot = null
        }
    }

    draw() {
        if (!this.isOpen) return

        const ctx = this.renderer.ctx
        const screenW = this.renderer.canvas.width
        const screenH = this.renderer.canvas.height

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, screenW, screenH)

        const startX = (screenW - this.width) / 2
        const startY = (screenH - this.height) / 2

        // Main Panel
        UITheme.drawPanel(ctx, startX, startY, this.width, this.height, { title: 'INVENTORY' })

        // Slots
        for (let i = 0; i < this.inventory.size; i++) {
            const col = i % this.cols
            const row = Math.floor(i / this.cols)

            const x = startX + this.padding + col * (this.slotSize + this.gap)
            const y = startY + this.padding + row * (this.slotSize + this.gap) + 40 // +40 for title offset

            const slot = this.inventory.slots[i]
            const isHovered = this.hoveredSlot === i
            const isDragging = this.draggedSlot === i

            // Slot BG
            ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(x, y, this.slotSize, this.slotSize)

            ctx.strokeStyle = UITheme.colors.border
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, this.slotSize, this.slotSize)

            // Item
            if (slot && !isDragging) {
                this.drawItem(ctx, slot, x, y)
            }
        }

        // Draw Dragged Item
        if (this.draggedSlot !== null) {
            const mouse = this.input.getMouse()
            const slot = this.inventory.slots[this.draggedSlot]
            if (slot) {
                this.drawItem(ctx, slot, mouse.x - this.slotSize / 2, mouse.y - this.slotSize / 2)
            }
        }

        // Tooltip
        if (this.hoveredSlot !== null && !this.draggedSlot) {
            const slot = this.inventory.slots[this.hoveredSlot]
            if (slot) {
                const mouse = this.input.getMouse()
                UITheme.drawText(ctx, slot.id, mouse.x + 15, mouse.y, '#fff', 16)
            }
        }
    }

    drawItem(ctx, slot, x, y) {
        // Icon (Text for now, can swap to sprites)
        // Check if item has specific color mapping
        let color = '#fff'
        if (slot.id.includes('MEAT')) color = '#d64d4d'
        if (slot.id.includes('wood') || slot.id === 'STICK') color = '#dcb159'
        if (slot.id === 'STONE') color = '#aaa'

        ctx.fillStyle = color
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        // Simple letter for icon
        const icon = slot.id.substring(0, 2)
        ctx.fillText(icon, x + this.slotSize / 2, y + 32)

        // Count
        if (slot.count > 1) {
            ctx.fillStyle = '#fff'
            ctx.font = '12px monospace'
            ctx.textAlign = 'right'
            ctx.fillText(slot.count, x + this.slotSize - 2, y + this.slotSize - 2)
        }
    }
}
