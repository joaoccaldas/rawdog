# RAWDOG: THE FIRST HUMAN - COMPLETE GAME PROJECT PLAN

## EXECUTIVE SUMMARY
A never-ending survival/civilization simulator combining Minecraft's infinite exploration, Roblox's community building, and Civilization's era progression. Players start as a caveman and progress through 8 eras of human history while building villages, discovering technologies, and surviving in a procedurally generated world.

---

## CRITICAL FEATURES (MUST WORK - GAME BREAKING IF NOT)

### 1. PLAYER MOVEMENT & CONTROLS ⚠️ CRITICAL
**Status:** BROKEN - Must fix immediately
- WASD movement in all directions
- Smooth camera following
- Mouse click for actions (mining, attacking, building)
- No input lag or stuck movement
- **Test:** Player must move smoothly in all directions within 1 second of game start

### 2. WORLD GENERATION & RENDERING ⚠️ CRITICAL
**Status:** BROKEN - Must fix immediately
- Infinite chunk-based world (32x32 tiles per chunk)
- Biomes: water, sand, grass, stone, snow
- Resources spawning: trees, stone, flint, sticks, ochre
- Chunks load/unload based on player position
- **Test:** Player sees terrain immediately, can walk 1000 pixels in any direction

### 3. RESOURCE GATHERING ⚠️ CRITICAL
**Status:** Partially working
- Left-click to mine resources
- Visual feedback (particles, floating text)
- Resources added to inventory
- Mining speed based on tool and skills
- **Test:** Click tree with hand, get 3 WOOD in <2 seconds

### 4. INVENTORY SYSTEM ⚠️ CRITICAL
**Status:** Working but needs UI
- Store up to 999 of each resource
- Track all 30+ item types
- Persist between sessions
- **Test:** Gather 10 WOOD, check inventory has 10 WOOD

### 5. CRAFTING SYSTEM ⚠️ CRITICAL
**Status:** Working but needs proper integration
- Press C to open crafting menu
- Recipe unlock system based on era
- Visual recipe requirements
- Skill bonuses (refund materials)
- **Test:** Craft STONE_PICK with 3 WOOD + 2 STONE, verify tool created

### 6. SURVIVAL MECHANICS ⚠️ CRITICAL
**Status:** Working
- Health system (100 HP)
- Hunger system (depletes over time)
- Eating food restores hunger
- Death penalty (lose 50% resources, respawn)
- **Test:** Take damage, eat COOKED_MEAT, verify health/hunger changes

### 7. COMBAT SYSTEM ⚠️ CRITICAL
**Status:** Partially working
- Enemies spawn near player (wolves, bears, sabertooths)
- Click enemy to attack
- Damage based on tool and combat skill
- Enemy AI (chase, attack, flee when low HP)
- Loot drops on death
- **Test:** Kill wolf with SPEAR, verify loot drops

### 8. SAVE/LOAD SYSTEM ⚠️ CRITICAL
**Status:** Working
- Auto-save every 60 seconds
- F5 to quick save
- F9 to quick load
- localStorage persistence
- **Test:** Save game, refresh browser, F9 load, verify inventory persists

---

## CORE GAMEPLAY SYSTEMS (ESSENTIAL FOR FUN)

### 9. ERA PROGRESSION SYSTEM 🎯 HIGH PRIORITY
**Status:** Implemented but untested
- 8 eras: Cave Age → Stone Villages → Bronze → Iron → Medieval → Industrial → Modern → Future
- Requirements: skills, discoveries, buildings, population
- Unlock new recipes, buildings, technologies
- Progress bar showing advancement
- **Test:** Reach Stone Villages era by getting 5 villagers + discovering fire

### 10. BUILDING SYSTEM 🎯 HIGH PRIORITY  
**Status:** Working
- Press B to toggle building mode
- Place blocks (wall, floor, campfire, house)
- Remove blocks with Shift+Click
- Ghost preview before placing
- Building costs based on block type
- **Test:** Build 4 walls in square, verify blocks placed and cost deducted

