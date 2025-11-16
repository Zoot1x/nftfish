import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Roulette from "@/components/Roulette";
import Inventory from "@/components/Inventory";
import SubscriptionModal from "@/components/SubscriptionModal";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import LoginModal from "@/components/LoginModal";
import RecentWins from "@/components/RecentWins";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "@/config/gifts";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserData } from "@/hooks/useUserData";

const Index = () => {
  const { t } = useLanguage();
  const { isLoaded, loadUserData, saveUserData, getDefaultUserData, userId } = useUserData();
  
  const [spins, setSpins] = useState(0);
  const [tonCoins, setTonCoins] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [inventory, setInventory] = useState<Gift[]>([]);
  const [withdrawalGifts, setWithdrawalGifts] = useState<Gift[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [latestWin, setLatestWin] = useState<{ gift: Gift } | undefined>();

  // Загружаем данные пользователя при загрузке страницы
  useEffect(() => {
    if (!isLoaded) return;
    
    const userData = loadUserData();
    if (userData) {
      setSpins(userData.spins);
      setTonCoins((userData as any).tonCoins || 0);
      setInventory(userData.inventory);
      setWithdrawalGifts(userData.withdrawalGifts);
      setHasSubscribed(userData.hasSubscribed);
      setIsAuthenticated(userData.isAuthenticated);
      setUsername((userData as any).username || null);
    }
  }, [isLoaded]);

  // Сохраняем данные пользователя при изменении
  useEffect(() => {
    if (!isLoaded || !userId) return;
    
    saveUserData({
      spins,
      tonCoins,
      inventory,
      withdrawalGifts,
      hasSubscribed,
      isAuthenticated,
      username,
    });
  }, [spins, inventory, withdrawalGifts, hasSubscribed, isAuthenticated, isLoaded, userId, saveUserData]);

  const handleSpin = (wonGift: Gift) => {
    setSpins((prev) => prev - 1);
    setInventory((prev) => [...prev, wonGift]);
    setLatestWin({ gift: wonGift });
  };

  // Buy spins dialog
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showTechnicalWorks, setShowTechnicalWorks] = useState(false);

  const packages = [
    { spins: 1, price: 30.55 },
    { spins: 5, price: 145.40 },
    { spins: 10, price: 291.70 },
    { spins: 25, price: 737.35 },
    { spins: 50, price: 1475.25 },
  ];

  const handleBuy = (pkg: { spins: number; price: number }) => {
    if (tonCoins < pkg.price) {
      toast.error('Not enough TON coins');
      return;
    }
    setTonCoins((prev) => +(prev - pkg.price).toFixed(3));
    setSpins((prev) => prev + pkg.spins);
    setShowBuyDialog(false);
    toast.success(`Purchased ${pkg.spins} spins for ${pkg.price} TON`);
  };

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

  const handleNoSpins = () => {
    if (hasSubscribed) {
      toast.error(t('noSpins'), {
        description: t('waitForNext'),
      });
    } else {
      setShowSubscription(true);
    }
  };

  const handleSubscribe = () => {
    if (hasSubscribed) {
      toast.error(t('alreadySubscribed'), {
        description: t('bonusOnce'),
      });
      return;
    }

    setSpins((prev) => prev + 3);
    setHasSubscribed(true);
    
    toast.success(t('subscribed'), {
      description: t('gotSpins'),
    });
  };

  const handleLogin = (user?: { username?: string | null; first_name?: string | null }) => {
    setIsAuthenticated(true);
    if (user?.username) setUsername(user.username);
    else if (user?.first_name) setUsername(user.first_name);

    toast.success(t('authSuccess'), {
      description: t('canWithdraw'),
    });
  };

  const handleWithdraw = (giftId: string) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    const giftIndex = inventory.findIndex(g => g.id === giftId);
    if (giftIndex !== -1) {
      const gift = inventory[giftIndex];
      setWithdrawalGifts([...withdrawalGifts, gift]);
      setInventory(inventory.filter((_, i) => i !== giftIndex));
      
      toast.success(t('withdrawalQueued'), {
        description: t('giftMovedToWithdrawal'),
      });
    }
    setLatestWin(undefined);
  };

  const handleSell = (gift: Gift) => {
    // Удаляем подарок из инвентаря
    setInventory((prev) => {
      const index = prev.findIndex((g) => g.id === gift.id && g.name === gift.name && g.image === gift.image);
      if (index > -1) {
        return prev.slice(0, index).concat(prev.slice(index + 1));
      }
      return prev;
    });

    // Добавляем цену подарка в баланс (60% от оригинальной цены - скидка 40%)
    const sellPrice = +(gift.price * 0.6).toFixed(3);
    const newBalance = +(tonCoins + sellPrice).toFixed(3);
    setTonCoins(newBalance);

    toast.success(`Продано: ${gift.name}`, {
      description: `+${sellPrice.toFixed(3)} TON`,
    });
  };

  const rarityLabels = {
    common: t('common'),
    rare: t('rare'),
    epic: t('epic'),
    legendary: t('legendary'),
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header
        spins={spins}
        tonCoins={tonCoins}
        isAuthenticated={isAuthenticated}
        inventoryCount={inventory.length}
        userId={userId}
        username={username}
        onLoginClick={() => setShowLogin(true)}
        onTopUpClick={handleTopUpClick}
        onInventoryClick={() => setShowInventory(true)}
      />

      {!hasSubscribed && (
        <SubscriptionBanner onSubscribe={() => setShowSubscription(true)} />
      )}

      <main className="container mx-auto px-4">
        {/* Recent Wins Section */}
        <div className="max-w-5xl mx-auto pt-6">
          <RecentWins latestWin={latestWin} />
        </div>

        {/* Controls: spins + buy */}
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="bg-muted/50 px-4 py-2 rounded-lg border border-primary/20">
            <div className="text-xs text-muted-foreground">{t('spins')}</div>
            <div className="font-bold text-lg">{spins}</div>
          </div>

          <div className="bg-muted/50 px-4 py-2 rounded-lg border border-primary/20 flex items-center gap-3">
            <img src="/Ton.svg" alt="TON" className="h-5 w-5" />
            <div>
              <div className="text-xs text-muted-foreground">TON</div>
              <div className="font-bold text-lg">{tonCoins.toFixed(3)}</div>
            </div>
          </div>

          <Button variant="neon" onClick={() => setShowBuyDialog(true)} className="ml-2">
            {t('buy')} {t('spins')}
          </Button>
        </div>

        {/* Roulette Section */}
        <Roulette spins={spins} onSpin={handleSpin} onNoSpins={handleNoSpins} />
      </main>

      {/* Modals */}
      <Inventory
        open={showInventory}
        onOpenChange={setShowInventory}
        gifts={inventory}
        withdrawalGifts={withdrawalGifts}
        onWithdraw={handleWithdraw}
        onSell={handleSell}
      />

      {/* Buy Spins Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="bg-card border-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">{t('buy')} {t('spins')}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.spins} className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{pkg.spins} {t('spins')}</div>
                  <div className="text-sm text-muted-foreground">{pkg.price} TON</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => handleBuy(pkg)}>
                    {t('buy')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Top-up TON Dialog */}
      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent className="bg-card border-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">{t('topUpTON')}</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              {t('selectAmount')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {topUpPackages.map((pkg) => (
              <div key={pkg.label} className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{pkg.label} TON</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => handleTopUp(pkg)}>
                    {t('topUp')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <SubscriptionModal
        open={showSubscription}
        onOpenChange={setShowSubscription}
        onSubscribe={handleSubscribe}
      />

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onLogin={handleLogin}
      />

      {/* Win Modal */}
      <Dialog open={!!latestWin} onOpenChange={(open) => !open && setLatestWin(undefined)}>
        <DialogContent className="bg-card border-2 border-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-neon-pink">🎉 {t('winTitle')} 🎉</DialogTitle>
          </DialogHeader>

          {latestWin && (
            <div className="space-y-6 py-4">
              {/* Gift Image */}
              <div className="flex justify-center">
                <img
                  src={latestWin.gift.image}
                  alt={latestWin.gift.name}
                  className="h-40 w-40 object-cover rounded-lg border-2 border-primary"
                />
              </div>

              {/* Gift Info */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">{latestWin.gift.name}</h3>
                <p className="text-sm text-muted-foreground">{t('rarity')}: {rarityLabels[latestWin.gift.rarity as keyof typeof rarityLabels]}</p>
                <p className="text-2xl font-bold text-neon-pink">{latestWin.gift.price.toFixed(3)} TON</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInventory(true);
                    setLatestWin(undefined);
                  }}
                  className="flex-1"
                >
                  {t('toInventory')}
                </Button>
                <Button
                  variant="neon"
                  onClick={() => setLatestWin(undefined)}
                  className="flex-1"
                >
                  {t('confirm')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LoginModal
        open={showLogin}
        onOpenChange={setShowLogin}
        onLogin={handleLogin}
      />

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

      {/* Footer */}
    </div>
  );
};

export default Index;
