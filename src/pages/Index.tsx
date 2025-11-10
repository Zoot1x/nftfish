import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Roulette from "@/components/Roulette";
import Inventory from "@/components/Inventory";
import SubscriptionModal from "@/components/SubscriptionModal";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import LoginModal from "@/components/LoginModal";
import RecentWins from "@/components/RecentWins";
import { Gift } from "@/config/gifts";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserData } from "@/hooks/useUserData";

const Index = () => {
  const { t } = useLanguage();
  const { isLoaded, loadUserData, saveUserData, getDefaultUserData, userId } = useUserData();
  
  const [spins, setSpins] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [inventory, setInventory] = useState<Gift[]>([]);
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
      setInventory(userData.inventory);
      setHasSubscribed(userData.hasSubscribed);
      setIsAuthenticated(userData.isAuthenticated);
    }
  }, [isLoaded]);

  // Сохраняем данные пользователя при изменении
  useEffect(() => {
    if (!isLoaded || !userId) return;
    
    saveUserData({
      spins,
      inventory,
      hasSubscribed,
      isAuthenticated,
    });
  }, [spins, inventory, hasSubscribed, isAuthenticated, isLoaded, userId, saveUserData]);

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
        inventoryCount={inventory.length}
        userId={userId}
        onLoginClick={() => setShowLogin(true)}
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