### 11. SKILL SYSTEM 🎯 HIGH PRIORITY
**Status:** Working
- 5 skills: Mining, Woodcutting, Hunting, Farming, Crafting
- Gain XP from actions (mine = mining XP)
- Level up grants bonuses (faster gather, more damage, refunds)
- Persistent across sessions
- **Test:** Mine 20 stone, verify Mining skill increases

### 12. QUEST SYSTEM 🎯 HIGH PRIORITY
**Status:** Working
- Tutorial quests guide new players
- Quest chains unlock features
- Rewards (items, XP, unlocks)
- Quest tracker UI
- **Test:** Complete "Discover Fire" quest, verify torch unlocked

### 13. POPULATION/VILLAGE SYSTEM 🎯 HIGH PRIORITY
**Status:** Implemented but untested
- Villagers spawn when well-fed (30s interval)
- Food consumption (0.1 food/villager/sec)
- Max population based on houses
- Villager types (gatherer, miner, farmer, builder)
- **Test:** Keep inventory at 50+ COOKED_MEAT, verify villagers spawn

### 14. CAMPFIRE COOKING SYSTEM 🎯 HIGH PRIORITY
**Status:** Fixed
- Place campfire block
- Stand near campfire to cook RAW_MEAT → COOKED_MEAT
- Recipes require proximity, not consumption
- **Test:** Place campfire, stand nearby with RAW_MEAT, craft COOKED_MEAT

---

## ENGAGEMENT FEATURES (MAKE GAME FUN)

### 15. PARTICLE EFFECTS ✨ MEDIUM PRIORITY
**Status:** Working
- Mining particles (wood chips, stone dust)
- Combat particles (blood, impact)
- Skill-up particles (level up effects)
- Adds visual polish
- **Test:** Mine tree, see wood particles

### 16. FLOATING TEXT ✨ MEDIUM PRIORITY
**Status:** Working
- "+5 XP" when gaining experience
- "+3 WOOD" when gathering
- Damage numbers in combat
- **Test:** Attack enemy, see damage numbers

### 17. NOTIFICATION SYSTEM ✨ MEDIUM PRIORITY
**Status:** Working
- Top-center notifications
- Quest complete, skill up, discoveries
- Auto-hide after 3 seconds
- **Test:** Level up skill, see notification

### 18. TUTORIAL SYSTEM ✨ MEDIUM PRIORITY
**Status:** Working
- Step-by-step prompts
- Highlight UI elements
- Tracks completion
- **Test:** New game, see "Press WASD to move"

### 19. PSEUDO-3D RENDERING ✨ LOW PRIORITY
**Status:** Working
- Y-axis sorting for depth
- Scale objects based on Y position
- Creates illusion of height
- **Test:** Walk behind tree, verify player draws under tree

### 20. SCREEN SHAKE ✨ LOW PRIORITY
**Status:** Working
- Camera shake on damage
- Combat impact feel
- **Test:** Get hit by enemy, see screen shake

---

## CONTENT REQUIREMENTS

### ITEMS DATABASE (30+ Items)
- Resources: WOOD, STONE, FLINT, STICK, OCHRE, RAW_MEAT, FUR, ANIMAL_FAT, TOOTH
- Food: COOKED_MEAT, BERRY, FISH
- Tools: STONE_PICK, STONE_AXE, SPEAR, TORCH
- Containers: BASKET, CLAY_POT, ROPE
- Blocks: WALL, FLOOR, CAMPFIRE, HOUSE, FORGE

### BIOMES (5 Types)
- Water (0) - Cannot spawn, swim slower
- Sand (1) - Beaches, desert
- Grass (2) - Main biome, trees, animals
- Stone (3) - Mountains, flint, ochre
- Snow (4) - High elevation

### ENEMIES (3+ Types)
- Wolf - Fast, low HP, pack hunter
- Bear - Slow, high HP, high damage
- Sabertooth - Balanced, drops better loot

