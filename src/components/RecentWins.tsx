import { useEffect, useState } from "react";
import { Gift, gifts, getRarityColor } from "@/config/gifts";
import { Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WinEntry {
  username: string;
  gift: Gift;
  timestamp: number;
}

interface RecentWinsProps {
  latestWin?: { gift: Gift };
}

// Более реалистичные Telegram-стиль имена
const FAKE_USERNAMES = [
    "@artyom_k",
    "@nikita.s",
    "@marina_v",
    "@dasha.l",
    "@egor.m",
    "@alina_r",
    "@maksim.p",
    "@kristina.t",
    "@oleg_d",
    "@kira.n",
    "@pavel_a",
    "@sergey.f",
    "@yulia_g",
    "@denis.b",
    "@sofia_e",
    "@anton_z",
    "@ivan.o",
    "@lera_k",
    "@roman.c",
    "@anna_m",

    "@alex.carter",
    "@emily.stone",
    "@josh_miller",
    "@grace_warren",
    "@daniel.reed",
    "@olivia_turner",
    "@ryan.hall",
    "@chloe_adams",
    "@ethan.brooks",
    "@lily_nelson",
    "@jack.palmer",
    "@sarah_lane",
    "@chris.morgan",
    "@megan.foxwell",
    "@adam.reed",
    "@julia_summers",
    "@ben.collins",
    "@kate_harris",
    "@mark.benson",
    "@amy_blake",

    "@mateo_rivera",
    "@ana.castillo",
    "@diego_santos",
    "@lucia_navarro",
    "@carlos.mendez",
    "@sofia_vargas",
    "@pablo_romero",
    "@elena.torres",
    "@javier.rojas",
    "@camila_cruz",

    "@matteo.rossi",
    "@laura_bianchi",
    "@luca.deluca",
    "@sofia_ricci",
    "@marco_romano",
    "@giulia.moretti",
    "@davide_costa",
    "@chiara.fontana",
    "@andrea.gallo",
    "@alessia_vitale",

    "@lucas_moreau",
    "@emma.laurent",
    "@hugo_bernard",
    "@lea_dupont",
    "@nathan.caron",
    "@ines_lambert",
    "@louis_fabre",
    "@chloe.robert",
    "@gabriel_monet",
    "@julie.marchand",

    "@leon_fischer",
    "@mia.becker",
    "@paul.wagner",
    "@lara_schmitt",
    "@noah.keller",
    "@lea_hofmann",
    "@finn.braun",
    "@mila_weber",
    "@jonas_vogel",
    "@emma.schaefer",

    "@joao_silva",
    "@ana.ferreira",
    "@pedro_rocha",
    "@mariana.lima",
    "@rafael_alves",
    "@sofia_martins",
    "@lucas.duarte",
    "@julia_soares",
    "@bruno_pinto",
    "@beatriz.correia",

    "@alex_monroe",
    "@mia.carter",
    "@jason_hale",
    "@ava.brooks",
    "@leo_griffin",
    "@ella_marsh",
    "@tyler.west",
    "@maya.clarke",
    "@adrian_scott",
    "@nora_james"
]

const RecentWins = ({ latestWin }: RecentWinsProps) => {
  const { t } = useLanguage();
  const [wins, setWins] = useState<WinEntry[]>([]);

  // Добавляем реальный выигрыш пользователя
  useEffect(() => {
    if (latestWin) {
      const newWin: WinEntry = {
        username: t("you"),
        gift: latestWin.gift,
        timestamp: Date.now(),
      };
      setWins(prev => [newWin, ...prev].slice(0, 5));
    }
  }, [latestWin, t]);

  // Генерируем фейковые выигрыши каждые 15-30 секунд
  useEffect(() => {
    const generateFakeWin = () => {
      const randomUsername =
        FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)];

      // Случайный подарок с учетом шансов
      const totalChance = gifts.reduce((sum, g) => sum + g.chance, 0);
      let rand = Math.random() * totalChance;
      let randomGift: Gift | undefined;
      for (const gift of gifts) {
        if (rand < gift.chance) {
          randomGift = gift;
          break;
        }
        rand -= gift.chance;
      }
      if (!randomGift) randomGift = gifts[0];

      const fakeWin: WinEntry = {
        username: randomUsername,
        gift: randomGift,
        timestamp: Date.now(),
      };

      setWins(prev => [fakeWin, ...prev].slice(0, 5));
    };

    const interval = setInterval(generateFakeWin, Math.random() * 7000 + 15000); // 15-30 секунд

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card/30 border border-border backdrop-blur-sm rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">{t("recentWins")}</h3>
      </div>

      <div className="space-y-2">
        {wins.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noWinsYet")}
          </p>
        ) : (
          wins.map((win, index) => (
            <div
              key={`${win.timestamp}-${index}`}
              className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg animate-slide-up"
            >
              <img
                src={win.gift.image}
                alt={win.gift.name}
                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs md:text-sm truncate">{win.username}</p>
                <p className={`text-xs ${getRarityColor(win.gift.rarity)}`}>
                  {t("won")} {win.gift.name}
                </p>
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                {Math.floor((Date.now() - win.timestamp) / 1000)}s {t("ago")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentWins;