// Chunk-based infinite world system
export class ChunkManager {
    constructor(tileSize = 32) {
        this.tileSize = tileSize
        this.chunkSize = 32 // 32x32 tiles per chunk
        this.chunks = new Map() // key: "x,y" -> Chunk
        this.seed = Date.now() // World seed for consistent generation
        
        // SPAWN ISLAND - these tile coordinates will ALWAYS be grass
        this.spawnTileX = 50 // 1600 pixels / 32 = 50
        this.spawnTileY = 50
        this.spawnRadius = 5 // 5 tile radius of guaranteed grass
    }

    getChunkKey(chunkX, chunkY) {
        return `${chunkX},${chunkY}`
    }

    worldToChunk(worldX, worldY) {
        const chunkX = Math.floor(worldX / (this.chunkSize * this.tileSize))
        const chunkY = Math.floor(worldY / (this.chunkSize * this.tileSize))
        return { chunkX, chunkY }
    }

    getOrCreateChunk(chunkX, chunkY) {
        const key = this.getChunkKey(chunkX, chunkY)
        
        if (!this.chunks.has(key)) {
            this.chunks.set(key, this.generateChunk(chunkX, chunkY))
        }
        
        return this.chunks.get(key)
    }

    generateChunk(chunkX, chunkY) {
        const tiles = new Array(this.chunkSize * this.chunkSize)
        
        // Offset for this chunk in world tile coordinates
        const offsetX = chunkX * this.chunkSize
        const offsetY = chunkY * this.chunkSize

        for (let y = 0; y < this.chunkSize; y++) {
            for (let x = 0; x < this.chunkSize; x++) {
                const worldTileX = offsetX + x
                const worldTileY = offsetY + y
                
                // CHECK: Is this tile within spawn island?
                const distToSpawn = Math.sqrt(
                    Math.pow(worldTileX - this.spawnTileX, 2) + 
                    Math.pow(worldTileY - this.spawnTileY, 2)
                )
                
                if (distToSpawn <= this.spawnRadius) {
                    // FORCE GRASS at spawn island
                    tiles[y * this.chunkSize + x] = 2 // GRASS
                } else {
                    // Normal terrain generation
                    const elevation = this.getElevation(worldTileX, worldTileY)
                    const moisture = this.getMoisture(worldTileX, worldTileY)
                    tiles[y * this.chunkSize + x] = this.getTileFromNoise(elevation, moisture)
                }
            }
        }

        return {
            chunkX,
            chunkY,
            tiles,
            generated: Date.now()
        }
    }

    getElevation(x, y) {
        // Multi-octave noise
        const e1 = this.noise(x * 0.03, y * 0.03) * 0.5
        const e2 = this.noise(x * 0.06, y * 0.06) * 0.25
        const e3 = this.noise(x * 0.12, y * 0.12) * 0.125
        const e4 = this.noise(x * 0.24, y * 0.24) * 0.0625
        return e1 + e2 + e3 + e4
    }

    getMoisture(x, y) {
        return this.noise(x * 0.04 + 100, y * 0.04 + 100)
    }

    getTileFromNoise(elevation, moisture) {
        // Biome generation based on elevation + moisture
        // Reduced water threshold for more land
        if (elevation < 0.25) return 0 // WATER (was 0.35)
        if (elevation < 0.35) return 1 // SAND (beach/shore)
        
        if (elevation < 0.7) {
            // Grassland/forest biome
            if (moisture > 0.6 && Math.random() < 0.12) return 5 // WOOD
            if (Math.random() < 0.05) return 8 // STICK
            return 2 // GRASS
        }
        
        if (elevation < 0.82) {
            // Mountains
            if (Math.random() < 0.08) return 6 // FLINT
            if (Math.random() < 0.03) return 7 // OCHRE
            return 3 // STONE
        }
        
        return 4 // SNOW
    }

    // Get tile at pixel coordinates (for player collision, etc)
    getTileAtPixel(worldX, worldY) {
        const tileX = Math.floor(worldX / this.tileSize)
        const tileY = Math.floor(worldY / this.tileSize)
        return this.getTile(tileX, tileY)
    }

    // Get tile at tile coordinates (for renderer)
    getTile(tileX, tileY) {
        const worldX = tileX * this.tileSize
        const worldY = tileY * this.tileSize
        
        const { chunkX, chunkY } = this.worldToChunk(worldX, worldY)
        const chunk = this.getOrCreateChunk(chunkX, chunkY)
        
        const localX = tileX - (chunkX * this.chunkSize)
        const localY = tileY - (chunkY * this.chunkSize)
        
        if (localX < 0 || localX >= this.chunkSize || localY < 0 || localY >= this.chunkSize) {
            return null
        }
        
        return chunk.tiles[localY * this.chunkSize + localX]
    }

    setTile(tileX, tileY, tileType) {
        const worldX = tileX * this.tileSize
        const worldY = tileY * this.tileSize
        
        const { chunkX, chunkY } = this.worldToChunk(worldX, worldY)
        const chunk = this.getOrCreateChunk(chunkX, chunkY)
        
        const localX = tileX - (chunkX * this.chunkSize)
        const localY = tileY - (chunkY * this.chunkSize)
        
        if (localX >= 0 && localX < this.chunkSize && localY >= 0 && localY < this.chunkSize) {
            chunk.tiles[localY * this.chunkSize + localX] = tileType
        }
    }

    // Load chunks around player position
    loadChunksAround(playerX, playerY, radius = 2) {
        const { chunkX, chunkY } = this.worldToChunk(playerX, playerY)
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                this.getOrCreateChunk(chunkX + dx, chunkY + dy)
            }
        }
    }

    // Unload distant chunks to save memory
    unloadDistantChunks(playerX, playerY, radius = 3) {
        const { chunkX: playerChunkX, chunkY: playerChunkY } = this.worldToChunk(playerX, playerY)
        const toRemove = []
        
        for (const [key, chunk] of this.chunks) {
            const dx = Math.abs(chunk.chunkX - playerChunkX)
            const dy = Math.abs(chunk.chunkY - playerChunkY)
            
            if (dx > radius || dy > radius) {
                toRemove.push(key)
            }
        }
        
        toRemove.forEach(key => {
            this.chunks.delete(key)
            console.log(`[ChunkManager] Unloaded chunk ${key}`)
        })
    }

    // Noise function (same as World.js)
    noise(x, y) {
        const X = Math.floor(x) & 255
        const Y = Math.floor(y) & 255
        const xf = x - Math.floor(x)
        const yf = y - Math.floor(y)
        const u = this.fade(xf)
        const v = this.fade(yf)
        const aa = this.hash(X) + Y
        const ab = this.hash(X) + Y + 1
        const ba = this.hash(X + 1) + Y
        const bb = this.hash(X + 1) + Y + 1
        const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u)
        const x2 = this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u)
        return (this.lerp(x1, x2, v) + 1) / 2
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    lerp(a, b, t) {
        return a + t * (b - a)
    }

    hash(i) {
        i = (i << 13) ^ i
        return ((i * (i * i * 15731 + 789221) + 1376312589 + this.seed) & 0x7fffffff) % 256
    }

    grad(hash, x, y) {
        const h = hash & 3
        const u = h < 2 ? x : y
        const v = h < 2 ? y : x
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
    }
}
