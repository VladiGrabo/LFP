export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  price: number;
  leverage?: number;
  orderType: 'spot' | 'margin';
  timestamp: string;
  status: 'open' | 'closed';
  pnl?: number;
  pnlPercent?: number;
  dataSource?: string;
  openPrice: number;
  currentPrice?: number;
  liquidationPrice?: number;
  requiredMargin?: number;
  closePrice?: number;
  closeTimestamp?: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  leverage?: number;
  orderType: 'spot' | 'margin';
  pnl: number;
  pnlPercent: number;
  liquidationPrice?: number;
  timestamp: string;
  status: 'open' | 'closed';
}

class TradeService {
  private trades: Trade[] = [];
  private positions: Position[] = [];
  private subscribers: Set<() => void> = new Set();

  constructor() {
    // Загружаем данные из localStorage при инициализации
    this.loadFromStorage();
    
    // Добавляем демо-сделки для примера
    if (this.trades.length === 0) {
      this.addDemoTrades();
    }

    // Запускаем обновление цен
    this.startPriceUpdates();
  }

  private addDemoTrades() {
    const demoTrades: Trade[] = [
      {
        id: 'DEMO-1',
        symbol: 'BTCUSDT',
        side: 'buy',
        type: 'market',
        amount: 0.5,
        price: 42800,
        orderType: 'spot',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 день назад
        status: 'open',
        openPrice: 42800,
        currentPrice: 43250,
        dataSource: 'Demo'
      },
      {
        id: 'DEMO-2',
        symbol: 'ETHUSDT',
        side: 'buy',
        type: 'limit',
        amount: 2,
        price: 2300,
        leverage: 5,
        orderType: 'margin',
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 часов назад
        status: 'open',
        openPrice: 2300,
        currentPrice: 2345,
        liquidationPrice: 1840,
        requiredMargin: 920,
        dataSource: 'Demo'
      },
      // Добавляем несколько закрытых сделок для демонстрации
      {
        id: 'DEMO-CLOSED-1',
        symbol: 'BTCUSDT',
        side: 'buy',
        type: 'market',
        amount: 0.25,
        price: 41500,
        orderType: 'spot',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 дня назад
        status: 'closed',
        openPrice: 41500,
        currentPrice: 42100,
        closePrice: 42100,
        closeTimestamp: new Date(Date.now() - 86400000).toISOString(), // закрыта 1 день назад
        pnl: 150, // (42100 - 41500) * 0.25
        pnlPercent: 1.45, // (600 / 41500) * 100
        dataSource: 'Demo'
      },
      {
        id: 'DEMO-CLOSED-2',
        symbol: 'ETHUSDT',
        side: 'sell',
        type: 'limit',
        amount: 1.5,
        price: 2400,
        leverage: 3,
        orderType: 'margin',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 дня назад
        status: 'closed',
        openPrice: 2400,
        currentPrice: 2350,
        closePrice: 2350,
        closeTimestamp: new Date(Date.now() - 172800000).toISOString(), // закрыта 2 дня назад
        pnl: 225, // (2400 - 2350) * 1.5 * 3 (leverage)
        pnlPercent: 18.75, // ((2400 - 2350) / 2400) * 100 * 3 (leverage)
        liquidationPrice: 2800,
        requiredMargin: 1200,
        dataSource: 'Demo'
      },
      {
        id: 'DEMO-CLOSED-3',
        symbol: 'BNBUSDT',
        side: 'buy',
        type: 'market',
        amount: 10,
        price: 240,
        orderType: 'spot',
        timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 дня назад
        status: 'closed',
        openPrice: 240,
        currentPrice: 235,
        closePrice: 235,
        closeTimestamp: new Date(Date.now() - 259200000).toISOString(), // закрыта 3 дня назад
        pnl: -50, // (235 - 240) * 10
        pnlPercent: -2.08, // (-50 / 2400) * 100
        dataSource: 'Demo'
      }
    ];

    demoTrades.forEach(trade => {
      this.trades.push(trade);
      if (trade.status === 'open') {
        this.createPositionFromTrade(trade);
      }
    });

    this.saveToStorage();
    this.notifySubscribers();
  }

  private startPriceUpdates() {
    setInterval(() => {
      this.updatePositionPrices();
    }, 2000); // Обновляем каждые 2 секунды
  }

  private updatePositionPrices() {
    let updated = false;

    this.positions.forEach(position => {
      if (position.status === 'open') {
        // Симулируем изменение цены
        const variation = (Math.random() - 0.5) * 0.002; // ±0.1%
        const newPrice = position.currentPrice * (1 + variation);
        
        position.currentPrice = newPrice;
        
        // Пересчитываем P&L
        if (position.side === 'long') {
          position.pnl = (newPrice - position.entryPrice) * position.amount;
        } else {
          position.pnl = (position.entryPrice - newPrice) * position.amount;
        }
        
        // Рассчитываем процент P&L правильно
        const investedAmount = position.entryPrice * position.amount;
        position.pnlPercent = (position.pnl / investedAmount) * 100;
        
        // Применяем плечо для маржинальных позиций
        if (position.leverage && position.leverage > 1) {
          position.pnl *= position.leverage;
          position.pnlPercent *= position.leverage;
        }

        // Обновляем соответствующую сделку
        const trade = this.trades.find(t => `POS-${t.id}` === position.id);
        if (trade) {
          trade.currentPrice = newPrice;
          trade.pnl = position.pnl;
          trade.pnlPercent = position.pnlPercent;
        }

        updated = true;
      }
    });

    if (updated) {
      this.saveToStorage();
      this.notifySubscribers();
    }
  }

