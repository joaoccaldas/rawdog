/**
 * ChestSystem.js - Manages storage chests in the world
 * Chests are placed with building system and store items
 */

export class ChestSystem {
    constructor() {
        this.chests = [] // Array of chest objects { x, y, inventory: {...} }
        this.maxChestCapacity = 20 // Max items per stack
    }

    /**
     * Place a chest at position
     */
    place(x, y) {
        // Check if chest already exists nearby
        const exists = this.chests.some(c => Math.abs(c.x - x) < 32 && Math.abs(c.y - y) < 32)
        if (exists) return false

        this.chests.push({
            x: Math.floor(x / 32) * 32,
            y: Math.floor(y / 32) * 32,
            inventory: {}
        })
        return true
    }

    /**
     * Find chest at position
     */
    getChestAt(x, y, range = 50) {
        const tileX = Math.floor(x / 32)
        const tileY = Math.floor(y / 32)
        
        return this.chests.find(c => {
            const cTileX = c.x / 32
            const cTileY = c.y / 32
            return Math.abs(cTileX - tileX) < 2 && Math.abs(cTileY - tileY) < 2
        })
    }

    /**
     * Add item to chest
     */
    add(chest, itemName, amount = 1) {
        if (!chest.inventory[itemName]) {
            chest.inventory[itemName] = 0
        }
        chest.inventory[itemName] += amount
    }

    /**
     * Remove item from chest
     */
    remove(chest, itemName, amount = 1) {
        if (!chest.inventory[itemName]) return false
        
        const available = chest.inventory[itemName]
        if (available < amount) return false
        
        chest.inventory[itemName] -= amount
        if (chest.inventory[itemName] <= 0) {
            delete chest.inventory[itemName]
        }
        return true
    }

    /**
     * Get item count in chest
     */
    get(chest, itemName) {
        return chest.inventory[itemName] || 0
    }

    /**
     * Draw all chests
     */
    draw(renderer, camera, world) {
        const ctx = renderer.ctx
        
        this.chests.forEach(chest => {
            const sx = chest.x - camera.x
            const sy = chest.y - camera.y
            
            // Only draw if visible
            if (sx < -50 || sx > renderer.canvas.width + 50 ||
                sy < -50 || sy > renderer.canvas.height + 50) return
            
            // Draw chest block
            ctx.fillStyle = '#8b5a3c' // Brown wood color
            ctx.fillRect(sx, sy, 32, 32)
            
            // Draw chest lid
            ctx.fillStyle = '#a0644e' // Darker brown
            ctx.fillRect(sx, sy, 32, 16)
            
            // Draw gold lock
            ctx.fillStyle = '#f2d057'
            ctx.fillRect(sx + 13, sy + 6, 6, 10)
            
            // Count of items in chest
            const itemCount = Object.keys(chest.inventory).length
            if (itemCount > 0) {
                ctx.fillStyle = '#ffffff'
                ctx.font = '12px Arial'
                ctx.textAlign = 'center'
                ctx.fillText(itemCount.toString(), sx + 16, sy + 28)
            }
        })
    }

    /**
     * Clear all chests (for new game)
     */
    clear() {
        this.chests = []
    }
}

export default ChestSystem
