export class Renderer {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true
        })
        
        this.width = 0
        this.height = 0

        this.resize()
        window.addEventListener('resize', () => this.resize())
    }

    resize() {
        // Force canvas to match window dimensions exactly
        const w = window.innerWidth
        const h = window.innerHeight
        
        this.canvas.width = w
        this.canvas.height = h
        this.canvas.style.width = w + 'px'
        this.canvas.style.height = h + 'px'
        
        // Store dimensions for drawing
        this.width = w
        this.height = h

        // Disable smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false
        
        console.log(`[Renderer] Canvas resized to ${w}x${h}`)
    }

    clear(color = '#1a1a1a') {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    drawSprite(sprite, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight, options = {}) {
        if (!sprite || !sprite.complete || sprite.width === 0) return

        this.ctx.save()

        // Apply alpha
        if (options.alpha !== undefined) {
            this.ctx.globalAlpha = options.alpha
        }

        // Flip horizontal
        if (options.flipH) {
            this.ctx.translate(dx + dWidth, dy)
            this.ctx.scale(-1, 1)
            dx = 0
            dy = 0
        }

        // Pixel art mode (crisp pixels)
        if (options.pixelArt === false) {
            this.ctx.imageSmoothingEnabled = true
            this.ctx.imageSmoothingQuality = 'high'
        }

        try {
            this.ctx.drawImage(sprite, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        } catch (e) {
            console.error('[Renderer] Sprite draw error:', e)
        }

        this.ctx.restore()

        // Reset
        this.ctx.imageSmoothingEnabled = false
    }

    drawWorld(world, camera, tilesetSprite, pseudo3D) {
        const startCol = Math.floor(camera.x / world.tileSize)
        const endCol = Math.ceil((camera.x + this.width) / world.tileSize)
        const startRow = Math.floor(camera.y / world.tileSize)
        const endRow = Math.ceil((camera.y + this.height) / world.tileSize)

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tile = world.getTile(col, row)
                if (tile === undefined || tile === null) continue

                let x = col * world.tileSize - camera.x
                let y = row * world.tileSize - camera.y
                let tileHeight = world.tileSize

                // Apply pseudo-3D perspective
                if (pseudo3D) {
                    const screenPos = pseudo3D.worldToScreen(x, y, 0)
                    y = screenPos.y
                    tileHeight = world.tileSize * 0.5
                }

                if (tilesetSprite && tilesetSprite.complete) {
                    // Use 32px tiles from tileset
                    const tilePixelSize = 32
                    const sx = tile * tilePixelSize
                    const sy = 0

                    this.drawSprite(
                        tilesetSprite,
                        sx, sy, tilePixelSize, tilePixelSize,
                        Math.floor(x), Math.floor(y),
                        world.tileSize, tileHeight,
                        { pixelArt: true }
                    )
                } else {
                    // Fallback colors: 0=water, 1=sand, 2=grass, 3=stone, 4=snow, 5=wood, 6=flint, 7=ochre, 8=stick
                    const colors = ['#4fa4b8', '#e6d5b8', '#92dc7e', '#808080', '#ffffff', '#228B22', '#FFD700', '#DC143C', '#8B4513']
                    this.drawRect(Math.floor(x), Math.floor(y), world.tileSize, tileHeight, colors[tile] || '#000')
                }
            }
        }
    }

    drawText(text, x, y, color = '#fff', font = '20px monospace') {
        this.ctx.fillStyle = color
        this.ctx.font = font
        this.ctx.fillText(text, x, y)
    }

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, w, h)
    }
}
