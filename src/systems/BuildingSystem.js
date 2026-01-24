export class BuildingSystem {
    constructor(world, inventory, skillSystem = null, chestSystem = null) {
        this.world = world
        this.inventory = inventory
        this.skillSystem = skillSystem
        this.chestSystem = chestSystem
        this.buildingMode = false
        this.placedBlocks = new Map() // Store custom placed blocks
        this.selectedBlockType = 'STONE_WALL'
        this.ghostBlock = null // Preview block position

        this.blockTypes = {
            STONE_WALL: { material: 'STONE', cost: 3, sprite: 3, name: 'Stone Wall' },
            WOOD_WALL: { material: 'WOOD', cost: 2, sprite: 5, name: 'Wood Wall' },
            STONE_FLOOR: { material: 'STONE', cost: 2, sprite: 1, name: 'Stone Floor' },
            WOOD_FLOOR: { material: 'WOOD', cost: 2, sprite: 2, name: 'Wood Floor' },
            DOOR: { material: 'WOOD', cost: 4, sprite: 5, name: 'Door' },
            WOODEN_CHEST: { material: 'WOOD', cost: 5, sprite: 5, name: 'Wooden Chest' },
            STONE_CHEST: { material: 'STONE', cost: 8, sprite: 3, name: 'Stone Chest' }
        }
    }

    toggleBuildingMode() {
        this.buildingMode = !this.buildingMode
        console.log(`[Building] Mode ${this.buildingMode ? 'ON' : 'OFF'}`)
        return this.buildingMode
    }

    canPlace(blockType) {
        const block = this.blockTypes[blockType]
        if (!block) return false

        const hasResources = this.inventory.get(block.material) >= block.cost
        return hasResources
    }

    placeBlock(worldX, worldY) {
        if (!this.buildingMode) return false

        const tileX = Math.floor(worldX / this.world.tileSize)
        const tileY = Math.floor(worldY / this.world.tileSize)
        const key = `${tileX},${tileY}`

        // Check if already occupied
        if (this.placedBlocks.has(key)) {
            console.log('[Building] Tile already occupied')
            return false
        }

        const blockType = this.selectedBlockType
        const block = this.blockTypes[blockType]

        // Apply building skill cost reduction
        let actualCost = block.cost
        if (this.skillSystem) {
            const reduction = this.skillSystem.getBuildingCostReduction()
            actualCost = Math.ceil(block.cost * (1 - reduction))
            if (reduction > 0) {
                console.log(`[Building] Cost reduced from ${block.cost} to ${actualCost} (-${Math.floor(reduction * 100)}%)`)
            }
        }

        // Check resources
        if (this.inventory.get(block.material) < actualCost) {
            console.log(`[Building] Not enough ${block.material} (need ${actualCost})`)
            return false
        }

        // Place block
        this.placedBlocks.set(key, {
            type: blockType,
            tileX,
            tileY,
            sprite: block.sprite
        })

        // Consume materials
        this.inventory.remove(block.material, actualCost)

        // Update world tile
        this.world.setTile(tileX, tileY, block.sprite)

        // Create chest if placing a chest block
        if ((blockType === 'WOODEN_CHEST' || blockType === 'STONE_CHEST') && this.chestSystem) {
            const worldX = tileX * this.world.tileSize
            const worldY = tileY * this.world.tileSize
            this.chestSystem.place(worldX, worldY)
        }

        // Award building XP
        if (this.skillSystem) {
            this.skillSystem.addXP('building', 10)
        }

        console.log(`[Building] Placed ${block.name} at ${tileX}, ${tileY}`)
        return true
    }

    removeBlock(worldX, worldY) {
        if (!this.buildingMode) return false

        const tileX = Math.floor(worldX / this.world.tileSize)
        const tileY = Math.floor(worldY / this.world.tileSize)
        const key = `${tileX},${tileY}`

        const block = this.placedBlocks.get(key)
        if (!block) {
            console.log('[Building] No placed block here')
            return false
        }

        // Remove block
        this.placedBlocks.delete(key)

        // Restore original tile (grass)
        this.world.setTile(tileX, tileY, 2)

        // Refund half materials
        const blockData = this.blockTypes[block.type]
        const refund = Math.floor(blockData.cost / 2)
        this.inventory.add(blockData.material, refund)

        console.log(`[Building] Removed ${blockData.name}, refunded ${refund} ${blockData.material}`)
        return true
    }

    updateGhostBlock(worldX, worldY) {
        if (!this.buildingMode) {
            this.ghostBlock = null
            return
        }

        const tileX = Math.floor(worldX / this.world.tileSize)
        const tileY = Math.floor(worldY / this.world.tileSize)

        this.ghostBlock = { tileX, tileY }
    }

    drawGhostBlock(renderer, camera) {
        if (!this.ghostBlock || !this.buildingMode) return

        const { tileX, tileY } = this.ghostBlock
        const screenX = tileX * this.world.tileSize - camera.x
        const screenY = tileY * this.world.tileSize - camera.y

        // Draw semi-transparent preview
        renderer.ctx.fillStyle = this.canPlace(this.selectedBlockType)
            ? 'rgba(0, 255, 0, 0.3)'
            : 'rgba(255, 0, 0, 0.3)'
        renderer.ctx.fillRect(screenX, screenY, this.world.tileSize, this.world.tileSize)

        // Draw border
        renderer.ctx.strokeStyle = this.canPlace(this.selectedBlockType)
            ? '#0f0'
            : '#f00'
        renderer.ctx.lineWidth = 2
        renderer.ctx.strokeRect(screenX, screenY, this.world.tileSize, this.world.tileSize)
    }

    cycleBlockType() {
        const types = Object.keys(this.blockTypes)
        const currentIndex = types.indexOf(this.selectedBlockType)
        const nextIndex = (currentIndex + 1) % types.length
        this.selectedBlockType = types[nextIndex]
        console.log(`[Building] Selected: ${this.blockTypes[this.selectedBlockType].name}`)
    }

    save() {
        return {
            placedBlocks: Array.from(this.placedBlocks.entries())
        }
    }

    load(data) {
        if (data && data.placedBlocks) {
            this.placedBlocks = new Map(data.placedBlocks)
            // Restore blocks to world
            for (const [key, block] of this.placedBlocks) {
                this.world.setTile(block.tileX, block.tileY, block.sprite)
            }
        }
    }
}
