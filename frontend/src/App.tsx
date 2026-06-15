import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { I18nProvider } from "./lib/i18n";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from './lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// 页面组件
import HomePage from "./pages/HomePage";

// 简单路由
function Router() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, "", newPath);
    setPath(newPath);
  };

  return <HomePage navigate={navigate} />;
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} locale="en">
          <ThemeProvider attribute="class" defaultTheme="dark">
            <I18nProvider>
              <div className="min-h-screen bg-[#09090B] text-foreground relative overflow-hidden">
                {/* 弥散光晕背景 - 星云效果 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-cyan-500/25 via-blue-600/20 to-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

                {/* 悬浮导航栏 */}
                <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
                    <a href="/" className="text-sm font-semibold tracking-tight text-white/90">
                      Arc Surf
                    </a>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span>Arc Testnet</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <a
                      href="https://testnet.arcscan.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 hover:text-white/80 transition-colors"
                    >
                      Explorer ↗
                    </a>
                    <a
                      href="https://faucet.circle.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 hover:text-white/80 transition-colors"
                    >
                      Faucet ↗
                    </a>
                    <div className="w-px h-4 bg-white/10" />
                    <LanguageSwitch />
                  </div>
                </nav>

                {/* 主内容区 */}
                <main className="container mx-auto px-6 relative z-10">
                  <Router />
                </main>
              </div>
            </I18nProvider>
            <Toaster />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
