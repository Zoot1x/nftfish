import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { gifts, Gift, getRarityBorder } from "@/config/gifts";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface RouletteProps {
  spins: number;
  onSpin: (wonGift: Gift) => void;
  onNoSpins: () => void;
}

const Roulette = ({ spins, onSpin, onNoSpins }: RouletteProps) => {
  const { t } = useLanguage();
  const [spinning, setSpinning] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const rouletteRef = useRef<HTMLDivElement>(null);
  const [extendedGifts, setExtendedGifts] = useState<Gift[]>([]);

  useEffect(() => {
    // Создаем массив с повторяющимися подарками для бесконечной прокрутки
    const repeated: Gift[] = [];
    for (let i = 0; i < 50; i++) {
      repeated.push(...gifts);
    }
    setExtendedGifts(repeated);
  }, []);

  const getRandomGift = (): Gift => {
    const random = Math.random() * 100;
    let cumulativeChance = 0;

    for (const gift of gifts) {
      cumulativeChance += gift.chance;
      if (random <= cumulativeChance) {
        return gift;
      }
    }

    return gifts[0];
  };

  const handleSpin = () => {
    if (spins <= 0) {
      onNoSpins();
      return;
    }

    if (spinning) return;

    setSpinning(true);
    setSelectedGift(null);

    // Анимация горизонтальной рулетки
    if (rouletteRef.current) {
      const wonGift = getRandomGift();
      
      // Находим индекс выигрышного подарка в середине массива
      const middleIndex = Math.floor(extendedGifts.length / 2);
      const wonIndex = extendedGifts.findIndex((g, i) => 
        g.id === wonGift.id && i > middleIndex && i < middleIndex + 20
      );
      
      const isMobile = window.innerWidth < 768;
      const cardWidth = isMobile ? 100 : 140; // Ширина одной карточки + gap на мобильных и десктопе
      const containerWidth = rouletteRef.current.offsetWidth;
      const centerOffset = containerWidth / 2 - 60; // Центрируем по середине контейнера
      
      // Расчет финальной позиции с добавлением случайного смещения
      const finalPosition = -(wonIndex * cardWidth) + centerOffset + (Math.random() * 40 - 20);
      
      // Применяем анимацию
      rouletteRef.current.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
      rouletteRef.current.style.transform = `translateX(${finalPosition}px)`;

      setTimeout(() => {
        setSpinning(false);
        setSelectedGift(wonGift);
        onSpin(wonGift);
        
        toast.success(`${t('wonToast')} ${wonGift.name}!`, {
          description: t('addedToInventory'),
        });

        // Reset position
        if (rouletteRef.current) {
          setTimeout(() => {
            if (rouletteRef.current) {
              rouletteRef.current.style.transition = 'none';
              rouletteRef.current.style.transform = 'translateX(0px)';
            }
          }, 500);
        }
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent animate-glow-pulse">
        {t('title')}
      </h1>

      {/* Roulette Container */}
      <div className="w-full max-w-5xl mb-8">
        {/* Indicator */}
        <div className="relative w-full h-2 mb-4">
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-primary shadow-glow-cyan rounded-full" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
        </div>

        {/* Roulette Track */}
        <div className="relative overflow-hidden rounded-xl border-4 border-primary bg-card/50 shadow-glow-cyan p-4">
          <div
            ref={rouletteRef}
            className="flex gap-4"
            style={{ transform: 'translateX(0px)' }}
          >
            {extendedGifts.map((gift, index) => (
              <div
                key={`${gift.id}-${index}`}
                className={`flex-shrink-0 w-[120px] h-[120px] rounded-lg border-2 ${getRarityBorder(gift.rarity)} bg-muted/50 p-2 flex flex-col items-center justify-center transition-transform hover:scale-105`}
              >
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-16 h-16 object-cover rounded-lg mb-2"
                />
                <p className="text-xs font-semibold text-center truncate w-full">
                  {gift.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        variant="neon"
        size="lg"
        onClick={handleSpin}
        disabled={spinning}
        className="text-xl px-12 py-6 rounded-full font-bold uppercase tracking-wider"
      >
        {spinning ? t('spinning') : t('spinButton')}
      </Button>

      {/* Last Win Display */}
      {selectedGift && !spinning && (
        <div className="mt-8 p-6 bg-card/80 border-2 border-primary rounded-lg shadow-glow-cyan animate-slide-up">
          <p className="text-center text-xl font-bold mb-2">{t('youWon')}</p>
          <div className="flex items-center gap-4">
            <img
              src={selectedGift.image}
              alt={selectedGift.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <p className="text-lg font-bold">{selectedGift.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{selectedGift.rarity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roulette;
