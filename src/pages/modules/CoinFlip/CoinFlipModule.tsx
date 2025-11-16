import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CoinFlipModule = () => {
  const { t } = useLanguage();
  const { isLoaded, loadUserData, saveUserData, userId } = useUserData();
  // State
  const [isFlipping, setIsFlipping] = useState(false);
  const [tonCoins, setTonCoins] = useState(0);
  const [inventory, setInventory] = useState(0);
  const [betAmount, setBetAmount] = useState('0.100');
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [showInventory, setShowInventory] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showTechnicalWorks, setShowTechnicalWorks] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    const userData = loadUserData();
    if (userData) {
      setTonCoins((userData as any).tonCoins || 0);
      setIsAuthenticated(userData.isAuthenticated || false);
      setUsername((userData as any).username || null);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    saveUserData({ tonCoins, isAuthenticated, username });
  }, [tonCoins, isAuthenticated, username, isLoaded, userId, saveUserData]);

  const handleFlip = () => {
    const bet = parseFloat(betAmount);
    
    if (isNaN(bet) || bet <= 0) {
      toast.error(t('enterValidBet'));
      return;
    }
    
    if (bet > tonCoins) {
      toast.error(t('notEnoughTON'));
      return;
    }

    setIsFlipping(true);
    setResult(null);
    
    // Вычитаем ставку
    setTonCoins((prev) => +(prev - bet).toFixed(3));

    // Определяем результат (50/50)
    const coinResult: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
    
    // Анимация: вращение монеты (увеличено до 8-12 оборотов)
    const spins = 8 + Math.floor(Math.random() * 5); // 8-12 оборотов
    // Результат определяет финальную позицию
    const finalRotation = rotation + (spins * 360) + (coinResult === 'tails' ? 180 : 0);
    setRotation(finalRotation);

    setTimeout(() => {
      setResult(coinResult);
      setIsFlipping(false);

      if (coinResult === selectedSide) {
        // Выигрыш: ставка * 1.75
        const winAmount = +(bet * 1.75).toFixed(3);
        setTonCoins((prev) => +(prev + winAmount).toFixed(3));
        toast.success(`🎉 ${t('victory')}`, {
          description: `${t('youWonAmount')}: ${winAmount.toFixed(3)} TON`,
        });
      } else {
        toast.error(t('defeat'), {
          description: `${t('youLost')}: ${bet.toFixed(3)} TON`,
        });
      }
    }, 4500); // Увеличено с 2000 до 4500ms
  };

  const quickBets = [0.1, 0.5, 1.0, 5.0];

  const topUpPackages = [
    { amount: 10, label: '10' },
    { amount: 25, label: '25' },
    { amount: 100, label: '100' },
    { amount: 250, label: '250' },
    { amount: 500, label: '500' },
  ];

  const handleTopUpClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setShowTechnicalWorks(true);
  };

  const handleTopUp = (pkg: { amount: number }) => {
    setTonCoins((prev) => +(prev + pkg.amount).toFixed(3));
    setShowTopUpDialog(false);
    toast.success(`+${pkg.amount} TON`);
  };

  const handleLogin = (user?: { username?: string | null; first_name?: string | null }) => {
    setIsAuthenticated(true);
    if (user?.username) setUsername(user.username);
    else if (user?.first_name) setUsername(user.first_name);
    setShowLogin(false);
    toast.success(t('authSuccess'), {
      description: t('canWithdraw'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header
        tonCoins={tonCoins}
        isAuthenticated={isAuthenticated}
        inventoryCount={inventory}
        userId={userId}
        username={username}
        onLoginClick={() => setShowLogin(true)}
        onTopUpClick={handleTopUpClick}
        onInventoryClick={() => setShowInventory(true)}
      />

      <main className="container mx-auto px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">🪙 {t('coinFlipTitle')}</h1>
            <p className="text-lg text-muted-foreground">{t('chooseSide')}</p>
          </div>

          {/* Coin Flip Game Area */}
          <div className="flex flex-col items-center justify-center gap-8 mb-8">
            {/* Coin Visualization */}
            <div className="relative w-48 h-48 mb-8" style={{ perspective: '1000px' }}>
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-6xl font-bold"
                style={{
                  transform: `rotateY(${rotation}deg)`,
                  transformStyle: 'preserve-3d',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  boxShadow: '0 10px 40px rgba(255, 215, 0, 0.5)',
                  transition: isFlipping ? 'transform 4.5s cubic-bezier(0.33, 1, 0.68, 1)' : 'none',
                }}
              >
                <div style={{ backfaceVisibility: 'hidden' }}>
                  👑
                </div>
                <div 
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    position: 'absolute'
                  }}
                >
                  🦅
                </div>
              </div>
            </div>

            {/* Result Display */}
            {result && !isFlipping && (
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {t('flipResult')}: {result === 'heads' ? `👑 ${t('heads')}` : `🦅 ${t('tails')}`}
                </p>
              </div>
            )}
          </div>

          {/* Game Controls */}
          <Card className="bg-card/50 border-primary/20 p-6 w-full max-w-md mx-auto">
            {/* Side Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">{t('chooseSide')}:</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedSide === 'heads' ? 'neon' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedSide('heads')}
                  disabled={isFlipping}
                  className="h-20"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1">👑</div>
                    <div>{t('heads')}</div>
                  </div>
                </Button>
                <Button
                  variant={selectedSide === 'tails' ? 'neon' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedSide('tails')}
                  disabled={isFlipping}
                  className="h-20"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1">🦅</div>
                    <div>{t('tails')}</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">{t('betAmount')}:</label>
              <Input
                type="number"
                step="0.001"
                min="0"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isFlipping}
                className="text-lg font-bold text-center"
              />
              <div className="flex gap-2 mt-3">
                {quickBets.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount.toFixed(3))}
                    disabled={isFlipping}
                    className="flex-1"
                  >
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Flip Button */}
            <Button
              variant="neon"
              size="lg"
              onClick={handleFlip}
              disabled={isFlipping}
              className="w-full"
            >
              {isFlipping ? t('flipping') : t('flipCoin')}
            </Button>

            {/* Info */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>{t('winCoefficient')}: <span className="text-neon-pink font-bold">x1.75</span></p>
              <p className="mt-1">{t('possibleWin')}: <span className="text-primary font-bold">{(parseFloat(betAmount || '0') * 1.75).toFixed(3)} TON</span></p>
            </div>
          </Card>
        </div>
      </main>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onLogin={handleLogin}
      />

      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="bg-card border-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">{t('topUp')}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {topUpPackages.map((pkg) => (
              <div key={pkg.amount} className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{pkg.label} TON</div>
                </div>
                <Button variant="outline" onClick={() => handleTopUp(pkg)}>
                  {t('buy')}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Technical Works Dialog */}
      <Dialog open={showTechnicalWorks} onOpenChange={setShowTechnicalWorks}>
        <DialogContent className="bg-card border-primary max-w-sm mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold">{t('technicalWorks')}</DialogTitle>
          </DialogHeader>
          
          <div className="py-6 sm:py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="text-6xl sm:text-7xl animate-spin">🔧</div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('technicalWorks')}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowTechnicalWorks(false)}
              className="w-full"
            >
              {t('back')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoinFlipModule;
