export class Enemy {
    constructor(x, y, type = 'WOLF') {
        this.x = x
        this.y = y
        this.width = 64
        this.height = 64
        this.type = type

        // Enemy stats based on type
        const stats = this.getStats(type)
        this.maxHealth = stats.health
        this.health = stats.health
        this.damage = stats.damage
        this.speed = stats.speed
        this.aggroRange = stats.aggroRange
        this.attackRange = stats.attackRange
        this.attackCooldown = stats.attackCooldown
        this.loot = stats.loot

        // AI state
        this.state = 'idle' // idle, chase, attack, dead
        this.target = null
        this.lastAttackTime = 0
        this.velocity = { x: 0, y: 0 }

        // Animation
        this.frame = 0
        this.frameTimer = 0
        this.direction = 'down'

        // Visual effects
        this.hitFlash = 0
        this.deathTimer = 0
    }

    getStats(type) {
        const enemyTypes = {
            WOLF: {
                health: 30,
                damage: 4, // 5 * 0.8 = 4 (20% damage reduction for BALANCING)
                speed: 80,
                aggroRange: 200,
                attackRange: 50,
                attackCooldown: 1000,
                loot: [{ item: 'RAW_MEAT', count: 2 }, { item: 'TOOTH', count: 1 }]
            },
            BEAR: {
                health: 80,
                damage: 12, // 15 * 0.8 = 12 (20% damage reduction for BALANCING)
                speed: 60,
                aggroRange: 150,
                attackRange: 60,
                attackCooldown: 1500,
                loot: [{ item: 'RAW_MEAT', count: 5 }, { item: 'FUR', count: 3 }, { item: 'ANIMAL_FAT', count: 2 }]
            },
            SABERTOOTH: {
                health: 50,
                damage: 10, // 12 * 0.8 = 10 (20% damage reduction for BALANCING)
                speed: 100,
                aggroRange: 250,
                attackRange: 55,
                attackCooldown: 800,
                loot: [{ item: 'RAW_MEAT', count: 3 }, { item: 'TOOTH', count: 2 }, { item: 'FUR', count: 1 }]
            }
        }
        return enemyTypes[type] || enemyTypes.WOLF
    }

    takeDamage(amount) {
        if (this.state === 'dead') return false

        this.health -= amount
        this.hitFlash = 0.3 // Flash white for 300ms

        if (this.health <= 0) {
            this.health = 0
            this.die()
            return true // Enemy died
        }
        return false
    }

    die() {
        this.state = 'dead'
        this.deathTimer = 1.0 // 1 second death animation
        console.log(`[Enemy] ${this.type} defeated!`)
    }

    dropLoot(inventory) {
        if (!this.loot) return

        this.loot.forEach(drop => {
            inventory.add(drop.item, drop.count)
            console.log(`[Loot] +${drop.count} ${drop.item}`)
        })
    }

    update(dt, player, world) {
        if (this.state === 'dead') {
            this.deathTimer -= dt
            return this.deathTimer <= 0 // Return true when can be removed
        }

        // Update effects
        if (this.hitFlash > 0) this.hitFlash -= dt
        this.frameTimer += dt

        // Calculate distance to player
        const dx = player.x - this.x
        const dy = player.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // AI State Machine
        if (distance < this.aggroRange) {
            if (distance < this.attackRange) {
                this.state = 'attack'
                this.tryAttack(player)
            } else {
                this.state = 'chase'
                this.chasePlayer(player, dt)
            }
        } else {
            this.state = 'idle'
            this.velocity.x = 0
            this.velocity.y = 0
        }

        // Apply movement
        this.x += this.velocity.x * dt
        this.y += this.velocity.y * dt

        // Check terrain collision and rollback if needed
        if (this.checkTerrainCollision(world)) {
            this.x -= this.velocity.x * dt
            this.y -= this.velocity.y * dt
            this.velocity.x = 0
            this.velocity.y = 0
        }

        // Animation
        if (this.frameTimer > 0.15) {
            this.frame = (this.frame + 1) % 4
            this.frameTimer = 0
        }
    }

    chasePlayer(player, dt) {
        const dx = player.x - this.x
        const dy = player.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0) {
            // Store old position
            const oldX = this.x
            const oldY = this.y

            this.velocity.x = (dx / distance) * this.speed
            this.velocity.y = (dy / distance) * this.speed

            // Update direction
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left'
            } else {
                this.direction = dy > 0 ? 'down' : 'up'
            }
        }
    }

    checkTerrainCollision(world) {
        const tileX = Math.floor((this.x + this.width / 2) / 32)
        const tileY = Math.floor((this.y + this.height / 2) / 32)
        const tile = world.getTile(tileX, tileY)
        
        // Enemies avoid water and mountains
        return tile === 0 || tile === 3 || tile === 4
    }

    tryAttack(player) {
        const now = Date.now()
        if (now - this.lastAttackTime > this.attackCooldown) {
            this.attack(player)
            this.lastAttackTime = now
        }
    }

    attack(player) {
        if (player.takeDamage) {
            player.takeDamage(this.damage)
            console.log(`[Enemy] ${this.type} attacks for ${this.damage} damage!`)
        }
    }

    draw(renderer, camera, sprite) {
        if (this.state === 'dead' && this.deathTimer < 0.5) {
            // Fade out during death
            renderer.ctx.globalAlpha = this.deathTimer / 0.5
        }

        const screenX = this.x - camera.x
        const screenY = this.y - camera.y

        // Hit flash effect
        if (this.hitFlash > 0) {
            renderer.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
            renderer.ctx.fillRect(screenX, screenY, this.width, this.height)
        }

        // Draw enemy sprite (placeholder)
        if (sprite) {
            // TODO: Use actual enemy sprites when available
            renderer.ctx.drawImage(sprite, screenX, screenY, this.width, this.height)
        } else {
            // Fallback rectangle
            const colors = { WOLF: '#8B4513', BEAR: '#654321', SABERTOOTH: '#D2691E' }
            renderer.ctx.fillStyle = colors[this.type] || '#8B4513'
            renderer.ctx.fillRect(screenX, screenY, this.width, this.height)
        }

        // Health bar
        this.drawHealthBar(renderer, screenX, screenY)

        renderer.ctx.globalAlpha = 1.0
    }

    drawHealthBar(renderer, screenX, screenY) {
        const barWidth = this.width
        const barHeight = 6
        const barY = screenY - 10

        // Background
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        renderer.ctx.fillRect(screenX, barY, barWidth, barHeight)

        // Health
        const healthPercent = this.health / this.maxHealth
        renderer.ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00'
        renderer.ctx.fillRect(screenX + 1, barY + 1, (barWidth - 2) * healthPercent, barHeight - 2)

        // Border
        renderer.ctx.strokeStyle = '#fff'
        renderer.ctx.lineWidth = 1
        renderer.ctx.strokeRect(screenX, barY, barWidth, barHeight)
    }
}
