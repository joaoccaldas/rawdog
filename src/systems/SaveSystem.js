export class SaveSystem {
    constructor() {
        this.saveKey = 'rawdog_save_v1'
    }

    save(gameState) {
        try {
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                player: {
                    x: gameState.player.x,
                    y: gameState.player.y,
                    health: gameState.player.health,
                    hunger: gameState.player.hunger,
                    direction: gameState.player.direction
                },
                inventory: gameState.inventory.items,
                skills: gameState.skillSystem.skills,
                equippedTool: gameState.toolSystem.equippedTool,
                completedQuests: Array.from(gameState.questManager.completedQuests),
                activeQuests: Array.from(gameState.questManager.activeQuests),
                worldSeed: gameState.worldSeed || 0
            }

            localStorage.setItem(this.saveKey, JSON.stringify(saveData))
            console.log('[SaveSystem] Game saved successfully')
            return true
        } catch (error) {
            console.error('[SaveSystem] Failed to save:', error)
            return false
        }
    }

    load() {
        try {
            const saveData = localStorage.getItem(this.saveKey)
            if (!saveData) {
                console.log('[SaveSystem] No save data found')
                return null
            }

            const data = JSON.parse(saveData)
            console.log('[SaveSystem] Save data loaded')
            return data
        } catch (error) {
            console.error('[SaveSystem] Failed to load:', error)
            return null
        }
    }

    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null
    }

    deleteSave() {
        localStorage.removeItem(this.saveKey)
        console.log('[SaveSystem] Save data deleted')
    }

    applySaveData(gameState, saveData) {
        try {
            // Restore player state
            gameState.player.x = saveData.player.x
            gameState.player.y = saveData.player.y
            gameState.player.health = saveData.player.health
            gameState.player.hunger = saveData.player.hunger || 100
            gameState.player.direction = saveData.player.direction || 0

            // Restore inventory
            gameState.inventory.items = saveData.inventory

            // Restore skills
            if (saveData.skills) {
                gameState.skillSystem.skills = saveData.skills
            }

            // Restore equipped tool
            if (saveData.equippedTool) {
                gameState.toolSystem.equippedTool = saveData.equippedTool
            }

            // Restore quests
            if (saveData.completedQuests) {
                gameState.questManager.completedQuests = new Set(saveData.completedQuests)
            }
            if (saveData.activeQuests) {
                gameState.questManager.activeQuests = new Set(saveData.activeQuests)
                // Re-activate the quests
                saveData.activeQuests.forEach(questId => {
                    const quest = gameState.questManager.quests.get(questId)
                    if (quest) quest.isActive = true
                })
            }

            console.log('[SaveSystem] Game state restored')
            return true
        } catch (error) {
            console.error('[SaveSystem] Failed to apply save data:', error)
            return false
        }
    }
}
