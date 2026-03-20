export interface TonTokenBalance {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  contractAddress: string;
  usdValue: number;
  price: number;
  jettonMaster?: string;
}

export interface TonWalletData {
  address: string;
  network: 'mainnet' | 'testnet';
  totalUsdValue: number;
  tonBalance: number;
  tokens: TonTokenBalance[];
}

class TonBlockchainService {
  private readonly TON_API = 'https://toncenter.com/api/v2';
  private readonly TON_API_V3 = 'https://toncenter.com/api/v3';
  private readonly TONAPI = 'https://tonapi.io/v2';
  private readonly COINGECKO_API = '/coingecko-api';
  
  // Rate limiting properties
  private lastApiCall = 0;
  private readonly API_DELAY = 1000; // 1 second between API calls
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds between retries
  
  // Известные TON токены (включая ваш токен)
  private readonly KNOWN_TON_TOKENS = {
    'USDT': {
      address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
      name: 'Tether USD',
      decimals: 6,
      symbol: 'USDT'
    },
    'USDC': {
      address: 'EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728',
      name: 'USD Coin',
      decimals: 6,
      symbol: 'USDC'
    },
    'jUSDT': {
      address: 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA',
      name: 'Jetton USDT',
      decimals: 6,
      symbol: 'jUSDT'
    },
    'jUSDC': {
      address: 'EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728',
      name: 'Jetton USDC',
      decimals: 6,
      symbol: 'jUSDC'
    },
    'SCALE': {
      address: 'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE',
      name: 'SCALE',
      decimals: 9,
      symbol: 'SCALE'
    },
    'STON': {
      address: 'EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO',
      name: 'STON.fi Token',
      decimals: 9,
      symbol: 'STON'
    },
    // Добавляем ваш токен
    'ETH_TON': {
      address: 'EQBZPq_GeHgp1lIAWZWMvb5SQl4LpQiJ_Mvj0BpweNNr_ETH',
      name: 'ETH TON Token',
      decimals: 9,
      symbol: 'ETH_TON'
    }
  };

