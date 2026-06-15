import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { defineChain } from 'viem';

// 定义 Arc 测试网
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },
  testnet: true,
});

// Wagmi 配置
// Project ID 可选：浏览器插件钱包（OKX、MetaMask）不需要
// 如需 WalletConnect 扫码功能，从 https://cloud.walletconnect.com 获取
export const config = getDefaultConfig({
  appName: 'Arc Surf',
  projectId: 'd475b5a7b2b5a5b5a5b5a5b5a5b5a5b5', // 临时 ID，插件钱包不受影响
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
});
