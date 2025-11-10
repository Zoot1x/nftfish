import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface SubscriptionBannerProps {
  onSubscribe?: () => void;
}

const SubscriptionBanner = ({ onSubscribe }: SubscriptionBannerProps) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe();
    }
    // Сохраняем в localStorage, чтобы не показывать баннер снова
    localStorage.setItem("subscriptionBannerClosed", "true");
    setIsVisible(false);
  };

  return (
    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-l-4 border-primary px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <Bell className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm md:text-base font-semibold text-foreground">
            {t("subscriptionBanner")} <span className="text-primary">{t("freeBonusSpins")}</span>
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="neon"
          size="sm"
          className="text-xs md:text-sm px-3 md:px-4"
          onClick={handleSubscribe}
        >
          {t("subscribeButton")}
        </Button>
        <button
          onClick={() => {
            localStorage.setItem("subscriptionBannerClosed", "true");
            setIsVisible(false);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
