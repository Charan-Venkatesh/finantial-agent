import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import newsService from '../services/newsService';
import { format } from 'date-fns';

const News = () => {
  const [activeTab, setActiveTab] = useState('top');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('business');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const topics = [
    { name: '📈 Stocks', value: 'stocks' },
    { name: '₿ Crypto', value: 'crypto' },
    { name: '💰 Bitcoin', value: 'bitcoin' },
    { name: '⟠ Ethereum', value: 'ethereum' },
    { name: '💱 Forex', value: 'forex' },
    { name: '🏆 Commodities', value: 'commodities' },
    { name: '🥇 Gold', value: 'gold' },
    { name: '🛢️ Oil', value: 'oil' },
    { name: '💻 Tech', value: 'tech' },
    { name: '💼 Finance', value: 'finance' },
  ];

  const fetchFinancialNews = async () => {
    setLoading(true);
    try {
      const data = await newsService.getFinancialNews(category, 30);
      setArticles(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await newsService.searchNews(searchQuery, 7, 20);
      setArticles(data);
    } catch (error) {
      console.error('Error searching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicNews = async (topic) => {
    setLoading(true);
    setSelectedTopic(topic);
    try {
      const data = await newsService.getTopicNews(topic, 7, 20);
      setArticles(data);
    } catch (error) {
      console.error('Error fetching topic news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📰 Financial News</h1>
          <p className="mt-2 text-gray-600">Real-time financial and market news</p>
        </div>

        <Card className="mb-6">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('top')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'top'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Top News
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🔍 Search
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'topics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📂 Topics
            </button>
          </div>

          {activeTab === 'top' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                </select>
                <Button onClick={fetchFinancialNews} loading={loading}>
                  🔄 Refresh News
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="flex gap-4">
              <Input
                placeholder="Search for stocks, companies, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} loading={loading}>
                🔍 Search
              </Button>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topics.map((topic) => (
                <Button
                  key={topic.value}
                  variant={selectedTopic === topic.value ? 'primary' : 'outline'}
                  onClick={() => fetchTopicNews(topic.value)}
                  size="sm"
                >
                  {topic.name}
                </Button>
              ))}
            </div>
          )}
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            {articles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Found <span className="font-semibold">{articles.length}</span> articles
                </p>
              </div>
            )}

            <div className="space-y-4">
              {articles.map((article, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {article.title || 'No title'}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">
                        {typeof article.source === 'object' 
                          ? article.source?.name || 'Unknown'
                          : article.source || 'Unknown'}
                      </span>
                      <span>
                        {article.publishedAt || article.published_at
                          ? format(new Date(article.publishedAt || article.published_at), 'MMM dd, yyyy')
                          : 'Unknown date'}
                      </span>
                    </div>
                    
                    {article.description && (
                      <p className="text-gray-700">{article.description}</p>
                    )}
                    
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Read full article →
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {articles.length === 0 && !loading && (
              <Card>
                <p className="text-center text-gray-600 py-8">
                  No articles found. Try a different search or category.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default News;
