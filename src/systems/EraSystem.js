// Era progression and technology system
export class EraSystem {
    constructor(notificationManager = null, skillSystem = null) {
        this.notificationManager = notificationManager
        this.skillSystem = skillSystem
        this.currentEra = 0
        this.eraProgress = 0
        
        this.eras = [
            {
                id: 0,
                name: 'Cave Age',
                year: '300,000 BCE',
                description: 'The dawn of humanity. Survive and discover fire.',
                unlocks: ['STONE_PICK', 'STONE_AXE', 'SPEAR', 'CAMPFIRE', 'TORCH'],
                requirements: {
                    discoveries: ['fire'],
                    buildings: ['CAMPFIRE'],
                    skills: { mining: 1, crafting: 1 }
                },
                color: '#8B4513'
            },
            {
                id: 1,
                name: 'Stone Villages',
                year: '10,000 BCE',
                description: 'Settle down. Plant seeds. Build communities.',
                unlocks: ['FARM', 'CLAY_POT', 'WHEAT', 'BREAD', 'BARN', 'HOUSE'],
                requirements: {
                    population: 5,
                    buildings: ['HOUSE', 'FARM'],
                    skills: { building: 2, crafting: 2 }
                },
                color: '#D2B48C'
            },
            {
                id: 2,
                name: 'Bronze Age',
                year: '3,000 BCE',
                description: 'Forge metal. Write history. Trade with others.',
                unlocks: ['BRONZE_PICK', 'BRONZE_SWORD', 'FORGE', 'ANVIL', 'WHEEL', 'CART'],
                requirements: {
                    population: 20,
                    discoveries: ['bronze'],
                    buildings: ['FORGE'],
                    skills: { mining: 3, crafting: 3, combat: 2 }
                },
                color: '#CD7F32'
            },
            {
                id: 3,
                name: 'Iron Age',
                year: '1,200 BCE',
                description: 'Master iron. Expand territory. Build empires.',
                unlocks: ['IRON_TOOLS', 'IRON_ARMOR', 'CASTLE_WALLS', 'MARKET', 'LIBRARY'],
                requirements: {
                    population: 50,
                    discoveries: ['iron'],
                    buildings: ['LIBRARY', 'MARKET'],
                    skills: { building: 4, combat: 3 }
                },
                color: '#708090'
            },
            {
                id: 4,
                name: 'Medieval Era',
                year: '1,000 CE',
                description: 'Knights and castles. Guilds and kingdoms.',
                unlocks: ['STEEL_TOOLS', 'PLATE_ARMOR', 'CASTLE', 'CATHEDRAL', 'WINDMILL'],
                requirements: {
                    population: 100,
                    buildings: ['CASTLE', 'CATHEDRAL'],
                    skills: { building: 5, combat: 4 }
                },
                color: '#4169E1'
            },
            {
                id: 5,
                name: 'Industrial Revolution',
                year: '1,800 CE',
                description: 'Steam power. Machines. Mass production.',
                unlocks: ['STEAM_ENGINE', 'FACTORY', 'RAILROAD', 'TELEGRAPH'],
                requirements: {
                    population: 500,
                    discoveries: ['steam', 'electricity'],
                    buildings: ['FACTORY'],
                    skills: { building: 6, crafting: 5 }
                },
                color: '#2F4F4F'
            },
            {
                id: 6,
                name: 'Modern Age',
                year: '2,000 CE',
                description: 'Computers. Internet. Global civilization.',
                unlocks: ['COMPUTER', 'SOLAR_PANEL', 'RESEARCH_LAB', 'SPACEPORT'],
                requirements: {
                    population: 1000,
                    discoveries: ['electricity', 'computing'],
                    buildings: ['RESEARCH_LAB'],
                    skills: { building: 8, crafting: 7 }
                },
                color: '#00CED1'
            },
            {
                id: 7,
                name: 'Future',
                year: '2,100 CE',
                description: 'AI. Space colonies. Transcendence.',
                unlocks: ['AI_CORE', 'FUSION_REACTOR', 'SPACE_ELEVATOR', 'MIND_UPLOAD'],
                requirements: {
                    population: 5000,
                    discoveries: ['AI', 'fusion'],
                    buildings: ['SPACEPORT', 'AI_CORE'],
                    skills: { building: 10, crafting: 10, combat: 8 }
                },
                color: '#9400D3'
            }
        ]

        this.discoveries = new Set()
    }

