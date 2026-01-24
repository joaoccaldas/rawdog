/**
 * TaskAssignmentUI.js - UI for assigning tasks to villagers
 */

import { UITheme } from './UITheme.js'

export class TaskAssignmentUI {
    constructor() {
        this.isOpen = false
        this.selectedNPC = null
        this.taskOptions = ['gather', 'farm', 'guard', 'rest']
        this.scrollOffset = 0
        this.npcList = [] // List of NPCs to assign tasks to
    }

    open(npcList) {
        this.isOpen = true
        this.npcList = npcList
        this.selectedNPC = npcList.length > 0 ? npcList[0] : null
        this.scrollOffset = 0
    }

    close() {
        this.isOpen = false
        this.selectedNPC = null
    }

    toggle(npcList) {
        if (this.isOpen) {
            this.close()
        } else {
            this.open(npcList)
        }
    }

    /**
     * Handle task button clicks
     */
    handleClick(event, npcIndex) {
        if (!this.isOpen || npcIndex >= this.npcList.length) return false

        const npc = this.npcList[npcIndex]
        this.selectedNPC = npc

        // Check if clicking on task buttons
        const buttonX = 300
        const buttonWidth = 100
        const buttonHeight = 30
        const spacing = 10

        if (event.x >= buttonX && event.x <= buttonX + this.taskOptions.length * (buttonWidth + spacing)) {
            const buttonIndex = Math.floor((event.x - buttonX) / (buttonWidth + spacing))
            if (buttonIndex < this.taskOptions.length) {
                npc.task = this.taskOptions[buttonIndex]
                npc.state = 'idle' // Reset state to pick up new task
                return true
            }
        }

        return false
    }

    /**
     * Get task icon emoji
     */
    getTaskIcon(task) {
        const icons = {
            gather: '🪵',
            farm: '🌾',
            guard: '⚔️',
            rest: '😴'
        }
        return icons[task] || '❓'
    }

    /**
     * Draw task assignment UI
     */
    draw(ctx, canvas) {
        if (!this.isOpen || this.npcList.length === 0) return

        const panelX = 50
        const panelY = 150
        const panelWidth = 700
        const panelHeight = 400
        const padding = 10

        // Draw panel background
        ctx.fillStyle = 'rgba(61, 37, 30, 0.95)' // Dark brown
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight)

        // Draw border
        ctx.strokeStyle = '#f2d057'
        ctx.lineWidth = 2
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

        // Draw title
        ctx.fillStyle = '#f2d057'
        ctx.font = '16px VT323'
        ctx.textAlign = 'left'
        ctx.fillText(`TASK ASSIGNMENT (${this.npcList.length} villagers)`, panelX + 15, panelY + 25)

        // Draw NPC list (left side)
        const listX = panelX + padding
        const listY = panelY + 40
        const listWidth = 150
        const npcHeight = 25
        const visibleRows = Math.floor((panelHeight - 60) / npcHeight)

        ctx.fillStyle = '#3d251e'
        ctx.fillRect(listX, listY, listWidth, visibleRows * npcHeight)
        ctx.strokeStyle = '#8b5a3c'
        ctx.lineWidth = 1
        ctx.strokeRect(listX, listY, listWidth, visibleRows * npcHeight)

        // Draw NPC entries
        for (let i = 0; i < Math.min(this.npcList.length, visibleRows); i++) {
            const npc = this.npcList[i + this.scrollOffset]
            const npcY = listY + i * npcHeight

            // Highlight selected
            if (npc === this.selectedNPC) {
                ctx.fillStyle = '#4aff4a'
                ctx.fillRect(listX, npcY, listWidth, npcHeight)
                ctx.fillStyle = '#000000'
            } else {
                ctx.fillStyle = '#e6d6ac'
            }

            ctx.font = '11px VT323'
            ctx.textAlign = 'left'
            ctx.fillText(`Villager #${npc.id}`, listX + 5, npcY + 17)
        }

        // Draw task assignment panel (right side)
        if (this.selectedNPC) {
            const taskX = listX + listWidth + 20
            const taskY = listY

            // NPC info
            ctx.fillStyle = '#e6d6ac'
            ctx.font = '12px VT323'
            ctx.textAlign = 'left'
            ctx.fillText(`Villager #${this.selectedNPC.id}`, taskX, taskY + 15)
            ctx.fillText(`Current: ${this.getTaskIcon(this.selectedNPC.task)} ${this.selectedNPC.task}`, taskX, taskY + 35)

            // Task buttons
            ctx.fillStyle = '#8b5a3c'
            ctx.font = '11px VT323'
            ctx.textAlign = 'center'

            const buttonX = taskX
            const buttonY = taskY + 60
            const buttonWidth = 85
            const buttonHeight = 30
            const spacing = 5

            for (let i = 0; i < this.taskOptions.length; i++) {
                const task = this.taskOptions[i]
                const bx = buttonX + i * (buttonWidth + spacing)
                const by = buttonY

                // Highlight current task
                if (task === this.selectedNPC.task) {
                    ctx.fillStyle = '#4aff4a'
                    ctx.fillRect(bx, by, buttonWidth, buttonHeight)
                    ctx.fillStyle = '#000000'
                } else {
                    ctx.fillStyle = '#a0a0a0'
                    ctx.fillRect(bx, by, buttonWidth, buttonHeight)
                    ctx.fillStyle = '#ffffff'
                }

                ctx.strokeStyle = '#f2d057'
                ctx.lineWidth = 1
                ctx.strokeRect(bx, by, buttonWidth, buttonHeight)

                const label = this.getTaskIcon(task)
                ctx.fillText(label + ' ' + task, bx + buttonWidth / 2, by + 22)
            }

            // Task description
            ctx.fillStyle = '#a0a0a0'
            ctx.font = '10px VT323'
            ctx.textAlign = 'left'
            const descY = buttonY + 50

            const descriptions = {
                gather: 'Collect wood and resources',
                farm: 'Plant and harvest crops',
                guard: 'Defend village from enemies',
                rest: 'Sleep and recover stamina'
            }

            ctx.fillText(descriptions[this.selectedNPC.task] || '', taskX, descY)
        }

        // Draw instructions
        ctx.fillStyle = '#a0a0a0'
        ctx.font = '9px VT323'
        ctx.textAlign = 'left'
        ctx.fillText('[T] Open/Close | Click villager to select | Click task button to assign | [ESC] Close', panelX + 10, panelY + panelHeight - 5)
    }
}

export default TaskAssignmentUI
