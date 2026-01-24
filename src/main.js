import './style.css'
import '@fontsource/vt323' // Pixel art font
import { GameLoop } from './core/GameLoop.js'
import { UITheme } from './ui/UITheme.js'
import { Renderer } from './core/Renderer.js'
import { InputHandler } from './core/InputHandler.js'
import { Player } from './entities/Player.js'
import { World } from './world/World.js'
import { ChunkManager } from './world/ChunkManager.js'
import { WorldObject } from './world/WorldObject.js'
import { Camera } from './world/Camera.js'
import { TileColors } from './world/Tile.js'
import { AssetLoader } from './core/AssetLoader.js'
import { Inventory } from './systems/Inventory.js'
import { ToolSystem } from './systems/ToolSystem.js'
import { Pseudo3D } from './core/Pseudo3D.js'
import { QuestManager } from './systems/QuestManager.js'
import { createCaveQuests } from './systems/CaveQuests.js'
import { MainMenu } from './scenes/MainMenu.js'
import { CraftingUI } from './ui/CraftingUI.js'
import { NotificationManager } from './ui/NotificationManager.js'
import { getItemSprite } from './data/ItemDatabase.js'
import { SkillSystem } from './systems/SkillSystem.js'
import { FloatingText } from './ui/FloatingText.js'
import { InGameMenu } from './ui/InGameMenu.js'
import { TutorialSystem } from './ui/TutorialSystem.js'
import { BuildingSystem } from './systems/BuildingSystem.js'
import { Enemy } from './entities/Enemy.js'
import { ParticleSystem } from './core/ParticleSystem.js'
import { SaveSystem } from './systems/SaveSystem.js'
import { EraSystem } from './systems/EraSystem.js'
import { PopulationSystem } from './systems/PopulationSystem.js'
import { WeatherSystem } from './systems/WeatherSystem.js'
import { FarmingSystem } from './systems/FarmingSystem.js'
import { TechTreeUI } from './ui/TechTreeUI.js'
import { ChestSystem } from './systems/ChestSystem.js'
import { ChestUI } from './ui/ChestUI.js'
import { TaskAssignmentUI } from './ui/TaskAssignmentUI.js'
import { TemperatureSystem } from './systems/TemperatureSystem.js'
import { audioManager } from './core/AudioManager.js'
import { HUD } from './ui/HUD.js'
import { InventoryUI } from './ui/InventoryUI.js'
import { HotbarUI } from './ui/HotbarUI.js'

// Assets
import playerSpriteUrl from './assets/sprites/player/player_caveman.png'
import tilesSpriteUrl from './assets/sprites/tiles.png'
import itemsSpriteUrl from './assets/sprites/items.png'
import enemySpriteUrl from './assets/sprites/enemy_raptor.png'
import toolsSpriteUrl from './assets/sprites/tools.png'
import fireSpriteUrl from './assets/sprites/fire.png'
import torchSpriteUrl from './assets/sprites/torch.png'
import treeSpriteUrl from './assets/sprites/tree.png'
import cropsSpriteUrl from './assets/sprites/crops.png'
import fishSpriteUrl from './assets/sprites/fish.png'
import mammothSpriteUrl from './assets/sprites/mammoth.png'
import npcSpriteUrl from './assets/sprites/npc_tribal.png'
import caveEntranceUrl from './assets/sprites/cave_entrance.png'
import wolfSpriteUrl from './assets/sprites/wolf.png'
import bearSpriteUrl from './assets/sprites/bear.png'
import deerSpriteUrl from './assets/sprites/deer.png'
import weaponsSpriteUrl from './assets/sprites/weapons.png'
import shelterSpriteUrl from './assets/sprites/shelter.png'

const canvas = document.querySelector('#gameCanvas')

// Use ChunkManager for infinite world
const world = new ChunkManager()
const renderer = new Renderer(canvas)
const input = new InputHandler()
const camera = new Camera(window.innerWidth, window.innerHeight)
const assetLoader = new AssetLoader()

// Systems
const inventory = new Inventory()
const toolSystem = new ToolSystem(inventory)
const pseudo3D = new Pseudo3D()
const notificationManager = new NotificationManager({ ctx: null, canvas })
const skillSystem = new SkillSystem(notificationManager)
const questManager = new QuestManager(notificationManager)
const mainMenu = new MainMenu({ ctx: null, canvas }, input)
const floatingText = new FloatingText()
const eraSystem = new EraSystem(notificationManager, skillSystem)
const populationSystem = new PopulationSystem(world)
const particles = new ParticleSystem()
const saveSystem = new SaveSystem()
const tutorialSystem = new TutorialSystem(notificationManager)
const weatherSystem = new WeatherSystem(renderer)
const farmingSystem = new FarmingSystem(world, inventory)
const techTreeUI = new TechTreeUI(eraSystem)
const temperatureSystem = new TemperatureSystem()

// Initialize UI systems BEFORE game loop
const craftingUI = new CraftingUI(renderer, toolSystem, inventory, questManager, skillSystem, input)
const inGameMenu = new InGameMenu(renderer, input)
const chestSystem = new ChestSystem()
const chestUI = new ChestUI()
const taskAssignmentUI = new TaskAssignmentUI()
const buildingSystem = new BuildingSystem(world, inventory, skillSystem, chestSystem)



// Enemy management
const enemies = []
let enemySpawnTimer = 0
const ENEMY_SPAWN_INTERVAL = 30000 // Spawn every 30 seconds

// World objects (cave entrances, trees, resources)
const worldObjects = []

