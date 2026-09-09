import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  stocksAPI,
  watchlistAPI,
  tradesAPI
} from '../services/api';
import {
  LayoutDashboard,
  Plus,
  Star,
  TrendingUp,
  Trash2,
  ChevronRight,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const DashboardPage = ({ user }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [trends, setTrends] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use standard naming and avoid destructuring error risks
      const watchResponse = await watchlistAPI.get(user.id);
      const trendsResponse = await stocksAPI.getTrends();
      const portfolioResponse = await tradesAPI.getPortfolio(user.id);

      setWatchlist(watchResponse.data?.data || []);
      setTrends(trendsResponse.data?.data ? trendsResponse.data.data.slice(0, 5) : []);
      setPortfolio(portfolioResponse.data?.data || null);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWatchlist = async (e, symbol) => {
    e.stopPropagation();
    try {
      await watchlistAPI.remove(symbol);
      setWatchlist(prev => prev.filter(w => w.stock_symbol !== symbol));
      setMessage({ type: 'success', text: `${symbol} removed from watchlist` });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!user) {
    return <div className="p-20 text-center font-bold text-gray-500">Please login to view dashboard.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const STARTING_CAPITAL = 100000; // every account starts with ₹1,00,000 virtual capital
  const openPositionsValue = (portfolio?.open_trades || []).reduce(
    (s, t) => s + parseFloat(t.entry_price) * t.quantity + parseFloat(t.unrealized_pnl || 0),
    0
  );
  const netWorth = parseFloat(portfolio?.user?.balance ?? user.balance ?? STARTING_CAPITAL) + openPositionsValue;
  const netReturnPct = ((netWorth - STARTING_CAPITAL) / STARTING_CAPITAL) * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
             <LayoutDashboard className="w-8 h-8 text-primary" />
             Dashboard
           </h1>
           <p className="text-sm font-medium text-gray-500">Welcome back, {user.name || 'Trader'}. Market is open.</p>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl border text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
          <Zap className="w-4 h-4" />
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Watchlist */}
        <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    My Highlights
                </h2>
                <button 
                  onClick={() => navigate('/markets')}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                    Explore Markets <Plus className="w-3 h-3" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {watchlist.length === 0 ? (
                    <div className="col-span-2 card p-12 text-center border-dashed border-2 flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <Star className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500 max-w-xs">Your watchlist is empty. Track stocks to see them here.</p>
                        <button onClick={() => navigate('/markets')} className="btn btn-primary">Browse Markets</button>
                    </div>
                ) : (
                    watchlist.map(item => (
                        <div 
                           key={item.id}
                           onClick={() => navigate(`/stock/${item.stock_symbol}`)}
                           className="card card-hover cursor-pointer group relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-gray-900">{item.stock_symbol}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[120px]">{item.company_name}</p>
                                </div>
                                <button 
                                    onClick={(e) => handleRemoveWatchlist(e, item.stock_symbol)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-end justify-between">
                                <div className="text-xl font-black text-gray-900">
                                    ₹{parseFloat(item.last_price || 0).toLocaleString()}
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${parseFloat(item.change_percent || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {parseFloat(item.change_percent || 0) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(parseFloat(item.change_percent || 0)).toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Market Movers */}
            <div className="pt-4 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Market Movers
                </h2>
                <div className="card p-0 overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {trends.map(stock => (
                            <div 
                                key={stock.stock_symbol}
                                onClick={() => navigate(`/stock/${stock.stock_symbol}`)}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center font-black text-primary text-xs">
                                        {stock.stock_symbol.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-sm leading-none mb-1">{stock.stock_symbol}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{stock.company_name}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">₹{parseFloat(stock.last_price).toLocaleString()}</p>
                                        <p className={`text-[10px] font-black ${stock.change_percent >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {stock.change_percent >= 0 ? '+' : ''}{parseFloat(stock.change_percent).toFixed(2)}%
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
            <div className="card bg-primary border-none shadow-xl shadow-blue-100 overflow-hidden relative group">
                <div className="relative z-10 text-white">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Portfolio Balance</p>
                    <h2 className="text-3xl font-black mb-6">₹{(portfolio?.user?.balance || user.balance || 100000).toLocaleString('en-IN')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 rounded-xl p-3 flex-1 text-center">
                            <span className="text-[9px] font-black opacity-60 block">POSITIONS</span>
                            <span className="text-sm font-bold">{portfolio?.summary.open_positions || 0}</span>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 flex-1 text-center">
                            <span className="text-[9px] font-black opacity-60 block">NET RETURN</span>
                            <span className="text-sm font-bold">{netReturnPct >= 0 ? '+' : ''}{netReturnPct.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                <Zap className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-white opacity-[0.1] group-hover:scale-110 transition-transform duration-700" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
