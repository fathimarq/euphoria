// Sunrise Mantras - Nature themed, warm and uplifting
const SUNRISE_MANTRAS = [
    "🌱 Grow like a tree — slowly, deeply, unshaken.",
    "🌻 You are a sunflower. Turn toward what feeds you.",
    "🌿 Even the strongest oak was once a seed that trusted the soil.",
    "☀️ Let today be golden. Let you be gentle with yourself.",
    "🍃 Roots don't rush. Neither should you.",
    "🌸 Rest is part of growth. The field lies fallow before it blooms.",
    "✨ You did enough. You are enough. Breathe like the wind.",
    "🌳 Every great forest started with one small seed. That seed was you.",
    "🍄 Even mushrooms grow in the dark. You're doing better than you think.",
    "🌾 The sun doesn't shine for the perfect garden. It shines for all of it.",
    "🍂 Let go of yesterday's wilted leaves. Today is a new sprout.",
    "🌺 Your kindness to yourself waters the whole garden.",
    "🌿 You don't have to grow fast. Just grow true.",
    "☀️ Morning light finds every leaf. It finds you too.",
    "🌱 Start small. Stay steady. Watch yourself bloom."
];

// Function to get today's mantra (changes based on date)
function getDailyMantra() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % SUNRISE_MANTRAS.length;
    return SUNRISE_MANTRAS[index];
}