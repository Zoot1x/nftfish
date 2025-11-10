import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
}

const LoginModal = ({ open, onOpenChange, onLogin }: LoginModalProps) => {
  const { t } = useLanguage();

  const handleLogin = () => {
    // В реальном приложении здесь будет авторизация через Telegram
    window.open("https://t.me/flowers_auth_bot", "_blank");
    onLogin();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 justify-center">
            <LogIn className="h-6 w-6 text-primary" />
            {t('authRequired')}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-4">
            {t('loginToWithdraw')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center">
          <div className="mb-6">
            <div className="inline-block p-4 bg-muted/50 rounded-full mb-4">
              <svg
                className="w-16 h-16 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <p className="text-muted-foreground mb-6">
              {t('loginDesc')}
            </p>
          </div>

          <Button
            variant="neon"
            size="lg"
            onClick={handleLogin}
            className="w-full text-lg font-bold"
          >
            {t('loginButton')}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            {t('safeAuth')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
