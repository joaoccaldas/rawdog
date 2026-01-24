import { TileType } from './Tile.js'

export class World {
    constructor(tileSize = 32) {
        this.tileSize = tileSize
        this.width = 100
        this.height = 100
        this.tiles = new Array(this.width * this.height).fill(TileType.WATER)

        this.generate()
    }

    generate() {
        const tiles = this.tiles

        // Multi-octave Perlin-like noise for smooth terrain
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = y * this.width + x

                // Combine multiple noise layers for natural terrain
                const e1 = this.noise(x * 0.03, y * 0.03) * 0.5
                const e2 = this.noise(x * 0.06, y * 0.06) * 0.25
                const e3 = this.noise(x * 0.12, y * 0.12) * 0.125
                const e4 = this.noise(x * 0.24, y * 0.24) * 0.0625

                const elevation = e1 + e2 + e3 + e4

                // Moisture for biome variation
                const moisture = this.noise(x * 0.04 + 100, y * 0.04 + 100)

                // Terrain assignment with smooth transitions
                if (elevation < 0.35) {
                    tiles[idx] = TileType.WATER
                } else if (elevation < 0.42) {
                    tiles[idx] = TileType.SAND
                } else if (elevation < 0.7) {
                    // Grassland biome
                    if (moisture > 0.6 && Math.random() < 0.12) {
                        tiles[idx] = 5 // WOOD (trees in moist areas)
                    } else if (Math.random() < 0.05) {
                        tiles[idx] = 8 // STICK (fallen branches)
                    } else {
                        tiles[idx] = TileType.GRASS
                    }
                } else if (elevation < 0.82) {
                    // Rocky/mountainous
                    if (Math.random() < 0.08) {
                        tiles[idx] = 6 // FLINT (in mountains)
                    } else if (Math.random() < 0.03) {
                        tiles[idx] = 7 // OCHRE (red pigment)
                    } else {
                        tiles[idx] = TileType.STONE
                    }
                } else {
                    // High peaks
                    tiles[idx] = TileType.SNOW
                }
            }
        }
    }

    noise(x, y) {
        // Improved pseudo-Perlin noise with smoother interpolation
        const X = Math.floor(x) & 255
        const Y = Math.floor(y) & 255

        const xf = x - Math.floor(x)
        const yf = y - Math.floor(y)

        // Fade curves for smooth interpolation
        const u = this.fade(xf)
        const v = this.fade(yf)

        // Hash coordinates
        const aa = this.hash(X) + Y
        const ab = this.hash(X) + Y + 1
        const ba = this.hash(X + 1) + Y
        const bb = this.hash(X + 1) + Y + 1

        // Interpolate
        const x1 = this.lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u)
        const x2 = this.lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u)

        return (this.lerp(x1, x2, v) + 1) / 2 // Normalize to 0-1
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    lerp(a, b, t) {
        return a + t * (b - a)
    }

    hash(i) {
        // Simple hash function
        i = (i << 13) ^ i
        return ((i * (i * i * 15731 + 789221) + 1376312589) & 0x7fffffff) % 256
    }

    grad(hash, x, y) {
        // Gradient vectors
        const h = hash & 3
        const u = h < 2 ? x : y
        const v = h < 2 ? y : x
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null
        return this.tiles[y * this.width + x]
    }

    setTile(x, y, type) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return
        this.tiles[y * this.width + x] = type
    }
}
