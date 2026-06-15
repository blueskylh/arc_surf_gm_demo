import { useState, useEffect, useCallback, useContext, createContext, ReactNode, createElement } from 'react';

// 支持的语言
export type Locale = 'en' | 'zh';

// 翻译内容类型
export interface Translations {
  // 通用
  appName: string;
  connectWallet: string;
  connecting: string;
  switchToArc: string;

  // 首页
  welcome: string;
  subtitle: string;
  safetyTipTitle: string;
  safetyTipDesc: string;

  // Deploy 卡片
  deployTitle: string;
  deployDesc: string;
  deployButton: string;
  deploying: string;

  // Sign 卡片
  signTitle: string;
  signDesc: string;
  signButton: string;
  signing: string;
  status: string;
  signed: string;
  notSigned: string;
  signedAt: string;
  total: string;
  contract: string;
  signCooldown: string;

  // 交易
  recentTx: string;

  // Footer
  createdBy: string;

  // 错误
  error: string;
  close: string;
  installWallet: string;
  switchNetworkError: string;
}

// 英文翻译
const en: Translations = {
  appName: 'Arc Surf',
  connectWallet: 'Connect Wallet',
  connecting: 'Connecting...',
  switchToArc: 'Switch to Arc Testnet',

  welcome: 'Welcome to Arc Surf',
  subtitle: 'Deploy and interact with smart contracts on Arc Testnet',
  safetyTipTitle: '⚠️ Strongly Recommended: Use a New Wallet for Testing',
  safetyTipDesc: 'This is a testnet DApp. Smart contracts may have unknown bugs. Using your main wallet could result in loss of assets. Please create a new wallet with no real assets for testing.',

  deployTitle: 'Deploy',
  deployDesc: 'Deploy a greeting smart contract that says "Hello Arc, this is Surf!"',
  deployButton: 'Deploy',
  deploying: 'Deploying...',

  signTitle: 'Sign gm arc',
  signDesc: 'Sign "gm arc" on-chain. One address, once per 24 hours.',
  signButton: 'Sign gm arc',
  signing: 'Signing...',
  status: 'Status',
  signed: '✓ Signed',
  notSigned: 'Not signed',
  signedAt: 'Signed at',
  total: 'Total',
  contract: 'Contract',
  signCooldown: 'You can sign again after 24 hours',

  recentTx: 'Recent Transaction',

  createdBy: 'Created by',

  error: 'Error',
  close: 'Close',
  installWallet: 'Please install OKX Wallet or other Ethereum wallet',
  switchNetworkError: 'Failed to switch network',
};

// 中文翻译
const zh: Translations = {
  appName: 'Arc Surf',
  connectWallet: '连接钱包',
  connecting: '连接中...',
  switchToArc: '切换到 Arc 测试网',

  welcome: '欢迎来到 Arc Surf',
  subtitle: '在 Arc 测试网上部署和交互智能合约',
  safetyTipTitle: '⚠️ 强烈建议：使用新钱包进行测试',
  safetyTipDesc: '这是一个测试网 DApp，智能合约可能存在未知漏洞。使用主钱包可能导致资产损失。请创建一个没有真实资产的新钱包进行测试。',

  deployTitle: '部署',
  deployDesc: '部署一个问候智能合约，内容为 "Hello Arc, this is Surf!"',
  deployButton: '部署',
  deploying: '部署中...',

  signTitle: '签署 gm arc',
  signDesc: '在链上签署 "gm arc"。每个地址每 24 小时可签署一次。',
  signButton: '签署 gm arc',
  signing: '签署中...',
  status: '状态',
  signed: '✓ 已签署',
  notSigned: '未签署',
  signedAt: '签署时间',
  total: '总数',
  contract: '合约',
  signCooldown: '24 小时后可再次签署',

  recentTx: '最近交易',

  createdBy: '由',

  error: '错误',
  close: '关闭',
  installWallet: '请安装 OKX 钱包或其他以太坊钱包',
  switchNetworkError: '切换网络失败',
};

// 翻译映射
const translations: Record<Locale, Translations> = {
  en,
  zh,
};

// 语言上下文类型
interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

// 创建上下文
const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: en,
  setLocale: () => {},
});

// 获取浏览器语言
function getBrowserLocale(): Locale {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  return lang.startsWith('zh') ? 'zh' : 'en';
}

// 获取存储的语言
function getStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem('locale');
    if (stored === 'en' || stored === 'zh') {
      return stored;
    }
  } catch {}
  return null;
}

// Provider 组件
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return getStoredLocale() || getBrowserLocale();
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('locale', newLocale);
    } catch {}
  }, []);

  const value: I18nContextType = {
    locale,
    t: translations[locale],
    setLocale,
  };

  return createElement(I18nContext.Provider, { value }, children);
}

// Hook
export function useI18n() {
  return useContext(I18nContext);
}
