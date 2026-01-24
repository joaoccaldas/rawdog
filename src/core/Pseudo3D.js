// Pseudo-3D utilities for Brawl Stars-style rendering
export class Pseudo3D {
    constructor() {
        // Isometric angle (30 degrees for Brawl Stars style)
        this.tilt = 0.5 // Y-axis compression factor
        this.shadowOffset = { x: 2, y: 30 } // Shift shadow down-right
    }

    // Convert world coordinates to screen coordinates with perspective
    worldToScreen(worldX, worldY, worldZ = 0) {
        return {
            x: worldX,
            y: worldY * this.tilt - worldZ // Compress Y and elevate by Z
        }
    }

    // Calculate scale factor based on Y position (perspective)
    // Objects lower on screen are closer -> larger
    getScale(worldY) {
        // Base scale 1.0 at y=0, increases slightly as y increases
        // This is subtle for orthographic-ish but adds depth
        // Brawl stars is mostly ortho but has slight perspective
        return 1.0 + (worldY * 0.0001)
    }

    // Calculate depth for sorting (lower Y + higher Z = further back)
    getDepth(worldX, worldY, worldZ = 0) {
        return worldY // Simple Z-sort by Y position
    }

    // Draw shadow ellipse under entity
    drawShadow(ctx, x, y, width, height) {
        ctx.save()
        ctx.globalAlpha = 0.2
        ctx.fillStyle = '#000'
        ctx.beginPath()

        // Scale shadow based on entity size
        const shadowWidth = width * 0.6
        const shadowHeight = height * 0.2

        // Ellipse shadow at the feet
        ctx.ellipse(
            x + width / 2, // Center X
            y + height - 5, // Bottom of sprite
            shadowWidth,
            shadowHeight,
            0,
            0,
            Math.PI * 2
        )
        ctx.fill()
        ctx.restore()
    }
}
