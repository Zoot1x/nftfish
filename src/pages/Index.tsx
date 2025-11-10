import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Roulette from "@/components/Roulette";
import Inventory from "@/components/Inventory";
import SubscriptionModal from "@/components/SubscriptionModal";
import LoginModal from "@/components/LoginModal";
import RecentWins from "@/components/RecentWins";
import { Gift } from "@/config/gifts";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const [spins, setSpins] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [inventory, setInventory] = useState<Gift[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [latestWin, setLatestWin] = useState<{ gift: Gift } | undefined>();

  // Загружаем состояние подписки из localStorage
  useEffect(() => {
    const subscribed = localStorage.getItem('hasSubscribed');
    if (subscribed === 'true') {
      setHasSubscribed(true);
    }
  }, []);

  const handleSpin = (wonGift: Gift) => {
    setSpins((prev) => prev - 1);
    setInventory((prev) => [...prev, wonGift]);
    setLatestWin({ gift: wonGift });
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
    localStorage.setItem('hasSubscribed', 'true');
    
    toast.success(t('subscribed'), {
      description: t('gotSpins'),
    });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    toast.success(t('authSuccess'), {
      description: t('canWithdraw'),
    });
  };

  const handleWithdraw = (giftId: string) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    // В реальном приложении здесь будет логика вывода подарка
    toast.success(t('withdrawSent'), {
      description: t('managerContact'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header
        spins={spins}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setShowLogin(true)}
        onInventoryClick={() => setShowInventory(true)}
      />

      <main className="container mx-auto px-4">
        {/* Recent Wins Section */}
        <div className="max-w-5xl mx-auto pt-6">
          <RecentWins latestWin={latestWin} />
        </div>

        {/* Roulette Section */}
        <Roulette spins={spins} onSpin={handleSpin} onNoSpins={handleNoSpins} />
      </main>

      {/* Modals */}
      <Inventory
        open={showInventory}
        onOpenChange={setShowInventory}
        gifts={inventory}
        onWithdraw={handleWithdraw}
      />

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

      {/* Footer */}
    </div>
  );
};

export default Index;
