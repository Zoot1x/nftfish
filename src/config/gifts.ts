export interface Gift {
  id: string;
  name: string;
  image: string;
  chance: number; // Шанс выпадения в процентах (всего должно быть 100%)
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
import astralShard3329 from '../assets/Astral Shard 3329.png';
import astralShard431 from '../assets/Astral Shard 431.png';
import durovCap119 from '../assets/Durov’s Cap 119.png';
import gingerCookie79901 from '../assets/Ginger Cookie 79901.png';
import mightyArm472 from '../assets/Mighty Arm 472.png';
import plushPepe4 from '../assets/Plush Pepe 4.png';
import gingerCookie1700 from '../assets/Ginger Cookie 1700.png';
import heartLocket435 from '../assets/Heart Locket 435.png';
import plushPepe2 from '../assets/Plush Pepe 2.png';
import westsideSign1631 from '../assets/Westside Sign 1631.png';

export const gifts: Gift[] = [
  {
    id: '1',
    name: 'Astral Shard #3329',
    image: astralShard3329,
    chance: 25,
    rarity: 'rare',
  },
  {
    id: '2',
    name: 'Astral Shard #431',
    image: astralShard431,
    chance: 20,
    rarity: 'rare',
  },
  {
    id: '3',
    name: 'Durov’s Cap #119',
    image: durovCap119,
    chance: 15,
    rarity: 'epic',
  },
  {
    id: '4',
    name: 'Ginger Cookie #1700',
    image: gingerCookie1700,
    chance: 20,
    rarity: 'common',
  },
  {
    id: '5',
    name: 'Ginger Cookie #79901',
    image: gingerCookie79901,
    chance: 20,
    rarity: 'common',
  },
  {
    id: '6',
    name: 'Mighty Arm #472',
    image: mightyArm472,
    chance: 30,
    rarity: 'rare',
  },
  {
    id: '7',
    name: 'Westside Sign #1631',
    image: westsideSign1631,
    chance: 15,
    rarity: 'rare',
  },
  {
    id: '8',
    name: 'Heart Locket #435',
    image: heartLocket435,
    chance: 30,
    rarity: 'epic',
  },
  {
    id: '9',
    name: 'Plush Pepe #2',
    image: plushPepe2,
    chance: 40,
    rarity: 'legendary',
  },
  {
    id: '10',
    name: 'Plush Pepe #4',
    image: plushPepe4,
    chance: 40,
    rarity: 'legendary',
  },
];

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
