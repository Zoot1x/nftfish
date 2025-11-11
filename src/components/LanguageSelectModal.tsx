import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Language } from "@/i18n/translations";
import { useLanguage } from "@/contexts/LanguageContext";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const LanguageSelectModal = () => {
  const { setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (!saved) setOpen(true);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md bg-card border-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-4">
            Выберите язык / Select language
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="outline"
              className="flex items-center gap-2 justify-center text-lg py-4"
              onClick={() => handleSelect(lang.code)}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelectModal;
