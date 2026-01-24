export class TutorialSystem {
    constructor(notificationManager) {
        this.notificationManager = notificationManager
        this.shownHints = new Set()
        this.tutorialSteps = [
            {
                id: 'welcome',
                condition: () => true,
                delay: 2000,
                message: '👋 Welcome! Use WASD to move around',
                duration: 4000
            },
            {
                id: 'mining',
                condition: (state) => !this.shownHints.has('mining'),
                delay: 6000,
                message: '⛏️ Hold Left Click to mine resources',
                duration: 4000
            },
            {
                id: 'inventory',
                condition: (state) => Object.keys(state.inventory.items).length > 0,
                message: '📦 Check top-right for your inventory',
                duration: 3000
            },
            {
                id: 'crafting',
                condition: (state) => state.inventory.get('STONE') >= 2 && state.inventory.get('GRASS') >= 2,
                message: '🔧 Press C to open Crafting Menu',
                duration: 4000
            },
            {
                id: 'hunger',
                condition: (state) => state.player.hunger < 50,
                message: '🍖 Hunt animals for food! Press E to eat',
                duration: 4000
            },
            {
                id: 'combat',
                condition: (state) => state.enemies.length > 0 && !this.shownHints.has('combat'),
                message: '⚔️ Click on enemies to attack them!',
                duration: 4000
            },
            {
                id: 'save',
                condition: (state) => state.player.health < 50 && !this.shownHints.has('save'),
                message: '💾 Press F5 to save your progress',
                duration: 4000
            },
            {
                id: 'skills',
                condition: (state) => {
                    const anySkillLeveledUp = Object.values(state.skillSystem.skills).some(s => s.level > 1)
                    return anySkillLeveledUp && !this.shownHints.has('skills')
                },
                message: '⭐ Skills unlock powerful bonuses!',
                duration: 4000
            }
        ]
    }

    update(dt, gameState) {
        for (const step of this.tutorialSteps) {
            if (this.shownHints.has(step.id)) continue

            if (step.condition(gameState)) {
                const delay = step.delay || 0
                
                setTimeout(() => {
                    if (!this.shownHints.has(step.id)) {
                        this.showHint(step.id, step.message, step.duration || 3000)
                    }
                }, delay)
                
                break // Show one hint at a time
            }
        }
    }

    showHint(id, message, duration) {
        this.shownHints.add(id)
        if (this.notificationManager) {
            this.notificationManager.show(message, duration, '#4aD4FF')
        }
        console.log(`[Tutorial] ${message}`)
    }

    reset() {
        this.shownHints.clear()
    }
}
