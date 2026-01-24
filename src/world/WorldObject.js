export class WorldObject {
    constructor(x, y, type, sprite = null) {
        this.x = x
        this.y = y
        this.type = type
        this.width = 64
        this.height = 64
        this.sprite = sprite
        this.isInteractable = true
        this.isDiscovered = false
        
        // Resource properties
        this.resourceType = null
        this.resourceAmount = 0
        this.isHarvestable = false
        this.harvestCooldown = 0
    }

    update(dt) {
        if (this.harvestCooldown > 0) {
            this.harvestCooldown -= dt
        }
    }

    draw(renderer, camera, sprites) {
        const screenX = this.x - camera.x
        const screenY = this.y - camera.y

        // Draw sprite or fallback
        const spriteImg = sprites[this.type]
        if (spriteImg && spriteImg.complete) {
            renderer.drawSprite(
                spriteImg,
                0, 0, spriteImg.width, spriteImg.height,
                screenX - this.width/2, screenY - this.height, // Center on position
                this.width, this.height,
                { pixelArt: true }
            )
        } else {
            // Fallback visual based on type
            if (this.type === 'tree') {
                // Draw simple tree
                renderer.ctx.fillStyle = '#3d2914'
                renderer.ctx.fillRect(screenX - 8, screenY - 40, 16, 40) // Trunk
                renderer.ctx.fillStyle = '#2d5a2d'
                renderer.ctx.beginPath()
                renderer.ctx.arc(screenX, screenY - 55, 30, 0, Math.PI * 2) // Leaves
                renderer.ctx.fill()
            } else {
                // Default box
                renderer.ctx.fillStyle = '#654321'
                renderer.ctx.fillRect(screenX - this.width/2, screenY - this.height, this.width, this.height)
            }
        }

        // Resource amount indicator
        if (this.resourceAmount > 0) {
            renderer.ctx.fillStyle = '#fff'
            renderer.ctx.font = 'bold 12px monospace'
            renderer.ctx.textAlign = 'center'
            renderer.ctx.fillText(`x${this.resourceAmount}`, screenX, screenY - this.height - 5)
            renderer.ctx.textAlign = 'left'
        }

        // Interaction hint if close to player
        if (this.isInteractable && !this.isDiscovered) {
            renderer.ctx.fillStyle = '#FFD700'
            renderer.ctx.font = 'bold 14px monospace'
            renderer.ctx.textAlign = 'center'
            renderer.ctx.fillText('Press E', screenX, screenY - this.height - 20)
            renderer.ctx.textAlign = 'left'
        }
    }

    isNearPlayer(player, distance = 100) {
        const dx = player.x - this.x
        const dy = player.y - this.y
        return Math.sqrt(dx * dx + dy * dy) < distance
    }
    
    // Harvest resources from this object
    harvest() {
        if (this.resourceAmount <= 0 || this.harvestCooldown > 0) return null
        
        const harvested = Math.min(this.resourceAmount, 1)
        this.resourceAmount -= harvested
        this.harvestCooldown = 0.5 // Half second between harvests
        
        return { type: this.resourceType, amount: harvested }
    }
}
