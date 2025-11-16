import giftsData from '../assets/gifts.json';

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Gift {
  id: string;
  name: string;
  image: string;
  chance: number; // Шанс выпадения в процентах (всего должно быть 100%)
  rarity: Rarity;
  price: number; // Цена в TON
}

// Rarity-based chance percentages (will be distributed among items of same rarity)
const RARITY_CHANCES: Record<Rarity, number> = {
  common: 99,
  rare: 1,
  epic: 0.1,
  legendary: 0.01,
};

// Limit NFTs per rarity for performance (adjust as needed)
const MAX_ITEMS_PER_RARITY: Record<Rarity, number> = {
  common: 20,     // 100 common items
  rare: 20,       // 100 rare items  
  epic: 20,       // 100 epic items
  legendary: 20,  // 100 legendary items
};
// Total: 400 NFTs - good balance between performance and variety

// Load images lazily - only when needed (NOT eager)
const imageModules = import.meta.glob<{ default: string }>('../assets/nft_downloads/**/*.png', {
  eager: true, // Temporarily use eager for limited set
});

// Create a map for quick image path lookup
const imageMap = new Map<string, string>();
Object.entries(imageModules).forEach(([path, module]) => {
  // Extract filename from path: ../assets/nft_downloads/astralshard/astralshard-1278.png -> astralshard-1278.png
  const filename = path.split('/').pop()?.toLowerCase() || '';
  imageMap.set(filename, module.default);
});

// Generate gifts array from JSON data
function generateGifts(): Gift[] {
  const allGifts: Gift[] = [];
  let idCounter = 1;

  // Count items per rarity for chance distribution
  const rarityCount: Record<Rarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  // Track how many items we've added per rarity
  const rarityAdded: Record<Rarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  // First pass: collect and group valid items by rarity
  const itemsByRarity: Record<Rarity, Array<{ collection: string; item: any }>> = {
    common: [],
    rare: [],
    epic: [],
    legendary: [],
  };

  Object.entries(giftsData as Record<string, any[]>).forEach(([collection, items]) => {
    items.forEach((item) => {
      const filename = item.file.toLowerCase();
      // Only include items with valid image and price > 0
      if (imageMap.has(filename) && item.price > 0) {
        const rarity = item.rarity as Rarity;
        itemsByRarity[rarity].push({ collection, item });
      }
    });
  });

  // Shuffle each rarity group separately
  Object.keys(itemsByRarity).forEach((rarity) => {
    itemsByRarity[rarity as Rarity].sort(() => Math.random() - 0.5);
  });

  // Second pass: add items up to limit per rarity from each group
  Object.entries(itemsByRarity).forEach(([rarity, items]) => {
    const rarityKey = rarity as Rarity;
    const limit = MAX_ITEMS_PER_RARITY[rarityKey];
    
    items.slice(0, limit).forEach(({ collection, item }) => {
      const filename = item.file.toLowerCase();
      const imagePath = imageMap.get(filename);

      if (!imagePath) {
        return;
      }

      rarityCount[rarityKey]++;
      rarityAdded[rarityKey]++;

      // Format collection name (e.g., "astralshard" -> "Astral Shard")
      const collectionName = collection
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/(?=[A-Z])|[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      allGifts.push({
        id: String(idCounter++),
        name: `${collectionName} #${item.number}`,
        image: imagePath,
        chance: 0, // Will be calculated after
        rarity: rarityKey,
        price: item.price, // Price from JSON is already in correct format
      });
    });
  });

  // Third pass: distribute chances evenly
  allGifts.forEach(gift => {
    const baseChance = RARITY_CHANCES[gift.rarity];
    gift.chance = baseChance / rarityCount[gift.rarity];
  });

  return allGifts;
}

export const gifts: Gift[] = generateGifts();

// Log statistics on load
if (import.meta.env.DEV) {
  const stats = {
    total: gifts.length,
    common: gifts.filter(g => g.rarity === 'common').length,
    rare: gifts.filter(g => g.rarity === 'rare').length,
    epic: gifts.filter(g => g.rarity === 'epic').length,
    legendary: gifts.filter(g => g.rarity === 'legendary').length,
    totalChance: gifts.reduce((sum, g) => sum + g.chance, 0),
  };
  
  console.log('🎁 NFT Collection Loaded:', stats);
  console.log(`📊 Rarity Distribution:
    Common: ${stats.common} items (${RARITY_CHANCES.common}% total chance)
    Rare: ${stats.rare} items (${RARITY_CHANCES.rare}% total chance)
    Epic: ${stats.epic} items (${RARITY_CHANCES.epic}% total chance)
    Legendary: ${stats.legendary} items (${RARITY_CHANCES.legendary}% total chance)
    Total Chance: ${stats.totalChance.toFixed(2)}%
  `);
}

export const getRarityColor = (rarity: Gift['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'text-gray-400';
    case 'rare':
      return 'text-blue-400';
    case 'epic':
      return 'text-purple-400';
    case 'legendary':
      return 'text-neon-pink';
    default:
      return 'text-gray-400';
  }
};

export const getRarityBorder = (rarity: Gift['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'border-gray-400';
    case 'rare':
      return 'border-blue-400';
    case 'epic':
      return 'border-purple-400';
    case 'legendary':
      return 'border-neon-pink shadow-glow-pink';
    default:
      return 'border-gray-400';
  }
};
