import { useState, useEffect } from 'react';
import { bybitWalletService, BybitWalletAccount } from '../services/bybitWalletService';

export const useBybitWallet = () => {
  const [account, setAccount] = useState<BybitWalletAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = bybitWalletService.subscribe((newAccount) => {
      setAccount(newAccount);
    });

    return unsubscribe;
  }, []);

  const connect = async () => {
    setLoading(true);
    setError(null);

    try {
      const connectedAccount = await bybitWalletService.connect();
      setAccount(connectedAccount);
    } catch (error: any) {
      setError(error.message || 'Failed to connect to Bybit Wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    await bybitWalletService.disconnect();
    setAccount(null);
  };

  const sendTransaction = async (to: string, amount: number, token: string = 'ETH') => {
    setLoading(true);
    setError(null);

    try {
      const txHash = await bybitWalletService.sendTransaction(to, amount, token);
      return txHash;
    } catch (error: any) {
      setError(error.message || 'Transaction failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    account,
    loading,
    error,
    connected: bybitWalletService.connected,
    isWalletInstalled: bybitWalletService.isWalletInstalled,
    connect,
    disconnect,
    sendTransaction,
    clearError: () => setError(null)
  };
};