import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn, Coins, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";

interface MobileMenuProps {
  spins: number;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onInventoryClick: () => void;
}

const MobileMenu = ({ spins, isAuthenticated, onLoginClick, onInventoryClick }: MobileMenuProps) => {
  const { t } = useLanguage();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] bg-card">
        <div className="flex flex-col gap-6 mt-8">
          {/* Spins Counter */}
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-lg border border-primary/30">
            <Coins className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">{spins}</span>
            <span className="text-sm text-muted-foreground">{t('spins')}</span>
          </div>

          {/* Language Selector */}
          <div className="px-1">
            <LanguageSelector />
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-2">
            {!isAuthenticated && (
              <Button variant="neon" onClick={onLoginClick} className="w-full justify-start gap-2">
                <LogIn className="h-4 w-4" />
                {t('login')}
              </Button>
            )}
            <Button variant="outline" onClick={onInventoryClick} className="w-full justify-start gap-2">
              <Package className="h-4 w-4" />
              {t('inventory')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;