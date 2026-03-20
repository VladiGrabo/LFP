export interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  contractAddress?: string;
  usdValue: number;
  price: number;
}

export interface WalletData {
  address: string;
  network: string;
  totalUsdValue: number;
  tokens: TokenBalance[];
}

import { tonBlockchainService, TonWalletData } from './tonBlockchainService';

class BlockchainService {
  private readonly COINGECKO_API = '/coingecko-api';
  private readonly ETHERSCAN_API = 'https://api.etherscan.io/api';
  private readonly BSC_API = 'https://api.bscscan.com/api';
  
  // API Keys - replace with your actual keys
  private readonly ETHERSCAN_API_KEY = 'YourEtherscanAPIKey';
  private readonly BSC_API_KEY = 'YourBSCAPIKey';
  
  // Основные токены и их контракты
  private readonly TOKEN_CONTRACTS = {
    // Ethereum Mainnet
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'USDC': '0xA0b86a33E6441b8C4c7C4b4c7C4c4c4c4c4c4c4c',
    'BNB': '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    
    // BSC Mainnet
    'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    'CAKE': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
  };

  // Получение реального баланса кошелька из блокчейна
  async getWalletBalance(address: string, network: 'ethereum' | 'bsc' | 'ton' = 'ethereum'): Promise<WalletData> {
    try {
      console.log(`🔍 Fetching real blockchain data for ${address} on ${network}`);
      
      // Если это TON адрес, используем TON сервис
      if (network === 'ton' || this.isTonAddress(address)) {
        return await this.getTonWalletData(address);
      }

      const tokens: TokenBalance[] = [];
      let totalUsdValue = 0;

      // 1. Получаем баланс нативной валюты (ETH/BNB)
      const nativeBalance = await this.getNativeBalance(address, network);
      if (nativeBalance.balance > 0) {
        tokens.push(nativeBalance);
        totalUsdValue += nativeBalance.usdValue;
      }

      // 2. Получаем балансы основных токенов
      const tokenBalances = await this.getTokenBalances(address, network);
      tokenBalances.forEach(token => {
        if (token.balance > 0) {
          tokens.push(token);
          totalUsdValue += token.usdValue;
        }
      });

      // 3. Получаем все токены из истории транзакций
      const additionalTokens = await this.getTokensFromTransactions(address, network);
      for (const tokenAddress of additionalTokens) {
        const tokenBalance = await this.getERC20Balance(address, tokenAddress, network);
        if (tokenBalance && tokenBalance.balance > 0) {
          tokens.push(tokenBalance);
          totalUsdValue += tokenBalance.usdValue;
        }
      }

      const walletData: WalletData = {
        address,
        network,
        totalUsdValue,
        tokens: tokens.filter(token => token.balance > 0) // Только токены с балансом > 0
      };

      console.log('✅ Real blockchain data fetched:', walletData);
      return walletData;

    } catch (error) {
      console.error('❌ Error fetching blockchain data:', error);
      throw new Error('Не удалось получить данные из блокчейна');
    }
  }

  // Получение данных TON кошелька
  private async getTonWalletData(address: string): Promise<WalletData> {
    try {
      console.log('🔍 Fetching TON wallet data with ALL tokens...');
      
      const tonData: TonWalletData = await tonBlockchainService.getTonWalletBalance(address);
      
      // Конвертируем TON данные в общий формат
      const tokens: TokenBalance[] = [];
      
      // Добавляем TON баланс
      if (tonData.tonBalance > 0) {
        const tonPrice = await this.getTokenPrice('TON');
        tokens.push({
          symbol: 'TON',
          name: 'Toncoin',
          balance: tonData.tonBalance,
          decimals: 9,
          contractAddress: 'native',
          usdValue: tonData.tonBalance * tonPrice,
          price: tonPrice
        });
      }
      
      // Добавляем все Jetton токены
      tonData.tokens.forEach(tonToken => {
        tokens.push({
          symbol: tonToken.symbol,
          name: tonToken.name,
          balance: tonToken.balance,
          decimals: tonToken.decimals,
          contractAddress: tonToken.contractAddress,
          usdValue: tonToken.usdValue,
          price: tonToken.price
        });
      });

      // Дополнительно ищем ВСЕ токены пользователя
      const allUserTokens = await tonBlockchainService.findAllUserTokens(address);
      allUserTokens.forEach(userToken => {
        // Проверяем, не добавили ли уже этот токен
        const exists = tokens.find(t => t.contractAddress === userToken.contractAddress);
        if (!exists && userToken.balance > 0) {
          tokens.push({
            symbol: userToken.symbol,
            name: userToken.name,
            balance: userToken.balance,
            decimals: userToken.decimals,
            contractAddress: userToken.contractAddress,
            usdValue: userToken.usdValue,
            price: userToken.price
          });
        }
      });

      const walletData: WalletData = {
        address,
        network: 'ton',
        totalUsdValue: tonData.totalUsdValue,
        tokens: tokens.filter(token => token.balance > 0)
      };

      console.log(`✅ TON wallet data with ${tokens.length} tokens:`, walletData);
      return walletData;
      
    } catch (error) {
      console.error('❌ Error fetching TON wallet data:', error);
      throw error;
    }
  }

