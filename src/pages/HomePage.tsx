import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserData } from "@/hooks/useUserData";
import LanguageSelector from "@/components/LanguageSelector";

const HomePage = () => {
  const { t, language } = useLanguage();
  const { userId, isLoaded, loadUserData } = useUserData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [tonWonToday, setTonWonToday] = useState(0);
  const [showModules, setShowModules] = useState(false);

  // Генерируем случайное значение TON выигрыша за сегодня (1000-10000)
  // Обновляется каждый час
  useEffect(() => {
    const generateRandomTon = () => {
      return Math.floor(Math.random() * 9000) + 1000; // 1000-10000
    };

    setTonWonToday(generateRandomTon());

    // Обновляем каждый час
    const interval = setInterval(() => {
      setTonWonToday(generateRandomTon());
    }, 3600000); // 1 час

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const data = loadUserData();
      setIsAuthenticated(data?.isAuthenticated || false);
      setUsername((data as any)?.username || null);
    }
  }, [isLoaded, loadUserData]);

  const modules = [
    {
      id: 'roulette',
      title: t('roulette'),
      icon: '🎡',
      color: 'from-cyan-500 to-blue-600',
      link: '/modules/roulette',
    },
    {
      id: 'shop',
      title: t('shop'),
      icon: '🛍️',
      color: 'from-purple-500 to-pink-600',
      link: '/modules/shop',
    },
    {
      id: 'coinflip',
      title: t('coinFlip'),
      icon: '🪙',
      color: 'from-orange-500 to-red-600',
      link: '/modules/coinflip',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* 3D Background Stickers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated floating stickers */}
        <div className="absolute top-10 left-5 text-5xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>
          😂
        </div>
        <div className="absolute top-32 right-10 text-6xl opacity-15 animate-bounce" style={{ animationDelay: '1s' }}>
          🔥
        </div>
        <div className="absolute bottom-40 left-12 text-5xl opacity-20 animate-bounce" style={{ animationDelay: '2s' }}>
          💎
        </div>
        <div className="absolute bottom-20 right-8 text-6xl opacity-15 animate-bounce" style={{ animationDelay: '1.5s' }}>
          🎉
        </div>
        <div className="absolute top-1/2 left-1/3 text-5xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
          ⚡
        </div>
        <div className="absolute top-1/4 right-1/4 text-5xl opacity-15 animate-bounce" style={{ animationDelay: '2.5s' }}>
          💰
        </div>
        <div className="absolute bottom-1/3 right-1/3 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
          🎁
        </div>
        <div className="absolute top-3/4 left-1/4 text-5xl opacity-15 animate-bounce" style={{ animationDelay: '0.7s' }}>
          🌟
        </div>
      </div>

      {/* Glass Morphism Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 backdrop-blur-3xl pointer-events-none" />

      {/* Top Right Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl relative z-10">
        {!showModules ? (
          // Landing Screen
          <div className="space-y-8 text-center">
            {/* Logo/Title */}
            <div className="space-y-4">
              <div className="text-6xl sm:text-7xl md:text-8xl animate-bounce">
                🎁
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                {t('home')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                {t('selectModule')}
              </p>
            </div>

            {/* Glass Card with Stats */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="text-sm uppercase tracking-wider text-cyan-300 font-semibold">
                  💰 {t('todaysWinnings')}
                </div>
                <div className="text-5xl sm:text-6xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
                  {tonWonToday.toLocaleString()}
                </div>
                <div className="text-white/70 text-lg">TON Coins</div>
                <div className="text-xs text-white/50 pt-2">
                  ✨ {t('updatesEveryHour')}
                </div>
              </div>
            </div>

            {/* Main CTA Button */}
            <Button
              size="lg"
              onClick={() => setShowModules(true)}
              className="w-full h-16 sm:h-20 text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/75 transition-all duration-300 transform hover:scale-105 rounded-2xl gap-3"
            >
              {t('selectModule')} 🚀
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </Button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-white/10">
              {[
                { icon: '⚡', label: t('fast') },
                { icon: '🔒', label: t('secure') },
                { icon: '💎', label: t('rewards') },
              ].map((feature, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-3xl">{feature.icon}</div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground">{feature.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Modules Selection Screen
          <div className="space-y-6">
            {/* Back and Title */}
            <div className="space-y-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModules(false)}
                className="gap-2"
              >
                ← {t('back')}
              </Button>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                {t('chooseGameMode')}
              </h2>
              <p className="text-muted-foreground">Choose your game mode</p>
            </div>

            {/* Modules Grid */}
            <div className="space-y-3 sm:space-y-4">
              {modules.map((module) => (
                <a
                  key={module.id}
                  href={module.link}
                  className="block group"
                >
                  <Card className={`bg-gradient-to-r ${module.color} border-0 overflow-hidden hover:shadow-lg hover:shadow-current transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                    <div className="p-6 sm:p-8 flex items-center justify-between">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-5xl sm:text-6xl">{module.icon}</div>
                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-white">
                            {module.title}
                          </h3>
                          <p className="text-sm sm:text-base text-white/80 mt-1">
                            {t('clickToPlay')}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                        →
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>

            {/* Back CTA */}
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setShowModules(false)}
            >
              ← {t('backToHome')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
