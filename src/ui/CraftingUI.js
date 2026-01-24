import { UITheme } from './UITheme.js'

export class CraftingUI {
    constructor(renderer, toolSystem, inventory, questManager, skillSystem = null, input) {
        this.renderer = renderer
        this.input = input
        this.inventory = inventory
        this.toolSystem = toolSystem
        this.questManager = questManager
        this.skillSystem = skillSystem
        this.isOpen = false
        this.selectedRecipe = 0
        this.scrollOffset = 0 // For recipe list scrolling
        this.maxVisibleRecipes = 5 // Show 5 recipes at a time

        // Define craftable recipes for Cave Era
        this.recipes = [
            // TOOLS
            {
                id: 'STONE_PICK',
                name: 'Stone Pickaxe',
                description: 'Mine stone and hard materials',
                ingredients: { STONE: 3, STICK: 2 },
                produces: 'STONE_PICK',
                questId: 'first_tool',
                questProgress: 'axeCrafted'
            },
            {
                id: 'STONE_AXE',
                name: 'Stone Axe',
                description: 'Chop wood efficiently',
                ingredients: { STONE: 2, STICK: 3 },
                produces: 'STONE_AXE'
            },
            {
                id: 'SPEAR',
                name: 'Wooden Spear',
                description: 'Ranged hunting weapon (+15 dmg)',
                ingredients: { WOOD: 2, FLINT: 1 },
                produces: 'SPEAR'
            },

            // FIRE & LIGHT
            {
                id: 'CAMPFIRE',
                name: 'Campfire',
                description: 'Cook food, warmth at night',
                ingredients: { GRASS: 3, FLINT: 2, STICK: 2 },
                produces: 'CAMPFIRE',
                questId: 'fire_discovery',
                questProgress: 'fireCreated'
            },
            {
                id: 'TORCH',
                name: 'Torch',
                description: 'Portable light source',
                ingredients: { STICK: 1, GRASS: 2 },
                produces: 'TORCH'
            },

            // FOOD
            {
                id: 'COOKED_MEAT',
                name: 'Cooked Meat',
                description: 'Safe food (+50 hunger)',
                ingredients: { RAW_MEAT: 1, CAMPFIRE: 1 },
                produces: 'COOKED_MEAT',
                consumable: true,
                hungerRestore: 50
            },
            
            // STORAGE
            {
                id: 'BASKET',
                name: 'Woven Basket',
                description: 'Increases carrying capacity',
                ingredients: { GRASS: 5 },
                produces: 'BASKET'
            },
            
            // BUILDING MATERIALS
            {
                id: 'ROPE',
                name: 'Rope',
                description: 'Essential for building',
                ingredients: { GRASS: 4 },
                produces: 'ROPE'
            },
            {
                id: 'SHELTER',
                name: 'Basic Shelter',
                description: 'Protection from elements',
                ingredients: { WOOD: 5, GRASS: 3, ROPE: 1 },
                produces: 'SHELTER'
            },
            
            // WEAPONS
            {
                id: 'CLUB',
                name: 'Wooden Club',
                description: 'Simple melee weapon (+8 dmg)',
                ingredients: { WOOD: 3 },
                produces: 'CLUB'
            },
            {
                id: 'BOW',
                name: 'Hunting Bow',
                description: 'Ranged weapon for hunting',
                ingredients: { WOOD: 2, ROPE: 2, FLINT: 1 },
                produces: 'BOW'
            }
        ]
    }

    toggle() {
        this.isOpen = !this.isOpen
        this.scrollOffset = 0 // Reset scroll when opening
        console.log(`[Crafting] UI ${this.isOpen ? 'opened' : 'closed'}`)
    }

    update(dt) {
        if (!this.isOpen) return

        // Navigate recipes with arrow keys
        if (this.input.keys.has('ArrowUp')) {
            this.selectedRecipe = Math.max(0, this.selectedRecipe - 1)
            this.input.keys.delete('ArrowUp')
        }
        if (this.input.keys.has('ArrowDown')) {
            this.selectedRecipe = Math.min(this.recipes.length - 1, this.selectedRecipe + 1)
            this.input.keys.delete('ArrowDown')
        }

        // Craft with Enter/Space
        if (this.input.keys.has('Enter') || this.input.keys.has('Space')) {
            this.input.keys.delete('Enter')
            this.input.keys.delete('Space')
            this.craft(this.selectedRecipe)
        }

        // Close with C or Escape
        if (this.input.keys.has('KeyC') || this.input.keys.has('Escape')) {
            this.input.keys.delete('KeyC')
            this.input.keys.delete('Escape')
            this.toggle()
        }
    }

    canCraft(recipe) {
        // Check basic ingredients
        for (const [item, needed] of Object.entries(recipe.ingredients)) {
            if (this.inventory.get(item) < needed) {
                return false
            }
        }
        
        // Check if requires nearby structure (like campfire)
        if (recipe.requiresNearby) {
            const hasNearby = this.inventory.get(recipe.requiresNearby) > 0
            if (!hasNearby) {
                return false
            }
        }
        
        return true
    }

