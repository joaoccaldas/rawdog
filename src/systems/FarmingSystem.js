// Farming, Regrowth and Ecology
export class FarmingSystem {
    constructor(world, inventory) {
        this.world = world
        this.inventory = inventory
        this.crops = [] // {x, y, type, stage, timer, maxStage}
        this.growthSpeed = 1.0 // Multiplier
    }

    update(dt) {
        const finished = []
        
        this.crops.forEach(crop => {
            crop.timer += dt * this.growthSpeed
            
            // Growth logic (approx 10 seconds per stage)
            if (crop.timer > 10 && crop.stage < crop.maxStage) {
                crop.timer = 0
                crop.stage++
            }
        })
    }

    plant(x, y, seedType) {
        // Validation handled by tool system mostly, but double check
        // Determine tile coords
        const tileX = Math.floor(x / 32)
        const tileY = Math.floor(y / 32)
        
        // Cannot plant on same tile
        if (this.crops.some(c => c.tileX === tileX && c.tileY === tileY)) return false
        
        // Add crop entity
        this.crops.push({
            tileX,
            tileY,
            x: tileX * 32 + 16,
            y: tileY * 32 + 16,
            type: seedType, // 'WHEAT_SEED' -> 'WHEAT'
            stage: 0,
            timer: 0,
            maxStage: 3
        })
        
        return true
    }

    harvest(x, y) {
        const dist = 32
        const cropIndex = this.crops.findIndex(c => Math.abs(c.x - x) < dist && Math.abs(c.y - y) < dist)
        
        if (cropIndex !== -1) {
            const crop = this.crops[cropIndex]
            if (crop.stage === crop.maxStage) {
                // Calculate yield: 2-3 wheat per crop
                const yieldAmount = 2 + Math.floor(Math.random() * 2)
                
                // Remove crop
                this.crops.splice(cropIndex, 1)
                return yieldAmount // Return amount harvested
            }
        }
        return 0 // Return 0 if nothing harvested
    }

    draw(renderer, camera) {
        const ctx = renderer.ctx
        
        this.crops.forEach(crop => {
            const sx = crop.x - camera.x
            const sy = crop.y - camera.y // Offset for ground alignment
            
            // Draw simple representation based on stage
            // Stage 0: Seeds
            // Stage 1: Sprout
            // Stage 2: Tall
            // Stage 3: Mature
            
            const size = 10 + (crop.stage * 6)
            
            ctx.fillStyle = crop.stage === crop.maxStage ? '#d4b64a' : '#5ba649' // Gold if ready, green if growing
            // ctx.fillRect(sx - size/2, sy - size/2, size, size)
            
            // Draw pseudo-sprite
            ctx.beginPath()
            ctx.moveTo(sx, sy)
            ctx.lineTo(sx, sy - size)
            ctx.lineWidth = 4
            ctx.strokeStyle = ctx.fillStyle
            ctx.stroke()
            
            // Leaves
            if (crop.stage > 0) {
                ctx.beginPath()
                ctx.arc(sx, sy - size, size/2, 0, Math.PI, true)
                ctx.fill()
            }
        })
    }
}