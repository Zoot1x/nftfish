import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn, Package, Gamepad2, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { useState } from "react";

interface MobileMenuProps {
  spins?: number;
  tonCoins?: number;
  isAuthenticated: boolean;
  inventoryCount?: number;
  onLoginClick: () => void;
  onInventoryClick: () => void;
  onTopUpClick?: () => void;
}

const MobileMenu = ({ 
  spins = 0, 
  tonCoins = 0, 
  isAuthenticated, 
  inventoryCount = 0, 
  onLoginClick, 
  onInventoryClick, 
  onTopUpClick 
}: MobileMenuProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
          <Menu className="h-5 w-5" />
          {inventoryCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-destructive text-white text-xs font-bold">
              {inventoryCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur-sm p-0 flex flex-col">
        {/* Header Section */}
        <div className="border-b border-border p-4">
          <h3 className="font-bold text-lg text-foreground mb-4">MENU</h3>
          
          {/* Balance Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-primary/10 px-4 py-3 rounded-lg border border-primary/30">
              <img src="/Ton.svg" alt="TON" className="h-6 w-6" />
              <div className="flex-1">
                <div className="font-bold text-primary">{tonCoins.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">TON</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onTopUpClick ? onTopUpClick() : onLoginClick();
                  closeMenu();
                }}
                className="h-8 text-xs"
              >
                {t('topUp')}
              </Button>
            </div>

            {/* Spins Counter */}
            {spins > 0 && (
              <div className="flex items-center gap-3 bg-secondary/10 px-4 py-3 rounded-lg border border-secondary/30">
                <span className="text-2xl">✨</span>
                <div className="flex-1">
                  <div className="font-bold text-secondary">{spins}</div>
                  <div className="text-xs text-muted-foreground">{t('spins')}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {/* Language Selector */}
            <div className="mb-4 pb-4 border-b border-border">
              <LanguageSelector />
            </div>

            {/* Module Navigation */}
            <nav className="space-y-2 mb-4">
              <a href="/" onClick={closeMenu}>
                <Button variant="outline" className="w-full justify-start gap-3 h-9">
                  <Gamepad2 className="h-4 w-4" />
                  <span className="text-sm">{t('home')}</span>
                </Button>
              </a>
              <a href="/modules/roulette" onClick={closeMenu}>
                <Button variant="outline" className="w-full justify-start gap-3 h-9">
                  <span className="text-lg">🎡</span>
                  <span className="text-sm">{t('roulette')}</span>
                </Button>
              </a>
              <a href="/modules/shop" onClick={closeMenu}>
                <Button variant="outline" className="w-full justify-start gap-3 h-9">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-sm">{t('shop')}</span>
                </Button>
              </a>
              <a href="/modules/coinflip" onClick={closeMenu}>
                <Button variant="outline" className="w-full justify-start gap-3 h-9">
                  <img src="/Ton.svg" alt="TON" className="h-4 w-4" />
                  <span className="text-sm">{t('coinFlip')}</span>
                </Button>
              </a>
            </nav>

            <div className="border-t border-border pt-4" />

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  onInventoryClick();
                  closeMenu();
                }}
                className="w-full justify-start gap-3 h-9 relative"
              >
                <Package className="h-4 w-4" />
                <span className="text-sm flex-1 text-left">{t('inventory')}</span>
                {inventoryCount > 0 && (
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-destructive text-white text-xs font-bold">
                    {inventoryCount}
                  </span>
                )}
              </Button>

              {!isAuthenticated && (
                <Button 
                  variant="neon" 
                  onClick={() => {
                    onLoginClick();
                    closeMenu();
                  }}
                  className="w-full justify-start gap-3 h-9"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="text-sm">{t('login')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
