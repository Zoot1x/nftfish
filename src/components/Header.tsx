import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, LogIn, Coins } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import MobileMenu from "./MobileMenu";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  spins: number;
  isAuthenticated: boolean;
  inventoryCount?: number;
  userId?: string;
  onLoginClick: () => void;
  onInventoryClick: () => void;
}

const Header = ({ spins, isAuthenticated, inventoryCount = 0, userId = '', onLoginClick, onInventoryClick }: HeaderProps) => {
  const { t } = useLanguage();

  // Форматируем ID для отображения (показываем последние 8 символов)
  const displayId = userId ? userId.slice(-8).toUpperCase() : 'ANON';

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Avatar and Username */}
          <div className="flex items-center gap-2 md:gap-3">
            <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-primary shadow-glow-cyan">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} />
              <AvatarFallback>{displayId.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-sm md:text-base text-foreground">{t('anonymous')}</h2>
              <p className="text-xs md:text-sm text-muted-foreground">ID: #{displayId}</p>
            </div>
          </div>

          {/* Right: Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />

            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border border-primary/30">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">{spins}</span>
              <span className="text-sm text-muted-foreground">{t('spins')}</span>
            </div>

            {!isAuthenticated && (
              <Button variant="neon" onClick={onLoginClick} className="gap-2">
                <LogIn className="h-4 w-4" />
                {t('login')}
              </Button>
            )}

            <Button variant="outline" onClick={onInventoryClick} className="gap-2 relative">
              <Package className="h-4 w-4" />
              {t('inventory')}
              {inventoryCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-destructive text-white text-xs font-bold">
                  {inventoryCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg border border-primary/30">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-bold text-primary text-sm">{spins}</span>
            </div>
            <MobileMenu
              spins={spins}
              isAuthenticated={isAuthenticated}
              inventoryCount={inventoryCount}
              onLoginClick={onLoginClick}
              onInventoryClick={onInventoryClick}
            />
          </div>
          </div>
        </div>
    </header>
  );
};

export default Header;
