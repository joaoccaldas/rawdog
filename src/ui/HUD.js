import { UITheme } from './UITheme.js'

export class HUD {
    constructor(renderer, player, inventory, eraSystem, populationSystem, temperatureSystem, weatherSystem) {
        this.renderer = renderer
        this.player = player
        this.inventory = inventory
        this.eraSystem = eraSystem
        this.populationSystem = populationSystem
        this.temperatureSystem = temperatureSystem
        this.weatherSystem = weatherSystem
    }

    draw(world) { // Pass world for minimap if needed
        const ctx = this.renderer.ctx
        const canvas = this.renderer.canvas
        const w = canvas.width
        const h = canvas.height

        this.drawTopPanel(ctx)
        this.drawMinimap(ctx, world, w)
        this.drawStatusBars(ctx, h)
        this.drawBuildingMode(ctx)
        this.drawControls(ctx, h)
    }

    drawTopPanel(ctx) {
        const currentEra = this.eraSystem.getCurrentEra()

        UITheme.drawPanel(ctx, 10, 10, 320, 80, { alpha: 0.85 })

        // Era Progress (Underline bar)
        const nextEra = this.eraSystem.getNextEra()
        if (nextEra) {
            const eraProgress = this.eraSystem.getProgressToNextEra() / 100
            ctx.fillStyle = '#222'
            ctx.fillRect(20, 75, 300, 4)
            ctx.fillStyle = nextEra.color
            ctx.fillRect(20, 75, 300 * eraProgress, 4)
        }

        // Weather Icon
        this.weatherSystem.drawUI(ctx, 250, 45)

        // Text
        ctx.fillStyle = currentEra.color
        ctx.font = `bold ${UITheme.font.size.large}px ${UITheme.font.main}`
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 0; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
        ctx.fillText(currentEra.name, 25, 40)

        ctx.fillStyle = UITheme.colors.textDim
        ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
        ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        ctx.fillText(`${currentEra.year} | Pos: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`, 25, 65)
    }

    drawMinimap(ctx, world, screenW) {
        const minimapSize = 140
        const minimapX = screenW - minimapSize - 20
        const minimapY = 20
        const minimapScale = 4

        // Panel Background
        UITheme.drawPanel(ctx, minimapX - 5, minimapY - 5, minimapSize + 10, minimapSize + 10)

        // Draw terrain
        const playerTileX = Math.floor(this.player.x / 32)
        const playerTileY = Math.floor(this.player.y / 32)
        const halfRange = Math.floor(minimapSize / 2 / minimapScale)

        // Optimization: Don't draw every frame? Or optimize loop?
        // For now, keep as is but limit range strictly
        for (let dy = -halfRange; dy <= halfRange; dy++) {
            for (let dx = -halfRange; dx <= halfRange; dx++) {
                const tile = world.getTile(playerTileX + dx, playerTileY + dy)
                // Colors: 0=water, 1=sand, 2=grass, 3=stone, 4=snow, 5=wood...
                const colors = ['#4fa4b8', '#e6d5b8', '#92dc7e', '#757161', '#ffffff', '#228B22', '#FFD700', '#DC143C', '#8B4513']

                ctx.fillStyle = colors[tile] || '#000'
                ctx.fillRect(
                    minimapX + (dx + halfRange) * minimapScale,
                    minimapY + (dy + halfRange) * minimapScale,
                    minimapScale, minimapScale
                )
            }
        }

        // Player Marker
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(minimapX + minimapSize / 2 - 3, minimapY + minimapSize / 2 - 3, 6, 6)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.strokeRect(minimapX + minimapSize / 2 - 3, minimapY + minimapSize / 2 - 3, 6, 6)
    }

    drawStatusBars(ctx, screenH) {
        const barW = 220
        const barH = 24
        const bottomY = screenH - 20

        // Health
        UITheme.drawBar(ctx, 20, bottomY - 60, barW, barH, this.player.health, this.player.maxHealth, UITheme.colors.danger, 'HP')

        // Hunger
        UITheme.drawBar(ctx, 20, bottomY - 28, barW, barH, this.player.hunger, this.player.maxHunger, UITheme.colors.warning, 'Food')

        // Temperature (Hypothermia)
        const tempColor = this.temperatureSystem.getTemperatureColor()
        const hypothermia = Math.max(0, Math.min(100, this.temperatureSystem.hypothermia))

        ctx.fillStyle = '#1a1a1a'
        ctx.fillRect(20, bottomY + 6, barW, 10)
        if (hypothermia > 0) {
            ctx.fillStyle = tempColor
            ctx.fillRect(20, bottomY + 6, (barW * hypothermia) / 100, 10)
        }
        ctx.strokeStyle = '#444'
        ctx.strokeRect(20, bottomY + 6, barW, 10)

        ctx.fillStyle = '#aaa'
        ctx.font = '10px monospace'
        ctx.fillText('COLD', 20, bottomY + 26)
        ctx.textAlign = 'right'
        ctx.fillText('FREEZING', 20 + barW, bottomY + 26)
        ctx.textAlign = 'left'

        // Population Count (Above bars)
        ctx.fillStyle = UITheme.colors.info
        ctx.font = `bold ${UITheme.font.size.normal}px ${UITheme.font.main}`
        ctx.shadowColor = 'black'; ctx.shadowBlur = 2;
        ctx.fillText(`👥 Pop: ${this.populationSystem.getPopulation()}/${this.populationSystem.maxPopulation}`, 20, bottomY - 75)
        ctx.shadowBlur = 0;
    }

    drawBuildingMode(ctx) {
        // Needs access to building system? Or pass simple state?
        // Since main.js handles building system toggle, passing state via update or constructor is complex if state changes.
        // For now, main.js can check and draw this part if needed, or we expose a method `drawBuildingInfo(buildingSystem)`
    }
}
