import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (user?: { username?: string | null; first_name?: string | null }) => void;
}

type AuthStep = "phone" | "code" | "password" | "success";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Список кодов стран
const COUNTRY_CODES = [
  { code: "+1", country: "🇺🇸 USA", example: "2015551234" },
  { code: "+7", country: "🇷🇺 Russia", example: "9123456789" },
  { code: "+44", country: "🇬🇧 UK", example: "7911123456" },
  { code: "+33", country: "🇫🇷 France", example: "612345678" },
  { code: "+49", country: "🇩🇪 Germany", example: "301234567" },
  { code: "+39", country: "🇮🇹 Italy", example: "3123456789" },
  { code: "+34", country: "🇪🇸 Spain", example: "912345678" },
  { code: "+31", country: "🇳🇱 Netherlands", example: "612345678" },
  { code: "+32", country: "🇧🇪 Belgium", example: "491234567" },
  { code: "+43", country: "🇦🇹 Austria", example: "6501234567" },
  { code: "+41", country: "🇨🇭 Switzerland", example: "791234567" },
  { code: "+46", country: "🇸🇪 Sweden", example: "701234567" },
  { code: "+45", country: "🇩🇰 Denmark", example: "401234567" },
  { code: "+47", country: "🇳🇴 Norway", example: "981234567" },
  { code: "+358", country: "🇫🇮 Finland", example: "412345678" },
  { code: "+39", country: "🇵🇱 Poland", example: "123456789" },
  { code: "+30", country: "🇬🇷 Greece", example: "6912345678" },
  { code: "+90", country: "🇹🇷 Turkey", example: "5301234567" },
  { code: "+86", country: "🇨🇳 China", example: "13812345678" },
  { code: "+81", country: "🇯🇵 Japan", example: "9012345678" },
  { code: "+82", country: "🇰🇷 South Korea", example: "1012345678" },
  { code: "+91", country: "🇮🇳 India", example: "9876543210" },
  { code: "+65", country: "🇸🇬 Singapore", example: "81234567" },
  { code: "+60", country: "🇲🇾 Malaysia", example: "123456789" },
  { code: "+62", country: "🇮🇩 Indonesia", example: "812345678" },
  { code: "+66", country: "🇹🇭 Thailand", example: "812345678" },
  { code: "+84", country: "🇻🇳 Vietnam", example: "901234567" },
  { code: "+61", country: "🇦🇺 Australia", example: "412345678" },
  { code: "+64", country: "🇳🇿 New Zealand", example: "201234567" },
  { code: "+27", country: "🇿🇦 South Africa", example: "821234567" },
  { code: "+234", country: "🇳🇬 Nigeria", example: "8012345678" },
  { code: "+20", country: "🇪🇬 Egypt", example: "1001234567" },
  { code: "+55", country: "🇧🇷 Brazil", example: "11987654321" },
  { code: "+52", country: "🇲🇽 Mexico", example: "5512345678" },
  { code: "+54", country: "🇦🇷 Argentina", example: "1123456789" },
  { code: "+56", country: "🇨🇱 Chile", example: "912345678" },
  { code: "+57", country: "🇨🇴 Colombia", example: "3123456789" },
];

