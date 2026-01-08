import apiClient from './api';

export const insightsService = {
  // Request AI analysis
  analyze: async (tickers, queryType, additionalContext = '') => {
    const response = await apiClient.post('/api/insights/analyze', {
      tickers,
      query_type: queryType,
      additional_context: additionalContext,
    });
    return response.data;
  },

  // Get query history
  getHistory: async () => {
    const response = await apiClient.get('/api/insights/history');
    return response.data;
  },

  // Get query details
  getQueryDetails: async (id) => {
    const response = await apiClient.get(`/api/insights/history/${id}`);
    return response.data;
  },
};

export default insightsService;
