import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Inventory from "@/components/Inventory";
import LoginModal from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gifts, Gift, getRarityBorder, getRarityColor } from "@/config/gifts";
import { toast } from "sonner";
import { useUserData } from "@/hooks/useUserData";
import { useLanguage } from "@/contexts/LanguageContext";

const ShopModule = () => {
  const { isLoaded, loadUserData, saveUserData, userId } = useUserData();
  const { t } = useLanguage();

  // State
  const [tonCoins, setTonCoins] = useState(0);
  const [inventory, setInventory] = useState<Gift[]>([]);
  const [withdrawalGifts, setWithdrawalGifts] = useState<Gift[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showTechnicalWorks, setShowTechnicalWorks] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedGiftToBuy, setSelectedGiftToBuy] = useState<Gift | null>(null);

  // Load user data
  useEffect(() => {
    if (!isLoaded) return;
    const userData = loadUserData();
    if (userData) {
      setTonCoins((userData as any).tonCoins || 0);
      setInventory(userData.inventory || []);
      setWithdrawalGifts(userData.withdrawalGifts || []);
      setIsAuthenticated(userData.isAuthenticated || false);
      setUsername((userData as any).username || null);
    }
  }, [isLoaded]);

  // Save user data when tonCoins or inventory changes
  useEffect(() => {
    if (!isLoaded || !userId) return;
    saveUserData({ tonCoins, inventory, withdrawalGifts, isAuthenticated, username });
  }, [tonCoins, inventory, withdrawalGifts, isAuthenticated, username, isLoaded, userId, saveUserData]);

  // Calculate price based on gift's actual price from config
  const getPrice = (gift: Gift) => {
    const basePrice = gift.price;
    const discountPercent = 30; // Default 30% discount for shop
    const discountedPrice = +(basePrice * (1 - discountPercent / 100)).toFixed(3);
    return {
      basePrice,
      discountedPrice,
      discountPercent,
    };
  };

  // Filter products
  const filteredGifts = gifts.filter((gift) => {
    if (selectedRarity !== 'all' && gift.rarity !== selectedRarity) return false;
    const price = getPrice(gift).discountedPrice;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    return true;
  });

  const handleBuy = (gift: Gift) => {
    const price = getPrice(gift).discountedPrice;
    if (tonCoins < price) {
      toast.error(t('notEnoughTON'));
      return;
    }
    
    // Вычитаем цену и добавляем товар в инвентарь
    const newBalance = +(tonCoins - price).toFixed(3);
    setTonCoins(newBalance);
    setInventory((prev) => [...prev, gift]);
    setSelectedGiftToBuy(null);
    
    toast.success(`${t('purchased')}: ${gift.name}`, {
      description: t('addedToInventory'),
    });
  };

  const handleSell = (gift: Gift) => {
    setInventory((prev) => {
      const index = prev.findIndex((g) => g.id === gift.id && g.name === gift.name && g.image === gift.image);
      if (index > -1) {
        return prev.slice(0, index).concat(prev.slice(index + 1));
      }
      return prev;
    });

    // Цена продажи - 70% от оригинальной (скидка 30%)
    const sellPrice = +(gift.price * 0.7).toFixed(3);
    const newBalance = +(tonCoins + sellPrice).toFixed(3);
    setTonCoins(newBalance);

    toast.success(`${t('sold')}: ${gift.name}`, {
      description: `+${sellPrice.toFixed(3)} TON`,
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

  const handleLogin = (user?: { username?: string | null; first_name?: string | null }) => {
    setIsAuthenticated(true);
    if (user?.username) setUsername(user.username);
    else if (user?.first_name) setUsername(user.first_name);
    setShowLogin(false);
    toast.success(t('authSuccess'), {
      description: t('canWithdraw'),
    });
  };

  const rarityLabels = { 
    common: t('common'), 
    rare: t('rare'), 
    epic: t('epic'), 
    legendary: t('legendary') 
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header
        tonCoins={tonCoins}
        isAuthenticated={isAuthenticated}
        inventoryCount={inventory.length}
        userId={userId}
        username={username}
        onLoginClick={() => setShowLogin(true)}
        onTopUpClick={handleTopUpClick}
        onInventoryClick={() => setShowInventory(true)}
      />

      <main className="w-full px-3 sm:px-4 pt-4 sm:pt-6 md:pt-8 pb-8">
        {/* Banner with Fire + Discount Info */}
        <div className="max-w-5xl mx-auto mb-4 sm:mb-6 md:mb-8">
          <Card className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-2 border-orange-500/50 rounded-lg sm:rounded-2xl overflow-hidden p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="text-4xl sm:text-5xl md:text-6xl animate-bounce flex-shrink-0">🔥</div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-orange-300 mb-1 sm:mb-2">{t('hugeDiscounts')}</h2>
                <p className="text-xs sm:text-sm md:text-lg text-orange-200 line-clamp-2">{t('discountsUpTo')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="max-w-5xl mx-auto mb-4 sm:mb-6 md:mb-8">
          <Card className="bg-card/50 border-primary/20 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">{t('filters')}</h3>

            {/* Rarity Filter */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">{t('rarity')}</label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {['all', 'common', 'rare', 'epic', 'legendary'].map((rarity) => (
                  <Button
                    key={rarity}
                    variant={selectedRarity === rarity ? 'neon' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRarity(rarity as any)}
                    className="h-8 text-xs sm:text-sm"
                  >
                    {rarity === 'all' ? t('all') : rarityLabels[rarity as keyof typeof rarityLabels]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-2 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                {t('price')}: {priceRange[0].toFixed(0)} - {priceRange[1].toFixed(0)} TON
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={1000}
                step={10}
                className="w-full"
              />
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="max-w-5xl mx-auto mb-12">
          {filteredGifts.length === 0 ? (
            <Card className="bg-card/30 border-primary/20 p-4 sm:p-6 md:p-8 text-center rounded-lg sm:rounded-xl">
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">{t('noProductsFound')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {filteredGifts.map((gift) => {
                const priceData = getPrice(gift);
                return (
                  <Card
                    key={gift.id}
                    className={`bg-card border-2 ${getRarityBorder(gift.rarity)} rounded-lg sm:rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer`}
                    onClick={() => setSelectedGiftToBuy(gift)}
                  >
                    <div className="relative">
                      <img
                        src={gift.image}
                        alt={gift.name}
                        className="w-full h-20 sm:h-32 md:h-40 object-cover"
                      />
                      {/* Discount Badge */}
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                        -{priceData.discountPercent}%
                      </div>
                    </div>

                    <div className="p-2 sm:p-3 md:p-4">
                      <h4 className="text-xs sm:text-sm md:text-lg font-bold mb-1 sm:mb-2 truncate">{gift.name}</h4>
                      <div className={`text-xs font-semibold mb-2 sm:mb-3 ${getRarityColor(gift.rarity)}`}>
                        {rarityLabels[gift.rarity]}
                      </div>

                      {/* Price */}
                      <div className="mb-2 sm:mb-3 md:mb-4">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <span className="text-muted-foreground line-through text-xs sm:text-sm">{priceData.basePrice.toFixed(2)} TON</span>
                          <span className="text-sm sm:text-lg md:text-xl font-bold text-primary">{priceData.discountedPrice.toFixed(2)} TON</span>
                        </div>
                      </div>

                      <Button
                        variant="neon"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGiftToBuy(gift);
                        }}
                        className="w-full h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      >
                        {t('buy')}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Buy Confirmation Dialog */}
      <Dialog open={!!selectedGiftToBuy} onOpenChange={(open) => !open && setSelectedGiftToBuy(null)}>
        <DialogContent className="bg-card border-primary max-w-sm sm:max-w-lg mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg md:text-xl font-bold text-center">{t('confirmPurchase')}</DialogTitle>
          </DialogHeader>

          {selectedGiftToBuy && (
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
              <div className="text-center">
                <img
                  src={selectedGiftToBuy.image}
                  alt={selectedGiftToBuy.name}
                  className="h-20 sm:h-28 md:h-32 w-20 sm:w-28 md:w-32 mx-auto object-cover rounded-lg mb-2 sm:mb-3"
                />
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{selectedGiftToBuy.name}</h3>
                <p className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${getRarityColor(selectedGiftToBuy.rarity)}`}>
                  {rarityLabels[selectedGiftToBuy.rarity]}
                </p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-neon-pink mb-2 sm:mb-4">
                  {getPrice(selectedGiftToBuy).discountedPrice.toFixed(3)} TON
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('areYouSureBuy')}
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedGiftToBuy(null)}
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                >
                  {t('back')}
                </Button>
                <Button
                  variant="neon"
                  onClick={() => handleBuy(selectedGiftToBuy)}
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                >
                  {t('yesBuy')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inventory */}
      <Inventory
        open={showInventory}
        onOpenChange={setShowInventory}
        gifts={inventory}
        withdrawalGifts={withdrawalGifts}
        onWithdraw={handleWithdraw}
        onSell={handleSell}
      />

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

export default ShopModule;
