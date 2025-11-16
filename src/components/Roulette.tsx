import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { gifts, Gift, getRarityBorder } from "@/config/gifts";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { GiftImage } from "@/components/GiftImage";

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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const sampleRef = useRef<Gift[]>([]);

  // Звук прокрутки
  const spinAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    spinAudio.current = new window.Audio('/spin.mp3');
  }, []);

  useEffect(() => {
    // Создаем компактный массив для рулетки - меньше элементов = быстрее
    // Берем случайную выборку из 50 подарков и повторяем 5 раз = 250 элементов
    const sampleSize = Math.min(50, gifts.length);
    const shuffled = [...gifts].sort(() => Math.random() - 0.5);
    const sample = shuffled.slice(0, sampleSize);
    sampleRef.current = sample; // Сохраняем выборку
    
    const repeated: Gift[] = [];
    for (let i = 0; i < 5; i++) {
      repeated.push(...sample);
    }
    setExtendedGifts(repeated);

    // Preload ALL images from sample before showing roulette
    const imagePromises = sample.map(gift => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails
        img.src = gift.image;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  const getRandomGift = (): Gift => {
    // Используем только загруженную выборку для выбора
    const sample = sampleRef.current.length > 0 ? sampleRef.current : gifts;
    const random = Math.random() * 100;
    let cumulativeChance = 0;

    for (const gift of sample) {
      cumulativeChance += gift.chance;
      if (random <= cumulativeChance) {
        return gift;
      }
    }

    return sample[0];
  };

  const handleSpin = () => {
    if (spins <= 0) {
      onNoSpins();
      return;
    }

    if (spinning) return;

    // Воспроизвести звук
    spinAudio.current?.play();

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
    <div className="flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 bg-gradient-primary bg-clip-text text-transparent animate-glow-pulse">
        {t('title')}
      </h1>

      {/* Loading indicator */}
      {!imagesLoaded ? (
        <div className="w-full max-w-5xl mb-6 sm:mb-8 flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
          <div className="animate-spin rounded-full h-12 sm:h-14 md:h-16 w-12 sm:w-14 md:w-16 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Загрузка изображений...</p>
        </div>
      ) : (
        <>
      {/* Roulette Container */}
      <div className="w-full max-w-5xl mb-6 sm:mb-8">
        {/* Indicator */}
        <div className="relative w-full h-2 mb-3 sm:mb-4">
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-primary shadow-glow-cyan rounded-full" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
        </div>

        {/* Roulette Track */}
        <div className="relative overflow-hidden rounded-lg sm:rounded-xl border-2 sm:border-4 border-primary bg-card/50 shadow-glow-cyan p-2 sm:p-4">
          <div
            ref={rouletteRef}
            className="flex gap-2 sm:gap-3 md:gap-4"
            style={{ 
              transform: 'translateX(0px)',
              willChange: 'transform' // GPU acceleration
            }}
          >
            {extendedGifts.map((gift, index) => (
              <div
                key={`${gift.id}-${index}`}
                className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-[120px] md:h-[120px] rounded-lg border-2 ${getRarityBorder(gift.rarity)} bg-muted/50 p-1 sm:p-2 flex flex-col items-center justify-center`}
              >
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover rounded-lg mb-1 sm:mb-2"
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
        className="text-base sm:text-lg md:text-xl px-6 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-full font-bold uppercase tracking-wider"
      >
        {spinning ? t('spinning') : t('spinButton')}
      </Button>

      {/* Last Win Display */}
      {selectedGift && !spinning && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-card/80 border-2 border-primary rounded-lg shadow-glow-cyan animate-slide-up w-full max-w-md mx-4">
          <p className="text-center text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">{t('youWon')}</p>
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={selectedGift.image}
              alt={selectedGift.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold truncate">{selectedGift.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground capitalize">{selectedGift.rarity}</p>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default Roulette;
