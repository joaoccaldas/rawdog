// Technology Tree and Era Progression Visualization using Canvas
import { UITheme } from './UITheme.js'

export class TechTreeUI {
    constructor(eraSystem) {
        this.eraSystem = eraSystem
        this.isVisible = false
        this.nodes = []
        this.offsetX = 0
        this.offsetY = 0
        this.isDragging = false
        this.lastMouseX = 0
        this.lastMouseY = 0

        this.initStructure()
    }

    initStructure() {
        // Define node positions for visualization
        // Simple linear layout for now
        this.eraSystem.eras.forEach((era, i) => {
            // Era Header Node
            this.nodes.push({
                id: `ERA_${i}`,
                type: 'era',
                label: era.name,
                x: i * 300 + 100,
                y: 100,
                color: era.color,
                unlocked: false // Updated in draw
            })

            // Unlocks under the era
            era.unlocks.forEach((unlock, j) => {
                this.nodes.push({
                    id: unlock,
                    type: 'tech',
                    label: unlock.replace('_', ' '),
                    x: i * 300 + 100,
                    y: 200 + j * 60,
                    color: '#555',
                    parent: `ERA_${i}`
                })
            })
        })
    }

    toggle() {
        this.isVisible = !this.isVisible
        return this.isVisible
    }

    draw(ctx, width, height) {
        if (!this.isVisible) return

        // 1. Background Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'
        ctx.fillRect(0, 0, width, height)

        ctx.save()
        // 2. Navigation Offset
        ctx.translate(this.offsetX + 50, this.offsetY + 50)

        // Draw Connections
        ctx.strokeStyle = '#444'
        ctx.lineWidth = 4
        this.nodes.forEach(node => {
            if (node.parent) {
                const parent = this.nodes.find(n => n.id === node.parent)
                if (parent) {
                    ctx.beginPath()
                    ctx.moveTo(parent.x, parent.y)
                    ctx.lineTo(node.x, node.y)
                    ctx.stroke()
                }
            }
        })
        
        ctx.lineWidth = 1

        // Draw Nodes
        this.nodes.forEach(node => {
             // Check unlock status
            let isUnlocked = false
            if(node.type === 'era') {
                isUnlocked = this.eraSystem.currentEra >= parseInt(node.id.split('_')[1])
            } else {
                isUnlocked = this.eraSystem.isUnlocked(node.id)
            }

            const boxW = 180
            const boxH = 40
            const x = node.x - boxW/2
            const y = node.y - boxH/2

            // Box
            ctx.fillStyle = isUnlocked ? (node.color || '#4caf50') : '#222'
            ctx.fillRect(x, y, boxW, boxH)
            
            // Border
            ctx.strokeStyle = isUnlocked ? '#fff' : '#555'
            ctx.strokeRect(x, y, boxW, boxH)

            // Text
            ctx.fillStyle = isUnlocked ? '#fff' : '#777'
            ctx.font = '16px monospace'
            ctx.textAlign = 'center'
            ctx.fillText(node.label, node.x, node.y + 5)
        })

        ctx.restore()

        // Title
        UITheme.drawPanel(ctx, 20, 20, 300, 60, { title: 'TECHNOLOGY TREE' })
        ctx.fillStyle = '#aaa'
        ctx.fillText('Drag to Pan | ESC to Close', 40, 70)
    }

    handleInput(input) {
         // Simple pan logic hooks
         // Implementation deferred to key listener in main
    }
}