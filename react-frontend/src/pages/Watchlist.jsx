import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';
import marketService from '../services/marketService';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const data = await marketService.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!newTicker.trim()) return;

    setAdding(true);
    try {
      await marketService.addToWatchlist(newTicker.toUpperCase(), newNotes);
      setNewTicker('');
      setNewNotes('');
      setShowAddForm(false);
      await fetchWatchlist();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add to watchlist. Ticker may already exist.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this from your watchlist?')) return;

    try {
      await marketService.removeFromWatchlist(id);
      await fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">⭐ My Watchlist</h1>
            <p className="mt-2 text-gray-600">Track and manage your favorite stocks</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            ➕ Add Stock
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6 bg-blue-50 border border-blue-200">
            <CardHeader>
              <CardTitle>Add to Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Stock Ticker"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Add your notes about this stock..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddToWatchlist} loading={adding}>
                    Add to Watchlist
                  </Button>
                  <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchlist.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-blue-600">{item.ticker}</h3>
                          <p className="text-sm text-gray-500">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                        >
                          ✕
                        </Button>
                      </div>

                      {item.notes && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700">Notes</p>
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        </div>
                      )}

                      {item.alert_threshold && (
                        <div className="pt-2">
                          <p className="text-sm font-semibold text-gray-700">Alert Threshold</p>
                          <p className="text-sm text-gray-600">${item.alert_threshold}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Your watchlist is empty</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    ➕ Add Your First Stock
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
