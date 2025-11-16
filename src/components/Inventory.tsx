import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, getRarityColor, getRarityBorder } from "@/config/gifts";
import { Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface InventoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gifts: Gift[];
  withdrawalGifts?: Gift[];
  onWithdraw: (giftId: string) => void;
  onSell?: (gift: Gift) => void;
}

const Inventory = ({ open, onOpenChange, gifts, withdrawalGifts = [], onWithdraw, onSell }: InventoryProps) => {
  const { t } = useLanguage();
  const [selectedGiftToSell, setSelectedGiftToSell] = useState<Gift | null>(null);

  const rarityLabels = {
    common: t('common'),
    rare: t('rare'),
    epic: t('epic'),
    legendary: t('legendary'),
  };

  const handleSellConfirm = () => {
    if (selectedGiftToSell && onSell) {
      onSell(selectedGiftToSell);
      setSelectedGiftToSell(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-primary mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              {t('inventoryTitle')}
            </DialogTitle>
          </DialogHeader>

          {gifts.length === 0 && withdrawalGifts.length === 0 ? (
            <div className="py-8 sm:py-12 text-center">
              <Package className="h-16 sm:h-20 w-16 sm:w-20 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">{t('inventoryEmpty')}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {t('inventoryEmptyDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8 py-3 sm:py-4">
              {/* Withdrawal Slot */}
              {withdrawalGifts.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-foreground border-b border-primary/20 pb-2">
                    📤 {t('forWithdrawal')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {withdrawalGifts.map((gift, index) => (
                      <div
                        key={`withdrawal-${gift.id}-${index}`}
                        className={`p-2 sm:p-3 md:p-4 bg-orange-500/10 border-2 border-orange-500/50 rounded-lg hover:scale-105 transition-transform duration-300`}
                      >
                        <img
                          src={gift.image}
                          alt={gift.name}
                          className="w-full h-16 sm:h-24 md:h-32 lg:h-40 object-cover rounded-lg mb-1 sm:mb-2 md:mb-3"
                        />
                        <h3 className="font-bold text-xs sm:text-sm md:text-lg mb-0.5 sm:mb-1 truncate">{gift.name}</h3>
                        <p className={`text-xs capitalize mb-1 sm:mb-2 ${getRarityColor(gift.rarity)}`}>
                          {rarityLabels[gift.rarity as keyof typeof rarityLabels]}
                        </p>
                        <p className="text-xs sm:text-sm text-primary font-bold mb-2 sm:mb-3">
                          {gift.price.toFixed(2)} TON
                        </p>
                        <div className="text-xs text-orange-400 font-semibold text-center">
                          ✓ {t('withdrawalQueued')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Slot */}
              {gifts.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-foreground border-b border-primary/20 pb-2">
                    🎁 {t('inventoryTitle')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {gifts.map((gift, index) => (
                      <div
                        key={`${gift.id}-${index}`}
                        className={`p-2 sm:p-3 md:p-4 bg-muted/30 rounded-lg border-2 ${getRarityBorder(gift.rarity)} hover:scale-105 transition-transform duration-300`}
                      >
                        <img
                          src={gift.image}
                          alt={gift.name}
                          className="w-full h-16 sm:h-24 md:h-32 lg:h-40 object-cover rounded-lg mb-1 sm:mb-2 md:mb-3"
                        />
                        <h3 className="font-bold text-xs sm:text-sm md:text-lg mb-0.5 sm:mb-1 truncate">{gift.name}</h3>
                        <p className={`text-xs capitalize mb-1 sm:mb-2 ${getRarityColor(gift.rarity)}`}>
                          {rarityLabels[gift.rarity as keyof typeof rarityLabels]}
                        </p>
                        <p className="text-xs sm:text-sm text-primary font-bold mb-2 sm:mb-3">
                          {gift.price.toFixed(2)} TON
                        </p>
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 h-7 sm:h-8 md:h-9 text-xs"
                            onClick={() => onWithdraw(gift.id)}
                          >
                            {t('withdraw')}
                          </Button>
                          <Button
                            variant="neon"
                            className="flex-1 h-7 sm:h-8 md:h-9 text-xs"
                            onClick={() => setSelectedGiftToSell(gift)}
                          >
                            {t('sell')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sell Confirmation Dialog */}
      <Dialog open={!!selectedGiftToSell} onOpenChange={(open) => !open && setSelectedGiftToSell(null)}>
        <DialogContent className="bg-card border-primary max-w-sm mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl font-bold text-center">{t('confirmSale')}</DialogTitle>
          </DialogHeader>

          {selectedGiftToSell && (
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="text-center">
                <img
                  src={selectedGiftToSell.image}
                  alt={selectedGiftToSell.name}
                  className="h-20 sm:h-28 md:h-32 w-20 sm:w-28 md:w-32 mx-auto object-cover rounded-lg mb-2 sm:mb-3"
                />
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{selectedGiftToSell.name}</h3>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-neon-pink mb-2 sm:mb-4">
                  +{(selectedGiftToSell.price * 0.6).toFixed(3)} TON
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('areYouSureSell')}
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedGiftToSell(null)}
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                >
                  {t('back')}
                </Button>
                <Button
                  variant="neon"
                  onClick={handleSellConfirm}
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                >
                  {t('yesSell')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Inventory;
