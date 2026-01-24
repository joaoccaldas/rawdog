export class Inventory {
    constructor(size = 30) {
        this.size = size
        this.slots = new Array(size).fill(null)
        // items map maintained for backward compatibility with systems relying on .items directly
        // but ideally they should use .get()
        this.items = {}
    }

    // Add item to inventory, prioritizing existing stacks
    add(itemId, count = 1) {
        const maxStack = 64 // Standard stack size
        let remaining = count

        // 1. Try to add to existing stacks
        for (let i = 0; i < this.size; i++) {
            if (remaining <= 0) break

            const slot = this.slots[i]
            if (slot && slot.id === itemId && slot.count < maxStack) {
                const space = maxStack - slot.count
                const addAmount = Math.min(remaining, space)
                slot.count += addAmount
                remaining -= addAmount
            }
        }

        // 2. Add to empty slots
        for (let i = 0; i < this.size; i++) {
            if (remaining <= 0) break

            if (this.slots[i] === null) {
                const addAmount = Math.min(remaining, maxStack)
                this.slots[i] = { id: itemId, count: addAmount }
                remaining -= addAmount
            }
        }

        this.updateLegacyMap()
        return remaining === 0 // Returns true if all added
    }

    // Remove item count (generic removal, not slot specific)
    remove(itemId, count = 1) {
        let remaining = count

        // Remove from last slots first (usually better feel)
        for (let i = this.size - 1; i >= 0; i--) {
            if (remaining <= 0) break

            const slot = this.slots[i]
            if (slot && slot.id === itemId) {
                if (slot.count > remaining) {
                    slot.count -= remaining
                    remaining = 0
                } else {
                    remaining -= slot.count
                    this.slots[i] = null
                }
            }
        }

        this.updateLegacyMap()
        return remaining === 0
    }

    // Get total count of an item
    get(itemId) {
        let total = 0
        for (const slot of this.slots) {
            if (slot && slot.id === itemId) {
                total += slot.count
            }
        }
        return total
    }

    // New: Swap slots (for drag and drop)
    swap(indexA, indexB) {
        if (indexA < 0 || indexA >= this.size || indexB < 0 || indexB >= this.size) return
        const temp = this.slots[indexA]
        this.slots[indexA] = this.slots[indexB]
        this.slots[indexB] = temp
        this.updateLegacyMap()
    }

    // Internal helper to keep legacy .items map in sync for old UI code
    updateLegacyMap() {
        this.items = {}
        for (const slot of this.slots) {
            if (slot) {
                if (!this.items[slot.id]) this.items[slot.id] = 0
                this.items[slot.id] += slot.count
            }
        }
    }
}
