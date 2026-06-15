import { useState, useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContract, useCheckInStatus } from '../hooks/useContract';
import { useI18n } from '../lib/i18n';
import { arcTestnet } from '../lib/wagmi';
import { toast } from 'sonner';

interface HomePageProps {
  navigate: (path: string) => void;
}

export default function HomePage({ navigate }: HomePageProps) {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const contract = useContract();
  const { t } = useI18n();
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // 使用 wagmi hook 查询签到状态
  const checkInStatus = useCheckInStatus(address);

  // 确保在 Arc 测试网
  const ensureArcNetwork = async () => {
    if (chain?.id !== arcTestnet.id) {
      switchChain({ chainId: arcTestnet.id });
    }
  };

  // 部署合约
  const handleDeploy = async () => {
    if (!isConnected) return;

    await ensureArcNetwork();

    try {
      const txHash = await contract.deployGreetingContract();
      setLastTxHash(txHash);
      toast.success('Contract deployment transaction sent!');
    } catch (error: any) {
      toast.error(error.message || 'Deployment failed');
    }
  };

  // 签到
  const handleCheckIn = async () => {
    if (!isConnected) return;

    await ensureArcNetwork();

    try {
      const txHash = await contract.checkIn();
      setLastTxHash(txHash);
      toast.success('Check-in successful! gm arc ✓');
      // 刷新签到状态
      checkInStatus.refetch();
    } catch (error: any) {
      toast.error(error.message || 'Check-in failed');
    }
  };

  // 格式化交易哈希
  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Not signed';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-24 relative">
      {/* Logo 和标题区域 */}
      <div className="text-center mb-16 relative">
        <img
          src="/logo.jpg"
          alt="BlueSky Surf Logo"
          className="w-20 h-20 rounded-full mx-auto mb-4 border border-white/10"
        />
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
          {t.welcome}
        </h1>
        <p className="text-base text-zinc-400 mb-4">
          {t.subtitle}
        </p>
        <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg mt-0.5">🚨</span>
            <div className="text-left">
              <p className="text-red-400 font-semibold text-sm mb-1">
                {t.safetyTipTitle}
              </p>
              <p className="text-red-400/70 text-xs leading-relaxed">
                {t.safetyTipDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 钱包连接按钮 */}
      <div className="mb-16">
        <ConnectButton />
      </div>

      {/* 功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl w-full px-4">
        {/* 部署合约卡片 */}
        <div className="group relative p-6 bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-300"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 0 0 0 transparent' }}>
          <div className="text-3xl mb-4">🚀</div>
          <h2 className="text-lg font-semibold mb-2 text-white/90">{t.deployTitle}</h2>
          <p className="text-zinc-400 text-sm mb-6">
            {t.deployDesc}
          </p>
          <button
            onClick={handleDeploy}
            disabled={contract.isDeploying}
            className="w-full py-2.5 bg-white/[0.08] border border-white/[0.12] text-white/80 rounded-xl font-medium hover:bg-white/[0.12] hover:text-white hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {contract.isDeploying ? t.deploying : t.deployButton}
          </button>
        </div>

        {/* 每日签到卡片 */}
        <div className="group relative p-6 bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] rounded-2xl hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-300"
             style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 0 0 0 transparent' }}>
          <div className="text-3xl mb-4">✍️</div>
          <h2 className="text-lg font-semibold mb-2 text-white/90">{t.signTitle}</h2>
          <p className="text-zinc-400 text-sm mb-3">
            {t.signDesc}
          </p>

          {/* 签到状态 */}
          {isConnected && (
            <div className="mb-4 p-3 bg-white/[0.04] rounded-xl text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">{t.status}:</span>
                <span className={checkInStatus.hasSigned ? 'text-emerald-400' : 'text-yellow-400'}>
                  {checkInStatus.hasSigned ? t.signed : t.notSigned}
                </span>
              </div>
              {checkInStatus.hasSigned && checkInStatus.signedAt > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.signedAt}:</span>
                  <span className="text-zinc-300">{formatTimestamp(checkInStatus.signedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">{t.total}:</span>
                <span className="text-zinc-300">{checkInStatus.totalSignatures}</span>
              </div>
              {checkInStatus.hasSigned && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-yellow-400/80 text-xs">⏰ {t.signCooldown}</p>
                </div>
              )}
            </div>
          )}

          {/* 合约地址 Tag */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 rounded-full text-xs text-blue-400 font-mono">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              0x3e72...06825
            </span>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={contract.isCheckingIn || checkInStatus.hasSigned}
            className="w-full py-2.5 bg-white/[0.08] border border-white/[0.12] text-white/80 rounded-xl font-medium hover:bg-white/[0.12] hover:text-white hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {contract.isCheckingIn ? t.signing : checkInStatus.hasSigned ? t.signed : t.signButton}
          </button>
        </div>
      </div>

      {/* 交易状态 */}
      {lastTxHash && (
        <div className="mt-8 text-center">
          <p className="text-xs text-white/30 mb-2">{t.recentTx}</p>
          <a
            href={`https://testnet.arcscan.app/tx/${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-mono"
          >
            {formatTxHash(lastTxHash)} ↗
          </a>
        </div>
      )}

      {/* 错误提示 */}
      {contract.error && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl max-w-md">
          {contract.error}
          <button
            onClick={contract.clearError}
            className="ml-2 underline hover:text-red-300 transition-colors"
          >
            {t.close}
          </button>
        </div>
      )}

      {/* 底部 Footer */}
      <div className="mt-auto pt-20 pb-8 text-center">
        <a
          href="https://twitter.com/intent/user?screen_name=blueskylh1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          {t.createdBy} @blueskylh1
        </a>
      </div>
    </div>
  );
}
