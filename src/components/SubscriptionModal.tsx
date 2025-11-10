import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTelegramChannelLink } from "@/config/telegram";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: () => void;
}

const SubscriptionModal = ({ open, onOpenChange, onSubscribe }: SubscriptionModalProps) => {
  const { t, language } = useLanguage();

  const handleSubscribe = () => {
    // Получаем ссылку на канал Telegram для выбранного языка
    const channelLink = getTelegramChannelLink(language);
    window.open(channelLink, "_blank");
    onSubscribe();
    onOpenChange(false); // Закрываем модальное окно
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 justify-center">
            <Gift className="h-6 w-6 text-primary animate-float" />
            {t('getFreeSpins')}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-4">
            {t('subscribeDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center">
          <div className="inline-block bg-gradient-primary p-6 rounded-2xl shadow-glow-cyan mb-4">
            <p className="text-6xl font-bold text-foreground">3</p>
            <p className="text-xl font-semibold text-foreground">{t('freeSpins')}</p>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            {t('subscribeNote')}
          </p>

          <Button
            variant="neon"
            size="lg"
            onClick={handleSubscribe}
            className="w-full text-lg font-bold"
          >
            {t('subscribeButton')}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            {t('redirectNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
