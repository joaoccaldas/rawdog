import { NPC } from '../entities/NPC.js'

// Village population and NPC management
export class PopulationSystem {
    constructor(world) {
        this.world = world
        this.villagers = [] // Stores NPC objects
        this.maxPopulation = 5
        this.foodConsumptionRate = 0.1 // Food per villager per second
        this.spawnTimer = 0
        this.spawnInterval = 30 // Spawn new villager every 30 seconds if food available
    }

    getPopulation() {
        return this.villagers.length
    }

    draw(renderer, camera) {
        this.villagers.forEach(npc => {
            const screenX = npc.x - camera.x
            const screenY = npc.y - camera.y
            
            // Simple visual representation
            renderer.ctx.fillStyle = npc.color
            renderer.ctx.fillRect(screenX, screenY, 32, 32)
            
            // Eyes
            renderer.ctx.fillStyle = '#000'
            renderer.ctx.fillRect(screenX + 8, screenY + 8, 4, 4)
            renderer.ctx.fillRect(screenX + 20, screenY + 8, 4, 4)

            // Name tag
            renderer.ctx.fillStyle = '#fff'
            renderer.ctx.font = '10px monospace'
            renderer.ctx.textAlign = 'center'
            renderer.ctx.fillText(`Villager ${npc.id}`, screenX + 16, screenY - 5)
        })
    }

    update(dt, inventory, worldObjects) {
        // Update NPCs AI
        this.villagers.forEach(npc => {
            npc.update(dt, worldObjects)
        })

        // Food consumption check
        const foodNeeded = this.villagers.length * this.foodConsumptionRate * dt
        const availableFood = (inventory.get('COOKED_MEAT') || 0) + (inventory.get('RAW_MEAT') || 0) * 0.5
        
        if (availableFood >= foodNeeded) {
            // Consume minimal food (simplified)
            if (this.villagers.length > 0 && Math.random() < 0.1) {
                if (inventory.get('COOKED_MEAT') > 0) {
                    inventory.remove('COOKED_MEAT', 1)
                }
            }
            
            // Growth - spawn new villagers
            if (this.villagers.length < this.maxPopulation) {
                this.spawnTimer += dt
                if (this.spawnTimer > this.spawnInterval) {
                    this.spawnNPC()
                    this.spawnTimer = 0
                }
            }
        } else {
            // Starvation - villagers leave
            if (this.villagers.length > 0 && Math.random() < 0.01 * dt) {
                this.villagers.pop()
                console.log(`[Pop] Villager left due to hunger. Remaining: ${this.villagers.length}`)
            }
        }
    }

    spawnNPC() {
        if (this.villagers.length >= this.maxPopulation) return
        
        const x = 50 * 32 + (Math.random() * 200 - 100)
        const y = 50 * 32 + (Math.random() * 200 - 100)
        
        const npc = new NPC(this.villagers.length + 1, x, y)
        this.villagers.push(npc)
        console.log(`[Pop] New villager arrived! Total: ${this.villagers.length}`)
    }
}