  // Проверка, является ли адрес TON адресом
  private isTonAddress(address: string): boolean {
    return tonBlockchainService.isValidTonAddress(address);
  }

  // Получение баланса нативной валюты (ETH/BNB)
  private async getNativeBalance(address: string, network: string): Promise<TokenBalance> {
    try {
      const apiUrl = network === 'ethereum' ? this.ETHERSCAN_API : this.BSC_API;
      const apiKey = network === 'ethereum' ? this.ETHERSCAN_API_KEY : this.BSC_API_KEY;
      
      // Включаем API ключ в запрос
      const url = `${apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== '1') {
        // Если API ключ не настроен или неверный, возвращаем нулевой баланс
        console.warn(`API returned error for ${network}: ${data.message || 'Unknown error'}`);
        const symbol = network === 'ethereum' ? 'ETH' : 'BNB';
        return {
          symbol,
          name: network === 'ethereum' ? 'Ethereum' : 'BNB',
          balance: 0,
          decimals: 18,
          usdValue: 0,
          price: 0
        };
      }
      
      const balanceWei = data.result;
      const balance = parseFloat(balanceWei) / Math.pow(10, 18); // Конвертируем из wei
      
      const symbol = network === 'ethereum' ? 'ETH' : 'BNB';
      const price = await this.getTokenPrice(symbol);
      
      return {
        symbol,
        name: network === 'ethereum' ? 'Ethereum' : 'BNB',
        balance,
        decimals: 18,
        usdValue: balance * price,
        price
      };
    } catch (error) {
      console.error(`Error getting ${network} balance:`, error);
      // Возвращаем нулевой баланс при ошибке
      return {
        symbol: network === 'ethereum' ? 'ETH' : 'BNB',
        name: network === 'ethereum' ? 'Ethereum' : 'BNB',
        balance: 0,
        decimals: 18,
        usdValue: 0,
        price: 0
      };
    }
  }

  // Получение балансов основных токенов
  private async getTokenBalances(address: string, network: string): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];
    
    // Список основных токенов для проверки
    const tokensToCheck = network === 'ethereum' 
      ? ['USDT', 'USDC', 'LINK'] 
      : ['BUSD', 'CAKE'];
    
    for (const symbol of tokensToCheck) {
      try {
        const contractAddress = this.TOKEN_CONTRACTS[symbol as keyof typeof this.TOKEN_CONTRACTS];
        if (contractAddress) {
          const tokenBalance = await this.getERC20Balance(address, contractAddress, network);
          if (tokenBalance && tokenBalance.balance > 0) {
            balances.push(tokenBalance);
          }
        }
      } catch (error) {
        console.error(`Error getting ${symbol} balance:`, error);
      }
    }
    
    return balances;
  }

  // Получение баланса ERC-20 токена
  private async getERC20Balance(address: string, contractAddress: string, network: string): Promise<TokenBalance | null> {
    try {
      const apiUrl = network === 'ethereum' ? this.ETHERSCAN_API : this.BSC_API;
      const apiKey = network === 'ethereum' ? this.ETHERSCAN_API_KEY : this.BSC_API_KEY;
      
      // Получаем баланс токена с API ключом
      const balanceResponse = await fetch(
        `${apiUrl}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${apiKey}`
      );
      
      if (!balanceResponse.ok) {
        throw new Error('Balance API error');
      }
      
      const balanceData = await balanceResponse.json();
      
      if (balanceData.status !== '1') {
        return null;
      }
      
      // Получаем информацию о токене
      const tokenInfo = await this.getTokenInfo(contractAddress, network);
      if (!tokenInfo) {
        return null;
      }
      
      const balance = parseFloat(balanceData.result) / Math.pow(10, tokenInfo.decimals);
      
      if (balance === 0) {
        return null;
      }
      
      const price = await this.getTokenPrice(tokenInfo.symbol);
      
      return {
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        balance,
        decimals: tokenInfo.decimals,
        contractAddress,
        usdValue: balance * price,
        price
      };
    } catch (error) {
      console.error('Error getting ERC20 balance:', error);
      return null;
    }
  }

  // Получение информации о токене
  private async getTokenInfo(contractAddress: string, network: string): Promise<{symbol: string, name: string, decimals: number} | null> {
    try {
      // Кэш для известных токенов
      const knownTokens: {[key: string]: {symbol: string, name: string, decimals: number}} = {
        '0xdAC17F958D2ee523a2206206994597C13D831ec7': { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
        '0xA0b86a33E6441b8C4c7C4b4c7C4c4c4c4c4c4c4c': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
        '0xB8c77482e45F1F44dE1745F52C74426C631bDD52': { symbol: 'BNB', name: 'Binance Coin', decimals: 18 },
        '0x514910771AF9Ca656af840dff83E8264EcF986CA': { symbol: 'LINK', name: 'Chainlink', decimals: 18 }
      };
      
      const known = knownTokens[contractAddress.toLowerCase()];
      if (known) {
        return known;
      }
      
      // Для неизвестных токенов используем API
      const apiUrl = network === 'ethereum' ? this.ETHERSCAN_API : this.BSC_API;
      
      // Получаем символ токена
      const symbolResponse = await fetch(
        `${apiUrl}?module=contract&action=getabi&address=${contractAddress}`
      );
      
      // Упрощенная версия - возвращаем базовую информацию
      return {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  // Получение токенов из истории транзакций
  private async getTokensFromTransactions(address: string, network: string): Promise<string[]> {
    try {
      const apiUrl = network === 'ethereum' ? this.ETHERSCAN_API : this.BSC_API;
      const apiKey = network === 'ethereum' ? this.ETHERSCAN_API_KEY : this.BSC_API_KEY;
      
      // Получаем последние токен-трансферы с API ключом
      const response = await fetch(
        `${apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&page=1&offset=100&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      if (data.status !== '1' || !data.result) {
        return [];
      }
      
      // Извлекаем уникальные адреса контрактов
      const contractAddresses = new Set<string>();
      data.result.forEach((tx: any) => {
        if (tx.contractAddress) {
          contractAddresses.add(tx.contractAddress);
        }
      });
      
      return Array.from(contractAddresses);
    } catch (error) {
      console.error('Error getting tokens from transactions:', error);
      return [];
    }
  }

  // Получение цены токена
  private async getTokenPrice(symbol: string): Promise<number> {
    try {
      // Маппинг символов для CoinGecko
      const coinGeckoIds: {[key: string]: string} = {
        'ETH': 'ethereum',
        'BTC': 'bitcoin',
        'BNB': 'binancecoin',
        'USDT': 'tether',
        'USDC': 'usd-coin',
        'LINK': 'chainlink',
        'BUSD': 'binance-usd',
        'CAKE': 'pancakeswap-token',
        'TON': 'the-open-network'
      };
      
      const coinId = coinGeckoIds[symbol.toUpperCase()];
      if (!coinId) {
        return 0;
      }
      
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error('Price API error');
      }
      
      const data = await response.json();
      return data[coinId]?.usd || 0;
    } catch (error) {
      console.error(`Error getting price for ${symbol}:`, error);
      return 0;
    }
  }

