import { useState, useCallback, useEffect } from 'react';

// Arc 测试网配置
const ARC_TESTNET_CHAIN_ID = '0x4CF4B2'; // 5042002

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
  });

  // 获取钱包提供者
  const getProvider = useCallback(() => {
    if (window.okxwallet) {
      return window.okxwallet;
    }
    if (window.ethereum) {
      return window.ethereum;
    }
    return null;
  }, []);

  // 获取余额
  const getBalance = useCallback(async (address: string) => {
    const provider = getProvider();
    if (!provider) return null;

    try {
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      // USDC 有 6 位小数，但原生代币用 18 位
      const balanceInEther = parseInt(balance, 16) / 1e18;
      return balanceInEther.toFixed(4);
    } catch (error) {
      console.error('获取余额失败:', error);
      return null;
    }
  }, [getProvider]);

  // 切换到 Arc 测试网
  const switchToArc = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;

    try {
      // 切换网络
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET_CHAIN_ID }],
      });
      return true;
    } catch (error: any) {
      // 用户拒绝切换或其他错误
      console.error('切换网络失败:', error);
      throw new Error('Please switch to Arc Testnet in your wallet');
    }
  }, [getProvider]);

  // 检查当前网络是否是 Arc 测试网
  const isOnArcNetwork = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return false;

    try {
      const chainId = await provider.request({ method: 'eth_chainId' });
      return chainId === ARC_TESTNET_CHAIN_ID;
    } catch {
      return false;
    }
  }, [getProvider]);

  // 连接钱包
  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setState(prev => ({
        ...prev,
        error: '请安装 OKX 钱包或其他以太坊钱包',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // 先请求连接钱包
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        // 连接成功后，切换到 Arc 测试网
        await switchToArc();

        const address = accounts[0];
        const balance = await getBalance(address);

        setState({
          address,
          balance,
          isConnecting: false,
          error: null,
        });
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || '连接失败',
      }));
    }
  }, [getProvider, switchToArc, getBalance]);

  // 断开连接
  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  // 监听账户变化
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.address) {
        const balance = await getBalance(accounts[0]);
        setState(prev => ({
          ...prev,
          address: accounts[0],
          balance,
        }));
      }
    };

    const handleChainChanged = () => {
      // 链变化时刷新页面
      window.location.reload();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [getProvider, disconnect, getBalance, state.address]);

  // 格式化地址显示
  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    formatAddress,
    switchToArc,
    isOnArcNetwork,
    isConnected: !!state.address,
  };
}