### BUILDINGS (5+ Types)
- Wall - Basic defense
- Floor - Roads, foundations
- Campfire - Cooking station
- House - Increases max population
- Forge - Advanced crafting (future eras)

---

## TECHNICAL REQUIREMENTS

### PERFORMANCE TARGETS
- 60 FPS minimum
- Chunk load time < 100ms
- Memory usage < 500MB
- No visible lag when moving between chunks

### BROWSER COMPATIBILITY
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### MOBILE SUPPORT (Future)
- Touch controls for movement
- Virtual joystick
- Tap to interact
- Pinch to zoom

---

## BUGS TO FIX IMMEDIATELY

### 🔴 CRITICAL BUGS (FIX NOW)
1. **Player controls not working** - Input system broken
2. **Map not rendering** - ChunkManager integration broken
3. **Spawning in water** - Spawn validation using wrong coordinate system
4. **Enemy spawn broken** - Using tile coords instead of pixel coords

### 🟡 HIGH PRIORITY BUGS
5. **Era progression not visible** - UI showing but no feedback
6. **Villagers not drawing** - PopulationSystem.draw() may be broken
7. **Chunk loading lag** - Need to optimize loadChunksAround()

### 🟢 MEDIUM PRIORITY BUGS
8. **Building ghost block offset** - Not aligning to grid
9. **Combat damage inconsistent** - Skill multipliers not applying correctly
10. **Save/load missing new systems** - Era/Population not persisting

---

## SUCCESS CRITERIA

### MINIMUM VIABLE PRODUCT (MVP)
- Player can move smoothly in all directions ✅
- World generates infinitely with all biomes ✅
- Mining/gathering works with feedback ✅
- Crafting system creates tools ✅
- Combat defeats enemies with loot ✅
- Save/load preserves progress ✅
- Tutorial teaches basics ✅

### ENGAGING GAMEPLAY LOOP
- Gather resources (fun) ✅
- Craft better tools (progression) ✅
- Fight harder enemies (challenge) ✅
- Build village (creativity) 🔧
- Progress eras (long-term goal) 🔧
- Discover technologies (exploration) 🔧

### POLISH & JUICE
- Particles on every action ✅
- Floating text for feedback ✅
- Screen shake for impact ✅
- Sound effects (missing) ❌
- Music (missing) ❌
- Animations (missing) ❌

---

## IMMEDIATE ACTION PLAN

### NEXT 30 MINUTES (FIX CRITICAL BUGS)
1. Fix enemy spawn coordinate system (tile vs pixel)
2. Fix spawn validation to prevent water spawning
3. Verify player input processing in game loop
4. Test world rendering with ChunkManager
5. Verify all systems initialized before game loop

### NEXT 1 HOUR (TEST ALL SYSTEMS)
6. Test player movement in all directions
7. Test resource gathering (all resource types)
8. Test crafting (all basic recipes)
9. Test combat (all enemy types)
10. Test building system (all block types)

### NEXT 2 HOURS (INTEGRATION & POLISH)
11. Integrate era system UI properly
12. Test villager spawning and food consumption
13. Add era progression feedback
14. Test chunk loading/unloading performance
15. Playtest complete gameplay loop (30 min session)

---

## CONCLUSION

This game MUST deliver:
1. **Smooth, responsive controls** - Players quit if movement feels bad
2. **Satisfying gathering** - Clicking must feel rewarding (particles + sound)
3. **Meaningful progression** - Tools → Combat → Building → Eras
4. **Never-ending content** - Infinite world + 8 eras = 100+ hours gameplay
5. **No game-breaking bugs** - Any crash = player quits forever

**CURRENT STATUS: 🔴 BROKEN - Critical bugs prevent gameplay**
**TARGET STATUS: 🟢 FULLY PLAYABLE - All core systems working smoothly**
**ETA: 2 hours to fix all critical issues and achieve MVP status**
