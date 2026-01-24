// Autonomous Agent for Village Management
export class NPC {
    constructor(id, x, y) {
        this.id = id
        this.x = x
        this.y = y
        this.velocity = { x: 0, y: 0 }
        this.speed = 40
        this.state = 'idle' // idle, gather, return, sleep, farm, guard
        this.target = null // {x, y, object}
        this.task = 'gather' // gather, farm, guard, rest
        this.role = 'gatherer' // For backwards compatibility
        this.inventory = {}
        this.color = `#${Math.floor(Math.random()*16777215).toString(16)}`
        
        // Animation
        this.walkTimer = 0
        this.workProgress = 0
    }

    update(dt, worldObjects, storageLocation) {
        if (this.state === 'idle') {
            // Find work
            if (this.role === 'gatherer') {
                const resource = this.findNearestResource(worldObjects, 'tree')
                if (resource) {
                    this.state = 'gather'
                    this.target = resource
                } else {
                    this.wander(dt)
                }
            }
        } else if (this.state === 'gather') {
            if (!this.target || this.target.health <= 0) {
                this.state = 'idle'
                return
            }
            
            if (this.moveTo(this.target.x, this.target.y, dt)) {
                // Arrived
                // Simulate mining
                this.target.health -= dt * 20 // Slower than player
                if (this.target.health <= 0) {
                    this.state = 'return'
                    // Add to "backpack" logic here
                }
            }
        } else if (this.state === 'return') {
            // Return to town center (0,0 or passed storage)
            const destX = storageLocation ? storageLocation.x : 0
            const destY = storageLocation ? storageLocation.y : 0
            
            if (this.moveTo(destX, destY, dt)) {
                this.state = 'idle'
            }
        }
    }

    wander(dt) {
        this.walkTimer += dt
        if (this.walkTimer > 2) {
            const angle = Math.random() * Math.PI * 2
            this.velocity.x = Math.cos(angle) * this.speed
            this.velocity.y = Math.sin(angle) * this.speed
            this.walkTimer = 0
        }
        
        this.x += this.velocity.x * dt
        this.y += this.velocity.y * dt
    }

    moveTo(tx, ty, dt) {
        const dx = tx - this.x
        const dy = ty - this.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        
        if (dist < 32) return true // Arrived
        
        // Normalize and move
        this.x += (dx / dist) * this.speed * dt
        this.y += (dy / dist) * this.speed * dt
        return false
    }

    findNearestResource(objects, type) {
        // Simplified O(N) search
        let nearest = null
        let minDist = 100000
        
        objects.forEach(obj => {
            if (obj.type === type && obj.health > 0) {
                const dist = Math.hypot(obj.x - this.x, obj.y - this.y)
                if (dist < minDist) {
                    minDist = dist
                    nearest = obj
                }
            }
        })
        return nearest
    }
}