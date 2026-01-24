export class QuestManager {
    constructor(notificationManager = null) {
        this.quests = new Map()
        this.activeQuests = new Set()
        this.completedQuests = new Set()
        this.notificationManager = notificationManager
    }

    registerQuest(quest) {
        this.quests.set(quest.id, quest)
    }

    startQuest(questId) {
        const quest = this.quests.get(questId)
        if (quest && !this.completedQuests.has(questId) && !this.activeQuests.has(questId)) {
            quest.isActive = true
            this.activeQuests.add(questId)
            console.log(`[Quest] Started: ${quest.title}`)
            if (this.notificationManager) {
                // Show quest title only (description is too spammy)
                this.notificationManager.show(`🔔 ${quest.title}`, 4000, '#FFD700')
            }
        }
    }

    updateProgress(questId, progressKey, amount = 1) {
        const quest = this.quests.get(questId)
        if (quest && quest.isActive) {
            quest.progress[progressKey] = (quest.progress[progressKey] || 0) + amount

            // Check completion
            if (quest.checkCompletion()) {
                this.completeQuest(questId)
            }
        }
    }

    completeQuest(questId) {
        const quest = this.quests.get(questId)
        if (quest) {
            quest.isActive = false
            quest.isCompleted = true
            this.activeQuests.delete(questId)
            this.completedQuests.add(questId)
            console.log(`[Quest] Completed: ${quest.title}`)

            // Show notification
            if (this.notificationManager) {
                this.notificationManager.show(`✓ Quest Complete: ${quest.title}!`, 4000, '#4aff4a')
            }

            // Trigger reward
            if (quest.onComplete) {
                quest.onComplete()
            }

            // Auto-chain next quest
            this.autoChainNextQuest(questId)
        }
    }

    autoChainNextQuest(completedQuestId) {
        const questChains = {
            'fire_discovery': 'first_tool',
            'first_tool': 'cave_art'
        }

        const nextId = questChains[completedQuestId]
        if (nextId && this.quests.has(nextId) && !this.completedQuests.has(nextId)) {
            setTimeout(() => this.startQuest(nextId), 500)
        }
    }

    getActiveQuests() {
        return Array.from(this.activeQuests).map(id => this.quests.get(id))
    }
}

// Quest definition class
export class Quest {
    constructor(config) {
        this.id = config.id
        this.title = config.title
        this.description = config.description
        this.objectives = config.objectives || []
        this.progress = {}
        this.isActive = false
        this.isCompleted = false
        this.onComplete = config.onComplete
        this.checkCompletion = config.checkCompletion || (() => false)
    }
}
