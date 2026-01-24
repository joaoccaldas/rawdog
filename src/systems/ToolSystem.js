// Material hardness system (using tile IDs from TileType)
export const MaterialHardness = {
    0: -1,  // WATER - Cannot mine
    1: 0,   // SAND - Hand can mine
    2: 0,   // GRASS - Hand can mine
    3: 1,   // STONE - Needs Stone Pickaxe
    4: 1,   // SNOW - Needs Stone Pickaxe
    5: 1,   // WOOD - Needs Stone Axe (or hand, slower)
    6: 2,   // FLINT - Needs Stone Pickaxe
    7: 1,   // OCHRE - Needs Stone Pickaxe
    8: 0    // STICK - Hand can mine
}

// Tool types with durability
export const Tools = {
    HAND: { level: 0, name: 'Hand', damage: 3, maxDurability: -1 },
    STONE_PICK: { level: 2, name: 'Stone Pickaxe', damage: 5, maxDurability: 50 },
    STONE_AXE: { level: 2, name: 'Stone Axe', damage: 8, maxDurability: 50 },
    SPEAR: { level: 0, name: 'Spear', damage: 15, maxDurability: 30 },
    TORCH: { level: 0, name: 'Torch', damage: 2, maxDurability: 100 },
    CLUB: { level: 0, name: 'Wooden Club', damage: 8, maxDurability: 40 },
    BOW: { level: 0, name: 'Hunting Bow', damage: 12, maxDurability: 35 },
    HOE: { level: 1, name: 'Wooden Hoe', damage: 2, maxDurability: 60 },
    WATERING_CAN: { level: 1, name: 'Watering Can', damage: 0, maxDurability: 100 }
}

// Tool crafting recipes
export const ToolRecipes = {
    STONE_PICK: { STONE: 3, STICK: 2 },
    STONE_AXE: { STONE: 2, STICK: 3 },
    SPEAR: { WOOD: 2, FLINT: 1 },
    CLUB: { WOOD: 3 },
    BOW: { WOOD: 2, ROPE: 2, FLINT: 1 },
    HOE: { WOOD: 2, STONE: 1 },
    WATERING_CAN: { WOOD: 3, CLAY_POT: 1 }
}

export class ToolSystem {
    constructor(inventory) {
        this.inventory = inventory
        this.equippedTool = 'HAND'
        this.equippedToolQuality = 1 // 1-5 star quality
        this.Tools = Tools // Export for external access

        // Track durability of each tool instance
        this.toolDurability = {}

        // Track quality of each crafted tool by slot/id
        this.toolQualities = {} // { toolName_id: quality }
    }

    /**
     * Calculate quality bonus multiplier (1.0 = no bonus, 1.5 = 50% bonus at 5-star)
     */
    getQualityMultiplier(quality = this.equippedToolQuality) {
        // Quality: 1-5 stars, converts to 1.0-1.25x multiplier
        return 1 + ((quality - 1) * 0.0625) // 0.0625 = 0.25/4
    }

    canMine(tileType) {
        const hardness = MaterialHardness[tileType]
        if (hardness === undefined || hardness === -1) return false

        const toolLevel = Tools[this.equippedTool]?.level || 0
        return toolLevel >= hardness
    }

    // Use tool (reduces durability)
    useTool() {
        if (this.equippedTool === 'HAND') return true

        const tool = Tools[this.equippedTool]
        if (!tool || tool.maxDurability === -1) return true

        // Initialize durability if not set
        if (this.toolDurability[this.equippedTool] === undefined) {
            this.toolDurability[this.equippedTool] = tool.maxDurability
        }

        // Reduce durability
        this.toolDurability[this.equippedTool]--

        // Tool breaks
        if (this.toolDurability[this.equippedTool] <= 0) {
            console.log(`[ToolSystem] ${tool.name} broke!`)
            this.inventory.remove(this.equippedTool, 1)
            delete this.toolDurability[this.equippedTool]
            this.equippedTool = 'HAND'
            return false // Tool broke
        }

        return true
    }

    // Get durability percentage
    getDurability() {
        if (this.equippedTool === 'HAND') return 100
        const tool = Tools[this.equippedTool]
        if (!tool || tool.maxDurability === -1) return 100

        const current = this.toolDurability[this.equippedTool] ?? tool.maxDurability
        return Math.round((current / tool.maxDurability) * 100)
    }

    // Get current equipped tool damage with quality bonus
    getDamage() {
        const baseDamage = Tools[this.equippedTool]?.damage || 3
        const qualityBonus = this.getQualityMultiplier()
        return Math.ceil(baseDamage * qualityBonus)
    }

    craftTool(toolName, skillSystem = null) {
        const recipe = ToolRecipes[toolName]
        if (!recipe) return false

        // Check if player has materials
        for (const [item, count] of Object.entries(recipe)) {
            if (this.inventory.get(item) < count) return false
        }

        // Consume materials
        for (const [item, count] of Object.entries(recipe)) {
            this.inventory.remove(item, count)
        }

        if (skillSystem) {
            const crafting = skillSystem.skills.crafting || 0
            const qualityBonus = Math.floor(crafting / 50) // 1 extra star per 50 crafting XP
            quality = Math.min(5, quality + qualityBonus)
        }

        // Add to inventory
        // Note: New Inventory system might merge stacks, but tools usually shouldn't stack?
        // TODO: Make tools unstackable in Inventory.js or handle here. 
        // For now, assuming they might stack or take a slot.
        this.inventory.add(toolName, 1)

        // Store quality for this tool type (Simplification: all tools of type share stats for now unless we do unique IDs)
        // With slot system, we should attach metadata to the slot.
        // But for Phase 2 start, we keep simple global tracking per type to avoid breaking everything.
        this.equippedToolQuality = quality
        this.toolDurability[toolName] = Tools[toolName].maxDurability

        return true
    }

    equipTool(toolName) {
        if (this.inventory.get(toolName) > 0 || toolName === 'HAND') {
            this.equippedTool = toolName
            return true
        }
        return false
    }

    // Save/load durability
    getSaveData() {
        return {
            equippedTool: this.equippedTool,
            toolDurability: { ...this.toolDurability }
        }
    }

    loadSaveData(data) {
        if (data.equippedTool) this.equippedTool = data.equippedTool
        if (data.toolDurability) this.toolDurability = { ...data.toolDurability }
    }
}