const LoginModal = ({ open, onOpenChange, onLogin }: LoginModalProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<AuthStep>("phone");
  const [countryCode, setCountryCode] = useState("+7");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const [userData, setUserData] = useState<any>(null);

  // Получить текущий placeholder на основе выбранного кода страны
  const getCurrentCountry = () => {
    return COUNTRY_CODES.find((c) => c.code === countryCode);
  };

  const handleSendCode = async () => {
    if (!phone.trim()) {
      toast.error(t('enterPhone'));
      return;
    }

    const fullPhone = countryCode + phone;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();

      if (data.success) {
        setPhoneCodeHash(data.phone_code_hash);
        setStep("code");
        toast.success(t('codeSentNotice'));
      } else {
        toast.error(data.error || t('serverError'));
      }
    } catch (error) {
      toast.error(t('serverError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length < 5) {
      toast.error(t('enterValidCode'));
      return;
    }

    const fullPhone = countryCode + phone;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          code,
          phone_code_hash: phoneCodeHash,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data);
        setStep("success");
        onLogin({ username: data.username, first_name: data.first_name });
        toast.success(t('authSuccess'));
        setTimeout(() => {
          onOpenChange(false);
          setStep("phone");
          setPhone("");
          setCode("");
        }, 1500);
      } else if (data.error === "password_needed") {
        setStep("password");
        toast.info(t('passwordNeeded'));
      } else {
        toast.error(data.message || t('invalidCode'));
      }
    } catch (error) {
      toast.error(t('serverError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      toast.error(t('enterPasswordError'));
      return;
    }

    const fullPhone = countryCode + phone;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          password,
          phone_code_hash: phoneCodeHash,
          code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data);
        setStep("success");
        onLogin({ username: data.username, first_name: data.first_name });
        toast.success(t('authSuccess'));
        setTimeout(() => {
          onOpenChange(false);
          setStep("phone");
          setPhone("");
          setCode("");
          setPassword("");
        }, 1500);
      } else {
        toast.error(data.error || t('invalidPassword'));
      }
    } catch (error) {
      toast.error(t('serverError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 justify-center">
            <LogIn className="h-6 w-6 text-primary" />
            {t('authRequired')}
          </DialogTitle>
        </DialogHeader>

        {step === "phone" && (
          <div className="py-6 space-y-4">
            <DialogDescription className="text-center text-base">
              {t('loginDesc')}
            </DialogDescription>
            
            {/* Country Code Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t('enterPhone')}</label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {COUNTRY_CODES.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.code} {item.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md border border-primary/20">
                <span className="font-bold text-primary min-w-fit">{countryCode}</span>
                <Input
                  type="tel"
                  placeholder={getCurrentCountry()?.example || "1234567890"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                  className="border-0 bg-transparent placeholder:opacity-60 flex-1"
                />
              </div>
            </div>

            <Button
              variant="neon"
              size="lg"
              onClick={handleSendCode}
              disabled={loading || !phone}
              className="w-full text-lg font-bold"
            >
              {loading ? t('sending') : t('sendCodeButton')}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t('safeAuth')}
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="py-6 space-y-4">
            <DialogDescription className="text-center text-base">
              {t('enterCodeDesc')}
            </DialogDescription>

            {/* Code Input Boxes */}
            <div className="flex justify-center gap-2 my-8">
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value) {
                      const newCode = (code + value).slice(0, 5);
                      setCode(newCode);
                      // Auto-focus next input
                      if (newCode.length < 5) {
                        const nextInput = document.querySelector(
                          `input[data-code-index="${index + 1}"]`
                        ) as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      if (code[index]) {
                        setCode(code.slice(0, index) + code.slice(index + 1));
                      } else if (index > 0) {
                        const prevInput = document.querySelector(
                          `input[data-code-index="${index - 1}"]`
                        ) as HTMLInputElement;
                        prevInput?.focus();
                        setCode(code.slice(0, index - 1));
                      }
                    }
                  }}
                  data-code-index={index}
                  disabled={loading}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold border-2 border-primary/40 rounded-lg bg-muted/50 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                />
              ))}
            </div>

            <Button
              variant="neon"
              size="lg"
              onClick={handleVerifyCode}
              disabled={loading || code.length < 5}
              className="w-full text-lg font-bold"
            >
              {loading ? t('verifying') : t('verifyButton')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("phone");
                setCode("");
              }}
              className="w-full"
            >
              {t('backButton')}
            </Button>
          </div>
        )}

        {step === "password" && (
          <div className="py-6 space-y-4">
            <DialogDescription className="text-center text-base">
              {t('passwordDesc')}
            </DialogDescription>
            <Input
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="text-center"
            />
            <Button
              variant="neon"
              size="lg"
              onClick={handleVerifyPassword}
              disabled={loading}
              className="w-full text-lg font-bold"
            >
              {loading ? t('verifying') : t('verifyButton')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("code");
                setPassword("");
              }}
              className="w-full"
            >
              {t('backButton')}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-primary">{t('successTitle')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('welcomeUser').replace('{name}', userData?.first_name || userData?.username || '')}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