  // Rate-limited fetch with retry mechanism
  private async rateLimitedFetch(url: string, options?: RequestInit, retries = 0): Promise<Response> {
    // Ensure minimum delay between API calls
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    if (timeSinceLastCall < this.API_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.API_DELAY - timeSinceLastCall));
    }
    this.lastApiCall = Date.now();

    try {
      const response = await fetch(url, options);
      
      // Handle rate limiting
      if (response.status === 429) {
        if (retries < this.MAX_RETRIES) {
          console.warn(`Rate limited (429), retrying in ${this.RETRY_DELAY}ms... (attempt ${retries + 1}/${this.MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retries + 1)));
          return this.rateLimitedFetch(url, options, retries + 1);
        } else {
          throw new Error(`Rate limit exceeded after ${this.MAX_RETRIES} retries`);
        }
      }
      
      // Handle other HTTP errors
      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (retries < this.MAX_RETRIES && (error instanceof TypeError || error.message.includes('fetch'))) {
        console.warn(`Network error, retrying in ${this.RETRY_DELAY}ms... (attempt ${retries + 1}/${this.MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retries + 1)));
        return this.rateLimitedFetch(url, options, retries + 1);
      }
      throw error;
    }
  }

  // Получение полного баланса TON кошелька
  async getTonWalletBalance(address: string): Promise<TonWalletData> {
    try {
      console.log(`🔍 Fetching TON blockchain data for ${address}`);
      
      const tokens: TonTokenBalance[] = [];
      let totalUsdValue = 0;

      // 1. Получаем баланс TON
      const tonBalance = await this.getTonBalance(address);
      const tonPrice = await this.getTokenPrice('TON');
      const tonUsdValue = tonBalance * tonPrice;
      totalUsdValue += tonUsdValue;

      // 2. Получаем все Jetton токены из транзакций
      const jettonBalances = await this.getAllJettonBalances(address);
      
      for (const jetton of jettonBalances) {
        if (jetton.balance > 0) {
          tokens.push(jetton);
          totalUsdValue += jetton.usdValue;
        }
      }

      // 3. Проверяем известные токены (включая ваш токен)
      const knownTokenBalances = await this.getKnownTokenBalances(address);
      for (const token of knownTokenBalances) {
        if (token.balance > 0) {
          // Проверяем, не добавили ли уже этот токен
          const exists = tokens.find(t => t.contractAddress === token.contractAddress);
          if (!exists) {
            tokens.push(token);
            totalUsdValue += token.usdValue;
          }
        }
      }

      // 4. Специально проверяем ваш токен
      try {
        const customTokenAddress = 'EQBZPq_GeHgp1lIAWZWMvb5SQl4LpQiJ_Mvj0BpweNNr_ETH';
        const customTokenBalance = await this.getJettonBalance(address, customTokenAddress);
        if (customTokenBalance && customTokenBalance.balance > 0) {
          // Проверяем, не добавили ли уже этот токен
          const exists = tokens.find(t => t.contractAddress === customTokenBalance.contractAddress);
          if (!exists) {
            tokens.push(customTokenBalance);
            totalUsdValue += customTokenBalance.usdValue;
          }
        }
      } catch (customTokenError) {
        console.error('Error checking custom token:', customTokenError);
      }

      const walletData: TonWalletData = {
        address,
        network: 'mainnet',
        totalUsdValue,
        tonBalance,
        tokens: tokens.filter(token => token.balance > 0)
      };

      console.log('✅ TON blockchain data fetched:', walletData);
      return walletData;

    } catch (error) {
      console.error('❌ Error fetching TON blockchain data:', error);
      throw new Error('Не удалось получить данные из TON блокчейна');
    }
  }

  // Получение баланса TON с улучшенной обработкой ошибок
  private async getTonBalance(address: string): Promise<number> {
    try {
      // Сначала пытаемся получить баланс через TON API
      const response = await this.rateLimitedFetch(
        `${this.TONAPI}/accounts/${address}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const balanceNano = data.balance || 0;
        
        // Конвертируем из nanoTON в TON
        return balanceNano / 1000000000;
      }
      
      // Если первый API не работает, пробуем фоллбэк
      console.log('TON API failed, trying fallback...');
      
    } catch (error) {
      console.log('TON API error, trying fallback:', error.message);
    }
    
    // Фоллбэк на TonCenter API
    try {
      const response = await this.rateLimitedFetch(
        `${this.TON_API}/getAddressInformation?address=${address}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.result) {
          const balanceNano = data.result.balance || 0;
          return parseInt(balanceNano) / 1000000000;
        }
      }
    } catch (fallbackError) {
      console.log('Fallback TON balance API also failed:', fallbackError.message);
    }
    
    // Если оба API не работают, возвращаем 0 без критической ошибки
    console.log('Both TON APIs failed, returning 0 balance');
    return 0;
  }

  // Получение всех Jetton токенов из транзакций
  private async getAllJettonBalances(address: string): Promise<TonTokenBalance[]> {
    try {
      console.log('🔍 Scanning all Jetton tokens from transactions...');
      
      // Получаем все Jetton балансы через TON API
      const response = await this.rateLimitedFetch(
        `${this.TONAPI}/accounts/${address}/jettons`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No jettons found for this address');
          return [];
        }
        // For HTTP 400 and other errors, use fallback instead of throwing
        console.warn(`Jettons API error (${response.status}), using fallback method`);
        return await this.scanJettonsFromTransactions(address);
      }
      
      const data = await response.json();
      const jettons = data.balances || [];
      
      const tokenBalances: TonTokenBalance[] = [];
      
      for (const jetton of jettons) {
        try {
          const balance = parseFloat(jetton.balance) / Math.pow(10, jetton.jetton.decimals);
          
          if (balance > 0) {
            const price = await this.getTokenPrice(jetton.jetton.symbol);
            
            tokenBalances.push({
              symbol: jetton.jetton.symbol || 'UNKNOWN',
              name: jetton.jetton.name || 'Unknown Token',
              balance,
              decimals: jetton.jetton.decimals || 9,
              contractAddress: jetton.jetton.address,
              jettonMaster: jetton.jetton.address,
              usdValue: balance * price,
              price
            });
          }
        } catch (tokenError) {
          console.error('Error processing jetton:', tokenError);
        }
      }
      
      console.log(`✅ Found ${tokenBalances.length} Jetton tokens with balance > 0`);
      return tokenBalances;
      
    } catch (error) {
      console.error('Error getting Jetton balances:', error);
      
      // Фоллбэк: сканируем транзакции вручную
      return await this.scanJettonsFromTransactions(address);
    }
  }

  // Фоллбэк: сканирование Jetton токенов из транзакций
  private async scanJettonsFromTransactions(address: string): Promise<TonTokenBalance[]> {
    try {
      console.log('🔍 Fallback: scanning Jettons from transaction history...');
      
      const response = await this.rateLimitedFetch(
        `${this.TONAPI}/accounts/${address}/events?limit=100`
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      const events = data.events || [];
      
      const jettonAddresses = new Set<string>();
      
      // Извлекаем адреса Jetton контрактов из транзакций
      events.forEach((event: any) => {
        if (event.actions) {
          event.actions.forEach((action: any) => {
            if (action.type === 'JettonTransfer' && action.JettonTransfer) {
              const jettonAddress = action.JettonTransfer.jetton?.address;
              if (jettonAddress) {
                jettonAddresses.add(jettonAddress);
              }
            }
          });
        }
      });
      
      // Добавляем ваш токен в список для проверки
      jettonAddresses.add('EQBZPq_GeHgp1lIAWZWMvb5SQl4LpQiJ_Mvj0BpweNNr_ETH');
      
      const tokenBalances: TonTokenBalance[] = [];
      
      // Проверяем баланс каждого найденного Jetton
      for (const jettonAddress of jettonAddresses) {
        try {
          const balance = await this.getJettonBalance(address, jettonAddress);
          if (balance && balance.balance > 0) {
            tokenBalances.push(balance);
          }
        } catch (error) {
          console.error(`Error getting balance for jetton ${jettonAddress}:`, error);
        }
      }
      
      console.log(`✅ Fallback found ${tokenBalances.length} Jetton tokens`);
      return tokenBalances;
      
    } catch (error) {
      console.error('Error scanning Jettons from transactions:', error);
      return [];
    }
  }

  // Получение баланса конкретного Jetton токена
  private async getJettonBalance(walletAddress: string, jettonMaster: string): Promise<TonTokenBalance | null> {
    try {
      // Получаем информацию о Jetton
      const jettonInfo = await this.getJettonInfo(jettonMaster);
      if (!jettonInfo) {
        return null;
      }
      
      // Получаем баланс через TON API
      const response = await this.rateLimitedFetch(
        `${this.TONAPI}/accounts/${walletAddress}/jettons/${jettonMaster}`
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const balanceRaw = data.balance || '0';
      const balance = parseFloat(balanceRaw) / Math.pow(10, jettonInfo.decimals);
      
      if (balance === 0) {
        return null;
      }
      
      const price = await this.getTokenPrice(jettonInfo.symbol);
      
      return {
        symbol: jettonInfo.symbol,
        name: jettonInfo.name,
        balance,
        decimals: jettonInfo.decimals,
        contractAddress: jettonMaster,
        jettonMaster,
        usdValue: balance * price,
        price
      };
      
    } catch (error) {
      console.error('Error getting Jetton balance:', error);
      return null;
    }
  }

  // Получение информации о Jetton токене
  private async getJettonInfo(jettonMaster: string): Promise<{symbol: string, name: string, decimals: number} | null> {
    try {
      // Проверяем в кэше известных токенов
      const knownToken = Object.values(this.KNOWN_TON_TOKENS).find(
        token => token.address === jettonMaster
      );
      
      if (knownToken) {
        return {
          symbol: knownToken.symbol,
          name: knownToken.name,
          decimals: knownToken.decimals
        };
      }
      
      // Получаем информацию через TON API
      const response = await this.rateLimitedFetch(
        `${this.TONAPI}/jettons/${jettonMaster}`
      );
      
      if (!response.ok) {
        throw new Error('Jetton info API error');
      }
      
      const data = await response.json();
      
      return {
        symbol: data.metadata?.symbol || 'UNKNOWN',
        name: data.metadata?.name || 'Unknown Token',
        decimals: data.metadata?.decimals || 9
      };
      
    } catch (error) {
      console.error('Error getting Jetton info:', error);
      
      // Если это ваш токен, возвращаем информацию о нем
      if (jettonMaster === 'EQBZPq_GeHgp1lIAWZWMvb5SQl4LpQiJ_Mvj0BpweNNr_ETH') {
        return {
          symbol: 'ETH_TON',
          name: 'ETH TON Token',
          decimals: 9
        };
      }
      
      return {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 9
      };
    }
  }

  // Получение балансов известных токенов
  private async getKnownTokenBalances(address: string): Promise<TonTokenBalance[]> {
    const balances: TonTokenBalance[] = [];
    
    for (const [symbol, tokenInfo] of Object.entries(this.KNOWN_TON_TOKENS)) {
      try {
        const balance = await this.getJettonBalance(address, tokenInfo.address);
        if (balance && balance.balance > 0) {
          balances.push(balance);
        }
      } catch (error) {
        console.error(`Error getting ${symbol} balance:`, error);
      }
    }
    
    return balances;
  }

  // Получение цены токена
  private async getTokenPrice(symbol: string): Promise<number> {
    try {
      // Маппинг символов для CoinGecko
      const coinGeckoIds: {[key: string]: string} = {
        'TON': 'the-open-network',
        'USDT': 'tether',
        'USDC': 'usd-coin',
        'jUSDT': 'tether',
        'jUSDC': 'usd-coin',
        'SCALE': 'scale-token',
        'STON': 'ston-fi',
        'ETH_TON': 'ethereum' // Предполагаем, что это токен, связанный с Ethereum
      };
      
      const coinId = coinGeckoIds[symbol.toUpperCase()];
      if (!coinId) {
        return 0;
      }
      
      const response = await this.rateLimitedFetch(
        `${this.COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error('Price API error');
      }
      
      const data = await response.json();
      return data[coinId]?.usd || 0;
    } catch (error) {
      console.error(`Error getting price for ${symbol}:`, error);
      
      // Для вашего токена, если не удалось получить цену, устанавливаем примерную цену
      if (symbol === 'ETH_TON') {
        return 2000; // Примерная цена ETH
      }
      
      return 0;
    }
  }

  // Проверка валидности TON адреса
  isValidTonAddress(address: string): boolean {
    // TON адреса могут быть в разных форматах
    // Raw format: 0:hex (64 hex chars)
    // User-friendly format: EQ... или UQ...
    
    if (/^0:[a-fA-F0-9]{64}$/.test(address)) {
      return true; // Raw format
    }
    
    if (/^[EU]Q[A-Za-z0-9_-]{46}$/.test(address)) {
      return true; // User-friendly format
    }
    
    return false;
  }

  // Получение истории транзакций TON
  async getTonTransactionHistory(address: string): Promise<any[]> {
    try {
      const response = await this.rateLimitedFetch(
        `${this.TONAPI}/accounts/${address}/events?limit=50`
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error getting TON transaction history:', error);
      return [];
    }
  }

  // Конвертация адреса между форматами
  convertTonAddress(address: string, toUserFriendly: boolean = true): string {
    // Упрощенная конвертация для демонстрации
    // В реальном приложении нужно использовать TON SDK
    
    if (toUserFriendly && address.startsWith('0:')) {
      // Конвертируем raw в user-friendly (упрощенно)
      return 'EQ' + address.substring(2, 48) + '...';
    }
    
    return address;
  }

  // Получение информации о сети TON
  async getTonNetworkInfo(): Promise<{network: string, chainId: number}> {
    return {
      network: 'ton-mainnet',
      chainId: -239 // TON mainnet chain ID
    };
  }

  // Поиск всех токенов по контрактам, которые пользователь добавлял
  async findAllUserTokens(address: string): Promise<TonTokenBalance[]> {
    try {
      console.log('🔍 Searching for ALL user tokens in TON network...');
      
      // 1. Получаем все Jetton токены
      const jettonTokens = await this.getAllJettonBalances(address);
      
      // 2. Сканируем историю транзакций для поиска дополнительных токенов
      const transactionTokens = await this.scanAllTokensFromHistory(address);
      
      // 3. Объединяем и дедуплицируем
      const allTokens = new Map<string, TonTokenBalance>();
      
      [...jettonTokens, ...transactionTokens].forEach(token => {
        if (token.balance > 0) {
          allTokens.set(token.contractAddress, token);
        }
      });
      
      // 4. Проверяем ваш токен отдельно
      try {
        const customTokenAddress = 'EQBZPq_GeHgp1lIAWZWMvb5SQl4LpQiJ_Mvj0BpweNNr_ETH';
        const customTokenBalance = await this.getJettonBalance(address, customTokenAddress);
        if (customTokenBalance && customTokenBalance.balance > 0) {
          allTokens.set(customTokenAddress, customTokenBalance);
        }
      } catch (customTokenError) {
        console.error('Error checking custom token:', customTokenError);
      }
      
      const result = Array.from(allTokens.values());
      console.log(`✅ Found ${result.length} unique tokens with balance > 0`);
      
      return result;
    } catch (error) {
      console.error('Error finding all user tokens:', error);
      return [];
    }
  }

  // Глубокое сканирование всех токенов из истории
  private async scanAllTokensFromHistory(address: string): Promise<TonTokenBalance[]> {
    try {
      console.log('🔍 Deep scanning transaction history for all tokens...');
      
      const allTokens: TonTokenBalance[] = [];
      let offset = 0;
      const limit = 50; // Reduced limit to be more conservative
      let hasMore = true;
      
      // Сканируем историю транзакций порциями
      while (hasMore && offset < 500) { // Reduced from 1000 to 500 to be more conservative
        const response = await this.rateLimitedFetch(
          `${this.TONAPI}/accounts/${address}/events?limit=${limit}&offset=${offset}`
        );
        
        if (!response.ok) {
          break;
        }
        
        const data = await response.json();
        const events = data.events || [];
        
        if (events.length === 0) {
          hasMore = false;
          break;
        }
        
        // Извлекаем все уникальные Jetton адреса
        const jettonAddresses = new Set<string>();
        
        events.forEach((event: any) => {
          if (event.actions) {
            event.actions.forEach((action: any) => {
              // Jetton Transfer
              if (action.type === 'JettonTransfer' && action.JettonTransfer?.jetton?.address) {
                jettonAddresses.add(action.JettonTransfer.jetton.address);
              }
              
              // Jetton Burn
              if (action.type === 'JettonBurn' && action.JettonBurn?.jetton?.address) {
                jettonAddresses.add(action.JettonBurn.jetton.address);
              }
              
              // Jetton Mint
              if (action.type === 'JettonMint' && action.JettonMint?.jetton?.address) {
                jettonAddresses.add(action.JettonMint.jetton.address);
              }
            });
          }
        });
        
        // Добавляем ваш токен в список для проверки
        jettonAddresses.add('EQBZPq_GeHgp1lIAWZWMvb5SQl4LpQiJ_Mvj0BpweNNr_ETH');
        
        // Проверяем баланс каждого найденного токена
        for (const jettonAddress of jettonAddresses) {
          try {
            const balance = await this.getJettonBalance(address, jettonAddress);
            if (balance && balance.balance > 0) {
              allTokens.push(balance);
            }
          } catch (error) {
            console.error(`Error checking balance for ${jettonAddress}:`, error);
          }
        }
        
        offset += limit;
        
        // Увеличенная пауза между запросами для предотвращения rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`✅ Deep scan found ${allTokens.length} additional tokens`);
      return allTokens;
      
    } catch (error) {
      console.error('Error in deep token scan:', error);
      return [];
    }
  }
}

export const tonBlockchainService = new TonBlockchainService();