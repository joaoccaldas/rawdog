import { Quest } from './QuestManager.js'

/**
 * LEVEL 1: THE DAWN OF HUMANITY
 * 
 * Theme: The Birth of Civilization
 * Narrative Arc: Fear/Survival → Confidence/Mastery → Meaning/Legacy
 * 
 * These three quests take the player through humanity's fundamental moments:
 * 1. Conquering Fear (Fire Discovery)
 * 2. Extending the Self (Tool Creation)
 * 3. Leaving a Legacy (Art Creation)
 */

export function createCaveQuests(inventory, toolSystem, questManager) {

    // ═══════════════════════════════════════════════════════════════
    // QUEST 1: SPARK OF CIVILIZATION 🔥
    // ═══════════════════════════════════════════════════════════════
    const quest1 = new Quest({
        id: 'fire_discovery',
        title: '🔥 Spark of Civilization',
        description: 'Night is falling. The temperature drops. Wild sounds echo from the shadows. You need warmth. You need light. You need... fire.',
        objectives: [
            'Gather 3 Dry Grass - Find dry grass to use as tinder',
            'Collect 2 Flint - Search for flint stones that spark when struck',
            'Find 1 Stick - Collect a stick from fallen wood',
            'Create Fire - Combine materials to create humanity\'s first gift'
        ],
        checkCompletion: function () {
            return this.progress.dryGrass >= 3 &&
                this.progress.flint >= 2 &&
                this.progress.stick >= 1 &&
                this.progress.fireCreated
        },
        onComplete: function () {
            console.log('═══════════════════════════════════════════════════')
            console.log('🔥 FIRE DISCOVERED!')
            console.log('The flames dance - orange, red, gold.')
            console.log('For the first time, the night doesn\'t own you.')
            console.log('You\'ve stolen a piece of the sun itself.')
            console.log('═══════════════════════════════════════════════════')

            // Unlock campfire crafting (to be implemented)
            // Future: Add campfire to crafting recipes
        }
    })

    // ═══════════════════════════════════════════════════════════════
    // QUEST 2: SHARPER THAN INSTINCT 🪓
    // ═══════════════════════════════════════════════════════════════
    const quest2 = new Quest({
        id: 'first_tool',
        title: '🪓 Sharper Than Instinct',
        description: 'Your hands are strong, but stone is stronger. Your fingers bleed against the earth. Animals have claws and teeth - but you have your MIND. You can extend your body through tools.',
        objectives: [
            'Mine 5 Stone - Gather strong stones for the tool head',
            'Collect 2 Grass (sticks) - Find sturdy grass for a handle',
            'Craft Stone Pickaxe - Create something greater than its parts'
        ],
        checkCompletion: function () {
            return this.progress.stone >= 5 &&
                this.progress.grass >= 2 &&
                this.progress.axeCrafted
        },
        onComplete: function () {
            console.log('═══════════════════════════════════════════════════')
            console.log('🪓 FIRST TOOL CREATED!')
            console.log('You hold it up - crude, rough, imperfect...')
            console.log('But it\'s YOURS.')
            console.log('With this, mountains will fall.')
            console.log('═══════════════════════════════════════════════════')

            // Auto-equip the stone pickaxe
            toolSystem.equipTool('STONE_PICK')
        }
    })

    // ═══════════════════════════════════════════════════════════════
    // QUEST 3: I WAS HERE 🎨
    // ═══════════════════════════════════════════════════════════════
    const quest3 = new Quest({
        id: 'cave_art',
        title: '🎨 I Was Here',
        description: 'The fire burns. Your tools work. You\'ve conquered survival. But as you sit by the firelight, a new hunger emerges - not for food, but for MEANING. What if... you could be eternal?',
        objectives: [
            'Find Ochre Pigment - Search for red ochre deposits',
            'Collect Animal Fat - Gather fat to bind the pigment',
            'Create Handprint - Press your hand to stone, leave proof you existed'
        ],
        checkCompletion: function () {
            return this.progress.ochre >= 1 &&
                this.progress.fat >= 1 &&
                this.progress.paintingCreated
        },
        onComplete: function () {
            console.log('═══════════════════════════════════════════════════')
            console.log('🎨 CAVE ART CREATED!')
            console.log('Your hand rests against the cold stone.')
            console.log('When you pull away, it remains - forever.')
            console.log('Millennia from now, others will see this and know:')
            console.log('YOU WERE HERE.')
            console.log('═══════════════════════════════════════════════════')

            // Achievement: You are eternal
            // Level up to Level 2
        }
    })

    // Register all quests
    questManager.registerQuest(quest1)
    questManager.registerQuest(quest2)
    questManager.registerQuest(quest3)

    // Auto-start the first quest with dramatic timing
    setTimeout(() => {
        questManager.startQuest('fire_discovery')
        console.log('───────────────────────────────────────────────────')
        console.log('The cold bites at your skin.')
        console.log('The darkness feels alive.')
        console.log('Your journey begins...')
        console.log('───────────────────────────────────────────────────')
    }, 1000)
}

/**
 * NARRATIVE NOTES:
 * 
 * Quest progression teaches fundamental gameplay:
 * - Quest 1: Resource gathering + basic crafting
 * - Quest 2: Tool systems + efficiency upgrades
 * - Quest 3: Creative mechanics + meaning
 * 
 * Emotional journey:
 * Fear → Confidence → Transcendence
 * 
 * Future expansion needed:
 * - Add Ochre tile/item type
 * - Implement Animal Fat drops or hunting
 * - Create handprint painting interaction
 * - Add campfire crafting station
 */
