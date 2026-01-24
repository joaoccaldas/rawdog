export class InputHandler {
    constructor() {
        this.keys = new Set()
        this.mouse = { x: 0, y: 0, down: false, clicked: false }

        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code)
        })

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code)
        })

        // Mouse events (canvas-relative)
        const canvas = document.querySelector('#gameCanvas')
        if (canvas) {
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect()
                this.mouse.x = e.clientX - rect.left
                this.mouse.y = e.clientY - rect.top
            })

            canvas.addEventListener('mousedown', () => {
                this.mouse.down = true
                this.mouse.clicked = true
            })

            canvas.addEventListener('mouseup', () => {
                this.mouse.down = false
            })
        }
    }

    isDown(code) {
        return this.keys.has(code)
    }

    getMouse() {
        return this.mouse
    }

    // Call this at the end of each frame to reset single-frame events
    resetFrameState() {
        this.mouse.clicked = false
    }
}
