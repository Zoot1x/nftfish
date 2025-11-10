import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, getRarityColor, getRarityBorder } from "@/config/gifts";
import { Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface InventoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gifts: Gift[];
  onWithdraw: (giftId: string) => void;
}

const Inventory = ({ open, onOpenChange, gifts, onWithdraw }: InventoryProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-primary">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {t('inventoryTitle')}
          </DialogTitle>
        </DialogHeader>

        {gifts.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="h-20 w-20 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground">{t('inventoryEmpty')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('inventoryEmptyDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {gifts.map((gift, index) => (
              <div
                key={`${gift.id}-${index}`}
                className={`p-4 bg-muted/30 rounded-lg border-2 ${getRarityBorder(gift.rarity)} hover:scale-105 transition-transform duration-300`}
              >
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-bold text-lg mb-1">{gift.name}</h3>
                <p className={`text-sm capitalize mb-3 ${getRarityColor(gift.rarity)}`}>
                  {gift.rarity}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onWithdraw(gift.id)}
                >
                  {t('withdraw')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Inventory;
