/**
 * ChestUI.js - UI overlay for viewing/managing chest inventory
 */

import { UITheme } from './UITheme.js'

export class ChestUI {
    constructor() {
        this.isOpen = false
        this.currentChest = null
        this.selectedItem = null
        this.transferAmount = 1
        this.rows = 4
        this.cols = 5 // 20 items max (4 rows × 5 cols)
    }

    open(chest) {
        this.isOpen = true
        this.currentChest = chest
        this.selectedItem = null
    }

    close() {
        this.isOpen = false
        this.currentChest = null
        this.selectedItem = null
    }

    toggle(chest) {
        if (this.isOpen && this.currentChest === chest) {
            this.close()
        } else {
            this.open(chest)
        }
    }

    /**
     * Handle item click in chest UI
     */
    handleClick(playerInventory, event) {
        if (!this.isOpen || !this.currentChest) return false

        // Calculate grid position from mouse
        const panelX = 100
        const panelY = 100
        const slotWidth = 40
        const slotHeight = 40
        const padding = 10

        if (event.x < panelX || event.x > panelX + this.cols * slotWidth + padding * 2 ||
            event.y < panelY || event.y > panelY + this.rows * slotHeight + padding * 2) {
            return false // Click outside panel
        }

        // Calculate which slot was clicked
        const relX = event.x - panelX - padding
        const relY = event.y - panelY - padding
        const col = Math.floor(relX / slotWidth)
        const row = Math.floor(relY / slotHeight)

        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false

        const slotIndex = row * this.cols + col
        const items = Object.keys(this.currentChest.inventory)

        if (slotIndex < items.length) {
            this.selectedItem = items[slotIndex]
            this.transferAmount = 1
            return true
        }

        return false
    }

    /**
     * Transfer selected item to player
     */
    transferToPlayer(playerInventory) {
        if (!this.selectedItem || !this.currentChest) return

        const amount = Math.min(this.transferAmount, this.currentChest.inventory[this.selectedItem])
        if (amount > 0) {
            playerInventory.add(this.selectedItem, amount)
            this.currentChest.inventory[this.selectedItem] -= amount
            if (this.currentChest.inventory[this.selectedItem] <= 0) {
                delete this.currentChest.inventory[this.selectedItem]
                this.selectedItem = null
            }
        }
    }

    /**
     * Transfer item from player to chest
     */
    transferFromPlayer(playerInventory, itemName) {
        if (!this.currentChest) return false

        const amount = playerInventory.get(itemName)
        if (amount > 0) {
            playerInventory.remove(itemName, 1)
            if (!this.currentChest.inventory[itemName]) {
                this.currentChest.inventory[itemName] = 0
            }
            this.currentChest.inventory[itemName] += 1
            return true
        }
        return false
    }

    /**
     * Draw chest UI overlay
     */
    draw(ctx, playerInventory) {
        if (!this.isOpen || !this.currentChest) return

        const panelX = 100
        const panelY = 100
        const slotWidth = 40
        const slotHeight = 40
        const padding = 10
        const panelWidth = this.cols * slotWidth + padding * 2
        const panelHeight = this.rows * slotHeight + padding * 2 + 40 // Extra space for title

        // Draw panel background
        ctx.fillStyle = 'rgba(61, 37, 30, 0.95)' // Dark brown with transparency
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight)

        // Draw border
        ctx.strokeStyle = '#f2d057'
        ctx.lineWidth = 2
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

        // Draw title
        ctx.fillStyle = '#f2d057'
        ctx.font = '14px VT323'
        ctx.textAlign = 'left'
        ctx.fillText('CHEST STORAGE', panelX + 10, panelY + 25)

        // Draw grid slots
        const items = Object.keys(this.currentChest.inventory)
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const slotX = panelX + padding + col * slotWidth
                const slotY = panelY + padding + row * slotHeight + 30
                const slotIndex = row * this.cols + col

                // Draw slot background
                ctx.fillStyle = slotIndex < items.length ? '#5a4540' : '#3d251e'
                ctx.fillRect(slotX, slotY, slotWidth - 2, slotHeight - 2)

                // Draw slot border
                if (this.selectedItem === items[slotIndex]) {
                    ctx.strokeStyle = '#4aff4a'
                    ctx.lineWidth = 2
                } else {
                    ctx.strokeStyle = '#8b5a3c'
                    ctx.lineWidth = 1
                }
                ctx.strokeRect(slotX, slotY, slotWidth - 2, slotHeight - 2)

                // Draw item if present
                if (slotIndex < items.length) {
                    const itemName = items[slotIndex]
                    const amount = this.currentChest.inventory[itemName]

                    // Item icon/name
                    ctx.fillStyle = '#e6d6ac'
                    ctx.font = '10px VT323'
                    ctx.textAlign = 'center'
                    ctx.fillText(itemName.substring(0, 8), slotX + slotWidth / 2 - 1, slotY + 16)

                    // Amount
                    ctx.fillStyle = '#f2d057'
                    ctx.font = 'bold 10px VT323'
                    ctx.fillText(`x${amount}`, slotX + slotWidth / 2 - 1, slotY + 28)
                }
            }
        }

        // Draw instructions
        ctx.fillStyle = '#a0a0a0'
        ctx.font = '10px VT323'
        ctx.textAlign = 'left'
        ctx.fillText('[ESC] Close | Right-click item to take | E+Click to store', panelX + 10, panelY + panelHeight + 15)
    }
}

export default ChestUI