  executeTrade(tradeData: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    amount: string;
    price?: string;
    leverage?: string;
    orderType: 'spot' | 'margin';
    currentPrice: number;
    dataSource?: string;
  }): Trade {
    const trade: Trade = {
      id: `TRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol: tradeData.symbol,
      side: tradeData.side,
      type: tradeData.type,
      amount: parseFloat(tradeData.amount),
      price: tradeData.type === 'market' ? tradeData.currentPrice : parseFloat(tradeData.price || '0'),
      leverage: tradeData.leverage ? parseInt(tradeData.leverage) : undefined,
      orderType: tradeData.orderType,
      timestamp: new Date().toISOString(),
      status: 'open',
      openPrice: tradeData.type === 'market' ? tradeData.currentPrice : parseFloat(tradeData.price || '0'),
      currentPrice: tradeData.currentPrice,
      dataSource: tradeData.dataSource
    };

    // Добавляем цену ликвидации для маржинальных сделок
    if (trade.orderType === 'margin' && trade.leverage) {
      if (trade.side === 'buy') {
        trade.liquidationPrice = trade.openPrice * (1 - 0.8 / trade.leverage);
      } else {
        trade.liquidationPrice = trade.openPrice * (1 + 0.8 / trade.leverage);
      }
      trade.requiredMargin = (trade.price * trade.amount) / trade.leverage;
    }

    this.trades.push(trade);
    this.createPositionFromTrade(trade);
    this.saveToStorage();
    this.notifySubscribers();

    console.log('Trade executed:', trade);
    return trade;
  }

  private createPositionFromTrade(trade: Trade) {
    const position: Position = {
      id: `POS-${trade.id}`,
      symbol: trade.symbol,
      side: trade.side === 'buy' ? 'long' : 'short',
      amount: trade.amount,
      entryPrice: trade.openPrice,
      currentPrice: trade.currentPrice || trade.openPrice,
      leverage: trade.leverage,
      orderType: trade.orderType,
      pnl: 0,
      pnlPercent: 0,
      liquidationPrice: trade.liquidationPrice,
      timestamp: trade.timestamp,
      status: 'open'
    };

    this.positions.push(position);
  }

  closePosition(positionId: string): boolean {
    const positionIndex = this.positions.findIndex(p => p.id === positionId);
    if (positionIndex === -1) return false;

    const position = this.positions[positionIndex];
    position.status = 'closed';

    // Находим соответствующую сделку и закрываем её
    const trade = this.trades.find(t => `POS-${t.id}` === positionId);
    if (trade) {
      trade.status = 'closed';
      trade.pnl = position.pnl;
      trade.pnlPercent = position.pnlPercent;
      trade.closePrice = position.currentPrice;
      trade.closeTimestamp = new Date().toISOString();
    }

    this.saveToStorage();
    this.notifySubscribers();

    console.log('Position closed:', position);
    return true;
  }

  getTrades(): Trade[] {
    return [...this.trades].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getOpenPositions(): Position[] {
    return this.positions.filter(p => p.status === 'open');
  }

  getAllPositions(): Position[] {
    return [...this.positions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getPortfolioStats() {
    const openPositions = this.getOpenPositions();
    const totalValue = openPositions.reduce((sum, pos) => sum + (pos.entryPrice * pos.amount), 0);
    const totalPnL = openPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

    return {
      totalValue,
      totalPnL,
      totalPnLPercent,
      openPositionsCount: openPositions.length,
      totalTradesCount: this.trades.length
    };
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  private saveToStorage() {
    try {
      localStorage.setItem('tradehub_trades', JSON.stringify(this.trades));
      localStorage.setItem('tradehub_positions', JSON.stringify(this.positions));
    } catch (error) {
      console.error('Failed to save trades to storage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const tradesData = localStorage.getItem('tradehub_trades');
      const positionsData = localStorage.getItem('tradehub_positions');

      if (tradesData) {
        this.trades = JSON.parse(tradesData);
      }

      if (positionsData) {
        this.positions = JSON.parse(positionsData);
      }
    } catch (error) {
      console.error('Failed to load trades from storage:', error);
    }
  }

  clearAllData() {
    this.trades = [];
    this.positions = [];
    localStorage.removeItem('tradehub_trades');
    localStorage.removeItem('tradehub_positions');
    this.notifySubscribers();
  }
}

export const tradeService = new TradeService();