// Tree/Resource spawning function
function spawnWorldObjects(centerX, centerY, radius = 10) {
    const tileSize = 32
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const tileX = Math.floor(centerX / tileSize) + dx
            const tileY = Math.floor(centerY / tileSize) + dy
            const tile = world.getTile(tileX, tileY)

            // Spawn trees on WOOD tiles (5)
            if (tile === 5 && Math.random() < 0.7) {
                const objX = tileX * tileSize + tileSize / 2
                const objY = tileY * tileSize + tileSize / 2
                // Check if object already exists nearby
                const exists = worldObjects.some(obj =>
                    Math.abs(obj.x - objX) < tileSize && Math.abs(obj.y - objY) < tileSize
                )
                if (!exists) {
                    const tree = new WorldObject(objX, objY, 'tree', null)
                    tree.resourceType = 'WOOD'
                    tree.resourceAmount = 3 + Math.floor(Math.random() * 3)
                    worldObjects.push(tree)
                }
            }
        }
    }
}

// Day/Night cycle
let dayTime = 0.5 // 0-1, 0.5 = noon
let daySpeed = 0.01 // Full day cycle speed

// SPAWN SYSTEM - GUARANTEED GRASS
const SPAWN_TILE_X = 50
const SPAWN_TILE_Y = 50
let spawnX = SPAWN_TILE_X * 32 + 16
let spawnY = SPAWN_TILE_Y * 32 + 16

// 1. Load chunks around spawn
world.loadChunksAround(spawnX, spawnY, 4)

// 2. Force grass in spawn area
for (let dy = -10; dy <= 10; dy++) {
    for (let dx = -10; dx <= 10; dx++) {
        world.setTile(SPAWN_TILE_X + dx, SPAWN_TILE_Y + dy, 2)
    }
}

// 3. Add decorations
for (let dy = -8; dy <= 8; dy++) {
    for (let dx = -8; dx <= 8; dx++) {
        if (Math.random() < 0.03) world.setTile(SPAWN_TILE_X + dx, SPAWN_TILE_Y + dy, 5)
        if (Math.random() < 0.02) world.setTile(SPAWN_TILE_X + dx, SPAWN_TILE_Y + dy, 8)
    }
}

// 4. Create player at center of spawn tile
const player = new Player(spawnX, spawnY, inventory, toolSystem, questManager, skillSystem, floatingText, camera, particles)

// New UI Systems
const hud = new HUD(renderer, player, inventory, eraSystem, populationSystem, temperatureSystem, weatherSystem)
const inventoryUI = new InventoryUI(inventory, renderer, input)
const hotbarUI = new HotbarUI(inventory, toolSystem, renderer, input)

// Loading screen state
let isLoading = true
let loadingMessage = 'Loading assets...'

// Draw loading screen
function drawLoadingScreen() {
    const ctx = renderer.ctx
    const w = renderer.canvas.width
    const h = renderer.canvas.height

    // Background
    ctx.fillStyle = UITheme.colors.backgroundDark
    ctx.fillRect(0, 0, w, h)

    // Title
    ctx.fillStyle = UITheme.colors.warning
    ctx.font = `bold ${UITheme.font.size.title}px ${UITheme.font.main}`
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 10
    ctx.fillText('THE PROGENITOR', w / 2, h / 2 - 80)
    ctx.shadowBlur = 0

    // Panel behind bar
    UITheme.drawPanel(ctx, w / 2 - 200, h / 2 - 20, 400, 100, { alpha: 1 })

    // Loading bar background
    ctx.fillStyle = '#000'
    ctx.fillRect(w / 2 - 150, h / 2 + 20, 300, 20)

    // Loading bar progress
    const progress = assetLoader.getProgress()
    ctx.fillStyle = UITheme.colors.success
    ctx.fillRect(w / 2 - 150, h / 2 + 20, 300 * progress, 20)

    // Texture overlay on bar
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(w / 2 - 150, h / 2 + 20, 300 * progress, 10)

    // Loading text
    ctx.fillStyle = UITheme.colors.secondary
    ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
    ctx.fillText(loadingMessage, w / 2, h / 2 + 65)
    ctx.fillText(`${Math.round(progress * 100)}%`, w / 2 + 180, h / 2 + 35)

    ctx.textAlign = 'left'
}

// Progress callback
assetLoader.onProgress = (loaded, total, name) => {
    loadingMessage = `Loading: ${name}...`
}

