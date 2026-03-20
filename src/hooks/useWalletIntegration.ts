import { useState, useEffect } from 'react';
import { walletIntegrationService, ConnectedWallet, WalletBalance } from '../services/walletIntegrationService';

export const useWalletIntegration = () => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [totalBalance, setTotalBalance] = useState<WalletBalance>({
    total: 0,
    available: 0,
    locked: 0,
    currency: 'USD',
    breakdown: {}
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Подписываемся на изменения кошельков
    const unsubscribe = walletIntegrationService.subscribe((wallets) => {
      setConnectedWallets(wallets);
      setTotalBalance(walletIntegrationService.getTotalBalance());
    });

    // Получаем начальные данные
    setConnectedWallets(walletIntegrationService.getConnectedWallets());
    setTotalBalance(walletIntegrationService.getTotalBalance());

    return unsubscribe;
  }, []);

  const connectBybitWallet = async (walletData: any) => {
    setLoading(true);
    try {
      const wallet = await walletIntegrationService.connectBybitWallet(walletData);
      return wallet;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async (walletId: string) => {
    setLoading(true);
    try {
      await walletIntegrationService.disconnectWallet(walletId);
    } finally {
      setLoading(false);
    }
  };

  const updateWalletBalance = async (walletId: string, newBalanceData: any) => {
    await walletIntegrationService.updateWalletBalance(walletId, newBalanceData);
  };

  return {
    connectedWallets,
    totalBalance,
    loading,
    hasConnectedWallets: walletIntegrationService.hasConnectedWallets(),
    walletStats: walletIntegrationService.getWalletStats(),
    connectBybitWallet,
    disconnectWallet,
    updateWalletBalance,
    getTokenBalance: (token: string) => walletIntegrationService.getTokenBalance(token),
    clearAllWallets: () => walletIntegrationService.clearAllWallets()
  };
};