import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, LogIn, Coins } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  spins: number;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onInventoryClick: () => void;
}

const Header = ({ spins, isAuthenticated, onLoginClick, onInventoryClick }: HeaderProps) => {
  const { t } = useLanguage();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Avatar and Username */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary shadow-glow-cyan">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous" />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-foreground">{t('anonymous')}</h2>
              <p className="text-sm text-muted-foreground">ID: #123456</p>
            </div>
          </div>

          {/* Right: Language, Spins, Login, Inventory */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Spins Counter */}
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg border border-primary/30">
              <Coins className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">{spins}</span>
              <span className="text-sm text-muted-foreground">{t('spins')}</span>
            </div>

            {/* Login Button */}
            {!isAuthenticated && (
              <Button variant="neon" onClick={onLoginClick} className="gap-2">
                <LogIn className="h-4 w-4" />
                {t('login')}
              </Button>
            )}

            {/* Inventory Button */}
            <Button variant="outline" onClick={onInventoryClick} className="gap-2">
              <Package className="h-4 w-4" />
              {t('inventory')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