// Asset loading
assetLoader.loadAll([
    { name: 'player', src: playerSpriteUrl },
    { name: 'tiles', src: tilesSpriteUrl },
    { name: 'items', src: itemsSpriteUrl },
    { name: 'enemy_raptor', src: enemySpriteUrl },
    { name: 'tools', src: toolsSpriteUrl },
    { name: 'fire', src: fireSpriteUrl },
    { name: 'torch', src: torchSpriteUrl },
    { name: 'tree', src: treeSpriteUrl },
    { name: 'crops', src: cropsSpriteUrl },
    { name: 'fish', src: fishSpriteUrl },
    { name: 'mammoth', src: mammothSpriteUrl },
    { name: 'npc_tribal', src: npcSpriteUrl },
    { name: 'cave_entrance', src: caveEntranceUrl },
    { name: 'wolf', src: wolfSpriteUrl },
    { name: 'bear', src: bearSpriteUrl },
    { name: 'deer', src: deerSpriteUrl },
    { name: 'weapons', src: weaponsSpriteUrl },
    { name: 'shelter', src: shelterSpriteUrl }
]).then(() => {
    console.log("[Main] All assets loaded. Starting menu.")
    isLoading = false

    // Give menu access to renderer
    mainMenu.renderer = renderer
    notificationManager.renderer = renderer

    // Game state
    let gameStarted = false
    let playerGender = 'male'
    let isDead = false
    let deathTimer = 0
    const DEATH_SCREEN_DURATION = 3 // seconds
    let autoSaveTimer = 0
    const AUTO_SAVE_INTERVAL = 60 // Auto-save every 60 seconds

    // Menu callback
    mainMenu.onStart = (gender) => {
        gameStarted = true
        playerGender = gender
        console.log(`[Main] Game started as ${gender}`)

        // Initialize quests when game starts
        createCaveQuests(inventory, toolSystem, questManager)
        questManager.startQuest('fire_discovery')

        // Spawn initial world objects (trees) around player
        spawnWorldObjects(player.x, player.y, 15)

        // Show farming tutorial
        setTimeout(() => {
            notificationManager.show('🌱 NEW: Press [C] to craft a HOE, then press [6] to equip it!', 4000, '#76d16d')
            setTimeout(() => {
                notificationManager.show('🌾 Right-click grass with HOE to plant wheat. Left-click mature crops to harvest!', 4000, '#f2d057')
            }, 4500)
        }, 1500)

        // Try to load save data
        const saveData = saveSystem.load()
        if (saveData) {
            const gameState = { player, inventory, skillSystem, toolSystem, questManager }
            if (saveSystem.applySaveData(gameState, saveData)) {
                notificationManager.show('💾 Game loaded!', 3000, '#4aff4a')
            }
        }
    }

    const gameLoop = new GameLoop((dt) => {
        renderer.clear('#4fa4b8') // Water blue background

        // Debug: Log canvas dimensions on first frame
        if (!window.__canvasLogged) {
            console.log(`[Game Loop] Canvas: ${renderer.canvas.width}x${renderer.canvas.height}, Window: ${window.innerWidth}x${window.innerHeight}`)
            window.__canvasLogged = true
        }

        // DEBUG: periodic log
        if (!window.__perLog) window.__perLog = 0
        window.__perLog += dt
        if (window.__perLog > 2.0) {
            console.log(`[DEBUG] Player: ${Math.round(player.x)},${Math.round(player.y)} | Camera: ${Math.round(camera.x)},${Math.round(camera.y)} | Tiles: ${assetLoader.get('tiles') ? 'OK' : 'MISSING'}`)
            window.__perLog = 0
        }

        // Show loading screen while assets load
        if (isLoading) {
            drawLoadingScreen()
            return
        }

        // Show menu or game
        if (!gameStarted) {
            mainMenu.update(dt)
            mainMenu.draw()
            return
        }

        // === GAME CONTROLS === 

        // Tech Tree Toggle
        if (input.keys.has('t')) {
            input.keys.delete('t')
            techTreeUI.toggle()
        }

        // Task Assignment Toggle (Y key)
        if (input.keys.has('y') && populationSystem.npcs.length > 0) {
            input.keys.delete('y')
            taskAssignmentUI.toggle(populationSystem.npcs)
        }

        // ESC key: Close crafting first, then toggle menu
        if (input.keys.has('Escape')) {
            input.keys.delete('Escape')
            if (techTreeUI.isVisible) {
                techTreeUI.toggle()
            } else if (taskAssignmentUI.isOpen) {
                taskAssignmentUI.close()
            } else if (chestUI.isOpen) {
                chestUI.close()
            } else if (craftingUI.isOpen) {
                craftingUI.toggle()
            } else {
                inGameMenu.toggle()
            }
        }

        // F5 key: Quick save
        if (input.keys.has('F5')) {
            input.keys.delete('F5')
            const gameState = { player, inventory, skillSystem, toolSystem, questManager }
            if (saveSystem.save(gameState)) {
                notificationManager.show('💾 Game Saved!', 2000, '#4aff4a')
            }
        }

        // F9 key: Quick load
        if (input.keys.has('F9')) {
            input.keys.delete('F9')
            const saveData = saveSystem.load()
            if (saveData) {
                const gameState = { player, inventory, skillSystem, toolSystem, questManager }
                if (saveSystem.applySaveData(gameState, saveData)) {
                    notificationManager.show('💾 Game Loaded!', 2000, '#4aff4a')
                }
            }
        }

        // Auto-save system
        autoSaveTimer += dt
        if (autoSaveTimer >= AUTO_SAVE_INTERVAL) {
            const gameState = { player, inventory, skillSystem, toolSystem, questManager }
            if (saveSystem.save(gameState)) {
                notificationManager.show('💾 Auto-saved', 1500, '#888')
            }
            autoSaveTimer = 0
        }

        // If menu is open, only draw static background and menu
        if (inGameMenu.isOpen) {
            inGameMenu.update(dt)
            // Draw world/player as background
            renderer.drawWorld(world, camera, assetLoader.get('tiles'), pseudo3D)
            player.draw(renderer, camera, assetLoader.get('player'), pseudo3D)
            inGameMenu.draw()
            return
        }

        // C key: Toggle crafting (only when menu is closed)
        if (input.keys.has('KeyC') && !craftingUI.isOpen) {
            input.keys.delete('KeyC')
            craftingUI.toggle()
        }

        // TAB or I: Toggle Inventory
        if (input.keys.has('Tab') || input.keys.has('KeyI')) {
            input.keys.delete('Tab')
            input.keys.delete('KeyI')
            inventoryUI.toggle()
        }

        // B key: Toggle building mode
        if (input.keys.has('KeyB')) {
            input.keys.delete('KeyB')
            buildingSystem.toggleBuildingMode()
        }

        // Tab key cycle block type ONLY if building mode is open (override inventory toggle if building??)
        // Better: Use R to cycle block if B is active
        if (input.keys.has('KeyR') && buildingSystem.buildingMode) {
            input.keys.delete('KeyR')
            buildingSystem.cycleBlockType()
        }

        // Update UI Logic
        hotbarUI.update(dt)
        inventoryUI.update(dt)

        // Update crafting UI if open
        if (craftingUI.isOpen) {
            craftingUI.update(dt)
        } else if (!inventoryUI.isOpen) { // Only process game actions if inventory closed
            // Tool switching with number keys handled by hotbarUI.update()

            // Food consumption with E key OR interact with world objects/chests
            if (input.keys.has('KeyE')) {
                input.keys.delete('KeyE')

                // First check for nearby chests
                let interacted = false
                const nearbyChest = chestSystem.getChestAt(player.x, player.y, 80)
                if (nearbyChest) {
                    chestUI.toggle(nearbyChest)
                    interacted = true
                }

                // Then check for nearby world objects (trees, etc)
                if (!interacted) {
                    for (const obj of worldObjects) {
                        if (obj.isNearPlayer(player, 80) && obj.resourceAmount > 0) {
                            const harvested = obj.harvest()
                            if (harvested) {
                                inventory.add(harvested.type, harvested.amount)
                                floatingText.spawn(obj.x, obj.y - 40, `+${harvested.amount} ${harvested.type}`, '#4aff4a')
                                skillSystem.addXP('gathering', 5)
                                toolSystem.useTool() // Uses durability
                                interacted = true
                                audioManager.play('mine_hit')
                                break
                            }
                        }
                    }
                }

                // If no world object, try eating food (BALANCED values)
                if (!interacted) {
                    if (inventory.get('COOKED_MEAT') > 0) {
                        inventory.remove('COOKED_MEAT', 1)
                        player.eat(60) // Increased from 50
                        notificationManager.show('🍖 Ate Cooked Meat', 2000, '#4aff4a')
                        audioManager.play('eat')
                    } else if (inventory.get('RAW_MEAT') > 0) {
                        inventory.remove('RAW_MEAT', 1)
                        player.eat(15) // Reduced from 20 (less efficient than cooked)
                        player.takeDamage(5) // Raw meat damages you
                        notificationManager.show('🤢 Ate Raw Meat - Got sick!', 2000, '#ff8800')
                        audioManager.play('eat')
                    }
                }
            }

            // Update player
            player.update(dt, input, world, camera)

            // Check for player death
            if (player.isDead() && !isDead) {
                isDead = true
                deathTimer = DEATH_SCREEN_DURATION
                console.log('[Game] Player died!')
                notificationManager.show('💀 YOU DIED', 3000, '#ff0000')
            }

            // Handle death state
            if (isDead) {
                deathTimer -= dt
                if (deathTimer <= 0) {
                    // Respawn player at spawn (which is guaranteed grass)
                    player.health = player.maxHealth
                    player.hunger = player.maxHunger
                    player.x = spawnX
                    player.y = spawnY
                    isDead = false

                    // Penalty: lose 50% of resources
                    for (const item in inventory.items) {
                        const amount = inventory.items[item]
                        const loss = Math.floor(amount * 0.5)
                        inventory.remove(item, loss)
                    }

                    // Clear enemies
                    enemies.length = 0

                    console.log('[Game] Player respawned with penalties')
                    notificationManager.show('⚰️ Respawned - Lost 50% resources', 4000, '#ff8800')
                }
            }

            // Handle building/mining/combat with mouse
            const mouse = input.getMouse()
            const worldX = mouse.x + camera.x
            const worldY = mouse.y + camera.y

            // Update ghost block preview
            buildingSystem.updateGhostBlock(worldX, worldY)

            // Right-click for farming (with HOE tool) or building/removal
            if (mouse.down) {
                // Check if HOE is equipped for farming
                if (player.currentTool === 'HOE' && buildingSystem.buildingMode) {
                    // Plant crops with HOE
                    const tile = world.getTileAtPixel(worldX, worldY)
                    if (tile === 2) { // Grass tile
                        farmingSystem.plant(Math.floor(worldX / 32), Math.floor(worldY / 32), 'WHEAT')
                        notificationManager.show('🌱 Planted wheat', 1000, '#76d16d')
                    }
                } else if (buildingSystem.buildingMode) {
                    // Building/removal mode
                    if (input.isDown('ShiftLeft') || input.isDown('ShiftRight')) {
                        buildingSystem.removeBlock(worldX, worldY)
                    } else {
                        buildingSystem.placeBlock(worldX, worldY)
                    }
                }
            }

            // Click on enemy to attack
            if (mouse.clicked) {
                let attackedEnemy = false

                // Check if we can harvest crops (left-click near mature crops)
                if (player.currentTool === 'HOE') {
                    const harvestedCrop = farmingSystem.harvest(Math.floor(worldX / 32), Math.floor(worldY / 32))
                    if (harvestedCrop) {
                        notificationManager.show('🌾 Harvested wheat!', 1000, '#f2d057')
                        inventory.add('WHEAT', harvestedCrop)
                        return // Don't attack if we harvested
                    }
                }

                enemies.forEach(enemy => {
                    if (enemy.state !== 'dead') {
                        const dx = worldX - enemy.x
                        const dy = worldY - enemy.y
                        const dist = Math.sqrt(dx * dx + dy * dy)

                        if (dist < enemy.width) {
                            player.attackEnemy(enemy)
                            attackedEnemy = true
                        }
                    }
                })
            }
        }

        // Update enemies
        enemySpawnTimer += dt
        if (enemySpawnTimer > ENEMY_SPAWN_INTERVAL && enemies.length < 5) {
            // Spawn enemy near player but off-screen on valid terrain
            let enemySpawnX, enemySpawnY, attempts = 0
            let validSpawn = false

            while (!validSpawn && attempts < 20) {
                const angle = Math.random() * Math.PI * 2
                const distance = 400 + Math.random() * 200 // 400-600 pixels away
                enemySpawnX = player.x + Math.cos(angle) * distance
                enemySpawnY = player.y + Math.sin(angle) * distance

                // Check if spawn tile is valid (grass or sand)
                const tile = world.getTileAtPixel(enemySpawnX, enemySpawnY)

                if (tile === 1 || tile === 2) { // Sand or Grass
                    validSpawn = true
                }
                attempts++
            }

            if (validSpawn) {
                const types = ['WOLF', 'BEAR', 'SABERTOOTH']
                const type = types[Math.floor(Math.random() * types.length)]
                enemies.push(new Enemy(enemySpawnX, enemySpawnY, type))
                console.log(`[Spawn] ${type} spawned at valid location`)
            }

            enemySpawnTimer = 0
        }

        // Update enemies (iterate backwards to safely remove)
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i]
            const shouldRemove = enemy.update(dt, player, world)
            if (shouldRemove) {
                // Drop loot BEFORE removing
                enemy.dropLoot(inventory)
                particles.emit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'blood', 15)
                enemies.splice(i, 1)
                console.log('[Enemy] Removed and loot dropped')
            }
        }

        camera.follow(player)
        camera.update(dt)

        // Update day/night cycle
        dayTime += daySpeed * dt
        if (dayTime > 1) dayTime = 0

        // Update weather (Rain/Darkness)
        weatherSystem.update(dt, player)

        // Load/unload chunks based on player position
        world.loadChunksAround(player.x, player.y, 2)
        world.unloadDistantChunks(player.x, player.y, 4)

        // Update population system
        populationSystem.update(dt, inventory, worldObjects)
        farmingSystem.update(dt)

        // Update temperature system and apply cold damage
        temperatureSystem.update(dt, weatherSystem, worldObjects, player.x, player.y)
        const coldDamage = temperatureSystem.getColdDamage() * dt
        if (coldDamage > 0) {
            player.health -= coldDamage
            if (player.health <= 0) {
                player.health = 0
                notificationManager.show('❄️ FROZEN TO DEATH', 3000, '#0055ff')
            }
        }

        // Check era progression
        const eraAdvanced = eraSystem.checkProgress({ inventory, skillSystem, population: populationSystem.getPopulation() })
        if (eraAdvanced) {
            // Add first discovery for Cave Age completion
            eraSystem.addDiscovery('fire')
            import('./core/AudioManager.js').then(m => m.audioManager.play('ui_confirm')) // ERA SOUND
        }

        // Update tutorial system
        tutorialSystem.update(dt, { player, inventory, skillSystem, enemies })

        // Update floating text
        floatingText.update(dt)

        // Update particles
        particles.update(dt)

        // Apply screen shake offset
        const shakeOffset = camera.getShakeOffset()
        renderer.ctx.save()
        renderer.ctx.translate(shakeOffset.x, shakeOffset.y)

        // Draw World (Ground)
        renderer.drawWorld(world, camera, assetLoader.get('tiles'), pseudo3D)

        // Draw Farming Layer (below entities)
        farmingSystem.draw(renderer, camera)

        // Draw Chests (Ground level)
        chestSystem.draw(renderer, camera, world)

        // === DEPTH SORTING FOR ENTITIES ===
        // Collect all renderables
        const renderables = []

        // 1. Player
        renderables.push({
            y: player.y + player.height / 2, // Sort by feet position
            draw: () => player.draw(renderer, camera, assetLoader.get('player'), pseudo3D)
        })

        // 2. Enemies
        enemies.forEach(enemy => {
            let spriteToUse = assetLoader.get('enemy_raptor')
            if (enemy.type === 'WOLF') spriteToUse = assetLoader.get('wolf')
            else if (enemy.type === 'BEAR') spriteToUse = assetLoader.get('bear')

            renderables.push({
                y: enemy.y + enemy.height / 2,
                draw: () => enemy.draw(renderer, camera, spriteToUse)
            })
        })

        // 3. World Objects (Trees, etc)
        worldObjects.forEach(obj => {
            obj.update(dt) // Update here to keep loop clean
            renderables.push({
                y: obj.y + 40, // Offset for trees so you can walk "behind" the trunk
                draw: () => obj.draw(renderer, camera, {
                    cave_entrance: assetLoader.get('cave_entrance'),
                    tree: assetLoader.get('tree')
                })
            })
        })

        // 4. Villagers
        populationSystem.villagers.forEach(npc => {
            renderables.push({
                y: npc.y + npc.height / 2,
                draw: () => npc.draw(renderer, camera, assetLoader.get('npc_tribal'))
            })
        })

        // Sort by Y (Painter's Algorithm)
        renderables.sort((a, b) => a.y - b.y)

        // Draw all sorted entities
        renderables.forEach(r => r.draw())


        // Remove depleted world objects
        for (let i = worldObjects.length - 1; i >= 0; i--) {
            if (worldObjects[i].resourceAmount === 0 && worldObjects[i].type === 'tree') {
                worldObjects.splice(i, 1)
                import('./core/AudioManager.js').then(m => m.audioManager.play('mine_break'))
            }
        }

        // Draw particles (always on top of entities?)
        particles.draw(renderer, camera)

        // Weather Overlay (Rain, Darkness)
        weatherSystem.draw(camera)

        // Draw building ghost block (Top top)
        buildingSystem.drawGhostBlock(renderer, camera)

        // Day/Night overlay
        const nightAlpha = Math.max(0, Math.sin((dayTime - 0.25) * Math.PI * 2) * 0.4)
        if (nightAlpha > 0) {
            renderer.ctx.fillStyle = `rgba(20, 20, 50, ${nightAlpha})`
            renderer.ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // Restore from shake
        renderer.ctx.restore()



        // MINIMAP (top-right corner)
        const minimapSize = 120
        const minimapX = canvas.width - minimapSize - 230
        const minimapY = 10
        const minimapScale = 4

        // Draw themed panel background for minimap
        UITheme.drawPanel(renderer.ctx, minimapX - 5, minimapY - 5, minimapSize + 10, minimapSize + 10)

        // Draw terrain on minimap
        const playerTileX = Math.floor(player.x / 32)
        const playerTileY = Math.floor(player.y / 32)
        const halfRange = Math.floor(minimapSize / 2 / minimapScale)

        for (let dy = -halfRange; dy <= halfRange; dy++) {
            for (let dx = -halfRange; dx <= halfRange; dx++) {
                const tile = world.getTile(playerTileX + dx, playerTileY + dy)
                const colors = ['#4fa4b8', '#e6d5b8', '#92dc7e', '#757161', '#ffffff', '#228B22', '#FFD700', '#DC143C', '#8B4513']
                renderer.ctx.fillStyle = colors[tile] || '#000'
                renderer.ctx.fillRect(
                    minimapX + (dx + halfRange) * minimapScale,
                    minimapY + (dy + halfRange) * minimapScale,
                    minimapScale, minimapScale
                )
            }
        }

        // Player dot on minimap
        renderer.ctx.fillStyle = '#ff0000'
        renderer.ctx.fillRect(minimapX + minimapSize / 2 - 2, minimapY + minimapSize / 2 - 2, 4, 4)

        // Removed old border code since drawPanel handles it

        // === NEW UI IMPLEMENTATION ===

        // 1. Top Left Info Panel
        const currentEra = eraSystem.getCurrentEra()
        UITheme.drawPanel(renderer.ctx, 10, 10, 300, 70, { alpha: 0.85 })

        weatherSystem.drawUI(renderer.ctx, 230, 45) // Weather icon in top panel

        renderer.ctx.fillStyle = currentEra.color
        renderer.ctx.font = `bold ${UITheme.font.size.large}px ${UITheme.font.main}`
        renderer.ctx.shadowColor = 'black'
        renderer.ctx.shadowBlur = 0; renderer.ctx.shadowOffsetX = 2; renderer.ctx.shadowOffsetY = 2;
        renderer.ctx.fillText(currentEra.name, 25, 40)

        renderer.ctx.fillStyle = UITheme.colors.textDim
        renderer.ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
        renderer.ctx.shadowBlur = 0; renderer.ctx.shadowOffsetX = 0; renderer.ctx.shadowOffsetY = 0;
        renderer.ctx.fillText(`${currentEra.year} | Pos: ${Math.round(player.x)}, ${Math.round(player.y)}`, 25, 65)

        // 1.5 Inventory Panel (Top Right)
        const invW = 200
        const invH = 400
        const invX = canvas.width - invW - 10
        const invY = 10

        UITheme.drawPanel(renderer.ctx, invX, invY, invW, invH, { title: 'INVENTORY' })

        let itemY = invY + 50
        const items = Object.entries(inventory.items).filter(([_, count]) => count > 0)

        if (items.length === 0) {
            renderer.ctx.fillStyle = UITheme.colors.textDim
            renderer.ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
            renderer.ctx.fillText("Empty...", invX + 20, itemY)
        } else {
            items.forEach(([item, count]) => {
                let color = '#fff'
                if (['STONE', 'FLINT', 'OCHRE'].includes(item)) color = '#aaa'
                if (['WOOD', 'STICK'].includes(item)) color = '#dcb159'
                if (['GRASS', 'ROPE'].includes(item)) color = '#76d16d'
                if (item.includes('MEAT')) color = '#d64d4d'

                renderer.ctx.fillStyle = color
                renderer.ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
                renderer.ctx.fillText(`${item}: ${count}`, invX + 20, itemY)
                itemY += 25
            })
        }

        // 2. Status Bars (Bottom Left)
        const barW = 200
        const barH = 20
        const bottomY = canvas.height - 20

        // Health
        UITheme.drawBar(renderer.ctx, 20, bottomY - 55, barW, barH, player.health, player.maxHealth, UITheme.colors.danger, 'HP')

        // Hunger
        UITheme.drawBar(renderer.ctx, 20, bottomY - 25, barW, barH, player.hunger, player.maxHunger, UITheme.colors.warning, 'Food')

        // Temperature (as hypothermia bar)
        const tempColor = temperatureSystem.getTemperatureColor()
        const hypothermiaPercent = Math.max(0, Math.min(100, temperatureSystem.hypothermia))
        renderer.ctx.fillStyle = '#1a1a1a'
        renderer.ctx.fillRect(20, bottomY + 5, barW, barH)
        if (hypothermiaPercent > 0) {
            renderer.ctx.fillStyle = tempColor
            renderer.ctx.fillRect(20, bottomY + 5, (barW * hypothermiaPercent) / 100, barH)
        }
        renderer.ctx.strokeStyle = '#666'
        renderer.ctx.lineWidth = 1
        renderer.ctx.strokeRect(20, bottomY + 5, barW, barH)
        renderer.ctx.fillStyle = '#aaa'
        renderer.ctx.font = `9px ${UITheme.font.main}`
        renderer.ctx.textAlign = 'left'
        renderer.ctx.fillText('Temp', 25, bottomY + 16)

        // Population (Above bars)
        renderer.ctx.fillStyle = UITheme.colors.info
        renderer.ctx.font = `bold ${UITheme.font.size.normal}px ${UITheme.font.main}`
        renderer.ctx.fillText(`👥 Pop: ${populationSystem.getPopulation()}/${populationSystem.maxPopulation}`, 20, bottomY - 70)

        // 3. Hotbar (Bottom Center)
        const hotbarSlots = [
            { id: 'HAND', icon: '✋', sprite: null },
            { id: 'STONE_PICK', icon: '⛏️', sprite: 'tools' }, // Assuming spritesheet logic needs uv mapping, simpler to use text/color for now or just generic icon
            { id: 'STONE_AXE', icon: '🪓', sprite: 'tools' },
            { id: 'SPEAR', icon: '🔱', sprite: 'weapons' },
            { id: 'TORCH', icon: '🔥', sprite: 'torch' },
            { id: 'CLUB', icon: '🏏', sprite: 'weapons' },
            { id: 'BOW', icon: '🏹', sprite: 'weapons' }
        ]

        const slotSize = 50
        const hotbarW = hotbarSlots.length * (slotSize + 4) + 10
        const hotbarX = canvas.width / 2 - hotbarW / 2
        const hotbarY = canvas.height - 70

        UITheme.drawPanel(renderer.ctx, hotbarX, hotbarY, hotbarW, slotSize + 20, { alpha: 0.9 })

        hotbarSlots.forEach((slot, i) => {
            const sx = hotbarX + 10 + i * (slotSize + 4)
            const sy = hotbarY + 10
            const isEquipped = toolSystem.equippedTool === slot.id
            const hasItem = slot.id === 'HAND' || inventory.get(slot.id) > 0

            // Slot Background
            renderer.ctx.fillStyle = isEquipped ? UITheme.colors.borderHighlight : 'rgba(0,0,0,0.5)'
            if (!hasItem) renderer.ctx.fillStyle = 'rgba(0,0,0,0.2)'
            renderer.ctx.fillRect(sx, sy, slotSize, slotSize)

            renderer.ctx.strokeStyle = isEquipped ? '#fff' : UITheme.colors.border
            renderer.ctx.lineWidth = isEquipped ? 2 : 1
            renderer.ctx.strokeRect(sx, sy, slotSize, slotSize)

            // Icon
            if (hasItem) {
                renderer.ctx.fillStyle = '#fff'
                renderer.ctx.font = '24px Arial' // Emoji looks better in Arial than pixel font often
                renderer.ctx.textAlign = 'center'
                renderer.ctx.fillText(slot.icon, sx + slotSize / 2, sy + 32)

                // Key shortcut
                renderer.ctx.font = '10px monospace'
                renderer.ctx.fillStyle = '#aaa'
                renderer.ctx.fillText(i < 5 ? i + 1 : '', sx + 10, sy + 12)
            }

            // Durability and Quality for equipped tool
            if (isEquipped && slot.id !== 'HAND') {
                const dur = toolSystem.getDurability() / 100
                renderer.ctx.fillStyle = dur > 0.5 ? '#0f0' : dur > 0.2 ? '#ff0' : '#f00'
                renderer.ctx.fillRect(sx + 2, sy + slotSize - 6, (slotSize - 4) * dur, 4)

                // Quality stars
                const quality = toolSystem.equippedToolQuality || 1
                renderer.ctx.fillStyle = quality >= 5 ? '#ffff00' : quality >= 4 ? '#ffaa00' : '#ffffff'
                renderer.ctx.font = '9px Arial'
                renderer.ctx.textAlign = 'right'
                let stars = '★'.repeat(quality) + '☆'.repeat(5 - quality)
                renderer.ctx.fillText(stars, sx + slotSize - 3, sy + 8)
            }
        })
        renderer.ctx.textAlign = 'left' // Reset alignment

        // 4. Update interactions to map keys to new hotbar logic? 
        // Logic currently relies on hardcoded '1', '2' etc. mapping to equipTool.
        // We will keep the input logic as is for now.

        /*
        // Equipped Tool HUD (Left side, below Era) with durability
        const equippedTool = toolSystem.equippedTool
        const toolName = toolSystem.Tools[equippedTool]?.name || equippedTool
        const toolDurability = toolSystem.getDurability()
        renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        renderer.ctx.fillRect(10, 80, 200, 40)
        renderer.ctx.fillStyle = '#ffd700'
        renderer.ctx.font = 'bold 16px monospace'
        renderer.ctx.fillText(`⛏️ ${toolName}`, 20, 100)
        // Durability bar (only for non-hand tools)
        if (equippedTool !== 'HAND') {
            const durColor = toolDurability > 50 ? '#4f4' : toolDurability > 25 ? '#ff0' : '#f44'
            renderer.ctx.fillStyle = '#333'
            renderer.ctx.fillRect(20, 108, 100, 6)
            renderer.ctx.fillStyle = durColor
            renderer.ctx.fillRect(20, 108, toolDurability, 6)
        }

        // Player Health Bar
        const healthBarY = 130
        const healthPercent = player.health / player.maxHealth
        renderer.ctx.fillStyle = 'rgba(20, 20, 20, 0.85)'
        renderer.ctx.fillRect(10, healthBarY, 200, 30)
        renderer.ctx.strokeStyle = '#DC143C'
        renderer.ctx.lineWidth = 2
        renderer.ctx.strokeRect(10, healthBarY, 200, 30)

        const healthColor = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00'
        renderer.ctx.fillStyle = healthColor
        renderer.ctx.fillRect(12, healthBarY + 2, 196 * healthPercent, 26)

        renderer.ctx.fillStyle = '#FFF'
        renderer.ctx.font = 'bold 12px monospace'
        renderer.ctx.fillText(`❤️ ${player.health}/${player.maxHealth} HP`, 20, healthBarY + 20)

        // Population Counter (below health)
        const popY = healthBarY + 35
        renderer.ctx.fillStyle = 'rgba(20, 20, 20, 0.85)'
        renderer.ctx.fillRect(10, popY, 200, 30)
        renderer.ctx.strokeStyle = '#FFD700'
        renderer.ctx.lineWidth = 2
        renderer.ctx.strokeRect(10, popY, 200, 30)
        
        renderer.ctx.fillStyle = '#FFD700'
        renderer.ctx.font = 'bold 12px monospace'
        renderer.ctx.fillText(`👥 Population: ${populationSystem.getPopulation()}/${populationSystem.maxPopulation}`, 20, popY + 20)

        // Player Hunger Bar
        const hungerBarY = healthBarY + 35
        const hungerPercent = player.hunger / player.maxHunger
        renderer.ctx.fillStyle = 'rgba(20, 20, 20, 0.85)'
        renderer.ctx.fillRect(10, hungerBarY, 200, 30)
        renderer.ctx.strokeStyle = '#FF8C00'
        renderer.ctx.lineWidth = 2
        renderer.ctx.strokeRect(10, hungerBarY, 200, 30)

        const hungerColor = hungerPercent > 0.5 ? '#32CD32' : hungerPercent > 0.25 ? '#FFD700' : '#ff0000'
        renderer.ctx.fillStyle = hungerColor
        renderer.ctx.fillRect(12, hungerBarY + 2, 196 * hungerPercent, 26)
        */



        /*
        renderer.ctx.fillStyle = '#FFF'
        renderer.ctx.font = 'bold 12px monospace'
        renderer.ctx.fillText(`🍖 ${Math.floor(player.hunger)}/${player.maxHunger} Hunger`, 20, hungerBarY + 20)
        */

        // Era Progress (New UI - Integrated into Top Panel)
        const nextEra = eraSystem.getNextEra()
        if (nextEra) {
            const eraProgress = eraSystem.getProgressToNextEra() / 100
            // Draw under the top panel (assuming x=10, y=10, w=300, h=70)
            const x = 20
            const y = 68
            const w = 280

            // Progress Bar
            renderer.ctx.fillStyle = '#222'
            renderer.ctx.fillRect(x, y, w, 4)
            renderer.ctx.fillStyle = nextEra.color
            renderer.ctx.fillRect(x, y, w * eraProgress, 4)
        }

        // Building Mode Indicator (New UI)
        if (buildingSystem.buildingMode) {
            const buildY = 100
            UITheme.drawPanel(renderer.ctx, 10, buildY, 280, 90, { title: 'BUILDING MODE' })

            const blockInfo = buildingSystem.blockTypes[buildingSystem.selectedBlockType]
            renderer.ctx.fillStyle = '#FFF'
            renderer.ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
            renderer.ctx.fillText(`Block: ${blockInfo.name}`, 30, buildY + 50)

            renderer.ctx.fillStyle = inventory.get(blockInfo.material) >= blockInfo.cost ? UITheme.colors.success : UITheme.colors.danger
            renderer.ctx.fillText(`Cost: ${blockInfo.cost} ${blockInfo.material}`, 30, buildY + 75)
        }

        // Quest Tracker Panel
        const activeQuests = questManager.getActiveQuests()
        if (activeQuests.length > 0) {
            const qPanelH = 40 + activeQuests.length * 30
            UITheme.drawPanel(renderer.ctx, 10, 150, 280, qPanelH, { title: 'QUESTS' })

            let qy = 200
            activeQuests.forEach(quest => {
                renderer.ctx.fillStyle = UITheme.colors.warning
                renderer.ctx.font = `${UITheme.font.size.normal}px ${UITheme.font.main}`
                renderer.ctx.shadowColor = 'black'; renderer.ctx.shadowOffsetX = 1; renderer.ctx.shadowOffsetY = 1;
                renderer.ctx.fillText(`• ${quest.title}`, 20, qy)
                qy += 30
            })
        }



        // Update and draw notifications
        notificationManager.update(dt)
        notificationManager.draw()

        // Floating text (after notifications)
        floatingText.draw(renderer, camera)

        // Draw Tech Tree
        techTreeUI.draw(renderer.ctx, canvas.width, canvas.height)

        // Draw chest UI
        chestUI.draw(renderer.ctx, inventory)

        // Draw task assignment UI
        taskAssignmentUI.draw(renderer.ctx, canvas)

        // Draw crafting UI
        craftingUI.draw()

        // Draw in-game menu (last - on top of everything)
        inGameMenu.draw()

        // Death screen overlay
        if (isDead) {
            renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
            renderer.ctx.fillRect(0, 0, canvas.width, canvas.height)

            renderer.ctx.fillStyle = '#ff0000'
            renderer.ctx.font = 'bold 72px Arial'
            renderer.ctx.textAlign = 'center'
            renderer.ctx.fillText('YOU DIED', canvas.width / 2, canvas.height / 2 - 50)

            renderer.ctx.fillStyle = '#fff'
            renderer.ctx.font = '24px Arial'
            renderer.ctx.fillText(`Respawning in ${Math.ceil(deathTimer)}...`, canvas.width / 2, canvas.height / 2 + 30)

            renderer.ctx.fillStyle = '#ff8800'
            renderer.ctx.font = '18px Arial'
            renderer.ctx.fillText('You will lose 50% of your resources', canvas.width / 2, canvas.height / 2 + 70)

            renderer.ctx.textAlign = 'left'
        }

        // Reset single-frame input events at end of frame
        input.resetFrameState()
    })

    gameLoop.start()
}).catch(e => {
    console.error("[Main] Critical error loading assets:", e)
    renderer.drawText("Error loading assets. Check console.", 50, 50, "red")
})

window.addEventListener('resize', () => {
    camera.width = window.innerWidth
    camera.height = window.innerHeight
})