    getCurrentEra() {
        return this.eras[this.currentEra]
    }

    getNextEra() {
        return this.eras[this.currentEra + 1] || null
    }

    checkProgress(gameState) {
        const nextEra = this.getNextEra()
        if (!nextEra) return false // Max era reached

        const req = nextEra.requirements
        let met = 0
        let total = 0

        // Check skills
        if (req.skills) {
            for (const [skill, minLevel] of Object.entries(req.skills)) {
                total++
                if (this.skillSystem && this.skillSystem.getLevel(skill) >= minLevel) {
                    met++
                }
            }
        }

        // Check discoveries
        if (req.discoveries) {
            total += req.discoveries.length
            for (const discovery of req.discoveries) {
                if (this.discoveries.has(discovery)) met++
            }
        }

        // Check buildings (simplified - check inventory has crafted them)
        if (req.buildings) {
            total += req.buildings.length
            for (const building of req.buildings) {
                if (gameState.inventory.get(building) > 0) met++
            }
        }

        // Calculate progress
        this.eraProgress = total > 0 ? met / total : 0

        // Advance if all requirements met
        if (this.eraProgress >= 1.0 && met === total) {
            this.advanceEra()
            return true
        }

        return false
    }

    getProgressToNextEra() {
        // Calculate progress percentage to next era based on requirements
        if (this.currentEra >= this.eras.length - 1) return 100

        const nextEra = this.eras[this.currentEra + 1]
        let totalChecks = 0
        let passedChecks = 0

        // Check skill requirements
        if (nextEra.requirements.skills) {
            Object.keys(nextEra.requirements.skills).forEach(skill => {
                totalChecks++
                const requiredLevel = nextEra.requirements.skills[skill]
                const currentLevel = this.skillSystem ? this.skillSystem.getLevel(skill) : 1
                if (currentLevel >= requiredLevel) passedChecks++
            })
        }

        // Check discovery requirements
        if (nextEra.requirements.discoveries) {
            totalChecks += nextEra.requirements.discoveries.length
            nextEra.requirements.discoveries.forEach(discovery => {
                if (this.discoveries.has(discovery)) passedChecks++
            })
        }

        // Check building requirements  
        if (nextEra.requirements.buildings) {
            totalChecks += nextEra.requirements.buildings.length
        }

        // Check population requirement
        if (nextEra.requirements.population) {
            totalChecks++
        }

        return totalChecks > 0 ? Math.floor((passedChecks / totalChecks) * 100) : 0
    }

    advanceEra() {
        const oldEra = this.getCurrentEra()
        this.currentEra++
        const newEra = this.getCurrentEra()

        console.log(`═══════════════════════════════════════════════════`)
        console.log(`🎊 ERA ADVANCED: ${newEra.name}`)
        console.log(`Year: ${newEra.year}`)
        console.log(`${newEra.description}`)
        console.log(`Unlocked: ${newEra.unlocks.join(', ')}`)
        console.log(`═══════════════════════════════════════════════════`)

        if (this.notificationManager) {
            this.notificationManager.show(
                `🎊 Welcome to ${newEra.name}!`,
                5000,
                newEra.color
            )
            setTimeout(() => {
                this.notificationManager.show(
                    newEra.description,
                    4000,
                    '#FFD700'
                )
            }, 1000)
        }

        this.eraProgress = 0
    }

    addDiscovery(discoveryId) {
        if (!this.discoveries.has(discoveryId)) {
            this.discoveries.add(discoveryId)
            console.log(`[Discovery] ${discoveryId}`)
            
            if (this.notificationManager) {
                this.notificationManager.show(
                    `💡 Discovery: ${discoveryId.toUpperCase()}!`,
                    3000,
                    '#4aff4a'
                )
            }
        }
    }

    isUnlocked(itemId) {
        for (let i = 0; i <= this.currentEra; i++) {
            if (this.eras[i].unlocks.includes(itemId)) {
                return true
            }
        }
        return false
    }
}
