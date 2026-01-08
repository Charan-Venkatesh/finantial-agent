import apiClient from './api';

export const marketService = {
  // Get stock quote
  getQuote: async (ticker) => {
    const response = await apiClient.get(`/api/market/quote/${ticker}`);
    return response.data;
  },

  // Get multiple quotes
  getQuotes: async (tickers) => {
    const promises = tickers.map(ticker => 
      marketService.getQuote(ticker).catch(err => null)
    );
    return Promise.all(promises);
  },

  // Get watchlist
  getWatchlist: async () => {
    const response = await apiClient.get('/api/market/watchlist');
    return response.data;
  },

  // Add to watchlist
  addToWatchlist: async (ticker, notes = '') => {
    const response = await apiClient.post('/api/market/watchlist', {
      ticker,
      notes,
    });
    return response.data;
  },

  // Remove from watchlist
  removeFromWatchlist: async (id) => {
    const response = await apiClient.delete(`/api/market/watchlist/${id}`);
    return response.data;
  },
};

export default marketService;