  // Проверка валидности адреса
  isValidAddress(address: string): boolean {
    // Проверка Ethereum адреса
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return true;
    }
    
    // Проверка TON адреса
    if (tonBlockchainService.isValidTonAddress(address)) {
      return true;
    }
    
    return false;
  }

  // Получение информации о сети
  async getNetworkInfo(address: string): Promise<{network: string, chainId: number} | null> {
    try {
      // Проверяем, является ли это TON адресом
      if (tonBlockchainService.isValidTonAddress(address)) {
        return await tonBlockchainService.getTonNetworkInfo();
      }
      
      // Определяем сеть по активности адреса для Ethereum/BSC
      const ethResponse = await fetch(
        `${this.ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999&page=1&offset=1&sort=desc&apikey=${this.ETHERSCAN_API_KEY}`
      );
      
      if (ethResponse.ok) {
        const ethData = await ethResponse.json();
        if (ethData.status === '1' && ethData.result.length > 0) {
          return { network: 'ethereum', chainId: 1 };
        }
      }
      
      const bscResponse = await fetch(
        `${this.BSC_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999&page=1&offset=1&sort=desc&apikey=${this.BSC_API_KEY}`
      );
      
      if (bscResponse.ok) {
        const bscData = await bscResponse.json();
        if (bscData.status === '1' && bscData.result.length > 0) {
          return { network: 'bsc', chainId: 56 };
        }
      }
      
      // По умолчанию Ethereum
      return { network: 'ethereum', chainId: 1 };
    } catch (error) {
      console.error('Error detecting network:', error);
      return { network: 'ethereum', chainId: 1 };
    }
  }

  // Получение истории транзакций
  async getTransactionHistory(address: string, network: string = 'ethereum'): Promise<any[]> {
    try {
      // Если это TON адрес, используем TON сервис
      if (network === 'ton' || tonBlockchainService.isValidTonAddress(address)) {
        return await tonBlockchainService.getTonTransactionHistory(address);
      }
      
      const apiUrl = network === 'ethereum' ? this.ETHERSCAN_API : this.BSC_API;
      const apiKey = network === 'ethereum' ? this.ETHERSCAN_API_KEY : this.BSC_API_KEY;
      
      const response = await fetch(
        `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=999999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.status === '1' ? data.result : [];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}

export const blockchainService = new BlockchainService();