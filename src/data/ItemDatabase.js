// Item database with sprite mappings
export const ItemDatabase = {
    // Resources from tileset
    STONE: { sheet: 'tiles', index: 3, tileSize: 1024 / 5 },
    GRASS: { sheet: 'tiles', index: 2, tileSize: 1024 / 5 },
    SAND: { sheet: 'tiles', index: 1, tileSize: 1024 / 5 },
    WATER: { sheet: 'tiles', index: 0, tileSize: 1024 / 5 },
    SNOW: { sheet: 'tiles', index: 4, tileSize: 1024 / 5 },

    // Tools from tools.png (assuming 4 tools in horizontal strip)
    STONE_PICK: { sheet: 'tools', index: 0, tileSize: 1024 / 4 },
    WOODEN_PICK: { sheet: 'tools', index: 1, tileSize: 1024 / 4 },
    AXE: { sheet: 'tools', index: 2, tileSize: 1024 / 4 },
    SPEAR: { sheet: 'tools', index: 3, tileSize: 1024 / 4 },

    // Items from items.png (assuming 8x8 grid = 64 items)
    TORCH: { sheet: 'torch', index: 0, tileSize: 1024 },
    CAMPFIRE: { sheet: 'fire', index: 0, tileSize: 1024 },
    FISH: { sheet: 'fish', index: 0, tileSize: 1024 },
    WOOD: { sheet: 'tree', index: 0, tileSize: 1024 },
    FLINT: { sheet: 'tiles', index: 6, tileSize: 1024 / 8 },
    
    // Hunt & Food Resources
    RAW_MEAT: { sheet: 'items', index: 0, tileSize: 128 },
    COOKED_MEAT: { sheet: 'items', index: 1, tileSize: 128 },
    ANIMAL_FAT: { sheet: 'items', index: 2, tileSize: 128 },
    FUR: { sheet: 'items', index: 3, tileSize: 128 },
    TOOTH: { sheet: 'items', index: 4, tileSize: 128 },
    
    // Crafting Materials
    BASKET: { sheet: 'items', index: 5, tileSize: 128 },
    CLAY_POT: { sheet: 'items', index: 6, tileSize: 128 },
    ROPE: { sheet: 'items', index: 7, tileSize: 128 },
    STICK: { sheet: 'items', index: 8, tileSize: 128 },
    
    // Art Resources
    OCHRE: { sheet: 'tiles', index: 7, tileSize: 1024 / 8 }
}

export function getItemSprite(itemName, assetLoader) {
    const item = ItemDatabase[itemName]
    if (!item) return null

    const sheet = assetLoader.get(item.sheet)
    return {
        sheet,
        sx: item.index * item.tileSize,
        sy: 0,
        sw: item.tileSize,
        sh: 1024 // Assuming all are 1024 height
    }
}
