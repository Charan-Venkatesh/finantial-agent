import apiClient from './api';

export const newsService = {
  // Get financial news
  getFinancialNews: async (category = 'business', maxArticles = 30) => {
    const response = await apiClient.get('/api/news/financial', {
      params: { category, max_articles: maxArticles },
    });
    return response.data;
  },

  // Search news
  searchNews: async (query, daysBack = 7, maxArticles = 20) => {
    const response = await apiClient.get('/api/news/search', {
      params: { query, days_back: daysBack, max_articles: maxArticles },
    });
    return response.data;
  },

  // Get topic news
  getTopicNews: async (topic, daysBack = 7, maxArticles = 20) => {
    const response = await apiClient.get(`/api/news/topics/${topic}`, {
      params: { days_back: daysBack, max_articles: maxArticles },
    });
    return response.data;
  },
};

export default newsService;
