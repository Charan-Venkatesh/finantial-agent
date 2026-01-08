import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import insightsService from '../services/insightsService';
import { format } from 'date-fns';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await insightsService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryDetails = async (id) => {
    setDetailsLoading(true);
    try {
      const data = await insightsService.getQueryDetails(id);
      setSelectedQuery(data);
    } catch (error) {
      console.error('Error fetching query details:', error);
    } finally {
      setDetailsLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">📜 Query History</h1>
          <p className="mt-2 text-gray-600">Review your past AI analysis queries</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((query) => (
                  <Card 
                    key={query.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => fetchQueryDetails(query.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {query.tickers?.join(', ') || 'N/A'}
                            </h3>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {query.query_type?.replace('_', ' ').toUpperCase() || 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {query.created_at 
                              ? format(new Date(query.created_at), 'MMM dd, yyyy HH:mm:ss')
                              : 'Unknown date'}
                          </p>
                        </div>
                        <div className="text-right">
                          {query.risk_level && (
                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getRiskColor(query.risk_level)}`}>
                              {query.risk_level.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {query.synthesis && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {query.synthesis}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-4 text-xs text-gray-500">
                        {query.execution_time_ms && (
                          <span>⏱️ {query.execution_time_ms}ms</span>
                        )}
                        <span>📊 {query.insights?.length || 0} insights</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-600">No query history found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start using AI Insights to build your history
                  </p>
                </div>
              </Card>
            )}
          </>
        )}

        {selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Query Details</h2>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center py-12">
                  <Loading size="lg" />
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tickers</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedQuery.tickers?.join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Risk Level</p>
                      <p className={`text-lg font-bold px-3 py-1 rounded-lg inline-block ${getRiskColor(selectedQuery.risk_level)}`}>
                        {selectedQuery.risk_level?.toUpperCase() || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Execution Time</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedQuery.execution_time_ms || 0} ms
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Synthesis</h4>
                    <p className="text-blue-800">{selectedQuery.synthesis || 'No synthesis available'}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Agent Insights</h3>
                    {selectedQuery.insights?.map((insight, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-gray-900">
                            {insight.agent_name || `Agent ${index + 1}`}
                          </h4>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm">
                            {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-800">{insight.summary || 'No summary'}</p>
                          <p className="text-sm text-gray-600">{insight.reasoning || 'No reasoning'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
