import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import RouletteModule from "./pages/modules/Roulette/RouletteModule";
import ShopModule from "./pages/modules/Shop/ShopModule";
import CoinFlipModule from "./pages/modules/CoinFlip/CoinFlipModule";
import NotFound from "./pages/NotFound";
import LanguageSelectModal from "@/components/LanguageSelectModal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageSelectModal />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/roulette" element={<Index />} />
              <Route path="/modules/roulette" element={<RouletteModule />} />
              <Route path="/modules/shop" element={<ShopModule />} />
              <Route path="/modules/coinflip" element={<CoinFlipModule />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
