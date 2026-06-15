// Plant Collection Data (Inspired by collectible cards)
const PLANTS = [
    { id: "seedling", name: "Seedling", emoji: "🌱", rarity: "Common", unlockWins: 1, quote: "Every journey starts with a single seed. You planted yours." },
    { id: "clover", name: "Clover", emoji: "🍀", rarity: "Common", unlockWins: 3, quote: "Luck is when preparation meets opportunity. You're preparing beautifully." },
    { id: "daisy", name: "Daisy", emoji: "🌼", rarity: "Uncommon", unlockWins: 7, quote: "Simple, bright, enough. Just like you today." },
    { id: "lavender", name: "Lavender", emoji: "🌸", rarity: "Uncommon", unlockWins: 10, quote: "Calm grows slowly. You're building peace, one day at a time." },
    { id: "sunflower", name: "Sunflower", emoji: "🌻", rarity: "Rare", unlockWins: 14, quote: "You turn toward the light, even on cloudy days. That's strength." },
    { id: "oak", name: "Oak Sapling", emoji: "🌳", rarity: "Rare", unlockWins: 20, quote: "Strong roots take time. You're becoming unshakable." },
    { id: "rose", name: "Rose", emoji: "🌹", rarity: "Epic", unlockWins: 30, quote: "Beautiful things sometimes have thorns. So do you. Both are okay." },
    { id: "lotus", name: "Lotus", emoji: "🪷", rarity: "Epic", unlockWins: 45, quote: "Even in muddy water, you bloom clean and beautiful." },
    { id: "bamboo", name: "Bamboo", emoji: "🎋", rarity: "Legendary", unlockWins: 60, quote: "You bend but don't break. That's your superpower." },
    { id: "cherry", name: "Cherry Blossom", emoji: "🌸", rarity: "Legendary", unlockWins: 80, quote: "Brief, beautiful, bold. Like every good thing you do." },
    { id: "glowshroom", name: "Glowing Mushroom", emoji: "🍄✨", rarity: "Mythic", unlockWins: 100, quote: "You bring light to dark places. Never stop." },
    { id: "starlight", name: "Starlight Bloom", emoji: "🌟🌿", rarity: "Mythic", unlockWins: 150, quote: "You shine even when no one's watching. That's real light." },
    { id: "euphoria", name: "Euphoria Fern", emoji: "✨🌿✨", rarity: "Ultimate", unlockWins: 200, quote: "You've grown 200 good things. That's a forest of kindness." }
];

// Get plant by wins count (returns the highest unlocked plant)
function getPlantByWins(wins) {
    let unlocked = PLANTS[0];
    for (let plant of PLANTS) {
        if (wins >= plant.unlockWins) {
            unlocked = plant;
        } else {
            break;
        }
    }
    return unlocked;
}

// Get all unlocked plants based on wins
function getUnlockedPlants(wins) {
    return PLANTS.filter(plant => wins >= plant.unlockWins);
}

// Get plant card data for a specific good thing entry
function getPlantCardForWin(wins, goodThing, date) {
    const plant = getPlantByWins(wins);
    return {
        plantId: plant.id,
        plantName: plant.name,
        plantEmoji: plant.emoji,
        rarity: plant.rarity,
        quote: plant.quote,
        goodThing: goodThing,
        date: date,
        winsAtTime: wins
    };
}