import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import marketService from '../services/marketService';
import { format } from 'date-fns';

const Dashboard = () => {
  const [tickers, setTickers] = useState('AAPL,GOOGL,MSFT,TSLA');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const tickerList = tickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
      const quotesData = await marketService.getQuotes(tickerList);
      setQuotes(quotesData.filter(q => q !== null));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchQuotes();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, tickers]);

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeBgColor = (change) => {
    if (change > 0) return 'bg-green-50';
    if (change < 0) return 'bg-red-50';
    return 'bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Live Market Dashboard</h1>
          <p className="mt-2 text-gray-600">Real-time stock monitoring and market data</p>
        </div>

        <Card className="mb-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="Stock Tickers (comma-separated)"
                  value={tickers}
                  onChange={(e) => setTickers(e.target.value)}
                  placeholder="AAPL, GOOGL, MSFT, TSLA"
                  helperText="Enter stock symbols separated by commas"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={fetchQuotes} loading={loading}>
                  🔄 Refresh
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                Auto-refresh every 30 seconds
              </label>
            </div>
          </div>
        </Card>

        {loading && quotes.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tracked Tickers</p>
                  <p className="text-3xl font-bold text-blue-600">{quotes.length}</p>
                </div>
              </Card>
              
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastUpdate ? format(lastUpdate, 'HH:mm:ss') : '--:--:--'}
                  </p>
                </div>
              </Card>
              
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Market Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().getHours() >= 9 && new Date().getHours() < 16 ? (
                      <span className="text-green-600">🟢 OPEN</span>
                    ) : (
                      <span className="text-red-600">🔴 CLOSED</span>
                    )}
                  </p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((quote, index) => (
                <Card key={index} className={getChangeBgColor(quote.change)}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{quote.ticker}</h3>
                        <p className="text-sm text-gray-600">
                          {quote.timestamp ? format(new Date(quote.timestamp), 'HH:mm:ss') : 'N/A'}
                        </p>
                      </div>
                      <div className={`text-2xl font-bold ${getChangeColor(quote.change)}`}>
                        ${quote.price?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">Change</p>
                        <p className={`text-lg font-semibold ${getChangeColor(quote.change)}`}>
                          {quote.change > 0 ? '+' : ''}{quote.change?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Change %</p>
                        <p className={`text-lg font-semibold ${getChangeColor(quote.change_percent)}`}>
                          {quote.change_percent > 0 ? '+' : ''}{quote.change_percent?.toFixed(2) || 'N/A'}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-gray-600">Volume</p>
                      <p className="text-sm font-medium text-gray-900">
                        {quote.volume?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {quotes.length === 0 && !loading && (
              <Card>
                <p className="text-center text-gray-600 py-8">
                  No stock data available. Please enter valid ticker symbols.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
