// Quick test script to verify gifts are loaded correctly
import { gifts } from './src/config/gifts.ts';

console.log('Total gifts:', gifts.length);
console.log('First 5 gifts:', gifts.slice(0, 5));

const rarityStats = {
  common: gifts.filter(g => g.rarity === 'common').length,
  rare: gifts.filter(g => g.rarity === 'rare').length,
  epic: gifts.filter(g => g.rarity === 'epic').length,
  legendary: gifts.filter(g => g.rarity === 'legendary').length,
};

console.log('Rarity stats:', rarityStats);

const totalChance = gifts.reduce((sum, g) => sum + g.chance, 0);
console.log('Total chance:', totalChance);