    craft(index) {
        const recipe = this.recipes[index]
        if (!this.canCraft(recipe)) {
            console.log(`[Crafting] Not enough materials for ${recipe.name}`)
            return
        }

        // Consume ingredients
        for (const [item, count] of Object.entries(recipe.ingredients)) {
            this.inventory.remove(item, count)
        }

        // Give product (with quality for tools)
        if (recipe.produces && this.toolSystem && this.toolSystem.Tools[recipe.produces]) {
            // Crafting a tool - use toolSystem for quality generation
            this.toolSystem.craftTool(recipe.produces, this.skillSystem)
        } else {
            // Regular item
            this.inventory.add(recipe.produces, 1)
        }
        
        console.log(`[Crafting] Created ${recipe.name}!`)

        // Apply crafting skill refund
        if (this.skillSystem) {
            const refundRate = this.skillSystem.getCraftingRefund()
            if (refundRate > 0) {
                for (const [item, count] of Object.entries(recipe.ingredients)) {
                    const refundAmount = Math.floor(count * refundRate)
                    if (refundAmount > 0) {
                        this.inventory.add(item, refundAmount)
                        console.log(`[Crafting] Refunded ${refundAmount} ${item}`)
                    }
                }
            }
        }

        // Grant crafting XP
        if (this.skillSystem) this.skillSystem.addXP('crafting', 20)

        // Update quest
        if (recipe.questId && recipe.questProgress && this.questManager) {
            this.questManager.updateProgress(recipe.questId, recipe.questProgress, true)
        }

        // Auto-equip tools
        if (recipe.produces === 'STONE_PICK') {
            this.toolSystem.equipTool('STONE_PICK')
        }
    }

    draw() {
        if (!this.isOpen) return

        const ctx = this.renderer.ctx
        const w = this.renderer.canvas.width
        const h = this.renderer.canvas.height

        // Dark overlay
        ctx.fillStyle = UITheme.colors.backgroundDark
        ctx.globalAlpha = 0.8
        ctx.fillRect(0, 0, w, h)
        ctx.globalAlpha = 1.0

        // UI Panel
        const panelX = w / 2 - 300
        const panelY = h / 2 - 250
        UITheme.drawPanel(ctx, panelX, panelY, 600, 500, { title: 'CRAFTING' })

        // Calculate scroll
        if (this.selectedRecipe < this.scrollOffset) {
            this.scrollOffset = this.selectedRecipe
        } else if (this.selectedRecipe >= this.scrollOffset + this.maxVisibleRecipes) {
            this.scrollOffset = this.selectedRecipe - this.maxVisibleRecipes + 1
        }

        // Recipes with scrolling
        ctx.textAlign = 'left'
        let y = panelY + 100
        const visibleRecipes = this.recipes.slice(this.scrollOffset, this.scrollOffset + this.maxVisibleRecipes)
        
        visibleRecipes.forEach((recipe, displayIdx) => {
            const actualIdx = displayIdx + this.scrollOffset
            const canCraft = this.canCraft(recipe)
            const isSelected = actualIdx === this.selectedRecipe

            // Item Slot Box
            if (isSelected) {
                ctx.fillStyle = 'rgba(143, 104, 64, 0.4)'
                ctx.fillRect(panelX + 20, y - 40, 560, 70)
                ctx.strokeStyle = UITheme.colors.warning
                ctx.lineWidth = 2
                ctx.strokeRect(panelX + 20, y - 40, 560, 70)
            }

            // Recipe name
            ctx.fillStyle = canCraft ? UITheme.colors.success : UITheme.colors.textDim
            ctx.font = `bold ${UITheme.font.size.large}px ${UITheme.font.main}`
            ctx.fillText(recipe.name, panelX + 50, y - 5)

            // Description
            ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
            ctx.fillStyle = UITheme.colors.textDim
            ctx.fillText(recipe.description, panelX + 50, y + 18)

            // Ingredients
            ctx.font = `${UITheme.font.size.small}px ${UITheme.font.main}`
            let ingredientText = ''
            for (const [item, needed] of Object.entries(recipe.ingredients)) {
                const has = this.inventory.get(item)
                ingredientText += `${item} ${has}/${needed}  `
            }
            ctx.fillStyle = canCraft ? UITheme.colors.success : UITheme.colors.danger
            ctx.textAlign = 'right'
            ctx.fillText(ingredientText, panelX + 560, y + 10)
            ctx.textAlign = 'left'

            y += 75
        })

        // Scroll indicators
        ctx.fillStyle = UITheme.colors.warning
        ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
        ctx.textAlign = 'center'
        if (this.scrollOffset > 0) {
            ctx.fillText('▲ More above', w / 2, panelY + 85)
        }
        if (this.scrollOffset + this.maxVisibleRecipes < this.recipes.length) {
            ctx.fillText('▼ More below', w / 2, panelY + 465)
        }

        // Instructions
        ctx.fillStyle = UITheme.colors.textDim
        ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
        ctx.fillText('↑↓ Select  |  SPACE Craft  |  C Close', w / 2, panelY + 485)

        ctx.textAlign = 'left' // Reset
    }
}
