export class AssetLoader {
    constructor() {
        this.images = {}
        this.loadedCount = 0
        this.totalCount = 0
        this.onProgress = null // Callback for progress updates
    }

    async loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = src
            img.onload = () => {
                console.log(`[AssetLoader] Loaded: ${name} (${src}) - Size: ${img.width}x${img.height}`)
                this.images[name] = img
                this.loadedCount++
                if (this.onProgress) {
                    this.onProgress(this.loadedCount, this.totalCount, name)
                }
                resolve(img)
            }
            img.onerror = (e) => {
                console.error(`[AssetLoader] Failed to load: ${name} (${src})`, e)
                this.loadedCount++
                if (this.onProgress) {
                    this.onProgress(this.loadedCount, this.totalCount, name)
                }
                reject(e)
            }
        })
    }

    get(name) {
        return this.images[name]
    }
    
    getProgress() {
        if (this.totalCount === 0) return 1
        return this.loadedCount / this.totalCount
    }

    async loadAll(assets) {
        console.log(`[AssetLoader] Loading ${assets.length} assets...`)
        this.totalCount = assets.length
        this.loadedCount = 0
        const promises = assets.map(asset => this.loadImage(asset.name, asset.src))
        return Promise.all(promises)
    }
}
