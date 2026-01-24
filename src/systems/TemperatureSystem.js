/**
 * TemperatureSystem.js - Manages player temperature, cold effects, and warmth sources
 */

export class TemperatureSystem {
    constructor() {
        this.playerTemp = 37 // Body temperature in Celsius (37°C is normal)
        this.maxTemp = 42 // Death from hypothermia
        this.minTemp = 25 // Death from cold
        
        // Environmental factors
        this.timeOfDay = 0.5 // 0-1, 0.5 = noon
        this.isSnowing = false
        this.isRaining = false
        
        // Warmth sources
        this.nearFire = false
        this.fireWarmth = 0
        this.clothingLevel = 0 // 0-3 (none, leather, fur, heavy fur)
        
        // Status effects
        this.hypothermia = 0 // 0-100, triggers damage at 50+
        this.frostbite = false
    }

    /**
     * Update temperature based on environment and player state
     */
    update(dt, weatherSystem, worldObjects, playerX, playerY) {
        // Get environmental temperature
        const envTemp = this.getEnvironmentalTemp(weatherSystem)
        
        // Check for nearby fire
        this.nearFire = false
        this.fireWarmth = 0
        for (const obj of worldObjects) {
            if (obj.type === 'fire' || (obj.type === 'building' && obj.buildingType === 'CAMPFIRE')) {
                const dx = playerX - obj.x
                const dy = playerY - obj.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                
                if (dist < 100) {
                    this.nearFire = true
                    // Warmth decreases with distance
                    this.fireWarmth = Math.max(0, 1 - dist / 100)
                }
            }
        }
        
        // Calculate temperature change
        let tempChange = 0
        
        // Environmental cooling/heating
        const tempDiff = envTemp - this.playerTemp
        tempChange += tempDiff * 0.01 * dt // Slow convergence to environment temp
        
        // Fire/warmth bonus
        if (this.nearFire) {
            tempChange += this.fireWarmth * 0.5 * dt
        }
        
        // Clothing insulation (reduces cooling)
        const insulation = this.clothingLevel * 0.1
        tempChange *= (1 - insulation)
        
        // Apply temperature change
        this.playerTemp = Math.max(this.minTemp, Math.min(this.maxTemp, this.playerTemp + tempChange))
        
        // Update hypothermia meter
        if (this.playerTemp < 36) {
            // Mild hypothermia zone
            this.hypothermia = Math.min(100, this.hypothermia + (36 - this.playerTemp) * 2 * dt)
        } else if (this.playerTemp > 36) {
            // Recovery zone
            this.hypothermia = Math.max(0, this.hypothermia - 5 * dt)
        }
    }

    /**
     * Get environmental temperature based on weather and time
     */
    getEnvironmentalTemp(weatherSystem) {
        let baseTemp = 20 // Base comfortable temperature
        
        // Time of day adjustment
        if (weatherSystem && weatherSystem.globalLight !== undefined) {
            // Colder at night (globalLight: 0.3 night -> 1.0 noon)
            const nightFactor = (1 - weatherSystem.globalLight) * 0.7 // Up to -14°C at night
            baseTemp -= nightFactor
        }
        
        // Weather effects
        if (this.isSnowing) baseTemp -= 10
        if (this.isRaining) baseTemp -= 5
        
        return baseTemp
    }

    /**
     * Get temperature UI display
     */
    getTemperatureColor() {
        if (this.playerTemp > 39) return '#ff0000' // Overheating
        if (this.playerTemp > 37.5) return '#ff8800'
        if (this.playerTemp > 36.5) return '#4aff4a' // Normal
        if (this.playerTemp > 35) return '#4aafff' // Cold
        if (this.playerTemp < 28) return '#0055ff' // Hypothermia danger
        return '#00aaff'
    }

    /**
     * Get hypothermia severity level
     */
    getHypothermiaLevel() {
        if (this.hypothermia < 25) return 'none'
        if (this.hypothermia < 50) return 'mild'
        if (this.hypothermia < 75) return 'severe'
        return 'critical'
    }

    /**
     * Calculate cold damage per tick
     */
    getColdDamage() {
        if (this.hypothermia < 50) return 0 // No damage when mild
        if (this.hypothermia < 75) return 1 // 1 HP per second when severe
        return 3 // 3 HP per second when critical
    }

    /**
     * Add warmth (e.g., eating hot food, drinking tea)
     */
    addWarmth(amount) {
        this.playerTemp = Math.min(this.maxTemp, this.playerTemp + amount)
        this.hypothermia = Math.max(0, this.hypothermia - amount * 10)
    }
}

export default TemperatureSystem
