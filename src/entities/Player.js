export class Player {
    constructor(x, y, inventory, toolSystem, questManager = null, skillSystem = null, floatingText = null, camera = null, particles = null) {
        this.x = x
        this.y = y
        this.width = 128
        this.height = 128
        this.speed = 200
        this.color = '#3498db'
        this.direction = 0
        this.isMoving = false
        this.inventory = inventory
        this.toolSystem = toolSystem
        this.questManager = questManager
        this.skillSystem = skillSystem
        this.lastMouseDown = false
        this.floatingText = floatingText
        this.camera = camera
        this.particles = particles
        this.miningCooldown = 0.3 // seconds between mining actions
        this.timeSinceLastMine = 0

        // Combat stats
        this.maxHealth = 100
        this.health = 100
        this.damage = 10 // Base damage with HAND
        this.attackCooldown = 500 // ms
        this.lastAttackTime = 0
        this.hitFlash = 0

        // Survival stats
        this.maxHunger = 100
        this.hunger = 100
        this.hungerDecayRate = 0.5 // Hunger lost per second (slower decay)
        this.starvationDamage = 3 // Damage per second when hunger = 0
        this.starvationTimer = 0

        // Health regeneration
        this.healthRegenRate = 0.5 // HP per second when hunger > 50
        this.healthRegenTimer = 0
    }

    update(dt, input, world, camera) {
        this.isMoving = false

        // Store old position for collision rollback
        const oldX = this.x
        const oldY = this.y

        // Initialize physics vars if not present (backward compatibility)
        if (!this.vx) this.vx = 0
        if (!this.vy) this.vy = 0

        // Physics constants
        const ACCELERATION = 1500
        const FRICTION = 0.85 // 0.85 per frame is too dependent on FPS, should be dt based but keeping simple for now? 
        // Better friction: pow(frictionCoeff, dt)
        const FRICTION_EXT = 0.9 // Higher = more slide

        // Calculate max speed
        let maxSpeed = this.speed
        if (input.isDown('ShiftLeft')) {
            maxSpeed *= 1.6 // Sprint 60% faster
        }

        // Apply input acceleration
        let accX = 0
        let accY = 0

        if (input.isDown('ArrowUp') || input.isDown('KeyW')) accY -= ACCELERATION
        if (input.isDown('ArrowDown') || input.isDown('KeyS')) accY += ACCELERATION
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) accX -= ACCELERATION
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) accX += ACCELERATION

        // Apply acceleration to velocity
        this.vx += accX * dt
        this.vy += accY * dt

        // Apply friction
        // Simple friction: multiply by constant
        // For framerate independence: vel *= Math.pow(frictionBase, dt)
        const frictionFactor = Math.pow(0.05, dt) // Very strong friction over 1 second
        this.vx *= 0.92 // Tune for feel - constant per frame for "snappiness" vs dt
        this.vy *= 0.92

        // Cap speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed
            this.vx *= scale
            this.vy *= scale
        }

        // Snap to 0 if very slow
        if (Math.abs(this.vx) < 10) this.vx = 0
        if (Math.abs(this.vy) < 10) this.vy = 0

        // Apply velocity to position
        this.x += this.vx * dt
        this.y += this.vy * dt

        // Direction & Moving State
        this.isMoving = (Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10)

        if (this.isMoving) {
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.direction = this.vx > 0 ? 2 : 1 // Right : Left
            } else {
                this.direction = this.vy > 0 ? 0 : 3 // Down : Up
            }

            // Footstep sounds
            if (!this.accumulatedDistance) this.accumulatedDistance = 0
            this.accumulatedDistance += currentSpeed * dt
            if (this.accumulatedDistance > 50) { // Step every 50 units
                import('../core/AudioManager.js').then(m => m.audioManager.play('step'))
                this.accumulatedDistance = 0
            }
        }

        // Collision detection with terrain
        if (this.checkCollision(world)) {
            // Rollback movement if collision detected
            this.x = oldX
            this.y = oldY
        }

        // Mining with mouse click
        const mouse = input.getMouse()

        // Update mining cooldown
        this.timeSinceLastMine += dt

        // Apply mining speed skill bonus
        const speedMultiplier = this.skillSystem ? this.skillSystem.getMiningSpeedMultiplier() : 1.0
        const adjustedCooldown = this.miningCooldown / speedMultiplier

        // Hold mouse to continuously mine
        if (mouse.down && this.timeSinceLastMine >= adjustedCooldown) {
            this.mineTile(mouse.x, mouse.y, camera, world)
            this.timeSinceLastMine = 0
        }

        // Track mouse state
        this.lastMouseDown = mouse.down

        // Update hit flash effect
        if (this.hitFlash > 0) {
            this.hitFlash -= dt
        }

        // Update hunger system
        this.hunger -= this.hungerDecayRate * dt
        if (this.hunger < 0) this.hunger = 0

        // Health regeneration when well-fed (hunger > 50)
        if (this.hunger > 50 && this.health < this.maxHealth) {
            this.healthRegenTimer += dt
            if (this.healthRegenTimer >= 2.0) { // Regen every 2 seconds
                this.health = Math.min(this.maxHealth, this.health + 1)
                this.healthRegenTimer = 0
            }
        }

        // Starvation damage
        if (this.hunger === 0) {
            this.starvationTimer += dt
            if (this.starvationTimer >= 1.0) {
                this.takeDamage(this.starvationDamage)
                this.starvationTimer = 0
                if (this.floatingText) {
                    this.floatingText.add('Starving!', this.x + this.width / 2, this.y, '#ff0000')
                }
            }
        } else {
            this.starvationTimer = 0
        }
    }

    mineTile(mouseX, mouseY, camera, world) {
        // Convert screen mouse to world coordinates
        const worldX = mouseX + camera.x
        const worldY = mouseY + camera.y

        // Convert to tile coordinates
        const tileX = Math.floor(worldX / world.tileSize)
        const tileY = Math.floor(worldY / world.tileSize)

        // Calculate distance to player (interaction range)
        const playerTileX = Math.floor((this.x + this.width / 2) / world.tileSize)
        const playerTileY = Math.floor((this.y + this.height / 2) / world.tileSize)
        const dist = Math.sqrt(Math.pow(tileX - playerTileX, 2) + Math.pow(tileY - playerTileY, 2))

        if (dist < 8) { // Mining range
            const currentTile = world.getTile(tileX, tileY)

            // Check tool strength
            if (this.toolSystem && !this.toolSystem.canMine(currentTile)) {
                return
            }

            // Mine the tile
            if (currentTile === 3) { // Stone - 2x slower mining (BALANCING)
                world.setTile(tileX, tileY, 1)
                const amount = 1 + (this.skillSystem ? this.skillSystem.getMiningBonus() : 0)
                if (this.inventory) this.inventory.add('STONE', amount)
                if (this.questManager) this.questManager.updateProgress('first_tool', 'stone', amount)
                if (this.skillSystem) this.skillSystem.addXP('mining', 10)
                if (this.floatingText) this.floatingText.add(`+${amount} Stone`, worldX, worldY, '#aaaaaa')
                if (this.particles) this.particles.emit(worldX, worldY, 'stone', 8)
                this.timeSinceLastMine = -this.miningCooldown * 0.5 // Add extra cooldown for stone
            } else if (currentTile === 2) { // Grass
                world.setTile(tileX, tileY, 1)
                const amount = 1 + (this.skillSystem ? this.skillSystem.getMiningBonus() : 0)
                if (this.inventory) this.inventory.add('GRASS', amount)
                if (this.questManager) this.questManager.updateProgress('fire_discovery', 'dryGrass', amount)
                if (this.skillSystem) this.skillSystem.addXP('mining', 5)
                if (this.floatingText) this.floatingText.add(`+${amount} Grass`, worldX, worldY, '#4aff4a')
                if (this.particles) this.particles.emit(worldX, worldY, 'grass', 10)
            } else if (currentTile === 5) { // Wood
                world.setTile(tileX, tileY, 1)
                const amount = 1 + (this.skillSystem ? this.skillSystem.getMiningBonus() : 0)
                if (this.inventory) this.inventory.add('WOOD', amount)
                if (this.skillSystem) this.skillSystem.addXP('mining', 8)
                if (this.floatingText) this.floatingText.add(`+${amount} Wood`, worldX, worldY, '#8B4513')
                if (this.particles) this.particles.emit(worldX, worldY, 'wood', 12)
            } else if (currentTile === 6) { // Flint
                world.setTile(tileX, tileY, 1)
                const amount = 1 + (this.skillSystem ? this.skillSystem.getMiningBonus() : 0)
                if (this.inventory) this.inventory.add('FLINT', amount)
                if (this.questManager) this.questManager.updateProgress('fire_discovery', 'flint', amount)
                if (this.skillSystem) this.skillSystem.addXP('mining', 15)
                if (this.floatingText) this.floatingText.add(`+${amount} Flint`, worldX, worldY, '#FFD700')
                if (this.particles) this.particles.emit(worldX, worldY, 'sparkle', 15)
            } else if (currentTile === 7) { // Ochre
                world.setTile(tileX, tileY, 1)
                const amount = 1 + (this.skillSystem ? this.skillSystem.getMiningBonus() : 0)
                if (this.inventory) this.inventory.add('OCHRE', amount)
                if (this.questManager) this.questManager.updateProgress('cave_art', 'ochre', amount)
                if (this.skillSystem) this.skillSystem.addXP('mining', 12)
                if (this.floatingText) this.floatingText.add(`+${amount} Ochre`, worldX, worldY, '#DC143C')
                if (this.particles) this.particles.emit(worldX, worldY, 'dust', 10)
            } else if (currentTile === 8) { // Stick
                world.setTile(tileX, tileY, 1)
                const amount = 1 + (this.skillSystem ? this.skillSystem.getMiningBonus() : 0)
                if (this.inventory) this.inventory.add('STICK', amount)
                if (this.questManager) this.questManager.updateProgress('fire_discovery', 'stick', amount)
                if (this.skillSystem) this.skillSystem.addXP('mining', 3)
                if (this.floatingText) this.floatingText.add(`+${amount} Stick`, worldX, worldY, '#8B4513')
                if (this.particles) this.particles.emit(worldX, worldY, 'wood', 6)
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount
        this.hitFlash = 0.3 // Flash for 300ms

        if (this.health < 0) this.health = 0

        // Screen shake on damage
        if (this.camera) {
            this.camera.shake(15)
        }

        console.log(`[Player] Took ${amount} damage! HP: ${this.health}/${this.maxHealth}`)

        return this.health <= 0 // Return true if dead
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount)
        console.log(`[Player] Healed ${amount} HP! HP: ${this.health}/${this.maxHealth}`)
    }

    eat(hungerRestored) {
        this.hunger = Math.min(this.maxHunger, this.hunger + hungerRestored)
        console.log(`[Player] Ate food! Hunger: ${this.hunger}/${this.maxHunger}`)
        if (this.floatingText) {
            this.floatingText.add(`+${hungerRestored} Hunger`, this.x + this.width / 2, this.y, '#4aff4a')
        }
    }

    attackEnemy(enemy) {
        const now = Date.now()
        if (now - this.lastAttackTime < this.attackCooldown) {
            return false // Still on cooldown
        }

        // Calculate damage based on equipped tool
        let totalDamage = this.damage
        const equippedTool = this.toolSystem?.equippedTool || 'HAND'

        // Tool damage multipliers
        const toolDamageBonus = {
            'HAND': 0,
            'STONE_PICK': 5,
            'STONE_AXE': 8,
            'SPEAR': 15,
            'TORCH': 2
        }

        totalDamage += toolDamageBonus[equippedTool] || 0

        // Apply combat skill multiplier
        const skillMultiplier = this.skillSystem ? this.skillSystem.getCombatDamageMultiplier() : 1.0
        totalDamage = Math.floor(totalDamage * skillMultiplier)

        // Apply damage to enemy
        const killed = enemy.takeDamage(totalDamage)
        this.lastAttackTime = now

        // Use tool durability when attacking
        if (this.toolSystem && equippedTool !== 'HAND') {
            this.toolSystem.useTool()
        }

        // Show floating text
        if (this.floatingText) {
            this.floatingText.add(`-${totalDamage}`, enemy.x + enemy.width / 2, enemy.y, '#ff4444')
        }

        // Award XP for killing
        if (killed && this.skillSystem) {
            this.skillSystem.addXP('combat', 20)
            // Screen shake on kill
            if (this.camera) {
                this.camera.shake(8)
            }
        }

        console.log(`[Player] Attacked with ${equippedTool} for ${totalDamage} damage!`)
        return true
    }

    isDead() {
        return this.health <= 0
    }

    checkCollision(world) {
        // Check center and all four corners of player hitbox
        const padding = 20 // Hitbox padding from edges
        const centerX = this.x + this.width / 2
        const centerY = this.y + this.height / 2

        const checkPoints = [
            { x: centerX, y: centerY }, // Center
            { x: this.x + padding, y: this.y + padding }, // Top-left
            { x: this.x + this.width - padding, y: this.y + padding }, // Top-right
            { x: this.x + padding, y: this.y + this.height - padding }, // Bottom-left
            { x: this.x + this.width - padding, y: this.y + this.height - padding } // Bottom-right
        ]

        for (const point of checkPoints) {
            const tileX = Math.floor(point.x / world.tileSize)
            const tileY = Math.floor(point.y / world.tileSize)
            const tile = world.getTile(tileX, tileY)

            // BLOCK: water (0), stone (3), snow (4), null/undefined
            if (tile === 0 || tile === 3 || tile === 4 || tile === null || tile === undefined) {
                return true
            }
        }

        return false
    }

    draw(renderer, camera, sprite, pseudo3D = null) {
        let screenX = this.x - camera.x
        let screenY = this.y - camera.y

        // Apply pseudo-3D perspective
        if (pseudo3D) {
            const screenPos = pseudo3D.worldToScreen(screenX, screenY, 8)
            screenY = screenPos.y
            pseudo3D.drawShadow(renderer.ctx, screenX, this.y - camera.y, this.width, this.height)
        }

        // Hit flash effect
        if (this.hitFlash > 0) {
            renderer.ctx.save()
            renderer.ctx.globalAlpha = 0.5
            renderer.ctx.fillStyle = '#ff0000'
            renderer.ctx.fillRect(screenX, screenY, this.width, this.height)
            renderer.ctx.restore()
        }

        if (sprite && sprite.complete && sprite.width > 0) {
            // Player sprite is 1792x2400 = 4 columns x 6 rows (4 directions, 6 animation frames)
            const frameWidth = 1792 / 4   // 448 pixels per direction
            const frameHeight = 2400 / 6  // 400 pixels per animation frame
            const frameX = this.direction * frameWidth
            const frameY = 0 // Use first animation frame (idle)

            renderer.ctx.globalCompositeOperation = 'source-over'
            renderer.drawSprite(sprite, frameX, frameY, frameWidth, frameHeight, screenX, screenY, this.width, this.height)
            renderer.ctx.globalCompositeOperation = 'source-over'
        } else {
            // Fallback: draw colored rect
            renderer.ctx.fillStyle = '#8B4513'
            renderer.ctx.fillRect(screenX, screenY, this.width, this.height)
        }
    }
}
