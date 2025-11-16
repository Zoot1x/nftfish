import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, LogIn, Gamepad2, ShoppingBag } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import MobileMenu from "./MobileMenu";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  spins?: number;
  tonCoins?: number;
  isAuthenticated: boolean;
  inventoryCount?: number;
  userId?: string;
  username?: string | null;
  onLoginClick: () => void;
  onTopUpClick?: () => void;
  onInventoryClick: () => void;
}

const Header = ({ spins = 0, tonCoins = 0, isAuthenticated, inventoryCount = 0, userId = '', username = null, onLoginClick, onTopUpClick, onInventoryClick }: HeaderProps) => {
  const { t } = useLanguage();

  // Форматируем ID для отображения (показываем последние 8 символов)
  const displayId = userId ? userId.slice(-8).toUpperCase() : 'ANON';

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="w-full px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Avatar and Username */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-primary shadow-glow-cyan flex-shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} />
              <AvatarFallback>{displayId.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block min-w-0">
              <h2 className="font-bold text-xs sm:text-sm md:text-base text-foreground truncate">{username ? username : t('anonymous')}</h2>
              <p className="text-xs text-muted-foreground truncate">ID: #{displayId.slice(-4)}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
            {/* Module Navigation */}
            <div className="flex items-center gap-1">
              <a href="/">
                <Button variant="ghost" size="sm" className="gap-1 lg:gap-2 h-8 lg:h-9">
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs lg:text-sm">{t('home')}</span>
                </Button>
              </a>
              <a href="/modules/roulette">
                <Button variant="ghost" size="sm" className="gap-1 lg:gap-2 h-8 lg:h-9">
                  <span className="text-lg">🎡</span>
                  <span className="hidden lg:inline text-xs lg:text-sm">{t('roulette')}</span>
                </Button>
              </a>
              <a href="/modules/shop">
                <Button variant="ghost" size="sm" className="gap-1 lg:gap-2 h-8 lg:h-9">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs lg:text-sm">{t('shop')}</span>
                </Button>
              </a>
              <a href="/modules/coinflip">
                <Button variant="ghost" size="sm" className="gap-1 lg:gap-2 h-8 lg:h-9">
                  <img src="/Ton.svg" alt="TON" className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden lg:inline text-xs lg:text-sm">{t('coinFlip')}</span>
                </Button>
              </a>
            </div>

            <div className="w-px h-6 bg-border hidden lg:block" />

            {/* Language Selector */}
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>
          </div>

          {/* Right: Desktop Controls */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 bg-muted/50 px-2 sm:px-3 py-2 rounded-lg border border-primary/30">
              <img src="/Ton.svg" alt="TON" className="h-4 w-4" />
              <div className="hidden sm:block ml-1">
                <div className="font-bold text-xs sm:text-sm text-primary">{tonCoins.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">TON</div>
              </div>
              <div className="sm:hidden font-bold text-xs text-primary">{tonCoins.toFixed(2)}</div>
            </div>

            <button onClick={() => (onTopUpClick ? onTopUpClick() : onLoginClick())} className="hidden lg:inline text-xs px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition">
              {t('topUp')}
            </button>

            {!isAuthenticated && (
              <Button variant="neon" onClick={onLoginClick} className="gap-2 h-8 lg:h-9">
                <LogIn className="h-4 w-4" />
                <span className="hidden lg:inline text-xs lg:text-sm">{t('login')}</span>
              </Button>
            )}

            <Button variant="outline" onClick={onInventoryClick} className="gap-2 relative h-8 lg:h-9">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline text-xs lg:text-sm">{t('inventory')}</span>
              {inventoryCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 rounded-full bg-destructive text-white text-xs font-bold">
                  {inventoryCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-1 flex-shrink-0">
            <MobileMenu
              spins={spins}
              tonCoins={tonCoins}
              isAuthenticated={isAuthenticated}
              inventoryCount={inventoryCount}
              onLoginClick={onLoginClick}
              onInventoryClick={onInventoryClick}
              onTopUpClick={onTopUpClick}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
