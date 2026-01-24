export class SkillSystem {
    constructor(notificationManager = null) {
        this.skills = {
            mining: { xp: 0, level: 1 },
            crafting: { xp: 0, level: 1 },
            building: { xp: 0, level: 1 },
            combat: { xp: 0, level: 1 }
        }
        this.notificationManager = notificationManager
        this.xpPerLevel = 100
    }

    addXP(skillName, amount) {
        const skill = this.skills[skillName]
        if (!skill) return

        skill.xp += amount

        // Check for level up
        const requiredXP = skill.level * this.xpPerLevel
        if (skill.xp >= requiredXP) {
            skill.xp -= requiredXP
            skill.level++
            console.log(`[Skills] ${skillName.toUpperCase()} leveled up to ${skill.level}!`)

            // Show level-up benefits
            const benefits = this.getLevelUpBenefits(skillName, skill.level)
            
            if (this.notificationManager) {
                this.notificationManager.show(
                    `⭐ ${skillName.toUpperCase()} Level ${skill.level}!`,
                    3000,
                    '#4aff4a'
                )
                
                if (benefits) {
                    setTimeout(() => {
                        this.notificationManager.show(benefits, 4000, '#FFD700')
                    }, 500)
                }
            }
        }
    }

    getLevelUpBenefits(skillName, level) {
        const benefits = {
            mining: {
                2: '⛏️ +1 Resource per tile',
                3: '⛏️ +50% Mining speed',
                4: '⛏️ +2 Resources per tile',
                5: '⛏️ Rare resource chance doubled'
            },
            crafting: {
                2: '🔧 Unlock advanced recipes',
                3: '🔧 10% resource refund',
                4: '🔧 Craft 2x items at once',
                5: '🔧 Legendary recipes unlocked'
            },
            building: {
                2: '🏗️ +50% Build speed',
                3: '🏗️ Structures cost -20%',
                4: '🏗️ Unlock fortifications',
                5: '🏗️ Mega structures available'
            },
            combat: {
                2: '⚔️ +25% Damage',
                3: '⚔️ Critical hit chance',
                4: '⚔️ +50% Damage',
                5: '⚔️ Weapon mastery unlocked'
            }
        }
        
        return benefits[skillName]?.[level] || null
    }

    getLevel(skillName) {
        return this.skills[skillName]?.level || 1
    }

    getProgress(skillName) {
        const skill = this.skills[skillName]
        if (!skill) return 0
        const requiredXP = skill.level * this.xpPerLevel
        return skill.xp / requiredXP
    }

    // Apply skill bonuses to gameplay
    getMiningBonus() {
        const level = this.getLevel('mining')
        if (level >= 4) return 2 // +2 resources
        if (level >= 2) return 1 // +1 resource
        return 0
    }

    getMiningSpeedMultiplier() {
        const level = this.getLevel('mining')
        return level >= 3 ? 1.5 : 1.0
    }

    getCombatDamageMultiplier() {
        const level = this.getLevel('combat')
        if (level >= 4) return 1.5 // +50%
        if (level >= 2) return 1.25 // +25%
        return 1.0
    }

    getCraftingRefund() {
        const level = this.getLevel('crafting')
        return level >= 3 ? 0.1 : 0 // 10% refund at level 3
    }

    getBuildingCostReduction() {
        const level = this.getLevel('building')
        return level >= 3 ? 0.2 : 0 // 20% reduction at level 3
    }

    // Check if all skills meet minimum level for era completion
    canProgressEra(minLevel = 2) {
        return Object.values(this.skills).every(skill => skill.level >= minLevel)
    }
}
