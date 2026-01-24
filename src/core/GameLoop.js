export class GameLoop {
    constructor(updateFn) {
        this.updateFn = updateFn
        this.lastTime = 0
        this.running = false
        this.loop = this.loop.bind(this)
    }

    start() {
        if (this.running) return
        this.running = true
        this.lastTime = performance.now()
        requestAnimationFrame(this.loop)
    }

    stop() {
        this.running = false
    }

    loop(currentTime) {
        if (!this.running) return
        const dt = (currentTime - this.lastTime) / 1000
        this.lastTime = currentTime

        this.updateFn(dt)

        requestAnimationFrame(this.loop)
    }
}
