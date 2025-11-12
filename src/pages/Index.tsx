import { useState, useEffect } from 'react';
import CryptoChart from '@/components/CryptoChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Signal {
  type: 'entry' | 'exit' | 'warning';
  message: string;
  level: string;
  time: string;
}

export default function Index() {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1H');
  const [signals, setSignals] = useState<Signal[]>([
    {
      type: 'entry',
      message: 'Цена вошла в зону покупки',
      level: 'Уровень 0.618',
      time: new Date().toLocaleTimeString('ru-RU')
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const signalTypes: Array<'entry' | 'exit' | 'warning'> = ['entry', 'exit', 'warning'];
      const levels = ['1.0', '0.786', '0.618', '0.5', '0.0', '-0.26'];
      const messages = {
        entry: 'Цена вошла в зону покупки',
        exit: 'Достигнут уровень фиксации',
        warning: 'Приближение к ключевому уровню'
      };

      if (Math.random() > 0.7) {
        const type = signalTypes[Math.floor(Math.random() * signalTypes.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        
        setSignals(prev => [
          {
            type,
            message: messages[type],
            level: `Уровень ${level}`,
            time: new Date().toLocaleTimeString('ru-RU')
          },
          ...prev.slice(0, 4)
        ]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'bg-success/20 text-success border-success/30';
      case 'exit':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'warning':
        return 'bg-accent/20 text-accent border-accent/30';
      default:
        return 'bg-muted';
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return 'TrendingUp';
      case 'exit':
        return 'TrendingDown';
      case 'warning':
        return 'AlertCircle';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Крипто-Индикатор Фибоначчи</h1>
            <p className="text-muted-foreground mt-1">Мониторинг уровней и торговые сигналы</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="w-[180px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[120px] bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15M">15M</SelectItem>
                <SelectItem value="1H">1H</SelectItem>
                <SelectItem value="4H">4H</SelectItem>
                <SelectItem value="1D">1D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">График с уровнями Фибоначчи</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CryptoChart />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Bell" size={20} className="text-primary" />
                  Торговые сигналы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {signals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ожидание сигналов...
                  </p>
                ) : (
                  signals.map((signal, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getSignalColor(signal.type)} transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon 
                          name={getSignalIcon(signal.type)} 
                          size={18} 
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{signal.message}</p>
                          <p className="text-xs opacity-80 mt-1">{signal.level}</p>
                          <p className="text-xs opacity-60 mt-1">{signal.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Layers" size={20} className="text-secondary" />
                  Уровни Фибоначчи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { level: '1.0', color: 'bg-chart-fib-236', key: true },
                  { level: '0.786', color: 'bg-chart-fib-786', key: true },
                  { level: '0.618', color: 'bg-chart-fib-618', key: true },
                  { level: '0.5', color: 'bg-chart-fib-50', key: true },
                  { level: '0.0', color: 'bg-chart-fib-236', key: true },
                  { level: '-0.26', color: 'bg-chart-fib-extension', key: false }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.level}</span>
                    </div>
                    {item.key && (
                      <Badge variant="outline" className="text-xs">
                        Ключевой
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-muted-foreground" />
                  Информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>24h Volume:</span>
                  <span className="text-foreground font-medium">$2.4B</span>
                </div>
                <div className="flex justify-between">
                  <span>24h Change:</span>
                  <span className="text-success font-medium">+3.24%</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Cap:</span>
                  <span className="text-foreground font-medium">$850B</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}