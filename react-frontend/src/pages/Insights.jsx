import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import insightsService from '../services/insightsService';

const Insights = () => {
  const [tickers, setTickers] = useState('AAPL');
  const [queryType, setQueryType] = useState('decision_synthesis');
  const [additionalContext, setAdditionalContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryTypes = [
    { value: 'decision_synthesis', label: 'Decision Synthesis' },
    { value: 'market_analysis', label: 'Market Analysis' },
    { value: 'news_sentiment', label: 'News Sentiment' },
    { value: 'risk_assessment', label: 'Risk Assessment' },
  ];

  const handleAnalyze = async () => {
    const tickerList = tickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t);
    
    if (tickerList.length === 0) {
      setError('Please enter at least one ticker symbol');
      return;
    }

    if (tickerList.length > 10) {
      setError('Maximum 10 tickers allowed');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await insightsService.analyze(tickerList, queryType, additionalContext);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    if (level === 'low') return 'text-green-600 bg-green-50';
    if (level === 'medium') return 'text-yellow-600 bg-yellow-50';
    if (level === 'high') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🤖 AI-Powered Financial Insights</h1>
          <p className="mt-2 text-gray-600">Intelligent multi-agent analysis for informed decisions</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Multi-Agent AI System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">📊</span>
                <div>
                  <p className="font-semibold">Market Data Agent</p>
                  <p className="text-gray-600">Technical analysis and price trends</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">📰</span>
                <div>
                  <p className="font-semibold">News & Sentiment Agent</p>
                  <p className="text-gray-600">News analysis and market sentiment</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">⚠️</span>
                <div>
                  <p className="font-semibold">Risk & ESG Agent</p>
                  <p className="text-gray-600">Risk assessment and sustainability</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">🎯</span>
                <div>
                  <p className="font-semibold">Decision Synthesis Agent</p>
                  <p className="text-gray-600">Holistic recommendations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stock Tickers"
                value={tickers}
                onChange={(e) => setTickers(e.target.value)}
                placeholder="AAPL, GOOGL, MSFT"
                helperText="Up to 10 tickers, comma-separated"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analysis Type
                </label>
                <select
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {queryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Context (Optional)
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any specific questions or context for the analysis..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button onClick={handleAnalyze} loading={loading} fullWidth>
              🔍 Analyze with AI
            </Button>
          </div>
        </Card>

        {loading && (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loading size="lg" />
              <p className="text-gray-600 text-center">
                🤖 AI agents are analyzing...<br />
                <span className="text-sm">This may take 30-60 seconds</span>
              </p>
            </div>
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tickers Analyzed</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {result.tickers?.length || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getRiskColor(result.risk_level)}`}>
                      {result.risk_level?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Execution Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.execution_time_ms || 0} ms
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Synthesis</h4>
                  <p className="text-blue-800">{result.synthesis || 'No synthesis available'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔍 Detailed Agent Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.insights?.map((insight, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-gray-900">
                          {insight.agent_name || `Agent ${index + 1}`}
                        </h4>
                        <div className="text-sm">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                            Confidence: {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Summary</p>
                          <p className="text-gray-800">{insight.summary || 'No summary'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Reasoning</p>
                          <p className="text-gray-800">{insight.reasoning || 'No reasoning provided'}</p>
                        </div>
                        
                        {insight.details && Object.keys(insight.details).length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Details</p>
                            <div className="bg-gray-50 rounded p-3 text-sm">
                              <pre className="whitespace-pre-wrap text-gray-700">
                                {JSON.stringify(insight.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border border-yellow-200">
              <div className="p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Disclaimer:</strong> This analysis is for informational and decision-support purposes only.
                  It does not constitute financial advice. Always consult with a qualified financial advisor
                  before making investment decisions.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
